import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getConversationsAction } from "@/actions/messages";
import { MessagesClient } from "./messages-client";

export const metadata = {
  title: "Messages | PolySkill",
  description: "Chat with fellow polytechnic students and project teammates",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getConversationsAction();
  const conversations = res.success && res.data ? res.data : [];

  return (
    <MessagesClient
      initialConversations={conversations}
      currentUserId={user.id}
    />
  );
}
