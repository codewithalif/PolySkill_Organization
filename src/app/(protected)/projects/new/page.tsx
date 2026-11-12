"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: (typeof PROJECT_CATEGORIES)[number];
    status: (typeof PROJECT_STATUSES)[number];
    techStack: string;
    githubUrl: string;
    liveUrl: string;
    thumbnailUrl: string;
  }>({
    title: "",
    description: "",
    category: PROJECT_CATEGORIES[0],
    status: "Planning",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
    thumbnailUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const techArray = formData.techStack
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (techArray.length === 0) {
      toast.error("Please provide at least one technology in Tech Stack");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createProjectAction({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        techStack: techArray,
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
      });

      if (res.success) {
        toast.success("Project published successfully!");
        router.push("/projects");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create project");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/projects">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Projects
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Showcase your project, capstone, or assignment to the polytechnic community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g. Polytechnic Student Attendance System"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe what problem this project solves, features, and your learnings..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => {
                    if (val) setFormData({ ...formData, category: val as (typeof PROJECT_CATEGORIES)[number] });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => {
                    if (val) setFormData({ ...formData, status: val as (typeof PROJECT_STATUSES)[number] });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
              <Input
                id="techStack"
                placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository URL (Optional)</Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/username/project"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live Demo URL (Optional)</Label>
                <Input
                  id="liveUrl"
                  placeholder="https://myproject.vercel.app"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail Image URL (Optional)</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button asChild variant="outline">
                <Link href="/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Publish Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
