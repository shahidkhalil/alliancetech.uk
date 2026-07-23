"use client";

import { motion, useReducedMotion } from "framer-motion";

const DOTS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 9) % 100}%`,
  top: `${(i * 31 + 14) % 100}%`,
  size: 2 + (i % 3),
  duration: 12 + (i % 5) * 2,
  delay: (i % 4) * 0.5,
}));

/** Soft floating particles — capped for performance. */
export default function FloatingParticles({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {DOTS.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-[#00B4D8]/35"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
