import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Website Audit for Clinics & Dentists in the US | Alliance Tech",
  description:
    "Free 30-second AI website audit for clinics across the United States: speed test, SEO check, Google Business Profile comparison, and the exact competitors outranking you — with fixes in plain English.",
  keywords: [
    "free website audit",
    "free website audit for dentists",
    "clinic website checker",
    "dental website audit",
    "free SEO audit for clinics",
    "website speed test",
    "SEO checker for clinics",
    "Google Business Profile audit",
    "competitor analysis for clinics",
    "dentist website check Houston",
    "clinic marketing audit Texas",
  ],
  alternates: { canonical: "/free-website-audit" },
  openGraph: {
    title: "Free AI Website Audit for Clinics | Alliance Tech",
    description: "Instant AI audit of your clinic website — speed, SEO, and patient experience — with the fixes that matter.",
    url: "/free-website-audit",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
