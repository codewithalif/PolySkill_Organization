"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/team";
import type { ActionResult } from "@/actions/auth";
import { createNotificationAction } from "@/actions/notifications";
import { getOrCreateConversationAction } from "@/actions/messages";

export interface TeamInvitationWithDetails {
  id: string;
  team_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  type?: "invite" | "join_request";
  created_at: string;
  team: {
    id: string;
    name: string;
    description: string;
    status: string;
    max_members?: number;
    required_skills?: string[];
  } | null;
  from_user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    institute: string;
  } | null;
  to_user?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    institute?: string;
  } | null;
}

/** Get pending invitations received by current user (both team invites and join requests) */
export async function getMyInvitationsAction(): Promise<
  ActionResult<TeamInvitationWithDetails[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required", data: [] };
    }

    const { data, error } = await supabase
      .from("team_invitations")
      .select(`
        id,
        team_id,
        from_user_id,
        to_user_id,
        message,
        status,
        type,
        created_at,
        team:teams(id, name, description, status, max_members, required_skills),
        from_user:profiles!team_invitations_from_user_id_fkey(id, full_name, username, avatar_url, institute)
      `)
      .eq("to_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: (data as any) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Get all invitations sent by current user */
export async function getSentInvitationsAction(): Promise<
  ActionResult<TeamInvitationWithDetails[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required", data: [] };
    }

    const { data, error } = await supabase
      .from("team_invitations")
      .select(`
        id,
        team_id,
        from_user_id,
        to_user_id,
        message,
        status,
        type,
        created_at,
        team:teams(id, name, description, status, max_members, required_skills),
        to_user:profiles!team_invitations_to_user_id_fkey(id, full_name, username, avatar_url, institute)
      `)
      .eq("from_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: (data as any) || [] };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Request to join an open team post */
export async function requestToJoinTeamAction(
  teamId: string,
  message?: string
): Promise<ActionResult<{ invitationId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "You must be logged in to send a join request" };
    }

    // 1. Fetch team details
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .select("id, name, created_by, max_members, status")
      .eq("id", teamId)
      .single();

    if (teamErr || !team) {
      return { success: false, message: "Team not found" };
    }

    // 2. Author check
    if (team.created_by === user.id) {
      return { success: false, message: "You are the creator of this team" };
    }

    // 3. Status check
    if (team.status === "Completed") {
      return { success: false, message: "This team is already completed / closed" };
    }

    // 4. Member check
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      return { success: false, message: "You are already a member of this team" };
    }

    // 5. Existing pending request check
    const { data: existingRequest } = await supabase
      .from("team_invitations")
      .select("id")
      .eq("team_id", teamId)
      .eq("from_user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return { success: false, message: "You already have a pending join request for this team" };
    }

    // 6. Capacity check
    const { count: currentMemberCount } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId);

    if ((currentMemberCount || 0) >= team.max_members) {
      return { success: false, message: "This team has already reached its member capacity" };
    }

    // 7. Insert join request
    const { data: newInvite, error: insertErr } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        from_user_id: user.id,
        to_user_id: team.created_by,
        type: "join_request",
        message: message?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !newInvite) {
      return { success: false, message: insertErr?.message || "Failed to submit request" };
    }

    // 8. Fetch user name and notify leader
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await createNotificationAction(
      team.created_by,
      "team",
      "New Team Join Request",
      `${myProfile?.full_name || "A student"} requested to join "${team.name}"`,
      "/invitations"
    );

    revalidatePath("/invitations");
    revalidatePath("/teams");
    revalidatePath("/team-finder");

    return {
      success: true,
      message: "Join request sent to the team leader!",
      data: { invitationId: newInvite.id },
    };
  } catch (err: any) {
    return { success: false, message: err.message || "Something went wrong" };
  }
}

/** Send an invitation to a student to join a team (sent by leader/member) */
export async function sendInvitationAction(
  input: InviteMemberInput
): Promise<ActionResult> {
  const validation = inviteMemberSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: "Invalid invitation data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { teamId, toUserId, message } = validation.data;

  // Cannot invite yourself
  if (toUserId === user.id) {
    return { success: false, message: "You cannot invite yourself" };
  }

  // Check if target user is already a member
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", toUserId)
    .maybeSingle();

  if (existingMember) {
    return { success: false, message: "User is already a team member" };
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from("team_invitations")
    .select("id")
    .eq("team_id", teamId)
    .eq("to_user_id", toUserId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return { success: false, message: "An invitation is already pending for this user" };
  }

  const { error } = await supabase.from("team_invitations").insert({
    team_id: teamId,
    from_user_id: user.id,
    to_user_id: toUserId,
    type: "invite",
    message: message || null,
    status: "pending",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Fetch team name for notification
  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .single();

  // Create notification for invited user
  await createNotificationAction(
    toUserId,
    "invitation",
    "New Team Invitation",
    `You were invited to join "${team?.name || "a team"}"`,
    "/invitations"
  );

  revalidatePath("/invitations");
  return { success: true, message: "Invitation sent successfully!" };
}

/** Accept a team invitation or join request */
export async function acceptInvitationAction(
  invitationId: string
): Promise<ActionResult<{ conversationId?: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required" };
    }

    const { data: invite, error: inviteErr } = await supabase
      .from("team_invitations")
      .select("*, team:teams(id, name, max_members, status)")
      .eq("id", invitationId)
      .eq("to_user_id", user.id)
      .single();

    if (inviteErr || !invite) {
      return { success: false, message: "Invitation not found or unauthorized" };
    }

    if (invite.status !== "pending") {
      return { success: false, message: "Invitation is no longer pending" };
    }

    const team = invite.team as { id: string; name: string; max_members: number; status: string } | null;
    const isJoinRequest = invite.type === "join_request";
    // If it's a join request, the person being added to the team is from_user_id (the applicant).
    // If it's a team invite, the person being added is to_user_id (the current user).
    const newMemberUserId = isJoinRequest ? invite.from_user_id : user.id;
    // The other user to message
    const otherUserId = isJoinRequest ? invite.from_user_id : invite.from_user_id;

    // 1. Update invitation status to accepted
    await supabase
      .from("team_invitations")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invitationId);

    // 2. Add member to team_members if not already there
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", invite.team_id)
      .eq("user_id", newMemberUserId)
      .maybeSingle();

    if (!existingMember) {
      await supabase.from("team_members").insert({
        team_id: invite.team_id,
        user_id: newMemberUserId,
        role: "Member",
      });
    }

    // 3. Check if team reached capacity and close post if full
    const { count: memberCount } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", invite.team_id);

    if (team && (memberCount || 0) >= team.max_members) {
      await supabase
        .from("teams")
        .update({ status: "Completed", updated_at: new Date().toISOString() })
        .eq("id", invite.team_id);
    }

    // 4. Automatically check if a Conversation exists between these users; if not, create one
    let conversationId: string | undefined;
    try {
      const convRes = await getOrCreateConversationAction(otherUserId);
      if (convRes.success && convRes.data?.conversationId) {
        conversationId = convRes.data.conversationId;
      }
    } catch (e) {
      console.warn("Could not auto-create conversation:", e);
    }

    // 5. Notify the other user
    await createNotificationAction(
      otherUserId,
      "team",
      isJoinRequest ? "Join Request Accepted" : "Team Invitation Accepted",
      isJoinRequest
        ? `Your request to join "${team?.name || "the team"}" was accepted! You can now chat with the leader.`
        : `Your invitation to join "${team?.name || "the team"}" was accepted!`,
      `/messages?userId=${user.id}`
    );

    revalidatePath("/invitations");
    revalidatePath("/teams");
    revalidatePath("/team-finder");
    revalidatePath("/messages");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: isJoinRequest ? "Join request accepted! Team member added." : "You have joined the team!",
      data: { conversationId },
    };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to accept invitation" };
  }
}

/** Decline a team invitation or join request */
export async function declineInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { data: invite } = await supabase
    .from("team_invitations")
    .select("*, team:teams(name)")
    .eq("id", invitationId)
    .eq("to_user_id", user.id)
    .single();

  if (!invite) {
    return { success: false, message: "Invitation not found" };
  }

  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("to_user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  // Notify sender of decline
  await createNotificationAction(
    invite.from_user_id,
    "team",
    "Invitation Declined",
    `The invitation / request for "${(invite.team as any)?.name || "team"}" was declined.`,
    "/invitations"
  );

  revalidatePath("/invitations");
  return { success: true, message: "Invitation declined" };
}

/** Cancel a sent invitation or join request */
export async function cancelInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("from_user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/invitations");
  revalidatePath("/teams");
  revalidatePath("/team-finder");
  return { success: true, message: "Request cancelled" };
}
