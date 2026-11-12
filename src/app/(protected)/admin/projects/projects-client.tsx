"use client";

import { useState } from "react";
import { deleteProjectAsAdminAction } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface ProjectsClientProps {
  initialProjects: any[];
}

export function ProjectsAdminClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(projectId: string) {
    if (!confirm("Are you sure you want to permanently delete this project?")) {
      return;
    }

    setLoadingId(projectId);
    try {
      const res = await deleteProjectAsAdminAction(projectId);
      if (res.success) {
        toast.success(res.message);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        toast.error(res.message || "Failed to delete project");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Moderation</h1>
          <p className="text-muted-foreground">
            Review, moderate, or remove projects violating community guidelines.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects or authors..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Projects ({filtered.length})</CardTitle>
          <CardDescription>
            Admin moderation allows removing inappropriate or plagiarized submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No projects found.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((proj) => {
                const isLoading = loadingId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{proj.title}</span>
                        <Badge variant="outline">{proj.category}</Badge>
                        <Badge variant="secondary">{proj.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                        {proj.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Author: {proj.author?.full_name || "Unknown"} ({proj.author?.email})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.live_url && (
                        <Button asChild size="sm" variant="ghost">
                          <a href={proj.live_url} target="_blank" rel="noreferrer">
                            Demo <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => handleDelete(proj.id)}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete Project
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
