"use client";
import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

const faqs = [
  { q: "How quickly will I see results?", a: "Most clinics see measurable results — more calls, WhatsApp inquiries, and Google traffic — within 30–45 days. Full results typically show by day 60. We give you a clear month-by-month projection at the start." },
  { q: "What is your minimum contract length?", a: "We require a minimum commitment of 3–6 months. Real results — Google rankings, ad optimisation, AI training — take time to compound. 90%+ of our clients continue well beyond 6 months because the ROI speaks for itself." },
  { q: "What if I already have a website?", a: "We audit your existing website first. If it can be improved without a full rebuild, we do that. If it's holding you back, we'll build a new one as part of your plan." },
  { q: "How does the AI Receptionist work?", a: "It's connected to your clinic's phone number and WhatsApp. It answers in English, qualifies the patient, and books them directly into your appointment calendar — 24/7 without any staff involvement." },
  { q: "Do you work with aesthetic clinics too?", a: "Yes. About half our clients are aesthetic and skin clinics. We have specific campaigns, content, and SEO strategies for botox, fillers, laser, and skin treatments." },
  { q: "What is the EHR platform?", a: "EHR stands for Electronic Health Records. It's a digital system that replaces your paper register — patient records, prescriptions, billing, and appointment management all in one screen. We build it and train your staff on it." },
  { q: "Can I see results before committing?", a: "Yes. We offer a free clinic audit with a written report showing exactly where your current gaps are, what we'd do, and what results you could expect. No commitment required." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" id="faq" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-10">
          <span className="badge-light mb-4">FAQ</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Questions Clinics <span className="gradient-heading">Always Ask</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 }}
              className="card-white rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4">
                <span className="text-sm font-semibold text-[#00283C]">{f.q}</span>
                <span className={`text-[#00B4D8] transition-transform duration-200 flex-shrink-0 ${open === i ? "rotate-45" : ""}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{f.a}</p>
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
