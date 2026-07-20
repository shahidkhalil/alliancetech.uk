"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Loader2, Mic, CalendarCheck2 } from "lucide-react";
import {
  BookingDraft,
  EMPTY_DRAFT,
  BOOKING_DAYS,
  BOOKING_TIMES,
  extractBookingDraft,
  mergeDraft,
} from "@/lib/bookingExtract";
import { realtimeTokenUrl, bookUrl } from "@/lib/receptionistEndpoints";

const LIVE_SERVICES = [
  "Consultation & Check-up",
  "Scaling & Polishing",
  "Tooth Filling",
  "Root Canal",
  "Dental Implants",
  "Braces (Orthodontics)",
  "Clear Aligners",
  "Teeth Whitening",
  "Veneers",
  "Wisdom Tooth Extraction",
];

type CallState = "connecting" | "live" | "ended" | "error";

interface Props {
  onClose: () => void;
}

type FnCall = { type?: string; name?: string; call_id?: string; arguments?: string };

function digitsOnly(text: string) {
  return (text.match(/\d/g) || []).join("");
}

/** Pick the best recent user transcript for the field Maya is confirming. */
function pickTranscript(field: string, recent: string[]): { text: string; digits: string; spoken_digits: string } {
  const list = [...recent].reverse().filter(Boolean);
  let text = list[0] || "";

  if (field === "phone") {
    const withDigits = list.find((t) => digitsOnly(t).length >= 7);
    if (withDigits) text = withDigits;
  } else if (field === "email") {
    const withEmail = list.find((t) => /@|\bat\b|\bdot\b/i.test(t));
    if (withEmail) text = withEmail;
  } else if (field === "name") {
    // Prefer a short alphabetic utterance over a yes/no or a phone string.
    const nameLike = list.find((t) => {
      const d = digitsOnly(t);
      const words = t.trim().split(/\s+/);
      return d.length < 4 && words.length >= 1 && words.length <= 5 && /[a-zA-Z]/.test(t) && !/^(yes|yeah|yep|no|nope|correct|right)\b/i.test(t.trim());
    });
    if (nameLike) text = nameLike;
  }

  const digits = digitsOnly(text);
  return {
    text: text.trim(),
    digits,
    spoken_digits: digits ? digits.split("").join(" ") : "",
  };
}

function friendlyFetchError(err: unknown, step: string): string {
  if (err instanceof TypeError && /failed to fetch|networkerror/i.test(err.message)) {
    return `Could not reach the server (${step}). Check your connection or try the chat instead.`;
  }
  if (err instanceof Error) return err.message;
  return `Couldn't start the call (${step}).`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postJson(url: string, body: unknown, step = "token") {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(friendlyFetchError(err, step));
  }
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) throw new Error(String(data.error || `Server error (${res.status})`));
  return data;
}

export default function LiveCall({ onClose }: Props) {
  const [state, setState] = useState<CallState>("connecting");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState(180);
  const [caption, setCaption] = useState("");
  const [mayaTalking, setMayaTalking] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captionRef = useRef("");
  // Accurate STT of what the patient said (separate from Maya's speech model).
  const userTranscriptsRef = useRef<string[]>([]);

  const syncDraftFromSpeech = useCallback((transcripts: string[]) => {
    const msgs = transcripts.map((t) => ({ role: "user", content: t }));
    const extracted = extractBookingDraft(msgs, LIVE_SERVICES);
    setDraft((prev) => mergeDraft(prev, extracted));
  }, []);

  const hangUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setState((s) => (s === "error" ? s : "ended"));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1. Ephemeral session token (loaded with the clinic KB + booking tool).
        const tokenData = await postJson(realtimeTokenUrl(), { clinicId: "demo" }, "session");
        const clientSecret = String(tokenData.clientSecret || "");
        const model = String(tokenData.model || "gpt-realtime-mini");
        const callMaxSeconds = Number(tokenData.maxSeconds) || 180;
        if (!clientSecret) throw new Error("No session token — please try the chat.");
        if (cancelled) return;
        setMaxSeconds(callMaxSeconds);

        // 2. WebRTC straight to OpenAI.
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        const remote = new Audio();
        remote.autoplay = true;
        audioRef.current = remote;
        pc.ontrack = (e) => { remote.srcObject = e.streams[0]; };

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          throw new Error("Microphone access is required for live calls — please allow mic access and try again.");
        });
        streamRef.current = stream;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        // 3. Data channel: captions, user STT, recall tool, and booking.
        const dc = pc.createDataChannel("oai-events");
        dc.onmessage = async (e) => {
          try {
            const ev = JSON.parse(e.data);

            // Dedicated input transcription (more accurate for digits / spellings).
            if (ev.type === "conversation.item.input_audio_transcription.completed") {
              const t = String(ev.transcript || "").trim();
              if (t) {
                userTranscriptsRef.current = [...userTranscriptsRef.current.slice(-11), t];
                syncDraftFromSpeech(userTranscriptsRef.current);
              }
            }

            if (ev.type === "response.audio_transcript.delta" || ev.type === "response.output_audio_transcript.delta") {
              captionRef.current += ev.delta || "";
              setCaption(captionRef.current.slice(-160));
              setMayaTalking(true);
            }
            if (ev.type === "response.done") {
              setMayaTalking(false);
              captionRef.current = "";
              const calls = (ev.response?.output || []).filter(
                (o: FnCall) => o.type === "function_call" && o.name && o.call_id
              ) as FnCall[];
              if (!calls.length) return;

              for (const call of calls) {
                if (call.name === "recall_last_spoken_text") {
                  // Transcription can lag a beat behind the tool call — wait briefly if needed.
                  let args: { field?: string } = {};
                  try { args = JSON.parse(call.arguments || "{}"); } catch { /* ignore */ }
                  const field = args.field || "other";
                  let picked = pickTranscript(field, userTranscriptsRef.current);
                  if (!picked.text || (field === "phone" && picked.digits.length < 7)) {
                    await sleep(1200);
                    picked = pickTranscript(field, userTranscriptsRef.current);
                  }
                  const ready =
                    !!picked.text &&
                    (field !== "phone" || picked.digits.length >= 7) &&
                    (field !== "email" || /@|\bat\b|\bdot\b/i.test(picked.text) || picked.text.length > 5);
                  const output = {
                    ready,
                    field,
                    text: picked.text,
                    digits: picked.digits,
                    spoken_digits: picked.spoken_digits,
                    instruction: ready
                      ? field === "phone"
                        ? "Read the number back once naturally (e.g. 555-0142). If they confirm, move on — do not ask again."
                        : "Confirm this exact text once. If they say yes, move on — do not re-confirm."
                      : "Transcript unclear — ask them to repeat once, or suggest they type it in the form on screen.",
                  };
                  dc.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                  }));
                }

                if (call.name === "book_appointment") {
                  const args = JSON.parse(call.arguments || "{}");
                  let output = { booked: false as boolean, reference: "" };
                  try {
                    const br = await fetch(bookUrl(), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...args, clinicId: "demo" }),
                    });
                    const bd = await br.json();
                    if (br.ok && bd.booked) {
                      output = { booked: true, reference: bd.reference };
                      setBooked(`${args.service} · ${args.preferredTime} (Ref ${bd.reference})`);
                    }
                  } catch { /* agent will apologise */ }
                  dc.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                  }));
                }
              }

              // One response.create after all tool outputs for this turn.
              dc.send(JSON.stringify({ type: "response.create" }));
            }
          } catch { /* non-JSON frames ignored */ }
        };

        // 4. SDP handshake with the ephemeral key.
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        let sdpRes: Response;
        try {
          sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${model}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${clientSecret}`, "Content-Type": "application/sdp" },
            body: offer.sdp,
          });
        } catch (err) {
          throw new Error(friendlyFetchError(err, "voice connection"));
        }
        if (!sdpRes.ok) {
          const detail = (await sdpRes.text()).slice(0, 120);
          throw new Error(`Voice connection failed (${sdpRes.status})${detail ? `: ${detail}` : ""}`);
        }
        await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
        if (cancelled) return;

        setState("live");
        timerRef.current = setInterval(() => {
          setSeconds((s) => {
            if (s + 1 >= callMaxSeconds) hangUp();
            return s + 1;
          });
        }, 1000);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Couldn't start the call.");
        setState("error");
      }
    })();

    return () => { cancelled = true; hangUp(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={state !== "live" && state !== "connecting" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl text-center"
        style={{ background: "linear-gradient(160deg, #06382F, #0B5D50)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-8 pb-4 px-6">
          {/* Maya avatar with speaking pulse */}
          <div className="relative inline-block mb-4">
            <motion.div
              className="absolute inset-0 rounded-full bg-[#14A08A]"
              animate={mayaTalking ? { scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] } : { scale: 1, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20">
              M
            </div>
          </div>

          <p className="text-xl font-bold text-white">Maya</p>
          <p className="text-xs text-white/60 mb-4">Bright Smile Dental Care · Live Call</p>

          {state === "connecting" && (
            <p className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
            </p>
          )}

          {state === "live" && (
            <>
              <p className="text-2xl font-mono text-white mb-1">{mm}:{ss}</p>
              <p className="text-[11px] text-white/60 mb-4">demo call · max {Math.round(maxSeconds / 60)} min</p>
              <p className="flex items-center justify-center gap-2 text-xs text-white/60 mb-3">
                <Mic className="w-3.5 h-3.5 text-green-400" /> {mayaTalking ? "Maya is speaking — you can interrupt" : "Listening… just talk"}
              </p>
              {caption && (
                <p className="text-xs text-white/70 bg-white/10 rounded-xl px-3 py-2 min-h-[36px] italic">&ldquo;…{caption}&rdquo;</p>
              )}
              {booked && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-300 bg-green-500/10 border border-green-400/30 rounded-full px-3 py-2">
                  <CalendarCheck2 className="w-3.5 h-3.5" /> Booked: {booked}
                </p>
              )}

              {/* Editable booking fields — speech fills these for review */}
              <div className="mt-4 text-left bg-white/10 rounded-2xl p-3 space-y-2 border border-white/10">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Your details (speak or type)</p>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <input
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="Phone"
                  inputMode="tel"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <input
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <select
                  value={draft.service}
                  onChange={(e) => setDraft((d) => ({ ...d, service: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                >
                  <option value="">Service</option>
                  {LIVE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={draft.day}
                    onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}
                    className="w-full px-2 py-2 rounded-lg bg-white/95 text-xs text-gray-800 outline-none"
                  >
                    <option value="">Day</option>
                    {BOOKING_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={draft.time}
                    onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                    className="w-full px-2 py-2 rounded-lg bg-white/95 text-xs text-gray-800 outline-none"
                  >
                    <option value="">Time</option>
                    {BOOKING_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {state === "ended" && (
            <div className="text-sm text-white/70">
              <p className="mb-1">Call ended · {mm}:{ss}</p>
              {booked && <p className="text-green-300 text-xs">✓ Appointment booked: {booked}</p>}
            </div>
          )}

          {state === "error" && <p className="text-sm text-red-300">{error}</p>}
        </div>

        {/* Controls */}
        <div className="pb-6 flex items-center justify-center gap-4">
          {(state === "live" || state === "connecting") ? (
            <button
              onClick={() => { hangUp(); }}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
              aria-label="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LiveCallLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-full px-3 py-1.5 transition-colors"
      >
        📞 Talk live
      </button>
      <AnimatePresence>{open && <LiveCall onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
