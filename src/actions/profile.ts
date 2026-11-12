"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth";
import type { ActionResult } from "@/actions/auth";

export async function updateProfileAction(
  data: UpdateProfileInput
): Promise<ActionResult> {
  const validation = updateProfileSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Please fix the profile validation errors.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to update your profile.",
    };
  }

  // Calculate profile completion score
  const {
    fullName,
    rollNumber,
    bio,
    institute,
    department,
    semester,
    experienceLevel,
    githubUrl,
    portfolioUrl,
    linkedinUrl,
  } = validation.data;

  let completion = 50; // base info
  if (bio && bio.length > 10) completion += 15;
  if (githubUrl) completion += 15;
  if (portfolioUrl || linkedinUrl) completion += 20;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      roll_number: rollNumber ? rollNumber.trim().toUpperCase() : null,
      bio: bio || null,
      institute,
      department,
      semester,
      experience_level: experienceLevel,
      github_url: githubUrl || null,
      portfolio_url: portfolioUrl || null,
      linkedin_url: linkedinUrl || null,
      profile_completion: Math.min(100, completion),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Profile updated successfully!",
  };
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<ActionResult<{ avatarUrl: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return {
      success: false,
      message: "No file provided",
    };
  }

  // Validate file type & size (5MB max)
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedMimes.includes(file.type)) {
    return {
      success: false,
      message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      message: "File size exceeds 5MB limit.",
    };
  }

  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return {
      success: false,
      message: uploadError.message,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  // Update profile with new avatar URL
  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Avatar uploaded successfully!",
    data: { avatarUrl: publicUrl },
  };
}
