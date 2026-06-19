"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const industries = [
  {
    icon: "🦷",
    title: "Dental Clinics",
    subtitle: "Primary Focus",
    description: "General dentistry, orthodontics, implants, cosmetic dentistry, and pediatric dental practices.",
    services: ["Patient Acquisition", "Appointment Automation", "EHR & Billing", "AI Receptionist"],
    color: "#0066FF",
    featured: true,
    results: "320% avg. growth",
  },
  {
    icon: "✨",
    title: "Aesthetic Clinics",
    subtitle: "Primary Focus",
    description: "Laser clinics, skin treatments, fillers, Botox, PRP therapy, and body contouring centres.",
    services: ["Social Media Growth", "WhatsApp AI", "Lead Qualification", "Booking Automation"],
    color: "#7B61FF",
    featured: true,
    results: "280% avg. growth",
  },
  {
    icon: "💎",
    title: "Cosmetic Surgery",
    subtitle: "Premium Solutions",
    description: "Rhinoplasty, liposuction, breast augmentation, and high-ticket cosmetic procedure clinics.",
    services: ["High-Ticket Lead Gen", "Reputation Mgmt", "CRM Automation", "Video Marketing"],
    color: "#00D4FF",
    featured: false,
    results: "5x lead quality",
  },
  {
    icon: "🏥",
    title: "Healthcare Providers",
    subtitle: "Enterprise Scale",
    description: "Multi-branch hospitals, polyclinics, and general healthcare providers seeking digital growth.",
    services: ["Multi-Location SEO", "Custom EHR", "Staff Training", "Growth Analytics"],
    color: "#10B981",
    featured: false,
    results: "Multi-branch ready",
  },
];

export default function Industries() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="relative py-24 lg:py-32 z-10" id="industries">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-brand-blue mb-6" style={{ borderColor: "rgba(0,102,255,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              INDUSTRIES WE SERVE
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Built For{" "}
              <span className="gradient-text">Healthcare</span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              We specialise exclusively in healthcare — so every solution is tailored to how clinics actually work.
            </p>
          </motion.div>
        </div>

        {/* Industry cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="group relative glass rounded-3xl p-7 hover:border-white/15 transition-all duration-500 overflow-hidden card-3d"
            >
              {/* Top glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${ind.color}60, transparent)` }}
              />

              {/* Background glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 20%, ${ind.color}08, transparent 60%)` }}
              />

              {/* Featured badge */}
              {ind.featured && (
                <div
                  className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${ind.color}20`, color: ind.color, border: `1px solid ${ind.color}30` }}
                >
                  ★ Primary Focus
                </div>
              )}

              <div className="flex items-start gap-4 mb-5">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 relative"
                  style={{ background: `${ind.color}12`, border: `1px solid ${ind.color}25` }}
                >
                  {ind.icon}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${ind.color}15` }}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: ind.color }}>{ind.subtitle}</div>
                  <h3 className="text-xl font-bold text-white">{ind.title}</h3>
                </div>
              </div>

              <p className="text-sm text-white/50 leading-relaxed mb-5">{ind.description}</p>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ind.services.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      background: `${ind.color}12`,
                      color: "rgba(255,255,255,0.6)",
                      border: `1px solid ${ind.color}20`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Result metric */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-xs text-white/40">Typical Results</span>
                <span className="text-sm font-bold" style={{ color: ind.color }}>{ind.results}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-white/40 mb-6">Not sure if we work with your clinic type?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-sm font-semibold text-white hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all duration-300"
          >
            Talk to our team
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
