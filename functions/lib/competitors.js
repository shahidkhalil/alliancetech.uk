/**
 * Local competitor benchmarking via Serper.dev (Google search results API).
 * Optional feature — runs only when a SERPER_API_KEY is configured.
 */

const { analyzeSeo } = require("./seo");
const { serperSearch } = require("./serper");

const SPECIALTIES = [
  { re: /dentist|dental|orthodont|teeth|tooth|smile/i, term: "dentist" },
  { re: /aesthetic|cosmetic|botox|filler|laser|skin care|skincare/i, term: "aesthetic clinic" },
  { re: /dermatolog|skin clinic/i, term: "dermatologist" },
  { re: /psycholog|therapy|therapist|counsel/i, term: "psychologist" },
  { re: /physiotherap|rehab/i, term: "physiotherapist" },
  { re: /gynecolog|obstetric/i, term: "gynecologist" },
  { re: /pediatric|child specialist/i, term: "pediatrician" },
  { re: /eye|ophthalmolog|lasik|vision/i, term: "eye specialist" },
  { re: /hair transplant/i, term: "hair transplant clinic" },
  { re: /hospital|clinic|doctor|medical/i, term: "clinic" },
];

const CITIES = [
  "Houston", "Los Angeles", "Chicago", "Dallas", "New York", "Phoenix",
  "San Antonio", "Austin", "Miami", "Dallas", "Seattle", "Denver",
];

/** Infer "what would a patient google" from the site's own content. */
function inferQuery(seo) {
  const haystack = [seo.title, seo.metaDescription, seo.h1Text].filter(Boolean).join(" ");
  const specialty = (SPECIALTIES.find((s) => s.re.test(haystack)) || SPECIALTIES.at(-1)).term;
  const city = CITIES.find((c) => new RegExp(c, "i").test(haystack)) || "Houston";
  return { query: `${specialty} in ${city}`, specialty, city };
}

function rootDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Search Google, locate the audited site's rank, and profile the top
 * competitors ranking above (or ahead of) it.
 */
async function findCompetitors(auditedUrl, seo, apiKey) {
  const { query, specialty, city } = inferQuery(seo);
  const ownDomain = rootDomain(new URL(auditedUrl).hostname);

  const data = await serperSearch(query, apiKey);

  const organic = (data.organic || []).map((r, i) => ({
    position: i + 1,
    title: r.title,
    link: r.link,
    domain: rootDomain(new URL(r.link).hostname),
    snippet: r.snippet || "",
  }));

  const ownRank = organic.find((r) => r.domain === ownDomain)?.position ?? null;

  // Top 5 competitors: sites ranking above them (or simply the top 5 if unranked).
  const rivals = organic
    .filter((r) => r.domain !== ownDomain)
    .filter((r) => (ownRank ? r.position < ownRank : true))
    .slice(0, 5);

  // Quick on-page profile of the top 3 rivals (parallel, best-effort).
  const profiles = await Promise.all(
    rivals.slice(0, 3).map(async (r) => {
      try {
        const s = await analyzeSeo(r.link);
        return {
          ...r,
          profile: {
            title: s.title,
            hasWhatsApp: s.conversion.hasWhatsApp,
            hasPhoneLink: s.conversion.hasPhoneLink,
            hasBooking: s.conversion.hasBooking,
            hasReviews: s.conversion.hasReviews,
            hasStructuredData: s.hasStructuredData,
            wordCount: s.wordCount,
          },
        };
      } catch {
        return r; // keep search-result info even if their site blocks us
      }
    })
  );

  // Local map pack (Google Business listings) if Serper returned it.
  const mapPack = (data.places || []).slice(0, 5).map((p) => ({
    name: p.title,
    rating: p.rating,
    reviews: p.ratingCount,
  }));

  return {
    searchQuery: query,
    specialty,
    city,
    yourGoogleRank: ownRank, // null = not in top 10
    competitorsAboveYou: profiles.concat(rivals.slice(3)),
    localMapPack: mapPack,
  };
}

module.exports = { findCompetitors };
