"use client";

import { Star, ShieldCheck } from "lucide-react";
import {
  UK_GOOGLE_REVIEWS,
  UK_REVIEW_LABEL,
  UK_REVIEW_SCORE,
} from "@/lib/ukContact";

type Props = {
  className?: string;
  /** Compact inline for heroes; `card` for contact panels */
  variant?: "inline" | "card";
};

/** Clickable Google reviews proof — uses shared UK contact constants. */
export default function GoogleReviewsBadge({ className = "", variant = "inline" }: Props) {
  if (variant === "card") {
    return (
      <a
        href={UK_GOOGLE_REVIEWS}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-4 rounded-2xl border border-[#00283C]/08 bg-[#F8FAFC] px-5 py-4 hover:border-[#00B4D8]/40 transition-colors ${className}`}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm">
          <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-extrabold text-[#00283C]">
            {UK_REVIEW_SCORE}★ Google reviews
          </p>
          <p className="text-xs text-gray-500">
            Real ratings for Alliance Tech in Blackburn — see {UK_REVIEW_LABEL}
          </p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={UK_GOOGLE_REVIEWS}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border border-[#00283C]/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#00283C] shadow-sm hover:border-[#00B4D8]/40 transition-colors ${className}`}
    >
      <span className="inline-flex items-center gap-0.5 text-[#F59E0B]" aria-hidden>
        <Star className="h-3 w-3 fill-current" />
        <Star className="h-3 w-3 fill-current" />
        <Star className="h-3 w-3 fill-current" />
        <Star className="h-3 w-3 fill-current" />
        <Star className="h-3 w-3 fill-current" />
      </span>
      <span>
        {UK_REVIEW_SCORE} {UK_REVIEW_LABEL}
      </span>
      <ShieldCheck className="h-3.5 w-3.5 text-[#0077A8]" aria-hidden />
      <span className="text-gray-500 font-medium">GDPR-aware</span>
    </a>
  );
}
