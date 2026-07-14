import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Alliance Tech — Healthcare AI & Digital Transformation",
  description:
    "Transparent, US-market pricing for every service Alliance Tech offers — from AI receptionists to custom EHR software. Three packages per service, no hidden fees.",
  openGraph: {
    title: "Pricing | Alliance Tech",
    description: "17 services. Three packages each. Fully transparent pricing for US healthcare practices.",
    type: "website",
    url: "https://alliancetechltd.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
