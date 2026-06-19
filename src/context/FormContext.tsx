"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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
  return (
    <FormContext.Provider
      value={{ isOpen, openForm: () => setIsOpen(true), closeForm: () => setIsOpen(false) }}
    >
      {children}
    </FormContext.Provider>
  );
}

export const useForm = () => useContext(FormContext);
