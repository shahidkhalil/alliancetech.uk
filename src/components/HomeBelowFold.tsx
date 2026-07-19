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

/** Single below-fold bundle so the homepage doesn't waterfall many dynamic chunks. */
export default function HomeBelowFold() {
  return (
    <>
      <Problems />
      <AuditPromo />
      <ForWho />
      <Solutions />
      <AIReceptionist />
      <Process />
      <TestimonialVideo />
      <Guarantee />
      <PricingPackages />
      <FAQ />
    </>
  );
}
