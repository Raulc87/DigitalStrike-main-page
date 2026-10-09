#!/usr/bin/env node
// Layout check for proposal HTML files, at 360, 390 and 1280 px wide:
//   - full-page screenshots
//   - horizontal overflow (page wider than the viewport)
//   - touch targets smaller than 44x44 px (WCAG 2.5.5). Checked: links,
//     buttons, form fields; for radios/checkboxes the larger of the input and
//     its label (wrapping or linked with for=). Links inline in a sentence
//     are exempt (WCAG 2.5.8).
//
// Usage:
//   node check_pages.mjs proposal-a.html proposal-b.html [--out shots/]
//
// Exit codes (same convention as contrast.py):
//   0  no problems found
//   1  layout problems found (listed as CHECK lines)
//   2  usage or environment error (bad arguments, missing file, no Playwright, no browser)
//
// Setup (Node 18+):
//   The script loads `playwright` or `playwright-core` from the folder you run
//   it in (its node_modules), falling back to the script's own folder. E.g.:
//     mkdir /tmp/pagecheck && cd /tmp/pagecheck && npm i playwright-core
//     node /path/to/check_pages.mjs /path/to/proposal-a.html --out shots
//   Browser: with `playwright`, run `npx playwright install chromium` once, or
//   point CHROMIUM_PATH at an existing Chrome/Chromium binary (required with
//   playwright-core unless its browsers were installed).
import { resolve, basename, join } from 'node:path';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

function fail(message) {
  console.error(`ERROR  ${message}`);
  process.exit(2);
}

async function loadPlaywright() {
  const bases = [join(process.cwd(), 'noop.js'), import.meta.url];
  for (const base of bases) {
    const req = createRequire(base);
    for (const name of ['playwright', 'playwright-core']) {
      try {
        const mod = await import(pathToFileURL(req.resolve(name)).href);
        return mod.chromium ? mod : mod.default; // CommonJS packages expose exports on default
      } catch { /* try next */ }
    }
  }
  fail('playwright or playwright-core not found. Install one in the folder you run this from (npm i playwright-core); see the script header.');
}

const args = process.argv.slice(2);
let out = 'shots';
const outIdx = args.indexOf('--out');
if (outIdx >= 0) {
  if (!args[outIdx + 1] || args[outIdx + 1].startsWith('--')) fail('--out needs a folder name.');
  out = args[outIdx + 1];
  args.splice(outIdx, 2);
}
if (!args.length) fail('Usage: node check_pages.mjs page.html [...] [--out dir]');
for (const file of args) {
  if (!existsSync(file)) fail(`file not found: ${file}`);
  if (!statSync(file).isFile()) fail(`not a file: ${file}`);
}

const pw = await loadPlaywright();
let browser;
try {
  browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
} catch (err) {
  fail(`could not launch Chromium (${String(err.message).split('\n')[0]}). Run "npx playwright install chromium" or set CHROMIUM_PATH.`);
}
mkdirSync(out, { recursive: true });

let problems = 0;
for (const file of args) {
  for (const width of [360, 390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(pathToFileURL(resolve(file)).href);
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const box = (el) => el.getBoundingClientRect();
      const area = (b) => b.width * b.height;
      const describe = (el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.value || el.name || '').trim().slice(0, 30)}"`;
      const seen = new Set();
      const small = [];
      for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea')) {
        if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue; // WCAG 2.5.8 exemption
        let target = el;
        if (['radio', 'checkbox'].includes(el.type) && el.labels && el.labels.length) {
          // The effective target is the larger of the input and any of its labels.
          target = [el, ...el.labels].reduce((a, b) => (area(box(b)) > area(box(a)) ? b : a));
        }
        if (seen.has(target)) continue;
        seen.add(target);
        const b = box(target);
        if (b.width === 0 || b.height === 0) continue; // hidden
        if (b.width < 44 || b.height < 44) small.push(`${describe(target)} ${Math.round(b.width)}x${Math.round(b.height)}`);
      }
      return { overflow, small: small.slice(0, 8), more: Math.max(0, small.length - 8) };
    });
    const shot = join(out, `${basename(file, '.html')}-${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const flags = [];
    if (r.overflow > 0) flags.push(`horizontal overflow ${r.overflow}px`);
    if (r.small.length) flags.push(`targets under 44x44: ${r.small.join(', ')}${r.more ? ` (+${r.more} more)` : ''}`);
    problems += flags.length;
    console.log(`${flags.length ? 'CHECK' : 'OK   '}  ${basename(file)} @${width}px  ${flags.join('; ')}  -> ${shot}`);
    await page.close();
  }
}
await browser.close();
process.exit(problems ? 1 : 0);
