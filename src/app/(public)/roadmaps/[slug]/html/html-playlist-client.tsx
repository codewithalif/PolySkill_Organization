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
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
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
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/roadmaps/web-development">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Web Dev Roadmap
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Official Curriculum
          </Badge>
          <a
            href={`https://www.youtube.com/playlist?list=${playlistId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            YouTube Playlist <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Header & Overall Progress */}
      <Card className="border-primary/20 bg-gradient-to-r from-card via-background to-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-600 hover:bg-orange-600">HTML5 Core</Badge>
                <span className="text-xs text-muted-foreground">
                  Sequential Learning System
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {playlistTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                All 28 official lessons in original playlist sequence. Complete each video to unlock the next.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 p-3 rounded-lg border bg-card/50">
              <div className="flex justify-between text-xs font-semibold">
                <span>Progress</span>
                <span className="text-primary font-bold">
                  {completedCount} / {lessons.length} ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Player & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* YouTube Embedded Video Player */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg border bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentLesson.videoId}?rel=0&modestbranding=1&enablejsapi=1`}
              title={currentLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* Current Lesson Info & Complete Button */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Lesson {currentLesson.serial} of {lessons.length}
                    </Badge>
                    {currentLesson.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {currentLesson.duration}
                      </span>
                    )}
                    {currentLesson.isCompleted && (
                      <Badge variant="default" className="bg-emerald-600 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">
                    {currentLesson.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="default"
                    variant={currentLesson.isCompleted ? "outline" : "default"}
                    disabled={isCompleting}
                    onClick={handleCompleteAndNext}
                    className="min-w-[170px]"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : currentLesson.isCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
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
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Playlist Curriculum</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {completedCount}/{lessons.length} Done
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Follow sequentially from Lesson 1 to 28
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="max-h-[580px] overflow-y-auto space-y-1 pr-1">
                {lessons.map((lesson) => {
                  const isCurrent = lesson.serial === currentLesson.serial;
                  const isLocked = !lesson.isUnlocked;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      disabled={isLocked}
                      className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isLocked
                          ? "opacity-50 cursor-not-allowed bg-muted/20"
                          : "hover:bg-muted/60 text-card-foreground"
                      }`}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {lesson.isCompleted ? (
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              isCurrent ? "text-primary-foreground" : "text-emerald-500"
                            }`}
                          />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <PlayCircle
                            className={`h-4 w-4 ${
                              isCurrent ? "text-primary-foreground" : "text-primary"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-semibold line-clamp-1 ${
                              isCurrent ? "text-primary-foreground" : ""
                            }`}
                          >
                            {lesson.serial}. {lesson.title}
                          </span>
                        </div>
                        {lesson.duration && (
                          <div
                            className={`text-[10px] mt-0.5 ${
                              isCurrent
                                ? "text-primary-foreground/80"
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
