/**
 * Shared Serper client with Firestore caching.
 * Search results for a query like "dentist in Lahore" barely change day to
 * day, and the SAME queries repeat across audits of every clinic in that
 * city+specialty — so caching them 3 days cuts Serper spend to near zero.
 */

const { getCache, setCache } = require("./cache");

const TTL_DAYS = 3;

async function serperSearch(q, apiKey) {
  const cacheKey = `serper:${q.toLowerCase().trim()}`;
  const hit = await getCache(cacheKey);
  if (hit) return hit;

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "pk", num: 10 }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}`);
  const data = await res.json();

  // Keep only what we use — smaller cache docs, smaller prompts.
  const slim = {
    organic: (data.organic || []).map((r) => ({
      title: r.title,
      link: r.link,
      snippet: (r.snippet || "").slice(0, 120),
    })),
    places: (data.places || []).slice(0, 5).map((p) => ({
      title: p.title,
      rating: p.rating,
      ratingCount: p.ratingCount,
    })),
  };
  await setCache(cacheKey, slim, TTL_DAYS);
  return slim;
}

module.exports = { serperSearch };
