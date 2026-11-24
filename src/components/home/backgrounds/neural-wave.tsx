"use client";

import { useEffect, useRef } from "react";

interface NodePoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
    let nodes: NodePoint[] = [];

    const colorsDark = [
      "rgba(120, 107, 250, 0.75)", // primary / electric indigo
      "rgba(53, 198, 216, 0.75)",  // cyan
      "rgba(155, 140, 250, 0.65)", // lavender
      "rgba(99, 85, 238, 0.75)",   // deep violet
    ];

    const colorsLight = [
      "rgba(99, 85, 238, 0.70)",   // rich indigo
      "rgba(14, 165, 233, 0.70)",  // vivid sky / cyan
      "rgba(120, 107, 250, 0.65)", // purple
      "rgba(79, 70, 229, 0.70)",   // dark violet
    ];

    const initNodes = () => {
      nodes = [];
      const count = Math.min(Math.floor((width * height) / 14000), 75);
      const cols = Math.ceil(Math.sqrt(count * (width / Math.max(height, 1))));
      const rows = Math.ceil(count / cols);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (nodes.length >= count) break;
          const baseX = (c / Math.max(cols - 1, 1)) * width;
          const baseY = (r / Math.max(rows - 1, 1)) * height;
          const colorIdx = Math.floor(Math.random() * colorsDark.length);
          nodes.push({
            baseX,
            baseY,
            x: baseX + (Math.random() - 0.5) * 60,
            y: baseY + (Math.random() - 0.5) * 60,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1.5,
            colorDark: colorsDark[colorIdx],
            colorLight: colorsLight[colorIdx],
            phase: Math.random() * Math.PI * 2,
            speed: 0.001 + Math.random() * 0.0012,
          });
        }
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

      initNodes();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const maxDist = 140;

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");

      // Ambient radial glow behind the wave
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        50,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.7
      );

      if (isDark) {
        grad.addColorStop(0, "rgba(120, 107, 250, 0.12)");
        grad.addColorStop(0.5, "rgba(53, 198, 216, 0.05)");
        grad.addColorStop(1, "rgba(8, 13, 25, 0)");
      } else {
        grad.addColorStop(0, "rgba(120, 107, 250, 0.08)");
        grad.addColorStop(0.5, "rgba(53, 198, 216, 0.04)");
        grad.addColorStop(1, "rgba(248, 250, 252, 0)");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Update & wave distortion
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const activeColor = isDark ? n.colorDark : n.colorLight;

        if (!prefersReducedMotion) {
          const waveX = Math.sin(time * n.speed + n.phase) * 35;
          const waveY = Math.cos(time * n.speed * 0.8 + n.phase) * 25;
          n.x = n.baseX + waveX;
          n.y = n.baseY + waveY;
        }

        // Draw node glow
        const glowRadius = n.radius * (isDark ? 3.5 : 2.8);
        const nodeGrad = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          glowRadius
        );
        nodeGrad.addColorStop(0, activeColor);
        nodeGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node center - white in dark mode, vibrant indigo in light mode
        ctx.fillStyle = isDark ? "#FFFFFF" : "#4F46E5";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connecting lines with proximity fade
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.35 : 0.22);
            const colorA = isDark ? nodes[i].colorDark : nodes[i].colorLight;
            const colorB = isDark ? nodes[j].colorDark : nodes[j].colorLight;

            const lineGrad = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y
            );
            lineGrad.addColorStop(0, colorA.replace(/[\d\.]+\)$/, `${alpha})`));
            lineGrad.addColorStop(1, colorB.replace(/[\d\.]+\)$/, `${alpha})`));

            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = isDark ? 1 : 1.1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
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
