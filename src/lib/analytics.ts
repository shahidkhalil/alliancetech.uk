"use client";

type AnalyticsValue = string | number | boolean | undefined;
type AnalyticsItem = Record<string, AnalyticsValue>;
type AnalyticsParams = Record<string, AnalyticsValue | AnalyticsItem[]>;

/**
 * Sends an event to GA4 without including names, emails, phone numbers, or
 * other personally identifiable information.
 */
export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer.push(args);
    });

  window.gtag("event", eventName, params);
}

export function priceToNumber(price: string): number | undefined {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}
