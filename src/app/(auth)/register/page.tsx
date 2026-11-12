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
import { INSTITUTES, DEPARTMENTS, SEMESTERS } from "@/lib/constants";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institute, setInstitute] = useState<(typeof INSTITUTES)[number]>(INSTITUTES[0]);
  const [department, setDepartment] = useState<(typeof DEPARTMENTS)[number]>(DEPARTMENTS[0]);
  const [semester, setSemester] = useState<(typeof SEMESTERS)[number]>(SEMESTERS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await registerAction({
        fullName,
        email,
        password,
        institute,
        department,
        semester,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Registration failed.");
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        toast.error(res.message || "Registration failed.");
      } else {
        setIsSuccess(true);
        toast.success(res.message || "Account created! Check your email.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="shadow-lg border-muted">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription className="max-w-xs">
            We have sent a verification link to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Please click the link in your inbox to activate your PolySkill account.
          </CardDescription>
          <Button asChild className="w-full mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Connect with polytechnic peers across Bangladesh.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. Tanvir Ahmed"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-destructive">{fieldErrors.fullName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@polytechnic.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters (at least 1 uppercase & 1 number)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="institute">Polytechnic Institute</Label>
            <select
              id="institute"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
              value={institute}
              onChange={(e) => setInstitute(e.target.value as (typeof INSTITUTES)[number])}
              disabled={isLoading}
            >
              {INSTITUTES.map((inst) => (
                <option key={inst} value={inst} className="bg-popover text-popover-foreground">
                  {inst}
                </option>
              ))}
            </select>
            {fieldErrors.institute && (
              <p className="text-xs text-destructive">{fieldErrors.institute[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                value={department}
                onChange={(e) => setDepartment(e.target.value as (typeof DEPARTMENTS)[number])}
                disabled={isLoading}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-popover text-popover-foreground">
                    {dept}
                  </option>
                ))}
              </select>
              {fieldErrors.department && (
                <p className="text-xs text-destructive">{fieldErrors.department[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <select
                id="semester"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                value={semester}
                onChange={(e) => setSemester(e.target.value as (typeof SEMESTERS)[number])}
                disabled={isLoading}
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem} className="bg-popover text-popover-foreground">
                    {sem}
                  </option>
                ))}
              </select>
              {fieldErrors.semester && (
                <p className="text-xs text-destructive">{fieldErrors.semester[0]}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Student Account
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
