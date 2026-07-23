"use client";

import { useCallback, useEffect, useRef } from "react";
import { isFinePointer } from "@/animations/scroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MagneticOptions = {
  strength?: number;
  radius?: number;
};

/** Element-local magnetic pull — no window-wide pointer listeners. */
export function useMagnetic<T extends HTMLElement>(options: MagneticOptions = {}) {
  const { strength = 0.28 } = options;
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const frame = useRef(0);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0)";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !isFinePointer()) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame.current);
      reset();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame.current);
      reset();
    };
  }, [reduced, reset, strength]);

  return ref;
}
