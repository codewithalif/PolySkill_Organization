"use client";

import { useEffect, useState, useTransition } from "react";
import { ThemeId, DEFAULT_THEME, STORAGE_KEY } from "./types";
import { NeuralWaveBackground } from "./neural-wave";
import { AuroraUniverseBackground } from "./aurora-universe";
import { CyberneticGridBackground } from "./cybernetic-grid";

interface HeroBackgroundContainerProps {
  currentTheme: ThemeId;
}

export function HeroBackgroundContainer({ currentTheme }: HeroBackgroundContainerProps) {
  const [displayedTheme, setDisplayedTheme] = useState<ThemeId>(currentTheme);
  const [opacity, setOpacity] = useState(1);
  const [, startTransition] = useTransition();

  // Handle smooth crossfade transition when theme changes
  useEffect(() => {
    if (currentTheme !== displayedTheme) {
      setOpacity(0);
      const timer = setTimeout(() => {
        startTransition(() => {
          setDisplayedTheme(currentTheme);
          setOpacity(1);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentTheme, displayedTheme]);

  return (
    <div
      className="absolute inset-0 pointer-events-none -z-10 transition-opacity duration-500 ease-out"
      style={{ opacity }}
    >
      {displayedTheme === "neural-wave" && <NeuralWaveBackground />}
      {displayedTheme === "aurora-universe" && <AuroraUniverseBackground />}
      {displayedTheme === "cybernetic-grid" && <CyberneticGridBackground />}

      {/* Subtle bottom vignette to blend seamlessly into next sections */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </div>
  );
}
