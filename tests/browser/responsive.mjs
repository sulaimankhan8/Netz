import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// Sweeps the main pages at tablet and small-laptop sizes and reports what spills sideways or is cut off.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const OUT = path.resolve('shots/responsive');
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [
  ['phone', 390, 844, true],
  ['phone-l', 844, 390, true],
  ['tab-p', 768, 1024, true],
  ['ipad-air-p', 820, 1180, true],
  ['tab-l', 1024, 768, true],
  ['ipad-air-l', 1180, 820, true],
  ['laptop-s', 1280, 720, false],
  ['laptop-m', 1366, 768, false],
];
const ROUTES = (process.env.ROUTES || '/,/Home,/Algorithems,/Notes,/Playground,/Pricing,/Profile,/Setting,/Contact,/bisection-method,/gauss-elimination,/newton-forward,/chi-square,/runge-kutta-method').split(',');
const onlySize = process.env.SIZE;

const { browser, page } = await launch({ width: 1280, height: 800 });
const report = [];
for (const route of ROUTES) {
  for (const [name, width, height, touch] of SIZES) {
    if (onlySize && !onlySize.split(',').includes(name)) continue;
    await page.setViewport({ width, height, deviceScaleFactor: 1, hasTouch: touch, isMobile: false });
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 });
    } catch (e) { report.push({ route, name, error: e.message.slice(0, 80) }); continue; }
    await sleep(1200);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const sel = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        const c = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 6).join('.');
        if (c) s += '.' + c;
        return s.slice(0, 160);
      };
      const clippedByAncestor = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) return true;
        }
        return false;
      };
      const wide = [];
      for (const el of document.body.querySelectorAll('*')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || st.position === 'fixed') continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if ((b.right > vw + 2 || b.left < -2) && !clippedByAncestor(el)) {
          // keep only the outermost offender
          if (!wide.some((w) => w.el.contains(el))) wide.push({ el, b });
        }
      }
      // Text that overflows its own box (cut off or overlapping)
      const cut = [];
      for (const el of document.body.querySelectorAll('button, a, h1, h2, h3, p, span, label, td, th')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        if (!b.width || b.right < 0 || b.left > vw || b.top > vh * 3) continue;
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && /hidden|clip/.test(st.overflowX) && st.textOverflow !== 'ellipsis') cut.push(sel(el) + ' "' + (el.innerText || '').trim().slice(0, 30) + '"');
      }
      // Content hidden under the fixed side bar, and lopsided side gutters
      const bar = document.querySelector('aside[data-app-sidebar]');
      const barR = bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect() : null;
      const under = [];
      let minL = vw, maxR = 0;
      for (const el of document.body.querySelectorAll('h1, h2, h3, p, button, a, input, label, li')) {
        if (bar && bar.contains(el)) continue;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || st.position === 'fixed' || st.opacity === '0') continue;
        if (el.closest('[class*="sr-only"]') || el.className?.toString().includes('sr-only')) continue;
        if (el.closest('[role="dialog"], [aria-modal="true"]')) continue;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height || b.top > vh || b.bottom < 0) continue;
        if (!(el.innerText || '').trim() && el.tagName !== 'INPUT') continue;
        minL = Math.min(minL, b.left); maxR = Math.max(maxR, b.right);
        if (barR && barR.width && b.left < barR.right - 2 && b.right > barR.left) under.push(sel(el) + ' "' + (el.innerText || '').trim().slice(0, 24) + '"');
      }
      return {
        under: under.slice(0, 5),
        gutters: `${Math.round(minL - (barR ? barR.right : 0))}|${Math.round(vw - maxR)}`,
        vw,
        docW: document.documentElement.scrollWidth,
        bodyOverflowX: getComputedStyle(document.body).overflowX + '/' + getComputedStyle(document.documentElement).overflowX,
        wide: wide.slice(0, 8).map((w) => `${sel(w.el)} [${Math.round(w.b.left)}..${Math.round(w.b.right)}]`),
        cut: cut.slice(0, 6),
      };
    });
    await page.screenshot({ path: path.join(OUT, `${route.replace(/\W+/g, '_') || 'root'}-${name}.png`) });
    report.push({ route, name, ...r });
    const flag = r.docW > r.vw + 1 || r.wide.length ? 'OVERFLOW' : r.under.length ? 'UNDERBAR' : 'ok';
    console.log(`${flag.padEnd(8)} ${route.padEnd(22)} ${name.padEnd(11)} doc ${r.docW}/${r.vw} gutters ${r.gutters}`);
    for (const w of r.wide) console.log('           wide: ' + w);
    for (const u of r.under) console.log('           under: ' + u);
  }
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
