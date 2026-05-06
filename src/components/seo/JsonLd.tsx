import { siteConfig } from '@/config/site';

/**
 * Single component to inject a JSON-LD payload into a page.
 * Use one of the helpers below for typed convenience.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.siteName,
        url: siteConfig.baseUrl,
        logo: `${siteConfig.baseUrl}${siteConfig.logoPath}`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: siteConfig.email,
          contactType: 'customer support',
          areaServed: 'FR',
          availableLanguage: ['French'],
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.siteName,
        url: siteConfig.baseUrl,
        inLanguage: 'fr-FR',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.baseUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbListJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${siteConfig.baseUrl}${item.url}`,
        })),
      }}
    />
  );
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageJsonLd({ faqs }: { faqs: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      }}
    />
  );
}
