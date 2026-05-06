# Feature Specification: Tunnel de génération de leads — Mutuelle Seniors

**Feature Branch**: `001-lead-funnel-seniors`
**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "Nous devons créer un site web qui permettra de générer des leads sur un de nos outils où nous vendons les leads aux courtiers. L'objectif est de poser des questions à la personne qui arrive sur le site pour récupérer a minima son nom, son prénom, sa date de naissance, son code postal. Si possible nous pouvons aussi poser d'autres questions. On pourra s'inspirer du site lelynx.fr qui a réalisé quelque chose d'assez joli et fluide. Pour partir, on peut se baser sur le site dans le répertoire contact-mutuelle. Il faudra modifier les CGU et la politique de confidentialité."

## Clarifications

### Session 2026-05-06

- Q: Cible de livraison des leads (réutilisation de l'API `Prospect_web` existante, nouvelle plateforme, stockage local, ou fan-out multi-courtiers) ? → A: Nouvelle plateforme externe dédiée ; sa spécification d'interface (endpoints, schéma de payload, authentification) sera fournie ultérieurement par le métier.
- Q: Seuil d'âge senior et comportement hors-cible (refuser, rediriger ou tagger) ? → A: Accepter tous les âges et router le lead vers une **campagne** explicite sur la plateforme de revente : ≥ 55 ans → campagne senior ; < 55 ans avec composition familiale (conjoint et/ou enfants à charge) → campagne « < 55 famille » ; < 55 ans sans composition familiale → campagne « < 55 hors famille ». Aucun visiteur n'est refusé.
- Q: Couverture géographique acceptée par le tunnel (filtre sur le code postal) ? → A: France métropolitaine + DOM uniquement (CP des départements 01 à 95 et CP commençant par 97). Les TOM (CP commençant par 98) et l'étranger sont refusés en saisie avec un message clair.
- Q: Volume de leads attendu en régime de croisière (orientation pour le choix de persistance et de file de retry) ? → A: Environ 50 à 200 leads/jour à l'horizon 6 mois après mise en ligne ; pic ponctuel possible × 3 (campagnes payantes, viralité). Démarrage attendu plus modeste sur les premières semaines.
- Q: Comportement si le visiteur refuse le consentement à la transmission aux courtiers ? → A: Soumission bloquée. Sans consentement à la transmission, aucune donnée personnelle n'est persistée durablement et aucun lead n'est créé ; le visiteur peut revenir sur sa décision ou quitter le site.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Captation d'un lead complet et transmission au courtier (Priority: P1)

Un internaute français à la recherche d'une mutuelle santé arrive sur la page d'accueil. Le site est positionné prioritairement vers les seniors (55 ans et plus) mais accepte tous les visiteurs ; chaque lead sera ensuite aiguillé automatiquement vers la campagne de revente appropriée (senior / < 55 famille / < 55 solo, cf. FR-028). Le visiteur est immédiatement invité à démarrer un parcours guidé. À travers une série d'étapes courtes, il renseigne au minimum son nom, son prénom, sa date de naissance et son code postal, puis donne un consentement explicite à la transmission de ses informations à des courtiers en assurance partenaires. À la validation finale, le lead est enregistré, transmis à la plateforme d'achat de leads (avec son identifiant de campagne), et l'opérateur du site est notifié.

**Why this priority** : C'est la fonction primaire et raison d'être du site. Sans cette captation et cette transmission, le site ne génère aucun chiffre d'affaires. C'est le « happy path » indispensable au lancement.

**Independent Test** : Un testeur peut accéder au site en navigation privée, remplir le tunnel jusqu'au bout avec des données fictives mais valides, valider, et vérifier (a) qu'une page de confirmation s'affiche, (b) qu'un enregistrement du lead est persisté avec consentement horodaté, (c) qu'un appel sortant vers la plateforme d'achat de leads est effectué avec succès, (d) qu'une notification (email) est reçue par l'opérateur. Cette user story livre seule un MVP commercialement exploitable.

**Acceptance Scenarios** :

1. **Given** un visiteur sur la page d'accueil, **When** il clique sur l'appel à l'action principal et complète chaque étape obligatoire (nom, prénom, date de naissance, code postal) puis coche le consentement de transmission aux courtiers, **Then** il accède à un écran de confirmation et le lead est livré aux destinataires courtiers dans les 60 secondes.
2. **Given** un visiteur en cours de saisie, **When** il omet un champ obligatoire ou saisit un format invalide (code postal non français, date de naissance future, prénom vide), **Then** un message d'erreur clair s'affiche au niveau du champ concerné et la progression est bloquée jusqu'à correction.
3. **Given** un visiteur arrivé à la dernière étape, **When** il refuse de cocher le consentement à la transmission aux courtiers, **Then** le bouton de soumission reste inactif et un message d'information explique pourquoi le consentement est requis.

---

### User Story 2 — Expérience fluide, accessible et adaptée aux seniors (Priority: P2)

Une utilisatrice de 68 ans, peu à l'aise avec le numérique, parcourt le tunnel sur sa tablette. Le parcours présente une question (ou un tout petit groupe de questions liées) par écran, dans une typographie large, avec des transitions douces, un indicateur de progression visible, des boutons grands et contrastés, et la possibilité de revenir en arrière sans perte de saisie. L'identité visuelle et l'animation s'inspirent de lelynx.fr (atmosphère ludique, illustrations, micro-animations, ton rassurant) tout en restant sobre et lisible pour le public senior.

**Why this priority** : Le taux de complétion d'un tunnel pour un public senior dépend directement de la lisibilité et de la fluidité perçue. Cette story est cruciale pour atteindre les objectifs de conversion (SC-001, SC-008) mais peut être livrée sur la base d'un tunnel fonctionnel issu de la P1.

**Independent Test** : Faire passer le tunnel à un échantillon représentatif (≥ 5 utilisateurs ≥ 55 ans), mesurer le temps de complétion, le taux d'abandon par étape et recueillir une évaluation qualitative ; auditer le tunnel avec Lighthouse / axe-core sur les critères WCAG 2.1 AA.

**Acceptance Scenarios** :

1. **Given** un utilisateur senior sur mobile, **When** il avance dans le tunnel, **Then** chaque écran présente au plus 2 questions liées, un titre court, un bouton « Continuer » dimensionné ≥ 44 px de hauteur, et une barre/jalons de progression visible.
2. **Given** un utilisateur ayant complété 3 étapes, **When** il clique sur « Retour », **Then** il revient à l'étape précédente avec ses réponses préremplies et conservées.
3. **Given** un audit accessibilité automatisé, **When** il est exécuté sur l'ensemble des étapes du tunnel, **Then** il rapporte un score ≥ 90 et aucune violation WCAG 2.1 AA bloquante.

---

### User Story 3 — Enrichissement du lead par questions complémentaires (Priority: P3)

Après les questions obligatoires, le tunnel propose des questions optionnelles (régime obligatoire, présence d'un conjoint et/ou d'enfants à couvrir, niveau de garantie souhaité, situation actuelle vis-à-vis d'une mutuelle, date d'effet souhaitée, téléphone, email) afin d'augmenter la valeur du lead pour les courtiers acheteurs. Ces questions sont clairement indiquées comme facultatives et n'empêchent pas la soumission.

**Why this priority** : Un lead enrichi se valorise mieux à la revente. Cette story améliore directement le chiffre d'affaires moyen par lead, mais le MVP de captation peut fonctionner sans elle.

**Independent Test** : Soumettre deux leads — l'un avec uniquement les champs obligatoires, l'autre avec l'ensemble des champs optionnels remplis — et vérifier que les deux sont acceptés, livrés, et que les champs supplémentaires sont bien transmis et tracés.

**Acceptance Scenarios** :

1. **Given** un visiteur ayant fini les champs obligatoires, **When** il atteint les questions optionnelles, **Then** chaque champ est marqué « facultatif » et un lien « Passer » lui permet de sauter le bloc sans pénalité.
2. **Given** un visiteur ayant renseigné un email et un téléphone, **When** il soumet, **Then** ces champs sont transmis au système de livraison de leads et apparaissent dans la notification opérateur.

---

### User Story 4 — Documents légaux conformes au modèle de revente de leads (Priority: P2)

Avant la soumission finale, le visiteur peut consulter (et doit accepter) des Conditions Générales d'Utilisation et une Politique de Confidentialité spécifiquement adaptées au modèle de revente de leads à des courtiers en assurance. Ces documents sont accessibles depuis chaque page (footer) et explicitent : la nature des données collectées, l'identité du responsable de traitement, les destinataires (courtiers partenaires) et le périmètre de la transmission, la base légale (consentement explicite), la durée de conservation, et les droits RGPD du visiteur.

**Why this priority** : Sans ces documents conformes, la transmission à des courtiers tiers expose à un risque juridique (CNIL, recours) et invalide la valeur des leads. C'est un prérequis légal pour exploiter la P1.

**Independent Test** : Faire relire les deux documents par le DPO ou un conseil juridique externe, vérifier la cohérence entre le texte du consentement affiché dans le tunnel et le contenu des CGU/PdC, et confirmer que la version acceptée est bien horodatée et tracée par lead.

**Acceptance Scenarios** :

1. **Given** un visiteur sur n'importe quelle page, **When** il consulte le footer, **Then** des liens « CGU » et « Politique de confidentialité » mènent à des pages dédiées au présent site (et non à celles d'une autre marque).
2. **Given** un lead soumis et persisté, **When** un opérateur consulte l'enregistrement, **Then** il voit la version (horodatée et identifiable) des CGU/PdC effectivement acceptée par le visiteur au moment de la soumission.

---

### User Story 5 — Référencement naturel sur les requêtes clés du marché senior (Priority: P2)

Une personne qui cherche une mutuelle adaptée à sa situation tape une requête sur Google (ex. « mutuelle senior », « comparatif mutuelle santé », « meilleure mutuelle 65 ans »). Le site apparaît en première page des résultats organiques sur les principales requêtes ciblées et propose, dès le clic, une page d'atterrissage cohérente avec l'intention de recherche, qui amène naturellement le visiteur vers le tunnel de captation.

**Why this priority** : Le SEO organique est le canal d'acquisition à coût marginal le plus rentable pour un modèle de revente de leads. Sans visibilité sur les requêtes clés du marché senior, le tunnel (P1) ne sera alimenté que par des canaux payants ou par bouche-à-oreille, ce qui plafonne fortement le volume et la marge. C'est néanmoins un objectif progressif (les positions s'acquièrent sur plusieurs semaines/mois) qui peut être travaillé en parallèle du MVP de captation.

**Independent Test** : Sur une fenêtre de 90 jours après mise en ligne, vérifier sur un outil de suivi de positions (ex. : SE Ranking, Semrush, Search Console) que le site apparaît dans le top 100 sur les mots-clés ciblés ; auditer chaque page principale avec Lighthouse SEO et un crawler (Screaming Frog ou équivalent) ; valider que les balises, données structurées, sitemap et robots.txt sont exploitables par Google ; mesurer le trafic organique et le taux de conversion organique → tunnel.

**Acceptance Scenarios** :

1. **Given** un crawler de moteur de recherche, **When** il parcourt le site, **Then** il accède à un `sitemap.xml` à jour, à un `robots.txt` cohérent, et à des URLs canoniques uniques pour chaque page indexable.
2. **Given** une page d'atterrissage thématique (ex. : « Mutuelle senior 65 ans »), **When** un audit SEO automatisé l'analyse, **Then** il constate la présence d'un `<title>` unique (≤ 60 caractères), d'une meta description (≤ 160 caractères), d'une hiérarchie H1/H2/H3 cohérente, d'un balisage Schema.org pertinent et d'un maillage interne vers le tunnel et les pages connexes.
3. **Given** un visiteur arrivant sur une page de contenu via une requête organique, **When** il finit la lecture, **Then** il dispose d'un appel à l'action visible et contextualisé qui ouvre le tunnel de captation préalimenté du contexte (par exemple, le code postal n'est pas re-demandé s'il a été inféré).

---

### Edge Cases

- **Visiteur de moins de 55 ans** : aucun blocage ; le tunnel demande explicitement la composition familiale (conjoint, enfants) afin d'aiguiller vers la campagne `under55_family` ou `under55_solo` (cf. FR-028). La communication pendant le tunnel ne doit pas suggérer que l'offre est exclusivement réservée aux seniors.
- **Code postal hors zone autorisée** : les CP de TOM (98xxx) et tout CP non français à 5 chiffres sont refusés en saisie ; le visiteur reçoit un message explicite (« cette offre n'est pas disponible dans votre département pour le moment »). Les DOM (97xxx) sont acceptés.
- **Abandon en cours de tunnel** : la saisie partielle est conservée localement (continuité de session) mais n'est jamais transmise au courtier sans soumission finale et consentement.
- **Soumission en doublon** : si le même visiteur (mêmes nom/prénom/date naissance/code postal) re-soumet en moins de 24 h, le système doit dédupliquer ou marquer le second lead comme doublon plutôt que le facturer deux fois aux courtiers.
- **Échec de la transmission au système de leads** : retry automatique avec back-off ; alerte à l'opérateur si l'échec persiste ; le visiteur voit néanmoins une confirmation, le lead est conservé localement et sera retransmis.
- **Soumissions automatisées (bots, spam)** : protection anti-bot (rate limiting par IP, honeypot, ou défi simple) sans nuire à l'expérience d'un senior légitime.
- **Refus du consentement à la transmission aux courtiers** : la soumission est bloquée. Le bouton « Envoyer ma demande » reste désactivé et un message courtois invite le visiteur à cocher le consentement de transmission ou à quitter sans soumettre. Aucune voie alternative n'est proposée.
- **Interruption réseau lors de la soumission finale** : indicateur de chargement, message clair, possibilité de réessayer sans re-saisir.
- **Accessibilité : navigation au clavier seul** : tout le tunnel est utilisable sans souris.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** : Le système DOIT proposer un parcours de captation multi-étapes accessible depuis la page d'accueil, avec une question (ou un petit groupe de questions liées) par écran.
- **FR-002** : Le système DOIT collecter à titre obligatoire les quatre champs : nom, prénom, date de naissance, code postal.
- **FR-003** : Le système DOIT recueillir un consentement explicite, distinct et clairement libellé pour : (a) le traitement des données personnelles par l'éditeur, (b) la transmission de ces données aux courtiers en assurance partenaires. Le consentement (b) est **obligatoire** pour soumettre le formulaire : tant qu'il n'est pas coché, le bouton de soumission reste désactivé et aucune donnée personnelle n'est persistée durablement côté serveur. Aucune voie alternative de soumission « lead interne sans transmission » n'est ouverte.
- **FR-004** : Le système DOIT valider chaque saisie côté navigateur et côté serveur : prénom et nom non vides, date de naissance plausible (ni future, ni > 120 ans), code postal **français à 5 chiffres correspondant à la métropole (01–95) ou aux DOM (97xxx)** — les CP 98xxx (TOM) et tout code étranger sont refusés avec un message d'explication —, email et téléphone (si fournis) au format français standard.
- **FR-005** : Le système DOIT persister chaque lead complété avec : horodatage de soumission, source/page d'origine, version des CGU et de la PdC acceptées, adresse IP et user-agent, et statut de livraison.
- **FR-006** : Le système DOIT transmettre chaque lead complété à une **nouvelle plateforme externe d'achat de leads** dédiée à ce site (distincte de l'API `prod.vos2vis.fr/Prospect_web` utilisée par `contact-mutuelle`). La spécification d'interface (endpoint, schéma de payload, authentification, codes d'erreur) sera fournie séparément par le métier ; l'implémentation DOIT isoler cette intégration derrière un client dédié pour permettre la connexion sans refonte du tunnel. La transmission doit être effective dans un délai utile (cf. SC-004) et un mécanisme de reprise (file d'attente locale + retry à back-off exponentiel) DOIT couvrir les échecs ponctuels. Tant que la spécification n'est pas livrée, un mode « mock » horodate et persiste les leads localement comme s'ils avaient été livrés, afin de ne pas bloquer le développement du tunnel.
- **FR-007** : Le système DOIT afficher au visiteur, après soumission réussie, une page de confirmation explicite indiquant les prochaines étapes (ex. : « Un courtier va vous recontacter sous X jours ouvrés »).
- **FR-008** : Le système DOIT publier des CGU et une Politique de confidentialité spécifiques à la présente entité éditrice et au modèle de revente de leads, accessibles en permanence depuis le footer ; les contenus issus du site contact-mutuelle ne doivent PAS être réutilisés tels quels.
- **FR-009** : Le système DOIT être responsive (mobile, tablette, desktop) et atteindre un niveau d'accessibilité WCAG 2.1 AA, avec une attention particulière à la lisibilité pour le public senior (taille de police, contraste, taille des cibles tactiles).
- **FR-010** : Le système DOIT afficher un indicateur de progression (jauge ou jalons) visible à chaque étape du tunnel.
- **FR-011** : Le système DOIT permettre au visiteur de revenir à une étape précédente sans perdre les saisies déjà effectuées, et de reprendre à la dernière étape s'il rouvre l'onglet (sauvegarde locale temporaire).
- **FR-012** : Le système PEUT collecter des informations complémentaires (régime obligatoire, niveau de garantie souhaité, situation actuelle vis-à-vis d'une mutuelle, date d'effet souhaitée, téléphone, email), marquées comme facultatives. Les questions « avez-vous un conjoint à couvrir ? » et « avez-vous des enfants à charge à couvrir ? » sont **conditionnellement obligatoires pour les visiteurs de moins de 55 ans** car elles déterminent l'aiguillage de campagne (cf. FR-028) ; elles restent facultatives pour les visiteurs de 55 ans et plus.
- **FR-029** : Le système DOIT être dimensionné pour traiter sans dégradation un volume cible de **50 à 200 leads soumis par jour** à l'horizon 6 mois, avec une tolérance à des pics ponctuels d'un facteur ×3 (campagnes payantes ou viralité). Cela impose une persistance plus robuste qu'un simple stockage fichier (base SQLite minimum, ou base relationnelle légère) et une file de retry capable de tamponner au moins une heure d'indisponibilité de la plateforme externe sans perte de leads.
- **FR-028** : Le système DOIT déterminer automatiquement la **campagne** de destination de chaque lead avant transmission, selon les règles suivantes :
  - **Âge ≥ 55 ans** → campagne `senior`.
  - **Âge < 55 ans ET composition familiale renseignée (au moins un conjoint et/ou un enfant à charge déclaré)** → campagne `under55_family`.
  - **Âge < 55 ans ET aucune composition familiale** → campagne `under55_solo`.
  L'identifiant de campagne DOIT être inclus dans le payload transmis à la plateforme externe (FR-006), persisté avec le lead (FR-005) et apparaître dans la notification opérateur (FR-013). La nomenclature précise des identifiants de campagne sera alignée avec la spécification d'interface fournie par le métier.
- **FR-013** : Le système DOIT notifier l'opérateur (par email ou canal équivalent) à chaque nouveau lead complété, avec un récapitulatif des champs renseignés.
- **FR-014** : Le système DOIT prévenir les soumissions abusives (limitation de débit par IP, détection de doublons à fenêtre courte, protection anti-bot non intrusive).
- **FR-015** : Le système DOIT informer le visiteur de ses droits RGPD (accès, rectification, effacement, opposition, retrait du consentement) et fournir un canal de contact effectif pour les exercer.
- **FR-016** : Le système DOIT respecter les obligations applicables à l'intermédiation en assurance et à la cession de leads en France (information précontractuelle, identité des destinataires, traçabilité du consentement, recommandations CNIL).
- **FR-017** : Le système DOIT permettre à l'opérateur de configurer la liste des destinataires courtiers (identifiants, canal de livraison, état actif/inactif) et les destinataires de notifications, sans nécessiter de modification du code source. Pour la v1, une configuration via variables d'environnement et fichier de configuration versionné est acceptée ; un panneau d'administration n'est pas obligatoire.
- **FR-018** : Le système DOIT être déployable sur l'infrastructure existante décrite dans `INFRA.md` (Nginx Proxy Manager partagé, conteneurisation par projet) sans interférer avec les autres sites Next.js de l'hôte.
- **FR-019** : Le système DOIT renseigner correctement les balises SEO essentielles (title, meta description, canonical, structured data Organization) avec la nouvelle identité de marque, et NON les valeurs héritées de contact-mutuelle.
- **FR-020** : Le site DOIT cibler explicitement, par sa structure éditoriale et son maillage interne, un cluster de mots-clés du marché de la mutuelle santé senior, avec :
  - **Mots-clés primaires** (un par page d'atterrissage dédiée) : « mutuelle senior », « mutuelle santé », « comparatif mutuelle senior », « comparatif mutuelle santé », « meilleure mutuelle senior », « devis mutuelle senior », « mutuelle santé retraité ».
  - **Mots-clés secondaires** (combinables sur les mêmes pages ou en pages filles) : « mutuelle senior pas chère », « tarif mutuelle senior », « mutuelle senior 60 ans », « mutuelle senior 65 ans », « mutuelle senior 70 ans », « mutuelle senior 75 ans », « mutuelle senior sans délai de carence », « mutuelle senior sans questionnaire médical », « complémentaire santé senior », « comparateur mutuelle senior », « changer de mutuelle senior », « mutuelle senior couple », « mutuelle senior dentaire », « mutuelle senior optique », « mutuelle senior hospitalisation », « mutuelle senior auditive ».
  - **Requêtes longue traîne** (à exploiter en pages de contenu, FAQ ou articles de blog) : « comment choisir sa mutuelle quand on est senior », « quelle mutuelle pour un retraité », « combien coûte une mutuelle senior », « meilleure mutuelle senior 2026 », « avis mutuelle senior », « mutuelle santé après 60 ans », « résiliation mutuelle senior loi Hamon ».
  La liste précise et la stratégie de pages associées sont définies dans un plan éditorial annexe (livrable séparé) pouvant évoluer dans le temps.
- **FR-021** : Chaque page indexable DOIT comporter une balise `<title>` unique (≤ 60 caractères), une meta description rédigée (≤ 160 caractères), une URL canonique stable et lisible (slug en français, sans paramètres techniques), une hiérarchie de titres `<h1>`/`<h2>`/`<h3>` cohérente avec le mot-clé principal, des attributs `alt` descriptifs sur les images significatives, et un balisage Open Graph / Twitter Card pour le partage social.
- **FR-022** : Le site DOIT publier un `sitemap.xml` automatiquement régénéré à chaque ajout/modification de page indexable, ainsi qu'un fichier `robots.txt` autorisant l'indexation des pages publiques et excluant les zones sensibles (pages internes, endpoints API, page de confirmation de soumission).
- **FR-023** : Le site DOIT exposer des données structurées (JSON-LD Schema.org) pertinentes : au minimum `Organization` sur l'ensemble du site, `WebSite` avec `SearchAction` sur la home, `BreadcrumbList` sur les pages profondes, `FAQPage` sur les pages FAQ, et `Article` sur les contenus éditoriaux.
- **FR-024** : Les performances Core Web Vitals DOIVENT respecter les seuils « Good » de Google sur la home et les principales pages d'atterrissage : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1, mesurés en conditions mobiles.
- **FR-025** : Le site DOIT publier au moins une page d'atterrissage SEO-optimisée par mot-clé primaire défini en FR-020, comportant un contenu rédactionnel original (≥ 600 mots), un CTA clair vers le tunnel de captation, et un maillage interne vers les contenus connexes.
- **FR-026** : Le site DOIT être préparé pour Google Search Console et un outil d'analytics conforme RGPD : balise de vérification, soumission du sitemap, et événements de conversion (démarrage du tunnel, soumission du lead) trackés sans dépôt de cookies non essentiels avant consentement.
- **FR-027** : Le site NE DOIT pas générer de contenus dupliqués, de chaînes de redirections multiples, ou de pages d'atterrissage massivement similaires (« doorway pages ») ; chaque variation thématique doit apporter une valeur informationnelle distincte.

### Key Entities *(include if feature involves data)*

- **Lead** : prospect capturé. Attributs principaux : identifiants minimaux (nom, prénom, date de naissance, code postal), informations qualifiantes optionnelles, métadonnées (horodatage, source, IP, user-agent), référence au consentement, statut de livraison (collecté → livré → erreur).
- **Consentement** : preuve horodatée de consentement attachée à un lead. Attributs : finalités acceptées, identifiant de version des CGU et de la PdC, IP, user-agent, horodatage.
- **Étape de tunnel (Funnel step)** : unité d'interaction du parcours. Attributs : ordre, libellé, champs présentés, caractère obligatoire/facultatif, conditions d'affichage.
- **Document légal** : CGU ou Politique de confidentialité. Attributs : version, date d'effet, contenu, état (brouillon / publié). Versionnement requis pour la traçabilité du consentement.
- **Destinataire courtier** : entité externe consommant les leads. Attributs : identifiant, canal de livraison, statut actif/inactif.
- **Notification opérateur** : message envoyé à l'éditeur lors d'événements du tunnel (nouveau lead, échec de livraison persistant, alerte anti-abus).
- **Campagne** : segmentation logique d'un lead à destination de la plateforme de revente. Trois campagnes connues à ce stade : `senior` (≥ 55 ans), `under55_family` (< 55 ans avec composition familiale), `under55_solo` (< 55 ans sans composition familiale). Attributs : identifiant, libellé, règles d'éligibilité, statut actif/inactif. Une campagne est attribuée à chaque lead au moment de la soumission et conservée dans son historique.
- **Page d'atterrissage SEO** : page indexable optimisée pour un mot-clé primaire ou un cluster de mots-clés. Attributs : mot-clé cible, slug, balises (title, meta, canonical, OG), hiérarchie de titres, contenu rédactionnel, balisage Schema.org, CTA et maillage interne.
- **Article éditorial / FAQ** : contenu de fond destiné à capter la longue traîne, structurer l'autorité thématique et alimenter les pages d'atterrissage par maillage interne.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Au moins 60 % des visiteurs ayant démarré le tunnel le complètent jusqu'à la page de confirmation (mesuré sur une fenêtre glissante de 30 jours).
- **SC-002** : Le temps médian pour compléter le tunnel limité aux champs obligatoires est inférieur ou égal à 90 secondes.
- **SC-003** : 100 % des leads enregistrés portent les quatre champs obligatoires non vides ET un enregistrement de consentement explicitement valide.
- **SC-004** : Au moins 95 % des leads enregistrés sont livrés avec succès au système d'achat de leads dans un délai de 60 secondes après soumission.
- **SC-005** : 0 lead est transmis à un courtier en l'absence d'un consentement explicite enregistré à la version courante des CGU/PdC.
- **SC-006** : Le tunnel obtient un score d'accessibilité ≥ 90 (Lighthouse) et 0 violation bloquante WCAG 2.1 AA sur l'ensemble des étapes.
- **SC-007** : Le taux de rebond mobile sur la page d'accueil est inférieur à 50 %.
- **SC-008** : Lors d'un test utilisateur auprès d'un panel de personnes ≥ 55 ans, au moins 85 % évaluent le parcours comme « facile » ou « très facile ».
- **SC-009** : Aucun contenu textuel ou visuel ne fait référence à « Contact Mutuelle » dans le périmètre publié (CGU, PdC, mentions, SEO, footer, copies).
- **SC-010** : Dans les 90 jours suivant la mise en ligne, le site est positionné dans le top 100 de Google (FR, mobile) sur au moins 80 % des mots-clés primaires définis en FR-020 ; au bout de 180 jours, au moins 3 mots-clés primaires sont positionnés dans le top 20 et au moins 1 dans le top 10.
- **SC-011** : Le score Lighthouse SEO est ≥ 95 sur la home et sur 100 % des pages d'atterrissage SEO ; les seuils Core Web Vitals « Good » (FR-024) sont respectés sur ces pages mesurés sur les 28 derniers jours dans Search Console.
- **SC-012** : Au moins 30 % du trafic acquis sur le site provient du canal organique (search) au-delà des 6 premiers mois de mise en ligne.
- **SC-013** : Le sitemap déclaré dans Search Console présente un taux d'indexation ≥ 90 % des URLs soumises ; le rapport « Couverture / Indexation » ne comporte aucune erreur bloquante.
- **SC-014** : Le taux de conversion des visiteurs organiques vers le démarrage du tunnel est ≥ 15 %, et leur taux de complétion final est cohérent avec SC-001 (pas plus de 10 points en dessous).

## Assumptions

- **Public cible** : positionnement éditorial et SEO prioritaire sur les résidents français de 55 ans et plus à la recherche d'une complémentaire santé (mutuelle senior). Le tunnel accepte tous les âges et chaque lead est aiguillé vers une campagne adaptée (cf. FR-028). La couverture géographique acceptée est la France métropolitaine et les DOM (cf. FR-004) ; les TOM et l'étranger sont exclus.
- **Modèle économique** : revente de leads à des courtiers tiers ; le site n'est pas un comparateur ni un courtier direct.
- **Point de départ technique** : le code applicatif s'inspirera fortement du projet existant `/home/jyblonde/contact-mutuelle` (Next.js 15, formulaire de tarification multi-étapes, intégration `Prospect_web`, notifications email Gmail) qui sera adapté ; les éléments de marque, les contenus légaux et la cible (seniors) seront refondus.
- **Identité de marque** : l'entité « La Mutuelle Seniors » (nom de travail) sera publiée avec ses coordonnées légales propres (raison sociale, adresse, contact DPO) que le métier fournira en intrant à la phase de plan/implémentation. Les valeurs définitives sont **hors périmètre de cette spec** et seront injectées via configuration au moment du déploiement.
- **Lisibilité senior** : les défauts d'interface privilégient la clarté (taille de police de base ≥ 18 px, contraste AA, peu d'options par écran, vocabulaire simple), même si la direction artistique s'inspire de la fluidité de lelynx.fr.
- **Plateforme de leads** : nouvelle plateforme externe dédiée à ce site (décision actée en clarification 2026-05-06). Sa spécification d'interface n'est pas encore disponible ; l'intégration sera développée derrière un client isolé et un mode mock interim pour ne pas bloquer le reste du tunnel.
- **Hébergement** : déploiement sur l'hôte mutualisé documenté dans `INFRA.md` ; aucune nouvelle infrastructure n'est introduite.
- **Cookies & analytics** : un consentement cookies conforme CNIL sera implémenté (bandeau, choix granulaire) avant tout dépôt non strictement nécessaire.
- **Délais** : les délais et le calendrier de mise en ligne seront cadrés par l'équipe métier — non couverts par cette spec.
- **SEO — horizon temporel** : les positions organiques s'acquièrent typiquement sur 3 à 12 mois ; les critères de succès SEO (SC-010 à SC-014) supposent un travail continu de production de contenus et de netlinking en parallèle de la mise en ligne technique. Le périmètre purement applicatif de la présente spec couvre l'infrastructure SEO (balises, sitemap, robots, données structurées, performances, pages d'atterrissage initiales) ; la stratégie éditoriale et l'acquisition de backlinks font l'objet d'un livrable distinct.
- **SEO — concurrence** : le marché « mutuelle senior » est très concurrentiel (lelynx.fr, lesfurets.com, assurland.com, comparateur-mutuelle.org, lesseniors.fr, etc.). Atteindre la première page sur les mots-clés primaires les plus génériques (« mutuelle santé », « mutuelle senior ») dans les 6 premiers mois est un objectif ambitieux ; l'accent sera mis prioritairement sur la longue traîne et les pages d'intention forte.
