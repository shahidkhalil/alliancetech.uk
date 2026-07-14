"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import AICallMockup from "@/components/AICallMockup";
import ReceptionistDemo from "@/components/ReceptionistDemo";
import FinalCTA from "@/components/FinalCTA";

const features = [
  { icon: "📞", title: "Answers Every Call", desc: "No more missed calls. The AI picks up 24/7 — nights, weekends, public holidays — in Urdu and English." },
  { icon: "📅", title: "Books Appointments", desc: "It checks your calendar and books the next available slot automatically. No human needed." },
  { icon: "🔁", title: "Handles Follow-Ups", desc: "Calls back missed numbers, sends WhatsApp reminders, and confirms appointments — all automated." },
  { icon: "🧠", title: "Learns Your Clinic", desc: "Trained on your services, prices, and FAQs — gives accurate answers without ever putting patients on hold." },
  { icon: "📊", title: "Call Analytics Dashboard", desc: "See every call, duration, outcome, and booking — in a live dashboard updated in real time." },
  { icon: "🔗", title: "Connects to Your System", desc: "Integrates with your existing clinic software or our EHR platform — no manual data entry." },
];

const stats = [
  { stat: "0", label: "Missed calls" },
  { stat: "24/7", label: "Availability" },
  { stat: "3x", label: "More bookings" },
  { stat: "5s", label: "Answer time" },
];

const faqs = [
  { q: "Does it speak Urdu?", a: "Yes. The AI handles both Urdu and English fluently — no accent issues, no hold music." },
  { q: "What if a patient has a complex query?", a: "It handles common questions automatically and escalates complex cases to your human staff via WhatsApp." },
  { q: "How long to set up?", a: "Typically 3–5 days. We train it on your clinic, test it, and go live." },
  { q: "Does it work with my existing number?", a: "Yes. We port your existing clinic number or set up a new dedicated line." },
  { q: "How many calls can it handle at once?", a: "Unlimited — it answers every call and website chat simultaneously. Unlike a human front desk, it never puts patients on hold or misses a call during peak hours, lunch, or after closing." },
  { q: "Will it reduce no-shows at my clinic?", a: "Yes. It sends automatic WhatsApp confirmations and reminders before each appointment, which typically cuts no-shows significantly for busy clinics." },
  { q: "How much does an AI receptionist cost in Pakistan?", a: "Pricing depends on your call volume and features. For most busy clinics it costs a fraction of a full-time receptionist's salary while handling far more calls. Book a free demo and we'll quote based on your clinic." },
  { q: "Can it book appointments into my calendar?", a: "Yes. It qualifies the patient, checks the service and preferred time, and books the appointment directly — then confirms by email and WhatsApp, with the booking landing in your system instantly." },
  { q: "Is it only for dental clinics?", a: "No. It works for dental, aesthetic, dermatology, hair transplant, and multi-specialty clinics — any high-volume practice losing patients to missed calls. It's trained on your specific services and prices." },
];

export default function AIReceptionist() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="AI RECEPTIONIST FOR BUSY CLINICS"
        headline="Too Many Calls, Too Few Staff?"
        highlight="Never Miss a Patient Again"
        subheadline="Busy clinics miss 25–40% of calls at peak hours — every one a lost patient. Our AI receptionist answers every call and chat at once, 24/7 in Urdu & English, and books them automatically. Try the live demo below."
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

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
            Try It <span className="gradient-heading">Right Now</span>
          </h2>
          <p className="text-gray-500">
            This is a live AI receptionist for a sample clinic. Ask about prices, timings, treatments — or book an appointment. English or Urdu, it just works.
          </p>
        </div>
        <ReceptionistDemo />
      </section>

      <section className="py-16 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
            Hear It <span className="gradient-heading">In Action</span>
          </h2>
          <p className="text-gray-500">A real call, answered, qualified, and booked — without a single human involved.</p>
        </div>
        <AICallMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            What the AI <span className="gradient-heading">Handles For You</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Every phone interaction your clinic receives — automated, professional, and never on hold.
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

      {/* SEO content — targets high-volume clinics by their pain */}
      <section className="py-16 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] text-center mb-6">
            Built for <span className="gradient-heading">High-Volume Clinics</span>
          </h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              If your clinic takes dozens of calls a day, your front desk is drowning. During peak hours the line is busy, patients hang up, and every unanswered call is a patient who just booked with the clinic down the road instead. Research shows clinics miss <strong>25–40% of incoming calls</strong> at their busiest — and most callers never try again.
            </p>
            <p>
              An <strong>AI receptionist</strong> removes that ceiling. It answers <strong>every call and website chat at once</strong>, 24/7, in Urdu and English — no hold music, no voicemail, no missed patients after hours or during Friday prayers. While your staff handles the patient in the chair, the AI handles the twenty patients trying to reach you: answering price and timing questions, qualifying them, and <strong>booking appointments straight into your calendar</strong>.
            </p>
            <p>
              For a busy dental, aesthetic, dermatology, or multi-specialty clinic, the math is simple. Recovering even <strong>5 missed bookings a day</strong> — at an average patient value of PKR 15,000 — is over <strong>PKR 20 lakh a month</strong> in appointments you were already paying marketing to generate but losing at the phone. That&apos;s the leak an AI receptionist closes.
            </p>
            <p>
              It also cuts your <strong>no-show rate</strong> with automatic confirmations and reminders, and gives you a record of every conversation — so you finally see how many patients are calling after hours. It works alongside your existing staff and phone number, not instead of them: your team stops firefighting the phone and starts closing high-value treatments.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
