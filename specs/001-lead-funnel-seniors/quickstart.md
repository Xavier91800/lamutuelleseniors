# Quickstart — Tunnel de génération de leads (Mutuelle Seniors)

**Feature**: 001-lead-funnel-seniors
**Date**: 2026-05-06
**Audience**: développeur·euse qui démarre l'implémentation après `/speckit-tasks`.

---

## 1. Pré-requis machine

- Node.js 20.x (nvm recommandé). Le runtime cible en prod est `node:20-alpine`.
- `npm` 10.x (livré avec Node 20).
- Docker + Docker Compose (pour reproduire l'environnement de prod en local).
- SQLite 3.40+ (utile pour ouvrir le `.db` à la main avec `sqlite3` ; sinon `better-sqlite3` est suffisant à l'usage).
- Un éditeur avec support TypeScript / ESLint / Tailwind v4.

---

## 2. Bring-up local (dev)

```bash
cd /home/jyblonde/lamutuelleseniors

# 1. Dépendances
npm install

# 2. Variables d'environnement (à compléter localement, ne PAS commit)
cp .env.example .env.local
# Éditer .env.local — au minimum :
#   DATABASE_PATH=./.data/lamutuelleseniors.db
#   LEAD_DELIVERY_MODE=mock
#   MAIL_NOTIFY=false        (ou true avec GMAIL_USER/GMAIL_PASS de test)
#   PLAUSIBLE_DOMAIN=localhost
#   ANTIBOT_TURNSTILE_SITEKEY= (vide en dev)

# 3. Initialiser la DB et seed des documents légaux
npm run db:migrate

# 4. Démarrer Next.js en dev (Turbopack)
npm run dev
```

L'app est servie sur `http://localhost:3000`. Le tunnel est accessible via `http://localhost:3000/tunnel`.

---

## 3. Vérification de bout en bout (sans courtier réel)

1. Ouvrir `http://localhost:3000` → vérifier que le bandeau cookies s'affiche, que cliquer « Refuser » ne pose **aucun** cookie, et que le bouton « Démarrer » va vers `/tunnel`.
2. Compléter les 4 champs obligatoires (nom, prénom, date de naissance, code postal) avec un CP de métropole (`75015`) ; cocher les deux consentements ; soumettre.
3. Vérifier dans les logs Docker / terminal :
   - un événement `delivery_mock` avec un `lead_id` et `campaign_id="senior"` (si âge ≥ 55) ;
   - un `lead_submitted` event ;
   - aucune erreur dans pino.
4. Ouvrir la DB :
   ```bash
   sqlite3 .data/lamutuelleseniors.db "select id, campaign_id, delivery_status from leads order by submitted_at desc limit 5;"
   ```
   → la ligne doit être présente avec `delivery_status='delivered_mock'`.
5. Re-soumettre les mêmes infos dans la minute → l'API doit retourner `{"status":"duplicate"}` et la DB ne doit pas avoir de doublon.
6. Tenter un CP `98800` → 400.
7. Décocher la case de transmission aux courtiers → le bouton de soumission reste désactivé (FR-003 + Q5).

---

## 4. Tests

```bash
# Unit + intégration (Vitest)
npm run test
npm run test:watch       # mode interactif

# E2E (Playwright) — démarre une instance dev éphémère
npm run test:e2e

# Audit Lighthouse en CI local (sur la home + landings)
npm run test:lighthouse

# Audit accessibilité ciblé (axe-core sur le tunnel)
npm run test:a11y
```

Le pipeline CI doit gates sur :
- `vitest` : 100 % des tests passent ;
- `playwright` : tunnel happy path + 3 edge cases verts ;
- `lighthouse` : SEO ≥ 95 et A11y ≥ 90 sur la home et chaque landing primaire ;
- `tsc --noEmit` : aucun type error.

---

## 5. Build production local (smoke avant push)

```bash
npm run build         # next build (output: standalone)
npm run start         # serveur prod local sur :3000
```

Re-tester rapidement le tunnel et `/api/health`.

---

## 6. Build & déploiement Docker (procédure INFRA.md)

> Référence : `INFRA.md` §Déployer un nouveau site (procédure).

```bash
# 1. Sur l'hôte (mail / 146.59.231.199), depuis /home/jyblonde/lamutuelleseniors/
docker compose up -d --build

# 2. Brancher NPM au réseau partagé (à faire UNE FOIS si proxy-net pas encore créé)
docker network create proxy-net 2>/dev/null || true
docker network connect proxy-net npm 2>/dev/null || true

# 3. Vérifier que le conteneur est joignable depuis NPM
docker exec npm sh -c 'curl -s -o /dev/null -w "%{http_code}\n" http://lamutuelleseniors:3000/api/health'
# → doit afficher 200

# 4. Dans NPM (UI :81)
#    Proxy Host → Domain Names: lamutuelleseniors.fr, www.lamutuelleseniors.fr
#                Forward Hostname: lamutuelleseniors
#                Forward Port: 3000
#                Block Common Exploits ✔
#    SSL → Request a new SSL Certificate (Let's Encrypt) + Force SSL + HTTP/2

# 5. Pré-requis DNS (à faire AVANT l'étape 4)
#    A    lamutuelleseniors.fr    → 146.59.231.199
#    A    www.lamutuelleseniors.fr → 146.59.231.199
```

**Piège classique 502** : si après un `docker compose up -d` le site répond 502 via NPM mais 200 sur localhost, NPM a perdu le réseau Docker du projet. Fix : `docker network connect lamutuelleseniors_default npm` (ou — préférable — vérifier que `proxy-net` est bien partagé en `external: true` dans `docker-compose.yml`).

---

## 7. Variables d'environnement (production)

Renseigner via `.env` non versionné déposé dans `/home/jyblonde/lamutuelleseniors/.env`, lu par `docker-compose.yml` :

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/data/lamutuelleseniors.db
LEAD_DELIVERY_MODE=mock                 # → http quand la spec API arrive
LEAD_DELIVERY_URL=                      # à remplir à ce moment-là
LEAD_DELIVERY_AUTH=                     # à remplir
MAIL_NOTIFY=true
GMAIL_USER=xxxxxxxx@gmail.com
GMAIL_PASS=xxxxxxxxxxxxxxxx
MAIL_TO=gestion@lamutuelleseniors.fr
MAIL_FROM=xxxxxxxx@gmail.com
PLAUSIBLE_DOMAIN=lamutuelleseniors.fr
PLAUSIBLE_HOST=https://plausible.io
RATE_LIMIT_SUBMISSIONS_PER_HOUR=10
RETRY_CRON_TOKEN=<long-random-token>
LOG_LEVEL=info
SITE_LEGAL_ENTITY=                      # à fournir par le métier
SITE_LEGAL_ADDRESS=                     # idem
SITE_PHONE=                             # idem
SITE_EMAIL=                             # idem
SITE_DPO_EMAIL=                         # idem
```

> **Sécurité** : ne committer aucune valeur réelle. Le repo contient `.env.example` avec uniquement des clés et des descriptions.

---

## 8. Ajouter une nouvelle landing page SEO

1. Créer `app/<slug>/page.tsx` qui exporte `metadata` (title ≤ 60 c, description ≤ 160 c, canonical) et un composant principal H1.
2. Ajouter le slug dans `src/config/seo.ts` (`primaryLandings: [...]`) — `app/sitemap.ts` la prendra automatiquement.
3. Lier la page depuis le footer ou le maillage interne pertinent.
4. Vérifier en dev avec :
   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep <slug>
   curl -s http://localhost:3000/<slug> | head
   npm run test:lighthouse -- --url=http://localhost:3000/<slug>
   ```

---

## 9. Faire évoluer les CGU / PdC

1. Créer un nouveau fichier markdown `src/content/legal/cgu-v1_1.md` (ou `pdc-v1_1.md`).
2. Ajouter une migration `migrations/000N_add_cgu_v1_1.sql` qui :
   - INSERT une nouvelle ligne `legal_documents (kind='cgu', version='1.1', status='draft')` ;
   - UPDATE l'ancienne ligne en `status='retired'` quand la nouvelle passe en `published` (option : faire ça via l'admin UI ou un script de release).
3. Le code lit toujours la dernière version `published` ; les `consents` existants pointent vers leur version d'origine (immutabilité — cf. `consent-record.contract.md`).

---

## 10. Connecter la vraie plateforme externe (quand sa spec arrive)

1. Annexer la spec à `contracts/lead-delivery.contract.md`.
2. Implémenter le mapping dans `src/lib/lead-delivery/HttpLeadDeliveryClient.ts` (champs, auth, idempotence).
3. Mettre `LEAD_DELIVERY_MODE=http` + remplir `LEAD_DELIVERY_URL` et `LEAD_DELIVERY_AUTH` dans le `.env` de prod.
4. Re-déployer.
5. Vérifier qu'un lead de test est correctement reçu par la plateforme distante (procédure de smoke à définir avec le métier).
6. Mettre en place une alerte (email opérateur) sur tout passage en `dead_letter`.
