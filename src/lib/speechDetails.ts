/**
 * Speech → structured contact details for Maya live call.
 * Converts spoken digits/emails and picks the best transcript for each field.
 */

const WORD_TO_DIGIT: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  nought: "0",
  one: "1",
  won: "1",
  two: "2",
  to: "2",
  too: "2",
  three: "3",
  free: "3",
  four: "4",
  for: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  nine: "9",
};

/** Extract digits from mixed numeric + spoken-digit speech. */
export function speechToDigits(text: string): string {
  let s = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  // "double five" / "triple zero"
  s = s.replace(/\b(double|triple)\s+([a-z0-9]+)\b/g, (_, mult: string, tok: string) => {
    const d = WORD_TO_DIGIT[tok] ?? (/^\d$/.test(tok) ? tok : "");
    if (!d) return `${mult} ${tok}`;
    return mult === "triple" ? d + d + d : d + d;
  });

  const tokens = s.split(/\s+/).filter(Boolean);
  let out = "";
  for (const t of tokens) {
    if (/^\d+$/.test(t)) {
      out += t;
      continue;
    }
    if (WORD_TO_DIGIT[t] !== undefined) {
      out += WORD_TO_DIGIT[t];
      continue;
    }
    // "ohseven…" rare glued words — skip
  }
  // Also pull any remaining arabic digits from original
  if (out.length < 7) {
    const raw = (text.match(/\d/g) || []).join("");
    if (raw.length > out.length) out = raw;
  }
  return out;
}

export function normalizeEmailFromSpeech(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+at\s+/gi, "@")
    .replace(/\s+atsign\s+/gi, "@")
    .replace(/\s+@\s+/g, "@")
    .replace(/\s+dot\s+/gi, ".")
    .replace(/\s+period\s+/gi, ".")
    .replace(/\s+underscore\s+/gi, "_")
    .replace(/\s+under\s*score\s+/gi, "_")
    .replace(/\s+dash\s+/gi, "-")
    .replace(/\s+hyphen\s+/gi, "-")
    .replace(/\s+minus\s+/gi, "-")
    .replace(/\s+/g, "")
    .replace(/,@/g, "@")
    .replace(/@,/g, "@");
}

export function spellEmail(email: string): string {
  const normalized = normalizeEmailFromSpeech(email);
  if (!normalized.includes("@")) return normalized;
  const [local, domain] = normalized.split("@");
  const spellPart = (s: string) =>
    s
      .split("")
      .filter(Boolean)
      .map((c) => {
        if (c === ".") return "dot";
        if (c === "_" || c === "-") return c === "_" ? "underscore" : "dash";
        return c;
      })
      .join("-");
  return `${spellPart(local)} at ${spellPart(domain)}`;
}

/** Format for display — prefers UK (+44 / 07…) then US 10-digit. */
export function formatPhoneDigits(digits: string): string {
  let d = digits.replace(/\D/g, "");
  if (d.startsWith("44") && d.length >= 12) {
    d = d.slice(0, 12);
    return `+44 ${d.slice(2, 6)} ${d.slice(6)}`;
  }
  if (d.startsWith("0") && d.length === 11) {
    return `${d.slice(0, 5)} ${d.slice(5)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.length === 11 && d.startsWith("1")) {
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  return digits.trim();
}

export function groupedSpokenDigits(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  // UK mobile 07xxx… → groups of 5+6 or 4+3+4
  if (d.startsWith("0") && d.length === 11) {
    return `${d.slice(0, 5).split("").join(" ")} , ${d.slice(5).split("").join(" ")}`;
  }
  if (d.startsWith("44") && d.length >= 12) {
    const n = d.slice(2);
    return `four four , ${n.slice(0, 4).split("").join(" ")} , ${n.slice(4).split("").join(" ")}`;
  }
  if (d.length <= 3) return d.split("").join(" ");
  if (d.length <= 6) return `${d.slice(0, 3).split("").join(" ")} , ${d.slice(3).split("").join(" ")}`;
  return `${d.slice(0, 3).split("").join(" ")} , ${d.slice(3, 6).split("").join(" ")} , ${d.slice(6).split("").join(" ")}`;
}

export function titleCaseName(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => {
      if (!w) return w;
      if (w.length <= 2 && /^(mc|o')$/i.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bMc([a-z])/g, (_, c: string) => `Mc${c.toUpperCase()}`)
    .replace(/\bO'([a-z])/gi, (_, c: string) => `O'${c.toUpperCase()}`);
}

const FILLER =
  /^(yes|yeah|yep|yup|no|nope|correct|right|wrong|skip|okay|ok|sure|thanks|thank you|hello|hi|hey|please|sorry)\b/i;

/** Words that are treatments / booking talk — never write these into the name field. */
const NOT_A_NAME =
  /\b(consultation|check-?up|checkup|scaling|polishing|filling|implant|implants|braces|aligners|whitening|veneers?|root\s*canal|wisdom|extraction|appointment|booking|book|schedule|friday|saturday|monday|tuesday|wednesday|thursday|sunday|today|tomorrow|morning|afternoon|evening|o'?clock|am|pm|phone|email|mobile|number|services?|treatments?|dentist|dental|clinic|patient|doctor|list|show|tell|what|which|your|our|all)\b/i;

/** Individual tokens that can never appear inside a person name. */
const NAME_STOPWORD =
  /^(list|all|your|our|the|a|an|my|me|i|we|you|what|which|how|when|where|who|tell|show|give|want|need|book|please|services?|treatments?|consultation|appointment|bleeding|emergency)$/i;

const NAME_INTRO =
  /(?:my name is|i am|i'm|this is|call me|name is|naam hai|mera naam)\s+([A-Za-z][A-Za-z\s'.-]{1,40})/i;

export function extractSpokenName(text: string): string {
  const intro = text.match(NAME_INTRO);
  if (intro?.[1]) {
    const candidate = intro[1]
      .replace(/[.,!?].*$/, "")
      .replace(/\b(and|for|to book|please).*$/i, "")
      .trim();
    if (isNameLike(candidate)) return titleCaseName(candidate);
  }
  return "";
}

export function isNameLike(text: string): boolean {
  const cleaned = text
    .trim()
    .replace(/[.,!?]+$/g, "")
    .replace(/^["']|["']$/g, "");
  if (!cleaned) return false;
  if (/\?/.test(text)) return false;
  if (/^(list|tell|show|what|how|when|where|who|can|do|is|are)\b/i.test(cleaned)) return false;

  const digits = speechToDigits(cleaned);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (digits.length >= 4) return false;
  if (words.length < 1 || words.length > 4) return false;
  if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(cleaned)) return false;
  if (FILLER.test(cleaned)) return false;
  if (/@|\bat\b|\bdot\b/i.test(cleaned)) return false;
  if (NOT_A_NAME.test(cleaned)) return false;
  if (words.some((w) => NAME_STOPWORD.test(w))) return false;
  if (words.length >= 3 && /^(list|tell|show|book)\b/i.test(cleaned)) return false;
  if (words.length === 1 && cleaned.length < 2) return false;
  return true;
}

export function isPhoneReady(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  // UK 11 (07…), UK +44 12, US/CA 10, US +1 11
  if (d.length === 10) return true;
  if (d.length === 11 && (d.startsWith("0") || d.startsWith("1"))) return true;
  if (d.length >= 12 && d.startsWith("44")) return true;
  return d.length >= 10;
}

export type RecallSnapshot = {
  text: string;
  digits: string;
  spoken_digits: string;
  spelled_email: string;
};

function scoreNameCandidate(text: string): number {
  const intro = extractSpokenName(text);
  if (intro) return 100 + intro.split(/\s+/).length * 5;
  if (!isNameLike(text)) return -1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words >= 2 ? 50 + words * 5 : 5;
}

/** Pick the best user transcript for the field from recent utterances. */
export function pickTranscript(field: string, recent: string[], sinceIndex = 0): RecallSnapshot {
  const list = recent.slice(sinceIndex).filter(Boolean);
  // For names, also scan a wider window — the real name is often said earlier than the last reply
  const namePool =
    field === "name"
      ? recent.slice(Math.max(0, recent.length - 12)).filter(Boolean)
      : list;
  const reversed = [...(field === "name" ? namePool : list)].reverse();
  let text = reversed[0] || "";

  if (field === "phone") {
    let best = "";
    let bestLen = 0;
    for (const t of reversed) {
      const d = speechToDigits(t);
      if (d.length > bestLen) {
        bestLen = d.length;
        best = t;
      }
    }
    if (best) text = best;
  } else if (field === "email") {
    const candidates = reversed.filter((t) => /@|\bat\b|\bdot\b/i.test(t));
    if (candidates.length) {
      text = candidates.reduce((a, b) =>
        normalizeEmailFromSpeech(a).length >= normalizeEmailFromSpeech(b).length ? a : b
      );
    }
  } else if (field === "name") {
    let bestText = "";
    let bestScore = -1;
    for (const t of reversed) {
      const intro = extractSpokenName(t);
      if (intro) {
        const score = scoreNameCandidate(`my name is ${intro}`);
        if (score > bestScore) {
          bestScore = score;
          bestText = intro;
        }
        continue;
      }
      const score = scoreNameCandidate(t);
      // Require a real person-name score (intro or first+last) — never bare service phrases
      if (score >= 50 && score > bestScore) {
        bestScore = score;
        bestText = titleCaseName(t.trim());
      }
    }
    text = bestText || "";
  }

  const trimmed = text.trim();
  const digits = speechToDigits(trimmed);
  const normalizedEmail = field === "email" ? normalizeEmailFromSpeech(trimmed) : trimmed;
  let nameText = "";
  if (field === "name") {
    nameText = extractSpokenName(trimmed) || (isNameLike(trimmed) ? titleCaseName(trimmed) : "");
  }

  return {
    text: field === "email" ? normalizedEmail : field === "name" ? nameText : trimmed,
    digits,
    spoken_digits: digits ? digits.split("").join(" ") : "",
    spelled_email: field === "email" ? spellEmail(trimmed) : "",
  };
}

export function isRecallReady(field: string, picked: RecallSnapshot): boolean {
  if (!picked.text && !picked.digits) return false;
  if (field === "phone") return isPhoneReady(picked.digits);
  if (field === "email") {
    const e = picked.text;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || (/@|\bat\b/i.test(e) && e.length > 6);
  }
  if (field === "name") {
    return (
      picked.text.length >= 2 &&
      isNameLike(picked.text) &&
      !NOT_A_NAME.test(picked.text) &&
      // Prefer intro/first+last — reject weak single junk tokens unless clearly a name
      (picked.text.trim().split(/\s+/).length >= 2 || /^[A-Z][a-z]{1,20}$/.test(picked.text.trim()))
    );
  }
  return picked.text.length > 0;
}

/** Strong STT prompt — sent via session.update after the call connects. */
export const LIVE_STT_PROMPT =
  "Transcribe the caller exactly. Prefer: full personal names (first and last), " +
  "UK mobile numbers digit-by-digit (oh/zero for 0, double/triple repeats), " +
  "and email addresses with the words at and dot. Do not invent missing digits or letters. " +
  "Never treat service requests like 'list your services' as a person name.";

/** Extra live-call behaviour rules applied client-side after connect. */
export const LIVE_CALL_BEHAVIOR_RULES = `
CRITICAL FORM RULES:
- Full name means a PERSON name only (e.g. Hassan Ahmed). Never put services, treatments, or phrases like "list all your services" into the name.
- After the patient says their name, call recall_last_spoken_text(name) and only confirm if the recalled text is a person name.
- When day/time are agreed, call confirm_field(schedule) with preferredTime like "Monday at 9:00 PM".

EMERGENCIES & SERVICES — NEVER APOLOGISE:
- Do NOT say "sorry", "unfortunately", or "I can't help" for bleeding, pain, swelling, knocked-out tooth, or other dental emergencies.
- For emergencies: stay calm, triage immediately, offer an urgent slot, offer transfer to the clinic line, collect name + phone, and book.
- For service questions: answer helpfully from clinic facts. Never apologise for listing or explaining services.
- Life-threatening (can't breathe, heavy bleeding, unconscious): tell them to call 999 first, then still help book an emergency slot.
`.trim();
