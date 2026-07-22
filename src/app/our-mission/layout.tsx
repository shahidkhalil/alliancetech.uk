import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission | Alliance Tech",
  description:
    "Why Alliance Tech exists: closing the digital infrastructure gap holding back skilled dental and aesthetic clinics across the United Kingdom.",
  keywords: ["Alliance Tech mission", "healthcare growth agency", "clinic technology mission"],
  alternates: { canonical: "/our-mission" },
  openGraph: {
    title: "Our Mission | Alliance Tech",
    description: "Why Alliance Tech exists: closing the digital infrastructure gap holding back clinics across the United Kingdom.",
    url: "/our-mission",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
