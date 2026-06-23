"use client";
import { motion } from "framer-motion";
import { useForm } from "@/context/FormContext";

const marqueeItems = [
  "🦷 Dental Clinics", "✨ Aesthetic Clinics", "📍 Lahore", "🏙️ Karachi",
  "🌆 Islamabad", "🤖 AI Receptionist", "💬 WhatsApp AI", "🌐 Clinic Websites",
  "📱 Patient Apps", "🔍 Local SEO", "📣 Google Ads", "🏥 EHR Platform",
  "🦷 Dental Clinics", "✨ Aesthetic Clinics", "📍 Lahore", "🏙️ Karachi",
  "🌆 Islamabad", "🤖 AI Receptionist", "💬 WhatsApp AI", "🌐 Clinic Websites",
  "📱 Patient Apps", "🔍 Local SEO", "📣 Google Ads", "🏥 EHR Platform",
];

export default function Hero() {
  const { openForm } = useForm();

  return (
    <section className="relative pt-28 pb-0 overflow-hidden bg-white">

      {/* Full-screen video — temporarily hidden
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero-bg.mp4"
      />
      */}

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,40,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Soft teal glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative min-h-[70vh] flex items-center">
        <div className="max-w-4xl mx-auto px-6 text-center py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge-light inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
              Top Reviewed Clinic Growth Agency in Pakistan
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00283C] tracking-tight leading-[1.1] mb-6"
          >
            Most Dental Clinics Lose Patients<br />
            to Competitors Every Day. <span className="gradient-heading">We Fix That.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-9 leading-relaxed"
          >
            We fix the three things costing you patients: invisible Google ranking, missed WhatsApp inquiries, and wasted ad spend. One agency, every channel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={openForm}
              className="btn-dark px-8 py-4 text-base w-full sm:w-auto">
              Get Your Free Clinic Audit
            </button>
            <a href="https://wa.me/923207800010" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold text-[#25D366] border border-[#25D366]/40 px-6 py-4 rounded-md hover:bg-[#25D366]/5 transition-colors w-full sm:w-auto justify-center">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>

      {/* Marquee / Logo bar */}
      <div className="border-t border-b border-gray-100 bg-[#F8FAFC] py-4 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {marqueeItems.map((item, i) => (
              <span key={i} className="inline-flex items-center mx-6 text-sm font-semibold text-gray-400">
                <span className="mr-2">{item}</span>
                <span className="text-[#00B4D8]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#00283C] py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { stat: "100+", label: "Clinics Served" },
            { stat: "4x", label: "Avg. Return on Ad Spend" },
            { stat: "60 days", label: "To Measurable Results" },
            { stat: "0", label: "Missed Leads After AI Setup" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white mb-0.5">{s.stat}</div>
              <div className="text-xs text-white/50 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
