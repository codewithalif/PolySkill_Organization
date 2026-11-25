"use client";

import { useEffect, useRef } from "react";

interface NodePoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  colorDark: string;
  colorLight: string;
  phase: number;
  speed: number;
}

export function NeuralWaveBackground() {
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
    let nodes: NodePoint[] = [];

    const isMobileDevice = () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        (navigator.maxTouchPoints > 0 && window.innerWidth < 1024));

    const colorsDark = [
      "rgba(120, 107, 250,", // primary / electric indigo
      "rgba(53, 198, 216,",  // cyan
      "rgba(155, 140, 250,", // lavender
      "rgba(99, 85, 238,",   // deep violet
    ];

    const colorsLight = [
      "rgba(99, 85, 238,",   // rich indigo
      "rgba(14, 165, 233,",  // vivid sky / cyan
      "rgba(120, 107, 250,", // purple
      "rgba(79, 70, 229,",   // dark violet
    ];

    const initNodes = () => {
      nodes = [];
      const mobile = isMobileDevice();
      // On mobile, keep node count low (20-24 max) to prevent O(N^2) CPU bottleneck
      const count = mobile
        ? Math.min(Math.floor((width * height) / 28000), 22)
        : Math.min(Math.floor((width * height) / 16000), 55);

      const cols = Math.ceil(Math.sqrt(count * (width / Math.max(height, 1))));
      const rows = Math.ceil(count / Math.max(cols, 1));

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (nodes.length >= count) break;
          const baseX = (c / Math.max(cols - 1, 1)) * width;
          const baseY = (r / Math.max(rows - 1, 1)) * height;
          const colorIdx = Math.floor(Math.random() * colorsDark.length);
          nodes.push({
            baseX,
            baseY,
            x: baseX + (Math.random() - 0.5) * 50,
            y: baseY + (Math.random() - 0.5) * 50,
            radius: Math.random() * 1.6 + 1.2,
            colorDark: colorsDark[colorIdx],
            colorLight: colorsLight[colorIdx],
            phase: Math.random() * Math.PI * 2,
            speed: 0.0009 + Math.random() * 0.001,
          });
        }
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      // On mobile devices, clamp DPR to 1 to cut pixel fillrate load by 4x-9x
      const mobile = isMobileDevice();
      const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initNodes();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const maxDist = isMobileDevice() ? 100 : 135;
    const maxDistSq = maxDist * maxDist;

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const mobile = isMobileDevice();

      // Ambient radial glow behind the wave
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        40,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.65
      );

      if (isDark) {
        grad.addColorStop(0, "rgba(120, 107, 250, 0.10)");
        grad.addColorStop(0.6, "rgba(53, 198, 216, 0.03)");
        grad.addColorStop(1, "rgba(8, 13, 25, 0)");
      } else {
        grad.addColorStop(0, "rgba(120, 107, 250, 0.07)");
        grad.addColorStop(0.6, "rgba(53, 198, 216, 0.02)");
        grad.addColorStop(1, "rgba(248, 250, 252, 0)");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw connecting lines first
      ctx.lineWidth = mobile ? 0.9 : 1.1;
      for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * (isDark ? 0.28 : 0.18);
            const baseColor = isDark ? ni.colorDark : ni.colorLight;

            ctx.strokeStyle = `${baseColor} ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(ni.x, ni.y);
            ctx.lineTo(nj.x, nj.y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const baseColor = isDark ? n.colorDark : n.colorLight;

        if (!prefersReducedMotion) {
          const waveX = Math.sin(time * n.speed + n.phase) * (mobile ? 20 : 32);
          const waveY = Math.cos(time * n.speed * 0.8 + n.phase) * (mobile ? 16 : 24);
          n.x = n.baseX + waveX;
          n.y = n.baseY + waveY;
        }

        // Fast node glow (2-pass arc is 10x faster on mobile than createRadialGradient)
        ctx.fillStyle = `${baseColor} ${isDark ? 0.35 : 0.22})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = isDark ? "#FFFFFF" : "#4F46E5";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Frame-rate limiting for mobile (32fps on mobile, 60fps on desktop)
    let lastFrameTime = performance.now();

    const loop = (timestamp: number) => {
      if (!isVisible || !isIntersecting) return;

      const mobile = isMobileDevice();
      const targetInterval = mobile ? 31 : 16; // ~32fps on mobile, 60fps on desktop
      const delta = timestamp - lastFrameTime;

      if (delta >= targetInterval) {
        lastFrameTime = timestamp - (delta % targetInterval);
        renderFrame(timestamp);
      }

      animId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // IntersectionObserver: automatically stop loop when hero scrolled off screen
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
