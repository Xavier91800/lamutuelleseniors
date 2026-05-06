import type { Metadata } from 'next';
import { LegalDocument } from '@/components/content/LegalDocument';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité du site ' +
    siteConfig.siteName +
    ' — protection de vos données personnelles, finalités, bases légales, droits RGPD.',
  alternates: { canonical: '/politique-de-confidentialite' },
};

export default function PdcPage() {
  return <LegalDocument kind="pdc" />;
}
