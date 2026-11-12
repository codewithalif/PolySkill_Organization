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
} from "@/lib/constants";
import { toast } from "sonner";
import { Upload, Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  initialProfile: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    rollNumber?: string;
    avatar?: string;
    institute: string;
    department: string;
    semester: string;
    bio?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  };
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialProfile.fullName,
    rollNumber: initialProfile.rollNumber || "",
    bio: initialProfile.bio || "",
    institute: initialProfile.institute,
    department: initialProfile.department,
    semester: initialProfile.semester,
    githubUrl: initialProfile.githubUrl || "",
    portfolioUrl: initialProfile.portfolioUrl || "",
    linkedinUrl: initialProfile.linkedinUrl || "",
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
        bio: formData.bio || undefined,
        institute: formData.institute as any,
        department: formData.department as any,
        semester: formData.semester as any,
        githubUrl: formData.githubUrl || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
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
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload an avatar to personalize your account</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={formData.fullName} />
            <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium cursor-pointer"
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
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, GIF or WebP. Max 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Details that other polytechnic students will see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Board Roll / Roll No</Label>
              <Input
                id="rollNumber"
                placeholder="e.g. 612345"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={initialProfile.username} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About / Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Tell others what technologies you love building with..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Institute</Label>
              <Select
                value={formData.institute}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, institute: val });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTES.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, department: val });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(val) => {
                  if (val) setFormData({ ...formData, semester: val });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Overall Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(val: any) => setFormData({ ...formData, experienceLevel: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
      <Card>
        <CardHeader>
          <CardTitle>Links & Portfolio</CardTitle>
          <CardDescription>Connect your code and professional profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/your-username"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              placeholder="https://linkedin.com/in/your-profile"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Personal Portfolio Website</Label>
            <Input
              id="portfolioUrl"
              placeholder="https://yourwebsite.com"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="min-w-[140px]">
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
