"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";

const plans = [
  {
    name: "Starter",
    price: "PKR 35,000",
    period: "/month",
    desc: "For new or small clinics just getting started online.",
    features: [
      "Professional clinic website",
      "Google Business Profile setup",
      "Basic local SEO",
      "WhatsApp business setup",
      "Monthly performance report",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "PKR 65,000",
    period: "/month",
    desc: "The most popular plan for growing clinics that want more patients fast.",
    features: [
      "Everything in Starter",
      "Google + Meta Ads management",
      "AI WhatsApp automation",
      "SEO + Google Maps ranking",
      "Bi-weekly strategy calls",
      "Review generation system",
    ],
    cta: "Get Free Audit",
    popular: true,
  },
  {
    name: "Premium",
    price: "Custom",
    period: "",
    desc: "Full-stack digital transformation for multi-chair or multi-location clinics.",
    features: [
      "Everything in Growth",
      "AI Receptionist (24/7 calls)",
      "Patient mobile app",
      "EHR / Digital records system",
      "Dedicated account manager",
      "Weekly reporting + strategy",
    ],
    cta: "Book a Call",
    popular: false,
  },
];

export default function PricingPackages() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-white" id="pricing" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">PRICING</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Simple, Transparent <span className="gradient-heading">Pricing</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No hidden fees. No long-term lock-in. Cancel any time — but you won&apos;t want to.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl overflow-hidden ${p.popular ? "ring-2 ring-[#00283C] shadow-xl" : "card-white"}`}>

              {p.popular && (
                <div className="bg-[#00283C] text-white text-xs font-bold text-center py-2 tracking-wider">
                  ✦ MOST POPULAR
                </div>
              )}

              <div className={`p-7 ${p.popular ? "bg-white" : ""}`}>
                <h3 className="text-lg font-bold text-[#00283C] mb-1">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-[#00283C]">{p.price}</span>
                  {p.period && <span className="text-gray-400 text-sm">{p.period}</span>}
                </div>

                <ul className="space-y-3 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#00B4D8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button onClick={openForm}
                  className={`w-full py-3 rounded-md text-sm font-bold transition-all ${
                    p.popular
                      ? "btn-dark"
                      : "border-2 border-[#00283C] text-[#00283C] hover:bg-[#00283C] hover:text-white"
                  }`}>
                  {p.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="text-center text-gray-400 text-sm mt-8">
          Not sure which plan is right? <button onClick={openForm} className="text-[#0077A8] font-semibold hover:underline">Get a free audit</button> and we&apos;ll recommend the best fit.
        </motion.p>
      </div>
    </section>
  );
}
