/**
 * GMB (Google Business Profile) Health Check via the Places API.
 * Compares the clinic's listing against the map-pack winners:
 * rating, review count, review velocity, photos, hours, links.
 *
 * Uses the same Google API key as PageSpeed (enable "Places API" on it).
 * Every lookup is cached 3 days, so credits stay near zero.
 */

const { getCache, setCache } = require("./cache");

const TTL_DAYS = 3;

// Places API (New) — https://places.googleapis.com/v1
const SEARCH_FIELDS = "places.id,places.displayName,places.rating,places.userRatingCount";
const DETAIL_FIELDS = "id,displayName,rating,userRatingCount,photos,regularOpeningHours,websiteUri,nationalPhoneNumber,reviews";

async function placesTextSearch(query, apiKey) {
  const cacheKey = `placesv2:search:${query.toLowerCase()}`;
  const hit = await getCache(cacheKey);
  if (hit) return hit;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": SEARCH_FIELDS,
    },
    body: JSON.stringify({ textQuery: query, regionCode: "PK", maxResultCount: 3 }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Places search ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const slim = (data.places || []).slice(0, 3).map((r) => ({
    placeId: r.id,
    name: r.displayName?.text || "",
    rating: r.rating,
    reviews: r.userRatingCount,
  }));
  await setCache(cacheKey, slim, TTL_DAYS);
  return slim;
}

async function placeDetails(placeId, apiKey) {
  const cacheKey = `placesv2:details:${placeId}`;
  const hit = await getCache(cacheKey);
  if (hit) return hit;

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": DETAIL_FIELDS },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Places details ${res.status}`);
  const r = await res.json();

  // Review velocity: up to 5 most-recent reviews with publish times.
  let reviewsPerMonth = null;
  const times = (r.reviews || [])
    .map((rv) => (rv.publishTime ? Date.parse(rv.publishTime) / 1000 : null))
    .filter(Boolean)
    .sort();
  if (times.length >= 2) {
    const spanDays = (Date.now() / 1000 - times[0]) / 86400;
    if (spanDays > 0) reviewsPerMonth = Math.round((times.length / spanDays) * 30 * 10) / 10;
  }

  const slim = {
    name: r.displayName?.text || "",
    rating: r.rating ?? null,
    reviews: r.userRatingCount ?? 0,
    photosCount: (r.photos || []).length, // API caps at 10; ">=10" means plenty
    hasHours: !!r.regularOpeningHours,
    hasWebsite: !!r.websiteUri,
    website: r.websiteUri || null,
    hasPhone: !!r.nationalPhoneNumber,
    reviewsPerMonth,
  };
  await setCache(cacheKey, slim, TTL_DAYS);
  return slim;
}

function rootDomain(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Best-effort business name from the site's own tags. */
function businessName(seo) {
  const raw = seo.h1Text || seo.title || "";
  // Take the part before separators like | — – : ,
  return raw.split(/[|\-–—:,]/)[0].trim().slice(0, 60);
}

/**
 * Build the GMB comparison: the clinic's own listing vs. the top map-pack rivals.
 */
async function buildGmbCheck(auditedUrl, seo, competitors, apiKey) {
  const city = competitors?.city || "Lahore";
  const name = businessName(seo);
  if (!name) return null;

  const ownDomain = rootDomain(auditedUrl);
  // Domain root without TLD often IS the business name (alinadentalclinic → "alinadentalclinic").
  const domainName = (ownDomain || "").split(".")[0];

  // 1. Find their own listing — try title-derived name, then the domain itself.
  //    A candidate whose website matches their domain is a verified match.
  const queries = [`${name} ${city}`, `${domainName} ${city}`];
  let own = null;
  let fallback = null;
  for (const q of queries) {
    const candidates = await placesTextSearch(q, apiKey).catch(() => []);
    for (const c of candidates) {
      const d = await placeDetails(c.placeId, apiKey).catch(() => null);
      if (!d) continue;
      if (d.website && rootDomain(d.website) === ownDomain) { own = d; break; }
      if (!fallback) fallback = d;
    }
    if (own) break;
  }
  const matchedByDomain = !!own;
  if (!own) own = fallback;
  if (!own) {
    return { found: false, searchedFor: `${name} ${city}`, you: null, rivals: [] };
  }

  // 2. Rivals: map-pack names from Serper; if empty, ask Places directly
  //    for the top clinics of this specialty in the city.
  let rivalNames = (competitors?.localMapPack || [])
    .map((p) => p.name)
    .filter((n) => n && n.toLowerCase() !== own.name.toLowerCase())
    .slice(0, 2);

  if (!rivalNames.length) {
    const specialty = competitors?.specialty || "clinic";
    const top = await placesTextSearch(`best ${specialty} ${city}`, apiKey).catch(() => []);
    rivalNames = top
      .map((p) => p.name)
      .filter((n) => n && n.toLowerCase() !== own.name.toLowerCase())
      .slice(0, 2);
  }

  const rivals = [];
  for (const rn of rivalNames) {
    try {
      const found = await placesTextSearch(`${rn} ${city}`, apiKey);
      if (found.length) rivals.push(await placeDetails(found[0].placeId, apiKey));
    } catch { /* skip rival on failure */ }
  }

  return {
    found: true,
    matchedByDomain,
    searchedFor: `${name} ${city}`,
    you: own,
    rivals,
  };
}

module.exports = { buildGmbCheck };
