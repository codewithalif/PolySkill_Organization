import type { Metadata } from "next";
import Link from "next/link";
import { getProjectsAction } from "@/actions/projects";

export const instant = false;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, ExternalLink, Search, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Polytechnic Student Projects",
  description:
    "Browse innovative assignments, software prototypes, engineering solutions, and open-source projects built by polytechnic diploma students across Bangladesh.",
  alternates: {
    canonical: "/explore/projects",
  },
  openGraph: {
    title: "Explore Polytechnic Student Projects | PolySkill",
    description:
      "Browse innovative assignments, software prototypes, engineering solutions, and open-source projects built by polytechnic diploma students across Bangladesh.",
    url: "/explore/projects",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Polytechnic Student Projects | PolySkill",
    description:
      "Browse innovative assignments, software prototypes, engineering solutions, and open-source projects built by polytechnic diploma students across Bangladesh.",
  },
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
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Explore Projects</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover assignments, prototypes, and open-source software built by polytechnic students.
        </p>
      </div>

      {/* Search / Filter Bar */}
      <form method="GET" className="flex gap-2 max-w-lg">
        <Input
          name="search"
          placeholder="Search by title, technology, or topic..."
          defaultValue={search || ""}
          className="bg-white/[0.04] border-white/[0.08] focus:border-primary/50 text-foreground text-xs h-10 rounded-xl"
        />
        <Button type="submit" className="h-10 px-4 bg-primary hover:bg-primary/90 text-white shadow-[0_0_14px_rgba(120,107,250,0.4)] rounded-xl text-xs">
          <Search className="h-4 w-4 mr-1.5" /> Search
        </Button>
      </form>

      {projects.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-4 max-w-sm mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
              <FolderKanban className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {search
                ? `No projects matched "${search}". Try searching for another term.`
                : "No student projects published yet. Be the first to showcase one!"}
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs">
              <Link href="/projects/new">Publish a Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <Card key={proj.id} className="group flex flex-col overflow-hidden border border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
              {proj.thumbnail_url ? (
                <div className="aspect-video w-full overflow-hidden bg-[#0D1525]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-primary/15 via-[#111B2E] to-[#18243A] flex items-center justify-center border-b border-white/[0.06]">
                  <FolderKanban className="h-10 w-10 text-primary/40" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-heading text-lg font-semibold line-clamp-1 text-foreground group-hover:text-primary transition-colors">{proj.title}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/25 bg-primary/5 shrink-0">{proj.category}</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  By {proj.author?.full_name || "Student"}
                </div>
                <CardDescription className="line-clamp-2 mt-1 text-xs text-muted-foreground leading-relaxed">
                  {proj.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {proj.tech_stack.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-secondary-foreground">
                      {t}
                    </Badge>
                  ))}
                  {proj.tech_stack.length > 3 && (
                    <span className="text-[10px] font-mono text-muted-foreground self-center">
                      +{proj.tech_stack.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" /> {proj.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" /> {proj.bookmark_count}
                    </span>
                  </div>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary flex items-center gap-1 transition-colors"
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
