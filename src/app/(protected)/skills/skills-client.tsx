"use client";

import { useState } from "react";
import {
  addStudentSkillAction,
  updateStudentSkillAction,
  deleteStudentSkillAction,
} from "@/actions/skills";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

interface SkillsClientProps {
  initialSkills: Skill[];
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    category: (typeof SKILL_CATEGORIES)[number];
    level: (typeof SKILL_LEVELS)[number];
    progress: number;
    targetDate: string;
    learningGoal: string;
  }>({
    name: "",
    category: SKILL_CATEGORIES[0],
    level: "Beginner",
    progress: 50,
    targetDate: "",
    learningGoal: "",
  });

  function openCreateDialog() {
    setEditingSkill(null);
    setFormData({
      name: "",
      category: SKILL_CATEGORIES[0],
      level: "Beginner",
      progress: 50,
      targetDate: "",
      learningGoal: "",
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(skill: Skill) {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category as (typeof SKILL_CATEGORIES)[number],
      level: skill.level as (typeof SKILL_LEVELS)[number],
      progress: skill.progress,
      targetDate: skill.targetDate || "",
      learningGoal: skill.learningGoal || "",
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingSkill) {
        const res = await updateStudentSkillAction(editingSkill.id, {
          name: formData.name,
          category: formData.category,
          level: formData.level,
          progress: formData.progress,
          targetDate: formData.targetDate || undefined,
          learningGoal: formData.learningGoal || undefined,
        });

        if (res.success) {
          setSkills((prev) =>
            prev.map((s) =>
              s.id === editingSkill.id ? { ...s, ...formData } : s
            )
          );
          toast.success("Skill updated!");
          setIsDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to update skill");
        }
      } else {
        const res = await addStudentSkillAction({
          name: formData.name,
          category: formData.category,
          level: formData.level,
          progress: formData.progress,
          targetDate: formData.targetDate || undefined,
          learningGoal: formData.learningGoal || undefined,
        });

        if (res.success && res.data) {
          setSkills((prev) => [...prev, res.data as Skill]);
          toast.success("Skill added to portfolio!");
          setIsDialogOpen(false);
        } else {
          toast.error(res.message || "Failed to add skill");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      const res = await deleteStudentSkillAction(id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        toast.success("Skill removed");
      } else {
        toast.error(res.message || "Failed to remove skill");
      }
    } catch {
      toast.error("Failed to delete skill");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">My Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your technical competencies and learning milestones.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
        >
          <PlusCircle className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg text-foreground">No skills recorded yet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add the programming languages, tools, and frameworks you know or are currently learning.
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
            >
              <PlusCircle className="h-4 w-4" /> Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card
              key={skill.id}
              className="relative group border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 rounded-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {skill.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 font-mono">
                      {skill.category}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-mono",
                      skill.level === "Advanced" || skill.level === "Expert"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : skill.level === "Intermediate"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-white/[0.04] text-muted-foreground border-white/[0.08]"
                    )}
                  >
                    {skill.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>Proficiency</span>
                    <span className="text-foreground font-medium">{skill.progress}%</span>
                  </div>
                  <Progress
                    value={skill.progress}
                    className="h-2 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400"
                  />
                </div>

                {skill.learningGoal && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg leading-relaxed">
                    &ldquo;{skill.learningGoal}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-end gap-1 pt-2.5 border-t border-white/[0.06]">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                    onClick={() => openEditDialog(skill)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(skill.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D1525]/95 border-white/[0.1] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-heading text-lg text-foreground">
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record your polytechnic technical skill and target milestones.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="skillName" className="text-xs font-medium">Skill Name</Label>
                <Input
                  id="skillName"
                  placeholder="e.g. Next.js, Python, Figma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => {
                      if (val) setFormData({ ...formData, category: val as (typeof SKILL_CATEGORIES)[number] });
                    }}
                  >
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                      {SKILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Current Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(val) => {
                      if (val) setFormData({ ...formData, level: val as (typeof SKILL_LEVELS)[number] });
                    }}
                  >
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                      {SKILL_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label className="text-xs font-medium">Proficiency</Label>
                  <span className="text-primary font-mono font-medium">{formData.progress}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
                  }
                  className="cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal" className="text-xs font-medium">Learning Goal / Note (Optional)</Label>
                <Input
                  id="learningGoal"
                  placeholder="e.g. Build 3 projects using full stack Next.js"
                  value={formData.learningGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, learningGoal: e.target.value })
                  }
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSkill ? "Update Skill" : "Add Skill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
