"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RevealOptions = {
  y?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
};

/** Lightweight IntersectionObserver reveal via transform/opacity classes. */
export function useScrollReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { y = 28, duration = 700, delay = 0, once = true } = options;
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;
    el.style.filter = "blur(6px)";
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
    el.style.willChange = "transform, opacity, filter";

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
        el.style.filter = "blur(0px)";
        if (once) io.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, duration, once, reduced, y]);

  return ref;
}
