import { describe, it, expect } from 'vitest';
import { leadRequestSchema } from '@/lib/validation/leadSchema';

const base = {
  nom: 'Dupont',
  prenom: 'Jeanne',
  date_naissance: '1955-03-12',
  code_postal: '75015',
  consent: {
    data_processing: true,
    courtier_transmission: true,
    cgu_version: '1.1',
    pdc_version: '1.2',
  },
  client_session_id: 'cs_xxxxxxxxxxxx',
  tunnel_started_at_ms: Date.now() - 30_000,
  hp_zip: '',
} as const;

describe('leadRequestSchema enrichment', () => {
  it('accepts all enrichment fields together', () => {
    const parsed = leadRequestSchema.safeParse({
      ...base,
      regime: 1,
      niveau_garantie: 'equilibre',
      situation_actuelle: 'mutuelle_actuelle',
      date_effet_souhaitee: '2026-09-01',
      email: 'jeanne@example.com',
      telephone: '0612345678',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts the lead with no enrichment fields at all', () => {
    const parsed = leadRequestSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid niveau_garantie enum value', () => {
    const parsed = leadRequestSchema.safeParse({
      ...base,
      niveau_garantie: 'extreme',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid situation_actuelle enum value', () => {
    const parsed = leadRequestSchema.safeParse({
      ...base,
      situation_actuelle: 'inconnu',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a malformed date_effet_souhaitee', () => {
    const parsed = leadRequestSchema.safeParse({
      ...base,
      date_effet_souhaitee: '01/09/2026',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-integer regime', () => {
    const parsed = leadRequestSchema.safeParse({
      ...base,
      regime: 1.5,
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts an explicitly null/undefined optional field', () => {
    // A common client mistake is to send `undefined`; zod's optional() should ignore them.
    const parsed = leadRequestSchema.safeParse({
      ...base,
      regime: undefined,
      niveau_garantie: undefined,
      situation_actuelle: undefined,
    });
    expect(parsed.success).toBe(true);
  });
});
