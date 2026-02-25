import { test, expect } from '@playwright/test';

const GOOGLE_HOME = 'https://www.google.com/';
const HN_HOME = 'https://news.ycombinator.com/';

test('hacker news nav tour - newhackernews', async ({ page }) => {
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });
  await pause(1200);

  const searchField = page.locator('textarea[name="q"]');
  await expect(searchField).toBeVisible({ timeout: 10_000 });
  await searchField.fill('hackernews');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('domcontentloaded');
  await pause(1200);

  if (page.url().includes('/sorry')) {
    await page.goto(HN_HOME, { waitUntil: 'domcontentloaded' });
  } else {
    try {
      const hackerNewsLink = page
        .locator('a[href*="news.ycombinator.com"]')
        .filter({ hasText: /Hacker News/i })
        .first();
      await hackerNewsLink.waitFor({ state: 'visible', timeout: 10_000 });
      await hackerNewsLink.click();
    } catch {
      await page.goto(HN_HOME, { waitUntil: 'domcontentloaded' });
    }
  }

  await expect(page.locator('table#hnmain')).toBeVisible({ timeout: 10_000 });
  await pause(1200);

  const clickTopNav = async (label: string, urlPattern: RegExp) => {
    const link = page.locator('td.pagetop a').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(urlPattern, { timeout: 10_000 });
    await pause(1200);
  };

  await clickTopNav('new', /news\.ycombinator\.com\/newest/);
  await clickTopNav('past', /news\.ycombinator\.com\/front/);
  await clickTopNav('comments', /news\.ycombinator\.com\/newcomments/);
  await clickTopNav('ask', /news\.ycombinator\.com\/ask/);
  await clickTopNav('show', /news\.ycombinator\.com\/show/);
});
