import { launch, sleep } from './lib.mjs';

// Code export on a page: solve, open the Export arrow menu, pick "Code", and the export dialog has a Code tab
// (it is only there when the page has a code generator). The program itself sits behind NETZ Pro and is
// checked by tests/engines/code-export.test.mjs and npm run check:code-export.
// Run with the dev server on 3211: ONLY=romberg-integration,emi-calculator node tests/browser/code-export-check.mjs
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const ROUTES = (process.env.ONLY || 'romberg-integration').split(',');
const { browser, page, errors } = await launch({ width: 1280, height: 900 });
let bad = 0;
for (const r of ROUTES) {
  const before = errors.length;
  await page.goto(`${BASE}/${r}`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => document.body.dataset.pageHydrated, { timeout: 120000 }).catch(() => {});
  // The solve button: data-solve on shared calculators, else the main button of the calculator card
  const solved = await page.evaluate(() => {
    const b = document.querySelector('[data-solve]') || [...document.querySelectorAll('button')].find((x) => /^(Solve|Calculate|Find|Interpolate|Build|Integrate|Compute)/i.test(x.textContent.trim()));
    if (!b) return false;
    b.click();
    return true;
  });
  await sleep(1500);
  // The arrow next to Export opens the menu that holds Code (the Export button itself opens the picture export)
  const exportBtn = await page.evaluateHandle(() => document.querySelector('[id^="netz-solve-"] button[title="Quick Export Options"]'));
  const hasExport = await page.evaluate((b) => !!b, exportBtn);
  let code = '';
  let hasCode = false;
  if (hasExport) {
    await page.evaluate((b) => b.click(), exportBtn);
    await sleep(800);
    const item = await page.evaluateHandle(() => [...document.querySelectorAll('button, [role="menuitem"]')].find((b) => /Code \(Python/.test(b.textContent)));
    hasCode = await page.evaluate((b) => !!b, item);
    if (hasCode) {
      await page.evaluate((b) => b.click(), item);
      // The dialog's code loads on first use, so wait for it rather than a fixed time
      await page.waitForFunction(() => /^Code$/m.test(document.querySelector('[role="dialog"]')?.innerText || ''), { timeout: 15000 }).catch(() => {});
      code = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText || '');
    }
  }
  const codeTab = /^Code$/m.test(code);
  const ok = solved && hasExport && hasCode && codeTab && errors.length === before;
  if (!ok) bad++;
  console.log(r.padEnd(32), `solved=${solved}`, `export=${hasExport}`, `code-option=${hasCode}`, `code-tab=${codeTab}`, `errors=${errors.length - before}`, `title=${code.split('\n')[1] || ''}`, errors.slice(before).map((e) => e.slice(0, 120)).join(' | '));
}
await browser.close();
process.exit(bad ? 1 : 0);
