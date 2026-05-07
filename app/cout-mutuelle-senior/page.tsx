import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SOURCES } from '@/config/sources';

const PUBLISHED_AT = '2026-05-07';
const TITLE = 'Combien coûte une mutuelle senior en 2026 ? Décryptage des tarifs';
const DESCRIPTION =
  "Prix moyen d'une mutuelle senior à 60, 65, 70 et 80 ans, ce qui fait monter la facture, et les leviers concrets pour la limiter — chiffres DREES et Mutualité Française à l'appui.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/cout-mutuelle-senior' },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.baseUrl}/cout-mutuelle-senior`,
    publishedTime: PUBLISHED_AT,
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED_AT,
  dateModified: PUBLISHED_AT,
  inLanguage: 'fr-FR',
  author: { '@type': 'Organization', name: siteConfig.legalEntity },
  publisher: {
    '@type': 'Organization',
    name: siteConfig.legalEntity,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.baseUrl}${siteConfig.logoPath}`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteConfig.baseUrl}/cout-mutuelle-senior`,
  },
  citation: SOURCES.filter((s) =>
    ['drees-panorama-cs-2024', 'mutualite-cotisations-2025', 'drees-comptes-sante-2024'].includes(
      s.id
    )
  ).map((s) => ({
    '@type': 'CreativeWork',
    name: s.publication,
    author: { '@type': 'Organization', name: s.organisme.split(' — ')[0] },
    url: s.url,
    datePublished: s.annee,
  })),
};

function SourceLink({ id }: { id: string }) {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline-offset-2 hover:text-[var(--color-brand)] hover:underline"
    >
      {s.organisme.split(' — ')[0]}, {s.publication.split(' —')[0]} ({s.annee})
    </a>
  );
}

export default function CoutMutuelleSeniorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <header>
          <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500">
            <Link href="/" className="hover:text-[var(--color-brand)]">
              Accueil
            </Link>{' '}
            ›{' '}
            <Link
              href="/observatoire-mutuelle-senior"
              className="hover:text-[var(--color-brand)]"
            >
              Observatoire
            </Link>{' '}
            ›{' '}
            <span className="text-gray-700">Coût de la mutuelle senior</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
            Dossier — Tarifs 2026
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Combien coûte une mutuelle senior en 2026 ? Décryptage des tarifs
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            Une cotisation mensuelle qui passe d&apos;environ <strong>50 €
            à 60 ans</strong> à <strong>plus de 140 € à 85 ans</strong>, des
            hausses annuelles de <strong>5 à 7 %</strong> en moyenne ces deux
            dernières années, des écarts pouvant atteindre <strong>40 %</strong>
            entre deux contrats à garanties équivalentes : voici, chiffres
            officiels à l&apos;appui, ce qui détermine le prix de votre mutuelle
            après 55 ans, et les leviers concrets pour le maîtriser.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Publié le 7 mai 2026. Sources : DREES, Mutualité Française.
          </p>
        </header>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="prix-moyen">
          <h2 id="prix-moyen" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            1. Le prix moyen d&apos;une mutuelle senior par tranche d&apos;âge
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Les tarifs varient considérablement avec l&apos;âge. Selon le{' '}
            <em>Panorama de la complémentaire santé 2024</em> de la DREES, la
            cotisation mensuelle moyenne d&apos;un contrat individuel évolue
            ainsi :
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Âge</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">
                    Cotisation mensuelle moyenne
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-gray-800">20 ans</td>
                  <td className="px-4 py-3 text-right text-gray-800">≈ 33 €</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">60 ans (référence senior)</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">≈ 80 €</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-gray-800">70 ans</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">≈ 105 €</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">85 ans</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">≈ 146 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Source : <SourceLink id="drees-panorama-cs-2024" />. Les valeurs intermédiaires
            (60, 70 ans) sont des estimations interpolées sur la courbe d&apos;évolution
            DREES — les chiffres exacts des bornes 20 et 85 ans sont publiés ; la pente
            entre les deux est continue et progressive.
          </p>
          <p className="mt-6 text-base leading-relaxed text-gray-800">
            Cette progression reflète une réalité actuarielle : à 80 ans,
            on consomme en moyenne deux à trois fois plus de soins de santé qu&apos;à
            40 ans. La cotisation est mécaniquement calibrée sur la sinistralité
            attendue, et la réglementation française (contrat responsable)
            limite ce que les mutuelles peuvent moduler par d&apos;autres canaux.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="hausse-2025">
          <h2 id="hausse-2025" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            2. La hausse annuelle des cotisations en 2025
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            L&apos;<em>Enquête Cotisations 2025</em> de la Mutualité Française
            (réalisée auprès de 41 mutuelles couvrant 18,9 millions de personnes)
            documente une hausse moyenne de <strong>+6 %</strong> sur l&apos;année
            2025. Le détail montre un écart entre les types de contrats :
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-gray-800">
            <li>
              <strong>+5,3 %</strong> sur les contrats individuels (souscrits par
              une majorité de seniors et de TNS).
            </li>
            <li>
              <strong>+6,8 %</strong> sur les contrats collectifs (entreprises).
            </li>
          </ul>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour un senior payant 90 € par mois en 2024, cette hausse représente
            environ 60 € de plus sur l&apos;année 2025 ; sur cinq ans cumulés,
            au même rythme, la cotisation augmente de l&apos;ordre de 30 %.
            C&apos;est un levier majeur pour reconsidérer son contrat.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Source : <SourceLink id="mutualite-cotisations-2025" />.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="qui-paie-quoi">
          <h2 id="qui-paie-quoi" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            3. Pourquoi le prix monte avec l&apos;âge — les vrais postes de coût
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Trois postes pèsent particulièrement sur la facture des seniors :
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Optique et dentaire (hors panier 100 % santé)
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Si le panier 100 % santé permet une prise en charge complète sur
            certaines offres, la majorité des seniors recherchent des verres
            progressifs haut de gamme, des prothèses dentaires céramo-céramiques,
            voire des implants. Ces postes sont souvent <strong>plafonnés
            annuellement</strong> par les contrats (par exemple 600 €/an de
            dentaire), avec un reste à charge potentiel de plusieurs centaines
            d&apos;euros sur un soin lourd.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Hospitalisation et chambre particulière
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Le forfait hospitalier (20 €/jour en 2026) est obligatoirement
            remboursé par toute complémentaire responsable, sans limite de
            durée. En revanche, la <strong>chambre particulière</strong> (60 à
            120 €/jour selon l&apos;établissement), les frais de
            télévision-téléphone et les soins en clinique privée non conventionnée
            sont des postes où les écarts entre contrats sont les plus visibles.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Audioprothèses
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Le panier 100 % santé couvre intégralement certains modèles d&apos;aide
            auditive. Mais beaucoup de seniors choisissent un appareillage
            premium, dont la prise en charge complémentaire dépend fortement du
            contrat. Sur 4 000 € d&apos;équipement (paire), le reste à charge peut
            varier de 0 € à plus de 1 500 € selon les garanties.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Pour comprendre les abréviations citées (BR, ticket modérateur,
            OPTAM, panier 100 % santé), voir notre{' '}
            <Link
              href="/lexique-mutuelle"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              lexique mutuelle
            </Link>
            .
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="leviers">
          <h2 id="leviers" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            4. Les leviers pour limiter la facture
          </h2>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Comparer chaque année (et en changer si pertinent)
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            La <strong>résiliation infra-annuelle</strong>, en vigueur depuis
            décembre 2020, autorise tout assuré à quitter sa mutuelle après un an
            de souscription, sans frais ni motif. Comparer les offres tous les
            12 à 24 mois — sans nécessairement changer — est l&apos;arbitrage le
            plus efficace pour ne pas subir les hausses cumulées. Notre guide
            pratique détaille la procédure :{' '}
            <Link
              href="/resilier-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Comment résilier sa mutuelle senior
            </Link>
            .
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Calibrer les garanties à votre vraie consommation
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Beaucoup de seniors paient pour des garanties surdimensionnées sur
            certains postes (médecines douces, frais à l&apos;étranger) et
            sous-dimensionnées sur d&apos;autres (audio, dentaire). Identifier
            ses 2-3 postes prioritaires — d&apos;après son historique réel
            de remboursements Sécu sur les 12 derniers mois — fait souvent
            apparaître des contrats <strong>20 à 40 % moins chers</strong> à
            couverture utile équivalente.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Vérifier l&apos;adhésion OPTAM des médecins consultés
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Les complémentaires responsables remboursent mieux les dépassements
            d&apos;honoraires des médecins de secteur 2 ayant signé l&apos;OPTAM.
            Vérifier sur ameli.fr l&apos;adhésion de vos spécialistes habituels
            est gratuit et peut éviter plusieurs dizaines d&apos;euros de reste
            à charge par consultation.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="conclusion" className="rounded-2xl bg-gray-50 p-8">
          <h2 id="conclusion" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Ce qu&apos;il faut retenir
          </h2>
          <ul className="mt-6 space-y-3 text-base leading-relaxed text-gray-800">
            <li>
              <strong>Une mutuelle senior coûte en moyenne 80 € à 60 ans, et
              jusqu&apos;à 146 € à 85 ans</strong> pour un contrat individuel
              (DREES). Cette progression est structurelle.
            </li>
            <li>
              <strong>Les cotisations augmentent de 5 à 7 % par an</strong>
              {' '}depuis 2023 ; la tendance ne s&apos;essouffle pas (Mutualité
              Française).
            </li>
            <li>
              <strong>Les écarts entre contrats peuvent atteindre 40 %</strong>
              {' '}à garanties utiles équivalentes — d&apos;où l&apos;intérêt
              de comparer.
            </li>
            <li>
              <strong>La loi de 2019 permet de résilier librement</strong>
              {' '}après un an : c&apos;est le principal outil dont dispose
              l&apos;assuré.
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">
            Voyez en deux minutes ce que vous pourriez économiser
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/95">
            Comparez librement les meilleures offres de mutuelle santé senior
            adaptées à votre profil et à votre département. Sans engagement,
            sans frais, sans appel surprise.
          </p>
          <Link
            href="/tunnel"
            className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Démarrer mon comparatif gratuit →
          </Link>
        </aside>
      </article>
    </>
  );
}
