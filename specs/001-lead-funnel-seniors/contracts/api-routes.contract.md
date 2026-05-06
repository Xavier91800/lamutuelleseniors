# Contract — Internal API Routes

**Feature**: Tunnel de génération de leads — Mutuelle Seniors
**Date**: 2026-05-06
**Scope**: contrats des routes Next.js du site, internes au site (consommées par son propre frontend ou par un cron du host).

Toutes les routes répondent en JSON UTF-8. Les codes HTTP sont normatifs.

---

## 1. `GET /api/health`

**But** : healthcheck Docker / NPM (cf. `INFRA.md` §Convention Compose).

**Authentification** : aucune (public).

**Requête** : aucune.

**Réponse `200 OK`** :
```json
{ "status": "ok", "version": "<git-sha>", "uptime_s": 1234, "db": "up" }
```

**Réponse `503 Service Unavailable`** :
```json
{ "status": "degraded", "db": "down", "reason": "<message>" }
```

**Tests minimaux** :
- T-HEALTH-1 : retourne 200 quand la DB est joignable.
- T-HEALTH-2 : retourne 503 si une lecture sur `_migrations` échoue.

---

## 2. `POST /api/lead`

**But** : finaliser la soumission du tunnel — valide, persiste le lead + le consentement, déclenche la livraison initiale, déclenche la notification.

**Authentification** : aucune (public, anti-bot par les mécanismes de R-07).

**Headers entrants utilisés** :
- `Content-Type: application/json`
- `X-Forwarded-For` (lu derrière NPM pour récupérer l'IP réelle)
- `User-Agent`

**Body de requête** (validé par `leadSchema` zod) :
```json
{
  "nom": "Dupont",
  "prenom": "Jeanne",
  "date_naissance": "1955-03-12",
  "code_postal": "75015",
  "email": "jeanne.dupont@example.com",
  "telephone": "0612345678",
  "regime": 1,
  "niveau_garantie": "equilibre",
  "situation_actuelle": "mutuelle_actuelle",
  "date_effet_souhaitee": "2026-07-01",
  "conjoint_present": 1,
  "conjoint_date_naissance": "1957-06-22",
  "enfants_dates_naissance": [],
  "consent": {
    "data_processing": true,
    "courtier_transmission": true,
    "cgu_version": "1.0",
    "pdc_version": "1.0"
  },
  "client_session_id": "cs_8f3a2b...",
  "tunnel_started_at_ms": 1714994400000,
  "honeypot_zip": "",
  "utm_source": "google",
  "utm_medium": "organic",
  "utm_campaign": null
}
```

**Règles de validation** (zod) — non exhaustif, voir `src/lib/validation/leadSchema.ts` :
- `nom`, `prenom` : 1..80 caractères, trim, refuser caractères de contrôle.
- `date_naissance` : ISO `YYYY-MM-DD`, ni future, âge ≤ 120 ans.
- `code_postal` : `^(0[1-9]|[1-8]\d|9[0-5]|97\d{1})\d{2}$` → métropole (01000–95999) ou DOM (97000–97999).
- `email` (si fourni) : email RFC.
- `telephone` (si fourni) : `^(?:\+33|0)[1-9]\d{8}$`.
- `consent.courtier_transmission` : DOIT être `true`. Sinon → 400.
- Si `age < 55` → `conjoint_present` doit être 0 ou 1 (présent), `enfants_dates_naissance` doit être un array (vide ou non) — pour pouvoir router la campagne (FR-028).
- `honeypot_zip` : DOIT être chaîne vide. Sinon → 200 silencieux (pas d'enregistrement, pas de log explicite, juste un event `bot_detected`).
- `now() - tunnel_started_at_ms` ≥ 4000 ms. Sinon → event `bot_detected` + 200 silencieux.
- Rate limit : si IP a > 10 soumissions/heure → 429.
- Dédup : si un lead avec mêmes `(nom_normalized, prenom_normalized, date_naissance, code_postal)` existe avec `submitted_at` dans les dernières 24 h → 200 avec `{"status":"duplicate","lead_id":<existing>}`.

**Réponses** :

| Code | Cas | Body |
|---|---|---|
| `200 OK` | Succès | `{ "status": "ok", "lead_id": "<id>", "campaign_id": "senior", "delivery": "delivered\|delivered_mock\|pending" }` |
| `200 OK` | Doublon 24 h | `{ "status": "duplicate", "lead_id": "<existing-id>" }` |
| `200 OK` | Honeypot / time-on-form échoue | `{ "status": "ok" }` (silencieux, ne pas révéler à un bot) |
| `400 Bad Request` | zod validation échoue (incluant consentement transmission absent) | `{ "status": "invalid", "errors": [{ "field": "...", "message": "..." }, ...] }` |
| `429 Too Many Requests` | Rate-limit IP atteint | `{ "status": "rate_limited", "retry_after_s": 3600 }` |
| `500 Internal Server Error` | Erreur inattendue (DB down, etc.) | `{ "status": "error" }` (sans détail technique) |

**Effets de bord** (transactionnels — un seul commit SQLite) :
1. `INSERT INTO leads(...)` avec `campaign_id` calculé via `resolveCampaign`.
2. `INSERT INTO consents(...)` lié au lead.
3. `INSERT INTO delivery_attempts(lead_id, attempt_no=1, status='pending', mode=$LEAD_DELIVERY_MODE, payload_hash=...)`.
4. `INSERT INTO events(event='lead_submitted', lead_id=...)`.

Hors transaction (best-effort, ne doit pas faire échouer la soumission) :
5. Tentative de `LeadDeliveryClient.deliver(lead)` → met à jour `delivery_attempts` + `leads.delivery_status`.
6. `emailNotifier.notifyNewLead(lead)`.

**Tests minimaux** :
- T-LEAD-1 : happy path 55+ → 200, lead persisté, `campaign_id='senior'`, `delivery='delivered_mock'` en mode mock.
- T-LEAD-2 : âge 42 + conjoint_present=1 → `campaign_id='under55_family'`.
- T-LEAD-3 : âge 30 + conjoint_present=0, enfants=0 → `campaign_id='under55_solo'`.
- T-LEAD-4 : code postal `98800` → 400.
- T-LEAD-5 : code postal `97400` (DOM) → 200.
- T-LEAD-6 : `consent.courtier_transmission=false` → 400, **rien** persisté.
- T-LEAD-7 : doublon (même nom/prénom/CP/DOB <24 h) → 200 avec `status="duplicate"`, pas de second lead.
- T-LEAD-8 : honeypot rempli → 200 silencieux, pas de lead.
- T-LEAD-9 : mode `http` avec stub HTTP qui renvoie 503 → 200, `delivery='pending'`, attempt en `retry`.
- T-LEAD-10 : 11ème soumission depuis la même IP en 1 h → 429.

---

## 3. `POST /api/lead/retry`

**But** : déclencher un cycle de retry des `delivery_attempts` éligibles.

**Authentification** : header `X-Cron-Token: $RETRY_CRON_TOKEN` (env). Refus 401 sinon.

**Body** : optionnel `{"limit":50}` (défaut 50, max 200).

**Réponse `200 OK`** :
```json
{ "examined": 12, "delivered": 9, "still_retry": 2, "dead_letter": 1 }
```

**Effets** :
- Sélectionne `delivery_attempts WHERE status='retry' AND next_retry_at <= now()` ordonné par `next_retry_at`.
- Pour chaque ligne, marque `running`, appelle le client, conclut avec `success` / `retry` (+ `next_retry_at`) / `failed_4xx` / `dead_letter`.
- Met à jour `leads.delivery_status` consolidé.

**Tests minimaux** :
- T-RETRY-1 : 401 sans header de cron.
- T-RETRY-2 : tente uniquement les rangées `status='retry'` éligibles.
- T-RETRY-3 : après 6 tentatives, bascule en `dead_letter` et envoie 1 email d'alerte.

---

## 4. `POST /api/consent` *(optionnel, pour le bandeau cookies)*

**But** : enregistrer l'événement de bandeau cookies (accepté/refusé/personnalisé). Indépendant de la soumission de lead.

**Body** :
```json
{
  "client_session_id": "cs_8f3a2b...",
  "decision": "accept_all" | "refuse_all" | "custom",
  "categories": { "analytics": true, "marketing": false }
}
```

**Réponse `200 OK`** :
```json
{ "status": "ok" }
```

**Effets** : `INSERT INTO events(event='cookie_consent', metadata=<json>)`. Aucun cookie n'est posé par cette route.

**Tests minimaux** :
- T-CONSENT-1 : 200 sur input valide.
- T-CONSENT-2 : 400 sur `decision` non énuméré.
