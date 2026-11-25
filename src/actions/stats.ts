"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserPersonalMetrics {
  userId: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  institute?: string;
  department?: string;
  publishedProjects: number;
  masteredSkills: number;
  joinedTeams: number;
}

export interface LandingMetricsData {
  totalProjects: number;
  totalStudents: number;
  totalSkills: number;
  totalTeams: number;
  userMetrics: UserPersonalMetrics | null;
  timestamp: string;
}

export async function getLandingMetricsAction(): Promise<LandingMetricsData> {
  const supabase = await createClient();

  // 1. Fetch community-wide exact live counts
  try {
    const [
      { count: studentsCount },
      { count: projectsCount },
      { count: skillsCount },
      { count: teamsCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("skills").select("*", { count: "exact", head: true }),
      supabase.from("teams").select("*", { count: "exact", head: true }),
    ]);

    // Provide baseline minimums if database is fresh so cards never look broken
    const totalStudents = studentsCount ?? 0;
    const totalProjects = projectsCount ?? 0;
    const totalSkills = skillsCount ?? 0;
    const totalTeams = teamsCount ?? 0;

    // 2. Check if the current visitor is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userMetrics: UserPersonalMetrics | null = null;

    if (user) {
      try {
        const [
          { data: profile },
          { count: userProjectsCount },
          { count: userSkillsCount },
          { count: userTeamsCount },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, username, avatar_url, institute, department")
            .eq("id", user.id)
            .single(),
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("created_by", user.id),
          supabase
            .from("student_skills")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        userMetrics = {
          userId: user.id,
          fullName: profile?.full_name || user.user_metadata?.full_name || "Student",
          username: profile?.username || user.email?.split("@")[0] || "student",
          avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
          institute: profile?.institute || undefined,
          department: profile?.department || undefined,
          publishedProjects: userProjectsCount ?? 0,
          masteredSkills: userSkillsCount ?? 0,
          joinedTeams: userTeamsCount ?? 0,
        };
      } catch (userErr) {
        console.error("Failed to fetch logged-in user metrics:", userErr);
      }
    }

    return {
      totalProjects,
      totalStudents,
      totalSkills,
      totalTeams,
      userMetrics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching landing metrics:", error);
    return {
      totalProjects: 0,
      totalStudents: 0,
      totalSkills: 0,
      totalTeams: 0,
      userMetrics: null,
      timestamp: new Date().toISOString(),
    };
  }
}
