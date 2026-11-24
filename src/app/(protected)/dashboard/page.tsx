import { redirect } from "next/navigation";
import Link from "next/link";

export const instant = false;

import { getCurrentUser } from "@/actions/auth";
import { getStudentSkillsAction } from "@/actions/skills";
import { getMyProjectsAction } from "@/actions/projects";
import { getMyTeamsAction } from "@/actions/teams";
import { getActiveAnnouncementsAction } from "@/actions/announcements";
import { DashboardAnnouncements } from "@/components/shared/dashboard-announcements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  FolderKanban,
  Users,
  Search,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | PolySkill",
  description: "Your polytechnic learning and collaboration hub",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch real data in parallel
  const [skillsRes, projectsRes, teamsRes, announcementsRes] = await Promise.all([
    getStudentSkillsAction(user.id),
    getMyProjectsAction(),
    getMyTeamsAction(),
    getActiveAnnouncementsAction(),
  ]);

  const skills = skillsRes.success && skillsRes.data ? skillsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];
  const teams = teamsRes.success && teamsRes.data ? teamsRes.data : [];
  const announcements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  const stats = [
    {
      title: "My Skills",
      value: skills.length,
      description: "Recorded in portfolio",
      icon: Zap,
      href: "/skills",
      color: "text-amber-500",
    },
    {
      title: "Projects",
      value: projects.length,
      description: "Created or contributed",
      icon: FolderKanban,
      href: "/projects",
      color: "text-blue-500",
    },
    {
      title: "Active Teams",
      value: teams.length,
      description: "Collaborations",
      icon: Users,
      href: "/teams",
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none -z-10" />
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            স্বাগতম, {user.fullName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground/90">{user.institute}</span>
            <span>•</span>
            <span>{user.department}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-mono">
              {user.semester}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-border/70 hover:bg-card/70 text-xs">
            <Link href="/teams">
              <Search className="mr-1.5 h-3.5 w-3.5 text-cyan-400" /> Find Team
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-xs text-white shadow-[0_0_15px_-3px_rgba(120,107,250,0.4)]">
            <Link href="/projects/new">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-sm text-foreground">Profile Completion</span>
              <Badge variant="secondary" className="font-mono text-xs bg-primary/15 text-primary border border-primary/30">
                {user.profileCompletion}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete your profile by adding your bio, GitHub, and social links to stand out to project teams.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs shrink-0 border-border/70">
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>
        <Progress value={user.profileCompletion} className="mt-4 h-2 rounded-full bg-muted/40" />
      </div>

      {/* Announcements */}
      <DashboardAnnouncements initialAnnouncements={announcements} />

      {/* Stats Cards Grid (Bento) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:-translate-y-1 hover:shadow-[0_8px_25px_-8px_rgba(120,107,250,0.2)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/60 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/30">
                <Button asChild variant="link" className="p-0 h-auto text-xs text-primary hover:text-primary/80">
                  <Link href={stat.href} className="flex items-center gap-1 font-medium">
                    View details <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Overview (Bento) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Skills */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">My Top Skills</h2>
              <p className="text-xs text-muted-foreground">Skills you are currently developing</p>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs text-primary hover:text-primary/80">
              <Link href="/skills">+ Add Skill</Link>
            </Button>
          </div>
          <div>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No skills added yet. Start by tracking your first skill!
              </div>
            ) : (
              <div className="space-y-4">
                {skills.slice(0, 4).map((skill) => (
                  <div key={skill.id} className="space-y-1.5 p-2.5 rounded-xl bg-card/40 border border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{skill.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {skill.level} • {skill.progress}%
                      </span>
                    </div>
                    <Progress value={skill.progress} className="h-1.5 bg-muted/40" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Collaborations / Teams */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">My Collaborations</h2>
              <p className="text-xs text-muted-foreground">Active teams and projects you belong to</p>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs text-cyan-400 hover:text-cyan-300">
              <Link href="/teams">View Teams</Link>
            </Button>
          </div>
          <div>
            {teams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No teams joined yet. Explore teams or start your own!
              </div>
            ) : (
              <div className="space-y-3">
                {teams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card/60 hover:border-primary/30 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-heading font-semibold text-xs sm:text-sm text-foreground">
                        {team.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {team.description ? team.description.slice(0, 50) + "..." : "Team collaboration"}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-lg text-xs h-8 px-3 border-border/60">
                      <Link href="/teams">Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
