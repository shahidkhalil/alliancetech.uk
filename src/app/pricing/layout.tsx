import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Alliance Tech — Healthcare AI & Digital Transformation",
  description:
    "Transparent GBP pricing for every Alliance Tech service — from AI receptionists to custom EHR software. Three packages per service, no hidden fees.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Alliance Tech",
    description: "Clear published prices for UK dental and aesthetic clinics — AI, websites, SEO, and more.",
    type: "website",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
