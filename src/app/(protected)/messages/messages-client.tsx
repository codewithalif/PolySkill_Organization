"use client";

import { useState, useEffect, useRef } from "react";
import {
  getMessagesAction,
  sendMessageAction,
  type ConversationWithDetails,
  type MessageWithSender,
} from "@/actions/messages";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MessagesClientProps {
  initialConversations: ConversationWithDetails[];
  currentUserId: string;
}

export function MessagesClient({
  initialConversations,
  currentUserId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    getMessagesAction(selectedConvId).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setMessages(res.data);
          // Reset unread count locally
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConvId ? { ...c, unread_count: 0 } : c))
          );
        }
        setIsLoadingMessages(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedConvId]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    if (!selectedConvId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${selectedConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        async () => {
          // Refresh messages for this conversation
          const res = await getMessagesAction(selectedConvId);
          if (res.success && res.data) {
            setMessages(res.data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConvId || !inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const res = await sendMessageAction(selectedConvId, content);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data as MessageWithSender]);
        // Update last message in conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? {
                  ...c,
                  last_message: {
                    content,
                    created_at: new Date().toISOString(),
                    sender_id: currentUserId,
                  },
                }
              : c
          )
        );
      } else {
        toast.error(res.message || "Failed to send");
      }
    } catch {
      toast.error("Message send failed");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Direct Messages</h1>
        <p className="text-muted-foreground">
          Realtime private messaging with polytechnic peers and teammates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[650px] border rounded-lg overflow-hidden bg-card text-card-foreground">
        {/* Left: Conversations List */}
        <div className="border-r flex flex-col h-full bg-muted/20">
          <div className="p-3 border-b font-semibold text-sm">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No conversations yet. Visit Explore Students to start messaging peers!
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const name = conv.other_user?.full_name || "Student";
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 border-b transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-accent/40" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10 mt-0.5">
                      <AvatarImage src={conv.other_user?.avatar_url || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{name}</span>
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="md:col-span-2 flex flex-col h-full">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-3 border-b flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConv.other_user?.avatar_url || ""} />
                  <AvatarFallback>
                    {(selectedConv.other_user?.full_name || "S")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">
                    {selectedConv.other_user?.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedConv.other_user?.institute}
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs space-y-1">
                    <MessageSquare className="h-8 w-8 opacity-40" />
                    <span>Say hello to start the conversation!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending || !inputText.trim()}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-2">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
