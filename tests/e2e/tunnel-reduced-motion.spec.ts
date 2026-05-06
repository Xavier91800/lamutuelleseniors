import { test, expect } from '@playwright/test';

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('Tunnel with prefers-reduced-motion: reduce (US2)', () => {
  test('the funnel still completes correctly without animation', async ({ page }) => {
    await page.goto('/tunnel');

    // Run through the tunnel quickly — no transitions to wait for.
    await page.getByLabel(/date de naissance/i).fill('1960-03-12');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/code postal/i).fill('75015');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/^nom/i).fill('Dupont');
    await page.getByLabel(/^prénom/i).fill('Jeanne');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByRole('button', { name: /continuer/i }).click(); // famille step

    // Optional step — skip directly to consent
    await page.getByRole('button', { name: /passer cette étape/i }).click();

    await expect(page.getByText(/transmises aux courtiers/i).first()).toBeVisible();
  });
});
