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
    revalidatePath("/admin");
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

// ==========================================
// STUDENT MANAGEMENT
// ==========================================

export async function getAdminStudentsAction(search?: string): Promise<ActionResult<any[]>> {
  try {
    const { supabase } = await requireAdmin();

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,username.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,institute.ilike.%${search.trim()}%,whatsapp_number.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) return { success: false, message: error.message, data: [] };

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

export async function updateStudentRoleAction(
  studentId: string,
  newRole: "student" | "admin"
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdmin();

    // Prevent removing own admin role
    if (studentId === user.id && newRole !== "admin") {
      return { success: false, message: "You cannot demote yourself from admin." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", studentId);

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/students");
    return { success: true, message: `User role updated to ${newRole}` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// PROJECT MODERATION
// ==========================================

export async function getAdminProjectsAction(search?: string): Promise<ActionResult<any[]>> {
  try {
    const { supabase } = await requireAdmin();

    let query = supabase
      .from("projects")
      .select("*, author:profiles!projects_created_by_fkey(id, full_name, username, email)")
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) return { success: false, message: error.message, data: [] };

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

export async function deleteProjectAsAdminAction(projectId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/projects");
    revalidatePath("/explore/projects");
    return { success: true, message: "Project deleted by admin moderation" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// SKILLS CATALOG MANAGEMENT
// ==========================================

export async function getSkillsCatalogAction(): Promise<ActionResult<any[]>> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

export async function addCatalogSkillAction(name: string, category: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("skills").insert({
      name: name.trim(),
      category: category.trim(),
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/skills");
    return { success: true, message: "Skill added to official catalog" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteCatalogSkillAction(skillId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("skills").delete().eq("id", skillId);
    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/skills");
    return { success: true, message: "Skill removed from catalog" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// ROADMAPS MANAGEMENT
// ==========================================

export async function getAdminRoadmapsAction(): Promise<ActionResult<any[]>> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("roadmaps")
      .select("*, steps:roadmap_steps(*)")
      .order("created_at", { ascending: true });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

export async function createRoadmapAction(input: {
  slug: string;
  title: string;
  description: string;
  icon: string;
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("roadmaps").insert({
      slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      title: input.title.trim(),
      description: input.description.trim(),
      icon: input.icon || "Code",
      estimated_duration: input.estimatedDuration,
      difficulty: input.difficulty,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/roadmaps");
    revalidatePath("/roadmaps");
    return { success: true, message: "Roadmap created successfully" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function addRoadmapStepAction(input: {
  roadmapId: string;
  title: string;
  description: string;
  topics: string[];
  stepOrder: number;
  resources?: any[];
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("roadmap_steps").insert({
      roadmap_id: input.roadmapId,
      title: input.title.trim(),
      description: input.description.trim(),
      topics: input.topics,
      step_order: input.stepOrder,
      resources: (input.resources as any) || [],
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/roadmaps");
    revalidatePath("/roadmaps");
    return { success: true, message: "Roadmap step added" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteRoadmapAction(roadmapId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("roadmaps").delete().eq("id", roadmapId);
    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/roadmaps");
    revalidatePath("/roadmaps");
    return { success: true, message: "Roadmap deleted" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// YOUTUBE VIDEO STEP BUILDER (LINK + STEP NUMBER)
// ==========================================

export async function addYouTubeVideoStepAction(input: {
  roadmapId: string;
  youtubeUrl: string;
  stepOrder: number;
  customTitle?: string;
  customDescription?: string;
}): Promise<ActionResult<{ stepId: string; videoId: string }>> {
  try {
    const { supabase } = await requireAdmin();

    // 1. Parse video ID from any YouTube URL format:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    const url = input.youtubeUrl.trim();
    let videoId = "";

    const matchWatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const matchShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const matchEmbed = url.match(/embed\/([a-zA-Z0-9_-]{11})/);

    if (matchWatch) {
      videoId = matchWatch[1];
    } else if (matchShort) {
      videoId = matchShort[1];
    } else if (matchEmbed) {
      videoId = matchEmbed[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      videoId = url;
    }

    if (!videoId) {
      return {
        success: false,
        message: "Invalid YouTube URL. Please provide a valid YouTube link or video ID.",
      };
    }

    const title = input.customTitle?.trim() || `Video Lesson ${input.stepOrder}`;
    const description =
      input.customDescription?.trim() ||
      `Watch and practice the technical concepts taught in this video lesson.`;

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const resources = [
      {
        title: `YouTube Lesson (${videoId})`,
        url: cleanUrl,
        type: "video",
      },
    ];

    // Insert as roadmap step
    const { data: step, error } = await supabase
      .from("roadmap_steps")
      .insert({
        roadmap_id: input.roadmapId,
        title,
        description,
        topics: [title],
        step_order: input.stepOrder,
        resources: resources as any,
      })
      .select("id")
      .single();

    if (error || !step) {
      return { success: false, message: error?.message || "Failed to add video step" };
    }

    revalidatePath("/admin/roadmaps");
    revalidatePath("/roadmaps");
    return {
      success: true,
      message: `Step ${input.stepOrder} added with YouTube video successfully!`,
      data: { stepId: step.id, videoId },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ==========================================
// ANNOUNCEMENTS MANAGEMENT
// ==========================================

export async function getAdminAnnouncementsAction(): Promise<ActionResult<any[]>> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("announcements" as any)
      .select("*, author:profiles!announcements_created_by_fkey(full_name, username)")
      .order("created_at", { ascending: false });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data: (data as any) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

export async function createAnnouncementAction(input: {
  title: string;
  content: string;
  category: "General" | "Maintenance" | "Event" | "Feature" | "Important";
}): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdmin();

    const { error } = await (supabase.from("announcements" as any) as any).insert({
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      created_by: user.id,
      is_published: true,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true, message: "Announcement published" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await (supabase.from("announcements" as any) as any).delete().eq("id", id);
    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/announcements");
    return { success: true, message: "Announcement deleted" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
