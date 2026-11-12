import Link from "next/link";
import { searchStudentsAction } from "@/actions/profiles";

export const instant = false;


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, Globe } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export const metadata = {
  title: "Explore Students | PolySkill",
  description: "Connect with polytechnic students across Bangladesh",
};

export default async function ExploreStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; department?: string; institute?: string }>;
}) {
  const { query, department, institute } = await searchParams;

  const res = await searchStudentsAction(query, {
    department,
    institute,
  });

  const students = res.success && res.data ? res.data : [];

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Students</h1>
        <p className="text-muted-foreground">
          Find peers by skill, department, or polytechnic institute for collaboration and project teams.
        </p>
      </div>

      {/* Search Input */}
      <form method="GET" className="flex gap-2 max-w-lg">
        <Input
          name="query"
          placeholder="Search by student name, skill, or bio..."
          defaultValue={query || ""}
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-1" /> Search
        </Button>
      </form>

      {students.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No students found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {query
                ? `No students matched "${query}". Try searching another name or skill.`
                : "No student profiles found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student: any) => {
            const initials = student.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Card key={student.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar_url || ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {student.full_name}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      @{student.username}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{student.experience_level}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 mt-auto">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="font-medium text-foreground truncate">
                      {student.institute}
                    </div>
                    <div className="truncate">
                      {student.department} ({student.semester})
                    </div>
                  </div>

                  {student.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      "{student.bio}"
                    </p>
                  )}

                  {student.skills && student.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {student.skills.slice(0, 3).map((s: any) => (
                        <Badge key={s.name} variant="secondary" className="text-[10px]">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {student.github_url && (
                        <a
                          href={student.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground"
                          title="GitHub Profile"
                        >
                          <GithubIcon className="h-4 w-4" />
                        </a>
                      )}
                      {student.portfolio_url && (
                        <a
                          href={student.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground"
                          title="Portfolio Website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/messages`}>Message</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
