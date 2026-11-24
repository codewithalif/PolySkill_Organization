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

  const { fullName, email, password, whatsappNumber, gender, institute, department, semester } =
    validation.data;

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        whatsapp_number: whatsappNumber.trim(),
        gender: gender || null,
        institute,
        department,
        semester,
        // Role cannot be manipulated by client; database trigger enforces role = 'student'
      },
    },
  });

  if (signUpError) {
    return {
      success: false,
      message: signUpError.message,
    };
  }

  // If session wasn't automatically created by signUp (e.g. if email confirmations were toggled on or returned null session),
  // automatically sign in with password so the user is immediately authenticated.
  if (!signUpData?.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      // Even if sign-in had an issue, account was created
      return {
        success: true,
        message: "Account created! Please sign in with your password.",
        data: { email },
      };
    }
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Welcome to PolySkill! Setting up your dashboard...",
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

  const { email, password, gender } = validation.data;
  const supabase = await createClient();

  const { error, data: signInData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Update last_login_at and optionally gender on each login
  if (signInData?.user) {
    const profileUpdates: Record<string, unknown> = {
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (gender) {
      profileUpdates.gender = gender;
    }

    // Upsert-style: check profile exists first, then update (or create if trigger missed it)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", signInData.user.id)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", signInData.user.id);
    } else {
      // Profile missing (edge case: trigger failed on initial signup) — create it now
      const meta = signInData.user.user_metadata || {};
      const baseUsername = (email.split("@")[0] || "student").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      await supabase.from("profiles").insert({
        id: signInData.user.id,
        full_name: meta.full_name || baseUsername,
        username: `${baseUsername}_${signInData.user.id.slice(0, 6)}`,
        email: signInData.user.email || email,
        roll_number: meta.roll_number || null,
        whatsapp_number: meta.whatsapp_number || null,
        gender: gender || meta.gender || null,
        institute: meta.institute || "Other",
        department: meta.department || "Computer Science & Technology",
        semester: meta.semester || "1st Semester",
        role: "student",
        experience_level: "Beginner",
        profile_completion: 60,
        last_login_at: new Date().toISOString(),
      });
    }
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
    // Profile missing — could happen if DB trigger failed during signup.
    // Attempt an emergency upsert so the user can continue without logging out.
    const meta = authUser.user_metadata || {};
    const emailLocal = (authUser.email || "").split("@")[0];
    const baseUsername = emailLocal.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "student";
    await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        full_name: meta.full_name || baseUsername,
        username: `${baseUsername}_${authUser.id.slice(0, 6)}`,
        email: authUser.email || "",
        roll_number: meta.roll_number || null,
        whatsapp_number: meta.whatsapp_number || null,
        gender: meta.gender || null,
        institute: meta.institute || "Other",
        department: meta.department || "Computer Science & Technology",
        semester: meta.semester || "1st Semester",
        role: "student",
        experience_level: "Beginner",
        profile_completion: 60,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: false }
    );

    // Re-fetch after upsert
    const { data: retryProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!retryProfile) return null;

    return {
      id: retryProfile.id,
      fullName: retryProfile.full_name,
      username: retryProfile.username,
      email: retryProfile.email,
      rollNumber: retryProfile.roll_number || undefined,
      whatsappNumber: retryProfile.whatsapp_number || undefined,
      gender: retryProfile.gender || undefined,
      avatar: retryProfile.avatar_url || undefined,
      institute: retryProfile.institute,
      department: retryProfile.department,
      semester: retryProfile.semester,
      bio: retryProfile.bio || undefined,
      githubUrl: retryProfile.github_url || undefined,
      portfolioUrl: retryProfile.portfolio_url || undefined,
      linkedinUrl: retryProfile.linkedin_url || undefined,
      facebookUrl: retryProfile.facebook_url || undefined,
      instagramUrl: retryProfile.instagram_url || undefined,
      experienceLevel: retryProfile.experience_level,
      role: retryProfile.role,
      profileCompletion: retryProfile.profile_completion,
      lastLoginAt: retryProfile.last_login_at || undefined,
      joinedAt: retryProfile.created_at,
    };
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    username: profile.username,
    email: profile.email,
    rollNumber: profile.roll_number || undefined,
    whatsappNumber: profile.whatsapp_number || undefined,
    gender: profile.gender || undefined,
    avatar: profile.avatar_url || undefined,
    institute: profile.institute,
    department: profile.department,
    semester: profile.semester,
    bio: profile.bio || undefined,
    githubUrl: profile.github_url || undefined,
    portfolioUrl: profile.portfolio_url || undefined,
    linkedinUrl: profile.linkedin_url || undefined,
    facebookUrl: profile.facebook_url || undefined,
    instagramUrl: profile.instagram_url || undefined,
    experienceLevel: profile.experience_level,
    role: profile.role,
    profileCompletion: profile.profile_completion,
    lastLoginAt: profile.last_login_at || undefined,
    joinedAt: profile.created_at,
  };
}
