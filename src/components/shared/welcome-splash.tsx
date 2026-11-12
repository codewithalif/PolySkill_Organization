"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Zap, GraduationCap, Code2, Users } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

export function WelcomeSplash() {
  // Lazy initializer: runs synchronously on first client render (hydration)
  // so the splash is never shown if already seen — zero flash.
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!sessionStorage.getItem("polyskill_welcome_seen");
    } catch {
      return false;
    }
  });
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useLanguage();

  if (isDismissed) {
    return null;
  }

  function handleEnter() {
    setIsExiting(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem("polyskill_welcome_seen", "true");
        document.documentElement.classList.add("splash-dismissed");
      } catch {
        // Ignore
      }
      setIsDismissed(true);
    }, 700); // 700ms ultra-smooth transition
  }

  return (
    <div
      id="polyskill-welcome-splash"
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100 select-none transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
        isExiting
          ? "opacity-0 scale-110 pointer-events-none blur-md"
          : "opacity-100 scale-100"
      }`}
    >
      {/* 1. Deep Space Tech Background Gradient Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient floating blur lights */}
        <div className="absolute -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-transparent rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-tl from-cyan-500/25 via-blue-600/20 to-transparent rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* 2. Main Center Card */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-md text-indigo-300 text-xs font-medium mb-8 shadow-inner shadow-indigo-500/20 animate-fade-in">
          <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
          <span>{t("splash.badge", "Polytechnic Engineering Ecosystem")}</span>
        </div>

        {/* 3. Unique Animated Multilayer Tech Rings */}
        <div className="relative flex items-center justify-center my-2 mb-8">
          {/* Outer Pulsing Wave */}
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-indigo-500/20 bg-indigo-500/5 animate-ping opacity-40" />

          {/* Clockwise Dashed Circuit Ring */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite]" />

          {/* Counter-Clockwise Dotted Accent Ring */}
          <div
            className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-dotted border-violet-400/40 animate-[spin_8s_linear_infinite_reverse]"
          />

          {/* Floating Orbit Dots */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 animate-[spin_6s_linear_infinite] pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          </div>

          {/* Center Glowing Logo Sphere */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 shadow-[0_0_35px_rgba(99,102,241,0.5)]">
            <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-sm flex items-center justify-center group">
              <div className="relative">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]" />
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Brand Title & Tagline */}
        <div className="space-y-2.5 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Poly
            </span>
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Skill
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            {t(
              "splash.subtitle",
              "Build Projects. Master Industry Roadmaps. Collaborate with Polytechnic Peers."
            )}
          </p>

          {/* Micro Feature Icons */}
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-cyan-500" /> {t("features.projectShowcaseTitle", "Real Projects")}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> {t("features.teamFinderTitle", "Team Finder")}
            </span>
          </div>
        </div>

        {/* 5. Modern Interactive Glow Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={handleEnter}
            type="button"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20"
          >
            {/* Shimmer light effect inside button */}
            <span className="absolute inset-0 rounded-full overflow-hidden">
              <span className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            </span>

            <span>{t("splash.areYouSure", "Are you sure to join us?")}</span>
            <ArrowRight className="w-4 h-4 text-cyan-200 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Footnote */}
        <p className="text-[10px] text-slate-500 mt-6 tracking-wide uppercase font-mono">
          Official Student Platform • Bangladesh
        </p>
      </div>
    </div>
  );
}
