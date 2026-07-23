"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { statCountDuration } from "@/animations/services";

type CountUpProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
};

/** Animates a number upward when scrolled into view. */
export default function CountUp({
  value,
  suffix = "",
  prefix = "",
  className,
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals]
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (statCountDuration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {formatter.format(display)}
      {suffix}
    </motion.span>
  );
}
