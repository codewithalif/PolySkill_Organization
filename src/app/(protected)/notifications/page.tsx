import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getNotificationsAction } from "@/actions/notifications";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notifications | PolySkill",
  description: "Stay updated with your team invitations and project comments",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getNotificationsAction();
  const notifications = (res.success && res.data ? res.data : []).map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.description,
    isRead: n.is_read,
    link: n.link || undefined,
    createdAt: n.created_at,
  }));

  return <NotificationsClient initialNotifications={notifications} />;
}
