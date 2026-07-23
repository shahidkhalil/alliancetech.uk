"use client";

import clsx from "clsx";

type AnimatedGridProps = {
  className?: string;
  opacity?: number;
};

/** Static perspective grid — no continuous animation (perf). */
export default function AnimatedGrid({ className, opacity = 0.06 }: AnimatedGridProps) {
  return (
    <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,40,60,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
