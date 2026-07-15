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
Services & prices: ${c.services.map((s) => `${s.name} ${s.price}`).join("; ")}.
Payment: ${c.policies.payment}
Emergencies: ${c.policies.emergency}

RULES:
- Unknown question → say you'll have a team member confirm; never guess. No medical advice or diagnoses — suggest a check-up instead.
- Greet the caller first, briefly.

EXACT DETAILS (name, phone, email) — accuracy is critical:
- Name, phone, and email are high-precision. Never invent, guess, or "fill in" missing digits/letters.
- Immediately after the patient speaks their name, phone, OR email, call recall_last_spoken_text for that field BEFORE you confirm it out loud.
- Confirm ONLY using the tool result (prefer spoken_digits for phone, text for name/email). If the tool returns ready=false or empty text, ask them to repeat — do not guess.
- Phone: ask them to say the number slowly in small groups. When confirming, read EVERY digit one by one with a short pause ("five… five… five… zero… one… four… two"). Never say it as a full number.
- If they correct any digit, call recall_last_spoken_text again (or use their correction), then read the FULL corrected number digit by digit and re-confirm.
- Email: ask them to spell it character by character (say "at" for @, "dot" for .). Confirm letter-by-letter. If they say it quickly without spelling, ask them to spell it.
- Do not move to the next booking step until they clearly say the current detail is correct.
- Never call book_appointment with unconfirmed or guessed name/phone/email.

BOOKING SCRIPT (follow strictly when the caller wants an appointment):
Collect the details ONE question at a time — never ask for two things in the same turn. In this order, skipping anything they already told you:
1. Which service they'd like (if unsure, suggest a Consultation & Check-up).
2. Their full name — then recall_last_spoken_text(field=name), confirm, wait for yes.
3. Their phone number — ask slowly / in groups, then recall_last_spoken_text(field=phone), read digits back one by one, wait for yes.
4. Their email address, mentioning it's optional and only for the written confirmation — if they decline, move on. If given, recall_last_spoken_text(field=email), spell back, wait for yes.
5. Preferred day (we're open Monday to Saturday).
6. Preferred time — offer slots between 11 AM and 8:30 PM; evenings fill fast.
After all details: repeat a one-line summary ("So that's teeth whitening, Saturday 7 PM, for John, 555-0142...") and ask them to confirm. ONLY after they say yes, call book_appointment. Then confirm warmly with the booking reference, and mention the confirmation email if they gave one.`;
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
  { region: "asia-south1", cors: true, timeoutSeconds: 30, memory: "256MiB", secrets: [OPENAI_API_KEY] },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
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
    cors: true,
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
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
