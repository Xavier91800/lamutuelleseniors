import { describe, it, expect } from 'vitest';
import { leadRequestSchema } from '@/lib/validation/leadSchema';

const validBase = {
  nom: 'Dupont',
  prenom: 'Jeanne',
  date_naissance: '1955-03-12',
  code_postal: '75015',
  consent: {
    data_processing: true,
    courtier_transmission: true,
    cgu_version: '1.0',
    pdc_version: '1.0',
  },
  client_session_id: 'cs_xxxxxxxxxxxx',
  tunnel_started_at_ms: Date.now() - 30_000,
  honeypot_zip: '',
} as const;

describe('leadRequestSchema', () => {
  it('accepts the happy-path payload', () => {
    const parsed = leadRequestSchema.safeParse(validBase);
    expect(parsed.success).toBe(true);
  });

  it('rejects an empty nom', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, nom: '' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a future date_naissance', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, date_naissance: '2999-01-01' });
    expect(parsed.success).toBe(false);
  });

  it('rejects an age above 120', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, date_naissance: '1850-01-01' });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unsupported postal code (98xxx)', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, code_postal: '98800' });
    expect(parsed.success).toBe(false);
  });

  it('accepts a DOM postal code (97400)', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, code_postal: '97400' });
    expect(parsed.success).toBe(true);
  });

  it('requires consent.courtier_transmission to be true', () => {
    const parsed = leadRequestSchema.safeParse({
      ...validBase,
      consent: { ...validBase.consent, courtier_transmission: false },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid email when provided', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, email: 'not-an-email' });
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid French phone when provided', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, telephone: '12345' });
    expect(parsed.success).toBe(false);
  });

  it('requires conjoint_present and enfants_dates_naissance for age < 55', () => {
    const parsed = leadRequestSchema.safeParse({ ...validBase, date_naissance: '1990-01-01' });
    expect(parsed.success).toBe(false);
  });

  it('accepts age < 55 when conjoint_present is provided', () => {
    const parsed = leadRequestSchema.safeParse({
      ...validBase,
      date_naissance: '1990-01-01',
      conjoint_present: 0,
      enfants_dates_naissance: [],
    });
    expect(parsed.success).toBe(true);
  });
});
