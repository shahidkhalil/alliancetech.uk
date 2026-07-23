"use client";

import { ReactNode, useRef, PointerEvent, RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import clsx from "clsx";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  dark?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

/**
 * Premium glass card — spotlight + soft 3D tilt (GPU transform only).
 */
export default function SpotlightCard({
  children,
  className,
  href,
  dark = false,
  onPointerEnter,
  onPointerLeave,
}: SpotlightCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement | HTMLDivElement | null>(null);
  const frame = useRef(0);

  const onMove = (e: PointerEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rx = (0.5 - py) * 6;
      const ry = (px - 0.5) * 8;
      el.style.setProperty("--spot-x", `${px * 100}%`);
      el.style.setProperty("--spot-y", `${py * 100}%`);
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0,-6px,0) scale(1.01)`;
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)";
    onPointerLeave?.();
  };

  const shellClass = clsx(
    "spotlight-card group relative block h-full overflow-hidden rounded-2xl will-change-transform",
    dark
      ? "spotlight-card--dark text-white"
      : "spotlight-card--light text-[#00283C]",
    className
  );

  const inner = (
    <>
      {!reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: dark
              ? "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 40%), rgba(0,180,216,0.28), transparent 55%)"
              : "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 40%), rgba(0,180,216,0.2), transparent 55%)",
          }}
        />
      )}
      <span aria-hidden className="spotlight-card__shine" />
      <div className="relative z-[1] flex h-full flex-col">{children}</div>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        className={clsx(shellClass, "no-underline")}
        onPointerMove={onMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onLeave}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={shellClass}
      onPointerMove={onMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onLeave}
    >
      {inner}
    </div>
  );
}
