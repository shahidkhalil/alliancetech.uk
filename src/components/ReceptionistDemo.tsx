"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CalendarCheck2, Stethoscope } from "lucide-react";

const ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/clinicReceptionist";

interface ChatMsg { role: "user" | "assistant"; content: string }
interface Booking { name: string; phone: string; service: string; preferredTime: string; clinicName?: string }

const SUGGESTIONS = [
  "What are your timings?",
  "Braces ki price kya hai?",
  "I have tooth pain, can I come today?",
  "Book me an appointment",
];

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
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.booking) setBooking(data.booking);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `😕 ${err instanceof Error ? err.message : "Please try again."}` }]);
    } finally {
      setBusy(false);
    }
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
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#0E7C6B] text-white rounded-br-sm"
                      : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
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
