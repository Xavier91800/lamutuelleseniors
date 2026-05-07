/**
 * Sources publiques citées par le site + ressources complémentaires utiles aux
 * visiteurs.
 *
 * Deux niveaux d'usage :
 *   - `cited: true`   → le site mobilise cette publication pour appuyer un chiffre
 *                       affiché. Les `utilisations` listent où exactement.
 *   - `cited: false`  → ressource recommandée au visiteur (E-E-A-T / YMYL),
 *                       sans donnée chiffrée embarquée sur le site. Permet
 *                       d'aller plus loin.
 *
 * Pour ajouter ou réviser : indiquer organisme, année, URL primaire stable,
 * description courte, catégorie, et le statut cité/non cité.
 */

export type SourceCategory =
  | 'institutionnels'
  | 'regulation-conso'
  | 'legislation'
  | 'federations'
  | 'statistiques';

export type SourceType = 'rapport' | 'enquete' | 'donnees' | 'texte-juridique' | 'portail';

export type Source = {
  id: string;
  organisme: string;
  publication: string;
  annee: string;
  url: string;
  type: SourceType;
  category: SourceCategory;
  description: string;
  cited: boolean;
  utilisations: string[];
};

export const SOURCES: Source[] = [
  // ---- Sources citées sur le site (chiffres affichés) ----
  {
    id: 'drees-panorama-cs-2024',
    organisme:
      'DREES — Direction de la recherche, des études, de l’évaluation et des statistiques (Ministère de la Santé)',
    publication:
      'Panorama « La complémentaire santé : acteurs, bénéficiaires, garanties » — Édition 2024',
    annee: '2024',
    url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees/240710_Panorama_ComplementaireSante2024',
    type: 'rapport',
    category: 'institutionnels',
    cited: true,
    description:
      "Référence française annuelle sur le marché de la complémentaire santé : acteurs, taux de couverture, prix moyens des cotisations selon l'âge, restes à charge par classe d'âge, évolution des garanties. Publication officielle DREES, juillet 2024.",
    utilisations: [
      'Bande de chiffres clés sur la home (×3 reste à charge senior 70+ vs <40 ans)',
      'Article « Observatoire de la mutuelle senior »',
      'Article « Combien coûte une mutuelle senior en 2026 ? »',
    ],
  },
  {
    id: 'drees-comptes-sante-2024',
    organisme:
      'DREES — Direction de la recherche, des études, de l’évaluation et des statistiques (Ministère de la Santé)',
    publication: 'Les dépenses de santé en 2024 — Résultats des comptes de la santé',
    annee: '2025',
    url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/250930-Panorama-d%C3%A9penses-de-sant%C3%A9',
    type: 'rapport',
    category: 'institutionnels',
    cited: true,
    description:
      'Comptes nationaux de la santé. Décrit la structure de financement (Sécurité sociale, complémentaires, ménages), le reste à charge moyen par habitant et l\'évolution des dépenses. Édition septembre 2025 (données 2024).',
    utilisations: ['Article « Observatoire de la mutuelle senior »'],
  },
  {
    id: 'mutualite-cotisations-2025',
    organisme: 'Mutualité Française — Fédération nationale de la mutualité française',
    publication:
      'Enquête Cotisations 2025 — Une hausse qui suit les dépenses de santé assumées par les mutuelles',
    annee: '2025',
    url: 'https://www.mutualite.fr/communiques-de-presse/enquete-cotisations-2025-une-hausse-qui-suit-les-depenses-de-sante-assumees-par-les-mutuelles/',
    type: 'enquete',
    category: 'federations',
    cited: true,
    description:
      "Enquête menée auprès de 41 mutuelles couvrant 18,9 millions de personnes. Mesure la hausse moyenne des cotisations, distinguant contrats individuels (souscrits surtout par les seniors) et collectifs.",
    utilisations: [
      'Bande de chiffres clés sur la home (+6 % de hausse moyenne en 2025)',
      'Article « Observatoire de la mutuelle senior »',
      'Article « Combien coûte une mutuelle senior en 2026 ? »',
    ],
  },
  {
    id: 'insee-pyramide-2024',
    organisme: 'INSEE — Institut national de la statistique et des études économiques',
    publication: 'Pyramide des âges 2024 — Données démographiques au 1ᵉʳ janvier 2024',
    annee: '2024',
    url: 'https://www.insee.fr/fr/outil-interactif/5014911/pyramide.htm',
    type: 'donnees',
    category: 'statistiques',
    cited: true,
    description:
      "Outil interactif INSEE sur la structure d'âge de la population française. Référence pour quantifier le poids démographique des 60+ et 65+ et le vieillissement structurel.",
    utilisations: [
      'Bande de chiffres clés sur la home (27,7 % des Français ont 60 ans et plus)',
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
  {
    id: 'insee-bilan-demo-2024',
    organisme: 'INSEE — Institut national de la statistique et des études économiques',
    publication: 'Bilan démographique 2024 — Insee Première n° 2033',
    annee: '2025',
    url: 'https://www.insee.fr/fr/statistiques/8327319',
    type: 'rapport',
    category: 'statistiques',
    cited: true,
    description:
      "Publication annuelle de l'INSEE qui dresse l'état de la démographie française : naissances, décès, espérance de vie, structure d'âge. Édition janvier 2025 sur données 2024.",
    utilisations: ['Article « Observatoire de la mutuelle senior »'],
  },
  {
    id: 'loi-resiliation-2019',
    organisme: 'République française — Légifrance',
    publication:
      'Loi n° 2019-733 du 14 juillet 2019 et art. L113-15-2 du Code des assurances',
    annee: '2019',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042672708',
    type: 'texte-juridique',
    category: 'legislation',
    cited: true,
    description:
      "Loi relative au droit de résiliation sans frais des contrats de complémentaire santé. Codifiée à l'article L113-15-2 du Code des assurances. Permet, depuis le 1ᵉʳ décembre 2020, de résilier sa mutuelle à tout moment après un an de souscription, sans motif, sans frais.",
    utilisations: [
      'Bande de chiffres clés sur la home (« Depuis 2020 »)',
      'FAQ — question « Puis-je changer de mutuelle si je suis déjà couvert(e) ? »',
      'Article « Observatoire de la mutuelle senior »',
      'Article « Résilier sa mutuelle senior »',
    ],
  },
  {
    id: 'decret-resiliation-2020',
    organisme: 'République française — Légifrance',
    publication:
      'Décret n° 2020-1438 du 24 novembre 2020 relatif au droit de résiliation sans frais des contrats de complémentaire santé',
    annee: '2020',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042558814',
    type: 'texte-juridique',
    category: 'legislation',
    cited: true,
    description:
      "Décret d'application de la loi du 14 juillet 2019. Précise les modalités de la résiliation infra-annuelle (notification, délais, prise en charge possible par le nouveau prestataire).",
    utilisations: [
      'Article « Observatoire de la mutuelle senior »',
      'Article « Résilier sa mutuelle senior »',
    ],
  },

  // ---- Ressources complémentaires (non citées chiffrement, utiles au visiteur) ----
  {
    id: 'ameli-complementaire',
    organisme: "Ameli — L'Assurance Maladie",
    publication:
      "Comprendre la complémentaire santé (Ameli, espace assuré)",
    annee: 'mise à jour continue',
    url: 'https://www.ameli.fr/assure/remboursements/complementaire-sante',
    type: 'portail',
    category: 'institutionnels',
    cited: false,
    description:
      "Page officielle de l'Assurance Maladie expliquant le rôle d'une complémentaire, les bases de remboursement (BR/BRSS), le ticket modérateur, et les bonnes pratiques pour bien la choisir. Référence systématiquement à jour.",
    utilisations: [],
  },
  {
    id: 'service-public-mutuelle',
    organisme: "République française — Service-Public.fr",
    publication: "Mutuelle santé / Complémentaire santé : vos droits, vos démarches",
    annee: 'mise à jour continue',
    url: 'https://www.service-public.fr/particuliers/vosdroits/N20239',
    type: 'portail',
    category: 'institutionnels',
    cited: false,
    description:
      "Portail officiel de l'administration française. Explique les démarches pratiques : adhésion, résiliation, médiation, recours, droits du conjoint et des enfants. Mis à jour à chaque évolution réglementaire.",
    utilisations: [],
  },
  {
    id: 'cnil-sante',
    organisme: "CNIL — Commission nationale de l'informatique et des libertés",
    publication: "La protection des données de santé",
    annee: 'mise à jour continue',
    url: 'https://www.cnil.fr/fr/sante',
    type: 'portail',
    category: 'regulation-conso',
    cited: false,
    description:
      "Recommandations CNIL applicables aux courtiers, mutuelles, plateformes santé. Explique vos droits RGPD, comment exercer un retrait de consentement, comment contester un traitement. Indispensable en cas de doute.",
    utilisations: [],
  },
  {
    id: 'acpr-controle',
    organisme:
      "ACPR — Autorité de Contrôle Prudentiel et de Résolution (Banque de France)",
    publication:
      "Le contrôle des organismes d'assurance et des intermédiaires (espace public)",
    annee: 'mise à jour continue',
    url: 'https://acpr.banque-france.fr',
    type: 'portail',
    category: 'regulation-conso',
    cited: false,
    description:
      "Régulateur français des assurances et mutuelles. Vérifie la solvabilité des organismes, contrôle les courtiers (immatriculation ORIAS), publie des alertes en cas de pratiques abusives. À consulter pour vérifier la fiabilité d'un assureur.",
    utilisations: [],
  },
  {
    id: 'mediateur-assurance',
    organisme: "Médiateur de l'Assurance",
    publication: "Saisir le Médiateur de l'Assurance — recours amiable",
    annee: 'mise à jour continue',
    url: 'https://www.mediation-assurance.org',
    type: 'portail',
    category: 'regulation-conso',
    cited: false,
    description:
      "Recours amiable et gratuit en cas de litige avec une mutuelle ou un assureur (refus de prise en charge, contestation tarifaire, mauvaise application d'un contrat). Saisine en ligne, réponse sous 90 jours en moyenne.",
    utilisations: [],
  },
  {
    id: 'ufc-que-choisir',
    organisme: "UFC-Que Choisir",
    publication: "Dossiers et comparatifs Mutuelle santé / Complémentaire santé",
    annee: 'mise à jour continue',
    url: 'https://www.quechoisir.org',
    type: 'portail',
    category: 'regulation-conso',
    cited: false,
    description:
      "Association de défense des consommateurs. Publie régulièrement des comparatifs indépendants de mutuelles, des alertes sur les hausses tarifaires, et des guides pratiques (résiliation, choix des garanties). Particulièrement vigilante sur les contrats seniors.",
    utilisations: [],
  },
  {
    id: '60m-consommateurs',
    organisme: "60 Millions de Consommateurs (INC)",
    publication: "Dossiers Santé & Mutuelles",
    annee: 'mise à jour continue',
    url: 'https://www.60millions-mag.com',
    type: 'portail',
    category: 'regulation-conso',
    cited: false,
    description:
      "Magazine de l'Institut National de la Consommation. Études comparatives indépendantes (financées par fonds publics), spécifiquement sur les mutuelles seniors, le 100 % santé et la lisibilité des contrats.",
    utilisations: [],
  },
  {
    id: 'cour-comptes-complementaires',
    organisme: "Cour des comptes — République française",
    publication: "Rapports publics sur les complémentaires santé et l'assurance maladie",
    annee: 'mise à jour continue',
    url: 'https://www.ccomptes.fr',
    type: 'rapport',
    category: 'institutionnels',
    cited: false,
    description:
      "Institution juridictionnelle qui audite les politiques publiques. Plusieurs rapports passent au crible le marché des complémentaires santé : structure tarifaire, transparence, transferts Sécu/AMC, frais de gestion. Source experte mais dense.",
    utilisations: [],
  },
  {
    id: 'legifrance-code-mutualite',
    organisme: 'République française — Légifrance',
    publication: 'Code de la mutualité — texte intégral',
    annee: 'mise à jour continue',
    url: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074067',
    type: 'texte-juridique',
    category: 'legislation',
    cited: false,
    description:
      "Texte de référence régissant les mutuelles (organisations à but non lucratif). Définit les règles de gouvernance, de cotisation, d'accès et de sortie. Complémentaire au Code des assurances qui régit les sociétés d'assurance.",
    utilisations: [],
  },
  {
    id: 'ffa-france-assureurs',
    organisme: 'France Assureurs (anciennement FFA — Fédération Française de l’Assurance)',
    publication: "Données et études sur le marché de l'assurance santé",
    annee: 'mise à jour continue',
    url: 'https://www.franceassureurs.fr',
    type: 'portail',
    category: 'federations',
    cited: false,
    description:
      "Fédération qui réunit la majorité des sociétés d'assurance opérant en France. Publie des chiffres sectoriels, des baromètres et des notes économiques utiles pour comprendre les évolutions du marché côté assureurs (vs. mutuelles).",
    utilisations: [],
  },
];

export const CATEGORY_LABELS: Record<SourceCategory, { title: string; intro: string }> = {
  institutionnels: {
    title: 'Institutionnels santé',
    intro:
      "Organismes publics et services administratifs qui produisent les données de référence sur la complémentaire santé en France.",
  },
  'regulation-conso': {
    title: 'Régulation & associations de consommateurs',
    intro:
      "Autorités de contrôle et associations indépendantes qui veillent aux pratiques des mutuelles et défendent les droits des assurés.",
  },
  legislation: {
    title: 'Législation française',
    intro:
      "Textes juridiques opposables : lois, décrets, codes. À consulter quand un assureur ou un courtier vous oppose une règle que vous voulez vérifier.",
  },
  federations: {
    title: 'Fédérations professionnelles',
    intro:
      "Représentants du secteur (mutuelles d'un côté, sociétés d'assurance de l'autre). Publient leurs propres baromètres et études.",
  },
  statistiques: {
    title: 'Statistiques nationales',
    intro:
      "Démographie, économie, structures de population — données socle qui éclairent l'évolution du marché senior.",
  },
};

export const CATEGORY_ORDER: SourceCategory[] = [
  'institutionnels',
  'regulation-conso',
  'legislation',
  'federations',
  'statistiques',
];
