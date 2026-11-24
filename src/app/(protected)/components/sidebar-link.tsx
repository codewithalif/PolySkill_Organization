"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarLink({ href, children, className }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_15px_-4px_rgba(120,107,250,0.3)] font-semibold"
          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
        className
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
      )}
      {children}
    </Link>
  );
}
