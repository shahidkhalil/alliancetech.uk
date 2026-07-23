import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO } from "./scroll";

export const contactField: Variants = {
  rest: { scale: 1 },
  focus: { scale: 1.01 },
};

export const contactSuccess: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

export const mapPulse = {
  animate: { scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
};
