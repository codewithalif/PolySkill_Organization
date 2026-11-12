import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export const metadata = {
  title: "About | PolySkill",
  description: "Learn about the mission, vision, and team behind PolySkill",
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Code2,
      title: "Real Practical Skills",
      description:
        "Moving beyond theoretical syllabus to hands-on programming, modern web frameworks, and project-based engineering.",
    },
    {
      icon: Users,
      title: "Cross-Polytechnic Collaboration",
      description:
        "Connecting diploma students from Dhaka, Chittagong, Rajshahi and 50+ institutes across Bangladesh into one collaborative community.",
    },
    {
      icon: Share2,
      title: "Portfolio & Showcase",
      description:
        "Every student deserves a platform to exhibit their capstones, semester assignments, and apps to recruiters and mentors.",
    },
    {
      icon: Award,
      title: "Guided Career Roadmaps",
      description:
        "Clear, step-by-step curriculum with sequential milestone unlocking to turn students into industry-ready engineers.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b bg-muted/20">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-4">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            Our Mission & Vision
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Empowering Bangladesh's Polytechnic Engineers
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            PolySkill was built with a singular vision: to bridge the gap between diploma academic studies and modern tech industry demands through peer collaboration and hands-on building.
          </p>
        </div>
      </section>

      {/* Story & Background */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Why PolySkill?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Bangladesh has thousands of passionate, hardworking polytechnic students across 50+ government and private institutes. However, many students struggle with:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Lack of project partners and team members with complementary skills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Absence of a unified showcase for semester assignments and capstones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Uncertainty about which tech stacks the industry actually hires for.</span>
                </li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                PolySkill solves this by providing curated learning roadmaps, real-time team matching, and an open platform to showcase your talent.
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-card border-primary/20">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg">For Polytechnic Students</h3>
                    <p className="text-xs text-muted-foreground">By Polytechnic Engineers</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  "No student should build alone. When we collaborate, share knowledge, and learn together, we build not just projects, but future leaders of Bangladesh's digital ecosystem."
                </p>
                <div className="pt-2">
                  <Button asChild size="sm">
                    <Link href="/register">
                      Join Our Community <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Pillars */}
          <div className="space-y-6 pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">What We Stand For</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Four core fundamentals driving our platform design and student community.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="p-6">
                    <CardHeader className="p-0 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{pillar.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-sm text-muted-foreground">
                        {pillar.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
