"use client";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";
import { Card, CardStatPill } from "@/components/ui/Card";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/animations/scroll";

const steps = [
  { num: "01", title: "Free Clinic Audit", desc: "We analyse your current online presence — Google ranking, website, social ads, WhatsApp — and identify exactly where patients are leaking out.", time: "Day 1" },
  { num: "02", title: "Custom Growth Plan", desc: "We build a tailored plan for your clinic: which channels to focus on, what budget to set, and what results to expect in 30, 60, and 90 days.", time: "Day 2–3" },
  { num: "03", title: "Onboarding & Setup", desc: "We set up your ads, website, AI receptionist, WhatsApp automation, and EHR — all configured and ready before we go live.", time: "Week 1" },
  { num: "04", title: "Launch & Optimise", desc: "We go live, monitor performance daily, and optimise based on what your specific clinic patients respond to.", time: "Week 2" },
  { num: "05", title: "Monthly Reporting", desc: "You get a clear monthly report: patients acquired, cost per lead, Google ranking changes, WhatsApp inquiries handled, and ROI.", time: "Monthly" },
  { num: "06", title: "Scale & Grow", desc: "Once we know what works, we scale what converts — more patients, more revenue, without proportionally more spend.", time: "Ongoing" },
];

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 40%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.05, 1]);

  return (
    <section className="py-16 lg:py-20 bg-white relative overflow-hidden" ref={ref} id="process">
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
          className="text-center mb-12"
        >
          <span className="badge-light mb-4">HOW IT WORKS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Your Timeline to <span className="gradient-heading">Clinic Growth</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A clear, structured process — no guesswork, no jargon. You&apos;ll always know exactly what we&apos;re doing and why.
          </p>
        </motion.div>

        {/* Progress line */}
        <div className="hidden lg:block absolute left-1/2 top-[220px] bottom-40 w-px bg-gray-100 -translate-x-1/2" aria-hidden>
          <motion.div
            className="w-full origin-top bg-gradient-to-b from-[#00B4D8] to-[#00283C]"
            style={{ scaleY: lineScale, height: "100%" }}
          />
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduced ? 0 : STAGGER.base } },
          }}
        >
          {steps.map((s) => (
            <motion.div
              key={s.num}
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
                },
              }}
            >
              <Card accent feature skipEntrance className="p-6 lg:p-7 relative h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl font-extrabold bg-gradient-to-br from-[#00283C] to-[#0077A8] bg-clip-text text-transparent opacity-30">
                    {s.num}
                  </span>
                  <CardStatPill>{s.time}</CardStatPill>
                </div>
                <h3 className="text-base font-bold text-[#00283C] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
          className="text-center"
        >
          <button type="button" onClick={openForm} className="btn-dark px-8 py-4 text-base">
            Get Your Free Clinic Audit
          </button>
          <p className="text-gray-400 text-sm mt-3">
            Minimum 3–6 month engagement. Just enough time for results to compound and your ROI to become undeniable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
