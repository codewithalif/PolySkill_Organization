import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getMatchedTeamsAction } from "@/lib/skill-matching";
import { getStudentSkillsAction } from "@/actions/skills";
import { TeamsClient } from "./teams-client";
import { ProfileCompletionBanner } from "@/components/shared/profile-completion-banner";

export const instant = false;

export const metadata = {
  title: "Team Finder | PolySkill",
  description: "Find polytechnic project teams matching your skills or recruit teammates",
};

export default async function TeamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [teamsRes, skillsRes] = await Promise.all([
    getMatchedTeamsAction(),
    getStudentSkillsAction(user.id),
  ]);

  const teams = teamsRes.success && teamsRes.data ? teamsRes.data : [];
  const hasSkills = skillsRes.success && (skillsRes.data?.length ?? 0) > 0;

  return (
    <>
      <ProfileCompletionBanner
        profileCompletion={user.profileCompletion ?? 60}
        hasSkills={hasSkills}
        username={user.username}
      />
      <TeamsClient initialTeams={teams} currentUserId={user.id} />
    </>
  );
}
