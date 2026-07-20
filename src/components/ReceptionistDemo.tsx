"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CalendarCheck2, Phone, Clock, Sparkles, Mic, Square, Trash2, Volume2, VolumeX } from "lucide-react";
import { LiveCallLauncher } from "./LiveCall";
import {
  BookingDraft,
  EMPTY_DRAFT,
  BOOKING_DAYS,
  BOOKING_TIMES,
  extractBookingDraft,
  hasBookingIntent,
  isServicesQuery,
  isServiceDetailQuery,
  mergeDraft,
  draftIsComplete,
} from "@/lib/bookingExtract";

import { receptionistUrl } from "@/lib/receptionistEndpoints";
const MAX_RECORD_SECONDS = 30;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  audio?: string;
  voiceNote?: boolean;
  showServices?: boolean;
  serviceDetail?: string;
  form?: { service: string; done?: boolean };
}

interface Booking {
  name: string;
  phone: string;
  service: string;
  preferredTime: string;
  clinicName?: string;
}

const SUGGESTIONS = [
  { icon: "🦷", label: "What services do you offer?", action: "services" as const },
  { icon: "🕐", label: "What are your hours?", action: "chat" as const },
  { icon: "✨", label: "Tell me about braces", action: "detail" as const, service: "Braces (Orthodontics)" },
  { icon: "📅", label: "Book me an appointment", action: "book" as const },
];

const SERVICES = [
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

const SERVICE_INFO: Record<string, { icon: string; desc: string }> = {
  "Consultation & Check-up": { icon: "🩺", desc: "Full exam, X-rays if needed, and a personalised treatment plan." },
  "Scaling & Polishing": { icon: "✨", desc: "Professional deep clean to remove plaque and stains." },
  "Tooth Filling": { icon: "🔧", desc: "Repairs cavities with tooth-coloured composite — usually same-day." },
  "Root Canal": { icon: "🦷", desc: "Saves an infected tooth with gentle, modern techniques." },
  "Dental Implants": { icon: "⚙️", desc: "Permanent tooth replacement with a planning consultation." },
  "Braces (Orthodontics)": { icon: "😁", desc: "Straighten teeth with metal or ceramic braces over 12–24 months." },
  "Clear Aligners": { icon: "💎", desc: "Nearly invisible, removable aligners for discreet treatment." },
  "Teeth Whitening": { icon: "🌟", desc: "In-office professional whitening — results in about an hour." },
  "Veneers": { icon: "💫", desc: "Custom porcelain shells for a brighter, even smile." },
  "Wisdom Tooth Extraction": { icon: "🏥", desc: "Simple or surgical extraction with sedation options." },
};

function matchServiceName(text: string): string | null {
  const lower = text.toLowerCase();
  return SERVICES.find((s) => {
    const key = s.toLowerCase().replace(" (orthodontics)", "").replace(" & check-up", "").replace(" & polishing", "");
    return lower.includes(key) || lower.includes(s.toLowerCase());
  }) || null;
}

function MayaAvatar({ size = "w-8 h-8" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm`}>
      M
    </div>
  );
}

function ServicesCatalog({ onPick, onBook }: { onPick: (s: string) => void; onBook: (s: string) => void }) {
  return (
    <div className="mt-2.5 w-full max-h-[220px] overflow-y-auto rounded-2xl border border-[#0E7C6B]/15 bg-white shadow-sm divide-y divide-gray-100">
      {SERVICES.map((s) => {
        const info = SERVICE_INFO[s];
        return (
          <div key={s} className="flex items-start gap-3 px-3.5 py-3 hover:bg-[#F7FBFA] transition-colors">
            <span className="text-lg flex-shrink-0 mt-0.5">{info?.icon || "🦷"}</span>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#00332C] leading-tight">{s}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{info?.desc}</p>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button type="button" onClick={() => onPick(s)} className="text-[10px] font-semibold text-[#0E7C6B] hover:underline">Learn more</button>
              <button type="button" onClick={() => onBook(s)} className="text-[10px] font-bold text-white bg-[#0E7C6B] px-2.5 py-1 rounded-full hover:bg-[#0B5D50] transition-colors">Book</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServiceDetailCard({ name, onBook }: { name: string; onBook: () => void }) {
  const info = SERVICE_INFO[name];
  if (!info) return null;
  return (
    <div className="mt-2.5 w-full rounded-2xl border border-[#0E7C6B]/15 bg-white px-4 py-3.5 shadow-sm text-left">
      <p className="text-sm font-bold text-[#00332C] flex items-center gap-2">
        <span>{info.icon}</span> {name}
      </p>
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{info.desc}</p>
      <button type="button" onClick={onBook} className="mt-3 text-xs font-bold text-white bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] px-4 py-2 rounded-full hover:shadow-md transition-all">
        Book this service →
      </button>
    </div>
  );
}

function hasOpenForm(msgs: ChatMsg[]) {
  return msgs.some((m) => m.form && !m.form.done);
}

function BookingForm({
  draft,
  onChange,
  onSubmit,
  busy,
}: {
  draft: BookingDraft;
  onChange: (d: BookingDraft) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const set = (key: keyof BookingDraft, val: string) => onChange({ ...draft, [key]: val });
  const phoneOk = draft.phone.replace(/\D/g, "").length >= 10;
  const canBook = draftIsComplete(draft);

  const field = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] focus:ring-2 focus:ring-[#0E7C6B]/10 bg-white transition-all";
  const label = "block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1";

  return (
    <div className="w-full max-w-[90%] rounded-2xl rounded-tl-md border border-[#0E7C6B]/15 bg-gradient-to-b from-white to-[#F7FBFA] shadow-md p-5 space-y-3.5 mt-2.5">
      <div className="flex items-center gap-2 pb-1">
        <span className="w-8 h-8 rounded-full bg-[#0E7C6B]/10 flex items-center justify-center text-base">📅</span>
        <div>
          <p className="text-sm font-bold text-[#00332C]">Book your appointment</p>
          <p className="text-[11px] text-gray-400">Speak or type — review before confirming</p>
        </div>
      </div>
      <div>
        <label className={label}>Your name</label>
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jane Smith" className={field} />
      </div>
      <div>
        <label className={label}>Phone / WhatsApp</label>
        <input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" inputMode="tel" className={field} />
      </div>
      <div>
        <label className={label}>Email <span className="normal-case font-normal">(optional)</span></label>
        <input value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" type="email" className={field} />
      </div>
      <div>
        <label className={label}>Service</label>
        <select value={draft.service} onChange={(e) => set("service", e.target.value)} className={field}>
          <option value="" disabled>Select service</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={label}>Day</label>
          <select value={draft.day} onChange={(e) => set("day", e.target.value)} className={field}>
            <option value="" disabled>Choose</option>
            {BOOKING_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Time</label>
          <select value={draft.time} onChange={(e) => set("time", e.target.value)} className={field}>
            <option value="" disabled>Choose</option>
            {BOOKING_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <button
        type="button"
        disabled={!canBook || busy}
        onClick={onSubmit}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#0E7C6B]/20 transition-all disabled:opacity-40 disabled:shadow-none"
      >
        Confirm Booking ✓
      </button>
    </div>
  );
}

export default function ReceptionistDemo() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "Hi there! 😊 I'm Maya at Bright Smile Dental Care. Ask about our services or hours — or tap Book when you're ready for an appointment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

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
      if (!m) stopSpeaking();
      return !m;
    });
  };

  const playAudio = (b64: string, force = false) => {
    if (mutedRef.current && !force) return;
    try {
      stopSpeaking();
      const a = new Audio(`data:audio/mp3;base64,${b64}`);
      audioRef.current = a;
      a.onended = () => setSpeaking(false);
      a.onpause = () => setSpeaking(false);
      a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false));
    } catch { /* ignore */ }
  };

  const applyDraftFromMessages = useCallback(
    (msgs: ChatMsg[], serverDraft?: Partial<BookingDraft>) => {
      const extracted = extractBookingDraft(
        msgs.map((m) => ({ role: m.role, content: m.content })),
        SERVICES
      );
      setDraft((prev) => mergeDraft(prev, mergeDraft(extracted, serverDraft || {})));
    },
    []
  );

  const openFormFor = (service: string) => {
    if (busy) return;
    setShowSuggestions(false);
    setDraft(mergeDraft({ ...EMPTY_DRAFT }, service ? { service } : {}));
    setMessages((prev) => [
      ...prev,
      { role: "user", content: service ? `I'd like to book: ${service}` : "Book me an appointment" },
      {
        role: "assistant",
        content: service
          ? `Perfect — fill in the details below and tap Confirm when ready. 👇`
          : "Sure! Complete the form below when you're ready. 👇",
        form: { service },
      },
    ]);
  };

  const showServicesMenu = (userText: string) => {
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "We offer a full range of dental care — tap a service to learn more or book. 🦷", showServices: true },
    ]);
  };

  const showServiceDetail = (userText: string, service: string) => {
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: `Here's a quick overview of ${service}:`, serviceDetail: service },
    ]);
  };

  const submitForm = () => {
    if (!draftIsComplete(draft) || busy) return;
    setMessages((prev) =>
      prev.map((m) => (m.form && !m.form.done ? { ...m, form: { ...m.form, done: true } } : m))
    );
    const msg = `Please book my appointment. Name: ${draft.name.trim()}. Phone: ${draft.phone.trim()}.${draft.email.trim() ? ` Email: ${draft.email.trim()}.` : ""} Service: ${draft.service}. Preferred time: ${draft.day} at ${draft.time}.`;
    send(msg, { forceBooking: true });
  };

  const handleResponse = (data: { reply?: string; booking?: Booking; audio?: string; transcript?: string; bookingDraft?: Partial<BookingDraft> }, prevMessages: ChatMsg[]) => {
    const updated = [...prevMessages];
    if (data.transcript) {
      const idx = updated.map((m) => m.content).lastIndexOf("🎤 Voice note…");
      if (idx >= 0) updated[idx] = { ...updated[idx], content: data.transcript };
    }
    updated.push({ role: "assistant", content: data.reply || "", audio: data.audio || undefined });

    setMessages(updated);

    if (hasOpenForm(updated) && (data.transcript || data.bookingDraft)) {
      applyDraftFromMessages(updated, data.bookingDraft);
    }

    if (data.audio) playAudio(data.audio);
    if (data.booking) setBooking(data.booking);
  };

  const send = async (text: string, opts?: { voice?: boolean; forceBooking?: boolean }) => {
    const v = text.trim();
    if (!v || busy) return;
    setInput("");
    setShowSuggestions(false);

    if (isServicesQuery(v)) {
      showServicesMenu(v);
      return;
    }
    const detailSvc = isServiceDetailQuery(v) || matchServiceName(v);
    if (detailSvc && /tell me about|what is|learn about|about/i.test(v) && !hasBookingIntent(v)) {
      const svc = SERVICES.find((s) => s.toLowerCase().includes(detailSvc.toLowerCase())) || matchServiceName(detailSvc);
      if (svc) {
        showServiceDetail(v, svc);
        return;
      }
    }

    if (hasBookingIntent(v) && !hasOpenForm(messages) && !opts?.forceBooking) {
      openFormFor(matchServiceName(v) || "");
      return;
    }

    const next: ChatMsg[] = [...messages, { role: "user", content: v, voiceNote: opts?.voice }];
    setMessages(next);
    if (hasOpenForm(next)) applyDraftFromMessages(next);
    setBusy(true);

    try {
      const res = await fetch(receptionistUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: "demo",
          speak: !!opts?.voice,
          bookingDraft: hasOpenForm(next) ? draftRef.current : undefined,
          messages: next.filter((m) => m.content),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      handleResponse(data, next);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `😕 ${err instanceof Error ? err.message : "Please try again."}` }]);
    } finally {
      setBusy(false);
    }
  };

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
          return;
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

          setShowSuggestions(false);
          setBusy(true);
          const hist = messagesRef.current.filter((m) => m.content && !m.content.startsWith("🎤 Voice note"));
          const pending: ChatMsg[] = [...hist, { role: "user", content: "🎤 Voice note…", voiceNote: true }];
          setMessages(pending);
          setRecState("idle");

          const res = await fetch(receptionistUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clinicId: "demo",
              speak: true,
              audio: b64,
              mime: blob.type,
              bookingDraft: hasOpenForm(messagesRef.current) ? draftRef.current : undefined,
              messages: hist,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Voice note failed");

          handleResponse(data, pending);
          setBusy(false);
        } catch (err) {
          setRecState("idle");
          setBusy(false);
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
      setMessages((prev) => [...prev, { role: "assistant", content: "🎤 I couldn't access your microphone — please allow mic access, or type your message instead." }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">

        <div className="px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(120deg, #06382F, #0E7C6B)" }}>
          <div className="relative">
            <MayaAvatar size="w-11 h-11" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0B5D50]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white leading-tight">Maya</p>
            <p className="text-[11px] text-white/60 leading-tight">Receptionist · Bright Smile Dental Care</p>
          </div>
          <LiveCallLauncher />
          <button
            type="button"
            onClick={toggleMute}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:text-white"}`}
            aria-label={muted ? "Unmute Maya's voice" : "Mute Maya's voice"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> LIVE DEMO
            </span>
            <p className="text-[10px] text-white/60 mt-1 flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> replies in seconds</p>
          </div>
        </div>

        <div className="h-[380px] overflow-y-auto px-4 py-5 space-y-4" style={{ background: "linear-gradient(180deg, #F4F8F7 0%, #FAFCFB 100%)" }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isBot = m.role === "assistant";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (m.content || m.showServices || m.serviceDetail || (m.form && !m.form.done)) ? <MayaAvatar /> : null}
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
                    {m.showServices && (
                      <ServicesCatalog
                        onPick={(s) => showServiceDetail(`Tell me about ${s}`, s)}
                        onBook={(s) => openFormFor(s)}
                      />
                    )}
                    {m.serviceDetail && (
                      <ServiceDetailCard name={m.serviceDetail} onBook={() => openFormFor(m.serviceDetail!)} />
                    )}
                    {m.form && !m.form.done && (
                      <BookingForm draft={draft} onChange={setDraft} onSubmit={submitForm} busy={busy} />
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

          {showSuggestions && !busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pl-10 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    if (s.action === "book") openFormFor("");
                    else if (s.action === "services") showServicesMenu(s.label);
                    else if (s.action === "detail" && s.service) showServiceDetail(s.label, s.service);
                    else send(s.label);
                  }}
                  className="text-xs px-3.5 py-2 rounded-full bg-white text-gray-600 border border-gray-200 shadow-sm hover:border-[#0E7C6B]/40 hover:text-[#0E7C6B] transition-all"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

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
              <button type="button" onClick={stopSpeaking} className="text-xs font-bold text-[#0E7C6B] bg-white border border-[#0E7C6B]/25 rounded-full px-3 py-1 hover:bg-[#0E7C6B] hover:text-white transition-colors">
                ⏹ Stop
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (/^(book|appointment)\b|book (me|an|my)? ?(appointment|slot|visit)/i.test(v) && !/name:|phone:/i.test(v)) {
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
              <button type="button" onClick={cancelRecording} className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0" aria-label="Cancel recording">
                <Trash2 className="w-4 h-4" />
              </button>
              <motion.span className="w-2.5 h-2.5 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
              <span className="text-sm text-red-600 font-semibold flex-1">
                {String(Math.floor(recSeconds / 60))}:{String(recSeconds % 60).padStart(2, "0")} / 0:30
              </span>
            </div>
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recState === "transcribing" ? "🎤 Transcribing…" : hasOpenForm(messages) ? "Speak or type — fills the booking form" : "Type or tap the mic…"}
              disabled={busy || recState === "transcribing"}
              className="flex-1 px-4.5 py-3 pl-4 rounded-full bg-[#F4F8F7] border border-transparent text-sm text-gray-800 outline-none focus:border-[#0E7C6B]/40 focus:bg-white transition-all disabled:opacity-60"
            />
          )}

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
