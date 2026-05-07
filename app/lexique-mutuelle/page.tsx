import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

const TITLE = 'Lexique mutuelle santé : tous les termes expliqués simplement';
const DESCRIPTION =
  'BR, BRSS, ticket modérateur, 100 % santé, OPTAM, ALD, dépassements d’honoraires, panier de soins… Le glossaire complet des termes de la mutuelle santé, en français clair.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/lexique-mutuelle' },
  robots: { index: true, follow: true },
};

type Term = {
  id: string;
  terme: string;
  alternative?: string; // forme étendue ou abréviation
  definition: string;
  exemple?: string;
};

const TERMS: Term[] = [
  {
    id: 'base-de-remboursement',
    terme: 'Base de remboursement',
    alternative: 'BR / BRSS — Base de remboursement de la Sécurité sociale',
    definition:
      "Tarif de référence retenu par la Sécurité sociale pour calculer ses remboursements. C'est la base à laquelle s'appliquent les pourcentages annoncés (par exemple « 100 % BR »). La BR est souvent inférieure au prix réel facturé : le reste à charge ne disparaît donc pas avec une garantie « 100 % ».",
    exemple:
      'Une consultation chez un spécialiste secteur 1 : BR = 30 €. Si la mutuelle propose « 200 % BR », elle remboursera (200 % × 30) − 23,10 € (part Sécu) = 36,90 €.',
  },
  {
    id: 'ticket-moderateur',
    terme: 'Ticket modérateur',
    alternative: 'TM',
    definition:
      "Différence entre la base de remboursement (BR) et la part remboursée par la Sécurité sociale. C'est ce qui resterait à la charge de l'assuré sans complémentaire santé. Pour la majorité des soins courants, il représente 30 % de la BR.",
  },
  {
    id: 'depassement-honoraires',
    terme: "Dépassement d'honoraires",
    definition:
      "Montant facturé par un professionnel de santé au-delà de la base de remboursement. Pratique principalement par les médecins de secteur 2. La Sécurité sociale ne rembourse jamais les dépassements ; seule la complémentaire peut les couvrir, en partie ou totalement, selon le niveau de garantie souscrit.",
  },
  {
    id: 'optam',
    terme: 'OPTAM',
    alternative: "Option de Pratique Tarifaire Maîtrisée",
    definition:
      "Engagement signé par certains médecins de secteur 2 à modérer leurs dépassements d'honoraires. Les complémentaires sont obligées de mieux rembourser les soins effectués chez un médecin OPTAM que chez un secteur 2 non OPTAM. Vérifier l'adhésion OPTAM d'un praticien permet de limiter son reste à charge.",
  },
  {
    id: 'panier-100-sante',
    terme: '100 % santé',
    alternative: 'Panier 100 % santé / Reste à charge zéro',
    definition:
      "Réforme entrée pleinement en vigueur en 2021. Pour l'optique, le dentaire et l'aide auditive, certaines offres « panier 100 % santé » sont entièrement remboursées par la combinaison Sécurité sociale + complémentaire responsable, sans aucun reste à charge pour l'assuré. Toutes les complémentaires « contrats responsables » doivent obligatoirement couvrir ces paniers.",
    exemple:
      "En 2026, des montures et verres de l'offre 100 % santé sont entièrement pris en charge ; au-delà de cette offre, le reste à charge dépend de votre niveau de garantie.",
  },
  {
    id: 'contrat-responsable',
    terme: 'Contrat responsable',
    definition:
      "Une complémentaire santé est dite « responsable » si elle respecte un cahier des charges réglementaire (couverture obligatoire du 100 % santé, plafonnement de certains remboursements, exclusions strictes, parcours de soins). Plus de 95 % des contrats vendus en France sont responsables. Ils bénéficient d'une fiscalité plus avantageuse pour l'employeur et l'assuré.",
  },
  {
    id: 'ald',
    terme: 'ALD',
    alternative: 'Affection de longue durée',
    definition:
      "Statut accordé par l'Assurance Maladie pour des pathologies graves nécessitant un traitement prolongé (cancer, diabète, maladies cardiovasculaires, etc.). Les soins liés à l'ALD sont pris en charge à 100 % par la Sécurité sociale, sur la base de remboursement. Mais les dépassements et les soins hors ALD restent à la charge de la mutuelle ou de l'assuré.",
  },
  {
    id: 'forfait-hospitalier',
    terme: 'Forfait hospitalier',
    definition:
      "Somme due par l'assuré pour chaque journée d'hospitalisation, qui correspond à la participation aux frais d'hébergement et de restauration. Au 1ᵉʳ janvier 2026 : 20 € par jour en hôpital ou clinique, 15 € en service psychiatrique. La complémentaire santé responsable est tenue de le rembourser intégralement, sans limite de durée.",
  },
  {
    id: 'parcours-de-soins',
    terme: 'Parcours de soins coordonné',
    definition:
      "Système qui demande de consulter d'abord son médecin traitant avant un spécialiste pour bénéficier d'un remboursement optimal. Hors parcours, la Sécurité sociale rembourse moins (40 % au lieu de 70 %), et la mutuelle responsable plafonne sa prise en charge.",
  },
  {
    id: 'delai-carence',
    terme: 'Délai de carence',
    alternative: 'Délai d’attente',
    definition:
      "Période, à partir de la souscription, pendant laquelle l'assuré paie ses cotisations mais ne peut pas bénéficier de tout ou partie des remboursements (souvent : optique, dentaire, hospitalisation hors urgence). Variable de 0 à 12 mois selon les contrats. À comparer absolument lors d'un changement de mutuelle.",
  },
  {
    id: 'questionnaire-medical',
    terme: 'Questionnaire médical',
    definition:
      "Formulaire qu'un assureur peut demander avant de proposer un contrat ou de fixer une cotisation. Pour les contrats individuels, il est devenu rare grâce à la concurrence : la majorité des mutuelles s'en passent désormais. Une réponse mensongère expose à la résiliation pour « fausse déclaration intentionnelle » (art. L113-8 du Code des assurances).",
  },
  {
    id: 'resiliation-infra-annuelle',
    terme: 'Résiliation infra-annuelle',
    alternative: 'Loi du 14 juillet 2019',
    definition:
      "Droit, depuis le 1ᵉʳ décembre 2020, de résilier sa complémentaire santé à tout moment après un an de souscription, sans frais et sans motif. Codifié à l'article L113-15-2 du Code des assurances.",
  },
  {
    id: 'loi-evin',
    terme: 'Loi Évin',
    definition:
      "Loi du 31 décembre 1989 qui permet à un salarié quittant son entreprise (notamment au départ à la retraite) de conserver les garanties de la mutuelle d'entreprise, à un tarif majoré et plafonné les trois premières années (50 % la 1ʳᵉ année, +25 % la 2ᵉ, +50 % la 3ᵉ). Au-delà, le tarif est libre, et l'offre individuelle est presque toujours plus avantageuse pour un retraité.",
  },
  {
    id: 'tiers-payant',
    terme: 'Tiers payant',
    definition:
      "Dispositif qui dispense l'assuré d'avancer les frais : le professionnel de santé est payé directement par la Sécurité sociale (et la complémentaire le cas échéant). Généralisé en pharmacie, partiel chez les médecins. Une bonne mutuelle senior offre le tiers payant complet (Sécu + complémentaire) en optique, dentaire et chez la plupart des spécialistes.",
  },
  {
    id: 'reste-a-charge',
    terme: 'Reste à charge',
    alternative: 'RAC',
    definition:
      "Somme que l'assuré paie de sa poche après remboursement de la Sécurité sociale et de la complémentaire. Il dépend du tarif réellement facturé, du niveau de garantie de la mutuelle et des dépassements éventuels. C'est l'indicateur le plus pertinent pour comparer deux offres au-delà du prix de la cotisation.",
  },
  {
    id: 'plafond-annuel',
    terme: 'Plafond annuel',
    definition:
      "Montant maximum remboursé par la mutuelle sur une catégorie de soins (par exemple : 600 € de dentaire par an). Au-delà, le surplus reste à la charge de l'assuré. À surveiller pour les postes coûteux : prothèses dentaires, implants, lunettes haut de gamme, audioprothèses.",
  },
  {
    id: 'cmu-css',
    terme: 'Complémentaire santé solidaire',
    alternative: 'CSS — anciennement CMU-C / ACS',
    definition:
      "Dispositif gratuit ou à tarif réduit, sous conditions de ressources, qui permet à l'assuré et à sa famille de bénéficier d'une complémentaire santé sans avance de frais. Réservée aux ménages aux revenus modestes. La demande se fait auprès de l'Assurance Maladie (Ameli).",
  },
  {
    id: 'orias',
    terme: 'ORIAS',
    alternative: "Organisme pour le Registre des Intermédiaires en Assurance",
    definition:
      "Registre officiel français qui recense tous les courtiers et intermédiaires en assurance habilités à exercer. Vérifier l'immatriculation ORIAS d'un courtier avant de souscrire est une protection essentielle. La consultation est libre et gratuite sur orias.fr.",
  },
];

const definedTermSetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'Lexique mutuelle santé',
  description:
    'Glossaire des termes utiles pour comprendre une complémentaire santé en France.',
  inLanguage: 'fr-FR',
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    '@id': `${siteConfig.baseUrl}/lexique-mutuelle#${t.id}`,
    name: t.terme,
    alternateName: t.alternative,
    description: t.definition,
  })),
};

export default function LexiquePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetJsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <header>
          <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500">
            <Link href="/" className="hover:text-[var(--color-brand)]">
              Accueil
            </Link>{' '}
            ›{' '}
            <span className="text-gray-700">Lexique mutuelle</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
            Glossaire
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Lexique mutuelle santé : tous les termes expliqués simplement
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-700">
            BR, BRSS, ticket modérateur, 100 % santé, OPTAM, ALD,
            dépassements d&apos;honoraires, panier de soins… Comprendre ces
            termes est la condition pour comparer deux mutuelles au-delà du
            prix de la cotisation. Voici les {TERMS.length} notions à connaître,
            classées par ordre alphabétique de leur abréviation, avec un exemple
            chiffré quand c&apos;est utile.
          </p>
        </header>

        {/* Index des termes */}
        <nav
          aria-label="Liste des termes"
          className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >
          <h2 className="text-base font-semibold text-gray-900">Aller directement à</h2>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-base text-gray-700 sm:grid-cols-2">
            {TERMS.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="hover:text-[var(--color-brand)]">
                  {t.terme}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 space-y-10">
          {TERMS.map((t) => (
            <section
              key={t.id}
              id={t.id}
              className="scroll-mt-20"
              aria-labelledby={`term-${t.id}`}
            >
              <h2
                id={`term-${t.id}`}
                className="text-2xl font-bold text-gray-900 sm:text-3xl"
              >
                {t.terme}
              </h2>
              {t.alternative && (
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {t.alternative}
                </p>
              )}
              <p className="mt-4 text-base leading-relaxed text-gray-800">
                {t.definition}
              </p>
              {t.exemple && (
                <p className="mt-3 rounded-lg border-l-4 border-[var(--color-accent)] bg-orange-50 p-4 text-base leading-relaxed text-gray-800">
                  <strong>Exemple :</strong> {t.exemple}
                </p>
              )}
            </section>
          ))}
        </div>

        <aside className="mt-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">
            Maintenant que vous parlez le langage de la mutuelle…
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/95">
            Comparez librement les offres adaptées à votre profil senior.
            Sans engagement, sans frais, en deux minutes.
          </p>
          <Link
            href="/tunnel"
            className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Démarrer mon comparatif gratuit →
          </Link>
        </aside>

        <aside className="mt-12 rounded-2xl bg-gray-50 p-8 text-base leading-relaxed text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Pour aller plus loin</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              <Link
                href="/observatoire-mutuelle-senior"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Observatoire de la mutuelle senior
              </Link>{' '}
              — synthèse des publications publiques sur le marché.
            </li>
            <li>
              <Link
                href="/cout-mutuelle-senior"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Combien coûte une mutuelle senior
              </Link>{' '}
              — décryptage des tarifs en 2026.
            </li>
            <li>
              <Link
                href="/sources"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Sources & ressources institutionnelles
              </Link>{' '}
              — DREES, INSEE, CNIL, ACPR, Ameli, Service-Public.
            </li>
          </ul>
        </aside>
      </article>
    </>
  );
}
