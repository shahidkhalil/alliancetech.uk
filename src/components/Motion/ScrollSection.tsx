"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, VIEWPORT } from "@/animations/scroll";

type ScrollSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  y?: number;
};

/** Safe section enter — opacity + translateY only. */
export default function ScrollSection({
  children,
  className,
  id,
  delay = 0,
  y = 36,
}: ScrollSectionProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, once: true }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
