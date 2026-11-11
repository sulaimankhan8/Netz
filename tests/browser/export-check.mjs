import { launch, sleep } from './lib.mjs';

// The Export button on shared step-by-step calculators (SymbolicCalculator): after a solve it appears in the
// answer box, its menu opens, and the dialog offers LaTeX (and Code only where a code generator exists).
// Run with the dev server on 3211: ONLY=markov-chain,kuhn-tucker node tests/browser/export-check.mjs
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const ROUTES = (process.env.ONLY || 'markov-chain').split(',');
const { browser, page, errors } = await launch({ width: 1280, height: 900, deviceScaleFactor: 1 });
let bad = 0;
for (const r of ROUTES) {
  const before = errors.length;
  await page.goto(`${BASE}/${r}`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => document.body.dataset.pageHydrated, { timeout: 120000 }).catch(() => {});
  await page.click('[data-solve]');
  await sleep(1500);
  const found = await page.evaluate(() => [...document.querySelectorAll('[id^="netz-solve-"] button')].some((b) => /Export/.test(b.textContent)));
  let tabs = [];
  if (found) {
    await page.evaluate(() => [...document.querySelectorAll('[id^="netz-solve-"] button')].find((b) => /Export/.test(b.textContent)).click());
    await sleep(800);
    tabs = await page.evaluate(() => [...document.querySelectorAll('button, [role="tab"]')].map((b) => b.textContent.trim()).filter((t) => /^(LaTeX|Code|PNG|PDF|SVG)/i.test(t)));
  }
  const ok = found && errors.length === before;
  if (!ok) bad++;
  console.log(r.padEnd(28), `export=${found ? 'yes' : 'NO'}`, `options=[${tabs.join(', ')}]`, `errors=${errors.length - before}`, errors.slice(before).map((e) => e.slice(0, 120)).join(' | '));
}
await browser.close();
process.exit(bad ? 1 : 0);
