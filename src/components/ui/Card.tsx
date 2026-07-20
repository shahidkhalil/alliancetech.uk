"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

function cardClasses(accent: boolean, feature: boolean, hover: boolean, extra = "") {
  return [
    "card-white rounded-2xl card-motion h-full",
    accent ? "card-accent-light card-accent-animated" : "",
    feature ? "card-feature card-shine" : "",
    hover ? "" : "card-no-hover",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type CardShellProps = {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  feature?: boolean;
  hover?: boolean;
};

/** Inner shell — lift on hover/tap (transform only; shadow via CSS). */
function CardShell({ children, className = "", accent = false, feature = false, hover = true }: CardShellProps) {
  const { hoverProps } = useCardMotion();
  return (
    <motion.div className={cardClasses(accent, feature, hover, `group ${className}`)} {...hoverProps(hover)}>
      {feature ? <span aria-hidden className="card-shine-sweep" /> : null}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}

type CardProps = CardShellProps & {
  delay?: number;
  as?: "div" | "article" | "section";
};

/** Animated base card — scroll entrance + optional hover lift. */
export function Card({ children, delay = 0, as = "div", ...shell }: CardProps) {
  const { entrance } = useCardMotion();
  const tags = { div: motion.div, article: motion.article, section: motion.section };
  const Tag = tags[as];
  return (
    <Tag className="h-full" {...entrance(delay)}>
      <CardShell {...shell}>{children}</CardShell>
    </Tag>
  );
}

export function CardIconWell({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { iconMicro } = useCardMotion();
  return (
    <motion.div className={`card-icon-well ${className}`} {...iconMicro()}>
      {children}
    </motion.div>
  );
}

type FeatureCardProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
  delay?: number;
};

export function FeatureCard({ icon, title, description, className = "", children, delay = 0 }: FeatureCardProps) {
  return (
    <Card accent feature delay={delay} className={`p-6 lg:p-7 ${className}`}>
      {icon ? <CardIconWell className="mb-5">{icon}</CardIconWell> : null}
      <h3 className="text-base font-bold text-[#00283C] mb-2 mt-5 transition-transform duration-200 ease-out group-hover:translate-x-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      {children}
    </Card>
  );
}

type FeatureCardGridProps = {
  items: { icon?: ReactNode; title: string; description?: string; desc?: string }[];
  className?: string;
};

export function FeatureCardGrid({
  items,
  className = "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
}: FeatureCardGridProps) {
  return (
    <div className={className}>
      {items.map((item, i) => (
        <FeatureCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description || item.desc || ""}
          delay={staggerDelay(i)}
          className="h-full"
        />
      ))}
    </div>
  );
}

export function CardStatPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { iconMicro } = useCardMotion();
  return (
    <motion.span className={`card-stat-pill ${className}`} {...iconMicro()}>
      {children}
    </motion.span>
  );
}

/** Animated link card for service / pricing grids. */
export function AnimatedLinkCard({
  href,
  children,
  className = "",
  delay = 0,
  dark = false,
  shine = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
  /** Diagonal light sweep — off by default (looks noisy on dense grids). */
  shine?: boolean;
}) {
  const { entrance, hoverProps } = useCardMotion();
  return (
    <motion.a
      href={href}
      {...entrance(delay)}
      {...hoverProps(true)}
      className={`group relative flex flex-col no-underline rounded-2xl border overflow-hidden card-motion card-shadow-hover ${className} ${
        dark
          ? "bg-gradient-to-br from-[#00283C] via-[#003550] to-[#004A6E] border-[#00B4D8]/25 shadow-xl card-shadow-hover-dark"
          : "card-white border-[rgba(0,40,60,0.09)]"
      } ${shine && !dark ? "card-feature card-shine" : ""}`}
    >
      {shine && !dark ? <span aria-hidden className="card-shine-sweep" /> : null}
      {/* Left accent — clean hover cue instead of a top hairline */}
      {!dark ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-[#0077A8] to-[#00B4D8] scale-y-0 origin-center transition-transform duration-200 ease-out group-hover:scale-y-100 z-[2]"
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </motion.a>
  );
}

/** Stacked Q&A or info cards with staggered entrance. */
export function ContentCardList({
  items,
  className = "space-y-4",
  cardClassName = "p-6 lg:p-7",
}: {
  items: { q?: string; a?: string; title?: string; description?: string }[];
  className?: string;
  cardClassName?: string;
}) {
  return (
    <div className={className}>
      {items.map((item, i) => {
        const title = item.q ?? item.title ?? "";
        const body = item.a ?? item.description ?? "";
        return (
          <AnimatedSurface key={title} delay={staggerDelay(i)} accent className={cardClassName}>
            <h3 className="font-bold text-[#00283C] mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </AnimatedSurface>
        );
      })}
    </div>
  );
}

/** Generic animated surface for one-off card-white blocks (contact, info panels, etc.). */
export function AnimatedSurface({
  children,
  className = "",
  delay = 0,
  hover = true,
  accent = false,
  feature = false,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  accent?: boolean;
  feature?: boolean;
  as?: "div" | "article" | "section";
}) {
  return (
    <Card as={as} delay={delay} hover={hover} accent={accent} feature={feature} className={className}>
      {children}
    </Card>
  );
}
