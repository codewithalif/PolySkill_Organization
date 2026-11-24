import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/actions/auth";
import { getMyProjectsAction } from "@/actions/projects";
import { MyProjectsClient } from "./my-projects-client";

export const instant = false;

export const metadata = {
  title: "My Projects | PolySkill",
  description: "Projects you have built and showcased",
};

export default async function MyProjectsPage() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getMyProjectsAction();
  const projects = res.success && res.data ? res.data : [];

  return <MyProjectsClient initialProjects={projects} />;
}
