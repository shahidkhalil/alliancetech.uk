/**
 * Treatment Money Map — per-treatment Google rankings for the high-value
 * services a clinic actually makes money on. Uses Serper (one search per
 * treatment, capped) and grounds revenue math in typical case values.
 *
 * avgCaseValuePKR are conservative market-typical figures for Pakistan,
 * clearly labelled as estimates in the report.
 */

// High-value treatments per specialty. Order = business priority.
const TREATMENTS = {
  dentist: [
    { name: "Dental Implants", query: "dental implants", avgCaseValuePKR: 100000 },
    { name: "Braces / Orthodontics", query: "braces price", avgCaseValuePKR: 150000 },
    { name: "Veneers", query: "dental veneers", avgCaseValuePKR: 80000 },
    { name: "Teeth Whitening", query: "teeth whitening", avgCaseValuePKR: 25000 },
  ],
  "aesthetic clinic": [
    { name: "Botox / Fillers", query: "botox fillers", avgCaseValuePKR: 40000 },
    { name: "Laser Hair Removal", query: "laser hair removal", avgCaseValuePKR: 60000 },
    { name: "Hydrafacial", query: "hydrafacial", avgCaseValuePKR: 15000 },
    { name: "PRP / Skin Rejuvenation", query: "prp treatment", avgCaseValuePKR: 35000 },
  ],
  dermatologist: [
    { name: "Acne Treatment", query: "acne treatment", avgCaseValuePKR: 20000 },
    { name: "Laser Treatments", query: "laser skin treatment", avgCaseValuePKR: 50000 },
    { name: "Hair Loss Treatment", query: "hair loss treatment", avgCaseValuePKR: 45000 },
  ],
  "hair transplant clinic": [
    { name: "FUE Hair Transplant", query: "fue hair transplant", avgCaseValuePKR: 200000 },
    { name: "PRP for Hair", query: "prp hair treatment", avgCaseValuePKR: 45000 },
  ],
  psychologist: [
    { name: "Therapy Sessions", query: "best psychologist", avgCaseValuePKR: 8000 },
    { name: "Couples Counselling", query: "couples counselling", avgCaseValuePKR: 10000 },
  ],
};

function rootDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

async function serperSearch(q, apiKey) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "pk", num: 10 }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}`);
  return res.json();
}

/**
 * Build the money map: for each high-value treatment in this specialty,
 * where does the clinic rank and who owns the treatment locally?
 */
async function buildMoneyMap(auditedUrl, specialty, city, apiKey) {
  const treatments = TREATMENTS[specialty];
  if (!treatments) return null; // specialty we don't map — skip gracefully

  const ownDomain = rootDomain(new URL(auditedUrl).hostname);

  const rows = await Promise.all(
    treatments.map(async (t) => {
      try {
        const data = await serperSearch(`${t.query} ${city}`, apiKey);
        const organic = (data.organic || []).map((r, i) => ({
          position: i + 1,
          title: r.title,
          domain: rootDomain(new URL(r.link).hostname),
        }));
        const yourRank = organic.find((r) => r.domain === ownDomain)?.position ?? null;
        const leader = organic.find((r) => r.domain !== ownDomain) || null;
        const topPlace = (data.places || [])[0] || null;

        return {
          treatment: t.name,
          searchQuery: `${t.query} ${city}`,
          avgCaseValuePKR: t.avgCaseValuePKR,
          yourRank, // null = not in top 10
          leader: leader ? { title: leader.title, domain: leader.domain, position: leader.position } : null,
          topMapListing: topPlace
            ? { name: topPlace.title, rating: topPlace.rating, reviews: topPlace.ratingCount }
            : null,
        };
      } catch {
        return null; // one failed search shouldn't kill the map
      }
    })
  );

  const valid = rows.filter(Boolean);
  return valid.length ? valid : null;
}

module.exports = { buildMoneyMap, TREATMENTS };
