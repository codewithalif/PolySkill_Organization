"use client";

import { useState } from "react";
import {
  acceptInvitationAction,
  declineInvitationAction,
  type TeamInvitationWithDetails,
} from "@/actions/invitations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Check, X, Loader2 } from "lucide-react";

interface InvitationsClientProps {
  received: TeamInvitationWithDetails[];
  sent: TeamInvitationWithDetails[];
}

export function InvitationsClient({ received, sent }: InvitationsClientProps) {
  const [receivedList, setReceivedList] = useState(received);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAccept(id: string) {
    setLoadingId(id);
    try {
      const res = await acceptInvitationAction(id);
      if (res.success) {
        toast.success(res.message || "Invitation accepted!");
        setReceivedList((prev) => prev.filter((i) => i.id !== id));
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
      } else {
        toast.error(res.message || "Failed to decline");
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
        <h1 className="text-3xl font-bold tracking-tight">Team Invitations</h1>
        <p className="text-muted-foreground">
          Manage collaboration invitations from other polytechnic students.
        </p>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Received ({receivedList.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedList.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">No pending invitations</h3>
                <p className="text-xs text-muted-foreground">
                  When other team leaders invite you to join their project, they will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {receivedList.map((inv) => (
                <Card key={inv.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{inv.team?.name}</CardTitle>
                        <CardDescription className="text-xs">
                          From: {inv.from_user?.full_name} ({inv.from_user?.institute})
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{inv.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inv.message && (
                      <p className="text-sm bg-muted/50 p-3 rounded italic text-muted-foreground">
                        "{inv.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === inv.id}
                        onClick={() => handleDecline(inv.id)}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={loadingId === inv.id}
                        onClick={() => handleAccept(inv.id)}
                      >
                        {loadingId === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        )}
                        Accept & Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sent.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">No invitations sent yet</h3>
                <p className="text-xs text-muted-foreground">
                  Find candidates in Explore Students and invite them to your team.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sent.map((inv) => (
                <Card key={inv.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{inv.team?.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Invited: {inv.to_user?.full_name || "Student"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          inv.status === "accepted"
                            ? "default"
                            : inv.status === "declined"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inv.message && (
                      <p className="text-xs text-muted-foreground italic">
                        "{inv.message}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
