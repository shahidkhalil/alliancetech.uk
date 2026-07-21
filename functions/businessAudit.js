/**
 * AI Business Growth Advisor API.
 * POST { businessType, monthlyCustomers, marketingBudget, biggestChallenge, primaryGoal }
 *  -> { report: { growthScore, summary, ... } }
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { generateBusinessGrowthReport } = require("./lib/businessGrowthAI");
const { checkRateLimit } = require("./lib/cache");
const { applyCors, clientIp } = require("./lib/security");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
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

exports.businessAudit = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 90,
    memory: "256MiB",
    secrets: [OPENAI_API_KEY],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }

    const answers = validateBody(req.body);
    if (!answers) {
      res.status(400).json({ error: "Please complete all questions before generating your report." });
      return;
    }

    const ip = clientIp(req);
    const allowed = await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "business_audit");
    if (!allowed) {
      res.status(429).json({ error: "Daily limit reached. Please try again tomorrow or contact us directly." });
      return;
    }

    try {
      const report = await generateBusinessGrowthReport(answers, OPENAI_API_KEY.value());

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
);
