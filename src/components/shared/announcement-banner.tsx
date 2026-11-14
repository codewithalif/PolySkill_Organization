"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveAnnouncementsAction, type AnnouncementItem } from "@/actions/announcements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone,
  X,
  Sparkles,
  AlertCircle,
  Calendar,
  Wrench,
  ChevronRight,
  User,
  Clock,
  Radio,
} from "lucide-react";

interface AnnouncementBannerProps {
  initialAnnouncements?: AnnouncementItem[];
}

export function AnnouncementBanner({
  initialAnnouncements = [],
}: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  // Load dismissed state from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem("polyskill_dismissed_announcements");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Real-time listener for announcements
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("student-announcements-live")
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
          } else if (payload.eventType === "INSERT") {
            // New announcement posted by admin!
            const newRow = payload.new as any;
            // Refetch active list to get author joins
            const res = await getActiveAnnouncementsAction();
            if (res.success && res.data) {
              setAnnouncements(res.data);
            } else if (newRow) {
              setAnnouncements((prev) => [newRow, ...prev]);
            }
            // Ensure the newly created announcement is NOT dismissed so the student sees it immediately
            if (newRow?.id) {
              setDismissedIds((prev) => {
                const updated = { ...prev };
                delete updated[newRow.id];
                try {
                  localStorage.setItem("polyskill_dismissed_announcements", JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          } else if (payload.eventType === "UPDATE") {
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

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter((a) => a.is_published && !dismissedIds[a.id]);

  if (!isClient || activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[0];

  function handleDismiss(id: string) {
    setDismissedIds((prev) => {
      const updated = { ...prev, [id]: true };
      try {
        localStorage.setItem("polyskill_dismissed_announcements", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }

  const categoryStyles: Record<
    string,
    { badge: string; border: string; bg: string; icon: any }
  > = {
    Important: {
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      border: "border-rose-500/40",
      bg: "bg-gradient-to-r from-rose-500/10 via-background to-rose-500/5",
      icon: AlertCircle,
    },
    Maintenance: {
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      border: "border-amber-500/40",
      bg: "bg-gradient-to-r from-amber-500/10 via-background to-amber-500/5",
      icon: Wrench,
    },
    Event: {
      badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      border: "border-purple-500/40",
      bg: "bg-gradient-to-r from-purple-500/10 via-background to-purple-500/5",
      icon: Calendar,
    },
    Feature: {
      badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      border: "border-cyan-500/40",
      bg: "bg-gradient-to-r from-cyan-500/10 via-background to-cyan-500/5",
      icon: Sparkles,
    },
    General: {
      badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      border: "border-indigo-500/40",
      bg: "bg-gradient-to-r from-indigo-500/10 via-background to-indigo-500/5",
      icon: Megaphone,
    },
  };

  const style = categoryStyles[current.category] || categoryStyles.General;
  const CategoryIcon = style.icon;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border ${style.border} ${style.bg} p-3.5 shadow-sm transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2 mb-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Pulsing Alert Icon */}
            <div className="relative shrink-0 mt-0.5 sm:mt-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CategoryIcon className="h-4 w-4" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`text-[10px] font-semibold ${style.badge}`}>
                  {current.category}
                </Badge>
                <span className="text-xs font-semibold text-foreground truncate">
                  {current.title}
                </span>
                {activeAnnouncements.length > 1 && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    (+{activeAnnouncements.length - 1} more)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-3xl">
                {current.content}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs bg-background/60 hover:bg-background"
              onClick={() => setSelectedAnnouncement(current)}
            >
              Read Full Notice
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => handleDismiss(current.id)}
              title="Dismiss announcement"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Full Announcement Detail Dialog */}
      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-xs ${style.badge}`}>
                {selectedAnnouncement?.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedAnnouncement?.created_at &&
                  new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {selectedAnnouncement?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {selectedAnnouncement?.content}
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                Posted by{" "}
                <span className="font-medium text-foreground">
                  {selectedAnnouncement?.author?.full_name || "PolySkill Administrator"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedAnnouncement) {
                    handleDismiss(selectedAnnouncement.id);
                  }
                  setSelectedAnnouncement(null);
                }}
              >
                Dismiss Notice
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
