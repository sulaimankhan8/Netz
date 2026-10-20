import path from 'node:path';
import fs from 'node:fs';
import { launch, sleep, BASE, SHOTS } from './lib.mjs';
import { METHODS, UNITS } from '../../src/app/components/algorithms/catalog.js';

// Algorithm hub + method page checks (ALGORITHM_HUB_REDESIGN_PLAN.md, "Checks").
//   NETZ_URL=http://localhost:3213 node algorithms.mjs        (production build)
//   QUICK=1 …                                                  (5 method pages instead of 34)
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
fs.mkdirSync(SHOTS, { recursive: true });

const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1280, height: 800 };
const realErrors = (list) => list.filter((e) => !/WebSocket|_next\/hmr|webpack-hmr/i.test(e));

const { browser, page, errors } = await launch(LAPTOP);

async function fresh(theme = 'light', progress = null) {
  await page.evaluateOnNewDocument((t, p) => {
    if (sessionStorage.getItem('am-test-init')) return;
    sessionStorage.setItem('am-test-init', '1');
    localStorage.setItem('theme', t);
    localStorage.setItem('netz.tours', JSON.stringify({ playground: true, insert: true, notes: true, blocks: true, hub: true, 'gauss-seidel': true, settings: true }));
    if (p) localStorage.setItem('netz.methods', JSON.stringify(p));
    else localStorage.removeItem('netz.methods');
  }, theme, progress);
}

async function go(url) {
  await page.goto(BASE + url, { waitUntil: 'load', timeout: 180000 });
  await page.waitForSelector('.am-root h1', { timeout: 120000 });
  await sleep(500);
}

const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

try {
  await fresh('light');

  // ---------- Hub, laptop ----------
  await go('/Algorithems');
  const hub = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent,
    cards: document.querySelectorAll('.am-card').length,
    sections: [...document.querySelectorAll('.am-unit h2')].map((h) => h.textContent),
    links: [...document.querySelectorAll('.am-card-link')].map((a) => a.getAttribute('href')),
    solve: [...document.querySelectorAll('.am-card-solve')].map((a) => a.getAttribute('href')),
    font: getComputedStyle(document.querySelector('h1')).fontFamily,
    oldSolver: !!document.querySelector('[class*="lg:col-span-6"]'),
    continueCard: !!document.querySelector('.am-continue'),
  }));
  check('hub: title', hub.h1 === '34 methods. Every step shown.', hub.h1);
  check('hub: 34 cards in 5 unit sections', hub.cards === 34 && hub.sections.length === 5, `${hub.cards} cards, ${hub.sections.join(', ')}`);
  check('hub: unit sections in catalog order', hub.sections.join('|') === UNITS.map((u) => u.name).join('|'), hub.sections.join('|'));
  check('hub: every card links to its method page', hub.links.join('|') === UNITS.flatMap((u) => METHODS.filter((m) => m.unit === u.id)).map((m) => m.route).join('|'));
  check('hub: every "Solve" opens the Solve tab', hub.solve.length === 34 && hub.solve.every((h) => h.endsWith('?mode=solve')));
  check('hub: DM Sans', /DM Sans/.test(hub.font), hub.font);
  check('hub: old quick-solver drawer gone', !hub.oldSolver);
  check('hub: no "Continue" on a first visit', !hub.continueCard);
  check('hub: no horizontal scroll (laptop)', (await overflow()) <= 0);
  await page.screenshot({ path: path.join(SHOTS, 'algorithms-hub-light.png') });

  await page.type('.am-search input', 'simpson');
  await sleep(300);
  const simpson = await page.evaluate(() => [...document.querySelectorAll('.am-card-name')].map((n) => n.textContent));
  check('hub: search "simpson" finds the two Simpson rules', simpson.length === 2 && simpson.every((n) => /Simpson/.test(n)), simpson.join(', '));
  await page.click('.am-search-clear');
  await page.type('.am-search input', 'zzzz');
  await sleep(300);
  check('hub: search with no match shows the empty message', await page.$eval('.am-empty', (e) => e.textContent.includes('No method matches')));
  await page.click('.am-search-clear');
  await sleep(200);
  await page.evaluate(() => [...document.querySelectorAll('.am-chip')].find((c) => c.textContent.startsWith('Roots')).click());
  await sleep(300);
  const roots = await page.evaluate(() => ({ sections: document.querySelectorAll('.am-unit').length, cards: document.querySelectorAll('.am-card').length }));
  check('hub: Roots chip shows only Unit 1 (5 methods)', roots.sections === 1 && roots.cards === 5, JSON.stringify(roots));
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('/');
  check('hub: "/" focuses the search', await page.evaluate(() => document.activeElement?.matches('.am-search input')));

  // ---------- Every method page ----------
  const list = process.env.QUICK ? METHODS.filter((_, i) => i % 7 === 0) : METHODS;
  let bad = [];
  for (const m of list) {
    const before = realErrors(errors).length;
    await go(m.route);
    await page.waitForFunction((name) => document.title.startsWith(name), { timeout: 8000 }, m.name).catch(() => {});
    const info = await page.evaluate(() => ({
      h1: document.querySelector('.am-head h1')?.textContent,
      title: document.title,
      steps: document.querySelectorAll('.am-step').length,
      open: document.querySelectorAll('.am-step.is-open').length,
      learnText: document.getElementById('am-learn')?.innerText.length || 0,
      oldHeader: !!document.querySelector('.am-skin h1'),
      oldNav: !!document.querySelector('.am-skin [class*="md:ml-[80px]"]'),
      yellow: [...document.querySelectorAll('.am-skin *')].some((e) => getComputedStyle(e).backgroundColor === 'rgb(255, 230, 0)'),
      offset: [...document.querySelectorAll('.am-skin *')].some((e) => /\d+px \d+px 0px 0px/.test(getComputedStyle(e).boxShadow)),
    }));
    const ow = await overflow();
    await page.click('[data-tour="am-solve-tab"]');
    await sleep(1500);
    const solve = await page.evaluate(() => {
      const s = document.getElementById('am-solve');
      return { visible: !s.hidden, controls: s.querySelectorAll('input, textarea, button, select').length, url: location.search };
    });
    const pageErrors = realErrors(errors).slice(before);
    const problems = [];
    if (info.h1 !== m.name) problems.push(`h1 "${info.h1}"`);
    if (!info.title.startsWith(m.name)) problems.push(`title "${info.title}"`);
    if (info.steps && info.open < 1) problems.push('no step open');
    if (info.learnText < 200) problems.push('learn content missing');
    if (info.oldHeader || info.oldNav) problems.push('old header/nav left');
    if (info.yellow) problems.push('yellow badge left');
    if (info.offset) problems.push('offset shadow left');
    if (ow > 0) problems.push(`horizontal scroll ${ow}px`);
    if (!solve.visible || solve.controls < 2) problems.push(`solve tab empty (${solve.controls} controls)`);
    if (solve.url !== '?mode=solve') problems.push('address did not get ?mode=solve');
    if (pageErrors.length) problems.push('errors: ' + pageErrors.join(' | ').slice(0, 300));
    if (problems.length) bad.push(`${m.route}: ${problems.join('; ')}`);
  }
  check(`method pages: ${list.length} open with their name, steps, a working Solve tab, no old look, no errors`, bad.length === 0, bad.join('\n   '));

  // ---------- Step flow, Learn/Solve memory, progress ----------
  await go('/bisection-method');
  const s0 = await page.evaluate(() => ({ total: document.querySelectorAll('.am-step').length, open: document.querySelectorAll('.am-step.is-open').length, done: !!document.getElementById('am-done') }));
  check('bisection: opens on step 1 of 6, answer hidden', s0.total === 6 && s0.open === 1 && !s0.done, JSON.stringify(s0));
  await page.evaluate(() => [...document.querySelectorAll('.am-stepbar button')].find((b) => b.textContent.startsWith('Show step')).click());
  await sleep(500);
  check('bisection: "Show step 2" opens step 2', await page.evaluate(() => document.querySelectorAll('.am-step.is-open').length === 2 && document.querySelector('.am-step.is-current')?.id === 'am-step-2'));
  await page.screenshot({ path: path.join(SHOTS, 'algorithms-method-light.png') });

  await page.goto(BASE + '/Algorithems', { waitUntil: 'load' });
  await page.waitForSelector('.am-continue', { timeout: 30000 }).catch(() => {});
  const cont = await page.evaluate(() => document.querySelector('.am-continue')?.innerText.replace(/\s+/g, ' '));
  check('hub: "Continue" offers Bisection at step 2 of 6', /Bisection method · step 2 of 6/.test(cont || ''), cont);
  await page.click('.am-continue');
  await page.waitForSelector('.am-step', { timeout: 60000 });
  await sleep(600);
  check('continue: reopens at step 2', await page.evaluate(() => document.querySelectorAll('.am-step.is-open').length === 2));

  await page.evaluate(() => [...document.querySelectorAll('.am-stepbar button')].find((b) => b.textContent === 'Show all').click());
  await sleep(500);
  const all = await page.evaluate(() => ({ open: document.querySelectorAll('.am-step.is-open').length, done: document.getElementById('am-done')?.innerText.includes('2.7'), tick: !!document.querySelector('.am-rail [aria-current="page"] .am-tick') }));
  check('bisection: "Show all" opens 6 steps and the answer, and ticks it', all.open === 6 && all.done && all.tick, JSON.stringify(all));

  await page.click('[data-tour="am-solve-tab"]');
  await page.waitForSelector('#am-solve input', { timeout: 30000 });
  await page.evaluate(() => {
    const input = document.querySelector('#am-solve input');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(input, 'x*x - 2');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.click('[data-tour="am-learn-tab"]');
  await sleep(300);
  await page.click('[data-tour="am-solve-tab"]');
  await sleep(300);
  check('Solve keeps what you typed after visiting Learn', await page.$eval('#am-solve input', (i) => i.value === 'x*x - 2'));
  check('Learn ⇄ Solve updates the address', await page.evaluate(() => location.search === '?mode=solve'));

  await page.goto(BASE + '/Algorithems', { waitUntil: 'load' });
  await sleep(1200);
  check('hub: Bisection shows a tick', await page.evaluate(() => {
    const card = [...document.querySelectorAll('.am-card')].find((c) => c.querySelector('.am-card-name')?.textContent === 'Bisection method');
    return !!card?.querySelector('.am-done');
  }));

  // ---------- Prev / next ----------
  await go('/secant-method');
  const nav = await page.evaluate(() => ({
    prev: document.querySelector('.am-bar a[aria-label^="Previous"]')?.getAttribute('href'),
    next: document.querySelector('.am-next-link')?.getAttribute('href'),
    unitLinks: [...document.querySelectorAll('.am-rail nav[aria-label^="In unit"] a')].length,
  }));
  check('secant: previous = false position, next = Newton–Raphson, 5 unit links', nav.prev === '/false-position-method' && nav.next === '/newton-raphson-method' && nav.unitLinks === 5, JSON.stringify(nav));
  await page.click('.am-next-link');
  await page.waitForFunction(() => location.pathname === '/newton-raphson-method', { timeout: 60000 });
  check('next link opens the next method', true);

  // ---------- Dark ----------
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await sleep(300);
  const dark = await page.evaluate(() => ({ bg: getComputedStyle(document.querySelector('.am-root')).backgroundColor, ink: getComputedStyle(document.querySelector('.am-head h1')).color }));
  check('dark: paper and ink swap', dark.bg === 'rgb(20, 20, 21)' && dark.ink === 'rgb(244, 244, 242)', JSON.stringify(dark));
  await page.screenshot({ path: path.join(SHOTS, 'algorithms-method-dark.png') });

  // ---------- Phone ----------
  await page.setViewport(PHONE);
  await go('/Algorithems');
  const phoneHub = await page.evaluate(() => {
    const card = document.querySelector('.am-card').getBoundingClientRect();
    return { cardH: Math.round(card.height), foot: getComputedStyle(document.querySelector('.am-card-foot')).display };
  });
  check('phone hub: no horizontal scroll', (await overflow()) <= 0);
  check('phone hub: methods are compact rows', phoneHub.cardH <= 80 && phoneHub.foot === 'none', JSON.stringify(phoneHub));
  await page.screenshot({ path: path.join(SHOTS, 'algorithms-hub-phone.png') });
  await go('/newton-forward');
  // The bar belongs to the worked example: it sticks to the screen's bottom once you are there
  await page.evaluate(() => document.getElementById('am-step-1').scrollIntoView({ block: 'start' }));
  await sleep(400);
  const phoneMethod = await page.evaluate(() => {
    const bar = document.querySelector('.am-stepbar')?.getBoundingClientRect();
    const small = [...document.querySelectorAll('.am-bar a, .am-bar button, .am-stepbar button')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height < 36;
    }).length;
    return { rail: getComputedStyle(document.querySelector('.am-rail')).display, title: getComputedStyle(document.querySelector('.am-bar-title')).display, barBottom: bar ? Math.round(bar.bottom) : null, small };
  });
  check('phone method: no horizontal scroll', (await overflow()) <= 0);
  check('phone method: rail hidden, name in the top bar', phoneMethod.rail === 'none' && phoneMethod.title === 'block', JSON.stringify(phoneMethod));
  check('phone method: step bar on screen at the worked example', phoneMethod.barBottom !== null && phoneMethod.barBottom <= 844 && phoneMethod.barBottom > 100, phoneMethod.barBottom);
  check('phone method: bar buttons are big enough to tap', phoneMethod.small === 0, phoneMethod.small);
  await page.screenshot({ path: path.join(SHOTS, 'algorithms-method-phone.png') });

  // ---------- ?mode=solve and the Gauss–Seidel tour ----------
  await page.setViewport(LAPTOP);
  await go('/euler-s-method?mode=solve');
  check('?mode=solve opens on Solve', await page.evaluate(() => !document.getElementById('am-solve').hidden && document.getElementById('am-learn').hidden));

  check('no page errors', realErrors(errors).length === 0, realErrors(errors).join(' | '));
} catch (e) {
  check('script ran to the end', false, e.stack);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && (!r.ok || process.env.VERBOSE) ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
