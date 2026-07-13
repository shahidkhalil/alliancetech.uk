"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CalendarCheck2, Stethoscope } from "lucide-react";

const ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/clinicReceptionist";

interface ChatMsg { role: "user" | "assistant"; content: string; form?: { service: string; done?: boolean } }
interface Booking { name: string; phone: string; service: string; preferredTime: string; clinicName?: string }

const DAYS = ["Today", "Tomorrow", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "8:30 PM"];

function BookingForm({ service, onSubmit }: { service: string; onSubmit: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [svc, setSvc] = useState(service);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const canBook = name.trim().length >= 2 && phoneOk && svc && day && time;

  const field = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] bg-white";

  return (
    <div className="w-full max-w-[85%] rounded-2xl rounded-bl-sm border border-[#0E7C6B]/20 bg-white shadow-sm p-4 space-y-2.5">
      <p className="text-sm font-bold text-[#0E7C6B]">📅 Book your appointment</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp (03XX…)" inputMode="tel" className={field} />
      <select value={svc} onChange={(e) => setSvc(e.target.value)} className={field}>
        <option value="" disabled>Select service</option>
        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select value={day} onChange={(e) => setDay(e.target.value)} className={field}>
          <option value="" disabled>Day</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={time} onChange={(e) => setTime(e.target.value)} className={field}>
          <option value="" disabled>Time</option>
          {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button
        disabled={!canBook}
        onClick={() => onSubmit(`Please book my appointment. Name: ${name.trim()}. Phone: ${phone.trim()}. Service: ${svc}. Preferred time: ${day} at ${time}.`)}
        className="w-full py-2.5 rounded-lg bg-[#0E7C6B] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Confirm Booking →
      </button>
    </div>
  );
}

// The bot asked for booking details in plain text — offer the form instead.
const ASKS_DETAILS = /(provide|share|need|tell me|may i have|could i get).{0,40}(name|number|phone)|name.{0,30}phone number|apna naam/i;

const SUGGESTIONS = [
  "What services do you offer?",
  "What are your timings?",
  "Braces ki price kya hai?",
  "I have tooth pain, can I come today?",
];

// Mirror of the clinic KB service names — used to make services tappable in replies.
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

/** Find which known services an assistant message mentions. */
function servicesIn(text: string): string[] {
  const lower = text.toLowerCase();
  return SERVICES.filter((s) => {
    const key = s.toLowerCase().replace(" & check-up", "").replace(" & polishing", "");
    return lower.includes(key) || lower.includes(s.toLowerCase());
  });
}

export default function ReceptionistDemo() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Assalam-o-Alaikum! 😊 Welcome to Bright Smile Dental Care. I'm your virtual receptionist — how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const v = text.trim();
    if (!v || busy) return;
    setInput("");
    const next: ChatMsg[] = [...messages, { role: "user", content: v }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: "demo", messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages((prev) => {
        const out: ChatMsg[] = [...prev, { role: "assistant", content: data.reply }];
        // If the bot asked for details in text, offer the quick form instead.
        if (!data.booking && ASKS_DETAILS.test(data.reply || "")) {
          out.push({ role: "assistant", content: "…or just fill this in — faster! 👇", form: { service: "" } });
        }
        return out;
      });
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
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `I'd like to book: ${service}` },
      { role: "assistant", content: `Great choice! Fill this in and I'll book your ${service} right away. 👇`, form: { service } },
    ]);
  };

  // Form submitted: hide the form and let the AI complete the booking.
  const submitForm = (idx: number, msg: string) => {
    setMessages((prev) => prev.map((m, i) => (i === idx && m.form ? { ...m, form: { ...m.form, done: true } } : m)));
    send(msg);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
        {/* Header — styled as the DEMO clinic, not Alliance */}
        <div className="bg-[#0E7C6B] px-5 py-3.5 flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0E7C6B]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Bright Smile Dental Care</p>
            <p className="text-[11px] text-white/60">AI Receptionist · replies instantly</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 bg-white/10 px-2 py-1 rounded-full">Live Demo</span>
        </div>

        {/* Messages */}
        <div className="h-[420px] overflow-y-auto px-4 py-4 space-y-3 bg-[#F7FAF9]">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const mentioned = m.role === "assistant" && isLast && !m.form ? servicesIn(m.content) : [];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  {m.content && (
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-[#0E7C6B] text-white rounded-br-sm"
                          : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  )}
                  {m.form && !m.form.done && !booking && (
                    <div className="mt-2 w-full flex justify-start">
                      <BookingForm service={m.form.service} onSubmit={(msg) => submitForm(i, msg)} />
                    </div>
                  )}
                  {mentioned.length > 0 && !busy && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {mentioned.map((s) => (
                        <button
                          key={s}
                          onClick={() => openFormFor(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-[#0E7C6B]/10 text-[#0E7C6B] font-semibold border border-[#0E7C6B]/20 hover:bg-[#0E7C6B] hover:text-white transition-colors"
                        >
                          📅 {s}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {booking && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-green-50 border border-green-200">
                <p className="flex items-center gap-1.5 text-sm font-bold text-green-800 mb-1">
                  <CalendarCheck2 className="w-4 h-4" /> Appointment Request Received
                </p>
                <p className="text-xs text-green-700">
                  {booking.name} · {booking.service} · {booking.preferredTime}
                </p>
              </div>
            </motion.div>
          )}

          {busy && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="inline-flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#0E7C6B]/30 text-[#0E7C6B] hover:bg-[#0E7C6B]/5 transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="bg-white px-3 py-3 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything — English ya Urdu…"
            disabled={busy}
            className="flex-1 px-4 py-3 rounded-xl bg-[#F7FAF9] border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="w-11 h-11 rounded-xl bg-[#0E7C6B] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
            aria-label="Send"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        This is a live demo trained on a sample clinic. Your clinic gets its own — trained on your services, prices, and hours.
      </p>
    </div>
  );
}
