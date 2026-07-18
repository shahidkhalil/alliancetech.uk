"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Bot, Clock, CheckCircle2, MessageSquare, Calendar, Star, Mic } from "lucide-react";
import { useForm } from "@/context/FormContext";

const capabilities = [
  { icon: MessageSquare, text: "Answers patient questions instantly, 24/7" },
  { icon: Calendar, text: "Books appointments automatically" },
  { icon: Clock, text: "Sends confirmation & reminders" },
  { icon: Star, text: "Handles FAQs without staff intervention" },
  { icon: CheckCircle2, text: "Qualifies leads before follow-up" },
  { icon: Mic, text: "Works via chat, WhatsApp & voice" },
];

const demoMessages = [
  { from: "patient", text: "Hi, I'm interested in teeth whitening. How much does it cost?", delay: 0 },
  { from: "ai", text: "Hello! 😊 Our professional teeth whitening starts from $300. We offer two options:\n\n• In-clinic laser whitening (60 min)\n• Take-home kit (14 days)\n\nWould you like to book a free consultation?", delay: 800 },
  { from: "patient", text: "Yes, I'd like to book!", delay: 1800 },
  { from: "ai", text: "Perfect! I have availability this week:\n\n📅 Tuesday, June 23 – 3:00 PM\n📅 Wednesday, June 24 – 11:00 AM\n📅 Thursday, June 25 – 5:00 PM\n\nWhich time works best for you?", delay: 2600 },
  { from: "patient", text: "Tuesday 3pm works for me", delay: 3600 },
  { from: "ai", text: "✅ Appointment confirmed!\n\nName: Patient\nDate: Tuesday, June 23\nTime: 3:00 PM\nService: Free Whitening Consultation\n\nYou'll receive an email reminder 24 hours before. See you then! 🎉", delay: 4400 },
];

function ChatMessage({ msg, visible }: { msg: typeof demoMessages[0]; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex gap-2.5 ${msg.from === "ai" ? "justify-start" : "justify-end"}`}
    >
      {msg.from === "ai" && (
        <div className="w-7 h-7 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-[#9FD3E8]" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          msg.from === "ai"
            ? "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
            : "bg-[#00283C] text-white rounded-br-sm"
        }`}
        style={{ whiteSpace: "pre-line" }}
      >
        {msg.text}
        <div className={`text-[10px] mt-1 text-right ${msg.from === "ai" ? "text-gray-400" : "text-white/60"}`}>
          {msg.from === "ai" ? "AI Receptionist · Just now" : "Just now"}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIReceptionist() {
  const ref = useRef(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const { openForm } = useForm();

  useEffect(() => {
    if (!inView || started) return;
    setStarted(true);

    demoMessages.forEach((msg, i) => {
      setTimeout(() => {
        if (msg.from === "ai") setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(i + 1);
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, msg.from === "ai" ? 600 : 0);
      }, msg.delay);
    });
  }, [inView, started]);

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Info */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="badge-light mb-5 inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> AI RECEPTIONIST
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-4">
              Your Clinic&apos;s <span className="gradient-heading">24/7 AI Receptionist</span>
            </h2>

            <p className="text-gray-500 leading-relaxed mb-6">
              Never lose another patient to a missed call or unanswered message. Our AI receptionist handles everything — automatically, intelligently, around the clock.
            </p>

            {/* Capabilities */}
            <ul className="space-y-3 mb-8">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <li key={cap.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-6 h-6 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#0077A8]" />
                    </span>
                    {cap.text}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <button onClick={openForm} className="btn-dark px-7 py-3.5 text-sm">
                Get Your AI Receptionist
              </button>

              {/* 24/7 badge */}
              <div className="inline-flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#00283C] flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-[#9FD3E8]" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="text-[#00283C] font-bold text-sm leading-tight">24 / 7 / 365</div>
                  <div className="text-gray-400 text-xs leading-tight">Always online, never tired</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Chat demo */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-[#00283C]">
                <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#9FD3E8]" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#00283C]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Alliance AI Receptionist</div>
                  <div className="text-[11px] text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online · Avg. reply &lt;30 sec
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex flex-col gap-4 p-4 h-[340px] overflow-y-auto bg-[#F8FAFC]" style={{ scrollBehavior: "smooth" }}>
                {demoMessages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} visible={i < visibleMessages} />
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#9FD3E8]" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" style={{ animation: `at-bounce 1s ${i * 0.15}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white">
                <div className="flex-1 bg-[#F8FAFC] border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400">
                  Type a message...
                </div>
                <button className="w-9 h-9 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0 hover:bg-[#0077A8] transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Floating stats */}
            <div className="hidden sm:block absolute -right-4 top-6 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
              <div className="text-[11px] text-gray-400 mb-0.5">Response Time</div>
              <div className="text-lg font-extrabold text-green-600">28 sec</div>
            </div>
            <div className="hidden sm:block absolute -left-4 bottom-10 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
              <div className="text-[11px] text-gray-400 mb-0.5">Appointments Booked</div>
              <div className="text-lg font-extrabold text-[#0077A8]">1,247</div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes at-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
}
