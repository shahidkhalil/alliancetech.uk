import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Clinic Growth Marketing | Alliance Tech",
  description:
    "AI-powered patient acquisition for dental clinics across the United States — Google Maps ranking, targeted ads, WhatsApp AI booking, and reputation management.",
  keywords: ["dental clinic marketing the United States", "dental clinic growth", "dentist patient acquisition"],
  alternates: { canonical: "/dental-clinic-growth" },
  openGraph: {
    title: "Dental Clinic Growth Marketing | Alliance Tech",
    description: "AI-powered patient acquisition for dental clinics across the United States.",
    url: "/dental-clinic-growth",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
