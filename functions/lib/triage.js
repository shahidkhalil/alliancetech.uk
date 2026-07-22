/**
 * Emergency triage helpers for the AI receptionist.
 * Detects urgent dental symptoms, proposes an earliest emergency slot,
 * and persists a high-priority staff alert lead.
 */

const admin = require("firebase-admin");

const EMERGENCY_PATTERNS = [
  { re: /\b(bleed(?:ing)?|blood)\b/i, label: "bleeding" },
  { re: /\b(severe|extreme|unbearable)\s+(pain|toothache)\b/i, label: "severe pain" },
  { re: /\b(tooth|teeth)\s+(is\s+)?(killing|throbbing)\b/i, label: "severe pain" },
  { re: /\b(implant)\s+(fell|came)\s+out\b/i, label: "implant displaced" },
  { re: /\b(knocked\s+out|avulsed|tooth\s+came\s+out)\b/i, label: "tooth knocked out" },
  { re: /\b(broken|cracked)\s+tooth\b/i, label: "broken tooth" },
  { re: /\b(swollen|swelling|abscess)\b/i, label: "swelling / abscess" },
  { re: /\b(can't\s+breathe|difficulty\s+breathing|face\s+swollen)\b/i, label: "airway / facial swelling" },
  { re: /\b(dental\s+)?emergency\b/i, label: "stated emergency" },
  { re: /\b(jaw\s+locked|can't\s+open\s+(my\s+)?mouth)\b/i, label: "locked jaw" },
];

function detectEmergency(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  for (const { re, label } of EMERGENCY_PATTERNS) {
    if (re.test(t)) {
      return { matched: label, excerpt: t.slice(0, 200) };
    }
  }
  return null;
}

/** Next same-day emergency slot in clinic hours (demo / Houston-friendly). */
function nextEmergencySlot(now = new Date()) {
  // Approximate America/Chicago offset for demo without tz libs (−5 or −6). Use local clock + label.
  const hour = now.getHours();
  const slots = [11, 13, 15, 17]; // 11 AM, 1 PM, 3 PM, 5 PM
  const next = slots.find((h) => h > hour + 0); // next upcoming today
  if (next != null) {
    const label = next === 11 ? "11:00 AM" : next === 13 ? "1:00 PM" : next === 15 ? "3:00 PM" : "5:00 PM";
    return `Today at ${label} (emergency slot)`;
  }
  return "Tomorrow at 10:30 AM (first emergency slot)";
}

async function persistUrgentAlert({
  clinic,
  clinicId,
  reason,
  excerpt,
  emergencySlot,
  name,
  phone,
  source,
}) {
  const db = admin.firestore();
  const payload = {
    name: (name || "Urgent caller").slice(0, 120),
    phone: (phone || "").slice(0, 40),
    email: "",
    source: source || "ai_receptionist_emergency",
    clinicName: clinic?.name || "",
    clinicId: clinicId || "demo",
    message: `🚨 EMERGENCY TRIAGE: ${reason}. Patient said: "${(excerpt || "").slice(0, 180)}". Offered slot: ${emergencySlot}.`,
    priority: "urgent",
    urgent: true,
    triageReason: reason,
    emergencySlot,
    status: "new",
    completionStatus: "complete",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection("leads").add(payload);
  return { id: ref.id, ...payload };
}

function buildTriagePayload(detection, clinic) {
  const emergencySlot = nextEmergencySlot();
  return {
    urgent: true,
    reason: detection.matched,
    excerpt: detection.excerpt,
    emergencySlot,
    staffAlerted: true,
    transferAvailable: true,
    clinicPhone: clinic?.phone || "",
    guidance:
      "Stay calm. We'll hold an emergency slot and alert the front desk. If this is life-threatening, call 911.",
  };
}

module.exports = {
  detectEmergency,
  nextEmergencySlot,
  persistUrgentAlert,
  buildTriagePayload,
};
