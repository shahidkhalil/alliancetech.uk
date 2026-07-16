"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, ArrowRight, Clock, Cpu, Shield, Star } from "lucide-react";
import { ServicePricing } from "@/lib/pricingData";
import { useForm } from "@/context/FormContext";

const PREVIEW_COUNT = 4; // features shown before "expand"

/* ─── Pricing Card ─────────────────────────────────────────────────────────── */
function PricingCard({
  pkg,
  index,
}: {
  pkg: ServicePricing["packages"][number];
  index: number;
}) {
  const { openForm } = useForm();
  const [expanded, setExpanded] = useState(false);

  const preview = pkg.features.slice(0, PREVIEW_COUNT);
  const rest    = pkg.features.slice(PREVIEW_COUNT);
  const hasMore = rest.length > 0;

  const dark = pkg.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className={`relative flex flex-col rounded-2xl overflow-hidden ${
        dark
          ? "bg-[#00283C] shadow-xl"
          : "bg-white border border-gray-200 hover:border-[#00B4D8]/40 hover:shadow-md transition-all duration-200"
      }`}
    >
      {/* Popular banner */}
      {dark && (
        <div className="bg-[#00B4D8] text-white text-[10px] font-black tracking-[0.18em] text-center py-2 uppercase">
          ✦ Most Popular
        </div>
      )}

      <div className="p-6 flex flex-col">
        {/* Package name */}
        <p className={`text-[11px] font-black uppercase tracking-[0.14em] mb-4 ${dark ? "text-[#00B4D8]" : "text-[#0077A8]"}`}>
          {pkg.name}
        </p>

        {/* Price */}
        <div className="mb-4">
          <div className={`text-4xl font-black tracking-tight leading-none ${dark ? "text-white" : "text-[#00283C]"}`}>
            {pkg.price}
          </div>
          <div className={`text-xs font-semibold mt-1.5 uppercase tracking-wider ${dark ? "text-white/60" : "text-gray-400"}`}>
            {pkg.period}
          </div>
          {pkg.savings && (
            <span className={`inline-block mt-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              dark ? "bg-white/10 text-white/75" : "bg-[#00B4D8]/10 text-[#0077A8]"
            }`}>
              {pkg.savings}
            </span>
          )}
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-white/60" : "text-gray-500"}`}>
          {pkg.description}
        </p>

        {/* CTA */}
        <button
          onClick={openForm}
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            dark
              ? "bg-white text-[#00283C] hover:bg-[#E8F7FB]"
              : "bg-[#00283C] text-white hover:bg-[#003D5C]"
          }`}
        >
          {pkg.cta} <ArrowRight className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className={`my-5 h-px ${dark ? "bg-white/10" : "bg-gray-100"}`} />

        {/* Preview features — always visible */}
        <ul className="space-y-2.5">
          {preview.map((f) => (
            <FeatureRow key={f} text={f} dark={dark} />
          ))}
        </ul>

        {/* Expandable extra features */}
        {hasMore && (
          <>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.ul
                  key="rest"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="overflow-hidden space-y-2.5 mt-2.5"
                >
                  {rest.map((f) => (
                    <FeatureRow key={f} text={f} dark={dark} />
                  ))}

                  {/* Add-ons shown inside expanded area */}
                  {pkg.addOns && pkg.addOns.length > 0 && (
                    <div className={`mt-4 pt-4 border-t ${dark ? "border-white/10" : "border-gray-100"}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${dark ? "text-white/60" : "text-gray-300"}`}>
                        Optional Add-ons
                      </p>
                      {pkg.addOns.map((a) => (
                        <p key={a} className={`text-xs leading-relaxed ${dark ? "text-white/60" : "text-gray-400"}`}>
                          + {a}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Toggle button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`mt-4 flex items-center gap-1.5 text-xs font-bold transition-colors duration-150 ${
                dark ? "text-[#00B4D8] hover:text-white" : "text-[#0077A8] hover:text-[#00283C]"
              }`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Show less" : `Show ${rest.length} more feature${rest.length > 1 ? "s" : ""}`}
            </button>
          </>
        )}

        {/* Add-ons when NOT expanded and no extra features hidden */}
        {!hasMore && pkg.addOns && pkg.addOns.length > 0 && (
          <div className={`mt-5 pt-4 border-t ${dark ? "border-white/10" : "border-gray-100"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${dark ? "text-white/60" : "text-gray-300"}`}>
              Optional Add-ons
            </p>
            {pkg.addOns.map((a) => (
              <p key={a} className={`text-xs leading-relaxed ${dark ? "text-white/60" : "text-gray-400"}`}>
                + {a}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FeatureRow({ text, dark }: { text: string; dark: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-[3px] flex-shrink-0 w-[17px] h-[17px] rounded-full flex items-center justify-center ${
        dark ? "bg-[#00B4D8]/20" : "bg-[#E0F4F9]"
      }`}>
        <Check className={`w-2.5 h-2.5 ${dark ? "text-[#00B4D8]" : "text-[#0077A8]"}`} strokeWidth={3} />
      </span>
      <span className={`text-sm leading-snug ${dark ? "text-white/75" : "text-gray-600"}`}>{text}</span>
    </li>
  );
}

/* ─── Comparison Table ─────────────────────────────────────────────────────── */
function ComparisonTable({ service }: { service: ServicePricing }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#F8FAFC] hover:bg-[#F0F9FC] transition-colors"
      >
        <span className="text-sm font-bold text-[#00283C]">Compare all features</span>
        <ChevronDown className={`w-4 h-4 text-[#0077A8] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="table"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-4 bg-[#00283C]">
              <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/60">Feature</div>
              {["Basic", "Standard", "Premium"].map((n, i) => (
                <div key={n} className={`px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest ${i === 1 ? "text-[#00B4D8]" : "text-white/60"}`}>
                  {n}
                </div>
              ))}
            </div>
            {service.comparison.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFCFE]"}`}>
                <div className="px-5 py-3 text-sm text-gray-600">{row.feature}</div>
                {([row.basic, row.standard, row.premium] as (string | boolean)[]).map((v, vi) => (
                  <div key={vi} className="px-4 py-3 flex items-center justify-center">
                    {v === true  ? <Check className="w-4 h-4 text-[#0077A8]" strokeWidth={2.5} /> :
                     v === false ? <X     className="w-4 h-4 text-gray-300"  strokeWidth={2}   /> :
                     <span className={`text-xs font-medium text-center leading-snug ${vi === 1 ? "text-[#00283C] font-semibold" : "text-gray-500"}`}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────────── */
function FAQSection({ faqs }: { faqs: ServicePricing["faqs"] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-10">
      <h3 className="text-sm font-black text-[#00283C] mb-4 uppercase tracking-widest">Common Questions</h3>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className={`rounded-xl border overflow-hidden transition-colors duration-150 ${open === i ? "border-[#00B4D8]/30" : "border-gray-200"}`}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between px-5 py-4 text-left gap-4"
            >
              <span className="text-sm font-semibold text-[#00283C] leading-snug">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open === i ? "rotate-180 text-[#0077A8]" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div key="ans" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trust signals ─────────────────────────────────────────────────────────── */
function TrustBar({ service }: { service: ServicePricing }) {
  const items = [
    { icon: Clock,  label: "Delivery",   value: service.timeline },
    { icon: Cpu,    label: "Tech Stack",  value: service.technologies.slice(0, 3).join(", ") + (service.technologies.length > 3 ? " …" : "") },
    { icon: Shield, label: "Support",     value: service.support },
    ...(service.guarantee ? [{ icon: Star, label: "Guarantee", value: service.guarantee }] : []),
  ];
  return (
    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-gray-100">
          <Icon className="w-4 h-4 text-[#0077A8] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────────────────── */
export default function ServicePricingSection({ service }: { service: ServicePricing }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-7">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.16em] text-[#0077A8] bg-[#E0F4F9] px-3 py-1 rounded-full mb-3">
            {service.category}
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-[#00283C] tracking-tight mb-2">
            {service.name}
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">{service.tagline}</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {service.packages.map((pkg, i) => (
            <PricingCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>

        <ComparisonTable service={service} />
        <TrustBar service={service} />
        <FAQSection faqs={service.faqs} />
      </motion.div>
    </div>
  );
}
