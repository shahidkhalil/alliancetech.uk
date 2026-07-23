import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import AboutBody from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "About Alliance Tech | AI & Growth Agency for Clinics in the UK",
  description:
    "Meet Alliance Tech — the AI and growth agency helping UK dental and aesthetic clinics win more patients with automation, websites, and SEO.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <PageWrapper>
      <AboutBody />
    </PageWrapper>
  );
}
