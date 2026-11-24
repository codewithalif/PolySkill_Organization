"use client";

import { useState, useEffect, useRef } from "react";
import {
  getMessagesAction,
  sendMessageAction,
  searchStudentByRollAction,
  getOrCreateConversationAction,
  type ConversationWithDetails,
  type MessageWithSender,
  type SearchedStudent,
} from "@/actions/messages";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  UserPlus,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface MessagesClientProps {
  initialConversations: ConversationWithDetails[];
  currentUserId: string;
  initialSelectedConvId?: string;
}

export function MessagesClient({
  initialConversations,
  currentUserId,
  initialSelectedConvId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialSelectedConvId || initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Roll Number Search State
  const [rollQuery, setRollQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedStudent[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // If initialSelectedConvId changes or was passed, select it
  useEffect(() => {
    if (initialSelectedConvId) {
      setSelectedConvId(initialSelectedConvId);
    }
  }, [initialSelectedConvId]);

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

  // Free-tier friendly lightweight polling (5s interval when tab is active)
  useEffect(() => {
    if (!selectedConvId) return;

    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      try {
        const res = await getMessagesAction(selectedConvId);
        if (res.success && res.data) {
          setMessages((prev) => {
            const incoming = res.data!;
            if (
              incoming.length !== prev.length ||
              (incoming.length > 0 && incoming[incoming.length - 1].id !== prev[prev.length - 1]?.id)
            ) {
              return incoming;
            }
            return prev;
          });
        }
      } catch {
        // Silently catch background polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConvId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Search Friend by Roll
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!rollQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await searchStudentByRollAction(rollQuery);
      if (res.success && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch {
      toast.error("Error searching for student");
    } finally {
      setIsSearching(false);
    }
  }

  // Handle Start Chat with searched student
  async function handleStartChat(student: SearchedStudent) {
    setIsStartingChat(student.id);

    try {
      const res = await getOrCreateConversationAction(student.id);
      if (res.success && res.data?.conversationId) {
        const convId = res.data.conversationId;

        // Check if conversation is already in our list
        const existing = conversations.find((c) => c.id === convId);
        if (!existing) {
          // Create new conversation item locally
          const newConv: ConversationWithDetails = {
            id: convId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            other_user: {
              id: student.id,
              full_name: student.full_name,
              username: student.username,
              whatsapp_number: student.whatsapp_number,
              avatar_url: student.avatar_url,
              institute: student.institute,
            },
            last_message: null,
            unread_count: 0,
          };
          setConversations((prev) => [newConv, ...prev]);
        }

        setSelectedConvId(convId);
        setRollQuery("");
        setSearchResults([]);
        setHasSearched(false);
        toast.success(`Connected with ${student.full_name}!`);
        setTimeout(() => chatInputRef.current?.focus(), 150);
      } else {
        toast.error(res.message || "Failed to start conversation");
      }
    } catch {
      toast.error("Failed to start chat");
    } finally {
      setIsStartingChat(null);
    }
  }

  function clearSearch() {
    setRollQuery("");
    setSearchResults([]);
    setHasSearched(false);
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Direct Messages</h1>
          <p className="text-muted-foreground text-sm">
            Chat in real-time with polytechnic peers. Search friends by name, username, or WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-[700px] border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0D1525]/85 backdrop-blur-xl shadow-2xl">
        {/* Left: Conversations List & Search */}
        <div className="border-r border-white/[0.08] flex flex-col h-full bg-[#0D1525]/60">
          {/* Search Bar */}
          <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.01] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-heading">
                <UserPlus className="h-3.5 w-3.5 text-primary" />
                Find Student / Friend
              </span>
              {hasSearched && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-1.5">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by name, username, or WhatsApp..."
                  value={rollQuery}
                  onChange={(e) => {
                    setRollQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setSearchResults([]);
                      setHasSearched(false);
                    }
                  }}
                  className="h-8 text-xs pl-2.5 pr-7 bg-white/[0.04] border-white/[0.08] focus:border-primary/50 text-foreground"
                />
                {rollQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8 px-2.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-[0_0_12px_rgba(120,107,250,0.4)]"
                disabled={isSearching || !rollQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>

            {/* Search Results Dropdown/Box */}
            {hasSearched && (
              <div className="mt-2 p-2 border border-white/[0.1] rounded-xl bg-[#111B2E] text-card-foreground shadow-xl max-h-56 overflow-y-auto space-y-2 text-xs">
                {searchResults.length === 0 ? (
                  <div className="text-center py-3 text-muted-foreground">
                    <p className="font-medium text-foreground">No student found</p>
                    <p className="text-[10px] mt-0.5">Try searching with a different name or WhatsApp</p>
                  </div>
                ) : (
                  searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-colors gap-2 border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
                          <AvatarImage src={student.avatar_url || ""} />
                          <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                            {(student.full_name || "S")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-xs text-foreground">{student.full_name}</div>
                          <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1 font-mono">
                            {student.username && (
                              <span className="text-primary font-medium">
                                @{student.username}
                              </span>
                            )}
                            {student.username && <span>•</span>}
                            <span>{student.institute}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleStartChat(student)}
                        disabled={isStartingChat === student.id}
                        className="h-7 px-2.5 text-[11px] shrink-0 bg-primary hover:bg-primary/90 text-white shadow-[0_0_10px_rgba(120,107,250,0.4)]"
                      >
                        {isStartingChat === student.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="h-3 w-3 mr-1" /> Chat
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Conversations Header */}
          <div className="px-3.5 py-2.5 border-b border-white/[0.06] font-medium text-xs text-muted-foreground flex items-center justify-between bg-white/[0.01]">
            <span className="font-heading">Conversations</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono border-white/[0.08] bg-white/[0.04] text-muted-foreground">
              {conversations.length}
            </Badge>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <MessageSquare className="h-8 w-8 mx-auto opacity-30 text-primary" />
                <p className="font-medium text-foreground">No active conversations yet.</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Search above by name, username, or WhatsApp to start messaging!
                </p>
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
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-all duration-200 hover:bg-white/[0.04] ${
                      isSelected ? "bg-[#111B2E]/90 border-l-2 border-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" : "border-l-2 border-transparent"
                    }`}
                  >
                    <Avatar className="h-10 w-10 mt-0.5 shrink-0 ring-1 ring-white/10">
                      <AvatarImage src={conv.other_user?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-sm truncate text-foreground">{name}</span>
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary text-white border-0 font-mono font-bold">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                        {conv.other_user?.username && (
                          <span className="font-mono text-primary font-medium">
                            @{conv.other_user.username}
                          </span>
                        )}
                        {conv.other_user?.username && <span className="text-muted-foreground">•</span>}
                        <span className="text-muted-foreground truncate">
                          {conv.other_user?.institute || "Polytechnic"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 truncate mt-1">
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
        <div className="md:col-span-2 flex flex-col h-full bg-[#080D19]/60">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#111B2E]/40 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 ring-1 ring-white/10">
                    <AvatarImage src={selectedConv.other_user?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                      {(selectedConv.other_user?.full_name || "S")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-sm truncate text-foreground">
                        {selectedConv.other_user?.full_name}
                      </span>
                      {selectedConv.other_user?.username && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono text-primary border-primary/20 bg-primary/5"
                        >
                          @{selectedConv.other_user.username}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5 font-mono">
                      <GraduationCap className="h-3 w-3 shrink-0 text-cyan-400" />
                      <span>{selectedConv.other_user?.institute}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs space-y-2.5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(120,107,250,0.2)]">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-foreground">
                      Start your conversation with {selectedConv.other_user?.full_name}
                    </span>
                    <span className="text-muted-foreground text-xs max-w-xs leading-relaxed">
                      Discuss polytechnic projects, semester tasks, or team collaboration!
                    </span>
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
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "bg-gradient-to-r from-primary to-[#8A7DFF] text-white rounded-br-xs shadow-[0_4px_16px_rgba(120,107,250,0.25)] border border-white/10"
                              : "bg-[#18243A] text-foreground rounded-bl-xs shadow-md border border-white/[0.06]"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono mt-1 px-1">
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
              <form onSubmit={handleSend} className="p-3.5 border-t border-white/[0.08] flex gap-2.5 bg-[#0D1525]/90 backdrop-blur-md">
                <Input
                  ref={chatInputRef}
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  className="rounded-xl px-4 h-10 bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-xl h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
                  disabled={isSending || !inputText.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-semibold text-foreground text-base">No Conversation Selected</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Select an existing conversation on the left, or search for your friend by name or username above to start chatting!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
