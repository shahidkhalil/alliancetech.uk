import type { AuditAnswers, BusinessGrowthReport } from "./businessAuditTypes";

/** Uses the existing auditWebsite Cloud Function (business payload = growth audit). */
const ENDPOINT =
  process.env.NEXT_PUBLIC_BUSINESS_AUDIT_ENDPOINT ||
  process.env.NEXT_PUBLIC_AUDIT_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/auditWebsite";

function isValidReport(data: unknown): data is { report: BusinessGrowthReport } {
  if (!data || typeof data !== "object") return false;
  const report = (data as { report?: BusinessGrowthReport }).report;
  return (
    !!report &&
    typeof report.growthScore === "number" &&
    typeof report.summary === "string" &&
    Array.isArray(report.biggestIssues)
  );
}

export async function fetchBusinessGrowthReport(
  answers: AuditAnswers
): Promise<BusinessGrowthReport> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
  } catch {
    throw new Error(
      "Network error — check your connection and try again."
    );
  }

  const text = await res.text();
  let data: { error?: string; report?: BusinessGrowthReport } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Unexpected server response. Please try again shortly.");
  }

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Could not generate your report. Please try again."
    );
  }

  if (!isValidReport(data)) {
    throw new Error("The AI returned an invalid report. Please try again.");
  }

  return data.report;
}
