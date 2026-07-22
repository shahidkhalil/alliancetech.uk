const BASE_URL = "https://alliancetechltd.com";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${BASE_URL}/#organization`,
            name: "Alliance Tech",
            legalName: "Alliance Tech Ltd",
            url: BASE_URL,
            logo: `${BASE_URL}/logo-horizontal.png`,
            email: "Sales@alliancetechltd.com",
            telephone: "+44 161 515 7261",
            address: {
              "@type": "PostalAddress",
              streetAddress: "138 Laburnum Rd",
              addressLocality: "Blackburn",
              postalCode: "BB1 5EQ",
              addressRegion: "England",
              addressCountry: "GB",
            },
            sameAs: [
              "https://www.instagram.com/alliancetechofficial",
              "https://www.facebook.com/alliancetech11",
              "https://www.linkedin.com/company/alliancetechltd/",
            ],
          },
          {
            "@type": "WebSite",
            "@id": `${BASE_URL}/#website`,
            url: BASE_URL,
            name: "Alliance Tech",
            publisher: { "@id": `${BASE_URL}/#organization` },
            inLanguage: "en-GB",
          },
        ],
      }}
    />
  );
}

export function ServiceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `${BASE_URL}${path}`,
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: [
          { "@type": "City", name: "Blackburn" },
          { "@type": "AdministrativeArea", name: "England" },
          { "@type": "Country", name: "United Kingdom" },
        ],
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.path}`,
        })),
      }}
    />
  );
}
