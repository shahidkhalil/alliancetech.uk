"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LOADER_MIN_MS, markLoaderSeen, shouldShowLoader } from "@/animations/loader";
import { DURATION, EASE_OUT_EXPO } from "@/animations/scroll";

/** First-visit session loader with logo + progress. */
export default function Loader() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced || !shouldShowLoader()) return;
    setShow(true);
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / LOADER_MIN_MS);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        markLoaderSeen();
        setShow(false);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#00283C] text-white"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(12px)",
            transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
            className="text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-horizontal.png"
              alt="Alliance Tech"
              className="mx-auto mb-8 h-10 w-auto brightness-0 invert"
            />
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50 mb-6">
              Digitally Yours
            </p>
            <div className="mx-auto h-[2px] w-40 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00B4D8] to-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] tabular-nums text-white/40">{progress}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
