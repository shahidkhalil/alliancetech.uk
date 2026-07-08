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

async function placesTextSearch(query, apiKey) {
  const cacheKey = `places:search:${query.toLowerCase()}`;
  const hit = await getCache(cacheKey);
  if (hit) return hit;

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=pk&key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places search ${data.status}`);
  }
  const slim = (data.results || []).slice(0, 3).map((r) => ({
    placeId: r.place_id,
    name: r.name,
    rating: r.rating,
    reviews: r.user_ratings_total,
  }));
  await setCache(cacheKey, slim, TTL_DAYS);
  return slim;
}

async function placeDetails(placeId, apiKey) {
  const cacheKey = `places:details:${placeId}`;
  const hit = await getCache(cacheKey);
  if (hit) return hit;

  const fields = "name,rating,user_ratings_total,photos,opening_hours,website,formatted_phone_number,reviews";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Places details ${data.status}`);
  const r = data.result || {};

  // Review velocity: Places returns up to 5 most-recent reviews with unix times.
  let reviewsPerMonth = null;
  const times = (r.reviews || []).map((rv) => rv.time).filter(Boolean).sort();
  if (times.length >= 2) {
    const spanDays = (Date.now() / 1000 - times[0]) / 86400;
    if (spanDays > 0) reviewsPerMonth = Math.round((times.length / spanDays) * 30 * 10) / 10;
  }

  const slim = {
    name: r.name,
    rating: r.rating ?? null,
    reviews: r.user_ratings_total ?? 0,
    photosCount: (r.photos || []).length, // API caps at 10; ">=10" means plenty
    hasHours: !!r.opening_hours,
    hasWebsite: !!r.website,
    website: r.website || null,
    hasPhone: !!r.formatted_phone_number,
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

  // 1. Find their own listing.
  const candidates = await placesTextSearch(`${name} ${city}`, apiKey);
  if (!candidates.length) {
    return { found: false, searchedFor: `${name} ${city}`, you: null, rivals: [] };
  }

  // Prefer a candidate whose website matches their domain.
  let own = null;
  for (const c of candidates) {
    const d = await placeDetails(c.placeId, apiKey).catch(() => null);
    if (!d) continue;
    if (d.website && rootDomain(d.website) === ownDomain) { own = d; break; }
    if (!own) own = d; // fallback: first resolvable result
  }
  const matchedByDomain = !!(own?.website && rootDomain(own.website) === ownDomain);

  // 2. Profile the top 2 map-pack rivals (names from the Serper map pack).
  const rivalNames = (competitors?.localMapPack || [])
    .map((p) => p.name)
    .filter((n) => n && own && n.toLowerCase() !== own.name.toLowerCase())
    .slice(0, 2);

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
