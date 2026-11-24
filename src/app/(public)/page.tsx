"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code2,
  Users,
  FolderKanban,
  Map,
  Sparkles,
  Zap,
  Globe,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language-provider";
import { HeroBackgroundContainer } from "@/components/home/backgrounds/hero-background-container";
import { ThemeSwitcherPopover } from "@/components/home/backgrounds/theme-switcher-popover";
import { ThemeId, DEFAULT_THEME, STORAGE_KEY } from "@/components/home/backgrounds/types";

export default function LandingPage() {
  const { t } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (
        saved &&
        (saved === "neural-wave" ||
          saved === "aurora-universe" ||
          saved === "cybernetic-grid")
      ) {
        setCurrentTheme(saved);
      }
    } catch {
      // LocalStorage access may fail in private mode
    }
  }, []);

  const handleSelectTheme = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
  };

  const features = [
    {
      icon: Code2,
      title: t("features.skillDevTitle", "Skill Development"),
      description: t(
        "features.skillDevDesc",
        "Track and develop your technical skills with structured roadmaps and progress tracking."
      ),
    },
    {
      icon: FolderKanban,
      title: t("features.projectShowcaseTitle", "Project Showcase"),
      description: t(
        "features.projectShowcaseDesc",
        "Build and showcase your projects. Get feedback from the community and grow your portfolio."
      ),
    },
    {
      icon: Users,
      title: t("features.teamFinderTitle", "Team Finder"),
      description: t(
        "features.teamFinderDesc",
        "Find the perfect teammates based on skills, interests, and availability. Build something great together."
      ),
    },
    {
      icon: Map,
      title: t("features.roadmapsTitle", "Learning Roadmaps"),
      description: t(
        "features.roadmapsDesc",
        "Follow curated learning paths for Frontend, Backend, Full Stack, Python, and more."
      ),
    },
    {
      icon: Zap,
      title: t("features.skillMatchingTitle", "Skill Matching"),
      description: t(
        "features.skillMatchingDesc",
        "Our smart matching system helps you find students with complementary skills for your projects."
      ),
    },
    {
      icon: Globe,
      title: t("features.communityTitle", "Community"),
      description: t(
        "features.communityDesc",
        "Connect with polytechnic students across Bangladesh. Share knowledge and grow together."
      ),
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: t("howItWorks.step1Title", "Create Your Profile"),
      description: t(
        "howItWorks.step1Desc",
        "Sign up and build your student profile. Add your skills, experience, and interests."
      ),
    },
    {
      step: "02",
      title: t("howItWorks.step2Title", "Explore & Learn"),
      description: t(
        "howItWorks.step2Desc",
        "Follow learning roadmaps, discover projects, and connect with other students."
      ),
    },
    {
      step: "03",
      title: t("howItWorks.step3Title", "Build & Collaborate"),
      description: t(
        "howItWorks.step3Desc",
        "Create projects, find teammates, and collaborate to build amazing things together."
      ),
    },
    {
      step: "04",
      title: t("howItWorks.step4Title", "Showcase & Grow"),
      description: t(
        "howItWorks.step4Desc",
        "Share your work, get feedback, and build a professional portfolio for your career."
      ),
    },
  ];

  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Interactive Canvas Background Theme */}
      <HeroBackgroundContainer currentTheme={currentTheme} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Pill Badge */}
            <Badge
              variant="outline"
              className="mb-6 gap-2 px-3.5 py-1.5 rounded-full border-primary/30 bg-primary/10 text-primary dark:text-primary text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_-3px_rgba(120,107,250,0.3)] animate-pulse"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("hero.badge", "For Polytechnic Students of Bangladesh")}</span>
            </Badge>

            {/* Hero Heading */}
            <h1 className="max-w-4xl font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {t("hero.title1", "Build Skills. Create Projects.")}{" "}
              <span className="bg-gradient-to-r from-primary via-[#6355EE] to-cyan-600 dark:from-primary dark:via-[#9B8CFA] dark:to-cyan-400 bg-clip-text text-transparent">
                {t("hero.title2", "Find Your People.")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-muted-foreground leading-relaxed font-normal">
              {t(
                "hero.subtitle",
                "One platform for polytechnic students to learn, collaborate, showcase projects, and grow together."
              )}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto rounded-full px-7 h-12 text-sm font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-[0_0_25px_-5px_rgba(120,107,250,0.5)] transition-all hover:scale-[1.02]"
              >
                <Link href="/explore/projects">
                  {t("hero.exploreBtn", "Explore Projects")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto rounded-full px-7 h-12 text-sm font-semibold border-border/80 bg-card/80 hover:bg-muted text-foreground backdrop-blur-md transition-all hover:scale-[1.02] shadow-xs"
              >
                <Link href="/register">
                  {t("hero.joinBtn", "Join PolySkill")}
                </Link>
              </Button>
            </div>

            {/* Interactive Theme Switcher Button */}
            <div className="mt-5 flex justify-center">
              <ThemeSwitcherPopover
                currentTheme={currentTheme}
                onSelectTheme={handleSelectTheme}
              />
            </div>

            {/* Social Proof */}
            <div className="mt-10 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/80 bg-card/80 dark:border-border/40 dark:bg-card/30 backdrop-blur-sm text-xs text-slate-700 dark:text-muted-foreground shadow-xs">
              <GraduationCap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>
                {t(
                  "hero.trustedBy",
                  "Trusted by students from 50+ polytechnic institutes"
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("features.heading", "Everything you need to grow")}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t(
                "features.subheading",
                "PolySkill gives you the tools to develop skills, build projects, find collaborators, and launch your tech career."
              )}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-6 sm:p-7 rounded-2xl border border-border/80 dark:border-border/60 bg-card/90 dark:bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card dark:hover:bg-card/90 shadow-xs dark:shadow-none hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_15px_-3px_rgba(120,107,250,0.5)]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 border-y border-border/60 dark:border-border/40 bg-slate-100/60 dark:bg-card/20 backdrop-blur-md relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("howItWorks.heading", "How It Works")}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t(
                "howItWorks.subheading",
                "Get started in minutes. It's as simple as four steps."
              )}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl border border-border/80 dark:border-border/50 bg-card/90 dark:bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:bg-card shadow-xs dark:shadow-none group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full border border-cyan-500/30 dark:border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 dark:border-primary/30 p-8 sm:p-14 text-center bg-gradient-to-br from-primary/10 via-card to-cyan-500/10 dark:from-card dark:via-[#111B2E] dark:to-[#18243A] shadow-xl dark:shadow-2xl">
            {/* Ambient Aurora glow inside the card */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary/25 via-cyan-400/15 to-transparent blur-3xl pointer-events-none -z-10" />

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
              {t("cta.heading", "Join the PolySkill Community")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t(
                "cta.subheading",
                "Connect with thousands of polytechnic students. Share your projects, learn new skills, and build your future together."
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto rounded-full px-8 h-12 text-sm font-semibold bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-white shadow-[0_0_25px_-5px_rgba(120,107,250,0.5)] transition-all hover:scale-[1.02]"
              >
                <Link href="/register">
                  {t("cta.getStarted", "Get Started Free")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto rounded-full px-8 h-12 text-sm font-semibold border-border/80 bg-card/80 hover:bg-card text-foreground backdrop-blur-sm transition-all hover:scale-[1.02] shadow-xs"
              >
                <Link href="/about">
                  {t("cta.learnMore", "Learn More")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
