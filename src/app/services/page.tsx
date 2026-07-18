"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  PhoneCall, MessageCircle, ClipboardList, ArrowRight,
  CheckCircle2, ChevronDown
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import { FormProvider, useForm } from "@/context/FormContext";
import dynamic from "next/dynamic";

// Lazy: both pull in the Firebase SDK and are only needed on interaction.
const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });

const services = [
  {
    Icon: PhoneCall,
    title: "AI Automation Suite",
    slug: "ai-automation",
    href: "/ai-receptionist",
    category: "AI",
    tagline: "Your AI front desk — answers, books & follows up 24/7.",
    desc: "The all-in-one AI front desk for busy clinics. It answers patient questions on your website and WhatsApp, books appointments straight into your calendar, sends reminders to cut no-shows, and (on higher tiers) takes real-time voice calls — never missing a patient, day or night.",
    stat1: { value: "24/7", label: "Never misses a call or chat" },
    stat2: { value: "$500", label: "Starting / month" },
    includes: [
      "AI chat assistant on website + WhatsApp",
      "Books appointments into your calendar",
      "Voice notes & live real-time voice agent",
      "Automated confirmations & reminders",
      "Urgency triage alerts to your staff",
      "Trained on your services, prices & hours",
    ],
    popular: true,
    hot: true,
  },
  {
    Icon: Megaphone,
    title: "Digital Marketing for Clinics",
    slug: "digital-marketing",
    href: "/digital-marketing-for-clinics",
    category: "Growth",
    tagline: "More patients. Every month.",
    desc: "We run Google Ads, Meta campaigns, and reputation strategies built exclusively for dental and aesthetic clinics across the United States. No generic templates — every campaign is tailored to your clinic type, location, and patient target.",
    stat1: { value: "4x", label: "Avg. return on ad spend" },
    stat2: { value: "30 days", label: "To first patient results" },
    includes: [
      "Google Search & Display Ads",
      "Facebook & Instagram Ads",
      "Audience targeting by city & treatment",
      "Ad creative & copywriting",
      "Weekly performance reports",
      "Monthly strategy review calls",
    ],
    popular: false,
  },
  {
    Icon: Globe,
    title: "Websites for Dental & Aesthetic Clinics",
    slug: "clinic-websites",
    href: "/clinic-website-design",
    category: "Web",
    tagline: "Live in 7 days. Converts from day one.",
    desc: "A clinic website built for conversions — not just looks. Mobile-first, fast-loading, with SEO structure baked in from the start. Patients land, trust, and book without picking up the phone.",
    stat1: { value: "7 days", label: "From brief to live" },
    stat2: { value: "3x", label: "More enquiries vs old site" },
    includes: [
      "Custom design — no templates",
      "Mobile-first & fast-loading",
      "SEO-optimised from day one",
      "Online booking integration",
      "Google Analytics setup",
      "12 months hosting included",
    ],
    popular: false,
  },
  {
    Icon: Smartphone,
    title: "Mobile App for Dental Clinics",
    slug: "patient-app",
    href: "/clinic-mobile-app",
    category: "App",
    tagline: "Your brand on every patient's phone.",
    desc: "A fully branded iOS and Android app for your clinic. Patients book appointments, view their records, receive aftercare reminders, and make payments — all with your clinic's logo and colours.",
    stat1: { value: "iOS + Android", label: "Both platforms" },
    stat2: { value: "60%", label: "Fewer no-shows" },
    includes: [
      "Custom-branded iOS & Android app",
      "Appointment booking & management",
      "Digital patient records access",
      "Push notification reminders",
      "Payment integration (Stripe, Apple Pay)",
      "Staff admin dashboard",
    ],
    popular: false,
  },
  {
    Icon: MapPin,
    title: "Local SEO for Clinics",
    slug: "local-seo",
    href: "/local-seo-for-clinics",
    category: "SEO",
    tagline: "Rank #1 on Google Maps in your area.",
    desc: "When a patient searches 'dentist near me' or 'skin clinic in Houston', your clinic should be the first result they see. We optimise your Google Business Profile, build local citations, and generate a stream of 5-star reviews.",
    stat1: { value: "#1", label: "Google Maps ranking" },
    stat2: { value: "60 days", label: "To top 3 results" },
    includes: [
      "Google Business Profile optimisation",
      "Google Maps ranking strategy",
      "Local keyword targeting",
      "Citation building across directories",
      "Review generation system",
      "Monthly local SEO report",
    ],
    popular: false,
  },
  {
    Icon: Search,
    title: "SEO for Dental & Aesthetic Clinics",
    slug: "seo",
    href: "/seo-for-clinics",
    category: "SEO",
    tagline: "Page 1 for the treatments patients search.",
    desc: "Long-term organic search rankings for the treatment keywords your patients type into Google — dental implants, teeth whitening, botox, laser hair removal. SEO that builds value month on month.",
    stat1: { value: "100%", label: "Organic — no ad spend" },
    stat2: { value: "6 months", label: "To consistent page 1" },
    includes: [
      "Keyword research & strategy",
      "On-page SEO optimisation",
      "Treatment landing pages",
      "Technical SEO audit & fixes",
      "Monthly backlink building",
      "Ranking progress reports",
    ],
    popular: false,
  },
  {
    Icon: PhoneCall,
    title: "AI Receptionist",
    slug: "ai-receptionist",
    href: "/ai-receptionist",
    category: "AI",
    tagline: "24/7. Never misses a call. Never gets tired.",
    desc: "An AI that answers every incoming call to your clinic, in English. It qualifies the patient, answers their questions, and books them directly into your calendar — whether it's 2pm or 2am.",
    stat1: { value: "0", label: "Missed calls" },
    stat2: { value: "24/7", label: "Always on" },
    includes: [
      "English call handling",
      "Live appointment booking",
      "Patient qualification flow",
      "After-hours coverage",
      "Call summary reports",
      "Integrates with your calendar",
    ],
    popular: false,
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp AI Automation",
    slug: "whatsapp-ai",
    href: "/whatsapp-ai-automation",
    category: "AI",
    tagline: "Replies in 5 seconds. Books in 2 minutes.",
    desc: "American patients prefer WhatsApp over phone calls. Our AI handles every incoming WhatsApp message — replying naturally in English, answering questions, and converting inquiries into booked appointments automatically.",
    stat1: { value: "< 5 sec", label: "Reply time" },
    stat2: { value: "3x", label: "More WhatsApp bookings" },
    includes: [
      "Natural English replies",
      "Automated appointment booking",
      "Pricing & FAQ handling",
      "Appointment confirmation & reminders",
      "No-show recovery messages",
      "Inquiry analytics dashboard",
    ],
    popular: false,
  },
  {
    Icon: ClipboardList,
    title: "EHR — Electronic Health Records",
    slug: "ehr",
    href: "/ehr-platform",
    category: "Platform",
    tagline: "Replace your paper register today.",
    desc: "A complete digital clinic management system built for American dental and aesthetic clinics. Patient records, digital prescriptions, appointment management, billing, and a patient app — all in one place.",
    stat1: { value: "100%", label: "Paperless" },
    stat2: { value: "2 min", label: "Avg. prescription time" },
    includes: [
      "Digital patient records",
      "Appointment calendar",
      "Digital prescriptions",
      "Billing & invoice management",
      "Patient mobile app",
      "Staff management & access levels",
    ],
    popular: false,
  },
];

const categories = ["All", "Growth", "Web", "App", "SEO", "AI", "Platform"];

const categoryColors: Record<string, { from: string; to: string; text: string }> = {
  AI: { from: "#7B61FF", to: "#00D4FF", text: "#7B61FF" },
  Growth: { from: "#F97316", to: "#EF4444", text: "#EA580C" },
  Web: { from: "#00B4D8", to: "#0077A8", text: "#0077A8" },
  App: { from: "#EC4899", to: "#F472B6", text: "#DB2777" },
  SEO: { from: "#16A34A", to: "#00B4D8", text: "#16A34A" },
  Platform: { from: "#6366F1", to: "#7B61FF", text: "#4F46E5" },
};

function ServicesContent() {
  const { isOpen, openForm, closeForm } = useForm();
  const [activeCategory, setActiveCategory] = useState("All");
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  const filtered = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <ConsultationForm isOpen={isOpen} onClose={closeForm} />
      <AuditChatWidget />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-100 relative overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(0,40,60,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full pointer-events-none opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }} />

        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            <span className="badge-light mb-5">OUR SERVICES</span>
            <div className="grid lg:grid-cols-2 gap-10 items-end mt-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-tight mb-5">
                  Everything your clinic needs to grow —<br />
                  <span className="gradient-heading">in one agency.</span>
                </h1>
                <p className="text-gray-500 leading-relaxed text-base mb-6">
                  We don&apos;t do general marketing. Every service we offer is built specifically for dental and aesthetic clinics across the United States — the right strategy, the right channels, measurable results.
                </p>
                <button onClick={openForm} className="btn-dark px-7 py-3.5 text-sm">
                  Get a Free Clinic Audit
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "8", label: "Specialist Services" },
                  { value: "100+", label: "Clinics Served" },
                  { value: "4.9★", label: "Average Rating" },
                  { value: "60 days", label: "To First Results" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-5 text-center">
                    <div className="text-2xl font-extrabold text-[#00283C]">{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  activeCategory === cat ? "text-white" : "text-gray-500 hover:text-[#00283C] hover:bg-gray-50"
                }`}>
                {activeCategory === cat && (
                  <motion.span
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-md bg-[#00283C]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services list */}
      <section className="py-14 bg-white" ref={gridRef}>
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 gap-6 items-start">
          <AnimatePresence mode="wait">
            {filtered.map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} inView={gridInView} onAudit={openForm} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </div>
  );
}

function ServiceCard({
  service: s,
  index,
  inView,
  onAudit,
}: {
  service: typeof services[0];
  index: number;
  inView: boolean;
  onAudit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = categoryColors[s.category] ?? categoryColors.Platform;
  const isHot = (s as { hot?: boolean }).hot;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className={`group relative rounded-2xl overflow-hidden bg-white transition-shadow duration-300 ${
        s.popular ? "shadow-xl" : "border border-gray-100 shadow-sm hover:shadow-xl"
      }`}
      style={!s.popular ? { borderTop: `3px solid ${c.from}` } : undefined}
    >
      {s.popular && (
        <div className="px-6 py-2.5 flex items-center justify-between" style={{ background: isHot ? "linear-gradient(90deg,#F97316,#EF4444)" : `linear-gradient(90deg, ${c.from}, ${c.to})` }}>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
            <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              {isHot ? "🔥" : "⭐"}
            </motion.span>
            {isHot ? "Hot — Flagship Service" : "Most Popular Service"}
          </span>
          <span className="text-[10px] text-white/70">Alliance Tech</span>
        </div>
      )}

      {/* Card header */}
      <div className="p-6 lg:p-8 bg-white">
        <div className="flex items-start gap-5">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            <s.Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
          </motion.div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.text }}>{s.category}</span>
            <h2 className="text-lg lg:text-xl font-extrabold text-[#00283C] leading-tight mt-0.5 mb-2">{s.title}</h2>

            {/* Stat pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${c.from}14`, color: c.text }}>
                {s.stat1.value} <span className="font-medium opacity-70">· {s.stat1.label}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${c.to}14`, color: c.text }}>
                {s.stat2.value} <span className="font-medium opacity-70">· {s.stat2.label}</span>
              </span>
            </div>

            <p className="text-[#0077A8] text-sm font-semibold mb-2 italic">{s.tagline}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a href={s.href}
                className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                Learn More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <button onClick={onAudit}
                className="text-sm font-semibold text-gray-500 hover:text-[#00283C] transition-colors">
                Get a Free Audit →
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-auto flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                {expanded ? "Hide details" : "What's included"}
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable includes */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What&apos;s Included</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {s.includes.map((item, ii) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ii * 0.04 }}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: c.text }} strokeWidth={2} />
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (!s.popular) return card;

  return (
    <div
      className="sm:col-span-2 rounded-[20px] p-[2px]"
      style={{ background: isHot ? "linear-gradient(135deg,#F97316,#EF4444)" : `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      {card}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <FormProvider>
      <ServicesContent />
    </FormProvider>
  );
}
