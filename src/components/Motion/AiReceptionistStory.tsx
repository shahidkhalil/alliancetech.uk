"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Phone, Bot, Activity, CalendarCheck, LayoutDashboard } from "lucide-react";
import { AI_STORY_BEATS } from "@/animations/aiStory";
import GlassCard from "@/components/Motion/GlassCard";
import Reveal from "@/components/Motion/Reveal";

const icons = [Phone, Bot, Activity, CalendarCheck, LayoutDashboard];

const chatBeats = [
  { from: "patient" as const, text: "Hi — do you have a whitening slot this week?" },
  { from: "ai" as const, text: "Yes. Thursday 3:30pm or Friday 11:00am — which works?" },
  { from: "patient" as const, text: "Thursday please." },
  { from: "done" as const, text: "Appointment booked · calendar synced" },
];

function useStepOpacity(progress: MotionValue<number>, start: number, end: number, reduced: boolean) {
  return useTransform(progress, [start, end], reduced ? [1, 1] : [0, 1]);
}

function useStepY(progress: MotionValue<number>, start: number, end: number, reduced: boolean) {
  return useTransform(progress, [start, end], reduced ? [0, 0] : [14, 0]);
}

/** Scroll storytelling: ring → answer → waveform → book → dashboard. */
export default function AiReceptionistStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0.05, 0.35], reduced ? [0, 0] : [40, 0]);
  const phoneOpacity = useTransform(scrollYProgress, [0.05, 0.25], reduced ? [1, 1] : [0.4, 1]);
  const ringPulse = useTransform(scrollYProgress, [0.1, 0.22, 0.32], reduced ? [1, 1, 1] : [1, 1.08, 1]);
  const wave = useTransform(scrollYProgress, [0.28, 0.48], reduced ? [0.45, 0.45] : [0.2, 1]);

  const msgOpacities = [
    useStepOpacity(scrollYProgress, 0.32, 0.4, reduced),
    useStepOpacity(scrollYProgress, 0.4, 0.48, reduced),
    useStepOpacity(scrollYProgress, 0.48, 0.56, reduced),
    useStepOpacity(scrollYProgress, 0.56, 0.66, reduced),
  ];
  const msgYs = [
    useStepY(scrollYProgress, 0.32, 0.4, reduced),
    useStepY(scrollYProgress, 0.4, 0.48, reduced),
    useStepY(scrollYProgress, 0.48, 0.56, reduced),
    useStepY(scrollYProgress, 0.56, 0.66, reduced),
  ];

  const waveBars = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-[#F4F8FB] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 18% 15%, rgba(0,180,216,0.16), transparent 50%), radial-gradient(ellipse at 85% 75%, rgba(0,40,60,0.08), transparent 45%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-12">
          <span className="badge-light mb-4">LIVE STORY</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-3">
            From missed call to booked patient — in one scroll.
          </h2>
          <p className="text-gray-500 mt-3 leading-relaxed">
            Watch how Alliance Tech&apos;s AI receptionist turns after-hours enquiries into confirmed appointments for UK clinics.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div className="space-y-4">
            {AI_STORY_BEATS.map((beat, i) => {
              const Icon = icons[i] ?? Bot;
              return (
                <Reveal key={beat.id} delay={reduced ? 0 : i * 0.05}>
                  <GlassCard className="p-5 transition-shadow duration-300 hover:shadow-[0_20px_50px_-24px_rgba(0,40,60,0.28)]">
                    <div className="flex gap-4 items-start">
                      <div className="svc-icon-chip">
                        <Icon className="w-5 h-5 text-[#0077A8]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00B4D8] mb-1">
                          Step {i + 1}
                        </p>
                        <h3 className="font-extrabold text-[#00283C] mb-1">{beat.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{beat.copy}</p>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>

          <motion.div
            style={{ y: phoneY, opacity: phoneOpacity }}
            className="lg:sticky lg:top-28 will-change-transform"
          >
            <motion.div style={{ scale: ringPulse }} className="mx-auto max-w-sm rounded-[2rem] border border-[#00283C]/15 bg-[#00283C] p-4 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#031820] p-5 min-h-[440px] relative overflow-hidden">
                <div className="flex items-center justify-between text-white/60 text-xs mb-6">
                  <span>Incoming</span>
                  <span className="inline-flex items-center gap-1 text-[#7DD3EA]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7DD3EA] animate-pulse" /> AI live
                  </span>
                </div>

                <div className="text-center text-white mb-6">
                  <p className="text-sm text-white/50 mb-1">Patient</p>
                  <p className="text-xl font-bold">Incoming call</p>
                </div>

                <div className="flex items-end justify-center gap-1.5 h-14 mb-7">
                  {waveBars.map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-[#0077A8] to-[#00B4D8]"
                      style={{
                        height: 10 + (i % 5) * 5,
                        scaleY: wave,
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-3 min-h-[180px]">
                  {chatBeats.map((msg, i) => (
                    <motion.div
                      key={msg.text}
                      style={{ opacity: msgOpacities[i], y: msgYs[i] }}
                      className={
                        msg.from === "done"
                          ? "rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-3 py-2 text-xs text-emerald-100 font-semibold text-center"
                          : msg.from === "ai"
                            ? "rounded-2xl rounded-tr-sm bg-[#00B4D8]/20 border border-[#00B4D8]/30 px-3 py-2 text-xs text-white ml-6"
                            : "rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/80"
                      }
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Scroll to play the conversation
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
