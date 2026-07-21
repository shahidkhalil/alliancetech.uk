/**
 * AI Business Growth Advisor — handler (runs inside auditWebsite to avoid a new Cloud Function deploy).
 */

const { generateBusinessGrowthReport } = require("./lib/businessGrowthAI");
const { checkRateLimit } = require("./lib/cache");
const { clientIp } = require("./lib/security");
const admin = require("firebase-admin");

const DAILY_LIMIT_PER_IP = 8;

function sanitizeStr(v, max = 500) {
  return String(v ?? "").trim().slice(0, max);
}

function validateBody(body) {
  if (!body || typeof body !== "object") return null;
  const answers = {
    businessType: sanitizeStr(body.businessType, 80),
    monthlyCustomers: sanitizeStr(body.monthlyCustomers, 120),
    marketingBudget: sanitizeStr(body.marketingBudget, 80),
    biggestChallenge: sanitizeStr(body.biggestChallenge, 80),
    primaryGoal: sanitizeStr(body.primaryGoal, 600),
  };
  const required = [
    "businessType",
    "monthlyCustomers",
    "marketingBudget",
    "biggestChallenge",
    "primaryGoal",
  ];
  if (required.some((k) => !answers[k])) return null;
  return answers;
}

/** Returns true if this POST body is a business-growth questionnaire (not a website URL audit). */
function isBusinessAuditRequest(body) {
  return Boolean(body?.businessType && !body?.url);
}

async function handleBusinessAudit(req, res, openaiKey) {
  const answers = validateBody(req.body);
  if (!answers) {
    res.status(400).json({ error: "Please complete all questions before generating your report." });
    return;
  }

  const ip = clientIp(req);
  if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "business_audit"))) {
    res.status(429).json({
      error: "Daily limit reached. Please try again tomorrow or contact us directly.",
    });
    return;
  }

  try {
    const report = await generateBusinessGrowthReport(answers, openaiKey);

    try {
      const db = admin.firestore();
      await db.collection("business_audits").add({
        answers,
        report,
        ip: ip.slice(0, 64),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn("business_audits log failed:", e.message);
    }

    res.status(200).json({ report });
  } catch (err) {
    console.error("Business audit failed:", err);
    res.status(500).json({ error: "Analysis failed. Please try again in a moment." });
  }
}

module.exports = { handleBusinessAudit, isBusinessAuditRequest };
