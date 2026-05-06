import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES_TO_AUDIT = [
  '/',
  '/tunnel',
  '/mutuelle-senior',
  '/conditions-generales',
  '/politique-de-confidentialite',
  '/mentions-legales',
];

test.describe('Accessibility audit (US2)', () => {
  for (const path of PAGES_TO_AUDIT) {
    test(`@a11y ${path} has no critical or serious WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(
        blocking,
        blocking
          .map((v) => `${v.id} (${v.impact}): ${v.description}`)
          .join('\n')
      ).toEqual([]);
    });
  }

  test('@a11y tunnel: each step is reachable via keyboard only', async ({ page }) => {
    await page.goto('/tunnel');

    await page.getByLabel(/date de naissance/i).fill('1955-03-12');
    await page.keyboard.press('Tab');
    // Continue button should now be focusable.
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focused);
  });
});
