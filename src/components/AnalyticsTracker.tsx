"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    getFirebaseAnalytics().then((analytics) => {
      if (analytics) {
        logEvent(analytics, "page_view", { page_path: pathname });
      }
    });
  }, [pathname]);

  return null;
}
