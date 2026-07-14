import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
  description:
    "Patient growth for aesthetic and skin clinics across the United States — Instagram & TikTok campaigns, before/after content strategy, and WhatsApp AI in English.",
  keywords: ["aesthetic clinic marketing the United States", "skin clinic growth", "Botox clinic marketing"],
  alternates: { canonical: "/aesthetic-clinic-growth" },
  openGraph: {
    title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
    description: "Patient growth for aesthetic and skin clinics across the United States.",
    url: "/aesthetic-clinic-growth",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
