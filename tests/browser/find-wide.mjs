import { launch, sleep } from './lib.mjs';

// Lists what makes a page wider than a phone screen (after solving), outermost first.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 360), H = Number(process.env.H || 740);
const route = process.argv[2] || '/false-position-method';
const { browser, page } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(1500);
await page.evaluate(async () => {
  const btn = [...document.querySelectorAll('button')].find((b) => /^(calculate|solve|compute|run|find root|evaluate)/i.test(b.innerText.trim()) && b.offsetParent);
  if (btn) { btn.click(); await new Promise((r) => setTimeout(r, 2500)); }
});
const out = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const res = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('.katex-mathml')) continue;
    const b = el.getBoundingClientRect();
    if (b.right <= vw + 1 || !b.width) continue;
    // Would this element widen the page? Only if no ancestor clips or scrolls it
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) { clipped = true; break; }
    }
    if (clipped) continue;
    if (res.some((r) => r.el.contains(el))) continue;
    res.push({ el, b });
  }
  return { docW: document.documentElement.scrollWidth, list: res.slice(0, 15).map(({ el, b }) => {
    const chain = [];
    for (let p = el; p && p !== document.body && chain.length < 4; p = p.parentElement) chain.push(`${p.tagName.toLowerCase()}.${(p.getAttribute('class') || '').split(/\s+/).slice(0, 6).join('.')}`);
    return `[${Math.round(b.left)}..${Math.round(b.right)}] w${Math.round(b.width)} ${getComputedStyle(el).position} "${(el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40)}"\n      ${chain.join('\n      < ')}`;
  }) };
});
console.log(`doc ${out.docW}/${W}`);
console.log(out.list.join('\n'));
await browser.close();
