import type { Metadata } from 'next';
import { LegalDocument } from '@/components/content/LegalDocument';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du site ' +
    siteConfig.siteName +
    ' — éditeur, hébergeur, directeur de publication, contact.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsPage() {
  return <LegalDocument kind="mentions" />;
}
