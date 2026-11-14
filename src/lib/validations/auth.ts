import { z } from "zod";
import { DEPARTMENTS, INSTITUTES, SEMESTERS, EXPERIENCE_LEVELS } from "@/lib/constants";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  whatsappNumber: z
    .string()
    .min(10, "WhatsApp number must be at least 10 digits")
    .max(20, "WhatsApp number cannot exceed 20 characters")
    .regex(/^[0-9+\s-]+$/, "Please enter a valid WhatsApp phone number"),
  institute: z.enum(INSTITUTES, {
    message: "Please select a valid institute",
  }),
  department: z.enum(DEPARTMENTS, {
    message: "Please select a valid department",
  }),
  semester: z.enum(SEMESTERS, {
    message: "Please select a valid semester",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .transform((val) => val.toLowerCase().trim()),
  whatsappNumber: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  institute: z.enum(INSTITUTES),
  department: z.enum(DEPARTMENTS),
  semester: z.enum(SEMESTERS),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
