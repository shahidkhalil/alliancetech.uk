import type { Transition, Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO } from "./scroll";

/** Old page exits; new page reveals from behind. */
export const pageExit: Variants = {
  initial: { opacity: 1, scale: 1, filter: "blur(0px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    scale: 0.96,
    filter: "blur(6px)",
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

export const pageEnter: Variants = {
  initial: { opacity: 0, scale: 1.02, y: 24, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO, delay: 0.08 },
  },
  exit: pageExit.exit,
};

export const pageReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const navChromeTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT_EXPO,
};
