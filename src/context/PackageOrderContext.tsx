"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { priceToNumber, trackEvent } from "@/lib/analytics";

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
  const openOrder = (nextSelection: PackageSelection) => {
    const value = priceToNumber(nextSelection.price);
    trackEvent("begin_checkout", {
      currency: "USD",
      value,
      items: [
        {
          item_id: nextSelection.serviceId,
          item_name: nextSelection.serviceName,
          item_variant: nextSelection.packageName,
          price: value,
          quantity: 1,
        },
      ],
    });
    setSelection(nextSelection);
  };

  return (
    <PackageOrderContext.Provider
      value={{ selection, openOrder, closeOrder: () => setSelection(null) }}
    >
      {children}
    </PackageOrderContext.Provider>
  );
}
