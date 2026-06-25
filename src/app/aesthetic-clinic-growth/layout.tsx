import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
  description:
    "Patient growth for aesthetic and skin clinics in Pakistan — Instagram & TikTok campaigns, before/after content strategy, and WhatsApp AI in Urdu & English.",
  keywords: ["aesthetic clinic marketing Pakistan", "skin clinic growth", "Botox clinic marketing"],
  alternates: { canonical: "/aesthetic-clinic-growth" },
  openGraph: {
    title: "Aesthetic Clinic Growth Marketing | Alliance Tech",
    description: "Patient growth for aesthetic and skin clinics in Pakistan.",
    url: "/aesthetic-clinic-growth",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
