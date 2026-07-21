"use client";

import { useEffect } from "react";
import { trackError } from "@/lib/analytics";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackError(error, "next_error_boundary");
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 flex items-center justify-center">
      <div className="max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0077A8]">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#00283C]">We could not load this page.</h1>
        <p className="mt-3 text-gray-500">Please try again. If the problem continues, contact our team.</p>
        <button type="button" onClick={reset} className="btn-dark mt-6 px-6 py-3">
          Try again
        </button>
      </div>
    </main>
  );
}
