"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";

const features = [
  { icon: "📣", title: "Lahore-Targeted Ads", desc: "Google and Meta campaigns geo-targeted to Lahore — Defence, Gulberg, Johar Town, Bahria, and more." },
  { icon: "📍", title: "Google Maps Dominance", desc: "Rank in the top 3 for every dental search in your Lahore neighbourhood within 60 days." },
  { icon: "🌐", title: "Lahore Dental Website", desc: "Professional website with local SEO baked in — pages for every area you serve." },
  { icon: "⭐", title: "5-Star Reviews", desc: "Build your Google rating to 4.9+ with automated review requests after every appointment." },
  { icon: "📱", title: "WhatsApp Automation", desc: "Instant replies to Lahore patients on WhatsApp — appointment booking in under 5 seconds." },
  { icon: "📊", title: "Live Dashboard", desc: "Track every lead, call, and booking from your Lahore campaigns in real time." },
];

const stats = [
  { stat: "#1", label: "Google Maps Lahore" },
  { stat: "4x", label: "Return on ad spend" },
  { stat: "60", label: "Days to top ranking" },
  { stat: "50+", label: "Lahore clinics served" },
];

const areas = ["DHA Lahore", "Gulberg", "Johar Town", "Bahria Town", "Model Town", "Garden Town", "Cantt", "Wapda Town", "Allama Iqbal Town", "Faisal Town"];

export default function DentalClinicLahore() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="DENTAL MARKETING — LAHORE"
        headline="The #1 Dental Marketing Agency"
        highlight="in Lahore"
        subheadline="We help Lahore dental clinics dominate Google Maps, run profitable ads, and fill their appointment books — guaranteed results in 60 days."
        ctaText="Get Your Free Clinic Audit"
      />

      <section className="py-12 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-[#00283C] mb-1">{s.stat}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            Built for <span className="gradient-heading">Lahore Clinics</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            We know Lahore — the areas, the competition, the search terms your patients use. That local edge is why our campaigns outperform generic agencies.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card-white card-accent-light rounded-xl p-6 hover:-translate-y-1 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-[#00283C] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="card-white rounded-2xl p-10 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-[#00283C] mb-2">Areas We Cover in Lahore</h2>
            <p className="text-sm text-gray-400 mb-6">Hyper-local targeting for every major Lahore neighbourhood.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {areas.map((a) => (
                <span key={a} className="px-4 py-2 rounded-full text-sm font-semibold text-[#0077A8] bg-white border border-[#00B4D8]/30">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
