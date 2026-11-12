"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/team";
import type { ActionResult } from "@/actions/auth";
import { createNotificationAction } from "@/actions/notifications";

export interface TeamInvitationWithDetails {
  id: string;
  team_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  team: {
    id: string;
    name: string;
    description: string;
    status: string;
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
  } | null;
}

/** Get pending invitations received by current user */
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
        created_at,
        team:teams(id, name, description, status),
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

/** Get invitations sent by the current user */
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
        created_at,
        team:teams(id, name, description, status),
        to_user:profiles!team_invitations_to_user_id_fkey(id, full_name, username, avatar_url)
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

/** Send an invitation to a student to join a team */
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
    .single();

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
    .single();

  if (existingInvite) {
    return { success: false, message: "An invitation is already pending for this user" };
  }

  const { error } = await supabase.from("team_invitations").insert({
    team_id: teamId,
    from_user_id: user.id,
    to_user_id: toUserId,
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

  return { success: true, message: "Invitation sent successfully!" };
}

/** Accept a team invitation */
export async function acceptInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { data: invite, error: inviteErr } = await supabase
    .from("team_invitations")
    .select("*, team:teams(name)")
    .eq("id", invitationId)
    .eq("to_user_id", user.id)
    .single();

  if (inviteErr || !invite) {
    return { success: false, message: "Invitation not found" };
  }

  if (invite.status !== "pending") {
    return { success: false, message: "Invitation is no longer active" };
  }

  // Update status to accepted
  await supabase
    .from("team_invitations")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", invitationId);

  // Add to team_members
  await supabase.from("team_members").insert({
    team_id: invite.team_id,
    user_id: user.id,
    role: "Member",
  });

  // Notify inviter
  await createNotificationAction(
    invite.from_user_id,
    "team",
    "Invitation Accepted",
    `Your invitation to join "${(invite.team as any)?.name}" was accepted!`,
    `/teams/${invite.team_id}`
  );

  revalidatePath("/invitations");
  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return { success: true, message: "You have joined the team!" };
}

/** Decline a team invitation */
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

  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("to_user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/invitations");
  return { success: true, message: "Invitation declined" };
}

/** Cancel a sent invitation */
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
  return { success: true, message: "Invitation cancelled" };
}
