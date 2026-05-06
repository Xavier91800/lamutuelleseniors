import { describe, it, expect } from 'vitest';
import sitemap from '../../app/sitemap';
import robots from '../../app/robots';

describe('sitemap', () => {
  it('contains the home, all primary landings and the legal pages', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain('https://www.la-mutuelle-seniors.fr');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/mutuelle-senior');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/mutuelle-sante');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/comparatif-mutuelle-senior');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/comparatif-mutuelle-sante');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/meilleure-mutuelle-senior');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/devis-mutuelle-senior');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/mutuelle-sante-retraite');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/conditions-generales');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/politique-de-confidentialite');
    expect(urls).toContain('https://www.la-mutuelle-seniors.fr/mentions-legales');
  });

  it('does not list internal API routes or the confirmation page', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.includes('/api/'))).toBe(false);
    expect(urls.some((u) => u.includes('/tunnel/confirmation'))).toBe(false);
  });
});

describe('robots', () => {
  it('disallows /api/ and /tunnel/confirmation, allows the rest', () => {
    const r = robots();
    expect(r.rules).toBeDefined();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const main = rules.find((rule) => {
      const ua = rule?.userAgent;
      return ua === '*' || (Array.isArray(ua) && ua.includes('*'));
    });
    expect(main).toBeDefined();
    const disallow = Array.isArray(main!.disallow) ? main!.disallow : [main!.disallow];
    expect(disallow).toContain('/api/');
    expect(disallow).toContain('/tunnel/confirmation');
  });

  it('declares the sitemap URL', () => {
    expect(robots().sitemap).toBe('https://www.la-mutuelle-seniors.fr/sitemap.xml');
  });
});
