/**
 * Contradiction guard — the last line of defense against wrong audits.
 * Deterministically removes any AI finding that the collected data disproves.
 * Costs nothing: pure code, no API calls.
 */

const NEGATION = /\bno\b|missing|lack|without|absent|not detected|couldn'?t|could not|can'?t|can not|cannot|doesn'?t|does not|isn'?t|is not|none|not find|unable/i;

// Each rule: if `flag(data)` is true, findings matching `topic` are
// contradicted. Absence-claims need a negation word; `direct` topics (like
// claiming the site is slow) are contradictions by the claim itself.
const RULES = [
  { topic: /whats\s?app/i, flag: (d) => d.seo?.conversion?.hasWhatsApp },
  { topic: /tap.to.call|phone (link|number|option)|call (button|option|link)|tel:/i, flag: (d) => d.seo?.conversion?.hasPhoneLink },
  { topic: /booking|appointment|schedul/i, flag: (d) => d.seo?.conversion?.hasBooking },
  { topic: /contact form|\bform\b/i, flag: (d) => d.seo?.conversion?.hasForm },
  { topic: /\bmap\b|location/i, flag: (d) => d.seo?.conversion?.hasMap },
  { topic: /review|testimonial/i, flag: (d) => d.seo?.conversion?.hasReviews },
  {
    topic: /\bslow\b|takes too long|load(ing)? (time|speed)|speed (issue|problem)/i,
    direct: true, // claiming slowness IS the contradiction when speed is good/unknown
    flag: (d) => {
      const score = d.pagespeed?.mobile?.scores?.performance;
      return score == null || score >= 80;
    },
  },
];

function contradicted(text, data) {
  if (!text) return false;
  return RULES.some(
    (r) => r.flag(data) && r.topic.test(text) && (r.direct || NEGATION.test(text))
  );
}

function issueContradicted(issue, data) {
  return contradicted(`${issue.title} ${issue.impact}`, data);
}

/**
 * Scrub the report in place. Returns the number of findings removed
 * (logged for monitoring — a high rate means the prompt needs work).
 */
function sanitizeReport(report, data) {
  let removed = 0;

  for (const key of ["criticalIssues", "improvements"]) {
    if (Array.isArray(report[key])) {
      const before = report[key].length;
      report[key] = report[key].filter((it) => !issueContradicted(it, data));
      removed += before - report[key].length;
    }
  }

  // Headline / mystery patient / revenue text that contradicts data gets
  // replaced with safe, data-derived alternatives.
  if (contradicted(report.headline, data)) {
    report.headline =
      report.criticalIssues?.[0]?.impact ||
      "There are opportunities to win more patients from your website.";
    removed++;
  }
  if (contradicted(report.mysteryPatient, data)) {
    delete report.mysteryPatient;
    removed++;
  }
  if (contradicted(report.verdict, data)) {
    report.verdict = report.criticalIssues?.length ? "Fixable issues found" : "Solid, with room to grow";
    removed++;
  }

  return removed;
}

module.exports = { sanitizeReport };
