import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { LEGAL_PAGES, PRIMARY_LANDINGS } from '@/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home = {
    url: siteConfig.baseUrl,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 1,
  };

  const landings: MetadataRoute.Sitemap = PRIMARY_LANDINGS.map((p) => ({
    url: `${siteConfig.baseUrl}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const editorial: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.baseUrl}/observatoire-mutuelle-senior`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.baseUrl}/cout-mutuelle-senior`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.baseUrl}/resilier-mutuelle-senior`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.baseUrl}/lexique-mutuelle`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${siteConfig.baseUrl}/sources`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  const legals: MetadataRoute.Sitemap = LEGAL_PAGES.map((p) => ({
    url: `${siteConfig.baseUrl}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [home, ...landings, ...editorial, ...legals];
}
