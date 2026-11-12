"use client";

import { useState } from "react";
import {
  createRoadmapAction,
  addRoadmapStepAction,
  addYouTubeVideoStepAction,
  deleteRoadmapAction,
} from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2, Map, Plus, Video, Loader2 } from "lucide-react";

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface RoadmapsClientProps {
  initialRoadmaps: any[];
}

export function RoadmapsAdminClient({ initialRoadmaps }: RoadmapsClientProps) {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isAddYouTubeOpen, setIsAddYouTubeOpen] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // YouTube Step form state
  const [youtubeForm, setYoutubeForm] = useState({
    youtubeUrl: "",
    stepOrder: 1,
    customTitle: "",
    customDescription: "",
  });

  // New Roadmap form state
  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    slug: "",
    description: "",
    icon: "Code",
    estimatedDuration: "4 Months",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
  });

  // New Step form state
  const [stepForm, setStepForm] = useState({
    title: "",
    description: "",
    topics: "",
    stepOrder: 1,
  });

  async function handleAddYouTubeStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoadmapId || !youtubeForm.youtubeUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addYouTubeVideoStepAction({
        roadmapId: selectedRoadmapId,
        youtubeUrl: youtubeForm.youtubeUrl,
        stepOrder: youtubeForm.stepOrder,
        customTitle: youtubeForm.customTitle || undefined,
        customDescription: youtubeForm.customDescription || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        setIsAddYouTubeOpen(false);
        setYoutubeForm({
          youtubeUrl: "",
          stepOrder: 1,
          customTitle: "",
          customDescription: "",
        });
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to add YouTube video step");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateRoadmap(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await createRoadmapAction(roadmapForm);
      if (res.success) {
        toast.success(res.message);
        setIsAddRoadmapOpen(false);
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to create roadmap");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoadmapId) return;

    setIsSubmitting(true);
    const topicsArr = stepForm.topics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await addRoadmapStepAction({
        roadmapId: selectedRoadmapId,
        title: stepForm.title,
        description: stepForm.description,
        topics: topicsArr,
        stepOrder: stepForm.stepOrder,
      });

      if (res.success) {
        toast.success(res.message);
        setIsAddStepOpen(false);
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to add step");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRoadmap(id: string) {
    if (!confirm("Are you sure you want to delete this roadmap and all its steps?")) {
      return;
    }

    try {
      const res = await deleteRoadmapAction(id);
      if (res.success) {
        toast.success(res.message);
        setRoadmaps((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roadmaps & Curriculum</h1>
          <p className="text-muted-foreground">
            Manage academic and technical career learning roadmaps for polytechnic students.
          </p>
        </div>
        <Button onClick={() => setIsAddRoadmapOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Roadmap
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roadmaps.map((rm) => (
          <Card key={rm.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{rm.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Slug: /{rm.slug} • {rm.estimated_duration}
                  </CardDescription>
                </div>
                <Badge variant="outline">{rm.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {rm.description}
              </p>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Steps ({(rm.steps || []).length})</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      onClick={() => {
                        setSelectedRoadmapId(rm.id);
                        setYoutubeForm({
                          youtubeUrl: "",
                          stepOrder: (rm.steps || []).length + 1,
                          customTitle: "",
                          customDescription: "",
                        });
                        setIsAddYouTubeOpen(true);
                      }}
                    >
                      <YoutubeIcon className="h-3.5 w-3.5 mr-1" /> Add YouTube Step
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setSelectedRoadmapId(rm.id);
                        setStepForm({
                          title: "",
                          description: "",
                          topics: "",
                          stepOrder: (rm.steps || []).length + 1,
                        });
                        setIsAddStepOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Custom Step
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  {(rm.steps || []).slice(0, 3).map((st: any, idx: number) => (
                    <div
                      key={st.id || idx}
                      className="text-xs p-1.5 rounded bg-muted/50 flex justify-between"
                    >
                      <span>
                        {idx + 1}. {st.title}
                      </span>
                    </div>
                  ))}
                  {(rm.steps || []).length > 3 && (
                    <span className="text-[10px] text-muted-foreground italic">
                      +{(rm.steps || []).length - 3} more steps
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteRoadmap(rm.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog: Create Roadmap */}
      <Dialog open={isAddRoadmapOpen} onOpenChange={setIsAddRoadmapOpen}>
        <DialogContent>
          <form onSubmit={handleCreateRoadmap}>
            <DialogHeader>
              <DialogTitle>Create Learning Roadmap</DialogTitle>
              <DialogDescription>
                Add a new structured track for diploma engineering students.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. AI & Machine Learning Foundations"
                  value={roadmapForm.title}
                  onChange={(e) =>
                    setRoadmapForm({
                      ...roadmapForm,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>URL Slug</Label>
                <Input
                  placeholder="ai-machine-learning"
                  value={roadmapForm.slug}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, slug: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="Comprehensive path for students..."
                  value={roadmapForm.description}
                  onChange={(e) =>
                    setRoadmapForm({ ...roadmapForm, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g. 5 Months"
                    value={roadmapForm.estimatedDuration}
                    onChange={(e) =>
                      setRoadmapForm({ ...roadmapForm, estimatedDuration: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label>Difficulty</Label>
                  <Select
                    value={roadmapForm.difficulty}
                    onValueChange={(val: any) =>
                      setRoadmapForm({ ...roadmapForm, difficulty: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddRoadmapOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create Roadmap
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Step */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent>
          <form onSubmit={handleAddStep}>
            <DialogHeader>
              <DialogTitle>Add Curriculum Step</DialogTitle>
              <DialogDescription>
                Define the milestone, learning topics, and goals for this step.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-1">
                <Label>Step Title</Label>
                <Input
                  placeholder="e.g. Fundamentals of Python Programming"
                  value={stepForm.title}
                  onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="What students should master in this phase..."
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Topics (comma-separated)</Label>
                <Input
                  placeholder="Variables, Loops, Functions, OOP"
                  value={stepForm.topics}
                  onChange={(e) => setStepForm({ ...stepForm, topics: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Step Order (Number)</Label>
                <Input
                  type="number"
                  min="1"
                  value={stepForm.stepOrder}
                  onChange={(e) =>
                    setStepForm({ ...stepForm, stepOrder: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddStepOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Save Step
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog: Add YouTube Video Step */}
      <Dialog open={isAddYouTubeOpen} onOpenChange={setIsAddYouTubeOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddYouTubeStep}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
                  <YoutubeIcon className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Add YouTube Video Step</DialogTitle>
                  <DialogDescription>
                    Paste any YouTube video link and assign its step number.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="youtubeUrl">YouTube Video Link or ID *</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  value={youtubeForm.youtubeUrl}
                  onChange={(e) =>
                    setYoutubeForm({ ...youtubeForm, youtubeUrl: e.target.value })
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Supports standard watch links, youtu.be short links, or embed URLs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stepOrder">Step Number *</Label>
                  <Input
                    id="stepOrder"
                    type="number"
                    min="1"
                    value={youtubeForm.stepOrder}
                    onChange={(e) =>
                      setYoutubeForm({
                        ...youtubeForm,
                        stepOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Sequence in curriculum
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customTitle">Lesson Title (Optional)</Label>
                  <Input
                    id="customTitle"
                    placeholder="e.g. Master CSS Flexbox"
                    value={youtubeForm.customTitle}
                    onChange={(e) =>
                      setYoutubeForm({ ...youtubeForm, customTitle: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customDescription">Description / Notes (Optional)</Label>
                <Textarea
                  id="customDescription"
                  rows={3}
                  placeholder="What will students learn in this video lesson? Any tips or assignment notes..."
                  value={youtubeForm.customDescription}
                  onChange={(e) =>
                    setYoutubeForm({
                      ...youtubeForm,
                      customDescription: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddYouTubeOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Video...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add to Roadmap
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
