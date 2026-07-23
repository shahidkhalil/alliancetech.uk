/** @type {import('next').NextConfig} */
/** Maya Live Call / Chat / Book — hosted on alliancepak (previous Firebase project). */
const MAYA_CF = "https://asia-south1-alliancepak.cloudfunctions.net";
/** Other APIs — current project when those functions are deployed. */
const SITE_CF = "https://asia-south1-alliance-tech-656ba.cloudfunctions.net";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Local dev: proxy /api/* so same-origin calls work if anything still uses them.
  async rewrites() {
    return [
      { source: "/api/receptionist", destination: `${MAYA_CF}/clinicReceptionist` },
      { source: "/api/realtime-token", destination: `${MAYA_CF}/realtimeToken` },
      { source: "/api/book", destination: `${MAYA_CF}/bookAppointmentHttp` },
      { source: "/api/business-audit", destination: `${SITE_CF}/auditWebsite` },
    ];
  },
};

module.exports = nextConfig;
