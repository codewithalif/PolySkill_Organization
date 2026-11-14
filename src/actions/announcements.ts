"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";

export type AnnouncementCategory =
  | "General"
  | "Maintenance"
  | "Event"
  | "Feature"
  | "Important";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    username: string;
  } | null;
}

/**
 * Fetch all active published announcements for students and community members.
 * Ordered by newest first.
 */
export async function getActiveAnnouncementsAction(): Promise<
  ActionResult<AnnouncementItem[]>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase.from("announcements" as any) as any)
      .select("*, author:profiles!announcements_created_by_fkey(full_name, username)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      // In case the announcements table hasn't been created yet on remote Supabase
      return { success: true, data: [] };
    }

    return { success: true, data: (data as AnnouncementItem[]) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/**
 * Fetch the single latest active announcement for instant banner display.
 */
export async function getLatestAnnouncementAction(): Promise<
  ActionResult<AnnouncementItem | null>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase.from("announcements" as any) as any)
      .select("*, author:profiles!announcements_created_by_fkey(full_name, username)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: true, data: null };
    }

    return { success: true, data: (data as AnnouncementItem) || null };
  } catch (err: any) {
    return { success: false, message: err.message, data: null };
  }
}
