import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";

export const instant = false;

import { logoutAction, getCurrentUser } from "@/actions/auth";
import { getActiveAnnouncementsAction } from "@/actions/announcements";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { SyncUserSession } from "@/components/shared/sync-user-session";
import { AuthProvider } from "@/providers/auth-provider";
import { STUDENT_NAV_LINKS, ADMIN_NAV_LINKS } from "@/lib/constants";
import { SidebarLink } from "./components/sidebar-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  User,
  Zap,
  FolderKanban,
  Users,
  Mail,
  MessageSquare,
  Map,
  Bell,
  Settings,
  GraduationCap,
  Flag,
  Megaphone,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  Zap,
  FolderKanban,
  Users,
  Mail,
  MessageSquare,
  Map,
  Bell,
  Settings,
  GraduationCap,
  Flag,
  Megaphone,
};

function NavItems({
  user,
}: {
  user: { fullName: string; email: string; avatar?: string; role: string };
}) {
  return (
    <div className="flex h-full flex-col">
      {/* User Info Card */}
      <div className="p-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-xs font-semibold text-primary">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-9 w-9 rounded-xl object-cover"
              />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user.fullName}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {STUDENT_NAV_LINKS.map((link) => {
          const Icon = ICON_MAP[link.icon];
          return (
            <SidebarLink key={link.href} href={link.href}>
              {Icon && <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />}
              <span>{link.label}</span>
            </SidebarLink>
          );
        })}

        {(user.role === "admin" || user.role === "sub-admin") && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
                {user.role === "admin" ? "Admin Controls" : "Sub-Admin"}
              </p>
            </div>
            {ADMIN_NAV_LINKS.map((link) => {
              const Icon = ICON_MAP[link.icon];
              return (
                <SidebarLink key={link.href} href={link.href}>
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-amber-500" />}
                  <span>{link.label}</span>
                </SidebarLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-border/40 p-3">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const [user, announcementsRes] = await Promise.all([
    getCurrentUser(),
    getActiveAnnouncementsAction(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const initialAnnouncements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  const userForNav = {
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };

  return (
    <AuthProvider initialUser={user}>
      <SyncUserSession userId={user.id} />
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-border/40 px-5">
            <Link href="/" className="flex items-center gap-2.5 font-heading font-bold text-lg tracking-tight hover:opacity-90 transition-opacity group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#786BFA] to-[#35C6D8] shadow-[0_0_12px_-2px_rgba(120,107,250,0.5)]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-foreground">PolySkill</span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <NavItems user={userForNav} />
          </div>
        </aside>

        {/* Mobile Header + Sheet */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/40 backdrop-blur-xl px-4 lg:hidden">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-9 w-9" />
                  }
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r border-border/40 bg-card/95 backdrop-blur-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <NavItems user={userForNav} />
                </SheetContent>
              </Sheet>
              <Link href="/" className="flex items-center gap-2 font-heading font-bold text-base hover:opacity-80 transition-opacity">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#786BFA] to-[#35C6D8]">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span>PolySkill</span>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            {/* Ambient Aurora glow inside the workspace */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-b from-primary/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
            <AnnouncementBanner initialAnnouncements={initialAnnouncements} />
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
