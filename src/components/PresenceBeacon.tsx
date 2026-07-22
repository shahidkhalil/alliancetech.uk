"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { heartbeatPresence } from "@/lib/presence";

/** Lightweight live-visitor beacon (skips /admin). */
export default function PresenceBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const ping = () => {
      heartbeatPresence(pathname).catch(() => {});
    };

    ping();
    const interval = window.setInterval(ping, 25_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
