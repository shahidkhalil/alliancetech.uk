"use client";
import { motion, useReducedMotion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import AICallMockup from "@/components/AICallMockup";
import ReceptionistDemo from "@/components/ReceptionistDemo";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, ContentCardList } from "@/components/ui/Card";
import AiReceptionistStory from "@/components/Motion/AiReceptionistStory";
import Reveal from "@/components/Motion/Reveal";
import CountUp from "@/components/Motion/CountUp";
import PrivacyTrustNote from "@/components/PrivacyTrustNote";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/animations/scroll";

const features = [
  { icon: "📞", title: "24/7 Call Answering", desc: "No more missed calls for your UK clinic. The AI picks up every time — nights, weekends, bank holidays — in natural English." },
  { icon: "💬", title: "Live Website Chat", desc: "The same AI receptionist answers chat on your website in real time, so patients get instant replies without ever picking up the phone." },
  { icon: "🟢", title: "WhatsApp Integration", desc: "Booking confirmations, reminders, and follow-ups land straight in the patient's WhatsApp — the channel UK patients already check first." },
  { icon: "🎙️", title: "Live Voice Agent", desc: "Patients can talk to the AI receptionist directly, in real time, and get a natural spoken conversation — not a robotic phone tree." },
  { icon: "📅", title: "Automated Appointment Booking", desc: "It checks your calendar and books the next available slot automatically, straight into your system. No human needed." },
  { icon: "🚨", title: "Emergency Triage", desc: "Detects bleeding, severe pain, swelling, and other urgent symptoms — alerts your front desk, holds an emergency slot, and offers an immediate transfer." },
  { icon: "✅", title: "Instant Confirmations & Reminders", desc: "Every booking is confirmed by WhatsApp and email immediately, with automatic reminders that cut no-shows before they happen." },
  { icon: "🔁", title: "Missed-Call Follow-Ups", desc: "Calls back missed numbers automatically so no patient who tried to reach you is ever left hanging." },
  { icon: "🧠", title: "Trained on Your Clinic", desc: "Trained on your services, prices, hours, and FAQs — gives accurate answers without ever putting patients on hold." },
  { icon: "🎯", title: "Patient Qualification", desc: "Asks the right questions to qualify each caller before booking, so your calendar fills with patients who actually show up." },
  { icon: "🗣️", title: "Voice Notes Support", desc: "Patients who'd rather speak than type can send a voice note and still get booked — no app download required." },
  { icon: "📊", title: "Call & Chat Analytics Dashboard", desc: "See every call, chat, duration, outcome, and booking — in a live dashboard updated in real time." },
  { icon: "🔗", title: "Connects to Your System", desc: "Integrates with your existing clinic software or our EHR platform — no manual data entry, no double-booking." },
];

const stats = [
  { value: 0, suffix: "", label: "Missed calls", display: "0" },
  { value: 24, suffix: "/7", label: "Availability", display: null },
  { value: 3, suffix: "x", label: "More bookings", display: null },
  { value: 5, suffix: "s", label: "Answer time", display: null },
];

const faqs = [
  { q: "Does it sound natural?", a: "Yes. The AI speaks natural, fluent English — no hold music, no robotic phone tree." },
  { q: "What if a patient has a complex query?", a: "It handles common questions automatically and escalates complex cases to your human staff via WhatsApp. For emergencies (bleeding, severe pain, swelling), it runs triage: alerts your front desk, holds an emergency slot, and offers an immediate transfer." },
  { q: "How long to set up?", a: "Typically 3–5 days. We train it on your clinic, test it, and go live." },
  { q: "Does it work with my existing number?", a: "Yes. We port your existing clinic number or set up a new dedicated line." },
  { q: "How many calls can it handle at once?", a: "Unlimited — it answers every call and website chat simultaneously. Unlike a human front desk, it never puts patients on hold or misses a call during peak hours, lunch, or after closing." },
  { q: "Will it reduce no-shows at my clinic?", a: "Yes. It sends automatic WhatsApp confirmations and reminders before each appointment, which typically cuts no-shows significantly for busy clinics." },
  { q: "How much does an AI receptionist cost for a UK clinic?", a: "Pricing depends on your call volume and features. For most busy UK clinics it costs a fraction of a full-time receptionist's salary while handling far more calls. Book a free demo and we'll quote based on your clinic." },
  { q: "Can it book appointments into my calendar?", a: "Yes. It qualifies the patient, checks the service and preferred time, and books the appointment directly — then confirms by email and WhatsApp, with the booking landing in your system instantly." },
  { q: "Is it only for dental clinics?", a: "No. It works for dental, aesthetic, dermatology, hair transplant, and multi-specialty clinics — any high-volume practice losing patients to missed calls. It's trained on your specific services and prices." },
  { q: "Is the AI receptionist GDPR compliant?", a: "We design workflows for UK GDPR. Enquiry and booking data is used to respond and book — we do not sell patient or lead data. A data processing agreement can be included in your contract. See our Privacy Policy for details." },
];

function SectionHead({
  title,
  highlight,
  sub,
}: {
  title: string;
  highlight: string;
  sub: string;
}) {
  return (
    <Reveal className="max-w-3xl mx-auto px-6 text-center mb-10">
      <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
        {title} <span className="gradient-heading">{highlight}</span>
      </h2>
      <p className="text-gray-500">{sub}</p>
    </Reveal>
  );
}

export default function AIReceptionistPage() {
  const reduced = useReducedMotion();

  return (
    <PageWrapper>
      <ServicePageHero
        badge="AI RECEPTIONIST FOR UK CLINICS"
        headline="Too Many Calls, Too Few Staff?"
        highlight="Never Miss a Patient Again"
        subheadline="Busy UK clinics miss 25–40% of calls at peak hours — every one a lost patient. Our AI receptionist answers every call and chat at once, 24/7 in English, and books them automatically. Try the live demo below."
        ctaText="Get Your Free Clinic Audit"
      />

      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <PrivacyTrustNote className="text-center" />
        </div>
      </section>

      <AiReceptionistStory />

      <section className="py-12 bg-[#F8FAFC] border-b border-gray-100">
        <motion.div
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduced ? 0 : STAGGER.base } },
          }}
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
                },
              }}
            >
              <div className="text-4xl font-extrabold text-[#00283C] mb-1">
                {s.display ?? <CountUp value={s.value} suffix={s.suffix} />}
              </div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-16 bg-white border-b border-gray-100">
        <SectionHead
          title="Try It"
          highlight="Right Now"
          sub="This is a live AI receptionist for a sample UK clinic. Ask about prices, hours, treatments — or book an appointment."
        />
        <Reveal>
          <ReceptionistDemo />
        </Reveal>
      </section>

      <section className="py-16 bg-[#F8FAFC] border-b border-gray-100">
        <SectionHead
          title="Hear It"
          highlight="In Action"
          sub="A real call, answered, qualified, and booked — without a single human involved."
        />
        <Reveal>
          <AICallMockup />
        </Reveal>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHead
            title="What the AI"
            highlight="Handles For You"
            sub="Every phone interaction your clinic receives — automated, professional, and never on hold."
          />
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFC] border-y border-gray-100">
        <Reveal className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] text-center mb-6">
            Built for <span className="gradient-heading">High-Volume Clinics</span>
          </h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              If your clinic takes dozens of calls a day, your front desk is drowning. During peak hours the line is busy, patients hang up, and every unanswered call is a patient who just booked with the clinic down the road instead. Research shows clinics miss <strong>25–40% of incoming calls</strong> at their busiest — and most callers never try again.
            </p>
            <p>
              An <strong>AI receptionist</strong> removes that ceiling. It answers <strong>every call and website chat at once</strong>, 24/7, in English — no hold music, no voicemail, no missed patients after hours or on weekends. While your staff handles the patient in the chair, the AI handles the patients trying to reach you: answering price and timing questions, qualifying them, and <strong>booking appointments straight into your calendar</strong>.
            </p>
            <p>
              For a busy dental, aesthetic, dermatology, or multi-specialty clinic, the math is simple. Recovering even <strong>5 missed bookings a day</strong> — at a typical private-treatment value — is thousands in appointments you were already paying marketing to generate but losing at the phone. That&apos;s the leak an AI receptionist closes.
            </p>
            <p>
              It also cuts your <strong>no-show rate</strong> with automatic confirmations and reminders, and gives you a record of every conversation — so you finally see how many patients are calling after hours. It works alongside your existing staff and phone number, not instead of them.
            </p>
            <p>
              We built this for clinics in <strong>Blackburn, UK</strong> — and across Manchester, London, Birmingham, and beyond — where patients expect an instant reply. If you&apos;re a dental, aesthetic, or medical practice anywhere in the UK, our <strong>AI receptionist</strong> is trained on your services and hours from day one.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="py-14 bg-white">
        <Reveal className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#00283C] text-center mb-8">Common Questions</h2>
          <ContentCardList items={faqs} />
        </Reveal>
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
