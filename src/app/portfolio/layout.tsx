import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work | Portfolio & Case Studies | Alliance Tech",
  description:
    "See real websites, booking systems, and digital growth platforms Alliance Tech has built for healthcare professionals and clinics across the United States.",
  keywords: ["Alliance Tech portfolio", "clinic website case study", "healthcare website the United States", "doctor website design"],
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Our Work | Portfolio & Case Studies | Alliance Tech",
    description: "Real websites and digital growth platforms we've built for healthcare professionals across the United States.",
    url: "/portfolio",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
