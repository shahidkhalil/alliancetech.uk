/**
 * Treatment Money Map — per-treatment Google rankings for the high-value
 * services a clinic actually makes money on. Uses Serper (one search per
 * treatment, capped) and grounds revenue math in typical case values.
 *
 * avgCaseValueUSD are conservative market-typical figures for the US market,
 * clearly labelled as estimates in the report.
 */

// High-value treatments per specialty. Order = business priority.
const TREATMENTS = {
  dentist: [
    { name: "Dental Implants", query: "dental implants", avgCaseValueUSD: 3000 },
    { name: "Braces / Orthodontics", query: "braces price", avgCaseValueUSD: 5000 },
    { name: "Veneers", query: "dental veneers", avgCaseValueUSD: 150 },
    { name: "Teeth Whitening", query: "teeth whitening", avgCaseValueUSD: 500 },
  ],
  "aesthetic clinic": [
    { name: "Botox / Fillers", query: "botox fillers", avgCaseValueUSD: 600 },
    { name: "Laser Hair Removal", query: "laser hair removal", avgCaseValueUSD: 2500 },
    { name: "Hydrafacial", query: "hydrafacial", avgCaseValueUSD: 200 },
    { name: "PRP / Skin Rejuvenation", query: "prp treatment", avgCaseValueUSD: 1200 },
  ],
  dermatologist: [
    { name: "Acne Treatment", query: "acne treatment", avgCaseValueUSD: 1500 },
    { name: "Laser Treatments", query: "laser skin treatment", avgCaseValueUSD: 2000 },
    { name: "Hair Loss Treatment", query: "hair loss treatment", avgCaseValueUSD: 3000 },
  ],
  "hair transplant clinic": [
    { name: "FUE Hair Transplant", query: "fue hair transplant", avgCaseValueUSD: 150 },
    { name: "PRP for Hair", query: "prp hair treatment", avgCaseValueUSD: 3000 },
  ],
  psychologist: [
    { name: "Therapy Sessions", query: "best psychologist", avgCaseValueUSD: 150 },
    { name: "Couples Counselling", query: "couples counselling", avgCaseValueUSD: 200 },
  ],
};

function rootDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

const { serperSearch } = require("./serper");

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
          avgCaseValueUSD: t.avgCaseValueUSD,
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
