"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext } from "react";
import { ArrowUpRight, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";

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

interface CaseStudy {
  client: string;
  category: string;
  tagline: string;
  liveUrl?: string;
  liveLabel?: string;
  afterImage?: string;
  beforeImage?: string;
  gallery?: string[];
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
    category: "Clinical Psychologist — Website Redesign & Booking Platform",
    tagline: "A complete rebuild of a clinical psychologist's website — transforming a basic profile page into a credibility-first platform that turns visitors into booked appointments.",
    afterImage: "/portfolio/dr-nida-after.png",
    beforeImage: "/portfolio/dr-nida-before.png",
    gallery: [
      "/portfolio/dr-nida-1.jpg",
      "/portfolio/dr-nida-2.jpg",
      "/portfolio/dr-nida-3.jpg",
      "/portfolio/dr-nida-4.jpg",
      "/portfolio/dr-nida-5.jpg",
      "/portfolio/dr-nida-6.jpg",
    ],
    services: ["Website Redesign", "Online Booking System", "WhatsApp Integration", "Blog CMS", "SEO Setup"],
    challenge:
      "Dr. Nida is one of America's most credentialed clinical psychologists — PhD, 15+ years of practice, internationally certified in NLP and Timeline Therapy. Her original website, however, was a basic single-page profile: it stated who she was but did little to build trust or drive action. There was no real way to verify her credentials, explore her services, or book a session without picking up the phone. Her online presence didn't match the calibre of her expertise.",
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
    category: "Dental Clinic (Dr. Shahab & Associates, Houston) — Website & Booking",
    tagline: "A bold, modern website for a premium Houston dental clinic — built to fill evening appointment slots and turn browsers into booked patients.",
    afterImage: "/portfolio/dental-tribe.png",
    gallery: [
      "/portfolio/dental-tribe-1.jpg",
      "/portfolio/dental-tribe-2.jpg",
      "/portfolio/dental-tribe-3.jpg",
      "/portfolio/dental-tribe-4.jpg",
      "/portfolio/dental-tribe-5.jpg",
      "/portfolio/dental-tribe-6.jpg",
    ],
    services: ["Custom Website Design", "Online Booking", "WhatsApp Confirmation", "Services & Blog Pages", "Local SEO"],
    challenge:
      "Dental Tribe offers premium dental care in Houston with dedicated evening hours — but had no digital storefront to match. Patients had no easy way to discover the clinic, understand its treatments, or book a slot online. Evening appointments, their key differentiator, weren't being marketed anywhere prospective patients could actually find and act on them.",
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
];

function CaseStudyBlock({ c, index }: { c: CaseStudy; index: number }) {
  return (
    <article className="card-white rounded-2xl overflow-hidden">
      {/* Header band */}
      <div className="bg-[#00283C] px-7 lg:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
              Case Study {String(index + 1).padStart(2, "0")}
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{c.client}</h2>
            <p className="text-sm text-[#9FD3E8] font-medium mt-1">{c.category}</p>
          </div>
          {c.liveUrl && (
            <a
              href={c.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
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
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#0077A8]">After — By Alliance Tech</span>
                  <span className="h-px flex-1 bg-[#9FD3E8]" />
                </div>
                <div className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white ${c.beforeImage ? "aspect-[16/10]" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.afterImage}
                    alt={`${c.client} — new website by Alliance Tech`}
                    className={c.beforeImage ? "w-full h-full object-cover object-top" : "w-full h-auto"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full screenshot gallery */}
      {c.gallery?.length ? <ScreenshotGallery images={c.gallery} client={c.client} accent={c.accent} /> : null}

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
    </article>
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

export default function Portfolio() {
  const [selected, setSelected] = useState(0);
  const active = caseStudies[selected];
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const navLightbox = (dir: number) =>
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb));

  return (
    <LightboxContext.Provider value={openLightbox}>
    <PageWrapper>
      <ServicePageHero
        badge="OUR WORK"
        headline="Real Builds."
        highlight="Real Results."
        subheadline="A look at the websites, booking systems, and growth platforms we've built for healthcare professionals across the United States — and the impact they've made."
        ctaText="Start Your Project"
      />

      <section className="py-16 lg:py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6">

          {/* Project selector */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
              Select a project to view the case study
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseStudies.map((c, i) => {
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
                    {thumb && (
                      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={c.client} className="w-full h-full object-cover object-top" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
                        <p className="text-sm font-bold text-[#00283C]">{c.client}</p>
                      </div>
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
