"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  MessageCircle, ClipboardList, ArrowRight, Bot
} from "lucide-react";
import { AnimatedLinkCard } from "@/components/ui/Card";
import { staggerDelay } from "@/lib/motionVariants";

const services = [
  {
    Icon: Bot,
    title: "AI Receptionist",
    subtitle: "Your Houston clinic's AI front desk · from $500/mo",
    desc: "One AI front desk for Houston clinics — voice, WhatsApp, and web chat. Answers, books, sends reminders, and never misses a patient.",
    stat: "0 missed calls, 24/7",
    href: "/ai-receptionist",
    popular: true,
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp AI Automation",
    subtitle: "Replies in under 5 seconds",
    desc: "Patients message on WhatsApp — the AI replies instantly, qualifies them, and books the appointment automatically.",
    stat: "3x more bookings",
    href: "/whatsapp-ai-automation",
    popular: false,
  },
  {
    Icon: Megaphone,
    title: "Digital Marketing",
    subtitle: "Google & Meta Ads",
    desc: "Targeted campaigns built specifically for dental and aesthetic clinics — not generic templates. Every dollar tracked.",
    stat: "4x avg. ROAS",
    href: "/digital-marketing-for-clinics",
    popular: false,
  },
  {
    Icon: Globe,
    title: "Clinic Websites",
    subtitle: "Fast. Professional. Converting.",
    desc: "Built for American clinics — mobile-first, SEO-ready, and designed to turn visitors into booked appointments.",
    stat: "Live in 7 days",
    href: "/clinic-website-design",
    popular: false,
  },
  {
    Icon: Search,
    title: "SEO for Clinics",
    subtitle: "Long-term organic growth",
    desc: "Rank on page 1 for high-intent treatment searches. Dental implants, whitening, fillers — the terms that convert.",
    stat: "100% organic",
    href: "/seo-for-clinics",
    popular: false,
  },
  {
    Icon: MapPin,
    title: "Local SEO",
    subtitle: "Dominate Google Maps",
    desc: "When a patient searches 'dentist near me' in your city — your clinic appears first. We make that happen.",
    stat: "#1 in 60 days",
    href: "/local-seo-for-clinics",
    popular: false,
  },
  {
    Icon: Smartphone,
    title: "Patient Mobile App",
    subtitle: "Your brand on every phone",
    desc: "Branded iOS & Android app. Patients book, view records, get reminders, and pay — with your clinic's logo.",
    stat: "Branded & custom",
    href: "/clinic-mobile-app",
    popular: false,
  },
  {
    Icon: ClipboardList,
    title: "EHR Platform",
    subtitle: "Go fully paperless",
    desc: "Patient records, prescriptions, billing, and appointments — all in one screen. Built for US clinics.",
    stat: "100% paperless",
    href: "/ehr-platform",
    popular: false,
  },
];

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 lg:py-24 bg-white" id="services" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="badge-light mb-5">WHAT WE DO</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#00283C] mt-4 mb-4 leading-tight">
            Every service your clinic needs —<br />
            <span className="gradient-heading">under one roof.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We don&apos;t do general marketing. Everything we build is designed for dental and aesthetic clinics across the United States — the right audience, the right channels, real results.
          </p>
        </motion.div>

        {/* Service grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-8">
          {services.map((s, i) => (
            <AnimatedLinkCard
              key={s.title}
              href={s.href}
              delay={staggerDelay(i)}
              dark={s.popular}
              className="gap-4 p-7"
            >
              {/* Popular badge */}
              {s.popular && (
                <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                  MOST POPULAR
                </span>
              )}

              {/* Icon */}
              <motion.div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  s.popular
                    ? "bg-white/15 ring-1 ring-white/20"
                    : "bg-gradient-to-br from-[#E6F4F8] to-[#F0FAFC] border border-[#00B4D8]/15 group-hover:from-[#00283C] group-hover:to-[#003D5C] group-hover:border-transparent group-hover:shadow-lg"
                }`}
                whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
              >
                <s.Icon className={`w-5 h-5 ${s.popular ? "text-white" : "text-[#0077A8] group-hover:text-white transition-colors duration-300"}`} strokeWidth={1.8} />
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${s.popular ? "text-white/60" : "text-[#00B4D8]"}`}>
                  {s.subtitle}
                </p>
                <h3 className={`text-base font-bold mb-2 leading-snug ${s.popular ? "text-white" : "text-[#00283C]"}`}>
                  {s.title}
                </h3>
                <p className={`text-xs leading-relaxed ${s.popular ? "text-white/65" : "text-gray-500"}`}>
                  {s.desc}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-opacity-20"
                style={{ borderColor: s.popular ? "rgba(255,255,255,0.15)" : "#E2EBF0" }}>
                <motion.span
                  className={`text-xs font-bold ${s.popular ? "text-white/70" : "text-[#0077A8]"}`}
                  initial={false}
                  whileHover={{ x: 2 }}
                >
                  {s.stat}
                </motion.span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5 ${s.popular ? "text-white/60" : "text-gray-300 group-hover:text-[#0077A8]"}`} strokeWidth={2} />
              </div>
            </AnimatedLinkCard>
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 26 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00283C]/10 bg-[#F0F7FA] card-feature"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#00B4D8] flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-[#00283C] font-bold text-sm">Houston-based — serving clinics across the United States</p>
              <p className="text-gray-400 text-xs mt-0.5">Houston · Los Angeles · Chicago · Dallas · and beyond</p>
            </div>
          </div>
          <a href="/dental-clinic-houston" className="flex-shrink-0 btn-dark px-5 py-2.5 text-sm whitespace-nowrap">
            Houston Clinics →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
