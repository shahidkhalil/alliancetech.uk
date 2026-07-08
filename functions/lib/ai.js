/**
 * Provider-agnostic AI report generator.
 * Switch providers with the AI_PROVIDER env var ("openai" | "anthropic").
 * Only the provider that matches needs its API key set.
 */

const SYSTEM_PROMPT = `You are a senior web strategist for Alliance Tech, a Pakistani agency that grows dental and aesthetic clinics online. You audit clinic websites and explain problems in plain, non-technical language a busy doctor understands.

You are given hard data (Google PageSpeed scores, Core Web Vitals, on-page SEO facts, and conversion signals). Turn it into an honest, evidence-grounded report. Rules:

GROUNDING (the most important rules):
- Every claim MUST trace to a specific data point you were given. Never invent problems.
- If the PageSpeed section contains an "error" field or is missing scores, you have NO speed data: do not mention loading speed, load times, or performance AT ALL — not in the headline, not in mysteryPatient, nowhere. Focus only on what you can verify from the SEO/conversion data.
- If a performance score is 80+, the site is FAST — say so as a positive. 50-79 is moderate. Only below 50 is genuinely slow.
- The "mysteryPatient" story may only reference things verified in the data (e.g. conversion.hasPhoneLink=false means no tap-to-call; hasWhatsApp=false means no WhatsApp button). Never claim the site "wouldn't load" or "was slow" unless the performance data proves it.

CALIBRATION (be fair, not alarmist):
- Score honestly across the full range. A site with good speed, solid SEO tags, and clear contact options should score 75-90 with a positive verdict. Reserve scores under 40 for sites with severe, verified problems.
- If the site is genuinely good, say so plainly and keep criticalIssues short (or empty) — credibility comes from honesty, and a fair report makes the reader trust the criticism that IS there.
- criticalIssues are ONLY for verified problems that directly cost patients. Lesser findings go in improvements.

TONE:
- Talk about PATIENTS and MONEY, not "scores" and jargon. Translate each verified issue into real-world impact.
- Revenue impact: estimate conservatively, clearly label it an estimate, and scale it to the severity of verified issues. Assume an average patient is worth ~PKR 15,000 unless told otherwise. If the site is in good shape, frame it as upside ("a few fixes could add...") rather than loss.
- Prioritise ruthlessly: biggest verified business problems first.
- Return ONLY valid JSON matching the requested schema. No markdown, no commentary.`;

/** Keep prompts small: send only fields the model actually reasons about. */
function slimData(audit) {
  const m = audit.pagespeed?.mobile;
  const pagespeed = m?.scores
    ? { scores: m.scores, metrics: m.metrics, topOpportunities: (m.opportunities || []).slice(0, 3) }
    : { error: m?.error || "unavailable" };

  const s = audit.seo || {};
  const seo = s.error
    ? { error: s.error }
    : {
        title: (s.title || "").slice(0, 90),
        titleLength: s.titleLength,
        metaDescriptionLength: s.metaDescriptionLength,
        h1Count: s.h1Count,
        isHttps: s.isHttps,
        hasCanonical: s.hasCanonical,
        hasViewport: s.hasViewport,
        hasOgImage: s.hasOgImage,
        hasStructuredData: s.hasStructuredData,
        wordCount: s.wordCount,
        isSpa: s.isSpa,
        imagesMissingAlt: s.imagesMissingAlt,
        conversion: s.conversion,
      };

  let competitors = null;
  if (audit.competitors) {
    const c = audit.competitors;
    competitors = {
      searchQuery: c.searchQuery,
      yourGoogleRank: c.yourGoogleRank,
      rivals: (c.competitorsAboveYou || []).map((r) => ({
        position: r.position,
        title: (r.title || "").slice(0, 60),
        domain: r.domain,
        profile: r.profile
          ? {
              hasWhatsApp: r.profile.hasWhatsApp,
              hasPhoneLink: r.profile.hasPhoneLink,
              hasBooking: r.profile.hasBooking,
              hasReviews: r.profile.hasReviews,
            }
          : undefined,
      })),
      localMapPack: c.localMapPack,
    };
  }

  const moneyMap = audit.moneyMap
    ? audit.moneyMap.map((t) => ({
        treatment: t.treatment,
        avgCaseValuePKR: t.avgCaseValuePKR,
        yourRank: t.yourRank,
        leader: t.leader ? { title: (t.leader.title || "").slice(0, 60), domain: t.leader.domain } : null,
      }))
    : null;

  return { pagespeed, seo, competitors, moneyMap };
}

function buildUserPrompt(audit) {
  const slim = slimData(audit);
  const psOk = !slim.pagespeed.error;
  return `Audit this website and return the JSON report.

WEBSITE: ${audit.url}

=== SPEED (Google PageSpeed / Lighthouse, mobile) ===
${psOk ? "" : "NOTE: Speed measurement FAILED — you have no speed data. Do not mention speed anywhere in the report.\n"}${JSON.stringify(slim.pagespeed)}

=== ON-PAGE SEO & UX SIGNALS ===
${slim.seo.isSpa ? "NOTE: This is a JavaScript-rendered app. Content signals were extracted from its JS bundles. Do NOT criticise 'thin content' or low word count — that measurement is unreliable for such sites. Do note that JS-only rendering can hurt Google indexing (a legitimate SEO point).\n" : ""}${JSON.stringify(slim.seo)}

${slim.competitors ? `=== LOCAL COMPETITOR BENCHMARK (real Google results for "${slim.competitors.searchQuery}") ===
Their Google rank for this search: ${slim.competitors.yourGoogleRank ?? "NOT in the top 10 — patients never see them"}
${JSON.stringify(slim.competitors)}
Use this for "competitorComparison": name the actual competitors, state the rank gap plainly, and point out concrete things the rivals' sites have that this site lacks (from their profiles). This is the most persuasive section — make it specific, factual, and sting a little, but never invent details.
` : ""}
${slim.moneyMap ? `=== TREATMENT MONEY MAP (per-treatment Google rankings, real searches) ===
${JSON.stringify(slim.moneyMap)}
Use this for the "moneyMap" output field. For each treatment: state their rank (or "not in top 10 — invisible"), who owns the search (the leader), and a conservative revenue exposure estimate using avgCaseValuePKR (label it an estimate; assume even a handful of cases/month at stake — do NOT invent search-volume numbers). Set status: "invisible" (not in top 10), "close" (rank 4-10), or "strong" (rank 1-3, tell them to defend it). End with "moneyMapVerdict": one sentence naming where they're strongest and which high-value treatment is their biggest missed opportunity.
` : ""}
${audit.gmb && audit.gmb.found ? `=== GOOGLE BUSINESS PROFILE CHECK (real Places data) ===
Their listing: ${JSON.stringify(audit.gmb.you)}
Map-pack rivals' listings: ${JSON.stringify(audit.gmb.rivals)}
Use this for "gmbInsight": 2-4 sentences comparing their Google Business listing to the rivals — rating gap, review count gap, review pace (reviewsPerMonth), missing photos/hours/website/phone. These are fixes they can start TODAY; say which single GMB fix matters most. Never invent numbers.
` : audit.gmb && !audit.gmb.found ? `=== GOOGLE BUSINESS PROFILE CHECK ===
No Google Business listing found for "${audit.gmb.searchedFor}". Use "gmbInsight" to tell them plainly: patients searching on Google Maps cannot find them at all, and creating a (free) listing is their single fastest win.
` : ""}
Return JSON with EXACTLY this shape:
{
  "overallScore": <0-100 integer, your holistic judgement>,
  "verdict": "<3-6 word summary e.g. 'Losing patients to slow load'>",
  "headline": "<one punchy sentence stating their single biggest problem in patient/money terms>",
  "mysteryPatient": "<2-4 sentences role-playing a patient trying to book on mobile>",
  "revenueImpact": "<1-2 sentences estimating lost patients/revenue per month, labelled an estimate>",
  "criticalIssues": [ { "title": "<short>", "impact": "<why it costs them patients/money>", "fix": "<what to do>" } ],
  "improvements": [ { "title": "<short>", "impact": "<short>", "fix": "<short>" } ],
  "doingWell": [ "<short positive point>" ],
  ${audit.competitors ? '"competitorComparison": "<2-4 sentences comparing them head-to-head with the competitors and why the competitor wins>",' : ""}
  ${audit.moneyMap ? '"moneyMap": [ { "treatment": "<name>", "status": "invisible|close|strong", "yourRank": <number or null>, "leader": "<who owns this search, or null>", "insight": "<1-2 sentences: what this means in patients/PKR, labelled estimate>" } ], "moneyMapVerdict": "<one sentence: strongest area + biggest missed high-value opportunity>",' : ""}
  ${audit.gmb ? '"gmbInsight": "<2-4 sentences on their Google Business Profile vs rivals, with the one fix to do today>",' : ""}
  "nextStep": "<one warm sentence inviting them to get Alliance Tech to fix it>"
}
Keep criticalIssues to the top 3, improvements to 3-5, doingWell to 3-5.`;
}

async function callOpenAI(audit, apiKey) {
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(audit) },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callAnthropic(audit, apiKey) {
  const model = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `${buildUserPrompt(audit)}\n\nRespond with only the JSON object.` }],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

async function generateReport(audit, { provider, openaiKey, anthropicKey }) {
  if (provider === "anthropic") {
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");
    return callAnthropic(audit, anthropicKey);
  }
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
  return callOpenAI(audit, openaiKey);
}

module.exports = { generateReport };
