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
    let pulses: LightPulse[] = [];

    const isMobileDevice = () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        (navigator.maxTouchPoints > 0 && window.innerWidth < 1024));

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
      const mobile = isMobileDevice();
      const numLines = mobile ? 12 : 20;
      const count = mobile ? 5 : 9;

      for (let i = 0; i < count; i++) {
        const cIdx = Math.floor(Math.random() * pulseColorsDark.length);
        pulses.push({
          lineIndex: Math.floor(Math.random() * numLines),
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
          length: 0.12 + Math.random() * 0.15,
          colorDark: pulseColorsDark[cIdx],
          colorLight: pulseColorsLight[cIdx],
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

      initPulses();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const mobile = isMobileDevice();
      const numPerspectiveLines = mobile ? 12 : 20;
      const numHorizontals = mobile ? 10 : 15;

      // Ambient background
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
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
      ctx.lineWidth = mobile ? 0.9 : 1;

      // 1. Perspective rays fanning downwards
      for (let i = 0; i < numPerspectiveLines; i++) {
        const bottomX =
          ((i - (numPerspectiveLines - 1) / 2) /
            ((numPerspectiveLines - 1) / 2)) *
            (width * 0.95) +
          vanishingX;

        ctx.strokeStyle = isDark
          ? "rgba(53, 198, 216, 0.18)"
          : "rgba(99, 102, 241, 0.14)";

        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // 2. Horizontal perspective lines
      const horizontalYPositions: number[] = [];

      for (let j = 1; j <= numHorizontals; j++) {
        const factor = Math.pow(j / numHorizontals, 2.2);
        const y = horizonY + (height - horizonY) * factor;
        horizontalYPositions.push(y);

        const alpha = isDark ? 0.04 + factor * 0.22 : 0.03 + factor * 0.14;
        ctx.strokeStyle = isDark
          ? `rgba(53, 198, 216, ${alpha})`
          : `rgba(99, 102, 241, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Glowing Intersections
      const stepIntersections = mobile ? 4 : 3;
      for (let i = 0; i < numPerspectiveLines; i += stepIntersections) {
        const bottomX =
          ((i - (numPerspectiveLines - 1) / 2) /
            ((numPerspectiveLines - 1) / 2)) *
            (width * 0.95) +
          vanishingX;

        for (let j = 0; j < horizontalYPositions.length; j += (mobile ? 3 : 2)) {
          const y = horizontalYPositions[j];
          const factor = (y - horizonY) / (height - horizonY);
          const x = vanishingX + (bottomX - vanishingX) * factor;

          const nodePulse = prefersReducedMotion
            ? 0.5
            : 0.5 + 0.5 * Math.sin(time * 0.002 + i + j);

          const glowRadius = 2.5 + factor * 3;

          // 2-pass circle instead of createRadialGradient
          ctx.fillStyle = isDark
            ? `rgba(66, 214, 164, ${0.28 * nodePulse})`
            : `rgba(16, 185, 129, ${0.22 * nodePulse})`;
          ctx.beginPath();
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${0.5 * nodePulse})`
            : `rgba(79, 70, 229, ${0.6 * nodePulse})`;
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
            pulse.speed = 0.003 + Math.random() * 0.004;
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

            ctx.strokeStyle = `${pulseColor}${isDark ? 0.75 : 0.65})`;
            ctx.lineWidth = mobile ? 1.5 + headFactor * 1.5 : 2 + headFactor * 2;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.stroke();

            // Head glow beacon
            ctx.fillStyle = isDark ? "#FFFFFF" : "#4F46E5";
            ctx.beginPath();
            ctx.arc(headX, headY, mobile ? 1.5 : 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
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
