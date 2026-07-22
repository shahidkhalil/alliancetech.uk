/** Client-side emergency keyword detection for the receptionist demo UI. */

const EMERGENCY_PATTERNS: { re: RegExp; label: string }[] = [
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

export type TriageInfo = {
  urgent: true;
  reason: string;
  excerpt?: string;
  emergencySlot: string;
  staffAlerted: boolean;
  transferAvailable?: boolean;
  clinicPhone?: string;
  guidance?: string;
};

export function detectEmergencyClient(text: string): { matched: string; excerpt: string } | null {
  const t = String(text || "").trim();
  if (!t) return null;
  for (const { re, label } of EMERGENCY_PATTERNS) {
    if (re.test(t)) return { matched: label, excerpt: t.slice(0, 200) };
  }
  return null;
}

export function nextEmergencySlotClient(now = new Date()): string {
  const hour = now.getHours();
  const slots = [
    { h: 11, label: "11:00 AM" },
    { h: 13, label: "1:00 PM" },
    { h: 15, label: "3:00 PM" },
    { h: 17, label: "5:00 PM" },
  ];
  const next = slots.find((s) => s.h > hour);
  if (next) return `Today at ${next.label} (emergency slot)`;
  return "Tomorrow at 10:30 AM (first emergency slot)";
}

export function buildClientTriage(text: string, clinicPhone = "+1 (713) 555-0142"): TriageInfo | null {
  const hit = detectEmergencyClient(text);
  if (!hit) return null;
  return {
    urgent: true,
    reason: hit.matched,
    excerpt: hit.excerpt,
    emergencySlot: nextEmergencySlotClient(),
    staffAlerted: true,
    transferAvailable: true,
    clinicPhone,
    guidance:
      "Stay calm. We'll hold an emergency slot and alert the front desk. If this is life-threatening, call 911.",
  };
}
