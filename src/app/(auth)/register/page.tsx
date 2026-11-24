"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
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
import { INSTITUTES, DEPARTMENTS, SEMESTERS, GENDERS } from "@/lib/constants";
import { registerAction } from "@/actions/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>(GENDERS[0]);
  const [institute, setInstitute] = useState<(typeof INSTITUTES)[number]>(INSTITUTES[0]);
  const [department, setDepartment] = useState<(typeof DEPARTMENTS)[number]>(DEPARTMENTS[0]);
  const [semester, setSemester] = useState<(typeof SEMESTERS)[number]>(SEMESTERS[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
        whatsappNumber,
        gender,
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
        toast.success(res.message || "Welcome! Redirecting to your dashboard...");
        router.push("/dashboard");
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
        <CardTitle className="font-heading text-xl text-foreground">Create your account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Connect with polytechnic peers across Bangladesh.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. Tanvir Ahmed"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-400 font-mono">{fieldErrors.fullName[0]}</p>
            )}
          </div>

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
            {fieldErrors.email && (
              <p className="text-xs text-red-400 font-mono">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsappNumber" className="text-xs font-medium">WhatsApp Number</Label>
              <span className="text-[10px] text-muted-foreground font-mono">For direct contact</span>
            </div>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="e.g. 01712345678"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              disabled={isLoading}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
            />
            {fieldErrors.whatsappNumber && (
              <p className="text-xs text-red-400 font-mono">{fieldErrors.whatsappNumber[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
            <select
              id="gender"
              className="flex h-9 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50"
              value={gender}
              onChange={(e) => setGender(e.target.value as (typeof GENDERS)[number])}
              disabled={isLoading}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g} className="bg-[#111B2E] text-foreground">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters (at least 1 uppercase & 1 number)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-400 font-mono">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="institute" className="text-xs font-medium">Polytechnic Institute</Label>
            <select
              id="institute"
              className="flex h-9 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50"
              value={institute}
              onChange={(e) => setInstitute(e.target.value as (typeof INSTITUTES)[number])}
              disabled={isLoading}
            >
              {INSTITUTES.map((inst) => (
                <option key={inst} value={inst} className="bg-[#111B2E] text-foreground">
                  {inst}
                </option>
              ))}
            </select>
            {fieldErrors.institute && (
              <p className="text-xs text-red-400 font-mono">{fieldErrors.institute[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-medium">Department</Label>
              <select
                id="department"
                className="flex h-9 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50"
                value={department}
                onChange={(e) => setDepartment(e.target.value as (typeof DEPARTMENTS)[number])}
                disabled={isLoading}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#111B2E] text-foreground">
                    {dept}
                  </option>
                ))}
              </select>
              {fieldErrors.department && (
                <p className="text-xs text-red-400 font-mono">{fieldErrors.department[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semester" className="text-xs font-medium">Semester</Label>
              <select
                id="semester"
                className="flex h-9 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50"
                value={semester}
                onChange={(e) => setSemester(e.target.value as (typeof SEMESTERS)[number])}
                disabled={isLoading}
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem} className="bg-[#111B2E] text-foreground">
                    {sem}
                  </option>
                ))}
              </select>
              {fieldErrors.semester && (
                <p className="text-xs text-red-400 font-mono">{fieldErrors.semester[0]}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-white/[0.06]">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs h-10 rounded-xl" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Student Account
          </Button>

          <p className="text-xs text-center text-muted-foreground font-mono">
            Already have an account?{" "}
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
