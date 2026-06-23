"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";

const beliefs = [
  { lead: "Every patient lost is preventable.", desc: "A missed call, an unanswered WhatsApp message, a Google listing buried on page two. None of that is inevitable. It's a system failing the doctor behind it, and systems can be fixed." },
  { lead: "Local context isn't optional.", desc: "Urdu and English, Lahore and Karachi, the way Pakistani patients actually search and book. Software built for another market and translated at the edges will always feel foreign here." },
  { lead: "Automation should feel human.", desc: "An AI receptionist that books an appointment correctly but sounds like a machine has only solved half the problem. We build for warmth and accuracy together, not one at the cost of the other." },
];

const vision = [
  { stat: "500+", label: "Clinics by 2027" },
  { stat: "1", label: "Platform, every growth need" },
  { stat: "0", label: "Patients lost to silence" },
];

function BeliefRow({ b, i }: { b: { lead: string; desc: string }; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
      className={`grid md:grid-cols-[1fr_1.6fr] gap-6 md:gap-10 py-8 ${i > 0 ? "border-t border-gray-100" : ""}`}
    >
      <p className="text-xl lg:text-2xl font-extrabold text-[#00283C] tracking-tight leading-snug">{b.lead}</p>
      <p className="text-gray-500 leading-relaxed">{b.desc}</p>
    </motion.div>
  );
}

export default function OurMission() {
  const visionRef = useRef(null);
  const visionInView = useInView(visionRef, { once: true, margin: "-60px" });

  return (
    <PageWrapper>
      <ServicePageHero
        badge="OUR MISSION"
        headline="Healthcare Growth Shouldn't"
        highlight="Depend on Luck"
        subheadline="Pakistan has thousands of skilled doctors running clinics that deserve to be full. We build the systems that make sure they are."
        ctaText="Work With Us"
      />

      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl lg:text-3xl font-bold text-[#00283C] leading-snug tracking-tight">
            Most clinics that struggle aren't struggling because the care is lacking. They're struggling because the digital infrastructure around them was never built for healthcare in Pakistan. We started Alliance Tech to close that gap.
          </p>
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] text-center mb-2">What We Believe</h2>
          <p className="text-gray-400 text-center mb-2">Three principles behind every product we build.</p>
          <div>
            {beliefs.map((b, i) => <BeliefRow key={b.lead} b={b} i={i} />)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#00283C]" ref={visionRef}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white text-center mb-10">Where We're Headed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {vision.map((v, i) => (
              <motion.div key={v.label}
                initial={{ opacity: 0, y: 16 }} animate={visionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`text-center py-2 ${i > 0 ? "sm:border-l border-white/10" : ""}`}>
                <div className="text-4xl lg:text-5xl font-extrabold mb-2" style={{ color: "#00B4D8" }}>{v.stat}</div>
                <div className="text-white/50 text-sm">{v.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
