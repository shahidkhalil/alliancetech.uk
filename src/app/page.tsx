"use client";
import { FormProvider, useForm } from "@/context/FormContext";
import dynamic from "next/dynamic";

// Lazy: both pull in the Firebase SDK and are only needed on interaction.
const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Problems from "@/components/Problems";
import Solutions from "@/components/Solutions";
import AIReceptionist from "@/components/AIReceptionist";
import Guarantee from "@/components/Guarantee";
import ForWho from "@/components/ForWho";
import Process from "@/components/Process";
import TestimonialVideo from "@/components/TestimonialVideo";
import PricingPackages from "@/components/PricingPackages";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import AuditPromo from "@/components/AuditPromo";

function HomeContent() {
  const { isOpen, closeForm } = useForm();
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white">
      <ConsultationForm isOpen={isOpen} onClose={closeForm} />
      <AuditChatWidget />
      <Navigation />
      <Hero />
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
      <FinalCTA />
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <FormProvider>
      <HomeContent />
    </FormProvider>
  );
}
