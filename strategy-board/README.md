# video2.webm Reconstruction

## Model Selection
- **Vision analysis:** `gpt-4.1-mini` via `https://llmfoundry.straivedemo.com/openai/v1` – used to annotate every extracted frame, including low-contrast overlays on the dark board.
- **UI interpretation:** `gpt-4.1` (same endpoint) – reasons about React/Bootstrap hybrids such as `#prepModal`, radio labels, and the always-mounted question overlay.
- **Code generation:** `claude-3.5-sonnet` via `https://llmfoundry.straivedemo.com/anthropic/v1` – produced Playwright code that already matched the user’s pacing requirement and only needed selector fine-tuning.

## Action Sequence
1. Load `https://board-game-v2.vercel.app/` fresh (localStorage cleared to avoid resume states).
2. Enter `india` in **Custom Scenario** and fire **Go** to open the Mission Briefing modal.
3. Switch the difficulty pill to **Hard** and start the simulation.
4. Wait for the board + dice to render, then press **ROLL DICE** (re-rolling if the token lands on BREAK and no question appears).
5. When the question modal opens, choose one of the multiple-choice answers, view the feedback, and dismiss it.

## Element Identification Strategy
- Custom scenario controls expose stable IDs (`#domain-input`, `#start-custom-btn`).
- Mission Briefing modal is the Bootstrap modal `#prepModal` with radio inputs (`#diff-hard`, etc.) and a single launch CTA `#btn-launch-sim`.
- Gameplay UI remounts into `#board-game-view`; the dice CTA is `#roll-btn` and remains unique.
- Question overlays are always present in the DOM (`#question-modal-overlay`) and gain the `active` class when visible, so polling the `class` attribute is more reliable than `isVisible()` (opacity stays 0 otherwise).
- Answer buttons live under `#modal-options button.option-btn`; their order is dynamic, so the script picks the second option if available, otherwise the first, mirroring the video’s “pick one answer quickly” behavior.

## Automation Reconstruction Logic
- `page.addInitScript(() => localStorage.clear())` guarantees the home screen instead of the saved “Resume india” card seen in other sessions.
- The script waits up to 60s for `#roll-btn` because tile generation calls an LLM; this absorbs network variance.
- `expect.poll` monitors the overlay class to confirm the modal truly activated before interacting with the options; the same technique confirms the overlay is dismissed after clicking **Continue**.
- No assertions depend on specific tile names or question text—the dice roll and question content are randomized, so we synchronize on control states (options rendered, feedback visible) instead.

## Frame Explanations
| Frame (t) | Action + Observation | Element & Selector | Selector Rationale | Assumptions & Playwright Mapping |
| --- | --- | --- | --- | --- |
| `frames/frame01.webp` (00:01.3) | Fresh board with the custom scenario CTA visible. | `await expect(domainInput).toBeVisible();` | Static ID rendered on load. | Assumption: clearing storage always reveals this card; script focuses input immediately. |
| `frames/frame02.webp` (00:01.6) | “india” typed inside #domain-input before launching. | `#start-custom-btn`. | Only CTA inside the custom scenario component. | Assumption: button label stays “Go”; automation clicks the ID’d button. |
| `frames/frame03.webp` (00:08.7) | Bootstrap modal (#prepModal) summarizing the scenario. | `await expect(prepModal).toBeVisible();` | Bootstrap modal ID exported by the app. | Assumption: modal always appears after clicking Go; script waits for visibility. |
| `frames/frame04.webp` (00:13.7) | Hard difficulty actively selected prior to launch. | `label[for="diff-hard"]`, `#diff-hard`. | Radio inputs and labels share hard-coded IDs. | Assumption: Hard option exists; script toggles label and asserts checked state. |
| `frames/frame05.webp` (00:13.8) | Final confirmation before hitting #btn-launch-sim. | `#btn-launch-sim`. | Unique ID in the modal footer. | Assumption: clicking once triggers the async mount; script pauses to match timing. |
| `frames/frame06.webp` (00:21.4) | Roll button rendered once the simulation mounts. | `await expect(rollButton).toBeVisible({ timeout: 60_000 });` | Button created after the game scene loads. | Assumption: ID stays unique; script waits up to 60s before clicking. |
| `frames/frame07.webp` (00:21.4) | Game log showing the outcome we wait for before polling the overlay. | `#game-log`. | Log text is the easiest signal that the roll finished. | Assumption: log text updates per roll; helper waits before checking overlay. |
| `frames/frame08.webp` (00:21.4) | Question modal flagged with the `active` class we monitor. | `const classes = (await questionOverlay.getAttribute('class')) ?? '';` | Overlay remains in DOM; `classList` reveals visibility. | Assumption: `active` class is authoritative; script polls `.includes('active')`. |
| `frames/frame09.webp` (00:25.2) | Multiple choice buttons that the script selects by index. | `await expect(optionButtons.first()).toBeVisible();` | Buttons share the same selector each run. | Assumption: at least one option exists; script prefers the second button when present. |
| `frames/frame10.webp` (00:26.2) | Topic feedback block displayed after the click. | `#modal-feedback`. | ID is stable even when the overlay is transparent. | Assumption: answering any option triggers feedback; script asserts visibility before closing. |
| `frames/frame11.webp` (00:27.5) | Overlay dismissed so the flow can end like the recording. | `#modal-close-btn`, overlay class. | Close button plus a class check confirm dismissal. | Assumption: close button always present; script clicks it and polls for class removal. |

## Files
- `script.spec.ts` – deterministic Playwright steps for the dark-mode board workflow.
- `frames/*.webp` – ≤30 KB keyframes illustrating each major interaction.
