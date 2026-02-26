# video3.webm Reconstruction

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` via `https://llmfoundry.straivedemo.com/openai/v1` – annotated every frame, including the low-contrast ad overlays.
- **UI interpretation:** `gpt-4.1` on the same endpoint – reasoned about YouTube’s renderer hierarchy, the consent modal, and role-based search widgets.
- **Code generation:** `claude-3.5-sonnet` via `https://llmfoundry.straivedemo.com/anthropic/v1` – generated Playwright steps that already matched the exploratory typing pattern, so only ad-handling tweaks were required.

## Action Sequence
1. Load `https://www.youtube.com/` (dismiss consent if it appears).
2. Click the search bar, type `hos`, pause, clear it, and type `how llm works`.
3. Submit the query and wait for `/results?search_query=how+llm+works`.
4. Scroll to the first result titled **Large Language Models explained briefly** by 3Blue1Brown.
5. Click the thumbnail to open the watch page and wait for the player plus title to load.
6. Observe the ad/hero section for a few seconds (matching the screen recording).

## Element Identification Strategy
- Search box: `getByRole('combobox', { name: /search/i })` stays stable on both home and watch pages.
- The results URL provides deterministic confirmation without depending on changing headings.
- Each video result renders inside `ytd-video-renderer`; filtering by `hasText` ensures we click the intended 3Blue1Brown video even if ordering shuffles.
- Watch page confirmation relies on `page.url()` containing `/watch` plus the visible title heading to ensure navigation completed (ads sometimes delay the player).
- Optional consent pop-up is handled opportunistically by probing for a button labeled “Reject all / Accept all / I agree”.

## Automation Reconstruction Logic
- The script mimics the exploratory typing sequence (first `hos`, then clearing) to stay faithful to the video and to surface the same suggestion dropdown moment.
- `page.waitForTimeout` calls after typing and after landing on the watch page provide the breathing room observed in the footage.
- `llmVideo.locator('a#thumbnail').click()` avoids brittle reliance on text links that YouTube often abbreviates; Playwright scrolls the card into view before clicking.
- Final assertion ensures the correct watch title is present, so even if YouTube inserts ads or auto-plays another clip, the test fails loudly.

## Frame Explanations
| Frame (t) | Action + Observation | Element & Selector | Selector Derivation | Assumptions & Playwright Mapping |
| --- | --- | --- | --- | --- |
| `frames/frame01.webp` (00:00.0) | Baseline YouTube feed before interacting. | `getByRole('combobox', { name: /search/i })`. | Accessible role exists on home, results, and watch pages. | Assumption: role label remains “Search”; script clicks the combobox to start the flow. |
| `frames/frame02.webp` (00:02.2) | Suggestion sheet after typing “hos”. | Same combobox + suggestion list. | Autocomplete opens automatically when the field is populated. | Assumption: suggestions appear after ~800 ms; automation pauses accordingly. |
| `frames/frame03.webp` (00:07.7) | “how llm works” locked into the search box. | Combobox value plus chip list. | Same selector; text proves we replayed the user’s typing pattern. | Assumption: Input delay of 120 ms matches recorded pacing; script types with delay. |
| `frames/frame04.webp` (00:09.2) | First fold of LLM explainer videos. | `page.locator('ytd-video-renderer')`. | Renderer nodes are stable; we filter with `hasText(/Large Language Models/)`. | Assumption: card text still contains the full title; script filters by regex. |
| `frames/frame05.webp` (00:10.1) | 3Blue1Brown result hovered before the click. | Same renderer, now focused. | Confirms the correct card will be clicked. | Assumption: first matching renderer is correct; script asserts visibility before click. |
| `frames/frame06.webp` (00:10.5) | Player area mounting immediately after navigation. | `#player, h1.title`. | Title + URL confirm navigation success. | Assumption: heading text is unchanged; spec waits for watch URL + heading. |
| `frames/frame07.webp` (00:11.6) | Safety frame confirming URL change before the ad plays. | `document.location`. | Provides proof before the ad overlay appears. | Assumption: watchers always redirect to `/watch`; script double-checks URL. |
| `frames/frame08.webp` (00:12.8) | Sponsor slate covering the player while we wait. | `.html5-video-player.ad-showing`. | Ad-specific class appears while the overlay blocks playback. | Assumption: ad overlay toggles this class; script waits for skip button while class is set. |
| `frames/frame09.webp` (00:13.6) | Skip button visible, matching the automation step. | `.ytp-ad-skip-button`, `.ytp-ad-skip-button-modern`. | YouTube exposes both legacy and modern classes. | Assumption: at least one selector exists; script `try/catch` handles ad-free runs. |
| `frames/frame10.webp` (00:19.2) | Video playing cleanly after the ad branch resolves. | `#movie_player:not(.ad-showing)`. | Absence of the ad class shows playback resumed. | Assumption: removal of `ad-showing` indicates playback; script pauses to mirror linger. |

## Files
- `script.spec.ts` – Playwright automation replicating the search-and-watch workflow.
- `frames/*.webp` – Compressed reference frames (≤30 KB each) for every key state.
