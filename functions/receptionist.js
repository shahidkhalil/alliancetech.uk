/**
 * AI Receptionist for clinics — conversational front desk.
 * Answers patient questions from the clinic knowledge base (RAG) and books
 * appointments via OpenAI tool-calling. Behaves like a warm human receptionist.
 *
 * POST { messages: [{role, content}], clinicId? }
 *  -> { reply, booking? }
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const { getClinic } = require("./lib/clinicKB");
const { bookAndNotify } = require("./lib/booking");
const { checkRateLimit } = require("./lib/cache");
const { applyCors, clientIp } = require("./lib/security");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const DAILY_LIMIT_PER_IP = 60; // generous for a conversation

function systemPrompt(c) {
  return `You are the friendly front-desk receptionist for "${c.name}" — ${c.tagline} in ${c.city}. You chat with patients on the clinic's website.

PERSONALITY: Your name is Maya. You are warm, human, and concise — like a real, caring receptionist, never a robot. Use the patient's name once you know it. Reply in the same language the patient uses (English). Keep replies short (1–3 sentences) unless listing services. A light emoji here and there is fine (😊, 🦷) — one per message at most.

WHAT YOU KNOW (only use these facts — never invent prices, doctors, or policies):
Address: ${c.address}
Phone/WhatsApp: ${c.phone}
Hours: ${c.hours.weekdays}; Sunday: ${c.hours.sunday}. ${c.hours.note}
Doctors: ${c.doctors.map((d) => `${d.name} — ${d.role} (${d.experience})`).join("; ")}
Services & prices:
${c.services.map((s) => `- ${s.name}: ${s.price}${s.note ? ` (${s.note})` : ""}`).join("\n")}
Payment: ${c.policies.payment}
First visit: ${c.policies.firstVisit}
Cancellation: ${c.policies.cancellation}
Emergencies: ${c.policies.emergency}
FAQs:
${c.faqs.map((f) => `Q: ${f.q} A: ${f.a}`).join("\n")}

RULES:
- Answer questions using only the facts above. If asked something you don't know (e.g. a price not listed, medical diagnosis), say you'll have a team member confirm and offer to note their number — never guess.
- Never give specific medical/clinical advice or diagnoses. Encourage booking a check-up instead.
- Guide interested patients toward booking an appointment. To book, you MUST collect: patient name, phone number, the service they want, and a preferred day/time. Also ask for their email so we can send a written confirmation (if they'd rather not share it, book without it). Once you have the required details, call the book_appointment tool. Confirm warmly after booking — and if an email was provided, mention the confirmation email is on its way.
- If a patient is unsure which treatment they need, suggest starting with a Consultation & Check-up.`;
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Book a patient appointment once name, phone, service, and preferred day/time are all known.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", description: "Patient email for the confirmation email, if provided." },
          service: { type: "string" },
          preferredTime: { type: "string", description: "Preferred day and time in the patient's words, e.g. 'Saturday evening around 7pm'." },
          notes: { type: "string", description: "Any extra context (symptoms, preferences)." },
        },
        required: ["name", "phone", "service", "preferredTime"],
      },
    },
  },
];

exports.clinicReceptionist = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 60,
    memory: "512MiB",
    minInstances: 1, // stay warm — no cold-start lag on the first message
    secrets: [OPENAI_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "chat"))) {
      res.status(429).json({ error: "Too many messages today. Please WhatsApp us to continue." });
      return;
    }

    const clinic = getClinic(req.body?.clinicId);
    const history = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const messages = [
      { role: "system", content: systemPrompt(clinic) },
      ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content || "").slice(0, 1000) })),
    ];

    try {
      const key = OPENAI_API_KEY.value();

      // Voice note attached: transcribe here (one round trip instead of two).
      let transcript = null;
      if (typeof req.body?.audio === "string" && req.body.audio.length > 100) {
        const buf = Buffer.from(req.body.audio, "base64");
        if (buf.length > 1000 && buf.length < 6 * 1024 * 1024) {
          const mime = typeof req.body?.mime === "string" ? req.body.mime : "audio/webm";
          const ext = mime.includes("mp4") || mime.includes("m4a") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
          const form = new FormData();
          form.append("file", new Blob([buf], { type: mime }), `note.${ext}`);
          form.append("model", "gpt-4o-mini-transcribe");
          const tr = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}` },
            body: form,
            signal: AbortSignal.timeout(30000),
          });
          if (tr.ok) {
            transcript = ((await tr.json()).text || "").trim();
          }
        }
        if (!transcript) {
          res.status(422).json({ error: "Couldn't hear the voice note — please try again or type." });
          return;
        }
        messages.push({ role: "user", content: transcript.slice(0, 1000) });
      }
      const call = (body) =>
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(45000),
        }).then(async (r) => {
          if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
          return r.json();
        });

      let data = await call({ model: "gpt-4o-mini", temperature: 0.6, max_tokens: 400, messages, tools: TOOLS });
      let msg = data.choices[0].message;
      let booking = null;

      // If the model chose to book, persist it and let the model confirm.
      const toolCall = msg.tool_calls?.[0];
      if (toolCall?.function?.name === "book_appointment") {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const { id, reference } = await bookAndNotify({
          args,
          clinicId: req.body?.clinicId || "demo",
          clinic,
          source: "ai_receptionist",
          gmailUser: GMAIL_USER.value(),
          gmailPass: GMAIL_APP_PASSWORD.value(),
        });
        booking = { id, ...args, clinicName: clinic.name };

        // Feed the tool result back so the model writes a natural confirmation.
        messages.push(msg);
        messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ booked: true, reference, confirmationEmailSentTo: args.email || null }) });
        data = await call({ model: "gpt-4o-mini", temperature: 0.6, max_tokens: 300, messages });
        msg = data.choices[0].message;
      }

      const replyText = msg.content || "Sorry, could you say that again?";

      // Voice reply (when the patient spoke to us): OpenAI TTS -> base64 mp3.
      let audio = null;
      if (req.body?.speak === true && replyText) {
        try {
          const ttsBody = (model) => ({
            model,
            voice: "nova",
            input: replyText.slice(0, 600),
            response_format: "mp3",
          });
          let tts = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify(ttsBody("gpt-4o-mini-tts")),
            signal: AbortSignal.timeout(30000),
          });
          if (!tts.ok) {
            tts = await fetch("https://api.openai.com/v1/audio/speech", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
              body: JSON.stringify(ttsBody("tts-1")),
              signal: AbortSignal.timeout(30000),
            });
          }
          if (tts.ok) {
            audio = Buffer.from(await tts.arrayBuffer()).toString("base64");
          }
        } catch (e) {
          console.warn("TTS failed (reply sent as text only):", e.message);
        }
      }

      res.status(200).json({ reply: replyText, booking, audio, transcript });
    } catch (err) {
      console.error("Receptionist error:", err);
      res.status(500).json({ error: "I'm having a moment — please try again or WhatsApp us." });
    }
  }
);
