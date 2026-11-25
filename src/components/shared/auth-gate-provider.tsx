"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type FormEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  ArrowRight,
  UserPlus,
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FolderKanban,
  Users,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { loginAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

interface AuthGateContextType {
  openAuthModal: (reason?: string, redirectPath?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  requireAuth: (actionName?: string, redirectPath?: string) => boolean;
}

const AuthGateContext = createContext<AuthGateContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthModalOpen: false,
  requireAuth: () => false,
});

export function useAuthGate() {
  return useContext(AuthGateContext);
}

function isProtectedTarget(href: string): boolean {
  if (!href) return false;
  const clean = href.split("?")[0].split("#")[0];

  // Landing page, About section, and standard auth routes are completely open
  if (
    clean === "/" ||
    clean === "/about" ||
    clean.startsWith("/login") ||
    clean.startsWith("/register") ||
    clean.startsWith("/forgot-password") ||
    clean.startsWith("/reset-password") ||
    clean.startsWith("/auth")
  ) {
    return false;
  }

  // Projects, Students, Roadmaps, Dashboard, and feature pages
  if (
    clean.startsWith("/explore/projects") ||
    clean.startsWith("/explore/students") ||
    clean.startsWith("/roadmaps") ||
    clean.startsWith("/projects") ||
    clean.startsWith("/teams") ||
    clean.startsWith("/team-finder") ||
    clean.startsWith("/skills") ||
    clean.startsWith("/dashboard") ||
    clean.startsWith("/profile") ||
    clean.startsWith("/invitations") ||
    clean.startsWith("/messages") ||
    clean.startsWith("/notifications") ||
    clean.startsWith("/settings") ||
    clean.startsWith("/admin")
  ) {
    return true;
  }

  return false;
}

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<{
    reason?: string;
    redirectPath?: string;
    featureTitle?: string;
  }>({});

  // Inline login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const openAuthModal = useCallback(
    (reason?: string, redirectPath?: string, featureTitle?: string) => {
      setModalDetails({
        reason,
        redirectPath: redirectPath || pathname || "/dashboard",
        featureTitle,
      });
      setLoginError(null);
      setIsOpen(true);
    },
    [pathname]
  );

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setLoginError(null);
  }, []);

  const requireAuth = useCallback(
    (actionName?: string, redirectPath?: string) => {
      if (isAuthenticated) {
        return true;
      }
      openAuthModal(
        actionName ? `Please log in to ${actionName}` : undefined,
        redirectPath
      );
      return false;
    },
    [isAuthenticated, openAuthModal]
  );

  // Global click interception
  useEffect(() => {
    if (isAuthenticated || authLoading) {
      return;
    }

    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Never intercept interactions inside the Auth modal itself
      if (target.closest("#auth-required-modal")) {
        return;
      }

      // 2. Never intercept elements marked explicitly as exempt (language, theme toggles)
      if (target.closest("[data-auth-exempt='true']")) {
        return;
      }

      // 3. Intercept links to Projects, Students, Roadmaps from ANY section (including landing page)
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href") || "";

        // If clicking 'About' or Home or Auth links, allow freely
        if (
          href === "/" ||
          href === "/about" ||
          href.startsWith("/login") ||
          href.startsWith("/register") ||
          href.startsWith("/forgot-password") ||
          href.startsWith("/reset-password")
        ) {
          return;
        }

        if (isProtectedTarget(href)) {
          e.preventDefault();
          e.stopPropagation();

          let feature = "Projects, Students & Roadmaps";
          if (href.includes("project")) feature = "Projects";
          else if (href.includes("student") || href.includes("team"))
            feature = "Students & Teams";
          else if (href.includes("roadmap") || href.includes("skill"))
            feature = "Skill Roadmaps";

          openAuthModal(
            `Please sign in or create an account to access ${feature}.`,
            href,
            feature
          );
          return;
        }
      }

      // 4. On pages other than "/" or "/about", intercept any other buttons/inputs
      const isExemptPage =
        pathname === "/" ||
        pathname === "/about" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/auth");

      if (!isExemptPage) {
        const interactiveEl = target.closest(
          "button, [role='button'], input:not([type='hidden']), select, textarea, [data-require-auth='true']"
        );

        if (interactiveEl) {
          e.preventDefault();
          e.stopPropagation();
          openAuthModal(
            "Authentication required to interact with this section.",
            pathname
          );
        }
      }
    };

    document.addEventListener("click", handleClickCapture, true);
    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isAuthenticated, authLoading, pathname, openAuthModal]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAuthModal]);

  // Handle direct login from inside the modal
  const handleModalLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    try {
      const res = await loginAction({ email, password });
      if (!res.success) {
        setLoginError(res.message || "Invalid credentials.");
        toast.error(res.message || "Failed to log in.");
      } else {
        toast.success("Signed in successfully!");
        await refreshUser();
        closeAuthModal();
        const dest = modalDetails.redirectPath || "/dashboard";
        router.push(dest);
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetRedirect = modalDetails.redirectPath || "/dashboard";
  const registerUrl = `/register?redirectedFrom=${encodeURIComponent(targetRedirect)}`;
  const fullLoginUrl = `/login?redirectedFrom=${encodeURIComponent(targetRedirect)}`;

  return (
    <AuthGateContext.Provider
      value={{ openAuthModal, closeAuthModal, isAuthModalOpen: isOpen, requireAuth }}
    >
      {children}

      {/* Auth / Login Modal Overlay */}
      {isOpen && (
        <div
          id="auth-required-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        >
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeAuthModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/30 bg-card/98 dark:bg-[#111B2E]/98 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 text-left">
            {/* Top decorative gradient bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-[#35C6D8] to-emerald-400" />

            {/* Close Button */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-cyan-500/10 border border-primary/30 text-primary shadow-[0_0_20px_-3px_rgba(120,107,250,0.4)]">
                <Lock className="h-6 w-6 stroke-[2.2] animate-pulse" />
              </div>
              <div>
                <Badge
                  variant="outline"
                  className="gap-1 px-2.5 py-0.5 rounded-full border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold mb-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>Student Sign-In Required</span>
                </Badge>
                <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {modalDetails.featureTitle
                    ? `Sign In to Access ${modalDetails.featureTitle}`
                    : "Sign In to PolySkill"}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed mb-5">
              {modalDetails.reason ||
                "Access to projects, student networks, and learning roadmaps is exclusively for registered students. Sign in below or create a free account."}
            </p>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Direct Login Form inside Modal */}
            <form onSubmit={handleModalLogin} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="modal-email" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="student@polytechnic.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-10 text-xs rounded-xl bg-background/50 border-border/80 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="modal-password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <Link
                    href={`/forgot-password?redirectedFrom=${encodeURIComponent(targetRedirect)}`}
                    onClick={closeAuthModal}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="modal-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-10 text-xs rounded-xl bg-background/50 border-border/80 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-[0_0_20px_-3px_rgba(120,107,250,0.5)] transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign Up / Registration Link */}
            <div className="mt-5 pt-4 border-t border-border/40 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link
                  href={registerUrl}
                  onClick={closeAuthModal}
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  Join PolySkill Free
                  <ArrowRight className="h-3 w-3 inline" />
                </Link>
              </p>

              <button
                type="button"
                onClick={closeAuthModal}
                className="text-[11px] text-slate-500 hover:text-foreground transition-colors cursor-pointer block mx-auto"
              >
                Maybe later, stay on page
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}
