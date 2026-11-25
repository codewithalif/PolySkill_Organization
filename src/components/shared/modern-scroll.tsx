"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";

const emptySubscribe = () => () => {};

export function ModernScrollExperience() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [showBackToTop, setShowBackToTop] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const ringCircleRef = useRef<SVGCircleElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    // 1. Selector targeting meaningful content containers for smooth pop-up
    const revealSelector = `
      main section,
      main > div.space-y-6,
      main > div.space-y-8,
      .card,
      [data-slot="card"],
      .grid > div,
      .reveal-on-scroll,
      footer
    `;

    const registerElements = () => {
      const elements = document.querySelectorAll(revealSelector);
      elements.forEach((el) => {
        if (
          el.closest(".poly-scroll-reveal") &&
          el.classList.contains("poly-scroll-reveal") === false &&
          el.tagName !== "SECTION"
        ) {
          return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.88) {
          if (
            !el.classList.contains("poly-scroll-reveal") &&
            !el.classList.contains("poly-scroll-revealed")
          ) {
            el.classList.add("poly-scroll-reveal");

            const parent = el.parentElement;
            if (
              parent &&
              (parent.classList.contains("grid") || parent.classList.contains("flex"))
            ) {
              const siblings = Array.from(parent.children);
              const siblingIndex = siblings.indexOf(el);
              const delay = (siblingIndex % 4) * 75;
              (el as HTMLElement).style.setProperty("--reveal-delay", `${delay}ms`);
            }

            observer.observe(el);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("poly-scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -30px 0px",
        threshold: 0.08,
      }
    );

    registerElements();

    // 2. High-performance scroll tracking: DOM styles updated directly (0 React re-renders while scrolling)
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        // Direct DOM update: silky 60/120fps with zero React component re-renders
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progress}%`;
        }
        if (ringCircleRef.current) {
          ringCircleRef.current.style.strokeDashoffset = `${
            125.66 - (125.66 * progress) / 100
          }`;
        }

        // Only update state when threshold is crossed (prevents continuous re-renders)
        const shouldShow = scrollTop > 380;
        setShowBackToTop((prev) => (prev !== shouldShow ? shouldShow : prev));

        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Re-check elements on route changes/DOM mutations with throttle
    let mutationTimer: NodeJS.Timeout | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(() => {
        registerElements();
      }, 250);
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (mutationTimer) clearTimeout(mutationTimer);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Top Gradient Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.6)] ease-out"
          style={{ width: "0%" }}
        />
      </div>

      {/* Modern Circular Floating Back To Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md bg-background/85 border border-primary/25 shadow-lg text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300 transform group ${
          showBackToTop
            ? "translate-y-0 opacity-100 pointer-events-auto scale-100"
            : "translate-y-6 opacity-0 pointer-events-none scale-75"
        }`}
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-muted/40 fill-none"
            strokeWidth="2.5"
          />
          <circle
            ref={ringCircleRef}
            cx="24"
            cy="24"
            r="20"
            className="stroke-primary fill-none transition-all duration-75"
            strokeWidth="2.5"
            strokeDasharray={125.66}
            strokeDashoffset={125.66}
            strokeLinecap="round"
          />
        </svg>

        <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </>
  );
}
