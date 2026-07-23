"use client";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbSchema, ServiceSchema } from "@/components/StructuredData";
import AnimatedGrid from "@/components/Motion/AnimatedGrid";
import FloatingParticles from "@/components/Motion/FloatingParticles";
import MagneticButton from "@/components/Motion/MagneticButton";
import { heroContainer, heroItem, heroCta } from "@/animations/hero";

interface Props {
  badge: string;
  headline: string;
  highlight: string;
  subheadline: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function ServicePageHero({
  badge,
  headline,
  highlight,
  subheadline,
  ctaText = "Book Free Consultation",
  ctaHref,
}: Props) {
  const { openForm } = useForm();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <>
      <ServiceSchema name={`${headline} ${highlight}`} description={subheadline} path={pathname} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: `${headline} ${highlight}`, path: pathname },
        ]}
      />
      <section className="relative pt-32 pb-16 bg-white border-b border-gray-100 overflow-hidden">
        <AnimatedGrid opacity={0.045} />
        <FloatingParticles />
        <motion.div
          aria-hidden
          className="absolute top-0 right-0 w-[500px] h-[350px] rounded-full pointer-events-none opacity-[0.1]"
          style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }}
          animate={reduced ? undefined : { x: [0, 24, 0], y: [0, -16, 0] }}
          transition={reduced ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative max-w-4xl mx-auto px-6"
          variants={reduced ? undefined : heroContainer}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          <motion.a
            variants={heroItem}
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00283C] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </motion.a>

          <motion.span variants={heroItem} className="badge-light mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
            {badge}
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="text-4xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-tight mb-5 mt-3"
          >
            {headline}{" "}
            <span className="gradient-heading">{highlight}</span>
          </motion.h1>

          <motion.p variants={heroItem} className="text-lg text-gray-500 max-w-2xl mb-10 leading-relaxed">
            {subheadline}
          </motion.p>

          <motion.div variants={heroCta} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {ctaHref ? (
              <a
                href={ctaHref}
                data-analytics-label={ctaText}
                data-analytics-location="service_hero"
                className="btn-dark px-8 py-4 text-base"
              >
                {ctaText}
              </a>
            ) : (
              <MagneticButton
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="service_hero"
                className="btn-dark px-8 py-4 text-base group"
              >
                {ctaText}
              </MagneticButton>
            )}
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
