import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "./scroll";

export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER.base, delayChildren: 0.1 },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

export const heroWord: Variants = {
  hidden: { opacity: 0, y: "0.4em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO },
  },
};

export const heroCta: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

export const heroGlowDrift = {
  animate: {
    x: [0, 24, -12, 0],
    y: [0, -16, 10, 0],
  },
  transition: { duration: 22, repeat: Infinity, ease: "linear" as const },
};
