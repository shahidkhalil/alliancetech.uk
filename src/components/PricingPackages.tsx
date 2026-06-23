"use client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useForm } from "@/context/FormContext";

const modules = {
  website: {
    name: "Website",
    outcome: "A site that turns visitors into booked patients",
    includes: ["Custom design, live in 7 days", "Mobile-first and fast-loading", "Online booking built in"],
  },
  localSeo: {
    name: "Local SEO",
    outcome: "Rank first when patients search near them",
    includes: ["Google Business Profile setup", "Google Maps ranking strategy", "Review generation system"],
  },
  marketing: {
    name: "Digital Marketing",
    outcome: "Patients actively searching, found and converted",
    includes: ["Google Search & Meta ad campaigns", "Audience targeting by treatment", "Weekly performance reports"],
  },
  whatsapp: {
    name: "WhatsApp Automation",
    outcome: "Never miss another inquiry, day or night",
    includes: ["24/7 AI replies in Urdu and English", "Automated appointment booking", "Automated no-show reminders"],
  },
  ehr: {
    name: "EHR Platform",
    outcome: "Go fully paperless on one platform",
    includes: ["Digital patient records and prescriptions", "Billing and invoice management", "Branded patient mobile app"],
  },
};

const addOns = [
  { name: "AI Receptionist", desc: "Answers every clinic call 24/7 in Urdu and English and books appointments automatically.", href: "/ai-receptionist", price: "Quoted on your audit call" },
  { name: "SEO for Clinics", desc: "Long-term organic Google rankings for your highest-value treatment keywords.", href: "/seo-for-clinics", price: "Quoted on your audit call" },
  { name: "EHR Platform", desc: "Digital patient records, prescriptions, and billing, on its own without the full Premium plan.", href: "/ehr-platform", price: "PKR 25,000 / year" },
];

const plans = [
  {
    name: "Basic",
    price: "PKR 35,000",
    period: "per month",
    desc: "For new or small clinics that need a strong online foundation patients can actually find.",
    moduleKeys: ["website", "localSeo"],
    cta: "Get Free Audit",
    popular: false,
  },
  {
    name: "Standard",
    price: "PKR 50,000",
    period: "per month",
    desc: "Everything in Basic, plus paid campaigns that put your clinic in front of patients actively searching today.",
    moduleKeys: ["website", "localSeo", "marketing"],
    cta: "Get Free Audit",
    popular: true,
  },
  {
    name: "Premium",
    price: "PKR 80,000",
    period: "per month",
    desc: "Everything in Standard, plus automation that answers, books, and records patients without your staff lifting a finger.",
    moduleKeys: ["website", "localSeo", "marketing", "whatsapp", "ehr"],
    cta: "Book a Call",
    popular: false,
  },
];

export default function PricingPackages() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="py-16 lg:py-20 bg-white" id="pricing" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">PRICING</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Simple, Transparent <span className="gradient-heading">Pricing</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No hidden fees, ever. Every plan runs on a 3 to 6 month minimum, just enough time for results to compound and show in your numbers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => {
            const isOpen = expanded === p.name;
            return (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl overflow-hidden flex flex-col h-full ${p.popular ? "ring-2 ring-[#00283C] shadow-xl" : "card-white"}`}>

                {p.popular && (
                  <div className="bg-[#00283C] text-white text-xs font-bold text-center py-2 tracking-wider">
                    ✦ MOST POPULAR
                  </div>
                )}

                <div className={`p-7 flex flex-col flex-1 ${p.popular ? "bg-white" : ""}`}>
                  <h3 className="text-lg font-bold text-[#00283C] mb-1">{p.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{p.desc}</p>
                  <div className="mb-1">
                    <span className="text-3xl font-extrabold text-[#00283C]">{p.price}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-6 uppercase tracking-wide font-semibold">Billed {p.period}</p>

                  <ul className="space-y-2.5 mb-4">
                    {p.moduleKeys.map((key) => {
                      const m = modules[key as keyof typeof modules];
                      return (
                        <li key={key} className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-[#00B4D8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-bold text-[#00283C]">{m.name}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={() => setExpanded(isOpen ? null : p.name)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#0077A8] hover:text-[#00283C] transition-colors mb-2"
                  >
                    {isOpen ? "Hide full specs" : "See full plan specs"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-2 pb-4">
                          {p.moduleKeys.map((key) => {
                            const m = modules[key as keyof typeof modules];
                            return (
                              <div key={key}>
                                <p className="font-bold text-[#00283C] text-sm mb-0.5">{m.name}</p>
                                <p className="text-xs text-[#0077A8] font-semibold mb-1.5">{m.outcome}</p>
                                <ul className="space-y-1">
                                  {m.includes.map((inc) => (
                                    <li key={inc} className="text-xs text-gray-500 leading-relaxed">{inc}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex-1" />

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
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}
          className="mt-10 rounded-xl border border-gray-100 bg-[#F8FAFC] p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Optional Add-Ons, Any Plan</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {addOns.map((a) => (
              <a key={a.name} href={a.href}
                className="flex flex-col bg-white rounded-lg p-4 border border-gray-100 hover:border-[#00B4D8]/40 transition-colors">
                <p className="text-sm font-bold text-[#00283C] mb-1">{a.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-2 flex-1">{a.desc}</p>
                <p className="text-xs font-semibold text-[#0077A8]">{a.price}</p>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">AI Receptionist and SEO pricing is quoted on your free audit call, based on your clinic's call and treatment volume.</p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="text-center text-gray-400 text-sm mt-8">
          Not sure which plan is right? <button onClick={openForm} className="text-[#0077A8] font-semibold hover:underline">Get a free audit</button> and we&apos;ll recommend the best fit.
        </motion.p>
      </div>
    </section>
  );
}
