"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER, VIEWPORT } from "@/animations/scroll";

/** Stagger between siblings in a card grid. */
export const STAGGER_MS = STAGGER.base;

/** Viewport trigger — once per card, as the grid enters the screen. */
export const VIEWPORT_ONCE = { once: VIEWPORT.once, amount: VIEWPORT.amount } as const;

export const EASE_OUT = EASE_OUT_EXPO;

export const cardEntranceHidden = { opacity: 0, y: 28, scale: 0.97 };
export const cardEntranceVisible = { opacity: 1, y: 0, scale: 1 };

export function staggerDelay(index: number, step = STAGGER_MS) {
  return index * step;
}

export function cardEntranceTransition(delay = 0, reduced = false): Transition {
  if (reduced) return { duration: 0 };
  return { duration: DURATION.base, ease: EASE_OUT, delay };
}

export const cardHoverLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02 },
  tap: { y: 0, scale: 0.985 },
};

export const cardHoverNoneVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: 0, scale: 1 },
  tap: { y: 0, scale: 1 },
};

export function staggerContainerVariants(reduced = false): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : STAGGER_MS },
    },
  };
}

export function staggerItemVariants(reduced = false): Variants {
  return {
    hidden: reduced ? cardEntranceVisible : cardEntranceHidden,
    visible: {
      ...cardEntranceVisible,
      transition: cardEntranceTransition(0, reduced),
    },
  };
}

/** Shared hook — respects prefers-reduced-motion via Framer Motion. */
export function useCardMotion() {
  const reducedMotion = useReducedMotion() ?? false;

  return {
    reducedMotion,
    viewport: VIEWPORT_ONCE,
    staggerDelay,
    containerVariants: staggerContainerVariants(reducedMotion),
    itemVariants: staggerItemVariants(reducedMotion),

    entrance: (delay = 0) => ({
      initial: reducedMotion ? cardEntranceVisible : cardEntranceHidden,
      whileInView: cardEntranceVisible,
      viewport: VIEWPORT_ONCE,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    entranceAnimate: (delay = 0) => ({
      initial: reducedMotion ? cardEntranceVisible : cardEntranceHidden,
      animate: cardEntranceVisible,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    hoverProps: (enabled = true) =>
      reducedMotion || !enabled
        ? {}
        : {
            initial: "rest" as const,
            whileHover: "hover" as const,
            whileTap: "tap" as const,
            variants: cardHoverLiftVariants,
          },

    iconMicro: (_filled = false) =>
      reducedMotion
        ? {}
        : {
            initial: "rest" as const,
            whileHover: "hover" as const,
            variants: {
              rest: { rotate: 0, scale: 1 },
              hover: { rotate: 6, scale: 1.08 },
            },
          },

    expandTransition: (): Transition =>
      reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT },
  };
}
