import type { Metadata } from "next";
import LocationPage from "@/components/LocationPage";
import { locationMeta } from "@/lib/locationMeta";

export const metadata: Metadata = locationMeta("Manchester", "/clinic-marketing-manchester");

export default function Page() {
  return (
    <LocationPage
      city="Manchester"
      region="Greater Manchester"
      headline="More Patient Enquiries in"
      highlight="Manchester"
      subheadline="Help your Manchester dental or aesthetic clinic stand out on Google Maps, answer every WhatsApp enquiry, and fill the diary with AI — without hiring another receptionist."
      bullets={[
        "Compete with clinics in the city centre, Chorlton, Didsbury, and Salford",
        "AI front desk for high call volume evenings and weekends",
        "Campaigns aimed at private dentistry & aesthetic treatments",
        "Clear £ pricing and a free audit before any contract",
        "Practice-manager friendly reporting — enquiries, not vanity metrics",
      ]}
      nearby={["Manchester", "Salford", "Stockport", "Trafford", "Bury", "Oldham", "Rochdale", "Altrincham"]}
    />
  );
}
