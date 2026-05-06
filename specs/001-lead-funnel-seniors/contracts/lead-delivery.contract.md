# Contract — External Lead Delivery Client

**Feature**: Tunnel de génération de leads — Mutuelle Seniors
**Date**: 2026-05-06
**Status**: **Provisoire** — l'interface réelle de la nouvelle plateforme externe sera fournie ultérieurement par le métier (clarification Q1, 2026-05-06). Ce contrat décrit le **port** côté code applicatif, indépendant de l'adapter HTTP final.

---

## Interface TypeScript (port côté app)

Fichier : `src/lib/lead-delivery/LeadDeliveryClient.ts`.

```ts
export type LeadDeliveryPayload = {
  lead_id: string;
  campaign_id: 'senior' | 'under55_family' | 'under55_solo';
  submitted_at: string;            // ISO 8601 UTC

  identity: {
    nom: string;
    prenom: string;
    date_naissance: string;        // YYYY-MM-DD
    code_postal: string;
    email?: string;
    telephone?: string;
  };

  qualifications?: {
    regime?: number;
    niveau_garantie?: 'economique'|'equilibre'|'renforce'|'premium';
    situation_actuelle?: 'aucune_mutuelle'|'mutuelle_actuelle'|'prefere_ne_pas_dire';
    date_effet_souhaitee?: string; // YYYY-MM-DD
    conjoint?: { date_naissance: string };
    enfants_dates_naissance?: string[];
  };

  attribution?: {
    source_path?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };

  consent: {
    granted_at: string;            // ISO 8601
    cgu_version: string;
    pdc_version: string;
    ip_address: string;
    user_agent: string;
  };
};

export type DeliveryResult =
  | { status: 'success'; mode: 'mock'|'http'; http_status?: number; provider_id?: string }
  | { status: 'retry';   mode: 'mock'|'http'; http_status?: number; reason: string }
  | { status: 'permanent_failure'; mode: 'mock'|'http'; http_status?: number; reason: string };

export interface LeadDeliveryClient {
  /**
   * Tente la livraison du lead. Doit être idempotent côté serveur distant
   * (clé d'idempotence = lead_id) — si l'API ne le permet pas, l'adapter HTTP
   * gère la déduplication via un cache local de `provider_id` reçus.
   *
   * @throws ne lance JAMAIS — toute erreur DOIT être convertie en `DeliveryResult`.
   */
  deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult>;
}
```

### Sémantique

| `DeliveryResult.status` | Signification | Action côté worker |
|---|---|---|
| `success` | Plateforme a accepté définitivement | `delivery_attempts.status='success'`, `leads.delivery_status='delivered'` |
| `retry` | Échec transitoire (timeout, 5xx, 429) | `delivery_attempts.status='retry'`, calcule `next_retry_at` |
| `permanent_failure` | Erreur 4xx (mauvais format, lead refusé) | `delivery_attempts.status='failed_4xx'`, `leads.delivery_status='rejected_4xx'`, **pas de retry**, alerte email opérateur |

### Idempotence

`payload.lead_id` est l'identifiant logique. L'adapter HTTP final DOIT, si la spec externe le permet, le passer dans un en-tête `Idempotency-Key` ou champ équivalent.

---

## Implémentations

### `MockLeadDeliveryClient` (par défaut tant que la spec n'est pas livrée)

- Log JSON via pino : `{ event: "delivery_mock", lead_id, campaign_id }`.
- Retourne immédiatement `{ status: 'success', mode: 'mock' }`.
- Aucune sortie réseau.
- Sélectionné par `LEAD_DELIVERY_MODE=mock` (défaut).

### `HttpLeadDeliveryClient` (squelette à compléter)

- Construit la requête HTTP selon la spec externe quand elle sera fournie.
- Timeout 10 s côté connexion + 10 s côté réponse.
- Retry-handling **interne** : aucun. C'est le worker SQLite qui replanifie.
- Mapping de statuts HTTP → `DeliveryResult` :
  - `2xx` → `success`
  - `408 / 425 / 429 / 500 / 502 / 503 / 504` ou erreur réseau → `retry`
  - autres `4xx` → `permanent_failure`
- En cas de payload signé/auth, lit les credentials depuis l'environnement (`LEAD_DELIVERY_AUTH`, `LEAD_DELIVERY_URL`).
- Sélectionné par `LEAD_DELIVERY_MODE=http`.

> **Note** : tant que la spec externe n'est pas livrée, le code doit lever une `Error("HttpLeadDeliveryClient not configured — pending external spec")` à l'instanciation pour éviter qu'on ne le sélectionne accidentellement en production.

### `FakeLeadDeliveryClient` (tests uniquement)

Configurable au runtime : suite de `DeliveryResult` à retourner. Permet d'écrire des tests d'intégration de bout en bout (T-LEAD-9, T-RETRY-3 …).

---

## Tests minimaux du port

| Test | Description |
|---|---|
| T-DELIVERY-MOCK-1 | `MockLeadDeliveryClient.deliver()` retourne `success`/`mock`. |
| T-DELIVERY-FAKE-1 | `FakeLeadDeliveryClient` retourne `retry` puis `success` ; le worker convertit la séquence en 2 `delivery_attempts`. |
| T-DELIVERY-FAKE-2 | `permanent_failure` ne déclenche jamais de second appel et déclenche l'email d'alerte. |
| T-DELIVERY-PORT-1 | Toute exception levée à l'intérieur d'une implémentation est rattrapée et convertie en `DeliveryResult.retry` (cf. contrat « ne lance jamais »). |

---

## Spécification d'interface externe — à compléter par le métier

Quand la spec arrivera, **annexer** ici :

- URL de l'endpoint
- Méthode HTTP (vraisemblablement `POST`)
- Format d'authentification (Bearer / HMAC / mTLS / clé API)
- Schéma exact du payload accepté (JSON Schema)
- Schéma de la réponse de succès
- Liste des codes d'erreur métier
- Nomenclature exacte des `campaign_id` côté plateforme (mapper `senior` / `under55_family` / `under55_solo` → identifiants distants)
- Politique d'idempotence
- Délais SLA et limites de débit

Une migration `migrations/000N_lead_campaign_remap.sql` peut être nécessaire si la nomenclature distante diffère.
