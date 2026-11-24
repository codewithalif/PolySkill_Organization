"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  acceptInvitationAction,
  declineInvitationAction,
  cancelInvitationAction,
  type TeamInvitationWithDetails,
} from "@/actions/invitations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Mail,
  Check,
  X,
  Loader2,
  MessageSquare,
  Users,
  Send,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

interface InvitationsClientProps {
  received: TeamInvitationWithDetails[];
  sent: TeamInvitationWithDetails[];
}

export function InvitationsClient({ received, sent }: InvitationsClientProps) {
  const router = useRouter();
  const [receivedList, setReceivedList] = useState(received);
  const [sentList, setSentList] = useState(sent);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Count pending received items
  const pendingReceivedCount = receivedList.filter((i) => i.status === "pending").length;

  async function handleAccept(id: string) {
    setLoadingId(id);
    try {
      const res = await acceptInvitationAction(id);
      if (res.success) {
        toast.success(res.message || "Invitation accepted!", {
          description: "You are now connected and can start chatting.",
          action: {
            label: "Open Chat",
            onClick: () => router.push("/messages"),
          },
        });
        setReceivedList((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to accept");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDecline(id: string) {
    setLoadingId(id);
    try {
      const res = await declineInvitationAction(id);
      if (res.success) {
        toast.success("Invitation declined");
        setReceivedList((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to decline");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCancel(id: string) {
    setLoadingId(id);
    try {
      const res = await cancelInvitationAction(id);
      if (res.success) {
        toast.success("Request cancelled");
        setSentList((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to cancel request");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Team Invitations & Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review incoming join requests for your teams and manage project invitations.
        </p>
      </div>

      <Tabs defaultValue="received" className="space-y-5">
        <TabsList className="bg-[#111B2E]/80 border border-white/[0.08] backdrop-blur-md p-1 rounded-xl">
          <TabsTrigger
            value="received"
            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(120,107,250,0.4)] transition-all"
          >
            <span className="font-medium text-xs">Received</span>
            {pendingReceivedCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-1.5 text-[10px] bg-white/20 text-white border-0 font-mono font-bold"
              >
                {pendingReceivedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(120,107,250,0.4)] transition-all"
          >
            <span className="font-medium text-xs">Sent</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono border-0 bg-white/[0.06] text-muted-foreground">
              {sentList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ==================== RECEIVED TAB ==================== */}
        <TabsContent value="received" className="space-y-4">
          {receivedList.length === 0 ? (
            <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
              <CardContent className="space-y-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground">No pending invitations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When team leaders invite you or students request to join your teams, they will appear here.
                </p>
                <div className="pt-2">
                  <Button asChild size="sm" variant="outline" className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs">
                    <Link href="/teams">Explore Teams</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {receivedList.map((inv) => {
                const isJoinRequest = inv.type === "join_request";
                return (
                  <Card
                    key={inv.id}
                    className="flex flex-col justify-between border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md hover:border-primary/30 transition-all rounded-xl"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="font-heading text-base font-semibold text-foreground">
                              {inv.team?.name || "Project Team"}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={
                                isJoinRequest
                                  ? "text-[10px] h-5 font-mono bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
                                  : "text-[10px] h-5 font-mono bg-primary/10 text-primary border-primary/25"
                              }
                            >
                              {isJoinRequest ? "Join Request" : "Team Invite"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {isJoinRequest
                              ? "Applicant wants to join your team"
                              : "You have been invited to join this project"}
                          </p>
                        </div>
                      </div>

                      {/* Requester or Inviter Info */}
                      <div className="flex items-center gap-2.5 pt-2.5 text-xs">
                        <Avatar className="h-8 w-8 ring-1 ring-white/10">
                          <AvatarImage src={inv.from_user?.avatar_url || ""} />
                          <AvatarFallback className="text-[11px] bg-primary/20 text-primary font-bold">
                            {inv.from_user?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate text-foreground text-xs">
                            {inv.from_user?.full_name || "Polytechnic Student"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">
                            {inv.from_user?.institute || `@${inv.from_user?.username}`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {inv.message && (
                        <div className="text-xs bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-lg text-secondary-foreground italic leading-relaxed">
                          "{inv.message}"
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
                        <span>
                          {new Date(inv.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-amber-400">Status: Pending</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08]"
                          disabled={loadingId === inv.id}
                          onClick={() => handleDecline(inv.id)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Decline
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-[0_0_14px_-3px_rgba(120,107,250,0.5)]"
                          disabled={loadingId === inv.id}
                          onClick={() => handleAccept(inv.id)}
                        >
                          {loadingId === inv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          {isJoinRequest ? "Approve & Add" : "Accept & Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ==================== SENT TAB ==================== */}
        <TabsContent value="sent" className="space-y-4">
          {sentList.length === 0 ? (
            <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
              <CardContent className="space-y-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground">No sent requests</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you request to join a team or invite students to your project, track their status here.
                </p>
                <div className="pt-2">
                  <Button asChild size="sm" variant="outline" className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs">
                    <Link href="/teams">Find Teams to Join</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sentList.map((inv) => {
                const isJoinRequest = inv.type === "join_request";
                const isPending = inv.status === "pending";
                const isAccepted = inv.status === "accepted";
                const isDeclined = inv.status === "declined";

                return (
                  <Card
                    key={inv.id}
                    className="flex flex-col justify-between border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md hover:border-primary/30 transition-all rounded-xl"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="font-heading text-base font-semibold text-foreground">
                            {inv.team?.name || "Project Team"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {isJoinRequest
                              ? "Your join request to the team leader"
                              : `Invited: ${inv.to_user?.full_name || "Student"}`}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 gap-1 capitalize font-mono",
                            isAccepted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isDeclined
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          )}
                        >
                          {isAccepted && <CheckCircle2 className="h-3 w-3" />}
                          {isDeclined && <XCircle className="h-3 w-3" />}
                          {isPending && <Clock className="h-3 w-3" />}
                          {inv.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {inv.message && (
                        <p className="text-xs bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-lg text-muted-foreground italic leading-relaxed">
                          "{inv.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>
                          Sent:{" "}
                          {new Date(inv.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="capitalize text-[10px] text-muted-foreground">
                          {inv.type ? inv.type.replace("_", " ") : "invite"}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                            disabled={loadingId === inv.id}
                            onClick={() => handleCancel(inv.id)}
                          >
                            {loadingId === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                              <X className="h-3.5 w-3.5 mr-1" />
                            )}
                            Cancel Request
                          </Button>
                        )}

                        {isAccepted && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08]"
                          >
                            <Link
                              href={
                                inv.to_user_id
                                  ? `/messages?userId=${inv.to_user_id}`
                                  : "/messages"
                              }
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Open Chat
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
