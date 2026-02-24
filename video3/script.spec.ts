import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.youtube.com/';

test('youtube search journey - video3', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  // Dismiss regional consent if it appears.
  const consentButton = page
    .getByRole('button', { name: /reject all|accept all|i agree/i })
    .first();
  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();
    await pause();
  }

  const searchInput = page.getByRole('combobox', { name: /search/i });
  await searchInput.click();

  // Mimic the exploratory typing captured in the video.
  await searchInput.fill('hos');
  await pause(800);
  await searchInput.fill('');
  await searchInput.type('how llm works', { delay: 120 });
  await page.keyboard.press('Enter');
  await pause();

  await expect(page).toHaveURL(/results\?search_query=how\+llm\+works/i, {
    timeout: 15_000,
  });

  // Click the 3Blue1Brown video.
  const llmVideo = page
    .locator('ytd-video-renderer')
    .filter({ hasText: /Large Language Models explained briefly/i })
    .first();
  await expect(llmVideo).toBeVisible({ timeout: 15_000 });
  await llmVideo.locator('a#thumbnail').click();
  await pause();

  await expect(page).toHaveURL(/watch/, { timeout: 15_000 });
  await expect(
    page.getByRole('heading', {
      name: /Large Language Models explained briefly/i,
    }),
  ).toBeVisible({ timeout: 15_000 });

  const skipButton = page.locator('.ytp-ad-skip-button-modern, .ytp-ad-skip-button');
  try {
    await skipButton.waitFor({ timeout: 10000 });
    await skipButton.click();
  } catch {
    await pause(5000);
  }
  await pause(2000);
});
