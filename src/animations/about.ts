import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "./scroll";

export const aboutReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const aboutTimeline: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.loose } },
};

export const aboutTimelineItem: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};
