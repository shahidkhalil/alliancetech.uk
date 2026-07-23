"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { heroWord } from "@/animations/hero";
import { STAGGER } from "@/animations/scroll";

type AnimatedTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  by?: "words" | "chars";
  delay?: number;
};

/** Split text into words/chars with blur-to-sharp reveal. */
export default function AnimatedText({
  text,
  as = "span",
  className = "",
  by = "words",
  delay = 0,
}: AnimatedTextProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  const parts = by === "chars" ? Array.from(text) : text.split(" ");

  if (reduced) {
    const Static = as;
    return <Static className={className}>{text}</Static>;
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: by === "chars" ? STAGGER.tight : STAGGER.base, delayChildren: delay },
        },
      }}
      aria-label={text}
    >
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          className="inline-block will-change-transform"
          variants={heroWord}
          style={{ marginRight: by === "words" ? "0.28em" : undefined }}
        >
          {part === " " ? "\u00A0" : part}
        </motion.span>
      ))}
    </Tag>
  );
}
