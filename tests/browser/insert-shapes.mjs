import { launch, openPlayground, drawStroke, sleep, clickTitle, shot, inkPixels } from './lib.mjs';

// Insert > Shapes in the real app: the gallery, drawing by drag and by tap, the Word-style
// handles (move, resize, rotate, yellow adjust, line ends), fill and outline, undo, delete,
// saving, the pen writing over a shape; then the same on a phone with a finger, and the
// tablet's Insert menu.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const savedShapes = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return (s.pages && s.pages[s.currentPageIndex || 0] && s.pages[s.currentPageIndex || 0].shapes) || [];
});
const drawnShapes = (page) => page.evaluate(() => document.querySelectorAll('svg[data-shape-layer] g[data-shape-id]').length);
const handles = (page) => page.evaluate(() => [...document.querySelectorAll('[data-shape-handle]')].map((h) => {
  const r = h.getBoundingClientRect();
  return { key: h.getAttribute('data-shape-handle').replace(/^shape_[^-]+-/, ''), x: r.left + r.width / 2, y: r.top + r.height / 2, size: Math.round(r.width) };
}));
const handleAt = async (page, key) => (await handles(page)).find((h) => h.key === key);
const pickShape = async (page, id) => {
  const ok = await page.evaluate((id) => {
    const el = document.querySelector(`[data-shape-item="${id}"]`);
    if (!el) return false;
    el.click();
    return true;
  }, id);
  if (!ok) throw new Error('gallery item not found: ' + id);
  await sleep(200);
};
const drag = async (page, from, to, steps = 8) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps);
  await page.mouse.up();
  await sleep(150);
};
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

// ── Laptop, mouse ────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  try {
    await openPlayground(page);

    // The Insert group: Picture, then Shapes
    const insert = await page.evaluate(() => {
      const group = document.querySelector('[role="group"][aria-label="Insert"]');
      return group ? [...group.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')) : null;
    });
    check('laptop dock has an Insert group: Picture, Screenshot, Shapes, Symbol, Equation', insert && insert.join('|') === 'Insert Picture|Screenshot|Screenshot menu|Shapes|Symbol|Equation|Equation menu', JSON.stringify(insert));

    await clickTitle(page, 'Shapes (');
    const gallery = await page.evaluate(() => {
      const g = document.querySelector('[data-shape-gallery]');
      if (!g) return null;
      const r = g.getBoundingClientRect();
      return {
        sections: [...g.querySelectorAll('[data-shape-section] h4')].map((h) => h.innerText),
        items: g.querySelectorAll('[data-shape-item]').length,
        fits: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        iconsDrawn: [...g.querySelectorAll('[data-shape-item] svg path')].filter((p) => p.getAttribute('d')).length,
      };
    });
    check('the gallery shows the eight WPS categories in order', gallery && gallery.sections.join('|') === 'Lines|Rectangles|Basic Shapes|Block Arrows|Equation Shapes|Flowchart|Stars and Banners|Callouts', JSON.stringify(gallery && gallery.sections));
    check('with every shape (at least 150) and an icon for each', gallery && gallery.items >= 150 && gallery.iconsDrawn >= gallery.items, JSON.stringify(gallery && { items: gallery.items, icons: gallery.iconsDrawn }));
    check('the gallery fits on screen', gallery && gallery.fits);
    await shot(page, 'shapes-gallery-laptop');

    // Pick, then drag to draw
    await pickShape(page, 'roundRect');
    check('picking closes the gallery', !(await page.evaluate(() => Boolean(document.querySelector('[data-shape-gallery]')))));
    await drag(page, [400, 300], [600, 420]);
    let shapes = await savedShapes(page);
    check('dragging draws one shape', shapes.length === 1 && (await drawnShapes(page)) === 1, JSON.stringify(shapes.map((s) => s.preset)));
    const s0 = shapes[0];
    check('it is a rounded rectangle with the dragged box', s0 && s0.preset === 'roundRect' && near(s0.x, 400) && near(s0.y, 300) && near(s0.w, 200) && near(s0.h, 120), JSON.stringify(s0 && [s0.x, s0.y, s0.w, s0.h]));
    check("it has Word's default style: blue fill, darker outline", s0 && s0.fill.color === '#4472C4' && s0.line.color === '#2F528F');
    const d = await page.evaluate(() => document.querySelector('svg[data-shape-layer] path').getAttribute('d'));
    check('its corners are real arcs', /A/.test(d), d.slice(0, 60));
    let hs = await handles(page);
    const keys = hs.map((h) => h.key).sort().join(',');
    check('the new shape is selected with 8 resize handles, a rotate handle and a yellow handle', keys === 'adj-0,e,n,ne,nw,rotate,s,se,sw,w', keys);
    const lassoActive = await page.evaluate(() => document.querySelector('button[aria-label="Lasso Select"]').className.includes('bg-purple-500'));
    check('the tool goes back to Select, as in Word', lassoActive);
    const bar = await page.evaluate(() => Boolean(document.querySelector('[data-shape-format-bar]')));
    check('the format bar appears', bar);
    await shot(page, 'shapes-selected');

    // Move by the body
    await drag(page, [500, 360], [600, 410]);
    shapes = await savedShapes(page);
    check('dragging the body moves it', near(shapes[0].x, 500) && near(shapes[0].y, 350) && near(shapes[0].w, 200), JSON.stringify([shapes[0].x, shapes[0].y]));

    // Resize from the bottom-right handle
    let se = await handleAt(page, 'se');
    await drag(page, [se.x, se.y], [se.x + 60, se.y + 40]);
    shapes = await savedShapes(page);
    check('the se handle resizes, top-left fixed', near(shapes[0].w, 260) && near(shapes[0].h, 160) && near(shapes[0].x, 500) && near(shapes[0].y, 350), JSON.stringify([shapes[0].x, shapes[0].y, shapes[0].w, shapes[0].h]));

    // Adjust the corner radius
    const adj = await handleAt(page, 'adj-0');
    await drag(page, [adj.x, adj.y], [adj.x + 30, adj.y]);
    shapes = await savedShapes(page);
    check('the yellow handle changes the corner radius', shapes[0].adj && shapes[0].adj.adj > 16667, JSON.stringify(shapes[0].adj));

    // Rotate: pointer to the right of the centre
    const rot = await handleAt(page, 'rotate');
    const cx = 500 + 130;
    const cy = 350 + 80;
    await drag(page, [rot.x, rot.y], [cx + 200, cy]);
    shapes = await savedShapes(page);
    check('the rotate handle turns the shape (90° when pulled to the right)', near(shapes[0].rot, 90, 1), shapes[0].rot);
    hs = await handles(page);
    const seAfter = hs.find((h) => h.key === 'se');
    check('the handles turn with the shape', seAfter && seAfter.x < cx && seAfter.y > cy, JSON.stringify(seAfter));

    // Undo is one step per drag: rotation, then radius, then size
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await sleep(400);
    shapes = await savedShapes(page);
    check('Ctrl+Z undoes the whole rotation in one step', shapes[0].rot === 0 && shapes[0].adj && shapes[0].adj.adj > 16667, JSON.stringify([shapes[0].rot, shapes[0].adj]));
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('z');
    await page.keyboard.up('Shift');
    await page.keyboard.up('Control');
    await sleep(400);
    shapes = await savedShapes(page);
    check('Ctrl+Shift+Z redoes it', near(shapes[0].rot, 90, 1), shapes[0].rot);

    // Fill colour from the Office palette
    await page.mouse.click(cx, cy);
    await sleep(200);
    await clickTitle(page, 'Fill');
    const menu = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-menu="fill"]');
      if (!m) return null;
      return { theme: m.querySelectorAll('[data-color-picker] button[title]').length, hasNone: m.innerText.includes('No Fill'), hasMore: m.innerText.includes('More Colors') };
    });
    check('Fill opens the Office colour menu (No Fill, theme and standard colours, More Colors)', menu && menu.hasNone && menu.hasMore && menu.theme >= 70, JSON.stringify(menu));
    await page.evaluate(() => document.querySelector('[data-shape-menu="fill"] button[aria-label="Red"]').click());
    await sleep(300);
    shapes = await savedShapes(page);
    const fillOnScreen = await page.evaluate(() => document.querySelector('svg[data-shape-layer] path').getAttribute('fill'));
    check('picking Red fills the shape red', shapes[0].fill.color === '#FF0000' && fillOnScreen === '#FF0000', `${shapes[0].fill.color} ${fillOnScreen}`);
    await clickTitle(page, 'Outline');
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-menu="outline"] button')].find((b) => b.innerText.trim() === '3 pt').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('Outline > Weight 3 pt sets a 4 px outline', near(shapes[0].line.width, 4, 0.01), shapes[0].line.width);
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-menu="outline"] button')].find((b) => b.title === 'Dash').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('Outline > Dashes > Dash', shapes[0].line.dash === 'dash');
    await page.keyboard.press('Escape');

    // The pen writes over the shape and leaves it alone
    await clickTitle(page, 'Pen');
    const inkBefore = await inkPixels(page);
    await drawStroke(page, [[cx - 40, cy], [cx + 40, cy + 10]]);
    await sleep(300);
    shapes = await savedShapes(page);
    check('the pen draws on top of a shape', (await inkPixels(page)) > inkBefore);
    check('and the shape does not move or get selected', near(shapes[0].x, 500) && (await handles(page)).length === 0);

    // Select it again with the Select tool, then delete and undo
    await clickTitle(page, 'Lasso Select');
    await page.mouse.click(cx + 50, cy + 50);
    await sleep(200);
    check('a click with Select selects the shape', (await handles(page)).length === 10, (await handles(page)).length);
    await page.keyboard.press('Delete');
    await sleep(400);
    check('Delete removes it', (await savedShapes(page)).length === 0 && (await drawnShapes(page)) === 0);
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await sleep(400);
    check('and Ctrl+Z brings it back', (await savedShapes(page)).length === 1);

    // A line with an arrowhead: two end handles
    await clickTitle(page, 'Shapes (');
    await pickShape(page, 'line-arrow');
    await drag(page, [300, 600], [500, 560]);
    shapes = await savedShapes(page);
    const line = shapes[shapes.length - 1];
    hs = await handles(page);
    check('Line Arrow draws a connector with an arrow end', line.preset === 'straightConnector1' && line.line.tail.type === 'triangle', JSON.stringify(line.line));
    check('a line shows its two end handles', hs.map((h) => h.key).sort().join(',') === 'end,start', hs.map((h) => h.key).join(','));
    const end = await handleAt(page, 'end');
    await drag(page, [end.x, end.y], [end.x + 100, end.y + 100]);
    shapes = await savedShapes(page);
    const moved = shapes[shapes.length - 1];
    check('dragging the end handle moves only that end', near(moved.x, 300) && near(moved.x + moved.w, 600) && near(moved.y + moved.h, 660) && !moved.flipV, JSON.stringify([moved.x, moved.y, moved.w, moved.h, moved.flipH, moved.flipV]));

    // Tap to insert at the default size
    await clickTitle(page, 'Shapes (');
    await pickShape(page, 'ellipse');
    await page.mouse.click(900, 250);
    await sleep(300);
    shapes = await savedShapes(page);
    const oval = shapes[shapes.length - 1];
    check('a tap inserts the default size centred on the tap', oval.preset === 'ellipse' && near(oval.w, 120) && near(oval.x + oval.w / 2, 900), JSON.stringify([oval.x, oval.y, oval.w, oval.h]));
    const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('netz_playground_recent_shapes') || '[]'));
    check('used shapes are remembered for Recently Used Shapes', recent[0] === 'ellipse' && recent.includes('roundRect'), JSON.stringify(recent));

    // Saved and restored
    const count = (await savedShapes(page)).length;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas.touch-none');
    await sleep(2500);
    check('shapes come back after a reload', (await drawnShapes(page)) === count, `${await drawnShapes(page)} of ${count}`);
    await clickTitle(page, 'Shapes (');
    const recentShown = await page.evaluate(() => document.querySelector('[data-shape-section="recent"] h4')?.innerText);
    check('the gallery starts with Recently Used Shapes', recentShown === 'Recently Used Shapes', recentShown);
    await page.keyboard.press('Escape');
    await shot(page, 'shapes-after-reload');
  } catch (e) {
    check('laptop run finished', false, String((e && e.stack) || e).slice(0, 400));
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
    await sleep(200);
  };
  const tap = async (x, y) => {
    await touch('touchStart', [[x, y]]);
    await touch('touchEnd', []);
    await sleep(250);
  };
  try {
    await openPlayground(page);
    await clickTitle(page, 'More Tools');
    const row = await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="Insert "]')].map((b) => b.getAttribute('aria-label')));
    check('phone: More Tools starts with an Insert row (Picture, Screenshot, Shapes, Symbol, Equation)', row.join('|') === 'Insert Picture|Insert Screenshot|Insert Shapes|Insert Symbol|Insert Equation', JSON.stringify(row));
    await page.evaluate(() => document.querySelector('button[aria-label="Insert Shapes"]').click());
    await sleep(300);
    const sheet = await page.evaluate(() => {
      const g = document.querySelector('[data-shape-gallery]');
      if (!g) return null;
      const r = g.getBoundingClientRect();
      const items = [...g.querySelectorAll('[data-shape-item]')].map((b) => b.getBoundingClientRect());
      const targets = [...g.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
      return {
        fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0,
        width: Math.round(r.width),
        bottom: Math.round(innerHeight - r.bottom),
        smallest: Math.round(Math.min(...items.map((i) => Math.min(i.width, i.height)), ...targets.map((t) => Math.min(t.width, t.height)))),
      };
    });
    check('phone: the gallery is a full-width bottom sheet that fits the screen', sheet && sheet.fits && sheet.width === 390 && sheet.bottom === 0, JSON.stringify(sheet));
    check('phone: every shape button is at least 44 px', sheet && sheet.smallest >= 44, sheet && sheet.smallest);
    const galleryOnTop = await page.evaluate(() => {
      const g = document.querySelector('[data-shape-gallery]');
      const covering = [[60, innerHeight - 40], [300, innerHeight - 140], [195, innerHeight / 2]].map(([x, y]) => document.elementFromPoint(x, y)).filter((el) => !g.contains(el));
      return covering.map((el) => `${el.tagName}.${String(el.className).slice(0, 80)} "${(el.innerText || '').slice(0, 60)}"`);
    });
    check('phone: nothing (dock, music player) covers the gallery sheet', galleryOnTop.length === 0, galleryOnTop.join(' | '));
    await shot(page, 'shapes-gallery-phone');
    await page.evaluate(() => document.querySelector('[data-shape-item="rect"]').click());
    await sleep(250);

    await fingerDrag([100, 250], [280, 380]);
    let shapes = await savedShapes(page);
    check('phone: a finger drag draws the shape', shapes.length === 1 && near(shapes[0].w, 180, 2) && near(shapes[0].h, 130, 2), JSON.stringify(shapes.map((s) => [s.x, s.y, s.w, s.h])));
    const hs = await handles(page);
    // A rectangle has no yellow handle: 8 resize handles and the rotate handle
    check('phone: handles take a 44 px touch', hs.length === 9 && hs.every((h) => h.size >= 44), JSON.stringify(hs.map((h) => h.size)));
    const se = hs.find((h) => h.key === 'se');
    await fingerDrag([se.x, se.y], [se.x + 40, se.y + 50]);
    shapes = await savedShapes(page);
    check('phone: a finger on the corner handle resizes', near(shapes[0].w, 220, 2) && near(shapes[0].h, 180, 2), JSON.stringify([shapes[0].w, shapes[0].h]));
    // Pull the rotate handle to the right of the shape's centre: a quarter turn
    const now = await handles(page);
    const nw = now.find((h) => h.key === 'nw');
    const seNow = now.find((h) => h.key === 'se');
    const rot = now.find((h) => h.key === 'rotate');
    const centre = [(nw.x + seNow.x) / 2, (nw.y + seNow.y) / 2];
    await fingerDrag([rot.x, rot.y], [Math.min(385, centre[0] + 150), centre[1]]);
    shapes = await savedShapes(page);
    check('phone: a finger turns the shape with the rotate handle (snapping to 90°)', shapes[0].rot === 90, shapes[0].rot);
    await shot(page, 'shapes-phone-selected');

    // The format bar fits, and its colour menu is a bottom sheet with 44 px swatches
    const barFits = await page.evaluate(() => {
      const r = document.querySelector('[data-shape-format-bar] > div').getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
    });
    check('phone: the format bar is on screen', barFits);
    await clickTitle(page, 'Fill');
    const fillSheet = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-menu="fill"]');
      const r = m.getBoundingClientRect();
      const sw = [...m.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
      return { fits: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0, smallest: Math.round(Math.min(...sw.map((s) => Math.min(s.width, s.height)))), bottom: Math.round(innerHeight - r.bottom) };
    });
    check('phone: the colour menu is a bottom sheet where every button is at least 44 px', fillSheet.fits && fillSheet.bottom <= 1 && fillSheet.smallest >= 44, JSON.stringify(fillSheet));
    const fillOnTop = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-menu="fill"]');
      const covering = [[60, innerHeight - 40], [300, innerHeight - 140]].map(([x, y]) => document.elementFromPoint(x, y)).filter((el) => !m.contains(el));
      return covering.map((el) => `${el.tagName}.${String(el.className).slice(0, 80)} "${(el.innerText || '').slice(0, 60)}"`);
    });
    check('phone: nothing (dock, music player) covers the colour sheet', fillOnTop.length === 0, fillOnTop.join(' | '));
    await shot(page, 'shapes-phone-fill');
    await page.evaluate(() => document.querySelector('[data-shape-menu="fill"] button[aria-label="Green"]').click());
    await sleep(300);
    shapes = await savedShapes(page);
    check('phone: tapping a colour fills the shape', shapes[0].fill.color === '#00B050', shapes[0].fill.color);

    // A finger on empty page with Select deselects; a finger with the pen draws over the shape
    await page.evaluate(() => document.querySelector('[data-shape-menu="fill"] button[aria-label="Close"]').click());
    await tap(60, 560); // empty page, clear of the music player and the dock
    check('phone: a tap on empty page lets the shape go', (await handles(page)).length === 0);
    await clickTitle(page, 'Pen');
    const inkBefore = await inkPixels(page);
    await fingerDrag([150, 300], [250, 320]);
    check('phone: a finger writes over the shape with the pen', (await inkPixels(page)) > inkBefore && (await handles(page)).length === 0);
  } catch (e) {
    check('phone run finished', false, String((e && e.stack) || e).slice(0, 400));
  }
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── Tablet: the Insert group is one menu ─────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 820, height: 1180, deviceScaleFactor: 2 });
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, hasTouch: true });
  try {
    await openPlayground(page);
    await clickTitle(page, 'Insert (');
    const items = await page.evaluate(() => [...document.querySelectorAll('[role="menu"][aria-label="Insert"] [role="menuitem"]')].map((b) => b.innerText.trim().split(/\n/).pop()));
    check('tablet: Insert opens a menu with Picture, Screenshot, Shapes, Symbol and Equation', items.join('|') === 'Picture|Screenshot|Shapes|Symbol|Equation', JSON.stringify(items));
    await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"]')].find((b) => b.innerText.trim() === 'Shapes').click());
    await sleep(300);
    const open = await page.evaluate(() => {
      const g = document.querySelector('[data-shape-gallery]');
      const r = g && g.getBoundingClientRect();
      return g ? r.left >= 0 && r.right <= innerWidth && r.top >= 0 : false;
    });
    check('tablet: Shapes opens the gallery on screen', open);
  } catch (e) {
    check('tablet run finished', false, String((e && e.stack) || e).slice(0, 400));
  }
  check('tablet: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : `  -> ${r.detail}`}`);
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
