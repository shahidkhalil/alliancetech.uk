/** @type {import('next').NextConfig} */
/** All Cloud Functions — alliance-tech-656ba only. */
const SITE_CF = "https://asia-south1-alliance-tech-656ba.cloudfunctions.net";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Local dev: proxy /api/* (hosting rewrites handle these in production).
  async rewrites() {
    return [
      { source: "/api/receptionist", destination: `${SITE_CF}/clinicReceptionist` },
      { source: "/api/realtime-token", destination: `${SITE_CF}/realtimeToken` },
      { source: "/api/book", destination: `${SITE_CF}/bookAppointmentHttp` },
      { source: "/api/business-audit", destination: `${SITE_CF}/auditWebsite` },
    ];
  },
};

module.exports = nextConfig;
