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

function buildUserPrompt(audit) {
  const psOk = !!(audit.pagespeed?.mobile?.scores || audit.pagespeed?.desktop?.scores);
  return `Audit this website and return the JSON report.

WEBSITE: ${audit.url}

=== SPEED (Google PageSpeed / Lighthouse) ===
${psOk ? "" : "NOTE: Speed measurement FAILED — you have no speed data. Do not mention speed anywhere in the report.\n"}${JSON.stringify(audit.pagespeed, null, 2)}

=== ON-PAGE SEO & UX SIGNALS ===
${JSON.stringify(audit.seo, null, 2)}

${audit.competitors ? `=== LOCAL COMPETITOR BENCHMARK (real Google results for "${audit.competitors.searchQuery}") ===
Their Google rank for this search: ${audit.competitors.yourGoogleRank ?? "NOT in the top 10 — patients never see them"}
${JSON.stringify(audit.competitors, null, 2)}
Use this for "competitorComparison": name the actual competitors, state the rank gap plainly, and point out concrete things the rivals' sites have that this site lacks (from their profiles). This is the most persuasive section — make it specific, factual, and sting a little, but never invent details.
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
