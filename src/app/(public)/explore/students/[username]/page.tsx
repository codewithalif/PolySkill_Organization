import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfileAction } from "@/actions/profiles";
import { getStudentSkillsAction } from "@/actions/skills";
import { getUserProjectsAction } from "@/actions/projects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Globe,
  ExternalLink,
  Layers,
} from "lucide-react";

export const instant = false;

interface StudentProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: StudentProfilePageProps) {
  const { username } = await params;
  const res = await getPublicProfileAction(username);
  if (!res.success || !res.data) {
    return { title: "Student Not Found | PolySkill" };
  }
  return {
    title: `${res.data.full_name} (@${res.data.username}) | PolySkill`,
    description: res.data.bio || `Polytechnic student profile of ${res.data.full_name} on PolySkill.`,
  };
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

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
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

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { username } = await params;

  const profileRes = await getPublicProfileAction(username);
  if (!profileRes.success || !profileRes.data) {
    notFound();
  }

  const student = profileRes.data;

  // Concurrently fetch skills and projects for this student
  const [skillsRes, projectsRes] = await Promise.all([
    getStudentSkillsAction(student.id),
    getUserProjectsAction(student.id),
  ]);

  const skills = skillsRes.success && skillsRes.data ? skillsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];

  const initials = student.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const waUrl = getWhatsAppUrl(student.whatsapp_number);

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Back Button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/explore/students">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Students</span>
          </Link>
        </Button>
      </div>

      {/* Main Profile Header Card */}
      <Card className="relative overflow-hidden border-border/60 shadow-sm">
        {/* Decorative Top Accent Bar */}
        <div className="h-3 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600" />

        <CardContent className="pt-8 pb-6 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Student Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md">
                <AvatarImage src={student.avatar_url || ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {student.full_name}
                  </h1>
                  <Badge variant="outline" className="text-xs">
                    {student.experience_level}
                  </Badge>
                  {student.role === "admin" && (
                    <Badge variant="default" className="bg-purple-600 text-xs">
                      Admin
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground font-mono">
                  @{student.username}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {student.institute}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {student.department} ({student.semester})
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Button */}
            <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
              {waUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
                >
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="h-4 w-4 fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled
                  className="w-full sm:w-auto opacity-50 cursor-not-allowed gap-2"
                  title="WhatsApp number not added by student"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  <span>No WhatsApp</span>
                </Button>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {student.github_url && (
                  <Button asChild size="icon" variant="outline" className="h-9 w-9">
                    <a
                      href={student.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {student.portfolio_url && (
                  <Button asChild size="icon" variant="outline" className="h-9 w-9">
                    <a
                      href={student.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfolio Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {student.linkedin_url && (
                  <Button asChild size="icon" variant="outline" className="h-9 w-9">
                    <a
                      href={student.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn Profile"
                    >
                      <LinkedInIcon className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio / About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {student.bio || "No biography provided yet."}
          </p>
        </CardContent>
      </Card>

      {/* Skills Showcase */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Technical Skills</CardTitle>
            <CardDescription className="text-xs">
              Technologies and tools this student works with
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {skills.length} Skills
          </Badge>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No technical skills listed yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 border rounded-lg bg-card/50 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{skill.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {skill.level}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${skill.progress || 60}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Showcase */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Projects Showcase</CardTitle>
            <CardDescription className="text-xs">
              Projects created and shared by {student.full_name}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {projects.length} Projects
          </Badge>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground space-y-2">
              <Layers className="h-8 w-8 mx-auto opacity-40" />
              <p>No projects published yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col justify-between border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {project.category}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 truncate">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 mt-auto space-y-3">
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[10px]">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Source Code"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                        )}
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Live Demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
