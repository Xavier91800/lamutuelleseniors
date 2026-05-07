import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { MARKET_STATS, FAQ_ITEMS } from '@/config/marketing';
import { FaqAccordion } from '@/components/content/FaqAccordion';

export const metadata: Metadata = {
  title: `${siteConfig.siteName} — Comparez votre mutuelle santé senior`,
  description:
    'Comparez gratuitement les mutuelles santé adaptées aux seniors et recevez les meilleures offres de nos courtiers partenaires en 2 minutes.',
  alternates: { canonical: '/' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.reponse },
  })),
};

const TRUST_PILLARS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: '100 % gratuit',
    body:
      "Aucun coût pour vous, à aucun moment. Notre service est rémunéré par les Courtiers Partenaires lorsqu'une mise en relation aboutit, sans aucune incidence sur le tarif des contrats qui vous seront proposés.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 7H9a3 3 0 100 6h6a3 3 0 110 6H8m4-15v3m0 12v3"
      />
    ),
  },
  {
    title: 'Sans engagement',
    body:
      'Vous comparez librement, vous prenez le temps qu\'il vous faut. Aucune souscription automatique, aucune pression : à la fin du parcours, vous décidez seul(e).',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: 'Aucun appel surprise',
    body:
      'Vous êtes recontacté(e) uniquement après votre demande, par le Courtier Partenaire que nous aurons sélectionné, par e-mail ou par téléphone selon votre préférence.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
  {
    title: 'Vos données protégées',
    body:
      "Vos informations sont stockées en France, conformément au RGPD. Elles ne sont jamais revendues. Vous pouvez demander leur suppression à tout moment auprès de notre Délégué à la protection des données.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
      />
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-famille.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/90 to-[var(--color-brand-dark)]/90" />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28 lg:px-8">
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Retraite, hausse des cotisations&nbsp;? Trouvez en 2 minutes la mutuelle senior
            qui vous protège vraiment.
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-white/95 sm:text-2xl">
            Optique, dentaire, hospitalisation, audioprothèse&nbsp;: comparez gratuitement
            les meilleures offres adaptées à votre âge et à votre budget. Sans démarches
            compliquées, sans engagement.
          </p>
          <Link
            href="/tunnel"
            className="mt-10 inline-flex min-h-[64px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-10 py-5 text-xl font-bold text-white shadow-xl ring-2 ring-white/20 hover:bg-[var(--color-accent-dark)] focus-visible:ring-4 focus-visible:ring-white/60"
          >
            Obtenir mon devis gratuit →
          </Link>
          <p className="mt-5 text-base text-white/90 sm:text-lg">
            Sans engagement · 2 minutes top chrono · 100&nbsp;% gratuit
          </p>
        </div>
      </section>

      {/* Le marché de la mutuelle senior — chiffres publics sourcés */}
      <section
        aria-labelledby="market-stats-heading"
        className="border-y border-gray-200 bg-white py-14 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="market-stats-heading"
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Le marché de la mutuelle santé senior en France
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Quelques chiffres publics qui éclairent votre choix.
            </p>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-bold text-[var(--color-brand)] sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-3 text-base leading-relaxed text-gray-700">
                  {stat.label}
                </dd>
                <p className="mt-3 text-xs text-gray-500">
                  Source&nbsp;:{' '}
                  <a
                    href={stat.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-[var(--color-brand)] hover:underline"
                  >
                    {stat.source}
                  </a>
                </p>
              </div>
            ))}
          </dl>
          <p className="mx-auto mt-12 max-w-3xl text-center text-xs leading-relaxed text-gray-500">
            Sources publiques&nbsp;: INSEE, DREES, Mutualité Française, Légifrance.
            Ces statistiques portent sur le marché français de la complémentaire santé
            et n&apos;engagent pas l&apos;activité de {siteConfig.siteName}, qui n&apos;est
            ni assureur ni courtier en assurance. Détails et liens vers les
            publications d&apos;origine sur la{' '}
            <Link
              href="/sources"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              page Sources
            </Link>
            {' '}et notre{' '}
            <Link
              href="/observatoire-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Observatoire de la mutuelle senior
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section
        aria-labelledby="how-it-works-heading"
        className="bg-gray-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="how-it-works-heading"
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Trois étapes simples, deux minutes top chrono
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Pas de jargon, pas d&apos;engagement&nbsp;: vous comparez à votre rythme,
              vous décidez librement.
            </p>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                num: '1',
                title: 'Répondez à quelques questions',
                body:
                  "Une dizaine de questions claires sur votre situation et vos besoins de couverture. Nom, âge, code postal, garanties souhaitées.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                ),
              },
              {
                num: '2',
                title: 'Comparez les meilleures offres',
                body:
                  'Nos courtiers partenaires vous adressent des propositions adaptées à votre profil senior, avec les garanties détaillées et le tarif mensuel.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                ),
              },
              {
                num: '3',
                title: 'Choisissez en toute liberté',
                body:
                  'Vous prenez le temps de comparer. Aucune obligation de souscrire. Si une offre vous convient, le courtier s\'occupe de tout, y compris la résiliation de votre ancienne mutuelle.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                ),
              },
            ].map((step) => (
              <li
                key={step.num}
                className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <svg
                    aria-hidden="true"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {step.icon}
                  </svg>
                </div>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                  Étape {step.num}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-gray-700">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pourquoi vous pouvez nous faire confiance — piliers vérifiables */}
      <section
        aria-labelledby="trust-heading"
        className="bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="trust-heading"
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Pourquoi vous pouvez nous faire confiance
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Un service de mise en relation transparent, conçu pour les seniors —
              et seulement cela.
            </p>
          </div>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => (
              <li
                key={pillar.title}
                className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-200"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  <svg
                    aria-hidden="true"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {pillar.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-gray-700">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="bg-gray-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="faq-heading"
            className="text-center text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Vos questions, nos réponses
          </h2>
          <p className="mt-4 text-center text-lg text-gray-700">
            Tout ce qu&apos;il faut savoir avant de comparer.
          </p>
          <div className="mt-10">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* CTA de sortie */}
      <section className="bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Découvrez en 2 minutes ce que vous pourriez économiser
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Comparez librement les mutuelles santé adaptées à votre profil senior.
            Sans engagement, sans frais, sans pression.
          </p>
          <Link
            href="/tunnel"
            className="mt-10 inline-flex min-h-[64px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-10 py-5 text-xl font-bold text-white shadow-xl hover:bg-[var(--color-accent-dark)]"
          >
            Démarrer mon comparatif gratuit
          </Link>
          <p className="mt-4 text-sm text-white/80">
            Aucun appel surprise&nbsp;: vous êtes recontacté(e) uniquement après votre
            demande, par le Courtier Partenaire que nous aurons sélectionné.
          </p>
        </div>
      </section>
    </>
  );
}
