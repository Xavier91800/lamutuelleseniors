import { test, expect } from '@playwright/test';

test.describe('Tunnel happy path (US1)', () => {
  test('senior user (65 yo) reaches the confirmation page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /obtenir mon devis|démarrer/i }).first()).toBeVisible();

    await page.getByRole('link', { name: /obtenir mon devis|démarrer/i }).first().click();

    await expect(page).toHaveURL(/\/tunnel/);

    await page.getByLabel(/date de naissance/i).fill('1960-03-12');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/code postal/i).fill('75015');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/^nom/i).fill('Dupont');
    await page.getByLabel(/^prénom/i).fill('Jeanne');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByRole('button', { name: /continuer/i }).click(); // Step04 (composition familiale, optional for ≥55)

    // Step05 (questions optionnelles) — skip
    await page.getByRole('button', { name: /passer cette étape/i }).click();

    // Consent step — both consents required to submit
    await page.getByLabel(/transmises aux courtiers/i).check();
    await page.getByLabel(/traitées par l'éditeur/i).check();

    await page.getByRole('button', { name: /envoyer ma demande/i }).click();

    await expect(page).toHaveURL(/\/tunnel\/confirmation/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/merci|confirmation/i);
  });
});
