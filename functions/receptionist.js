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
const { extractBookingDraft, hasBookingIntent, isServicesQuery } = require("./lib/bookingExtract");
const { checkRateLimit } = require("./lib/cache");
const { applyCors, clientIp } = require("./lib/security");
const {
  detectEmergency,
  buildTriagePayload,
  persistUrgentAlert,
} = require("./lib/triage");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const DAILY_LIMIT_PER_IP = 60; // generous for a conversation

function bookingFormContext(draft) {
  if (!draft || typeof draft !== "object") return "";
  const fields = [
    ["name", draft.name],
    ["phone", draft.phone],
    ["email", draft.email],
    ["service", draft.service],
    ["day", draft.day],
    ["time", draft.time],
  ];
  const lines = fields.map(([k, v]) => `- ${k}: ${String(v || "").trim() || "(empty)"}`);
  const anyFilled = fields.some(([, v]) => String(v || "").trim());
  if (!anyFilled) return "";
  return `\nPATIENT BOOKING FORM (visible on screen — NEVER re-ask or re-confirm filled fields):\n${lines.join("\n")}\nIf booking: only mention empty fields once, then tell them to complete the form. Do not loop or repeat questions.`;
}

function systemPrompt(c, draft) {
  return `You are the friendly front-desk receptionist for "${c.name}" — ${c.tagline} in ${c.city}. You chat with patients on the clinic's website.

PERSONALITY: Your name is Maya. Warm, human, concise — like a real receptionist. Use the patient's name once you know it. Reply in the same language the patient uses (English). Keep replies short (1–2 sentences). One emoji max per message (😊, 🦷).

WHAT YOU KNOW (only use these facts — never invent):
Address: ${c.address}
Phone/WhatsApp: ${c.phone}
Hours: ${c.hours.weekdays}; Sunday: ${c.hours.sunday}. ${c.hours.note}
Doctors: ${c.doctors.map((d) => `${d.name} — ${d.role} (${d.experience})`).join("; ")}
Services (describe what each involves — do NOT mention prices unless the patient explicitly asks about cost; then say the team will confirm exact pricing):
${c.services.map((s) => `- ${s.name}${s.description ? `: ${s.description}` : ""}`).join("\n")}
Payment: ${c.policies.payment}
First visit: ${c.policies.firstVisit}
Cancellation: ${c.policies.cancellation}
Emergencies: ${c.policies.emergency}
FAQs:
${c.faqs.map((f) => `Q: ${f.q} A: ${f.a}`).join("\n")}
${bookingFormContext(draft)}

EMERGENCY TRIAGE PROTOCOL (highest priority):
If the patient mentions bleeding, severe pain, a knocked-out tooth, implant falling out, facial swelling, abscess, or says "emergency":
1. Stay calm and acknowledge the urgency in one sentence.
2. Call flag_emergency with the reason (and name/phone if already known).
3. Offer the earliest emergency slot returned by the tool.
4. Tell them staff has been alerted and they can call ${c.phone} for immediate transfer.
5. If symptoms sound life-threatening (can't breathe, heavy uncontrolled bleeding, loss of consciousness), tell them to call 911 first.
6. Do NOT give medical diagnoses. Do NOT downplay pain.
7. After triage, offer to collect name + phone quickly via the booking form for the emergency slot.

RULES:
- Never give medical advice or diagnoses. Suggest a check-up instead (except during emergency triage — then follow the protocol above).
- When asked about services: give a brief friendly intro (1 sentence). The UI shows a service menu — do NOT list every service in text.
- When asked about a specific treatment: explain what it involves in 1–2 sentences. No prices unless they ask about cost.
- If asked about price/cost: say pricing depends on the case and the team will confirm at booking — do not quote dollar amounts.
- BOOKING: A form appears on screen ONLY when the patient is booking. They fill name, phone, service, day, time (email optional). Direct them to the form — do NOT collect details one-by-one in chat.
- NEVER ask the same question twice. NEVER say "is that correct?" more than once. If info is in the form or chat history, do not ask again.
- When the patient submits the completed form, call book_appointment immediately. One warm confirmation — done.
- If unsure which treatment: suggest Consultation & Check-up.`;
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "flag_emergency",
      description:
        "Call immediately when the patient describes a dental emergency (bleeding, severe pain, knocked-out tooth, implant fell out, swelling, etc.). Alerts staff and returns the earliest emergency slot.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Short reason, e.g. bleeding, severe pain, implant displaced." },
          name: { type: "string" },
          phone: { type: "string" },
          notes: { type: "string", description: "What the patient said." },
        },
        required: ["reason"],
      },
    },
  },
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
          urgent: { type: "boolean", description: "True if this is an emergency / triage booking." },
          triageReason: { type: "string" },
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
    const clientDraft = req.body?.bookingDraft || null;
    const history = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const messages = [
      { role: "system", content: systemPrompt(clinic, clientDraft) },
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

      let booking = null;
      let triage = null;

      // Detect emergency before the first model call so triage happens in the same turn
      const lastUserText =
        (transcript || history.filter((m) => m.role === "user").slice(-1)[0]?.content || "").toString();
      const emergencyHit = detectEmergency(lastUserText);
      if (emergencyHit) {
        triage = buildTriagePayload(emergencyHit, clinic);
        messages[0] = {
          role: "system",
          content:
            messages[0].content +
            `\n\nACTIVE EMERGENCY DETECTED (${emergencyHit.matched}). Follow EMERGENCY TRIAGE PROTOCOL now. Earliest slot: ${triage.emergencySlot}. Call flag_emergency immediately.`,
        };
      }

      let data = await call({ model: "gpt-4o-mini", temperature: 0.4, max_tokens: 350, messages, tools: TOOLS });
      let msg = data.choices[0].message;

      // Handle tool calls (may chain: flag_emergency then reply, or book_appointment)
      for (let round = 0; round < 2; round++) {
        const toolCall = msg.tool_calls?.[0];
        if (!toolCall?.function?.name) break;

        if (toolCall.function.name === "flag_emergency") {
          const args = JSON.parse(toolCall.function.arguments || "{}");
          const reason = args.reason || emergencyHit?.matched || "urgent dental concern";
          const detection = { matched: reason, excerpt: args.notes || lastUserText };
          triage = buildTriagePayload(detection, clinic);
          try {
            await persistUrgentAlert({
              clinic,
              clinicId: req.body?.clinicId || "demo",
              reason: triage.reason,
              excerpt: triage.excerpt,
              emergencySlot: triage.emergencySlot,
              name: args.name,
              phone: args.phone,
              source: "ai_receptionist_emergency",
            });
          } catch (e) {
            console.warn("Urgent alert persist failed:", e.message);
          }
          messages.push(msg);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              staff_alerted: true,
              priority: "urgent",
              emergency_slot: triage.emergencySlot,
              clinic_phone: clinic.phone,
              transfer_available: true,
              guidance: triage.guidance,
            }),
          });
          data = await call({ model: "gpt-4o-mini", temperature: 0.45, max_tokens: 320, messages, tools: TOOLS });
          msg = data.choices[0].message;
          continue;
        }

        if (toolCall.function.name === "book_appointment") {
          const args = JSON.parse(toolCall.function.arguments || "{}");
          if (triage?.urgent) {
            args.urgent = true;
            args.triageReason = args.triageReason || triage.reason;
            args.priority = "urgent";
            if (!args.preferredTime) args.preferredTime = triage.emergencySlot;
            if (!args.notes) args.notes = `Emergency: ${triage.reason}`;
          }
          const { id, reference } = await bookAndNotify({
            args,
            clinicId: req.body?.clinicId || "demo",
            clinic,
            source: args.urgent ? "ai_receptionist_emergency" : "ai_receptionist",
            gmailUser: GMAIL_USER.value(),
            gmailPass: GMAIL_APP_PASSWORD.value(),
          });
          booking = { id, ...args, clinicName: clinic.name };

          messages.push(msg);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              booked: true,
              reference,
              confirmationEmailSentTo: args.email || null,
              urgent: !!args.urgent,
            }),
          });
          data = await call({ model: "gpt-4o-mini", temperature: 0.6, max_tokens: 300, messages });
          msg = data.choices[0].message;
          break;
        }
        break;
      }

      // Persist triage alert if keywords fired but model skipped the tool
      if (triage?.urgent && !booking) {
        try {
          await persistUrgentAlert({
            clinic,
            clinicId: req.body?.clinicId || "demo",
            reason: triage.reason,
            excerpt: triage.excerpt,
            emergencySlot: triage.emergencySlot,
            source: "ai_receptionist_emergency",
          });
        } catch (e) {
          console.warn("Urgent alert persist failed:", e.message);
        }
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

      const serviceNames = clinic.services.map((s) => s.name);
      const bookingDraft = extractBookingDraft(history, serviceNames);
      const lastUser = history.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
      const isFormSubmit = /Please book my appointment/i.test(lastUser);
      const showBookingForm =
        !booking &&
        !isServicesQuery(lastUser) &&
        (isFormSubmit || (hasBookingIntent(lastUser) && !/^(what|how|tell me about)\b/i.test(lastUser.trim())));

      res.status(200).json({ reply: replyText, booking, triage, audio, transcript, bookingDraft, showBookingForm });
    } catch (err) {
      console.error("Receptionist error:", err);
      res.status(500).json({ error: "I'm having a moment — please try again or WhatsApp us." });
    }
  }
);
