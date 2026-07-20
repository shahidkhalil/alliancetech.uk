"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

/** Stagger between siblings in a card grid (80–120ms spec → 100ms default). */
export const STAGGER_MS = 0.1;

/** Viewport trigger — once per card, slightly before fully visible. */
export const VIEWPORT_ONCE = { once: true, margin: "-50px" } as const;

export const EASE_OUT = [0.4, 0, 0.2, 1] as const;

export const cardEntranceHidden = { opacity: 0, y: 20 };
export const cardEntranceVisible = { opacity: 1, y: 0 };

export function staggerDelay(index: number, step = STAGGER_MS) {
  return index * step;
}

export function cardEntranceTransition(delay = 0, reduced = false): Transition {
  if (reduced) return { duration: 0 };
  return { duration: 0.45, ease: EASE_OUT, delay };
}

/** Lift + subtle scale — transform/opacity only; shadow handled in CSS. */
export const cardHoverLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.02, transition: { duration: 0.2, ease: EASE_OUT } },
  tap: { y: -2, scale: 0.99, transition: { duration: 0.15, ease: EASE_OUT } },
};

export const cardHoverNoneVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: 0, scale: 1 },
  tap: { y: 0, scale: 1 },
};

/** Shared hook — respects prefers-reduced-motion via Framer Motion. */
export function useCardMotion() {
  const reducedMotion = useReducedMotion() ?? false;

  return {
    reducedMotion,
    viewport: VIEWPORT_ONCE,
    staggerDelay,

    entrance: (delay = 0) => ({
      initial: reducedMotion ? cardEntranceVisible : cardEntranceHidden,
      whileInView: cardEntranceVisible,
      viewport: VIEWPORT_ONCE,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    hoverProps: (enabled = true) =>
      !enabled || reducedMotion
        ? {}
        : {
            initial: "rest" as const,
            whileHover: "hover" as const,
            whileTap: "tap" as const,
            variants: cardHoverLiftVariants,
          },

    iconMicro: () =>
      reducedMotion
        ? {}
        : {
            whileHover: { scale: 1.08, transition: { duration: 0.2, ease: EASE_OUT } },
            whileTap: { scale: 0.98, transition: { duration: 0.15, ease: EASE_OUT } },
          },

    expandTransition: (): Transition =>
      reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT },
  };
}
