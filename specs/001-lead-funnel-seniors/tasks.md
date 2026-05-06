---
description: "Task list for feature 001-lead-funnel-seniors"
---

# Tasks: Tunnel de génération de leads — Mutuelle Seniors

**Input**: Design documents from `/specs/001-lead-funnel-seniors/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are **included** in this plan. Plan §R-14 explicitly mandates Vitest unit/integration + Playwright e2e + Lighthouse-CI gates, and the contracts under `contracts/` enumerate the minimal test set per route. Test tasks are marked under each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- All file paths are relative to repo root `/home/jyblonde/lamutuelleseniors/`

## Path Conventions

- **Web app (Next.js mono-repo)**: `app/`, `src/`, `migrations/`, `tests/`, `public/` at repository root.
- See `plan.md` §Project Structure for the canonical tree.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and toolchain.

- [X] T001 Create base directory tree at repo root: `app/`, `src/{components,lib,config,content,types}/`, `migrations/`, `tests/{unit,integration,e2e}/`, `public/{images,partners}/` per `plan.md` §Project Structure
- [X] T002 Initialize Node project: write `package.json` with Next.js 15, React 19, TypeScript 5, Tailwind v4, zod 4, react-hook-form 7, framer-motion 11, better-sqlite3 11, nodemailer 7, nanoid, pino — and dev deps Vitest 2, Playwright 1, @axe-core/playwright, lighthouse-ci, ESLint 9, Prettier; commit `package-lock.json`
- [X] T003 [P] Configure TypeScript in `tsconfig.json` (strict, paths `@/*` → `src/*`, target ES2022, `moduleResolution: bundler`)
- [X] T004 [P] Configure ESLint in `eslint.config.mjs` (extends `next/core-web-vitals`, `next/typescript`, Prettier compat) and Prettier in `.prettierrc.json`
- [X] T005 [P] Configure Tailwind v4 in `app/globals.css` and `postcss.config.mjs`: senior-first defaults — base font 18px, line-height 1.6, palette placeholder driven by `src/config/site.ts`, focus-visible ring AA contrast, plugin `@tailwindcss/forms`
- [X] T006 [P] Configure Next.js in `next.config.ts`: `output: 'standalone'`, security headers (CSP, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy minimal), `images.remotePatterns: []`
- [X] T007 [P] Configure Vitest in `vitest.config.ts` (environment node, alias `@/*` → `src/*`, `setupFiles: ['tests/setup.ts']`)
- [X] T008 [P] Configure Playwright in `playwright.config.ts` (projects: chromium-desktop, mobile-chrome iPhone-14, mobile-safari, tablet iPad-mini ; baseURL `http://localhost:3000`)
- [X] T009 [P] Add `lighthouse-ci` config `lighthouserc.json` (gates: SEO ≥ 95, A11y ≥ 90, Performance ≥ 80) targeting home + 7 landings
- [X] T010 [P] Create `Dockerfile` (multi-stage `node:20-alpine`, `user 1001:1001`, copy `.next/standalone`, expose 3000, healthcheck `/api/health`) per `INFRA.md` §Convention Compose
- [X] T011 [P] Create `docker-compose.yml`: service `lamutuelleseniors`, container `lamutuelleseniors`, port `3007:3000`, volume `./data:/data`, `networks: [default, proxy-net]` with `proxy-net: external: true` (fix 502 durable per INFRA.md)
- [X] T012 [P] Create `.dockerignore` excluding `node_modules`, `.next`, `tests/`, `specs/`, `.git`, `.env*`
- [X] T013 [P] Create `.gitignore` for Next.js: `node_modules/`, `.next/`, `.env*` (except `.env.example`), `.data/`, `coverage/`, `playwright-report/`, `test-results/`
- [X] T014 [P] Create `.env.example` documenting all env vars from `research.md` §Synthèse with empty/placeholder values, plus header comment "DO NOT commit a real .env"
- [X] T015 [P] Create `.nvmrc` pinning Node 20.x
- [X] T016 [P] Create `src/config/site.ts` exporting `siteConfig` with brand placeholders (`siteName: 'TODO_BRAND_NAME'`, `legalEntity: 'TODO_LEGAL_ENTITY'`, `legalAddress`, `phone`, `email`, `dpoEmail`, `colorPrimary`, `colorSecondary`, `logoPath: '/images/logo-placeholder.svg'`) sourced from env when present
- [X] T017 [P] Create `public/images/logo-placeholder.svg` (neutral SVG mark) and `public/favicon.ico` placeholder
- [X] T018 Add npm scripts in `package.json`: `dev`, `build`, `start`, `lint`, `format`, `db:migrate`, `test`, `test:watch`, `test:e2e`, `test:lighthouse`, `test:a11y`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, logging, layout shell and contract scaffolding required by every user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T019 Create `src/lib/db/client.ts`: `better-sqlite3` singleton, WAL mode, busy timeout 5 s, reads `DATABASE_PATH` env (default `./.data/lamutuelleseniors.db`), creates parent dir if missing
- [X] T020 Create `src/lib/db/migrations.ts`: idempotent runner — reads files from `migrations/*.sql` lexicographic order, tracks applied in `_migrations(name TEXT UNIQUE, applied_at TEXT)`, runs at boot (called from `src/lib/db/client.ts` lazy init)
- [X] T021 Create `migrations/0001_init.sql` with the 5 tables (`legal_documents`, `consents`, `leads`, `delivery_attempts`, `events`) + all CHECK constraints + all indexes per `data-model.md`
- [X] T022 Create initial legal markdown placeholders: `src/content/legal/cgu-v1.md` and `src/content/legal/pdc-v1.md` and `src/content/legal/mentions-v1.md` (minimal stub content — real content lands in US4)
- [X] T023 Create `migrations/seed-legal.ts` (Node script): hashes the three markdown files (SHA-256) and emits `migrations/0002_seed_legal_documents.sql` inserting `(cgu,1.0)`, `(pdc,1.0)`, `(mentions,1.0)` with `status='published'` and the computed `body_hash`
- [X] T024 Wire `db:migrate` script: runs `seed-legal.ts` then applies pending migrations
- [X] T025 [P] Create `src/lib/logging/logger.ts`: pino logger writing JSON to stdout, base context `{ app: 'lamutuelleseniors' }`, helper `redactPii(s)` for emails/phones (keeps first 3 chars + `***`)
- [X] T026 [P] Create `src/types/{lead,consent,campaign}.ts` mirroring the entities and the `LeadDeliveryPayload` / `DeliveryResult` types from `contracts/lead-delivery.contract.md`
- [X] T027 Create `src/lib/db/repositories/legalDocRepo.ts` (read currently-published doc by kind, lookup by id)
- [X] T028 [P] Create `src/lib/db/repositories/eventRepo.ts` (insert event with optional metadata)
- [X] T029 [P] Create `src/lib/db/repositories/leadRepo.ts` (insert with `campaign_id`, find by dedup key, update `delivery_status`)
- [X] T030 [P] Create `src/lib/db/repositories/consentRepo.ts` (insert; throws on `purpose_courtier_transmission != 1`)
- [X] T031 [P] Create `src/lib/db/repositories/deliveryAttemptRepo.ts` (insert pending, claim retry batch, update outcome)
- [X] T032 Create `app/api/health/route.ts`: GET handler responding per `contracts/api-routes.contract.md` §1
- [X] T033 Create `app/layout.tsx`: root layout with Geist font (`next/font`), html `lang="fr"`, viewport meta, base metadata (title template + suffix from `siteConfig.siteName`), Plausible script slot (rendered conditionally based on cookie consent — completed in US5)
- [X] T034 [P] Create `src/components/layout/Header.tsx` (logo, simple nav: Accueil, Mutuelle senior, FAQ, Contact)
- [X] T035 [P] Create `src/components/layout/Footer.tsx` with placeholder legal links (real targets land in US4) and copyright from `siteConfig`
- [X] T036 [P] Create `src/components/ui/{Button,Input,Select,Checkbox,FieldGroup}.tsx`: senior-first defaults — min height 48px, focus-visible AA ring, error state via aria-invalid + aria-describedby
- [X] T037 Configure `tests/setup.ts`: configures Vitest globals, swaps `DATABASE_PATH` to `:memory:` for unit/integration runs, exposes `withFreshDb()` helper

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Captation d'un lead complet et transmission au courtier (Priority: P1) 🎯 MVP

**Goal**: Tunnel multi-étapes minimal qui collecte les 4 champs obligatoires + consentement, calcule la campagne (FR-028), persiste lead + consentement + delivery_attempt en transaction, livre via le `MockLeadDeliveryClient` et notifie l'opérateur. Visiteur arrive sur `/`, démarre le tunnel, voit la confirmation à la fin.

**Independent Test**: parcours en navigation privée jusqu'à la page `/tunnel/confirmation`, puis vérifier (a) ligne dans `leads` avec `delivery_status='delivered_mock'`, (b) ligne dans `consents` liée, (c) entrée `delivery_attempts` `status='success'`, (d) email reçu sur `MAIL_TO`. Couvre les Acceptance Scenarios 1-3 de la spec US1 et la livraison réelle (mode mock).

### Tests for User Story 1 (write FIRST, ensure FAIL before implementation) ⚠️

- [X] T038 [P] [US1] Unit test `tests/unit/postalCode.test.ts` — accept 01000–95999 and 97xxx; reject 98xxx, 5+ digits, non-numeric (T-LEAD-4, T-LEAD-5)
- [X] T039 [P] [US1] Unit test `tests/unit/resolveCampaign.test.ts` — covers FR-028 routing (T-LEAD-1, T-LEAD-2, T-LEAD-3)
- [X] T040 [P] [US1] Unit test `tests/unit/leadSchema.test.ts` — zod accepts happy path, rejects invalid name/dob/phone/email, requires consent.courtier_transmission=true (T-CONSENT-1)
- [X] T041 [P] [US1] Unit test `tests/unit/backoff.test.ts` — exponential schedule 1m / 5m / 15m / 1h / 6h / 24h with jitter ≤ ±15%
- [X] T042 [P] [US1] Unit test `tests/unit/antibot.test.ts` — honeypot rejects, time-on-form < 4s rejects, rate-limit IP after 10/h returns 429 (T-LEAD-8, T-LEAD-10)
- [X] T043 [P] [US1] Integration test `tests/integration/leadDeliveryClient.test.ts` — `MockLeadDeliveryClient.deliver()` returns `success/mock`; `FakeLeadDeliveryClient` sequence converts to attempts (T-DELIVERY-MOCK-1, T-DELIVERY-FAKE-1, T-DELIVERY-FAKE-2, T-DELIVERY-PORT-1)
- [X] T044 [P] [US1] Integration test `tests/integration/api-lead.test.ts` — covers all rows of `contracts/api-routes.contract.md` §2 (T-LEAD-1 through T-LEAD-10)
- [X] T045 [P] [US1] Integration test `tests/integration/api-lead-retry.test.ts` — auth, eligible rows, dead_letter after 6 attempts (T-RETRY-1, T-RETRY-2, T-RETRY-3)
- [X] T046 [P] [US1] Integration test `tests/integration/consentRecord.test.ts` — body_hash matches published doc, immutability after new version published (T-CONSENT-3, T-CONSENT-4, T-CONSENT-5, T-CONSENT-6)
- [X] T047 [P] [US1] E2E `tests/e2e/tunnel-happy-path.spec.ts` — Playwright on iPhone 14: complete tunnel for 65-year-old, confirm `/tunnel/confirmation` reached and lead row exists in DB

### Implementation for User Story 1

- [X] T048 [P] [US1] Create `src/lib/validation/postalCode.ts` exporting regex + helper `isAcceptedPostalCode(cp)` for FR-004
- [X] T049 [P] [US1] Create `src/lib/campaign/resolveCampaign.ts` implementing FR-028 (input: age, conjoint_present, enfants_count → `'senior'|'under55_family'|'under55_solo'`)
- [X] T050 [P] [US1] Create `src/lib/validation/leadSchema.ts` (zod) — uses `postalCode.ts`, conditional refinement: `age < 55 ⇒ conjoint_present !== undefined && enfants_dates_naissance !== undefined`
- [X] T051 [P] [US1] Create `src/lib/retry/backoff.ts` — pure function `nextRetryAt(attempt_no, now): Date | null` (null beyond 6)
- [X] T052 [P] [US1] Create `src/lib/antibot/honeypot.ts` (constant honeypot field name; helper `isHoneypotTriggered(body)`) and `src/lib/antibot/rateLimit.ts` (in-memory token-bucket per IP, configurable via `RATE_LIMIT_SUBMISSIONS_PER_HOUR`)
- [X] T053 [P] [US1] Create `src/lib/lead-delivery/LeadDeliveryClient.ts` (interface) per `contracts/lead-delivery.contract.md`
- [X] T054 [US1] Create `src/lib/lead-delivery/MockLeadDeliveryClient.ts` (logs + returns success/mock); `src/lib/lead-delivery/HttpLeadDeliveryClient.ts` (constructor throws "not configured — pending external spec"); `src/lib/lead-delivery/factory.ts` (selects via `LEAD_DELIVERY_MODE`)
- [X] T055 [US1] Create `src/lib/lead-delivery/FakeLeadDeliveryClient.ts` in `tests/_helpers/` (or guarded by NODE_ENV=test) for integration tests — configurable result queue
- [X] T056 [P] [US1] Create `src/lib/consent/legalDocs.ts` — reads currently published CGU/PdC versions and hashes from `legalDocRepo`
- [X] T057 [US1] Create `src/lib/consent/recordConsent.ts` — composes a `consents` row inside the calling transaction (refuses if `purpose_courtier_transmission !== true`)
- [X] T058 [P] [US1] Create `src/lib/notifications/emailNotifier.ts` — nodemailer wrapper, `notifyNewLead(lead)` and `notifyDeadLetter(lead)`, no-op when `MAIL_NOTIFY=false`
- [X] T059 [US1] Create `src/lib/retry/retryWorker.ts` — exports `runRetryCycle(limit)` and a `setInterval` boot helper (scheduled from `app/layout.tsx` server component effect or a startup file)
- [X] T060 [US1] Create `app/api/lead/route.ts` — POST handler implementing `contracts/api-routes.contract.md` §2 in a single SQLite transaction (lead → consent → delivery_attempt → event), then best-effort delivery + email notification outside the transaction
- [X] T061 [US1] Create `app/api/lead/retry/route.ts` — POST handler protected by `X-Cron-Token` per `contracts/api-routes.contract.md` §3, delegating to `runRetryCycle`
- [X] T062 [P] [US1] Create `src/components/tunnel/FunnelLayout.tsx` (page chrome with progress bar slot), `src/components/tunnel/ProgressBar.tsx`, `src/components/tunnel/NavButtons.tsx` (Continuer / Retour with disabled states)
- [X] T063 [P] [US1] Create `src/components/tunnel/useTunnelState.ts` — react hook persisting RHF state to `localStorage` key `lms.tunnel.draft.v1` (FR-011) + `tunnel_started_at_ms`
- [X] T064 [P] [US1] Create `src/components/tunnel/steps/Step01Naissance.tsx` (date_naissance picker)
- [X] T065 [P] [US1] Create `src/components/tunnel/steps/Step02CodePostal.tsx` (CP input + accepted-zone helper text)
- [X] T066 [P] [US1] Create `src/components/tunnel/steps/Step03Identite.tsx` (nom + prénom)
- [X] T067 [P] [US1] Create `src/components/tunnel/steps/Step04ConjointEnfants.tsx` — questions composition familiale, **conditionally required** if `age < 55` (drives FR-028)
- [X] T068 [P] [US1] Create `src/components/tunnel/steps/Step05Consent.tsx` — two distinct checkboxes per `contracts/consent-record.contract.md`, courtier consent gate, links to legal pages
- [X] T069 [US1] Create `app/tunnel/page.tsx` — orchestrator that drives the steps via `useTunnelState`, hidden honeypot field `hp_zip`, submits to `/api/lead`
- [X] T070 [US1] Create `app/tunnel/confirmation/page.tsx` — confirmation screen, `metadata.robots = 'noindex'`, clears `localStorage` draft on mount
- [X] T071 [US1] Create `app/page.tsx` (home) — hero with primary CTA towards `/tunnel`, three trust signals (sécurisé, gratuit, sans engagement), placeholder copy that does not reference Contact Mutuelle (SC-009)

**Checkpoint**: User Story 1 fully functional. The site can be deployed and start collecting leads (in mock mode). MVP shippable.

---

## Phase 4: User Story 4 — Documents légaux conformes (Priority: P2)

**Goal**: Publier des CGU et une Politique de confidentialité spécifiques au modèle de revente de leads, accessibles en permanence depuis le footer ; tout consentement référence la version réellement publiée (cf. `contracts/consent-record.contract.md`). Replace l'inertie de la phase 2 (placeholders) par du contenu validé.

**Independent Test**: ouvrir `/conditions-generales` et `/politique-de-confidentialite`, vérifier que (a) le contenu mentionne explicitement la transmission à des courtiers en assurance, (b) un nouveau lead créé après publication enregistre les `cgu_version`/`pdc_version` correctes (US4 AS2), (c) aucune référence textuelle à « Contact Mutuelle » n'apparaît (SC-009).

### Tests for User Story 4 ⚠️

- [X] T072 [P] [US4] E2E `tests/e2e/legal-pages.spec.ts` — visit each legal page from footer, verify h1 + canonical + no occurrence of "Contact Mutuelle" string (SC-009)
- [X] T073 [P] [US4] Integration `tests/integration/legalDocs.test.ts` — `legalDocs.getPublished('cgu')` returns row whose `body_hash` matches SHA-256 of `cgu-v1.md`

### Implementation for User Story 4

- [X] T074 [P] [US4] Replace placeholder content of `src/content/legal/cgu-v1.md` — full CGU rewrite covering: lead resale model, courtier list category, prix gratuit visiteur, durée d'engagement, données collectées, refus de service si refus de consentement, droit applicable
- [X] T075 [P] [US4] Replace placeholder content of `src/content/legal/pdc-v1.md` — full PdC rewrite per RGPD/CNIL guidance for lead resale: responsable de traitement (`siteConfig.legalEntity`), finalités (constitution dossier + transmission courtiers + amélioration service), bases légales (consentement art. 6.1.a), destinataires (catégorie « courtiers en assurance partenaires »), durée 5 ans (preuve), droits, contact DPO `siteConfig.dpoEmail`, CNIL
- [X] T076 [P] [US4] Write `src/content/legal/mentions-v1.md` — éditeur, hébergeur (OVH-host info per INFRA.md), directeur de publication
- [X] T077 [US4] Re-run `npm run db:migrate` so `seed-legal.ts` recomputes hashes; bump migration to `migrations/0002b_relink_legal_v1.sql` if needed (or keep idempotent insert with hash refresh)
- [X] T078 [P] [US4] Create `src/components/content/LegalDocument.tsx` — render markdown with safe HTML (use `marked` or react-markdown, sanitize), handles headings/lists/links
- [X] T079 [P] [US4] Create `app/conditions-generales/page.tsx` — loads `cgu-v1.md` content, sets `metadata.title = "Conditions Générales d'Utilisation - {siteName}"`, canonical `/conditions-generales`
- [X] T080 [P] [US4] Create `app/politique-de-confidentialite/page.tsx` — equivalent for PdC
- [X] T081 [P] [US4] Create `app/mentions-legales/page.tsx`
- [X] T082 [US4] Update `src/components/layout/Footer.tsx` to wire real links (`/conditions-generales`, `/politique-de-confidentialite`, `/mentions-legales`) and remove any placeholder copy referencing the source codebase
- [X] T083 [US4] Update `src/components/tunnel/steps/Step05Consent.tsx` to display the live `cgu_version` / `pdc_version` from `legalDocs.getPublished()` and link to the legal pages

**Checkpoint**: Legal pages live, consent traceability intact, SC-009 verified.

---

## Phase 5: User Story 2 — UX fluide, accessible, senior-friendly (Priority: P2)

**Goal**: Polir le tunnel issu de US1 pour atteindre les critères SC-006 (Lighthouse a11y ≥ 90, 0 violation WCAG 2.1 AA), SC-007 (rebond mobile < 50 %), SC-008 (panel ≥ 55 ans note « facile » à ≥ 85 %). Animations framer-motion respectant `prefers-reduced-motion`, cibles tactiles ≥ 44 px, hiérarchie typographique senior, ProgressBar visible (FR-010), retour-arrière sans perte (FR-011).

**Independent Test**: lancer Playwright avec `@axe-core/playwright` sur les 5 étapes du tunnel + le formulaire de Step05Consent → 0 violation bloquante WCAG 2.1 AA, score Lighthouse a11y ≥ 90 sur la home et `/tunnel`. Test manuel : avancer de 3 étapes, cliquer Retour, vérifier que les saisies sont préservées.

### Tests for User Story 2 ⚠️

- [X] T084 [P] [US2] E2E `tests/e2e/tunnel-a11y.spec.ts` — runs `@axe-core/playwright` on `/`, `/tunnel`, each `/tunnel/etape/[step]` and confirms 0 violation of impact `serious`/`critical` (US2 AS3)
- [X] T085 [P] [US2] E2E `tests/e2e/tunnel-back-navigation.spec.ts` — fill 3 steps, click Retour, assert previous values still populated (US2 AS2)
- [X] T086 [P] [US2] E2E `tests/e2e/tunnel-reduced-motion.spec.ts` — set Playwright `prefers-reduced-motion: reduce`, ensure transitions are still visually consistent and complete

### Implementation for User Story 2

- [X] T087 [P] [US2] Add framer-motion transitions in `src/components/tunnel/StepCard.tsx` (slide+fade, ≤ 250 ms, gates on `useReducedMotion()` from framer-motion)
- [X] T088 [P] [US2] Refine `src/components/tunnel/ProgressBar.tsx` — animated fill, jalons numérotés, `aria-valuenow/min/max` correct
- [X] T089 [P] [US2] Refine `src/components/ui/Button.tsx` and `Input.tsx` — min-height 48px, font-size 18px, contrast AA verified, focus ring 2px AA blue
- [X] T090 [P] [US2] Add `src/components/layout/SkipLink.tsx` (skip-to-main) and integrate in `app/layout.tsx`
- [X] T091 [US2] Update `src/components/tunnel/useTunnelState.ts` to expose `goBack()` that does NOT reset RHF `defaultValues` of previous steps (FR-011)
- [X] T092 [US2] Add visible step counter ("Étape 3 sur 5") next to progress bar
- [X] T093 [US2] Optional `app/tunnel/etape/[step]/page.tsx` route with SSR step rendering — improves direct shareability and back-button browser behavior; falls back to client-side state hydrated from `localStorage`
- [X] T094 [US2] Audit and fix any contrast/touch-target issues surfaced by T084 to bring Lighthouse a11y ≥ 90

**Checkpoint**: Tunnel UX-quality validated. SC-006 met.

---

## Phase 6: User Story 5 — Référencement naturel (Priority: P2)

**Goal**: Mettre en place le socle SEO technique (sitemap, robots, JSON-LD, metadata complete, Core Web Vitals « Good ») et publier les 7 pages d'atterrissage par mot-clé primaire (FR-020, FR-025). Configure analytics RGPD-compatibles (Plausible) + bandeau cookie CNIL (FR-026). Atteindre score Lighthouse SEO ≥ 95 (SC-011).

**Independent Test**: `curl /sitemap.xml` liste les 8 pages indexables ; `curl /robots.txt` exclut `/api/*` et `/tunnel/confirmation` ; chaque landing primaire renvoie un titre unique, une meta description, un H1 cohérent, du JSON-LD valide ; lighthouse-ci passe les seuils (SEO ≥ 95, Perf ≥ 80, A11y ≥ 90) sur les 8 pages.

### Tests for User Story 5 ⚠️

- [X] T095 [P] [US5] E2E `tests/e2e/seo-metadata.spec.ts` — for each indexable URL: `<title>` ≤ 60 c, meta description ≤ 160 c, exactly one canonical link tag, exactly one `<h1>`, OG and Twitter Card tags present (FR-021)
- [X] T096 [P] [US5] Integration `tests/integration/sitemap.test.ts` — `app/sitemap.ts` output contains all primary landings + home + legal pages, excludes `/tunnel/confirmation` and `/api/*`
- [X] T097 [P] [US5] Integration `tests/integration/robots.test.ts` — `app/robots.ts` output disallows `/api/*` and `/tunnel/confirmation`, allows other paths
- [X] T098 [P] [US5] Integration `tests/integration/json-ld.test.ts` — root layout emits a valid `Organization` JSON-LD (no parse error, required fields populated from `siteConfig`)
- [X] T099 [US5] CI step `npm run test:lighthouse` — gates Performance ≥ 80, Accessibility ≥ 90, SEO ≥ 95 on home + 7 landings (SC-011)

### Implementation for User Story 5

- [X] T100 [P] [US5] Create `src/config/seo.ts` exporting the keyword clusters (primary / secondary / long-tail) listed in spec FR-020 and the array `primaryLandings` mapping slug → keyword + meta + h1 + content brief
- [X] T101 [P] [US5] Create `src/components/seo/JsonLd.tsx` with helpers `<OrganizationJsonLd>`, `<WebSiteJsonLd>` (with SearchAction), `<BreadcrumbListJsonLd>`, `<FAQPageJsonLd>`, `<ArticleJsonLd>` — pure components rendering `<script type="application/ld+json">` (FR-023)
- [X] T102 [US5] Mount `<OrganizationJsonLd>` and `<WebSiteJsonLd>` in `app/layout.tsx`
- [X] T103 [P] [US5] Create `app/sitemap.ts` — Next.js native `MetadataRoute.Sitemap` listing home, 7 landings, 3 legal pages with `lastModified` and `changeFrequency` (FR-022)
- [X] T104 [P] [US5] Create `app/robots.ts` — `MetadataRoute.Robots` allowing `/`, disallowing `/api/`, `/tunnel/confirmation` (FR-022)
- [X] T105 [P] [US5] Create `app/mutuelle-senior/page.tsx` — landing for primary keyword "mutuelle senior": ≥ 600 mots, h1 + 3 h2, FAQ section, CTA towards `/tunnel` with deep link prefilling postal code if available, `<BreadcrumbListJsonLd>` + `<FAQPageJsonLd>`
- [X] T106 [P] [US5] Create `app/mutuelle-sante/page.tsx` — landing for "mutuelle santé" (≥ 600 mots, same structure)
- [X] T107 [P] [US5] Create `app/comparatif-mutuelle-senior/page.tsx` — landing for "comparatif mutuelle senior" (mention partenaires courtiers comparés, sans logos protégés)
- [X] T108 [P] [US5] Create `app/comparatif-mutuelle-sante/page.tsx` — landing for "comparatif mutuelle santé"
- [X] T109 [P] [US5] Create `app/meilleure-mutuelle-senior/page.tsx` — landing for "meilleure mutuelle senior"
- [X] T110 [P] [US5] Create `app/devis-mutuelle-senior/page.tsx` — landing for "devis mutuelle senior" (CTA forte vers `/tunnel`)
- [X] T111 [P] [US5] Create `app/mutuelle-sante-retraite/page.tsx` — landing for "mutuelle santé retraité"
- [X] T112 [US5] Add internal linking block in each landing page (3 contextually-related landings) to fulfil FR-021 maillage requirement; add to `Footer.tsx` a "Nos guides" section
- [X] T113 [P] [US5] Create `src/lib/analytics/plausible.ts` — `<PlausibleScript domain={env.PLAUSIBLE_DOMAIN}>` component conditionally rendered after consent ; helper `track(event, props)` for `funnel_started`, `funnel_step_completed`, `lead_submitted` (FR-026)
- [X] T114 [US5] Create `src/components/layout/CookieBanner.tsx` — three-button banner (Tout accepter / Refuser / Personnaliser), persists choice to `localStorage` key `lms.cookies.consent.v1`, no cookie set; mount in `app/layout.tsx`
- [X] T115 [US5] Create `app/api/consent/route.ts` per `contracts/api-routes.contract.md` §4 — logs banner decisions to `events`
- [X] T116 [US5] Wire Plausible script and `track()` calls in tunnel components (only when banner choice grants analytics)
- [X] T117 [US5] Update `app/tunnel/page.tsx` to read URL params `?cp=` from landing CTAs and prefill the postal-code step (US5 AS3)

**Checkpoint**: SEO foundation in place, lighthouse-ci gates green, banner/analytics live.

---

## Phase 7: User Story 3 — Enrichissement par questions complémentaires (Priority: P3)

**Goal**: Ajouter au tunnel un bloc d'étapes facultatives (régime obligatoire, niveau de garantie souhaité, situation actuelle, date d'effet souhaitée, téléphone, email) — toutes optionnelles pour les ≥ 55 ans, conjoint/enfants déjà rendus conditionnellement obligatoires en US1 pour les < 55. Augmente la valeur du lead pour les courtiers acheteurs.

**Independent Test**: soumettre deux leads — l'un sans aucun champ optionnel, l'autre avec tous les champs optionnels remplis — et vérifier que les deux sont acceptés (200), persistés, livrés et que la notification email contient les champs supplémentaires (US3 AS2).

### Tests for User Story 3 ⚠️

- [X] T118 [P] [US3] Unit `tests/unit/leadSchema.enrichment.test.ts` — accepts all optional fields with valid format, rejects invalid `niveau_garantie` enum, accepts `null`/missing
- [X] T119 [P] [US3] E2E `tests/e2e/tunnel-enrichment.spec.ts` — fills all optional fields and asserts `lead_submitted` event payload includes them; second run skips them and still completes

### Implementation for User Story 3

- [X] T120 [P] [US3] Extend `src/lib/validation/leadSchema.ts` with optional `regime`, `niveau_garantie` enum, `situation_actuelle` enum, `date_effet_souhaitee`, `telephone`, `email`
- [X] T121 [P] [US3] Create `src/components/tunnel/steps/Step06Optional.tsx` (one consolidated step with collapsible sections, "Passer" link visible)
- [X] T122 [US3] Insert Step06 in `app/tunnel/page.tsx` orchestrator between Step04 and Step05Consent
- [X] T123 [US3] Update `src/lib/db/repositories/leadRepo.ts` insert to persist enrichment fields (already in schema from `migrations/0001_init.sql` — verify)
- [X] T124 [US3] Update `src/lib/notifications/emailNotifier.ts` text body to include enrichment fields when present
- [X] T125 [US3] Update `src/lib/lead-delivery/MockLeadDeliveryClient.ts` log to include `qualifications` block from the payload

**Checkpoint**: Enriched leads delivered to mock platform; richer notification emails.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, deployment, documentation that span all user stories.

- [X] T126 [P] Create `app/not-found.tsx` (404) and `app/error.tsx` (500) — branded, with a CTA back to `/` or `/tunnel`
- [ ] T127 [P] Add a global loading skeleton for tunnel transitions in `src/components/tunnel/StepSkeleton.tsx`
- [X] T128 [P] Tighten security headers in `next.config.ts` after measuring CSP impact (allow `https://plausible.io` script-src, no unsafe-inline)
- [X] T129 [P] Create `scripts/backup-db.sh` — `rsync` `.data/lamutuelleseniors.db` to `/home/jyblonde/data/backups/lamutuelleseniors-$(date).db`; add a cron entry note in `quickstart.md`
- [X] T130 [P] Author `README.md` at repo root with: dev quickstart, scripts, env vars, deploy summary linking to `INFRA.md` and `quickstart.md`
- [X] T131 [P] Final pass on `.env.example` — every var documented with allowed values + example
- [X] T132 Run `npm run lint`, `tsc --noEmit`, full `vitest`, full `playwright`, `lighthouse-ci` on the candidate build; fix any regression
- [X] T133 Run the manual smoke checklist from `quickstart.md` §3 against a local Docker compose build
- [ ] T134 Coordinate with the metier team to obtain final brand values (siteName, legalEntity, address, phone, email, dpoEmail, color palette, logo SVG); set the production `.env`
- [ ] T135 Coordinate DNS A record `lamutuelleseniors.fr` → `146.59.231.199` (and `www`); deploy via `docker compose up -d --build`; configure NPM proxy host + Let's Encrypt; verify HTTPS redirect, headers, and that `/api/health` returns 200 through the public domain
- [X] T136 Submit `https://lamutuelleseniors.fr/sitemap.xml` to Google Search Console and verify property; capture initial coverage report screenshot in `specs/001-lead-funnel-seniors/post-launch/` for SC-013 baseline
- [ ] T137 Annex the real lead-delivery interface spec under `contracts/lead-delivery.contract.md` once provided, then implement `HttpLeadDeliveryClient`, write integration tests against it, flip `LEAD_DELIVERY_MODE=http` in production, and validate end-to-end with the metier team

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — can start immediately.
- **Foundational (Phase 2)**: depends on Phase 1 — BLOCKS all user stories.
- **User Stories (Phases 3–7)**: all depend on Phase 2.
  - **US1 (Phase 3)** ships the MVP. All other user stories require an existing tunnel route (`/tunnel`) and `/api/lead`.
  - **US4 (Phase 4)**, **US2 (Phase 5)**, **US5 (Phase 6)** can run in parallel after US1 is done (different files mostly).
  - **US3 (Phase 7)** modifies `app/tunnel/page.tsx` and `leadSchema.ts` — best sequenced **after** US2 (which also changes the tunnel orchestrator) to avoid merge conflicts.
- **Polish (Phase 8)**: depends on all targeted user stories being complete.

### User Story Dependencies

- **US1 (P1)**: depends on Phase 2.
- **US4 (P2)**: depends on Phase 2 + US1's `Step05Consent` (T068) for the legal-version display refinement (T083).
- **US2 (P2)**: depends on Phase 2 + US1's tunnel components (it polishes them).
- **US5 (P2)**: depends on Phase 2 + US1's `/tunnel` route (landing CTAs link to it).
- **US3 (P3)**: depends on Phase 2 + US1's tunnel orchestrator and lead schema.

### Within Each User Story

- Tests come first (FAIL), then implementation.
- Inside implementation: pure libs (`src/lib/...`) before route handlers and components.
- Components within `tunnel/steps/` can run in parallel ([P]).

---

## Parallel Opportunities

- All Phase 1 tasks marked **[P]** can run in parallel after T001 and T002 (T003–T017 ~ 14 parallelizable tasks).
- In Phase 2, repos (T028–T031) are parallelizable once T019/T020/T021 land.
- All US1 tests (T038–T047) can be authored in parallel before any US1 implementation.
- US4 markdown rewrites (T074, T075, T076) and US4 page renderers (T079, T080, T081) are parallelizable.
- US5 landing pages (T105–T111) are 7 fully independent files — fan out by 7.
- US4, US2, US5 phases as a whole can run in parallel (different file sets).

### Parallel Example — User Story 1 tests

```bash
# Author tests in parallel (each in its own file, no impl yet → all should FAIL):
Task: tests/unit/postalCode.test.ts
Task: tests/unit/resolveCampaign.test.ts
Task: tests/unit/leadSchema.test.ts
Task: tests/unit/backoff.test.ts
Task: tests/unit/antibot.test.ts
Task: tests/integration/leadDeliveryClient.test.ts
Task: tests/integration/api-lead.test.ts
Task: tests/integration/api-lead-retry.test.ts
Task: tests/integration/consentRecord.test.ts
Task: tests/e2e/tunnel-happy-path.spec.ts
```

### Parallel Example — User Story 5 landing pages

```bash
# All seven landings live in distinct files:
Task: app/mutuelle-senior/page.tsx
Task: app/mutuelle-sante/page.tsx
Task: app/comparatif-mutuelle-senior/page.tsx
Task: app/comparatif-mutuelle-sante/page.tsx
Task: app/meilleure-mutuelle-senior/page.tsx
Task: app/devis-mutuelle-senior/page.tsx
Task: app/mutuelle-sante-retraite/page.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup) — T001 → T018.
2. Phase 2 (Foundational) — T019 → T037.
3. Phase 3 (US1 — MVP) — T038 → T071, write tests then implementation.
4. **STOP and VALIDATE**: run the manual smoke from `quickstart.md` §3. If green, deploy to a private subdomain (e.g., `staging.lamutuelleseniors.fr`) for internal demo with mock delivery enabled.

### Incremental Delivery

After MVP is live in mock mode:

1. **Sprint Legal (US4)** — replaces placeholder legal docs with real content; T072 → T083.
2. **Sprint UX seniors (US2)** — animations, a11y polish, ProgressBar refinement; T084 → T094.
3. **Sprint SEO (US5)** — landing pages, JSON-LD, sitemap, banner, analytics; T095 → T117.
4. **Sprint enrichment (US3)** — optional questions to maximize lead value; T118 → T125.
5. **Polish + production launch** — Phase 8 (T126 → T137).

### Parallel Team Strategy

Once Phase 2 is done, three developers can fan out:

- **Developer A**: US1 (Phase 3, MVP).
- After US1 ships, A picks up US3.
- **Developer B**: US4 (legal content) + US2 (UX polish) sequentially after US1.
- **Developer C**: US5 (SEO) — can start as soon as US1's `/tunnel` route is reachable (most landing work is content + layout, independent of lead-handling internals).

---

## Notes

- Tests **MUST FAIL** before their implementation tasks — the contracts under `contracts/` make the expected outcomes precise.
- All file paths are relative to `/home/jyblonde/lamutuelleseniors/`.
- SC-009 (no reference to "Contact Mutuelle") must be re-verified at every phase: T072 in US4 makes it explicit, but reviewers should grep before each merge.
- T134 (brand identity) and T137 (real delivery interface) are external-blocked — track them but don't let them block earlier sprints.
- Commit per task or per logical group; never amend a previously pushed commit (project convention).
