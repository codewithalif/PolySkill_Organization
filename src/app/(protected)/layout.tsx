import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { logoutAction } from "@/actions/auth";
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
      {/* User Info */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {STUDENT_NAV_LINKS.map((link) => {
          const Icon = ICON_MAP[link.icon];
          return (
            <SidebarLink key={link.href} href={link.href}>
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {link.label}
            </SidebarLink>
          );
        })}

        {(user.role === "admin" || user.role === "sub-admin") && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {user.role === "admin" ? "Admin" : "Sub-Admin"}
              </p>
            </div>
            {ADMIN_NAV_LINKS.map((link) => {
              const Icon = ICON_MAP[link.icon];
              return (
                <SidebarLink key={link.href} href={link.href}>
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {link.label}
                </SidebarLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
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
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userForNav = {
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-heading font-semibold hover:opacity-80 transition-opacity">
              <Zap className="h-5 w-5 text-primary" />
              PolySkill
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <NavItems user={userForNav} />
          </div>
        </aside>

        {/* Mobile Header + Sheet */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center border-b px-4 lg:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="mr-2" />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <NavItems user={userForNav} />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-heading font-semibold hover:opacity-80 transition-opacity">
              <Zap className="h-5 w-5 text-primary" />
              PolySkill
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
