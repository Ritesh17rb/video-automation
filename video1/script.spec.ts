import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ritesh17rb.github.io/playground-testing/';

/**
 * Replays the flows captured in video1.webm:
 * - Run the T20 WC predictor
 * - Generate and validate a quantum vault key
 * - Look up GitHub repos for ritesh17rb
 */
test('playground pro regression - video1', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  // Spin the predictor wheel
  const spinButton = page.getByRole('button', { name: 'Predict Winner' });
  await spinButton.scrollIntoViewIfNeeded();
  await spinButton.click();
  const resultBanner = page.locator('#spin-result');
  await expect(resultBanner).toHaveText(/Winner:/i, { timeout: 8_000 });
  await pause(2500);

  // Scroll to Key Generator section and generate a vault key inside the shadow DOM
  await page.locator('#shadow-generator-host').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const generateBtn = shadow?.querySelector('#gen-btn') as HTMLButtonElement | null;
    generateBtn?.click();
  });
  await page.waitForFunction(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const display = shadow?.querySelector('#display');
    return Boolean(display && display.textContent && display.textContent.includes('-'));
  });
  const generatedKey = await page.evaluate(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const display = shadow?.querySelector('#display');
    if (!display) {
      throw new Error('Key display not found');
    }
    return display.textContent?.trim();
  });
  if (!generatedKey) {
    throw new Error('Key was not generated');
  }
  await page.evaluate(() => {
    const host = document.querySelector('#shadow-generator-host');
    const shadow = host?.shadowRoot;
    const copyBtn = shadow?.querySelector('#copy-btn') as HTMLButtonElement | null;
    if (copyBtn) {
      copyBtn.style.display = 'block';
      copyBtn.click();
    }
  });
  await pause();

  // Fetch playlist, open video modal, and close it
  await page.locator('#fetch-playlist').scrollIntoViewIfNeeded();
  await page.locator('#fetch-playlist').click();
  const videoCards = page.locator('.video-card');
  await expect(videoCards.first()).toBeVisible({ timeout: 10_000 });
  await videoCards.first().click();
  const videoModal = page.locator('#video-modal');
  await expect(videoModal).toBeVisible();
  await page.locator('#close-modal').click();
  await expect(videoModal).toBeHidden();
  await pause();

  // Now validate the previously generated key
  await page.locator('#verify-input').scrollIntoViewIfNeeded();
  await page.locator('#verify-input').fill(generatedKey);
  await page.locator('#verify-btn').click();
  await expect(page.locator('#vault-status')).toHaveText(/SUCCESS: Vault Unlocked!/i);
  await pause(2500);

  // Increment engagement counter to 2
  const counterValue = page.locator('#counter-value');
  await page.locator('#counter-up').scrollIntoViewIfNeeded();
  await page.locator('#counter-up').click();
  await page.locator('#counter-up').click();
  await expect(counterValue).toHaveText('2');
  await pause();

  // Search GitHub repos for ritesh17rb and click a repo card
  await page.locator('#github-user').scrollIntoViewIfNeeded();
  await page.locator('#github-user').fill('ritesh17rb');
  await page.locator('#github-fetch').click();
  const repoCards = page.locator('#github-results .repo-card');
  await expect(repoCards.first()).toBeVisible({ timeout: 10_000 });
  await repoCards.first().click();
  await pause();
});
