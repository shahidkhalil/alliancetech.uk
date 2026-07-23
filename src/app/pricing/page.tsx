"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePricingSection from "@/components/ServicePricingSection";
import { pricingServices, serviceCategories, ServiceCategory } from "@/lib/pricingData";
import { useForm } from "@/context/FormContext";
import { FeatureCardGrid } from "@/components/ui/Card";
import Reveal from "@/components/Motion/Reveal";

/* ─── Why Alliance Tech ─────────────────────────────────────────────────────── */
function WhySection() {
  const points = [
    { title: "No Hidden Fees", desc: "Every line item is published. What you see is what you pay." },
    { title: "You Own Everything", desc: "Code, assets, data — 100% yours at delivery. No lock-in." },
    { title: "UK Clinic Focused", desc: "GDPR-aware builds, GBP pricing, and copy written for UK patients." },
    { title: "Guaranteed Results", desc: "Most services carry a performance or satisfaction guarantee." },
  ];
  return (
    <Reveal>
      <section className="border-t border-gray-100 py-14 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="badge-light">WHY ALLIANCE TECH</span>
            <h2 className="text-2xl font-black text-[#00283C] mt-4 tracking-tight">
              Built Different. <span className="gradient-heading">Priced Honestly.</span>
            </h2>
          </div>
          <FeatureCardGrid
            items={points.map((p) => ({ icon: <Check className="w-4 h-4 text-[#0077A8]" strokeWidth={3} />, title: p.title, desc: p.desc }))}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
          />
        </div>
      </section>
    </Reveal>
  );
}

function BottomCTA() {
  const { openForm } = useForm();
  return (
    <Reveal>
      <section className="py-16 bg-[#00283C] relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-24 left-1/2 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-[#00B4D8]/30 blur-3xl"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-[#00B4D8] text-xs font-black uppercase tracking-widest mb-4">NEXT STEP</p>
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-4">
            Not sure which plan fits?
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Start with a free clinic audit — then we&apos;ll recommend the exact package for your budget on a 30-minute call.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/free-website-audit"
              data-analytics-label="start_website_audit"
              data-analytics-location="pricing_bottom"
              className="px-8 py-3.5 bg-white text-[#00283C] rounded-xl font-black text-sm hover:bg-[#E8F7FB] transition-colors shadow flex items-center gap-2"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Run Free Website Audit <ArrowRight className="w-4 h-4" />
            </motion.a>
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="pricing_bottom"
              className="px-8 py-3.5 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Book Free Strategy Call
            </button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ─── Mobile sticky closer ──────────────────────────────────────────────────── */
function StickySalesBar() {
  const { openForm } = useForm();
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 safe-pb">
      <div className="flex gap-2 max-w-lg mx-auto">
        <a
          href="/free-website-audit"
          data-analytics-label="start_website_audit"
          data-analytics-location="pricing_sticky"
          className="flex-1 text-center py-3 rounded-xl bg-[#00283C] text-white text-xs font-black"
        >
          Free Audit
        </a>
        <button
          type="button"
          onClick={openForm}
          data-analytics-label="book_consultation"
          data-analytics-location="pricing_sticky"
          className="flex-1 py-3 rounded-xl border border-[#00283C]/20 text-[#00283C] text-xs font-black"
        >
          Book a Call
        </button>
      </div>
    </div>
  );
}

/* ─── Main page content ──────────────────────────────────────────────────────── */
function PricingContent() {
  const { openForm } = useForm();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("All");
  const [activeId, setActiveId] = useState(pricingServices[0].id);

  const filtered = activeCategory === "All"
    ? pricingServices
    : pricingServices.filter((s) => s.category === activeCategory);

  useEffect(() => {
    if (!filtered.find((s) => s.id === activeId)) {
      setActiveId(filtered[0]?.id ?? pricingServices[0].id);
    }
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = pricingServices.find((s) => s.id === activeId) ?? pricingServices[0];

  // Deep link: /pricing#service-id opens that service directly.
  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "");
      const svc = pricingServices.find((s) => s.id === id);
      if (svc) {
        setActiveCategory("All");
        setActiveId(svc.id);
        setTimeout(() => document.getElementById("service-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-14 bg-white border-b border-gray-100 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,40,60,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[500px] h-[350px] pointer-events-none opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge-light mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
              PRICING
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-[#00283C] tracking-tight leading-tight mt-4 mb-4">
              Transparent Pricing.<br />
              <span className="gradient-heading">No Surprises, Ever.</span>
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-6 max-w-2xl">
              Every service has three clearly defined packages with published prices and feature lists. Pick what you need and know exactly what you&apos;re paying before you sign anything.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
              <a
                href="/free-website-audit"
                data-analytics-label="start_website_audit"
                data-analytics-location="pricing_hero"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00283C] text-white text-sm font-black hover:bg-[#003D5C] transition-colors"
              >
                Free Clinic Audit First <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="pricing_hero"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#00283C]/20 text-[#00283C] text-sm font-bold hover:bg-[#F8FAFC] transition-colors"
              >
                Book Free Strategy Call
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-5 max-w-xl">
              Built for UK dental &amp; aesthetic clinics that need more booked appointments — not vanity traffic.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["No hidden fees", "Cancel monthly plans anytime", "You own everything we build", "GBP pricing"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Check className="w-3 h-3 text-[#00B4D8]" strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Two-pane layout: sidebar + main ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stacks on mobile — side-by-side only once the sidebar appears (lg) */}
        <div className="flex flex-col lg:flex-row gap-10 lg:items-start">

          {/* Sidebar nav */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28">
            <div className="space-y-6">
              {(serviceCategories.filter(c => c !== "All") as ServiceCategory[]).map((cat) => {
                const catServices = pricingServices.filter((s) => s.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{cat}</p>
                    <ul className="space-y-0.5">
                      {catServices.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => setActiveId(s.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              activeId === s.id
                                ? "bg-[#00283C] text-white"
                                : "text-gray-500 hover:text-[#00283C] hover:bg-gray-100"
                            }`}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Mobile tab bar (hidden on lg) — min-w-0 lets the pill rows scroll
              instead of forcing the flex row wider than the screen */}
          <div className="lg:hidden w-full min-w-0 mb-6">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors duration-150 ${
                    activeCategory === cat
                      ? "bg-[#00283C] text-white border-[#00283C]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Service pills */}
            <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                    activeId === s.id
                      ? "bg-[#00B4D8]/10 text-[#0077A8] border-[#00B4D8]/40"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div id="service-detail" className="w-full lg:flex-1 min-w-0 scroll-mt-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ServicePricingSection service={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <WhySection />
      <BottomCTA />
      <StickySalesBar />
      {/* Spacer so sticky bar doesn't cover content on mobile */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}

export default function PricingPage() {
  return (
    <PageWrapper>
      <PricingContent />
    </PageWrapper>
  );
}
