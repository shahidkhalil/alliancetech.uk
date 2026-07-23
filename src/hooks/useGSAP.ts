"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let registered = false;

export function ensureGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Run GSAP animations scoped to a ref element.
 * Context is reverted on unmount (kills nested tweens/ScrollTriggers).
 */
export function useGSAP(factory: () => void, deps: unknown[] = []) {
  const scope = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    ensureGsapPlugins();
    if (reduced) return;
    const el = scope.current;
    if (!el) return;

    const ctx = gsap.context(factory, el);
    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);

  return { scope, reduced, gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
