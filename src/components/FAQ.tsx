"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

const faqs = [
  {
    q: "How quickly will I see results?",
    a: "Most UK clinics see more calls, WhatsApp enquiries, and Google traffic within 30–45 days. Fuller results typically show by day 60. We give you a clear month-by-month projection at the start.",
  },
  {
    q: "What is your minimum contract length?",
    a: "We ask for 3–6 months. Rankings, ads, and AI training need time to compound. Most clients stay longer because the ROI is clear.",
  },
  {
    q: "Do you work with NHS and private practices?",
    a: "We specialise in private dental and aesthetic clinics. Mixed practices are welcome — we focus campaigns on private treatments and new patient enquiries that grow revenue.",
  },
  {
    q: "Is the AI receptionist GDPR compliant?",
    a: "We design workflows for UK GDPR. Enquiry data is used to respond and book — we do not sell patient or lead data. Data processing details can be agreed in your contract.",
  },
  {
    q: "How does the AI Receptionist work?",
    a: "It connects to your phone line and WhatsApp. It answers in natural English, qualifies the patient, and books into your diary — 24/7, including after 5pm and weekends.",
  },
  {
    q: "Do you work with aesthetic clinics too?",
    a: "Yes — botox, fillers, laser, skin, and similar treatments. We build campaigns and SEO around high-intent UK search terms.",
  },
  {
    q: "Can I see results before committing?",
    a: "Yes. Start with a free clinic audit. You get a written report of gaps, priorities, and expected outcomes — no commitment required. We reply within 2 hours Mon–Sat (UK time).",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { entrance, hoverProps, expandTransition } = useCardMotion();

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div {...entrance(0)} className="text-center mb-10">
          <span className="badge-light mb-4">FAQ</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Questions UK Clinics <span className="gradient-heading">Always Ask</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              {...entrance(staggerDelay(i))}
              {...hoverProps(false)}
              layout
              className={`card-white card-accent-light rounded-2xl overflow-hidden card-shadow-hover ${
                open === i ? "ring-1 ring-[#00B4D8]/25" : ""
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-[#FAFCFD] transition-colors"
              >
                <span className="text-sm font-semibold text-[#00283C]">{f.q}</span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    open === i ? "bg-[#00283C] text-white rotate-45" : "bg-[#E6F4F8] text-[#00B4D8]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition()}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
