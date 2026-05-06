import { describe, it, expect, beforeEach } from 'vitest';
import { isHoneypotTriggered, HONEYPOT_FIELD } from '@/lib/antibot/honeypot';
import { rateLimit, resetRateLimitForTests } from '@/lib/antibot/rateLimit';

describe('honeypot', () => {
  it('exposes a stable field name', () => {
    expect(HONEYPOT_FIELD).toBe('hp_zip');
  });

  it('returns true when the honeypot field is filled', () => {
    expect(isHoneypotTriggered({ [HONEYPOT_FIELD]: 'spam' })).toBe(true);
  });

  it('returns false when the honeypot field is empty or missing', () => {
    expect(isHoneypotTriggered({ [HONEYPOT_FIELD]: '' })).toBe(false);
    expect(isHoneypotTriggered({})).toBe(false);
    expect(isHoneypotTriggered({ [HONEYPOT_FIELD]: null })).toBe(false);
  });
});

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it('allows up to N submissions per IP per hour', () => {
    for (let i = 0; i < 10; i++) {
      const r = rateLimit('1.2.3.4', { perHour: 10 });
      expect(r.allowed).toBe(true);
    }
  });

  it('rejects the 11th submission from the same IP within an hour', () => {
    for (let i = 0; i < 10; i++) {
      rateLimit('5.6.7.8', { perHour: 10 });
    }
    const r = rateLimit('5.6.7.8', { perHour: 10 });
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('isolates buckets per IP', () => {
    for (let i = 0; i < 10; i++) {
      rateLimit('9.9.9.9', { perHour: 10 });
    }
    expect(rateLimit('9.9.9.9', { perHour: 10 }).allowed).toBe(false);
    expect(rateLimit('1.1.1.1', { perHour: 10 }).allowed).toBe(true);
  });
});
