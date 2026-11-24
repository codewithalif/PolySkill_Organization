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
        <h1 className="text-3xl font-bold tracking-tight">Team Invitations & Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review incoming join requests for your teams and manage project invitations.
        </p>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="received" className="gap-2">
            <span>Received</span>
            {pendingReceivedCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-1.5 text-xs bg-primary text-primary-foreground font-semibold"
              >
                {pendingReceivedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <span>Sent</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
              {sentList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ==================== RECEIVED TAB ==================== */}
        <TabsContent value="received" className="space-y-4">
          {receivedList.length === 0 ? (
            <Card className="text-center py-14">
              <CardContent className="space-y-3 max-w-sm mx-auto">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground opacity-60" />
                <h3 className="font-semibold text-base">No pending invitations</h3>
                <p className="text-xs text-muted-foreground">
                  When team leaders invite you or students request to join your teams, they will appear here.
                </p>
                <div className="pt-2">
                  <Button asChild size="sm" variant="outline">
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
                    className="flex flex-col justify-between border-muted/80 hover:shadow-sm transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <CardTitle className="text-base font-semibold">
                              {inv.team?.name || "Project Team"}
                            </CardTitle>
                            <Badge
                              variant={isJoinRequest ? "secondary" : "default"}
                              className="text-[10px] h-5"
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
                      <div className="flex items-center gap-2 pt-2 text-xs">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={inv.from_user?.avatar_url || ""} />
                          <AvatarFallback className="text-[11px]">
                            {inv.from_user?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate text-foreground">
                            {inv.from_user?.full_name || "Polytechnic Student"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {inv.from_user?.institute || `@${inv.from_user?.username}`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {inv.message && (
                        <div className="text-xs bg-muted/60 p-2.5 rounded-md text-foreground/90 italic">
                          "{inv.message}"
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>
                          {new Date(inv.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>Status: Pending</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={loadingId === inv.id}
                          onClick={() => handleDecline(inv.id)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Decline
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1"
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
            <Card className="text-center py-14">
              <CardContent className="space-y-3 max-w-sm mx-auto">
                <Send className="h-10 w-10 mx-auto text-muted-foreground opacity-60" />
                <h3 className="font-semibold text-base">No sent requests</h3>
                <p className="text-xs text-muted-foreground">
                  When you request to join a team or invite students to your project, track their status here.
                </p>
                <div className="pt-2">
                  <Button asChild size="sm" variant="outline">
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
                    className="flex flex-col justify-between border-muted/80 hover:shadow-sm transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold">
                            {inv.team?.name || "Project Team"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {isJoinRequest
                              ? "Your join request to the team leader"
                              : `Invited: ${inv.to_user?.full_name || "Student"}`}
                          </p>
                        </div>

                        <Badge
                          variant={
                            isAccepted
                              ? "default"
                              : isDeclined
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[11px] h-5 gap-1 capitalize"
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
                        <p className="text-xs bg-muted/50 p-2.5 rounded text-muted-foreground italic">
                          "{inv.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
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

                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-muted-foreground hover:text-destructive"
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
                            className="h-8 text-xs gap-1.5"
                          >
                            <Link
                              href={
                                inv.to_user_id
                                  ? `/messages?userId=${inv.to_user_id}`
                                  : "/messages"
                              }
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Open Chat
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
