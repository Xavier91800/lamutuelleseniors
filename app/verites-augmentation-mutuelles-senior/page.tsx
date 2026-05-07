import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SOURCES } from '@/config/sources';

const PUBLISHED_AT = '2026-05-07';
const TITLE =
  'Mutuelle senior : les vérités cachées de la flambée des cotisations';
const DESCRIPTION =
  "Pourquoi votre mutuelle senior augmente vraiment en 2026 ? Quatre vérités publiques mais peu vulgarisées : transfert Sécu→mutuelle, démutualisation post-ANI, dérive de la chambre particulière, et marges des assureurs qui ne s'effondrent pas. Sources Sénat, ACPR, DREES, DGCCRF.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/verites-augmentation-mutuelles-senior' },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.baseUrl}/verites-augmentation-mutuelles-senior`,
    publishedTime: PUBLISHED_AT,
  },
};

const CITED_SOURCE_IDS = [
  'senat-rapport-770',
  'acpr-as-178',
  'dgccrf-facturation-sante',
  'drees-organismes-2025',
  'drees-panorama-cs-2024',
  'mutualite-cotisations-2025',
  'loi-resiliation-2019',
] as const;

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
    '@id': `${siteConfig.baseUrl}/verites-augmentation-mutuelles-senior`,
  },
  citation: SOURCES.filter((s) =>
    (CITED_SOURCE_IDS as readonly string[]).includes(s.id)
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
      {s.organisme.split(' — ')[0]} — {s.publication.split(' —')[0]} ({s.annee})
    </a>
  );
}

export default function VeritesPage() {
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
            <span className="text-gray-700">Vérités cachées</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
            Dossier — Décryptage
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Mutuelle senior : les vérités cachées de la flambée des cotisations
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            <strong>+50&nbsp;% en six ans</strong>, jusqu&apos;à <strong>+30&nbsp;%
            sur la seule année 2024</strong> pour certains contrats seniors. Les
            mutuelles disent que c&apos;est inévitable. Le Sénat, l&apos;ACPR et
            la DGCCRF racontent une histoire un peu plus complète.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Ces vérités ne sont pas <em>cachées</em> au sens propre — elles sont
            publiées par le Sénat, l&apos;ACPR (Banque de France), la DREES et
            la DGCCRF. Elles sont juste rarement vulgarisées dans la presse
            grand public. Voici les quatre que tout senior payant une mutuelle
            individuelle gagne à connaître avant la prochaine échéance.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Publié le 7 mai 2026. Sources&nbsp;: Sénat (Rapport n° 770), ACPR
            (Analyses & Synthèses n° 178), DREES, DGCCRF, Mutualité Française.
          </p>
        </header>

        <hr className="my-12 border-gray-200" />

        {/* Vérité 1 : Sécu → mutuelle */}
        <section aria-labelledby="verite-1">
          <h2 id="verite-1" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vérité n°&nbsp;1 — Le grand transfert Sécurité sociale → mutuelle
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La réforme <strong>100&nbsp;% santé</strong>, déployée entre 2019 et
            2021 pour l&apos;optique, le dentaire et l&apos;audioprothèse, a
            été présentée comme « rendant gratuites » certaines offres de
            soins. C&apos;est techniquement vrai pour le patient. Mais ce qui
            l&apos;est moins, c&apos;est <strong>qui paye</strong> à la place.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Sur le panier 100&nbsp;% santé, la Sécurité sociale n&apos;a pas
            étendu sa prise en charge. Elle a au contraire imposé aux contrats
            responsables (95&nbsp;% du marché des complémentaires) de couvrir
            ces postes <strong>intégralement</strong>, à la place de
            l&apos;assuré. Le coût, lui, n&apos;a pas disparu&nbsp;: il a été
            <strong> transféré sur le bilan des mutuelles</strong>, qui le
            répercutent dans les cotisations.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Au-delà du 100&nbsp;% santé, la mécanique est continue&nbsp;: le
            forfait hospitalier (20&nbsp;€/jour en 2026, sans limite de durée),
            les nouveaux tickets modérateurs introduits par les lois de
            financement de la sécurité sociale successives, et plus largement
            une <strong>part des dépenses de santé prises en charge par les
            complémentaires</strong> qui n&apos;a cessé de progresser dans la
            structure de financement décrite par la DREES dans ses Comptes de
            la santé.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour un senior, traduction concrète&nbsp;: chaque réforme « gratuite »
            pour les patients depuis 2019 est <strong>incorporée dans la
            cotisation mensuelle</strong> qu&apos;il paie l&apos;année suivante.
            Le mécanisme est légitime, transparent — mais il est largement absent
            du discours public sur la « hausse des mutuelles ».
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Source&nbsp;: <SourceLink id="drees-organismes-2025" />.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        {/* Vérité 2 : démutualisation post-ANI */}
        <section aria-labelledby="verite-2">
          <h2 id="verite-2" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vérité n°&nbsp;2 — La démutualisation post-ANI&nbsp;: vous,
            retraités, payez désormais pour un risque que les actifs n&apos;assument plus
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            C&apos;est probablement la vérité la plus structurante — et la
            moins racontée. Depuis le <strong>1ᵉʳ janvier 2016</strong>, en
            application de l&apos;Accord National Interprofessionnel (ANI) de
            2013, <strong>toute entreprise du privé est tenue de proposer une
            mutuelle collective obligatoire à ses salariés</strong>. Résultat
            mécanique en dix ans&nbsp;: les actifs en CDI ont massivement migré
            du marché individuel (qui les couvrait avant) vers les contrats
            collectifs d&apos;entreprise.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Le rapport sénatorial n°&nbsp;770 (septembre 2024) appelle ce
            phénomène la <em>démutualisation</em>. Le pool individuel s&apos;est
            réduit en taille et en diversité&nbsp;: il <strong>ne reste plus
            que les retraités, les indépendants et les inactifs</strong>. Or
            ces profils consomment, en moyenne, beaucoup plus de soins que les
            actifs jeunes qu&apos;ils ont remplacés. Le rapport documente une
            dépense remboursable annuelle moyenne de <strong>1&nbsp;757&nbsp;€
            entre 17 et 59 ans</strong>, contre <strong>4&nbsp;005&nbsp;€ entre
            60 et 74 ans</strong>, et <strong>8&nbsp;102&nbsp;€ après 85
            ans</strong>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Conséquence directe&nbsp;: le pool individuel ne bénéficie plus de
            l&apos;effet de mutualisation classique (les jeunes en bonne santé
            qui « subventionnent » les anciens). Chaque cotisation individuelle
            doit désormais couvrir un risque <strong>concentré</strong>. Ce
            n&apos;est pas une stratégie commerciale des assureurs&nbsp;: c&apos;est
            la conséquence arithmétique d&apos;une réforme qui a sorti les
            actifs jeunes du marché individuel.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Le rapport sénatorial cite d&apos;ailleurs un ratio sinistralité /
            primes (S/P) qui démontre l&apos;inversion historique&nbsp;: le
            <strong> S/P du collectif atteint 87&nbsp;%</strong>, contre
            <strong> 74&nbsp;% pour l&apos;individuel</strong>. Autrement dit,
            les contrats collectifs d&apos;entreprise sont aujourd&apos;hui
            techniquement <em>plus déficitaires</em> que les individuels — mais
            les assureurs y compensent par la fiscalité avantageuse et la masse.
            L&apos;essentiel des hausses libres se concentre donc, par défaut,
            sur les contrats individuels seniors.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Source&nbsp;: <SourceLink id="senat-rapport-770" />.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        {/* Vérité 3 : chambre particulière */}
        <section aria-labelledby="verite-3">
          <h2 id="verite-3" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vérité n°&nbsp;3 — La chambre particulière&nbsp;: un poste sans
            plafond légal qui flambe
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La chambre particulière est une garantie quasi systématique des
            mutuelles seniors. Et c&apos;est aussi <strong>l&apos;un des seuls
            postes où aucun plafond légal ne s&apos;impose</strong> aux
            établissements&nbsp;: contrairement aux dépassements
            d&apos;honoraires (encadrés par les contrats responsables et
            l&apos;OPTAM), le tarif d&apos;une chambre individuelle est libre.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Concrètement en 2026, la fourchette observée est large&nbsp;:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-gray-800">
            <li>
              <strong>60&nbsp;€/jour</strong> en hôpital public hors AP-HP
            </li>
            <li>
              <strong>70&nbsp;€/jour</strong> à l&apos;AP-HP depuis le 1ᵉʳ
              janvier 2024 (contre 50&nbsp;€ auparavant), pour des recettes
              additionnelles attendues de <strong>5&nbsp;M€</strong> sur
              l&apos;année — une mesure de redressement financier de
              l&apos;hôpital qui se répercute mécaniquement sur les
              complémentaires
            </li>
            <li>
              <strong>100 à 150&nbsp;€/jour</strong> en clinique privée
              standard, avec des paliers <strong>« premium » jusqu&apos;à
              189&nbsp;€/nuit</strong> dans certains établissements
            </li>
          </ul>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Sur trois ans, L&apos;Argus de l&apos;Assurance documentait une
            hausse de <strong>+44&nbsp;% des dépenses péri-hospitalières</strong>
            {' '}(chambre particulière incluse), soit deux fois plus vite que la
            dépense hospitalière globale. Pour un assuré senior, une
            hospitalisation de huit jours en chambre particulière dans un
            établissement privé peut peser <strong>1&nbsp;200&nbsp;€</strong>
            {' '}à elle seule sur le bilan annuel de la mutuelle.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Le scoop pratique&nbsp;: vérifier sa propre facture
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            En 2021, la <strong>DGCCRF</strong> a publié les résultats
            d&apos;une enquête de contrôle sur la facturation des
            établissements de santé. Conclusion&nbsp;: <strong>47&nbsp;% des
            facturations contrôlées étaient non-conformes</strong>. Parmi les
            irrégularités les plus fréquentes&nbsp;: la case « chambre
            particulière » <strong>cochée par défaut</strong> dès qu&apos;un
            patient se retrouve seul dans sa chambre, sans demande explicite ni
            information préalable, et l&apos;absence de devis remis avant
            facturation.
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Pour un senior&nbsp;: à votre prochaine hospitalisation,
            <strong> demandez la chambre double</strong> par défaut, et
            <strong> exigez un devis écrit</strong> si la chambre particulière
            vous est proposée. Ce simple réflexe a un double effet&nbsp;: il
            réduit votre reste à charge éventuel, et il limite la pression sur
            la cotisation de l&apos;ensemble du portefeuille senior dont vous
            faites partie.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Sources&nbsp;: <SourceLink id="dgccrf-facturation-sante" /> ;
            réforme tarifaire AP-HP 2024 (communiqué officiel).
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        {/* Vérité 4 : marges intactes */}
        <section aria-labelledby="verite-4">
          <h2 id="verite-4" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Vérité n°&nbsp;4 — Les marges des mutuelles ne s&apos;effondrent pas
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            C&apos;est probablement le point le plus inconfortable du
            dossier — et celui qui mérite d&apos;être vérifié à la source. Le
            discours public des fédérations professionnelles, repris en boucle
            chaque rentrée, est que les hausses tarifaires sont « subies » par
            des organismes en grande difficulté. Les régulateurs racontent
            quelque chose de plus nuancé.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            L&apos;<strong>ACPR</strong> (le régulateur des assureurs, adossé
            à la Banque de France) a publié en décembre 2025 sa note
            <em> Analyses & Synthèses</em> n°&nbsp;178 sur les comptes 2024 du
            secteur. Constat&nbsp;: le <strong>résultat technique en santé
            individuelle est passé à 1,23&nbsp;Md€ en 2024</strong>, après
            670&nbsp;M€ en 2023. Les primes ont augmenté plus vite (+7,1&nbsp;%)
            que les prestations versées (+4,6&nbsp;%). Le S/P moyen s&apos;est
            <strong> amélioré</strong> — il n&apos;a pas dérivé.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La <strong>DREES</strong> publie en parallèle son rapport annuel
            sur la situation financière des organismes complémentaires.
            L&apos;édition 2025 (sur données 2024) note un
            <strong> taux de redistribution de 79&nbsp;%</strong> — soit
            <strong> 2 points de moins qu&apos;en 2023</strong> (81&nbsp;%).
            Autrement dit, la part des cotisations effectivement reversée en
            prestations a diminué. Les <strong>fonds propres</strong> du secteur
            atteignent <strong>230&nbsp;% des exigences réglementaires</strong>
            {' '}— un niveau de solvabilité confortable.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Cela ne veut pas dire que les mutuelles sont en train de
            s&apos;enrichir indûment&nbsp;: le secteur reste dans des
            équilibres techniques tendus, plombé en collectif (cf. vérité
            n°&nbsp;2). Mais le narratif d&apos;une « détresse financière »
            justifiant les hausses libres sur le segment senior n&apos;est pas
            soutenu par les chiffres publiés par les régulateurs.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Pour un assuré senior, la conséquence pratique est simple&nbsp;: les
            écarts tarifaires entre offres similaires reflètent largement
            <strong> des choix commerciaux</strong> des organismes (calibrage
            par tranche d&apos;âge, niveau de marges, frais de gestion), pas
            uniquement une « contrainte sectorielle ». D&apos;où l&apos;intérêt
            de comparer, sans engagement, plutôt que d&apos;accepter par défaut
            la prochaine hausse de son contrat actuel.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Sources&nbsp;: <SourceLink id="acpr-as-178" /> ;{' '}
            <SourceLink id="drees-organismes-2025" />.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        {/* Que faire concrètement */}
        <section aria-labelledby="que-faire" className="rounded-2xl bg-gray-50 p-8">
          <h2 id="que-faire" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Que faire concrètement
          </h2>
          <ul className="mt-6 space-y-3 text-base leading-relaxed text-gray-800">
            <li>
              <strong>Comparer son contrat tous les 12 à 18 mois.</strong> Depuis
              décembre 2020, la résiliation est libre à tout moment après un
              an. Les écarts entre offres similaires peuvent atteindre
              20-40&nbsp;%, principalement sur le calibrage senior — voir notre{' '}
              <Link
                href="/resilier-mutuelle-senior"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                guide pratique de résiliation
              </Link>
              .
            </li>
            <li>
              <strong>À l&apos;hôpital, refuser la chambre particulière par
              défaut</strong> et exiger un devis écrit avant tout supplément.
              La DGCCRF a relevé 47&nbsp;% de facturations non-conformes sur ce
              poste.
            </li>
            <li>
              <strong>Calibrer ses garanties à sa vraie consommation</strong> :
              regarder son décompte Sécu sur 12 mois, identifier les 2-3 postes
              prioritaires, et chercher un contrat qui couvre bien ceux-là plutôt
              qu&apos;un « tout-en-un » qui inclut des garanties que vous
              n&apos;utiliserez jamais. Pour comprendre les abréviations
              (BR, BRSS, OPTAM, panier 100&nbsp;% santé), notre{' '}
              <Link
                href="/lexique-mutuelle"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                lexique mutuelle
              </Link>
              .
            </li>
            <li>
              <strong>Connaître le coût moyen réel</strong> par tranche
              d&apos;âge (cotisation et reste à charge) — détaillé dans notre
              article{' '}
              <Link
                href="/cout-mutuelle-senior"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                « Combien coûte une mutuelle senior en 2026 »
              </Link>
              .
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">
            Maintenant que vous savez vraiment pourquoi votre mutuelle augmente…
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/95">
            Comparez librement les offres seniors adaptées à votre profil et
            votre département. Sans engagement, sans frais. Le Courtier
            Partenaire prend en charge gratuitement la résiliation de votre
            ancienne mutuelle si vous décidez de changer.
          </p>
          <Link
            href="/tunnel"
            className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Démarrer mon comparatif gratuit →
          </Link>
        </aside>

        <aside className="mt-12 rounded-2xl bg-gray-50 p-8 text-base leading-relaxed text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">
            Pour aller plus loin — toutes nos sources
          </h2>
          <p className="mt-3">
            Cet article s&apos;appuie exclusivement sur des publications
            publiques (Sénat, ACPR, DREES, DGCCRF, Mutualité Française). Vous
            pouvez consulter chacune d&apos;elles en intégralité depuis notre{' '}
            <Link
              href="/sources"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              page Sources & ressources institutionnelles
            </Link>
            . Pour une vue d&apos;ensemble du marché, notre{' '}
            <Link
              href="/observatoire-mutuelle-senior"
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Observatoire de la mutuelle senior
            </Link>{' '}
            synthétise les principales publications.
          </p>
        </aside>
      </article>
    </>
  );
}
