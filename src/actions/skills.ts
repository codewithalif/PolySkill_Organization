"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  studentSkillSchema,
  type StudentSkillInput,
} from "@/lib/validations/skill";
import type { ActionResult } from "@/actions/auth";

/** Fetch the global skills catalog (public) */
export async function getSkillsAction(): Promise<
  ActionResult<{ id: string; name: string; category: string; created_at: string }[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true });

  if (error) return { success: false, message: error.message };
  return { success: true, data: data ?? [] };
}

/** Fetch student_skills for the current user (or a given userId) */
export async function getStudentSkillsAction(userId?: string): Promise<
  ActionResult<
    {
      id: string;
      user_id: string;
      skill_id: string | null;
      name: string;
      category: string;
      level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
      progress: number;
      target_date: string | null;
      learning_goal: string | null;
      created_at: string;
      updated_at: string;
    }[]
  >
> {
  const supabase = await createClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { success: false, message: "Authentication required" };
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("student_skills")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message };
  return { success: true, data: data ?? [] };
}

/** Add a new student skill for the current user */
export async function addStudentSkillAction(
  data: StudentSkillInput
): Promise<ActionResult<{ id: string }>> {
  const validation = studentSkillSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { name, category, level, progress, targetDate, learningGoal } =
    validation.data;

  const { data: inserted, error } = await supabase
    .from("student_skills")
    .insert({
      user_id: user.id,
      name,
      category,
      level,
      progress,
      target_date: targetDate ?? null,
      learning_goal: learningGoal ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, message: error.message };

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return { success: true, data: { id: inserted.id }, message: "Skill added!" };
}

/** Update an existing student skill (must own it) */
export async function updateStudentSkillAction(
  id: string,
  data: StudentSkillInput
): Promise<ActionResult> {
  const validation = studentSkillSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { name, category, level, progress, targetDate, learningGoal } =
    validation.data;

  const { error } = await supabase
    .from("student_skills")
    .update({
      name,
      category,
      level,
      progress,
      target_date: targetDate ?? null,
      learning_goal: learningGoal ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return { success: true, message: "Skill updated!" };
}

/** Delete a student skill (must own it) */
export async function deleteStudentSkillAction(
  id: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { error } = await supabase
    .from("student_skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return { success: true, message: "Skill deleted." };
}

/** Return dashboard skill stats for the current user */
export async function getDashboardSkillStatsAction(): Promise<
  ActionResult<{ totalSkills: number; avgProgress: number; topCategory: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Authentication required" };

  const { data, error } = await supabase
    .from("student_skills")
    .select("category, progress")
    .eq("user_id", user.id);

  if (error) return { success: false, message: error.message };

  const skills = data ?? [];
  const totalSkills = skills.length;
  const avgProgress =
    totalSkills > 0
      ? Math.round(
          skills.reduce((sum, s) => sum + (s.progress ?? 0), 0) / totalSkills
        )
      : 0;

  // Find the category with the most skills
  const categoryCount: Record<string, number> = {};
  for (const s of skills) {
    categoryCount[s.category] = (categoryCount[s.category] ?? 0) + 1;
  }
  const topCategory =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  return { success: true, data: { totalSkills, avgProgress, topCategory } };
}
