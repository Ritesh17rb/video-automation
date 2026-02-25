import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ritesh17rb.github.io/playground-testing/';

const pause = (page: import('@playwright/test').Page, ms = 2000) => page.waitForTimeout(ms);

const generateVaultKey = async (page: import('@playwright/test').Page) => {
  await page.locator('#shadow-generator-host').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    shadow?.querySelector<HTMLButtonElement>('#gen-btn')?.click();
  });
  await page.waitForFunction(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const display = shadow?.querySelector('#display');
    return Boolean(display && display.textContent && display.textContent.includes('-'));
  });
  return page.evaluate(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const display = shadow?.querySelector('#display');
    return display?.textContent?.trim() ?? null;
  });
};

test('playground pro – predictor to github replay', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Predictor wheel
  const spinButton = page.getByRole('button', { name: 'Predict Winner' });
  await expect(spinButton).toBeVisible();
  await spinButton.click();
  const resultBanner = page.locator('#spin-result');
  await expect(resultBanner).toHaveText(/Winner:/i, { timeout: 10_000 });
  await pause(page);

  // Quantum key generator inside the shadow DOM
  const generatedKey = await generateVaultKey(page);
  if (!generatedKey) {
    throw new Error('Failed to capture the generated vault key');
  }
  await pause(page);

  // Fetch playlist, open the first card, close modal
  const playlistButton = page.locator('#fetch-playlist');
  await playlistButton.scrollIntoViewIfNeeded();
  await playlistButton.click();
  const playlistCard = page.locator('.video-card').first();
  await expect(playlistCard).toBeVisible({ timeout: 10_000 });
  await playlistCard.click();
  const videoModal = page.locator('#video-modal');
  await expect(videoModal).toBeVisible({ timeout: 10_000 });
  await page.locator('#close-modal').click();
  await expect(videoModal).toBeHidden({ timeout: 10_000 });
  await pause(page);

  // Validate the stored key only after playlist modal work
  const verifyInput = page.locator('#verify-input');
  await verifyInput.scrollIntoViewIfNeeded();
  await verifyInput.fill(generatedKey);
  await page.locator('#verify-btn').click();
  await expect(page.locator('#vault-status')).toHaveText(/SUCCESS: Vault Unlocked!/i, {
    timeout: 10_000,
  });
  await pause(page, 2500);

  // Increment XP counter to exactly 2
  const counterUp = page.locator('#counter-up');
  const counterValue = page.locator('#counter-value');
  await counterUp.scrollIntoViewIfNeeded();
  await counterUp.click();
  await counterUp.click();
  await expect(counterValue).toHaveText('2');
  await pause(page);

  // GitHub explorer search and first repo click
  const githubUser = page.locator('#github-user');
  await githubUser.scrollIntoViewIfNeeded();
  await githubUser.fill('ritesh17rb');
  await page.locator('#github-fetch').click();
  const repoCards = page.locator('#github-results .repo-card');
  await expect(repoCards.first()).toBeVisible({ timeout: 10_000 });
  await repoCards.first().click();
  await pause(page);
});
