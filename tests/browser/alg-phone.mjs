import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// The 34 method pages at phone size: each is solved with its default inputs, then measured and screenshotted.
// Reports content that spills past the screen, equations still wider than their box,
// inputs under 16px (iPhones zoom in on those) and console errors.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 375), H = Number(process.env.H || 812);
const OUT = path.resolve('shots/alg-phone');
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = (process.env.ONLY ? process.env.ONLY.split(',') : [
  'bisection-method', 'false-position-method', 'Gauss-seidal', 'iteration-method', 'newton-raphson-method', 'secant-method',
  'gauss-backward', 'gauss-forward', 'newton-backward', 'newton-forward', 'lagrange-interpolation', 'newton-divided',
  'boole-Rule', 'simpson-1-3-Rule', 'simpson-3-8-Rule', 'trapezoidal-Rule', 'weddle-Rule', 'gauss-quadrature', 'numerical-differentiation',
  'euler-s-method', 'gauss-elimination', 'gauss-jordan', 'jacobi-method', 'lu-decomposition', 'modified-euler-s-method', 'runge-kutta-method', 'taylor-s-series-method',
  'chi-square', 'f-test', 't-test', 'test-significance', 'fitting-parabola', 'fitting-straight-lines', 'least-squares',
]);

const { browser, page, errors } = await launch({ width: W, height: H, deviceScaleFactor: 1 });
await page.emulate({ viewport: { width: W, height: H, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36' });

const report = [];
for (const r of ROUTES) {
  const before = errors.length;
  await page.goto(`${BASE}/${r}`, { waitUntil: 'load', timeout: 180000 });
  await sleep(2500);
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /calculate|solve|compute|run|find|evaluate|fit|expand|decompose|interpolat|integrat|iterate/i.test(x.textContent) && !/demo|reset|export|random/i.test(x.textContent));
    if (!b) return null;
    b.click();
    return b.textContent.trim().slice(0, 40);
  });
  await sleep(2000);
  const m = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const shell = document.querySelector('[data-rail]');
    const clipped = (e) => {
      for (let p = e.parentElement; p && p !== shell; p = p.parentElement) {
        if (/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX)) return true;
      }
      return false;
    };
    const spill = [...document.querySelectorAll('body *')].filter((e) => {
      if (e.closest('.katex-mathml')) return false;
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.right > W + 1 && !clipped(e);
    }).slice(0, 4).map((e) => `${e.tagName}.${String(e.className).slice(0, 60)}`);
    const ks = [...document.querySelectorAll('.katex-display > .katex')];
    const wideMath = ks.filter((k) => k.scrollWidth > k.clientWidth + 1).length;
    const smallInputs = [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select')]
      .filter((i) => i.offsetParent && parseFloat(getComputedStyle(i).fontSize) < 16).length;
    return { spill, math: ks.length, wideMath, smallInputs, height: document.documentElement.scrollHeight };
  });
  await page.screenshot({ path: path.join(OUT, `${r}.png`), fullPage: true });
  const errs = errors.slice(before).filter((e) => !/hydrat/i.test(e) || true);
  report.push({ r, clicked, ...m, errors: errs.map((e) => e.slice(0, 120)) });
  console.log(`${r.padEnd(26)} solve=${clicked ? 'yes' : 'NO '} h=${m.height} spill=${m.spill.length} wideMath=${m.wideMath}/${m.math} smallInputs=${m.smallInputs} errors=${errs.length}${m.spill.length ? ' ' + m.spill.join(' | ') : ''}${errs.length ? ' ' + errs[0].slice(0, 100) : ''}`);
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
