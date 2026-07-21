"use client";

export default function ConsentSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("alliance:open-consent"))}
      className="hover:text-white/60 transition-colors"
    >
      Cookie Settings
    </button>
  );
}
