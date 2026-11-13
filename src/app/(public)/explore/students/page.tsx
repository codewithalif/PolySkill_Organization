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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function getWhatsAppUrl(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits || digits.length < 10) return null;
  let cleanNumber = digits;
  if (digits.startsWith("01") && digits.length === 11) {
    cleanNumber = "88" + digits;
  }
  return `https://wa.me/${cleanNumber}`;
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
                      &ldquo;{student.bio}&rdquo;
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

                  <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {student.github_url && (
                        <a
                          href={student.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground text-muted-foreground"
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
                          className="hover:text-foreground text-muted-foreground"
                          title="Portfolio Website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button asChild size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                        <Link href={`/explore/students/${student.username}`}>See Profile</Link>
                      </Button>

                      {getWhatsAppUrl(student.whatsapp_number) ? (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <a
                            href={getWhatsAppUrl(student.whatsapp_number)!}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled
                          className="h-8 px-2.5 text-xs opacity-50 cursor-not-allowed gap-1"
                          title="WhatsApp number not added by student"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </Button>
                      )}
                    </div>
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
