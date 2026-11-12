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

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isDark = resolvedTheme === "dark";

    // Responsive particle count
    const particleCount = width < 768 ? 24 : 50;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.25,
      });
    }

    const onResize = () => {
      if (!canvas) return;
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

    const connectionDistance = width < 768 ? 90 : 130;
    const mouseInfluenceDistance = 140;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Colors based on theme
      const nodeColor = isDark ? "34, 211, 238" : "99, 102, 241"; // cyan / indigo
      const lineColor = isDark ? "56, 189, 248" : "79, 70, 229";

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse interaction
        if (mousePos.current.x !== null && mousePos.current.y !== null) {
          const dx = mousePos.current.x - p.x;
          const dy = mousePos.current.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseInfluenceDistance && dist > 0) {
            const force = (mouseInfluenceDistance - dist) / mouseInfluenceDistance;
            p.x += (dx / dist) * force * 0.8;
            p.y += (dy / dist) * force * 0.8;

            // Connect line to mouse
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mousePos.current.x, mousePos.current.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${
              (1 - dist / mouseInfluenceDistance) * (isDark ? 0.35 : 0.2)
            })`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, ${p.baseAlpha * (isDark ? 0.85 : 0.5)})`;
        ctx.shadowColor = `rgba(${nodeColor}, 0.5)`;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${
              (1 - dist / connectionDistance) * (isDark ? 0.18 : 0.1)
            })`;
            ctx.lineWidth = 0.8;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
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
      {/* 1. Animated Tech Grid (moves continuously with poly-bg-grid) */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.22] poly-bg-grid"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)`,
          backgroundSize: "32px 32px",
          color: "var(--color-border)",
        }}
      />

      {/* 2. Vibrant Floating Aurora Orbs (Smooth 3D translation) */}
      {/* Orb 1: Neon Cyan & Electric Sky (Top-Left) */}
      <div
        className="absolute -top-32 -left-32 sm:-top-20 sm:-left-20 w-[350px] sm:w-[650px] lg:w-[850px] h-[350px] sm:h-[650px] lg:h-[850px] rounded-full 
        bg-gradient-to-br from-cyan-400/30 via-sky-500/25 to-indigo-600/10 
        dark:from-cyan-500/25 dark:via-sky-500/15 dark:to-transparent 
        blur-[60px] sm:blur-[100px] opacity-80 dark:opacity-70 
        poly-bg-orb-1 will-change-transform"
      />

      {/* Orb 2: Royal Indigo & Vivid Purple (Top-Right) */}
      <div
        className="absolute top-[15%] -right-32 sm:top-[8%] sm:-right-20 w-[340px] sm:w-[600px] lg:w-[800px] h-[340px] sm:h-[600px] lg:h-[800px] rounded-full 
        bg-gradient-to-bl from-indigo-500/30 via-purple-500/25 to-pink-500/10 
        dark:from-indigo-600/25 dark:via-purple-600/20 dark:to-transparent 
        blur-[60px] sm:blur-[110px] opacity-80 dark:opacity-75 
        poly-bg-orb-2 will-change-transform"
      />

      {/* Orb 3: Emerald, Teal & Violet Glow (Bottom Center) */}
      <div
        className="absolute -bottom-40 left-[10%] sm:-bottom-24 sm:left-[20%] w-[380px] sm:w-[680px] lg:w-[900px] h-[380px] sm:h-[680px] lg:h-[900px] rounded-full 
        bg-gradient-to-tr from-teal-400/25 via-violet-500/20 to-indigo-600/10 
        dark:from-teal-600/20 dark:via-violet-700/20 dark:to-transparent 
        blur-[70px] sm:blur-[120px] opacity-75 dark:opacity-65 
        poly-bg-orb-3 will-change-transform"
      />

      {/* 3. Interactive Floating Constellation Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85 dark:opacity-90"
      />

      {/* 4. Vignette / Soft Contrast Edge Blend */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-background/30 dark:to-background/60" />
    </div>
  );
}
