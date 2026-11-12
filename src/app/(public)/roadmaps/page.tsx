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
    <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill & Career Roadmaps</h1>
        <p className="text-muted-foreground">
          Step-by-step learning paths tailored for polytechnic students to prepare for high-demand tech careers.
        </p>
      </div>

      {roadmaps.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <Map className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No roadmaps published yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
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
              <Card key={rm.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-lg bg-muted border">
                      {ICON_MAP[rm.icon] || <Code className="h-6 w-6 text-primary" />}
                    </div>
                    <Badge variant="outline">{rm.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-3">{rm.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {rm.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated Duration: {rm.estimated_duration}</span>
                  </div>

                  {rm.total_steps > 0 && (
                    <div className="space-y-1.5 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-medium">
                          {rm.completed_steps} / {rm.total_steps} steps ({percent}%)
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  )}

                  <div className="pt-2">
                    <Button asChild className="w-full">
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
