export type AuditStep = "hero" | "questions" | "loading" | "report";

export interface AuditAnswers {
  businessType: string;
  monthlyCustomers: string;
  marketingBudget: string;
  biggestChallenge: string;
  primaryGoal: string;
}

export interface BusinessGrowthReport {
  growthScore: number;
  summary: string;
  biggestIssues: string[];
  opportunities: string[];
  recommendedServices: string[];
  timeline: string;
  estimatedROI: string;
  nextSteps: string[];
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface AuditQuestion {
  id: keyof AuditAnswers;
  title: string;
  subtitle?: string;
  type: "options" | "text" | "textarea";
  options?: QuestionOption[];
  placeholder?: string;
  inputMode?: "text" | "numeric";
}

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  {
    id: "businessType",
    title: "What type of business do you own?",
    type: "options",
    options: [
      { label: "Dental Clinic", value: "Dental Clinic" },
      { label: "Aesthetic Clinic", value: "Aesthetic Clinic" },
      { label: "Restaurant", value: "Restaurant" },
      { label: "Software Company", value: "Software Company" },
      { label: "E-commerce", value: "E-commerce" },
      { label: "Real Estate", value: "Real Estate" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    id: "monthlyCustomers",
    title: "How many customers do you serve each month?",
    subtitle: "An approximate range is fine.",
    type: "text",
    placeholder: "e.g. 150 patients / 500 orders",
    inputMode: "text",
  },
  {
    id: "marketingBudget",
    title: "What is your monthly marketing budget?",
    type: "text",
    placeholder: "e.g. $2,000 / $10,000+",
    inputMode: "text",
  },
  {
    id: "biggestChallenge",
    title: "What is your biggest challenge?",
    type: "options",
    options: [
      { label: "Getting More Leads", value: "Getting More Leads" },
      { label: "Website", value: "Website" },
      { label: "Low Sales", value: "Low Sales" },
      { label: "Marketing", value: "Marketing" },
      { label: "AI Automation", value: "AI Automation" },
      { label: "Customer Support", value: "Customer Support" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    id: "primaryGoal",
    title: "What is your primary business goal for the next 12 months?",
    type: "textarea",
    placeholder: "e.g. Double new patient bookings, launch online ordering, expand to 3 locations…",
  },
];

export const EMPTY_ANSWERS: AuditAnswers = {
  businessType: "",
  monthlyCustomers: "",
  marketingBudget: "",
  biggestChallenge: "",
  primaryGoal: "",
};
