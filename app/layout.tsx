import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { siteConfig } from '@/config/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { PlausibleScript } from '@/lib/analytics/plausible';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${siteConfig.siteName} — Comparez votre mutuelle santé senior`,
    template: `%s | ${siteConfig.siteName}`,
  },
  description:
    'Comparez gratuitement les mutuelles santé adaptées aux seniors et recevez les meilleures offres de nos courtiers partenaires en quelques minutes.',
  applicationName: siteConfig.siteName,
  authors: [{ name: siteConfig.legalEntity }],
  creator: siteConfig.legalEntity,
  publisher: siteConfig.legalEntity,
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.baseUrl,
    siteName: siteConfig.siteName,
  },
  twitter: {
    card: 'summary_large_image',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: siteConfig.colorPrimary,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.className}>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <PlausibleScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
