# Contract — Consent Record

**Feature**: Tunnel de génération de leads — Mutuelle Seniors
**Date**: 2026-05-06

Ce contrat normalise l'enregistrement du consentement à la transmission aux courtiers (cf. spec FR-003, FR-005, SC-005, US4 AS2 et clarification Q5).

---

## Invariants

1. **Aucun lead n'est créé sans `consent.purpose_courtier_transmission = true`.**
   La route `/api/lead` rejette toute requête qui ne porte pas ce drapeau (HTTP 400 — cf. `api-routes.contract.md`).

2. **Le consentement est lié 1:1 à un lead** via `consents.lead_id`.

3. **Le consentement enregistre la version exacte des documents légaux acceptés** :
   - `cgu_version` + `cgu_body_hash`
   - `pdc_version` + `pdc_body_hash`
   où `body_hash = SHA-256(contenu publié au moment de l'acceptation)`. Ainsi, si le document évolue (`legal_documents.version` passe de `1.0` à `1.1`), les anciens consentements continuent de pointer vers la version qu'ils ont effectivement acceptée.

4. **Le consentement est immuable** : aucune route ne le met à jour. Un retrait de consentement (RGPD) sera tracé dans une table dédiée à venir (`consent_revocations`, hors v1) et ne modifie pas la rangée originale.

5. **PII de la preuve** :
   - `ip_address`, `user_agent` sont stockés tels qu'envoyés (preuve de soumission).
   - Aucun hash, aucun chiffrement supplémentaire au niveau colonne — l'accès est protégé par les permissions du fichier SQLite et le contrôle d'accès de l'hôte.
   - Conservation : tant que la durée de conservation des leads l'impose (à fixer dans la PdC v1, recommandation = 5 ans pour preuve, conforme à la durée de prescription en intermédiation d'assurance — à valider par le DPO).

---

## Schéma logique du « Consent Record »

```ts
type ConsentRecord = {
  id: string;                          // nanoid 21
  lead_id: string;                     // FK → leads.id

  purpose_data_processing: boolean;
  purpose_courtier_transmission: true; // toujours true (sinon pas de record)

  cgu: { document_id: number; version: string; body_hash: string };
  pdc: { document_id: number; version: string; body_hash: string };

  ip_address: string;
  user_agent: string;
  granted_at: string;                  // ISO 8601 UTC
};
```

L'enregistrement DOIT être présent dans la même transaction SQL que le lead.

---

## Représentation côté UI (transparence visiteur)

Le tunnel affiche, **avant** la soumission finale, deux cases distinctes :

```text
[ ] J'accepte que mes données soient traitées par {SITE_LEGAL_ENTITY}
    pour les besoins de cette demande de mutuelle (cf. Politique de confidentialité v{X}).

[ ] J'accepte que mes données soient transmises aux courtiers en assurance
    partenaires de {SITE_LEGAL_ENTITY} en vue de me proposer une offre
    de mutuelle (cf. CGU v{Y}).  *— obligatoire pour soumettre*
```

- Les libellés sont rédigés à la voix active, sans pré-cochage (CNIL).
- Un lien direct vers chaque document s'ouvre dans un onglet séparé sans perdre la saisie.
- Tant que la deuxième case n'est pas cochée, le bouton « Envoyer ma demande » reste désactivé et un message courtois explique pourquoi.

---

## Validation côté zod

```ts
consent: z.object({
  data_processing: z.boolean(),
  courtier_transmission: z.literal(true), // refus → erreur de validation
  cgu_version: z.string(),
  pdc_version: z.string(),
})
```

Le `cgu_version` / `pdc_version` envoyé par le client DOIT correspondre à la version actuellement publiée — sinon erreur 409 `consent_outdated` (l'utilisateur doit re-confirmer avec la dernière version).

---

## Tests minimaux

| Test | Description |
|---|---|
| T-CONSENT-1 | `purpose_courtier_transmission=false` → 400, aucun enregistrement créé. |
| T-CONSENT-2 | Lead créé avec succès → `consents` row présente, FK respectée. |
| T-CONSENT-3 | `body_hash` du `consents` correspond au `body_hash` de la version `published` au moment de la soumission. |
| T-CONSENT-4 | Si une nouvelle version `1.1` de la PdC est publiée APRÈS la soumission, le `consents` original conserve la version `1.0` et son hash (immutabilité). |
| T-CONSENT-5 | Le client envoie `cgu_version=0.9` (version retirée) → 409 `consent_outdated`. |
| T-CONSENT-6 | Concurrent : deux soumissions consécutives → la transaction garantit qu'aucune ne crée un `lead` sans `consents` correspondant. |
