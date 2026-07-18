import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Website Audit for Houston & Texas Clinics | Alliance Tech",
  description:
    "Free 30-second AI website audit for dental and aesthetic clinics in Houston and across Texas: speed test, SEO check, Google Business Profile comparison, and the exact competitors outranking you — with fixes in plain English.",
  keywords: [
    "free website audit Houston",
    "dental website audit Houston TX",
    "clinic website checker Texas",
    "free SEO audit Houston clinic",
    "website speed test Houston dentist",
    "SEO checker for clinics Texas",
    "Google Business Profile audit Houston",
    "competitor analysis dentist Houston",
    "dentist website check Houston",
    "clinic marketing audit Texas",
    "houston dental marketing audit",
  ],
  alternates: { canonical: "/free-website-audit" },
  openGraph: {
    title: "Free AI Website Audit for Houston & Texas Clinics | Alliance Tech",
    description: "Instant AI audit of your clinic website — speed, SEO, and patient experience — built for Houston and Texas clinics.",
    url: "/free-website-audit",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
