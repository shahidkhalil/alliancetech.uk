/**
 * Maya API endpoints.
 * Prefer same-origin /api/* (Firebase Hosting rewrites) — avoids CORS & CSP issues.
 * Fallback: cloudfunctions.net (NOT *.run.app — blocked by CSP multi-level subdomain rules).
 */
const CF = "https://asia-south1-alliance-tech-656ba.cloudfunctions.net";

export const RECEPTIONIST_ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT || "/api/receptionist";

export const REALTIME_TOKEN_ENDPOINT =
  process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT || "/api/realtime-token";

export const BOOK_ENDPOINT =
  process.env.NEXT_PUBLIC_BOOK_ENDPOINT || "/api/book";

/** Absolute URL for environments without hosting rewrites (e.g. static file preview). */
export const RECEPTIONIST_ENDPOINT_ABSOLUTE = `${CF}/clinicReceptionist`;
export const REALTIME_TOKEN_ENDPOINT_ABSOLUTE = `${CF}/realtimeToken`;
export const BOOK_ENDPOINT_ABSOLUTE = `${CF}/bookAppointmentHttp`;

/** Pick same-origin /api on Firebase hosting; cloudfunctions.net elsewhere. */
export function resolveEndpoint(path: string, absolute: string): string {
  if (typeof window === "undefined") return path;
  const override = process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT;
  if (override?.startsWith("http")) return override;
  const host = window.location.hostname;
  // Firebase Hosting rewrites apply on *.web.app / *.firebaseapp.com.
  // Localhost: call cloudfunctions.net from the browser — Next's rewrite proxy
  // uses Node getaddrinfo, which can fail (ENOTFOUND → 500) even when dig works.
  if (host.endsWith(".web.app") || host.endsWith(".firebaseapp.com")) {
    return path;
  }
  // localhost / custom domains (e.g. alliancetechltd.com) — cloudfunctions.net (CSP-allowed).
  return absolute;
}

export function receptionistUrl() {
  return resolveEndpoint(RECEPTIONIST_ENDPOINT, RECEPTIONIST_ENDPOINT_ABSOLUTE);
}

export function realtimeTokenUrl() {
  return resolveEndpoint(REALTIME_TOKEN_ENDPOINT, REALTIME_TOKEN_ENDPOINT_ABSOLUTE);
}

export function bookUrl() {
  return resolveEndpoint(BOOK_ENDPOINT, BOOK_ENDPOINT_ABSOLUTE);
}
