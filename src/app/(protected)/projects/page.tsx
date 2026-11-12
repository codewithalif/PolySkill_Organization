import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getMyProjectsAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FolderKanban, Heart, Bookmark, ExternalLink } from "lucide-react";

export const metadata = {
  title: "My Projects | PolySkill",
  description: "Projects you have built and showcased",
};

export default async function MyProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getMyProjectsAction();
  const projects = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Showcase your polytechnic practical assignments, capstones, and personal builds.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No projects showcased yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Share what you are building, get feedback from teachers and peers, and attract team members!
              </p>
            </div>
            <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Showcase Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <Card key={proj.id} className="flex flex-col overflow-hidden">
              {proj.thumbnail_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">{proj.title}</CardTitle>
                  <Badge variant="outline">{proj.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {proj.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-1">
                  {proj.tech_stack.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                  {proj.tech_stack.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{proj.tech_stack.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-500" /> {proj.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5 text-blue-500" /> {proj.bookmark_count}
                    </span>
                  </div>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      Code <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
