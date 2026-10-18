import path from 'node:path';
import fs from 'node:fs';
import { launch, sleep, BASE, SHOTS } from './lib.mjs';

// Onboarding tours started from the landing page cards (src/app/components/tour). Run against a
// production build:  NETZ_URL=http://localhost:3213 node tours.mjs
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
fs.mkdirSync(SHOTS, { recursive: true });

const TOURS = [
  { id: 'playground', url: '/Playground?tour=playground', steps: 5 },
  { id: 'insert', url: '/Playground?tour=insert', steps: 5 },
  { id: 'notes', url: '/Notes?tour=notes', steps: 6 },
  { id: 'blocks', url: '/Notes?tour=blocks', steps: 4 },
  { id: 'hub', url: '/Algorithems?tour=hub', steps: 4 },
  { id: 'gauss-seidel', url: '/Gauss-seidal?tour=true', steps: 5 },
  { id: 'settings', url: '/Setting?tour=settings', steps: 3 },
];
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1280, height: 800, deviceScaleFactor: 1 };
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

const bubbleInfo = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-tour-bubble]');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const style = getComputedStyle(b);
  return {
    kicker: b.querySelector('.nz-tour-kicker')?.textContent.replace(/\s+/g, ' ').trim(),
    title: b.querySelector('.nz-tour-title')?.textContent,
    sheet: b.classList.contains('is-sheet'),
    position: style.position,
    bottom: Math.round(window.innerHeight - r.bottom),
    inView: r.top >= 0 && r.bottom <= window.innerHeight + 1 && r.left >= -1 && r.right <= window.innerWidth + 1,
    centred: Math.abs((r.left + r.right) / 2 - window.innerWidth / 2) < 4 && Math.abs((r.top + r.bottom) / 2 - window.innerHeight / 2) < 4,
    bg: style.backgroundColor,
    focus: document.activeElement?.textContent?.trim(),
    small: [...b.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().height < 44).length,
  };
});

async function waitForBubble(page, timeout = 90000) {
  await page.waitForSelector('[data-tour-bubble]', { timeout });
  await sleep(450);
}

async function clickMain(page) {
  await page.evaluate(() => document.querySelector('[data-tour-bubble] .nz-tour-btn.is-main').click());
  await sleep(700);
}

async function runTour(page, tour, label) {
  await page.goto(BASE + tour.url, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await waitForBubble(page);
  const url = await page.evaluate(() => window.location.search);
  check(`${label} ${tour.id}: ?tour= removed from the address`, !/tour=/.test(url), url);
  const seen = [];
  for (let i = 0; i < tour.steps; i += 1) {
    const info = await bubbleInfo(page);
    if (!info) {
      seen.push(`step ${i + 1}: no bubble`);
      break;
    }
    seen.push(`${info.kicker} "${info.title}"${info.centred ? ' (centre)' : ''}${info.inView ? '' : ' (OFF SCREEN)'}${info.small ? ` (${info.small} small buttons)` : ''}`);
    if (i === 0) await page.screenshot({ path: path.join(SHOTS, `tour-${label}-${tour.id}.png`) });
    if (i < tour.steps - 1) await clickMain(page);
  }
  const all = seen.join(' | ');
  check(`${label} ${tour.id}: all ${tour.steps} steps shown, in view, 44 px buttons`, seen.length === tour.steps && !/no bubble|OFF SCREEN|small buttons/.test(all) && seen.every((s, i) => s.includes(`${i + 1} of ${tour.steps}`)), all);
  await clickMain(page); // Done
  await sleep(400);
  const after = await page.evaluate((id) => ({
    bubble: Boolean(document.querySelector('[data-tour-bubble]')),
    done: JSON.parse(localStorage.getItem('netz.tours') || '{}')[id] === true,
    legacy: localStorage.getItem('gaussSeidelTourCompleted'),
  }), tour.id);
  check(`${label} ${tour.id}: Done closes it and records it`, !after.bubble && after.done && (tour.id !== 'gauss-seidel' || after.legacy === 'true'), JSON.stringify(after));
  return all;
}

const { browser, page, errors } = await launch(LAPTOP);
const centred = {};
try {
  await page.evaluateOnNewDocument(() => {
    if (!sessionStorage.getItem('__toursCleared')) {
      localStorage.removeItem('netz.tours');
      localStorage.removeItem('gaussSeidelTourCompleted');
      sessionStorage.setItem('__toursCleared', '1');
    }
  });

  // ---------- Laptop: every tour, light ----------
  for (const tour of TOURS) centred[`laptop ${tour.id}`] = await runTour(page, tour, 'laptop');

  // Laptop: first bubble is next to its control, with focus on Next
  await page.goto(BASE + '/Algorithems?tour=hub', { waitUntil: 'domcontentloaded' });
  await waitForBubble(page);
  const first = await bubbleInfo(page);
  check('laptop: the first hub step points at the search box (not centred) and Next has focus', !first.centred && first.focus === 'Next', JSON.stringify(first));

  // Escape ends a tour without a tick
  await page.evaluate(() => localStorage.removeItem('netz.tours'));
  await page.keyboard.press('Escape');
  await sleep(500);
  const esc = await page.evaluate(() => ({ bubble: Boolean(document.querySelector('[data-tour-bubble]')), done: JSON.parse(localStorage.getItem('netz.tours') || '{}').hub === true }));
  check('Escape ends the tour without marking it done', !esc.bubble && !esc.done, JSON.stringify(esc));

  // The cross ends it too
  await page.goto(BASE + '/Setting?tour=settings', { waitUntil: 'domcontentloaded' });
  await waitForBubble(page);
  await page.evaluate(() => document.querySelector('[data-tour-bubble] .nz-tour-x').click());
  await sleep(500);
  check('the cross ends the tour', !(await page.$('[data-tour-bubble]')), '');

  // A refresh does not start the tour again
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(1500);
  check('a refresh after starting does not restart the tour', !(await page.$('[data-tour-bubble]')), '');

  // No ?tour= means no tour
  await page.goto(BASE + '/Notes', { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  check('pages without ?tour= show no tour', !(await page.$('[data-tour-bubble]')), '');

  // Dark mode bubble
  await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'dark'));
  await page.goto(BASE + '/Setting?tour=settings', { waitUntil: 'domcontentloaded' });
  await waitForBubble(page);
  const dark = await bubbleInfo(page);
  check('dark mode: the bubble uses the dark surface', dark.bg === 'rgb(30, 30, 32)', dark.bg);
  await page.screenshot({ path: path.join(SHOTS, 'tour-laptop-settings-dark.png') });
  await page.keyboard.press('Escape');

  // Landing page shows the ticks
  await page.evaluate(() => localStorage.setItem('netz.tours', JSON.stringify({ playground: true, insert: true, notes: true, blocks: true, hub: true, 'gauss-seidel': true, settings: true })));
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(800);
  const count = await page.$eval('.ld-count', (e) => e.textContent.trim());
  check('landing page counts finished tours', count === '7 of 7 tours done', count);

  // ---------- Phone: every tour ----------
  await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'light'));
  await page.setViewport(PHONE);
  await page.setUserAgent(ANDROID_UA);
  await page.evaluate(() => localStorage.removeItem('netz.tours'));
  for (const tour of TOURS) centred[`phone ${tour.id}`] = await runTour(page, tour, 'phone');
  await page.goto(BASE + '/Algorithems?tour=hub', { waitUntil: 'domcontentloaded' });
  await waitForBubble(page);
  const sheet = await bubbleInfo(page);
  check('phone: the bubble is a bottom sheet', sheet.sheet && sheet.position === 'fixed' && sheet.bottom === 0, JSON.stringify(sheet));

  check('no page errors', errors.length === 0, errors.join(' | '));
} catch (e) {
  check('script ran to the end', false, e.stack);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && (!r.ok || process.env.VERBOSE) ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
