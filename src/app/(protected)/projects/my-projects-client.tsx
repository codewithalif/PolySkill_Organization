"use client";

import { useState } from "react";
import Link from "next/link";
import { updateProjectAction, deleteProjectAction, type ProjectWithMeta } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import {
  FolderKanban,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Code2,
  Globe,
  Heart,
  Bookmark,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
} from "lucide-react";

interface MyProjectsClientProps {
  initialProjects: ProjectWithMeta[];
}

export function MyProjectsClient({ initialProjects }: MyProjectsClientProps) {
  const [projects, setProjects] = useState<ProjectWithMeta[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Editing state
  const [editingProject, setEditingProject] = useState<ProjectWithMeta | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Deleting state
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithMeta | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form data
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "Planning",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
    thumbnailUrl: "",
  });

  // Filter projects by search and status
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tech_stack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "all" || proj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (project: ProjectWithMeta) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      category: project.category || PROJECT_CATEGORIES[0],
      status: project.status,
      techStack: project.tech_stack ? project.tech_stack.join(", ") : "",
      githubUrl: project.github_url || "",
      liveUrl: project.live_url || "",
      thumbnailUrl: project.thumbnail_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const techArray = editForm.techStack
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (techArray.length === 0) {
      toast.error("Please provide at least one technology in Tech Stack");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProjectAction(editingProject.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category as any,
        status: editForm.status as any,
        techStack: techArray,
        githubUrl: editForm.githubUrl.trim() || undefined,
        liveUrl: editForm.liveUrl.trim() || undefined,
        thumbnailUrl: editForm.thumbnailUrl.trim() || undefined,
      });

      if (res.success) {
        toast.success("Project updated successfully!");
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? {
                  ...p,
                  title: editForm.title.trim(),
                  description: editForm.description.trim(),
                  category: editForm.category,
                  status: editForm.status as any,
                  tech_stack: techArray,
                  github_url: editForm.githubUrl.trim() || null,
                  live_url: editForm.liveUrl.trim() || null,
                  thumbnail_url: editForm.thumbnailUrl.trim() || null,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );
        setIsEditDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to update project");
      }
    } catch {
      toast.error("An error occurred while saving changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteProjectAction(projectToDelete.id);
      if (res.success) {
        toast.success("Project deleted successfully");
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to delete project");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(66,214,164,0.15)]">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono text-[10px] flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        );
      case "Planning":
        return (
          <Badge variant="outline" className="bg-white/[0.04] text-muted-foreground border-white/[0.08] font-mono text-[10px] flex items-center gap-1">
            <Layers className="h-3 w-3" /> Planning
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-mono text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your published projects, edit details anytime, and showcase your builds to peers.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]">
          <Link href="/projects/new">
            <PlusCircle className="h-4 w-4" /> Create New Project
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111B2E]/70 border border-white/[0.08] backdrop-blur-md p-3 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, stack, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white/[0.04] border-white/[0.08] focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground hidden sm:inline font-mono">Status:</span>
            <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
              <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs bg-white/[0.04] border-white/[0.08] text-foreground">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                <SelectItem value="all">All Status</SelectItem>
                {PROJECT_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-primary">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-xl text-foreground">No projects created yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Share your semester lab assignments, capstone projects, or hobby experiments with other polytechnic students!
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(120,107,250,0.4)]">
              <Link href="/projects/new">
                <PlusCircle className="h-4 w-4" /> Publish Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12 border-white/[0.08] bg-[#111B2E]/40 backdrop-blur-md rounded-xl">
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">No projects match your search criteria.</p>
            <Button variant="ghost" size="sm" className="text-xs hover:bg-white/[0.05]" onClick={() => { setSearchQuery(""); setSelectedStatus("all"); }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Rich Project Details Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => (
            <Card
              key={proj.id}
              className="group flex flex-col overflow-hidden border border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
            >
              {/* Project Thumbnail or Decorative Banner */}
              {proj.thumbnail_url ? (
                <div className="relative aspect-video w-full overflow-hidden bg-[#0D1525]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    {getStatusBadge(proj.status)}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-gradient-to-br from-primary/15 via-[#111B2E] to-[#18243A] flex flex-col justify-between p-4 border-b border-white/[0.06]">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="font-mono text-xs border-white/[0.08] bg-white/[0.04] text-muted-foreground">
                      {proj.category || "Project"}
                    </Badge>
                    {getStatusBadge(proj.status)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Code2 className="h-7 w-7 text-primary/70" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 font-mono">
                      Engineering Project
                    </span>
                  </div>
                </div>
              )}

              {/* Project Information */}
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[11px] font-mono text-primary border-primary/25 bg-primary/5">
                    {proj.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Calendar className="h-3 w-3" />
                    {new Date(proj.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <CardTitle className="font-heading text-lg font-bold leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                  {proj.title}
                </CardTitle>

                <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {proj.description}
                </CardDescription>
              </CardHeader>

              {/* Tech Stack & Links */}
              <CardContent className="space-y-4 mt-auto pt-0">
                {/* Tech Stack Tags */}
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-medium text-muted-foreground block">
                      Technologies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech_stack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-[11px] font-mono px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] text-secondary-foreground"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Action Links (Live Demo / Code) */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] text-xs">
                  {proj.live_url && (
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs flex-1 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08]">
                      <a href={proj.live_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Live Preview</span>
                        <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                      </a>
                    </Button>
                  )}

                  {proj.github_url && (
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs flex-1 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08]">
                      <a href={proj.github_url} target="_blank" rel="noopener noreferrer">
                        <Code2 className="h-3.5 w-3.5 text-primary" />
                        <span>Source Code</span>
                        <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Footer Controls: Stats & Edit/Delete Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1 font-medium" title="Likes">
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                      {proj.like_count}
                    </span>
                    <span className="flex items-center gap-1 font-medium" title="Bookmarks">
                      <Bookmark className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" />
                      {proj.bookmark_count}
                    </span>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs gap-1 border-white/[0.08] bg-white/[0.02] hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      onClick={() => openEditModal(proj)}
                      title="Edit Project"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => {
                        setProjectToDelete(proj);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Project Modal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0D1525]/95 border-white/[0.1] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleUpdateProject}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-xl text-foreground">Edit Project</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Update details, tech stack, and links for &quot;{editingProject?.title}&quot;.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-medium">Project Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. IoT Based Smart Water Tank Controller"
                  required
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category" className="text-xs font-medium">Category *</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(val) => setEditForm({ ...editForm, category: val || "" })}
                  >
                    <SelectTrigger id="edit-category" className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                      {PROJECT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-medium">Status *</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(val) => setEditForm({ ...editForm, status: val || "Planning" })}
                  >
                    <SelectTrigger id="edit-status" className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                      {PROJECT_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-techStack" className="text-xs font-medium">Tech Stack (comma-separated) *</Label>
                <Input
                  id="edit-techStack"
                  value={editForm.techStack}
                  onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                  placeholder="e.g. Arduino, C++, ESP8266, React, Node.js"
                  required
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
                />
                <p className="text-[11px] text-muted-foreground font-mono">
                  Separate tools or languages with commas.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-medium">Project Description *</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Describe your project, problems it solves, features, and how it works..."
                  required
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs leading-relaxed"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-githubUrl" className="text-xs font-medium">GitHub Repository Link</Label>
                  <Input
                    id="edit-githubUrl"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/your-username/project-repo"
                    className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-liveUrl" className="text-xs font-medium">Live Demo URL</Label>
                  <Input
                    id="edit-liveUrl"
                    value={editForm.liveUrl}
                    onChange={(e) => setEditForm({ ...editForm, liveUrl: e.target.value })}
                    placeholder="https://my-project-demo.com"
                    className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-thumbnailUrl" className="text-xs font-medium">Project Banner / Thumbnail Image URL</Label>
                <Input
                  id="edit-thumbnailUrl"
                  value={editForm.thumbnailUrl}
                  onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
                className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D1525]/95 border-white/[0.1] backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2 font-heading">
              <Trash2 className="h-5 w-5" /> Delete Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete &quot;{projectToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>Delete Project</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
