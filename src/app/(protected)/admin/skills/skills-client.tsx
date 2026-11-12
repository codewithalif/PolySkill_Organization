"use client";

import { useState } from "react";
import { addCatalogSkillAction, deleteCatalogSkillAction } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { PlusCircle, Trash2, Zap, Loader2 } from "lucide-react";

interface SkillsClientProps {
  initialSkills: any[];
}

export function SkillsAdminClient({ initialSkills }: SkillsClientProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof SKILL_CATEGORIES)[number]>(
    SKILL_CATEGORIES[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addCatalogSkillAction(name, category);
      if (res.success) {
        toast.success(res.message);
        setSkills((prev) => [
          ...prev,
          { id: Math.random().toString(), name: name.trim(), category },
        ]);
        setName("");
      } else {
        toast.error(res.message || "Failed to add skill");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this skill from the global catalog?")) {
      return;
    }

    setLoadingId(id);
    try {
      const res = await deleteCatalogSkillAction(id);
      if (res.success) {
        toast.success(res.message);
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills Catalog Management</h1>
        <p className="text-muted-foreground">
          Manage the standard list of technologies and skills available for students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Add Skill Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Catalog Skill</CardTitle>
            <CardDescription>
              New skills become selectable in student profiles & team requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Skill / Technology Name</Label>
                <Input
                  placeholder="e.g. Kotlin, Solidity, Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
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

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-1" />
                )}
                Add to Catalog
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Skills List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Official Catalog ({skills.length})</CardTitle>
            <CardDescription>
              All recognized skills categorized by technology domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y max-h-[550px] overflow-y-auto">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-semibold">{skill.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8"
                    disabled={loadingId === skill.id}
                    onClick={() => handleDelete(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
