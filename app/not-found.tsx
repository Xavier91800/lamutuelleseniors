import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">404</p>
      <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
        Cette page est introuvable
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        Le lien que vous avez suivi est peut-être obsolète, ou cette page n&apos;existe plus.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/tunnel"
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-[var(--color-brand)] bg-white px-6 py-3 text-base font-semibold text-[var(--color-brand)] hover:bg-blue-50"
        >
          Obtenir un devis
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-500">
        Si vous pensez qu&apos;il y a une erreur, contactez-nous à{' '}
        <a href={`mailto:${siteConfig.email}`} className="font-medium underline">
          {siteConfig.email}
        </a>
        .
      </p>
    </section>
  );
}
