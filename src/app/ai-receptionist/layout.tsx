import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Receptionist for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "An AI receptionist that answers every clinic call 24/7 in Urdu and English, qualifies patients, and books appointments directly into your calendar.",
  keywords: ["AI receptionist", "AI receptionist for clinics", "automated clinic phone answering", "AI call answering Pakistan", "dental clinic AI"],
  alternates: { canonical: "/ai-receptionist" },
  openGraph: {
    title: "AI Receptionist for Dental & Aesthetic Clinics | Alliance Tech",
    description: "Answers every call 24/7 in Urdu and English, qualifies patients, and books appointments automatically.",
    url: "/ai-receptionist",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
