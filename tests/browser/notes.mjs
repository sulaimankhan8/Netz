// Checks for the Notes redesign (NOTES_VISUAL_REDESIGN_PLAN.md, section 6).
// Run against a server, e.g. NETZ_URL=http://localhost:3211 node notes.mjs
import { launch, sleep, shot, BASE } from './lib.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

async function openNotes(page) {
  await page.goto(`${BASE}/Notes`, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.waitForSelector('aside[aria-label="Notes"], main', { timeout: 30000 });
  await sleep(600);
}

/** Clicks (or taps) the first visible element matching css whose text or aria-label contains text. */
async function press(page, css, text, { tap = false } = {}) {
  const handle = await page.evaluateHandle(
    (css, text) => {
      const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      return [...document.querySelectorAll(css)].find((el) => visible(el) && ((el.getAttribute('aria-label') || '') + ' ' + el.innerText).includes(text)) || null;
    },
    css,
    text
  );
  const el = handle.asElement();
  if (!el) throw new Error(`not found: ${css} "${text}"`);
  if (tap) await el.tap();
  else await el.click();
  await sleep(250);
  return el;
}

const count = (page, css) => page.evaluate((css) => [...document.querySelectorAll(css)].filter((e) => e.getClientRects().length > 0).length, css);
const rowTitles = (page) =>
  page.evaluate(() => [...document.querySelectorAll('aside[aria-label="Notes"] [aria-current], aside[aria-label="Notes"] button.flex-1')].map((b) => b.querySelector('span.font-semibold')?.innerText || ''));
const blockCount = (page) => page.evaluate(() => document.querySelectorAll('[data-block-id]').length);

// ---------------------------------------------------------------- laptop
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 });
  try {
    await openNotes(page);
    const layout = await page.evaluate(() => {
      const aside = document.querySelector('aside[aria-label="Notes"]')?.getBoundingClientRect();
      const main = document.querySelector('main')?.getBoundingClientRect();
      return { aside: aside && Math.round(aside.width), main: main && Math.round(main.width), font: getComputedStyle(document.querySelector('main')).fontFamily };
    });
    check('laptop: list and note side by side', layout.aside === 300 && layout.main > 900, JSON.stringify(layout));
    check('laptop: DM Sans', /DM_Sans|DM Sans/i.test(layout.font), layout.font.slice(0, 60));
    await shot(page, 'notes-laptop');

    const before = await rowTitles(page);
    check('laptop: three sample notes listed', before.length === 3, before.join(' | '));
    const moreVisible = await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="Options for"]')].every((b) => getComputedStyle(b).opacity === '1'));
    check('laptop: ⋯ on every note is visible', moreVisible);

    // Pin the second note
    await press(page, 'button[aria-label^="Options for"]', before[1]);
    check('laptop: note menu opens', (await count(page, '[role="menu"]')) === 1);
    await press(page, '[role="menuitem"]', 'Pin note');
    const pinned = await page.evaluate(() => document.querySelector('section[aria-label="Pinned"]')?.innerText || '');
    check('laptop: Pin note moves it to Pinned', pinned.includes(before[1].slice(0, 20)));

    // Delete a note, then Undo
    const titlesNow = await rowTitles(page);
    await press(page, 'button[aria-label^="Options for"]', titlesNow[2]);
    await press(page, '[role="menuitem"]', 'Delete note');
    const afterDelete = await rowTitles(page);
    const noticeText = await page.evaluate(() => document.querySelector('[role="status"][aria-live]')?.innerText || '');
    check('laptop: Delete note removes it and offers Undo', afterDelete.length === 2 && /Note deleted/.test(noticeText) && /Undo/.test(noticeText), noticeText.replace(/\n/g, ' '));
    await press(page, '[role="status"] button', 'Undo');
    const afterUndo = await rowTitles(page);
    check('laptop: Undo puts the note back in its place', afterUndo.length === 3 && afterUndo[2] === titlesNow[2], afterUndo.join(' | '));

    // Save status, Export menu
    const saved = await page.evaluate(() => [...document.querySelectorAll('main [role="status"]')].map((s) => s.innerText).join(' '));
    check('laptop: save status says Saved', /Saved/.test(saved), saved);
    await press(page, 'main button', 'Export');
    const exportRows = await page.evaluate(() => [...document.querySelectorAll('[role="menu"] [role="menuitem"]')].map((b) => b.innerText));
    check('laptop: Export menu has PDF and Markdown', exportRows.some((t) => /PDF/.test(t)) && exportRows.some((t) => /Markdown/.test(t)), exportRows.join(' | '));
    await page.keyboard.press('Escape');
    await sleep(200);
    check('laptop: Escape closes the Export menu', (await count(page, '[role="menu"]')) === 0);

    // Nothing cut off: every growing text box shows all its text
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('main textarea')].filter((t) => t.scrollHeight > t.clientHeight + 2).map((t) => t.value.slice(0, 30))
    );
    check('laptop: no text box cuts its text off', clipped.length === 0, clipped.join(' | '));

    // Formula: no LaTeX field until it is clicked
    const mathInputsAtRest = await page.evaluate(() => document.querySelectorAll('main input.font-nt-mono[placeholder^="e.g. Z"]').length);
    check('laptop: formula shows no LaTeX field at rest', mathInputsAtRest === 0);
    await press(page, '[role="button"][aria-label^="Formula"]', 'Formula');
    const mathInputs = await page.evaluate(() => document.querySelectorAll('main input[placeholder^="e.g. Z"]').length);
    check('laptop: clicking the formula opens its LaTeX field', mathInputs === 1);
    await press(page, 'main button', 'Done');
    check('laptop: Done closes the LaTeX field', (await page.evaluate(() => document.querySelectorAll('main input[placeholder^="e.g. Z"]').length)) === 0);

    // Block grip: hover shows it, menu moves and deletes, Undo restores
    const firstBlock = await page.$('[data-block-id]');
    const gripHiddenBefore = await page.evaluate(() => {
      const g = document.querySelector('[data-block-id] button[aria-label$="block options"]');
      return g ? getComputedStyle(g.parentElement).opacity : 'none';
    });
    await firstBlock.hover();
    await sleep(250);
    const gripShown = await page.evaluate(() => getComputedStyle(document.querySelector('[data-block-id] button[aria-label$="block options"]').parentElement).opacity);
    check('laptop: block grip hidden at rest, shown on hover', gripHiddenBefore === '0' && gripShown === '1', `${gripHiddenBefore} → ${gripShown}`);
    const firstId = await page.evaluate(() => document.querySelector('[data-block-id]').dataset.blockId);
    await (await page.$('[data-block-id] button[aria-label$="block options"]')).click();
    await sleep(250);
    const blockRows = await page.evaluate(() => [...document.querySelectorAll('[role="menu"] [role="menuitem"]')].map((b) => `${b.innerText}${b.disabled ? ' (off)' : ''}`));
    check('laptop: block menu has its four actions', blockRows.length === 4, blockRows.join(' | '));
    await press(page, '[role="menuitem"]', 'Move down');
    const secondId = await page.evaluate(() => document.querySelectorAll('[data-block-id]')[1].dataset.blockId);
    check('laptop: Move down moves the block', secondId === firstId);
    const nBlocks = await blockCount(page);
    await page.hover(`[data-block-id="${firstId}"]`);
    await sleep(200);
    await (await page.$(`[data-block-id="${firstId}"] button[aria-label$="block options"]`)).click();
    await sleep(200);
    await press(page, '[role="menuitem"]', 'Delete block');
    check('laptop: Delete block removes it', (await blockCount(page)) === nBlocks - 1);
    await press(page, '[role="status"] button', 'Undo');
    const restoredAt = await page.evaluate((id) => [...document.querySelectorAll('[data-block-id]')].findIndex((b) => b.dataset.blockId === id), firstId);
    check('laptop: Undo puts the block back', (await blockCount(page)) === nBlocks && restoredAt === 1, `at ${restoredAt}`);

    // The handle is one row (+ then grip), level with the first line, on one block at a time
    const paraId = await page.evaluate(() => document.querySelector('[data-block-id] textarea[aria-label="Text"]')?.closest('[data-block-id]').dataset.blockId);
    await page.click(`[data-block-id="${paraId}"] textarea`);
    await sleep(150);
    const otherId = await page.evaluate((id) => [...document.querySelectorAll('[data-block-id]')].map((b) => b.dataset.blockId).find((x) => x !== id), paraId);
    await page.hover(`[data-block-id="${otherId}"]`);
    await sleep(250);
    const handles = await page.evaluate((paraId) => {
      const shown = [...document.querySelectorAll('[data-block-id]')].filter((b) => {
        const g = b.querySelector('button[aria-label$="block options"]');
        return g && getComputedStyle(g.parentElement).opacity === '1';
      });
      const para = document.querySelector(`[data-block-id="${paraId}"]`);
      const plus = para.querySelector('button[aria-label="Add block below"]').getBoundingClientRect();
      const grip = para.querySelector('button[aria-label$="block options"]').getBoundingClientRect();
      const line = para.querySelector('textarea').getBoundingClientRect();
      return { shown: shown.length, sameRow: Math.abs(plus.top - grip.top) < 1 && plus.right <= grip.left, gap: Math.round(line.left - grip.right), lineMid: Math.round(line.top + 17 - (grip.top + grip.height / 2)) };
    }, paraId);
    check('laptop: only one block shows its handle (hover wins over typing)', handles.shown === 1, JSON.stringify(handles));
    check('laptop: + and grip sit side by side, level with the first line', handles.sameRow && Math.abs(handles.lineMid) <= 2 && handles.gap >= 0, JSON.stringify(handles));

    // Click under the last block to keep typing
    const beforeBelow = await blockCount(page);
    await page.click('[data-click-below]');
    await sleep(300);
    const below = await page.evaluate(() => {
      const blocks = [...document.querySelectorAll('[data-block-id]')];
      const last = blocks[blocks.length - 1];
      return { n: blocks.length, focusedInLast: last.contains(document.activeElement) && document.activeElement.tagName === 'TEXTAREA' };
    });
    check('laptop: clicking under the last block starts a text block there', below.n === beforeBelow + 1 && below.focusedInLast, JSON.stringify(below));
    await page.click('[data-click-below]');
    await sleep(300);
    check('laptop: clicking again reuses that empty block', (await blockCount(page)) === beforeBelow + 1);
    await page.keyboard.type('typed below');
    await sleep(300);
    const lastText = await page.evaluate(() => [...document.querySelectorAll('[data-block-id] textarea')].pop()?.value);
    check('laptop: typing goes into it', lastText === 'typed below', lastText);

    // Tags as chips
    await press(page, 'main button', 'Add tag');
    await page.keyboard.type('Exam,');
    await sleep(200);
    const hasExam = await page.evaluate(() => !!document.querySelector('button[aria-label="Remove tag Exam"]'));
    check('laptop: typing a tag and a comma adds a chip', hasExam);
    await page.click('button[aria-label="Remove tag Exam"]');
    await sleep(200);
    check('laptop: × removes the tag', !(await page.evaluate(() => !!document.querySelector('button[aria-label="Remove tag Exam"]'))));

    // Add block grid: folded to one row until opened, remembered after a reload
    check('laptop: Add block grid is folded at first', (await count(page, 'section[aria-label="Add block"]')) === 0);
    await press(page, 'main button[aria-expanded="false"]', 'Add block');
    const gridButtons = await count(page, 'section[aria-label="Add block"] .grid button');
    check('laptop: opening it shows nine block types', gridButtons === 9, String(gridButtons));
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(800);
    check('laptop: the grid stays open after a reload', (await count(page, 'section[aria-label="Add block"]')) === 1);
    await press(page, 'section[aria-label="Add block"] button', 'Hide');
    check('laptop: Hide folds it again', (await count(page, 'section[aria-label="Add block"]')) === 0);
    await press(page, 'main button[aria-expanded="false"]', 'Add block');
    await press(page, 'section[aria-label="Add block"] button', 'Text');
    await sleep(300);
    await page.keyboard.type('/form');
    await sleep(300);
    const slash = await page.evaluate(() => [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((o) => o.innerText.split('\n')[0]));
    check('laptop: / menu filters to Formula', slash.length >= 1 && slash[0] === 'Formula', slash.join(' | '));
    await page.keyboard.press('Escape');

    // Share and the solver picker close with Escape
    await press(page, 'main button', 'Share');
    check('laptop: Share opens', (await count(page, '[role="dialog"][aria-label="Share"]')) === 1);
    await shot(page, 'notes-laptop-share');
    await page.keyboard.press('Escape');
    await sleep(250);
    check('laptop: Escape closes Share', (await count(page, '[role="dialog"][aria-label="Share"]')) === 0);
    await press(page, 'button[aria-label="Change algorithm"]', 'Change algorithm');
    check('laptop: solver picker opens', (await count(page, '[role="dialog"][aria-label="Add a solver"]')) === 1);
    await shot(page, 'notes-laptop-picker');
    await page.keyboard.press('Escape');
    await sleep(250);
    check('laptop: Escape closes the solver picker', (await count(page, '[role="dialog"][aria-label="Add a solver"]')) === 0);

    // Dark mode: one palette, no slate or Notion greys
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(300);
    const dark = await page.evaluate(() => {
      const bg = getComputedStyle(document.querySelector('main')).backgroundColor;
      const bad = new Set();
      for (const el of document.querySelectorAll('main *, aside *')) {
        const c = getComputedStyle(el).backgroundColor;
        if (['rgb(15, 23, 42)', 'rgb(2, 6, 23)', 'rgb(25, 25, 25)', 'rgb(30, 41, 59)'].includes(c)) bad.add(c);
      }
      return { bg, bad: [...bad] };
    });
    check('laptop dark: page on the Notes dark paper, no slate', dark.bg === 'rgb(20, 20, 21)' && dark.bad.length === 0, JSON.stringify(dark));
    await shot(page, 'notes-laptop-dark');

    check('laptop: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    check('laptop run', false, e.message);
    await shot(page, 'notes-laptop-failure').catch(() => {});
  }
  await browser.close();
}

// ---------------------------------------------------------------- phone
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  try {
    await openNotes(page);
    // App shell: the phone nav bar sits above Notes, and Notes fits the rest of the screen exactly
    const shell = await page.evaluate(() => {
      const nav = document.querySelector('nav[data-app-nav]')?.getBoundingClientRect();
      const root = document.querySelector('.font-nt')?.getBoundingClientRect();
      return {
        vw: window.innerWidth,
        vh: window.innerHeight,
        nav: nav ? `${Math.round(nav.x)},${Math.round(nav.y)} ${Math.round(nav.width)}x${Math.round(nav.height)}` : 'none',
        navBottom: nav ? Math.round(nav.bottom) : 0,
        rootTop: root ? Math.round(root.top) : -1,
        root: root ? Math.round(root.width) : 0,
        docWidth: document.documentElement.scrollWidth,
        docHeight: document.documentElement.scrollHeight
      };
    });
    check('phone: nav bar on top, Notes fills the width', shell.root >= shell.vw - 1 && shell.docWidth <= shell.vw + 1 && shell.vw <= 391, JSON.stringify(shell));
    check('phone: Notes starts under the nav bar and does not scroll as a page', shell.rootTop === shell.navBottom && shell.docHeight <= shell.vh + 1, `top ${shell.rootTop}, nav bottom ${shell.navBottom}, page ${shell.docHeight} of ${shell.vh}`);

    const start = await page.evaluate(() => ({
      aside: Math.round(document.querySelector('aside[aria-label="Notes"]')?.getBoundingClientRect().width || 0),
      main: !!document.querySelector('main')
    }));
    check('phone: opens on the list, full width', start.aside >= 380 && !start.main, JSON.stringify(start));
    await shot(page, 'notes-phone-list');

    const targets = async () =>
      page.evaluate(() => {
        const root = document.querySelector('.font-nt');
        const small = [];
        for (const b of document.querySelectorAll('button, [role="button"], a[href]')) {
          if (!root?.contains(b) && !b.closest('.font-nt')) continue;
          const r = b.getBoundingClientRect();
          if (!r.width) continue;
          if (r.width < 43.5 || r.height < 43.5) small.push(`${(b.getAttribute('aria-label') || b.innerText).trim().slice(0, 24)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        return small;
      });
    const smallList = await targets();
    check('phone list: every button at least 44 px', smallList.length === 0, smallList.slice(0, 8).join(' | '));

    await press(page, 'aside button.flex-1', 'Unit 1', { tap: true });
    await sleep(400);
    const opened = await page.evaluate(() => ({
      aside: !!document.querySelector('aside[aria-label="Notes"]'),
      mainTop: Math.round(document.querySelector('#note-printable-area')?.getBoundingClientRect().top ?? -1),
      overflow: (() => {
        const m = document.querySelector('main');
        return m ? m.scrollWidth - m.clientWidth : -1;
      })(),
      back: !![...document.querySelectorAll('main button')].find((b) => b.innerText.trim() === 'Notes')
    }));
    check('phone: tapping a note shows the note at the top of the screen', !opened.aside && opened.mainTop > 0 && opened.mainTop < 200, JSON.stringify(opened));
    const fab = await page.evaluate(() => {
      const b = [...document.querySelectorAll('main button')].find((x) => x.innerText.trim() === 'Add block');
      const r = b?.getBoundingClientRect();
      return r ? { left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), vw: innerWidth, vh: innerHeight } : null;
    });
    check('phone: Add block button is on screen, centred', fab && fab.bottom <= fab.vh && Math.abs(fab.left + fab.right - fab.vw) <= 4, JSON.stringify(fab));
    check('phone: the note does not scroll sideways', opened.overflow <= 0, String(opened.overflow));
    check('phone: a back button returns to the list', opened.back);
    await shot(page, 'notes-phone-note');

    const smallNote = await targets();
    check('phone note: every button at least 44 px', smallNote.length === 0, smallNote.slice(0, 8).join(' | '));

    // Tap a text block: its grip appears; it opens the block menu as a sheet
    const para = await page.$('[data-block-id] textarea[aria-label="Text"]');
    await para.tap();
    await sleep(300);
    const grip = await page.$('button[aria-label="Text block options"]');
    check('phone: the block you are in shows its grip', !!grip);
    if (grip) {
      await grip.tap();
      await sleep(300);
      const sheet = await page.evaluate(() => {
        const m = document.querySelector('[role="menu"]');
        if (!m) return null;
        const r = m.getBoundingClientRect();
        return { width: Math.round(r.width), bottom: Math.round(r.bottom), rows: m.querySelectorAll('[role="menuitem"]').length };
      });
      const vw = await page.evaluate(() => window.innerWidth);
      check('phone: block menu is a bottom sheet with four actions', sheet && sheet.width >= vw - 1 && sheet.rows === 4, JSON.stringify({ ...sheet, vw }));
      await shot(page, 'notes-phone-block-menu');
      await page.keyboard.press('Escape');
      await sleep(300);
    }

    // Add block button and sheet
    await press(page, 'button', 'Add block', { tap: true });
    await sleep(300);
    const addSheet = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Add block"]');
      return d ? d.querySelectorAll('.grid button').length : -1;
    });
    check('phone: Add block opens a sheet with nine types', addSheet === 9, String(addSheet));
    await shot(page, 'notes-phone-add');
    await press(page, '[role="dialog"] button', 'Close Add block', { tap: true });

    await press(page, 'main button', 'Notes', { tap: true });
    await sleep(300);
    check('phone: back shows the list again', !!(await page.$('aside[aria-label="Notes"]')));

    check('phone: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    check('phone run', false, e.message);
    await shot(page, 'notes-phone-failure').catch(() => {});
  }
  await browser.close();
}

// ---------------------------------------------------------------- tablet
{
  const { browser, page, errors } = await launch({ width: 820, height: 1180, deviceScaleFactor: 2 });
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, hasTouch: true, isMobile: false });
  try {
    await openNotes(page);
    const t = await page.evaluate(() => ({
      main: Math.round(document.querySelector('main')?.getBoundingClientRect().width || 0),
      list: !!document.querySelector('aside[aria-label="Notes"]'),
      showList: !!document.querySelector('button[aria-label="Show the notes list"]')
    }));
    check('tablet: note full width with a Show list button', t.main > 700 && !t.list && t.showList, JSON.stringify(t));
    await shot(page, 'notes-tablet');
    check('tablet: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    check('tablet run', false, e.message);
  }
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
