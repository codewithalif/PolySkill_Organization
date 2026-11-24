"use client";

import { useState } from "react";
import { completeLessonAction, type LessonWithStatus } from "@/actions/lessons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface HtmlPlaylistClientProps {
  initialLessons: LessonWithStatus[];
  playlistTitle: string;
  playlistId: string;
}

export function HtmlPlaylistClient({
  initialLessons,
  playlistTitle,
  playlistId,
}: HtmlPlaylistClientProps) {
  const [lessons, setLessons] = useState<LessonWithStatus[]>(initialLessons);
  const [currentLesson, setCurrentLesson] = useState<LessonWithStatus>(() => {
    // Select first unlocked incomplete lesson, or lesson 1
    const firstIncompleteUnlocked = initialLessons.find(
      (l) => l.isUnlocked && !l.isCompleted
    );
    return firstIncompleteUnlocked || initialLessons[0];
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  async function handleCompleteAndNext() {
    if (!currentLesson) return;
    setIsCompleting(true);

    try {
      const res = await completeLessonAction(currentLesson.id);
      if (res.success) {
        toast.success(res.message);

        // Update local state: mark current as completed and unlock next
        const currentSerial = currentLesson.serial;
        const updated = lessons.map((l) => {
          if (l.serial === currentSerial) {
            return { ...l, isCompleted: true };
          }
          if (l.serial === currentSerial + 1) {
            return { ...l, isUnlocked: true };
          }
          return l;
        });

        setLessons(updated);

        // Advance to next lesson if available
        const next = updated.find((l) => l.serial === currentSerial + 1);
        if (next) {
          setCurrentLesson(next);
        }
      } else {
        toast.error(res.message || "Failed to complete lesson");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCompleting(false);
    }
  }

  function handleSelectLesson(lesson: LessonWithStatus) {
    if (!lesson.isUnlocked) {
      toast.error(
        `Lesson ${lesson.serial} is locked! Complete Lesson ${lesson.serial - 1} first.`
      );
      return;
    }
    setCurrentLesson(lesson);
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] gap-1.5">
          <Link href="/roadmaps/web-development">
            <ArrowLeft className="h-4 w-4" /> Back to Web Dev Roadmap
          </Link>
        </Button>
        <div className="flex items-center gap-2 font-mono">
          <Badge variant="outline" className="text-xs border-primary/25 bg-primary/5 text-primary">
            Official Curriculum
          </Badge>
          <a
            href={`https://www.youtube.com/playlist?list=${playlistId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            YouTube Playlist <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Header & Overall Progress */}
      <Card className="border-white/[0.08] bg-[#111B2E]/80 backdrop-blur-xl rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono">HTML5 Core</Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Sequential Learning System
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {playlistTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All 28 official lessons in original playlist sequence. Complete each video to unlock the next.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-bold">
                  {completedCount} / {lessons.length} ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Player & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* YouTube Embedded Video Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.1] bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${currentLesson.videoId}?rel=0&modestbranding=1`}
              title={currentLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* Current Lesson Info & Complete Button */}
          <Card className="border-white/[0.08] bg-[#111B2E]/70 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono border-white/[0.08] bg-white/[0.04] text-muted-foreground">
                      Lesson {currentLesson.serial} of {lessons.length}
                    </Badge>
                    {currentLesson.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-cyan-400" /> {currentLesson.duration}
                      </span>
                    )}
                    {currentLesson.isCompleted && (
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs gap-1 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-heading text-lg sm:text-xl text-foreground">
                    {currentLesson.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="default"
                    variant={currentLesson.isCompleted ? "outline" : "default"}
                    disabled={isCompleting}
                    onClick={handleCompleteAndNext}
                    className={
                      currentLesson.isCompleted
                        ? "min-w-[170px] text-xs rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono"
                        : "min-w-[170px] text-xs rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
                    }
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : currentLesson.isCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                        Mark as Complete
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete & Next
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Right Col: Playlist Lesson Queue */}
        <div className="space-y-3">
          <Card className="h-fit border-white/[0.08] bg-[#111B2E]/65 backdrop-blur-md rounded-2xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold flex items-center justify-between text-foreground">
                <span>Playlist Curriculum</span>
                <span className="text-xs font-mono font-normal text-muted-foreground">
                  {completedCount}/{lessons.length} Done
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Follow sequentially from Lesson 1 to 28
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="max-h-[580px] overflow-y-auto space-y-1.5 pr-1">
                {lessons.map((lesson) => {
                  const isCurrent = lesson.serial === currentLesson.serial;
                  const isLocked = !lesson.isUnlocked;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      disabled={isLocked}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                        isCurrent
                          ? "bg-primary text-white shadow-[0_0_14px_rgba(120,107,250,0.4)]"
                          : isLocked
                          ? "opacity-40 cursor-not-allowed bg-white/[0.01]"
                          : "hover:bg-white/[0.05] text-foreground"
                      }`}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {lesson.isCompleted ? (
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              isCurrent ? "text-white" : "text-emerald-400"
                            }`}
                          />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <PlayCircle
                            className={`h-4 w-4 ${
                              isCurrent ? "text-white" : "text-primary"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-medium line-clamp-1 ${
                              isCurrent ? "text-white" : "text-foreground"
                            }`}
                          >
                            {lesson.serial}. {lesson.title}
                          </span>
                        </div>
                        {lesson.duration && (
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              isCurrent
                                ? "text-white/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {lesson.duration}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
