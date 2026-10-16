import { launch, openPlayground, sleep, clickTitle, shot, addEquationBlock } from './lib.mjs';

// Insert > Symbol in the real app (plan step 3): the WPS menu, a symbol going where the cursor
// was (new text box, equation as LaTeX, text block, shape text), More Symbols (search, character
// code, special characters, Add to Custom Symbols), Number; then the phone layout with a finger.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const savedShapes = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return (s.pages && s.pages[s.currentPageIndex || 0] && s.pages[s.currentPageIndex || 0].shapes) || [];
});
const centre = (page, selector) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}, selector);
// A real press (the Symbol button remembers the cursor on pointerdown, before the focus moves)
const press = async (page, selector) => {
  const at = await centre(page, selector);
  if (!at) throw new Error('not found: ' + selector);
  await page.mouse.click(at[0], at[1]);
  await sleep(250);
};
const pickInMenu = async (page, char) => press(page, `[data-symbol-menu] [data-symbol="${char}"]`);
const editorValue = (page) => page.evaluate(() => {
  const ta = document.querySelector('[data-shape-text-editor] textarea');
  return ta ? { value: ta.value, focused: document.activeElement === ta, caret: ta.selectionStart } : null;
});
const drag = async (page, from, to, steps = 8) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps);
  await page.mouse.up();
  await sleep(200);
};

// ── Laptop ───────────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  try {
    await openPlayground(page);
    const group = await page.evaluate(() => [...document.querySelector('[role="group"][aria-label="Insert"]').querySelectorAll('button')].map((b) => b.getAttribute('aria-label')));
    check('the Insert group reads Picture, Screenshot, Shapes, Symbol, Equation', group.join('|') === 'Insert Picture|Screenshot|Screenshot menu|Shapes|Symbol|Equation|Equation menu', JSON.stringify(group));

    // The menu, as in WPS
    await press(page, 'button[aria-label="Symbol"]');
    const menu = await page.evaluate(() => {
      const m = document.querySelector('[data-symbol-menu]');
      if (!m) return null;
      return {
        sections: [...m.querySelectorAll('[data-symbol-section] > div:first-child')].map((d) => d.innerText),
        custom: [...m.querySelectorAll('[data-symbol-section="custom"] [data-symbol]')].map((b) => b.getAttribute('data-symbol')).join(''),
        items: [...m.querySelectorAll(':scope > button')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()),
      };
    });
    check('the Symbol menu: Custom Symbols (WPS set), More Symbols..., Number', menu && menu.sections.join('|') === 'Custom Symbols:' && menu.custom.startsWith('＋—×÷㎏㎜㎝㎡ɑɡαβθ℃') && menu.items.some((i) => i.endsWith('More Symbols...')) && menu.items.some((i) => i.endsWith('Number')), JSON.stringify(menu));
    await shot(page, 'symbols-menu-laptop');

    // No cursor anywhere: a new text box holds the symbol, ready to type on
    await pickInMenu(page, '℃');
    let ed = await editorValue(page);
    check('with no cursor, a symbol goes into a new text box, ready to type on', ed && ed.value === '℃' && ed.focused && ed.caret === 1, JSON.stringify(ed));
    await page.keyboard.type(' today');
    await sleep(400);
    let shapes = await savedShapes(page);
    check('typing carries on after the symbol', shapes.length === 1 && shapes[0].textBox && shapes[0].text.value === '℃ today', JSON.stringify(shapes.map((s) => s.text && s.text.value)));
    check('the menu closed after the pick', !(await page.evaluate(() => Boolean(document.querySelector('[data-symbol-menu]')))));

    // Inside shape text: at the cursor, then typing continues
    await page.keyboard.press('Home');
    await press(page, 'button[aria-label="Symbol"]');
    check('used symbols appear in Recently Used Symbols', (await page.evaluate(() => [...document.querySelectorAll('[data-symbol-section="recent"] [data-symbol]')].map((b) => b.getAttribute('data-symbol')).join(''))) === '℃');
    await pickInMenu(page, '≈');
    ed = await editorValue(page);
    check('in shape text, the symbol goes in at the cursor (here the start)', ed && ed.value === '≈℃ today' && ed.caret === 1 && ed.focused, JSON.stringify(ed));
    await page.keyboard.type('20');
    await sleep(400);
    shapes = await savedShapes(page);
    check('and typing continues right after it', shapes[0].text.value === '≈20℃ today', shapes[0].text.value);
    await page.keyboard.press('Escape');
    await sleep(200);

    // An equation block (the visual editor): the symbol goes in as LaTeX at its cursor
    await addEquationBlock(page);
    await page.waitForSelector('math-field');
    await sleep(300);
    await page.keyboard.type('x=2');
    await press(page, 'button[aria-label="Symbol"]');
    await pickInMenu(page, 'α');
    const eq = await page.evaluate(() => ({ value: document.querySelector('math-field').value, focused: document.activeElement === document.querySelector('math-field') }));
    check('into an equation a symbol goes as LaTeX (α as \\alpha)', eq.value === 'x=2\\alpha' && eq.focused, JSON.stringify(eq));
    await page.keyboard.type('+1');
    await sleep(300);
    const eqValue = await page.evaluate(() => document.querySelector('math-field').value);
    check('and the cursor is after it', eqValue === 'x=2\\alpha+1', eqValue);
    const katex = await page.evaluate(() => [...document.querySelectorAll('[data-block-id] .katex')].map((k) => k.textContent).join(' '));
    check('the equation shows a real α', katex.includes('α'), katex.slice(0, 80));
    await page.keyboard.press('Enter');
    await sleep(200);

    // A text block: as typed
    await clickTitle(page, 'Add Theory');
    await sleep(500);
    await page.keyboard.type('Boiling point: 100');
    await press(page, 'button[aria-label="Symbol"]');
    await pickInMenu(page, '℃');
    const theory = await page.evaluate(() => document.activeElement.tagName === 'TEXTAREA' ? document.activeElement.value : null);
    check('into a text block a symbol goes in as it is, at the cursor', theory === 'Boiling point: 100℃', theory);
    await page.keyboard.press('Escape');
    await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').forEach((b) => b.click()));
    await sleep(300);
    await page.mouse.click(700, 160);
    await sleep(200);

    // More Symbols
    await press(page, 'button[aria-label="Symbol"]');
    await press(page, '[data-symbol-menu] > button:nth-last-of-type(2)');
    await page.waitForSelector('[data-insert-dialog="More Symbols"] [data-symbol-grid] [data-symbol]', { timeout: 15000 });
    const dialog = await page.evaluate(() => {
      const d = document.querySelector('[data-insert-dialog="More Symbols"]');
      const r = d.getBoundingClientRect();
      return { tabs: [...d.querySelectorAll('[role="tab"]')].map((t) => t.innerText), subsets: d.querySelectorAll('select[aria-label="Subset"] option').length, fits: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
    });
    check('More Symbols opens: Symbols and Special Characters tabs, 31 subsets, on screen', dialog.tabs.join('|') === 'Symbols|Special Characters' && dialog.subsets === 31 && dialog.fits, JSON.stringify(dialog));
    await page.type('[data-insert-dialog="More Symbols"] input[aria-label="Search symbols"]', 'integral');
    await sleep(300);
    const found = await page.evaluate(() => [...document.querySelectorAll('[data-symbol-grid] [data-symbol]')].map((b) => b.getAttribute('data-symbol')).join(''));
    check('search by name ("integral") finds ∫ ∬ ∮', ['∫', '∬', '∮'].every((c) => found.includes(c)), found.slice(0, 20));
    await press(page, '[data-symbol-grid] [data-symbol="∫"]');
    const name = await page.evaluate(() => document.querySelector('[data-symbol-name]').innerText);
    const code = await page.evaluate(() => document.querySelector('input[aria-label="Character code"]').value);
    check('picking shows its Unicode name and code', name === 'Integral' && code === '222B', `${name} ${code}`);
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] button')].find((b) => b.innerText.trim() === 'Insert').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('Insert puts it in a new text box (no cursor) and keeps the dialog open', shapes[shapes.length - 1].text.value === '∫' && (await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog="More Symbols"]')))), shapes[shapes.length - 1].text && shapes[shapes.length - 1].text.value);
    const codeField = 'input[aria-label="Character code"]';
    await page.click(codeField, { clickCount: 3 });
    await page.type(codeField, '2211');
    await sleep(200);
    const byCode = await page.evaluate(() => document.querySelector('[data-symbol-name]').innerText);
    check('typing a character code picks that character (2211 = ∑)', byCode === 'N-Ary Summation', byCode);
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] button')].find((b) => b.innerText.trim() === 'Insert').click());
    await sleep(300);
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] button')].find((b) => b.innerText.trim() === 'Add to Custom Symbols').click());
    await sleep(200);
    shapes = await savedShapes(page);
    check('the next Insert goes after the first, into the same text box', shapes[shapes.length - 1].text.value === '∫∑', shapes[shapes.length - 1].text.value);
    const custom = await page.evaluate(() => JSON.parse(localStorage.getItem('netz_playground_custom_symbols') || '[]'));
    check('Add to Custom Symbols adds it to the menu list', custom.includes('∑') && custom[0] === '＋');
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] [role="tab"]')].find((t) => t.innerText === 'Special Characters').click());
    await sleep(150);
    const special = await page.evaluate(() => [...document.querySelectorAll('[role="option"]')].map((o) => o.innerText.split('\n').pop()));
    check('Special Characters lists Word\'s 20 (Em Dash first)', special.length === 20 && special[0] === 'Em Dash', JSON.stringify(special.slice(0, 3)));
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] button')].find((b) => b.innerText.trim() === 'Insert').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('Insert of a special character', shapes[shapes.length - 1].text.value === '∫∑—', shapes[shapes.length - 1].text.value);
    await shot(page, 'symbols-dialog-laptop');
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="More Symbols"] button')].find((b) => b.innerText.trim() === 'Close').click());
    await sleep(300);
    check('Close closes the dialog', !(await page.evaluate(() => Boolean(document.querySelector('[data-insert-dialog="More Symbols"]')))));
    const reopened = await editorValue(page);
    check('typing carries on in the text box after closing', reopened && reopened.focused && reopened.value === '∫∑—', JSON.stringify(reopened));
    await page.keyboard.press('Escape');
    await sleep(200);
    await page.mouse.click(700, 160);
    await sleep(200);

    // Number
    await press(page, 'button[aria-label="Symbol"]');
    await press(page, '[data-symbol-menu] > button:nth-last-of-type(1)');
    await page.waitForSelector('[data-insert-dialog="Number"]');
    const numberField = 'input[aria-label="Number"]';
    await page.click(numberField, { clickCount: 3 });
    await page.type(numberField, '12');
    await sleep(150);
    let preview = await page.evaluate(() => document.querySelector('[data-number-preview]').innerText);
    check('Number: ① style previews 12 as ⑫', preview === '⑫', preview);
    await page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].find((r) => r.innerText.startsWith('一')).click());
    await sleep(150);
    preview = await page.evaluate(() => document.querySelector('[data-number-preview]').innerText);
    check('Chinese numerals: 12 is 十二', preview === '十二', preview);
    await page.click(numberField, { clickCount: 3 });
    await page.type(numberField, '99');
    await page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].find((r) => r.innerText.startsWith('甲')).click());
    await sleep(150);
    preview = await page.evaluate(() => document.querySelector('[data-number-preview]').innerText);
    const okDisabled = await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="Number"] button')].find((b) => b.innerText.trim() === 'OK').disabled);
    check('a number a style cannot write says so, and OK is off', /from 1 to 10/.test(preview) && okDisabled, preview);
    await page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].find((r) => r.innerText.startsWith('Ⅰ')).click());
    await sleep(150);
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="Number"] button')].find((b) => b.innerText.trim() === 'OK').click());
    await sleep(400);
    shapes = await savedShapes(page);
    check('OK inserts the number (99 as XCIX)', shapes[shapes.length - 1].text.value === 'XCIX', shapes[shapes.length - 1].text.value);
    await page.keyboard.press('Escape');

    // Escape closes the menu; an empty text box opened by Symbol and then left goes away
    await page.mouse.click(700, 160);
    await sleep(200);
    const before = (await savedShapes(page)).length;
    await clickTitle(page, 'Shapes (');
    await page.evaluate(() => document.querySelector('[data-shape-item="textbox"]').click());
    await sleep(200);
    await drag(page, [500, 600], [700, 640]);
    await press(page, 'button[aria-label="Symbol"]');
    await page.keyboard.press('Escape');
    await sleep(300);
    check('Escape closes the Symbol menu', !(await page.evaluate(() => Boolean(document.querySelector('[data-symbol-menu]')))));
    await page.keyboard.press('Escape');
    await sleep(300);
    check('a text box left empty after Symbol is removed', (await savedShapes(page)).length === before, `${before} -> ${(await savedShapes(page)).length}`);
  } catch (e) {
    check('laptop run finished', false, String((e && e.stack) || e).slice(0, 500));
  }
  check('laptop: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── Phone, finger ────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const client = await page.createCDPSession();
  const touch = (type, pts) => client.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id, radiusX: 18, radiusY: 18, force: 0.5 })) });
  const tapAt = async (selector) => {
    const at = await centre(page, selector);
    if (!at) throw new Error('not found: ' + selector);
    await touch('touchStart', [at]);
    await touch('touchEnd', []);
    await sleep(350);
  };
  try {
    await openPlayground(page);
    await clickTitle(page, 'More Tools');
    const row = await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="Insert "]')].map((b) => b.getAttribute('aria-label')));
    check('phone: the Insert row reads Picture, Screenshot, Shapes, Symbol, Equation', row.join('|') === 'Insert Picture|Insert Screenshot|Insert Shapes|Insert Symbol|Insert Equation', JSON.stringify(row));
    await tapAt('button[aria-label="Insert Symbol"]');
    const sheet = await page.evaluate(() => {
      const m = document.querySelector('[data-symbol-menu]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      const small = [...m.querySelectorAll('button')].filter((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) < 44).length;
      const onTop = [[60, innerHeight - 40], [300, innerHeight - 140]].every(([x, y]) => m.contains(document.elementFromPoint(x, y)));
      return { fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0, width: Math.round(r.width), small, onTop };
    });
    check('phone: the Symbol menu is a full-width bottom sheet on top, with 44 px buttons', sheet && sheet.fits && sheet.width === 390 && sheet.small === 0 && sheet.onTop, JSON.stringify(sheet));
    await shot(page, 'symbols-menu-phone');
    await tapAt('[data-symbol-menu] [data-symbol="β"]');
    const shapes = await savedShapes(page);
    check('phone: a tapped symbol goes into a new text box', shapes.length === 1 && shapes[0].text.value === 'β', JSON.stringify(shapes.map((s) => s.text && s.text.value)));
    await page.keyboard.press('Escape');
    await sleep(200);
    await clickTitle(page, 'More Tools');
    await tapAt('button[aria-label="Insert Symbol"]');
    await tapAt('[data-symbol-menu] > button:nth-last-of-type(2)');
    await page.waitForSelector('[data-insert-dialog="More Symbols"] [data-symbol-grid] [data-symbol]', { timeout: 15000 });
    const dialog = await page.evaluate(() => {
      const d = document.querySelector('[data-insert-dialog="More Symbols"]');
      const r = d.getBoundingClientRect();
      const cells = [...d.querySelectorAll('[data-symbol-grid] [data-symbol]')].slice(0, 30).map((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height));
      return { fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0, smallest: Math.min(...cells), onTop: d.contains(document.elementFromPoint(200, innerHeight - 30)) };
    });
    check('phone: More Symbols is a bottom sheet on top, with 44 px cells', dialog.fits && dialog.smallest >= 44 && dialog.onTop, JSON.stringify(dialog));
    await shot(page, 'symbols-dialog-phone');
  } catch (e) {
    check('phone run finished', false, String((e && e.stack) || e).slice(0, 500));
  }
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : `  -> ${r.detail}`}`);
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
