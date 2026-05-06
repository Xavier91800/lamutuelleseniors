import { test, expect } from '@playwright/test';

test.describe('Back navigation preserves saisies (US2 AS2)', () => {
  test('returning to a previous step keeps the entered values', async ({ page }) => {
    await page.goto('/tunnel');

    // Step 0 — date_naissance
    await page.getByLabel(/date de naissance/i).fill('1955-03-12');
    await page.getByRole('button', { name: /continuer/i }).click();

    // Step 1 — code_postal
    await page.getByLabel(/code postal/i).fill('75015');
    await page.getByRole('button', { name: /continuer/i }).click();

    // Step 2 — nom + prénom
    await page.getByLabel(/^nom/i).fill('Dupont');
    await page.getByLabel(/^prénom/i).fill('Jeanne');

    // Go back twice
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByLabel(/code postal/i)).toHaveValue('75015');

    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByLabel(/date de naissance/i)).toHaveValue('1955-03-12');

    // Forward again — values should still be there
    await page.getByRole('button', { name: /continuer/i }).click();
    await expect(page.getByLabel(/code postal/i)).toHaveValue('75015');
    await page.getByRole('button', { name: /continuer/i }).click();
    await expect(page.getByLabel(/^nom/i)).toHaveValue('Dupont');
    await expect(page.getByLabel(/^prénom/i)).toHaveValue('Jeanne');
  });
});
