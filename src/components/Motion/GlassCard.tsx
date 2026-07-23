"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
};

/** Static glassmorphism shell (pair with Reveal / SpotlightCard). */
export default function GlassCard({ children, className, dark = false }: GlassCardProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
        dark
          ? "border-white/10 bg-[#00283C]/80 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
          : "border-white/50 bg-white/65 text-[#00283C] shadow-[0_24px_60px_-28px_rgba(0,40,60,0.28)]",
        className
      )}
    >
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full blur-3xl",
          dark ? "bg-[#00B4D8]/20" : "bg-[#00B4D8]/15"
        )}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
