import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SOURCES } from '@/config/sources';

const PUBLISHED_AT = '2026-05-07';
const TITLE = 'Résilier sa mutuelle senior : guide pratique post-loi du 14 juillet 2019';
const DESCRIPTION =
  "Comment résilier sa mutuelle santé après un an de souscription, sans frais ni motif : la procédure exacte, les délais, les pièges à éviter et le rôle du nouveau prestataire. Sources Légifrance et Service-Public.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/resilier-mutuelle-senior' },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.baseUrl}/resilier-mutuelle-senior`,
    publishedTime: PUBLISHED_AT,
  },
};

const HOW_TO_STEPS = [
  {
    name: 'Vérifier la durée de souscription',
    text: "Confirmez que votre contrat actuel a au moins un an d'ancienneté, calculé depuis la date d'effet (et non la date de signature).",
  },
  {
    name: 'Choisir le nouveau contrat avant de résilier',
    text: "Souscrivez d'abord la nouvelle mutuelle, en précisant la date d'effet souhaitée. Cela évite tout trou de couverture et permet au nouveau prestataire de prendre en charge la procédure de résiliation.",
  },
  {
    name: "Notifier l'ancien assureur",
    text: "Envoyez la demande de résiliation par courrier recommandé, e-mail signé électroniquement, formulaire en ligne du nouvel organisme, ou simple déclaration au siège. Aucun motif n'est exigé.",
  },
  {
    name: "Attendre la prise d'effet",
    text: "La résiliation prend effet un mois après la réception de votre demande par l'ancien assureur. Pendant ce mois, vous restez couvert par l'ancienne mutuelle.",
  },
  {
    name: 'Vérifier le remboursement du trop-perçu',
    text: "L'ancien assureur a 30 jours pour vous rembourser la fraction de cotisation déjà payée et non couverte par la garantie effective.",
  },
];

const articleJsonLd = [
  {
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
      '@id': `${siteConfig.baseUrl}/resilier-mutuelle-senior`,
    },
    citation: SOURCES.filter((s) =>
      ['loi-resiliation-2019', 'decret-resiliation-2020', 'service-public-mutuelle'].includes(s.id)
    ).map((s) => ({
      '@type': 'CreativeWork',
      name: s.publication,
      author: { '@type': 'Organization', name: s.organisme.split(' — ')[0] },
      url: s.url,
      datePublished: s.annee,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Résilier sa mutuelle santé après un an de souscription',
    description:
      "Procédure légale issue de la loi du 14 juillet 2019, applicable depuis le 1ᵉʳ décembre 2020.",
    inLanguage: 'fr-FR',
    step: HOW_TO_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  },
];

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
      {s.organisme.split(' — ')[0]} — {s.publication.split(' —')[0]}
    </a>
  );
}

export default function ResilierMutuellePage() {
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
            <span className="text-gray-700">Résilier sa mutuelle senior</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
            Guide pratique
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Résilier sa mutuelle senior : comment changer librement après un an
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            Depuis le 1ᵉʳ décembre 2020, tout assuré peut quitter sa
            complémentaire santé après douze mois de souscription, à tout
            moment, <strong>sans frais et sans motif</strong>. Voici la
            procédure exacte, les délais, les pièges à éviter, et le rôle du
            nouveau prestataire dans la transition — texte de loi en main.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Publié le 7 mai 2026. Sources : Légifrance, Service-Public.fr.
          </p>
        </header>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="cadre-legal">
          <h2 id="cadre-legal" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            1. Le cadre légal en deux phrases
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            La <strong>loi n° 2019-733 du 14 juillet 2019</strong>, dite « loi
            de résiliation infra-annuelle », a introduit dans le Code des
            assurances un nouvel article{' '}
            <strong>L113-15-2</strong> qui ouvre un droit de résiliation
            sans frais après un an. Le <strong>décret n° 2020-1438 du 24
            novembre 2020</strong> en précise les modalités, en vigueur depuis
            le <strong>1ᵉʳ décembre 2020</strong>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Ce droit s&apos;applique à <strong>tous les contrats de
            complémentaire santé</strong> : individuels (souscrits en propre)
            comme collectifs facultatifs (entreprise sans adhésion
            obligatoire). Les contrats collectifs obligatoires d&apos;entreprise
            ne sont en revanche pas concernés tant que vous êtes salarié.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Sources : <SourceLink id="loi-resiliation-2019" /> ; <SourceLink id="decret-resiliation-2020" />.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="procedure">
          <h2 id="procedure" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            2. La procédure pas à pas
          </h2>
          <ol className="mt-6 list-decimal space-y-6 pl-6 text-base leading-relaxed text-gray-800">
            {HOW_TO_STEPS.map((step) => (
              <li key={step.name} className="pl-2">
                <strong className="block text-lg text-gray-900">{step.name}</strong>
                <span className="mt-1 block">{step.text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-base leading-relaxed text-gray-800">
            <strong>Bon à savoir</strong> : depuis 2020, le nouveau prestataire
            peut entièrement gérer la procédure pour vous, sur présentation
            d&apos;un mandat signé. Vous n&apos;avez alors aucun courrier à
            envoyer — c&apos;est l&apos;option recommandée pour limiter les
            risques d&apos;erreur dans les délais ou de double prélèvement.
          </p>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="cas-particuliers">
          <h2 id="cas-particuliers" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            3. Cas particuliers utiles aux seniors
          </h2>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Mutuelle souscrite via la loi Évin (sortie d&apos;entreprise)
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Si vous avez conservé la mutuelle de votre ancien employeur via le
            dispositif <strong>loi Évin</strong> (loi du 31 décembre 1989), la
            résiliation infra-annuelle s&apos;applique également : après un an
            de souscription au tarif majoré, vous pouvez résilier librement et
            choisir un contrat individuel. Pour la majorité des retraités, ce
            changement est financièrement gagnant à partir de la 2ᵉ année car
            le tarif Évin est encadré seulement les trois premières années.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Couple : peut-on résilier individuellement ?
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Si vous êtes deux assurés sur le même contrat (vous comme
            souscripteur, votre conjoint comme bénéficiaire), la résiliation
            porte sur l&apos;intégralité du contrat. Pour basculer chacun sur
            un contrat individuel propre, il faut résilier puis souscrire deux
            contrats distincts. Cela peut être pertinent quand vos profils de
            santé divergent fortement (un conjoint sans soin coûteux, l&apos;autre
            avec besoins importants).
          </p>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Délai de carence du nouveau contrat
          </h3>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            Certains nouveaux contrats prévoient un <strong>délai de
            carence</strong> sur des postes coûteux (optique, prothèses,
            hospitalisation hors urgence). Pour éviter un trou de couverture,
            vérifiez systématiquement la présence (ou l&apos;absence) de ce
            délai avant de souscrire. La majorité des contrats senior modernes
            n&apos;en prévoient pas, mais ce n&apos;est pas une obligation
            légale.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Pour la définition exacte du délai de carence et des termes
            techniques mentionnés, voir notre{' '}
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

        <section aria-labelledby="pieges">
          <h2 id="pieges" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            4. Les pièges à éviter
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-relaxed text-gray-800">
            <li>
              <strong>Résilier avant d&apos;avoir souscrit</strong> : un trou de
              couverture, même de quelques jours, peut coûter cher en cas
              d&apos;hospitalisation imprévue. Toujours dans cet ordre :
              souscription nouvelle → résiliation ancienne.
            </li>
            <li>
              <strong>Confondre la date d&apos;effet et la date de
              signature</strong> : les douze mois courent depuis la date
              d&apos;effet (premier jour de couverture), pas depuis la
              signature. Vérifiez votre attestation initiale.
            </li>
            <li>
              <strong>Oublier d&apos;arrêter le prélèvement</strong> : la
              résiliation suspend les prélèvements automatiques côté assureur
              légalement, mais des erreurs surviennent. Surveillez votre
              compte les 60 jours suivants ; en cas de prélèvement abusif,
              recours auprès du{' '}
              <a
                href="https://www.mediation-assurance.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Médiateur de l&apos;Assurance
              </a>
              .
            </li>
            <li>
              <strong>Croire qu&apos;un dépassement de la fenêtre annuelle
              bloque la résiliation</strong> : c&apos;est faux depuis 2020.
              Plus aucun contrat ne peut imposer un préavis de deux mois ou
              une « date anniversaire ». Si votre assureur l&apos;invoque, citez
              l&apos;article L113-15-2 ; il fait foi.
            </li>
          </ul>
        </section>

        <hr className="my-12 border-gray-200" />

        <section aria-labelledby="conclusion" className="rounded-2xl bg-gray-50 p-8">
          <h2 id="conclusion" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Ce qu&apos;il faut retenir
          </h2>
          <ul className="mt-6 space-y-3 text-base leading-relaxed text-gray-800">
            <li>
              Après <strong>1 an de souscription</strong>, vous pouvez résilier
              à tout moment, sans frais, sans motif (art. L113-15-2 du Code
              des assurances).
            </li>
            <li>
              Le nouveau prestataire peut <strong>tout faire à votre place</strong>,
              sur mandat signé.
            </li>
            <li>
              La résiliation prend effet <strong>1 mois après réception</strong>
              {' '}par l&apos;ancien assureur. Pendant ce mois, vous restez
              couvert.
            </li>
            <li>
              <strong>Souscrivez avant de résilier</strong> pour éviter un
              trou de couverture, et vérifiez l&apos;absence de délai de
              carence sur le nouveau contrat.
            </li>
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">
            Comparez avant de résilier — c&apos;est gratuit, sans engagement
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/95">
            Notre service vous met en relation avec un Courtier Partenaire qui
            peut prendre en charge gratuitement la résiliation de votre ancienne
            mutuelle si vous décidez de souscrire chez lui. Sans pression —
            vous comparez, vous décidez librement.
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
