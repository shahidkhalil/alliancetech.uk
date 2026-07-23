"use client";
import Problems from "@/components/Problems";
import Solutions from "@/components/Solutions";
import AIReceptionist from "@/components/AIReceptionist";
import Guarantee from "@/components/Guarantee";
import ForWho from "@/components/ForWho";
import Process from "@/components/Process";
import TestimonialVideo from "@/components/TestimonialVideo";
import PricingPackages from "@/components/PricingPackages";
import FAQ from "@/components/FAQ";
import AuditPromo from "@/components/AuditPromo";
import UkTrustProof from "@/components/UkTrustProof";
import ScrollSection from "@/components/Motion/ScrollSection";

/** Homepage below-fold chapters — each section fades in on scroll. */
export default function HomeBelowFold() {
  return (
    <>
      <ScrollSection>
        <Problems />
      </ScrollSection>
      <ScrollSection delay={0.04}>
        <UkTrustProof />
      </ScrollSection>
      <ScrollSection>
        <AuditPromo />
      </ScrollSection>
      <ScrollSection>
        <ForWho />
      </ScrollSection>
      <ScrollSection>
        <Solutions />
      </ScrollSection>
      <ScrollSection>
        <AIReceptionist />
      </ScrollSection>
      <ScrollSection>
        <Process />
      </ScrollSection>
      <ScrollSection>
        <TestimonialVideo />
      </ScrollSection>
      <ScrollSection>
        <Guarantee />
      </ScrollSection>
      <ScrollSection>
        <PricingPackages />
      </ScrollSection>
      <ScrollSection>
        <FAQ />
      </ScrollSection>
    </>
  );
}
