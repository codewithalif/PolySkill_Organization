"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  OFFICIAL_HTML_PLAYLIST_ID,
  OFFICIAL_HTML_PLAYLIST_TITLE,
  OFFICIAL_HTML_LESSONS,
} from "@/lib/official-html-playlist";
import type { ActionResult } from "@/actions/auth";

export interface LessonWithStatus {
  id: string;
  serial: number;
  title: string;
  videoId: string;
  url: string;
  duration?: string;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface PlaylistProgressData {
  playlistId: string;
  playlistTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: LessonWithStatus[];
}

/**
 * Initialize or synchronize official HTML lessons in database
 * Automatically ensures all 28 lessons are in DB without duplicate errors.
 */
export async function syncOfficialHtmlLessonsAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient();

    // Check if web-development roadmap exists
    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("slug", "web-development")
      .single();

    let htmlStepId: string | null = null;

    if (roadmap) {
      const { data: step } = await supabase
        .from("roadmap_steps")
        .select("id")
        .eq("roadmap_id", roadmap.id)
        .ilike("title", "%HTML%")
        .single();

      if (step) {
        htmlStepId = step.id;
      }
    }

    // Insert or update all 28 lessons
    for (const l of OFFICIAL_HTML_LESSONS) {
      await supabase
        .from("course_lessons" as any)
        .upsert(
          {
            playlist_id: OFFICIAL_HTML_PLAYLIST_ID,
            serial: l.serial,
            title: l.title,
            video_id: l.videoId,
            url: l.url,
            duration: l.duration || null,
            ...(htmlStepId && { step_id: htmlStepId }),
          },
          { onConflict: "playlist_id,serial" }
        );
    }

    revalidatePath("/roadmaps/web-development/html");
    return { success: true, message: "Official HTML playlist synchronized", data: { count: OFFICIAL_HTML_LESSONS.length } };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetch HTML course lessons with student's sequential lock & completion status
 * Enforces sequential unlocking:
 * - Lesson 1 is unlocked by default.
 * - Lesson N is unlocked only if Lesson N-1 is completed.
 */
export async function getHtmlLessonsWithProgressAction(): Promise<
  ActionResult<PlaylistProgressData>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Fetch lessons from DB, if empty automatically sync
    let { data: dbLessons, error } = await (supabase
      .from("course_lessons" as any)
      .select("*")
      .eq("playlist_id", OFFICIAL_HTML_PLAYLIST_ID)
      .order("serial", { ascending: true }) as any);

    if (error || !dbLessons || dbLessons.length === 0) {
      // Seed directly from official constant
      await syncOfficialHtmlLessonsAction();
      const res = await (supabase
        .from("course_lessons" as any)
        .select("*")
        .eq("playlist_id", OFFICIAL_HTML_PLAYLIST_ID)
        .order("serial", { ascending: true }) as any);
      dbLessons = res.data || [];
    }

    // Fallback if DB table not yet created: use in-memory official lessons
    const sourceLessons =
      dbLessons && dbLessons.length > 0
        ? dbLessons.map((l: any) => ({
            id: l.id,
            serial: l.serial,
            title: l.title,
            videoId: l.video_id,
            url: l.url,
            duration: l.duration || undefined,
          }))
        : OFFICIAL_HTML_LESSONS.map((l) => ({
            id: `html-lesson-${l.serial}`,
            serial: l.serial,
            title: l.title,
            videoId: l.videoId,
            url: l.url,
            duration: l.duration,
          }));

    // 2. Fetch student completion records
    const completedLessonIds = new Set<string>();
    const completedSerials = new Set<number>();

    if (user) {
      const { data: progressRows } = await (supabase
        .from("student_lesson_progress" as any)
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true) as any);

      if (progressRows) {
        progressRows.forEach((p: any) => completedLessonIds.add(p.lesson_id));
      }
    }

    // Map serial completion
    sourceLessons.forEach((l: any) => {
      if (completedLessonIds.has(l.id)) {
        completedSerials.add(l.serial);
      }
    });

    // 3. Calculate sequential unlock state
    // Rule: Lesson 1 is always unlocked.
    // Lesson N is unlocked if Lesson N-1 is completed.
    let completedCount = 0;
    const lessonsWithStatus: LessonWithStatus[] = sourceLessons.map((l: any, index: number) => {
      const isCompleted = completedLessonIds.has(l.id);
      if (isCompleted) completedCount++;

      let isUnlocked = false;
      if (index === 0) {
        isUnlocked = true; // Lesson 1 always unlocked
      } else {
        const prevLesson = sourceLessons[index - 1];
        isUnlocked = completedLessonIds.has(prevLesson.id);
      }

      return {
        ...l,
        isCompleted,
        isUnlocked,
      };
    });

    const total = lessonsWithStatus.length;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      success: true,
      data: {
        playlistId: OFFICIAL_HTML_PLAYLIST_ID,
        playlistTitle: OFFICIAL_HTML_PLAYLIST_TITLE,
        totalLessons: total,
        completedLessons: completedCount,
        progressPercent: percent,
        lessons: lessonsWithStatus,
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Complete a lesson and unlock the next one
 * Server-side authorization check:
 * Cannot mark Lesson N as complete unless Lesson N is currently unlocked!
 */
export async function completeLessonAction(
  lessonId: string
): Promise<ActionResult<{ nextLessonId?: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Please log in to save your learning progress" };
    }

    // 1. Fetch this lesson
    const { data: targetLesson } = await (supabase
      .from("course_lessons" as any)
      .select("*")
      .eq("id", lessonId)
      .single() as any);

    if (!targetLesson) {
      return { success: false, message: "Lesson not found" };
    }

    // 2. Authorization check: If serial > 1, verify serial - 1 is completed
    if (targetLesson.serial > 1) {
      const { data: prevLesson } = await (supabase
        .from("course_lessons" as any)
        .select("id")
        .eq("playlist_id", targetLesson.playlist_id)
        .eq("serial", targetLesson.serial - 1)
        .single() as any);

      if (prevLesson) {
        const { data: prevProgress } = await (supabase
          .from("student_lesson_progress" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("lesson_id", prevLesson.id)
          .eq("completed", true)
          .single() as any);

        if (!prevProgress) {
          return {
            success: false,
            message: "Action forbidden: You must complete the previous lesson first before unlocking this one.",
          };
        }
      }
    }

    // 3. Mark this lesson completed
    await (supabase.from("student_lesson_progress" as any) as any).upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    // 4. Update overall student roadmap step progress if all lessons are completed
    const { count: totalLessons } = await (supabase
      .from("course_lessons" as any)
      .select("*", { count: "exact", head: true })
      .eq("playlist_id", targetLesson.playlist_id) as any);

    const { count: completedCount } = await (supabase
      .from("student_lesson_progress" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true) as any);

    if (targetLesson.step_id && totalLessons && completedCount && completedCount >= totalLessons) {
      await supabase.from("student_roadmap_progress").upsert(
        {
          user_id: user.id,
          step_id: targetLesson.step_id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,step_id" }
      );
    }

    // 5. Find next lesson
    const { data: nextLesson } = await (supabase
      .from("course_lessons" as any)
      .select("id")
      .eq("playlist_id", targetLesson.playlist_id)
      .eq("serial", targetLesson.serial + 1)
      .single() as any);

    revalidatePath("/roadmaps/web-development/html");
    revalidatePath("/roadmaps/web-development");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Lesson completed! Next lesson unlocked.",
      data: { nextLessonId: nextLesson?.id },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
