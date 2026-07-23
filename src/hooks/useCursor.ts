"use client";

import { useEffect, useState } from "react";
import { cursorTargetFromEvent } from "@/animations/cursor";
import { isFinePointer } from "@/animations/scroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  mode: ReturnType<typeof cursorTargetFromEvent>;
};

const initial: CursorState = { x: 0, y: 0, visible: false, mode: "default" };

/** Tracks pointer for the custom cursor (desktop fine pointer only). */
export function useCursor(enabled = true) {
  const [state, setState] = useState<CursorState>(initial);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reduced || !isFinePointer()) return;

    document.documentElement.classList.add("has-custom-cursor");

    let frame = 0;
    let latest = { x: 0, y: 0, mode: "default" as CursorState["mode"] };

    const flush = () => {
      frame = 0;
      setState((s) => ({
        ...s,
        x: latest.x,
        y: latest.y,
        mode: latest.mode,
        visible: true,
      }));
    };

    const onMove = (e: PointerEvent) => {
      latest = {
        x: e.clientX,
        y: e.clientY,
        mode: cursorTargetFromEvent(e.target),
      };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onLeave = () => setState((s) => ({ ...s, visible: false }));
    const onEnter = () => setState((s) => ({ ...s, visible: true }));

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, reduced]);

  return state;
}
