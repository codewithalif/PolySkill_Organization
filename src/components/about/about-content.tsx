"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Code2,
  Share2,
  Award,
} from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

export function AboutContent() {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: Code2,
      title: t("about.pillar1Title", "Real Practical Skills"),
      description: t(
        "about.pillar1Desc",
        "Moving beyond theoretical syllabus to hands-on programming, modern web frameworks, and project-based engineering."
      ),
    },
    {
      icon: Users,
      title: t("about.pillar2Title", "Cross-Polytechnic Collaboration"),
      description: t(
        "about.pillar2Desc",
        "Connecting diploma students from Dhaka, Chittagong, Rajshahi and 50+ institutes across Bangladesh into one collaborative community."
      ),
    },
    {
      icon: Share2,
      title: t("about.pillar3Title", "Portfolio & Showcase"),
      description: t(
        "about.pillar3Desc",
        "Every student deserves a platform to exhibit their capstones, semester assignments, and apps to recruiters and mentors."
      ),
    },
    {
      icon: Award,
      title: t("about.pillar4Title", "Guided Career Roadmaps"),
      description: t(
        "about.pillar4Desc",
        "Clear, step-by-step curriculum with sequential milestone unlocking to turn students into industry-ready engineers."
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-white/[0.06] bg-[#080D19]">
        <div className="absolute inset-0 aurora-mesh opacity-50 pointer-events-none" />
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-5 relative z-10">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-mono border-primary/30 bg-primary/10 text-primary shadow-[0_0_12px_rgba(120,107,250,0.3)]">
            {t("about.badge", "Our Mission & Vision")}
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            {t("about.title", "Empowering Bangladesh's Polytechnic Engineers")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t(
              "about.subtitle",
              "PolySkill was built with a singular vision: to bridge the gap between diploma academic studies and modern tech industry demands through peer collaboration and hands-on building."
            )}
          </p>
        </div>
      </section>

      {/* Story & Background */}
      <section className="py-16 md:py-24 bg-[#080D19]/60">
        <div className="container max-w-5xl mx-auto px-4 space-y-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {t("about.whyTitle", "Why PolySkill?")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t(
                  "about.whyDesc",
                  "Bangladesh has thousands of passionate, hardworking polytechnic students across 50+ government and private institutes. However, many students struggle with:"
                )}
              </p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold text-base leading-none">•</span>
                  <span>
                    {t(
                      "about.problem1",
                      "Lack of project partners and team members with complementary skills."
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold text-base leading-none">•</span>
                  <span>
                    {t(
                      "about.problem2",
                      "Absence of a unified showcase for semester assignments and capstones."
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-primary font-bold text-base leading-none">•</span>
                  <span>
                    {t(
                      "about.problem3",
                      "Uncertainty about which tech stacks the industry actually hires for."
                    )}
                  </span>
                </li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
                {t(
                  "about.solutionDesc",
                  "PolySkill solves this by providing curated learning roadmaps, real-time team matching, and an open platform to showcase your talent."
                )}
              </p>
            </div>

            <Card className="p-7 bg-[#111B2E]/70 border-white/[0.08] backdrop-blur-xl rounded-2xl shadow-xl hover:border-primary/40 transition-all">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_16px_rgba(120,107,250,0.2)]">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {t("hero.badge", "Polytechnic Dedicated")}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      BTEB Curriculum & Diploma Engineering
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "features.communityDesc",
                    "Connect with polytechnic students across Bangladesh. Share knowledge and grow together."
                  )}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono font-medium text-cyan-400">
                  <Target className="h-4 w-4" />
                  <span>50+ Polytechnic Institutes Supported</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pillars */}
          <div className="space-y-8 pt-4">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {t("about.pillarsTitle", "Core Pillars of PolySkill")}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {pillars.map((pillar, idx) => (
                <Card key={idx} className="border border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md rounded-2xl hover:border-primary/40 transition-all duration-300">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(120,107,250,0.2)]">
                      <pillar.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-semibold text-base text-foreground">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-r from-primary/30 via-[#111B2E] to-primary/20 backdrop-blur-xl p-8 sm:p-12 text-center space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <Sparkles className="h-8 w-8 mx-auto text-primary" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              {t("cta.heading", "Ready to Build Your Engineering Future?")}
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-muted-foreground">
              {t(
                "cta.subheading",
                "Join hundreds of polytechnic students today and start creating impactful projects."
              )}
            </p>
            <div className="pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(120,107,250,0.4)] rounded-xl" asChild>
                <Link href="/register">
                  {t("cta.getStarted", "Get Started Free")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
