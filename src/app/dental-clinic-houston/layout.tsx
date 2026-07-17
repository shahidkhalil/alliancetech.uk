import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Clinic Marketing in Houston | Alliance Tech",
  description:
    "Helping dental clinics in Houston rank #1 on Google Maps, run targeted local ads, and book more patients with WhatsApp AI automation.",
  keywords: ["dental clinic Houston", "dentist marketing Houston", "dental clinic SEO Houston", "AI receptionist Houston", "dental marketing Texas", "WhatsApp automation dental Houston"],
  alternates: { canonical: "/dental-clinic-houston" },
  openGraph: {
    title: "Dental Clinic Marketing in Houston | Alliance Tech",
    description: "Helping dental clinics in Houston rank #1 on Google Maps and book more patients.",
    url: "/dental-clinic-houston",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
