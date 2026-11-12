"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeamAction } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEAM_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTeamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Recruiting" as "Planning" | "Recruiting" | "In Progress" | "Completed",
    maxMembers: 5,
    requiredSkills: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const skillsArray = formData.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsArray.length === 0) {
      toast.error("Please specify at least one required skill");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createTeamAction({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        maxMembers: formData.maxMembers,
        requiredSkills: skillsArray,
      });

      if (res.success) {
        toast.success("Team created successfully! You are the Team Leader.");
        router.push("/teams");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create team");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/teams">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Teams
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Project Team</CardTitle>
          <CardDescription>
            Assemble polytechnic students with complementary skills for your next project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g. PolyDevs, CircuitCrafters"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Team Description & Goals</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe what project you plan to build, expectations, and commitment level..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_STATUSES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Team Size</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="20"
                  value={formData.maxMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 5 })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
              <Input
                id="requiredSkills"
                placeholder="React, Node.js, UI/UX Design, Docker"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Our algorithm uses these skills to calculate match scores for candidate students.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button asChild variant="outline">
                <Link href="/teams">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Team...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" /> Form Team
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
