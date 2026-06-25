"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "FCConvert",
    role: "Verified Google Review",
    quote: "Professional team with great expertise in healthcare marketing.",
    stars: 5,
    initials: "FC",
  },
  {
    name: "Dizi Sultana",
    role: "Verified Google Review",
    quote: "Professional team with great expertise in healthcare marketing.",
    stars: 5,
    initials: "D",
  },
  {
    name: "Shahid Zia",
    role: "Verified Google Review",
    quote: "Outstanding service and support. From website development to Google Maps ranking, Alliance Tech handled everything professionally.",
    stars: 5,
    initials: "S",
  },
  {
    name: "Saim Ali",
    role: "Verified Google Review",
    quote: "Alliance Tech delivered exactly what they promised.",
    stars: 5,
    initials: "SA",
  },
  {
    name: "Tehreem",
    role: "Verified Google Review",
    quote: "Excellent digital marketing services for healthcare businesses.",
    stars: 5,
    initials: "T",
  },
  {
    name: "Steve Jhon",
    role: "Verified Google Review",
    quote: "Excellent web development service.",
    stars: 5,
    initials: "S",
  },
  {
    name: "Democracy progressive Pro Updates",
    role: "Verified Google Review",
    quote: "We hired Alliance Tech for website development in Kareem Block, Allama Iqbal Town. The website looks professional and mobile-friendly.",
    stars: 5,
    initials: "DP",
  },
  {
    name: "Ahmad Ilyas",
    role: "Verified Google Review",
    quote: "Our website was outdated and slow. Alliance Tech completely redesigned it and improved the user experience.",
    stars: 4,
    initials: "A",
  },
  {
    name: "Muhammad Hamza",
    role: "Verified Google Review",
    quote: "Professional, responsive, and results-driven. Their healthcare marketing expertise helped us grow our clinic's reputation in Lahore.",
    stars: 5,
    initials: "MH",
  },
  {
    name: "Ahmad ilyas",
    role: "Verified Google Review",
    quote: "They managed our social media very well. Now we are getting more reach.",
    stars: 5,
    initials: "A",
  },
  {
    name: "Hassan Shafique",
    role: "Local Guide, Verified Google Review",
    quote: "Great workspace with great environment!",
    stars: 5,
    initials: "HS",
  },
  {
    name: "Rashid Sadiq",
    role: "Verified Google Review",
    quote: "Good place.",
    stars: 5,
    initials: "RS",
  },
  {
    name: "Muhammad Sarmad Rasheed (Ali)",
    role: "Local Guide, Verified Google Review",
    quote: "Good service.",
    stars: 5,
    initials: "MS",
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
            <span className="text-gray-700 font-bold">5.0 / 5</span>
            <a href="https://share.google/Qt7j63D8W1G2NTjtA" target="_blank" rel="noopener noreferrer"
              className="text-[#0077A8] text-sm font-semibold hover:underline">
              See our reviews on Google →
            </a>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name + i}
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}
          className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-3">Had a great experience with us?</p>
          <a href="https://g.page/r/CXJTY6Ac29IaEAE/review" target="_blank" rel="noopener noreferrer"
            className="btn-dark px-6 py-3 text-sm inline-block">
            Leave Us a Review on Google →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
