/**
 * Constantes marketing — exclusivement des faits vérifiables et sourcés.
 *
 * Convention : tout chiffre affiché sur le site DOIT être issu d'une source
 * publique et auditée (DREES, INSEE, Mutualité Française, Légifrance, ACPR).
 * Aucun chiffre concernant l'activité du site (nombre de leads, satisfaction,
 * économies réalisées) ne peut être affiché tant qu'il n'est pas mesuré et
 * auditable — sinon pratique commerciale trompeuse au sens de l'art. L121-1
 * du Code de la consommation.
 *
 * Pour ajouter une statistique : fournir l'organisme + l'année + l'URL primaire.
 */

export type MarketStat = {
  value: string;
  label: string;
  source: string;
  sourceUrl: string;
};

export const MARKET_STATS: MarketStat[] = [
  {
    value: '27,7 %',
    label: 'des Français ont 60 ans ou plus',
    source: 'INSEE, Pyramide des âges 2024',
    sourceUrl: 'https://www.insee.fr/fr/outil-interactif/5014911/pyramide.htm',
  },
  {
    value: '× 3',
    label: 'de reste à charge santé pour un senior de 70 ans et plus vs un moins de 40 ans',
    source: 'DREES, Panorama de la complémentaire santé 2024 (données 2019)',
    sourceUrl:
      'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees/240710_Panorama_ComplementaireSante2024',
  },
  {
    value: '+ 6 %',
    label: 'de hausse moyenne des cotisations de mutuelles en 2025',
    source: 'Mutualité Française, Enquête Cotisations 2025',
    sourceUrl:
      'https://www.mutualite.fr/communiques-de-presse/enquete-cotisations-2025-une-hausse-qui-suit-les-depenses-de-sante-assumees-par-les-mutuelles/',
  },
  {
    value: 'Depuis 2020',
    label:
      'vous pouvez résilier votre mutuelle santé à tout moment après un an, sans frais',
    source: 'Loi n° 2019-733 du 14 juillet 2019, art. L113-15-2 du Code des assurances',
    sourceUrl:
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042672708',
  },
];

export type FaqItem = { question: string; reponse: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Le comparatif est-il vraiment gratuit ?',
    reponse:
      "Oui, totalement. Vous ne payez rien pour comparer ou recevoir des propositions. Notre service est rémunéré par les courtiers partenaires lorsqu'ils vous contactent, sans aucun coût pour vous.",
  },
  {
    question: 'Mes données sont-elles protégées ?',
    reponse:
      "Vos informations sont stockées en France, conformément au RGPD. Nous ne les transmettons qu'aux courtiers partenaires que vous avez explicitement acceptés, et jamais à des fins publicitaires. Vous pouvez demander leur suppression à tout moment.",
  },
  {
    question: 'Suis-je obligé(e) de souscrire après le comparatif ?',
    reponse:
      "Non. Le comparatif est sans engagement. Vous recevez les propositions, vous prenez le temps d'y réfléchir, et vous décidez librement de souscrire ou non. Aucune pression, aucun frais caché.",
  },
  {
    question: 'Combien de temps prend le comparatif ?',
    reponse:
      "Environ 2 minutes pour répondre aux questions. Vous recevez ensuite les propositions de nos courtiers partenaires sous 24 h ouvrées par e-mail.",
  },
  {
    question: 'Puis-je changer de mutuelle si je suis déjà couvert(e) ?',
    reponse:
      "Oui. Depuis la loi de résiliation infra-annuelle (loi du 14 juillet 2019, en vigueur depuis le 1ᵉʳ décembre 2020), vous pouvez résilier votre mutuelle à tout moment après la première année de souscription, sans frais ni justification. Le courtier que vous aurez retenu pourra prendre en charge gratuitement la résiliation de votre ancienne mutuelle.",
  },
];
