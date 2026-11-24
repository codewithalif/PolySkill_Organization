"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await resetPasswordAction({
        password: newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your security preferences and account settings.
        </p>
      </div>

      {/* Password Change */}
      <Card className="border-white/[0.08] bg-[#111B2E]/70 backdrop-blur-xl rounded-2xl shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <KeyRound className="h-4 w-4" />
            </div>
            <CardTitle className="font-heading text-lg text-foreground">Change Password</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Update your account password to keep your profile secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="bg-white/[0.06]" />

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/[0.03] backdrop-blur-xl rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <CardTitle className="font-heading text-lg text-red-400">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Actions here are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-foreground">Delete Account</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your profile, skills, and associated records.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_14px_rgba(239,68,68,0.3)] text-xs"
              onClick={() =>
                toast.info(
                  "Account deletion is currently handled by admin request. Please contact support@polyskill.bd"
                )
              }
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
