"use client";

import { useEffect } from "react";

/**
 * SyncUserSession
 *
 * Invisible component that fires a single background POST to /api/users/sync
 * on the first render after login. This ensures that any user whose profile
 * row is missing (e.g. trigger failed on signup, or they logged in before the
 * profiles migration) is automatically recovered without forcing a logout.
 *
 * Also updates last_login_at for existing users on each session start.
 */
export function SyncUserSession({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    // Fire and forget — we don't need to wait for or display the result
    fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // No body needed; auth is read server-side from cookies
    }).catch(() => {
      // Silent fail — sync is best-effort
    });
  }, [userId]);

  return null;
}
