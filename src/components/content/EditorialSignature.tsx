import Link from 'next/link';
import { siteConfig } from '@/config/site';

const FR_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatFrenchDate(yyyymmdd: string): string {
  const d = new Date(yyyymmdd);
  if (Number.isNaN(d.getTime())) return yyyymmdd;
  return FR_DATE.format(d);
}

type Props = {
  publishedAt: string; // YYYY-MM-DD
  /** "publié" pour les articles, "mis à jour" pour les pages-glossaire/référentiels. */
  mode?: 'publie' | 'maj';
};

export function EditorialSignature({ publishedAt, mode = 'publie' }: Props) {
  const dateLabel = mode === 'publie' ? 'Article publié le' : 'Mis à jour le';
  return (
    <footer className="mt-16 border-t border-gray-200 pt-6 text-sm leading-relaxed text-gray-500">
      <p>
        {dateLabel}{' '}
        <strong className="text-gray-700">{formatFrenchDate(publishedAt)}</strong>{' '}
        par l&apos;équipe éditoriale de{' '}
        <strong className="text-gray-700">{siteConfig.siteName}</strong>. Toutes les
        données chiffrées sont issues de publications publiques (DREES, INSEE, Sénat,
        ACPR, Mutualité Française, Légifrance, DGCCRF). Liens directs et liste complète
        sur notre{' '}
        <Link
          href="/sources"
          className="font-semibold text-[var(--color-brand)] hover:underline"
        >
          page Sources
        </Link>
        .
      </p>
      <p className="mt-3 text-xs text-gray-400">
        Édité par {siteConfig.legalEntity}. {siteConfig.siteName} est un service de
        mise en relation et n&apos;est ni assureur, ni courtier en assurance.
      </p>
    </footer>
  );
}
