/**
 * HTML email body for Business Growth Audit reports (matches on-screen / PDF layout).
 */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function actionPlanBadge(index, total) {
  if (index === 0) return "Quick win";
  if (index <= Math.min(2, total - 2)) return "This month";
  return "This quarter";
}

function scoreColor(score) {
  if (score >= 71) return "#16A34A";
  if (score >= 41) return "#D97706";
  return "#EA580C";
}

function listItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return `<p style="margin:0;font-size:14px;color:#64748b;">—</p>`;
  }
  return `<ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6;">
    ${items.map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`).join("")}
  </ul>`;
}

function buildGrowthReportUserHtml(lead) {
  const report = lead.growthReport || {};
  const answers = lead.auditAnswers || {};
  const name = escapeHtml((lead.name || "there").split(" ")[0]);
  const score = Number(report.growthScore) || 0;
  const color = scoreColor(score);
  const steps = Array.isArray(report.nextSteps) ? report.nextSteps : [];
  const services = Array.isArray(report.recommendedServices) ? report.recommendedServices : [];

  const actionRows = steps
    .map((step, i) => {
      const badge = actionPlanBadge(i, steps.length);
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eef2f6;vertical-align:top;width:32px;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:999px;background:#00283C;color:#fff;font-size:11px;font-weight:800;">${i + 1}</span>
        </td>
        <td style="padding:12px 0 12px 8px;border-bottom:1px solid #eef2f6;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:14px;line-height:1.55;color:#334155;">${escapeHtml(step)}</p>
          <span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:#E8F4F8;color:#0077A8;border:1px solid #cce8f0;">${badge}</span>
        </td>
      </tr>`;
    })
    .join("");

  const servicePills = services
    .map(
      (s) =>
        `<span style="display:inline-block;font-size:11px;font-weight:700;padding:6px 12px;margin:0 6px 6px 0;border-radius:999px;background:#E8F4F8;color:#0077A8;border:1px solid #cce8f0;">${escapeHtml(s)}</span>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#00283C;padding:28px 32px;text-align:center;">
              <img src="cid:alliance-logo" alt="Alliance Tech" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0077A8;">Your Business Growth Audit</p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#00283C;">Hi ${name}, here&apos;s your growth report</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                Thanks for completing the Alliance Tech Business Growth Audit. Your personalized strategy is below.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#F8FCFE;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0;font-size:42px;font-weight:800;color:${color};line-height:1;">${score}<span style="font-size:16px;color:#64748b;">/100</span></p>
                    <p style="margin:4px 0 0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Growth Score</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:12px;color:#64748b;">${escapeHtml(answers.businessType || lead.clinicType || "")} · ${escapeHtml(answers.monthlyCustomers || "")} customers/mo · Budget: ${escapeHtml(answers.marketingBudget || "")}</p>

              <h2 style="margin:28px 0 10px;font-size:16px;color:#00283C;border-bottom:2px solid #E8F4F8;padding-bottom:6px;">Executive Summary</h2>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(report.summary || lead.auditVerdict || "")}</p>

              <h2 style="margin:28px 0 10px;font-size:16px;color:#00283C;border-bottom:2px solid #E8F4F8;padding-bottom:6px;">Biggest Business Issues</h2>
              ${listItems(report.biggestIssues)}

              <h2 style="margin:28px 0 10px;font-size:16px;color:#00283C;border-bottom:2px solid #E8F4F8;padding-bottom:6px;">Revenue Opportunities</h2>
              ${listItems(report.opportunities)}

              <h2 style="margin:28px 0 10px;font-size:16px;color:#00283C;border-bottom:2px solid #E8F4F8;padding-bottom:6px;">Recommended Alliance Tech Services</h2>
              <div style="margin-bottom:8px;">${servicePills || "—"}</div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <h2 style="margin:0 0 8px;font-size:14px;color:#00283C;">Estimated Timeline</h2>
                    <p style="margin:0;font-size:13px;line-height:1.55;color:#334155;">${escapeHtml(report.timeline || "—")}</p>
                  </td>
                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <h2 style="margin:0 0 8px;font-size:14px;color:#00283C;">Expected ROI</h2>
                    <p style="margin:0;font-size:13px;line-height:1.55;color:#334155;">${escapeHtml(report.estimatedROI || "—")}</p>
                  </td>
                </tr>
              </table>

              <h2 style="margin:28px 0 12px;font-size:16px;color:#00283C;border-bottom:2px solid #E8F4F8;padding-bottom:6px;">Action Plan</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${actionRows}</table>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:32px auto 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#00283C;">
                    <a href="https://alliancetechltd.com/contact" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Book Free Consultation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Alliance Tech · Sales@alliancetechltd.com · Houston, Texas</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildGrowthReportUserText(lead) {
  const report = lead.growthReport || {};
  const name = (lead.name || "there").split(" ")[0];
  const lines = [
    `Hi ${name},`,
    ``,
    `Here is your Alliance Tech Business Growth Audit.`,
    ``,
    `Growth Score: ${report.growthScore ?? lead.auditScore ?? "?"}/100`,
    ``,
    report.summary || lead.auditVerdict || "",
    ``,
    `Biggest Issues:`,
    ...(Array.isArray(report.biggestIssues) ? report.biggestIssues.map((i) => `- ${i}`) : []),
    ``,
    `Opportunities:`,
    ...(Array.isArray(report.opportunities) ? report.opportunities.map((i) => `- ${i}`) : []),
    ``,
    `Recommended Services: ${(report.recommendedServices || []).join(", ")}`,
    ``,
    `Timeline: ${report.timeline || "—"}`,
    `ROI: ${report.estimatedROI || "—"}`,
    ``,
    `Action Plan:`,
    ...(Array.isArray(report.nextSteps) ? report.nextSteps.map((s, i) => `${i + 1}. ${s}`) : []),
    ``,
    `Book a consultation: https://alliancetechltd.com/contact`,
    `— Alliance Tech`,
  ];
  return lines.join("\n");
}

module.exports = { buildGrowthReportUserHtml, buildGrowthReportUserText };
