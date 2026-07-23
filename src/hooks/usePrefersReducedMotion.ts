"use client";

import { useEffect, useState } from "react";
import { getPrefersReducedMotion } from "@/animations/scroll";

/** Reactive prefers-reduced-motion (SSR-safe). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches || getPrefersReducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
