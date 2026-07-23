"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCursor } from "@/hooks/useCursor";
import { CURSOR_HOVER_SIZE, CURSOR_SIZE } from "@/animations/cursor";

/** Desktop custom cursor — expands over interactive targets. */
export default function Cursor() {
  const reduced = useReducedMotion();
  const { x, y, visible, mode } = useCursor(!reduced);

  if (reduced) return null;

  const hover = mode === "link" || mode === "button";
  const size = hover ? CURSOR_HOVER_SIZE : CURSOR_SIZE;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998] mix-blend-difference hidden md:block"
      animate={{
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.35 }}
    >
      <div
        className={`h-full w-full rounded-full border border-white/90 ${
          mode === "button" ? "bg-white/25" : mode === "link" ? "bg-white/10" : "bg-white"
        }`}
      />
    </motion.div>
  );
}
