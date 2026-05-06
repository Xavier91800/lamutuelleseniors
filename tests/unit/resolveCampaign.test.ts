import { describe, it, expect } from 'vitest';
import { resolveCampaign } from '@/lib/campaign/resolveCampaign';

describe('resolveCampaign (FR-028)', () => {
  it('routes age >= 55 to senior, regardless of family', () => {
    expect(resolveCampaign({ age: 55, conjoint_present: 0, enfants_count: 0 })).toBe('senior');
    expect(resolveCampaign({ age: 70, conjoint_present: 1, enfants_count: 0 })).toBe('senior');
    expect(resolveCampaign({ age: 80, conjoint_present: 1, enfants_count: 2 })).toBe('senior');
  });

  it('routes age < 55 with conjoint to under55_family', () => {
    expect(resolveCampaign({ age: 45, conjoint_present: 1, enfants_count: 0 })).toBe(
      'under55_family'
    );
  });

  it('routes age < 55 with enfants to under55_family', () => {
    expect(resolveCampaign({ age: 35, conjoint_present: 0, enfants_count: 1 })).toBe(
      'under55_family'
    );
    expect(resolveCampaign({ age: 42, conjoint_present: 0, enfants_count: 3 })).toBe(
      'under55_family'
    );
  });

  it('routes age < 55 alone to under55_solo', () => {
    expect(resolveCampaign({ age: 30, conjoint_present: 0, enfants_count: 0 })).toBe(
      'under55_solo'
    );
    expect(resolveCampaign({ age: 54, conjoint_present: 0, enfants_count: 0 })).toBe(
      'under55_solo'
    );
  });

  it('uses 55 as the inclusive senior threshold', () => {
    expect(resolveCampaign({ age: 54, conjoint_present: 0, enfants_count: 0 })).toBe(
      'under55_solo'
    );
    expect(resolveCampaign({ age: 55, conjoint_present: 0, enfants_count: 0 })).toBe('senior');
  });
});
