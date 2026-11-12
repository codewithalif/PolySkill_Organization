"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  User as UserIcon,
  FolderKanban,
  Zap,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { t } = useLanguage();

  const getNavLabel = (href: string, defaultLabel: string) => {
    switch (href) {
      case "/":
        return t("nav.home", defaultLabel);
      case "/about":
        return t("nav.about", defaultLabel);
      case "/explore/projects":
        return t("nav.exploreProjects", defaultLabel);
      case "/explore/students":
        return t("nav.exploreStudents", defaultLabel);
      case "/roadmaps":
        return t("nav.roadmaps", defaultLabel);
      default:
        return defaultLabel;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "PS";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {getNavLabel(link.href, link.label)}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t("nav.dashboard", "Dashboard")}
            </Link>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />

          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0 flex items-center justify-center outline-none cursor-pointer">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5">
                      <DropdownMenuLabel className="font-normal px-2 py-1.5">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                          <p className="text-[11px] text-primary pt-0.5">{user.department}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        render={<Link href="/dashboard" className="flex items-center gap-2 cursor-pointer w-full" />}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t("nav.dashboard", "Dashboard")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={<Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full" />}
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>{t("nav.profile", "My Profile")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={<Link href="/skills" className="flex items-center gap-2 cursor-pointer w-full" />}
                      >
                        <Zap className="h-4 w-4" />
                        <span>{t("nav.mySkills", "My Skills")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={<Link href="/projects" className="flex items-center gap-2 cursor-pointer w-full" />}
                      >
                        <FolderKanban className="h-4 w-4" />
                        <span>{t("nav.myProjects", "My Projects")}</span>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          render={
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 cursor-pointer w-full text-amber-600 dark:text-amber-400"
                            />
                          }
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>{t("nav.adminPanel", "Admin Panel")}</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        render={<Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full" />}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t("nav.settings", "Settings")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>{t("nav.signOut", "Log Out")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t("nav.signIn", "Log in")}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">{t("nav.register", "Join PolySkill")}</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {getNavLabel(link.href, link.label)}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex flex-col gap-1 pt-3 border-t mt-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  {t("nav.dashboard", "Dashboard")}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  {t("nav.profile", "My Profile")}
                </Link>
                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  {t("nav.myProjects", "My Projects")}
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium rounded-md text-amber-600 dark:text-amber-400 hover:bg-accent"
                  >
                    {t("nav.adminPanel", "Admin Panel")}
                  </Link>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  {t("nav.signOut", "Log Out")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-3 border-t mt-3">
                <Button variant="ghost" size="sm" asChild className="w-full justify-center">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    {t("nav.signIn", "Log in")}
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full justify-center">
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.register", "Join PolySkill")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
