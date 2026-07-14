"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Loader2, Mic, CalendarCheck2 } from "lucide-react";

const TOKEN_ENDPOINT =
  process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/realtimeToken";
const BOOK_ENDPOINT =
  process.env.NEXT_PUBLIC_BOOK_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/bookAppointmentHttp";

type CallState = "connecting" | "live" | "ended" | "error";

interface Props {
  onClose: () => void;
}

export default function LiveCall({ onClose }: Props) {
  const [state, setState] = useState<CallState>("connecting");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState(180);
  const [caption, setCaption] = useState("");
  const [mayaTalking, setMayaTalking] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captionRef = useRef("");

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
        const tokenRes = await fetch(TOKEN_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clinicId: "demo" }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.clientSecret) throw new Error(tokenData.error || "Couldn't start the call.");
        if (cancelled) return;
        setMaxSeconds(tokenData.maxSeconds || 180);

        // 2. WebRTC straight to OpenAI.
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        const remote = new Audio();
        remote.autoplay = true;
        audioRef.current = remote;
        pc.ontrack = (e) => { remote.srcObject = e.streams[0]; };

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        // 3. Data channel: captions, talking state, and booking tool calls.
        const dc = pc.createDataChannel("oai-events");
        dc.onmessage = async (e) => {
          try {
            const ev = JSON.parse(e.data);
            if (ev.type === "response.audio_transcript.delta" || ev.type === "response.output_audio_transcript.delta") {
              captionRef.current += ev.delta || "";
              setCaption(captionRef.current.slice(-160));
              setMayaTalking(true);
            }
            if (ev.type === "response.done") {
              setMayaTalking(false);
              captionRef.current = "";
              // Handle a booking decision from the agent.
              const call = (ev.response?.output || []).find((o: { type?: string }) => o.type === "function_call");
              if (call?.name === "book_appointment") {
                const args = JSON.parse(call.arguments || "{}");
                let output = { booked: false as boolean, reference: "" };
                try {
                  const br = await fetch(BOOK_ENDPOINT, {
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
                dc.send(JSON.stringify({ type: "response.create" }));
              }
            }
          } catch { /* non-JSON frames ignored */ }
        };

        // 4. SDP handshake with the ephemeral key.
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${tokenData.model}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${tokenData.clientSecret}`, "Content-Type": "application/sdp" },
          body: offer.sdp,
        });
        if (!sdpRes.ok) throw new Error("Live connection failed — please try again.");
        await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
        if (cancelled) return;

        setState("live");
        timerRef.current = setInterval(() => {
          setSeconds((s) => {
            if (s + 1 >= (tokenData.maxSeconds || 180)) hangUp();
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
        <div className="pt-10 pb-8 px-6">
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
          <p className="text-xs text-white/50 mb-4">Bright Smile Dental Care · Live Call</p>

          {state === "connecting" && (
            <p className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
            </p>
          )}

          {state === "live" && (
            <>
              <p className="text-2xl font-mono text-white mb-1">{mm}:{ss}</p>
              <p className="text-[11px] text-white/40 mb-4">demo call · max {Math.round(maxSeconds / 60)} min</p>
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
        <div className="pb-8 flex items-center justify-center gap-4">
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
