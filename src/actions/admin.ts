"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";

/** Verify if caller is an admin */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin privileges required");
  }

  return { supabase, user };
}

/** Get high-level admin dashboard statistics */
export async function getAdminStatsAction(): Promise<
  ActionResult<{
    totalStudents: number;
    totalProjects: number;
    activeTeams: number;
    pendingReports: number;
  }>
> {
  try {
    const { supabase } = await requireAdmin();

    const [
      { count: totalStudents },
      { count: totalProjects },
      { count: activeTeams },
      { count: pendingReports },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase
        .from("teams")
        .select("*", { count: "exact", head: true })
        .in("status", ["Recruiting", "In Progress"]),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    return {
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalProjects: totalProjects || 0,
        activeTeams: activeTeams || 0,
        pendingReports: pendingReports || 0,
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/** Get list of content reports */
export async function getReportsAction(status?: "pending" | "resolved" | "dismissed"): Promise<
  ActionResult<any[]>
> {
  try {
    const { supabase } = await requireAdmin();

    let query = supabase
      .from("reports")
      .select("*, reporter:profiles!reports_reported_by_fkey(id, full_name, username)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return { success: false, message: error.message, data: [] };

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Update report status */
export async function updateReportStatusAction(
  reportId: string,
  status: "resolved" | "dismissed"
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/reports");
    return { success: true, message: `Report marked as ${status}` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/** Submit a content report (students can report) */
export async function submitReportAction(input: {
  type: "project" | "user" | "comment";
  reason: string;
  targetId: string;
  targetTitle: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Authentication required" };

    const { error } = await supabase.from("reports").insert({
      type: input.type,
      reason: input.reason,
      reported_by: user.id,
      target_id: input.targetId,
      target_title: input.targetTitle,
    });

    if (error) return { success: false, message: error.message };

    return { success: true, message: "Report submitted. Our team will review it." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
