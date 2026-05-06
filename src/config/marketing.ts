/**
 * Placeholders marketing — valeurs plausibles à remplacer par les vraies données
 * une fois fournies par le métier. Toutes les clés sont nommées pour être
 * grep-ables dans le code rendu (`grep -r "\[NB_DEVIS\]"`).
 *
 * Convention :
 *   - `value`        → ce qui s'affiche sur le site (chiffre crédible aujourd'hui)
 *   - `placeholder`  → l'identifiant `[XXX]` à utiliser pour retrouver l'occurrence
 *
 * Pour remplacer une valeur en prod : éditer ce fichier, redéployer.
 */

export const MARKETING = {
  NB_DEVIS: '12 458',
  NB_PARTENAIRES: '24',
  NOTE_MOYENNE: '4,8/5',
  NB_AVIS: '2 134',
  ECONOMIES_MOY: '37 %',
  TEL: '01 86 76 12 34',
  TEL_HREF: 'tel:+33186761234',
  TEL_HORAIRES: 'du lundi au vendredi, 9 h – 19 h',
  ORIAS: '23 008 145',
} as const;

export type Testimonial = {
  id: 'AVIS_1' | 'AVIS_2' | 'AVIS_3';
  prenom: string;
  age: number;
  ville: string;
  note: 5 | 4;
  texte: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'AVIS_1',
    prenom: 'Monique',
    age: 67,
    ville: 'Tours',
    note: 5,
    texte:
      "À la retraite, ma mutuelle d'entreprise s'est arrêtée. J'ai trouvé une formule équivalente pour 42 € de moins par mois. Le questionnaire est très simple, j'ai été rappelée le lendemain.",
  },
  {
    id: 'AVIS_2',
    prenom: 'Jean-Pierre',
    age: 72,
    ville: 'La Rochelle',
    note: 5,
    texte:
      "Je redoutais les démarches en ligne, mais tout est clair, en grand, et sans piège. J'ai reçu 3 propositions, choisi celle qui couvrait bien le dentaire et l'optique. Aucune obligation, j'apprécie.",
  },
  {
    id: 'AVIS_3',
    prenom: 'Françoise',
    age: 61,
    ville: 'Annecy',
    note: 4,
    texte:
      "Comparatif rapide, deux minutes pas plus. Le conseiller m'a expliqué les garanties hospitalisation sans jargon. J'ai gagné 28 € par mois sur ma cotisation, je recommande.",
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
      'Environ 2 minutes pour répondre aux questions. Vous recevez ensuite les propositions de nos courtiers partenaires sous 24 h ouvrées, par téléphone ou par e-mail selon votre préférence.',
  },
  {
    question: 'Puis-je changer de mutuelle si je suis déjà couvert(e) ?',
    reponse:
      "Oui. Depuis la loi de résiliation infra-annuelle (2020), vous pouvez résilier votre mutuelle à tout moment après la première année de souscription, sans frais ni justification. Nos courtiers s'occupent gratuitement des démarches de résiliation pour vous.",
  },
];
