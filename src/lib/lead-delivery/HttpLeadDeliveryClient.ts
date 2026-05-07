import type { CampaignId } from '@/types/lead';
import type {
  DeliveryResult,
  LeadDeliveryClient,
  LeadDeliveryPayload,
} from './LeadDeliveryClient';
import { logger, redactPii } from '@/lib/logging/logger';

/**
 * Client HTTP pour la plateforme partenaire CRMLeads.
 *
 * Contrat : voir partner-lead-creation_v2.md à la racine du repo.
 * Endpoints :
 *   - POST {baseUrl}/partner/auth/token  → JWT (TTL 1h)
 *   - POST {baseUrl}/partner/leads       → 201 (créé) / 200 (doublon)
 *
 * Politique d'erreur :
 *   - 201 / 200          → success (avec provider_id = leadId CRMLeads)
 *   - 401 INVALID_TOKEN  → invalide le cache, ré-auth, retry une fois
 *   - 4xx (autres)       → permanent_failure (le worker n'insiste pas)
 *   - 429 / 5xx / réseau → retry (le worker applique son back-off exponentiel)
 *
 * Le constructeur ne fait aucun appel réseau — instanciation safe au boot.
 */

type RoutingRuleMap = Partial<Record<CampaignId, string>>;
type ProductType = 'SANTE' | 'PRET';
type Regime =
  | 'SECU_GENERAL'
  | 'TNS'
  | 'AGRICOLE_MSA'
  | 'ALSACE_MOSELLE'
  | 'ETUDIANT'
  | 'FONCTION_PUBLIQUE'
  | 'AUTRE';

interface PartnerLeadRequest {
  productType: ProductType;
  externalSource: string;
  metaRoutingRuleId?: string;
  consentProof: { createdTime: string; formId: string; snapshotUrl?: string };
  prospect: {
    lastName: string;
    firstName: string;
    email?: string;
    phone?: string;
    postalCode: string;
    age: number;
  };
  familyComposition: {
    members: { role: 'TITULAIRE' | 'CONJOINT' | 'ENFANT'; age: number; regime: Regime }[];
  };
  mutuelle?: {
    currentlyInsured: boolean;
    insuredOverOneYear?: boolean;
    targetSwitchDate?: string;
  };
  comment?: string;
}

const NIVEAU_LABELS: Record<string, string> = {
  economique: 'économique',
  equilibre: 'équilibre',
  renforce: 'renforcée',
  premium: 'premium',
};

const REGIME_BY_CODE: Record<number, Regime> = {
  1: 'SECU_GENERAL',
  2: 'TNS',
  3: 'AGRICOLE_MSA',
  4: 'ALSACE_MOSELLE',
  5: 'AGRICOLE_MSA',
};

export interface HttpLeadDeliveryClientConfig {
  baseUrl: string;
  apiKey: string;
  secret: string;
  externalSource: string;
  formId: string;
  routingRules: RoutingRuleMap;
  snapshotBaseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

export class HttpLeadDeliveryClient implements LeadDeliveryClient {
  private cachedToken: string | null = null;
  private tokenExpiresAtMs = 0;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => Date;

  constructor(private readonly cfg: HttpLeadDeliveryClientConfig) {
    if (!cfg.baseUrl || !cfg.apiKey || !cfg.secret) {
      throw new Error('HttpLeadDeliveryClient: baseUrl, apiKey and secret are required');
    }
    if (!cfg.externalSource || !cfg.formId) {
      throw new Error('HttpLeadDeliveryClient: externalSource and formId are required');
    }
    this.fetchImpl = cfg.fetchImpl ?? fetch;
    this.now = cfg.now ?? (() => new Date());
  }

  /**
   * Construit un client à partir des variables d'environnement.
   * Lance une erreur explicite si une variable obligatoire manque.
   */
  static fromEnv(): HttpLeadDeliveryClient {
    const required = (name: string): string => {
      const value = process.env[name];
      if (!value) {
        throw new Error(`HttpLeadDeliveryClient: env var ${name} is required when LEAD_DELIVERY_MODE=http`);
      }
      return value;
    };
    const optional = (name: string): string | undefined => process.env[name] || undefined;

    return new HttpLeadDeliveryClient({
      baseUrl: required('LEAD_DELIVERY_API_BASE_URL'),
      apiKey: required('LEAD_DELIVERY_API_KEY'),
      secret: required('LEAD_DELIVERY_API_SECRET'),
      externalSource: required('LEAD_DELIVERY_EXTERNAL_SOURCE'),
      formId: required('LEAD_DELIVERY_FORM_ID'),
      routingRules: {
        senior: optional('LEAD_DELIVERY_ROUTING_RULE_ID_SENIOR'),
        under55_family: optional('LEAD_DELIVERY_ROUTING_RULE_ID_UNDER55_FAMILY'),
        under55_solo: optional('LEAD_DELIVERY_ROUTING_RULE_ID_UNDER55_SOLO'),
      },
      snapshotBaseUrl: optional('LEAD_DELIVERY_SNAPSHOT_BASE_URL'),
    });
  }

  async deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult> {
    if (!payload.identity.email && !payload.identity.telephone) {
      logger.warn(
        { event: 'delivery_http_skipped', lead_id: payload.lead_id, reason: 'no_contact_channel' },
        'http_delivery_skipped'
      );
      return {
        status: 'permanent_failure',
        mode: 'http',
        reason: 'email_or_phone_required',
      };
    }

    let body: PartnerLeadRequest;
    try {
      body = this.mapPayload(payload);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'mapping_failed';
      logger.error(
        { event: 'delivery_http_mapping_failed', lead_id: payload.lead_id, reason },
        'http_delivery_mapping_failed'
      );
      return { status: 'permanent_failure', mode: 'http', reason };
    }

    try {
      const first = await this.attemptCreate(body, payload.lead_id, false);
      if (first.kind === 'ok') {
        return { status: 'success', mode: 'http', http_status: first.status, provider_id: first.providerId };
      }
      if (first.kind === 'token_expired') {
        this.invalidateToken();
        const second = await this.attemptCreate(body, payload.lead_id, true);
        if (second.kind === 'ok') {
          return { status: 'success', mode: 'http', http_status: second.status, provider_id: second.providerId };
        }
        if (second.kind === 'token_expired') {
          // Two consecutive 401 → treat as permanent (auth misconfig, not a transient hiccup)
          return {
            status: 'permanent_failure',
            mode: 'http',
            http_status: 401,
            reason: 'invalid_credentials',
          };
        }
        return this.errorToResult(second);
      }
      return this.errorToResult(first);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'network_error';
      logger.warn(
        { event: 'delivery_http_network_err', lead_id: payload.lead_id, reason },
        'http_delivery_network_err'
      );
      return { status: 'retry', mode: 'http', reason };
    }
  }

  // ---------- mapping ----------

  private mapPayload(payload: LeadDeliveryPayload): PartnerLeadRequest {
    const titulaireAge = ageFromDob(payload.identity.date_naissance, this.now());
    const titulaireRegime = mapRegime(payload.qualifications?.regime);

    const members: PartnerLeadRequest['familyComposition']['members'] = [
      { role: 'TITULAIRE', age: titulaireAge, regime: titulaireRegime },
    ];

    const conjoint = payload.qualifications?.conjoint;
    if (conjoint?.date_naissance) {
      members.push({
        role: 'CONJOINT',
        age: ageFromDob(conjoint.date_naissance, this.now()),
        regime: 'SECU_GENERAL',
      });
    }

    for (const dob of payload.qualifications?.enfants_dates_naissance ?? []) {
      members.push({
        role: 'ENFANT',
        age: ageFromDob(dob, this.now()),
        regime: 'SECU_GENERAL',
      });
    }

    const body: PartnerLeadRequest = {
      productType: 'SANTE',
      externalSource: this.cfg.externalSource,
      consentProof: {
        createdTime: payload.consent.granted_at,
        formId: this.cfg.formId,
      },
      prospect: {
        lastName: payload.identity.nom,
        firstName: payload.identity.prenom,
        postalCode: payload.identity.code_postal,
        age: titulaireAge,
      },
      familyComposition: { members },
    };

    if (payload.identity.email) body.prospect.email = payload.identity.email;
    if (payload.identity.telephone) body.prospect.phone = normalizePhone(payload.identity.telephone);

    if (this.cfg.snapshotBaseUrl) {
      body.consentProof.snapshotUrl = `${this.cfg.snapshotBaseUrl.replace(/\/$/, '')}/${payload.lead_id}`;
    }

    const routingRuleId = this.cfg.routingRules[payload.campaign_id];
    if (routingRuleId) body.metaRoutingRuleId = routingRuleId;

    // Mutuelle : on ne renseigne le bloc que si on est sûr de pouvoir respecter le contrat
    // (currentlyInsured=true REQUIERT insuredOverOneYear, qu'on n'a pas dans le tunnel).
    const sit = payload.qualifications?.situation_actuelle;
    if (sit === 'aucune_mutuelle') {
      body.mutuelle = { currentlyInsured: false };
      if (payload.qualifications?.date_effet_souhaitee) {
        body.mutuelle.targetSwitchDate = isoDateToDateTime(payload.qualifications.date_effet_souhaitee);
      }
    }

    const niveau = payload.qualifications?.niveau_garantie;
    if (niveau && NIVEAU_LABELS[niveau]) {
      body.comment = `Niveau de garantie souhaité : ${NIVEAU_LABELS[niveau]}.`;
    }

    return body;
  }

  // ---------- HTTP plumbing ----------

  private async attemptCreate(
    body: PartnerLeadRequest,
    leadId: string,
    isRetryAfter401: boolean
  ): Promise<AttemptResult> {
    const token = await this.getToken();
    const res = await this.fetchImpl(`${this.cfg.baseUrl}/partner/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 201 || res.status === 200) {
      const json = (await safeJson(res)) as { data?: { leadId?: string; isDuplicate?: boolean } } | null;
      const providerId = json?.data?.leadId;
      logger.info(
        {
          event: 'delivery_http_ok',
          lead_id: leadId,
          http_status: res.status,
          provider_id: providerId,
          is_duplicate: json?.data?.isDuplicate ?? false,
        },
        'http_delivery_ok'
      );
      return { kind: 'ok', status: res.status, providerId };
    }

    const errJson = (await safeJson(res)) as { error?: { code?: string; message?: string } } | null;
    const code = errJson?.error?.code;

    if (res.status === 401 && !isRetryAfter401 && (code === 'INVALID_TOKEN' || code === 'MISSING_TOKEN')) {
      return { kind: 'token_expired', status: 401, code };
    }

    return { kind: 'error', status: res.status, code: code ?? `HTTP_${res.status}` };
  }

  private errorToResult(err: AttemptError): DeliveryResult {
    if (err.status >= 500 || err.status === 429) {
      logger.warn(
        { event: 'delivery_http_transient', http_status: err.status, code: err.code },
        'http_delivery_transient'
      );
      return { status: 'retry', mode: 'http', http_status: err.status, reason: err.code };
    }
    logger.error(
      { event: 'delivery_http_permanent', http_status: err.status, code: err.code },
      'http_delivery_permanent'
    );
    return { status: 'permanent_failure', mode: 'http', http_status: err.status, reason: err.code };
  }

  private async getToken(): Promise<string> {
    const nowMs = this.now().getTime();
    if (this.cachedToken && nowMs < this.tokenExpiresAtMs - 60_000) {
      return this.cachedToken;
    }
    const res = await this.fetchImpl(`${this.cfg.baseUrl}/partner/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.cfg.apiKey, secret: this.cfg.secret }),
    });
    if (!res.ok) {
      const errJson = (await safeJson(res)) as { error?: { code?: string } } | null;
      const code = errJson?.error?.code ?? `HTTP_${res.status}`;
      throw new Error(`auth_failed_${code}`);
    }
    const json = (await res.json()) as {
      data: { accessToken: string; expiresAt: string };
    };
    this.cachedToken = json.data.accessToken;
    this.tokenExpiresAtMs = new Date(json.data.expiresAt).getTime();
    logger.info(
      { event: 'delivery_http_auth_ok', token_preview: redactPii(this.cachedToken) },
      'http_auth_ok'
    );
    return this.cachedToken;
  }

  private invalidateToken(): void {
    this.cachedToken = null;
    this.tokenExpiresAtMs = 0;
  }
}

// ---------- types internes ----------

type AttemptResult =
  | { kind: 'ok'; status: number; providerId?: string }
  | { kind: 'token_expired'; status: 401; code?: string }
  | AttemptError;
type AttemptError = { kind: 'error'; status: number; code: string };

// ---------- helpers ----------

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function ageFromDob(dob: string, asOf: Date): number {
  const d = new Date(dob);
  let age = asOf.getFullYear() - d.getFullYear();
  const monthDiff = asOf.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

function mapRegime(code: number | undefined): Regime {
  if (code === undefined) return 'AUTRE';
  return REGIME_BY_CODE[code] ?? 'AUTRE';
}

function normalizePhone(phone: string): string {
  const trimmed = phone.replace(/\s|\./g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('0')) return `+33${trimmed.slice(1)}`;
  return trimmed;
}

function isoDateToDateTime(yyyymmdd: string): string {
  return `${yyyymmdd}T00:00:00.000Z`;
}
