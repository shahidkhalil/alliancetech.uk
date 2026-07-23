"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMagnetic } from "@/hooks/useMagnetic";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  "data-analytics-label"?: string;
  "data-analytics-location"?: string;
};

/** CTA with magnetic pull + micro bounce (transform only). */
export default function MagneticButton({
  children,
  className,
  magnetic = true,
  type = "button",
  onClick,
  disabled,
  ...dataAttrs
}: Props) {
  const reduced = useReducedMotion();
  const magRef = useMagnetic<HTMLButtonElement>({ strength: 0.28, radius: 90 });

  return (
    <motion.button
      ref={magnetic && !reduced ? magRef : undefined}
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-magnetic
      className={clsx("relative overflow-hidden will-change-transform", className)}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      {...dataAttrs}
    >
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
      {!reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700"
        />
      )}
    </motion.button>
  );
}
