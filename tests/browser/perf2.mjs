import { launch, openPlayground, sleep, seedStrokes } from './lib.mjs';

// Where does the time go when one stroke is added to a large page? Run after perf.mjs has seeded IndexedDB.
// `node perf2.mjs` uses whatever session is stored.
const { browser, page, errors } = await launch();
const out = {};
try {
  await openPlayground(page);
  await seedStrokes(page, Number(process.argv[2] || 3000));
  await page.goto('about:blank');
  await page.evaluateOnNewDocument(() => {
    window.__t = { stringifyMs: 0, stringifyCalls: 0, stringifyChars: 0, setItemMs: 0, setItemCalls: 0, setItemFailed: 0, putMs: 0, putCalls: 0, longTasks: [] };
    const stringify = JSON.stringify;
    JSON.stringify = function (...a) {
      const t = performance.now();
      const r = stringify.apply(this, a);
      const d = performance.now() - t;
      if (r && r.length > 100000) { window.__t.stringifyMs += d; window.__t.stringifyCalls++; window.__t.stringifyChars = r.length; }
      return r;
    };
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      const t = performance.now();
      try { return setItem.call(this, k, v); } catch (e) { window.__t.setItemFailed++; throw e; } finally {
        if (k === 'NETZ_PLAYGROUND_SESSION_BACKUP') { window.__t.setItemMs += performance.now() - t; window.__t.setItemCalls++; }
      }
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...a) {
      const t = performance.now();
      const r = put.apply(this, a);
      window.__t.putMs += performance.now() - t; window.__t.putCalls++;
      return r;
    };
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__t.longTasks.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] });
  });
  await openPlayground(page);
  await sleep(2000);
  out.strokesOnPage = await page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open('NETZ_PLAYGROUND_DB', 1);
    req.onsuccess = () => { const g = req.result.transaction('sessions').objectStore('sessions').get('default_session'); g.onsuccess = () => resolve(g.result ? g.result.pages[0].strokes.length : 0); };
  }));
  const reset = () => page.evaluate(() => { const t = window.__t; for (const k of Object.keys(t)) t[k] = Array.isArray(t[k]) ? [] : 0; });
  const read = () => page.evaluate(() => { const t = window.__t; const r = {}; for (const k of Object.keys(t)) r[k] = typeof t[k] === 'number' ? Math.round(t[k]) : t[k]; return r; });

  for (const label of ['strokeA', 'strokeB']) {
    await reset();
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(520, 330, { steps: 5 });
    const t0 = Date.now();
    await page.mouse.up();
    // The pointer-up handler has returned once the page answers again
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    out[label] = { blockedMs: Date.now() - t0, ...(await read()) };
    await sleep(600);
  }
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 400);
}
out.errors = errors.slice(0, 4);
console.log(JSON.stringify(out, null, 1));
await browser.close();
