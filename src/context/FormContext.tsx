"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface FormContextType {
  openForm: () => void;
  closeForm: () => void;
  isOpen: boolean;
}

const FormContext = createContext<FormContextType>({
  openForm: () => {},
  closeForm: () => {},
  isOpen: false,
});

export function FormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openForm = () => {
    trackEvent("book_consultation", {
      stage: "open",
      page: window.location.pathname,
    });
    setIsOpen(true);
  };
  return (
    <FormContext.Provider
      value={{ isOpen, openForm, closeForm: () => setIsOpen(false) }}
    >
      {children}
    </FormContext.Provider>
  );
}

export const useForm = () => useContext(FormContext);
