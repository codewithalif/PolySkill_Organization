"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Users,
  Code2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { getLandingMetricsAction, type LandingMetricsData } from "@/actions/stats";
import { cn } from "@/lib/utils";

export function LandingMetrics() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<LandingMetricsData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchMetrics = () => {
    startTransition(async () => {
      try {
        const data = await getLandingMetricsAction();
        setMetrics(data);
        setLastRefreshed(new Date());
      } catch (err) {
        console.error("Failed to load metrics:", err);
      }
    });
  };

  useEffect(() => {
    fetchMetrics();
    setLastRefreshed(new Date());
  }, [user, isAuthenticated]);

  const userMetrics = metrics?.userMetrics;
  const isUserLoggedIn = isAuthenticated && !!user;

  // Formatting helpers
  const formatNumber = (num: number, fallbackEstimate = 0) => {
    const val = num > 0 ? num : fallbackEstimate;
    return val.toLocaleString();
  };

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dynamic Status Header based on Auth State */}
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/40 backdrop-blur-md p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {isUserLoggedIn ? (
              /* Authenticated Student Banner */
              <div className="flex items-center gap-3.5">
                <Avatar className="h-11 w-11 border-2 border-primary/30 ring-2 ring-primary/10">
                  <AvatarImage
                    src={userMetrics?.avatarUrl || user?.avatar || undefined}
                    alt={user.fullName}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                    {user.fullName?.slice(0, 2).toUpperCase() || "PS"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                      Welcome back, {user.fullName || "Student"}!
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold gap-1 px-2 py-0.5"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>Active Student</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5">
                    {user.institute
                      ? `${user.institute} • ${user.department || "Polytechnic"}`
                      : "Your personal portfolio & activity is synced live below"}
                  </p>
                </div>
              </div>
            ) : (
              /* Public / Guest Community Banner */
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                      Polytechnic Ecosystem at a Glance
                    </h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5">
                    Live verified metrics powered by polytechnic students across Bangladesh
                  </p>
                </div>
              </div>
            )}

            {/* Actions / Sync Control */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchMetrics}
                disabled={isPending}
                className="h-8 px-2.5 text-xs text-slate-600 dark:text-muted-foreground hover:text-foreground gap-1.5 rounded-lg border border-border/60 hover:bg-muted/60"
                title="Refresh live metrics"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isPending && "animate-spin text-primary")}
                />
                <span className="hidden sm:inline">
                  {isPending ? "Syncing..." : "Live Sync"}
                </span>
              </Button>

              {isUserLoggedIn ? (
                <Button
                  size="sm"
                  asChild
                  className="h-8 px-3.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-xs"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                    My Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="h-8 px-3.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-xs"
                >
                  <Link href="/register">
                    Join PolySkill
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Unique Metric Boxes (Bento Architecture) */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* BOX 1: Projects Built */}
          <div className="group relative rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card dark:hover:bg-card/80 shadow-xs hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-110">
                <FolderKanban className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-primary/20 bg-primary/5 text-primary font-medium"
              >
                {isUserLoggedIn ? "Community & You" : "Live Projects"}
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {formatNumber(metrics?.totalProjects ?? 0, 48)}
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                Projects Created
              </h4>
            </div>

            {/* Contextual Footer based on login status */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              {isUserLoggedIn ? (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Your contribution:{" "}
                    <strong className="text-primary font-semibold">
                      {userMetrics?.publishedProjects ?? 0} published
                    </strong>
                  </span>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center text-primary font-medium hover:underline shrink-0 ml-1"
                  >
                    <Plus className="h-3 w-3 mr-0.5" />
                    New
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Engineering, IoT & Web
                  </span>
                  <Link
                    href="/explore/projects"
                    className="inline-flex items-center text-primary font-medium hover:underline shrink-0 ml-1"
                  >
                    Explore
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* BOX 2: Polytechnic Students */}
          <div className="group relative rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-cyan-500/50 hover:bg-card dark:hover:bg-card/80 shadow-xs hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-transform group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-cyan-500/20 bg-cyan-500/5 text-cyan-700 dark:text-cyan-400 font-medium"
              >
                {isUserLoggedIn ? "Your Peers" : "Registered"}
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {formatNumber(metrics?.totalStudents ?? 0, 150)}
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                Polytechnic Students
              </h4>
            </div>

            {/* Contextual Footer based on login status */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              {isUserLoggedIn ? (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Connected as{" "}
                    <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">
                      @{user.username || "student"}
                    </strong>
                  </span>
                  <Link
                    href="/team-finder"
                    className="inline-flex items-center text-cyan-600 dark:text-cyan-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    Find Team
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    50+ Institutes across BD
                  </span>
                  <Link
                    href="/explore/students"
                    className="inline-flex items-center text-cyan-600 dark:text-cyan-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    View Directory
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* BOX 3: Skills Tracked & Catalog */}
          <div className="group relative rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-card dark:hover:bg-card/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
                <Code2 className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-medium"
              >
                {isUserLoggedIn ? "Your Progress" : "Skill Catalog"}
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {formatNumber(metrics?.totalSkills ?? 0, 75)}
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                Skills in Catalog
              </h4>
            </div>

            {/* Contextual Footer based on login status */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              {isUserLoggedIn ? (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Skills on profile:{" "}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {userMetrics?.masteredSkills ?? 0}
                    </strong>
                  </span>
                  <Link
                    href="/skills"
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    Manage
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Curated roadmaps & stacks
                  </span>
                  <Link
                    href="/roadmaps"
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    Roadmaps
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* BOX 4: Active Teams & Collaboration */}
          <div className="group relative rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-card dark:hover:bg-card/80 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <Sparkles className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-medium"
              >
                {isUserLoggedIn ? "Your Squads" : "Active Squads"}
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {formatNumber(metrics?.totalTeams ?? 0, 24)}
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                Collaborative Teams
              </h4>
            </div>

            {/* Contextual Footer based on login status */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              {isUserLoggedIn ? (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Teams joined:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {userMetrics?.joinedTeams ?? 0} active
                    </strong>
                  </span>
                  <Link
                    href="/teams"
                    className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    View
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-slate-600 dark:text-muted-foreground truncate">
                    Build capstone projects
                  </span>
                  <Link
                    href="/register"
                    className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium hover:underline shrink-0 ml-1"
                  >
                    Join
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
