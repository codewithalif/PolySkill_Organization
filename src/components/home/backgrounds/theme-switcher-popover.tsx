"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_OPTIONS, DEFAULT_THEME, ThemeId } from "./types";
import { Palette, Check, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSwitcherPopoverProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export function ThemeSwitcherPopover({
  currentTheme,
  onSelectTheme,
}: ThemeSwitcherPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (theme: ThemeId) => {
    onSelectTheme(theme);
    setIsOpen(false);
  };

  const handleReset = () => {
    handleSelect(DEFAULT_THEME);
  };

  const activeThemeMeta =
    THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        data-auth-exempt="true"
        aria-label="Explore interactive background themes"
        className={cn(
          "group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium",
          "border border-border/80 bg-card/90 hover:bg-card text-foreground/80 hover:text-foreground",
          "dark:border-border/60 dark:bg-card/40 dark:hover:bg-card/70 dark:text-muted-foreground dark:hover:text-foreground",
          "backdrop-blur-md shadow-xs hover:shadow-md hover:shadow-primary/10",
          "transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary group-hover:scale-110 transition-transform">
          <Palette className="h-2.5 w-2.5" />
        </span>
        <span className="text-[11px] sm:text-xs tracking-wide">
          Theme: <span className="text-foreground font-semibold">{activeThemeMeta.name}</span>
        </span>
        <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400 animate-pulse ml-0.5 opacity-90" />
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={8}
        className="w-80 sm:w-88 p-3 rounded-2xl bg-card/98 dark:bg-card/95 backdrop-blur-xl border-border/80 shadow-xl dark:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 text-primary border border-primary/20">
              <Palette className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                Hero Atmosphere
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Select an interactive canvas theme
              </p>
            </div>
          </div>
          {currentTheme !== DEFAULT_THEME && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md gap-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </Button>
          )}
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-2">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme.id)}
                className={cn(
                  "flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer relative group",
                  isSelected
                    ? "bg-primary/10 border border-primary/40 shadow-[0_0_15px_-4px_rgba(120,107,250,0.3)]"
                    : "hover:bg-muted/60 border border-transparent hover:border-border/60"
                )}
              >
                {/* Visual Thumbnail Swatch */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg shrink-0 overflow-hidden relative border transition-transform group-hover:scale-105",
                    isSelected ? "border-primary/60 shadow-inner" : "border-border/60"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${theme.previewColors[0]}, ${theme.previewColors[1]}, ${theme.previewColors[2]})`,
                  }}
                >
                  <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-background/90 flex items-center justify-center text-primary shadow-sm">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/50 ring-2 ring-white/20" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={cn(
                        "text-xs font-semibold truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {theme.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4 border-none",
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {theme.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground/80 px-1">
          <span>Saves to your browser</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-medium">GPU-accelerated Canvas</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
