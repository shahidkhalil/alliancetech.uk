/** Shared motion constants — GPU transforms + opacity only. */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  instant: 0.15,
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.2,
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.12,
} as const;

export const VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: "-80px 0px",
} as const;

export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
