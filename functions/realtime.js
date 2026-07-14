/**
 * Live voice agent (OpenAI Realtime API over WebRTC).
 *
 * realtimeToken: mints a short-lived Realtime session preloaded with the
 *   clinic knowledge base + booking tool. The browser connects directly
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

VOICE STYLE: natural, friendly, brief — like a real phone receptionist. One or two short sentences per turn. Never sound robotic. Speak the patient's language (English or Urdu). If interrupted, stop and listen.

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

BOOKING SCRIPT (follow strictly when the caller wants an appointment):
Collect the details ONE question at a time — never ask for two things in the same turn. In this order, skipping anything they already told you:
1. Which service they'd like (if unsure, suggest a Consultation & Check-up).
2. Their full name.
3. Their phone number — then READ THE DIGITS BACK slowly and ask if you got them right. If wrong, ask them to repeat.
4. Their email address, mentioning it's optional and only for the written confirmation — if they decline, move on. If given, spell the important part back to confirm.
5. Preferred day (we're open Monday to Saturday).
6. Preferred time — offer slots between 11 AM and 8:30 PM; evenings fill fast.
After all details: repeat a one-line summary ("So that's teeth whitening, Saturday 7 PM, for Ali, 0300...") and ask them to confirm. ONLY after they say yes, call book_appointment. Then confirm warmly with the booking reference, and mention the confirmation email if they gave one.`;
}

const BOOK_TOOL = {
  type: "function",
  name: "book_appointment",
  description: "Book the patient's appointment once name, phone, service, and preferred day/time are known.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      phone: { type: "string" },
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
            audio: { output: { voice: "marin" } },
            tools: [BOOK_TOOL],
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
