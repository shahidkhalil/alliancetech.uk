"use client";

import { ReactNode, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";

type FloatingImageProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
};

/** Parallax float on scroll (transform only). */
export default function FloatingImage({ children, className, speed = 40 }: FloatingImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [speed, -speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={clsx("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
