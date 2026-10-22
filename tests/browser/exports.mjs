import { launch, BASE, openPlayground, sleep, clickTitle, addEquationBlock, inkPixels, drawStroke, shot } from './lib.mjs';

// Pro exports and ink over blocks (2026-10-21): code + LaTeX export on solver pages, LaTeX in Notes and
// the Playground, the Pro lock for free accounts, and the Playground's "Draw on it" switch.
//   NETZ_URL=http://localhost:3211 node exports.mjs
const { browser, page, errors } = await launch();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail).slice(0, 400) });
const setPro = (on) => page.evaluate((v) => {
  if (v) localStorage.setItem('netz_pro_v1', JSON.stringify({ pro: true, lifetime: true, plan: 'lifetime', checkedAt: Date.now() }));
  else localStorage.removeItem('netz_pro_v1');
  window.dispatchEvent(new Event('netz:pro'));
}, on);
// Signed out, the app clears a cached Pro status when a page loads, so Pro is set after each load
const gotoPro = async (url) => {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 });
  await sleep(1200);
  await setPro(true);
  await sleep(200);
};
const dialogText = () => page.evaluate(() => document.querySelector('.xd')?.innerText || '');
const codeText = () => page.evaluate(() => document.querySelector('.xd-code')?.innerText || '');
const clickIn = (sel, text) => page.evaluate((s, t) => {
  const el = [...document.querySelectorAll(s)].find((b) => b.innerText.trim() === t || b.getAttribute('aria-label') === t);
  if (!el) return false;
  el.click();
  return true;
}, sel, text);

try {
  // In the old (editorial) pages, export is in each calculator's Export dropdown, shown once there is a result
  const solve = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('form button[type="submit"]')].find((x) => x.offsetParent !== null)
      || [...document.querySelectorAll('button')].find((x) => /^(calculate|solve|find|run|compute|interpolate|integrate|fit|test|decompose)/i.test(x.innerText.trim()) && !/demo/i.test(x.innerText));
    b?.click();
    return b?.innerText.trim() || null;
  });
  const openExport = async (item) => {
    await page.waitForSelector('button[title="Quick Export Options"]', { timeout: 20000 });
    await page.click('button[title="Quick Export Options"]');
    await sleep(200);
    const ok = await page.evaluate((t) => {
      const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes(t));
      b?.click();
      return Boolean(b);
    }, item);
    await page.waitForSelector('.xd', { timeout: 20000 });
    await sleep(500);
    return ok;
  };

  // ---------- Solver page, free account: the Pro lock ----------
  await page.goto(BASE + '/bisection-method', { waitUntil: 'networkidle2', timeout: 180000 });
  await setPro(false);
  check('the old page is back (no Learn / Solve bar)', await page.evaluate(() => !document.querySelector('.am-bar') && /Step-by-Step/i.test(document.querySelector('h1')?.innerText || '')));
  const ran = await solve();
  await sleep(1200);
  await openExport('Code (Python');
  let text = await dialogText();
  check('free: Code opens with the Pro lock', ran && /See NETZ Pro/.test(text) && !(await page.$('.xd-code')), `${ran} / ${text.slice(0, 120)}`);
  await page.keyboard.press('Escape');
  await sleep(200);

  // ---------- Solver page, Pro ----------
  await gotoPro(BASE + '/bisection-method');
  const changed = await page.evaluate(() => {
    const input = [...document.querySelectorAll('input')].find((i) => /x \* x \* x/.test(i.value));
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'x^3 - 2*x - 5');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  });
  await sleep(300);
  await solve();
  await sleep(1200);
  await openExport('Code (Python');
  await page.waitForSelector('.xd-code', { timeout: 20000 });
  let code = await codeText();
  check('Pro: Python code with the function typed on the page', changed && /def f\(x\):/.test(code) && /x \*\* 3\.?0? - 2\.?0? \* x - 5/.test(code) && /Made with NETZ/.test(code), code.slice(0, 300));
  for (const lang of ['MATLAB', 'C++', 'JavaScript', 'Rust', 'Go']) {
    await clickIn('.xd-langs button', lang);
    await sleep(150);
    code = await codeText();
    const sign = { MATLAB: /f = @\(x\)/, 'C++': /int main\(\)/, JavaScript: /function f\(x\)/, Rust: /fn main\(\)/, Go: /package main/ }[lang];
    check(`Pro: ${lang} code`, sign.test(code), code.slice(0, 200));
  }
  await clickIn('.xd-langs button', 'Python');
  const downloadLabel = await page.evaluate(() => [...document.querySelectorAll('.xd-actions button')].map((b) => b.innerText.trim()).join(' | '));
  check('download names the file type', /Download \.py/.test(downloadLabel), downloadLabel);
  await page.keyboard.press('Escape');
  await sleep(200);

  await openExport('LaTeX (.tex)');
  const tex = await codeText();
  const texParts = {
    doc: tex.includes('\\documentclass'),
    title: tex.includes('\\section*{Bisection'),
    table: tex.includes('\\begin{longtable}'),
    // The worked example's table (4 decimals) must not be in it, only the calculator's (6 decimals)
    worked: tex.includes('2.0000 & 3.0000 & 2.5000 &'),
  };
  check('LaTeX of the solve: inputs and the calculator table, not the worked example', texParts.doc && texParts.title && texParts.table && !texParts.worked, JSON.stringify(texParts));
  check('LaTeX has no raw unicode minus or HTML', !/[−<>]/.test(tex.replace(/\\[a-z]+/g, '')), '');
  await shot(page, 'exports-solver-latex');
  await page.keyboard.press('Escape');

  // Phones: the old page fits, and the dropdown is reachable
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await gotoPro(BASE + '/bisection-method');
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check('phone: no sideways scroll on the method page', scroll);
  await page.setViewport({ width: 1280, height: 800 });

  // More method pages: solve with their default inputs, then export code
  const methodRoutes = ['/false-position-method', '/Gauss-seidal', '/lagrange-interpolation', '/simpson-1-3-Rule', '/gauss-quadrature', '/numerical-differentiation', '/gauss-elimination', '/lu-decomposition', '/runge-kutta-method', '/taylor-s-series-method', '/chi-square', '/f-test', '/t-test', '/test-significance', '/fitting-parabola', '/least-squares'];
  for (const route of methodRoutes) {
    await gotoPro(BASE + route);
    const button = await solve();
    await sleep(1500);
    let out = { code: '', error: 'no Export dropdown after solving' };
    try {
      await openExport('Code (Python');
      out = await page.evaluate(() => ({ code: document.querySelector('.xd-code')?.innerText || '', error: document.querySelector('.xd-error')?.innerText || '' }));
    } catch {
      // out keeps the message above
    }
    check(`${route}: code from its inputs`, out.code.includes('Made with NETZ') && !out.error, `${button} / ${out.error || out.code.slice(0, 120)}`);
    await page.keyboard.press('Escape');
  }

  // ---------- Notes: LaTeX ----------
  await gotoPro(BASE + '/Notes');
  const opened = await page.evaluate(() => {
    const b = document.querySelector('[data-tour="notes-export"]');
    b?.click();
    return Boolean(b);
  });
  await sleep(300);
  const texItem = await clickIn('[role="menuitem"], button', 'Export LaTeX (.tex) · Pro');
  await page.waitForSelector('.xd', { timeout: 20000 }).catch(() => {});
  await sleep(400);
  const noteTex = await codeText();
  check('Notes: LaTeX export of the open note', opened && texItem && /\\documentclass/.test(noteTex) && /\\maketitle/.test(noteTex), noteTex.slice(0, 300));
  check('Notes: a solver block brings its table', !/widget/.test(noteTex) && (/longtable/.test(noteTex) || !/Solver/.test(noteTex)), '');
  await page.keyboard.press('Escape');

  // ---------- Playground: LaTeX button and Draw on it ----------
  await setPro(false);
  await openPlayground(page);
  await addEquationBlock(page);
  await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
  await page.keyboard.type('y = x^2 - 4');
  await page.keyboard.press('Enter');
  await sleep(400);
  const eq = await page.$('[data-block-id] [data-block-body]');
  const eqBox = await eq.boundingBox();
  await page.mouse.click(eqBox.x + eqBox.width / 2, eqBox.y + eqBox.height / 2);
  await sleep(300);
  const eqToggle = await page.evaluate(() => document.querySelector('[data-block-id] button[aria-label="Draw on it"]')?.getAttribute('aria-pressed'));
  check('an equation block has "Draw on it", off', eqToggle === 'false', eqToggle);
  await clickIn('[data-block-id] button', 'Plot');
  await sleep(1500);
  const graph = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('[data-block-id]')];
    const g = blocks.find((b) => b.getAttribute('data-block-id').includes('graph'));
    if (!g) return null;
    const r = g.getBoundingClientRect();
    return { id: g.getAttribute('data-block-id'), under: g.getAttribute('data-under-ink'), z: getComputedStyle(g).zIndex, x: r.x, y: r.y, w: r.width, h: r.height };
  });
  check('a new graph sits under the ink', graph && graph.under === 'true' && Number(graph.z) < 10, JSON.stringify(graph));

  // Click away so nothing is selected, then draw across the graph with the pen
  await page.mouse.click(260, 720);
  await sleep(200);
  const before = await inkPixels(page);
  if (graph) await drawStroke(page, [[graph.x + 30, graph.y + graph.h / 2], [graph.x + graph.w - 30, graph.y + graph.h / 2 + 10]]);
  await sleep(400);
  const after = await inkPixels(page);
  const stillUnder = await page.evaluate((id) => document.querySelector(`[data-block-id="${id}"]`)?.getAttribute('data-under-ink'), graph?.id);
  check('the pen writes over the graph', after > before && stillUnder === 'true', `${before} -> ${after}, under ${stillUnder}`);
  await shot(page, 'exports-ink-over-graph');

  // The Select tool picks it up above the ink
  await clickTitle(page, 'Lasso Select');
  await sleep(200);
  if (graph) await page.mouse.click(graph.x + graph.w / 2, graph.y + 20);
  await sleep(400);
  const lifted = await page.evaluate((id) => {
    const g = document.querySelector(`[data-block-id="${id}"]`);
    return { under: g?.getAttribute('data-under-ink'), selected: g?.getAttribute('data-selected'), z: g && getComputedStyle(g).zIndex };
  }, graph?.id);
  check('Select picks the graph up above the ink, selected', lifted.under !== 'true' && lifted.selected === 'true' && Number(lifted.z) >= 40, JSON.stringify(lifted));
  const graphToggle = await page.evaluate((id) => document.querySelector(`[data-block-id="${id}"] button[aria-label="Draw on it"]`)?.getAttribute('aria-pressed'), graph?.id);
  check('its switch shows on', graphToggle === 'true', graphToggle);
  await page.mouse.click(260, 720);
  await sleep(400);
  const back = await page.evaluate((id) => document.querySelector(`[data-block-id="${id}"]`)?.getAttribute('data-under-ink'), graph?.id);
  check('let go, it goes back under the ink', back === 'true', back);

  // Page menu: LaTeX next to PNG, SVG, PDF; Pro-only for a free account
  await clickTitle(page, 'Page');
  await sleep(300);
  const row = await page.evaluate(() => ({
    proLink: !!document.querySelector('a[aria-label^="LaTeX export comes with NETZ Pro"]'),
    png: !!document.querySelector('button[aria-label="Export as PNG"]'),
  }));
  check('free: LaTeX in the page menu links to Pricing', row.proLink && row.png, JSON.stringify(row));
  await page.keyboard.press('Escape');
} catch (err) {
  check('suite ran to the end', false, err.stack || err.message);
} finally {
  await page.evaluate(() => localStorage.removeItem('netz_pro_v1')).catch(() => {});
  await browser.close();
}

const real = errors.filter((e) => !/hydrat|ResizeObserver/i.test(e));
check('no page errors', real.length === 0, real.join(' || '));
results.forEach((r) => console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.ok ? '' : ` — ${r.detail}`}`));
const passed = results.filter((r) => r.ok).length;
console.log(`HARNESS_RESULT ${passed}/${results.length}`);
if (passed !== results.length) process.exit(1);
