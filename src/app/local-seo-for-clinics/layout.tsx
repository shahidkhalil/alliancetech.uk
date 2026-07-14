import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local SEO for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "Rank #1 on Google Maps for 'dentist near me' and 'clinic in [your city]' searches. Google Business Profile optimisation, citations, and 5-star review generation.",
  keywords: ["local SEO for clinics", "Google Maps ranking dentist", "Google Business Profile clinic", "local SEO the United States", "clinic near me SEO"],
  alternates: { canonical: "/local-seo-for-clinics" },
  openGraph: {
    title: "Local SEO for Dental & Aesthetic Clinics | Alliance Tech",
    description: "Rank #1 on Google Maps for 'near me' searches with Google Business Profile optimisation and review generation.",
    url: "/local-seo-for-clinics",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
