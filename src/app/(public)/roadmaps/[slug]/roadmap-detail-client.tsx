"use client";

import { useState } from "react";
import { toggleStepProgressAction } from "@/actions/roadmaps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, ExternalLink, ArrowLeft, Loader2, PlayCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { RoadmapWithDetails } from "@/actions/roadmaps";

function extractYouTubeVideoId(urlOrEmbed: string): string | null {
  if (!urlOrEmbed) return null;
  const matchIframe = urlOrEmbed.match(/src=["'](?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (matchIframe) return matchIframe[1];
  const matchEmbed = urlOrEmbed.match(/(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
  if (matchEmbed) return matchEmbed[1];
  const matchWatch = urlOrEmbed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (matchWatch) return matchWatch[1];
  const matchShort = urlOrEmbed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (matchShort) return matchShort[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrEmbed.trim())) return urlOrEmbed.trim();
  return null;
}

interface RoadmapDetailClientProps {
  roadmap: RoadmapWithDetails;
}

export function RoadmapDetailClient({ roadmap }: RoadmapDetailClientProps) {
  const [steps, setSteps] = useState(roadmap.steps);
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);
  const [activeVideoStepId, setActiveVideoStepId] = useState<string | null>(null);

  const completedCount = steps.filter((s) => s.is_completed).length;
  const progressPercent =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  async function handleToggleStep(stepId: string) {
    setLoadingStepId(stepId);
    try {
      const res = await toggleStepProgressAction(stepId);
      if (res.success && res.data) {
        const isDone = res.data.completed;
        setSteps((prev) =>
          prev.map((s) => (s.id === stepId ? { ...s, is_completed: isDone } : s))
        );
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to update step");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingStepId(null);
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] gap-1.5">
          <Link href="/roadmaps">
            <ArrowLeft className="h-4 w-4" /> Back to All Roadmaps
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-primary/25 bg-primary/5 text-primary">{roadmap.difficulty}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5 text-cyan-400" /> {roadmap.estimated_duration}
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{roadmap.title}</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {roadmap.description}
        </p>

        {/* Overall Progress */}
        <Card className="p-5 mt-4 border-white/[0.08] bg-[#111B2E]/75 backdrop-blur-xl rounded-2xl shadow-xl">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-2.5 font-mono">
            <span className="font-heading font-semibold text-foreground">Overall Progress</span>
            <span className="font-bold text-primary">
              {completedCount} / {steps.length} Steps Completed ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400" />
        </Card>
      </div>

      {/* Step Timeline */}
      <div className="space-y-4 pt-2">
        <h2 className="font-heading text-xl font-bold text-foreground">Curriculum Steps</h2>

        {steps.map((step, index) => {
          const isLoading = loadingStepId === step.id;

          // Find if this step contains a YouTube video resource
          const videoResource = step.resources?.find((r: any) => {
            const vidId = r.videoId || extractYouTubeVideoId(r.embedUrl || r.url || "");
            return !!vidId;
          });
          const videoId = videoResource
            ? videoResource.videoId || extractYouTubeVideoId(videoResource.embedUrl || videoResource.url || "")
            : null;
          const isPlayerOpen = activeVideoStepId === step.id;

          return (
            <Card
              key={step.id}
              className={`border-white/[0.08] bg-[#111B2E]/65 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-primary/40 ${
                step.is_completed
                  ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStep(step.id)}
                      disabled={isLoading}
                      className="mt-1 cursor-pointer focus:outline-none"
                      title={step.is_completed ? "Mark incomplete" : "Mark as completed"}
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : step.is_completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-muted-foreground">
                        STEP {index + 1}
                      </div>
                      <CardTitle className="font-heading text-lg mt-0.5 text-foreground">{step.title}</CardTitle>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {videoId && (
                      <Button
                        size="sm"
                        variant={isPlayerOpen ? "secondary" : "default"}
                        className={isPlayerOpen ? "text-xs rounded-xl" : "text-xs rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-medium"}
                        onClick={() => setActiveVideoStepId(isPlayerOpen ? null : step.id)}
                      >
                        {isPlayerOpen ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide Video
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Watch Video
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={step.is_completed ? "outline" : "default"}
                      onClick={() => handleToggleStep(step.id)}
                      disabled={isLoading}
                      className={
                        step.is_completed
                          ? "text-xs rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono"
                          : "text-xs rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_12px_rgba(120,107,250,0.4)]"
                      }
                    >
                      {step.is_completed ? "Completed" : "Mark as Done"}
                    </Button>
                  </div>
                </div>

                <CardDescription className="text-xs sm:text-sm mt-2 pl-9 text-muted-foreground leading-relaxed">
                  {step.description}
                </CardDescription>

                {/* Direct On-Page Embedded Video Player */}
                {videoId && isPlayerOpen && (
                  <div className="mt-4 ml-0 sm:ml-9 space-y-2">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.1] bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={step.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground px-1 font-mono">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <PlayCircle className="h-3.5 w-3.5" /> Playing inside PolySkill
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        Watch on YouTube <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardHeader>

              {(step.topics.length > 0 || step.resources.length > 0) && (
                <CardContent className="space-y-3 pl-13 pt-0">
                  {/* Topics */}
                  {step.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                      {step.topics.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-secondary-foreground">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Recommended Resources */}
                  {step.resources.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-mono font-medium text-muted-foreground">
                        Recommended Resources:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res: any, idx: number) => {
                          const isInternal = res.url.startsWith("/");
                          return isInternal ? (
                            <Link
                              key={idx}
                              href={res.url}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/10 border border-primary/25 px-2.5 py-1.5 rounded-lg"
                            >
                              <span>🎓 {res.title}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <a
                              key={idx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-secondary-foreground hover:text-primary bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1.5 rounded-lg border border-white/[0.06] transition-colors"
                            >
                              <span>{res.title}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
