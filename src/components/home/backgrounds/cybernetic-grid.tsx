"use client";

import { useEffect, useRef } from "react";

interface LightPulse {
  lineIndex: number;
  progress: number; // 0 to 1
  speed: number;
  length: number;
  colorDark: string;
  colorLight: string;
}

export function CyberneticGridBackground() {
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

    let pulses: LightPulse[] = [];
    const numPerspectiveLines = 24;

    const pulseColorsDark = [
      "rgba(53, 198, 216, ",  // Cyan
      "rgba(66, 214, 164, ",  // Teal / Emerald
      "rgba(120, 107, 250, ", // Indigo
    ];

    const pulseColorsLight = [
      "rgba(14, 165, 233, ",  // Sky Blue
      "rgba(16, 185, 129, ",  // Emerald
      "rgba(99, 85, 238, ",   // Royal Indigo
    ];

    const initPulses = () => {
      pulses = [];
      const count = 12;
      for (let i = 0; i < count; i++) {
        const cIdx = Math.floor(Math.random() * pulseColorsDark.length);
        pulses.push({
          lineIndex: Math.floor(Math.random() * numPerspectiveLines),
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          length: 0.12 + Math.random() * 0.18,
          colorDark: pulseColorsDark[cIdx],
          colorLight: pulseColorsLight[cIdx],
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

      initPulses();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");

      // Cyber background ambient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );

      if (isDark) {
        bgGrad.addColorStop(0, "rgba(13, 21, 37, 0.9)");
        bgGrad.addColorStop(0.5, "rgba(8, 13, 25, 0.95)");
        bgGrad.addColorStop(1, "rgba(4, 7, 15, 1)");
      } else {
        bgGrad.addColorStop(0, "rgba(241, 245, 249, 0.9)");
        bgGrad.addColorStop(0.5, "rgba(248, 250, 252, 0.95)");
        bgGrad.addColorStop(1, "rgba(248, 250, 252, 1)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.18;
      const vanishingX = width * 0.5;

      // Draw Perspective Grid Lines
      ctx.lineWidth = 1;

      // 1. Radial perspective rays fanning downwards from vanishing point
      for (let i = 0; i < numPerspectiveLines; i++) {
        const bottomX = ((i - (numPerspectiveLines - 1) / 2) / ((numPerspectiveLines - 1) / 2)) * (width * 0.95) + vanishingX;

        const lineGrad = ctx.createLinearGradient(vanishingX, horizonY, bottomX, height);
        if (isDark) {
          lineGrad.addColorStop(0, "rgba(53, 198, 216, 0.02)");
          lineGrad.addColorStop(0.4, "rgba(53, 198, 216, 0.12)");
          lineGrad.addColorStop(1, "rgba(53, 198, 216, 0.35)");
        } else {
          lineGrad.addColorStop(0, "rgba(99, 102, 241, 0.02)");
          lineGrad.addColorStop(0.4, "rgba(99, 102, 241, 0.10)");
          lineGrad.addColorStop(1, "rgba(99, 102, 241, 0.22)");
        }

        ctx.strokeStyle = lineGrad;
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // 2. Horizontal perspective lines (spaced with quadratic progression)
      const numHorizontals = 16;
      const horizontalYPositions: number[] = [];

      for (let j = 1; j <= numHorizontals; j++) {
        const factor = Math.pow(j / numHorizontals, 2.2);
        const y = horizonY + (height - horizonY) * factor;
        horizontalYPositions.push(y);

        if (isDark) {
          const alpha = 0.05 + factor * 0.28;
          ctx.strokeStyle = `rgba(53, 198, 216, ${alpha})`;
        } else {
          const alpha = 0.04 + factor * 0.18;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Glowing Intersections
      const stepIntersections = 3;
      for (let i = 0; i < numPerspectiveLines; i += stepIntersections) {
        const bottomX = ((i - (numPerspectiveLines - 1) / 2) / ((numPerspectiveLines - 1) / 2)) * (width * 0.95) + vanishingX;
        for (let j = 0; j < horizontalYPositions.length; j += 2) {
          const y = horizontalYPositions[j];
          const factor = (y - horizonY) / (height - horizonY);
          const x = vanishingX + (bottomX - vanishingX) * factor;

          const nodePulse = prefersReducedMotion
            ? 0.5
            : 0.5 + 0.5 * Math.sin(time * 0.002 + i + j);

          const glowRadius = 3 + factor * 4;
          const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);

          if (isDark) {
            nodeGrad.addColorStop(0, `rgba(66, 214, 164, ${0.4 * nodePulse})`);
            nodeGrad.addColorStop(1, "rgba(66, 214, 164, 0)");
          } else {
            nodeGrad.addColorStop(0, `rgba(16, 185, 129, ${0.35 * nodePulse})`);
            nodeGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
          }

          ctx.fillStyle = nodeGrad;
          ctx.beginPath();
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${0.6 * nodePulse})`
            : `rgba(79, 70, 229, ${0.7 * nodePulse})`;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Moving Data Pulses along perspective lines
      if (!prefersReducedMotion) {
        for (let p = 0; p < pulses.length; p++) {
          const pulse = pulses[p];
          pulse.progress += pulse.speed;
          if (pulse.progress > 1 + pulse.length) {
            pulse.progress = 0;
            pulse.lineIndex = Math.floor(Math.random() * numPerspectiveLines);
            pulse.speed = 0.003 + Math.random() * 0.005;
          }

          const bottomX =
            ((pulse.lineIndex - (numPerspectiveLines - 1) / 2) /
              ((numPerspectiveLines - 1) / 2)) *
              (width * 0.95) +
            vanishingX;

          const pHead = Math.min(pulse.progress, 1);
          const pTail = Math.max(pulse.progress - pulse.length, 0);

          if (pHead > pTail) {
            const headFactor = Math.pow(pHead, 1.8);
            const tailFactor = Math.pow(pTail, 1.8);

            const headX = vanishingX + (bottomX - vanishingX) * headFactor;
            const headY = horizonY + (height - horizonY) * headFactor;

            const tailX = vanishingX + (bottomX - vanishingX) * tailFactor;
            const tailY = horizonY + (height - horizonY) * tailFactor;

            const pulseColor = isDark ? pulse.colorDark : pulse.colorLight;
            const pulseGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
            pulseGrad.addColorStop(0, `${pulseColor}0)`);
            pulseGrad.addColorStop(0.7, `${pulseColor}${isDark ? 0.7 : 0.6})`);
            pulseGrad.addColorStop(1, `${pulseColor}${isDark ? 1 : 0.9})`);

            ctx.strokeStyle = pulseGrad;
            ctx.lineWidth = 2 + headFactor * 2;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.stroke();

            // Head glow beacon
            ctx.fillStyle = isDark ? "#FFFFFF" : "#4F46E5";
            ctx.beginPath();
            ctx.arc(headX, headY, 2 + headFactor * 1.5, 0, Math.PI * 2);
            ctx.fill();
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
