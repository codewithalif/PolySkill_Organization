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

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = !document.hidden;
    let isIntersecting = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let stars: StarParticle[] = [];

    const isMobileDevice = () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        (navigator.maxTouchPoints > 0 && window.innerWidth < 1024));

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
      const mobile = isMobileDevice();
      const count = mobile
        ? Math.min(Math.floor((width * height) / 24000), 24)
        : Math.min(Math.floor((width * height) / 14000), 50);

      for (let i = 0; i < count; i++) {
        const cIdx = Math.floor(Math.random() * starColorsDark.length);
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.6,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: 0.0012 + Math.random() * 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: -Math.random() * 0.2 - 0.04,
          colorDark: starColorsDark[cIdx],
          colorLight: starColorsLight[cIdx],
        });
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const mobile = isMobileDevice();
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

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
      step: number,
      colorStops: { stop: number; color: string }[]
    ) => {
      const baseY = height * yOffsetPercent;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      for (let x = 0; x <= width; x += step) {
        const angle = x * freq + time * speed;
        const wave =
          Math.sin(angle) * amp +
          Math.cos(angle * 0.5 + time * speed * 0.7) * (amp * 0.45);
        ctx.lineTo(x, baseY + wave);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const ribbonGrad = ctx.createLinearGradient(0, baseY - amp, 0, height);
      for (let i = 0; i < colorStops.length; i++) {
        ribbonGrad.addColorStop(colorStops[i].stop, colorStops[i].color);
      }

      ctx.fillStyle = ribbonGrad;
      ctx.fill();
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const mobile = isMobileDevice();
      const ribbonStep = mobile ? 36 : 22;

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
        mobile ? 32 : 45,
        0.003,
        0.0005,
        ribbonStep,
        isDark
          ? [
              { stop: 0, color: "rgba(120, 107, 250, 0.25)" },
              { stop: 0.45, color: "rgba(99, 85, 238, 0.12)" },
              { stop: 1, color: "rgba(0, 0, 0, 0)" },
            ]
          : [
              { stop: 0, color: "rgba(120, 107, 250, 0.10)" },
              { stop: 0.45, color: "rgba(99, 85, 238, 0.05)" },
              { stop: 1, color: "rgba(248, 250, 252, 0)" },
            ]
      );

      // Aurora Curtain 2: Cyan & Emerald Glow
      drawAuroraRibbon(
        time,
        0.28,
        mobile ? 38 : 55,
        0.0035,
        -0.0006,
        ribbonStep,
        isDark
          ? [
              { stop: 0, color: "rgba(53, 198, 216, 0.22)" },
              { stop: 0.4, color: "rgba(66, 214, 164, 0.11)" },
              { stop: 1, color: "rgba(0, 0, 0, 0)" },
            ]
          : [
              { stop: 0, color: "rgba(14, 165, 233, 0.09)" },
              { stop: 0.4, color: "rgba(16, 185, 129, 0.04)" },
              { stop: 1, color: "rgba(248, 250, 252, 0)" },
            ]
      );

      ctx.restore();

      // Floating particles / stars
      // Replaced createRadialGradient loop with fast 2-pass arc (zero GC allocation)
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

        // Soft star halo
        ctx.fillStyle = `${baseColor}${twinkle * (isDark ? 0.25 : 0.18)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${Math.min(twinkle * 1.1, 1)})`
          : `rgba(99, 85, 238, ${Math.min(twinkle * 0.9, 0.85)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let lastFrameTime = performance.now();

    const loop = (timestamp: number) => {
      if (!isVisible || !isIntersecting) return;

      const mobile = isMobileDevice();
      const targetInterval = mobile ? 31 : 16;
      const delta = timestamp - lastFrameTime;

      if (delta >= targetInterval) {
        lastFrameTime = timestamp - (delta % targetInterval);
        renderFrame(timestamp);
      }

      animId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !document.hidden && !prefersReducedMotion) {
          lastFrameTime = performance.now();
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting && !prefersReducedMotion) {
        lastFrameTime = performance.now();
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
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full block transform-gpu"
        aria-hidden="true"
      />
    </div>
  );
}
