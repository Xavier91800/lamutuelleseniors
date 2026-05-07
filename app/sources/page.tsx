import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import {
  SOURCES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Source,
  type SourceCategory,
} from '@/config/sources';

export const metadata: Metadata = {
  title: 'Sources & ressources institutionnelles — Transparence',
  description:
    "Toutes les publications publiques (DREES, INSEE, Mutualité Française, Légifrance, CNIL, ACPR, Ameli, Service-Public…) citées sur le site, plus une sélection de ressources officielles complémentaires sur la mutuelle santé senior.",
  alternates: { canonical: '/sources' },
  robots: { index: true, follow: true },
};

const TYPE_LABELS: Record<Source['type'], string> = {
  rapport: 'Rapport',
  enquete: 'Enquête',
  donnees: 'Données',
  'texte-juridique': 'Texte juridique',
  portail: 'Portail officiel',
};

function shortOrg(full: string): string {
  return full.split(' — ')[0];
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-base font-semibold text-[var(--color-brand)] hover:underline"
    >
      {children}
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
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby={`source-${source.id}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 font-semibold text-[var(--color-brand)]">
          {shortOrg(source.organisme)}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
          {TYPE_LABELS[source.type]}
        </span>
        <span className="text-gray-500">Publication : {source.annee}</span>
      </div>
      <h3
        id={`source-${source.id}`}
        className="mt-4 text-xl font-semibold text-gray-900"
      >
        {source.publication}
      </h3>
      <p className="mt-2 text-sm text-gray-500">{source.organisme}</p>
      <p className="mt-4 text-base leading-relaxed text-gray-700">
        {source.description}
      </p>
      {source.utilisations.length > 0 && (
        <details className="mt-4 text-sm text-gray-600">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-[var(--color-brand)]">
            Où ce document est-il cité sur le site ?
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {source.utilisations.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      )}
      <p className="mt-6">
        <ExternalLink href={source.url}>Consulter la publication d&apos;origine</ExternalLink>
      </p>
    </article>
  );
}

export default function SourcesPage() {
  const cited = SOURCES.filter((s) => s.cited);
  const additional = SOURCES.filter((s) => !s.cited);

  const additionalByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: additional.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
          Transparence
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Sources & ressources institutionnelles
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-700">
          Tous les chiffres affichés sur ce site sont issus de publications
          publiques (organismes d&apos;État, fédérations professionnelles, textes
          juridiques). Vous trouverez ci-dessous la liste exhaustive des
          publications mobilisées, suivie d&apos;une sélection de ressources
          officielles complémentaires pour aller plus loin avant de comparer.
        </p>
        <p className="mt-4 text-base text-gray-600">
          {siteConfig.siteName} n&apos;est ni assureur ni courtier en assurance.
          Le site se limite à transmettre votre demande, avec votre consentement
          explicite, à un Courtier Partenaire qui prendra contact avec vous.
        </p>
      </header>

      {/* Sommaire / table des matières */}
      <nav
        aria-label="Sommaire"
        className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6"
      >
        <h2 className="text-base font-semibold text-gray-900">Sur cette page</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-base text-gray-700">
          <li>
            <a href="#publications-citees" className="hover:text-[var(--color-brand)]">
              Publications citées sur ce site
            </a>
          </li>
          <li>
            <a href="#ressources-complementaires" className="hover:text-[var(--color-brand)]">
              Ressources institutionnelles complémentaires
            </a>
            <ol className="mt-1 list-disc space-y-1 pl-6 text-sm text-gray-600">
              {additionalByCategory.map((g) => (
                <li key={g.category}>
                  <a href={`#cat-${g.category}`} className="hover:text-[var(--color-brand)]">
                    {g.label.title}
                  </a>
                </li>
              ))}
            </ol>
          </li>
        </ol>
      </nav>

      {/* Section 1 : sources citées */}
      <section
        aria-labelledby="publications-citees"
        className="mt-12 scroll-mt-20"
        id="publications-citees"
      >
        <h2
          id="publications-citees-heading"
          className="text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Publications citées sur ce site
        </h2>
        <p className="mt-3 text-base leading-relaxed text-gray-700">
          Ces {cited.length} publications sont la source des chiffres affichés
          dans la bande de chiffres clés de la page d&apos;accueil et dans
          notre Observatoire de la mutuelle senior. Pour chacune, le bloc
          « Où ce document est-il cité ? » indique précisément les pages
          concernées.
        </p>
        <div className="mt-8 space-y-6">
          {cited.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      {/* Section 2 : ressources complémentaires par catégorie */}
      <section
        aria-labelledby="ressources-complementaires"
        className="mt-16 scroll-mt-20"
        id="ressources-complementaires"
      >
        <h2
          className="text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Ressources institutionnelles complémentaires
        </h2>
        <p className="mt-3 text-base leading-relaxed text-gray-700">
          Sites officiels et associations indépendantes que nous recommandons aux
          visiteurs souhaitant approfondir un point précis (droits RGPD, recours en
          cas de litige, comparatifs indépendants, fiabilité d&apos;un assureur).
          Ces ressources ne sont pas mobilisées comme source de chiffre sur le site
          mais font partie de l&apos;écosystème français de référence sur la
          mutuelle santé.
        </p>
        {additionalByCategory.map((group) => (
          <div key={group.category} className="mt-12 scroll-mt-20" id={`cat-${group.category}`}>
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {group.label.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-gray-700">
              {group.label.intro}
            </p>
            <div className="mt-6 space-y-6">
              {group.items.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="mt-16 rounded-2xl bg-gray-50 p-8 text-base leading-relaxed text-gray-700">
        <h2 className="text-xl font-semibold text-gray-900">
          Continuer votre lecture
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            <Link
              href="/observatoire-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Observatoire de la mutuelle senior
            </Link>{' '}
            — synthèse des publications publiques.
          </li>
          <li>
            <Link
              href="/cout-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Combien coûte une mutuelle senior en 2026
            </Link>{' '}
            — analyse tarifaire détaillée.
          </li>
          <li>
            <Link
              href="/resilier-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Résilier sa mutuelle senior
            </Link>{' '}
            — guide pratique post-loi du 14 juillet 2019.
          </li>
          <li>
            <Link
              href="/lexique-mutuelle"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Lexique mutuelle santé
            </Link>{' '}
            — BR, BRSS, ticket modérateur, 100 % santé… expliqués simplement.
          </li>
        </ul>
      </aside>
    </article>
  );
}
