"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";

type NotificationType =
  | "invitation"
  | "message"
  | "team"
  | "project"
  | "system";

/** Fetch all notifications for the current user (newest first) */
export async function getNotificationsAction(): Promise<
  ActionResult<
    {
      id: string;
      user_id: string;
      type: NotificationType;
      title: string;
      description: string;
      link: string | null;
      is_read: boolean;
      created_at: string;
    }[]
  >
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message };
  return { success: true, data: data ?? [] };
}

/** Count unread notifications for the current user */
export async function getUnreadCountAction(): Promise<
  ActionResult<{ count: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { success: false, message: error.message };
  return { success: true, data: { count: count ?? 0 } };
}

/** Mark a single notification as read */
export async function markNotificationReadAction(
  id: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true };
}

/** Mark all notifications as read for the current user */
export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { success: false, message: error.message };
  return { success: true };
}

/** Internal helper: create a notification for a user */
export async function createNotificationAction(
  userId: string,
  type: NotificationType,
  title: string,
  description: string,
  link?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    description,
    link: link ?? null,
    is_read: false,
  });

  if (error) return { success: false, message: error.message };
  return { success: true };
}
