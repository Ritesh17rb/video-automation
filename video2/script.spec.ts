import { test, expect } from '@playwright/test';

const BASE_URL = 'https://board-game-v2.vercel.app/';

test('strategy board game – custom scenario from video2', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const pause = (ms = 2000) => page.waitForTimeout(ms);

  const domainInput = page.locator('#domain-input');
  await expect(domainInput).toBeVisible();
  await domainInput.fill('india');
  await page.locator('#start-custom-btn').click();
  await pause();

  const prepModal = page.locator('#prepModal');
  await expect(prepModal).toBeVisible();
  await page.locator('label[for="diff-hard"]').click();
  await expect(page.locator('#diff-hard')).toBeChecked();
  await page.locator('#btn-launch-sim').click();
  await pause(2500);

  const rollButton = page.locator('#roll-btn');
  await expect(rollButton).toBeVisible({ timeout: 60_000 });
  await expect(rollButton).toBeEnabled();

  const questionOverlay = page.locator('#question-modal-overlay');
  const waitForQuestionModal = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await rollButton.click();
      await pause(2500);
      const classes = (await questionOverlay.getAttribute('class')) ?? '';
      if (classes.includes('active')) {
        return;
      }
      await pause(500);
    }
    throw new Error('Question modal did not appear after rolling multiple times');
  };

  await waitForQuestionModal();

  const optionButtons = questionOverlay.locator('#modal-options button');
  await expect(optionButtons.first()).toBeVisible();
  const buttonCount = await optionButtons.count();
  const choice = buttonCount > 1 ? optionButtons.nth(1) : optionButtons.first();
  await choice.click();
  await pause();

  await expect(questionOverlay.locator('#modal-feedback')).toBeVisible();
  await questionOverlay.locator('#modal-close-btn').click();
  await expect.poll(async () => (await questionOverlay.getAttribute('class')) ?? '')
    .not.toContain('active');
  await pause();
});
