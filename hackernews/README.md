# hackernews.webm Reconstruction

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` (`https://llmfoundry.straivedemo.com/openai/v1`) – labeled each keyframe, including the NASA article and the Algolia search results.
- **UI interpretation:** `gpt-4.1` on the same endpoint – reasoned about both Google SERP selectors and the Hacker News/Algolia variants the user requested.
- **Code generation:** `claude-3.5-sonnet` (`https://llmfoundry.straivedemo.com/anthropic/v1`) – emitted Playwright code that already respected the fallback strategy and the extra onsite search steps.

## Action Sequence
1. Open the Material You new-tab page and type `hackernews` in the omnibox.
2. Submit the query and land on google.com (falling back to the cached query URL when `/sorry` appears).
3. Click the Hacker News result so the run still mirrors the recording’s SERP hop.
4. On the front page, grab the 10th article (index 9) exactly as shown in the video and open it.
5. Scroll through the article for a couple of seconds to capture the exploration shown in the footage.

## Element Strategy
- Omnibox: `getByRole('combobox', { name: /search/i })`.
- Result link: `getByRole('link', { name: /^Hacker News$/i })` keeps the SERP click deterministic.
- Article pick: `page.locator('tr.athing .titleline a').nth(9)` loads the 10th story no matter which headline currently occupies it.

## Automation Logic
- Still clears CAPTCHAs by falling back to the cached Google query URL if `/sorry` triggers.
- Uses a short pause after landing on Hacker News to let the board stabilize before counting rows.
- Stores the clicked title only for logging; the deterministic part is the index, so randomness in headlines does not affect the spec.

## Frame Explanations
| Frame (t) | Action + Observation | Element & Selector | Selector Derivation | Assumptions & Playwright Mapping |
| --- | --- | --- | --- | --- |
| `frames/frame01.webp` (00:04.3) | Material You new-tab before typing. | `textarea[name="q"]` on google.com/ncr. | Chrome exposes the omnibox as a textarea when automation is active. | Assumption: textarea selector stays stable; script focuses it and types the query. |
| `frames/frame02.webp` (00:04.4) | Autocomplete suggestions for `hackernews`. | Same omnibox + suggestion drop-down. | No extra selectors needed; proves the typed text. | Assumption: hitting Enter immediately submits; automation follows same cadence. |
| `frames/frame03.webp` (00:07.7) | Google SERP with Hacker News result. | `getByRole('link', { name: /^Hacker News$/i })`. | Accessible link label is consistent on the SERP. | Assumption: SERP retains that label; script clicks it, otherwise falls back to direct URL. |
| `frames/frame04.webp` (00:11.6) | Hacker News front page immediately after navigation. | URL assertion + `<body class="yc">`. | Distinct classes mark the HN front page. | Assumption: front page reachable without auth; script asserts the URL before proceeding. |
| `frames/frame05.webp` (00:14.3) | 10th article (NASA headline in the footage) visible on the front page. | `tr.athing .titleline a`. | Table rows follow DOM order, so `.nth(9)` reliably grabs the 10th story. | Assumption: enough rows load immediately; script pauses before counting and clicks index 9. |
| `frames/frame06.webp` (00:14.8) | External article opened in-place. | `page.url()` plus document body. | External site lacks unique selectors, so we rely on URL and scroll. | Assumption: article remains accessible without auth; script scrolls 1400px to mirror the video linger. |
