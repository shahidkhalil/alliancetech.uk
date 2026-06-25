import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Alliance Tech",
  description:
    "Book a free 30-minute clinic growth audit. We'll review your online presence and show you exactly where you're losing patients to competitors.",
  keywords: ["contact Alliance Tech", "free clinic audit", "book a clinic growth consultation"],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Alliance Tech",
    description: "Book a free 30-minute clinic growth audit with Alliance Tech.",
    url: "/contact",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
