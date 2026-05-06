# La Mutuelle Seniors

Site web Next.js 15 de génération de leads pour la mutuelle santé senior. Tunnel multi-étapes inspiré de lelynx.fr, accessible (WCAG 2.1 AA), aiguillage automatique de campagne, livraison via client isolé (mode mock par défaut tant que la spec API courtier n'est pas livrée), persistance SQLite, retry à back-off exponentiel.

Domaine de production : <https://www.la-mutuelle-seniors.fr>

## Démarrer en local

```bash
# Pré-requis : Node 20.x, Docker (optionnel pour reproduire la prod)
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Le tunnel est ensuite accessible sur <http://localhost:3000/tunnel>.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Serveur Next.js en dev (Turbopack) |
| `npm run build` | Build production (sortie `standalone`) |
| `npm run start` | Démarre le build de production |
| `npm run lint` | ESLint via `next lint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Génère le seed des documents légaux puis applique les migrations |
| `npm run test` | Suite Vitest (unit + intégration) |
| `npm run test:e2e` | Suite Playwright (chromium + mobile + tablette) |
| `npm run test:lighthouse` | Audit Lighthouse-CI sur la home + 7 landings |

## Architecture

```
app/                    # Next.js App Router (UI + API routes)
├── api/
│   ├── consent/        # Bandeau cookies → events
│   ├── health/         # /api/health pour Docker healthcheck + NPM
│   ├── lead/           # POST soumission lead (transactionnel)
│   ├── lead/retry/     # POST déclenche un cycle de retry (token X-Cron-Token)
│   └── legal-versions/ # Versions courantes des CGU/PdC pour le tunnel
├── tunnel/             # Tunnel multi-étapes (US1, US2, US3)
├── mutuelle-senior/    # 7 landing pages SEO (US5)
├── conditions-generales/, politique-de-confidentialite/, mentions-legales/
├── sitemap.ts          # /sitemap.xml dynamique
└── robots.ts           # /robots.txt

src/
├── components/         # UI (layout, tunnel, content, seo)
├── lib/
│   ├── db/             # better-sqlite3 + repositories
│   ├── lead-delivery/  # Port + Mock/Http/Fake adapters
│   ├── retry/          # Worker + back-off exponentiel
│   ├── consent/        # Recording + version snapshot
│   ├── validation/     # zod schémas
│   ├── antibot/        # Honeypot + rate-limit en mémoire
│   ├── analytics/      # Plausible (consent-gated)
│   └── notifications/  # Nodemailer
├── config/             # site, seo, tunnel
└── content/legal/      # Markdown sources des CGU/PdC

migrations/             # SQL migrations + seed-legal.ts
tests/                  # unit, integration, e2e
specs/001-lead-funnel-seniors/  # Spec Kit artefacts
```

Pour le détail de l'architecture, voir `specs/001-lead-funnel-seniors/plan.md`.

## Variables d'environnement

Voir `.env.example` pour la liste complète. Variables clés en production :

- `LEAD_DELIVERY_MODE` : `mock` (par défaut, aucun appel sortant) ou `http` (active le client externe — nécessite la spec API)
- `MAIL_NOTIFY` : `true` pour activer les emails opérateur
- `RETRY_CRON_TOKEN` : token aléatoire long, obligatoire pour appeler `/api/lead/retry`
- `GOOGLE_SITE_VERIFICATION` : token de vérification Search Console — passé en **build arg** Docker
- `SITE_LEGAL_ENTITY`, `SITE_DPO_EMAIL`, etc. : interpolés dans les pages légales et le footer

## Déploiement

Le site est déployé en Docker sur l'hôte mutualisé `mail` (`146.59.231.199`) derrière Nginx Proxy Manager partagé. Procédure complète dans `INFRA.md` du repo et `specs/001-lead-funnel-seniors/quickstart.md` §6.

```bash
# Sur l'hôte
cd /home/jyblonde/lamutuelleseniors
docker compose up -d --build
```

Le réseau Docker `proxy-net` (externe, partagé avec NPM) est déjà connecté en permanence — fix durable du piège 502 documenté dans INFRA.md.

## Sauvegardes

Script de backup quotidien à programmer en cron sur l'hôte :

```cron
5 3 * * *  /home/jyblonde/lamutuelleseniors/scripts/backup-db.sh
```

Backups gzippés dans `/home/jyblonde/data/backups/lamutuelleseniors/` avec rétention 30 jours par défaut.

## Tests

- **Unit + intégration (Vitest)** — `npm run test` — 69 tests, ~6 s
- **E2E (Playwright)** — `npm run test:e2e` — 12 tests dont 6 audits axe-core a11y, ~45 s
- **Lighthouse-CI** — `npm run test:lighthouse` — gates Perf ≥ 0.80, A11y ≥ 0.90, SEO ≥ 0.95 sur la home + 7 landings

## Documentation

- `INFRA.md` — infrastructure NPM/Docker partagée
- `specs/001-lead-funnel-seniors/spec.md` — spécification fonctionnelle
- `specs/001-lead-funnel-seniors/plan.md` — plan technique
- `specs/001-lead-funnel-seniors/quickstart.md` — bring-up détaillé
- `specs/001-lead-funnel-seniors/contracts/` — contrats API (lead delivery, consent, routes)
