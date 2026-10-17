import { launch, openPlayground, sleep, clickTitle, shot, addEquationBlock } from './lib.mjs';

// Insert > Equation in the real app (plan step 4): the WPS menu, the visual editor (MathLive)
// with the equation ribbon, LaTeX view, Insert LaTeX, Common Equations (Math, Physics,
// Chemistry), Plot Graph on editor output, the editor loading only when used; then the phone.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const savedBlocks = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return (s.pages && s.pages[s.currentPageIndex || 0] && s.pages[s.currentPageIndex || 0].blocks) || [];
});
const fieldValue = (page) => page.evaluate(() => document.querySelector('[data-block-id] math-field')?.value ?? null);
const clickIn = (page, selector, text) => page.evaluate(({ selector, text }) => {
  const el = [...document.querySelectorAll(selector)].find((b) => !text || b.innerText.trim().endsWith(text));
  if (el) el.click();
  return Boolean(el);
}, { selector, text });
const closeEditors = (page) => page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').forEach((b) => b.click()));

// ── Laptop ───────────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  const mathlive = [];
  page.on('request', (r) => { if (/mathlive/i.test(r.url())) mathlive.push(r.url()); });
  try {
    await openPlayground(page);
    await sleep(1000);
    check('the page loads without the equation editor (it is fetched on first use)', mathlive.length === 0, mathlive.slice(0, 2).join(' '));

    const group = await page.evaluate(() => [...document.querySelector('[role="group"][aria-label="Insert"]').querySelectorAll('button')].map((b) => b.getAttribute('aria-label')));
    check('Equation is in the Insert group, with its menu arrow', group.join('|') === 'Insert Picture|Screenshot|Screenshot menu|Shapes|Symbol|Equation|Equation menu', JSON.stringify(group));

    // Insert New Equation: the visual editor, ready to type
    await clickTitle(page, 'Equation: Insert New Equation');
    await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
    await sleep(400);
    check('Insert New Equation opens the visual editor with the cursor in it', (await page.evaluate(() => document.activeElement.tagName)) === 'MATH-FIELD');
    check('and the editor was fetched now', mathlive.length > 0, mathlive.length);
    const tools = await page.evaluate(() => [...document.querySelectorAll('[data-equation-ribbon] [data-equation-tool]')].map((b) => b.getAttribute('data-equation-tool')));
    check('the ribbon has Symbols and the 11 structures (Word / WPS Equation Tools)', tools.join(',') === 'symbols,fraction,script,radical,integral,largeOperator,bracket,function,accent,limitLog,operator,matrix', tools.join(','));

    await page.keyboard.type('y=');
    await clickIn(page, '[data-equation-tool="fraction"]');
    await sleep(300);
    const fractions = await page.evaluate(() => [...document.querySelectorAll('[data-equation-template]')].map((b) => ({ name: b.getAttribute('data-equation-template'), drawn: Boolean(b.querySelector('.katex')) })));
    check('Fraction opens its gallery, every template drawn', fractions.length >= 9 && fractions.every((f) => f.drawn), JSON.stringify(fractions.slice(0, 3)));
    await clickIn(page, '[data-equation-template="Stacked Fraction"]');
    await sleep(300);
    check('the gallery closes after a pick', !(await page.evaluate(() => Boolean(document.querySelector('[data-equation-gallery-popover]')))));
    check('the cursor stays in the editor', (await page.evaluate(() => document.activeElement.tagName)) === 'MATH-FIELD');
    await page.keyboard.type('1');
    await page.keyboard.press('Tab');
    await page.keyboard.type('2');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('x^2');
    await sleep(500);
    let blocks = await savedBlocks(page);
    check('a fraction from the ribbon, filled in by typing, saved in the long LaTeX form', blocks[0] && blocks[0].content.latex === 'y=\\frac{1}{2}x^2', blocks[0] && blocks[0].content.latex);

    // Plot Graph from editor output
    await clickIn(page, 'button', 'Plot Graph');
    await sleep(1200);
    blocks = await savedBlocks(page);
    const graph = blocks.find((b) => b.type === 'graph');
    const curve = graph && graph.content.graphData.datasets[0];
    const at2 = curve && curve.data.find((p) => Math.abs(p.x - 2) < 1e-9);
    check('Plot Graph draws the editor\'s equation (y = x²/2 is 2 at x = 2)', at2 && at2.y === 2, JSON.stringify(at2));

    // Symbols palette and a matrix
    await page.evaluate(() => document.querySelector('[data-block-id] math-field').focus());
    await clickIn(page, '[data-equation-tool="symbols"]');
    await sleep(250);
    await clickIn(page, '[data-equation-gallery-popover] button', 'Greek Letters');
    await sleep(150);
    await clickIn(page, '[data-equation-symbol="π"]');
    await sleep(300);
    check('a symbol from the palette goes in as LaTeX (π as \\pi)', /\\pi/.test(await fieldValue(page)), await fieldValue(page));
    await clickIn(page, '[data-equation-tool="matrix"]');
    await sleep(250);
    await clickIn(page, '[data-equation-template="Matrix with Brackets"]');
    await sleep(300);
    check('a matrix template goes in', /\\begin\{bmatrix\}/.test(await fieldValue(page)), await fieldValue(page));

    // The LaTeX view and back
    await clickIn(page, '[data-equation-ribbon] button[title^="Linear"]');
    await sleep(300);
    const linear = await page.evaluate(() => ({ input: document.querySelector('[data-block-id] [data-latex-input]')?.value, field: Boolean(document.querySelector('[data-block-id] math-field')) }));
    check('Linear shows the equation as LaTeX text', linear.input && /\\frac\{1\}\{2\}/.test(linear.input) && !linear.field, JSON.stringify(linear));
    await clickIn(page, '[data-equation-ribbon] button[title^="Professional"]');
    await page.waitForSelector('[data-block-id] math-field');
    check('Professional brings the visual editor back', true);
    await page.keyboard.press('Enter');
    await sleep(400);
    const view = await page.evaluate(() => {
      const b = document.querySelector('[data-block-id]');
      return { display: Boolean(b.querySelector('.katex-display')), editing: Boolean(b.querySelector('math-field')), raw: /placeholder/.test(b.innerText) };
    });
    check('Enter finishes; a new equation shows full-size (display style), as in WPS', view.display && !view.editing, JSON.stringify(view));
    check('the matrix boxes left empty show as empty squares, not as LaTeX', !view.raw, JSON.stringify(view));

    // The Equation menu
    await clickTitle(page, 'Equation menu');
    const menu = await page.evaluate(() => {
      const m = document.querySelector('[data-equation-menu]');
      return m ? [...m.querySelectorAll('button')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
    });
    check('the Equation menu: Insert New Equation, Insert LaTeX, Math, Physics, Chemistry', menu && ['Insert New Equation', 'Insert LaTeX', 'Math', 'Physics', 'Chemistry'].every((t) => menu.some((m) => m.endsWith(t))), JSON.stringify(menu));
    await clickIn(page, '[data-equation-subject="math"]');
    await sleep(300);
    const math = await page.evaluate(() => [...document.querySelectorAll('[data-common-equation]')].map((b) => ({ name: b.getAttribute('data-common-equation'), drawn: Boolean(b.querySelector('.katex-display')) })));
    check('Common Equations > Math lists WPS\'s equations, drawn', math.length === 12 && math[0].name === 'Quadratic Formula' && math.every((m) => m.drawn), JSON.stringify(math.slice(0, 2)));
    await shot(page, 'equation-menu-laptop');
    const before = (await savedBlocks(page)).length;
    await clickIn(page, '[data-common-equation="Quadratic Formula"]');
    await sleep(500);
    blocks = await savedBlocks(page);
    const quad = blocks[blocks.length - 1];
    check('picking one inserts it as a finished, full-size equation', blocks.length === before + 1 && quad.content.latex.startsWith('x=\\frac{-b\\pm') && quad.content.display === true && !(await page.evaluate(() => Boolean(document.querySelector('math-field')))), JSON.stringify(quad && quad.content));

    await clickTitle(page, 'Equation menu');
    await clickIn(page, '[data-equation-subject="chemistry"]');
    await sleep(300);
    await clickIn(page, '[data-common-equation="Formation of Water"]');
    await sleep(500);
    const chem = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-block-id]')].pop();
      return { katex: Boolean(b.querySelector('.katex')), error: Boolean(b.querySelector('.katex-error')), text: b.innerText.slice(0, 60) };
    });
    check('a chemistry equation is drawn (mhchem: 2H₂ + O₂ → 2H₂O)', chem.katex && !chem.error, JSON.stringify(chem));
    // Edit is in the block's bar (the formula at rest has nothing on top of it)
    await page.evaluate(() => [...document.querySelectorAll('[data-block-id]')].pop().querySelector('button[title="Edit Block"]').click());
    await sleep(500);
    const chemEdit = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-block-id]')].pop();
      return { input: b.querySelector('[data-latex-input]')?.value, field: Boolean(b.querySelector('math-field')) };
    });
    check('chemistry opens as LaTeX (the visual editor cannot edit \\ce)', chemEdit.input && chemEdit.input.startsWith('\\ce{') && !chemEdit.field, JSON.stringify(chemEdit));
    await closeEditors(page);
    await sleep(200);

    // Insert LaTeX
    await clickTitle(page, 'Equation menu');
    await clickIn(page, '[data-equation-menu] button', 'Insert LaTeX');
    await page.waitForSelector('[data-insert-dialog="Insert LaTeX"]');
    await page.type('[data-insert-dialog="Insert LaTeX"] textarea', '\\frac{a}{b');
    await sleep(200);
    const invalid = await page.evaluate(() => ({ error: document.querySelector('[data-latex-error]')?.innerText, disabled: [...document.querySelectorAll('[data-insert-dialog="Insert LaTeX"] button')].find((b) => b.innerText.trim() === 'Insert').disabled }));
    check('Insert LaTeX says when the LaTeX is not valid, and Insert is off', invalid.error && invalid.disabled, JSON.stringify(invalid));
    await page.type('[data-insert-dialog="Insert LaTeX"] textarea', '}+\\sqrt{c}');
    await sleep(200);
    check('a valid one is drawn as you type', await page.evaluate(() => Boolean(document.querySelector('[data-latex-preview] .katex-display'))));
    await page.evaluate(() => [...document.querySelectorAll('[data-insert-dialog="Insert LaTeX"] button')].find((b) => b.innerText.trim() === 'Insert').click());
    await sleep(500);
    blocks = await savedBlocks(page);
    check('Insert adds it as an equation', blocks[blocks.length - 1].content.latex === '\\frac{a}{b}+\\sqrt{c}', blocks[blocks.length - 1].content.latex);

    // One undo step removes the last insert
    const count = blocks.length;
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await sleep(500);
    check('Ctrl+Z removes the inserted equation', (await savedBlocks(page)).length === count - 1);
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
  try {
    await openPlayground(page);
    await clickTitle(page, 'More Tools');
    await clickIn(page, 'button[aria-label="Insert Equation"]');
    await sleep(300);
    const sheet = await page.evaluate(() => {
      const m = document.querySelector('[data-equation-menu]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      const small = [...m.querySelectorAll('button')].filter((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) < 44).length;
      return { fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, width: Math.round(r.width), small, onTop: m.contains(document.elementFromPoint(200, innerHeight - 40)) };
    });
    check('phone: the Equation menu is a full-width bottom sheet on top, with 44 px buttons', sheet && sheet.fits && sheet.width === 390 && sheet.small === 0 && sheet.onTop, JSON.stringify(sheet));
    await clickIn(page, '[data-equation-subject="physics"]');
    await sleep(300);
    const physics = await page.evaluate(() => ({ items: document.querySelectorAll('[data-common-equation]').length, back: Boolean(document.querySelector('[data-equation-menu] button[aria-label="Back"]')) }));
    check('phone: a subject\'s gallery replaces the list, with Back', physics.items >= 10 && physics.back, JSON.stringify(physics));
    await shot(page, 'equation-gallery-phone');
    await clickIn(page, '[data-equation-menu] button[aria-label="Back"]');
    await sleep(200);
    await clickIn(page, '[data-equation-menu] button', 'Insert New Equation');
    await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
    await sleep(800);
    const block = await page.evaluate(() => {
      const r = document.querySelector('[data-block-id]').getBoundingClientRect();
      const ribbon = document.querySelector('[data-equation-ribbon]').getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), ribbonScrolls: document.querySelector('[data-equation-ribbon]').scrollWidth > ribbon.width };
    });
    check('phone: the new equation fits the screen; the ribbon scrolls sideways', block.left >= 0 && block.right <= 390 && block.ribbonScrolls, JSON.stringify(block));
    const above = await page.evaluate(() => {
      const kb = window.mathVirtualKeyboard;
      const r = document.querySelector('[data-block-id]').getBoundingClientRect();
      if (!kb || !kb.visible) return { keyboard: false };
      return { keyboard: true, blockTop: Math.round(r.top), blockBottom: Math.round(r.bottom), keyboardTop: Math.round(kb.boundingRect.top) };
    });
    check('phone: with the maths keyboard up, the equation sits above it', !above.keyboard || (above.blockBottom <= above.keyboardTop && above.blockTop >= 60), JSON.stringify(above));
    await page.keyboard.type('a^2+b^2=c^2');
    await sleep(400);
    check('phone: typing goes into the visual editor', (await fieldValue(page)) === 'a^2+b^2=c^2', await fieldValue(page));
    await shot(page, 'equation-editor-phone');

    // A fraction and an integral built from the ribbon with a finger
    const tap = async (selector) => {
      const at = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        el.scrollIntoView({ block: 'nearest', inline: 'center' });
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      }, selector);
      if (!at) throw new Error(`nothing to tap: ${selector}`);
      await page.touchscreen.tap(at[0], at[1]);
      await sleep(350);
    };
    await page.evaluate(() => { const f = document.querySelector('[data-block-id] math-field'); f.value = ''; f.focus(); });
    await tap('[data-equation-tool="fraction"]');
    const phoneGallery = await page.evaluate(() => {
      const g = document.querySelector('[data-equation-gallery-popover]');
      if (!g) return null;
      const r = g.getBoundingClientRect();
      const small = [...g.querySelectorAll('[data-equation-template]')].filter((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) < 44).length;
      return { fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0, small };
    });
    check('phone: a structure gallery fits the screen, every template at least 44 px', phoneGallery && phoneGallery.fits && phoneGallery.small === 0, JSON.stringify(phoneGallery));
    await tap('[data-equation-template="Stacked Fraction"]');
    await page.keyboard.type('1');
    await page.keyboard.press('Tab');
    await page.keyboard.type('2');
    await page.keyboard.press('ArrowRight');
    await tap('[data-equation-tool="integral"]');
    await tap('[data-equation-template="Integral with Limits"]');
    await page.keyboard.type('0');
    await page.keyboard.press('Tab');
    await page.keyboard.type('1');
    await page.keyboard.press('Tab');
    await page.keyboard.type('x');
    await sleep(500);
    const built = await fieldValue(page);
    check('phone: a fraction and an integral with limits, tapped from the ribbon', /^\\frac\{?1\}?\{?2\}?\\int_\{?0\}?\^\{?1\}?x$/.test(built), built);
    const saved = (await savedBlocks(page)).find((b) => b.type === 'equation');
    check('phone: saved in the long LaTeX form', saved && saved.content.latex === '\\frac{1}{2}\\int_0^1x', saved && saved.content.latex);
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
