"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type MotionProviderProps = {
  children: ReactNode;
};

/**
 * Lightweight shell — page-transition AnimatePresence was crashing hydration
 * when nested with analytics widgets. Keep motion local to sections instead.
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) return <>{children}</>;

  return <>{children}</>;
}
