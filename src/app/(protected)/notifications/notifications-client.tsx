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
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </div>
          <p className="text-muted-foreground">
            Activity and updates about your projects, invitations, and teams.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-semibold">All caught up!</h3>
            <p className="text-xs text-muted-foreground">
              You will receive notifications when peers interact with your projects or invite you to teams.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-colors cursor-pointer ${
                notif.isRead ? "opacity-80" : "border-primary/40 bg-accent/20"
              }`}
              onClick={() => handleMarkRead(notif.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{notif.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notif.description}</p>
                  {notif.link && (
                    <Button asChild variant="link" className="p-0 h-auto text-xs mt-1">
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
