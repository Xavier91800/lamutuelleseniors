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

  const legals: MetadataRoute.Sitemap = LEGAL_PAGES.map((p) => ({
    url: `${siteConfig.baseUrl}/${p.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [home, ...landings, ...legals];
}
