"use client";

import { useState } from "react";
import { updateProfileAction, uploadAvatarAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPARTMENTS,
  SEMESTERS,
  INSTITUTES,
  EXPERIENCE_LEVELS,
  GENDERS,
} from "@/lib/constants";
import { toast } from "sonner";
import { Upload, Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  initialProfile: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    whatsappNumber?: string;
    gender?: "Male" | "Female" | "Other";
    avatar?: string;
    institute: string;
    department: string;
    semester: string;
    bio?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  };
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialProfile.fullName,
    username: initialProfile.username || "",
    whatsappNumber: initialProfile.whatsappNumber || "",
    gender: (initialProfile.gender as "Male" | "Female") || "Male",
    bio: initialProfile.bio || "",
    institute: initialProfile.institute,
    department: initialProfile.department,
    semester: initialProfile.semester,
    githubUrl: initialProfile.githubUrl || "",
    portfolioUrl: initialProfile.portfolioUrl || "",
    linkedinUrl: initialProfile.linkedinUrl || "",
    facebookUrl: initialProfile.facebookUrl || "",
    instagramUrl: initialProfile.instagramUrl || "",
    experienceLevel: initialProfile.experienceLevel,
  });

  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setIsUploading(true);
    try {
      const res = await uploadAvatarAction(uploadData);
      if (res.success && res.data) {
        setAvatarUrl(res.data.avatarUrl);
        toast.success("Profile picture updated!");
      } else {
        toast.error(res.message || "Failed to upload avatar");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateProfileAction({
        fullName: formData.fullName,
        username: formData.username.trim().toLowerCase(),
        whatsappNumber: formData.whatsappNumber ? formData.whatsappNumber.trim() : undefined,
        gender: formData.gender as "Male" | "Female",
        bio: formData.bio || undefined,
        institute: formData.institute as any,
        department: formData.department as any,
        semester: formData.semester as any,
        githubUrl: formData.githubUrl || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        facebookUrl: formData.facebookUrl || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        experienceLevel: formData.experienceLevel,
      });

      if (res.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = formData.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <Card className="border-white/[0.08] bg-[#111B2E]/70 backdrop-blur-xl rounded-2xl shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">Profile Picture</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Upload an avatar to personalize your account</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20 ring-2 ring-primary/40 shadow-lg">
            <AvatarImage src={avatarUrl} alt={formData.fullName} />
            <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-medium cursor-pointer shadow-[0_0_14px_rgba(120,107,250,0.4)] transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Change Avatar
                </>
              )}
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              JPG, PNG, GIF or WebP. Max 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-white/[0.08] bg-[#111B2E]/70 backdrop-blur-xl rounded-2xl shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">Personal Information</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Details that other polytechnic students will see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, gender: val as "Male" | "Female" });
                }}
              >
                <SelectTrigger id="gender" className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                  <SelectValue />
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
            <div className="space-y-1.5">
              <Label htmlFor="whatsappNumber" className="text-xs font-medium">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="e.g. 01712345678"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono select-none">
                  @
                </span>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  className="pl-7 font-mono text-xs bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground"
                  placeholder="your_username"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Profile: <span className="text-primary font-medium">/explore/students/{formData.username || "username"}</span>
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-medium">About / Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Tell others what technologies you love building with..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs leading-relaxed"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Institute</Label>
              <Select
                value={formData.institute}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, institute: val });
                }}
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                  {INSTITUTES.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, department: val });
                }}
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, semester: val });
                }}
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Overall Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(val: any) => setFormData({ ...formData, experienceLevel: val })}
            >
              <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111B2E] border-white/[0.1] text-foreground">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Online Profiles */}
      <Card className="border-white/[0.08] bg-[#111B2E]/70 backdrop-blur-xl rounded-2xl shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">Links & Portfolio</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Connect your code and professional profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="githubUrl" className="text-xs font-medium">GitHub URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/your-username"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedinUrl" className="text-xs font-medium">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              placeholder="https://linkedin.com/in/your-profile"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="facebookUrl" className="text-xs font-medium">Facebook Profile URL</Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/your.username"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagramUrl" className="text-xs font-medium">Instagram Profile URL</Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/your_handle"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="portfolioUrl" className="text-xs font-medium">Personal Portfolio Website</Label>
            <Input
              id="portfolioUrl"
              placeholder="https://yourwebsite.com"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-foreground text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="min-w-[140px] bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_rgba(120,107,250,0.4)] text-xs"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
