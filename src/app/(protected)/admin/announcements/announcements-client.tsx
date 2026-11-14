"use client";

import { useState, useEffect } from "react";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  getAdminAnnouncementsAction,
} from "@/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Megaphone, Trash2, Send, Loader2, Radio, AlertTriangle } from "lucide-react";

interface AnnouncementsClientProps {
  initialAnnouncements: any[];
}

const CATEGORIES = ["General", "Maintenance", "Event", "Feature", "Important"] as const;

export function AnnouncementsAdminClient({
  initialAnnouncements,
}: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Subscribe to real-time changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-announcements-channel")
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
            // For INSERT and UPDATE, fetch populated rows with author joins
            const res = await getAdminAnnouncementsAction();
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

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createAnnouncementAction({
        title,
        content,
        category,
      });

      if (res.success) {
        toast.success(res.message);
        if (res.data) {
          setAnnouncements((prev) => [res.data, ...prev.filter((a) => a.id !== res.data.id)]);
        }
        setTitle("");
        setContent("");
      } else {
        toast.error(res.message || "Failed to publish");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    setLoadingId(id);
    try {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        toast.success(res.message);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setDeleteTarget(null);
      } else {
        toast.error(res.message || "Failed to delete");
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
        <h1 className="text-3xl font-bold tracking-tight">Website Announcements</h1>
        <p className="text-muted-foreground">
          Broadcast platform notices, hackathon events, and system updates to all polytechnic students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Publish Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Post Notice</CardTitle>
            <CardDescription>
              Broadcasted announcements will be visible to community members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePublish} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Dhaka Polytechnic Hackathon 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notice Content</Label>
                <Textarea
                  rows={4}
                  placeholder="Details of the announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Broadcast Announcement
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Published Notices ({announcements.length})</CardTitle>
            <CardDescription>History of platform announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Megaphone className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
                No announcements published yet.
              </div>
            ) : (
              <div className="divide-y max-h-[550px] overflow-y-auto">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.title}</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line max-w-xl">
                        {item.content}
                      </p>
                      <div className="text-xs text-muted-foreground pt-1">
                        Posted on: {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-8"
                      disabled={loadingId === item.id}
                      onClick={() => setDeleteTarget(item)}
                    >
                      {loadingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Remove Announcement</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>?
              <br />
              <br />
              <span className="text-xs text-muted-foreground block">
                This notice will immediately disappear in real-time from all logged-in students&apos; dashboards and announcement banners.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={loadingId === deleteTarget?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loadingId === deleteTarget?.id}
            >
              {loadingId === deleteTarget?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Remove Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
