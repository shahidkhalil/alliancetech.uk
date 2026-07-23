"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Star, MessageCircle } from "lucide-react";
import {
  UK_GOOGLE_REVIEWS,
  UK_REVIEW_LABEL,
  UK_REVIEW_SCORE,
  UK_WHATSAPP_URL,
} from "@/lib/ukContact";
import { useForm } from "@/context/FormContext";

const proofs = [
  {
    icon: Star,
    title: `${UK_REVIEW_SCORE}★ on Google`,
    desc: "Software company in Blackburn — real UK reviews from clinic owners.",
  },
  {
    icon: ShieldCheck,
    title: "GDPR-ready systems",
    desc: "Built for UK practices. Patient data handled carefully — no selling of enquiry data.",
  },
  {
    icon: MapPin,
    title: "Based in Blackburn",
    desc: "North West first, then UK-wide. We understand private dentistry & aesthetic clinics.",
  },
];

const cases = [
  {
    place: "Manchester dental practice",
    result: "+38% new patient enquiries in 60 days",
    detail: "Local SEO + AI WhatsApp follow-up for a busy private practice.",
  },
  {
    place: "Blackburn aesthetic clinic",
    result: "Missed calls cut to near zero",
    detail: "24/7 AI receptionist answering after 5pm and weekends.",
  },
  {
    place: "London multi-site clinic",
    result: "Maps ranking into top 3",
    detail: "Google Business Profile + location pages for each site.",
  },
];

export default function UkTrustProof() {
  const { openForm } = useForm();

  return (
    <section className="py-14 lg:py-18 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="badge-light mb-4">TRUSTED BY UK CLINICS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Built for the <span className="gradient-heading">United Kingdom</span>
          </h2>
          <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
            We reply within 2 hours Mon–Sat (UK time). Start with a free clinic audit — talk to a real person, not a ticket queue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {proofs.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-6"
            >
              <p.icon className="w-5 h-5 text-[#0077A8] mb-3" strokeWidth={2} />
              <p className="font-bold text-[#00283C] mb-1">{p.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-10">
          {cases.map((c) => (
            <div key={c.place} className="rounded-2xl border border-[#00283C]/08 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0077A8] mb-2">{c.place}</p>
              <p className="text-lg font-extrabold text-[#00283C] mb-2">{c.result}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="uk_trust_proof"
            className="inline-flex items-center gap-2 btn-dark px-6 py-3.5 text-sm w-full sm:w-auto justify-center"
          >
            Get Your Free Clinic Audit
          </button>
          <a
            href={UK_WHATSAPP_URL}
            target={UK_WHATSAPP_URL.startsWith("http") ? "_blank" : undefined}
            rel={UK_WHATSAPP_URL.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 border border-[#00283C]/20 text-[#00283C] font-bold px-6 py-3.5 rounded-md text-sm hover:bg-[#F8FAFC] w-full sm:w-auto justify-center"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp us
          </a>
          <a
            href={UK_GOOGLE_REVIEWS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0077A8] hover:underline"
          >
            <Star className="w-4 h-4 fill-current" /> See {UK_REVIEW_LABEL}
          </a>
        </div>
      </div>
    </section>
  );
}
