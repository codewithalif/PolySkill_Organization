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
          <h1 className="text-3xl font-bold tracking-tight">My Skills</h1>
          <p className="text-muted-foreground">
            Track your technical competencies and learning milestones.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No skills recorded yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add the programming languages, tools, and frameworks you know or are currently learning.
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{skill.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {skill.category}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{skill.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Proficiency</span>
                    <span>{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>

                {skill.learningGoal && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    "{skill.learningGoal}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-1 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(skill)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
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
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
              <DialogDescription>
                Record your polytechnic technical skill and target milestones.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="skillName">Skill Name</Label>
                <Input
                  id="skillName"
                  placeholder="e.g. Next.js, Python, Figma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => {
                      if (val) setFormData({ ...formData, category: val as (typeof SKILL_CATEGORIES)[number] });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(val) => {
                      if (val) setFormData({ ...formData, level: val as (typeof SKILL_LEVELS)[number] });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="flex justify-between text-sm">
                  <Label>Proficiency</Label>
                  <span className="text-muted-foreground">{formData.progress}%</span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
                  }
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal">Learning Goal / Note (Optional)</Label>
                <Input
                  id="learningGoal"
                  placeholder="e.g. Build 3 projects using full stack Next.js"
                  value={formData.learningGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, learningGoal: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
