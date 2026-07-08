/**
 * Lead alert: emails you the moment a new lead lands in Firestore.
 * Uses Gmail SMTP with an App Password (secrets: GMAIL_USER, GMAIL_APP_PASSWORD).
 * Alerts go to ALERT_TO if set, otherwise to GMAIL_USER itself.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

exports.leadAlert = onDocumentCreated(
  {
    document: "leads/{leadId}",
    region: "asia-south1",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const lead = event.data?.data();
    if (!lead) return;

    const user = GMAIL_USER.value();
    const pass = GMAIL_APP_PASSWORD.value();
    if (!user || !pass) {
      console.warn("Gmail secrets not configured — skipping lead alert");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const isAudit = lead.source === "audit_bot";
    const subject = isAudit
      ? `🔥 New audit lead: ${lead.name || "Unknown"} (${lead.website || "no site"}, score ${lead.auditScore ?? "?"})`
      : `📩 New lead: ${lead.name || "Unknown"} (${lead.source || "website"})`;

    const lines = [
      `Name: ${lead.name || "-"}`,
      `Phone/WhatsApp: ${lead.phone || "-"}`,
      lead.email ? `Email: ${lead.email}` : null,
      lead.website ? `Website: ${lead.website}` : null,
      lead.auditScore != null ? `Audit score: ${lead.auditScore}/100 — ${lead.auditVerdict || ""}` : null,
      lead.topIssue ? `Top issue: ${lead.topIssue}` : null,
      lead.clinicName ? `Clinic: ${lead.clinicName}` : null,
      lead.clinicType ? `Type: ${lead.clinicType}` : null,
      lead.message ? `Message: ${lead.message}` : null,
      `Source: ${lead.source || "-"}`,
      ``,
      lead.phone ? `Reply on WhatsApp: https://wa.me/${lead.phone.replace(/\D/g, "").replace(/^0/, "92")}` : null,
      `Firestore: https://console.firebase.google.com/project/alliancepak/firestore/data/~2Fleads~2F${event.params.leadId}`,
    ].filter(Boolean);

    await transporter.sendMail({
      from: `"Alliance Leads" <${user}>`,
      to: process.env.ALERT_TO || user,
      subject,
      text: lines.join("\n"),
    });

    console.log(`Lead alert sent for ${event.params.leadId}`);
  }
);
