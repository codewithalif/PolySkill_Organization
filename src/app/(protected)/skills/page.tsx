import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { getStudentSkillsAction } from "@/actions/skills";
import { SkillsClient } from "./skills-client";

export const metadata = {
  title: "My Skills | PolySkill",
  description: "Track and showcase your skills",
};

export default async function SkillsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getStudentSkillsAction(user.id);
  const skills = (res.success && res.data ? res.data : []).map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
    progress: s.progress,
    targetDate: s.target_date || undefined,
    learningGoal: s.learning_goal || undefined,
    userId: s.user_id,
  }));

  return <SkillsClient initialSkills={skills} />;
}
