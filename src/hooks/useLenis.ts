"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/hooks/useGSAP";

/**
 * Smooth scroll via Lenis, synced with GSAP ScrollTrigger.
 * Disabled when prefers-reduced-motion or on admin routes.
 */
export function useLenis(enabled = true) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled || reduced || isAdmin) {
      document.documentElement.classList.remove("lenis");
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    ensureGsapPlugins();
    document.documentElement.classList.add("lenis");
    document.documentElement.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis");
      document.documentElement.style.scrollBehavior = "smooth";
    };
  }, [enabled, reduced, isAdmin]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return lenisRef;
}
