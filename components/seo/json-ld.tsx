interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function MarketingJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://saas-starter.example.com";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SaaS Starter",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [],
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SaaS Starter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Production-ready Next.js SaaS starter with auth, billing, teams, and RBAC.",
    url: baseUrl,
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={software} />
    </>
  );
}
