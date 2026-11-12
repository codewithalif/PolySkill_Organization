import Link from "next/link";
import { getProjectsAction } from "@/actions/projects";

export const instant = false;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, ExternalLink, Search, FolderKanban } from "lucide-react";

export const metadata = {
  title: "Explore Projects | PolySkill",
  description: "Discover polytechnic innovation across Bangladesh",
};

export default async function ExploreProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;

  const res = await getProjectsAction({
    search,
    category,
    limit: 24,
  });

  const projects = res.success && res.data ? res.data.projects : [];

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
        <p className="text-muted-foreground">
          Discover assignments, prototypes, and open-source software built by polytechnic students.
        </p>
      </div>

      {/* Search / Filter Bar */}
      <form method="GET" className="flex gap-2 max-w-lg">
        <Input
          name="search"
          placeholder="Search by title, technology, or topic..."
          defaultValue={search || ""}
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-1" /> Search
        </Button>
      </form>

      {projects.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search
                ? `No projects matched "${search}". Try searching for another term.`
                : "No student projects published yet. Be the first to showcase one!"}
            </p>
            <Button asChild>
              <Link href="/projects/new">Publish a Project</Link>
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
                  <Badge variant="outline">{proj.category}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  By {proj.author?.full_name || "Student"}
                </div>
                <CardDescription className="line-clamp-2 mt-1">
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
                      +{proj.tech_stack.length - 3}
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
