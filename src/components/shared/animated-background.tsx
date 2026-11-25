"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
}

export function AnimatedBackground() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  useEffect(() => {
    if (!isMounted) return;

    // On mobile screens (< 768px), disable the particle canvas entirely.
    // The CSS ambient orbs and tech grid already provide a beautiful backdrop
    // without burdening mobile GPU/battery with a second continuous 60fps loop.
    if (window.innerWidth < 768) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = !document.hidden;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isDark = resolvedTheme === "dark";

    const particleCount = 38;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.6 + 1,
        baseAlpha: Math.random() * 0.35 + 0.2,
      });
    }

    const onResize = () => {
      if (!canvas) return;
      if (window.innerWidth < 768) {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, width, height);
        return;
      }
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const onMouseLeave = () => {
      mousePos.current.x = null;
      mousePos.current.y = null;
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    const connectionDistance = 120;
    const connectionDistanceSq = connectionDistance * connectionDistance;
    const mouseInfluenceDistance = 130;

    const draw = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      const nodeColor = isDark ? "34, 211, 238" : "99, 102, 241";
      const lineColor = isDark ? "56, 189, 248" : "79, 70, 229";

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse interaction on desktop
        if (mousePos.current.x !== null && mousePos.current.y !== null) {
          const dx = mousePos.current.x - p.x;
          const dy = mousePos.current.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseInfluenceDistance * mouseInfluenceDistance && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (mouseInfluenceDistance - dist) / mouseInfluenceDistance;
            p.x += (dx / dist) * force * 0.6;
            p.y += (dy / dist) * force * 0.6;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mousePos.current.x, mousePos.current.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / mouseInfluenceDistance) * (isDark ? 0.3 : 0.18)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw particle node (clean fill without expensive shadowBlur)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, ${p.baseAlpha * (isDark ? 0.8 : 0.5)})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistanceSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / connectionDistance) * (isDark ? 0.16 : 0.09)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, resolvedTheme]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden select-none transition-colors duration-500"
    >
      {/* 1. Tech Grid (hardware-accelerated, subtle) */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.20] poly-bg-grid"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)`,
          backgroundSize: "32px 32px",
          color: "var(--color-border)",
        }}
      />

      {/* 2. Floating Ambient Aurora Orbs */}
      <div
        className="absolute -top-32 -left-32 sm:-top-20 sm:-left-20 w-[300px] sm:w-[650px] lg:w-[850px] h-[300px] sm:h-[650px] lg:h-[850px] rounded-full 
        bg-gradient-to-br from-cyan-400/25 via-sky-500/20 to-indigo-600/10 
        dark:from-cyan-500/20 dark:via-sky-500/12 dark:to-transparent 
        blur-[50px] sm:blur-[100px] opacity-75 dark:opacity-65 
        poly-bg-orb-1 transform-gpu"
      />

      <div
        className="absolute top-[15%] -right-32 sm:top-[8%] sm:-right-20 w-[280px] sm:w-[600px] lg:w-[800px] h-[280px] sm:h-[600px] lg:h-[800px] rounded-full 
        bg-gradient-to-bl from-indigo-500/25 via-purple-500/20 to-pink-500/10 
        dark:from-indigo-600/20 dark:via-purple-600/15 dark:to-transparent 
        blur-[50px] sm:blur-[110px] opacity-75 dark:opacity-70 
        poly-bg-orb-2 transform-gpu"
      />

      <div
        className="absolute -bottom-40 left-[10%] sm:-bottom-24 sm:left-[20%] w-[320px] sm:w-[680px] lg:w-[900px] h-[320px] sm:h-[680px] lg:h-[900px] rounded-full 
        bg-gradient-to-tr from-teal-400/20 via-violet-500/15 to-indigo-600/10 
        dark:from-teal-600/15 dark:via-violet-700/15 dark:to-transparent 
        blur-[60px] sm:blur-[120px] opacity-70 dark:opacity-60 
        poly-bg-orb-3 transform-gpu"
      />

      {/* 3. Constellation Particle Canvas (Desktop only for peak mobile performance) */}
      <canvas
        ref={canvasRef}
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none opacity-85 dark:opacity-90"
      />

      {/* 4. Vignette Soft Contrast Edge Blend */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-background/30 dark:to-background/60" />
    </div>
  );
}
