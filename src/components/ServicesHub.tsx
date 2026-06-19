"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const services = [
  {
    icon: "🦷",
    title: "Dental Clinic Growth",
    desc: "Google SEO, AI receptionist, WhatsApp booking, and paid ads to fill your chairs every week.",
    href: "/dental-clinic-growth",
    color: "#0066FF",
    badge: "Most Popular",
  },
  {
    icon: "✨",
    title: "Aesthetic Clinic Growth",
    desc: "Social media, before/after campaigns, lead qualification, and booking automation for skin clinics.",
    href: "/aesthetic-clinic-growth",
    color: "#7B61FF",
    badge: null,
  },
  {
    icon: "🤖",
    title: "AI Receptionist",
    desc: "24/7 automated patient handling across calls, WhatsApp, and chat — zero staff required.",
    href: "/ai-receptionist",
    color: "#00D4FF",
    badge: null,
  },
  {
    icon: "💬",
    title: "WhatsApp AI Automation",
    desc: "Turn your clinic's WhatsApp into a fully automated booking and lead conversion machine.",
    href: "/whatsapp-ai-automation",
    color: "#25D366",
    badge: null,
  },
  {
    icon: "🏥",
    title: "EHR Platform",
    desc: "Cloud-based clinic management — patient records, appointments, billing, and reports in one place.",
    href: "/ehr-platform",
    color: "#7B61FF",
    badge: null,
  },
  {
    icon: "📍",
    title: "Local SEO for Clinics",
    desc: "Rank #1 on Google Maps and local search so patients in your area find you first.",
    href: "/local-seo-for-clinics",
    color: "#00D4FF",
    badge: null,
  },
];

export default function ServicesHub() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="relative py-20 z-10" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={ref} className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-brand-blue mb-5"
              style={{ borderColor: "rgba(0,102,255,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              EVERYTHING WE DO
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Explore Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Six specialist services — each with its own dedicated page, strategy, and results.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative glass rounded-2xl p-6 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 20%, ${s.color}08, transparent 60%)` }}
              />
              {/* Top accent */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
                >
                  {s.icon}
                </div>
                {s.badge && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                    {s.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">{s.desc}</p>

              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.color }}>
                Learn more
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Lahore CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(0,102,255,0.15)" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📍</span>
            <div>
              <p className="font-bold text-white text-sm">Based in Lahore?</p>
              <p className="text-white/50 text-xs">We have a dedicated growth strategy for Lahore dental clinics.</p>
            </div>
          </div>
          <a href="/dental-clinic-lahore"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}>
            See Lahore Page <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
