import { z } from "zod";
import { TEAM_STATUSES, TEAM_ROLES } from "@/lib/constants";

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(80, "Team name cannot exceed 80 characters"),
  description: z
    .string()
    .min(15, "Description must be at least 15 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  status: z.enum(TEAM_STATUSES),
  maxMembers: z
    .number()
    .min(2, "Team must have at least 2 members")
    .max(20, "Team cannot exceed 20 members"),
  requiredSkills: z
    .array(z.string().min(1))
    .min(1, "Specify at least one required skill"),
  projectId: z.string().uuid().optional().nullable(),
});

export const inviteMemberSchema = z.object({
  teamId: z.string().uuid(),
  toUserId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export const updateRoleSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(TEAM_ROLES),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
