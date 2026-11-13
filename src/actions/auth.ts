"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Register a new student account
 * Trigger handles profile creation in PostgreSQL automatically with role = 'student'
 */
export async function registerAction(
  data: RegisterInput
): Promise<ActionResult<{ email: string }>> {
  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Please fix the validation errors below.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password, whatsappNumber, institute, department, semester } =
    validation.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        whatsapp_number: whatsappNumber.trim(),
        institute,
        department,
        semester,
        // Role cannot be manipulated by client; database trigger enforces role = 'student'
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
    data: { email },
  };
}

/**
 * Sign in an existing user
 */
export async function loginAction(
  data: LoginInput
): Promise<ActionResult> {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid credentials.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Welcome back!",
  };
}

/**
 * Log out the current user
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Send password reset email
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<ActionResult> {
  const validation = forgotPasswordSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Please enter a valid email address.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password reset link sent! Please check your inbox.",
  };
}

/**
 * Update password from reset link
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<ActionResult> {
  const validation = resetPasswordSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Please enter a valid new password.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password updated successfully! You can now log in.",
  };
}

/**
 * Fetch authenticated user with database profile
 */
export async function getCurrentUser() {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // connection() might fail or be no-op in non-prerender contexts
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    username: profile.username,
    email: profile.email,
    whatsappNumber: profile.whatsapp_number || undefined,
    rollNumber: profile.roll_number || undefined,
    avatar: profile.avatar_url || undefined,
    institute: profile.institute,
    department: profile.department,
    semester: profile.semester,
    bio: profile.bio || undefined,
    githubUrl: profile.github_url || undefined,
    portfolioUrl: profile.portfolio_url || undefined,
    linkedinUrl: profile.linkedin_url || undefined,
    experienceLevel: profile.experience_level,
    role: profile.role,
    profileCompletion: profile.profile_completion,
    joinedAt: profile.created_at,
  };
}
