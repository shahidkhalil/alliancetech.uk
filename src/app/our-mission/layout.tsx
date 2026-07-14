import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission | Alliance Tech",
  description:
    "Why Alliance Tech exists: closing the digital infrastructure gap holding back skilled dental and aesthetic clinics across the United States.",
  keywords: ["Alliance Tech mission", "healthcare growth the United States", "clinic technology mission"],
  alternates: { canonical: "/our-mission" },
  openGraph: {
    title: "Our Mission | Alliance Tech",
    description: "Why Alliance Tech exists: closing the digital infrastructure gap holding back clinics across the United States.",
    url: "/our-mission",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
