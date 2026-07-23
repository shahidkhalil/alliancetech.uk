"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, PhoneCall, CalendarCheck } from "lucide-react";
import Reveal from "@/components/Motion/Reveal";
import CountUp from "@/components/Motion/CountUp";

/**
 * Portfolio / growth scroll scene: search → Maps rank → calls → bookings.
 * Transform/opacity only for performance.
 */
export default function CaseStudyScroll() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const screenY = useTransform(scrollYProgress, [0.15, 0.55], reduced ? [0, 0] : [48, 0]);
  const screenScale = useTransform(scrollYProgress, [0.1, 0.4], reduced ? [1, 1] : [0.94, 1]);
  const lid = useTransform(scrollYProgress, [0.05, 0.28], reduced ? [0, 0] : [-28, 0]);
  const pinScale = useTransform(scrollYProgress, [0.35, 0.55], reduced ? [1, 1] : [0.6, 1]);
  const metricOpacity = useTransform(scrollYProgress, [0.5, 0.7], reduced ? [1, 1] : [0, 1]);

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-[#F4F8FB] overflow-hidden border-b border-gray-100">
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(0,180,216,0.14), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,40,60,0.08), transparent 45%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="badge-light mb-4">SCROLL STORY</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-3 mb-4">
            From invisible to booked — watch the growth system work.
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Scroll to see how clinic websites, Maps ranking, and AI reception convert searchers into appointments.
          </p>
          <ul className="space-y-4">
            {[
              { Icon: Search, t: "Patient searches locally" },
              { Icon: MapPin, t: "Your clinic ranks in the Maps pack" },
              { Icon: PhoneCall, t: "AI answers the enquiry instantly" },
              { Icon: CalendarCheck, t: "Appointment lands on the calendar" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-sm font-semibold text-[#00283C]">
                <span className="svc-icon-chip w-10 h-10">
                  <Icon className="w-4 h-4 text-[#0077A8]" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <motion.div style={{ y: screenY, scale: screenScale }} className="will-change-transform">
          <div className="mx-auto max-w-md">
            <motion.div
              style={{ rotateX: lid }}
              className="origin-bottom rounded-t-xl bg-[#1a2332] h-3 mx-8 mb-[-2px] shadow-lg"
            />
            <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EEF2F6] border-b border-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[10px] text-gray-400 truncate">alliancetechltd.com/clinic</span>
              </div>
              <div className="p-5 bg-gradient-to-b from-[#F8FCFE] to-white min-h-[280px]">
                <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 text-sm text-gray-500 mb-5 shadow-sm">
                  <Search className="w-4 h-4 text-[#00B4D8]" />
                  dentist near me · Blackburn
                </div>
                <div className="relative rounded-xl bg-[#E8F4F8] h-36 mb-5 overflow-hidden border border-[#00B4D8]/15">
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: "linear-gradient(#00B4D8 1px, transparent 1px), linear-gradient(90deg, #00B4D8 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }} />
                  <motion.div style={{ scale: pinScale }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 rounded-full bg-[#00283C] text-white flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-[#7DD3EA]" />
                    </div>
                    <p className="text-[10px] font-bold text-center mt-1 text-[#00283C]">#1</p>
                  </motion.div>
                </div>
                <motion.div style={{ opacity: metricOpacity }} className="grid grid-cols-3 gap-2">
                  {[
                    { v: 4, s: "x", l: "ROAS" },
                    { v: 0, s: "", l: "Missed calls" },
                    { v: 60, s: "%", l: "Fewer no-shows" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-lg bg-[#00283C] text-white p-2.5 text-center">
                      <div className="text-lg font-extrabold text-[#7DD3EA]">
                        <CountUp value={m.v} suffix={m.s} />
                      </div>
                      <div className="text-[9px] text-white/60">{m.l}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Scroll to animate the case study</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
