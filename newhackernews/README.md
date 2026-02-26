# newhackernews.webm Reconstruction (Hacker News Nav Tour)

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` via `llmfoundry.straivedemo.com/openai/v1` – used to read the incognito splash, Google SERP, and the HN navigation state in each frame.
- **UI interpretation:** `gpt-4.1` – mapped the Google search field and the HN top-nav into stable selectors and URL assertions.
- **Code generation:** `claude-3.5-sonnet` via `llmfoundry.straivedemo.com/anthropic/v1` – produced the Playwright flow with fallbacks and explicit waits.

## Action Sequence (from the recording)
1. Open an incognito tab and land on Google.
2. Type `hackernews`, submit the search, and load the Google results page.
3. Click the Hacker News result to open `news.ycombinator.com`.
4. Walk the HN top navigation in order: **new → past → comments → ask → show**.

## Element Identification Strategy
- Google search input: `textarea[name="q"]` (stable across Google’s current UI).
- Hacker News result: `a[href*="news.ycombinator.com"]` filtered by link text “Hacker News”.
- HN top navigation: `td.pagetop a` filtered by exact link text (new, past, comments, ask, show).

## Automation Reconstruction Logic
- The script first attempts the Google → HN path, but if Google returns a `/sorry` page it navigates directly to HN to keep the run deterministic.
- Each HN nav click is followed by a URL assertion (`/newest`, `/front`, `/newcomments`, `/ask`, `/show`) to guarantee the same ordering as the footage.
- Short pauses (≈1.2s) preserve the rhythm of the recording while keeping the script resilient.

## Frame Explanations
| Frame | Timestamp | Action & Observation | Selector / Code Hook | Rationale |
| --- | --- | --- | --- | --- |
| `frame01.webp` | 00:00.5 | New tab landing before any navigation. | `await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });` | Matches the incognito starting state in the recording. |
| `frame02.webp` | 00:04.5 | Google home screen focused on the search field. | `await expect(searchField).toBeVisible({ timeout: 10_000 });` | Stable selector for Google’s query box. |
| `frame03.webp` | 00:05.5 | Typing begins with the autocomplete overlay open. | `await searchField.fill('hackernews');` | Mirrors the typed term in the UI. |
| `frame04.webp` | 00:08.5 | SERP with the Hacker News result visible. | `await hackerNewsLink.waitFor({ state: 'visible', timeout: 10_000 });` | Uses both URL and visible text to avoid false positives. |
| `frame05.webp` | 00:14.5 | Front page loaded with the main HN table visible. | `await expect(page.locator('table#hnmain')).toBeVisible();` | Confirms we are on Hacker News before navigating. |
| `frame06.webp` | 00:16.5 | Top navigation switched to new stories. | `await clickTopNav('new', /news\.ycombinator\.com\/newest/);` | Scopes the nav link to `td.pagetop`. |
| `frame07.webp` | 00:18.5 | Past stories view after navigation click. | `await clickTopNav('past', /news\.ycombinator\.com\/front/);` | URL assertion locks the correct page. |
| `frame08.webp` | 00:24.5 | Comments listing after switching tabs. | `await clickTopNav('comments', /news\.ycombinator\.com\/newcomments/);` | Ensures comments list is loaded. |
| `frame09.webp` | 00:26.5 | Ask HN page reached from the top nav. | `await clickTopNav('ask', /news\.ycombinator\.com\/ask/);` | Matches the recorded Ask HN view. |
| `frame10.webp` | 00:28.5 | Show HN listing loaded after the final click. | `await clickTopNav('show', /news\.ycombinator\.com\/show/);` | Final navigation state before the recording ends. |

All assets (frames, README, spec, and dashboard metadata) were regenerated on 24 Feb 2026.
