"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import { useForm } from "@/context/FormContext";

function BookCallButton() {
  const { openForm } = useForm();
  return (
    <button onClick={openForm} className="btn-dark w-full py-4 text-base rounded-lg">
      Book Free Strategy Call →
    </button>
  );
}

export default function Contact() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="CONTACT US"
        headline="Let's Grow Your"
        highlight="Clinic Together"
        subheadline="Book a free 30-minute strategy call. We'll audit your current patient acquisition and show you exactly what's being left on the table."
        ctaText="Get Your Free Clinic Audit"
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">

          <div className="card-white card-accent-light rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#00283C] mb-6">Get In Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0 text-lg">📧</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Email</p>
                  <a href="mailto:Sales@alliancetechltd.com" className="text-[#0077A8] font-semibold hover:underline">
                    Sales@alliancetechltd.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0 text-lg">💬</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">WhatsApp</p>
                  <a href="https://wa.me/923207800010" target="_blank" rel="noopener noreferrer" className="text-[#0077A8] font-semibold hover:underline">
                    Message us on WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0 text-lg">📍</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
                  <p className="text-[#00283C] font-semibold">Houston, the United States</p>
                  <p className="text-xs text-gray-400 mt-0.5">Serving clinics nationwide</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0 text-lg">🕐</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Response Time</p>
                  <p className="text-[#00283C] font-semibold">Within 2 hours</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mon-Sat, 9am-9pm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-white rounded-2xl p-8 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#00283C] mb-3">Free Clinic Audit</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                In 30 minutes, we'll review your current online presence, identify exactly where you're losing patients to competitors, and hand you a custom growth plan. Completely free, no obligation.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Current Google ranking review",
                  "Ad spend & competitor analysis",
                  "WhatsApp & missed call audit",
                  "Custom 90-day growth plan",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[#E6F4F8] flex items-center justify-center text-xs text-[#0077A8] font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <BookCallButton />
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            Prefer WhatsApp?{" "}
            <a href="https://wa.me/923207800010?text=Hi%2C%20I%27d%20like%20a%20free%20clinic%20audit"
              target="_blank" rel="noopener noreferrer"
              className="text-[#0077A8] font-semibold hover:underline">
              Message us directly →
            </a>
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
