// "Open in Notes" on method pages (AlgorithmNavigation) and /Notes?method=<id> (Notes/page.js, utils/methodNote.js).
// Pages with a Notes widget show the card; the button opens Notes with one new note named after the method that holds
// its live calculator; the address is cleaned, so a reload adds nothing. A page without a widget shows no card.
// Usage: NETZ_URL=http://localhost:3211 node open-in-notes.mjs [--phone]
import { launch, BASE, sleep } from './lib.mjs';

const WITH_WIDGET = [
  { route: '/bisection-method', name: 'Bisection Method' },        // an original page
  { route: '/runge-kutta-method', name: 'Runge-Kutta' },           // original, widget id differs from the page id
  { route: '/Gauss-seidal', name: 'Gauss Seidel' },
  { route: '/jacobian-calculator', name: 'Jacobian' },             // a newer page with a generated widget              // original; route has capitals
];
// Pages without a Notes widget (hand-built calculators) show no card
const WITHOUT_WIDGET = ['/sor-method', '/derivative-calculator'];

const phone = process.argv.includes('--phone');
const { browser, page } = await launch(phone ? { width: 390, height: 844 } : { width: 1366, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !/adsbygoogle|googletagmanager|Failed to load resource/i.test(m.text())) errors.push(m.text()); });

let pass = 0;
let fail = 0;
const expect = (name, ok, extra = '') => { if (ok) pass += 1; else { fail += 1; console.log(`FAIL ${name} ${extra}`); } };
const notesStored = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('netz_notes_v2_data') || '[]'); } catch { return []; } });

for (const { route, name } of WITH_WIDGET) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 180000 });
  const beforeNotes = await notesStored();
  const before = beforeNotes.length;
  const beforeIds = new Set(beforeNotes.map((n) => n.id));
  const href = await page.evaluate(() => document.querySelector('[data-open-in-notes] a')?.getAttribute('href'));
  expect(`${route}: Open in Notes card`, !!href && href.startsWith('/Notes?method='), href);
  if (!href) continue;
  await page.evaluate(() => document.querySelector('[data-open-in-notes] a').click());
  await page.waitForFunction(() => location.pathname === '/Notes', { timeout: 180000 });
  await sleep(2500);
  const after = await notesStored();
  const made = after.find((n) => !beforeIds.has(n.id) && n.subtitle?.startsWith('Live calculator'));
  // The first visit to Notes also stores its welcome notes, so count only notes made by the link
  expect(`${route}: one new note`, after.filter((n) => !beforeIds.has(n.id) && (n.blocks || []).some((b) => b.type === 'widget') && n.subtitle?.startsWith('Live calculator')).length === 1, `${before} -> ${after.length}`);
  expect(`${route}: note holds the calculator widget`, !!made && made.blocks.some((b) => b.type === 'widget'));
  expect(`${route}: note is named after the method`, !!made && made.title.toLowerCase().includes(name.toLowerCase().split(' ')[0]), made?.title);
  expect(`${route}: address cleaned`, await page.evaluate(() => !location.search.includes('method=')));
  // The note opens once Notes has loaded (slow on a development server's first visit)
  let shown = false;
  for (let i = 0; i < 20 && !shown; i += 1) {
    shown = await page.evaluate((n) => document.body.innerText.toLowerCase().includes(n.toLowerCase().split(' ')[0]), name);
    if (!shown) await sleep(500);
  }
  expect(`${route}: the note is open on screen`, shown);
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1500);
  expect(`${route}: reload adds no second note`, (await notesStored()).length === after.length);
}

for (const route of WITHOUT_WIDGET) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 180000 });
  expect(`${route}: no card when the page has no Notes widget`, await page.evaluate(() => !document.querySelector('[data-open-in-notes]')));
}

expect('no page errors', errors.length === 0, errors.join(' | ').slice(0, 300));
console.log(`${pass}/${pass + fail} checks passed`);
await browser.close();
process.exitCode = fail ? 1 : 0;
