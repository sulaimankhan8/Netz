import { launch, openPlayground, drawStroke, sleep, clickTitle, shot, settle, BASE } from './lib.mjs';

// The behaviour added by PLAYGROUND_UX_FIX_PLAN.md: leaving without needless prompts, an honest
// save status, undo per page, Undo after deleting, the page sheet, Send to Notes that reports
// failure, the music player kept off the page, Fit to content, models loaded only when needed and
// a model that fails without breaking the page; and on a phone, two- and three-finger taps, the
// one-time finger hint and touch-sized controls in the open panels.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const session = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}'));
const pageStrokes = async (page) => {
  const s = await session(page);
  return s.pages ? (s.pages[s.currentPageIndex || 0].strokes || []).length : 0;
};
const notice = (page) => page.evaluate(() => [...document.querySelectorAll('[data-status-area] [role="status"]')].map((n) => n.innerText.trim()).join(' | '));
const clickNoticeAction = (page, label) => page.evaluate((t) => {
  const b = [...document.querySelectorAll('[data-status-area] button')].find((x) => x.innerText.trim() === t);
  if (!b) return false;
  b.click();
  return true;
}, label);
const canUndo = (page) => page.evaluate(() => !document.querySelector('button[aria-label="Undo"]').disabled);
const buttonByText = (page, text, scope = 'body') => page.evaluate((t, s) => {
  const b = [...document.querySelectorAll(`${s} button`)].find((x) => x.innerText.trim() === t);
  if (!b) return false;
  b.click();
  return true;
}, text, scope);

// ───────────────────────────── Laptop, mouse ─────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  try {
    await openPlayground(page);
    await sleep(1500);

    // Models: nothing large is fetched before the first stroke
    const early = requests.filter((u) => /\/models\/|\/onnx\//.test(u));
    check('first visit: no model or recognition runtime is fetched before anything is drawn', early.length === 0, early.join(', '));

    // Music: not on the page until opened
    check('the music player is not on the page by itself', !(await page.evaluate(() => /Lo-fi chill|Lo-Fi Chill/.test(document.body.innerText))));
    await clickTitle(page, 'Page');
    await sleep(250);
    await page.evaluate(() => document.querySelector('button[aria-label="Focus music"]').click());
    await sleep(400);
    check('Page > Focus music opens the player as a dialog', await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog="Focus music"]'))));
    await page.keyboard.press('Escape');
    await sleep(250);

    // Save status
    await drawStroke(page, [[400, 300], [520, 330]]);
    await settle(page);
    await sleep(600);
    const chip = await page.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((n) => n.innerText.trim()).find((t) => /Saved|Saving/.test(t)));
    check('after a change the top bar says Saved', chip === 'Saved', chip);

    // Leaving with content asks nothing (everything is saved)
    await page.evaluate(() => window.__NETZ_OPEN_UNSAVED_MODAL__ && window.__NETZ_OPEN_UNSAVED_MODAL__('/Notes'));
    await sleep(2500);
    check('leaving a page with content asks nothing and goes', /\/Notes/.test(page.url()) && !(await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog^="Your latest"]')))), page.url());
    await openPlayground(page);
    await sleep(800);
    check('the ink is still there after leaving and coming back', (await pageStrokes(page)) === 1, await pageStrokes(page));

    // Per-page undo (a visit starts with a fresh history, so page 1 gets a new stroke first)
    await drawStroke(page, [[700, 300], [780, 330]]);
    await sleep(400);
    await clickTitle(page, 'Add page');
    await sleep(400);
    await drawStroke(page, [[400, 400], [500, 420]]);
    await sleep(500);
    check('page 2: its stroke can be undone', await canUndo(page));
    await clickTitle(page, 'Previous Page');
    await sleep(500);
    check('back on page 1: its own history is kept (Undo available)', await canUndo(page));
    await clickTitle(page, 'Undo');
    await sleep(400);
    check('undo on page 1 removes page 1\'s newest stroke', (await pageStrokes(page)) === 1, await pageStrokes(page));
    await clickTitle(page, 'Redo');
    await sleep(400);
    await clickTitle(page, 'Next Page');
    await sleep(500);
    check('page 2 kept its history too', await canUndo(page));

    // Delete page, then Undo from the notice
    await clickTitle(page, 'Delete page');
    await sleep(400);
    let s = await session(page);
    check('Delete page removes it at once (no question)', s.pages.length === 1, s.pages.length);
    check('a notice offers Undo', /deleted/.test(await notice(page)), await notice(page));
    check('Undo brings the page back', await clickNoticeAction(page, 'Undo'));
    await sleep(500);
    s = await session(page);
    check('the page is back in its place, with its ink', s.pages.length === 2 && s.currentPageIndex === 1 && (s.pages[1].strokes || []).length === 1, JSON.stringify({ n: s.pages.length, i: s.currentPageIndex }));
    check('the restored page has its undo history', await canUndo(page));

    // Titles never repeat after a delete and an add
    await clickTitle(page, 'Delete page');
    await sleep(300);
    await clickTitle(page, 'Add page');
    await sleep(300);
    s = await session(page);
    check('a new page after a delete gets a fresh name', new Set(s.pages.map((p) => p.title)).size === s.pages.length, s.pages.map((p) => p.title).join(', '));

    // Page sheet: rename and reorder, kept after a reload
    await clickTitle(page, 'All pages');
    await sleep(400);
    check('the page name opens the page sheet', await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog="Pages"]'))));
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="Pages"] [data-page-row] button[title="Rename"]')][0].click());
    await sleep(200);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.type('Algebra');
    await page.keyboard.press('Enter');
    await sleep(300);
    await page.evaluate(() => document.querySelector('[data-insert-dialog="Pages"] button[aria-label="Move Algebra down"]').click());
    await sleep(400);
    await page.keyboard.press('Escape');
    await settle(page);
    await sleep(600);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
    await sleep(1500);
    s = await session(page);
    check('rename and reorder survive a reload', s.pages.length === 2 && s.pages[1].title === 'Algebra', s.pages.map((p) => p.title).join(', '));

    // Clear page offers Undo
    await clickTitle(page, 'Previous Page').catch(() => {});
    await drawStroke(page, [[600, 300], [700, 320]]);
    await sleep(500);
    const before = await pageStrokes(page);
    await clickTitle(page, 'Clear page');
    await sleep(500);
    check('Clear page asks nothing and clears', (await pageStrokes(page)) === 0, await pageStrokes(page));
    check('Clear page offers Undo, and it works', await clickNoticeAction(page, 'Undo'));
    await sleep(500);
    check('the cleared ink is back', (await pageStrokes(page)) === before, `${await pageStrokes(page)} of ${before}`);

    // Block delete: trash icon, Undo
    await clickTitle(page, 'Add Theory');
    await sleep(500);
    await page.keyboard.type('hello');
    await buttonByText(page, 'Done');
    await sleep(300);
    const nBlocks = () => page.evaluate(() => document.querySelectorAll('[data-block-id]').length);
    await page.evaluate(() => document.querySelector('[data-block-id] button[title="Delete Block"]').click());
    await sleep(300);
    check('a block deletes in one tap', (await nBlocks()) === 0);
    check('the notice offers Undo for the block', /Text deleted/.test(await notice(page)), await notice(page));
    await clickNoticeAction(page, 'Undo');
    await sleep(500);
    check('Undo brings the block back', (await nBlocks()) === 1);

    // Send to Notes: a storage failure is reported, and the dialog stays
    await page.evaluate(() => {
      const real = Storage.prototype.setItem;
      window.__realSetItem = real;
      Storage.prototype.setItem = function (k, v) {
        if (/^netz_notes/.test(k)) {
          const e = new Error('full');
          e.name = 'QuotaExceededError';
          throw e;
        }
        return real.call(this, k, v);
      };
    });
    await clickTitle(page, 'Sync Whiteboard to Notes Workspace');
    await sleep(400);
    await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.innerText.trim() === 'Send to Notes').click());
    await sleep(300);
    const failure = await page.evaluate(() => document.querySelector('[data-insert-dialog="Send to Notes"] [role="alert"]')?.innerText || '');
    check('Send to Notes says when it could not save, and stays open', /Couldn.t send to Notes/.test(failure) && /storage is full/.test(failure), failure);
    await page.evaluate(() => {
      Storage.prototype.setItem = window.__realSetItem;
    });
    await page.keyboard.press('Escape');
    await sleep(300);

    // Save failure: the chip says so, and leaving asks
    await page.evaluate(() => {
      window.indexedDB.open = () => {
        throw new Error('switched off for this check');
      };
    });
    await drawStroke(page, [[300, 500], [360, 520]]);
    await sleep(1500);
    const failedChip = await page.evaluate(() => document.querySelector('[role="alert"]')?.innerText || '');
    check('a failed save shows "Couldn\'t save" with Retry', /Couldn.t save/.test(failedChip) && /Retry/.test(failedChip), failedChip);
    await page.evaluate(() => window.__NETZ_OPEN_UNSAVED_MODAL__('/Notes'));
    await sleep(500);
    check('leaving after a failed save asks first', await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog^="Your latest"]'))));
    await buttonByText(page, 'Stay');
    await sleep(300);
    check('Stay keeps you on the Playground', /Playground/.test(page.url()));

    // Fit to content: ink far away comes into view
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
    await sleep(1500);
    for (let i = 0; i < 12; i++) await page.mouse.wheel({ deltaX: 400, deltaY: 300 });
    await sleep(300);
    const inkVisible = () => page.evaluate(() => {
      const c = document.querySelector('canvas.z-10');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
      return false;
    });
    const awayFirst = await inkVisible();
    await clickTitle(page, 'Zoom (');
    await sleep(200);
    await page.evaluate(() => document.querySelector('button[aria-label="Fit to content"]').click());
    await sleep(500);
    check('Fit to content brings ink that was off screen back into view', !awayFirst && (await inkVisible()), `before: ${awayFirst}`);
    await shot(page, 'ux-fit');

    // The mouse wheel scrolls menus and galleries that scroll, and pans the canvas elsewhere
    const wheelAt = async (selector) => {
      const box = await page.evaluate((sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, selector);
      await page.mouse.move(box.x, box.y);
      await page.mouse.wheel({ deltaY: 300 });
      await sleep(400);
    };
    await clickTitle(page, 'Shapes (');
    await sleep(400);
    const galleryList = '[data-shape-gallery] .overflow-y-auto';
    await wheelAt(galleryList);
    const galleryScrolled = await page.evaluate((sel) => document.querySelector(sel).scrollTop, galleryList);
    check('the wheel scrolls the Shapes gallery', galleryScrolled > 0, galleryScrolled);
    await page.keyboard.press('Escape');
    await sleep(300);

    await clickTitle(page, 'Equation: Insert New Equation');
    await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
    await page.evaluate(() => document.querySelector('button[aria-label="Maths actions"]').click());
    await sleep(300);
    await page.evaluate(() => document.querySelector('[data-cas-examples-toggle]').click());
    await sleep(400);
    const menu = await page.evaluate(() => {
      const m = document.querySelector('[data-cas-menu]');
      const r = m.getBoundingClientRect();
      return { scrolls: m.scrollHeight > m.clientHeight, top: r.top, bottom: r.bottom, x: r.left + r.width / 2 };
    });
    check('the Maths actions menu stays on screen, clear of the dock', menu.top >= 0 && menu.bottom <= 768 - 90, JSON.stringify(menu));
    await page.mouse.move(menu.x, menu.top + 120);
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel({ deltaY: 120 });
      await sleep(150);
    }
    await sleep(300);
    const menuScrolled = await page.evaluate(() => document.querySelector('[data-cas-menu]').scrollTop);
    check('the wheel scrolls the Maths actions menu ("Try an example")', menu.scrolls && menuScrolled > 0, `scrollTop ${menuScrolled}`);
    await page.keyboard.press('Escape');
    await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').forEach((b) => b.click()));
    await sleep(300);

    const panBefore = await page.evaluate(() => document.querySelector('[data-block-id]').style.transform);
    await page.mouse.move(1200, 600);
    await page.mouse.wheel({ deltaY: 200 });
    await sleep(300);
    const panAfter = await page.evaluate(() => document.querySelector('[data-block-id]').style.transform);
    check('the wheel over the page still pans the canvas', panBefore !== panAfter, `${panBefore} -> ${panAfter}`);
  } catch (e) {
    check('laptop part ran to the end', false, String((e && e.stack) || e).slice(0, 400));
  }
  check('laptop: no console errors', errors.filter((e) => !/switched off for this check|could not be saved|Failed to send to Notes|QuotaExceeded/.test(e)).length === 0, errors.join(' || ').slice(0, 300));
  await browser.close();
}

// ───────────────────── Laptop: a model that cannot load ─────────────────────
{
  const { browser, page } = await launch({ width: 1366, height: 768 });
  try {
    await page.setRequestInterception(true);
    page.on('request', (r) => (/\/models\/|\/onnx\//.test(r.url()) ? r.abort() : r.continue()));
    await openPlayground(page);
    await drawStroke(page, [[400, 300], [500, 340]]);
    let warning = '';
    for (let i = 0; i < 30 && !warning; i++) {
      await sleep(500);
      warning = await page.evaluate(() => [...document.querySelectorAll('[data-status-area] [role="alert"]')].map((n) => n.innerText).join(' '));
    }
    check('a model that cannot load shows a warning with Retry (not a green tick)', /unavailable/.test(warning) && /Retry/.test(warning), warning);
    await drawStroke(page, [[400, 420], [500, 460]]);
    await sleep(600);
    check('the whiteboard keeps working without recognition', (await pageStrokes(page)) === 2, await pageStrokes(page));
  } catch (e) {
    check('model-failure part ran to the end', false, String((e && e.stack) || e).slice(0, 400));
  }
  await browser.close();
}

// ───────────────────────────── Phone, touch ─────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const client = await page.createCDPSession();
  const touch = (type, pts) => client.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id, radiusX: 12, radiusY: 12, force: 0.5 })) });
  const finger = async (from, to, steps = 8) => {
    await touch('touchStart', [from]);
    for (let s = 1; s <= steps; s++) await touch('touchMove', [[from[0] + ((to[0] - from[0]) * s) / steps, from[1] + ((to[1] - from[1]) * s) / steps]]);
    await touch('touchEnd', []);
    await sleep(150);
  };
  const tapWith = async (points) => {
    await touch('touchStart', points);
    await sleep(60);
    await touch('touchEnd', []);
    await sleep(400);
  };
  try {
    await openPlayground(page);
    await page.evaluate(() => {
      localStorage.removeItem('netz_playground_finger_hint_seen');
      localStorage.removeItem('netz_playground_finger_draws');
    });

    await finger([120, 300], [260, 330]);
    await sleep(500);
    check('phone: one finger draws', (await pageStrokes(page)) === 1, await pageStrokes(page));
    check('phone: after the first finger stroke a hint says what one finger does', /One finger draws/.test(await notice(page)), await notice(page));
    await finger([120, 400], [260, 430]);
    await sleep(500);

    await tapWith([[150, 600], [230, 600]]);
    check('phone: a two-finger tap undoes, without leaving a mark', (await pageStrokes(page)) === 1, await pageStrokes(page));
    await tapWith([[120, 600], [190, 600], [260, 600]]);
    check('phone: a three-finger tap redoes, without leaving a mark', (await pageStrokes(page)) === 2, await pageStrokes(page));

    // Open panels: every control at least 44 px
    const smallIn = (selector) => page.evaluate((sel) => {
      const root = document.querySelector(sel);
      if (!root) return ['(panel not found)'];
      return [...root.querySelectorAll('button, input[type="color"]')]
        .filter((b) => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden')
        .map((b) => ({ b, r: b.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 43.5 || r.height < 43.5)
        .map(({ b, r }) => `${b.getAttribute('aria-label') || b.title || b.innerText.trim()} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }, selector);
    await clickTitle(page, 'More');
    await sleep(400);
    const moreSmall = await smallIn('[role="dialog"][aria-labelledby]');
    check('phone: More sheet, every control is at least 44 px', moreSmall.length === 0, moreSmall.join(', '));
    await shot(page, 'ux-phone-more');
    await page.keyboard.press('Escape');
    await sleep(300);
    await clickTitle(page, 'Stroke & Canvas Settings');
    await sleep(400);
    const optionsSmall = await smallIn('[role="dialog"][aria-labelledby]');
    check('phone: pen options, every control is at least 44 px', optionsSmall.length === 0, optionsSmall.join(', '));
    await shot(page, 'ux-phone-pen-options');
    await page.keyboard.press('Escape');
    await sleep(300);

    // The status area, the top bar and the dock do not overlap
    const overlap = await page.evaluate(() => {
      const box = (el) => el && el.getBoundingClientRect();
      const bar = box(document.querySelector('button[aria-label="Previous page"]')?.closest('.fixed'));
      const dock = box(document.querySelector('[role="toolbar"]'));
      const status = box(document.querySelector('[data-status-area]'));
      const hit = (a, b) => a && b && a.width && b.width && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return { barStatus: hit(bar, status), dockStatus: hit(dock, status) };
    });
    check('phone: the status area clears the top bar and the dock', !overlap.barStatus && !overlap.dockStatus, JSON.stringify(overlap));

    // A finger scrolls the Shapes sheet
    await clickTitle(page, 'More');
    await sleep(400);
    await page.evaluate(() => document.querySelector('button[aria-label="Insert Shapes"]').click());
    await sleep(500);
    const list = await page.evaluate(() => {
      const r = document.querySelector('[data-shape-gallery] .overflow-y-auto').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await touch('touchStart', [[list.x, list.y + 120]]);
    for (let s = 1; s <= 12; s++) {
      await touch('touchMove', [[list.x, list.y + 120 - s * 20]]);
      await sleep(16);
    }
    await touch('touchEnd', []);
    await sleep(600);
    const sheetScrolled = await page.evaluate(() => document.querySelector('[data-shape-gallery] .overflow-y-auto').scrollTop);
    check('phone: a finger scrolls the Shapes sheet', sheetScrolled > 0, sheetScrolled);
  } catch (e) {
    check('phone part ran to the end', false, String((e && e.stack) || e).slice(0, 400));
  }
  check('phone: no console errors', errors.length === 0, errors.join(' || ').slice(0, 300));
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} UX fix checks passed (${BASE})`);
