"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

/** Stagger between siblings in a card grid. */
export const STAGGER_MS = 0.08;

/** Viewport trigger — once per card, slightly before fully visible. */
export const VIEWPORT_ONCE = { once: true, amount: 0.3, margin: "-50px" } as const;

export const EASE_OUT = [0, 0, 0.2, 1] as const;

export const cardEntranceHidden = { opacity: 0, y: 16 };
export const cardEntranceVisible = { opacity: 1, y: 0 };

export function staggerDelay(index: number, step = STAGGER_MS) {
  return index * step;
}

export function cardEntranceTransition(delay = 0, reduced = false): Transition {
  if (reduced) return { duration: 0.2, ease: "easeOut" };
  return { duration: 0.35, ease: "easeOut", delay };
}

const springHover = { type: "spring" as const, stiffness: 300, damping: 20 };
const springIcon = { type: "spring" as const, stiffness: 400, damping: 15 };
const springTap = { type: "spring" as const, stiffness: 400, damping: 25 };

/** Lift + subtle scale — transform only; shadow handled in CSS. */
export const cardHoverLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: springHover },
  tap: { scale: 0.98, transition: springTap },
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
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.2 : 0.35, ease: "easeOut" },
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
      initial: reducedMotion ? { opacity: 0 } : cardEntranceHidden,
      whileInView: reducedMotion ? { opacity: 1 } : cardEntranceVisible,
      viewport: VIEWPORT_ONCE,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    /** For menus / above-the-fold grids — animate on mount instead of scroll. */
    entranceAnimate: (delay = 0) => ({
      initial: reducedMotion ? { opacity: 0 } : cardEntranceHidden,
      animate: reducedMotion ? { opacity: 1 } : cardEntranceVisible,
      transition: cardEntranceTransition(delay, reducedMotion),
    }),

    hoverProps: (enabled = true) =>
      !enabled || reducedMotion
        ? { whileTap: { scale: 0.98, transition: springTap } }
        : {
            initial: "rest" as const,
            whileHover: "hover" as const,
            whileTap: "tap" as const,
            variants: cardHoverLiftVariants,
          },

    iconMicro: (filled = false) =>
      reducedMotion
        ? {}
        : {
            whileHover: filled
              ? { scale: 1.08, transition: springIcon }
              : { rotate: -8, scale: 1.08, transition: springIcon },
            whileTap: { scale: 0.98, transition: springTap },
          },

    expandTransition: (): Transition =>
      reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT },
  };
}
