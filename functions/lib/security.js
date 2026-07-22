/**
 * Shared HTTP hardening helpers for Cloud Functions.
 */

const ALLOWED_ORIGINS = new Set([
  "https://alliancetechltd.com",
  "https://www.alliancetechltd.com",
  "https://alliance-tech-656ba.web.app",
  "https://alliance-tech-656ba.firebaseapp.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isAllowedOrigin(origin) {
  if (!origin || typeof origin !== "string") return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const { protocol, hostname, port } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    // Local dev — any port
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    // Firebase hosting previews + custom clinic domains
    if (hostname.endsWith(".web.app") || hostname.endsWith(".firebaseapp.com")) return true;
    if (hostname === "alliancetechltd.com" || hostname.endsWith(".alliancetechltd.com")) return true;
    return false;
  } catch {
    return false;
  }
}

/** Prefer Firebase / Cloud Run client IP; fall back to rightmost XFF hop. */
function clientIp(req) {
  const ff = String(req.headers["x-forwarded-for"] || "");
  if (ff) {
    const parts = ff.split(",").map((s) => s.trim()).filter(Boolean);
    // Rightmost is typically the edge-injected address (harder to spoof).
    if (parts.length) return parts[parts.length - 1];
  }
  return req.ip || req.headers["x-real-ip"] || "";
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
  }
  if (req.method === "OPTIONS") {
    res.status(origin && isAllowedOrigin(origin) ? 204 : 403).send("");
    return true;
  }
  return false;
}

/** Block private / link-local / metadata hosts (SSRF). */
function isBlockedHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/\.+$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host === "metadata.google.internal" || host.endsWith(".internal")) return true;

  // IPv6
  if (host.includes(":")) {
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
      return true;
    }
  }

  // IPv4 dotted
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = m.slice(1).map(Number);
    if (a.some((n) => n > 255)) return true;
    const [o1, o2] = a;
    if (o1 === 0 || o1 === 10 || o1 === 127) return true;
    if (o1 === 169 && o2 === 254) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true; // CGNAT
    return false;
  }

  // Decimal / hex / octal IP tricks → reject non-hostname literals without dots handled above
  if (/^\d+$/.test(host) || /^0x/i.test(host)) return true;

  if (!host.includes(".")) return true;
  return false;
}

function normalizePublicUrl(input) {
  if (!input || typeof input !== "string") return null;
  let u = input.trim().slice(0, 2048);
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    if (isBlockedHost(parsed.hostname)) return null;
    // Drop hash; keep query (some sites need it)
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function stripHeaderInjection(s, max = 200) {
  return String(s || "")
    .replace(/[\r\n\0]+/g, " ")
    .trim()
    .slice(0, max);
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
  clientIp,
  applyCors,
  isBlockedHost,
  normalizePublicUrl,
  stripHeaderInjection,
};
