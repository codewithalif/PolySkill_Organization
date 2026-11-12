"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/auth";
import type { Json } from "@/types/database.types";

export interface RoadmapWithDetails {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  estimated_duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  created_at: string;
  total_steps: number;
  completed_steps: number;
  steps: RoadmapStepWithStatus[];
}

export interface RoadmapStepWithStatus {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  topics: string[];
  resources: any[];
  step_order: number;
  is_completed: boolean;
}

/** Get all roadmaps with user progress count */
export async function getRoadmapsAction(): Promise<
  ActionResult<RoadmapWithDetails[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: roadmaps, error: roadmapsErr } = await supabase
      .from("roadmaps")
      .select("*")
      .order("created_at", { ascending: true });

    if (roadmapsErr || !roadmaps) {
      return { success: false, message: roadmapsErr?.message || "Failed to load roadmaps", data: [] };
    }

    const { data: allSteps } = await supabase
      .from("roadmap_steps")
      .select("id, roadmap_id, title, description, topics, resources, step_order")
      .order("step_order", { ascending: true });

    let userProgressMap = new Set<string>();
    if (user) {
      const { data: progress } = await supabase
        .from("student_roadmap_progress")
        .select("step_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progress) {
        progress.forEach((p) => userProgressMap.add(p.step_id));
      }
    }

    const roadmapsWithDetails: RoadmapWithDetails[] = roadmaps.map((r) => {
      const stepsForThis = (allSteps || []).filter((s) => s.roadmap_id === r.id);
      const totalSteps = stepsForThis.length;
      let completedSteps = 0;

      const steps: RoadmapStepWithStatus[] = stepsForThis.map((s) => {
        const isCompleted = userProgressMap.has(s.id);
        if (isCompleted) completedSteps++;
        return {
          id: s.id,
          roadmap_id: s.roadmap_id,
          title: s.title,
          description: s.description,
          topics: s.topics,
          resources: (s.resources as any) || [],
          step_order: s.step_order,
          is_completed: isCompleted,
        };
      });

      return {
        ...r,
        total_steps: totalSteps,
        completed_steps: completedSteps,
        steps,
      };
    });

    return { success: true, data: roadmapsWithDetails };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}

/** Get single roadmap by slug with complete steps and user progress */
export async function getRoadmapBySlugAction(
  slug: string
): Promise<ActionResult<RoadmapWithDetails>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: roadmap, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !roadmap) {
      return { success: false, message: "Roadmap not found" };
    }

    const { data: stepsData } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("step_order", { ascending: true });

    const completedStepIds = new Set<string>();
    if (user) {
      const { data: progress } = await supabase
        .from("student_roadmap_progress")
        .select("step_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progress) {
        progress.forEach((p) => completedStepIds.add(p.step_id));
      }
    }

    const steps: RoadmapStepWithStatus[] = (stepsData || []).map((s) => ({
      id: s.id,
      roadmap_id: s.roadmap_id,
      title: s.title,
      description: s.description,
      topics: s.topics,
      resources: (s.resources as any) || [],
      step_order: s.step_order,
      is_completed: completedStepIds.has(s.id),
    }));

    return {
      success: true,
      data: {
        ...roadmap,
        total_steps: steps.length,
        completed_steps: steps.filter((s) => s.is_completed).length,
        steps,
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/** Toggle student progress on a roadmap step */
export async function toggleStepProgressAction(
  stepId: string
): Promise<ActionResult<{ completed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { data: existing } = await supabase
    .from("student_roadmap_progress")
    .select("id, completed")
    .eq("user_id", user.id)
    .eq("step_id", stepId)
    .single();

  if (existing) {
    // If it was completed, delete it (toggle to false)
    await supabase
      .from("student_roadmap_progress")
      .delete()
      .eq("id", existing.id);

    revalidatePath("/roadmaps");
    return { success: true, message: "Step marked incomplete", data: { completed: false } };
  } else {
    // Insert completion
    await supabase.from("student_roadmap_progress").insert({
      user_id: user.id,
      step_id: stepId,
      completed: true,
    });

    revalidatePath("/roadmaps");
    return { success: true, message: "Step completed! Great job!", data: { completed: true } };
  }
}
