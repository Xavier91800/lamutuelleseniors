import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { MARKETING, TESTIMONIALS, FAQ_ITEMS } from '@/config/marketing';
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

function Stars({ count }: { count: 4 | 5 }) {
  return (
    <span className="inline-flex" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-5 w-5 ${i < count ? 'fill-[var(--color-accent)]' : 'fill-gray-300'}`}
        >
          <path d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6L10 15.27l-5.4 2.84 1.03-6L1.27 7.84l6.03-.88L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

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
            <strong className="font-semibold">{MARKETING.NB_DEVIS}</strong> seniors
            comparés en 2024 · Réponse en 2 minutes · 100&nbsp;% gratuit
          </p>
        </div>
      </section>

      {/* Bande de chiffres clés */}
      <section
        aria-labelledby="reassurance-heading"
        className="border-y border-gray-200 bg-white py-10 sm:py-12"
      >
        <h2 id="reassurance-heading" className="sr-only">
          Notre service en chiffres
        </h2>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: MARKETING.NB_DEVIS, label: 'devis comparés en 2024' },
            { value: MARKETING.NB_PARTENAIRES, label: 'assureurs partenaires' },
            { value: MARKETING.NOTE_MOYENNE, label: `note moyenne (${MARKETING.NB_AVIS} avis)` },
            { value: `−${MARKETING.ECONOMIES_MOY}`, label: 'd\'économies moyennes constatées' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-[var(--color-brand)] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-base text-gray-700">{stat.label}</p>
            </div>
          ))}
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

      {/* Témoignages */}
      <section
        aria-labelledby="testimonials-heading"
        className="bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="testimonials-heading"
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Ils ont comparé leur mutuelle senior, et nous le racontent
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Note moyenne&nbsp;:{' '}
              <strong className="text-[var(--color-brand)]">
                {MARKETING.NOTE_MOYENNE}
              </strong>{' '}
              sur {MARKETING.NB_AVIS} avis vérifiés.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {TESTIMONIALS.map((avis) => (
              <figure
                key={avis.id}
                className="flex h-full flex-col rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-200"
              >
                <Stars count={avis.note} />
                <blockquote className="mt-4 grow text-base leading-relaxed text-gray-800">
                  «&nbsp;{avis.texte}&nbsp;»
                </blockquote>
                <figcaption className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-700">
                  <strong className="text-gray-900">{avis.prenom}</strong>, {avis.age} ans
                  · {avis.ville}
                </figcaption>
              </figure>
            ))}
          </div>
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
            Rejoignez les <strong>{MARKETING.NB_DEVIS}</strong> seniors qui ont déjà comparé
            leur mutuelle santé en 2024. Sans engagement, sans frais, sans pression.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/tunnel"
              className="inline-flex min-h-[64px] w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-10 py-5 text-xl font-bold text-white shadow-xl hover:bg-[var(--color-accent-dark)] sm:w-auto"
            >
              Démarrer mon comparatif gratuit
            </Link>
            <a
              href={MARKETING.TEL_HREF}
              className="inline-flex min-h-[64px] w-full items-center justify-center rounded-lg border-2 border-white/80 bg-white/10 px-8 py-5 text-lg font-semibold text-white hover:bg-white/20 sm:w-auto"
            >
              <svg
                aria-hidden="true"
                className="mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.61 21 3 14.39 3 6V5z"
                />
              </svg>
              Ou appelez le {MARKETING.TEL}
            </a>
          </div>
          <p className="mt-4 text-sm text-white/80">
            Service gratuit, {MARKETING.TEL_HORAIRES}
          </p>
        </div>
      </section>
    </>
  );
}
