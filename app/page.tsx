import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.siteName} — Comparez votre mutuelle santé senior`,
  description:
    'Comparez gratuitement les mutuelles santé adaptées aux seniors et recevez les meilleures offres de nos courtiers partenaires en quelques minutes.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl lg:text-6xl">
            La mutuelle santé senior, simplement.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
            Répondez à quelques questions et recevez gratuitement les meilleures offres
            de mutuelle santé adaptées à votre profil senior.
          </p>
          <Link
            href="/tunnel"
            className="mt-10 inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Obtenir mon devis gratuit →
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Sans engagement · 2 minutes · 100&nbsp;% gratuit
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                title: '100 % gratuit',
                body: 'Notre service de mise en relation est entièrement gratuit pour vous.',
              },
              {
                title: 'Sans engagement',
                body: 'Aucun engagement à donner suite. Vous comparez, vous décidez.',
              },
              {
                title: 'Adapté aux seniors',
                body: 'Des offres spécifiquement conçues pour les besoins des 55 ans et plus.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg bg-gray-50 p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-3 text-base text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Prêt à comparer&nbsp;?
          </h2>
          <p className="mt-4 text-base text-gray-700">
            Quelques questions suffisent pour découvrir les meilleures mutuelles santé seniors
            disponibles dans votre département.
          </p>
          <Link
            href="/tunnel"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-[var(--color-brand-dark)]"
          >
            Démarrer mon comparatif
          </Link>
        </div>
      </section>
    </>
  );
}
