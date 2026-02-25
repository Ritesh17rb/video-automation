#!/usr/bin/env node
/**
 * pipeline.js — Video → Playwright Script Pipeline (Gemini via LLM Foundry)
 *
 * Usage:
 *   node pipeline.js videos/video2.webm
 *
 * Config (.env):
 *   LLMFOUNDRY_TOKEN   required
 *   MODEL              optional (default: gemini-1.5-pro-latest)
 *   FPS                optional — frames/sec to extract (default: 1)
 *   MAX_FRAMES         optional — cap on frames sent (default: 40)
 *   PROJECT            optional (default: playwright-pipeline)
 *
 * Output:
 *   scripts/<videoname>/<videoname>.spec.js
 */

'use strict';

const fs           = require('fs');
const path         = require('path');
const os           = require('os');
const { execSync } = require('child_process');
const https        = require('https');
const http         = require('http');

// ── Load .env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const file = path.join(__dirname, '.env');
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) {
      if (!process.env.LLMFOUNDRY_TOKEN) process.env.LLMFOUNDRY_TOKEN = line;
    } else {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG = {
  token:     process.env.LLMFOUNDRY_TOKEN || '',
  model:     process.env.MODEL            || 'gemini-2.0-flash',
  fps:       parseFloat(process.env.FPS   || '1'),
  maxFrames: parseInt(process.env.MAX_FRAMES || '40', 10),
  project:   process.env.PROJECT          || 'playwright-pipeline',
  base:      'https://llmfoundry.straivedemo.com/gemini',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const log = s  => process.stderr.write(s + '\n');
const hr  = () => process.stderr.write('─'.repeat(60) + '\n');
function die(msg) { log('\nERROR: ' + msg); process.exit(1); }

/** Promise-based HTTP/HTTPS request. Returns { status, headers, body (Buffer) }. */
function request(urlStr, opts = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(
      {
        hostname: url.hostname,
        port:     url.port || (url.protocol === 'https:' ? 443 : 80),
        path:     url.pathname + url.search,
        method:   opts.method || 'GET',
        headers:  {
          Authorization: `Bearer ${CONFIG.token}:${CONFIG.project}`,
          ...opts.headers,
        },
      },
      res => {
        const chunks = [];
        res.on('data',  d => chunks.push(d));
        res.on('end',   () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── CLI & validation ──────────────────────────────────────────────────────────

const [videoArg] = process.argv.slice(2);

function validate() {
  if (!videoArg)                die('Usage: node pipeline.js videos/<file.webm>');
  if (!fs.existsSync(videoArg)) die(`Video not found: ${videoArg}`);
  if (!CONFIG.token)            die('LLMFOUNDRY_TOKEN is not set — add it to .env');
}

/** Derives scripts/<name>/<name>.spec.js and creates the directory. */
function deriveOutput(videoPath) {
  const name = path.basename(videoPath, path.extname(videoPath));
  const dir  = path.join(__dirname, 'scripts', name);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${name}.spec.js`);
}

// ── Step 1: Extract frames via ffmpeg ─────────────────────────────────────────

function extractFrames(videoPath) {
  log('\n[1/5] Extracting frames from video...');

  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-frames-'));
  const interval = (1 / CONFIG.fps).toFixed(3);
  const pattern  = path.join(tmpDir, 'frame_%04d.jpg');

  try {
    execSync(
      `ffmpeg -i "${videoPath}" -vf "fps=1/${interval},scale=1280:-2" -q:v 4 "${pattern}" -y`,
      { stdio: 'pipe' }
    );
  } catch (e) {
    die('ffmpeg failed — is ffmpeg installed?\n' + e.stderr?.toString().split('\n').pop());
  }

  const files = fs.readdirSync(tmpDir)
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .slice(0, CONFIG.maxFrames);

  if (!files.length) die('No frames extracted — is the file a valid video?');

  const frames = files.map(f => ({
    name: f,
    b64:  fs.readFileSync(path.join(tmpDir, f)).toString('base64'),
  }));

  const truncated = files.length === CONFIG.maxFrames;
  log(`      ${frames.length} frames at ${CONFIG.fps} fps${truncated ? ' (capped)' : ''}`);

  // Cleanup tmp dir
  files.forEach(f => fs.unlinkSync(path.join(tmpDir, f)));
  fs.rmdirSync(tmpDir);

  return frames;
}

// ── Step 2: Multi-agent LLM orchestration ─────────────────────────────────────

function framesToInlineParts(frames) {
  return frames.map(f => ({
    inline_data: { mime_type: 'image/jpeg', data: f.b64 },
  }));
}

async function callModel(parts, maxOutputTokens = 4096) {
  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { maxOutputTokens },
  });

  const res = await request(
    `${CONFIG.base}/v1beta/models/${CONFIG.model}:generateContent`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    body
  );

  if (res.status !== 200)
    die(`Gemini API error (${res.status}):\n${res.body}`);

  const data      = JSON.parse(res.body.toString());
  const partTexts = data.candidates?.[0]?.content?.parts
    ?.map(p => p?.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!partTexts)
    die('No text in Gemini response:\n' + JSON.stringify(data, null, 2));

  return partTexts;
}

function parseJSONResponse(raw, label) {
  const trimmed = raw.trim();
  const fenced  = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const payload = fenced ? fenced[1].trim() : trimmed;

  const attemptParse = str => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  let parsed = attemptParse(payload);
  if (!parsed) {
    const start = payload.indexOf('{');
    const end   = payload.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      parsed = attemptParse(payload.slice(start, end + 1));
    }
  }

  if (!parsed)
    die(`${label} did not return valid JSON:\n${raw}`);

  return parsed;
}

async function analyzeFrames(frames) {
  log('\n[2/5] Agent 1 — analyzing visual timeline...');

  const interval = (1 / CONFIG.fps).toFixed(1);
  const prompt   = `You are Agent 1 (Vision Analyst). You will receive ${frames.length} chronological screenshots taken every ${interval}s.
Infer the user's journey and describe it as structured JSON with this schema:
{
  "startUrl": "https://example.com",
  "goals": ["short objective strings"],
  "actions": [
    {
      "id": 1,
      "description": "Human-readable summary of what the user did at this moment",
      "selectorHints": ["text on buttons, #ids, aria labels, etc."],
      "assertions": ["Expected visible outcomes to verify"],
      "navigation": "none" | "goto" | "form_submit" | "link_click"
    }
  ]
}
Keep arrays compact, omit unknown fields by using empty arrays, and NEVER add commentary outside the JSON.`;

  const text     = await callModel(
    [...framesToInlineParts(frames), { text: prompt }],
    4096
  );

  const analysis = parseJSONResponse(text, 'Agent 1');
  const actionCount = Array.isArray(analysis.actions) ? analysis.actions.length : 0;
  log(`      Actions identified: ${actionCount}`);
  return analysis;
}

async function authorSpec(frames, plan) {
  log('\n[3/5] Agent 2 — drafting Playwright script...');

  const planJson = JSON.stringify(plan, null, 2);
  const prompt   = `You are Agent 2 (Playwright Author). Use the vision plan below to recreate the exact browser session in Playwright.

Plan JSON:
${planJson}

Requirements:
- Import { test, expect } from '@playwright/test', wrap everything in test('user session', async ({ page }) => { ... }).
- Navigate using await page.goto() with the URL inferred by Agent 1.
- Prefer deterministic selectors (#id > getByRole exact > getByText > CSS).
- Every click, link follow, or submission must be followed by await page.waitForLoadState('networkidle').
- Only call fill() once per field with the final text.
- Add concise inline comments describing each step.
- Add expect() assertions for the critical outcomes listed in the plan.
- Output ONLY runnable JavaScript — absolutely no markdown fences or explanations.`;

  const text = await callModel(
    [...framesToInlineParts(frames), { text: prompt }],
    8192
  );

  return text;
}

async function reviewSpec(plan, spec) {
  const planJson = JSON.stringify(plan, null, 2);
  const prompt   = `You are Agent 3 (QA Reviewer). Verify that the Playwright script fully implements the plan, uses stable selectors, includes required waits, and asserts outcomes.

Return STRICT JSON ONLY in one of these shapes:
{"status":"pass","notes":"short justification"}
{"status":"needs_fix","notes":"what must change","spec":"FULL corrected JavaScript source"}

Plan JSON:
${planJson}

Current Playwright spec:
"""javascript
${spec}
"""`;

  const text   = await callModel([{ text: prompt }], 4096);
  const review = parseJSONResponse(text, 'Agent 3');
  return review;
}

async function reviewAndImprove(plan, initialSpec) {
  log('\n[4/5] Agent 3 — validating and self-healing script...');

  const MAX_REVIEW_PASSES = 3;
  let spec   = initialSpec;

  for (let attempt = 1; attempt <= MAX_REVIEW_PASSES; attempt++) {
    log(`      Review pass ${attempt}/${MAX_REVIEW_PASSES}`);
    const verdict = await reviewSpec(plan, spec);

    if (verdict.status === 'pass') {
      if (verdict.notes) log(`      Reviewer notes: ${verdict.notes}`);
      return spec;
    }

    if (verdict.status === 'needs_fix') {
      if (!verdict.spec)
        die('Reviewer reported issues but did not supply a corrected spec.');

      log(`      Reviewer requested changes: ${verdict.notes || 'n/a'}`);
      spec = stripFences(verdict.spec);
      continue;
    }

    die('Reviewer returned an unknown status: ' + JSON.stringify(verdict));
  }

  log('      Reviewer still found issues after max passes — proceeding with latest revision.');
  return spec;
}

async function synthesizeSpec(frames) {
  const plan       = await analyzeFrames(frames);
  const draft      = stripFences(await authorSpec(frames, plan));
  const validated  = await reviewAndImprove(plan, draft);
  return { plan, code: validated };
}

// ── Step 5: Save ──────────────────────────────────────────────────────────────

function stripFences(raw) {
  const m = raw.match(/```(?:javascript|js|typescript|ts)?\n?([\s\S]*?)(?:```|$)/);
  return (m ? m[1] : raw).trim();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  validate();

  const outputFile = deriveOutput(videoArg);

  log('');
  log('Video → Playwright Pipeline  (Multi-Agent Gemini via LLM Foundry)');
  hr();
  log(`Video  : ${path.resolve(videoArg)}`);
  log(`Output : ${path.resolve(outputFile)}`);
  log(`Model  : ${CONFIG.model}`);
  log(`Frames : ${CONFIG.fps} fps  (max ${CONFIG.maxFrames})`);
  hr();

  const frames        = extractFrames(videoArg);
  const { code }      = await synthesizeSpec(frames);

  fs.writeFileSync(outputFile, code, 'utf8');

  log('\n[5/5] Script saved.');
  hr();
  log(`\nRun the test:`);
  log(`  npx playwright test ${path.relative(process.cwd(), outputFile)} --headed\n`);
}

main().catch(e => die(e.message));
