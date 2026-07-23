import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "./scroll";

export const servicesScene: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.loose } },
};

export const servicesBlock: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const statCountDuration = 1.4;
