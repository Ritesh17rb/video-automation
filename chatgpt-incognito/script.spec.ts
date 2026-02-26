import { test, expect, chromium } from "@playwright/test";

const GOOGLE_HOME = "https://www.google.com/";
const CHATGPT_URL = "https://chatgpt.com/";

const pause = (page: import("@playwright/test").Page, ms: number) =>
    page.waitForTimeout(ms);

test("ChatGPT Incognito Greeting – hii / how are / i am good exchange", async () => {
    // Launch a dedicated incognito browser so no cached session bleeds in.
    const browser = await chromium.launch({ headless: false, slowMo: 80 });
    const context = await browser.newContext({
        // Incognito equivalent: fresh storage, no cookies.
        storageState: undefined,
    });
    const page = await context.newPage();

    // ── Step 1: Open Google in incognito ──────────────────────────────────────
    await page.goto(GOOGLE_HOME, { waitUntil: "domcontentloaded" });
    await pause(page, 1500);

    // ── Step 2: Type chatgpt.com into the omnibox / search field ──────────────
    try {
        const omnibox = page.locator('textarea[name="q"]').first();
        await omnibox.waitFor({ timeout: 5_000 });
        await omnibox.fill("chatgpt.com");
        await pause(page, 800);
        await page.keyboard.press("Enter");
        await page.waitForLoadState("domcontentloaded");
        await pause(page, 1200);

        // If Google served a /sorry challenge, bail out to direct navigation.
        if (page.url().includes("/sorry")) {
            throw new Error("Google challenge detected – falling back to direct nav");
        }

        // Click the chatgpt.com search result if it appears.
        const chatgptLink = page
            .locator('a[href*="chatgpt.com"]')
            .filter({ hasText: /chatgpt/i })
            .first();
        await chatgptLink.waitFor({ timeout: 6_000 });
        await chatgptLink.click();
    } catch {
        // Fallback: navigate directly when SERP is unavailable.
        await page.goto(CHATGPT_URL, { waitUntil: "domcontentloaded" });
    }

    // ── Step 3: Wait for ChatGPT composer to be interactive ───────────────────
    await page.waitForURL(/chatgpt\.com/, { timeout: 20_000 });
    await pause(page, 2000);

    const textarea = page.locator('[contenteditable="true"]').first();
    await textarea.waitFor({ state: "visible", timeout: 20_000 });
    await pause(page, 1000);

    // ── Step 4: First message – "hii" ─────────────────────────────────────────
    await textarea.click();
    await textarea.fill("hii");
    await pause(page, 600);
    await page.keyboard.press("Enter");

    // Wait for the assistant's first reply.
    const assistantReply = page
        .locator('article[data-testid^="conversation-turn"]')
        .nth(1);
    await assistantReply.waitFor({ state: "visible", timeout: 20_000 });
    await pause(page, 2500);

    // ── Step 5: Second message – "how are" ────────────────────────────────────
    await textarea.click();
    await textarea.fill("how are");
    await pause(page, 600);
    await page.keyboard.press("Enter");

    const assistantReply2 = page
        .locator('article[data-testid^="conversation-turn"]')
        .nth(3);
    await assistantReply2.waitFor({ state: "visible", timeout: 20_000 });
    await pause(page, 2500);

    // ── Step 6: Third message – "i am good" ───────────────────────────────────
    await textarea.click();
    await textarea.fill("i am good");
    await pause(page, 600);
    await page.keyboard.press("Enter");
    const assistantReply3 = page
        .locator('article[data-testid^="conversation-turn"]')
        .nth(5);
    await assistantReply3.waitFor({ state: "visible", timeout: 20_000 });
    await pause(page, 2500);

    // Final idle pause to mirror the recording end state.
    await pause(page, 2000);

    await context.close();
    await browser.close();
});
