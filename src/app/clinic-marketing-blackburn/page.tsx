import type { Metadata } from "next";
import LocationPage from "@/components/LocationPage";
import { locationMeta } from "@/lib/locationMeta";

export const metadata: Metadata = locationMeta("Blackburn", "/clinic-marketing-blackburn");

export default function Page() {
  return (
    <LocationPage
      city="Blackburn"
      region="North West England"
      headline="Grow Your Clinic in"
      highlight="Blackburn"
      subheadline="Local SEO, AI receptionists, and WhatsApp automation for dental and aesthetic practices in Blackburn and the Ribble Valley — from our base on Laburnum Road."
      bullets={[
        "Rank for “dentist near me” and treatment searches across Blackburn & Darwen",
        "Never miss a call after 5pm — AI answers in natural English",
        "WhatsApp booking for patients who prefer messaging over phone",
        "GDPR-aware setup for UK private practices",
        "Free clinic website audit before you spend a pound on ads",
      ]}
      nearby={["Blackburn", "Darwen", "Accrington", "Burnley", "Preston", "Clitheroe", "Bolton"]}
    />
  );
}
