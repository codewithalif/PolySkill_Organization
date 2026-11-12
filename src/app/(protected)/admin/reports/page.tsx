import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getReportsAction } from "@/actions/admin";
import { ReportsAdminClient } from "./reports-client";

export const instant = false;

export const metadata = {
  title: "Admin - Reports | PolySkill",
  description: "Review user-submitted content reports",
};

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const res = await getReportsAction();
  const reports = res.success && res.data ? res.data : [];

  return <ReportsAdminClient initialReports={reports} />;
}
