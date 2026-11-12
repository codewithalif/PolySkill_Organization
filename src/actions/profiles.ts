"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";

type ProfileRow = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  institute: string;
  department: string;
  semester: string;
  bio: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  experience_level: "Beginner" | "Intermediate" | "Advanced";
  role: "student" | "admin";
  profile_completion: number;
  created_at: string;
  updated_at: string;
};

/** Fetch the current user's profile */
export async function getMyProfileAction(): Promise<ActionResult<ProfileRow>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { success: false, message: error.message };
  return { success: true, data };
}

/** Fetch a public profile by username */
export async function getPublicProfileAction(
  username: string
): Promise<ActionResult<ProfileRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return { success: false, message: error.message };
  return { success: true, data };
}

interface StudentSearchFilters {
  institute?: string;
  department?: string;
  experienceLevel?: string;
  skill?: string;
}

type ProfileWithSkills = ProfileRow & { skill_names: string[] };

/** Search student profiles, optionally joining on student_skills */
export async function searchStudentsAction(
  query?: string,
  filters?: StudentSearchFilters
): Promise<ActionResult<ProfileWithSkills[]>> {
  const supabase = await createClient();

  let profileQuery = supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("profile_completion", { ascending: false });

  if (query) {
    profileQuery = profileQuery.or(
      `full_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`
    );
  }
  if (filters?.institute) {
    profileQuery = profileQuery.eq("institute", filters.institute);
  }
  if (filters?.department) {
    profileQuery = profileQuery.eq("department", filters.department);
  }
  if (filters?.experienceLevel) {
    profileQuery = profileQuery.eq(
      "experience_level",
      filters.experienceLevel
    );
  }

  const { data: profiles, error } = await profileQuery.limit(50);
  if (error) return { success: false, message: error.message };

  const profileIds = (profiles ?? []).map((p) => p.id);

  if (profileIds.length === 0) {
    return { success: true, data: [] };
  }

  // Fetch skill names for all found profiles
  const { data: skillRows } = await supabase
    .from("student_skills")
    .select("user_id, name")
    .in("user_id", profileIds);

  const skillMap: Record<string, string[]> = {};
  for (const s of skillRows ?? []) {
    if (!skillMap[s.user_id]) skillMap[s.user_id] = [];
    skillMap[s.user_id].push(s.name);
  }

  let result: ProfileWithSkills[] = (profiles ?? []).map((p) => ({
    ...p,
    skill_names: skillMap[p.id] ?? [],
  }));

  // Post-filter by skill name if requested
  if (filters?.skill) {
    const skillLower = filters.skill.toLowerCase();
    result = result.filter((p) =>
      p.skill_names.some((s) => s.toLowerCase().includes(skillLower))
    );
  }

  return { success: true, data: result };
}

/** Get all students (paginated) */
export async function getAllStudentsAction(
  page = 1,
  limit = 20
): Promise<ActionResult<{ students: ProfileRow[]; total: number; page: number }>> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, message: error.message };
  return {
    success: true,
    data: { students: data ?? [], total: count ?? 0, page },
  };
}
