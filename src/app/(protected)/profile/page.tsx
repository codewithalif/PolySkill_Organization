import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "My Profile | PolySkill",
  description: "View and edit your PolySkill student profile",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your polytechnic student identity, skills, and portfolio links.
        </p>
      </div>

      <ProfileForm initialProfile={user} />
    </div>
  );
}
