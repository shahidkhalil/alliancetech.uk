"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  captureCampaignContext,
  trackBlogView,
  trackDownload,
  trackEmailClick,
  trackError,
  trackEvent,
  trackPageView,
  trackPhoneClick,
  trackScroll,
  trackServiceView,
  trackWhatsAppClick,
} from "@/lib/analytics";

const SERVICE_ROUTES: Record<string, string> = {
  "/ai-receptionist": "ai_receptionist",
  "/whatsapp-ai-automation": "whatsapp_automation",
  "/digital-marketing-for-clinics": "healthcare_marketing",
  "/local-seo-for-clinics": "local_seo",
  "/seo-for-clinics": "seo",
  "/clinic-website-design": "website_development",
  "/clinic-mobile-app": "mobile_app",
  "/ehr-platform": "ehr_platform",
  "/dental-clinic-houston": "houston_ai_automation",
};

const DOWNLOAD_PATTERN = /\.(pdf|docx?|xlsx?|csv|zip|png|jpe?g|webp)$/i;
const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];
const TIME_THRESHOLDS = [30, 60, 120, 300];

function viewportClass() {
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function themePreference() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function cleanDestination(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function usePageTracking(analyticsEnabled: boolean) {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled || !pathname || pathname.startsWith("/admin")) return;

    captureCampaignContext();
    if (window.__allianceLastPageView !== pathname) {
      window.__allianceLastPageView = pathname;
      trackPageView(pathname, {
        route_name: pathname.startsWith("/blog/") ? "blog_post" : pathname === "/" ? "home" : pathname.slice(1),
        language: navigator.language,
        viewport: viewportClass(),
        screen_size: `${window.screen.width}x${window.screen.height}`,
        theme: themePreference(),
        logged_in: false,
      });
    }

    try {
      if (!sessionStorage.getItem("alliance_session_started")) {
        sessionStorage.setItem("alliance_session_started", "1");
        trackEvent("session_start", {
          landing_page: pathname,
          visitor_type: localStorage.getItem("alliance_returning_visitor") ? "returning" : "new",
        });
        localStorage.setItem("alliance_returning_visitor", "1");
      }
    } catch {
      // Tracking still works when storage is unavailable.
    }

    const service = SERVICE_ROUTES[pathname];
    if (service) trackServiceView(service);
    if (pathname.startsWith("/blog/")) {
      trackBlogView(document.title.replace(/\s*\|\s*Alliance Tech.*$/i, ""), {
        category: "clinic_growth",
        author: "Alliance Tech",
      });
    }
    if (/404|not found/i.test(document.title)) {
      trackEvent("error", { error_type: "404", page: pathname, fatal: false });
    }

    const firedScroll = new Set<number>();
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (percent >= threshold && !firedScroll.has(threshold)) {
          firedScroll.add(threshold);
          trackScroll(threshold);
        }
      });
    };

    const timers = TIME_THRESHOLDS.map((seconds) =>
      window.setTimeout(
        () => trackEvent("engaged_time", { seconds, page: pathname }),
        seconds * 1000
      )
    );

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest<HTMLElement>("a, button, [role='button']");
      if (!element || element.dataset.analyticsTracked === "true") return;

      const anchor = element instanceof HTMLAnchorElement ? element : null;
      const href = anchor?.href || "";
      const label = (
        element.dataset.analyticsLabel ||
        element.getAttribute("aria-label") ||
        element.textContent ||
        ""
      ).replace(/\s+/g, " ").trim().slice(0, 100);
      const location = element.dataset.analyticsLocation || "unknown";

      if (href.startsWith("tel:")) return trackPhoneClick(location);
      if (href.startsWith("mailto:")) return trackEmailClick(location);
      if (/wa\.me|whatsapp\.com/i.test(href)) return trackWhatsAppClick(location);
      if (DOWNLOAD_PATTERN.test(new URL(href || window.location.href).pathname)) return trackDownload(href);

      if (anchor) {
        const destination = cleanDestination(href);
        if (destination && new URL(href).origin !== window.location.origin) {
          trackEvent("outbound_click", { destination, page: pathname });
          return;
        }
      }

      trackEvent("element_click", {
        click_text: label || undefined,
        click_url: anchor ? cleanDestination(href) : undefined,
        button_location: location,
        element_type: element.tagName.toLowerCase(),
        page: pathname,
      });
    };

    const onError = (event: ErrorEvent) => trackError(event.error || event.message, "javascript");
    const onRejection = (event: PromiseRejectionEvent) => trackError(event.reason, "unhandled_promise");

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    onScroll();

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [analyticsEnabled, pathname]);
}

declare global {
  interface Window {
    __allianceLastPageView?: string;
  }
}
