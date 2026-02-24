import { test, expect } from '@playwright/test';

const GOOGLE_HOME = 'https://www.google.com/?hl=en&gl=us';

test('video5 - chatgpt incognito greeting', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });
  const omnibox = page.locator('textarea[name="q"]').first();
  await omnibox.click();
  await omnibox.type('chatgpt.com', { delay: 80 });
  await page.keyboard.press('Enter');
  await pause();

  await page.waitForLoadState('domcontentloaded');
  if (/\/sorry\//i.test(page.url())) {
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
  }

  if (!/chatgpt\.com|chat\.openai\.com/i.test(page.url())) {
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
  }

  // Handle occasional Cloudflare/verification gate by waiting it out.
  const challengeBanner = page.getByText(/verify you are human|checking your browser/i).first();
  if (await challengeBanner.isVisible().catch(() => false)) {
    await pause(5000);
  }

  const textarea = page.locator('[contenteditable="true"]').first();
  await textarea.waitFor({ state: 'visible', timeout: 15_000 });
  await textarea.click();
  await textarea.type('hi', { delay: 80 });
  await page.keyboard.press('Enter');
  await pause();

  await expect(page.getByText(/Hey! .* What['’]s up\?/)).toBeVisible({ timeout: 15_000 });

  await textarea.fill('i am good');
  await page.keyboard.press('Enter');
  await pause(2500);

  await context.close();
});
