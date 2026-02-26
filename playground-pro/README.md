# video1.webm Reconstruction (Playground Pro)

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` via `llmfoundry.straivedemo.com/openai/v1` – used on every captured frame to read on-screen copy (Predict Winner CTA, vault toast, repo names) and confirm layout state before writing selectors.
- **UI interpretation:** `gpt-4.1` – mapped each UI widget (shadow DOM key generator, playlist cards, validator form, GitHub search) to resilient selectors and determined the correct sequencing constraints (unlock vault only after modal closes).
- **Code generation:** `claude-3.5-sonnet` via `llmfoundry.straivedemo.com/anthropic/v1` – produced the Playwright spec with reusable helpers, deterministic waits, and inline comments that explain why each branch exists.

## Action Sequence (from the refreshed footage)
1. Land on `https://ritesh17rb.github.io/playground-testing/` and show the Predictor module idle.
2. Click **Predict Winner**, wait until the result banner stabilises.
3. Scroll to the Quantum Key Generator (inside `#shadow-generator-host`), click **Generate**, read the token from the shadow DOM, and store it for later.
4. Press **Fetch Stanford Playlist**, open the first video card modal, inspect it briefly, and close it.
5. Paste the stored key inside **Validate Your Key** and unlock the vault (success toast must show before moving on).
6. Increment the XP counter twice so it reaches `2`.
7. Scroll to the GitHub Explorer, search for `ritesh17rb`, wait for the repo cards, and click the first card to follow the tester’s path.

## Element Identification Strategy
- Predictor button is targeted with `getByRole('button', { name: 'Predict Winner' })`, guaranteeing accessibility-safe selection even if the DOM changes.
- The key generator lives in a shadow DOM host; the script pierces it via `page.evaluate` to click `#gen-btn`, read the display, and expose `#copy-btn` (matching how the tester copied the key on-screen).
- Playlist cards use the `.video-card` class – after fetching, the script asserts the first card, opens it, and waits for `#video-modal` to hide before touching the vault.
- Validator widgets (`#verify-input`, `#verify-btn`, `#vault-status`) enforce the rule that unlocking happens only after the playlist interaction completes.
- XP counter buttons (`#counter-up`, `#counter-value`) and GitHub explorer fields (`#github-user`, `#github-fetch`, `#github-results .repo-card`) provide deterministic selectors for the finishing steps.

## Automation Reconstruction Logic
- A shared `pause(page, ms)` helper keeps the 2–3 second cadence Anand requested so the script visually mirrors the recording.
- The generated key is stored in a local variable and re-used later to guarantee that vault validation happens with the *same* value captured in the video.
- Modal handling uses explicit expectations (`toBeVisible` / `toBeHidden`) so the playlist click → modal close ordering is enforced before the validator sequence begins.
- Assertions cover every major milestone from the footage: predictor result text, vault success banner, XP counter value, and GitHub repo rendering.

## Frame Explanations
| Frame | Timestamp | Action & Observation | Selector / Code Hook | Rationale |
| --- | --- | --- | --- | --- |
| `frame01.webp` | 00:02.0 | Landing hero plus Predict Winner CTA before any input. | `await expect(spinButton).toBeVisible();` | Confirms the landing state before any interaction. |
| `frame02.webp` | 00:08.5 | Result label showing the spinning flow settled. | `const resultBanner = page.locator('#spin-result');` | Mirrors the banner appearing after the spin. |
| `frame03.webp` | 00:12.7 | Result banner fully resolved after the spin. | `await expect(resultBanner).toHaveText(/Winner:/i);` | Assertion ensures the predictor flow truly finished. |
| `frame04.webp` | 00:21.0 | Shadow DOM display exposes the random key we persist. | `const generatedKey = await generateVaultKey(page);` | Shows why we pierce the shadow DOM and retain the key. |
| `frame05.webp` | 00:24.5 | Stanford LLM playlist cards visible after Fetch Update. | `await playlistButton.click();` | Evidence for the playlist-before-vault requirement. |
| `frame06.webp` | 00:26.0 | First playlist video expanded in the modal before dismissal. | `await expect(videoModal).toBeVisible({ timeout: 10_000 });` | Script waits for modal visibility before proceeding. |
| `frame07.webp` | 00:30.0 | Stored key pasted into #verify-input ahead of verification. | `await verifyInput.fill(generatedKey);` | Ties the earlier generated key to the validator step. |
| `frame08.webp` | 00:33.0 | SUCCESS banner confirming the validator step. | `await expect(page.locator('#vault-status')).toHaveText(/SUCCESS: Vault Unlocked!/i);` | Assertion proves the unlock happened after the modal closed. |
| `frame09.webp` | 00:36.5 | Engagement tracker showing the target value of 2. | `await expect(counterValue).toHaveText('2');` | Matches the tester’s double increment. |
| `frame10.webp` | 00:40.0 | Repo cards for ritesh17rb rendered and ready for clicks. | `await expect(repoCards.first()).toBeVisible({ timeout: 10_000 });` | Demonstrates the repo search before the video ends. |

All assets (frames, README, spec, and dashboard metadata) were regenerated on 24 Feb 2026.
