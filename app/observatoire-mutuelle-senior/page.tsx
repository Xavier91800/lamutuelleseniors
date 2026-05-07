import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SOURCES } from '@/config/sources';

const PUBLISHED_AT = '2026-05-07';
const TITLE = 'Observatoire de la mutuelle santé senior 2026';
const DESCRIPTION =
  "Synthèse des publications publiques (DREES, INSEE, Mutualité Française, Légifrance) qui éclairent le marché de la mutuelle santé pour les 55 ans et plus.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/observatoire-mutuelle-senior' },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.baseUrl}/observatoire-mutuelle-senior`,
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
    '@id': `${siteConfig.baseUrl}/observatoire-mutuelle-senior`,
  },
  citation: SOURCES.map((s) => ({
    '@type': 'CreativeWork',
    name: s.publication,
    author: { '@type': 'Organization', name: s.organisme.split(' — ')[0] },
    url: s.url,
    datePublished: s.annee,
  })),
};

function SourceCallout({ id }: { id: string }) {
  const source = SOURCES.find((s) => s.id === id);
  if (!source) return null;
  return (
    <p className="mt-3 text-sm text-gray-500">
      Source :{' '}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:text-[var(--color-brand)] hover:underline"
      >
        {source.organisme.split(' — ')[0]} — {source.publication} ({source.annee})
      </a>
    </p>
  );
}

export default function ObservatoirePage() {
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
            <span className="text-gray-700">Observatoire de la mutuelle senior</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
            Dossier — Marché de la mutuelle senior
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Observatoire de la mutuelle santé senior : ce que disent les
            publications publiques en 2026
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            En 2026, le marché français de la mutuelle santé reste un sujet
            d&apos;information sensible pour les seniors : cotisations en hausse,
            restes à charge plus élevés avec l&apos;âge, droit de résiliation
            désormais ouvert toute l&apos;année. Voici une synthèse des publications
            publiques les plus utiles pour s&apos;y retrouver — et les liens directs
            vers chacune d&apos;elles.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Publié le 7 mai 2026. Sources : DREES, INSEE, Mutualité Française,
            Légifrance.
          </p>
        </header>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="syn-1">
          <h2
            id="syn-1"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            1. Démographie : un public senior structurellement en croissance
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Selon le bilan démographique 2024 de l&apos;INSEE, les personnes âgées
            de <strong>60 ans ou plus représentent 27,7 %</strong> de la population
            française au 1ᵉʳ janvier 2024, et les <strong>65 ans et plus 21,8 %</strong>
            {' '}— soit environ 14,9 millions de personnes. Cette part a quasiment
            doublé en cinquante ans, sous l&apos;effet conjugué du baby-boom et de
            l&apos;allongement de l&apos;espérance de vie.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour le marché de la complémentaire santé, ces chiffres ont une
            conséquence concrète : la demande de contrats adaptés aux seniors
            (qui consomment plus de soins, et notamment plus de soins coûteux comme
            l&apos;optique, le dentaire, l&apos;audioprothèse ou l&apos;hospitalisation)
            est appelée à croître durablement. Côté assureurs et mutuelles, c&apos;est
            aussi un défi de tarification : les contrats individuels seniors
            doivent intégrer un risque santé qui augmente avec l&apos;âge.
          </p>
          <SourceCallout id="insee-pyramide-2024" />
          <SourceCallout id="insee-bilan-demo-2024" />
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="syn-2">
          <h2
            id="syn-2"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            2. Le coût de la complémentaire santé augmente fortement avec l&apos;âge
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Le <em>Panorama de la complémentaire santé</em> publié par la DREES en
            juillet 2024 fait référence en France sur le marché des mutuelles. Il
            confirme deux tendances clés pour les seniors.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Une cotisation qui passe d&apos;environ 33 €/mois à 20 ans à 146 €/mois à 85 ans
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Pour un contrat individuel — celui que la majorité des seniors souscrit
            après le départ à la retraite, en remplacement de la mutuelle
            d&apos;entreprise —, la prime mensuelle moyenne croît avec l&apos;âge
            de manière significative. La DREES indique <strong>une cotisation
            moyenne de 33 € à 20 ans contre 146 € à 85 ans</strong>. Cette
            progression reflète la sinistralité plus élevée des assurés
            seniors : à garanties équivalentes, le coût des soins remboursés
            est mécaniquement plus important.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Un reste à charge environ trois fois plus élevé après 70 ans
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Toujours selon la DREES, sur les données 2019, le reste à charge
            annuel moyen <strong>après remboursement Sécurité sociale et
            complémentaire</strong> s&apos;élève à environ <strong>590 € par an
            pour un ménage dont la personne la plus âgée a 70 ans ou plus</strong>,
            contre <strong>206 €</strong> pour un ménage de moins de 40 ans —
            soit un rapport proche de 3. Ce rapport reflète la concentration des
            dépenses santé sur les âges élevés et l&apos;effet du vieillissement
            sur la charge financière individuelle, même en présence d&apos;une
            complémentaire.
          </p>
          <SourceCallout id="drees-panorama-cs-2024" />
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="syn-3">
          <h2
            id="syn-3"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            3. Le financement de la santé en France : où s&apos;intercale la mutuelle ?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Les <em>Comptes de la santé</em> publiés annuellement par la DREES
            décrivent comment les dépenses de santé sont financées. L&apos;édition
            2025 (sur données 2024) confirme que la France reste l&apos;un des
            pays où le reste à charge des ménages est le plus faible d&apos;Europe,
            avec environ <strong>292 € par habitant en moyenne</strong> sur le
            périmètre de la consommation de soins et biens médicaux (CSBM). La
            Sécurité sociale couvre près des quatre cinquièmes de la dépense, les
            complémentaires santé un peu plus de 12 %, et les ménages le solde.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour comprendre la logique d&apos;une mutuelle, il faut retenir que
            son rôle est précisément de prendre en charge le ticket modérateur,
            les dépassements d&apos;honoraires, les forfaits hospitaliers et tout
            ce qui n&apos;est pas (ou mal) remboursé par la Sécu. Pour un senior,
            la lecture concrète de ces comptes est la suivante : même dans
            un système globalement protecteur, l&apos;empilement
            soins-dentaires-optique-hospitalisation peut représenter plusieurs
            centaines d&apos;euros par an si la complémentaire est mal calibrée.
          </p>
          <SourceCallout id="drees-comptes-sante-2024" />
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="syn-4">
          <h2
            id="syn-4"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            4. Hausse 2025 des cotisations : ce que l&apos;Enquête Mutualité Française documente
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La Mutualité Française (fédération réunissant la quasi-totalité des
            mutuelles santé) publie chaque année une <em>Enquête Cotisations</em>{' '}
            mesurant l&apos;évolution moyenne des primes payées par les assurés.
            L&apos;édition 2025 a porté sur 41 mutuelles, couvrant
            <strong> 18,9 millions de personnes</strong>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Les cotisations ont augmenté en moyenne de <strong>6 %</strong> en
            2025, avec une nuance utile pour les seniors : la hausse atteint{' '}
            <strong>+5,3 % sur les contrats individuels</strong> (souscrits
            massivement après le départ à la retraite) et{' '}
            <strong>+6,8 % sur les contrats collectifs</strong>. La fédération
            attribue cette dynamique à l&apos;augmentation des dépenses de santé
            prises en charge par les complémentaires, sous l&apos;effet du
            vieillissement, du transfert progressif de prises en charge depuis la
            Sécurité sociale et de l&apos;inflation médicale.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour le senior : ces hausses sont structurelles, et il n&apos;y a
            aucune raison qu&apos;elles s&apos;arrêtent à court terme. Comparer
            les offres tous les un à deux ans est l&apos;une des rares marges de
            manœuvre dont dispose un assuré pour limiter l&apos;impact financier
            cumulé.
          </p>
          <SourceCallout id="mutualite-cotisations-2025" />
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="syn-5">
          <h2
            id="syn-5"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            5. Le droit de résiliation infra-annuelle : changer librement après un an
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La <strong>loi n° 2019-733 du 14 juillet 2019</strong> a introduit en
            France un droit de résiliation des contrats de complémentaire santé à
            tout moment après un an de souscription, sans frais ni motif. Le
            <strong> décret n° 2020-1438 du 24 novembre 2020</strong> en précise
            les modalités : la résiliation entre en vigueur le 1ᵉʳ décembre
            2020, et le dispositif est codifié à l&apos;article{' '}
            <strong>L113-15-2 du Code des assurances</strong>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Concrètement, après douze mois d&apos;ancienneté, un assuré peut
            quitter sa mutuelle quand il le souhaite, par simple notification
            écrite (courrier postal, email ou formulaire en ligne du nouveau
            prestataire). Aucun motif n&apos;est exigé, aucune pénalité ne peut
            être facturée, et la résiliation prend effet un mois après réception
            par l&apos;assureur. Mieux : le nouvel organisme peut prendre en
            charge directement la procédure de résiliation auprès de
            l&apos;ancien, sur présentation d&apos;un mandat signé.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour un senior couvert depuis plusieurs années par une mutuelle dont
            les cotisations augmentent régulièrement, ce droit ouvre une
            véritable possibilité d&apos;optimisation, sans risque de découvert
            de couverture si la transition est correctement enchaînée.
          </p>
          <SourceCallout id="loi-resiliation-2019" />
          <SourceCallout id="decret-resiliation-2020" />
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="conclusion" className="rounded-2xl bg-gray-50 p-8">
          <h2
            id="conclusion"
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            Ce qu&apos;il faut retenir
          </h2>
          <ul className="mt-6 space-y-4 text-base leading-relaxed text-gray-800">
            <li>
              <strong>Le marché senior est durablement en croissance</strong>{' '}
              (27,7 % de la population a 60 ans et plus selon l&apos;INSEE), ce
              qui justifie l&apos;intérêt d&apos;offres pensées pour cette
              tranche d&apos;âge plutôt qu&apos;un produit générique.
            </li>
            <li>
              <strong>Le coût de la complémentaire monte fortement avec
              l&apos;âge</strong> (cotisation moyenne d&apos;un contrat individuel
              multipliée par 4 entre 20 ans et 85 ans, selon la DREES), et le
              reste à charge médian des 70+ est environ trois fois supérieur à
              celui des moins de 40 ans.
            </li>
            <li>
              <strong>Les cotisations augmentent en moyenne de 5 à 7 % par
              an</strong> (Mutualité Française, 2025), sans signe
              d&apos;essoufflement à court terme.
            </li>
            <li>
              <strong>Le droit de résiliation infra-annuelle</strong> permet de
              comparer et changer de mutuelle quand on veut, sans frais, dès la
              première année écoulée — c&apos;est aujourd&apos;hui le principal
              levier d&apos;arbitrage des seniors.
            </li>
          </ul>
          <p className="mt-8 text-base leading-relaxed text-gray-800">
            Toutes ces données sont issues de publications publiques que vous
            pouvez consulter directement : leur liste exhaustive et les
            liens vers leurs versions d&apos;origine se trouvent sur notre{' '}
            <Link
              href="/sources"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              page Sources
            </Link>
            .
          </p>
        </section>

        <section
          aria-labelledby="related"
          className="mt-12 rounded-2xl border border-gray-200 bg-white p-8"
        >
          <h2 id="related" className="text-2xl font-bold text-gray-900">
            Approfondir
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link
              href="/verites-augmentation-mutuelles-senior"
              className="block rounded-xl border-2 border-[var(--color-accent)]/40 bg-orange-50/30 p-6 transition-colors hover:border-[var(--color-accent)] hover:bg-orange-50 sm:col-span-2"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                Décryptage — à lire en priorité
              </p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Les vérités cachées de la flambée des cotisations
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                4 vérités publiques (Sénat, ACPR, DREES, DGCCRF) que la presse
                grand public n&apos;explique presque jamais&nbsp;: transfert
                Sécu→mutuelle, démutualisation post-ANI, dérive chambre
                particulière, marges intactes des assureurs.
              </p>
            </Link>
            <Link
              href="/cout-mutuelle-senior"
              className="block rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-[var(--color-brand)] hover:bg-blue-50"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                Tarifs 2026
              </p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Combien coûte une mutuelle senior&nbsp;?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Prix moyen par tranche d&apos;âge, postes qui font monter la
                facture, et leviers concrets pour la limiter.
              </p>
            </Link>
            <Link
              href="/resilier-mutuelle-senior"
              className="block rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-[var(--color-brand)] hover:bg-blue-50"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                Guide pratique
              </p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Résilier sa mutuelle senior
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Procédure exacte issue de la loi du 14 juillet 2019, délais,
                pièges à éviter — texte de loi en main.
              </p>
            </Link>
            <Link
              href="/lexique-mutuelle"
              className="block rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-[var(--color-brand)] hover:bg-blue-50 sm:col-span-2"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                Glossaire
              </p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Lexique mutuelle santé
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                BR, BRSS, ticket modérateur, OPTAM, ALD, panier 100&nbsp;%
                santé… 18 termes expliqués simplement.
              </p>
            </Link>
          </div>
        </section>

        <aside className="mt-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">
            Comparer librement, sans engagement
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/95">
            Vous avez maintenant les chiffres en main. Notre service met
            gratuitement votre demande en relation avec un Courtier Partenaire
            qui pourra vous proposer une mutuelle adaptée à votre profil senior,
            sans aucune obligation de souscrire.
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
