"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TeamWithScore } from "@/lib/skill-matching";
import { createTeamAction } from "@/actions/teams";
import { requestToJoinTeamAction } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Users,
  PlusCircle,
  Search,
  Sparkles,
  UserPlus,
  Clock,
  CheckCircle,
  ShieldCheck,
  Loader2,
  Filter,
  X,
  MessageSquare,
} from "lucide-react";

interface TeamsClientProps {
  initialTeams: TeamWithScore[];
  currentUserId?: string;
}

export function TeamsClient({ initialTeams, currentUserId }: TeamsClientProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithScore[]>(initialTeams);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Create Team Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    status: "Recruiting" as "Planning" | "Recruiting" | "In Progress" | "Completed",
    maxMembers: 4,
    requiredSkills: "",
  });

  // Request to Join Modal State
  const [joinModalTeam, setJoinModalTeam] = useState<TeamWithScore | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Extract unique popular skills across all teams
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    teams.forEach((t) => {
      (t.required_skills || []).forEach((s) => {
        if (s && s.trim()) skillSet.add(s.trim());
      });
    });
    return Array.from(skillSet).slice(0, 15);
  }, [teams]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        team.description.toLowerCase().includes(q) ||
        (team.required_skills || []).some((s) => s.toLowerCase().includes(q)) ||
        (team.leader?.full_name || "").toLowerCase().includes(q);

      const matchesSkill =
        !selectedSkill ||
        (team.required_skills || []).some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );

      return matchesSearch && matchesSkill;
    });
  }, [teams, searchQuery, selectedSkill]);

  // Handle Create Team
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.description.trim()) {
      toast.error("Please fill in team title and description");
      return;
    }

    const skillsArray = createForm.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsArray.length === 0) {
      toast.error("Please specify at least one needed skill or role");
      return;
    }

    setIsCreating(true);
    try {
      const res = await createTeamAction({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        status: createForm.status,
        maxMembers: Number(createForm.maxMembers) || 4,
        requiredSkills: skillsArray,
      });

      if (res.success && res.data?.id) {
        toast.success("Team post created successfully!");
        setIsCreateOpen(false);
        setCreateForm({
          name: "",
          description: "",
          status: "Recruiting",
          maxMembers: 4,
          requiredSkills: "",
        });
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create team");
      }
    } catch {
      toast.error("Failed to create team");
    } finally {
      setIsCreating(false);
    }
  }

  // Handle Request to Join
  async function handleConfirmJoin() {
    if (!joinModalTeam) return;

    setIsSubmittingJoin(true);
    try {
      const res = await requestToJoinTeamAction(joinModalTeam.id, joinMessage);
      if (res.success) {
        toast.success(res.message || "Join request sent to the team leader!");
        // Update local team state to reflect request sent
        setTeams((prev) =>
          prev.map((t) =>
            t.id === joinModalTeam.id ? { ...t, has_pending_request: true } : t
          )
        );
        setJoinModalTeam(null);
        setJoinMessage("");
      } else {
        toast.error(res.message || "Could not send join request");
      }
    } catch {
      toast.error("Failed to send join request");
    } finally {
      setIsSubmittingJoin(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none -z-10" />
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Team Finder</h1>
            <Badge variant="secondary" className="gap-1 font-mono text-xs bg-primary/15 text-primary border border-primary/30">
              <Users className="h-3.5 w-3.5" />
              {teams.length} Teams
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Discover student collaboration teams, find project partners, or recruit polytechnic talent.
          </p>
        </div>

        {/* Create Team Modal Trigger */}
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#6355EE] hover:opacity-95 text-xs text-white shadow-[0_0_15px_-3px_rgba(120,107,250,0.4)]">
          <PlusCircle className="h-4 w-4" /> Create Team Post
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg glass-panel-elevated rounded-2xl border-border/60">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Create Team Collaboration Post</DialogTitle>
              <DialogDescription className="text-xs">
                Describe your project, specify the skills you need, and recruit team members.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="team-name" className="text-xs font-semibold">Project / Team Title *</Label>
                <Input
                  id="team-name"
                  placeholder="e.g. IoT Smart Home Automation or AI Resume Analyzer"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl border-border/70 bg-card/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="team-desc" className="text-xs font-semibold">Description & Goals *</Label>
                <Textarea
                  id="team-desc"
                  rows={3}
                  placeholder="Briefly explain what the project is about, what problem it solves, and how your team will collaborate..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="rounded-xl border-border/70 bg-card/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="team-skills" className="text-xs font-semibold">Needed Roles / Skills * (Comma separated)</Label>
                <Input
                  id="team-skills"
                  placeholder="e.g. React, Node.js, Arduino, UI/UX Designer, Python"
                  value={createForm.requiredSkills}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, requiredSkills: e.target.value }))
                  }
                  className="rounded-xl border-border/70 bg-card/60"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate multiple skills or roles with commas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="team-members" className="text-xs font-semibold">Max Members</Label>
                  <Select
                    value={String(createForm.maxMembers)}
                    onValueChange={(val) =>
                      setCreateForm((p) => ({ ...p, maxMembers: Number(val) || 4 }))
                    }
                  >
                    <SelectTrigger id="team-members" className="rounded-xl border-border/70 bg-card/60">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel-elevated">
                      <SelectItem value="2">2 Members</SelectItem>
                      <SelectItem value="3">3 Members</SelectItem>
                      <SelectItem value="4">4 Members</SelectItem>
                      <SelectItem value="5">5 Members</SelectItem>
                      <SelectItem value="6">6 Members</SelectItem>
                      <SelectItem value="8">8 Members</SelectItem>
                      <SelectItem value="10">10 Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="team-status" className="text-xs font-semibold">Current Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(val: any) =>
                      setCreateForm((p) => ({ ...p, status: val }))
                    }
                  >
                    <SelectTrigger id="team-status" className="rounded-xl border-border/70 bg-card/60">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel-elevated">
                      <SelectItem value="Recruiting">Recruiting (Open)</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="gap-2 rounded-xl text-xs bg-gradient-to-r from-primary to-[#6355EE] text-white">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Publish Team Post"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-3 p-4 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by project name, description, role, or leader..."
            className="pl-10 pr-9 rounded-xl border-border/70 bg-card/60 text-xs sm:text-sm h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Skill / Role Filter Pills */}
        {availableSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-cyan-400" /> Filter:
            </span>
            <Button
              variant={selectedSkill === null ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs rounded-full px-3 transition-all",
                selectedSkill === null
                  ? "bg-primary text-white border-primary shadow-[0_0_12px_-2px_rgba(120,107,250,0.4)]"
                  : "border-border/60 hover:bg-card/80 text-muted-foreground"
              )}
              onClick={() => setSelectedSkill(null)}
            >
              All Skills
            </Button>
            {availableSkills.map((skill) => {
              const active = selectedSkill?.toLowerCase() === skill.toLowerCase();
              return (
                <Button
                  key={skill}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs rounded-full px-3 transition-all",
                    active
                      ? "bg-primary text-white border-primary shadow-[0_0_12px_-2px_rgba(120,107,250,0.4)]"
                      : "border-border/60 hover:bg-card/80 text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setSelectedSkill(active ? null : skill)}
                >
                  {skill}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Cards Grid */}
      {filteredTeams.length === 0 ? (
        <Card className="text-center py-16 border-white/[0.08] bg-[#111B2E]/50 backdrop-blur-md rounded-2xl">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-muted-foreground">
              <Users className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg text-foreground">No teams found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedSkill
                  ? "No team matches your search filters. Try clearing your search or skill selection."
                  : "No open team posts yet. Be the first to start a team and invite your peers!"}
              </p>
            </div>
            {searchQuery || selectedSkill ? (
              <Button
                variant="outline"
                size="sm"
                className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-foreground"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkill(null);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-3px_rgba(120,107,250,0.4)]">
                <PlusCircle className="h-4 w-4" /> Post a Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const isLeader =
              team.is_leader ||
              (currentUserId && team.created_by === currentUserId);
            const isMember = team.is_member;
            const hasRequested = team.has_pending_request;
            const isFull = (team.member_count || 0) >= team.max_members;
            const isCompleted = team.status === "Completed";

            return (
              <Card
                key={team.id}
                className="flex flex-col justify-between border-white/[0.08] bg-[#111B2E]/65 hover:bg-[#111B2E]/90 backdrop-blur-md hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 rounded-xl group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-heading text-base font-semibold leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                      {team.name}
                    </CardTitle>
                    {team.matchScore > 0 && (
                      <Badge
                        variant="default"
                        className="bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 text-[11px] font-mono shrink-0 shadow-[0_0_12px_rgba(66,214,164,0.15)]"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-400" /> {team.matchScore}% Match
                      </Badge>
                    )}
                  </div>

                  {/* Leader info & member count */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 ring-1 ring-white/10">
                        <AvatarImage src={team.leader?.avatar_url || ""} />
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                          {team.leader?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[120px] text-muted-foreground font-medium">
                        {team.leader?.full_name || "Team Leader"}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[11px] gap-1 font-mono border-white/[0.08] bg-white/[0.03] text-muted-foreground"
                    >
                      <Users className="h-3 w-3" />
                      {team.member_count} / {team.max_members}
                    </Badge>
                  </div>

                  <CardDescription className="line-clamp-2 text-xs pt-2 text-muted-foreground leading-relaxed">
                    {team.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Needed Roles / Skills */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                      Needed Skills / Roles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(team.required_skills || []).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-[11px] font-mono bg-white/[0.04] text-secondary-foreground hover:bg-primary/20 hover:text-white hover:border-primary/40 border border-white/[0.06] transition-all cursor-pointer"
                          onClick={() => setSelectedSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">Status:</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-5 font-mono",
                        team.status === "Recruiting"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : team.status === "Completed"
                          ? "bg-white/[0.04] text-muted-foreground border-white/[0.08]"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      )}
                    >
                      {team.status}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    {isLeader ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled
                        className="w-full text-xs gap-1.5 bg-primary/10 text-primary border border-primary/25 cursor-default font-medium"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Your Team (Leader)
                      </Button>
                    ) : isMember ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled
                        className="w-full text-xs gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 cursor-default font-medium"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Already a Member
                      </Button>
                    ) : hasRequested ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="w-full text-xs gap-1.5 text-amber-400 border-amber-500/30 bg-amber-500/10 cursor-default font-medium"
                      >
                        <Clock className="h-3.5 w-3.5 animate-pulse" /> Request Pending
                      </Button>
                    ) : isFull || isCompleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="w-full text-xs border-white/[0.08] bg-white/[0.03] text-muted-foreground"
                      >
                        Team Full
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-[0_0_14px_-3px_rgba(120,107,250,0.5)]"
                        onClick={() => {
                          setJoinModalTeam(team);
                          setJoinMessage("");
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Request to Join
                      </Button>
                    )}

                    {/* Quick message leader button if not author */}
                    {!isLeader && team.leader?.id && (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="px-2.5 shrink-0 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground"
                        title="Chat with Leader"
                      >
                        <Link href={`/messages?userId=${team.leader.id}`}>
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Join Request Confirmation Dialog */}
      <Dialog
        open={!!joinModalTeam}
        onOpenChange={(open) => !open && setJoinModalTeam(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#0D1525]/95 border-white/[0.1] backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Join "{joinModalTeam?.name}"</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
              Send a request to the team leader ({joinModalTeam?.leader?.full_name || "Leader"}). Once accepted, you'll become a team member and a chat will open.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="join-message" className="text-xs font-medium">Introduction / Note (Optional)</Label>
              <Textarea
                id="join-message"
                rows={3}
                placeholder="e.g. Hi! I have experience with the required skills and would love to contribute to this project."
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                className="bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setJoinModalTeam(null)}
              disabled={isSubmittingJoin}
              className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmJoin}
              disabled={isSubmittingJoin}
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-[0_0_16px_-3px_rgba(120,107,250,0.5)]"
            >
              {isSubmittingJoin ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
