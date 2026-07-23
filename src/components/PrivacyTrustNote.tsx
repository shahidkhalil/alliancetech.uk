"use client";

import Link from "next/link";

type Props = {
  className?: string;
  /** Shorter line for tight form footers */
  compact?: boolean;
};

/** GDPR trust microcopy for forms and AI surfaces. */
export default function PrivacyTrustNote({ className = "", compact = false }: Props) {
  if (compact) {
    return (
      <p className={`text-[11px] text-gray-400 text-center leading-relaxed ${className}`}>
        UK GDPR-aware · We don&apos;t sell enquiry data ·{" "}
        <Link href="/privacy-policy" className="text-[#0077A8] hover:underline font-semibold">
          Privacy Policy
        </Link>
      </p>
    );
  }

  return (
    <p className={`text-sm text-gray-500 leading-relaxed ${className}`}>
      Built for UK clinics under{" "}
      <span className="font-semibold text-[#00283C]">UK GDPR principles</span>
      . Enquiry and demo data is used to respond and book — we never sell patient or lead data.{" "}
      <Link href="/privacy-policy" className="text-[#0077A8] font-semibold hover:underline">
        Read our Privacy Policy
      </Link>
      .
    </p>
  );
}
