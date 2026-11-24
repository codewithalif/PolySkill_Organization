"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loginAction } from "@/actions/auth";
import { GENDERS } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAction({
        email,
        password,
        gender: (gender as "Male" | "Female") || undefined,
      });
      if (!res.success) {
        setErrorMessage(res.message || "Failed to log in.");
        toast.error(res.message || "Failed to log in.");
      } else {
        toast.success(res.message || "Logged in successfully!");
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/[0.08] bg-[#111B2E]/75 backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-xl text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your email and password to access your PolySkill account.
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-mono"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
            <Select
              value={gender}
              onValueChange={(val) => setGender((val as "Male" | "Female") || "")}
              disabled={isLoading}
            >
              <SelectTrigger id="gender" className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                <SelectValue placeholder="Select gender (Male / Female)" />
              </SelectTrigger>
              <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-white/[0.06]">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs h-10 rounded-xl" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <p className="text-xs text-center text-muted-foreground font-mono">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline ml-1"
            >
              Join PolySkill
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
