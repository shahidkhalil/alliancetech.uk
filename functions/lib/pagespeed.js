/**
 * Google PageSpeed Insights (Lighthouse) integration.
 * Free API — an API key is optional but recommended to avoid rate limits.
 */

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/**
 * Run PageSpeed for one strategy (mobile | desktop).
 * Returns category scores (0-100) and the key Core Web Vitals metrics.
 */
async function runStrategy(url, strategy, apiKey) {
  const params = new URLSearchParams({ url, strategy });
  ["performance", "seo", "accessibility", "best-practices"].forEach((c) =>
    params.append("category", c)
  );
  if (apiKey) params.append("key", apiKey);

  const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(55000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PageSpeed ${strategy} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const lh = data.lighthouseResult || {};
  const cats = lh.categories || {};
  const audits = lh.audits || {};

  const score = (c) => (cats[c] && cats[c].score != null ? Math.round(cats[c].score * 100) : null);
  const metric = (id) => (audits[id] ? audits[id].displayValue : null);

  return {
    strategy,
    scores: {
      performance: score("performance"),
      seo: score("seo"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
    },
    metrics: {
      firstContentfulPaint: metric("first-contentful-paint"),
      largestContentfulPaint: metric("largest-contentful-paint"),
      totalBlockingTime: metric("total-blocking-time"),
      cumulativeLayoutShift: metric("cumulative-layout-shift"),
      speedIndex: metric("speed-index"),
      timeToInteractive: metric("interactive"),
    },
    // Top failing opportunities (things that would speed the site up).
    opportunities: Object.values(audits)
      .filter((a) => a.details && a.details.type === "opportunity" && a.score != null && a.score < 0.9)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .slice(0, 6)
      .map((a) => ({ title: a.title, savings: a.displayValue || "" })),
  };
}

/**
 * Run both mobile and desktop. Mobile is the priority (most clinic traffic).
 */
async function runPageSpeed(url, apiKey) {
  const [mobile, desktop] = await Promise.allSettled([
    runStrategy(url, "mobile", apiKey),
    runStrategy(url, "desktop", apiKey),
  ]);
  return {
    mobile: mobile.status === "fulfilled" ? mobile.value : { error: mobile.reason?.message },
    desktop: desktop.status === "fulfilled" ? desktop.value : { error: desktop.reason?.message },
  };
}

module.exports = { runPageSpeed };
