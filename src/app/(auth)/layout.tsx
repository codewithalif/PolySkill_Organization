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
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
            </Link>
          </div>
          {children}
        </div>
      </main>

      {/* Footer text */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2026 {APP_NAME}. Built for polytechnic students in Bangladesh.
      </footer>
    </div>
  );
}
