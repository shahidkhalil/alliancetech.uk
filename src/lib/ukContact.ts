/** Shared UK business contact — Alliance Tech Ltd (Blackburn). */
/** Phone / WhatsApp — leave blank until the live UK number is ready. */
export const UK_PHONE_DISPLAY = "";
export const UK_PHONE_DIGITS = ""; // e.g. "441615157261" (no +)
export const UK_PHONE_TEL = UK_PHONE_DIGITS ? `tel:+${UK_PHONE_DIGITS}` : "/contact";
export const UK_WHATSAPP_E164 = ""; // e.g. "441615157261"
export const UK_WHATSAPP_URL = UK_WHATSAPP_E164
  ? `https://wa.me/${UK_WHATSAPP_E164}`
  : "/contact";
export const hasUkPhone = Boolean(UK_PHONE_DIGITS);
export const hasUkWhatsApp = Boolean(UK_WHATSAPP_E164);

export const UK_EMAIL = "Sales@alliancetechltd.com";
export const UK_ADDRESS_LINE = "138 Laburnum Rd, Blackburn BB1 5EQ, United Kingdom";
export const UK_GOOGLE_REVIEWS =
  "https://www.google.com/maps/search/?api=1&query=Alliancetechltd+138+Laburnum+Rd+Blackburn";
export const UK_REVIEW_SCORE = "5.01";
export const UK_REVIEW_LABEL = "Google reviews";
