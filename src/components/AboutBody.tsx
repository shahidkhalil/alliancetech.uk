"use client";

import Reveal from "@/components/Motion/Reveal";
import FloatingImage from "@/components/Motion/FloatingImage";
import CountUp from "@/components/Motion/CountUp";
import FinalCTA from "@/components/FinalCTA";
import ServicePageHero from "@/components/ServicePageHero";
import { FeatureCardGrid } from "@/components/ui/Card";
import { Target, MapPin, Zap, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/animations/scroll";

const values = [
  {
    icon: <MapPin className="w-5 h-5 text-[#0077A8]" strokeWidth={2} />,
    title: "Built for the United Kingdom",
    desc: "We understand the UK healthcare market: patient behaviour, English communication, and local search patterns.",
  },
  {
    icon: <Zap className="w-5 h-5 text-[#0077A8]" strokeWidth={2} />,
    title: "Speed to Results",
    desc: "Our systems show measurable results within 30 to 60 days, not months of waiting for organic growth.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#0077A8]" strokeWidth={2} />,
    title: "Transparent & Honest",
    desc: "No vanity metrics. Clear, honest reporting on what's working, what we're testing, and what your ROI is.",
  },
];

const services = [
  { label: "AI Receptionist", href: "/ai-receptionist" },
  { label: "Clinic Websites", href: "/clinic-website-design" },
  { label: "Local SEO", href: "/local-seo-for-clinics" },
  { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
  { label: "Patient Apps", href: "/clinic-mobile-app" },
  { label: "EHR Platform", href: "/ehr-platform" },
  { label: "Free Website Audit", href: "/free-website-audit" },
];

export default function AboutBody() {
  const reduced = useReducedMotion();

  return (
    <>
      <ServicePageHero
        badge="ABOUT ALLIANCE TECH"
        headline="We Grow Clinics With"
        highlight="AI & Automation"
        subheadline="Alliance Tech is the UK's AI-powered healthcare growth agency, helping dental and aesthetic clinics attract more patients, automate operations, and scale faster."
        ctaText="Get Your Free Clinic Audit"
        ctaHref="/free-website-audit"
      />

      <section className="py-16 bg-white">
        <Reveal className="max-w-3xl mx-auto px-6 text-center">
          <FloatingImage speed={18}>
            <span className="badge-light mb-4">OUR MISSION</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mt-4 mb-6 tracking-tight">
              Why We Built Alliance Tech
            </h2>
            <p className="text-gray-500 text-base lg:text-lg leading-relaxed">
              We believe every talented doctor in the UK deserves a full appointment book. Too many great clinics struggle to attract patients, not because their care is lacking, but because they lack the digital infrastructure to compete. We built Alliance Tech to fix that.
            </p>
          </FloatingImage>
        </Reveal>
      </section>

      <section className="py-14 lg:py-20 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-10 lg:mb-12">
            <span className="badge-light mb-4">OUR PRINCIPLES</span>
            <h2 className="text-3xl font-extrabold text-[#00283C] tracking-tight mt-4">
              What We <span className="gradient-heading">Stand For</span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl bg-[#00283C] p-8 lg:p-12 mb-6 lg:mb-8 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-[420px] h-[280px] pointer-events-none opacity-30"
                style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(60px)" }}
                aria-hidden
              />
              <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 mb-5">
                    <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00B4D8]">
                      Principle 01
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3">
                    Results First
                  </h3>
                  <p className="text-white/65 text-base leading-relaxed max-w-xl">
                    Every strategy, campaign, and tool we deploy is measured against one metric:{" "}
                    <span className="text-white font-semibold">more patients for your clinic</span>.
                    Not impressions, not vanity reach.
                  </p>
                </div>
                <div className="flex lg:flex-col gap-3 lg:gap-4 lg:min-w-[200px]">
                  <div className="flex-1 rounded-2xl bg-white/[0.08] border border-white/10 px-5 py-4 text-center lg:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/45 mb-1">
                      We optimize for
                    </p>
                    <p className="text-lg font-extrabold text-white">Booked patients</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-white/[0.08] border border-white/10 px-5 py-4 text-center lg:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/45 mb-1">
                      We ignore
                    </p>
                    <p className="text-lg font-extrabold text-white/50 line-through decoration-white/30">
                      Vanity reach
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <FeatureCardGrid
            items={values}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          />
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-white">
        <Reveal className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight mb-3">
              What We Do
            </h2>
            <p className="text-gray-500 text-sm lg:text-base max-w-xl mx-auto">
              A complete growth stack for healthcare clinics across the United Kingdom.
            </p>
          </div>
          <motion.div
            className="grid sm:grid-cols-2 gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reduced ? 0 : STAGGER.tight } },
            }}
          >
            {services.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO },
                  },
                }}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] hover:bg-white hover:border-[#00B4D8]/35 hover:shadow-sm px-4 py-3.5 transition-all group"
              >
                <span className="text-sm font-semibold text-[#00283C]">{s.label}</span>
                <span aria-hidden className="text-[#0077A8] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </motion.a>
            ))}
          </motion.div>
        </Reveal>
      </section>

      <section className="py-14 bg-[#F8FAFC] border-t border-gray-100">
        <motion.div
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduced ? 0 : STAGGER.base } },
          }}
        >
          {[
            { value: 100, suffix: "+", label: "Clinics served" },
            { value: 3, suffix: "", label: "Cities served" },
            { value: 300, suffix: "%", label: "Avg. patient growth" },
            { value: 24, suffix: "/7", label: "AI systems running" },
          ].map((r, i) => (
            <motion.div
              key={r.label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
                },
              }}
              className={`text-center py-2 ${i > 0 ? "lg:border-l border-gray-200" : ""}`}
            >
              <div className="text-3xl lg:text-4xl font-extrabold text-[#00283C] mb-1 tracking-tight">
                <CountUp value={r.value} suffix={r.suffix} />
              </div>
              <div className="text-sm text-gray-400">{r.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <FinalCTA />
    </>
  );
}
