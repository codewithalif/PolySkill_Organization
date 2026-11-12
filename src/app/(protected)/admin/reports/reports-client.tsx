"use client";

import { useState } from "react";
import { updateReportStatusAction } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Flag, Loader2 } from "lucide-react";

interface ReportsClientProps {
  initialReports: any[];
}

export function ReportsAdminClient({ initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(reportId: string, status: "resolved" | "dismissed") {
    setLoadingId(reportId);
    try {
      const res = await updateReportStatusAction(reportId, status);
      if (res.success) {
        toast.success(res.message);
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Reports</h1>
          {pendingCount > 0 && <Badge variant="destructive">{pendingCount} Pending</Badge>}
        </div>
        <p className="text-muted-foreground">
          User-flagged content requiring administrative inspection and decision.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Queue ({reports.length})</CardTitle>
          <CardDescription>
            Dismiss invalid reports or resolve after taking appropriate moderation action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Flag className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              No content reports have been submitted. All good!
            </div>
          ) : (
            <div className="divide-y">
              {reports.map((rep) => {
                const isLoading = loadingId === rep.id;
                const isPending = rep.status === "pending";

                return (
                  <div
                    key={rep.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {rep.target_title || "Reported Item"}
                        </span>
                        <Badge variant="outline">{rep.type}</Badge>
                        <Badge
                          variant={
                            rep.status === "resolved"
                              ? "default"
                              : rep.status === "dismissed"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {rep.status}
                        </Badge>
                      </div>
                      <p className="text-sm bg-muted/50 p-2.5 rounded text-foreground max-w-xl">
                        "{rep.reason}"
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Reported by: {rep.reporter?.full_name || "User"} •{" "}
                        {new Date(rep.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => handleAction(rep.id, "dismissed")}
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                        </Button>
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleAction(rep.id, "resolved")}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          )}
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
