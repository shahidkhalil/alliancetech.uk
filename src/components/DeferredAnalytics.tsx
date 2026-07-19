"use client";

import { useEffect } from "react";

const GA_MEASUREMENT_ID = "G-TR2J78K3F0";

/**
 * Loads gtag only after first user interaction, or after 10s.
 * Keeps analytics off the LCP / TBT critical path.
 */
export default function DeferredAnalytics() {
  useEffect(() => {
    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      s.async = true;
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: unknown[]) => {
        window.dataLayer.push(args);
      };
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
    };

    const onInteract = () => load();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

    const cleanup = () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, onInteract));
    };

    events.forEach((e) =>
      window.addEventListener(e, onInteract, { once: true, passive: true })
    );
    const timer = window.setTimeout(load, 10000);

    return cleanup;
  }, []);

  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
