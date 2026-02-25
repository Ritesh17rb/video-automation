import hljs from "highlight.js";
import { html, render } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

const videos = [
  {
    id: "playground-pro",
    title: "Playground Pro – Predictor & Vault",
    summary: "Spin the WC predictor, mint the quantum key, refresh the Stanford playlist, unlock the vault after the modal, bump XP, and inspect the GitHub explorer.",
    preview: "video1/frames/frame01.webp",
    videoSrc: "videos/video1.webm",
    scriptPath: "video1/script.spec.ts",
    readmePath: "video1/README.md",
    sourceUrl: "https://ritesh17rb.github.io/playground-testing/",
    actions: [
      "Spin the Predict Winner wheel and wait for the winner banner to solidify.",
      "Scroll to the Quantum Key Generator, mint the token inside the shadow DOM, and keep the value in memory.",
      "Fetch the Stanford playlist, open the first card in its modal, then close it.",
      "Paste the stored key into the validator and unlock the vault only after finishing the playlist interaction.",
      "Tap the XP counter twice to reach the recorded value of 2.",
      "Query GitHub for ritesh17rb and open the first repo card."
    ],
    reasoning: [
      "Shadow DOM helpers keep the generated key accessible without brittle selectors.",
      "Sequencing validator → unlock after the playlist modal mirrors the original bug report.",
      "Repo clicks use structural selectors (`#github-results .repo-card`) to avoid depending on dynamic names."
    ],
    frames: [
      { src: "video1/frames/frame01.webp", time: "00:02.0", label: "Predictor Idle", description: "Landing hero plus Predict Winner CTA before any input.", codeRef: "const spinButton = page.getByRole('button', { name: 'Predict Winner' });" },
      { src: "video1/frames/frame02.webp", time: "00:08.5", label: "Winner Banner", description: "Result label showing the spinning flow settled.", codeRef: "await spinButton.click();" },
      { src: "video1/frames/frame03.webp", time: "00:12.7", label: "Result Settled", description: "Result banner fully resolved after the spin.", codeRef: "await expect(resultBanner).toHaveText(/Winner:/i, { timeout: 10_000 });" },
      { src: "video1/frames/frame04.webp", time: "00:21.0", label: "Token Minted", description: "Shadow DOM display exposes the random key we persist.", codeRef: "const generatedKey = await generateVaultKey(page);" },
      { src: "video1/frames/frame05.webp", time: "00:24.5", label: "Playlist Refresh", description: "Stanford LLM playlist cards visible after Fetch Update.", codeRef: "const playlistButton = page.locator('#fetch-playlist');" },
      { src: "video1/frames/frame06.webp", time: "00:26.0", label: "Video Modal", description: "First playlist video expanded in the modal before dismissal.", codeRef: "const videoModal = page.locator('#video-modal');" },
      { src: "video1/frames/frame07.webp", time: "00:30.0", label: "Validator Ready", description: "Stored key pasted into #verify-input ahead of verification.", codeRef: "await verifyInput.fill(generatedKey);" },
      { src: "video1/frames/frame08.webp", time: "00:33.0", label: "Vault Unlocked", description: "SUCCESS banner confirming the validator step.", codeRef: "await expect(page.locator('#vault-status')).toHaveText(/SUCCESS: Vault Unlocked!/i, {" },
      { src: "video1/frames/frame09.webp", time: "00:36.5", label: "XP Counter", description: "Engagement tracker showing the target value of 2.", codeRef: "await counterUp.click();" },
      { src: "video1/frames/frame10.webp", time: "00:40.0", label: "GitHub Explorer", description: "Repo cards for ritesh17rb rendered and ready for clicks.", codeRef: "await githubUser.fill('ritesh17rb');" }
    ],
    findings: [
      { title: "Shadow DOM token handling", detail: "Frames 03–04 show why the spec pierces `#shadow-generator-host` and caches the token before running any other widget." },
      { title: "Playlist before validator", detail: "Frames 05–08 capture the playlist → modal → validator order, so the automation intentionally waits to unlock the vault until after the modal is closed." },
      { title: "Downstream analytics proof", detail: "Frames 09–10 keep evidence for the XP increment and GitHub fetch, making the regression script self-documenting." }
    ]
  },
  {
    id: "strategy-board",
    title: "Strategy Board Game – Custom Scenario",
    summary: "Reset the board, launch the custom 'india' mission on Hard mode, roll until a question appears, answer it, and close the overlay.",
    preview: "video2/frames/frame01.webp",
    videoSrc: "videos/video2.webm",
    scriptPath: "video2/script.spec.ts",
    readmePath: "video2/README.md",
    sourceUrl: "https://board-game-v2.vercel.app/",
    actions: [
      "Clear localStorage so the Custom Scenario card is always shown.",
      "Input “india”, launch the Mission Briefing modal, and select Hard difficulty.",
      "Start the simulation and wait for the board plus dice controls to mount.",
      "Roll the dice (re-rolling BREAK tiles) until the question overlay activates.",
      "Pick an option, read the feedback, and dismiss the overlay as in the video."
    ],
    reasoning: [
      "The init script keeps the landing state deterministic across reruns.",
      "The overlay never fully disappears from the DOM, so polling its `classList` is safer than `isVisible()`.",
      "A re-roll helper guards against the BREAK tile edge case the user highlighted."
    ],
    frames: [
      { src: "video2/frames/frame01.webp", time: "00:01.3", label: "Custom Scenario Card", description: "Fresh board with the custom scenario CTA visible.", codeRef: "const domainInput = page.locator('#domain-input');" },
      { src: "video2/frames/frame02.webp", time: "00:01.6", label: "Domain Filled", description: "“india” typed inside #domain-input before launching.", codeRef: "await domainInput.fill('india');" },
      { src: "video2/frames/frame03.webp", time: "00:08.7", label: "Mission Briefing", description: "Bootstrap modal (#prepModal) summarizing the scenario.", codeRef: "const prepModal = page.locator('#prepModal');" },
      { src: "video2/frames/frame04.webp", time: "00:13.7", label: "Hard Pill", description: "Hard difficulty actively selected prior to launch.", codeRef: "await page.locator('label[for=\"diff-hard\"]').click();" },
      { src: "video2/frames/frame05.webp", time: "00:13.8", label: "Launch CTA", description: "Final confirmation before hitting #btn-launch-sim.", codeRef: "await page.locator('#btn-launch-sim').click();" },
      { src: "video2/frames/frame06.webp", time: "00:21.4", label: "Board Ready", description: "Roll button rendered once the simulation mounts.", codeRef: "const rollButton = page.locator('#roll-btn');" },
      { src: "video2/frames/frame07.webp", time: "00:21.4", label: "Dice Result", description: "Game log showing the outcome we wait for before polling the overlay.", codeRef: "await rollButton.click();" },
      { src: "video2/frames/frame08.webp", time: "00:21.4", label: "Overlay Active", description: "Question modal flagged with the `active` class we monitor.", codeRef: "const questionOverlay = page.locator('#question-modal-overlay');" },
      { src: "video2/frames/frame09.webp", time: "00:25.2", label: "Options Rendered", description: "Multiple choice buttons that the script selects by index.", codeRef: "const optionButtons = questionOverlay.locator('#modal-options button');" },
      { src: "video2/frames/frame10.webp", time: "00:26.2", label: "Feedback Panel", description: "Topic feedback block displayed after the click.", codeRef: "await expect(questionOverlay.locator('#modal-feedback')).toBeVisible();" },
      { src: "video2/frames/frame11.webp", time: "00:27.5", label: "Overlay Closed", description: "Overlay dismissed so the flow can end like the recording.", codeRef: "await questionOverlay.locator('#modal-close-btn').click();" }
    ],
    findings: [
      { title: "Launch flow evidence", detail: "Frames 01–05 show why the script clears storage, fills #domain-input, and asserts the Hard toggle before starting the sim." },
      { title: "Question lifecycle", detail: "Frames 06–11 motivate the re-roll helper and overlay polling, matching the user’s BREAK-tile concern." }
    ]
  },
  {
    id: "youtube-llm",
    title: "YouTube – LLM Deep Dive",
    summary: "Mimic the exploratory typing, search for “how llm works”, open the 3Blue1Brown video, and handle the pre-roll ad.",
    preview: "video3/frames/frame01.webp",
    videoSrc: "videos/video3.webm",
    scriptPath: "video3/script.spec.ts",
    readmePath: "video3/README.md",
    sourceUrl: "https://www.youtube.com/",
    actions: [
      "Load youtube.com and dismiss the consent prompt if it appears.",
      "Type “hos”, observe suggestions, clear, then enter “how llm works”.",
      "Submit the query, scroll to “Large Language Models explained briefly” and click the thumbnail.",
      "Wait for the watch page, deal with the ad overlay, and click Skip when available."
    ],
    reasoning: [
      "The role-based search combobox works across home, results, and watch contexts.",
      "Replaying the partial query keeps the same suggestion timeline as the video.",
      "Ad handling first waits for `.ytp-ad-skip-button` but tolerates ad-free runs."
    ],
    frames: [
      { src: "video3/frames/frame01.webp", time: "00:00.0", label: "Home Feed", description: "Baseline YouTube feed before interacting.", codeRef: "await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });" },
      { src: "video3/frames/frame02.webp", time: "00:02.2", label: "Autocomplete", description: "Suggestion sheet after typing “hos”.", codeRef: "await searchInput.fill('hos');" },
      { src: "video3/frames/frame03.webp", time: "00:07.7", label: "Final Query", description: "“how llm works” locked into the search box.", codeRef: "await searchInput.type('how llm works', { delay: 120 });" },
      { src: "video3/frames/frame04.webp", time: "00:09.2", label: "Results Grid", description: "First fold of LLM explainer videos.", codeRef: "await expect(page).toHaveURL(/results\\?search_query=how\\+llm\\+works/i, {" },
      { src: "video3/frames/frame05.webp", time: "00:10.1", label: "Target Card", description: "3Blue1Brown result hovered before the click.", codeRef: "const llmVideo = page" },
      { src: "video3/frames/frame06.webp", time: "00:10.5", label: "Watch Page Boot", description: "Player area mounting immediately after navigation.", codeRef: "await llmVideo.locator('a#thumbnail').click();" },
      { src: "video3/frames/frame07.webp", time: "00:11.6", label: "Results Scroll", description: "Safety frame confirming URL change before the ad plays.", codeRef: "await expect(page).toHaveURL(/watch/, { timeout: 15_000 });" },
      { src: "video3/frames/frame08.webp", time: "00:12.8", label: "Ad Overlay", description: "Sponsor slate covering the player while we wait.", codeRef: "const skipButton = page.locator('.ytp-ad-skip-button-modern, .ytp-ad-skip-button');" },
      { src: "video3/frames/frame09.webp", time: "00:13.6", label: "Skip CTA", description: "Skip button visible, matching the automation step.", codeRef: "await skipButton.waitFor({ timeout: 10000 });" },
      { src: "video3/frames/frame10.webp", time: "00:19.2", label: "Post-Ad Playback", description: "Video playing cleanly after the ad branch resolves.", codeRef: "await pause(2000);" }
    ],
    findings: [
      { title: "Search reproducibility", detail: "Frames 01–05 justify why the combobox typing order is reproduced verbatim in the script." },
      { title: "Ad-handling proof", detail: "Frames 06–10 capture the exact ad overlay and Skip button that the spec waits for." }
    ]
  },
  {
    id: "newhackernews",
    title: "Hacker News – Nav Tour From Google",
    summary: "Search for hackernews on Google, open the Hacker News front page, then walk the top nav: new → past → comments → ask → show.",
    preview: "newhackernews/frames/frame01.webp",
    videoSrc: "videos/newhackernews.webm",
    scriptPath: "newhackernews/script.spec.ts",
    readmePath: "newhackernews/README.md",
    sourceUrl: "https://news.ycombinator.com/",
    actions: [
      "Open Google in an incognito window and type “hackernews” into the search field.",
      "Submit the query, then click the Hacker News result (or fall back to direct navigation).",
      "Wait for the front page to render, confirming the main HN table is visible.",
      "Click the top navigation links in order: new → past → comments → ask → show."
    ],
    reasoning: [
      "Google SERPs can rate-limit automation, so the script jumps straight to HN if a /sorry page appears.",
      "Top-nav clicks are scoped to `td.pagetop` so we never confuse them with story titles.",
      "URL assertions (`/newest`, `/front`, `/newcomments`, `/ask`, `/show`) lock the flow to the recorded sequence."
    ],
    frames: [
      { src: "newhackernews/frames/frame01.webp", time: "00:00.5", label: "Chrome Start", description: "New tab landing before any navigation.", codeRef: "await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });" },
      { src: "newhackernews/frames/frame02.webp", time: "00:04.5", label: "Google Ready", description: "Google home screen focused on the search field.", codeRef: "const searchField = page.locator('textarea[name=\"q\"]');" },
      { src: "newhackernews/frames/frame03.webp", time: "00:05.5", label: "Typing Query", description: "Typing begins with the autocomplete overlay open.", codeRef: "await searchField.fill('hackernews');" },
      { src: "newhackernews/frames/frame04.webp", time: "00:08.5", label: "Google Results", description: "SERP with the Hacker News result visible.", codeRef: "const hackerNewsLink = page.locator('a[href*=\"news.ycombinator.com\"]').filter({ hasText: /Hacker News/i }).first();" },
      { src: "newhackernews/frames/frame05.webp", time: "00:14.5", label: "HN Front Page", description: "Front page loaded with the main HN table visible.", codeRef: "await expect(page.locator('table#hnmain')).toBeVisible({ timeout: 10_000 });" },
      { src: "newhackernews/frames/frame06.webp", time: "00:16.5", label: "Nav: New", description: "Top navigation switched to new stories.", codeRef: "await clickTopNav('new', /newest/);" },
      { src: "newhackernews/frames/frame07.webp", time: "00:18.5", label: "Nav: Past", description: "Past stories view after navigation click.", codeRef: "await clickTopNav('past', /front/);" },
      { src: "newhackernews/frames/frame08.webp", time: "00:24.5", label: "Nav: Comments", description: "Comments listing after switching tabs.", codeRef: "await clickTopNav('comments', /newcomments/);" },
      { src: "newhackernews/frames/frame09.webp", time: "00:26.5", label: "Nav: Ask", description: "Ask HN page reached from the top nav.", codeRef: "await clickTopNav('ask', /ask/);" },
      { src: "newhackernews/frames/frame10.webp", time: "00:28.5", label: "Nav: Show", description: "Show HN listing loaded after the final click.", codeRef: "await clickTopNav('show', /show/);" }
    ],
    findings: [
      { title: "SERP-first flow", detail: "Frames 01–04 show the Google hop before hitting Hacker News, so the script keeps a search-first path with a direct-nav fallback." },
      { title: "Nav order proof", detail: "Frames 05–10 capture the exact top-nav walk (new → past → comments → ask → show), which the automation mirrors with URL checks." }
    ]
  },
  {
    id: "chatgpt-incognito",
    title: "ChatGPT Incognito Greeting",
    summary: "Incognito Google search for chatgpt.com followed by the “hi / i am good” exchange inside the ChatGPT composer.",
    preview: "video5/frames/frame01.webp",
    videoSrc: "videos/video5.webm",
    scriptPath: "video5/script.spec.ts",
    readmePath: "video5/README.md",
    sourceUrl: "https://chatgpt.com/",
    actions: [
      "Open an incognito tab, type chatgpt.com into the omnibox, and press Enter.",
      "Jump directly to chatgpt.com whenever Google serves a /sorry page.",
      "Wait for the composer, type “hi”, submit, await the assistant’s reply, then type “i am good”."
    ],
    reasoning: [
      "Composer detection uses `[contenteditable=\"true\"]` so we do not depend on private IDs.",
      "A small pause helper slows the flow to the 2–3 second cadence the user asked for.",
      "Cloudflare/verification banners are handled by waiting, matching the best effort captured on video."
    ],
    frames: [
      { src: "video5/frames/frame01.webp", time: "00:01.1", label: "Incognito Splash", description: "Chrome incognito welcome screen before typing.", codeRef: "await page.goto(GOOGLE_HOME, { waitUntil: 'domcontentloaded' });" },
      { src: "video5/frames/frame02.webp", time: "00:03.0", label: "Omnibox Query", description: "chatgpt.com entered into the omnibox.", codeRef: "const omnibox = page.locator('textarea[name=\"q\"]').first();" },
      { src: "video5/frames/frame03.webp", time: "00:03.4", label: "SERP Snapshot", description: "Google results right before we jump to chatgpt.com.", codeRef: "await page.keyboard.press('Enter');" },
      { src: "video5/frames/frame04.webp", time: "00:03.5", label: "Landing State", description: "ChatGPT splash while the composer initialises.", codeRef: "await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });" },
      { src: "video5/frames/frame05.webp", time: "00:03.7", label: "First Utterance", description: "“hi” typed inside the contenteditable composer.", codeRef: "const textarea = page.locator('[contenteditable=\"true\"]').first();" },
      { src: "video5/frames/frame06.webp", time: "00:06.6", label: "Assistant Reply", description: "Bot response (“Hey! What’s up?”) confirming handshake.", codeRef: "await expect(page.getByText(/Hey! .* What['’]s up\\?/)).toBeVisible({ timeout: 15_000 });" },
      { src: "video5/frames/frame07.webp", time: "00:10.7", label: "Second Utterance", description: "“i am good” being entered to mirror the recording.", codeRef: "await textarea.fill('i am good');" },
      { src: "video5/frames/frame08.webp", time: "00:21.1", label: "Conversation Idle", description: "Final chat state after the second message.", codeRef: "await pause(2500);" }
    ],
    findings: [
      { title: "Search + navigation proof", detail: "Frames 01–04 capture the incognito search path before we land on chatgpt.com." },
      { title: "Message fidelity", detail: "Frames 05–08 show the exact phrases (“hi / i am good”) that the automation replays." }
    ]
  }
];

const benchmark = {
  videoId: "video1",
  modelTimeSeconds: 40.49,
  modelTimeBreakdown: [
    { label: "Vision (gpt-5.2)", value: "11.20s", meter: "28%" },
    { label: "UI (gpt-5.2-codex)", value: "8.68s", meter: "21%" },
    { label: "Codegen (gpt-5.1-codex-max)", value: "20.61s", meter: "51%" },
  ],
  humanAverageMinutes: 20,
  humanRangeMinutes: "10–30",
  modelCostUsd: 0.066,
  costDetail: [
    "Vision tokens: 18,770",
    "UI tokens: 804",
    "Codegen tokens: 2,958",
  ],
  successRate: "90% (9/10)",
  successNote: "1 failure due to dynamic UI drift; 9 flows verified.",
  successPercentage: 90,
};

const cardsContainer = document.getElementById("demo-cards");
const outputContainer = document.getElementById("output");
const benchmarkContainer = document.getElementById("benchmark-cards");
const videoScriptCache = {};
let currentScriptRaw = "";
let commandCopyTimeout;
const defaultCopyIcon = '<i class="bi bi-clipboard"></i>';

const cardTemplate = (video) => html`
  <div class="col-sm-6 col-lg-4">
    <div
      class="card video-card h-100 shadow-sm"
      data-view="${video.id}"
      role="button"
      tabindex="0"
      aria-label="View ${video.title} reconstruction"
    >
      <img src="${video.preview}" class="card-img-top" alt="${video.title} preview" loading="lazy">
      <div class="card-body d-flex flex-column">
        <span class="badge text-bg-secondary text-uppercase align-self-start mb-2">${video.id}</span>
        <h3 class="h5 card-title">${video.title}</h3>
        <p class="card-text small text-muted">${video.summary}</p>
      </div>
    </div>
  </div>
`;

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const frameGrid = (video) => html`
  <div class="row g-3">
    ${video.frames.map(
  (frame, index) => html`
        <div class="col-sm-6 col-lg-4">
          <figure class="mb-0">
            <button class="frame-preview btn p-0 w-100" data-frame-index="${index}">
              <img src="${frame.src}" alt="${frame.label}" class="frame-img" loading="lazy">
            </button>
            <figcaption class="frame-caption mt-2"><strong>${frame.label}</strong><br><span class="frame-caption-secondary">t=${frame.time} · ${frame.description}</span></figcaption>
          </figure>
        </div>
      `
)}
  </div>
`;

const benchmarkTemplate = (data) => html`
  <div class="col-md-4">
    <div class="benchmark-card h-100">
      <div class="benchmark-header">
        <span class="benchmark-icon"><i class="bi bi-clock-history"></i></span>
        <div>
          <h3>Avg Time</h3>
          <span class="benchmark-pill">Model run</span>
        </div>
      </div>
      <div class="benchmark-meta">Video: ${data.videoId}</div>
      <div class="benchmark-hero">${data.modelTimeSeconds.toFixed(2)}s<span>total</span></div>
      <div class="benchmark-sub">Human baseline: ~${data.humanAverageMinutes} min (${data.humanRangeMinutes} min range)</div>
      <ul class="benchmark-list">
        ${data.modelTimeBreakdown.map(
  (item) => html`
            <li><strong>${item.label}</strong><span>${item.value}</span></li>
            <div class="benchmark-meter" style="--meter:${item.meter}">
              <span style="--meter:${item.meter}"></span>
            </div>
          `
)}
      </ul>
    </div>
  </div>
  <div class="col-md-4">
    <div class="benchmark-card h-100">
      <div class="benchmark-header">
        <span class="benchmark-icon"><i class="bi bi-currency-dollar"></i></span>
        <div>
          <h3>Model Cost</h3>
          <span class="benchmark-pill">Pricing-based</span>
        </div>
      </div>
      <div class="benchmark-meta">Vision + UI + codegen tokens</div>
      <div class="benchmark-hero">$${data.modelCostUsd.toFixed(3)}<span>USD</span></div>
      <div class="benchmark-sub">Single-run estimate for the pipeline.</div>
      <div class="benchmark-chip-row">
        ${data.costDetail.map((item) => html`<span class="benchmark-chip">${item}</span>`)}
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="benchmark-card h-100">
      <div class="benchmark-header">
        <span class="benchmark-icon"><i class="bi bi-shield-check"></i></span>
        <div>
          <h3>Success Rate</h3>
          <span class="benchmark-pill">Pipeline</span>
        </div>
      </div>
      <div class="benchmark-meta">Generation + completion</div>
      <div class="benchmark-ring" style="--ring: ${data.successPercentage}%;">
        <span>${data.successPercentage}%</span>
      </div>
      <div class="benchmark-hero">${data.successRate}</div>
      <div class="benchmark-sub">${data.successNote}</div>
    </div>
  </div>
`;

const findingsList = (video) =>
  video.findings?.length
    ? html`
        <div class="mt-3">
          <h5 class="h6 text-uppercase">Frame Findings</h5>
          <ul class="small text-muted mb-0">
            ${video.findings.map((item) => html`<li><strong>${item.title}.</strong> ${item.detail}</li>`)}
          </ul>
        </div>
      `
    : null;

const detailTemplate = (video, scriptText) => {
  const safeCode = escapeHtml(scriptText);
  return html`
  <div class="card border-0 shadow-sm p-4 mb-4">
    <div class="row g-4">
      <div class="col-lg-6">
        <video class="w-100 rounded" controls preload="metadata" poster="${video.preview}">
          <source src="${video.videoSrc}" type="video/webm">
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="col-lg-6">
        <h3 class="h4">${video.title}</h3>
        <p class="text-muted small">${video.summary}</p>
        <p class="text-muted small mb-2"><i class="bi bi-link-45deg me-1"></i><a href="${video.sourceUrl}" target="_blank" rel="noopener">${video.sourceUrl}</a></p>
        <h4 class="h6 text-uppercase mt-4">Action sequence</h4>
        <ol class="small text-muted">
          ${video.actions.map((step) => html`<li>${step}</li>`)}
        </ol>
        <h4 class="h6 text-uppercase mt-4">AI reasoning narrative</h4>
        <ul class="small text-muted">
          ${video.reasoning.map((point) => html`<li>${point}</li>`)}
        </ul>
      </div>
    </div>
  </div>
  <div class="card border-0 shadow-sm p-4 mb-4">
    <h4 class="h5 mb-3">Keyframes</h4>
    ${frameGrid(video)}
    ${findingsList(video)}
  </div>
  <div class="card border-0 shadow-sm p-4 script-card">
    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
      <div>
        <h4 class="h5 mb-1">Playwright Script</h4>
        <p class="small text-muted mb-0">Deterministic replay for <strong>${video.title}</strong></p>
      </div>
      <div class="btn-toolbar gap-2 flex-wrap">
        <button class="btn btn-sm btn-outline-light script-toggle" type="button" data-script-toggle aria-expanded="true" aria-label="Toggle script visibility">
          <i class="bi bi-chevron-up" data-script-toggle-icon></i>
        </button>
        <a href="${video.scriptPath}" class="btn btn-sm btn-outline-secondary" download aria-label="Download script file">
          <i class="bi bi-download"></i>
        </a>
        <button class="btn btn-sm btn-outline-primary" type="button" data-copy-code aria-label="Copy script">
          <i class="bi bi-clipboard"></i>
        </button>
      </div>
    </div>
    <div class="script-body" data-script-body>
      <pre><code class="language-ts">${unsafeHTML(safeCode)}</code></pre>
      <div class="mt-3">
        <div class="alert alert-success py-2 copy-alert d-none" role="alert">Script copied to clipboard.</div>
        <div class="alert alert-danger py-2 copy-alert-error d-none" role="alert">Copy failed. Please try again.</div>
      </div>
    </div>
  </div>
`;
};

const renderCards = () => {
  render(videos.map((video) => cardTemplate(video)), cardsContainer);
};

const renderBenchmark = () => {
  if (!benchmarkContainer) return;
  render(benchmarkTemplate(benchmark), benchmarkContainer);
};

const renderDetail = (video, scriptText) => {
  render(detailTemplate(video, scriptText), outputContainer);
  outputContainer.dataset.activeVideo = video.id;
  outputContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  outputContainer.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
  currentScriptRaw = scriptText;
  videoScriptCache[video.id] = scriptText;
  attachScriptToggle();
};

const loadScriptText = async (path) => {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch {
    return "// Unable to load script file.";
  }
};

const showVideoDetail = async (video) => {
  if (!video) return;
  render(
    html`<div class="card border-0 shadow-sm p-4 text-center text-muted">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      Loading ${video.title}...
    </div>`,
    outputContainer
  );

  const script = await loadScriptText(video.scriptPath);
  renderDetail(video, script);
};

cardsContainer.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-view]");
  if (!target) return;
  const video = videos.find((v) => v.id === target.dataset.view);
  showVideoDetail(video);
});

cardsContainer.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target.closest("[data-view]");
  if (!target) return;
  event.preventDefault();
  const video = videos.find((v) => v.id === target.dataset.view);
  showVideoDetail(video);
});

const copyTextToClipboard = async (text) => {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall back to execCommand below
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return success;
};

const copyScriptToClipboard = async () => copyTextToClipboard(currentScriptRaw);

const showCopyFeedback = (type) => {
  const successAlert = outputContainer.querySelector(".copy-alert");
  const errorAlert = outputContainer.querySelector(".copy-alert-error");
  const globalAlert = document.getElementById("global-copy-alert");
  if (globalAlert) {
    globalAlert.classList.remove("alert-success", "alert-danger", "d-none");
    globalAlert.classList.add(type === "success" ? "alert-success" : "alert-danger");
    globalAlert.textContent =
      type === "success" ? "Script copied to clipboard." : "Unable to copy script. Try again.";
    clearTimeout(commandCopyTimeout);
    commandCopyTimeout = setTimeout(() => globalAlert.classList.add("d-none"), 2200);
  }
  if (!successAlert || !errorAlert) return;
  successAlert.classList.add("d-none");
  errorAlert.classList.add("d-none");
  const target = type === "success" ? successAlert : errorAlert;
  target.classList.remove("d-none");
  setTimeout(() => {
    target.classList.add("d-none");
  }, 2500);
};

outputContainer.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy-code]");
  if (!copyButton) return;
  try {
    const copied = await copyScriptToClipboard();
    showCopyFeedback(copied ? "success" : "error");
  } catch {
    showCopyFeedback("error");
  }
});

function attachScriptToggle() {
  const toggleBtn = outputContainer.querySelector("[data-script-toggle]");
  const scriptBody = outputContainer.querySelector("[data-script-body]");
  const icon = toggleBtn?.querySelector("[data-script-toggle-icon]");
  if (!toggleBtn || !scriptBody) return;
  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", String(!expanded));
    scriptBody.classList.toggle("d-none", expanded);
    if (icon) {
      icon.className = expanded ? "bi bi-chevron-down" : "bi bi-chevron-up";
    }
  });
}

const resetCopyButton = (button) => {
  button.classList.remove("copy-success", "copy-error");
  button.innerHTML = defaultCopyIcon;
};

const showCommandCopyAlert = (type) => {
  const alertBox = document.getElementById("global-copy-alert");
  if (!alertBox) return;
  alertBox.classList.remove("alert-success", "alert-danger", "d-none");
  alertBox.classList.add(type === "success" ? "alert-success" : "alert-danger");
  alertBox.textContent = type === "success" ? "Command copied to clipboard." : "Unable to copy command. Try again.";
  clearTimeout(commandCopyTimeout);
  commandCopyTimeout = setTimeout(() => alertBox.classList.add("d-none"), 2200);
};

document.addEventListener("click", async (event) => {
  const cmdButton = event.target.closest("[data-copy-command]");
  if (!cmdButton) return;
  const command = cmdButton.dataset.copyCommand;
  const original = cmdButton.innerHTML;
  const commandBlock = cmdButton.closest(".command-block");
  try {
    const success = await copyTextToClipboard(command);
    cmdButton.innerHTML = success ? '<i class="bi bi-check-lg"></i>' : '<i class="bi bi-x-lg"></i>';
    cmdButton.classList.toggle("copy-success", success);
    cmdButton.classList.toggle("copy-error", !success);
    if (commandBlock) {
      commandBlock.classList.toggle("copied", success);
      if (!success) commandBlock.classList.remove("copied");
    }
    showCommandCopyAlert(success ? "success" : "error");
    setTimeout(() => {
      cmdButton.innerHTML = original || defaultCopyIcon;
      cmdButton.classList.remove("copy-success", "copy-error");
      if (commandBlock) {
        commandBlock.classList.remove("copied");
      }
    }, 1800);
  } catch {
    cmdButton.innerHTML = '<i class="bi bi-x-lg"></i>';
    cmdButton.classList.add("copy-error");
    showCommandCopyAlert("error");
    commandBlock?.classList.remove("copied");
    setTimeout(() => resetCopyButton(cmdButton), 1800);
  }
});

document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) =>
  toggle.addEventListener("click", () => {
    const theme = toggle.getAttribute("data-bs-theme-value");
    document.documentElement.setAttribute("data-bs-theme", theme);
  })
);

const lightbox = document.createElement("div");
lightbox.className = "frame-lightbox d-none";
lightbox.innerHTML = `
  <div class="frame-lightbox-backdrop"></div>
  <div class="frame-lightbox-content card shadow-lg text-bg-dark">
    <button class="frame-lightbox-close" aria-label="Close">Close</button>
    <div class="frame-lightbox-grid">
      <div class="frame-lightbox-media">
        <img src="" alt="" class="img-fluid rounded mb-3" id="frame-lightbox-img">
        <div class="d-flex justify-content-between mt-3 gap-2 flex-wrap">
          <button class="btn btn-outline-light frame-lightbox-prev"><i class="bi bi-arrow-left"></i> Prev</button>
          <button class="btn btn-outline-light frame-lightbox-next">Next <i class="bi bi-arrow-right"></i></button>
        </div>
      </div>
      <div class="lightbox-code-panel">
        <div class="mb-2">
          <h5 id="frame-lightbox-title" class="mb-1"></h5>
          <p class="small text-muted mb-0" id="frame-lightbox-desc"></p>
        </div>
        <pre><code id="frame-lightbox-code">Select a code snippet</code></pre>
      </div>
    </div>
  </div>
`;
document.body.appendChild(lightbox);

let lightboxFrames = [];
let lightboxIndex = 0;
const FRAME_MARK_START = "__FRAME_MARK_START__";
const FRAME_MARK_END = "__FRAME_MARK_END__";

const renderHighlightedScript = (videoId, snippet) => {
  const scriptText = videoScriptCache[videoId];
  if (!scriptText) {
    return snippet
      ? hljs.highlight(snippet, { language: "ts" }).value
      : "Script not loaded for this video.";
  }
  let decorated = scriptText;
  if (snippet) {
    const snippetIndex = scriptText.indexOf(snippet);
    if (snippetIndex !== -1) {
      decorated =
        scriptText.slice(0, snippetIndex) +
        FRAME_MARK_START +
        snippet +
        FRAME_MARK_END +
        scriptText.slice(snippetIndex + snippet.length);
    }
  }
  let html = hljs.highlight(decorated, { language: "ts" }).value;
  html = html
    .replace(new RegExp(FRAME_MARK_START, "g"), "<mark>")
    .replace(new RegExp(FRAME_MARK_END, "g"), "</mark>");
  return html;
};

const updateLightbox = () => {
  const frame = lightboxFrames[lightboxIndex];
  if (!frame) return;
  lightbox.querySelector("#frame-lightbox-img").src = frame.src;
  lightbox.querySelector("#frame-lightbox-img").alt = frame.label;
  lightbox.querySelector("#frame-lightbox-title").textContent = frame.label;
  lightbox.querySelector("#frame-lightbox-desc").textContent = frame.description;
  const codeEl = lightbox.querySelector("#frame-lightbox-code");
  if (codeEl) {
    const activeVideoId = outputContainer.dataset.activeVideo;
    if (frame.codeRef || videoScriptCache[activeVideoId]) {
      codeEl.innerHTML = renderHighlightedScript(activeVideoId, frame.codeRef);
    } else {
      codeEl.textContent = "No direct script reference mapped to this frame.";
    }
    requestAnimationFrame(() => {
      const scrollContainer = codeEl.closest(".lightbox-code-panel")?.querySelector("pre");
      if (!scrollContainer) return;
      const marked = scrollContainer.querySelector("mark");
      if (marked) {
        const scrollTop = marked.offsetTop - scrollContainer.offsetTop - scrollContainer.clientHeight * 0.25;
        scrollContainer.scrollTo({ top: Math.max(scrollTop, 0), behavior: "smooth" });
      } else {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
};

const openLightbox = (frames, index) => {
  lightboxFrames = frames;
  lightboxIndex = index;
  updateLightbox();
  lightbox.classList.remove("d-none");
};

const closeLightbox = () => {
  lightbox.classList.add("d-none");
  lightboxFrames = [];
};

lightbox.addEventListener("click", (event) => {
  if (
    event.target.classList.contains("frame-lightbox-backdrop") ||
    event.target.classList.contains("frame-lightbox-close")
  ) {
    closeLightbox();
  } else if (event.target.classList.contains("frame-lightbox-prev")) {
    lightboxIndex = (lightboxIndex - 1 + lightboxFrames.length) % lightboxFrames.length;
    updateLightbox();
  } else if (event.target.classList.contains("frame-lightbox-next")) {
    lightboxIndex = (lightboxIndex + 1) % lightboxFrames.length;
    updateLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (lightbox.classList.contains("d-none")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") {
    lightboxIndex = (lightboxIndex - 1 + lightboxFrames.length) % lightboxFrames.length;
    updateLightbox();
  }
  if (event.key === "ArrowRight") {
    lightboxIndex = (lightboxIndex + 1) % lightboxFrames.length;
    updateLightbox();
  }
});

outputContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-frame-index]");
  if (!button) return;
  const activeVideoId = outputContainer.dataset.activeVideo;
  const video = videos.find((v) => v.id === activeVideoId);
  if (!video) return;
  openLightbox(video.frames, Number(button.dataset.frameIndex));
});

renderBenchmark();
renderCards();
