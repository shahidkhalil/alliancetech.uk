import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Receptionist for Busy Clinics — Never Miss a Patient Call | Alliance Tech",
  description:
    "Your front desk can't answer 100 calls a day — our AI receptionist can. 24/7 call & chat answering in English, instant appointment booking, zero missed patients. Try the live demo.",
  keywords: [
    "AI receptionist for clinics",
    "AI receptionist the United States",
    "virtual receptionist for dental clinic",
    "missed patient calls solution",
    "clinic appointment booking system the United States",
    "24/7 call answering for clinics",
    "reduce no-shows dental clinic",
    "front desk automation clinic",
    "AI receptionist price the United States",
    "dental clinic receptionist software",
  ],
  alternates: { canonical: "/ai-receptionist" },
  openGraph: {
    title: "AI Receptionist for Busy Clinics — Never Miss a Patient Call",
    description:
      "24/7 AI receptionist that answers, qualifies, and books patients in English. Try the live demo — talk to it right now.",
    url: "/ai-receptionist",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
