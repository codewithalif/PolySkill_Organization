import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080D19] relative overflow-hidden text-foreground">
      {/* Ambient Aurora Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0D1525]/75 backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Auth content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Link href="/" className="flex items-center gap-2 mb-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-border/60 bg-card/60 shadow-[0_0_20px_rgba(120,107,250,0.4)] group-hover:scale-105 transition-transform p-1">
                <Image
                  src="/polyskill-logo.png"
                  alt="PolySkill Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground">{APP_NAME}</span>
            </Link>
          </div>
          {children}
        </div>
      </main>

      {/* Footer text */}
      <footer className="relative z-10 py-5 text-center text-xs text-muted-foreground font-mono border-t border-white/[0.04]">
        © 2026 {APP_NAME}. Built for polytechnic students in Bangladesh.
      </footer>
    </div>
  );
}
