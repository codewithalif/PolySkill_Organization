import { createClient } from "@/lib/supabase/server";
import { getTeamsAction, type TeamWithDetails } from "@/actions/teams";
import type { ActionResult } from "@/actions/auth";

export interface TeamWithScore extends TeamWithDetails {
  matchScore: number;
  matchReasons: string[];
}

/**
 * Skill Matching Algorithm:
 * - 60% weight: Matching skills ratio (matching skills count / total required skills)
 * - 25% weight: Project interest / active recruiting match
 * - 15% weight: Experience level match (Beginner=5, Intermediate=10, Advanced=15)
 */
export function calculateMatchScore(
  teamRequiredSkills: string[],
  studentSkillNames: string[],
  teamStatus: string,
  studentExperienceLevel: string
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const lowerStudentSkills = new Set(
    studentSkillNames.map((s) => s.toLowerCase().trim())
  );

  // 1. Skill Match (60%)
  if (!teamRequiredSkills || teamRequiredSkills.length === 0) {
    score += 30; // Neutral baseline when no specific skills demanded
  } else {
    let matchedCount = 0;
    const matchedNames: string[] = [];

    teamRequiredSkills.forEach((req) => {
      if (lowerStudentSkills.has(req.toLowerCase().trim())) {
        matchedCount++;
        matchedNames.push(req);
      }
    });

    const ratio = matchedCount / teamRequiredSkills.length;
    const skillScore = Math.round(ratio * 60);
    score += skillScore;

    if (matchedNames.length > 0) {
      reasons.push(`${matchedNames.length} matching skills: ${matchedNames.slice(0, 3).join(", ")}`);
    }
  }

  // 2. Recruiting Interest Match (25%)
  if (teamStatus === "Recruiting") {
    score += 25;
    reasons.push("Actively recruiting members");
  } else if (teamStatus === "Planning") {
    score += 15;
  } else {
    score += 5;
  }

  // 3. Experience Match (15%)
  switch (studentExperienceLevel) {
    case "Advanced":
      score += 15;
      reasons.push("Advanced skill level match");
      break;
    case "Intermediate":
      score += 10;
      reasons.push("Good experience match");
      break;
    case "Beginner":
    default:
      score += 5;
      break;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  };
}

/** Server Action: Get teams ranked by personalized match score for current student */
export async function getMatchedTeamsAction(): Promise<
  ActionResult<TeamWithScore[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch teams
    const teamsRes = await getTeamsAction({ limit: 50 });
    if (!teamsRes.success || !teamsRes.data) {
      return { success: false, message: teamsRes.message || "Failed to load teams", data: [] };
    }

    const teams = teamsRes.data.teams;

    if (!user) {
      // If not logged in, return teams with neutral 0 score
      const unauthTeams: TeamWithScore[] = teams.map((t) => ({
        ...t,
        matchScore: 0,
        matchReasons: ["Log in to view personalized match score"],
      }));
      return { success: true, data: unauthTeams };
    }

    // Fetch student skills
    const { data: studentSkills } = await supabase
      .from("student_skills")
      .select("name")
      .eq("user_id", user.id);

    const skillNames = (studentSkills || []).map((s) => s.name);

    // Fetch student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("experience_level")
      .eq("id", user.id)
      .single();

    const expLevel = profile?.experience_level || "Beginner";

    // Calculate score for each team
    const teamsWithScore: TeamWithScore[] = teams.map((team) => {
      const { score, reasons } = calculateMatchScore(
        team.required_skills,
        skillNames,
        team.status,
        expLevel
      );

      return {
        ...team,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort descending by match score
    teamsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, data: teamsWithScore };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}
