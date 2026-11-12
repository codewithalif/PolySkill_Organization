"use client";

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

export default function LandingPage() {
  const { t } = useLanguage();

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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center pt-20 pb-16 text-center md:pt-32 md:pb-24">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge", "For Polytechnic Students of Bangladesh")}
            </Badge>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t("hero.title1", "Build Skills. Create Projects.")}{" "}
              <span className="text-primary/80">
                {t("hero.title2", "Find Your People.")}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t(
                "hero.subtitle",
                "One platform for polytechnic students to learn, collaborate, showcase projects, and grow together."
              )}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/explore/projects">
                  {t("hero.exploreBtn", "Explore Projects")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  {t("hero.joinBtn", "Join PolySkill")}
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
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

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("features.heading", "Everything you need to grow")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t(
                "features.subheading",
                "PolySkill gives you the tools to develop skills, build projects, find collaborators, and launch your tech career."
              )}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="group border bg-card transition-all hover:shadow-md hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("howItWorks.heading", "How It Works")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t(
                "howItWorks.subheading",
                "Get started in minutes. It's as simple as four steps."
              )}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-16">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("cta.heading", "Join the PolySkill Community")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              {t(
                "cta.subheading",
                "Connect with thousands of polytechnic students. Share your projects, learn new skills, and build your future together."
              )}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/register">
                  {t("cta.getStarted", "Get Started Free")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
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
