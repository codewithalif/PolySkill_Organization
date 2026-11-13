import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getAdminStatsAction, getReportsAction } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, GraduationCap, FolderKanban, Users, Flag } from "lucide-react";

export const metadata = {
  title: "Admin Panel | PolySkill",
  description: "Administrative moderation and system overview",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
    redirect("/dashboard");
  }

  const [statsRes, reportsRes] = await Promise.all([
    getAdminStatsAction(),
    getReportsAction("pending"),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : {
    totalStudents: 0,
    totalProjects: 0,
    activeTeams: 0,
    pendingReports: 0,
  };

  const reports = reportsRes.success && reportsRes.data ? reportsRes.data : [];

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "text-blue-500",
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-emerald-500",
    },
    {
      title: "Active Teams",
      value: stats.activeTeams,
      icon: Users,
      color: "text-purple-500",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: Flag,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Moderation</h1>
          <p className="text-muted-foreground">
            Platform governance, reported content, and polytechnic ecosystem analytics.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((sc) => {
          const Icon = sc.icon;
          return (
            <Card key={sc.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{sc.title}</CardTitle>
                <Icon className={`h-5 w-5 ${sc.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sc.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>
            Flagged projects, comments, and reported student accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No pending reports. All clear!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep: any) => (
                <div
                  key={rep.id}
                  className="p-3 border rounded-lg flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-semibold">{rep.target_title}</div>
                    <div className="text-xs text-muted-foreground">
                      Reason: {rep.reason} • Reported by: {rep.reporter?.full_name || "Anonymous"}
                    </div>
                  </div>
                  <Badge variant="outline">{rep.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
