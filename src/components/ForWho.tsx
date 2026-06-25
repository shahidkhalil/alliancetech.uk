"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";

export default function ForWho() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">WHO WE HELP</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4">
            The Perfect Agency for <span className="gradient-heading">Clinic Owners</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* For Dental Clinics */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="card-white card-accent-light rounded-xl p-8"
          >
            <div className="text-4xl mb-4">🦷</div>
            <h3 className="text-xl font-extrabold text-[#00283C] mb-3">FOR DENTAL CLINICS</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Whether you&apos;re a solo dentist or running a multi-chair practice — we fill your appointment book with the right patients every month.
            </p>
            <ul className="space-y-3 mb-7">
              {[
                "Get to #1 on Google Maps in your area",
                "Run targeted ads for implants, orthodontics & cosmetic work",
                "AI that books patients from WhatsApp while you sleep",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-[#00B4D8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={openForm}
              className="btn-dark px-6 py-3 text-sm w-full">
              Grow My Dental Clinic →
            </button>
          </motion.div>

          {/* For Aesthetic Clinics */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="card-white card-accent-light rounded-xl p-8"
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-extrabold text-[#00283C] mb-3">FOR AESTHETIC CLINICS</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Botox, fillers, laser, skin treatments — aesthetic patients decide with their eyes. We make sure they see your clinic first, and trust it enough to book.
            </p>
            <ul className="space-y-3 mb-7">
              {[
                "Instagram & TikTok campaigns that convert",
                "Before & after content strategy that builds trust",
                "WhatsApp AI handling inquiries in Urdu & English",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-[#00B4D8] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={openForm}
              className="btn-dark px-6 py-3 text-sm w-full">
              Grow My Aesthetic Clinic →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
