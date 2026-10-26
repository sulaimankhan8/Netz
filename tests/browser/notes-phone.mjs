import { launch, sleep } from './lib.mjs';
import path from 'path';

// Notes on a phone: the list scrolls as one column, an open note fills the space above the bottom
// buttons, the page itself never scrolls, and "Add block" sits above the bottom buttons.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 360), H = Number(process.env.H || 740);
const { browser, page, errors } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
let pass = 0, fail = 0;
const check = (name, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? '  ' + info : ''}`); };

await page.goto(BASE + '/Notes', { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(1800);
let m = await page.evaluate(() => {
  const aside = document.querySelector('aside[aria-label="Notes"]');
  const tabs = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  return {
    topBar: !!document.querySelector('header[data-app-nav]'),
    asideScrolls: aside && getComputedStyle(aside).overflowY,
    asideBottom: aside?.getBoundingClientRect().bottom, tabsTop: tabs.top,
    docH: document.documentElement.scrollHeight, vh: innerHeight,
  };
});
check('Notes: no extra app top bar', !m.topBar);
check('Notes list scrolls as one column', m.asideScrolls === 'auto', m.asideScrolls);
check('Notes page itself does not scroll', m.docH <= m.vh + 1, `${m.docH}/${m.vh}`);
await page.screenshot({ path: path.resolve('shots/nav-phone', `notes-list-${W}.png`) });

// Open the first note
const opened = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('aside[aria-label="Notes"] button')].find((b) => b.querySelector('.line-clamp-2'));
  if (!btn) return false;
  btn.click();
  return true;
});
await sleep(1500);
m = await page.evaluate(() => {
  const tabs = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  const add = [...document.querySelectorAll('button')].find((b) => /Add block/.test(b.innerText));
  const r = add?.getBoundingClientRect();
  return { addBottom: r?.bottom, tabsTop: tabs.top, docH: document.documentElement.scrollHeight, vh: innerHeight };
});
check('a note opened', opened);
check('Add block sits above the bottom buttons', m.addBottom && m.addBottom <= m.tabsTop - 8, `button ${Math.round(m.addBottom)} row ${Math.round(m.tabsTop)}`);
check('note view does not scroll the page', m.docH <= m.vh + 1, `${m.docH}/${m.vh}`);
await page.screenshot({ path: path.resolve('shots/nav-phone', `notes-editor-${W}.png`) });

check('no page errors', errors.filter((e) => !/hydrat/i.test(e)).length === 0, errors.slice(0, 2).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
