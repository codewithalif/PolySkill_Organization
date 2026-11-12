import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export const instant = false;


import {
  getMyInvitationsAction,
  getSentInvitationsAction,
} from "@/actions/invitations";
import { InvitationsClient } from "./invitations-client";

export const metadata = {
  title: "Team Invitations | PolySkill",
  description: "View and respond to team collaboration invitations",
};

export default async function InvitationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [receivedRes, sentRes] = await Promise.all([
    getMyInvitationsAction(),
    getSentInvitationsAction(),
  ]);

  const received = receivedRes.success && receivedRes.data ? receivedRes.data : [];
  const sent = sentRes.success && sentRes.data ? sentRes.data : [];

  return <InvitationsClient received={received} sent={sent} />;
}
