import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "./scroll";

export const cardGrid: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER.base },
  },
};

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 36, rotateX: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1, rotateX: 0, rotateY: 0 },
  hover: { y: -8, scale: 1.02 },
  tap: { scale: 0.985 },
};

export const iconSpinHover = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: 8, scale: 1.08 },
};
