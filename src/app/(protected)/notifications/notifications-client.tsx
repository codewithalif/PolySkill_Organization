"use client";

import { useState } from "react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, CheckCheck, Mail, Users, FolderKanban, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Notification } from "@/types";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silent error
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await markAllNotificationsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "invitation":
        return <Mail className="h-5 w-5 text-purple-500" />;
      case "team":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "project":
        return <FolderKanban className="h-5 w-5 text-emerald-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary text-white border-0 font-mono text-[10px] shadow-[0_0_10px_rgba(120,107,250,0.4)]">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Activity and updates about your projects, invitations, and teams.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs">
            <CheckCheck className="mr-2 h-4 w-4 text-primary" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-3 max-w-sm mx-auto">
            <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground">All caught up!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You will receive notifications when peers interact with your projects or invite you to teams.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-all duration-200 cursor-pointer rounded-xl backdrop-blur-md ${
                notif.isRead
                  ? "bg-[#111B2E]/40 hover:bg-[#111B2E]/70 border-white/[0.06] opacity-75"
                  : "bg-[#111B2E]/90 hover:bg-[#111B2E] border-primary/40 shadow-[0_0_18px_rgba(120,107,250,0.15)]"
              }`}
              onClick={() => handleMarkRead(notif.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-0.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-heading font-semibold text-foreground">{notif.title}</h4>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.description}</p>
                  {notif.link && (
                    <Button asChild variant="link" className="p-0 h-auto text-xs mt-1 text-primary hover:text-primary/80">
                      <Link href={notif.link}>View Details →</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
