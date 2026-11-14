"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveAnnouncementsAction, type AnnouncementItem } from "@/actions/announcements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Megaphone, Clock, User, ChevronRight, AlertCircle, Sparkles, Calendar, Wrench } from "lucide-react";

interface DashboardAnnouncementsProps {
  initialAnnouncements?: AnnouncementItem[];
}

export function DashboardAnnouncements({
  initialAnnouncements = [],
}: DashboardAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [selectedNotice, setSelectedNotice] = useState<AnnouncementItem | null>(null);

  // Real-time synchronization
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-announcements-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId));
            }
          } else {
            const res = await getActiveAnnouncementsAction();
            if (res.success && res.data) {
              setAnnouncements(res.data);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  const categoryBadge: Record<string, string> = {
    Important: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Maintenance: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Event: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    Feature: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    General: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-r from-card via-background to-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Platform Announcements
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Official notices and updates from PolySkill administrators
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {announcements.length} {announcements.length === 1 ? "Active Notice" : "Active Notices"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/40">
            {announcements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors hover:bg-muted/30 rounded-lg px-2 -mx-2"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${categoryBadge[item.category] || categoryBadge.General}`}
                    >
                      {item.category}
                    </Badge>
                    <span className="text-sm font-semibold truncate text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-primary hover:text-primary"
                    onClick={() => setSelectedNotice(item)}
                  >
                    View Details
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedNotice}
        onOpenChange={(open) => !open && setSelectedNotice(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={`text-xs ${selectedNotice ? categoryBadge[selectedNotice.category] || categoryBadge.General : ""}`}
              >
                {selectedNotice?.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedNotice?.created_at &&
                  new Date(selectedNotice.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {selectedNotice?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {selectedNotice?.content}
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                Posted by{" "}
                <span className="font-medium text-foreground">
                  {selectedNotice?.author?.full_name || "Administrator"}
                </span>
              </span>
            </div>
            <Button size="sm" onClick={() => setSelectedNotice(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
