"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { DURATION, EASE_OUT_EXPO } from "@/animations/scroll";

type PageTransitionProps = {
  children: ReactNode;
};

/** Light route fade — no blur/filter (those cause jank). */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
          transition={{ duration: reduced ? 0.15 : DURATION.fast, ease: EASE_OUT_EXPO }}
          className="min-h-screen will-change-transform bg-white"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
