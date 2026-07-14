/**
 * Voice-note transcription for the AI Receptionist.
 * POST { audio: <base64>, mime?: "audio/webm" } -> { text }
 * Uses OpenAI Whisper — handles Urdu, English, and Roman-Urdu speech.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { checkRateLimit } = require("./lib/cache");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const DAILY_LIMIT_PER_IP = 40;
const MAX_BYTES = 6 * 1024 * 1024; // ~6MB ≈ well over a 30s voice note

exports.transcribeAudio = onRequest(
  {
    region: "asia-south1",
    cors: true,
    timeoutSeconds: 60,
    memory: "256MiB",
    secrets: [OPENAI_API_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
    if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "voice"))) {
      res.status(429).json({ error: "Voice limit reached for today." });
      return;
    }

    try {
      const b64 = req.body?.audio;
      if (!b64 || typeof b64 !== "string") {
        res.status(400).json({ error: "No audio received." });
        return;
      }
      const buf = Buffer.from(b64, "base64");
      if (buf.length < 1000) { res.status(400).json({ error: "Recording too short." }); return; }
      if (buf.length > MAX_BYTES) { res.status(400).json({ error: "Recording too long — keep it under 30 seconds." }); return; }

      const mime = typeof req.body?.mime === "string" ? req.body.mime : "audio/webm";
      const ext = mime.includes("mp4") || mime.includes("m4a") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";

      const form = new FormData();
      form.append("file", new Blob([buf], { type: mime }), `note.${ext}`);
      form.append("model", "gpt-4o-mini-transcribe");

      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY.value()}` },
        body: form,
        signal: AbortSignal.timeout(45000),
      });
      if (!r.ok) throw new Error(`Whisper ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const data = await r.json();

      const text = (data.text || "").trim();
      if (!text) { res.status(422).json({ error: "Couldn't hear anything — please try again." }); return; }
      res.status(200).json({ text });
    } catch (err) {
      console.error("Transcription failed:", err);
      res.status(500).json({ error: "Couldn't process the voice note — please try typing instead." });
    }
  }
);
