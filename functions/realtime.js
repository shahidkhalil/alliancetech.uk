/**
 * Live voice agent (OpenAI Realtime API over WebRTC).
 *
 * realtimeToken: mints a short-lived Realtime session preloaded with the
 *   clinic knowledge base, input transcription (for accurate name/phone/email),
 *   recall_last_spoken_text + booking tools. The browser connects directly
 *   to OpenAI via WebRTC using the ephemeral key — instant speech-to-speech.
 *
 * bookAppointmentHttp: booking endpoint the browser calls when the live
 *   agent decides to book (function calling over the data channel).
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const { getClinic } = require("./lib/clinicKB");
const { checkRateLimit } = require("./lib/cache");
const { bookAndNotify } = require("./lib/booking");
const { applyCors, clientIp } = require("./lib/security");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const CALLS_PER_IP_PER_DAY = 12; // live calls are billed per minute — keep public demos sane
const REALTIME_MODEL = "gpt-realtime-mini";

function liveInstructions(c) {
  return `You are Maya, the warm, human front-desk receptionist for "${c.name}" in ${c.city}, speaking with a patient on a live voice call from the clinic's website.

VOICE STYLE: natural, friendly, brief — like a real phone receptionist. One or two short sentences per turn. Never sound robotic. If interrupted, stop and listen.

FACTS YOU KNOW (never invent anything beyond this):
Address: ${c.address}. Phone/WhatsApp: ${c.phone}.
Hours: ${c.hours.weekdays}; Sunday ${c.hours.sunday}. ${c.hours.note}
Doctors: ${c.doctors.map((d) => `${d.name} (${d.role})`).join("; ")}.
Services (describe what each involves — do NOT mention prices unless patient explicitly asks about cost):
${c.services.map((s) => `${s.name}${s.description ? `: ${s.description}` : ""}`).join("; ")}.
Payment: ${c.policies.payment}
Emergencies: ${c.policies.emergency}

RULES:
- Unknown question → say you'll have a team member confirm; never guess. No medical advice.
- Do NOT quote prices unless the patient explicitly asks about cost — then say the team will confirm exact pricing.
- Greet the caller first, briefly.

EXACT DETAILS (name, phone, email) — accuracy matters, but don't annoy the caller:
- Name, phone, and email are high-precision. Never invent or guess missing digits/letters.
- After the patient speaks name, phone, OR email, call recall_last_spoken_text for that field once, then confirm briefly in natural speech (e.g. "Got it — John Smith?" or "Your number is 555-0142 — right?").
- If they say yes or correct, move on immediately — NEVER ask to confirm the same field again.
- Phone: if unclear, ask them to say it slowly in groups. Read it back once naturally; only repeat if they say it's wrong.
- Email: optional — if given, confirm once. If they decline email, skip it.
- The caller also sees editable text fields on screen that fill from their speech — mention they can review and fix details there.
- Do not loop on confirmations. One check per field maximum, then one final summary before booking.

BOOKING SCRIPT (when the caller wants an appointment):
Collect ONE question at a time. Skip anything they already gave. Order:
1. Which service (if unsure, suggest Consultation & Check-up and explain it briefly).
2. Full name — recall_last_spoken_text(name), confirm once, move on.
3. Phone — recall_last_spoken_text(phone), confirm once, move on.
4. Email (optional) — recall if given, confirm once, or skip.
5. Preferred day (Mon–Sat).
6. Preferred time (11 AM–8:30 PM; evenings fill fast).
Then ONE summary line and ask "Shall I book that?" — only after yes, call book_appointment. Do not ask again after they confirm.`;
}

const RECALL_TOOL = {
  type: "function",
  name: "recall_last_spoken_text",
  description:
    "REQUIRED right after the patient speaks their name, phone number, or email. Returns the accurate speech-to-text of what they just said so you can confirm the exact value. Always call this before reading those details back.",
  parameters: {
    type: "object",
    properties: {
      field: {
        type: "string",
        enum: ["name", "phone", "email", "other"],
        description: "Which detail you are confirming.",
      },
    },
    required: ["field"],
  },
};

const BOOK_TOOL = {
  type: "function",
  name: "book_appointment",
  description:
    "Book the patient's appointment only after name, phone, service, and preferred day/time are collected AND the patient has confirmed name and phone (and email if provided). Use the exact confirmed values — never guessed digits.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      phone: { type: "string", description: "Confirmed phone number digits as the patient approved." },
      email: { type: "string" },
      service: { type: "string" },
      preferredTime: { type: "string" },
      notes: { type: "string" },
    },
    required: ["name", "phone", "service", "preferredTime"],
  },
};

exports.realtimeToken = onRequest(
  { region: "asia-south1", cors: false, timeoutSeconds: 30, memory: "256MiB", minInstances: 1, secrets: [OPENAI_API_KEY] },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, CALLS_PER_IP_PER_DAY, "call"))) {
      res.status(429).json({ error: "Daily live-call limit reached — please use the chat instead." });
      return;
    }

    try {
      const clinic = getClinic(req.body?.clinicId);
      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
        },
        body: JSON.stringify({
          expires_after: { anchor: "created_at", seconds: 300 },
          session: {
            type: "realtime",
            model: REALTIME_MODEL,
            instructions: liveInstructions(clinic),
            audio: {
              input: {
                // Separate STT layer — much more accurate on names / phone digits / emails
                // than the speech-to-speech model alone.
                transcription: {
                  model: "gpt-4o-transcribe",
                  language: "en",
                  prompt:
                    "Expect patient full names, US phone numbers spoken digit-by-digit or in groups, and email addresses spelled with at/dot.",
                },
                noise_reduction: { type: "near_field" },
              },
              output: { voice: "marin" },
            },
            tools: [RECALL_TOOL, BOOK_TOOL],
            tool_choice: "auto",
          },
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`Realtime session ${r.status}: ${(await r.text()).slice(0, 300)}`);
      const session = await r.json();

      res.status(200).json({
        clientSecret: session.value,
        model: REALTIME_MODEL,
        maxSeconds: 180, // client enforces the 3-minute demo cap
      });
    } catch (err) {
      console.error("realtimeToken failed:", err);
      res.status(500).json({ error: "Couldn't start the live call — please try the chat." });
    }
  }
);

exports.bookAppointmentHttp = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, 15, "book"))) {
      res.status(429).json({ error: "Too many bookings today." });
      return;
    }

    try {
      const a = req.body || {};
      if (!a.name || !a.phone || !a.service || !a.preferredTime) {
        res.status(400).json({ error: "Missing booking details." });
        return;
      }
      const clinic = getClinic(a.clinicId);
      const { id, reference } = await bookAndNotify({
        args: {
          name: String(a.name).slice(0, 80),
          phone: String(a.phone).slice(0, 30),
          email: a.email ? String(a.email).slice(0, 120) : "",
          service: String(a.service).slice(0, 80),
          preferredTime: String(a.preferredTime).slice(0, 120),
          notes: a.notes ? String(a.notes).slice(0, 300) : "",
        },
        clinicId: a.clinicId || "demo",
        clinic,
        source: "ai_receptionist_live",
        gmailUser: GMAIL_USER.value(),
        gmailPass: GMAIL_APP_PASSWORD.value(),
      });
      res.status(200).json({ booked: true, id, reference });
    } catch (err) {
      console.error("bookAppointmentHttp failed:", err);
      res.status(500).json({ error: "Booking failed." });
    }
  }
);
