"use client";

import { useEffect, useRef } from "react";

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  colorDark: string;
  colorLight: string;
}

export function AuroraUniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = !document.hidden;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: StarParticle[] = [];

    const starColorsDark = [
      "rgba(244, 246, 252, ", // pearl white
      "rgba(53, 198, 216, ",  // cyan
      "rgba(120, 107, 250, ", // indigo
      "rgba(66, 214, 164, ",  // mint / teal
    ];

    const starColorsLight = [
      "rgba(99, 85, 238, ",   // rich indigo
      "rgba(14, 165, 233, ",  // sky blue
      "rgba(120, 107, 250, ", // violet
      "rgba(16, 185, 129, ",  // emerald
    ];

    const initStars = () => {
      stars = [];
      const count = Math.min(Math.floor((width * height) / 10000), 80);
      for (let i = 0; i < count; i++) {
        const cIdx = Math.floor(Math.random() * starColorsDark.length);
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: 0.0015 + Math.random() * 0.0025,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.25 - 0.05, // gentle upward drift
          colorDark: starColorsDark[cIdx],
          colorLight: starColorsLight[cIdx],
        });
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initStars();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const drawAuroraRibbon = (
      time: number,
      yOffsetPercent: number,
      amp: number,
      freq: number,
      speed: number,
      colorStops: { stop: number; color: string }[]
    ) => {
      const baseY = height * yOffsetPercent;
      const step = 20;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      for (let x = 0; x <= width; x += step) {
        const angle = (x * freq) + time * speed;
        const wave = Math.sin(angle) * amp + Math.cos(angle * 0.5 + time * speed * 0.7) * (amp * 0.5);
        ctx.lineTo(x, baseY + wave);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const ribbonGrad = ctx.createLinearGradient(0, baseY - amp, 0, height);
      colorStops.forEach((cs) => {
        ribbonGrad.addColorStop(cs.stop, cs.color);
      });

      ctx.fillStyle = ribbonGrad;
      ctx.fill();
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");

      // Backdrop gradient
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        spaceGrad.addColorStop(0, "rgba(8, 13, 25, 0.95)");
        spaceGrad.addColorStop(0.5, "rgba(13, 21, 37, 0.85)");
        spaceGrad.addColorStop(1, "rgba(8, 13, 25, 1)");
      } else {
        spaceGrad.addColorStop(0, "rgba(248, 250, 252, 0.95)");
        spaceGrad.addColorStop(0.5, "rgba(241, 245, 249, 0.85)");
        spaceGrad.addColorStop(1, "rgba(248, 250, 252, 1)");
      }
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // Aurora ribbons
      ctx.save();
      ctx.globalCompositeOperation = isDark ? "screen" : "source-over";

      // Aurora Curtain 1: Indigo & Violet
      drawAuroraRibbon(
        time,
        0.18,
        45,
        0.003,
        0.0006,
        isDark
          ? [
              { stop: 0, color: "rgba(120, 107, 250, 0.28)" },
              { stop: 0.4, color: "rgba(99, 85, 238, 0.15)" },
              { stop: 1, color: "rgba(0, 0, 0, 0)" },
            ]
          : [
              { stop: 0, color: "rgba(120, 107, 250, 0.12)" },
              { stop: 0.4, color: "rgba(99, 85, 238, 0.06)" },
              { stop: 1, color: "rgba(248, 250, 252, 0)" },
            ]
      );

      // Aurora Curtain 2: Cyan & Emerald Glow
      drawAuroraRibbon(
        time,
        0.28,
        55,
        0.0035,
        -0.0007,
        isDark
          ? [
              { stop: 0, color: "rgba(53, 198, 216, 0.25)" },
              { stop: 0.35, color: "rgba(66, 214, 164, 0.14)" },
              { stop: 1, color: "rgba(0, 0, 0, 0)" },
            ]
          : [
              { stop: 0, color: "rgba(14, 165, 233, 0.10)" },
              { stop: 0.35, color: "rgba(16, 185, 129, 0.05)" },
              { stop: 1, color: "rgba(248, 250, 252, 0)" },
            ]
      );

      // Aurora Curtain 3: Upper Lavender / Sky Shimmer
      drawAuroraRibbon(
        time,
        0.08,
        35,
        0.004,
        0.0009,
        isDark
          ? [
              { stop: 0, color: "rgba(155, 140, 250, 0.2)" },
              { stop: 0.5, color: "rgba(53, 198, 216, 0.08)" },
              { stop: 1, color: "rgba(0, 0, 0, 0)" },
            ]
          : [
              { stop: 0, color: "rgba(120, 107, 250, 0.08)" },
              { stop: 0.5, color: "rgba(53, 198, 216, 0.04)" },
              { stop: 1, color: "rgba(248, 250, 252, 0)" },
            ]
      );

      ctx.restore();

      // Floating particles / stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!prefersReducedMotion) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.y < 0) s.y = height;
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
        }

        const twinkle = prefersReducedMotion
          ? s.alpha
          : s.alpha * (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinklePhase));

        const baseColor = isDark ? s.colorDark : s.colorLight;

        // Halo
        const glowRadius = s.radius * (isDark ? 3 : 2);
        const starGlow = ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          glowRadius
        );
        starGlow.addColorStop(0, `${baseColor}${twinkle * (isDark ? 1 : 0.6)})`);
        starGlow.addColorStop(1, `${baseColor}0)`);

        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${Math.min(twinkle * 1.2, 1)})`
          : `rgba(99, 85, 238, ${Math.min(twinkle * 0.9, 0.9)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let start = performance.now();
    const loop = (timestamp: number) => {
      if (!isVisible) return;
      const elapsed = timestamp - start;
      renderFrame(elapsed);
      animId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        start = performance.now();
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-hidden="true"
      />
    </div>
  );
}
