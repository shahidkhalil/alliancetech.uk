"use client";
import { motion } from "framer-motion";
import { useForm } from "@/context/FormContext";
import { ArrowLeft } from "lucide-react";

interface Props {
  badge: string;
  headline: string;
  highlight: string;
  subheadline: string;
  ctaText?: string;
}

export default function ServicePageHero({ badge, headline, highlight, subheadline, ctaText = "Book Free Consultation" }: Props) {
  const { openForm } = useForm();

  return (
    <section className="relative pt-32 pb-16 bg-white border-b border-gray-100 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,40,60,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Teal glow top-right */}
      <div className="absolute top-0 right-0 w-[500px] h-[350px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>

          <span className="badge-light mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
            {badge}
          </span>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-tight mb-5 mt-3">
            {headline}{" "}
            <span className="gradient-heading">{highlight}</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mb-10 leading-relaxed">{subheadline}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button onClick={openForm} className="btn-dark px-8 py-4 text-base">
              {ctaText}
            </button>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#00283C] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
