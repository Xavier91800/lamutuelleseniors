/**
 * Sources publiques citées sur le site — référentiel unique.
 *
 * Toute statistique affichée doit être issue d'une publication enregistrée ici.
 * Pour ajouter ou réviser une source : indiquer l'organisme, l'année de
 * publication, l'URL primaire (pas un agrégateur), une description courte,
 * et la liste des pages où elle est mobilisée.
 */

export type Source = {
  id: string;
  organisme: string;
  publication: string;
  annee: string;
  url: string;
  type: 'rapport' | 'enquete' | 'donnees' | 'texte-juridique';
  description: string;
  utilisations: string[];
};

export const SOURCES: Source[] = [
  {
    id: 'drees-panorama-cs-2024',
    organisme: 'DREES — Direction de la recherche, des études, de l’évaluation et des statistiques (Ministère de la Santé)',
    publication:
      'Panorama « La complémentaire santé : acteurs, bénéficiaires, garanties » — Édition 2024',
    annee: '2024',
    url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees/240710_Panorama_ComplementaireSante2024',
    type: 'rapport',
    description:
      "Référence française annuelle sur le marché de la complémentaire santé : acteurs, taux de couverture, prix moyens des cotisations selon l'âge, restes à charge par classe d'âge, évolution des garanties. Publication officielle DREES, juillet 2024 (sur données 2019 à 2022).",
    utilisations: [
      'Bande de chiffres clés sur la home (×3 reste à charge senior 70+ vs <40 ans)',
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
  {
    id: 'drees-comptes-sante-2024',
    organisme: 'DREES — Direction de la recherche, des études, de l’évaluation et des statistiques (Ministère de la Santé)',
    publication: 'Les dépenses de santé en 2024 — Résultats des comptes de la santé',
    annee: '2025',
    url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/250930-Panorama-d%C3%A9penses-de-sant%C3%A9',
    type: 'rapport',
    description:
      'Comptes nationaux de la santé, publication annuelle de référence. Décrit la structure de financement (Sécurité sociale, complémentaires, ménages), le reste à charge moyen par habitant et l\'évolution des dépenses. Édition septembre 2025 (données 2024).',
    utilisations: [
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
  {
    id: 'mutualite-cotisations-2025',
    organisme: 'Mutualité Française — Fédération nationale de la mutualité française',
    publication: 'Enquête Cotisations 2025 — Une hausse qui suit les dépenses de santé assumées par les mutuelles',
    annee: '2025',
    url: 'https://www.mutualite.fr/communiques-de-presse/enquete-cotisations-2025-une-hausse-qui-suit-les-depenses-de-sante-assumees-par-les-mutuelles/',
    type: 'enquete',
    description:
      "Enquête menée par la Fédération de la mutualité française auprès de 41 mutuelles couvrant 18,9 millions de personnes. Mesure la hausse moyenne des cotisations, distinguant contrats individuels (plus exposés au vieillissement, donc majoritairement seniors) et collectifs.",
    utilisations: [
      'Bande de chiffres clés sur la home (+6 % de hausse moyenne en 2025)',
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
  {
    id: 'insee-pyramide-2024',
    organisme: 'INSEE — Institut national de la statistique et des études économiques',
    publication: 'Pyramide des âges 2024 — Données démographiques au 1ᵉʳ janvier 2024',
    annee: '2024',
    url: 'https://www.insee.fr/fr/outil-interactif/5014911/pyramide.htm',
    type: 'donnees',
    description:
      "Outil interactif INSEE qui décrit la structure d'âge de la population française. Référence pour quantifier le poids démographique des 60+ et 65+ et le vieillissement structurel.",
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
    description:
      "Publication annuelle de l'INSEE qui dresse l'état de la démographie française : naissances, décès, espérance de vie, structure d'âge. Édition janvier 2025 sur données 2024.",
    utilisations: ['Article « Observatoire de la mutuelle senior »'],
  },
  {
    id: 'loi-resiliation-2019',
    organisme: 'République française — Légifrance',
    publication: 'Loi n° 2019-733 du 14 juillet 2019 et art. L113-15-2 du Code des assurances',
    annee: '2019',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042672708',
    type: 'texte-juridique',
    description:
      "Loi relative au droit de résiliation sans frais des contrats de complémentaire santé. Codifiée à l'article L113-15-2 du Code des assurances. Permet, depuis le 1ᵉʳ décembre 2020, de résilier sa mutuelle à tout moment après un an de souscription, sans motif, sans frais.",
    utilisations: [
      'Bande de chiffres clés sur la home (« Depuis 2020 »)',
      'FAQ — question « Puis-je changer de mutuelle si je suis déjà couvert(e) ? »',
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
  {
    id: 'decret-resiliation-2020',
    organisme: 'République française — Légifrance',
    publication: "Décret n° 2020-1438 du 24 novembre 2020 relatif au droit de résiliation sans frais des contrats de complémentaire santé",
    annee: '2020',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042558814',
    type: 'texte-juridique',
    description:
      "Décret d'application de la loi du 14 juillet 2019. Précise les modalités de la résiliation infra-annuelle (notification, délais, prise en charge possible par le nouveau prestataire).",
    utilisations: [
      'Article « Observatoire de la mutuelle senior »',
    ],
  },
];
