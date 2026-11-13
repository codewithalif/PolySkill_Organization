import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getSkillsCatalogAction } from "@/actions/admin";
import { SkillsAdminClient } from "./skills-client";

export const instant = false;

export const metadata = {
  title: "Admin - Skills | PolySkill",
  description: "Manage global skills catalog",
};

export default async function AdminSkillsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
    redirect("/dashboard");
  }

  const res = await getSkillsCatalogAction();
  const skills = res.success && res.data ? res.data : [];

  return <SkillsAdminClient initialSkills={skills} />;
}
