/**
 * Shared booking pipeline: persist the appointment, create a lead
 * (which fires the owner's email alert), and email the patient a
 * confirmation. Used by both the chat receptionist and the live
 * realtime voice agent.
 */

const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

async function sendConfirmationEmail(args, clinic, reference, gmailUser, gmailPass) {
  const user = (gmailUser || "").trim();
  const pass = (gmailPass || "").replace(/[\s ]+/g, "");
  if (!user || !pass || !args.email) return;

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"${clinic.name}" <${user}>`,
    to: args.email,
    subject: `✅ Appointment Confirmed — ${clinic.name} (Ref ${reference})`,
    text: [
      `Dear ${args.name},`,
      ``,
      `Your appointment has been booked. Here are the details:`,
      ``,
      `  Service:   ${args.service}`,
      `  When:      ${args.preferredTime}`,
      `  Reference: ${reference}`,
      ``,
      `Clinic: ${clinic.name}`,
      `Address: ${clinic.address}`,
      `Hours: ${clinic.hours.weekdays} (Sunday: ${clinic.hours.sunday})`,
      `Phone/WhatsApp: ${clinic.phone}`,
      ``,
      `${clinic.policies.firstVisit}`,
      `${clinic.policies.cancellation}`,
      ``,
      `We look forward to seeing you!`,
      `— ${clinic.name}`,
    ].join("\n"),
  });
}

/**
 * Book + notify. Returns { id, reference }.
 * `source` distinguishes chat vs live voice bookings.
 */
async function bookAndNotify({ args, clinicId, clinic, source, gmailUser, gmailPass }) {
  const db = admin.firestore();

  const doc = await db.collection("appointments").add({
    ...args,
    clinicId: clinicId || "demo",
    clinicName: clinic.name,
    source: source || "ai_receptionist",
    status: "new",
    priority: args.urgent || args.priority === "urgent" ? "urgent" : "normal",
    urgent: Boolean(args.urgent),
    triageReason: args.triageReason || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const reference = doc.id.slice(0, 6).toUpperCase();

  await db.collection("leads").add({
    name: args.name,
    phone: args.phone,
    email: args.email || "",
    source: source || "ai_receptionist",
    clinicName: clinic.name,
    message: `${args.urgent ? "🚨 URGENT — " : ""}Appointment: ${args.service} — ${args.preferredTime}${args.notes ? ` (${args.notes})` : ""}`,
    priority: args.urgent ? "urgent" : "normal",
    urgent: Boolean(args.urgent),
    triageReason: args.triageReason || "",
    status: "new",
    completionStatus: "complete",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }).catch(() => {});

  sendConfirmationEmail(args, clinic, reference, gmailUser, gmailPass).catch((e) =>
    console.warn("Confirmation email failed:", e.message)
  );

  return { id: doc.id, reference };
}

module.exports = { bookAndNotify };
