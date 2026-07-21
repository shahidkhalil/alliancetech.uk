import type { AuditAnswers, BusinessGrowthReport } from "./businessAuditTypes";

const ENDPOINT =
  process.env.NEXT_PUBLIC_BUSINESS_AUDIT_ENDPOINT || "/api/business-audit";

export async function fetchBusinessGrowthReport(
  answers: AuditAnswers
): Promise<BusinessGrowthReport> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Could not generate your report. Please try again."
    );
  }

  return data.report as BusinessGrowthReport;
}
