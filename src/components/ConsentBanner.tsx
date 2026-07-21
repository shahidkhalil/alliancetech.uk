"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function ConsentBanner() {
  const {
    consent,
    consentReady,
    preferencesOpen,
    updateConsent,
    closePreferences,
  } = useAnalytics();
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    if (!preferencesOpen) return;
    setCustomizing(true);
    setAnalytics(consent?.analytics ?? true);
    setMarketing(consent?.marketing ?? false);
    setPreferences(consent?.preferences ?? false);
  }, [consent, preferencesOpen]);

  if (!consentReady || (consent && !preferencesOpen)) return null;

  const rejectOptional = () =>
    updateConsent({ analytics: false, marketing: false, preferences: false });
  const acceptAll = () =>
    updateConsent({ analytics: true, marketing: true, preferences: true });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#00283C]/10 bg-white p-5 shadow-2xl"
    >
      {preferencesOpen && (
        <button
          type="button"
          onClick={closePreferences}
          aria-label="Close cookie preferences"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#00283C]"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <h2 id="consent-title" className="pr-8 text-lg font-extrabold text-[#00283C]">
        Your privacy choices
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Necessary storage keeps forms working. With your permission, analytics helps us understand
        which pages and services are useful. We never send form details or contact information to analytics.
      </p>

      {customizing && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ConsentToggle label="Necessary" description="Security and form functionality" checked disabled />
          <ConsentToggle
            label="Analytics"
            description="GA4 and optional Clarity insights"
            checked={analytics}
            onChange={setAnalytics}
          />
          <ConsentToggle
            label="Marketing"
            description="Advertising attribution and remarketing"
            checked={marketing}
            onChange={setMarketing}
          />
          <ConsentToggle
            label="Preferences"
            description="Remember optional site choices"
            checked={preferences}
            onChange={setPreferences}
          />
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={rejectOptional}
          className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#00283C]"
        >
          Reject optional
        </button>
        {!customizing ? (
          <button
            type="button"
            onClick={() => setCustomizing(true)}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#00283C]"
          >
            Customize
          </button>
        ) : (
          <button
            type="button"
            onClick={() => updateConsent({ analytics, marketing, preferences })}
            className="rounded-full bg-[#0077A8] px-5 py-2.5 text-sm font-bold text-white"
          >
            Save choices
          </button>
        )}
        <button
          type="button"
          onClick={acceptAll}
          className="rounded-full bg-[#00283C] px-5 py-2.5 text-sm font-bold text-white"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}

function ConsentToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-3">
      <span>
        <span className="block text-sm font-bold text-[#00283C]">{label}</span>
        <span className="block text-xs text-gray-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="h-4 w-4 accent-[#0077A8]"
      />
    </label>
  );
}
