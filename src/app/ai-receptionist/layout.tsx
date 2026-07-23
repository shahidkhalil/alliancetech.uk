import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Receptionist for UK Clinics — Never Miss a Patient Call | Alliance Tech",
  description:
    "Your front desk can't answer every call — our AI receptionist can. 24/7 call & chat answering in English, instant appointment booking, zero missed patients for UK dental and aesthetic clinics. Try the live demo.",
  keywords: [
    "AI receptionist UK",
    "AI receptionist Blackburn",
    "AI answering service UK clinics",
    "virtual receptionist dental UK",
    "24/7 phone answering clinic UK",
    "AI phone agent for dentists UK",
    "missed call solution dental practice",
    "clinic appointment booking system UK",
    "reduce no-shows dental clinic",
    "front desk automation UK clinic",
    "AI receptionist pricing UK",
  ],
  alternates: { canonical: "/ai-receptionist" },
  openGraph: {
    title: "AI Receptionist for UK Clinics — Never Miss a Patient Call",
    description:
      "24/7 AI receptionist that answers, qualifies, and books patients in English — built for UK clinics. Try the live demo — talk to it right now.",
    url: "/ai-receptionist",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
