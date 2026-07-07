/**
 * Alliance Tech — AI Website Audit function.
 * POST { url } -> full audit report JSON.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const { runPageSpeed } = require("./lib/pagespeed");
const { analyzeSeo } = require("./lib/seo");
const { findCompetitors } = require("./lib/competitors");
const { generateReport } = require("./lib/ai");

admin.initializeApp();
const db = admin.firestore();

// Secrets (set via: firebase functions:secrets:set NAME)
// ANTHROPIC_API_KEY is optional — only bind it if you switch AI_PROVIDER to "anthropic".
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const PAGESPEED_API_KEY = defineSecret("PAGESPEED_API_KEY");
const SERPER_API_KEY = defineSecret("SERPER_API_KEY");

function normalizeUrl(input) {
  if (!input || typeof input !== "string") return null;
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    // Block localhost / internal addresses (basic SSRF guard).
    const host = parsed.hostname;
    if (/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|169\.254\.)/.test(host)) return null;
    if (!host.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

exports.auditWebsite = onRequest(
  {
    region: "asia-south1",
    cors: true,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY, PAGESPEED_API_KEY, SERPER_API_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }

    const url = normalizeUrl(req.body?.url);
    if (!url) {
      res.status(400).json({ error: "Please provide a valid website URL." });
      return;
    }

    try {
      const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
      const psApiKey = PAGESPEED_API_KEY.value() || undefined;

      // Gather hard data in parallel.
      const [pagespeed, seo] = await Promise.all([
        runPageSpeed(url, psApiKey).catch((e) => ({ error: e.message })),
        analyzeSeo(url).catch((e) => ({ error: e.message })),
      ]);

      // Competitor benchmark (optional — needs SERPER_API_KEY and a readable site).
      let competitors = null;
      const serperKey = SERPER_API_KEY.value();
      if (serperKey && seo && !seo.error) {
        competitors = await findCompetitors(url, seo, serperKey).catch((e) => {
          console.warn("Competitor lookup failed:", e.message);
          return null;
        });
      }

      // AI turns data into the report.
      const report = await generateReport(
        { url, pagespeed, seo, competitors },
        {
          provider,
          openaiKey: OPENAI_API_KEY.value() || undefined,
          anthropicKey: process.env.ANTHROPIC_API_KEY || undefined,
        }
      );

      // Store the audit (lead intelligence + analytics).
      const doc = await db.collection("audits").add({
        url,
        report,
        rawData: { pagespeed, seo, competitors },
        provider,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        id: doc.id,
        url,
        report,
        meta: {
          pagespeedMobileOk: !!pagespeed?.mobile?.scores,
          pagespeedDesktopOk: !!pagespeed?.desktop?.scores,
          seoOk: !seo?.error,
        },
      });
    } catch (err) {
      console.error("Audit failed:", err);
      res.status(500).json({ error: "Audit failed. Please try again.", detail: err.message });
    }
  }
);
