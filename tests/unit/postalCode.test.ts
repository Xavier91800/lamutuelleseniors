import { describe, it, expect } from 'vitest';
import { isAcceptedPostalCode } from '@/lib/validation/postalCode';

describe('postalCode', () => {
  it('accepts metropolitan codes 01000–95999', () => {
    expect(isAcceptedPostalCode('01000')).toBe(true);
    expect(isAcceptedPostalCode('75015')).toBe(true);
    expect(isAcceptedPostalCode('95999')).toBe(true);
    expect(isAcceptedPostalCode('13001')).toBe(true);
  });

  it('accepts DOM codes 97xxx', () => {
    expect(isAcceptedPostalCode('97400')).toBe(true);
    expect(isAcceptedPostalCode('97100')).toBe(true);
    expect(isAcceptedPostalCode('97300')).toBe(true);
  });

  it('rejects TOM codes 98xxx', () => {
    expect(isAcceptedPostalCode('98800')).toBe(false);
    expect(isAcceptedPostalCode('98700')).toBe(false);
  });

  it('rejects code 96xxx (no FR department)', () => {
    expect(isAcceptedPostalCode('96000')).toBe(false);
  });

  it('rejects code 99xxx', () => {
    expect(isAcceptedPostalCode('99999')).toBe(false);
  });

  it('rejects codes shorter or longer than 5 digits', () => {
    expect(isAcceptedPostalCode('7501')).toBe(false);
    expect(isAcceptedPostalCode('750155')).toBe(false);
    expect(isAcceptedPostalCode('')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(isAcceptedPostalCode('AB123')).toBe(false);
    expect(isAcceptedPostalCode('75 015')).toBe(false);
  });
});
