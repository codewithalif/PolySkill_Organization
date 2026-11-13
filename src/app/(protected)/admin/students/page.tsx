import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAdminStudentsAction } from "@/actions/admin";
import { StudentsAdminClient } from "./students-client";

export const instant = false;

export const metadata = {
  title: "Admin - Students | PolySkill",
  description: "Manage polytechnic students and assign roles",
};

export default async function AdminStudentsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
    redirect("/dashboard");
  }

  const res = await getAdminStudentsAction();
  const students = res.success && res.data ? res.data : [];

  return <StudentsAdminClient initialStudents={students} currentUserId={user.id} />;
}
