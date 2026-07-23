"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { VIEWPORT, DURATION, EASE_OUT_EXPO } from "@/animations/scroll";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

/** Scroll reveal — transform + opacity only (no filter/blur). */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
