"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import type { ActionResult } from "@/actions/auth";

export type ProjectWithMeta = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  category: string;
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  created_by: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  like_count: number;
  bookmark_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

interface ProjectFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/** Fetch projects with meta (author, likes, bookmarks) */
export async function getProjectsAction(filters?: ProjectFilters): Promise<
  ActionResult<{ projects: ProjectWithMeta[]; total: number; page: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("projects")
    .select(
      `
      *,
      author:profiles!projects_created_by_fkey(id, full_name, username, avatar_url),
      project_likes(count),
      project_bookmarks(count)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;
  if (error) return { success: false, message: error.message };

  // For each project check if the current user liked/bookmarked
  const rows = data ?? [];
  const projectIds = rows.map((p) => p.id);

  let likedSet = new Set<string>();
  let bookmarkedSet = new Set<string>();

  if (user && projectIds.length > 0) {
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase
        .from("project_likes")
        .select("project_id")
        .eq("user_id", user.id)
        .in("project_id", projectIds),
      supabase
        .from("project_bookmarks")
        .select("project_id")
        .eq("user_id", user.id)
        .in("project_id", projectIds),
    ]);
    likedSet = new Set((likesRes.data ?? []).map((r) => r.project_id));
    bookmarkedSet = new Set((bookmarksRes.data ?? []).map((r) => r.project_id));
  }

  const projects: ProjectWithMeta[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    tech_stack: p.tech_stack,
    github_url: p.github_url,
    live_url: p.live_url,
    category: p.category,
    status: p.status,
    created_by: p.created_by,
    team_id: p.team_id,
    created_at: p.created_at,
    updated_at: p.updated_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    author: (p as any).author ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    like_count: (p as any).project_likes?.[0]?.count ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookmark_count: (p as any).project_bookmarks?.[0]?.count ?? 0,
    is_liked: likedSet.has(p.id),
    is_bookmarked: bookmarkedSet.has(p.id),
  }));

  return {
    success: true,
    data: { projects, total: count ?? 0, page },
  };
}

/** Fetch a single project with comments and author */
export async function getProjectByIdAction(id: string): Promise<
  ActionResult<{
    project: ProjectWithMeta;
    comments: {
      id: string;
      content: string;
      created_at: string;
      author: { id: string; full_name: string; username: string; avatar_url: string | null } | null;
    }[];
  }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      author:profiles!projects_created_by_fkey(id, full_name, username, avatar_url),
      project_likes(count),
      project_bookmarks(count),
      project_comments(id, content, created_at, author:profiles!project_comments_author_id_fkey(id, full_name, username, avatar_url))
    `
    )
    .eq("id", id)
    .single();

  if (error) return { success: false, message: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = data as any;

  let isLiked = false;
  let isBookmarked = false;
  if (user) {
    const [likeRes, bookmarkRes] = await Promise.all([
      supabase
        .from("project_likes")
        .select("project_id")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("project_bookmarks")
        .select("project_id")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    isLiked = !!likeRes.data;
    isBookmarked = !!bookmarkRes.data;
  }

  const project: ProjectWithMeta = {
    id: p.id,
    title: p.title,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    tech_stack: p.tech_stack,
    github_url: p.github_url,
    live_url: p.live_url,
    category: p.category,
    status: p.status,
    created_by: p.created_by,
    team_id: p.team_id,
    created_at: p.created_at,
    updated_at: p.updated_at,
    author: p.author ?? null,
    like_count: p.project_likes?.[0]?.count ?? 0,
    bookmark_count: p.project_bookmarks?.[0]?.count ?? 0,
    is_liked: isLiked,
    is_bookmarked: isBookmarked,
  };

  return {
    success: true,
    data: { project, comments: p.project_comments ?? [] },
  };
}

/** Create a new project (auth required) */
export async function createProjectAction(
  data: CreateProjectInput
): Promise<ActionResult<{ id: string }>> {
  const validation = createProjectSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const {
    title,
    description,
    category,
    status,
    techStack,
    githubUrl,
    liveUrl,
    thumbnailUrl,
  } = validation.data;

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      category,
      status,
      tech_stack: techStack,
      github_url: githubUrl || null,
      live_url: liveUrl || null,
      thumbnail_url: thumbnailUrl || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, message: error.message };

  revalidatePath("/projects");
  revalidatePath("/explore/projects");
  return { success: true, data: { id: inserted.id }, message: "Project created!" };
}

/** Update a project (RLS ensures ownership) */
export async function updateProjectAction(
  id: string,
  data: Partial<CreateProjectInput>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.techStack !== undefined) updateData.tech_stack = data.techStack;
  if (data.githubUrl !== undefined)
    updateData.github_url = data.githubUrl || null;
  if (data.liveUrl !== undefined) updateData.live_url = data.liveUrl || null;
  if (data.thumbnailUrl !== undefined)
    updateData.thumbnail_url = data.thumbnailUrl || null;

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, message: "Project updated!" };
}

/** Delete a project (RLS ensures ownership) */
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/projects");
  return { success: true, message: "Project deleted." };
}

/** Toggle like on a project */
export async function toggleLikeAction(
  projectId: string
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data: existing } = await supabase
    .from("project_likes")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("project_likes")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { liked: false } };
  } else {
    await supabase
      .from("project_likes")
      .insert({ project_id: projectId, user_id: user.id });
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { liked: true } };
  }
}

/** Toggle bookmark on a project */
export async function toggleBookmarkAction(
  projectId: string
): Promise<ActionResult<{ bookmarked: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data: existing } = await supabase
    .from("project_bookmarks")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("project_bookmarks")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { bookmarked: false } };
  } else {
    await supabase
      .from("project_bookmarks")
      .insert({ project_id: projectId, user_id: user.id });
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { bookmarked: true } };
  }
}

/** Add a comment to a project */
export async function addCommentAction(
  projectId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  if (!content || content.trim().length === 0) {
    return { success: false, message: "Comment cannot be empty" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data: inserted, error } = await supabase
    .from("project_comments")
    .insert({
      project_id: projectId,
      author_id: user.id,
      content: content.trim(),
    })
    .select("id")
    .single();

  if (error) return { success: false, message: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: { id: inserted.id }, message: "Comment added!" };
}

/** Delete a comment (own or admin) */
export async function deleteCommentAction(
  commentId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  // Check if user owns the comment, or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let query = supabase
    .from("project_comments")
    .delete()
    .eq("id", commentId);

  if (!isAdmin) {
    query = query.eq("author_id", user.id);
  }

  const { error } = await query;
  if (error) return { success: false, message: error.message };

  return { success: true, message: "Comment deleted." };
}

/** Get projects created by the current user */
export async function getMyProjectsAction(): Promise<
  ActionResult<ProjectWithMeta[]>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      author:profiles!projects_created_by_fkey(id, full_name, username, avatar_url),
      project_likes(count),
      project_bookmarks(count)
    `
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: ProjectWithMeta[] = (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    tech_stack: p.tech_stack,
    github_url: p.github_url,
    live_url: p.live_url,
    category: p.category,
    status: p.status,
    created_by: p.created_by,
    team_id: p.team_id,
    created_at: p.created_at,
    updated_at: p.updated_at,
    author: p.author ?? null,
    like_count: p.project_likes?.[0]?.count ?? 0,
    bookmark_count: p.project_bookmarks?.[0]?.count ?? 0,
    is_liked: false,
    is_bookmarked: false,
  }));

  return { success: true, data: projects };
}

/** Fetch all public projects for a specific user */
export async function getUserProjectsAction(
  userId: string
): Promise<ActionResult<ProjectWithMeta[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      author:profiles!projects_created_by_fkey(id, full_name, username, avatar_url),
      project_likes(count),
      project_bookmarks(count)
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: ProjectWithMeta[] = (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    tech_stack: p.tech_stack,
    github_url: p.github_url,
    live_url: p.live_url,
    category: p.category,
    status: p.status,
    created_by: p.created_by,
    team_id: p.team_id,
    created_at: p.created_at,
    updated_at: p.updated_at,
    author: p.author ?? null,
    like_count: p.project_likes?.[0]?.count ?? 0,
    bookmark_count: p.project_bookmarks?.[0]?.count ?? 0,
    is_liked: false,
    is_bookmarked: false,
  }));

  return { success: true, data: projects };
}
