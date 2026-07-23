"use client";

import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { MapPin, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { UK_PHONE_DISPLAY, UK_PHONE_TEL, UK_WHATSAPP_URL } from "@/lib/ukContact";

type LocationPageProps = {
  city: string;
  region: string;
  headline: string;
  highlight: string;
  subheadline: string;
  bullets: string[];
  nearby: string[];
};

export default function LocationPage({
  city,
  region,
  headline,
  highlight,
  subheadline,
  bullets,
  nearby,
}: LocationPageProps) {
  return (
    <PageWrapper>
      <ServicePageHero
        badge={`${city.toUpperCase()} · ${region.toUpperCase()}`}
        headline={headline}
        highlight={highlight}
        subheadline={subheadline}
        ctaText="Free UK Clinic Audit"
        ctaHref="/free-website-audit"
      />

      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#00283C] mb-4">
              Why clinics in {city} choose Alliance Tech
            </h2>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#0077A8] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={UK_WHATSAPP_URL}
                target={UK_WHATSAPP_URL.startsWith("http") ? "_blank" : undefined}
                rel={UK_WHATSAPP_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                className="btn-dark px-5 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={UK_PHONE_TEL} className="border border-[#00283C]/20 font-bold px-5 py-3 rounded-md text-sm inline-flex items-center justify-center gap-2 text-[#00283C]">
                <Phone className="w-4 h-4" /> {UK_PHONE_DISPLAY || "Call us"}
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#0077A8]" />
              <h3 className="font-bold text-[#00283C]">Areas we support near {city}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {nearby.map((n) => (
                <span key={n} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6 leading-relaxed">
              Based in Blackburn, we work with private dental and aesthetic clinics across {region} and the wider UK —
              AI receptionists, Google Maps ranking, WhatsApp automation, and clinic websites priced in £.
            </p>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
