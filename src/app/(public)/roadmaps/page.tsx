import Link from "next/link";
import { getRoadmapsAction } from "@/actions/roadmaps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Map, Code, Smartphone, Shield, ArrowRight, Clock } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Learning Roadmaps | PolySkill",
  description: "Curated learning paths for polytechnic diploma students in Bangladesh",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Code: <Code className="h-6 w-6 text-blue-500" />,
  Smartphone: <Smartphone className="h-6 w-6 text-emerald-500" />,
  Shield: <Shield className="h-6 w-6 text-purple-500" />,
};

export default async function RoadmapsPage() {
  const res = await getRoadmapsAction();
  const roadmaps = res.success && res.data ? res.data : [];

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Skill & Career Roadmaps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Step-by-step learning paths tailored for polytechnic students to prepare for high-demand tech careers.
        </p>
      </div>

      {roadmaps.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-4 max-w-sm mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
              <Map className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground">No roadmaps published yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our academic mentors are compiling step-by-step career roadmaps. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((rm) => {
            const percent =
              rm.total_steps > 0
                ? Math.round((rm.completed_steps / rm.total_steps) * 100)
                : 0;

            return (
              <Card key={rm.id} className="group flex flex-col border border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-primary shadow-[0_0_12px_rgba(120,107,250,0.2)]">
                      {ICON_MAP[rm.icon] || <Code className="h-6 w-6 text-primary" />}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/[0.08] bg-white/[0.03] text-muted-foreground">{rm.difficulty}</Badge>
                  </div>
                  <CardTitle className="font-heading text-xl mt-3 text-foreground group-hover:text-primary transition-colors">{rm.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {rm.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Duration: {rm.estimated_duration}</span>
                  </div>

                  {rm.total_steps > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-medium text-foreground">
                          {rm.completed_steps} / {rm.total_steps} ({percent}%)
                        </span>
                      </div>
                      <Progress value={percent} className="h-2 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400" />
                    </div>
                  )}

                  <div className="pt-2">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs h-10 rounded-xl">
                      <Link href={`/roadmaps/${rm.slug}`}>
                        Explore Roadmap <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
