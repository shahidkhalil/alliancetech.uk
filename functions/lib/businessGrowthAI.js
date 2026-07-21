/**
 * AI Business Growth Advisor — generates a structured growth report from questionnaire answers.
 */

const SYSTEM_PROMPT = `You are a senior business growth consultant at Alliance Tech, a US agency specializing in digital growth for dental clinics, aesthetic clinics, and other local/service businesses.

You receive answers from a short business questionnaire. Produce a practical, honest growth assessment tailored to their industry and situation.

Rules:
- Be specific to their business type, volume, budget, challenge, and 12-month goal.
- Recommend Alliance Tech services only when genuinely relevant (Website Development, AI Automation, Local SEO, Google Ads, AI Receptionist, Mobile App, Custom Software, WhatsApp AI, EHR Platform, Digital Marketing).
- growthScore: integer 0-100 reflecting current growth readiness (marketing foundation, digital presence, automation, lead capture). Be fair — average businesses score 45-65; strong setups 75+.
- biggestIssues and opportunities: 3-5 items each, concrete and actionable.
- recommendedServices: 2-5 Alliance services mapped to their needs.
- timeline: realistic implementation window (e.g. "90-120 days for foundational wins").
- estimatedROI: conservative qualitative ROI statement, label as estimate.
- nextSteps: 4-6 ordered action items they can start this month.
- Return ONLY valid JSON matching the schema. No markdown.`;

function buildUserPrompt(answers) {
  return `Analyze this business and return the growth report JSON.

BUSINESS TYPE: ${answers.businessType}
MONTHLY CUSTOMERS: ${answers.monthlyCustomers}
MONTHLY MARKETING BUDGET: ${answers.marketingBudget}
BIGGEST CHALLENGE: ${answers.biggestChallenge}
12-MONTH PRIMARY GOAL: ${answers.primaryGoal}

Return JSON with EXACTLY this shape:
{
  "growthScore": <integer 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "biggestIssues": ["<issue>", ...],
  "opportunities": ["<opportunity>", ...],
  "recommendedServices": ["<Alliance Tech service name>", ...],
  "timeline": "<realistic timeline string>",
  "estimatedROI": "<ROI estimate string>",
  "nextSteps": ["<step>", ...]
}`;
}

function sanitizeReport(raw) {
  const score = Math.min(100, Math.max(0, Math.round(Number(raw.growthScore) || 0)));
  const arr = (v) => (Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 8) : []);
  return {
    growthScore: score,
    summary: String(raw.summary || "").slice(0, 1200),
    biggestIssues: arr(raw.biggestIssues).slice(0, 6),
    opportunities: arr(raw.opportunities).slice(0, 6),
    recommendedServices: arr(raw.recommendedServices).slice(0, 6),
    timeline: String(raw.timeline || "90-120 days").slice(0, 300),
    estimatedROI: String(raw.estimatedROI || "").slice(0, 500),
    nextSteps: arr(raw.nextSteps).slice(0, 8),
  };
}

async function callOpenAI(answers, apiKey) {
  const model = process.env.BUSINESS_AUDIT_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(answers) },
      ],
    }),
    signal: AbortSignal.timeout(75000),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return sanitizeReport(parsed);
}

async function generateBusinessGrowthReport(answers, openaiKey) {
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
  return callOpenAI(answers, openaiKey);
}

module.exports = { generateBusinessGrowthReport, sanitizeReport };
