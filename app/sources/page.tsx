import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SOURCES, type Source } from '@/config/sources';

export const metadata: Metadata = {
  title: 'Sources & publications — Transparence',
  description:
    "Toutes les sources publiques (DREES, INSEE, Mutualité Française, Légifrance) citées sur le site, avec liens directs vers les publications d'origine.",
  alternates: { canonical: '/sources' },
  robots: { index: true, follow: true },
};

const TYPE_LABELS: Record<Source['type'], string> = {
  rapport: 'Rapport',
  enquete: 'Enquête',
  donnees: 'Données statistiques',
  'texte-juridique': 'Texte juridique',
};

const ORGANISMES = [
  'DREES',
  'INSEE',
  'Mutualité Française',
  'Légifrance',
] as const;

function shortOrganisme(full: string): string {
  return ORGANISMES.find((o) => full.includes(o)) ?? full.split(' — ')[0];
}

export default function SourcesPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
          Transparence
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Sources & publications
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-700">
          Tous les chiffres affichés sur ce site sont issus de publications
          publiques (organismes d&apos;État, fédérations professionnelles, textes
          juridiques). Vous trouverez ci-dessous la liste exhaustive de ces
          publications, avec un lien vers leur version d&apos;origine.
        </p>
        <p className="mt-4 text-base text-gray-600">
          {siteConfig.siteName} n&apos;est ni assureur ni courtier en assurance.
          Le site se limite à transmettre votre demande, avec votre consentement
          explicite, à un Courtier Partenaire qui prendra contact avec vous.
        </p>
      </header>

      <div className="mt-12 space-y-8">
        {SOURCES.map((source) => (
          <section
            key={source.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            aria-labelledby={`source-${source.id}`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 font-semibold text-[var(--color-brand)]">
                {shortOrganisme(source.organisme)}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {TYPE_LABELS[source.type]}
              </span>
              <span className="text-gray-500">Publication&nbsp;: {source.annee}</span>
            </div>
            <h2
              id={`source-${source.id}`}
              className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl"
            >
              {source.publication}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{source.organisme}</p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              {source.description}
            </p>
            <details className="mt-4 text-sm text-gray-600">
              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-[var(--color-brand)]">
                Où ce document est-il cité sur le site&nbsp;?
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {source.utilisations.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </details>
            <p className="mt-6">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-base font-semibold text-[var(--color-brand)] hover:underline"
              >
                Consulter la publication d&apos;origine
                <svg
                  aria-hidden="true"
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 3h7v7m0-7L10 14m-4-4v10h10"
                  />
                </svg>
              </a>
            </p>
          </section>
        ))}
      </div>

      <aside className="mt-16 rounded-2xl bg-gray-50 p-8 text-base leading-relaxed text-gray-700">
        <h2 className="text-xl font-semibold text-gray-900">
          Vous voulez creuser ces chiffres&nbsp;?
        </h2>
        <p className="mt-3">
          Notre <Link
            href="/observatoire-mutuelle-senior"
            className="font-semibold text-[var(--color-brand)] hover:underline"
          >
            Observatoire de la mutuelle senior
          </Link>{' '}
          synthétise, en français clair, les principales publications listées
          ci-dessus pour vous aider à comprendre le marché avant de comparer.
        </p>
      </aside>
    </article>
  );
}
