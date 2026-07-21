import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Business Growth Audit | Alliance Tech",
  description:
    "Answer 5 questions and get a free AI-generated business growth strategy — growth score, revenue opportunities, recommended services, timeline, and action plan.",
  keywords: [
    "business growth audit",
    "AI business consultant",
    "free growth strategy",
    "clinic growth plan",
    "digital marketing audit",
    "Alliance Tech",
  ],
  alternates: { canonical: "/business-growth-audit" },
  openGraph: {
    title: "Free AI Business Growth Audit | Alliance Tech",
    description:
      "Get a personalized AI growth report with score, opportunities, and an action plan — free in under 2 minutes.",
    url: "/business-growth-audit",
    type: "website",
  },
};

export default function BusinessGrowthAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
