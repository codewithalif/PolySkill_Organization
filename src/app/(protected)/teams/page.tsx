import Link from "next/link";
import { getMatchedTeamsAction } from "@/lib/skill-matching";

export const instant = false;


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, PlusCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Team Finder | PolySkill",
  description: "Find polytechnic project teams matching your skills",
};

export default async function TeamsPage() {
  const res = await getMatchedTeamsAction();
  const teams = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Finder</h1>
          <p className="text-muted-foreground">
            Teams ranked by AI skill-matching algorithm (60% skills + 25% recruiting + 15% experience).
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No teams looking for members right now</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Be the leader! Create your own team and invite polytechnic classmates.
              </p>
            </div>
            <Button asChild>
              <Link href="/teams/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Form a New Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">{team.name}</CardTitle>
                  {team.matchScore > 0 && (
                    <Badge variant="default" className="bg-emerald-600 gap-1 text-xs">
                      <Sparkles className="h-3 w-3" /> {team.matchScore}% Match
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Leader: {team.leader?.full_name || "Student"}</span>
                  <span>•</span>
                  <span>
                    {team.member_count} / {team.max_members} members
                  </span>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {team.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {team.required_skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {team.matchReasons && team.matchReasons.length > 0 && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded">
                    ✓ {team.matchReasons[0]}
                  </div>
                )}

                <div className="pt-2 border-t flex justify-end">
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={`/teams`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
