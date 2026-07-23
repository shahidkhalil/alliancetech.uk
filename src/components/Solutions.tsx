"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  MessageCircle, ClipboardList, Bot
} from "lucide-react";
import { ServiceShowcaseCard } from "@/components/ui/Card";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/animations/scroll";

const services = [
  {
    Icon: Bot,
    title: "AI Receptionist",
    subtitle: "Your UK clinic's AI front desk — from £399/mo",
    desc: "One AI front desk for UK clinics — voice, WhatsApp, and web chat. Answers, books, sends reminders, and never misses a patient.",
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
    desc: "Targeted campaigns built specifically for dental and aesthetic clinics — not generic templates. Every pound tracked.",
    stat: "4x avg. ROAS",
    href: "/digital-marketing-for-clinics",
    popular: false,
  },
  {
    Icon: Globe,
    title: "Clinic Websites",
    subtitle: "Fast. Professional. Converting.",
    desc: "Built for UK clinics — mobile-first, SEO-ready, and designed to turn visitors into booked appointments.",
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
    desc: "Patient records, prescriptions, billing, and appointments — all in one screen. Built for UK clinics.",
    stat: "100% paperless",
    href: "/ehr-platform",
    popular: false,
  },
];

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      id="services"
      ref={ref}
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.08) 0%, transparent 60%), linear-gradient(180deg, #f8fcfe 0%, #ffffff 45%, #ffffff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="badge-light mb-5">WHAT WE DO</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#00283C] mt-4 mb-4 leading-tight">
            Every service your clinic needs —<br />
            <span className="gradient-heading">under one roof.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We don&apos;t do general marketing. Everything we build is designed for dental and aesthetic clinics across the United Kingdom — the right audience, the right channels, real results.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-8"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: reducedMotion ? 0 : STAGGER.base },
            },
          }}
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              className="h-full"
              variants={{
                hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
                },
              }}
            >
              <ServiceShowcaseCard
                href={s.href}
                icon={s.Icon}
                title={s.title}
                subtitle={s.subtitle}
                description={s.desc}
                stat={s.stat}
                popular={s.popular}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
          whileHover={reducedMotion ? undefined : { y: -3 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 card-cta-dark card-cta-glow"
        >
          <div className="flex items-center gap-3 relative z-[1]">
            <MapPin className="w-5 h-5 text-[#00B4D8] flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-white font-bold text-sm">Blackburn-based — serving clinics across the United Kingdom</p>
              <p className="text-white/50 text-xs mt-0.5">Blackburn · Manchester · London · Birmingham · and beyond</p>
            </div>
          </div>
          <a
            href="/clinic-marketing-blackburn"
            className="relative z-[1] flex-shrink-0 btn-dark px-5 py-2.5 text-sm whitespace-nowrap"
          >
            UK Clinics →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
