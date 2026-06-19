"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";

const steps = [
  { num: "01", title: "Free Clinic Audit", desc: "We analyse your current online presence — Google ranking, website, social ads, WhatsApp — and identify exactly where patients are leaking out.", time: "Day 1" },
  { num: "02", title: "Custom Growth Plan", desc: "We build a tailored plan for your clinic: which channels to focus on, what budget to set, and what results to expect in 30, 60, and 90 days.", time: "Day 2–3" },
  { num: "03", title: "Onboarding & Setup", desc: "We set up your ads, website, AI receptionist, WhatsApp automation, and EHR — all configured and ready before we go live.", time: "Week 1" },
  { num: "04", title: "Launch & Optimise", desc: "We go live, monitor performance daily, and optimise based on what your specific clinic patients respond to.", time: "Week 2" },
  { num: "05", title: "Monthly Reporting", desc: "You get a clear monthly report: patients acquired, cost per lead, Google ranking changes, WhatsApp inquiries handled, and ROI.", time: "Monthly" },
  { num: "06", title: "Scale & Grow", desc: "Once we know what works, we scale what converts — more patients, more revenue, without proportionally more spend.", time: "Ongoing" },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">HOW IT WORKS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Your Timeline to <span className="gradient-heading">Clinic Growth</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A clear, structured process — no guesswork, no jargon. You&apos;ll always know exactly what we&apos;re doing and why.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {steps.map((s, i) => (
            <motion.div key={s.num}
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="card-white rounded-xl p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl font-extrabold text-[#E2EBF0]">{s.num}</span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E6F4F8] text-[#0077A8] border border-[#00B4D8]/20">{s.time}</span>
              </div>
              <h3 className="text-base font-bold text-[#00283C] mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}
          className="text-center">
          <button onClick={openForm} className="btn-dark px-8 py-4 text-base">
            Start Your Clinic Growth Audit — Free
          </button>
          <p className="text-gray-400 text-sm mt-3">No contracts. No commitments. Just a clear plan for your clinic.</p>
        </motion.div>
      </div>
    </section>
  );
}
