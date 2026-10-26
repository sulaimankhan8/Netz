import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// Phone audit: every page at phone size, solver pages solved with their default inputs.
// Reports sideways spill, clipped controls, things behind the bottom buttons, and screenshots each page.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 360), H = Number(process.env.H || 740);
const OUT = path.resolve('shots/mobile-audit');
fs.mkdirSync(OUT, { recursive: true });

// All routes under src/app (route groups and dynamic routes skipped)
function routes() {
  const root = path.resolve('../../src/app');
  const out = [];
  const walk = (dir, url) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('[') || e.name === 'components' || e.name === 'api' || e.name === 'utils') continue;
      const group = e.name.startsWith('(');
      const next = group ? url : `${url}/${e.name}`;
      const full = path.join(dir, e.name);
      if (fs.existsSync(path.join(full, 'page.js'))) out.push(next || '/');
      walk(full, next);
    }
  };
  if (fs.existsSync(path.join(root, 'page.js'))) out.push('/');
  walk(root, '');
  return [...new Set(out)].filter((r) => !/example|\/algorithm\b|collect|offline/.test(r)).sort();
}

const only = process.env.ROUTES ? process.env.ROUTES.split(',') : null;
const list = only || routes();
const { browser, page, errors } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
// Hide Next's dev badge: it does not exist on the real site
await page.evaluateOnNewDocument(() => {
  const s = document.createElement('style');
  s.textContent = 'nextjs-portal{display:none!important}';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));
});

const report = [];
for (const route of list) {
  const errStart = errors.length;
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 });
  } catch (e) { console.log(`ERR  ${route} ${e.message.slice(0, 80)}`); continue; }
  await sleep(1500);
  // Press the page's main solve button, if it has one
  const solved = await page.evaluate(async () => {
    const shown = [...document.querySelectorAll('button')].filter((b) => b.offsetParent);
    const btn = shown.find((b) => /^(calculate|solve|compute|run|find root|evaluate|integrate|fit|interpolate|differentiate|test)/i.test(b.innerText.trim()))
      || shown.find((b) => b.type === 'submit' && b.closest('form') && !b.closest('nav, header'));
    if (!btn) return false;
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    await new Promise((r) => setTimeout(r, 2500));
    window.scrollTo(0, 0);
    return btn.innerText.trim().slice(0, 20);
  });
  await sleep(500);
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const sel = (el) => {
      let s = el.tagName.toLowerCase();
      const c = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 5).join('.');
      if (c) s += '.' + c;
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30);
      return `${s.slice(0, 110)}${t ? ` "${t}"` : ''}`;
    };
    const visible = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length; };
    const scroller = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return p;
      }
      return null;
    };
    const spill = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (!visible(el)) continue;
      const st = getComputedStyle(el);
      if (st.position === 'fixed') continue;
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      if (b.right > vw + 1 || b.left < -1) {
        const sc = scroller(el);
        // Inside a box that scrolls sideways on purpose: fine. Inside one that hides the overflow: clipped.
        if (sc && /(auto|scroll)/.test(getComputedStyle(sc).overflowX)) continue;
        if (!spill.some((s) => s.el.contains(el))) spill.push({ el, b, clipped: !!sc });
      }
    }
    // Rows of controls that are cut off by their own box
    const cut = [];
    for (const el of document.body.querySelectorAll('button, a, [role="tab"], h1, h2, h3, label')) {
      if (!visible(el)) continue;
      const st = getComputedStyle(el);
      if (el.closest('.sr-only, .katex-mathml')) continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && /hidden|clip/.test(st.overflowX) && st.textOverflow !== 'ellipsis') cut.push(sel(el));
    }
    // Content that scrolls sideways inside its own box (tables etc.): listed to review
    const hscroll = [];
    for (const el of document.body.querySelectorAll('*')) {
      const st = getComputedStyle(el);
      if (!/(auto|scroll)/.test(st.overflowX) || el.scrollWidth <= el.clientWidth + 4 || !visible(el)) continue;
      if (el === document.documentElement || el === document.body) continue;
      if (!hscroll.some((h) => h.contains(el))) hscroll.push(el);
    }
    const tabs = document.querySelector('nav[data-app-tabs]')?.getBoundingClientRect();
    return {
      vw, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, vh,
      spill: spill.slice(0, 10).map((s) => `${s.clipped ? '[cut] ' : ''}${sel(s.el)} [${Math.round(s.b.left)}..${Math.round(s.b.right)}]`),
      cut: cut.slice(0, 8),
      hscroll: hscroll.slice(0, 6).map((e) => `${sel(e)} ${e.scrollWidth}/${e.clientWidth}`),
      tabsTop: tabs ? Math.round(tabs.top) : null,
    };
  });
  const name = route.replace(/\W+/g, '_') || 'root';
  // Full-page picture (long pages are cut at 7000 px)
  const fullH = Math.min(r.docH, 7000);
  await page.setViewport({ width: W, height: fullH, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const errs = errors.slice(errStart).filter((e) => !/hydrat/i.test(e));
  const bad = r.docW > r.vw + 1 || r.spill.length || r.cut.length || errs.length;
  console.log(`${bad ? 'BAD ' : 'ok  '} ${route.padEnd(36)} doc ${r.docW}/${r.vw} h${r.docH}${solved ? ` solved:${solved}` : ''}`);
  for (const s of r.spill) console.log('       spill  ' + s);
  for (const c of r.cut) console.log('       cut    ' + c);
  for (const h of r.hscroll) console.log('       scrolls ' + h);
  for (const e of errs.slice(0, 3)) console.log('       error  ' + e.slice(0, 160));
  report.push({ route, solved, ...r, errs });
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
