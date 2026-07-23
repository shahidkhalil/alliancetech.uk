"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { DURATION, EASE_OUT_EXPO } from "@/animations/scroll";

/** Soft page enter — no exit AnimatePresence (avoids hydration crashes). */
export default function RouteFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
