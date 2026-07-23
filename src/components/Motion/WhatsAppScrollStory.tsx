"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/Motion/Reveal";

const msgs = [
  { from: "patient" as const, text: "Hi, do you have Botox availability this week?" },
  { from: "ai" as const, text: "Yes — Thu 4pm or Fri 11am. Which suits you?" },
  { from: "patient" as const, text: "Thursday 4pm please. Name is Sara." },
  { from: "ai" as const, text: "Booked Thu 4:00pm. Confirmation sent on WhatsApp." },
];

/** WhatsApp conversation that reveals on scroll. */
export default function WhatsAppScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0.1, 0.4], reduced ? [0, 0] : [36, 0]);

  return (
    <section ref={ref} className="relative py-16 lg:py-24 bg-[#F0FDF4] overflow-hidden border-y border-emerald-100">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <span className="badge-light mb-4">WHATSAPP STORY</span>
          <h2 className="text-3xl font-extrabold text-[#00283C] tracking-tight mt-3 mb-3">
            Patients message. AI books. You treat.
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Scroll to watch a real WhatsApp booking flow — reply in seconds, qualify, confirm, remind.
          </p>
        </Reveal>

        <motion.div style={{ y: phoneY }} className="mx-auto w-full max-w-[320px] will-change-transform">
          <div className="rounded-[2rem] border-[6px] border-[#111] bg-[#111] p-2 shadow-2xl">
            <div className="rounded-[1.5rem] overflow-hidden bg-[#ECE5DD] min-h-[420px]">
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-bold leading-tight">Alliance Clinic AI</p>
                  <p className="text-[10px] text-white/70">online</p>
                </div>
              </div>
              <div className="p-3 space-y-2.5">
                {msgs.map((m, i) => {
                  const start = 0.25 + i * 0.1;
                  const end = start + 0.08;
                  return (
                    <ScrollMsg key={m.text} progress={scrollYProgress} start={start} end={end} reduced={reduced} from={m.from} text={m.text} />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScrollMsg({
  progress,
  start,
  end,
  reduced,
  from,
  text,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  reduced: boolean;
  from: "patient" | "ai";
  text: string;
}) {
  const opacity = useTransform(progress, [start, end], reduced ? [1, 1] : [0, 1]);
  const y = useTransform(progress, [start, end], reduced ? [0, 0] : [12, 0]);
  const isAi = from === "ai";

  return (
    <motion.div
      style={{ opacity, y }}
      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
        isAi
          ? "bg-white text-gray-800 rounded-tl-sm"
          : "bg-[#DCF8C6] text-gray-800 ml-auto rounded-tr-sm"
      }`}
    >
      {text}
    </motion.div>
  );
}
