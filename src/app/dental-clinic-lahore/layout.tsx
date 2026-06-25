import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Clinic Marketing in Lahore | Alliance Tech",
  description:
    "Helping dental clinics in Lahore rank #1 on Google Maps, run targeted local ads, and book more patients with WhatsApp AI automation.",
  keywords: ["dental clinic Lahore", "dentist marketing Lahore", "dental clinic SEO Lahore"],
  alternates: { canonical: "/dental-clinic-lahore" },
  openGraph: {
    title: "Dental Clinic Marketing in Lahore | Alliance Tech",
    description: "Helping dental clinics in Lahore rank #1 on Google Maps and book more patients.",
    url: "/dental-clinic-lahore",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
