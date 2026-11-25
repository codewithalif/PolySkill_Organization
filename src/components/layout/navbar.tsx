"use client";

import Image from "next/image";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-all">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-border/60 bg-card/60 shadow-[0_0_16px_-2px_rgba(120,107,250,0.35)] transition-transform group-hover:scale-105 p-1">
            <Image
              src="/polyskill-logo.png"
              alt="PolySkill Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1.5 md:flex p-1 rounded-full border border-border/50 bg-card/40 backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                pathname === link.href
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_-3px_rgba(120,107,250,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              {getNavLabel(link.href, link.label)}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                pathname === "/dashboard"
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_-3px_rgba(120,107,250,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
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
                    <DropdownMenuTrigger className="relative h-9 w-9 rounded-full ring-2 ring-primary/30 hover:ring-primary/60 transition-all p-0 flex items-center justify-center outline-none cursor-pointer">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 glass-panel-elevated">
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
                      {(user.role === "admin" || user.role === "sub-admin") && (
                        <DropdownMenuItem
                          render={
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 cursor-pointer w-full text-amber-500"
                            />
                          }
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>
                            {user.role === "admin"
                              ? t("nav.adminPanel", "Admin Panel")
                              : "Sub-Admin Panel"}
                          </span>
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
                <div className="hidden items-center gap-2 sm:flex" data-auth-exempt="true">
                  <Button variant="ghost" size="sm" asChild className="rounded-full text-xs" data-auth-exempt="true">
                    <Link href="/login" data-auth-exempt="true">{t("nav.signIn", "Log in")}</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-full text-xs bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-90 shadow-[0_0_15px_-3px_rgba(120,107,250,0.4)]" data-auth-exempt="true">
                    <Link href="/register" data-auth-exempt="true">{t("nav.register", "Join PolySkill")}</Link>
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
            data-auth-exempt="true"
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
        <div className="border-t border-border/40 md:hidden glass-panel px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {getNavLabel(link.href, link.label)}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.06] mt-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.04] text-foreground"
              >
                {t("nav.dashboard", "Dashboard")}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
              >
                {t("nav.profile", "My Profile")}
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
              >
                {t("nav.myProjects", "My Projects")}
              </Link>
              {(user?.role === "admin" || user?.role === "sub-admin") && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-lg text-amber-400 hover:bg-white/[0.04]"
                >
                  {user?.role === "admin"
                    ? t("nav.adminPanel", "Admin Panel")
                    : "Sub-Admin Panel"}
                </Link>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="mt-2 text-xs bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                {t("nav.signOut", "Log Out")}
              </Button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild className="w-full border-white/[0.1] bg-white/[0.02]">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {t("nav.signIn", "Log in")}
                </Link>
              </Button>
              <Button size="sm" asChild className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_14px_rgba(120,107,250,0.4)]">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  {t("nav.register", "Join PolySkill")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
