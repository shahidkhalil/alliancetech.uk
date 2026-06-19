"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "Dr. Ahmed Raza",
    role: "Dental Surgeon, DHA Lahore",
    quote: "We went from 40 patients a month to 170+ in under two months. The AI receptionist alone saved us 3 hours of staff time daily. Alliance Tech is the real deal.",
    stars: 5,
    initials: "AR",
  },
  {
    name: "Dr. Sara Malik",
    role: "Aesthetic Clinic, Gulberg",
    quote: "Our WhatsApp was getting 5 messages a week. Now it's 50+ and the AI handles all of them in Urdu and English. Bookings doubled in the first month.",
    stars: 5,
    initials: "SM",
  },
  {
    name: "Dr. Faisal Khan",
    role: "Multi-chair Clinic, Karachi",
    quote: "We were losing patients to clinics with worse doctors but better online presence. Alliance Tech got us to #1 on Google Maps in 45 days.",
    stars: 5,
    initials: "FK",
  },
  {
    name: "Dr. Nadia Hussain",
    role: "Skin Clinic, Islamabad",
    quote: "The EHR system alone was worth it. No more paper registers, no lost prescriptions, and patients love the app to book their own appointments.",
    stars: 5,
    initials: "NH",
  },
  {
    name: "Dr. Tariq Mahmood",
    role: "Orthodontist, Rawalpindi",
    quote: "I was skeptical about WhatsApp AI. But when I saw it booking 3 patients at 11pm while I was asleep, I became a believer.",
    stars: 5,
    initials: "TM",
  },
  {
    name: "Dr. Ayesha Siddiqui",
    role: "Cosmetic Dentist, Lahore",
    quote: "Professional, fast, and they actually understand clinics. My website was done in a week and it looks better than any clinic site I've seen in Pakistan.",
    stars: 5,
    initials: "AS",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">WHAT CLINICS SAY</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Loved by Doctors Across <span className="gradient-heading">Pakistan</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-amber-400 text-xl">★★★★★</span>
            <span className="text-gray-700 font-bold">4.9 / 5</span>
            <span className="text-gray-400 text-sm">— average from 100+ clinic reviews</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="card-white rounded-xl p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00283C] flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#00283C]">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
