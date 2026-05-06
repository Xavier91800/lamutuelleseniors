import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Demande envoyée',
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
          <svg className="h-9 w-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Merci, votre demande a bien été enregistrée
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Un courtier en assurance partenaire prendra contact avec vous sous quelques jours
          ouvrés pour vous proposer une offre adaptée à votre situation.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Vous pouvez à tout moment exercer vos droits RGPD en nous contactant — voir notre{' '}
          <Link href="/politique-de-confidentialite" className="font-medium underline hover:text-[var(--color-brand)]">
            Politique de confidentialité
          </Link>
          .
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-brand-dark)]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
