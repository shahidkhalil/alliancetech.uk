import type { Metadata } from "next";
import LocationPage, { locationMeta } from "@/components/LocationPage";

export const metadata: Metadata = locationMeta("London", "/clinic-marketing-london");

export default function Page() {
  return (
    <LocationPage
      city="London"
      region="Greater London"
      headline="Clinic Growth Systems for"
      highlight="London"
      subheadline="From North West HQ to London clinics — AI receptionists, local SEO, and patient acquisition built for competitive borough markets and multi-site practices."
      bullets={[
        "Local SEO for competitive London search terms and Maps packs",
        "AI that handles missed calls across multiple locations",
        "WhatsApp automation patients already use daily",
        "GDPR-conscious workflows for UK healthcare marketing",
        "Strategy call with clear next steps — no hard sell",
      ]}
      nearby={["Central London", "North London", "South London", "East London", "West London", "Canary Wharf", "Richmond"]}
    />
  );
}
