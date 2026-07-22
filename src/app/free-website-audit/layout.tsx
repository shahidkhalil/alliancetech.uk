import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Website Audit for UK Clinics | Alliance Tech",
  description:
    "Free 30-second AI website audit for dental and aesthetic clinics in Blackburn, Manchester, London and across the UK: speed test, SEO check, Google Business Profile comparison, and the competitors outranking you — in plain English.",
  keywords: [
    "free website audit UK",
    "dental website audit Blackburn",
    "clinic website checker UK",
    "free SEO audit UK clinic",
    "website speed test dentist UK",
    "Google Business Profile audit UK",
    "competitor analysis dentist Manchester",
  ],
  alternates: { canonical: "/free-website-audit" },
  openGraph: {
    title: "Free AI Website Audit for UK Clinics | Alliance Tech",
    description: "Instant AI audit of your clinic website — speed, SEO, and patient experience — built for UK clinics.",
    url: "/free-website-audit",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
