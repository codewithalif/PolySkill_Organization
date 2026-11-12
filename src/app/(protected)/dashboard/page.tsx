import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getStudentSkillsAction } from "@/actions/skills";
import { getMyProjectsAction } from "@/actions/projects";
import { getMyTeamsAction } from "@/actions/teams";
import { getMyInvitationsAction } from "@/actions/invitations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  FolderKanban,
  Users,
  Mail,
  ArrowRight,
  PlusCircle,
  Search,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | PolySkill",
  description: "Your polytechnic learning and collaboration hub",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch real data in parallel
  const [skillsRes, projectsRes, teamsRes, invitationsRes] = await Promise.all([
    getStudentSkillsAction(user.id),
    getMyProjectsAction(),
    getMyTeamsAction(),
    getMyInvitationsAction(),
  ]);

  const skills = skillsRes.success && skillsRes.data ? skillsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];
  const teams = teamsRes.success && teamsRes.data ? teamsRes.data : [];
  const invitations = invitationsRes.success && invitationsRes.data ? invitationsRes.data : [];

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
    {
      title: "Invitations",
      value: invitations.length,
      description: "Pending requests",
      icon: Mail,
      href: "/invitations",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            স্বাগতম, {user.fullName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {user.institute} • {user.department} ({user.semester})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/teams">
              <Search className="mr-2 h-4 w-4" /> Find Team
            </Link>
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Profile Completion</span>
                <Badge variant="secondary">{user.profileCompletion}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Complete your profile by adding your bio, GitHub, and social links to stand out to project teams.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </div>
          <Progress value={user.profileCompletion} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-3 text-xs">
                  <Link href={stat.href} className="flex items-center gap-1">
                    View details <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two-Column Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Top Skills</CardTitle>
              <CardDescription>Skills you are currently developing</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/skills">Add Skill</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No skills added yet. Start by tracking your first skill!
              </div>
            ) : (
              <div className="space-y-4">
                {skills.slice(0, 4).map((skill) => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {skill.level} • {skill.progress}%
                      </span>
                    </div>
                    <Progress value={skill.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations or Teams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Invitations</CardTitle>
              <CardDescription>Collaboration requests from peers</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/invitations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No pending invitations. Explore teams and apply!
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {inv.team?.name || "Team Project"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Invited by {inv.from_user?.full_name || "a peer"}
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/invitations">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
