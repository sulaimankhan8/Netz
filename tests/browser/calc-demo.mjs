// Guide mode and the live Demo on the calculator cards (src/app/components/method/calcDemo.js).
// One page per calculator frame. Checks: Guide off by default and no help text; Guide on shows it; Demo empties the
// boxes, fills them one at a time (seen part-way through), presses Solve and an answer appears; no console errors.
// Usage: NETZ_URL=http://localhost:3211 node calc-demo.mjs [--phone]
import { launch, BASE, sleep } from './lib.mjs';

const PAGES = [
  'sor-method',              // Calculator, hand-built (matrix grid)
  'jacobian-calculator',     // SymbolicCalculator
  'cholesky-decomposition',  // MatrixMethodCalculator
  'rk2-method',              // OdeCalculator
  'bessel-interpolation',    // InterpolationCalculator
  'fd-calculator',           // SavingsCalculator
  'area-and-perimeter',      // ShapeCalculator
  'emi-calculator',          // Calculator, hand-built
];
const phone = process.argv.includes('--phone');
const { browser, page } = await launch(phone ? { width: 390, height: 844 } : { width: 1366, height: 900 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

let pass = 0;
let fail = 0;
const expect = (name, ok, extra = '') => { if (ok) pass += 1; else { fail += 1; console.log(`FAIL ${name} ${extra}`); } };

for (const slug of PAGES) {
  const before = errors.length;
  await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle2', timeout: 180000 });
  await page.evaluate(() => { try { localStorage.removeItem('netz_calc_guide'); } catch {} });
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1200);

  const start = await page.evaluate(() => {
    const card = document.querySelector('[data-calc-card]');
    return {
      card: !!card,
      demo: !!card?.querySelector('[data-demo]'),
      solve: !!card?.querySelector('[data-solve]'),
      helpShown: !!card?.querySelector('[data-how-to-use], [data-typing-guide]'),
    };
  });
  expect(`${slug}: card, Demo and Solve`, start.card && start.demo && start.solve, JSON.stringify(start));
  expect(`${slug}: guide off by default`, !start.helpShown);

  // Guide on and off
  await page.evaluate(() => [...document.querySelectorAll('[data-calc-card] button')].find((b) => b.textContent.trim() === 'Guide')?.click());
  await sleep(200);
  const guide = await page.evaluate(() => document.querySelector('[data-calc-card] button[aria-pressed="true"]')?.textContent.trim());
  expect(`${slug}: Guide switch turns on`, guide === 'Guide');
  // The words load on demand: wait for How to use, with the real button name in place of {button}
  let howTo = null;
  for (let i = 0; i < 20 && !howTo; i += 1) {
    await sleep(250);
    howTo = await page.evaluate(() => document.querySelector('[data-calc-card] [data-how-to-use]')?.textContent || null);
  }
  expect(`${slug}: guide shows How to use`, !!howTo);
  expect(`${slug}: button name filled in`, !!howTo && !howTo.includes('{button}') && !howTo.includes('the solve button'), (howTo || '').slice(0, 120));
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(`${slug}: no sideways scrolling with the guide on`, !sideways);
  await page.evaluate(() => [...document.querySelectorAll('[data-calc-card] button')].find((b) => b.textContent.trim() === 'Guide')?.click());

  // Demo: watch the boxes fill
  await page.evaluate(() => document.querySelector('[data-calc-card] [data-demo]').click());
  const samples = [];
  for (let i = 0; i < 12; i += 1) {
    await sleep(350);
    samples.push(await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('[data-calc-card] input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=date]), [data-calc-card] textarea')].filter((b) => b.offsetParent);
      return boxes.filter((b) => b.value !== '').length + '/' + boxes.length;
    }));
  }
  // Part-way through, some boxes are filled and some still empty
  const partial = samples.some((s) => { const [a, b] = s.split('/').map(Number); return b > 1 && a > 0 && a < b; });
  expect(`${slug}: boxes fill one at a time`, partial, samples.join(' '));
  // Wait for the demo to end (button says Demo again) and an answer
  let done = false;
  for (let i = 0; i < 60 && !done; i += 1) {
    await sleep(500);
    done = await page.evaluate(() => document.querySelector('[data-calc-card] [data-demo]')?.textContent.trim() === 'Demo');
  }
  const answered = await page.evaluate(() => !!document.querySelector('[data-calc-card] [data-result]'));
  expect(`${slug}: demo ends with an answer`, done && answered, `done=${done} answered=${answered}`);
  expect(`${slug}: no console errors`, errors.length === before, errors.slice(before).join(' | ').slice(0, 300));
  console.log(`${slug}: ${samples.join(' ')}`);
}

console.log(`\n${pass}/${pass + fail} checks passed`);
await browser.close();
process.exitCode = fail ? 1 : 0;
