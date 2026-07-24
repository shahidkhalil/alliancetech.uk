"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { UK_WHATSAPP_URL } from "@/lib/ukContact";

const HIDDEN_PREFIXES = ["/admin", "/pricing", "/ai-receptionist"];

/** Mobile-only sticky dual CTA — Free Audit + WhatsApp. Hidden on admin/pricing. */
export default function MobileStickyCta() {
  const pathname = usePathname() || "/";
  const { openForm } = useForm();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (hidden) return null;

  const waExternal = UK_WHATSAPP_URL.startsWith("http");

  return (
    <>
      <div className="h-16 lg:hidden" aria-hidden />
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 safe-pb">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="mobile_sticky"
            className="flex-1 text-center py-3 rounded-xl bg-[#00283C] text-white text-xs font-black"
          >
            Free Clinic Audit
          </button>
          <a
            href={UK_WHATSAPP_URL}
            target={waExternal ? "_blank" : undefined}
            rel={waExternal ? "noopener noreferrer" : undefined}
            data-analytics-label="whatsapp_click"
            data-analytics-location="mobile_sticky"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#25D366]/40 text-[#128C7E] text-xs font-black"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
