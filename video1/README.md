# video1.webm Reconstruction

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` via `https://llmfoundry.straivedemo.com/openai/v1` – fast enough to caption every extracted frame and to highlight the widgets that actually changed state.
- **UI interpretation:** `gpt-4.1` (same endpoint) – adds the reasoning depth required to traverse the Playground Pro shadow DOM and to double-check selector stability.
- **Code generation:** `claude-3.5-sonnet` via `https://llmfoundry.straivedemo.com/anthropic/v1` – generates Playwright steps that already respect the requested pacing and sequencing, so only light edits were needed.

## Action Sequence
1. Load `https://ritesh17rb.github.io/playground-testing/` and focus the T20 WC Predictor widget.
2. Click **Predict Winner** to spin the wheel and wait for the confetti winner banner.
3. Scroll to **Key Generator**, hit **GENERATE**, copy the token, but hold it for later.
4. Scroll to **Stanford LLM Series**, click **Update Feed**, open the first video, then close the modal with the ✕ button.
5. Return to **Key Validator**, paste the stored token, and click **Unlock Surprise**.
6. Increment **Engagement XP** to 2 using the + button.
7. Scroll to **GitHub Explorer**, search for `ritesh17rb`, and click the first repo card.

## Element Identification Strategy
- Used the published HTML (downloaded while inspecting the site) to anchor selectors such as `#spin-btn`, `#spin-result`, `#verify-input`, and `#github-fetch`.
- The **Key Generator** lives inside a shadow root hosted at `#shadow-generator-host`; direct CSS selectors fail, so the script pierces the shadow DOM via `page.evaluate` to click `#gen-btn` and read `#display`.
- Reused semantic roles (`getByRole('button', { name: 'Predict Winner' })`) where labels are stable, and IDs elsewhere to reduce flakiness.
- Dynamic text (winner banner, vault status) is asserted with regexes to allow any nation/token combination.

## Automation Reconstruction Logic
- Each Playwright step mirrors a detected UI change from the video; waits rely on DOM text changes instead of fixed delays.
- Generated vault keys are random, so the script stores the live value before validation—replicating the operator manually typing the key from the video.
- GitHub search waits for the first `.repo-card` to contain `playground-testing`, matching the video’s top result without depending on total repo count.

## Frame Explanations
| Frame (t) | Action + Observation | Element & Selector | Selector Derivation | Assumptions & Playwright Mapping |
| --- | --- | --- | --- | --- |
| `frames/frame01.webp` (00:08.9) | Landing hero plus **Predict Winner** CTA prior to any clicks. | `button#spin-btn` / `getByRole('button', { name: 'Predict Winner' })`. | Unique ID and accessible name from the published DOM. | Assumption: Only scroll adjustment is needed for smaller viewports. Mapping: script scrolls if required and clicks `spinButton` to start the run. |
| `frames/frame02.webp` (00:12.7) | Result banner announces the winning team after the wheel stops. | `#spin-result`. | Predictor status element that swaps text after the animation. | Assumption: Winner text varies but always contains “Winner:”. Mapping: `await expect(resultBanner).toHaveText(/Winner:/)` gates the flow. |
| `frames/frame03.webp` (00:21.0) | Quantum Key Generator scrolled into view before minting. | `#shadow-generator-host`. | Host element for the shadow-root widget. | Assumption: Shadow host ID stays static. Mapping: `scrollIntoViewIfNeeded()` and `page.evaluate` click `#gen-btn`. |
| `frames/frame04.webp` (00:22.1) | Fresh token visible inside the shadow DOM display. | `#shadow-generator-host → #display`. | IDs only exist inside the shadow tree, so we query from `shadowRoot`. | Assumption: Key always contains a hyphen, which we assert before storing. Mapping: `page.evaluate` reads and caches the value for later. |
| `frames/frame05.webp` (00:24.5) | Stanford playlist populated after clicking **Fetch Update**. | `#fetch-playlist`, `.video-card`. | Button ID + consistent card class. | Assumption: At least one `.video-card` renders per fetch. Mapping: script clicks the button and waits for the first card. |
| `frames/frame06.webp` (00:24.9) | First video expanded within the playlist modal prior to closing. | `#video-modal`, `#close-modal`. | Modal IDs are fixed in the site markup. | Assumption: Modal opens synchronously once a card is clicked. Mapping: click first card, assert modal visibility, then close. |
| `frames/frame07.webp` (00:24.9) | Stored key pasted into the validator input before verification. | `#verify-input`, `#verify-btn`. | Plain DOM IDs for the validator controls. | Assumption: Validator uses the exact key from the generator with no formatting. Mapping: fill with `generatedKey` and prepare to unlock. |
| `frames/frame08.webp` (00:25.0) | Vault success banner after clicking **Unlock Surprise**. | `#vault-status`. | Status label adjacent to the validator. | Assumption: Success copy always contains “SUCCESS”. Mapping: expectation on `#vault-status` before advancing. |
| `frames/frame09.webp` (00:36.5) | Engagement XP counter showing value `2`. | `#counter-up`, `#counter-value`. | Counter buttons and display have stable IDs. | Assumption: Counter increments by 1 per click. Mapping: click twice and assert the display equals `2`. |
| `frames/frame10.webp` (00:39.9) | GitHub Explorer results list for `ritesh17rb`. | `#github-user`, `#github-fetch`, `#github-results .repo-card`. | Inputs and cards retain the same IDs/classes as in the recording. | Assumption: First repo card is safe to click regardless of its title. Mapping: fill, fetch, wait for `.repo-card`, and click the first card. |

## Files
- `script.spec.ts` – Playwright reproduction.
- `frames/*.webp` – Compressed ≤30 KB evidence of each critical state.
