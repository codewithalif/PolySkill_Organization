import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAdminAnnouncementsAction } from "@/actions/admin";
import { AnnouncementsAdminClient } from "./announcements-client";

export const instant = false;

export const metadata = {
  title: "Admin - Announcements | PolySkill",
  description: "Post platform-wide notices and updates",
};

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
    redirect("/dashboard");
  }

  const res = await getAdminAnnouncementsAction();
  const announcements = res.success && res.data ? res.data : [];

  return <AnnouncementsAdminClient initialAnnouncements={announcements} />;
}
