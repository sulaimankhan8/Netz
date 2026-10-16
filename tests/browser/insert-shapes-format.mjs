import { launch, openPlayground, sleep, clickTitle, shot } from './lib.mjs';

// Formatting shapes in the real app (plan step 2): typing in a shape, text boxes, Shape Styles,
// shadows, layer order, rotate and flip, the Format Shape pane, the shape menu (right-click and
// long press), copy and paste, Set as Default Shape; then the phone layout with a finger.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const savedShapes = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return (s.pages && s.pages[s.currentPageIndex || 0] && s.pages[s.currentPageIndex || 0].shapes) || [];
});
const pickShape = async (page, id) => {
  await clickTitle(page, 'Shapes (');
  const ok = await page.evaluate((id) => {
    const el = document.querySelector(`[data-shape-item="${id}"]`);
    if (el) el.click();
    return Boolean(el);
  }, id);
  if (!ok) throw new Error('gallery item not found: ' + id);
  await sleep(200);
};
const drag = async (page, from, to, steps = 8) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps);
  await page.mouse.up();
  await sleep(200);
};
const clickMenuButton = async (page, menu, text) => {
  const ok = await page.evaluate(({ menu, text }) => {
    const root = document.querySelector(`[data-shape-menu="${menu}"]`);
    const el = root && [...root.querySelectorAll('button')].find((b) => b.innerText.trim() === text || b.getAttribute('aria-label') === text || b.title === text);
    if (el) el.click();
    return Boolean(el);
  }, { menu, text });
  if (!ok) throw new Error(`button "${text}" not found in menu ${menu}`);
  await sleep(250);
};
const editor = (page) => page.evaluate(() => {
  const ta = document.querySelector('[data-shape-text-editor] textarea');
  return ta ? { focused: document.activeElement === ta, value: ta.value } : null;
});
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

// ── Laptop ───────────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  try {
    await openPlayground(page);
    await pickShape(page, 'roundRect');
    await drag(page, [400, 260], [640, 400]);

    // Double click: type in the shape
    await page.mouse.click(520, 330);
    await sleep(60);
    await page.mouse.click(520, 330);
    await sleep(300);
    let ed = await editor(page);
    check('a double click opens the text, with the cursor in it', ed && ed.focused, JSON.stringify(ed));
    await page.keyboard.type('Hello shapes, hello pen');
    await sleep(500);
    let shapes = await savedShapes(page);
    check('typing goes into the shape', shapes[0].text && shapes[0].text.value === 'Hello shapes, hello pen', JSON.stringify(shapes[0].text));
    const tool = await page.evaluate(() => document.querySelector('button[aria-label="Lasso Select"]').className.includes('bg-purple-500'));
    check('letters that are tool keys (h, e, p, l, s) go into the text, not the toolbar', tool);
    check('the shape\'s own text is hidden while typing (no double text)', (await page.evaluate(() => document.querySelectorAll('[data-shape-text]').length)) === 0);
    await page.keyboard.press('Escape');
    await sleep(300);
    const shown = await page.evaluate(() => {
      const t = document.querySelector('[data-shape-text]');
      return t ? { text: t.textContent, fill: t.getAttribute('fill'), anchor: t.getAttribute('text-anchor') } : null;
    });
    check('Escape finishes; the text shows in the shape, white and centred (Word default)', shown && shown.text === 'Hello shapes, hello pen' && shown.fill === '#FFFFFF' && shown.anchor === 'middle', JSON.stringify(shown));
    check('the shape is still selected after typing', (await page.evaluate(() => document.querySelectorAll('[data-shape-handle]').length)) > 0);

    // Enter opens the text again; F2 too
    await page.keyboard.press('Enter');
    await sleep(250);
    ed = await editor(page);
    check('Enter on a selected shape opens its text', ed && ed.focused && ed.value === 'Hello shapes, hello pen', JSON.stringify(ed));
    await page.keyboard.press('Escape');
    await sleep(250);

    // Text menu: bold, bigger
    await clickTitle(page, 'Text');
    await clickMenuButton(page, 'text', 'Bold');
    await clickMenuButton(page, 'text', 'Increase Font Size');
    shapes = await savedShapes(page);
    check('Text > Bold and Increase Font Size', shapes[0].text.bold === true && shapes[0].text.size > 16, JSON.stringify(shapes[0].text));
    await clickMenuButton(page, 'text', 'Align Left');
    shapes = await savedShapes(page);
    check('Text > Align Left', shapes[0].text.align === 'left');

    // Shape Styles
    await clickTitle(page, 'Shape Styles');
    const styles = await page.evaluate(() => document.querySelectorAll('[data-shape-menu="styles"] [data-shape-style]').length);
    check('Shape Styles shows 42 styles (6 x 7), as in WPS', styles === 42, styles);
    await page.evaluate(() => document.querySelector('[data-shape-style="outline-#ED7D31"]').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('picking "Colored Outline - Orange" restyles the shape and its text', shapes[0].fill.color === '#FFFFFF' && shapes[0].line.color === '#ED7D31' && shapes[0].text.color === '#000000' && shapes[0].text.value === 'Hello shapes, hello pen', JSON.stringify([shapes[0].fill, shapes[0].line.color, shapes[0].text.color]));

    // Shape Effects > Shadow
    await clickTitle(page, 'Shape Effects');
    await page.evaluate(() => document.querySelector('[data-shape-menu="effects"] button[aria-label="Shadow: Offset: Bottom"]').click());
    await sleep(300);
    shapes = await savedShapes(page);
    const filter = await page.evaluate(() => Boolean(document.querySelector('svg[data-shape-layer] filter feGaussianBlur')));
    check('Shape Effects > Shadow adds a shadow, drawn with a filter', shapes[0].shadow && shapes[0].shadow.preset === 'outerBottom' && filter, JSON.stringify(shapes[0].shadow));
    await page.keyboard.press('Escape');

    // A second shape overlapping the first, then layer order
    await pickShape(page, 'ellipse');
    await drag(page, [560, 300], [700, 440]);
    shapes = await savedShapes(page);
    const [firstId, secondId] = shapes.map((s) => s.id);
    await page.mouse.click(430, 290); // the rounded rectangle, where the oval does not cover it
    await sleep(250);
    await clickTitle(page, 'Arrange');
    await clickMenuButton(page, 'arrange', 'Bring to Front');
    shapes = await savedShapes(page);
    check('Arrange > Bring to Front puts the shape on top', shapes[shapes.length - 1].id === firstId, shapes.map((s) => s.id === firstId ? 'rect' : 'oval').join(','));
    await clickMenuButton(page, 'arrange', 'Send to Back');
    shapes = await savedShapes(page);
    check('Arrange > Send to Back puts it underneath', shapes[0].id === firstId);
    await clickMenuButton(page, 'arrange', 'Rotate Right 90°');
    await clickMenuButton(page, 'arrange', 'Flip Horizontal');
    shapes = await savedShapes(page);
    const rect = shapes.find((s) => s.id === firstId);
    check('Arrange > Rotate Right 90° and Flip Horizontal', rect.rot === 90 && rect.flipH === true, JSON.stringify([rect.rot, rect.flipH]));
    await clickMenuButton(page, 'arrange', 'Rotate Left 90°');
    await clickMenuButton(page, 'arrange', 'Flip Horizontal');
    await page.keyboard.press('Escape');

    // Format Shape pane: size, gradient, text options
    await clickTitle(page, 'Format Shape pane');
    const pane = await page.evaluate(() => {
      const p = document.querySelector('[data-format-pane]');
      if (!p) return null;
      const r = p.getBoundingClientRect();
      return { tabs: [...p.querySelectorAll('[role="tab"]')].map((t) => t.innerText), fits: r.right <= innerWidth && r.bottom <= innerHeight && r.top >= 0 };
    });
    check('the Format Shape pane opens with WPS\'s tabs', pane && pane.tabs.join('|') === 'Fill & Line|Effects|Size & Properties|Text' && pane.fits, JSON.stringify(pane));
    const setSelect = (label, value) => page.evaluate(({ label, value }) => {
      const el = document.querySelector(`[data-format-pane] select[aria-label="${label}"]`);
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { label, value });
    const setNumber = (label, value) => page.evaluate(({ label, value }) => {
      const el = document.querySelector(`[data-format-pane] input[aria-label="${label}"]`);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(el, String(value));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, { label, value });
    const tab = (name) => page.evaluate((name) => [...document.querySelectorAll('[data-format-pane] [role="tab"]')].find((t) => t.innerText === name).click(), name);
    await setSelect('Fill type', 'gradient');
    await sleep(300);
    shapes = await savedShapes(page);
    let gradientDrawn = await page.evaluate(() => Boolean(document.querySelector('svg[data-shape-layer] linearGradient')));
    check('Fill & Line > Gradient fill', shapes.find((s) => s.id === firstId).fill.type === 'gradient' && gradientDrawn);
    await tab('Size & Properties');
    await sleep(150);
    await setNumber('Width', 300);
    await sleep(300);
    shapes = await savedShapes(page);
    check('Size & Properties > Width', near(shapes.find((s) => s.id === firstId).w, 300, 0.01), shapes.find((s) => s.id === firstId).w);
    await tab('Text');
    await sleep(150);
    await setSelect('Vertical alignment', 'top');
    await setSelect('Autofit', 'shrink');
    await sleep(300);
    shapes = await savedShapes(page);
    const t1 = shapes.find((s) => s.id === firstId).text;
    check('Text > Vertical alignment and Autofit', t1.valign === 'top' && t1.autofit === 'shrink', JSON.stringify(t1));
    await page.evaluate(() => document.querySelector('[data-format-pane] button[aria-label="Close Format Shape"]').click());
    await sleep(200);

    // The shape menu (right-click): Copy, Paste, Set as Default Shape
    await page.mouse.click(430, 290, { button: 'right' });
    await sleep(300);
    const menuItems = await page.evaluate(() => [...document.querySelectorAll('[data-shape-context-menu] [role="menuitem"]')].map((b) => b.innerText.split('\n')[0]));
    check('right-click opens the shape menu (WPS items)', ['Cut', 'Copy', 'Paste', 'Duplicate', 'Delete', 'Edit Text', 'Bring to Front', 'Send to Back', 'Set as Default Shape', 'Format Shape...'].every((i) => menuItems.includes(i)), JSON.stringify(menuItems));
    const browserMenuBlocked = await page.evaluate(() => {
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 430, clientY: 290 });
      document.elementFromPoint(430, 290).dispatchEvent(e);
      return e.defaultPrevented;
    });
    check('and the browser\'s own menu does not open over it', browserMenuBlocked);
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-context-menu] [role="menuitem"]')].find((b) => b.innerText.startsWith('Copy')).click());
    await sleep(200);
    const before = (await savedShapes(page)).length;
    await page.keyboard.down('Control');
    await page.keyboard.press('v');
    await page.keyboard.up('Control');
    await sleep(400);
    shapes = await savedShapes(page);
    check('Copy then Ctrl+V pastes a copy, offset', shapes.length === before + 1 && near(shapes[shapes.length - 1].x, shapes.find((s) => s.id === firstId).x + 20, 0.01), `${before} -> ${shapes.length}`);

    await page.mouse.click(430, 290, { button: 'right' });
    await sleep(300);
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-context-menu] [role="menuitem"]')].find((b) => b.innerText.startsWith('Set as Default Shape')).click());
    await sleep(200);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('netz_playground_default_shape') || 'null'));
    check('Set as Default Shape remembers the look', stored && stored.fill.type === 'gradient' && stored.line.color === '#ED7D31' && stored.shadow.preset === 'outerBottom', JSON.stringify(stored && [stored.fill.type, stored.line.color]));
    await pickShape(page, 'diamond');
    await page.mouse.click(1000, 500);
    await sleep(300);
    shapes = await savedShapes(page);
    const diamond = shapes[shapes.length - 1];
    check('the next shape is drawn with the default look', diamond.preset === 'diamond' && diamond.fill.type === 'gradient' && diamond.line.color === '#ED7D31' && diamond.shadow && diamond.shadow.preset === 'outerBottom', JSON.stringify([diamond.fill.type, diamond.line.color]));

    // Text box: opens ready to type, grows with its text; an empty one goes away
    await pickShape(page, 'textbox');
    await drag(page, [300, 520], [520, 560]);
    ed = await editor(page);
    check('a new text box opens ready to type', ed && ed.focused, JSON.stringify(ed));
    const hBefore = (await savedShapes(page)).slice(-1)[0].h;
    await page.keyboard.type('Line one');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line two');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line three');
    await sleep(500);
    shapes = await savedShapes(page);
    const box = shapes[shapes.length - 1];
    check('a text box grows with its text (Resize shape to fit text)', box.textBox && box.text.value === 'Line one\nLine two\nLine three' && box.h > hBefore + 20, `${hBefore} -> ${box.h}`);
    await page.keyboard.press('Escape');
    await sleep(250);
    const boxText = await page.evaluate((id) => document.querySelector(`[data-shape-id="${id}"] [data-shape-text]`)?.getAttribute('fill'), box.id);
    check('text box text takes the page\'s ink colour', boxText === 'currentColor', boxText);
    const countBefore = (await savedShapes(page)).length;
    await pickShape(page, 'textbox');
    await drag(page, [700, 520], [900, 560]);
    await page.keyboard.press('Escape');
    await sleep(400);
    check('an empty text box is removed when typing ends', (await savedShapes(page)).length === countBefore);

    // Undo after typing gives the text back as it was
    await page.mouse.click(430, 290);
    await sleep(200);
    await page.keyboard.press('Enter');
    await sleep(200);
    await page.keyboard.type(' more');
    await sleep(600);
    await page.keyboard.press('Escape');
    await sleep(200);
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await sleep(500);
    shapes = await savedShapes(page);
    check('Ctrl+Z after typing undoes the typing', shapes.find((s) => s.id === firstId).text.value === 'Hello shapes, hello pen', shapes.find((s) => s.id === firstId).text.value);
    await shot(page, 'shapes-format-laptop');
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
  const fingerDrag = async (from, to, steps = 10) => {
    await touch('touchStart', [from]);
    for (let s = 1; s <= steps; s++) await touch('touchMove', [[from[0] + ((to[0] - from[0]) * s) / steps, from[1] + ((to[1] - from[1]) * s) / steps]]);
    await touch('touchEnd', []);
    await sleep(250);
  };
  const tap = async (x, y, wait = 120) => {
    await touch('touchStart', [[x, y]]);
    await touch('touchEnd', []);
    await sleep(wait);
  };
  try {
    await openPlayground(page);
    await clickTitle(page, 'More Tools');
    await page.evaluate(() => document.querySelector('button[aria-label="Insert Shapes"]').click());
    await sleep(300);
    await page.evaluate(() => document.querySelector('[data-shape-item="rect"]').click());
    await sleep(250);
    await fingerDrag([100, 250], [290, 390]);

    const bar = await page.evaluate(() => {
      const el = document.querySelector('[data-shape-format-bar] > div');
      const r = el.getBoundingClientRect();
      return { buttons: [...el.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')), fits: r.left >= 0 && r.right <= innerWidth };
    });
    check('phone: the format bar has five buttons and fits', bar.buttons.join('|') === 'Shape Styles|Fill|Outline|Text|More' && bar.fits, JSON.stringify(bar));

    // Double tap: type
    await tap(190, 320, 80);
    await tap(190, 320, 400);
    const ed = await editor(page);
    check('phone: a double tap opens the text', ed && ed.focused, JSON.stringify(ed));
    await page.keyboard.type('Tap tap');
    await sleep(400);
    await tap(60, 560); // empty page, clear of the music player and the dock
    await sleep(300);
    const shapes = await savedShapes(page);
    check('phone: the typed text is kept after tapping away', shapes[0].text && shapes[0].text.value === 'Tap tap', JSON.stringify(shapes[0].text));

    // Long press: the shape menu
    await tap(190, 320, 300);
    await touch('touchStart', [[190, 330]]);
    await sleep(800);
    const menu = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-context-menu]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      return { items: m.querySelectorAll('[role="menuitem"]').length, fits: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight };
    });
    await touch('touchEnd', []);
    await sleep(300);
    check('phone: a long press opens the shape menu, on screen', menu && menu.items >= 10 && menu.fits, JSON.stringify(menu));
    const afterLift = await page.evaluate(() => Boolean(document.querySelector('[data-shape-context-menu]')));
    const moved = await savedShapes(page);
    check('phone: lifting the finger leaves the menu open and chooses nothing', afterLift && moved.length === 1, `${afterLift} ${moved.length}`);
    check('phone: and the long press does not move the shape', near(moved[0].x, shapes[0].x, 0.01) && near(moved[0].y, shapes[0].y, 0.01));
    await page.keyboard.press('Escape');
    await sleep(200);
    check('phone: Escape closes the menu and keeps the shape selected', !(await page.evaluate(() => Boolean(document.querySelector('[data-shape-context-menu]')))) && (await page.evaluate(() => document.querySelectorAll('[data-shape-handle]').length)) > 0);

    // More: effects, arrange, pane, all on screen and on top
    await clickTitle(page, 'More');
    const more = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-menu="more"]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      const onTop = [[60, innerHeight - 40], [300, innerHeight - 140]].every(([x, y]) => m.contains(document.elementFromPoint(x, y)));
      const small = [...m.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().height < 44).length;
      return { fits: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, onTop, small };
    });
    check('phone: More is a bottom sheet on top of everything, with 44 px buttons', more && more.fits && more.onTop && more.small === 0, JSON.stringify(more));
    await shot(page, 'shapes-format-phone-more');
    await clickMenuButton(page, 'more', 'Format Shape...');
    const pane = await page.evaluate(() => {
      const p = document.querySelector('[data-format-pane]');
      if (!p) return null;
      const r = p.getBoundingClientRect();
      return { fits: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0, onTop: p.contains(document.elementFromPoint(195, innerHeight - 60)) };
    });
    check('phone: the Format Shape pane is a bottom sheet on top', pane && pane.fits && pane.onTop, JSON.stringify(pane));
    await sleep(300);
    const visible = await page.evaluate(() => {
      const paneTop = document.querySelector('[data-format-pane]').getBoundingClientRect().top;
      const ys = [...document.querySelectorAll('[data-shape-handle]')].filter((h) => !/rotate/.test(h.getAttribute('data-shape-handle'))).map((h) => h.getBoundingClientRect().top + h.getBoundingClientRect().height / 2);
      return { paneTop: Math.round(paneTop), lowest: Math.round(Math.max(...ys)), highest: Math.round(Math.min(...ys)) };
    });
    check('phone: the page moves so the shape is visible above the pane', visible.lowest < visible.paneTop && visible.highest > 60, JSON.stringify(visible));
    await shot(page, 'shapes-format-phone-pane');
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
