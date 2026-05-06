# Implementation Plan: Tunnel de génération de leads — Mutuelle Seniors

**Branch**: `001-lead-funnel-seniors` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lead-funnel-seniors/spec.md`

## Summary

Construire `lamutuelleseniors.fr` : un site Next.js 15 mono-repo qui sert un tunnel multi-étapes inspiré de lelynx.fr, accessible (WCAG 2.1 AA, optimisé seniors), capture les leads (nom, prénom, date de naissance, code postal métropole+DOM, plus questions optionnelles dont la composition familiale), aiguille chaque lead vers une **campagne** (`senior` / `under55_family` / `under55_solo`) puis transmet le lead via un client isolé à une **nouvelle plateforme externe** dont la spécification arrivera plus tard (mode mock interim). Le site embarque un socle SEO complet (metadata, sitemap, robots, JSON-LD, Core Web Vitals « Good ») et des pages d'atterrissage par mot-clé primaire. Persistance SQLite (better-sqlite3) avec file de retry interne. Déploiement sur l'hôte mutualisé conformément à `INFRA.md`. La base de code de référence est `/home/jyblonde/contact-mutuelle` (Next.js 15, zod, nodemailer, structure `app/` + `src/`) — réutilisée dans son architecture, refondue dans ses contenus, sa marque et son intégration courtier.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20 (image `node:20-alpine` en runtime, image build `node:20-alpine`).
**Primary Dependencies**: Next.js 15 (App Router, Turbopack), React 19, TailwindCSS v4 + `@tailwindcss/forms`, zod 4, react-hook-form 7, framer-motion 11 (animations + `prefers-reduced-motion`), better-sqlite3 11, nodemailer 7, `nanoid`, `next-sitemap` 4, `pino` (logs structurés JSON).
**Storage**: SQLite local (fichier `/data/lamutuelleseniors.db` monté en volume Docker). Sufficient pour 50–200 leads/jour avec marge ×3 sur pic (cf. spec FR-029). Migrations versionnées via fichiers SQL idempotents.
**Testing**: Vitest 2 (unit + intégration côté serveur), Playwright 1 (e2e du tunnel sur Chromium + WebKit mobile, audit accessibilité via `@axe-core/playwright`), `lighthouse-ci` (SEO + perf en CI).
**Target Platform**: Conteneur Docker Linux (cf. `INFRA.md`), exposé en HTTP interne sur port 3000, fronté par Nginx Proxy Manager partagé sur l'hôte `mail` (146.59.231.199). Production = `lamutuelleseniors.fr` derrière Let's Encrypt via NPM. Réseau Docker `proxy-net` partagé avec NPM (fix durable du piège 502 documenté dans INFRA.md).
**Project Type**: Web application (Next.js full-stack, frontend + API routes dans le même build).
**Performance Goals**: Core Web Vitals « Good » sur mobile (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1) ; livraison du lead à la plateforme externe sous 60 s (SC-004) ; 200 leads/jour soutenu, pic ×3.
**Constraints**:
- WCAG 2.1 AA, score Lighthouse SEO ≥ 95 et A11y ≥ 90.
- 0 dépôt de cookie non strictement nécessaire avant consentement (CNIL).
- 0 transmission lead sans consentement explicite enregistré (RGPD).
- Le client de livraison de leads doit être abstrait derrière une interface ; mode mock par défaut tant que la spec API n'est pas livrée par le métier.
- Aucun secret en clair dans le repo : tout via variables d'environnement (`.env.local` en dev, env Compose en prod).
- Image Docker non-root (`user: "1001:1001"` comme convention INFRA), healthcheck `/api/health`.
**Scale/Scope**: 50–200 leads/jour à 6 mois, ~10 pages indexables initiales (home, 7 landing pages mots-clés primaires, 3 légales, 1 confirmation hors-index), tunnel à 5–7 écrans mobile-first.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

La constitution du projet (`.specify/memory/constitution.md`) n'est pas ratifiée — elle contient encore le template par défaut. En l'absence de principes explicites, on applique les principes Spec Kit par défaut :

| Principe par défaut | Conformité du plan | Note |
|---|---|---|
| Simplicité (YAGNI) | ✅ | Stockage SQLite mono-fichier ; pas de microservice ; client lead abstrait minimal ; pas d'admin UI en v1 |
| Testabilité | ✅ | Vitest unit/integ + Playwright e2e + lighthouse-ci ; client lead remplaçable par un mock dans les tests |
| Observabilité | ✅ | Logs JSON structurés via pino ; events table SQLite (start_funnel, submit, delivery_ok/ko) pour analyse interne ; healthcheck endpoint |
| Test-First | ⚠️ | Les contrats (FR-006 client lead, FR-028 routage campagne, FR-004 validation) sont définis comme contracts en Phase 1 et seront couverts par tests **avant** implémentation des routes API. Les composants UI seront testés par e2e Playwright |
| Sécurité par défaut | ✅ | Pas de secret commit ; rate-limit ; honeypot ; consentement bloquant ; image non-root ; HTTPS via NPM |

**Verdict** : aucun écart matériel à justifier. Constitution Tracking section laissée vide.

**Re-check post Phase 1** : à effectuer en bas du document après création de research/data-model/contracts/quickstart.

## Project Structure

### Documentation (this feature)

```text
specs/001-lead-funnel-seniors/
├── plan.md                # This file
├── research.md            # Phase 0 — choix techniques argumentés
├── data-model.md          # Phase 1 — entités, tables SQLite, transitions
├── quickstart.md          # Phase 1 — bring-up local + déploiement
├── contracts/
│   ├── lead-delivery.contract.md       # Contrat du client externe (à compléter par le métier)
│   ├── api-routes.contract.md          # Contrats des routes Next.js internes (/api/lead, /api/health, /api/retry)
│   └── consent-record.contract.md      # Format de l'enregistrement de consentement
├── checklists/
│   └── requirements.md    # Existant — qualité de la spec
└── tasks.md               # Phase 2 — produit par /speckit-tasks (PAS créé ici)
```

### Source Code (repository root)

Le code applicatif vit dans le repo `lamutuelleseniors` (la spec et les artefacts speckit y vivent aussi). On reprend la convention du projet de référence `contact-mutuelle` (Next.js App Router avec `app/` à la racine et `src/` pour les modules réutilisables) — sans le mélange spécifique au domaine contact/mutuelle santé existant qui sera intégralement remplacé.

```text
/home/jyblonde/lamutuelleseniors/
├── app/                                    # Next.js App Router (UI + routes API)
│   ├── layout.tsx                          # Layout racine, fonts (Geist), Header, Footer, Cookie banner
│   ├── page.tsx                            # Home — pitch + CTA tunnel + trust signals
│   ├── globals.css
│   ├── tunnel/                             # Le tunnel multi-étapes (P1)
│   │   ├── page.tsx                        # Routeur des étapes côté client
│   │   ├── etape/[step]/page.tsx           # Pages SSR optionnelles par étape (SEO + reprise)
│   │   └── confirmation/page.tsx           # Écran post-soumission (noindex)
│   ├── mutuelle-senior/page.tsx            # Landing page mot-clé primaire #1 (FR-025)
│   ├── mutuelle-sante/page.tsx             # Landing page mot-clé primaire #2
│   ├── comparatif-mutuelle-senior/page.tsx # Landing page mot-clé primaire #3
│   ├── comparatif-mutuelle-sante/page.tsx  # Landing page mot-clé primaire #4
│   ├── meilleure-mutuelle-senior/page.tsx  # Landing page mot-clé primaire #5
│   ├── devis-mutuelle-senior/page.tsx      # Landing page mot-clé primaire #6
│   ├── mutuelle-sante-retraite/page.tsx    # Landing page mot-clé primaire #7
│   ├── conditions-generales/page.tsx       # CGU (refonte à partir de zéro, FR-008)
│   ├── politique-de-confidentialite/page.tsx
│   ├── mentions-legales/page.tsx
│   ├── api/
│   │   ├── health/route.ts                 # GET /api/health → {status:"ok"}
│   │   ├── lead/route.ts                   # POST /api/lead — réception finale
│   │   ├── lead/retry/route.ts             # POST /api/lead/retry — déclenche un cycle de retry (cron interne)
│   │   └── consent/route.ts                # POST /api/consent — événements de bandeau cookie
│   ├── robots.ts                           # Génère robots.txt
│   └── sitemap.ts                          # Génère sitemap.xml dynamiquement
├── src/
│   ├── components/
│   │   ├── layout/                         # Header, Footer, CookieBanner
│   │   ├── tunnel/                         # FunnelLayout, ProgressBar, StepCard, BackButton, FieldGroup, NavButtons
│   │   ├── tunnel/steps/                   # 1 fichier par étape (Step01Naissance, Step02CodePostal, …)
│   │   ├── seo/                            # SEO, JsonLd (Organization/WebSite/FAQ/Breadcrumb/Article)
│   │   └── ui/                             # Button, Input, Select, Checkbox — taille senior par défaut
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts                   # Singleton better-sqlite3 + WAL
│   │   │   ├── migrations.ts               # Applique les fichiers .sql de migrations/ au boot
│   │   │   └── repositories/               # leadRepo.ts, consentRepo.ts, eventRepo.ts, deliveryAttemptRepo.ts
│   │   ├── lead-delivery/
│   │   │   ├── LeadDeliveryClient.ts       # Interface
│   │   │   ├── MockLeadDeliveryClient.ts   # Implémentation interim (logs + persiste)
│   │   │   ├── HttpLeadDeliveryClient.ts   # Stub à compléter quand la spec arrive
│   │   │   └── factory.ts                  # Selon LEAD_DELIVERY_MODE=env
│   │   ├── campaign/
│   │   │   └── resolveCampaign.ts          # Implémente FR-028
│   │   ├── consent/
│   │   │   ├── recordConsent.ts            # Crée un Consent record (versionné)
│   │   │   └── legalDocs.ts                # Versions courantes des CGU/PdC publiées
│   │   ├── validation/
│   │   │   ├── leadSchema.ts               # zod — règles FR-002, FR-004
│   │   │   └── postalCode.ts               # 01–95 + 97x ; refus 98x et hors France
│   │   ├── retry/
│   │   │   ├── retryWorker.ts              # Boucle setInterval déclenchée par /api/lead/retry ou cron
│   │   │   └── backoff.ts                  # Backoff exponentiel + jitter
│   │   ├── antibot/
│   │   │   ├── rateLimit.ts                # Token-bucket en mémoire par IP
│   │   │   └── honeypot.ts                 # Champs leurre + délai minimum
│   │   ├── notifications/
│   │   │   └── emailNotifier.ts            # nodemailer — wrapper, désactivable par env
│   │   ├── analytics/
│   │   │   └── plausible.ts                # Envoi des events (pas de cookies)
│   │   └── logging/
│   │       └── logger.ts                   # pino → stdout JSON
│   ├── config/
│   │   ├── site.ts                         # Identité de marque (placeholders à remplir par le métier)
│   │   ├── tunnel.ts                       # Définition déclarative des étapes et conditions
│   │   ├── seo.ts                          # Mots-clés primaires/secondaires/longue traîne (cf. FR-020)
│   │   └── courtiers.ts                    # Liste configurable des destinataires courtiers (FR-017)
│   ├── content/
│   │   ├── legal/cgu-v1.md                 # Contenu source des CGU (refonte propre)
│   │   ├── legal/pdc-v1.md                 # Politique de confidentialité v1
│   │   └── landing/                        # Markdown sources des landing pages
│   └── types/
│       ├── lead.ts
│       ├── consent.ts
│       └── campaign.ts
├── public/
│   ├── images/                             # Images marque (placeholders au démarrage)
│   ├── favicon.ico
│   └── robots.txt                          # généré par app/robots.ts
├── migrations/
│   ├── 0001_init.sql                       # Tables leads, consents, legal_documents, delivery_attempts, events
│   └── 0002_add_campaign.sql               # Ajout colonne campaign_id (Q2 clarif)
├── tests/
│   ├── unit/                               # Vitest — schémas zod, resolveCampaign, postalCode, backoff, antibot
│   ├── integration/                        # Vitest — repositories sur DB éphémère, retry worker, mock lead client
│   └── e2e/                                # Playwright — tunnel mobile, accessibilité, refus consentement, doublon
├── Dockerfile                              # Build multi-stage (cf. INFRA.md), user 1001:1001, runtime node:20-alpine
├── docker-compose.yml                      # Service unique, volume /data, port 3001:3000, réseaux default + proxy-net
├── next.config.ts                          # output: 'standalone', headers de sécurité, redirections
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── playwright.config.ts
├── vitest.config.ts
├── .env.example                            # Variables documentées (sans valeurs réelles)
└── .gitignore                              # Exclut .env.local, /data, .next, node_modules
```

**Structure Decision**: Application Next.js mono-repo en App Router, frontend + API routes dans le même build (pas de séparation backend/frontend). Le code applicatif est directement à la racine du repo (à côté des artefacts `specs/`, `.specify/`, etc.). Les répertoires `app/`, `src/`, `migrations/`, `tests/`, `public/` n'existent pas encore — leur création fera partie des tâches `/speckit-tasks`. La convention reprend exactement celle de `/home/jyblonde/contact-mutuelle` (qui sert de référence éprouvée sur la même infra), avec une exception : la persistance et le retry sont nouveaux (contact-mutuelle ne stocke pas localement).

## Complexity Tracking

> Aucune violation de la Constitution Check ne nécessite de justification. Section laissée vide intentionnellement.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(aucune)_ | _—_ | _—_ |

## Post Phase-1 Constitution Re-check

À ré-évaluer une fois `research.md`, `data-model.md`, `contracts/` et `quickstart.md` produits ci-dessous. Tant que le verdict initial tient, la commande peut s'arrêter et passer le relai à `/speckit-tasks`.

| Principe | Statut post-design | Note |
|---|---|---|
| Simplicité | ✅ | data-model.md confirme 5 tables SQLite sans dépendance externe ; contrats minimaux |
| Testabilité | ✅ | contracts/api-routes.contract.md + lead-delivery.contract.md → testables avant impl |
| Observabilité | ✅ | events table + logger pino + healthcheck |
| Test-First | ✅ | tasks à venir devront ouvrir par les tests des contrats |
| Sécurité | ✅ | consent-record.contract.md fixe la traçabilité ; antibot dans `src/lib/antibot/` |
