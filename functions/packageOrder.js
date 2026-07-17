/**
 * Package order / booking request.
 * Distinct from the audit lead: the customer has picked a specific service
 * + package + price, so we record the order, send THEM a confirmation with
 * what they ordered, and raise a lead so the owner is alerted.
 *
 * POST { name, email, phone, clinicName?, serviceId, serviceName,
 *        packageName, price, period?, notes? } -> { ok, reference }
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const { checkRateLimit } = require("./lib/cache");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const DAILY_LIMIT_PER_IP = 10;

function str(v, max = 120) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function emailCustomer(o, reference, user, pass) {
  if (!user || !pass || !o.email) return;
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"Alliance Tech" <${user}>`,
    to: o.email,
    subject: `We've got your request — ${o.serviceName} (${o.packageName}) · Ref ${reference}`,
    text: [
      `Hi ${o.name},`,
      ``,
      `Thanks for choosing Alliance Tech. We've received your request and our team will contact you within 2 business hours to confirm the details and next steps.`,
      ``,
      `WHAT YOU SELECTED`,
      `  Service:   ${o.serviceName}`,
      `  Package:   ${o.packageName}`,
      `  Price:     ${o.price}${o.period ? ` ${o.period}` : ""}`,
      `  Reference: ${reference}`,
      o.clinicName ? `  Clinic:    ${o.clinicName}` : null,
      o.notes ? `  Your note: ${o.notes}` : null,
      ``,
      `WHAT HAPPENS NEXT`,
      `  1. We call you to understand your clinic and confirm scope.`,
      `  2. You get a written plan and timeline — no surprises.`,
      `  3. We start once you approve. Nothing is charged before that.`,
      ``,
      `Questions before we call? Just reply to this email or message us on WhatsApp.`,
      ``,
      `— Alliance Tech`,
      `Sales@alliancetechltd.com`,
    ].filter(Boolean).join("\n"),
  });
}

exports.packageOrder = onRequest(
  {
    region: "asia-south1",
    cors: true,
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
    if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "order"))) {
      res.status(429).json({ error: "Too many requests today. Please email Sales@alliancetechltd.com." });
      return;
    }

    const o = {
      name: str(req.body?.name, 80),
      email: str(req.body?.email, 120),
      phone: str(req.body?.phone, 30),
      clinicName: str(req.body?.clinicName, 80),
      serviceId: str(req.body?.serviceId, 60),
      serviceName: str(req.body?.serviceName, 80),
      packageName: str(req.body?.packageName, 40),
      price: str(req.body?.price, 40),
      period: str(req.body?.period, 40),
      notes: str(req.body?.notes, 500),
    };

    if (!o.name || !o.email || !o.phone || !o.serviceName || !o.packageName) {
      res.status(400).json({ error: "Missing required details." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    try {
      const db = admin.firestore();
      const doc = await db.collection("orders").add({
        ...o,
        source: "pricing_package",
        status: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const reference = doc.id.slice(0, 6).toUpperCase();

      // Lead record → fires the existing owner email alert.
      await db.collection("leads").add({
        name: o.name,
        phone: o.phone,
        email: o.email,
        clinicName: o.clinicName,
        source: "package_order",
        message: `PACKAGE ORDER — ${o.serviceName} · ${o.packageName} · ${o.price}${o.period ? ` ${o.period}` : ""}${o.notes ? ` — "${o.notes}"` : ""} (Ref ${reference})`,
        status: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }).catch((e) => console.warn("lead create failed:", e.message));

      // Customer confirmation (best-effort — never block the response).
      emailCustomer(o, reference, (GMAIL_USER.value() || "").trim(), (GMAIL_APP_PASSWORD.value() || "").replace(/[\s ]+/g, ""))
        .catch((e) => console.warn("customer email failed:", e.message));

      res.status(200).json({ ok: true, reference });
    } catch (err) {
      console.error("packageOrder failed:", err);
      res.status(500).json({ error: "Couldn't submit your request. Please try again." });
    }
  }
);
