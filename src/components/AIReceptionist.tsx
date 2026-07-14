"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Bot, Clock, CheckCircle2, MessageSquare, Calendar, Star, Mic } from "lucide-react";

const capabilities = [
  { icon: MessageSquare, text: "Answers patient questions instantly, 24/7", color: "#0066FF" },
  { icon: Calendar, text: "Books appointments automatically", color: "#00D4FF" },
  { icon: Clock, text: "Sends confirmation & reminders", color: "#7B61FF" },
  { icon: Star, text: "Handles FAQs without staff intervention", color: "#0066FF" },
  { icon: CheckCircle2, text: "Qualifies leads before follow-up", color: "#00D4FF" },
  { icon: Mic, text: "Works via chat, WhatsApp & voice", color: "#7B61FF" },
];

const demoMessages = [
  { from: "patient", text: "Hi, I'm interested in teeth whitening. How much does it cost?", delay: 0 },
  { from: "ai", text: "Hello! 😊 Our professional teeth whitening starts from $300. We offer two options:\n\n• In-clinic laser whitening (60 min)\n• Take-home kit (14 days)\n\nWould you like to book a free consultation?", delay: 800 },
  { from: "patient", text: "Yes, I'd like to book!", delay: 1800 },
  { from: "ai", text: "Perfect! I have availability this week:\n\n📅 Tuesday, June 23 – 3:00 PM\n📅 Wednesday, June 24 – 11:00 AM\n📅 Thursday, June 25 – 5:00 PM\n\nWhich time works best for you?", delay: 2600 },
  { from: "patient", text: "Tuesday 3pm works for me", delay: 3600 },
  { from: "ai", text: "✅ Appointment confirmed!\n\nName: Patient\nDate: Tuesday, June 23\nTime: 3:00 PM\nService: Free Whitening Consultation\n\nYou'll receive a WhatsApp reminder 24 hours before. See you then! 🎉", delay: 4400 },
];

function ChatMessage({ msg, visible }: { msg: typeof demoMessages[0]; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex ${msg.from === "ai" ? "justify-start" : "justify-end"}`}
    >
      {msg.from === "ai" && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          msg.from === "ai"
            ? "whatsapp-msg-in text-white/85"
            : "whatsapp-msg-out text-white"
        }`}
        style={{ whiteSpace: "pre-line" }}
      >
        {msg.text}
        <div className="text-[10px] text-white/30 mt-1 text-right">
          {msg.from === "ai" ? "AI Receptionist • Just now" : "Just now"}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIReceptionist() {
  const ref = useRef(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);

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
    <section className="relative py-24 lg:py-32 z-10" id="ai-receptionist">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-brand-cyan border-brand-cyan/20 mb-6">
                <Bot className="w-3.5 h-3.5" />
                AI RECEPTIONIST
              </span>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                Your Clinic&apos;s{" "}
                <span className="gradient-text">24/7 AI</span>{" "}
                Receptionist
              </h2>

              <p className="text-lg text-white/50 mb-8 leading-relaxed">
                Never lose another patient to a missed call or unanswered message.
                Our AI Receptionist handles everything — automatically, intelligently, around the clock.
              </p>

              {/* Capabilities */}
              <div className="space-y-3 mb-8">
                {capabilities.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <motion.div
                      key={cap.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cap.color}15`, border: `1px solid ${cap.color}25` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cap.color }} />
                      </div>
                      <span className="text-sm text-white/70">{cap.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* 24/7 badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center gap-4 glass rounded-2xl px-5 py-4 border-brand-blue/20"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-navy-900 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">24 / 7 / 365</div>
                  <div className="text-white/50 text-sm">Always online, never tired</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Chat demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-8 bg-brand-blue/5 blur-3xl rounded-full pointer-events-none" />

            {/* Chat window */}
            <div className="relative glass rounded-3xl overflow-hidden border-white/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]"
                style={{ background: "linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,212,255,0.08))" }}>
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-navy-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Alliance AI Receptionist</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online • Avg. reply: &lt;30 seconds
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {["#FF5F56","#FFBD2E","#27C93F"].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatRef}
                className="flex flex-col gap-4 p-5 h-[380px] overflow-y-auto"
                style={{ scrollBehavior: "smooth" }}
              >
                {demoMessages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} visible={i < visibleMessages} />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="whatsapp-msg-in px-4 py-3 rounded-2xl flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-brand-cyan"
                          style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.06]">
                <div className="flex-1 glass rounded-full px-4 py-2.5 text-sm text-white/30">
                  Type a message...
                </div>
                <button
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -right-4 top-8 glass rounded-2xl px-4 py-3 border-green-500/20 shadow-xl">
              <div className="text-xs text-white/50 mb-0.5">Response Time</div>
              <div className="text-xl font-bold text-green-400">28 sec</div>
            </div>
            <div className="absolute -left-4 bottom-12 glass rounded-2xl px-4 py-3 border-brand-blue/20 shadow-xl">
              <div className="text-xs text-white/50 mb-0.5">Appointments Booked</div>
              <div className="text-xl font-bold gradient-text-blue">1,247</div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
}
