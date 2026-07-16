"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  PhoneCall, MessageCircle, ClipboardList, ArrowRight, Bot
} from "lucide-react";

const services = [
  {
    Icon: Bot,
    title: "AI Automation Suite",
    subtitle: "Your AI front desk · from $500/mo",
    desc: "The all-in-one AI front desk — answers patients on web & WhatsApp, books appointments, sends reminders, and even takes live voice calls. Never miss a patient again.",
    stat: "24/7 · never sleeps",
    href: "/ai-receptionist",
    popular: true,
  },
  {
    Icon: PhoneCall,
    title: "AI Receptionist",
    subtitle: "24/7. Never misses a call.",
    desc: "Answers every call, books appointments, handles queries — in English, round the clock.",
    stat: "0 missed calls",
    href: "/ai-receptionist",
    popular: false,
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden mb-8">
          {services.map((s, i) => (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className={`group relative flex flex-col gap-4 p-7 no-underline transition-all duration-200
                ${s.popular
                  ? "bg-[#00283C] hover:bg-[#003D5C]"
                  : "bg-white hover:bg-[#F0F7FA]"
                }`}
            >
              {/* Popular badge */}
              {s.popular && (
                <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                  MOST POPULAR
                </span>
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                s.popular ? "bg-white/15" : "bg-[#E6F4F8] group-hover:bg-[#00283C] group-hover:text-white"
              }`}>
                <s.Icon className={`w-5 h-5 ${s.popular ? "text-white" : "text-[#0077A8] group-hover:text-white"}`} strokeWidth={1.8} />
              </div>

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
                <span className={`text-xs font-bold ${s.popular ? "text-white/70" : "text-[#0077A8]"}`}>
                  {s.stat}
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${s.popular ? "text-white/60" : "text-gray-300 group-hover:text-[#0077A8]"}`} strokeWidth={2} />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00283C]/10 bg-[#F0F7FA]"
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
