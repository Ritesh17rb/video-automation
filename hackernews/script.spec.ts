import { test, expect } from '@playwright/test';

const GOOGLE_HOME = 'https://www.google.com/?hl=en&gl=us';
const GOOGLE_QUERY = 'https://www.google.com/search?q=hackernews&hl=en&gl=us&num=10';
const ARTICLE_INDEX = 9; // zero-based (10th article)

test('hackernews front page – open 10th article', async ({ page }) => {
  await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  const searchField = page.locator('textarea[name="q"]').first();
  await searchField.click();
  await searchField.fill('hackernews');
  await page.keyboard.press('Enter');
  await pause();

  await page.waitForLoadState('domcontentloaded');
  if (/\/sorry\//i.test(page.url())) {
    await page.goto(GOOGLE_QUERY, { waitUntil: 'domcontentloaded' });
  }

  try {
    await expect(page).toHaveURL(/search\?[^#]*q=hackernews/i, { timeout: 10_000 });
    const hackerNewsLink = page.getByRole('link', { name: /^Hacker News$/i }).first();
    await expect(hackerNewsLink).toBeVisible({ timeout: 10_000 });
    await hackerNewsLink.click();
  } catch {
    await page.goto('https://news.ycombinator.com/', { waitUntil: 'domcontentloaded' });
  }

  await expect(page).toHaveURL(/news\.ycombinator\.com/i, { timeout: 10_000 });
  await pause();

  // Click the 10th article (index 9) from the front page and explore it.
  const tenthArticle = page.locator('tr.athing .titleline a').nth(ARTICLE_INDEX);
  await expect(tenthArticle).toBeVisible({ timeout: 15_000 });
  const articleTitle = (await tenthArticle.innerText()).trim();
  await tenthArticle.click();
  await page.waitForLoadState('domcontentloaded');
  await pause(3000);
  await page.mouse.wheel(0, 1400);
  await pause(2500);

  console.info(`Explored article: ${articleTitle}`);
});
