import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getConversationsAction, getOrCreateConversationAction } from "@/actions/messages";
import { MessagesClient } from "./messages-client";

export const instant = false;

export const metadata = {
  title: "Messages | PolySkill",
  description: "Chat with fellow polytechnic students and project teammates",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ userId?: string; roll?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = searchParams ? await searchParams : undefined;
  let targetConvId: string | null = null;

  if (params?.userId) {
    const res = await getOrCreateConversationAction(params.userId);
    if (res.success && res.data?.conversationId) {
      targetConvId = res.data.conversationId;
    }
  } else if (params?.roll) {
    const supabase = await createClient();
    const { data: matched } = await supabase
      .from("profiles")
      .select("id")
      .ilike("roll_number", params.roll.trim())
      .neq("id", user.id)
      .limit(1)
      .maybeSingle();

    if (matched) {
      const res = await getOrCreateConversationAction(matched.id);
      if (res.success && res.data?.conversationId) {
        targetConvId = res.data.conversationId;
      }
    }
  }

  const res = await getConversationsAction();
  const conversations = res.success && res.data ? res.data : [];

  return (
    <MessagesClient
      initialConversations={conversations}
      currentUserId={user.id}
      initialSelectedConvId={targetConvId || undefined}
    />
  );
}
