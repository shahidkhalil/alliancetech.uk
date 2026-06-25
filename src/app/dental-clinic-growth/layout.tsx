import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Clinic Growth Marketing | Alliance Tech",
  description:
    "AI-powered patient acquisition for dental clinics in Pakistan — Google Maps ranking, targeted ads, WhatsApp AI booking, and reputation management.",
  keywords: ["dental clinic marketing Pakistan", "dental clinic growth", "dentist patient acquisition"],
  alternates: { canonical: "/dental-clinic-growth" },
  openGraph: {
    title: "Dental Clinic Growth Marketing | Alliance Tech",
    description: "AI-powered patient acquisition for dental clinics in Pakistan.",
    url: "/dental-clinic-growth",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
