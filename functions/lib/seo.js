/**
 * On-page SEO + UX signal extraction.
 * We fetch the raw HTML ourselves and check concrete, factual things
 * that Lighthouse doesn't surface in a business-friendly way.
 */

const cheerio = require("cheerio");

async function analyzeSeo(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AllianceAuditBot/1.0)" },
    signal: AbortSignal.timeout(20000),
  });
  const finalUrl = res.url || url;
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("head title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const h1s = $("h1");
  const images = $("img");
  const imagesMissingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  // Conversion / UX signals that matter for clinics specifically.
  const htmlLower = html.toLowerCase();
  const hasWhatsApp = /wa\.me|whatsapp|api\.whatsapp/.test(htmlLower);
  const hasPhoneLink = $('a[href^="tel:"]').length > 0;
  const hasBooking = /book|appointment|schedule|consultation/.test(htmlLower);
  const hasMap = /google\.com\/maps|maps\.google|goo\.gl\/maps|<iframe[^>]+maps/.test(htmlLower);
  const hasReviews = /review|testimonial|rating|stars?/.test(htmlLower);
  const hasForm = $("form").length > 0;

  return {
    finalUrl,
    statusCode: res.status,
    isHttps: finalUrl.startsWith("https://"),
    // Core SEO tags
    title,
    titleLength: title.length,
    metaDescription: metaDesc,
    metaDescriptionLength: metaDesc.length,
    h1Count: h1s.length,
    h1Text: h1s.first().text().trim().slice(0, 120),
    hasCanonical: $('link[rel="canonical"]').length > 0,
    hasViewport: $('meta[name="viewport"]').length > 0,
    hasLangAttr: !!$("html").attr("lang"),
    hasFavicon: $('link[rel*="icon"]').length > 0,
    // Social sharing
    hasOgTitle: $('meta[property="og:title"]').length > 0,
    hasOgImage: $('meta[property="og:image"]').length > 0,
    hasTwitterCard: $('meta[name="twitter:card"]').length > 0,
    // Structured data & indexing
    hasStructuredData: $('script[type="application/ld+json"]').length > 0,
    robotsMeta: $('meta[name="robots"]').attr("content") || "",
    // Content depth
    wordCount: bodyText ? bodyText.split(" ").length : 0,
    imageCount: images.length,
    imagesMissingAlt,
    // Conversion / UX signals
    conversion: { hasWhatsApp, hasPhoneLink, hasBooking, hasMap, hasReviews, hasForm },
  };
}

module.exports = { analyzeSeo };
