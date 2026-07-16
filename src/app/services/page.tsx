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
                className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-[#00283C] text-white"
                    : "text-gray-500 hover:text-[#00283C] hover:bg-gray-50"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services list */}
      <section className="py-14 bg-white" ref={gridRef}>
        <div className="max-w-5xl mx-auto px-6 space-y-6">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        s.popular ? "border-[#00283C] shadow-lg" : "border-gray-100 shadow-sm hover:border-[#00B4D8]/40 hover:shadow-md"
      }`}
    >
      {s.popular && (
        <div className="px-6 py-2 flex items-center justify-between" style={{ background: (s as { hot?: boolean }).hot ? "linear-gradient(90deg,#F97316,#EF4444)" : "#00283C" }}>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
            {(s as { hot?: boolean }).hot ? "🔥 Hot — Flagship Service" : "Most Popular Service"}
          </span>
          <span className="text-[10px] text-white/50">Alliance Tech</span>
        </div>
      )}

      {/* Card header */}
      <div className="p-6 lg:p-8 bg-white">
        <div className="flex items-start gap-5">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            s.popular ? "bg-[#00283C]" : "bg-[#E6F4F8]"
          }`}>
            <s.Icon className={`w-6 h-6 ${s.popular ? "text-white" : "text-[#0077A8]"}`} strokeWidth={1.8} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
              <div>
                <span className="text-[10px] font-bold text-[#00B4D8] uppercase tracking-wider">{s.category}</span>
                <h2 className="text-lg lg:text-xl font-extrabold text-[#00283C] leading-tight mt-0.5">{s.title}</h2>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center hidden sm:block">
                  <div className="text-lg font-extrabold text-[#00283C]">{s.stat1.value}</div>
                  <div className="text-[10px] text-gray-400">{s.stat1.label}</div>
                </div>
                <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                <div className="text-center hidden sm:block">
                  <div className="text-lg font-extrabold text-[#00283C]">{s.stat2.value}</div>
                  <div className="text-[10px] text-gray-400">{s.stat2.label}</div>
                </div>
              </div>
            </div>

            <p className="text-[#0077A8] text-sm font-semibold mb-2 italic">{s.tagline}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a href={s.href}
                className="inline-flex items-center gap-1.5 btn-dark px-5 py-2.5 text-sm">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
              <button onClick={onAudit}
                className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C] transition-colors">
                Get a Free Audit →
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {expanded ? "Hide details" : "What&apos;s included"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
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
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What&apos;s Included</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {s.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-[#00B4D8] flex-shrink-0" strokeWidth={2} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <FormProvider>
      <ServicesContent />
    </FormProvider>
  );
}
