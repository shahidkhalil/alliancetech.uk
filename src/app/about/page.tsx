import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About Alliance Tech | AI & Growth Agency for Clinics in the US",
  description:
    "Meet Alliance Tech — the AI and growth agency helping US dental and aesthetic clinics win more patients with automation, websites, and SEO.",
  alternates: { canonical: "/about" },
};

const featuredValue = {
  icon: "🎯",
  title: "Results First",
  desc: "Every strategy, campaign, and tool we deploy is measured against one metric: more patients for your clinic. Not impressions, not vanity reach.",
};

const values = [
  { icon: "🤝", title: "Built for the United States", desc: "We understand the American healthcare market: patient behaviour, English communication, and local search patterns." },
  { icon: "⚡", title: "Speed to Results", desc: "Our systems show measurable results within 30 to 60 days, not months of waiting for organic growth." },
  { icon: "🔒", title: "Transparent & Honest", desc: "No vanity metrics. Clear, honest reporting on what's working, what we're testing, and what your ROI is." },
];

const services = [
  "Dental Clinic Growth", "Aesthetic Clinic Growth", "AI Receptionist",
  "WhatsApp AI Automation", "EHR Platform", "Local SEO for Clinics",
  "Paid Ads (Google & Meta)", "Social Media Management", "Reputation Management",
];

export default function About() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="ABOUT ALLIANCE TECH"
        headline="We Grow Clinics With"
        highlight="AI & Automation"
        subheadline="Alliance Tech is America's first AI-powered healthcare growth agency, helping dental and aesthetic clinics attract more patients, automate operations, and scale faster."
        ctaText="Get Your Free Clinic Audit"
      />

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="badge-light mb-4">OUR MISSION</span>
          <h2 className="text-2xl font-bold text-[#00283C] mt-4 mb-6">Why We Built Alliance Tech</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            We believe every talented doctor in the US deserves a full appointment book. Too many great clinics struggle to attract patients, not because their care is lacking, but because they lack the digital infrastructure to compete. We built Alliance Tech to fix that.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-10">
            What We <span className="gradient-heading">Stand For</span>
          </h2>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-3 rounded-2xl p-8 lg:p-10 bg-[#00283C] text-white">
              <span className="text-4xl mb-4 inline-block">{featuredValue.icon}</span>
              <h3 className="text-xl font-bold mb-2">{featuredValue.title}</h3>
              <p className="text-white/65 leading-relaxed max-w-xl">{featuredValue.desc}</p>
            </div>
            <FeatureCardGrid items={values} className="grid lg:grid-cols-3 gap-5" />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <AnimatedSurface feature className="max-w-4xl mx-auto px-6 rounded-3xl p-10 lg:p-12 text-center" delay={0.15}>
          <h2 className="text-2xl font-bold text-[#00283C] mb-4">What We Do</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">A complete growth stack for healthcare clinics across the United States.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => (
              <span key={s} className="px-4 py-2 rounded-full text-sm text-gray-600 bg-[#F8FAFC] border border-gray-200">{s}</span>
            ))}
          </div>
        </AnimatedSurface>
      </section>

      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4">
          {[
            { stat: "100+", label: "Clinics served" },
            { stat: "3", label: "Cities served" },
            { stat: "300%", label: "Avg. patient growth" },
            { stat: "24/7", label: "AI systems running" },
          ].map((r, i) => (
            <div key={r.label} className={`text-center py-2 ${i > 0 ? "lg:border-l border-gray-100" : ""}`}>
              <div className="text-4xl font-extrabold text-[#00283C] mb-1">{r.stat}</div>
              <div className="text-sm text-gray-400">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
