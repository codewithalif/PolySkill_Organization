"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight, UserPlus, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
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

interface AuthGateProviderProps {
  children: ReactNode;
}

export function AuthGateProvider({ children }: AuthGateProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<{
    reason?: string;
    redirectPath?: string;
  }>({});

  const openAuthModal = useCallback(
    (reason?: string, redirectPath?: string) => {
      setModalDetails({
        reason,
        redirectPath: redirectPath || pathname || "/",
      });
      setIsOpen(true);
    },
    [pathname]
  );

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
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

  // Global click interception for unauthenticated users outside exempt pages
  useEffect(() => {
    // If user is authenticated or still loading auth state, do not intercept
    if (isAuthenticated || isLoading) {
      return;
    }

    // Explicitly exempt sections where buttons function freely without login:
    // 1. Landing page ("/")
    // 2. About section ("/about")
    // 3. Auth pages ("/login", "/register", "/forgot-password", "/reset-password", "/auth")
    const isExemptPage =
      pathname === "/" ||
      pathname === "/about" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/auth");

    if (isExemptPage) {
      return;
    }

    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Do not intercept interactions inside the Auth Required modal itself
      if (target.closest("#auth-required-modal")) {
        return;
      }

      // 2. Do not intercept elements marked explicitly as exempt (e.g. language/theme toggles)
      if (target.closest("[data-auth-exempt='true']")) {
        return;
      }

      // 3. Do not intercept links leading back to home, about, or auth pages
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href") || "";
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
      }

      // 4. Intercept clicks on any buttons, form inputs, controls, or interactive elements
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
    };

    // Attach in capture phase to intercept before child handlers fire
    document.addEventListener("click", handleClickCapture, true);

    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isAuthenticated, isLoading, pathname, openAuthModal]);

  // Handle ESC key to dismiss modal
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

  const targetRedirect = modalDetails.redirectPath || pathname || "/";
  const loginUrl = `/login?redirectedFrom=${encodeURIComponent(targetRedirect)}`;
  const registerUrl = `/register?redirectedFrom=${encodeURIComponent(targetRedirect)}`;

  return (
    <AuthGateContext.Provider
      value={{ openAuthModal, closeAuthModal, isAuthModalOpen: isOpen, requireAuth }}
    >
      {children}

      {/* Auth Required Modal Overlay */}
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
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/30 bg-card/95 dark:bg-[#111B2E]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center animate-in zoom-in-95 duration-200">
            {/* Top decorative gradient line */}
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

            {/* Lock / Shield Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-cyan-500/10 border border-primary/30 text-primary shadow-[0_0_30px_-5px_rgba(120,107,250,0.4)] mb-5">
              <Lock className="h-8 w-8 stroke-[2.2] animate-pulse" />
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-2">
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-semibold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Student Authentication Required</span>
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Sign In to Continue
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
              {modalDetails.reason ||
                "This feature and its interactive tools are available exclusively to registered PolySkill students. Please log in or create an account to proceed."}
            </p>

            {/* Current Section Chip */}
            {pathname && pathname !== "/" && (
              <div className="mt-4 py-1.5 px-3 rounded-lg bg-muted/50 border border-border/60 text-[11px] text-slate-600 dark:text-muted-foreground truncate">
                Restricted section:{" "}
                <span className="font-mono font-medium text-foreground">
                  {pathname}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                size="lg"
                asChild
                className="w-full rounded-xl h-11 text-sm font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-[0_0_20px_-3px_rgba(120,107,250,0.5)] transition-all hover:scale-[1.01]"
              >
                <Link href={loginUrl} onClick={closeAuthModal}>
                  Log In to Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full rounded-xl h-11 text-sm font-semibold border-border hover:bg-muted/80 text-foreground transition-all hover:scale-[1.01]"
              >
                <Link href={registerUrl} onClick={closeAuthModal}>
                  <UserPlus className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Create New Account (Sign Up)
                </Link>
              </Button>
            </div>

            {/* Return to Home / Maybe Later */}
            <div className="mt-4 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={closeAuthModal}
                className="text-xs text-slate-500 hover:text-foreground transition-colors cursor-pointer"
              >
                Maybe later, continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}
