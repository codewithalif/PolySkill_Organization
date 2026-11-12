"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createTeamSchema,
  inviteMemberSchema,
  updateRoleSchema,
  type CreateTeamInput,
  type InviteMemberInput,
  type UpdateRoleInput,
} from "@/lib/validations/team";
import type { ActionResult } from "@/actions/auth";
import { createNotificationAction } from "@/actions/notifications";

export interface TeamMemberWithProfile {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    institute: string;
    department: string;
  } | null;
}

export interface TeamWithDetails {
  id: string;
  name: string;
  description: string;
  project_id: string | null;
  status: "Planning" | "Recruiting" | "In Progress" | "Completed";
  max_members: number;
  required_skills: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  leader: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  members: TeamMemberWithProfile[];
  member_count: number;
}

/** Get list of teams with filters */
export async function getTeamsAction(filters?: {
  search?: string;
  status?: string;
  skill?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ teams: TeamWithDetails[]; total: number }>> {
  try {
    const supabase = await createClient();
    const limit = filters?.limit ?? 12;
    const page = filters?.page ?? 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("teams")
      .select("*, leader:profiles!teams_created_by_fkey(id, full_name, username, avatar_url)", {
        count: "exact",
      });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status as any);
    }

    if (filters?.skill) {
      query = query.contains("required_skills", [filters.skill]);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data: teamsData, error, count } = await query;
    if (error) {
      return { success: false, message: error.message };
    }

    const teamIds = (teamsData || []).map((t: any) => t.id);
    let membersMap: Record<string, TeamMemberWithProfile[]> = {};

    if (teamIds.length > 0) {
      const { data: membersData } = await supabase
        .from("team_members")
        .select("id, team_id, user_id, role, joined_at, profile:profiles(id, full_name, username, avatar_url, institute, department)")
        .in("team_id", teamIds);

      if (membersData) {
        membersData.forEach((m: any) => {
          if (!membersMap[m.team_id]) membersMap[m.team_id] = [];
          membersMap[m.team_id].push(m);
        });
      }
    }

    const teams: TeamWithDetails[] = (teamsData || []).map((t: any) => ({
      ...t,
      members: membersMap[t.id] || [],
      member_count: (membersMap[t.id] || []).length,
    }));

    return {
      success: true,
      data: { teams, total: count || 0 },
    };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to load teams" };
  }
}

/** Get team by ID with complete details */
export async function getTeamByIdAction(
  teamId: string
): Promise<ActionResult<TeamWithDetails>> {
  try {
    const supabase = await createClient();

    const { data: team, error } = await supabase
      .from("teams")
      .select("*, leader:profiles!teams_created_by_fkey(id, full_name, username, avatar_url)")
      .eq("id", teamId)
      .single();

    if (error || !team) {
      return { success: false, message: "Team not found" };
    }

    const { data: members } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, role, joined_at, profile:profiles(id, full_name, username, avatar_url, institute, department)")
      .eq("team_id", teamId);

    return {
      success: true,
      data: {
        ...team,
        members: (members as any) || [],
        member_count: (members || []).length,
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/** Create a new team and auto-add creator as Team Leader */
export async function createTeamAction(
  input: CreateTeamInput
): Promise<ActionResult<{ id: string }>> {
  const validation = createTeamSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: "Please fix validation errors",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: validation.data.name,
      description: validation.data.description,
      project_id: validation.data.projectId || null,
      status: validation.data.status,
      max_members: validation.data.maxMembers,
      required_skills: validation.data.requiredSkills,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !team) {
    return { success: false, message: error?.message || "Failed to create team" };
  }

  // Add creator as Team Leader
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "Team Leader",
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return { success: true, message: "Team created successfully!", data: { id: team.id } };
}

/** Update an existing team */
export async function updateTeamAction(
  teamId: string,
  input: Partial<CreateTeamInput>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("teams")
    .update({
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.maxMembers && { max_members: input.maxMembers }),
      ...(input.requiredSkills && { required_skills: input.requiredSkills }),
      ...(input.projectId !== undefined && { project_id: input.projectId || null }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", teamId)
    .eq("created_by", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/teams");
  return { success: true, message: "Team updated successfully" };
}

/** Delete team */
export async function deleteTeamAction(teamId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("created_by", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/teams");
  revalidatePath("/dashboard");
  return { success: true, message: "Team deleted successfully" };
}

/** Get teams where the current user is a member */
export async function getMyTeamsAction(): Promise<ActionResult<TeamWithDetails[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Authentication required", data: [] };

    const { data: memberRows, error: memberErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (memberErr || !memberRows || memberRows.length === 0) {
      return { success: true, data: [] };
    }

    const teamIds = memberRows.map((m) => m.team_id);
    const { data: teams, error: teamsErr } = await supabase
      .from("teams")
      .select("*, leader:profiles!teams_created_by_fkey(id, full_name, username, avatar_url)")
      .in("id", teamIds);

    if (teamsErr || !teams) {
      return { success: true, data: [] };
    }

    const { data: allMembers } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, role, joined_at, profile:profiles(id, full_name, username, avatar_url, institute, department)")
      .in("team_id", teamIds);

    const membersMap: Record<string, TeamMemberWithProfile[]> = {};
    (allMembers || []).forEach((m: any) => {
      if (!membersMap[m.team_id]) membersMap[m.team_id] = [];
      membersMap[m.team_id].push(m);
    });

    const res: TeamWithDetails[] = teams.map((t: any) => ({
      ...t,
      members: membersMap[t.id] || [],
      member_count: (membersMap[t.id] || []).length,
    }));

    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Remove a member from team (leader only) */
export async function removeMemberAction(
  teamId: string,
  userId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  // Check if caller is team leader
  const { data: team } = await supabase
    .from("teams")
    .select("created_by")
    .eq("id", teamId)
    .single();

  if (!team || team.created_by !== user.id) {
    return { success: false, message: "Only the team leader can remove members" };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/teams/${teamId}`);
  return { success: true, message: "Member removed" };
}

/** Leave a team */
export async function leaveTeamAction(teamId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  const { data: team } = await supabase
    .from("teams")
    .select("created_by")
    .eq("id", teamId)
    .single();

  if (team?.created_by === user.id) {
    return {
      success: false,
      message: "The team leader cannot leave the team. You can delete the team or transfer leadership.",
    };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/teams");
  return { success: true, message: "You have left the team" };
}

/** Update member role (leader only) */
export async function updateMemberRoleAction(
  input: UpdateRoleInput
): Promise<ActionResult> {
  const validation = updateRoleSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: "Invalid role input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Authentication required" };

  const { teamId, userId, role } = validation.data;

  const { error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/teams/${teamId}`);
  return { success: true, message: "Member role updated" };
}
