"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function subscribeFinePointer(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const m1 = window.matchMedia("(pointer: fine)");
  const m2 = window.matchMedia("(prefers-reduced-motion: reduce)");
  m1.addEventListener("change", callback);
  m2.addEventListener("change", callback);
  return () => {
    m1.removeEventListener("change", callback);
    m2.removeEventListener("change", callback);
  };
}

function getFinePointerSnapshot() {
  if (typeof window === "undefined") return false;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return finePointer && !prefersReducedMotion;
}

export function CursorFollower() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isEnabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    () => false
  );

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position refs for lerping (0 lag on dot, smooth lag on aura ring)
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      setIsVisible(true);

      // Directly update inner dot for instant response
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, select, textarea, [role="button"], [tabindex="0"], label, .cursor-pointer'
      );
      setIsHovered(!!interactive);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth physics loop for the trailing ring
    const render = () => {
      const lerpFactor = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isEnabled]);

  if (!isMounted || !isEnabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99990] overflow-hidden select-none transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* 1. Precision Center Dot (Follows mouse immediately) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full transition-transform duration-75 will-change-transform ${
          isHovered
            ? "scale-150 bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
            : "bg-primary dark:bg-cyan-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]"
        }`}
      />

      {/* 2. Fluid Trailing Aura Ring (Interpolated with smooth lerp physics) */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-all duration-200 ease-out will-change-transform ${
          isHovered
            ? "-ml-6 -mt-6 w-12 h-12 border-2 border-cyan-400/80 bg-cyan-400/10 dark:bg-cyan-400/15 backdrop-blur-[0.5px] scale-110 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            : isClicking
            ? "-ml-3 -mt-3 w-6 h-6 border-2 border-primary/70 bg-primary/20 scale-90"
            : "-ml-4 -mt-4 w-8 h-8 border border-primary/35 dark:border-cyan-400/40 bg-primary/5 dark:bg-cyan-400/5 shadow-sm"
        }`}
      />
    </div>
  );
}
