"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const comparisons = [
  {
    aspect: "Specialization",
    them: "Generic marketing agency",
    us: "100% healthcare clinics only",
    detail: "Our systems, AI training, and keyword databases are built exclusively for dental and aesthetic clinics.",
  },
  {
    aspect: "Results Timing",
    them: "\"3–6 months to see anything\"",
    us: "Visible impact in 30 days",
    detail: "Our AI tools go live in week 1. SEO improvements are measurable by week 4. Full growth by month 3.",
  },
  {
    aspect: "Communication",
    them: "Monthly report PDF, if you're lucky",
    us: "Real-time dashboard + WhatsApp updates",
    detail: "You see every lead captured, every booking made, every dollar spent on ads — in real time.",
  },
  {
    aspect: "Technology",
    them: "Scheduled posts and basic SEO",
    us: "AI agents + automation stack",
    detail: "We deploy AI receptionists, WhatsApp bots, and lead nurturing sequences — not just content calendars.",
  },
  {
    aspect: "Risk",
    them: "Upfront fees, no guarantee",
    us: "90-day results guarantee",
    detail: "If you don't see measurable growth in 90 days, we continue working for free until you do.",
  },
  {
    aspect: "Language",
    them: "English-only content & responses",
    us: "English + English — how patients actually talk",
    detail: "Our AI agents and content strategies are bilingual, matching how American patients actually communicate.",
  },
];

const whyNumbers = [
  { stat: "100%", label: "Healthcare focus — zero generalist clients" },
  { stat: "6+", label: "Years building in the the United States market" },
  { stat: "3", label: "Cities with local market knowledge" },
  { stat: "0", label: "Clients who left due to poor results" },
];

export default function WhyUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="relative py-24 lg:py-32 z-10" id="why-us">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={ref} className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-brand-cyan mb-5"
              style={{ borderColor: "rgba(0,212,255,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
              WHY ALLIANCE TECH
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Not Just Another <span className="gradient-text">Marketing Agency</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Here&apos;s exactly how we&apos;re different from every other agency you&apos;ve spoken to.
            </p>
          </motion.div>
        </div>

        {/* Comparison table */}
        <div className="space-y-3 mb-14">
          {/* Header row */}
          <div className="grid grid-cols-3 gap-3 text-xs font-bold uppercase tracking-wider px-5">
            <div className="text-white/60">What you&apos;re comparing</div>
            <div className="text-red-400/70 text-center">Other agencies</div>
            <div className="text-brand-cyan text-center">Alliance Tech</div>
          </div>

          {comparisons.map((c, i) => (
            <motion.div
              key={c.aspect}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-3 items-center p-5">
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{c.aspect}</p>
                  <p className="text-xs text-white/60 leading-relaxed hidden sm:block">{c.detail}</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-center text-sm text-red-400/70 leading-snug">{c.them}</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-center text-sm font-semibold text-white leading-snug flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0" />
                    {c.us}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {whyNumbers.map((w) => (
            <div key={w.label} className="glass rounded-2xl p-5 text-center"
              style={{ borderColor: "rgba(0,212,255,0.1)" }}>
              <div className="text-4xl font-extrabold text-brand-cyan mb-2">{w.stat}</div>
              <div className="text-xs text-white/60 leading-relaxed">{w.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
