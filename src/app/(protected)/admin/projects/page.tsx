import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAdminProjectsAction } from "@/actions/admin";
import { ProjectsAdminClient } from "./projects-client";

export const instant = false;

export const metadata = {
  title: "Admin - Projects | PolySkill",
  description: "Review and moderate student projects",
};

export default async function AdminProjectsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
    redirect("/dashboard");
  }

  const res = await getAdminProjectsAction();
  const projects = res.success && res.data ? res.data : [];

  return <ProjectsAdminClient initialProjects={projects} />;
}
