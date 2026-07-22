import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Alliance Tech",
  description:
    "Book a free 30-minute clinic growth audit. Contact Alliance Tech Ltd at 138 Laburnum Rd, Blackburn BB1 5EQ, or call +44 161 515 7261.",
  keywords: ["contact Alliance Tech", "Alliance Tech Blackburn", "free clinic audit UK"],
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
