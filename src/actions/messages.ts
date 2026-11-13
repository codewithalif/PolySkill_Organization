"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";
import { createNotificationAction } from "@/actions/notifications";

export interface ConversationWithDetails {
  id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    username: string;
    whatsapp_number?: string | null;
    avatar_url: string | null;
    institute: string;
  } | null;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export interface SearchedStudent {
  id: string;
  full_name: string;
  username: string;
  whatsapp_number?: string | null;
  avatar_url: string | null;
  institute: string;
  department: string;
  semester: string;
}

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

/** Get all conversations for current user */
export async function getConversationsAction(): Promise<
  ActionResult<ConversationWithDetails[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required", data: [] };
    }

    // 1. Get all conversation IDs user is part of
    const { data: memberRows, error: memberErr } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (memberErr || !memberRows || memberRows.length === 0) {
      return { success: true, data: [] };
    }

    const conversationIds = memberRows.map((m) => m.conversation_id);
    const lastReadMap = new Map<string, string>(
      memberRows.map((m) => [m.conversation_id, m.last_read_at])
    );

    // 2. Get other members for these conversations
    const { data: otherMembers } = await supabase
      .from("conversation_members")
      .select("conversation_id, user:profiles(id, full_name, username, avatar_url, institute, whatsapp_number)")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    const otherUserMap = new Map<string, any>();
    (otherMembers || []).forEach((om: any) => {
      otherUserMap.set(om.conversation_id, om.user);
    });

    // 3. Get messages for these conversations
    const { data: allMessages } = await supabase
      .from("messages")
      .select("id, conversation_id, content, sender_id, created_at, is_read")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Group by conversation
    const messagesByConv = new Map<string, any[]>();
    (allMessages || []).forEach((msg) => {
      if (!messagesByConv.has(msg.conversation_id)) {
        messagesByConv.set(msg.conversation_id, []);
      }
      messagesByConv.get(msg.conversation_id)!.push(msg);
    });

    const result: ConversationWithDetails[] = conversationIds.map((cId) => {
      const msgs = messagesByConv.get(cId) || [];
      const lastMsg = msgs[0] || null;
      const lastRead = lastReadMap.get(cId);

      // Unread count: messages sent by other user that are newer than last_read_at
      const unreadCount = msgs.filter((m) => {
        if (m.sender_id === user.id) return false;
        if (!lastRead) return true;
        return new Date(m.created_at) > new Date(lastRead);
      }).length;

      return {
        id: cId,
        created_at: lastMsg?.created_at || new Date().toISOString(),
        updated_at: lastMsg?.created_at || new Date().toISOString(),
        other_user: otherUserMap.get(cId) || null,
        last_message: lastMsg
          ? {
              content: lastMsg.content,
              created_at: lastMsg.created_at,
              sender_id: lastMsg.sender_id,
            }
          : null,
        unread_count: unreadCount,
      };
    });

    // Sort by latest message
    result.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Search polytechnic students by roll number (or name/username) to start a chat */
export async function searchStudentByRollAction(
  rollQuery: string
): Promise<ActionResult<SearchedStudent[]>> {
  try {
    const trimmed = (rollQuery || "").trim();
    if (!trimmed) {
      return { success: true, data: [] };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required", data: [] };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, whatsapp_number, avatar_url, institute, department, semester")
      .neq("id", user.id)
      .or(
        `username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%,whatsapp_number.ilike.%${trimmed}%`
      )
      .limit(10);

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: (data as SearchedStudent[]) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Get or create a direct conversation with another user */
export async function getOrCreateConversationAction(
  otherUserId: string
): Promise<ActionResult<{ conversationId: string; otherUser?: SearchedStudent }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  if (otherUserId === user.id) {
    return { success: false, message: "Cannot message yourself" };
  }

  // Fetch the other user's profile
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, full_name, username, whatsapp_number, avatar_url, institute, department, semester")
    .eq("id", otherUserId)
    .single();

  // Check if existing conversation exists between these two
  const { data: myConvs } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((c) => c.conversation_id);
    const { data: match } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvIds)
      .limit(1)
      .maybeSingle();

    if (match) {
      return {
        success: true,
        data: {
          conversationId: match.conversation_id,
          otherUser: (otherProfile as SearchedStudent) || undefined,
        },
      };
    }
  }

  // Create new conversation
  const { data: newConv, error: convErr } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convErr || !newConv) {
    return { success: false, message: convErr?.message || "Failed to create conversation" };
  }

  // Add both members
  await supabase.from("conversation_members").insert([
    { conversation_id: newConv.id, user_id: user.id },
    { conversation_id: newConv.id, user_id: otherUserId },
  ]);

  return {
    success: true,
    data: {
      conversationId: newConv.id,
      otherUser: (otherProfile as SearchedStudent) || undefined,
    },
  };
}

/** Get message history for a conversation */
export async function getMessagesAction(
  conversationId: string
): Promise<ActionResult<MessageWithSender[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required", data: [] };
    }

    // Verify caller is a member
    const { data: isMember } = await supabase
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!isMember) {
      return { success: false, message: "Access denied", data: [] };
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at,
        sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    // Mark as read asynchronously
    await markMessagesReadAction(conversationId);

    return { success: true, data: (data as any) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Send message in conversation */
export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult<MessageWithSender>> {
  if (!content || !content.trim()) {
    return { success: false, message: "Message content cannot be empty" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { success: false, message: "You are not a participant in this conversation" };
  }

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)
    `)
    .single();

  if (error || !msg) {
    return { success: false, message: error?.message || "Failed to send message" };
  }

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Notify other members
  const { data: otherMembers } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id);

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (otherMembers) {
    for (const om of otherMembers) {
      await createNotificationAction(
        om.user_id,
        "message",
        `New message from ${senderProfile?.full_name || "a student"}`,
        content.trim().slice(0, 100),
        "/messages"
      );
    }
  }

  return { success: true, data: msg as any };
}

/** Mark conversation messages as read */
export async function markMessagesReadAction(
  conversationId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  return { success: true };
}
