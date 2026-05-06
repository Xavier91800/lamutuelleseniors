import type { Metadata } from 'next';
import { LegalDocument } from '@/components/content/LegalDocument';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation du site " +
    siteConfig.siteName +
    ' — service gratuit de mise en relation avec des courtiers en assurance.',
  alternates: { canonical: '/conditions-generales' },
};

export default function CguPage() {
  return <LegalDocument kind="cgu" />;
}
