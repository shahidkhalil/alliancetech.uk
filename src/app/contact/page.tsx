"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import { useForm } from "@/context/FormContext";
import { AnimatedSurface } from "@/components/ui/Card";

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

          <AnimatedSurface accent className="p-8 border border-gray-100" delay={0}>
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
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0 text-lg">📍</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Location</p>
                  <p className="text-[#00283C] font-semibold">Houston, Texas</p>
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

              {/* Follow us */}
              <div className="pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Follow Us</p>
                <div className="flex items-center gap-3">
                  <a href="https://www.instagram.com/alliancetechofficial" target="_blank" rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center text-[#0077A8] hover:bg-[#00283C] hover:text-white transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/alliancetech11" target="_blank" rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center text-[#0077A8] hover:bg-[#00283C] hover:text-white transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.022 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.918 8.437-9.94z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/alliancetechltd/" target="_blank" rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-10 h-10 rounded-lg bg-[#E6F4F8] flex items-center justify-center text-[#0077A8] hover:bg-[#00283C] hover:text-white transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSurface>

          <AnimatedSurface className="p-8 border border-gray-100 flex flex-col justify-between" delay={0.1}>
            <div>
              <h2 className="text-xl font-bold text-[#00283C] mb-3">Free Clinic Audit</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                In 30 minutes, we&apos;ll review your current online presence, identify exactly where you&apos;re losing patients to competitors, and hand you a custom growth plan. Completely free, no obligation.
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
          </AnimatedSurface>
        </div>
      </section>

      <section className="py-10 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            Prefer email?{" "}
            <a href="mailto:Sales@alliancetechltd.com"
              className="text-[#0077A8] font-semibold hover:underline">
              Sales@alliancetechltd.com
            </a>
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
