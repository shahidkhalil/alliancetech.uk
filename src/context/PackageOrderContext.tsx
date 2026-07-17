"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface PackageSelection {
  serviceId: string;
  serviceName: string;
  packageName: string;
  price: string;
  period: string;
}

interface Ctx {
  selection: PackageSelection | null;
  openOrder: (s: PackageSelection) => void;
  closeOrder: () => void;
}

const PackageOrderContext = createContext<Ctx>({
  selection: null,
  openOrder: () => {},
  closeOrder: () => {},
});

export const usePackageOrder = () => useContext(PackageOrderContext);

export function PackageOrderProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<PackageSelection | null>(null);
  return (
    <PackageOrderContext.Provider
      value={{ selection, openOrder: setSelection, closeOrder: () => setSelection(null) }}
    >
      {children}
    </PackageOrderContext.Provider>
  );
}
