import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAdminRoadmapsAction } from "@/actions/admin";
import { RoadmapsAdminClient } from "./roadmaps-client";

export const instant = false;

export const metadata = {
  title: "Admin - Roadmaps | PolySkill",
  description: "Create and update polytechnic career roadmaps",
};

export default async function AdminRoadmapsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const res = await getAdminRoadmapsAction();
  const roadmaps = res.success && res.data ? res.data : [];

  return <RoadmapsAdminClient initialRoadmaps={roadmaps} />;
}
