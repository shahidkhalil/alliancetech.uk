"use client";
import { useForm } from "@/context/FormContext";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "@/components/Motion/Reveal";
import { DURATION, EASE_OUT_EXPO } from "@/animations/scroll";
import { UK_PHONE_DISPLAY, UK_PHONE_TEL, UK_WHATSAPP_URL, UK_REVIEW_SCORE, UK_GOOGLE_REVIEWS } from "@/lib/ukContact";

export default function FinalCTA() {
  const { openForm } = useForm();
  const reduced = useReducedMotion();
  const whatsappExternal = UK_WHATSAPP_URL.startsWith("http");

  return (
    <section className="relative py-16 lg:py-20 bg-[#00283C] overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-24 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-[#00B4D8]/25 blur-3xl"
        animate={reduced ? undefined : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
        transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">
          ONLY ACCEPTING 10 NEW CLINICS THIS MONTH
        </p>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
          Ready to Grow Your Clinic?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          After 10,000+ audit hours and 100+ clinics served, we know exactly what it takes to fill your appointment book. Start with a free audit — minimum 3–6 month engagement.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="final_cta"
            className="bg-white text-[#00283C] font-bold px-8 py-4 rounded-md text-base hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
            whileHover={reduced ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
          >
            Get Your Free Clinic Audit
          </motion.a>
          <a
            href={UK_WHATSAPP_URL}
            target={whatsappExternal ? "_blank" : undefined}
            rel={whatsappExternal ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 text-sm font-semibold text-white border border-white/30 px-6 py-4 rounded-md hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
          >
            WhatsApp us
          </a>
        </div>
        <div className="text-white/70 text-sm mt-5">
          Prefer a call?{" "}
          <a href={UK_PHONE_TEL} className="font-semibold text-white underline underline-offset-2 hover:text-[#9FD3E8]">
            {UK_PHONE_DISPLAY || "Contact us"}
          </a>
          {" · "}
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="final_cta"
            className="font-semibold text-white underline underline-offset-2 hover:text-[#9FD3E8]"
          >
            Book a free strategy call
          </button>
        </div>
        <p className="text-white/75 text-xs mt-6">
          <a
            href={UK_GOOGLE_REVIEWS}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-2 hover:text-[#9FD3E8]"
          >
            ★★★★★ {UK_REVIEW_SCORE} Google reviews
          </a>
          {" · "}
          Blackburn, UK · Reply within 2 hours Mon–Sat · GDPR-aware · 3–6 month minimum
        </p>
      </Reveal>
    </section>
  );
}
