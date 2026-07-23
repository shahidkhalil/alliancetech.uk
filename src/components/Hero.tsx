"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useForm } from "@/context/FormContext";
import AnimatedGrid from "@/components/Motion/AnimatedGrid";
import FloatingParticles from "@/components/Motion/FloatingParticles";
import MagneticButton from "@/components/Motion/MagneticButton";
import CountUp from "@/components/Motion/CountUp";
import GoogleReviewsBadge from "@/components/GoogleReviewsBadge";
import { heroContainer, heroCta, heroGlowDrift, heroItem } from "@/animations/hero";

const heroSlides = [
  {
    badge: "AI Automation for UK Clinics",
    headlineBefore: "Your Front Desk Can't Answer Every Call.",
    headlineAccent: "Our AI Can.",
    sub: "A 24/7 AI receptionist that answers calls, chats, and WhatsApp, books appointments, and sends reminders — so your UK clinic never misses another patient.",
    cta: { label: "Talk to Our AI Now", href: "/ai-receptionist" },
    showChatProof: true,
  },
  {
    badge: "UK's Top Reviewed Clinic Growth Agency",
    headlineBefore: "Most UK Clinics Lose Patients to Competitors Every Day.",
    headlineAccent: "We Fix That.",
    sub: "We fix the three things costing you patients: invisible Google ranking, missed WhatsApp inquiries, and wasted ad spend. One agency, every channel.",
    cta: { label: "Free Website Audit", href: "/free-website-audit" },
  },
  {
    badge: "Websites & Local SEO That Convert",
    headlineBefore: "Patients Search Google First.",
    headlineAccent: "Make Sure They Find You.",
    sub: "Fast, mobile-first clinic websites and local SEO that put you at the top of 'dentist near me in Blackburn' — and turn searchers into booked appointments.",
    cta: { label: "Free Website Audit", href: "/free-website-audit" },
  },
  {
    badge: "Google & Meta Ads for Clinics",
    headlineBefore: "Stop Wasting Ad Spend.",
    headlineAccent: "Fill Your Calendar Instead.",
    sub: "Targeted campaigns built only for dental and aesthetic clinics in the UK — every pound tracked, every lead measured, an average 4x return on ad spend.",
    cta: { label: "Free Website Audit", href: "/free-website-audit" },
  },
];

const marqueeItems = [
  "Dental Clinics", "Aesthetic Clinics", "Blackburn", "Manchester",
  "London", "AI Receptionist", "WhatsApp AI", "Clinic Websites",
  "Patient Apps", "Local SEO", "Google Ads", "EHR Platform",
];

export default function Hero() {
  const { openForm } = useForm();
  const [slide, setSlide] = useState(0);
  const n = heroSlides.length;
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentScale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [1, 0.94]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], reducedMotion ? [1, 1] : [1, 0.55]);
  const contentY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 48]);

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % n), 5600);
    return () => clearInterval(t);
  }, [n]);

  const s = heroSlides[slide];

  return (
    <section ref={sectionRef} className="relative pt-28 pb-0 overflow-hidden bg-white">
      <AnimatedGrid opacity={0.045} />
      <FloatingParticles />

      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] h-[440px] rounded-full pointer-events-none opacity-[0.1]"
        style={{
          background: "radial-gradient(circle, #00B4D8, transparent 70%)",
          filter: "blur(80px)",
        }}
        {...(reducedMotion ? {} : heroGlowDrift)}
      />

      <motion.div
        className="relative min-h-[70vh] flex items-center will-change-transform"
        style={{ scale: contentScale, opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          key={slide}
          className="max-w-4xl mx-auto px-6 text-center py-16"
          variants={reducedMotion ? undefined : heroContainer}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.span variants={heroItem} className="badge-light inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
            {s.badge}
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00283C] tracking-tight leading-[1.1] mb-6"
          >
            {s.headlineBefore}{" "}
            <span className="gradient-heading">{s.headlineAccent}</span>
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {s.sub}
          </motion.p>

          {s.showChatProof && (
            <motion.div
              variants={heroItem}
              className="max-w-sm mx-auto mb-8 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md shadow-lg p-4 text-left space-y-2.5"
            >
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#00283C] text-white text-xs px-3.5 py-2.5">
                  Do you have an opening today?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#F8FAFC] border border-gray-100 text-gray-700 text-xs px-3.5 py-2.5">
                  Yes! 3 PM works — booked
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={heroItem} className="flex items-center justify-center mb-7">
            {heroSlides.map((_, di) => (
              <button
                key={di}
                type="button"
                onClick={() => setSlide(di)}
                aria-label={`Go to slide ${di + 1}`}
                aria-current={di === slide ? "true" : undefined}
                className="p-2.5 flex items-center justify-center group"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    di === slide ? "w-6 bg-[#0077A8]" : "w-1.5 bg-gray-300 group-hover:bg-gray-400"
                  }`}
                />
              </button>
            ))}
          </motion.div>

          <motion.div
            variants={heroCta}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton onClick={openForm} className="btn-dark px-8 py-4 text-base w-full sm:w-auto group">
              Get Your Free Clinic Audit
            </MagneticButton>
            <a
              href={s.cta.href}
              className="flex items-center gap-2 text-sm font-semibold text-[#0077A8] border border-[#0077A8]/30 px-6 py-4 rounded-md hover:bg-[#0077A8]/5 transition-colors w-full sm:w-auto justify-center"
            >
              {s.cta.label}
            </a>
          </motion.div>

          <motion.div variants={heroItem} className="mt-6 flex justify-center">
            <GoogleReviewsBadge />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="border-t border-b border-gray-100 bg-[#F8FAFC]/90 backdrop-blur-sm py-4 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`} className="inline-flex items-center mx-6 text-sm font-semibold text-gray-500">
                <span className="mr-2">{item}</span>
                <span className="text-[#00B4D8]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#00283C] py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -left-10 top-0 w-40 h-40 rounded-full bg-[#00B4D8] blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: 100, suffix: "+", label: "Clinics Served" },
            { value: 4, suffix: "x", label: "Avg. Return on Ad Spend" },
            { value: 60, suffix: " days", label: "To Measurable Results" },
            { value: 0, suffix: "", label: "Missed-Call Target With AI" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl font-extrabold text-white mb-0.5">
                <CountUp value={item.value} suffix={item.suffix} />
              </div>
              <div className="text-xs text-white/70 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
