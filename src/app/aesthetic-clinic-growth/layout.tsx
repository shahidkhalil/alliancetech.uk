import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
  description:
    "Patient growth for aesthetic and skin clinics across the United Kingdom — Instagram & Meta campaigns, before/after content strategy, and WhatsApp AI in English.",
  keywords: [
    "aesthetic clinic marketing UK",
    "aesthetic clinic marketing Blackburn",
    "Botox clinic marketing UK",
    "skin clinic marketing",
    "aesthetic clinic marketing",
  ],
  alternates: { canonical: "/aesthetic-clinic-growth" },
  openGraph: {
    title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
    description: "Patient growth for aesthetic and skin clinics across the United Kingdom.",
    url: "/aesthetic-clinic-growth",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
