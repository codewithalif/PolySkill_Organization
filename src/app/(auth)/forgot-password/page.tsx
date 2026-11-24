"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await forgotPasswordAction({ email });
      if (!res.success) {
        setErrorMessage(res.message || "Failed to send reset link.");
        toast.error(res.message || "Failed to send reset link.");
      } else {
        setIsSent(true);
        toast.success(res.message || "Reset link sent!");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="border-white/[0.08] bg-[#111B2E]/75 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardContent className="pt-8 pb-7 flex flex-col items-center text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-[0_0_16px_rgba(66,214,164,0.2)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="font-heading text-xl text-foreground">Check your inbox</CardTitle>
          <CardDescription className="max-w-xs text-xs text-muted-foreground leading-relaxed">
            We sent a password reset link to{" "}
            <span className="font-semibold text-foreground font-mono">{email}</span>. Click the link to set a new password.
          </CardDescription>
          <Button asChild className="w-full mt-4 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs h-10 rounded-xl">
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.08] bg-[#111B2E]/75 backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-xl text-foreground">Forgot your password?</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter the email address registered with your PolySkill account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@polytechnic.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-white/[0.06]">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs h-10 rounded-xl" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>

          <p className="text-xs text-center text-muted-foreground font-mono">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
