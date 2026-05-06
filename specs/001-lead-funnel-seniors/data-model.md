# Phase 1 — Data Model

**Feature**: Tunnel de génération de leads — Mutuelle Seniors
**Date**: 2026-05-06

Ce document décrit les entités de domaine et leur projection en schéma SQLite. Les noms de tables et colonnes sont normatifs et serviront aux migrations `migrations/0001_init.sql` et suivantes.

---

## Vue d'ensemble

```text
┌──────────────────────┐        1:N        ┌────────────────────────┐
│      legal_documents │◄──────────────────│        consents        │
│  (CGU/PdC versions)  │                   │  (preuve par lead)     │
└──────────────────────┘                   └────────────────────────┘
                                                      │
                                                      │ 1:1
                                                      ▼
┌──────────────────────────────┐  1:N  ┌────────────────────────────┐
│            leads             │──────►│      delivery_attempts     │
│ (prospect collecté)          │       │ (file de retry)            │
└──────────────────────────────┘       └────────────────────────────┘
        │
        │ 1:N
        ▼
┌────────────────────┐
│       events       │  (analytics & audit)
└────────────────────┘
```

---

## Entité 1 — `legal_documents`

Versionnement des CGU et de la Politique de confidentialité publiées (cf. spec entité « Document légal », FR-008, US4 AS2).

| Champ | Type SQLite | Contraintes | Description |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | Identifiant interne |
| `kind` | TEXT | NOT NULL, CHECK IN ('cgu','pdc','mentions') | Type de document |
| `version` | TEXT | NOT NULL | ex. `1.0`, `1.1` |
| `effective_at` | TEXT | NOT NULL | ISO-8601, date de prise d'effet |
| `published_at` | TEXT | NOT NULL | ISO-8601, date de publication |
| `body_path` | TEXT | NOT NULL | Chemin relatif vers le markdown source |
| `body_hash` | TEXT | NOT NULL | SHA-256 du contenu publié (preuve d'intégrité) |
| `status` | TEXT | NOT NULL CHECK IN ('draft','published','retired') | État |
| `created_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Contraintes** :
- UNIQUE `(kind, version)`.
- À tout instant, au plus un document par `kind` est `status = 'published'`.

**État/transition** : `draft` → `published` → `retired` (jamais en arrière).

**Seed initial** : `(cgu, 1.0)`, `(pdc, 1.0)`, `(mentions, 1.0)` insérés à l'amorçage par la migration.

---

## Entité 2 — `consents`

Preuve de consentement liée à un lead (FR-003, FR-005, SC-005).

| Champ | Type SQLite | Contraintes | Description |
|---|---|---|---|
| `id` | TEXT | PK (nanoid 21c) | Identifiant non séquentiel |
| `lead_id` | TEXT | NOT NULL UNIQUE FK → leads.id | Un consentement = un lead |
| `purpose_data_processing` | INTEGER | NOT NULL CHECK 0..1 | Cocher (a) traitement par éditeur |
| `purpose_courtier_transmission` | INTEGER | NOT NULL CHECK 1..1 | Cocher (b) transmission courtier — toujours 1 (sinon pas de soumission, cf. clarif Q5) |
| `cgu_document_id` | INTEGER | NOT NULL FK → legal_documents.id | Version CGU acceptée |
| `pdc_document_id` | INTEGER | NOT NULL FK → legal_documents.id | Version PdC acceptée |
| `cgu_version` | TEXT | NOT NULL | Snapshot `version` au moment de l'acceptation |
| `pdc_version` | TEXT | NOT NULL | Snapshot `version` au moment de l'acceptation |
| `cgu_body_hash` | TEXT | NOT NULL | Snapshot intégrité |
| `pdc_body_hash` | TEXT | NOT NULL | Snapshot intégrité |
| `ip_address` | TEXT | NOT NULL | Adresse IP soumissionnaire |
| `user_agent` | TEXT | NOT NULL | UA soumissionnaire |
| `granted_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Horodatage |

**Index** : `(lead_id)` unique.

**Règles métier** :
- Un consentement n'est jamais modifié — en cas de retrait (FR-015), un nouvel enregistrement de type *retrait* sera créé sur une table dérivée à venir (`consent_revocations`, hors v1).
- `purpose_courtier_transmission = 0` ⇒ aucun lead ne doit être créé en amont (FR-003 + Q5).

---

## Entité 3 — `leads`

L'entité centrale (cf. spec entité « Lead », FR-002, FR-005, FR-028).

| Champ | Type SQLite | Contraintes | Description |
|---|---|---|---|
| `id` | TEXT | PK (nanoid 21c) | |
| `nom` | TEXT | NOT NULL | Tel que saisi |
| `nom_normalized` | TEXT | NOT NULL | `lower(trim(nom))` pour la dédup |
| `prenom` | TEXT | NOT NULL | |
| `prenom_normalized` | TEXT | NOT NULL | |
| `date_naissance` | TEXT | NOT NULL | Format ISO `YYYY-MM-DD` |
| `code_postal` | TEXT | NOT NULL | 5 chiffres FR métropole/DOM |
| `email` | TEXT | NULL | Optionnel |
| `telephone` | TEXT | NULL | Optionnel |
| `regime` | INTEGER | NULL | Code régime obligatoire |
| `niveau_garantie` | TEXT | NULL | `economique`/`equilibre`/`renforce`/`premium` |
| `situation_actuelle` | TEXT | NULL | `aucune_mutuelle`/`mutuelle_actuelle`/`prefere_ne_pas_dire` |
| `date_effet_souhaitee` | TEXT | NULL | ISO `YYYY-MM-DD` |
| `conjoint_present` | INTEGER | NULL CHECK 0..1 | 0 = non, 1 = oui ; obligatoire si `age < 55` (cf. FR-012) |
| `conjoint_date_naissance` | TEXT | NULL | Si `conjoint_present=1` |
| `enfants_count` | INTEGER | NOT NULL DEFAULT 0 CHECK 0..6 | |
| `enfants_dates_naissance` | TEXT | NULL | JSON array de dates ISO |
| `campaign_id` | TEXT | NOT NULL CHECK IN ('senior','under55_family','under55_solo') | Calculé via `resolveCampaign` (FR-028) |
| `age_at_submission` | INTEGER | NOT NULL | Calculé serveur, pour audit |
| `source_path` | TEXT | NOT NULL | URL d'origine du tunnel (référent ou page de départ) |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content` | TEXT | NULL | UTM capturés |
| `ip_address` | TEXT | NOT NULL | |
| `user_agent` | TEXT | NOT NULL | |
| `delivery_status` | TEXT | NOT NULL CHECK IN ('pending','delivered','delivered_mock','dead_letter','rejected_4xx') DEFAULT 'pending' | Statut consolidé (vue dérivée de la dernière `delivery_attempt`) |
| `submitted_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `created_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Index** :
- `idx_leads_dedup` UNIQUE sur `(nom_normalized, prenom_normalized, date_naissance, code_postal, submitted_at >= now()-24h)` — implémenté via une vérification applicative dans `leadRepo.upsertOrReject` (SQLite ne supporte pas les index partiels avec sous-requête sur `now()`, on fait un `SELECT` avant `INSERT` dans une transaction).
- `idx_leads_delivery_status` sur `delivery_status` (file de retry).
- `idx_leads_submitted_at` sur `submitted_at` (export, analytics).

**Règles métier** :
- Aucun champ optionnel ne devient obligatoire au niveau colonne — la contrainte « obligatoire pour les < 55 ans » (FR-012, conjoint/enfants) est appliquée **côté zod** et **côté `resolveCampaign`** (un lead < 55 doit déclarer `conjoint_present` ET `enfants_count` même à 0/0 pour être valide).
- `campaign_id` doit être présent et cohérent avec `age_at_submission` :
  - `age >= 55` → `senior`
  - `age < 55 && (conjoint_present=1 || enfants_count>0)` → `under55_family`
  - `age < 55 && conjoint_present=0 && enfants_count=0` → `under55_solo`

**État/transition de `delivery_status`** :
```
pending ──► delivered          (succès HTTP 2xx)
pending ──► delivered_mock     (mode mock)
pending ──► rejected_4xx       (erreur permanente côté plateforme — pas de retry)
pending ──► dead_letter        (après 6 tentatives en 24 h+)
```

---

## Entité 4 — `delivery_attempts`

File de retry (cf. spec entité « Lead », FR-006 + R-09).

| Champ | Type SQLite | Contraintes | Description |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `lead_id` | TEXT | NOT NULL FK → leads.id ON DELETE CASCADE | |
| `attempt_no` | INTEGER | NOT NULL | 1, 2, 3, … |
| `status` | TEXT | NOT NULL CHECK IN ('pending','running','success','retry','failed_4xx','dead_letter') | |
| `mode` | TEXT | NOT NULL CHECK IN ('mock','http') | Implémentation utilisée |
| `http_status` | INTEGER | NULL | Si `mode='http'` |
| `error_message` | TEXT | NULL | |
| `payload_hash` | TEXT | NOT NULL | SHA-256 du payload envoyé (audit) |
| `started_at` | TEXT | NULL | |
| `finished_at` | TEXT | NULL | |
| `next_retry_at` | TEXT | NULL | Si `status='retry'` |
| `created_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Index** :
- `idx_attempts_lead` sur `lead_id`.
- `idx_attempts_next_retry` sur `(status, next_retry_at)` — utilisé par le worker de retry.

**Règles** :
- Le worker prend les rangées `status='retry' AND next_retry_at <= now()`, passe à `running`, exécute, conclut.
- Au-delà de `attempt_no = 6` ou `now() - lead.submitted_at > 24h`, on bascule en `dead_letter` et on déclenche une notification opérateur.

---

## Entité 5 — `events`

Stockage léger pour l'analyse interne (FR-026), la notification opérateur (FR-013) et le calcul de SC-001/SC-002/SC-014.

| Champ | Type SQLite | Contraintes | Description |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `event` | TEXT | NOT NULL | `funnel_started`, `funnel_step_completed`, `funnel_consent_blocked`, `lead_submitted`, `delivery_succeeded`, `delivery_failed`, `lead_dedup_rejected`, `bot_detected` |
| `lead_id` | TEXT | NULL FK → leads.id | Si applicable |
| `step_index` | INTEGER | NULL | Pour `funnel_step_completed` |
| `client_session_id` | TEXT | NULL | Identifiant client (cookie technique de session, sans PII) |
| `metadata` | TEXT | NULL | JSON libre |
| `created_at` | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Index** : `idx_events_event_time` sur `(event, created_at)`.

**Note** : pas de PII dans `metadata` (uniquement codes, ratios, hashes). La table peut être purgée après 90 jours sans impact business.

---

## Migrations

### `migrations/0001_init.sql`

Crée les 5 tables ci-dessus avec leurs index, contraintes CHECK et la table `_migrations` (clé `id INTEGER PK`, `name TEXT UNIQUE`, `applied_at TEXT`).

### `migrations/0002_seed_legal_documents.sql`

Insère les versions initiales `(cgu,1.0)`, `(pdc,1.0)`, `(mentions,1.0)` en `status='published'` (la migration calcule `body_hash` sur les fichiers `src/content/legal/*-v1.md` au build).

> *Note* : pour rester reproductible, le seed est généré par un petit script Node `migrations/seed-legal.ts` exécuté en `predeploy`, qui produit le SQL final avec les hashes.

---

## Volumétrie projetée

| Table | Lignes/jour (régime de croisière 200/j) | À 1 an | À 3 ans |
|---|---|---|---|
| `leads` | 200 | ~73 k | ~220 k |
| `consents` | 200 | ~73 k | ~220 k |
| `delivery_attempts` | 200–400 (retries inclus) | ~110 k | ~330 k |
| `events` | 2 000–5 000 (granularité par étape) | ~1,5 M | purgé à 90 j → ~450 k continu |
| `legal_documents` | quasi-statique | ~20 lignes | ~50 lignes |

Largement dans les capacités de SQLite WAL sur SSD. Backup recommandé : copie `.db` quotidienne via `rsync` vers volume `/home/jyblonde/data/`.

---

## Conformité aux exigences

| FR / SC | Couverture data-model |
|---|---|
| FR-002 (champs obligatoires) | colonnes `nom/prenom/date_naissance/code_postal` NOT NULL |
| FR-003, SC-005 (consentement obligatoire et tracé) | table `consents` + FK obligatoire ; `purpose_courtier_transmission = 1` invariant |
| FR-005 (persistance avec horodatage, IP, UA, version légale) | colonnes `submitted_at`, `ip_address`, `user_agent`, FKs vers `legal_documents` |
| FR-006 + retry | table `delivery_attempts` + `delivery_status` |
| FR-014 (dédup) | `idx_leads_dedup` + check applicatif 24 h |
| FR-028 (campagne) | colonne `campaign_id` + CHECK |
| FR-029 (50–200/j, pic ×3) | volumétrie validée |
| SC-001, SC-002, SC-014 | table `events` permet le calcul du taux de complétion et du temps médian |
