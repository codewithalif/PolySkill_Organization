"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, ArrowRight, Zap } from "lucide-react";

interface ProfileCompletionBannerProps {
  profileCompletion: number;
  hasSkills: boolean;
  username: string;
}

/**
 * Dismissible banner shown on the Team Finder page when a student's profile
 * is not yet complete (< 80%) or they have no skills added.
 *
 * Adding skills and completing your profile helps the AI match-score algorithm
 * rank your profile highly when team leaders are searching for collaborators.
 */
export function ProfileCompletionBanner({
  profileCompletion,
  hasSkills,
  username,
}: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Show only if profile completion is below 80% or no skills recorded
  const needsAttention = profileCompletion < 80 || !hasSkills;

  if (dismissed || !needsAttention) return null;

  const missingItems: string[] = [];
  if (!hasSkills) missingItems.push("Add your skills");
  if (profileCompletion < 80) missingItems.push("Complete your profile");

  return (
    <div className="relative mb-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/8 to-emerald-500/5 p-4 pr-10">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-foreground">
                Boost your Team Finder visibility
              </p>
              <Badge variant="secondary" className="text-[10px] h-4.5 gap-1 font-normal">
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                {profileCompletion}% complete
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              {!hasSkills
                ? "Add your skills to your profile so the AI can match you with the right teams — and so team leaders can discover and invite you."
                : "Complete your profile with a bio, GitHub link, or portfolio so team leaders can learn more about you before sending an invite."}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {missingItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-12 sm:ml-0 shrink-0">
          {!hasSkills && (
            <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <Link href="/skills">
                <Zap className="h-3.5 w-3.5" /> Add Skills
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="h-8 text-xs gap-1.5">
            <Link href="/profile">
              Complete Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
