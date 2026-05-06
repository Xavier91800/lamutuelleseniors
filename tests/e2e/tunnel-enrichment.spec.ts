import { test, expect } from '@playwright/test';

test.describe('Tunnel enrichment step (US3)', () => {
  test('a senior can complete the tunnel without filling any optional field', async ({ page }) => {
    await page.goto('/tunnel');

    await page.getByLabel(/date de naissance/i).fill('1955-03-12');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/code postal/i).fill('75015');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/^nom/i).fill('Skip');
    await page.getByLabel(/^prénom/i).fill('Optional');
    await page.getByRole('button', { name: /continuer/i }).click();

    // Famille
    await page.getByRole('button', { name: /continuer/i }).click();

    // Optional step — click "Passer cette étape"
    await page.getByRole('button', { name: /passer cette étape/i }).click();

    // Consent
    await page.getByLabel(/transmises aux courtiers/i).check();
    await page.getByLabel(/traitées par l'éditeur/i).check();
    await page.getByRole('button', { name: /envoyer ma demande/i }).click();

    await expect(page).toHaveURL(/\/tunnel\/confirmation/);
  });

  test('a senior can fill every optional field and reach the confirmation', async ({ page }) => {
    await page.goto('/tunnel');

    await page.getByLabel(/date de naissance/i).fill('1955-03-12');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/code postal/i).fill('75015');
    await page.getByRole('button', { name: /continuer/i }).click();

    await page.getByLabel(/^nom/i).fill('Full');
    await page.getByLabel(/^prénom/i).fill('Enrichment');
    await page.getByLabel(/email/i).fill('full@example.com');
    await page.getByLabel(/téléphone/i).fill('0612345678');
    await page.getByRole('button', { name: /continuer/i }).click();

    // Famille
    await page.getByRole('button', { name: /continuer/i }).click();

    // Optional step — fill everything
    await page.getByLabel(/régime/i).selectOption('1');
    await page.getByLabel(/niveau de garantie/i).selectOption('renforce');
    await page.getByLabel(/situation actuelle/i).selectOption('mutuelle_actuelle');
    await page.getByLabel(/date d'effet/i).fill('2026-09-01');
    await page.getByRole('button', { name: /continuer/i }).first().click();

    // Consent
    await page.getByLabel(/transmises aux courtiers/i).check();
    await page.getByLabel(/traitées par l'éditeur/i).check();
    await page.getByRole('button', { name: /envoyer ma demande/i }).click();

    await expect(page).toHaveURL(/\/tunnel\/confirmation/);
  });
});
