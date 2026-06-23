"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";

const features = [
  { icon: "📣", title: "Google Search & Display Ads", desc: "Show up when patients search 'dental implants Lahore' or 'botox near me' — targeted to your treatments and city, not generic clicks." },
  { icon: "📱", title: "Facebook & Instagram Ads", desc: "Scroll-stopping ad creative aimed at people in your area who match your ideal patient profile — not random reach." },
  { icon: "🎯", title: "Audience Targeting by Treatment", desc: "Separate campaigns for implants, whitening, botox, laser — so your budget goes to the patients actually looking for that treatment." },
  { icon: "✍️", title: "Ad Creative & Copywriting", desc: "We write and design every ad — no generic templates. Creative is built around your clinic's actual services and offers." },
  { icon: "📊", title: "Weekly Performance Reports", desc: "See exactly what you spent, how many leads came in, and what it cost per booked patient — every week." },
  { icon: "🤝", title: "Monthly Strategy Calls", desc: "A real strategy review every month — what's working, what to scale, what to cut." },
];

const stats = [
  { stat: "4x", label: "Avg. return on ad spend" },
  { stat: "30 days", label: "To first patient results" },
  { stat: "100+", label: "Clinics run campaigns for" },
  { stat: "2", label: "Platforms — Google & Meta" },
];

const faqs = [
  { q: "How much should I budget for ads?", a: "Most clinics start between PKR 50,000–150,000/month in ad spend, scaled up once we see what's converting. We'll recommend a number based on your city and treatments." },
  { q: "How is this different from a generic marketing agency?", a: "We only run campaigns for dental and aesthetic clinics. Every targeting strategy, ad angle, and landing page is built specifically for healthcare patient acquisition — not adapted from retail or e-commerce playbooks." },
  { q: "Do you handle the ad spend or just management?", a: "You control your own ad account and budget — we manage strategy, creative, targeting, and optimisation. Full transparency on every rupee spent." },
];

export default function DigitalMarketingForClinics() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="DIGITAL MARKETING FOR CLINICS"
        headline="Patients Actively Searching"
        highlight="For Your Treatments"
        subheadline="Google and Meta ad campaigns built exclusively for dental and aesthetic clinics in Pakistan — targeted by city and treatment, not generic templates."
        ctaText="Get a Free Ad Strategy Audit"
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
            Campaigns Built For <span className="gradient-heading">Clinics, Not Retail</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Every campaign is tailored to your clinic type, location, and target patient — not a copy-paste template.
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
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#00283C] text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-[#00283C] mb-2">{f.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
