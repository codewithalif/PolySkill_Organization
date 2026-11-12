import { z } from "zod";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/constants";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  category: z.enum(PROJECT_CATEGORIES, {
    message: "Please select a valid category",
  }),
  status: z.enum(PROJECT_STATUSES, {
    message: "Please select a valid status",
  }),
  techStack: z
    .array(z.string().min(1))
    .min(1, "Select or enter at least one technology"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
