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

const nodemailer = require("nodemailer");
const { getClinic } = require("./lib/clinicKB");
const { checkRateLimit } = require("./lib/cache");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const DAILY_LIMIT_PER_IP = 60; // generous for a conversation

/** Best-effort appointment confirmation email to the patient. */
async function sendConfirmationEmail(booking, clinic, reference) {
  const user = (GMAIL_USER.value() || "").trim();
  const pass = (GMAIL_APP_PASSWORD.value() || "").replace(/[\s ]+/g, "");
  if (!user || !pass || !booking.email) return;

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"${clinic.name}" <${user}>`,
    to: booking.email,
    subject: `✅ Appointment Confirmed — ${clinic.name} (Ref ${reference})`,
    text: [
      `Dear ${booking.name},`,
      ``,
      `Your appointment has been booked. Here are the details:`,
      ``,
      `  Service:   ${booking.service}`,
      `  When:      ${booking.preferredTime}`,
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

function systemPrompt(c) {
  return `You are the friendly front-desk receptionist for "${c.name}" — ${c.tagline} in ${c.city}. You chat with patients on the clinic's website.

PERSONALITY: Your name is Maya. You are warm, human, and concise — like a real, caring receptionist, never a robot. Use the patient's name once you know it. Reply in the same language the patient uses (English or Urdu, including Roman Urdu). Keep replies short (1–3 sentences) unless listing services. A light emoji here and there is fine (😊, 🦷) — one per message at most.

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
    cors: true,
    timeoutSeconds: 60,
    memory: "256MiB",
    secrets: [OPENAI_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
    if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP))) {
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
        const doc = await admin.firestore().collection("appointments").add({
          ...args,
          clinicId: req.body?.clinicId || "demo",
          clinicName: clinic.name,
          source: "ai_receptionist",
          status: "new",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        booking = { id: doc.id, ...args, clinicName: clinic.name };

        // Also create a lead so the owner gets the standard alert.
        await admin.firestore().collection("leads").add({
          name: args.name,
          phone: args.phone,
          email: args.email || "",
          source: "ai_receptionist",
          clinicName: clinic.name,
          message: `Appointment: ${args.service} — ${args.preferredTime}${args.notes ? ` (${args.notes})` : ""}`,
          status: "new",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(() => {});

        // Confirmation email to the patient (best-effort, never blocks the reply).
        const reference = doc.id.slice(0, 6).toUpperCase();
        sendConfirmationEmail(args, clinic, reference).catch((e) =>
          console.warn("Confirmation email failed:", e.message)
        );

        // Feed the tool result back so the model writes a natural confirmation.
        messages.push(msg);
        messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ booked: true, reference, confirmationEmailSentTo: args.email || null }) });
        data = await call({ model: "gpt-4o-mini", temperature: 0.6, max_tokens: 300, messages });
        msg = data.choices[0].message;
      }

      res.status(200).json({ reply: msg.content || "Sorry, could you say that again?", booking });
    } catch (err) {
      console.error("Receptionist error:", err);
      res.status(500).json({ error: "I'm having a moment — please try again or WhatsApp us." });
    }
  }
);
