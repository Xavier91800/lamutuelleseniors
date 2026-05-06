/**
 * SEO configuration — single source of truth for keyword targeting and the
 * indexable URL inventory. Updates here propagate to:
 *   - `app/sitemap.ts`     (URL list)
 *   - `app/robots.ts`      (allowlist / disallow rules)
 *   - landing page metadata
 */

export const KEYWORDS = {
  primary: [
    'mutuelle senior',
    'mutuelle santé',
    'comparatif mutuelle senior',
    'comparatif mutuelle santé',
    'meilleure mutuelle senior',
    'devis mutuelle senior',
    'mutuelle santé retraité',
  ],
  secondary: [
    'mutuelle senior pas chère',
    'tarif mutuelle senior',
    'mutuelle senior 60 ans',
    'mutuelle senior 65 ans',
    'mutuelle senior 70 ans',
    'mutuelle senior 75 ans',
    'mutuelle senior sans délai de carence',
    'mutuelle senior sans questionnaire médical',
    'complémentaire santé senior',
    'comparateur mutuelle senior',
    'changer de mutuelle senior',
    'mutuelle senior couple',
    'mutuelle senior dentaire',
    'mutuelle senior optique',
    'mutuelle senior hospitalisation',
    'mutuelle senior auditive',
  ],
  longTail: [
    'comment choisir sa mutuelle quand on est senior',
    'quelle mutuelle pour un retraité',
    'combien coûte une mutuelle senior',
    'meilleure mutuelle senior 2026',
    'avis mutuelle senior',
    'mutuelle santé après 60 ans',
    'résiliation mutuelle senior loi Hamon',
  ],
} as const;

export interface PrimaryLanding {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
}

export const PRIMARY_LANDINGS: PrimaryLanding[] = [
  {
    slug: 'mutuelle-senior',
    keyword: 'mutuelle senior',
    title: 'Mutuelle senior : trouver la meilleure complémentaire santé',
    description:
      'Mutuelle senior : comparez gratuitement les meilleures complémentaires santé adaptées aux 55 ans et plus. Devis personnalisé en 2 minutes.',
    h1: 'Mutuelle senior : la meilleure couverture santé pour les 55 ans et plus',
    intro:
      'Trouver une mutuelle senior adaptée, c’est protéger sa santé sans payer pour des garanties dont on n’a pas besoin. Notre service de mise en relation avec des courtiers en assurance partenaires vous permet de comparer gratuitement les offres du marché et d’obtenir un devis personnalisé en quelques minutes.',
  },
  {
    slug: 'mutuelle-sante',
    keyword: 'mutuelle santé',
    title: 'Mutuelle santé : comparez et trouvez la formule idéale',
    description:
      'Mutuelle santé : comparez gratuitement les meilleures complémentaires santé du marché et recevez les offres adaptées à votre profil et à votre budget.',
    h1: 'Mutuelle santé : compléter le remboursement de la Sécurité sociale, intelligemment',
    intro:
      'Une mutuelle santé bien choisie complète vos remboursements de Sécurité sociale là où vous en avez réellement besoin : optique, dentaire, hospitalisation, médecines douces. Notre comparateur vous met en relation avec des courtiers partenaires qui vous proposent les offres les plus pertinentes pour votre profil.',
  },
  {
    slug: 'comparatif-mutuelle-senior',
    keyword: 'comparatif mutuelle senior',
    title: 'Comparatif mutuelle senior : trouvez la meilleure offre 2026',
    description:
      'Comparatif mutuelle senior 2026 : comparez prix, garanties et services des meilleures mutuelles spécial seniors et choisissez en toute sérénité.',
    h1: 'Comparatif mutuelle senior : prix, garanties et services 2026',
    intro:
      'Comparer les mutuelles senior n’est pas évident : tarifs très variables, garanties inégales, délais de carence parfois longs. Notre service vous met en relation avec des courtiers en assurance qui sélectionnent pour vous les offres les plus compétitives, sans engagement et sans coût pour vous.',
  },
  {
    slug: 'comparatif-mutuelle-sante',
    keyword: 'comparatif mutuelle santé',
    title: 'Comparatif mutuelle santé : prix, garanties, remboursements',
    description:
      'Comparatif mutuelle santé : analysez en un coup d’œil tarifs, niveaux de garantie et remboursements des principales mutuelles. Devis gratuit.',
    h1: 'Comparatif mutuelle santé : choisir sa complémentaire en toute confiance',
    intro:
      'Comparer une mutuelle santé suppose d’analyser une dizaine de critères : taux de remboursement, plafonds dentaires et optique, forfaits médecine douce, délais de carence, services associés. Nos courtiers partenaires vous présentent un comparatif clair et adapté à vos besoins réels.',
  },
  {
    slug: 'meilleure-mutuelle-senior',
    keyword: 'meilleure mutuelle senior',
    title: 'Meilleure mutuelle senior 2026 : comment la choisir ?',
    description:
      'Quelle est la meilleure mutuelle senior en 2026 ? Critères de choix, pièges à éviter, devis personnalisé gratuit en 2 minutes auprès de nos partenaires.',
    h1: 'Meilleure mutuelle senior : les critères qui font vraiment la différence',
    intro:
      'La « meilleure » mutuelle senior n’existe pas dans l’absolu : elle dépend de votre âge, de votre santé, de votre budget et de vos besoins prioritaires. Découvrez les critères qui comptent vraiment et obtenez un devis personnalisé en deux minutes auprès de courtiers partenaires.',
  },
  {
    slug: 'devis-mutuelle-senior',
    keyword: 'devis mutuelle senior',
    title: 'Devis mutuelle senior gratuit en 2 minutes',
    description:
      'Recevez gratuitement plusieurs devis mutuelle senior personnalisés en 2 minutes. Comparez et choisissez sans engagement la meilleure offre.',
    h1: 'Devis mutuelle senior gratuit : recevez vos offres personnalisées',
    intro:
      'Demander un devis mutuelle senior n’a jamais été aussi simple. Répondez à quelques questions et nos courtiers en assurance partenaires vous transmettent les meilleures offres correspondant à votre profil — gratuitement, sans engagement et sans démarches superflues.',
  },
  {
    slug: 'mutuelle-sante-retraite',
    keyword: 'mutuelle santé retraité',
    title: 'Mutuelle santé retraité : la complémentaire adaptée à la retraite',
    description:
      'Mutuelle santé pour retraité : trouvez la complémentaire qui vous accompagne après la fin de votre vie active, à un tarif maîtrisé.',
    h1: 'Mutuelle santé retraité : préparer une retraite en bonne santé',
    intro:
      'Quitter sa mutuelle d’entreprise au moment du départ à la retraite est un choix structurant. Nos courtiers partenaires vous aident à trouver la mutuelle santé retraité qui maintient votre couverture sans exploser votre budget — y compris si vous changez de région ou de besoins.',
  },
];

export const LEGAL_PAGES = [
  { slug: 'conditions-generales', title: "Conditions générales d'utilisation" },
  { slug: 'politique-de-confidentialite', title: 'Politique de confidentialité' },
  { slug: 'mentions-legales', title: 'Mentions légales' },
] as const;
