import { describe, it, expect } from 'vitest';
import { nextRetryAt, MAX_ATTEMPTS } from '@/lib/retry/backoff';

const NOW = new Date('2026-05-06T12:00:00Z');

describe('nextRetryAt', () => {
  it('returns ~ +1 minute after attempt 1', () => {
    const next = nextRetryAt(1, NOW);
    expect(next).not.toBeNull();
    const delta = (next!.getTime() - NOW.getTime()) / 1000;
    expect(delta).toBeGreaterThan(60 * 0.85);
    expect(delta).toBeLessThan(60 * 1.15);
  });

  it('returns ~ +5 minutes after attempt 2', () => {
    const next = nextRetryAt(2, NOW);
    const delta = (next!.getTime() - NOW.getTime()) / 1000;
    expect(delta).toBeGreaterThan(5 * 60 * 0.85);
    expect(delta).toBeLessThan(5 * 60 * 1.15);
  });

  it('returns ~ +15 minutes after attempt 3', () => {
    const next = nextRetryAt(3, NOW);
    const delta = (next!.getTime() - NOW.getTime()) / 1000;
    expect(delta).toBeGreaterThan(15 * 60 * 0.85);
    expect(delta).toBeLessThan(15 * 60 * 1.15);
  });

  it('returns ~ +1h, +6h, +24h on attempts 4, 5, 6 (within ±15%)', () => {
    const h4 = (nextRetryAt(4, NOW)!.getTime() - NOW.getTime()) / 3600_000;
    const h5 = (nextRetryAt(5, NOW)!.getTime() - NOW.getTime()) / 3600_000;
    const h6 = (nextRetryAt(6, NOW)!.getTime() - NOW.getTime()) / 3600_000;
    expect(h4).toBeGreaterThan(1 * 0.85);
    expect(h4).toBeLessThan(1 * 1.15);
    expect(h5).toBeGreaterThan(6 * 0.85);
    expect(h5).toBeLessThan(6 * 1.15);
    expect(h6).toBeGreaterThan(24 * 0.85);
    expect(h6).toBeLessThan(24 * 1.15);
  });

  it('returns null when attempts exceed MAX_ATTEMPTS (= 6)', () => {
    expect(MAX_ATTEMPTS).toBe(6);
    expect(nextRetryAt(7, NOW)).toBeNull();
    expect(nextRetryAt(99, NOW)).toBeNull();
  });
});
