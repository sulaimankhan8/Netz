import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// Break-ui check for the method calculators: each page gets Demo / Worst case / Empty / One / Huge inputs
// (src/app/utils/dev/worstCaseInputs.js, typed into the real form by the dev-only ?data= switch),
// then is measured and screenshotted. Worst case is also checked at 320px, at 200% zoom
// (a 640px-wide layout on a 1280px screen) and on a laptop, and in light mode.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const OUT = path.resolve('shots/alg-break');
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = process.env.ONLY ? process.env.ONLY.split(',') : [
  'newton-raphson-method', 'newton-forward', 'simpson-1-3-Rule', 'gauss-elimination', 'runge-kutta-method', 'chi-square', 'fitting-straight-lines',
];
const RUNS_ALL = [
  ...['demo', 'worst', 'empty', 'one', 'huge'].map((state) => ({ state, w: 375, h: 812, mobile: true, theme: 'dark' })),
  { state: 'worst', w: 320, h: 640, mobile: true, theme: 'dark' },
  { state: 'worst', w: 640, h: 450, mobile: false, theme: 'dark', label: 'zoom200' },
  { state: 'worst', w: 1280, h: 800, mobile: false, theme: 'dark' },
  { state: 'worst', w: 375, h: 812, mobile: true, theme: 'light' },
];
const RUNS = process.env.STATES ? RUNS_ALL.filter((x) => process.env.STATES.split(',').includes(x.state)) : RUNS_ALL;

const { browser, page, errors } = await launch({ width: 375, height: 812 });
page.setDefaultTimeout(90000);
const report = [];

for (const r of ROUTES) {
  for (const run of RUNS) {
   try {
    const tag = `${r}__${run.state}__${run.label || run.w}${run.theme === 'light' ? '__light' : ''}`;
    await page.emulate({
      viewport: { width: run.w, height: run.h, deviceScaleFactor: 1, isMobile: run.mobile, hasTouch: run.mobile },
      userAgent: run.mobile ? 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
    });
    await page.evaluateOnNewDocument((theme) => { try { localStorage.setItem('theme', theme); } catch (e) {} }, run.theme);
    const before = errors.length;
    await page.goto(`${BASE}/${r}?data=demo`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => window.__netzWorstCase, { timeout: 60000 }).catch(() => {});
    await sleep(800);

    // Long tasks while solving = the page freezing
    await page.evaluate(() => {
      window.__longTasks = 0;
      try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__longTasks += e.duration; })).observe({ type: 'longtask', buffered: false }); } catch (e) {}
    });
    const t0 = Date.now();
    const solveMs = await Promise.race([new Promise((res) => setTimeout(() => res('TIMEOUT>60s'), 60000)), page.evaluate(async (state) => {
      if (state === 'demo') {
        const b = [...document.querySelectorAll('button')].find((x) => /calculate|solve|compute|run|find root|evaluate|fit|expand|decompose|interpolate|integrate|iterate/i.test(x.textContent) && !/demo|reset|export|random/i.test(x.textContent));
        const t = performance.now(); b?.click();
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        return Math.round(performance.now() - t);
      }
      return window.__netzWorstCase ? window.__netzWorstCase.apply(state) : -1;
    }, run.state).catch((e) => 'ERR ' + e.message.slice(0, 60))]);
    const wall = Date.now() - t0;
    await sleep(2500);

    const m = await page.evaluate(() => {
      // (measured after the solve)
      const W = document.documentElement.clientWidth;
      const shell = document.querySelector('[data-rail]');
      const clipped = (e) => {
        for (let p = e.parentElement; p && p !== shell; p = p.parentElement) if (/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX)) return true;
        return false;
      };
      const spill = [...document.querySelectorAll('body *')].filter((e) => {
        if (e.closest('.katex-mathml') || e.closest('[role=radiogroup]')) return false;
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.right > W + 1 && !clipped(e);
      }).slice(0, 3).map((e) => `${e.tagName}.${String(e.className).slice(0, 50)} "${e.textContent.trim().slice(0, 30)}"`);
      // Only the calculator (after the LABORATORY heading)
      const lab = [...document.querySelectorAll('h2')].find((h) => /interactive|calculator/i.test(h.textContent));
      const area = lab?.parentElement || document.body;
      const text = area.innerText;
      const find = (re) => (text.match(re) || []).length;
      const errorsShown = [...area.querySelectorAll('[class*="text-red"], [class*="bg-red"], [role=alert]')]
        .map((e) => e.innerText.trim()).filter(Boolean).filter((t, i, a) => a.indexOf(t) === i).slice(0, 3).map((t) => t.slice(0, 160));
      const ks = [...area.querySelectorAll('.katex-display > .katex')];
      const tableRows = [...area.querySelectorAll('table')].map((t) => t.rows.length);
      return {
        spill,
        height: document.documentElement.scrollHeight,
        nodes: document.getElementsByTagName('*').length,
        nan: find(/\bNaN\b/g), inf: find(/-?Infinity/g), undef: find(/\bundefined\b|\bnull\b|\[object/g),
        sci: find(/\d\.?\d*e[+-]\d+/gi),
        undefCtx: (text.match(/.{0,40}(\bundefined\b|\bnull\b|\[object).{0,20}/) || [''])[0].replace(/\s+/g, ' '),
        plural1: (text.match(/\b1 (iterations|steps|subintervals|categories|points|rows|equations|terms)\b/gi) || []).slice(0, 3),
        result: (area.querySelector('[class*="emerald"]')?.innerText || '').trim().slice(0, 120),
        errorsShown,
        wideMath: ks.filter((k) => k.scrollWidth > k.clientWidth + 1).length,
        mathCount: ks.length,
        tableRows,
        labTop: lab ? Math.round(lab.getBoundingClientRect().top + window.scrollY) : 0,
        longTasks: Math.round(window.__longTasks || 0),
      };
    });

    // Picture: the calculator from its heading down, up to 2600px
    const top = Math.max(0, m.labTop - 10);
    const clipH = Math.max(200, Math.min(2600, m.height - top));
    await page.screenshot({ path: path.join(OUT, `${tag}.png`), clip: { x: 0, y: top, width: run.w, height: clipH }, captureBeyondViewport: true }).catch(() => {});

    const errs = errors.slice(before);
    const row = { tag, route: r, ...run, solveMs, wall, ...m, consoleErrors: errs.map((e) => e.slice(0, 200)) };
    delete row.labTop;
    report.push(row);
   console.log(`${tag.padEnd(48)} solve=${solveMs}ms long=${m.longTasks}ms h=${m.height} nodes=${m.nodes} spill=${m.spill.length} wideMath=${m.wideMath}/${m.mathCount} NaN=${m.nan} Inf=${m.inf} undef=${m.undef} sci=${m.sci} rows=[${m.tableRows.join(',')}] err=${JSON.stringify(m.errorsShown).slice(0, 140)} plural=${m.plural1.join('|')} undefCtx="${m.undefCtx}" result="${m.result.replace(/\s+/g, ' ').slice(0, 90)}" console=${errs.length}`);
   } catch (e) {
      console.log(`${r}__${run.state}__${run.label || run.w} CRASHED (page froze or timed out) ${e.message.slice(0, 80)}`);
      report.push({ tag: `${r}__${run.state}__${run.label || run.w}`, route: r, ...run, crashed: e.message.slice(0, 200) });
      // A frozen tab cannot be used again: stop here (run each page family as its own process)
      fs.writeFileSync(path.join(OUT, `report-${r}.json`), JSON.stringify(report, null, 2));
      await browser.close().catch(() => {});
      process.exit(2);
    }
  }
}
fs.writeFileSync(path.join(OUT, `report-${ROUTES.length === 1 ? ROUTES[0] : 'all'}${process.env.STATES ? '-' + process.env.STATES.replace(/,/g, '+') : ''}.json`), JSON.stringify(report, null, 2));
await browser.close();
