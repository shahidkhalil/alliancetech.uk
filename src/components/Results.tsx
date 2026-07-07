"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const caseStudies = [
  {
    clinic: "Dental Clinic, DHA Lahore",
    type: "Dental",
    results: [
      { metric: "320%", label: "More monthly appointments" },
      { metric: "4.2x", label: "Return on ad spend" },
      { metric: "60 days", label: "To full results" },
    ],
    quote: "We went from 40 patients a month to 170+ in under two months. Alliance Tech is the real deal.",
    name: "Dr. Ahmed R.",
  },
  {
    clinic: "Aesthetic Clinic, Gulberg",
    type: "Aesthetic",
    results: [
      { metric: "280%", label: "More booking inquiries" },
      { metric: "4.8★", label: "Google rating" },
      { metric: "55%", label: "Reduction in no-shows" },
    ],
    quote: "Our WhatsApp was getting 5 messages a week. Now it's 50+ — and the AI handles all of them.",
    name: "Dr. Sara M.",
  },
  {
    clinic: "Multi-chair Clinic, Karachi",
    type: "Dental",
    results: [
      { metric: "#1", label: "Google Maps in area" },
      { metric: "190%", label: "New patient growth" },
      { metric: "0", label: "Missed calls since AI" },
    ],
    quote: "We were losing patients to clinics with worse doctors but better online presence. Not anymore.",
    name: "Dr. Faisal K.",
  },
];

export default function Results() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" id="results" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">CLIENT RESULTS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Real Clinics. <span className="gradient-heading">Real Growth.</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We&apos;ve helped 100+ dental and aesthetic clinics across Pakistan grow their patient base with measurable results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((c, i) => (
            <motion.div key={c.clinic}
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="card-white rounded-xl overflow-hidden">
              <div className="bg-[#00283C] px-6 py-4">
                <div className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">{c.type} Clinic</div>
                <div className="text-sm font-bold text-white">{c.clinic}</div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {c.results.map((r) => (
                    <div key={r.label} className="text-center">
                      <div className="text-xl font-extrabold text-[#0077A8]">{r.metric}</div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{r.label}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 italic leading-relaxed mb-3">&ldquo;{c.quote}&rdquo;</p>
                  <p className="text-xs font-bold text-[#00283C]">— {c.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <a href="/portfolio" className="btn-dark px-7 py-3.5 text-sm inline-flex items-center gap-2">
            See Our Work →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
