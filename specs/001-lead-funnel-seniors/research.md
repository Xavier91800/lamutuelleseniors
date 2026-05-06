# Phase 0 — Research & Decisions

**Feature**: Tunnel de génération de leads — Mutuelle Seniors
**Date**: 2026-05-06

Ce document consigne les choix techniques résolus à partir de la spec et des clarifications. Chaque décision est argumentée et accompagnée des alternatives écartées. Aucun marqueur `NEEDS CLARIFICATION` ne subsiste.

---

## R-01 — Framework applicatif

**Decision**: Next.js 15 (App Router, runtime Node) + React 19 + TypeScript 5.

**Rationale**:
- Continuité avec `contact-mutuelle` déjà en production sur la même infra (cf. `INFRA.md`) — chaîne CI/CD, healthcheck, conventions Compose et NPM déjà éprouvées.
- App Router permet à la fois pages statiques SEO-rendues côté serveur (landing pages, légales) ET routes API serveur (`/api/lead`) dans un seul build.
- React 19 et Turbopack apportent un build rapide adapté au volume de pages d'atterrissage prévu (FR-025).
- Écosystème mature pour les besoins du projet : metadata API native (titles/canonicals), `generateSitemap`, `generateRobotsTxt`, JSON-LD via `<Script>`.

**Alternatives considered**:
- *Astro* : excellent en perf SEO statique mais introduit un nouveau runtime sur l'hôte alors que Next.js est déjà maîtrisé. Coût d'apprentissage et duplication d'écosystème non justifiés pour 50–200 leads/jour.
- *Remix* : équivalent fonctionnel, mais sans surface de réutilisation du code `contact-mutuelle`.

---

## R-02 — Persistance locale

**Decision**: SQLite via `better-sqlite3` (mode WAL, fichier monté sur volume Docker `/data/lamutuelleseniors.db`).

**Rationale**:
- Volume cible 50–200 leads/jour avec pic ×3 (FR-029) → SQLite est très largement dimensionné (millions d'écritures/jour possibles).
- `better-sqlite3` est synchrone, pas de pool, pas d'orchestration ; déploiement = 1 binaire + 1 fichier.
- Compatible avec un seul conteneur Next.js (mode Node), pas besoin de service séparé ; cohérent avec l'esprit « 1 site = 1 stack » de l'infra mutualisée.
- WAL permet lectures concurrentes (queue de retry + écritures du tunnel) sans verrou bloquant.
- Backup = simple copie du `.db` (snapshot rsync sur l'hôte).

**Alternatives considered**:
- *PostgreSQL* : surdimensionné pour 200 leads/jour, ajoute un conteneur, des credentials, un point de défaillance, du backup. À reconsidérer au-delà de 5 000 leads/jour ou si plusieurs instances applicatives.
- *Stockage fichier JSON-Lines* : trivial, mais pas d'index pour la dédup ou la file de retry, race conditions sur écritures concurrentes.
- *Redis + Postgres* : combinaison classique mais introduit deux services pour aucun gain à cette échelle.

---

## R-03 — Validation des données saisies

**Decision**: `zod` (v4) en source unique de vérité, partagée entre client (react-hook-form via `@hookform/resolvers/zod`) et serveur (route handler `/api/lead`).

**Rationale**:
- `zod` est déjà utilisé dans `contact-mutuelle` côté API ; cohérent.
- Schémas TypeScript-first → types inférés réutilisés dans tout le code.
- Permet de centraliser les règles spec FR-002, FR-004 (regex CP métropole + DOM, date plausible, email/téléphone optionnels) au même endroit.

**Alternatives considered**:
- *Yup* : équivalent mais moins idiomatique en TS strict.
- *Validation manuelle* : bug-prone, divergence client/serveur garantie.

---

## R-04 — Formulaire et état du tunnel

**Decision**: `react-hook-form` (RHF) + `framer-motion` pour les transitions inter-étapes ; persistance d'étape en `localStorage` côté client (clé `lms.tunnel.draft.v1`) ; soumission finale POST `/api/lead`.

**Rationale**:
- RHF gère les états contrôlés / non-contrôlés sans re-render excessif (important sur mobile senior, machines anciennes).
- `framer-motion` supporte nativement `prefers-reduced-motion` → conforme WCAG 2.1 et conserve la fluidité visuelle « lelynx » pour les utilisateurs qui le souhaitent.
- `localStorage` couvre FR-011 (reprise de saisie) sans introduire de cookie ni nécessiter de consentement (donnée techniquement nécessaire au service).
- Pas d'auto-save serveur tant que le consentement n'est pas donné (cohérent avec la clarification Q5).

**Alternatives considered**:
- *Tanstack Form* : moderne mais moins connu, écosystème plus restreint.
- *Composants React natifs sans lib* : plus de bug surface (gestion des erreurs, focus, a11y) — non justifié.
- *Sauvegarde brouillon serveur (sans soumission)* : violerait Q5 (pas de persistance avant consentement).

---

## R-05 — Animations & accessibilité

**Decision**: `framer-motion` 11 ; transitions ≤ 250 ms ; respect strict de `prefers-reduced-motion: reduce` ; tailles de cible tactile ≥ 44 px (US2 AS1) ; police de base 18 px ; ratio de contraste ≥ 4,5:1.

**Rationale**:
- Le public senior réagit mal aux animations longues / parallaxe — FR-009 + spec senior assumption.
- L'inspiration lelynx est respectée (transition douce entre questions, micro-feedback) sans excès.
- `axe-core/playwright` permettra la validation automatique en CI (US2 AS3).

**Alternatives considered**:
- *CSS-only transitions* : possible mais l'orchestration multi-étapes (entrée/sortie coordonnées) est plus simple en framer-motion.
- *react-spring* : très bon mais lib de plus, alors que framer couvre tous les cas.

---

## R-06 — Cookies, consentement & analytics

**Decision**:
- **Bandeau de consentement cookie** maison (composant `CookieBanner`), conforme CNIL (3 boutons : « Tout accepter », « Refuser », « Personnaliser »), aucun cookie déposé avant action explicite.
- **Analytics** : Plausible Analytics (auto-hébergé ou cloud, à confirmer via env). Plausible n'utilise **aucun cookie** et n'est donc pas bloqué par le bandeau ; conforme RGPD sans transfert hors UE si cloud EU. Permet le suivi de FR-026 (events `funnel_started`, `funnel_step_X`, `lead_submitted`).
- **Pas de Google Analytics 4 par défaut** : pour ne pas devoir déclencher Consent Mode v2 et conserver une mesure complète sans dépendre du taux de consentement.

**Rationale**:
- Plus simple, plus rapide, conforme par construction.
- Évite la complexité du Google Consent Mode v2 (rework si tag GA mal placé).
- Le bandeau reste utile pour de futurs scripts marketing (Meta Pixel, GTM) déposés derrière consentement.

**Alternatives considered**:
- *Axeptio / Didomi* : surdimensionné pour la v1 et coûteux.
- *GA4 + Consent Mode v2* : possible plus tard ; nécessite une intégration soigneuse pour ne pas dégrader l'UX seniors.

---

## R-07 — Anti-bot et protection contre l'abus

**Decision**: combinaison non intrusive — sans CAPTCHA visuel.
- **Honeypot** : champ caché (`<input name="hp_zip" tabindex="-1">`) + bots remplissent → rejet silencieux.
- **Time-on-form** : soumission rejetée si l'écart entre `tunnel_started_at` (cookie de session côté client envoyé en hidden field) et la POST est < 4 s.
- **Rate-limit** : token-bucket en mémoire (10 soumissions/IP/heure, 60 démarrages de tunnel/IP/heure) — implémenté en lib interne `src/lib/antibot/rateLimit.ts`.
- **Dédup** : index unique SQL sur `(lower_nom, lower_prenom, datenaissance, code_postal)` glissant sur 24 h.
- **Cloudflare Turnstile** : préparé en option derrière un flag d'environnement `ANTIBOT_TURNSTILE_SITEKEY` (à activer si on observe une vague de spam — pas nécessaire en v1).

**Rationale**:
- CAPTCHA visuel = friction majeure pour les seniors (FR-014 demande explicitement « non intrusive »).
- Le honeypot + time-on-form filtre 95 % du spam non sophistiqué.
- L'option Turnstile est invisible (challenges non-interactifs) et activable sans refonte si la situation l'exige.

**Alternatives considered**:
- *reCAPTCHA v2 / v3* : reCAPTCHA dépose des cookies → complique le bandeau et pénalise l'UX.
- *hCaptcha visuel* : friction.

---

## R-08 — Client de livraison de leads (intégration externe)

**Decision**: Pattern « port + adapters ». Une interface TypeScript `LeadDeliveryClient` (`deliver(lead): Promise<DeliveryResult>`) avec :
- `MockLeadDeliveryClient` (par défaut tant que la spec API n'est pas fournie — clarif Q1) : log JSON + persiste un `delivery_attempt` `status='delivered_mock'`, retourne succès. Les leads sont marqués comme livrés (en mode mock) afin que le reste du système soit pleinement testable et démonstrable.
- `HttpLeadDeliveryClient` (squelette) : POST HTTPS authentifié, à compléter à la livraison de la spec d'interface par le métier. Doit gérer timeouts (10 s), erreurs 4xx (pas de retry, marquer le lead invalide) vs 5xx (retry).
- `factory.ts` choisit l'implémentation selon `LEAD_DELIVERY_MODE` (`mock` | `http`).

**Rationale**:
- Permet de coder, tester et démontrer le tunnel de bout en bout sans dépendre de la livraison de la spec d'interface — débloque le développement (cohérent avec FR-006 « mode mock interim »).
- Isole précisément la zone de changement quand la spec arrivera : un seul fichier `HttpLeadDeliveryClient.ts` à compléter.
- Facilite les tests : les tests d'intégration injectent un `FakeLeadDeliveryClient` configurable (succès / échec 5xx / échec 4xx).

**Alternatives considered**:
- *Coder directement le client HTTP avec des suppositions* : risque élevé de re-travail à la livraison de la vraie spec.
- *Attendre la spec avant de coder le tunnel* : bloque tout le projet.

---

## R-09 — File de retry pour la livraison

**Decision**: file in-process simple, table SQLite `delivery_attempts` :
- À chaque soumission, un `delivery_attempt` (status `pending`) est créé puis tenté immédiatement.
- En cas d'échec 5xx ou timeout, la ligne reste `pending` avec `next_retry_at = now + backoff(attempt_no)`.
- Un worker interne (`retryWorker`) tourne via `setInterval` (60 s) au boot du conteneur Next.js + un endpoint `POST /api/lead/retry` permet un déclenchement externe (cron Docker / Portainer).
- Backoff exponentiel + jitter : 1 min, 5 min, 15 min, 1 h, 6 h, 24 h ; après 6 tentatives → status `failed_dead_letter`, alerte email opérateur.

**Rationale**:
- Pas de dépendance externe (BullMQ, Redis…), pas de service supplémentaire.
- Tampon ≥ 1 h conforme à la contrainte FR-029.
- Le double déclencheur (interval interne + endpoint) couvre les cas où le conteneur redémarre fréquemment (le cron externe garantit la reprise).

**Alternatives considered**:
- *BullMQ + Redis* : musique de chambre vu le volume.
- *AWS SQS* : ajoute un fournisseur cloud externe et une dépendance hors infra mutualisée.

---

## R-10 — Notifications opérateur

**Decision**: `nodemailer` via SMTP — par défaut Gmail App Password (continuité avec `contact-mutuelle`), envoi désactivable par env `MAIL_NOTIFY=false`. Adresse de destination configurable via `MAIL_TO` (peut être une distribution interne).

**Rationale**:
- Solution déjà éprouvée sur le serveur (cf. `contact-mutuelle/app/api/prospect/route.ts:96-138`).
- Sobre, pas de service tiers payant.
- L'option `MAIL_NOTIFY=false` permet de couper les notifications en tests / staging.

**Alternatives considered**:
- *Resend / Postmark* : meilleur deliverability mais coût et compte additionnel — à reconsidérer si problème.
- *Webhook Slack/Discord* : possible plus tard via un `Notifier` abstrait.

---

## R-11 — SEO technique

**Decision**:
- **Metadata API** Next.js (export `metadata`) sur chaque page → titre unique ≤ 60 c, meta description ≤ 160 c, canonical, Open Graph, Twitter Card (FR-021).
- **Sitemap dynamique** via `app/sitemap.ts` (Next.js natif) — pas besoin de `next-sitemap` puisque l'API built-in suffit. Régénéré à chaque build et accessible sous `/sitemap.xml`.
- **robots.txt** via `app/robots.ts`. Bloque `/tunnel/confirmation`, `/api/*`, et tout chemin de retour technique.
- **Données structurées** : composant `<JsonLd>` qui injecte `Organization` (root layout), `WebSite` + `SearchAction` (home), `BreadcrumbList` (landing pages profondes), `FAQPage` (sections FAQ), `Article` (contenus éditoriaux).
- **Performance** : `next/image` pour toutes les images (optimisation auto), `next/font` pour Geist (déjà en place dans la convention contact-mutuelle), `output: 'standalone'` pour image Docker légère, `priority` sur le LCP image de la home.
- **Audit CI** : `lighthouse-ci` exécuté sur la home et les 7 landing pages dans le pipeline ; échec build si Performance < 80 ou SEO < 95 (objectif SC-011).

**Rationale**: chaque exigence FR-021 → FR-027 et SC-010 → SC-014 est rattachée à un mécanisme concret et automatisé.

**Alternatives considered**:
- *next-sitemap* : utile pour les très gros sites ; pour ~10 pages, l'API built-in est plus simple et 0-dépendance.

---

## R-12 — Logs et observabilité interne

**Decision**: `pino` → stdout JSON (capté par Docker / Portainer). Log levels via env `LOG_LEVEL`. Champs systématiques : `request_id`, `route`, `event`, `lead_id?`, `delivery_attempt?`. Aucune donnée personnelle complète n'est loguée — masquage sur email/téléphone (3 premiers caractères + `***`), comme dans contact-mutuelle (cf. `app/api/prospect/route.ts:65-94`).

**Rationale**: conforme aux pratiques actuelles, pas d'outil externe à installer, exportable plus tard vers Loki / Grafana si besoin.

---

## R-13 — Identité de marque (placeholder)

**Decision**: créer un fichier `src/config/site.ts` qui centralise tous les attributs de marque : `siteName`, `legalEntity`, `legalAddress`, `phone`, `email`, `dpoEmail`, `colorPrimary`, `colorSecondary`, `logoPath`. Tous les composants (Header, Footer, JsonLd, CGU/PdC templates) lisent uniquement depuis ce module. Les valeurs initiales sont des placeholders explicites (`TODO_BRAND_NAME`, etc.) que le métier remplira en pré-déploiement.

**Rationale**: découpler complètement le code du nom de marque permet (a) de coder et tester sans la décision finale, (b) de pivoter le nom sans recherche/remplacement risquée. Conforme à la décision de la clarif Q-identité (out of scope du spec, livré en input du déploiement).

---

## R-14 — Stratégie de tests

**Decision**:
- **Unit (Vitest)** : `validation/`, `campaign/resolveCampaign.ts`, `retry/backoff.ts`, `antibot/`, `consent/recordConsent.ts`.
- **Integration (Vitest + DB éphémère in-memory `:memory:` ou fichier tmp)** : `repositories/*`, `retryWorker.ts` avec `FakeLeadDeliveryClient`, `routes /api/lead` complètes (zod + repo + delivery mock + email mock).
- **E2E (Playwright)** : 4 scénarios → happy path tunnel → consentement refusé → doublon 24 h → CP TOM refusé. Audit `axe-core` automatique sur chaque step. Émulation iPhone 14 + Pixel 7 + iPad mini.
- **Lighthouse CI** : score gate sur home + 7 landings.

**Rationale**: couvre tous les Acceptance Scenarios des US1–US5 sans aller jusqu'à la sur-couverture.

---

## R-15 — Déploiement

**Decision**:
1. Construire l'image Docker locale → `node:20-alpine` multi-stage (cf. `INFRA.md` §Convention Compose et `Dockerfile` de `contact-mutuelle`).
2. `docker-compose.yml` : service unique `lamutuelleseniors`, conteneur `lamutuelleseniors`, port host `3007:3000` (à confirmer libre), user `1001:1001`, volume `./data:/data` pour la DB, healthcheck `wget /api/health`, networks `default` + `proxy-net` (réseau externe partagé avec NPM — cf. INFRA.md §Fix durable du piège 502).
3. NPM (UI :81) : ajouter Proxy Host pour `lamutuelleseniors.fr` + `www.lamutuelleseniors.fr` → `http://lamutuelleseniors:3000`, SSL Let's Encrypt + Force SSL + HTTP/2.
4. DNS : entrée A `lamutuelleseniors.fr` → `146.59.231.199` (à faire en pré-requis).
5. Variables d'environnement injectées via `docker-compose.yml` (chargées depuis un `.env` non versionné placé dans le dossier projet, comme la convention en place sur le serveur).

**Rationale**: pas de nouvelle infra, alignement strict avec INFRA.md, fix 502 préventif appliqué dès le départ via réseau externe `proxy-net`.

---

## R-16 — Stratégie de migration de schéma

**Decision**: dossier `migrations/` avec fichiers `NNNN_description.sql` exécutés en ordre lexicographique au boot de l'app (table `_migrations` interne pour l'idempotence). Pas d'ORM. Dépendance unique sur `better-sqlite3`.

**Rationale**: schéma simple (5 tables), évolutions rares, aucun besoin d'un ORM lourd. Les migrations versionnées dans le repo permettent un déploiement reproductible.

---

## Synthèse — variables d'environnement attendues

| Variable | Description | Défaut |
|---|---|---|
| `NODE_ENV` | environnement | `production` en Compose |
| `PORT` | port HTTP interne | `3000` |
| `DATABASE_PATH` | chemin du fichier SQLite | `/data/lamutuelleseniors.db` |
| `LEAD_DELIVERY_MODE` | `mock` ou `http` | `mock` |
| `LEAD_DELIVERY_URL` | endpoint plateforme externe | _(à fournir)_ |
| `LEAD_DELIVERY_AUTH` | header d'auth | _(à fournir)_ |
| `MAIL_NOTIFY` | activer notifications | `true` |
| `GMAIL_USER` / `GMAIL_PASS` | SMTP | _(secret)_ |
| `MAIL_TO` | destinataire opérateur | _(secret)_ |
| `PLAUSIBLE_DOMAIN` | domaine analytics | `lamutuelleseniors.fr` |
| `PLAUSIBLE_HOST` | hôte du script Plausible | `https://plausible.io` |
| `RATE_LIMIT_SUBMISSIONS_PER_HOUR` | par IP | `10` |
| `ANTIBOT_TURNSTILE_SITEKEY` | clé publique Cloudflare Turnstile (option) | `null` |
| `ANTIBOT_TURNSTILE_SECRET` | secret Turnstile (option) | `null` |
| `LOG_LEVEL` | pino | `info` |
| `SITE_LEGAL_ENTITY`, `SITE_DPO_EMAIL`, etc. | champs marque | _(placeholders)_ |
