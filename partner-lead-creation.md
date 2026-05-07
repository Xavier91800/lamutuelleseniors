# Intégration partenaire — Création de leads depuis un site externe

**Destinataire** : équipe technique d'un site/portail externe qui souhaite pousser des leads dans CRMLeads
**Version** : 1.0 — 2026-05-07
**Contact** : équipe CRMLeads

---

## 1. Contexte

Cette API permet à un site externe (formulaire de capture, comparateur, partenaire affilié) d'envoyer des leads à CRMLeads. Une fois un lead créé :

- Il est immédiatement persisté en base avec sa preuve de consentement RGPD.
- Il subit le scoring qualité et la détection de doublons existants.
- Il est routé vers un courtier selon les règles de distribution actives (campagnes Meta, exclusivités, quotas).
- Le partenaire peut, plus tard, recevoir l'identifiant `idCrmCible` du CRM tiers où le lead a été redistribué (cf. doc séparée pour les mises à jour de statut).

L'API est sécurisée par clé/secret + jeton court-terme (JWT, durée de vie 1h).

---

## 2. Identifiants à conserver

CRMLeads vous fournira lors de la mise en place :

| Champ | Format | Exemple | Usage |
|-------|--------|---------|-------|
| `apiKey` | `pk_<24 caractères alphanumériques>` | `pk_AbCdEf1234567890XyZ12345` | Identifiant public, peut être loggué |
| `secret` | `sk_live_<32 caractères alphanumériques>` | `sk_live_4f8c7e2a91b3d6e5a8c9f2e1b4d7a0c3` | À conserver côté serveur uniquement (jamais dans du code client / JS navigateur). |

> ⚠️ Le secret n'est affiché **qu'une seule fois** lors de sa génération. Conservez-le immédiatement dans un gestionnaire de secrets / variables d'environnement.

> ⚠️ **Ne jamais embarquer le `secret` dans un script JS exécuté par le navigateur.** Le formulaire de capture côté visiteur DOIT envoyer ses données à votre serveur (PHP, Node.js, Python…), qui à son tour appelle l'API CRMLeads avec le secret. Sinon n'importe quel visiteur peut voir le secret dans les outils développeur et créer des leads frauduleusement.

L'**URL de base** de l'API est `https://leads.vos2vis.net/api`. Toutes les routes ci-dessous y sont relatives.

---

## 3. Workflow général

```
Visiteur                Votre serveur              CRMLeads
   │                          │                       │
   │  Formulaire HTML         │                       │
   │ ───────────────────────► │                       │
   │                          │                       │
   │                          │ POST /partner/auth/token (1× par session)
   │                          │ ─────────────────────►│
   │                          │ ◄─────────────────────│ accessToken (1h)
   │                          │                       │
   │                          │ POST /partner/leads   │
   │                          │ Bearer accessToken    │
   │                          │ ─────────────────────►│
   │                          │ ◄─────────────────────│ 201 + leadId
   │  Page de confirmation    │                       │
   │ ◄─────────────────────── │                       │
```

L'`accessToken` est valide **1 heure**. Cachez-le côté serveur (mémoire process / Redis) pour ne pas en redemander un à chaque lead.

---

## 4. Endpoint d'authentification

### `POST /partner/auth/token`

Émet un jeton JWT valide 1 heure.

#### Requête

```http
POST https://leads.vos2vis.net/api/partner/auth/token
Content-Type: application/json

{
  "apiKey": "pk_AbCdEf1234567890XyZ12345",
  "secret": "sk_live_4f8c7e2a91b3d6e5a8c9f2e1b4d7a0c3"
}
```

#### Réponse 200 — succès

```json
{
  "success": true,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "expiresAt": "2026-05-07T11:30:00.000Z"
  }
}
```

#### Erreurs

| HTTP | code | Cause |
|------|------|-------|
| 400 | `VALIDATION_ERROR` | Body mal formé |
| 401 | `INVALID_CREDENTIALS` | Clé ou secret invalide (volontairement indistingable du compte désactivé) |
| 403 | `IP_NOT_ALLOWED` | Source IP hors whitelist (si configurée par CRMLeads) |
| 429 | `TOO_MANY_REQUESTS` | Plus de **10 demandes de jeton par minute par IP** |

---

## 5. Endpoint de création de lead

### `POST /partner/leads`

Crée un lead enrichi dans CRMLeads. Déclenche automatiquement le flux de scoring + distribution.

#### Requête

```http
POST https://leads.vos2vis.net/api/partner/leads
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "productType": "SANTE",
  "externalSource": "monsite-formulaire-mutuelle-v1",
  "consentProof": {
    "createdTime": "2026-05-07T10:32:00.000Z",
    "formId": "monsite-form-mutuelle-v1",
    "snapshotUrl": "https://monsite.example.com/forms/snapshots/abc-123.html"
  },
  "prospect": {
    "lastName": "Dupont",
    "firstName": "Marie",
    "email": "marie.dupont@example.com",
    "phone": "+33612345678",
    "postalCode": "75001",
    "age": 42
  },
  "familyComposition": {
    "members": [
      { "role": "TITULAIRE", "age": 42, "regime": "SECU_GENERAL" },
      { "role": "CONJOINT", "age": 39, "regime": "SECU_GENERAL" },
      { "role": "ENFANT", "age": 8, "regime": "SECU_GENERAL" }
    ]
  },
  "mutuelle": {
    "currentlyInsured": true,
    "insuredOverOneYear": true,
    "targetSwitchDate": "2026-09-01T00:00:00Z"
  },
  "comment": "Souhaite être contactée en fin d'après-midi"
}
```

#### Champs détaillés

##### Top-level

| Champ | Type | Obligatoire | Description |
|-------|------|:-----------:|-------------|
| `productType` | enum | ✓ | `SANTE` (mutuelle santé) ou `PRET` (assurance de prêt) |
| `externalSource` | string | ✓ | Identifiant libre du formulaire/canal (ex. `monsite-page-mutuelle`). Sert au tracking. 1–120 chars. |
| `consentProof` | objet | ✓ | Preuve de consentement RGPD (cf. ci-dessous) |
| `prospect` | objet | ✓ | Identité + contact (cf. ci-dessous) |
| `familyComposition` | objet | conditionnel | **Obligatoire si `productType=SANTE`** |
| `mutuelle` | objet | non | Contexte mutuelle actuelle |
| `comment` | string | non | Commentaire libre, ≤ 2000 chars |
| `metaRoutingRuleId` | string | non | Si fourni, force le routage vers cette règle Meta (admin uniquement). En usage standard : laisser vide. |

##### `consentProof` (RGPD obligatoire)

| Champ | Type | Obligatoire | Description |
|-------|------|:-----------:|-------------|
| `createdTime` | ISO 8601 datetime | ✓ | Horodatage de la soumission du formulaire par le visiteur. Doit être ≤ now. |
| `formId` | string | ✓ | Identifiant unique de votre formulaire (1–120 chars). Persiste les leads d'un même formulaire ensemble. |
| `snapshotUrl` | URL https | non | URL pointant vers une copie horodatée du formulaire tel qu'il a été affiché au prospect (audit RGPD). Recommandé. |

> Cette preuve est exigée pour toute création (constitution interne CRMLeads, conformité RGPD). Sans elle → **400 VALIDATION_ERROR**.

##### `prospect`

| Champ | Type | Obligatoire | Validation |
|-------|------|:-----------:|------------|
| `lastName` | string | ✓ | 2–100 chars |
| `firstName` | string | ✓ | 2–100 chars |
| `email` | email | conditionnel | requis si `phone` absent |
| `phone` | string | conditionnel | requis si `email` absent. Format `+33XXXXXXXXX` ou 10–15 chiffres avec ou sans `+`. |
| `postalCode` | string | ✓ | Code postal FR à 5 chiffres |
| `age` | int | ✓ | 18–120 |

> Au moins un des deux entre `email` et `phone` est obligatoire. Idéalement les deux pour maximiser le scoring qualité (un lead avec email+phone est mieux noté qu'un lead avec seulement l'un).

##### `familyComposition` (santé uniquement)

```json
{
  "members": [
    { "role": "TITULAIRE", "age": 42, "regime": "SECU_GENERAL" },
    { "role": "CONJOINT", "age": 39, "regime": "TNS" },
    { "role": "ENFANT", "age": 8, "regime": "SECU_GENERAL" }
  ]
}
```

| Champ | Type | Validation |
|-------|------|------------|
| `members` | array | 1–20 entrées, **exactement 1 `TITULAIRE`**, ≤ 1 `CONJOINT`, ≤ 10 `ENFANT` |
| `members[].role` | enum | `TITULAIRE` \| `CONJOINT` \| `ENFANT` |
| `members[].age` | int | 0–120 |
| `members[].regime` | enum | `SECU_GENERAL` \| `TNS` \| `AGRICOLE_MSA` \| `ALSACE_MOSELLE` \| `ETUDIANT` \| `FONCTION_PUBLIQUE` \| `AUTRE` |

##### `mutuelle` (santé, optionnel)

| Champ | Type | Description |
|-------|------|-------------|
| `currentlyInsured` | bool | Le prospect a-t-il déjà une mutuelle ? |
| `insuredOverOneYear` | bool | Si `currentlyInsured=true` : est-ce depuis plus d'un an ? **Requis si `currentlyInsured=true`.** |
| `targetSwitchDate` | ISO datetime | Date à laquelle le prospect souhaite changer (≥ today) |

#### Réponse 201 — lead créé

```json
{
  "success": true,
  "data": {
    "leadId": "cmoxxxxx0000abc123",
    "status": "NEW",
    "distributed": false,
    "isDuplicate": false
  }
}
```

| Champ | Description |
|-------|-------------|
| `leadId` | Identifiant CRMLeads du lead. À conserver côté votre système si vous comptez consulter le lead plus tard (interface admin). |
| `status` | Statut initial du cycle de vie (typiquement `NEW`). |
| `distributed` | `true` si la distribution a abouti synchroniquement (rare). En général `false` car la distribution est asynchrone — elle se déclenche dans les secondes qui suivent. |
| `isDuplicate` | `false` pour un lead créé. |

#### Réponse 200 — doublon détecté

```json
{
  "success": true,
  "data": {
    "leadId": "cmo_existing_lead_id",
    "status": "NEW",
    "distributed": true,
    "isDuplicate": true
  }
}
```

CRMLeads détecte un doublon en se basant sur l'email **et** le téléphone du prospect. Si une correspondance récente existe, **aucun nouveau lead n'est créé** — l'ID du lead existant est retourné. Côté votre système, traitez ce cas comme un succès (le prospect est déjà connu de CRMLeads).

#### Réponses d'erreur

| HTTP | code | Cause | Action |
|------|------|-------|--------|
| 400 | `VALIDATION_ERROR` | Champ manquant ou invalide. `details` contient la liste des erreurs zod. | Corriger la requête |
| 401 | `MISSING_TOKEN` | Header `Authorization` absent | Ajouter le Bearer |
| 401 | `INVALID_TOKEN` | Jeton expiré ou révoqué | Re-authentifier |
| 403 | `IP_NOT_ALLOWED` | Source IP hors whitelist | Contacter CRMLeads |
| 429 | `TOO_MANY_REQUESTS` | Plus de **100 créations / 10 secondes / partenaire** | Backoff exponentiel |

Exemple de réponse 400 :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Corps de requête invalide.",
    "details": [
      { "code": "invalid_string", "validation": "email", "path": ["prospect", "email"], "message": "Invalid email" },
      { "code": "custom", "path": ["familyComposition"], "message": "familyComposition requis pour productType=SANTE" }
    ]
  }
}
```

---

## 6. Bonnes pratiques

### Sécurité côté serveur

- **Le secret reste côté serveur** : votre formulaire envoie au backend (PHP/Node/etc.), qui appelle CRMLeads. Pas de fetch direct depuis le navigateur.
- Stockez `secret` dans une variable d'environnement, jamais en clair dans le code versionné.
- Activez la **whitelist IP** côté CRMLeads dès que possible (donnez vos IPs sortantes).

### Anti-spam (votre formulaire visiteur)

CRMLeads applique du rate-limiting et un scoring qualité, mais c'est mieux de filtrer en amont :

- **Honeypot** : un champ caché que les humains ne remplissent jamais ; si rempli → bot, ne pas appeler l'API.
- **Délai minimal** : si le formulaire est soumis < 2 secondes après chargement, c'est un bot.
- **CAPTCHA** (reCAPTCHA / Turnstile / hCaptcha) sur les formulaires à fort volume.
- **Validation côté serveur** des formats (email, téléphone, code postal) avant l'appel API.

### Gestion du jeton

- Cache l'`accessToken` côté serveur (mémoire ou Redis) avec TTL = `expiresAt − 60s`.
- Sur 401 `INVALID_TOKEN` lors d'un appel métier, redemande un jeton et **retente UNE fois** la requête.

### Idempotence et retry

- Une même soumission utilisateur → un seul appel API (n'envoyez pas en parallèle).
- Sur erreur 5xx, retry avec backoff exponentiel (1s, 2s, 4s, max 5 tentatives).
- Sur erreur 4xx (sauf 401 expiré), **n'insistez pas** : la requête est invalide ; corrigez la cause et logguez l'incident.

### RGPD

- Affichez clairement à l'utilisateur final que ses données seront transmises à CRMLeads et ses partenaires courtiers.
- Conservez une trace horodatée de la case « j'accepte » (le `consentProof.createdTime` que vous envoyez).
- Le `formId` doit être stable ; le `snapshotUrl` (recommandé) doit pointer vers une copie immuable du formulaire affiché.

### Logs

Pour chaque création tentée, conservez :
- timestamp
- email + téléphone (anonymisés en log si possible)
- code HTTP de réponse
- `leadId` retourné
- `isDuplicate` retourné
- code d'erreur si échec

Ne jamais logger en clair l'`accessToken` ni le `secret`.

---

## 7. Limites techniques

| Limite | Valeur |
|--------|--------|
| Jeton — durée de vie | 1 heure |
| Rate limit `/partner/auth/token` | 10 / minute / IP |
| Rate limit `/partner/leads` | 100 / 10 secondes / partenaire |
| Taille max body | 1 Mo (largement suffisant) |
| TLS | TLS 1.2 minimum |

---

## 8. Exemple complet (Node.js / Express)

```javascript
import express from 'express';

const API_BASE = 'https://leads.vos2vis.net/api';
const API_KEY = process.env.CRMLEADS_API_KEY;        // pk_…
const API_SECRET = process.env.CRMLEADS_API_SECRET;  // sk_live_…

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;
  const res = await fetch(`${API_BASE}/partner/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY, secret: API_SECRET }),
  });
  if (!res.ok) throw new Error(`Auth failed: HTTP ${res.status}`);
  const { data } = await res.json();
  cachedToken = data.accessToken;
  tokenExpiresAt = new Date(data.expiresAt).getTime();
  return cachedToken;
}

async function createLead(payload) {
  let token = await getToken();
  let res = await fetch(`${API_BASE}/partner/leads`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // Retry once on 401 (token expired between getToken and call)
  if (res.status === 401) {
    cachedToken = null;
    token = await getToken();
    res = await fetch(`${API_BASE}/partner/leads`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  const body = await res.json();
  if (!res.ok) throw new Error(`Create lead failed: ${body?.error?.code ?? `HTTP ${res.status}`}`);
  return body.data; // { leadId, status, distributed, isDuplicate }
}

// Endpoint serveur appelé par votre formulaire
const app = express();
app.use(express.json());

app.post('/api/submit-mutuelle-form', async (req, res) => {
  // 1. Anti-spam (honeypot, timing)
  if (req.body.website) return res.json({ ok: true }); // bot honeypot
  if (req.body._ts && Date.now() - parseInt(req.body._ts, 10) < 2000) {
    return res.status(400).json({ error: 'spam_timing' });
  }

  // 2. Construction du payload CRMLeads
  const payload = {
    productType: 'SANTE',
    externalSource: 'monsite-formulaire-mutuelle-v1',
    consentProof: {
      createdTime: new Date().toISOString(),
      formId: 'monsite-form-mutuelle-v1',
      snapshotUrl: `https://monsite.example.com/forms/snapshots/${req.body.snapshotId}.html`,
    },
    prospect: {
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      email: req.body.email,
      phone: req.body.phone,
      postalCode: req.body.postalCode,
      age: parseInt(req.body.age, 10),
    },
    familyComposition: {
      members: [
        { role: 'TITULAIRE', age: parseInt(req.body.age, 10), regime: req.body.regime ?? 'SECU_GENERAL' },
        ...(req.body.spouseAge ? [{ role: 'CONJOINT', age: parseInt(req.body.spouseAge, 10), regime: req.body.spouseRegime ?? 'SECU_GENERAL' }] : []),
        ...(req.body.children ?? []).map((c) => ({ role: 'ENFANT', age: parseInt(c.age, 10), regime: c.regime ?? 'SECU_GENERAL' })),
      ],
    },
    mutuelle: {
      currentlyInsured: req.body.currentlyInsured === 'oui',
      ...(req.body.currentlyInsured === 'oui' && {
        insuredOverOneYear: req.body.insuredOverOneYear === 'oui',
      }),
      ...(req.body.targetSwitchDate && { targetSwitchDate: new Date(req.body.targetSwitchDate).toISOString() }),
    },
    comment: req.body.comment,
  };

  // 3. Appel CRMLeads
  try {
    const result = await createLead(payload);
    res.json({
      ok: true,
      isDuplicate: result.isDuplicate,
      // Optionnel : ne pas exposer le leadId au navigateur si pas nécessaire
    });
  } catch (err) {
    console.error('crmleads-create-failed', err);
    res.status(500).json({ error: 'create_failed' });
  }
});

app.listen(3000);
```

### Exemple cURL

```bash
# 1. Authentification
TOKEN=$(curl -s -X POST https://leads.vos2vis.net/api/partner/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\":\"$CRMLEADS_API_KEY\",\"secret\":\"$CRMLEADS_API_SECRET\"}" \
  | jq -r '.data.accessToken')

# 2. Création de lead
curl -X POST https://leads.vos2vis.net/api/partner/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productType": "SANTE",
    "externalSource": "monsite-formulaire-mutuelle-v1",
    "consentProof": {
      "createdTime": "2026-05-07T10:32:00.000Z",
      "formId": "monsite-form-mutuelle-v1"
    },
    "prospect": {
      "lastName": "Dupont",
      "firstName": "Marie",
      "email": "marie.dupont@example.com",
      "phone": "+33612345678",
      "postalCode": "75001",
      "age": 42
    },
    "familyComposition": {
      "members": [
        { "role": "TITULAIRE", "age": 42, "regime": "SECU_GENERAL" }
      ]
    }
  }'
```

---

## 9. Procédure de mise en route

1. CRMLeads vous transmet `apiKey` et `secret` (canal sécurisé).
2. Vous testez l'authentification : `POST /partner/auth/token` doit retourner un JWT.
3. Vous testez la création d'un lead pilote (avec un email/téléphone dédiés au test).
4. Vérifiez avec CRMLeads que le lead apparaît côté admin avec les bonnes données enrichies (composition familiale, mutuelle).
5. Mise en production progressive (commencez avec 10 % du trafic, observez le `isDuplicate` et le scoring qualité, puis montez).

---

## 10. Que se passe-t-il après la création ?

1. **Persistance** : le lead est stocké en BDD avec sa preuve RGPD.
2. **Détection doublon** : si email+téléphone correspondent à un lead récent → réponse 200 avec `isDuplicate=true`, pas de nouveau lead créé.
3. **Scoring qualité** : un score interne est calculé (basé sur la complétude email/phone). En dessous de 50, le lead est marqué non-éligible et n'est pas distribué.
4. **Distribution** : si éligible et non doublon, le lead est routé vers un courtier selon les règles actives. C'est asynchrone (typiquement < 5 secondes).
5. **Push descendant** (si applicable) : si le courtier cible utilise un CRM tiers (Azzur, Vos2vis…), le lead est poussé automatiquement et un `idCrmCible` est récupéré.

Vous n'avez **rien à faire** pendant ces étapes — le `leadId` retourné suffit pour vos usages internes.

---

## Annexe — Glossaire

| Terme | Définition |
|-------|------------|
| **`leadId`** | Identifiant unique du lead côté CRMLeads. Stable, à conserver côté votre système si vous voulez référencer le lead plus tard. |
| **`accessToken`** | Jeton JWT signé HS256, valide 1h, à présenter dans le header `Authorization: Bearer …`. |
| **`consentProof`** | Preuve de consentement RGPD obligatoire à la création. |
| **`isDuplicate`** | Indicateur que le lead correspond à un lead existant (basé sur email + téléphone). |
| **Doublon récent** | CRMLeads considère un lead comme doublon s'il a déjà été reçu par un autre canal et est dans un état non terminal (non abandonné, non perdu). |
| **`externalSource`** | Identifiant libre de la source (votre formulaire, votre canal). Permet à l'admin CRMLeads de filtrer / analyser par source. |
