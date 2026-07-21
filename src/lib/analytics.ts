"use client";

export type ConsentCategory = "necessary" | "analytics" | "marketing" | "preferences";

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  updatedAt: string;
};

export type CampaignContext = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer_host?: string;
};

export type AnalyticsValue = string | number | boolean | undefined;
export type AnalyticsItem = Record<string, AnalyticsValue>;
export type AnalyticsParams = Record<string, AnalyticsValue | AnalyticsItem[]>;

export type AnalyticsEventName =
  | "page_view"
  | "session_start"
  | "service_view"
  | "blog_view"
  | "cta_click"
  | "element_click"
  | "contact_click"
  | "book_consultation"
  | "proposal_request"
  | "contact_form_submit"
  | "quote_request"
  | "form_view"
  | "form_start"
  | "form_submit"
  | "form_abandon"
  | "generate_lead"
  | "phone_click"
  | "whatsapp_click"
  | "email_click"
  | "calendly_open"
  | "calendly_booked"
  | "demo_start"
  | "demo_complete"
  | "demo_error"
  | "appointment_booking_start"
  | "appointment_booking_complete"
  | "begin_checkout"
  | "download"
  | "file_download"
  | "site_search"
  | "video_start"
  | "video_25"
  | "video_50"
  | "video_75"
  | "video_complete"
  | "scroll_depth"
  | "engaged_time"
  | "outbound_click"
  | "error"
  | "api_error"
  | "performance_metric";

const CAMPAIGN_KEY = "alliance_campaign_context";
const MAX_STRING_LENGTH = 200;
const BLOCKED_PARAM_KEYS =
  /^(email|phone|name|message|address|number_clicked|full_name|contact_name|user_name|user_email|user_phone|phone_number)$/i;

let pageStartedAt = Date.now();
let maxScrollDepth = 0;

function safeString(value: string): string {
  return value
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted-email]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[redacted-phone]")
    .replace(/([?&][^=\s]+)=([^&\s]+)/g, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_STRING_LENGTH);
}

function sanitizeParams(params: AnalyticsParams): AnalyticsParams {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => !BLOCKED_PARAM_KEYS.test(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? safeString(value)
          : Array.isArray(value)
            ? value.map((item) =>
                Object.fromEntries(
                  Object.entries(item)
                    .filter(([itemKey, itemValue]) => !BLOCKED_PARAM_KEYS.test(itemKey) && itemValue !== undefined)
                    .map(([itemKey, itemValue]) => [
                      itemKey,
                      typeof itemValue === "string" ? safeString(itemValue) : itemValue,
                    ])
                )
              )
            : value,
      ])
  );
}

function analyticsAllowed(): boolean {
  return typeof window !== "undefined" && window.__allianceAnalyticsConsent === true;
}

function send(name: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!analyticsAllowed()) return;
  const payload = sanitizeParams({ ...getCampaignContext(), ...params });

  window.dataLayer = window.dataLayer || [];
  if (window.__allianceUsesGtm) {
    window.dataLayer.push({ event: name, ...payload });
    return;
  }

  window.gtag?.("event", name, payload);
}

/**
 * Sends an event to GA4 without including names, emails, phone numbers, or
 * other personally identifiable information.
 */
export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  send(eventName, params);
}

export function trackPageView(url: string, params: AnalyticsParams = {}) {
  pageStartedAt = Date.now();
  maxScrollDepth = 0;
  send("page_view", { page_path: url.split("?")[0], page_title: document.title, ...params });
}

export function trackConversion(name: AnalyticsEventName, params: AnalyticsParams = {}) {
  send(name, { ...params, conversion: true });
}

export function trackFormSubmit(formName: string, params: AnalyticsParams = {}) {
  trackConversion("contact_form_submit", {
    form_id: formName,
    page: typeof window === "undefined" ? undefined : window.location.pathname,
    time_on_page: getTimeOnPageSeconds(),
    scroll_depth: maxScrollDepth,
    ...params,
  });
}

export function trackPhoneClick(buttonLocation?: string) {
  send("phone_click", { page: window.location.pathname, button_location: buttonLocation });
}

export function trackWhatsAppClick(buttonLocation?: string) {
  send("whatsapp_click", { page: window.location.pathname, button_location: buttonLocation });
}

export function trackEmailClick(buttonLocation?: string) {
  send("email_click", { page: window.location.pathname, button_location: buttonLocation });
}

export function trackCalendlyBooking(meetingType?: string, duration?: number) {
  trackConversion("calendly_booked", { meeting_type: meetingType, duration });
}

export function trackDemoStart(params: AnalyticsParams = {}) {
  send("demo_start", params);
}

export function trackDemoComplete(params: AnalyticsParams = {}) {
  trackConversion("demo_complete", params);
}

export function trackServiceView(service: string) {
  send("service_view", { service });
}

export function trackBlogView(title: string, params: AnalyticsParams = {}) {
  send("blog_view", { blog_title: title, ...params });
}

export function trackSearch(query: string, resultsCount?: number) {
  send("site_search", { search_term: query, results_count: resultsCount });
}

export function trackDownload(file: string) {
  const cleanFile = file.split("?")[0].split("/").pop() || "download";
  send("download", {
    filename: cleanFile,
    filetype: cleanFile.includes(".") ? cleanFile.split(".").pop()?.toLowerCase() : undefined,
  });
}

export function trackVideoPlay(video: string) {
  send("video_start", { video_title: video });
}

export function trackScroll(percent: number) {
  maxScrollDepth = Math.max(maxScrollDepth, percent);
  send("scroll_depth", { percent_scrolled: percent, page: window.location.pathname });
}

export function trackError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : String(error);
  send("error", { error_message: safeString(message), error_context: context, fatal: false });
}

export function trackPerformanceMetric(name: string, value: number, rating?: string) {
  send("performance_metric", {
    metric_name: name,
    metric_value: Math.round(name === "CLS" ? value * 1000 : value),
    metric_rating: rating,
  });
}

export function getTimeOnPageSeconds() {
  return Math.max(0, Math.round((Date.now() - pageStartedAt) / 1000));
}

export function captureCampaignContext(): CampaignContext {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;
  const context: CampaignContext = {};

  allowed.forEach((key) => {
    const value = params.get(key);
    if (value) context[key] = safeString(value);
  });

  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname !== window.location.hostname) context.referrer_host = referrer.hostname;
    } catch {
      // Ignore invalid referrers.
    }
  }

  if (Object.keys(context).length) {
    try {
      sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(context));
    } catch {
      // Storage may be unavailable.
    }
  }
  return context;
}

export function getCampaignContext(): CampaignContext {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(CAMPAIGN_KEY) || "{}") as CampaignContext;
  } catch {
    return {};
  }
}

export function priceToNumber(price: string): number | undefined {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
    __allianceAnalyticsConsent?: boolean;
    __allianceUsesGtm?: boolean;
  }
}
