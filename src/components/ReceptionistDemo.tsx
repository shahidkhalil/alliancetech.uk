"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CalendarCheck2, Phone, Clock, Sparkles, Mic, Square, Trash2, Volume2, VolumeX } from "lucide-react";

const ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/clinicReceptionist";
const TRANSCRIBE_ENDPOINT =
  process.env.NEXT_PUBLIC_TRANSCRIBE_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/transcribeAudio";

const MAX_RECORD_SECONDS = 30;

interface ChatMsg { role: "user" | "assistant"; content: string; form?: { service: string; done?: boolean }; audio?: string; voiceNote?: boolean }
interface Booking { name: string; phone: string; service: string; preferredTime: string; clinicName?: string }

const SUGGESTIONS = [
  { icon: "🦷", label: "What services do you offer?" },
  { icon: "🕐", label: "What are your timings?" },
  { icon: "💰", label: "Braces ki price kya hai?" },
  { icon: "📅", label: "Book me an appointment" },
];

const SERVICES = [
  "Consultation & Check-up",
  "Scaling & Polishing",
  "Tooth Filling",
  "Root Canal",
  "Dental Implants",
  "Braces",
  "Clear Aligners",
  "Teeth Whitening",
  "Veneers",
  "Wisdom Tooth Extraction",
];

const DAYS = ["Today", "Tomorrow", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "8:30 PM"];

/** Find which known services an assistant message mentions. */
function servicesIn(text: string): string[] {
  const lower = text.toLowerCase();
  return SERVICES.filter((s) => {
    const key = s.toLowerCase().replace(" & check-up", "").replace(" & polishing", "");
    return lower.includes(key) || lower.includes(s.toLowerCase());
  });
}

// The bot asked for booking details in plain text — offer the form instead.
const ASKS_DETAILS = /(provide|share|need|tell me|may i have|could i get).{0,40}(name|number|phone)|name.{0,30}phone number|apna naam/i;

function MayaAvatar({ size = "w-8 h-8" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm`}>
      M
    </div>
  );
}

function BookingForm({ service, onSubmit }: { service: string; onSubmit: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [svc, setSvc] = useState(service);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canBook = name.trim().length >= 2 && phoneOk && emailOk && svc && day && time;

  const field = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] focus:ring-2 focus:ring-[#0E7C6B]/10 bg-white transition-all";
  const label = "block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1";

  return (
    <div className="w-full max-w-[90%] rounded-2xl rounded-tl-md border border-[#0E7C6B]/15 bg-gradient-to-b from-white to-[#F7FBFA] shadow-md p-5 space-y-3.5">
      <div className="flex items-center gap-2 pb-1">
        <span className="w-8 h-8 rounded-full bg-[#0E7C6B]/10 flex items-center justify-center text-base">📅</span>
        <div>
          <p className="text-sm font-bold text-[#00332C]">Book your appointment</p>
          <p className="text-[11px] text-gray-400">Takes 10 seconds — we&apos;ll confirm on WhatsApp</p>
        </div>
      </div>
      <div>
        <label className={label}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ayesha Khan" className={field} />
      </div>
      <div>
        <label className={label}>Phone / WhatsApp</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={field} />
      </div>
      <div>
        <label className={label}>Email <span className="normal-case font-normal">(for your confirmation)</span></label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" inputMode="email" className={field} />
      </div>
      <div>
        <label className={label}>Service</label>
        <select value={svc} onChange={(e) => setSvc(e.target.value)} className={field}>
          <option value="" disabled>Select service</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={label}>Day</label>
          <select value={day} onChange={(e) => setDay(e.target.value)} className={field}>
            <option value="" disabled>Choose</option>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Time</label>
          <select value={time} onChange={(e) => setTime(e.target.value)} className={field}>
            <option value="" disabled>Choose</option>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <button
        disabled={!canBook}
        onClick={() => onSubmit(`Please book my appointment. Name: ${name.trim()}. Phone: ${phone.trim()}. Email: ${email.trim()}. Service: ${svc}. Preferred time: ${day} at ${time}.`)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#0E7C6B]/20 transition-all disabled:opacity-40 disabled:shadow-none"
      >
        Confirm Booking ✓
      </button>
    </div>
  );
}

export default function ReceptionistDemo() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Assalam-o-Alaikum! 😊 I'm Maya, the virtual receptionist at Bright Smile Dental Care. Ask me anything — prices, timings, treatments — or I can book your appointment right here." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  // ---- Maya's voice playback (with mute + stop controls) ----
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);

  const stopSpeaking = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  };

  const toggleMute = () => {
    setMuted((m) => {
      mutedRef.current = !m;
      if (!m) stopSpeaking(); // muting also silences the current reply
      return !m;
    });
  };

  const playAudio = (b64: string, force = false) => {
    if (mutedRef.current && !force) return; // muted: no auto-play (manual ▶ still works)
    try {
      stopSpeaking();
      const a = new Audio(`data:audio/mp3;base64,${b64}`);
      audioRef.current = a;
      a.onended = () => setSpeaking(false);
      a.onpause = () => setSpeaking(false);
      a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false));
    } catch { /* ignore */ }
  };

  const send = async (text: string, opts?: { voice?: boolean }) => {
    const v = text.trim();
    if (!v || busy) return;
    setInput("");
    setShowSuggestions(false);
    const next: ChatMsg[] = [...messages, { role: "user", content: v, voiceNote: opts?.voice }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: "demo", speak: !!opts?.voice, messages: next.filter((m) => m.content) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages((prev) => {
        const out: ChatMsg[] = [...prev, { role: "assistant", content: data.reply, audio: data.audio || undefined }];
        if (!data.booking && ASKS_DETAILS.test(data.reply || "")) {
          out.push({ role: "assistant", content: "", form: { service: "" } });
        }
        return out;
      });
      if (data.audio) playAudio(data.audio);
      if (data.booking) setBooking(data.booking);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `😕 ${err instanceof Error ? err.message : "Please try again."}` }]);
    } finally {
      setBusy(false);
    }
  };

  // Service chip tapped: open the booking form instantly (no AI round-trip).
  const openFormFor = (service: string) => {
    if (busy) return;
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: service ? `I'd like to book: ${service}` : "Book me an appointment" },
      {
        role: "assistant",
        content: service
          ? `Lovely choice! Fill this in and I'll lock in your ${service}. 👇`
          : "Of course! Just fill this in and I'll book you right away. 👇",
        form: { service },
      },
    ]);
  };

  const submitForm = (idx: number, msg: string) => {
    setMessages((prev) => prev.map((m, i) => (i === idx && m.form ? { ...m, form: { ...m.form, done: true } } : m)));
    send(msg);
  };

  // ---- Voice notes (tap mic → speak → tap stop → Whisper → send) ----
  const cancelledRef = useRef(false);

  const stopRecording = () => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  };

  const cancelRecording = () => {
    cancelledRef.current = true;
    stopRecording();
  };

  const startRecording = async () => {
    if (busy || recState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        if (cancelledRef.current) {
          cancelledRef.current = false;
          setRecState("idle");
          return; // discarded — nothing is transcribed or sent
        }
        setRecState("transcribing");
        try {
          const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
          const b64 = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result).split(",")[1] || "");
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });
          const res = await fetch(TRANSCRIBE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: b64, mime: blob.type }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transcription failed");
          setRecState("idle");
          send(data.text, { voice: true });
        } catch (err) {
          setRecState("idle");
          setMessages((prev) => [...prev, { role: "assistant", content: `🎤 ${err instanceof Error ? err.message : "Couldn't process the voice note."}` }]);
        }
      };
      recorderRef.current = rec;
      cancelledRef.current = false;
      rec.start();
      setRecSeconds(0);
      setRecState("recording");
      recTimerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "🎤 I couldn't access your microphone — please allow mic access and try again, or just type." }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(120deg, #06382F, #0E7C6B)" }}>
          <div className="relative">
            <MayaAvatar size="w-11 h-11" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0B5D50]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white leading-tight">Maya</p>
            <p className="text-[11px] text-white/60 leading-tight">Receptionist · Bright Smile Dental Care</p>
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:text-white"}`}
            aria-label={muted ? "Unmute Maya's voice" : "Mute Maya's voice"}
            title={muted ? "Voice replies muted" : "Mute voice replies"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> LIVE DEMO
            </span>
            <p className="text-[10px] text-white/40 mt-1 flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> replies in seconds</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[440px] overflow-y-auto px-4 py-5 space-y-4" style={{ background: "linear-gradient(180deg, #F4F8F7 0%, #FAFCFB 100%)" }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const mentioned = m.role === "assistant" && isLast && !m.form ? servicesIn(m.content) : [];
              const isBot = m.role === "assistant";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (m.content || m.form) ? <MayaAvatar /> : null}
                  <div className={`flex flex-col ${isBot ? "items-start" : "items-end"} max-w-[85%]`}>
                    {m.content && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                          isBot
                            ? "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-md"
                            : "text-white rounded-tr-md shadow-md shadow-[#0E7C6B]/15"
                        }`}
                        style={!isBot ? { background: "linear-gradient(135deg, #0E7C6B, #14A08A)" } : undefined}
                      >
                        {m.voiceNote && <span className="block text-[10px] opacity-70 mb-1">🎤 voice note</span>}
                        {m.content}
                        {m.audio && (
                          <button
                            type="button"
                            onClick={() => playAudio(m.audio!, true)}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#0E7C6B] bg-[#0E7C6B]/8 border border-[#0E7C6B]/20 rounded-full px-3 py-1.5 hover:bg-[#0E7C6B]/15 transition-colors"
                          >
                            🔊 Play Maya&apos;s voice reply
                          </button>
                        )}
                      </div>
                    )}
                    {m.form && !m.form.done && !booking && (
                      <div className={`w-full ${m.content ? "mt-2.5" : ""}`}>
                        <BookingForm service={m.form.service} onSubmit={(msg) => submitForm(i, msg)} />
                      </div>
                    )}
                    {mentioned.length > 0 && !busy && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {mentioned.map((s) => (
                          <button
                            key={s}
                            onClick={() => openFormFor(s)}
                            className="text-xs px-3.5 py-2 rounded-full bg-white text-[#0E7C6B] font-semibold border border-[#0E7C6B]/25 shadow-sm hover:bg-[#0E7C6B] hover:text-white hover:border-[#0E7C6B] transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {booking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 justify-start">
              <MayaAvatar />
              <div className="rounded-2xl rounded-tl-md px-4 py-3.5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm max-w-[85%]">
                <p className="flex items-center gap-1.5 text-sm font-bold text-green-800 mb-1.5">
                  <CalendarCheck2 className="w-4 h-4" /> Appointment Confirmed
                </p>
                <div className="text-xs text-green-700 space-y-0.5">
                  <p><span className="font-semibold">{booking.name}</span> · {booking.service}</p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.preferredTime}</p>
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> We&apos;ll confirm on WhatsApp shortly</p>
                </div>
              </div>
            </motion.div>
          )}

          {busy && (
            <div className="flex gap-2.5 justify-start">
              <MayaAvatar />
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3.5">
                <span className="inline-flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[#0E7C6B]/50 inline-block"
                      animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* Starter suggestions */}
          {showSuggestions && !busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pl-10 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => (s.label === "Book me an appointment" ? openFormFor("") : send(s.label))}
                  className="text-xs px-3.5 py-2 rounded-full bg-white text-gray-600 border border-gray-200 shadow-sm hover:border-[#0E7C6B]/40 hover:text-[#0E7C6B] transition-all"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Maya speaking bar */}
        <AnimatePresence>
          {speaking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0E7C6B]/5 border-t border-[#0E7C6B]/10 px-4 py-2 flex items-center gap-2"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🔊</motion.span>
              <span className="text-xs text-[#0E7C6B] font-semibold flex-1">Maya is speaking…</span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-xs font-bold text-[#0E7C6B] bg-white border border-[#0E7C6B]/25 rounded-full px-3 py-1 hover:bg-[#0E7C6B] hover:text-white transition-colors"
              >
                ⏹ Stop
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            // Typed booking intent → open the form directly (no AI round-trip).
            if (/^(book|appointment)\b|book (me|an|my)? ?(appointment|slot|visit)|appointment (book|chahiye|karni|karna)/i.test(v) && !/name:|phone:/i.test(v)) {
              setInput("");
              openFormFor("");
              return;
            }
            send(v);
          }}
          className="bg-white border-t border-gray-100 px-4 py-3.5 flex items-center gap-2.5"
        >
          {recState === "recording" ? (
            <div className="flex-1 flex items-center gap-3 px-2 py-1.5 rounded-full bg-red-50 border border-red-200">
              <button
                type="button"
                onClick={cancelRecording}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                aria-label="Cancel recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-sm text-red-600 font-semibold flex-1">
                {String(Math.floor(recSeconds / 60))}:{String(recSeconds % 60).padStart(2, "0")} / 0:30
              </span>
              <span className="text-[11px] text-red-400 hidden sm:inline pr-2">🗑 cancel · ■ send</span>
            </div>
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recState === "transcribing" ? "🎤 Listening to your voice note…" : "Type or tap the mic… English ya Urdu"}
              disabled={busy || recState === "transcribing"}
              className="flex-1 px-4.5 py-3 pl-4 rounded-full bg-[#F4F8F7] border border-transparent text-sm text-gray-800 outline-none focus:border-[#0E7C6B]/40 focus:bg-white transition-all disabled:opacity-60"
            />
          )}

          {/* Mic / stop */}
          <button
            type="button"
            onClick={recState === "recording" ? stopRecording : startRecording}
            disabled={busy || recState === "transcribing"}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 ${
              recState === "recording"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-[#F4F8F7] text-[#0E7C6B] border border-[#0E7C6B]/20 hover:bg-[#0E7C6B]/10"
            }`}
            aria-label={recState === "recording" ? "Stop recording" : "Record a voice note"}
          >
            {recState === "transcribing" ? <Loader2 className="w-4 h-4 animate-spin" /> : recState === "recording" ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={busy || !input.trim() || recState !== "idle"}
            className="w-11 h-11 rounded-full text-white flex items-center justify-center hover:shadow-lg hover:shadow-[#0E7C6B]/25 transition-all disabled:opacity-40 disabled:shadow-none flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0E7C6B, #14A08A)" }}
            aria-label="Send"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Live demo on a sample clinic · Your clinic gets its own Maya — trained on <span className="font-semibold text-gray-500">your</span> services, prices &amp; hours
      </p>
    </div>
  );
}
