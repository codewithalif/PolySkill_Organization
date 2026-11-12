"use client";

import { useState } from "react";
import { toggleStepProgressAction } from "@/actions/roadmaps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { RoadmapWithDetails } from "@/actions/roadmaps";

interface RoadmapDetailClientProps {
  roadmap: RoadmapWithDetails;
}

export function RoadmapDetailClient({ roadmap }: RoadmapDetailClientProps) {
  const [steps, setSteps] = useState(roadmap.steps);
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);

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
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/roadmaps">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to All Roadmaps
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{roadmap.difficulty}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {roadmap.estimated_duration}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {roadmap.description}
        </p>

        {/* Overall Progress */}
        <Card className="p-4 mt-4 bg-muted/40">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-semibold">Overall Progress</span>
            <span className="font-bold text-primary">
              {completedCount} / {steps.length} Steps Completed ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </Card>
      </div>

      {/* Step Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Curriculum Steps</h2>

        {steps.map((step, index) => {
          const isLoading = loadingStepId === step.id;

          return (
            <Card
              key={step.id}
              className={`transition-all ${
                step.is_completed
                  ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10"
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
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : step.is_completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        STEP {index + 1}
                      </div>
                      <CardTitle className="text-lg mt-0.5">{step.title}</CardTitle>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={step.is_completed ? "outline" : "default"}
                    onClick={() => handleToggleStep(step.id)}
                    disabled={isLoading}
                  >
                    {step.is_completed ? "Completed" : "Mark as Done"}
                  </Button>
                </div>

                <CardDescription className="text-sm mt-2 pl-9">
                  {step.description}
                </CardDescription>
              </CardHeader>

              {(step.topics.length > 0 || step.resources.length > 0) && (
                <CardContent className="space-y-3 pl-13 pt-0">
                  {/* Topics */}
                  {step.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                      {step.topics.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Recommended Resources */}
                  {step.resources.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Recommended Resources:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res: any, idx: number) => {
                          const isInternal = res.url.startsWith("/");
                          return isInternal ? (
                            <Link
                              key={idx}
                              href={res.url}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 border border-primary/30 p-2 rounded-md"
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
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-background p-1.5 rounded border"
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
