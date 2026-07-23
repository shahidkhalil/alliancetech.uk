import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "./scroll";

export const pricingGrid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.base } },
};

export const pricingCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const popularGlow = {
  animate: {
    boxShadow: [
      "0 0 0 rgba(0,180,216,0)",
      "0 0 40px rgba(0,180,216,0.35)",
      "0 0 0 rgba(0,180,216,0)",
    ],
  },
  transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
};
