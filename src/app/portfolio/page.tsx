"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext } from "react";
import { ArrowUpRight, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import CaseStudyScroll from "@/components/Motion/CaseStudyScroll";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

// Shared lightbox: any gallery image opens a full-screen viewer.
const LightboxContext = createContext<(images: string[], index: number) => void>(() => {});

function BrowserFrame({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EEF2F6] border-b border-gray-200">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
      </div>
      <div className="overflow-hidden bg-white aspect-[16/10]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
      </div>
    </button>
  );
}

function ScreenshotGallery({ images, client, accent }: { images: string[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>The Full Build</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{images.length} screens · tap to enlarge</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <BrowserFrame key={src} src={src} alt={`${client} website screen ${i + 1}`} onClick={() => openLightbox(images, i)} />
        ))}
      </div>
    </div>
  );
}

interface ChatShot {
  src: string;
  caption: string;
}

function ChatWidgetFrame({ src, caption, alt, accent, onClick }: { src: string; caption: string; alt: string; accent: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col text-left">
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow ring-1 ring-black/[0.02]">
        <div className="overflow-hidden bg-white aspect-[1082/1174]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
        <p className="text-xs text-gray-500 leading-snug">{caption}</p>
      </div>
    </button>
  );
}

function ChatWidgetGallery({ shots, client, accent }: { shots: ChatShot[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  const images = shots.map((s) => s.src);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>The AI Agent In Action</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{shots.length} screens · tap to enlarge</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shots.map((s, i) => (
          <ChatWidgetFrame
            key={s.src}
            src={s.src}
            caption={s.caption}
            alt={`${client} — ${s.caption}`}
            accent={accent}
            onClick={() => openLightbox(images, i)}
          />
        ))}
      </div>
    </div>
  );
}

type ProjectType = "Website" | "AI Automation";

interface CaseStudy {
  client: string;
  type: ProjectType;
  category: string;
  tagline: string;
  liveUrl?: string;
  liveLabel?: string;
  afterImage?: string;
  heroWide?: boolean;
  beforeImage?: string;
  gallery?: string[];
  chatGallery?: ChatShot[];
  services: string[];
  challenge: string;
  built: string;
  result: string;
  features: string[];
  metrics: { value: string; label: string }[];
  accent: string;
}

const caseStudies: CaseStudy[] = [
  {
    client: "Dr. Syeda Nida Batool",
    type: "Website",
    category: "Clinical Psychologist — Website Redesign & Booking Platform",
    tagline: "A complete rebuild of a clinical psychologist's website — transforming a basic profile page into a credibility-first platform that turns visitors into booked appointments.",
    afterImage: "/case-studies/dr-nida-after.jpg",
    beforeImage: "/case-studies/dr-nida-before.jpg",
    gallery: [
      "/case-studies/dr-nida-1.jpg",
      "/case-studies/dr-nida-2.jpg",
      "/case-studies/dr-nida-3.jpg",
      "/case-studies/dr-nida-4.jpg",
      "/case-studies/dr-nida-5.jpg",
      "/case-studies/dr-nida-6.jpg",
    ],
    services: ["Website Redesign", "Online Booking System", "WhatsApp Integration", "Blog CMS", "SEO Setup"],
    challenge:
      "Dr. Nida is one of the most credentialed clinical psychologists in her field — PhD, 15+ years of practice, internationally certified in NLP and Timeline Therapy. Her original website, however, was a basic single-page profile: it stated who she was but did little to build trust or drive action. There was no real way to verify her credentials, explore her services, or book a session without picking up the phone. Her online presence didn't match the calibre of her expertise.",
    built:
      "We rebuilt the site from the ground up into a modern, conversion-focused platform. The centerpiece is a smooth multi-step booking flow that lets clients pick a service, choose a date and time, and confirm — with details delivered straight to WhatsApp. We added a self-serve blog dashboard so she can publish articles herself, a verified certifications gallery to build instant trust, and a clean services section covering everything from CBT to corporate coaching.",
    result:
      "The redesign gave Dr. Nida a website that finally matches her reputation. Where the old site simply introduced her, the new one does the selling — visitors can verify her qualifications, read her writing, and book a session in under a minute without a single phone call. It positions her exactly where her expertise belongs: as a premier, internationally certified practitioner.",
    features: [
      "Multi-step appointment booking (service → date & time → confirm)",
      "Bookings delivered instantly to WhatsApp",
      "Self-managed blog with Firebase-powered dashboard",
      "Verified certifications & credentials gallery",
      "Trust-building hero with live credential badges",
      "Fully responsive, fast, SEO-ready build",
    ],
    metrics: [
      { value: "1 min", label: "To book a session" },
      { value: "0", label: "Calls needed to book" },
      { value: "100%", label: "Self-managed content" },
    ],
    accent: "#0077A8",
  },
  {
    client: "Dental Tribe",
    type: "Website",
    category: "Dental Clinic — Website & Online Booking",
    tagline: "A bold, modern website for a premium dental clinic — built to fill evening appointment slots and turn browsers into booked patients.",
    afterImage: "/case-studies/dental-tribe.jpg",
    gallery: [
      "/case-studies/dental-tribe-1.jpg",
      "/case-studies/dental-tribe-2.jpg",
      "/case-studies/dental-tribe-3.jpg",
      "/case-studies/dental-tribe-4.jpg",
      "/case-studies/dental-tribe-5.jpg",
      "/case-studies/dental-tribe-6.jpg",
    ],
    services: ["Custom Website Design", "Online Booking", "WhatsApp Confirmation", "Services & Blog Pages", "Local SEO"],
    challenge:
      "Dental Tribe offers premium dental care with dedicated evening hours — but had no digital storefront to match. Patients had no easy way to discover the clinic, understand its treatments, or book a slot online. Evening appointments, their key differentiator, weren't being marketed anywhere prospective patients could actually find and act on them.",
    built:
      "We designed and built a striking, high-end website that positions Dental Tribe as a premium choice. It leads with a bold hero and clear 'Book Evening Slot' and 'Chat on WhatsApp' actions, backed by an online booking flow that confirms straight to WhatsApp. We added a problem-and-solution services section covering everything from everyday concerns to full smile makeovers, plus About and Blog pages — all mobile-first and fast.",
    result:
      "Dental Tribe now has a website that looks the part and does the work. Prospective patients can explore treatments, see live opening hours, and book an evening slot online in seconds — with confirmations landing on WhatsApp. The clinic's premium positioning and its evening-hours edge are finally front and centre where new patients can find them.",
    features: [
      "Bold, premium-feel hero with clear booking CTAs",
      "Online booking with instant WhatsApp confirmation",
      "'Book Evening Slot' flow around their key differentiator",
      "Common Problems & Solutions services section",
      "About, Blog, and Contact pages",
      "Mobile-first, fast-loading, SEO-ready build",
    ],
    metrics: [
      { value: "24/7", label: "Online booking" },
      { value: "Seconds", label: "To book a slot" },
      { value: "Evening", label: "Slots front & centre" },
    ],
    accent: "#12B3C7",
  },
  {
    client: "AI Receptionist",
    type: "AI Automation",
    category: "Product Case Study — 24/7 Voice & Chat Booking Agent",
    tagline:
      "A live AI front desk that answers every call and chat in English, qualifies the patient, and books appointments automatically — so clinics never miss another lead after hours.",
    liveUrl: "/ai-receptionist",
    liveLabel: "Try Live Demo",
    afterImage: "/case-studies/ai-receptionist-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/ai-receptionist-1.jpg", caption: "Answers treatment & pricing questions instantly, in natural English" },
      { src: "/case-studies/ai-receptionist-2.jpg", caption: "Guides the patient through a quick in-chat booking form" },
      { src: "/case-studies/ai-receptionist-3.jpg", caption: "Confirms the appointment automatically — no staff involved" },
      { src: "/case-studies/ai-receptionist-4.jpg", caption: "Live voice agent picks up and talks the patient through booking" },
      { src: "/case-studies/ai-receptionist-5.jpg", caption: "Supports voice notes for patients who'd rather speak than type" },
    ],
    services: [
      "24/7 Call Answering",
      "Live Chat Booking",
      "Voice Agent",
      "Appointment Confirmations",
      "Clinic Knowledge Training",
    ],
    challenge:
      "Busy dental and aesthetic clinics miss 25–40% of inbound calls during peak hours, lunch, and after closing. Every unanswered ring is a patient who books with the competitor who picked up. Hiring more front-desk staff is expensive, and humans still can't cover nights and weekends without burnout.",
    built:
      "We built an AI receptionist trained on clinic services, prices, hours, and FAQs. It answers phone and website chat simultaneously, speaks natural English, qualifies the patient, checks availability, and books the appointment — then sends confirmations automatically. Clinics can try the live demo on our site: ask about treatments, hours, or book a sample appointment in real time.",
    result:
      "Clinics using the AI receptionist stop losing after-hours and peak-time leads. Patients get instant answers and a booked slot without waiting on hold. The front desk is freed for in-clinic care while the AI handles volume that would otherwise require multiple staff — with zero missed calls as the target outcome.",
    features: [
      "Answers every call and chat at once — no hold music",
      "Books appointments into the clinic calendar automatically",
      "Trained on your services, pricing, and FAQs",
      "Voice notes and live voice agent support",
      "WhatsApp / email confirmations and reminders",
      "Works for dental, aesthetic, and multi-specialty clinics",
    ],
    metrics: [
      { value: "0", label: "Missed calls target" },
      { value: "24/7", label: "Availability" },
      { value: "5s", label: "Typical answer time" },
    ],
    accent: "#7B61FF",
  },
  {
    client: "Free Website Audit",
    type: "AI Automation",
    category: "Product Case Study — AI Clinic Website Analyzer",
    tagline:
      "A free AI tool that scores a clinic's website in under 30 seconds — speed, SEO, patient experience, and competitor gaps — then unlocks a full growth report.",
    liveUrl: "/free-website-audit",
    liveLabel: "Run Free Audit",
    afterImage: "/case-studies/free-website-audit-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/free-website-audit-1.jpg", caption: "Walks through the site live — speed, SEO, and patient experience checks" },
      { src: "/case-studies/free-website-audit-2.jpg", caption: "Delivers an instant score and estimates the monthly revenue it's costing" },
      { src: "/case-studies/free-website-audit-3.jpg", caption: "Surfaces the exact competitors outranking you on Google" },
      { src: "/case-studies/free-website-audit-4.jpg", caption: "Benchmarks your Google Business Profile against the local map pack" },
      { src: "/case-studies/free-website-audit-5.jpg", caption: "Lists critical issues with a clear, actionable fix for each one" },
    ],
    services: [
      "PageSpeed Analysis",
      "On-Page SEO Check",
      "Patient Experience Score",
      "Competitor Benchmark",
      "Google Business Comparison",
    ],
    challenge:
      "Most clinic owners know their website feels slow or outdated, but they don't know what's actually costing them patients — ranking gaps, missing booking CTAs, weak mobile experience, or competitors outranking them on Google Maps. Hiring an agency for a paid audit creates friction before they've even seen the problem.",
    built:
      "We built a free AI website audit bot that anyone can use: paste a clinic URL and get a real score backed by PageSpeed data, SEO checks, patient-booking friction analysis, and local competitor context. A teaser score appears immediately; the full report unlocks with a quick lead gate so clinics can share results with their team — and so we can follow up with a clear fix plan.",
    result:
      "Clinic owners get an honest, data-backed picture of where their site is leaking patients — without a sales call first. The audit becomes the starting point for website redesigns, local SEO, and booking automation. It's free to run on our site today, and every completed audit surfaces the exact issues that turn searchers into booked appointments.",
    features: [
      "Real Google PageSpeed / performance scoring",
      "On-page SEO and treatment keyword gaps",
      "Patient experience check (booking, call, WhatsApp)",
      "Local competitor and ranking context",
      "Instant score + full report unlock flow",
      "Free to use — no credit card required",
    ],
    metrics: [
      { value: "30s", label: "To first score" },
      { value: "Free", label: "No signup required" },
      { value: "6", label: "Audit dimensions" },
    ],
    accent: "#00B4D8",
  },
];

function CaseStudyBlock({ c, index }: { c: CaseStudy; index: number }) {
  const { entrance, hoverProps } = useCardMotion();
  return (
    <motion.article
      {...entrance(staggerDelay(index))}
      {...hoverProps(true)}
      className="card-white rounded-2xl overflow-hidden card-motion card-shadow-hover"
    >
      {/* Header band */}
      <div className="bg-[#00283C] px-7 lg:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
              Case Study {String(index + 1).padStart(2, "0")}
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{c.client}</h2>
            <p className="text-sm text-[#9FD3E8] font-medium mt-1">{c.category}</p>
          </div>
          {c.liveUrl && (
            <a
              href={c.liveUrl}
              target={c.liveUrl.startsWith("http") ? "_blank" : undefined}
              rel={c.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#00283C] bg-white hover:bg-[#9FD3E8] transition-colors whitespace-nowrap self-start"
            >
              {c.liveLabel ?? "View Live"}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Before / After visual */}
      {(c.beforeImage || c.afterImage) && (
        <div className="bg-[#EEF3F6] px-7 lg:px-10 py-8 border-b border-gray-100">
          <div className={`grid gap-5 ${c.beforeImage && c.afterImage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {c.beforeImage && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Before</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.beforeImage} alt={`${c.client} — previous website`} className="w-full h-full object-cover object-top" />
                </div>
              </div>
            )}
            {c.afterImage && (
              <div className="block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#0077A8]">
                    {c.beforeImage ? "After — By Alliance Tech" : "Live Product Demo"}
                  </span>
                  <span className="h-px flex-1 bg-[#9FD3E8]" />
                </div>
                <div
                  className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-[#F8FAFC] ${
                    c.beforeImage ? "aspect-[16/10]" : c.heroWide ? "" : "flex justify-center p-4 sm:p-6"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.afterImage}
                    alt={`${c.client} — demo by Alliance Tech`}
                    className={
                      c.beforeImage
                        ? "w-full h-full object-cover object-top"
                        : c.heroWide
                        ? "w-full h-auto block"
                        : "w-full max-w-md h-auto rounded-lg shadow-md"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full screenshot gallery */}
      {c.gallery?.length ? <ScreenshotGallery images={c.gallery} client={c.client} accent={c.accent} /> : null}

      {/* AI chat / voice widget gallery */}
      {c.chatGallery?.length ? <ChatWidgetGallery shots={c.chatGallery} client={c.client} accent={c.accent} /> : null}

      <div className="px-7 lg:px-10 py-8 lg:py-10">
        <p className="text-lg lg:text-xl font-bold text-[#00283C] leading-snug tracking-tight mb-7">
          {c.tagline}
        </p>

        {/* Services tags */}
        <div className="flex flex-wrap gap-2 mb-9">
          {c.services.map((s) => (
            <span key={s} className="badge-light text-xs">{s}</span>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-9 py-6 border-y border-gray-100">
          {c.metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-2xl lg:text-3xl font-extrabold" style={{ color: c.accent }}>{m.value}</div>
              <div className="text-[11px] lg:text-xs text-gray-400 leading-tight mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="space-y-7">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Challenge</h3>
            <p className="text-gray-600 leading-relaxed">{c.challenge}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">What We Built</h3>
            <p className="text-gray-600 leading-relaxed">{c.built}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Result</h3>
            <p className="text-gray-600 leading-relaxed">{c.result}</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="mt-9 pt-7 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Key Features We Delivered</h3>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {c.features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.accent }}>
                  <Check className="w-3 h-3 text-white" />
                </span>
                <span className="text-sm text-gray-600 leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Lightbox({ images, index, onClose, onNav }: { images: string[]; index: number; onClose: () => void; onNav: (dir: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, onNav]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Close">
        <X className="w-5 h-5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Previous">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNav(1); }} className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Next">
        <ChevronRight className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        key={index}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        src={images[index]}
        alt={`Screenshot ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
      />
      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-xs">{index + 1} / {images.length}</span>
    </motion.div>
  );
}

const filters: ("All" | ProjectType)[] = ["All", "Website", "AI Automation"];

export default function Portfolio() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");
  const filtered = filter === "All" ? caseStudies : caseStudies.filter((c) => c.type === filter);
  const [selected, setSelected] = useState(0);
  const active = filtered[selected] ?? filtered[0];
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const navLightbox = (dir: number) =>
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb));

  const handleFilter = (f: "All" | ProjectType) => {
    setFilter(f);
    setSelected(0);
  };

  return (
    <LightboxContext.Provider value={openLightbox}>
    <PageWrapper>
      <ServicePageHero
        badge="OUR WORK"
        headline="Real Builds."
        highlight="Real Results."
        subheadline="Websites, booking systems, and growth platforms we've built for healthcare clinics — including UK-market outcomes in Blackburn, Manchester, and London."
        ctaText="Start Your Project"
      />

      <CaseStudyScroll />

      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#0077A8] mb-6">UK market outcomes</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { place: "Manchester dental", result: "+38% new patient enquiries", detail: "Local SEO + WhatsApp AI follow-up in 60 days." },
              { place: "Blackburn aesthetic", result: "Near-zero missed calls", detail: "24/7 AI receptionist after 5pm and weekends." },
              { place: "London multi-site", result: "Maps pack top 3", detail: "GBP optimisation + location landing pages." },
            ].map((c) => (
              <div key={c.place} className="rounded-2xl border border-[#00283C]/08 bg-[#F8FAFC] p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0077A8] mb-2">{c.place}</p>
                <p className="text-base font-extrabold text-[#00283C] mb-1">{c.result}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6">

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                  filter === f
                    ? "bg-[#00283C] border-[#00283C] text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-[#00283C] hover:text-[#00283C]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Project selector */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
              Select a project to view the case study
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((c, i) => {
                const isActive = i === selected;
                const thumb = c.afterImage || c.beforeImage;
                return (
                  <button
                    key={c.client}
                    onClick={() => setSelected(i)}
                    className={`text-left rounded-xl overflow-hidden border-2 transition-all ${
                      isActive ? "shadow-lg" : "border-transparent hover:shadow-md opacity-80 hover:opacity-100"
                    }`}
                    style={{ borderColor: isActive ? c.accent : undefined, background: "white" }}
                  >
                    {thumb ? (
                      <div className="aspect-[16/9] overflow-hidden bg-[#F0F7FA] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={c.client}
                          className={`w-full h-full ${c.heroWide ? "object-contain" : "object-cover object-top"}`}
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-[16/9] flex items-center justify-center px-6"
                        style={{ background: `linear-gradient(135deg, #00283C 0%, ${c.accent} 100%)` }}
                      >
                        <p className="text-white font-extrabold text-lg text-center leading-snug">{c.client}</p>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
                        <p className="text-sm font-bold text-[#00283C]">{c.client}</p>
                      </div>
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                        style={{ background: `${c.accent}1A`, color: c.accent }}
                      >
                        {c.type}
                      </span>
                      <p className="text-xs text-gray-400 leading-snug">{c.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected case study */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.client}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <CaseStudyBlock c={active} index={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
    <AnimatePresence>
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={navLightbox}
        />
      )}
    </AnimatePresence>
    </LightboxContext.Provider>
  );
}
