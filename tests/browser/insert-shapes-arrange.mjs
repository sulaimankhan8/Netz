import { launch, openPlayground, sleep, clickTitle, shot } from './lib.mjs';

// Arranging shapes in the real app (plan step 6): smart guides, select several (Shift+click,
// a lasso around them), Align and Distribute, Group (Ctrl+G) moving / resizing / rotating as
// one, Ungroup, Change Shape, connectors that stay attached, Convert to Shape, Tab; then the
// phone with a finger.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const session = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  const p = (s.pages && s.pages[s.currentPageIndex || 0]) || {};
  return { shapes: p.shapes || [], strokes: p.strokes || [] };
});
const savedShapes = async (page) => (await session(page)).shapes;
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
const drag = async (page, from, to, steps = 8, { hold = false } = {}) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps);
  if (hold) return;
  await page.mouse.up();
  await sleep(250);
};
const loop = async (page, box, pad = 24) => {
  const pts = [[box.left - pad, box.top - pad], [box.right + pad, box.top - pad], [box.right + pad, box.bottom + pad], [box.left - pad, box.bottom + pad], [box.left - pad, box.top - pad + 4]];
  await page.mouse.move(pts[0][0], pts[0][1]);
  await page.mouse.down();
  for (const [x, y] of pts.slice(1)) await page.mouse.move(x, y, { steps: 10 });
  await page.mouse.up();
  await sleep(300);
};
// Where a shape is on screen
const rectOf = (page, id) => page.evaluate((i) => {
  const r = document.querySelector(`[data-shape-id="${i}"]`).getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2 };
}, id);
const selectedIds = (page) => page.evaluate(() => [...document.querySelectorAll('[data-shape-body]')].map((b) => b.getAttribute('data-shape-body')));
const handleAt = (page, key) => page.evaluate((k) => {
  const el = document.querySelector(`[data-shape-handle="${k}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
}, key);
const menuButton = async (page, menu, text) => {
  const ok = await page.evaluate(({ menu, text }) => {
    const root = document.querySelector(`[data-shape-menu="${menu}"]`);
    const el = root && [...root.querySelectorAll('button')].find((b) => b.innerText.trim().startsWith(text));
    if (el && !el.disabled) el.click();
    return Boolean(el && !el.disabled);
  }, { menu, text });
  await sleep(250);
  return ok;
};
const key = async (page, combo) => {
  const parts = combo.split('+');
  const last = parts.pop();
  for (const p of parts) await page.keyboard.down(p);
  await page.keyboard.press(last);
  for (const p of parts.reverse()) await page.keyboard.up(p);
  await sleep(300);
};
const near = (a, b, tol = 0.6) => Math.abs(a - b) <= tol;
const by = (list) => Object.fromEntries(list.map((s) => [s.id, s]));

// ── Laptop, mouse ────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  try {
    await openPlayground(page);
    await pickShape(page, 'rect');
    await drag(page, [300, 200], [400, 260]);
    await pickShape(page, 'rect');
    await drag(page, [500, 300], [560, 380]);
    await pickShape(page, 'rect');
    await drag(page, [700, 230], [820, 260]);
    const [A, B, C] = (await savedShapes(page)).map((s) => s.id);

    // Smart guides: B's left edge brought within a few px of A's snaps to it, with a guide line
    await page.mouse.click(530, 340);
    await sleep(200);
    await drag(page, [530, 340], [333, 380], 10, { hold: true });
    const guide = await page.evaluate(() => [...document.querySelectorAll('[data-smart-guide]')].map((g) => g.getAttribute('data-smart-guide')));
    await page.mouse.up();
    await sleep(300);
    let s = by(await savedShapes(page));
    check('moving a shape near another\'s edge shows a smart guide', guide.includes('x'), JSON.stringify(guide));
    check('and snaps to it on release', near(s[B].x, s[A].x, 1e-6), `${s[B].x} vs ${s[A].x}`);
    // Alt moves freely
    const bAt = await rectOf(page, B);
    await page.keyboard.down('Alt');
    await drag(page, [bAt.cx, bAt.cy], [bAt.cx + 3, bAt.cy]);
    await page.keyboard.up('Alt');
    s = by(await savedShapes(page));
    check('holding Alt moves without snapping', near(s[B].x - s[A].x, 3, 0.01), s[B].x - s[A].x);

    // Several shapes: Shift+click
    await page.mouse.click((await rectOf(page, A)).cx, (await rectOf(page, A)).cy);
    await sleep(150);
    await page.keyboard.down('Shift');
    for (const id of [B, C]) {
      const r = await rectOf(page, id);
      await page.mouse.click(r.cx, r.cy);
      await sleep(150);
    }
    await page.keyboard.up('Shift');
    await sleep(200);
    const many = await page.evaluate(() => ({ frame: document.querySelector('[data-selection-frame]')?.getAttribute('data-selection-frame'), handles: document.querySelectorAll('[data-shape-handle^="all-"]').length }));
    check('Shift+click selects several: one frame around them, 8 handles and a rotate handle', (await selectedIds(page)).length === 3 && many.frame === 'many' && many.handles === 9, JSON.stringify(many));

    // Align and Distribute
    await clickTitle(page, 'Arrange');
    const arrange = await page.evaluate(() => [...document.querySelectorAll('[data-shape-menu="arrange"] button')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean));
    check('the Arrange menu: order, Group, Change Shape, Align (6), Distribute (2), Rotate', ['Bring to Front', 'Group Ctrl+G', 'Ungroup Ctrl+Shift+G', 'Change Shape...', 'Align Left', 'Align Center', 'Align Right', 'Align Top', 'Align Middle', 'Align Bottom', 'Distribute Horizontally', 'Distribute Vertically', 'Rotate Right 90°', 'Flip Horizontal'].every((t) => arrange.includes(t)), JSON.stringify(arrange));
    const fits = await page.evaluate(() => { const r = document.querySelector('[data-shape-menu="arrange"]').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), ok: r.top >= 0 && r.bottom <= innerHeight }; });
    check('the Arrange menu fits on the screen (it scrolls when there is not room for all of it)', fits.ok, JSON.stringify(fits));
    await shot(page, 'arrange-menu-laptop');
    await menuButton(page, 'arrange', 'Align Top');
    s = by(await savedShapes(page));
    check('Align Top: every top edge at the highest one', near(s[A].y, s[B].y, 1e-6) && near(s[B].y, s[C].y, 1e-6), JSON.stringify([s[A].y, s[B].y, s[C].y]));
    await menuButton(page, 'arrange', 'Distribute Horizontally');
    s = by(await savedShapes(page));
    const sorted = [s[A], s[B], s[C]].sort((p, q) => p.x - q.x);
    const gap1 = sorted[1].x - (sorted[0].x + sorted[0].w);
    const gap2 = sorted[2].x - (sorted[1].x + sorted[1].w);
    check('Distribute Horizontally: equal gaps between them', near(gap1, gap2, 1e-6), `${gap1} ${gap2}`);
    await page.keyboard.press('Escape'); // closes the menu, keeps the selection
    await sleep(200);

    // Group
    await key(page, 'Control+g');
    s = by(await savedShapes(page));
    const gid = s[A].groupId;
    check('Ctrl+G groups them', gid && s[B].groupId === gid && s[C].groupId === gid);
    check('a group shows as one dashed frame', (await page.evaluate(() => document.querySelector('[data-selection-frame]')?.getAttribute('data-selection-frame'))) === 'group');
    await page.mouse.click(1000, 600);
    await sleep(200);
    const bNow = await rectOf(page, B);
    await page.mouse.click(bNow.cx, bNow.cy);
    await sleep(250);
    check('clicking one member selects the whole group', (await selectedIds(page)).length === 3);
    const before = by(await savedShapes(page));
    await drag(page, [bNow.cx, bNow.cy], [bNow.cx + 40, bNow.cy + 30]);
    s = by(await savedShapes(page));
    check('a group moves as one', [A, B, C].every((id) => near(s[id].x - before[id].x, 40, 0.01) && near(s[id].y - before[id].y, 30, 0.01)), JSON.stringify([A, B, C].map((id) => [s[id].x - before[id].x, s[id].y - before[id].y])));

    // Resize the group from its corner: every member scales
    const se = await handleAt(page, 'all-se');
    const widthBefore = { ...s };
    await drag(page, se, [se[0] + 100, se[1] + 40]);
    s = by(await savedShapes(page));
    const ratio = s[A].w / widthBefore[A].w;
    check('the group\'s corner handle resizes every member by the same amount', ratio > 1.05 && near(s[B].w / widthBefore[B].w, ratio, 0.01) && near(s[C].w / widthBefore[C].w, ratio, 0.01), JSON.stringify([ratio, s[B].w / widthBefore[B].w]));

    // Rotate the group: every member turns by the same angle; one undo step puts it back
    const rotAt = await handleAt(page, 'all-rotate');
    const frame = await page.evaluate(() => { const r = document.querySelector('[data-selection-frame]').getBoundingClientRect(); return { cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2, right: r.right }; });
    await drag(page, rotAt, [frame.right + 80, frame.cy], 12);
    s = by(await savedShapes(page));
    check('the group\'s rotate handle turns every member by the same angle', s[A].rot > 60 && s[A].rot < 120 && near(s[B].rot, s[A].rot, 0.11) && near(s[C].rot, s[A].rot, 0.11), JSON.stringify([s[A].rot, s[B].rot, s[C].rot]));
    await key(page, 'Control+z');
    s = by(await savedShapes(page));
    check('and Ctrl+Z undoes the whole turn in one step', [A, B, C].every((id) => (s[id].rot || 0) === 0), JSON.stringify([A, B, C].map((id) => s[id].rot)));

    // Ungroup
    await key(page, 'Control+Shift+G');
    s = by(await savedShapes(page));
    check('Ctrl+Shift+G ungroups', [A, B, C].every((id) => !s[id].groupId));

    // Change Shape (right-click menu)
    await page.mouse.click(1000, 600);
    await sleep(200);
    const aBox = await rectOf(page, A);
    await page.mouse.click(aBox.cx, aBox.cy, { button: 'right' });
    await sleep(300);
    const changeItem = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-shape-context-menu] button')].find((x) => x.innerText.includes('Change Shape')); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + 20, (r.top + r.bottom) / 2]; });
    if (!changeItem) throw new Error('Change Shape not in the shape menu');
    await page.mouse.click(changeItem[0], changeItem[1]);
    await sleep(300);
    const gallery = await page.evaluate(() => {
      const g = document.querySelector('[data-shape-gallery="change"]');
      return g && { lines: Boolean(g.querySelector('[data-shape-item="line"]')), textbox: Boolean(g.querySelector('[data-shape-item="textbox"]')), ellipse: Boolean(g.querySelector('[data-shape-item="ellipse"]')) };
    });
    check('Change Shape opens the gallery without lines or the text box', gallery && !gallery.lines && !gallery.textbox && gallery.ellipse, JSON.stringify(gallery));
    const was = by(await savedShapes(page))[A];
    await page.evaluate(() => document.querySelector('[data-shape-gallery="change"] [data-shape-item="ellipse"]').click());
    await sleep(400);
    s = by(await savedShapes(page));
    check('picking one changes the shape, keeping its place, size and look', s[A].preset === 'ellipse' && s[A].x === was.x && s[A].w === was.w && s[A].fill.color === was.fill.color && !(await page.evaluate(() => Boolean(document.querySelector('[data-shape-gallery="change"]')))), JSON.stringify(s[A].preset));

    // A connector from A's right to B's left attaches to both, and follows B when it moves
    let ra = await rectOf(page, A);
    let rb = await rectOf(page, B);
    await pickShape(page, 'line-arrow');
    await drag(page, [ra.right - 1, ra.cy], [rb.left + 1, rb.cy], 10);
    let list = await savedShapes(page);
    const line = list[list.length - 1];
    check('a connector drawn from shape to shape attaches to both', line.conn && line.conn.start && line.conn.start.id === A && line.conn.end && line.conn.end.id === B, JSON.stringify(line.conn));
    await page.mouse.click(1000, 600);
    await sleep(200);
    rb = await rectOf(page, B);
    const beforeMove = (await savedShapes(page)).map((x) => ({ id: x.id === B ? 'B' : x.id === line.id ? 'line' : x.id === A ? 'A' : 'C', x: Math.round(x.x), y: Math.round(x.y), w: Math.round(x.w), h: Math.round(x.h), rot: x.rot }));
    const selBefore = await selectedIds(page);
    await page.keyboard.down('Alt'); // no snapping: a plain move
    // Pressed near B's top: the connector, drawn on top, crosses B's middle
    await drag(page, [rb.cx, rb.top + 8], [rb.cx, rb.top + 98]);
    await page.keyboard.up('Alt');
    list = await savedShapes(page);
    const afterMove = list.map((x) => ({ id: x.id === B ? 'B' : x.id === line.id ? 'line' : x.id === A ? 'A' : 'C', x: Math.round(x.x), y: Math.round(x.y), w: Math.round(x.w), h: Math.round(x.h) }));
    s = by(list);
    const conn = list.find((x) => x.id === line.id);
    const end = { x: conn.flipH ? conn.x : conn.x + conn.w, y: conn.flipV ? conn.y : conn.y + conn.h };
    check('moving the shape moves the attached end with it', near(end.x, s[B].x, 0.01) && near(end.y, s[B].y + s[B].h / 2, 0.01) && conn.conn.end.id === B, JSON.stringify({ end, b: [s[B].x, s[B].y + s[B].h / 2], rb, selBefore, beforeMove, afterMove }));

    // Dragging the connector's end to C: connection points show; it attaches there
    await page.mouse.click(1000, 600);
    await sleep(150);
    const mid = await page.evaluate((id) => { const r = document.querySelector(`[data-shape-id="${id}"]`).getBoundingClientRect(); return [(r.left + r.right) / 2, (r.top + r.bottom) / 2]; }, line.id);
    // The line's own middle (not a shape under it) selects the line
    await page.mouse.click(mid[0], mid[1]);
    await sleep(250);
    const endHandle = await handleAt(page, `${line.id}-end`);
    const rc = await rectOf(page, C);
    await drag(page, endHandle, [rc.left + 2, rc.cy], 12, { hold: true });
    const points = await page.evaluate(() => [...document.querySelectorAll('[data-connection-point]')].map((p) => p.getAttribute('data-connection-point')));
    await page.mouse.up();
    await sleep(300);
    list = await savedShapes(page);
    check('dragging a connector end shows the connection points nearby, one marked as attached', points.length >= 4 && points.includes('attached'), JSON.stringify(points));
    check('and it attaches to the shape it is let go on', list.find((x) => x.id === line.id).conn.end.id === C, JSON.stringify(list.find((x) => x.id === line.id).conn));

    // A lasso around shapes selects them
    await page.mouse.click(1000, 600);
    await sleep(150);
    rb = await rectOf(page, B);
    await loop(page, rb, 30);
    const lassoed = await selectedIds(page);
    check('a lasso drawn around a shape selects it', lassoed.length === 1 && lassoed[0] === B, JSON.stringify(lassoed));

    // Tab moves to the next shape
    await page.keyboard.press('Tab');
    await sleep(200);
    const tabbed = await selectedIds(page);
    check('Tab selects the next shape', tabbed.length >= 1 && !tabbed.includes(B), JSON.stringify(tabbed));

    // Convert to Shape: a rough rectangle drawn freehand snaps; selected with the lasso, it becomes a shape
    await page.mouse.click(1000, 600);
    await sleep(150);
    await page.keyboard.press('s');
    await sleep(200);
    await page.mouse.move(300, 520);
    await page.mouse.down();
    for (const [x, y] of [[460, 522], [462, 640], [302, 642], [300, 524]]) await page.mouse.move(x, y, { steps: 14 });
    await page.mouse.up();
    await sleep(500);
    let sess = await session(page);
    const snapped = sess.strokes.find((st) => st.shape);
    check('freehand: the rough rectangle snaps', snapped && snapped.shape === 'rectangle', snapped && snapped.shape);
    await clickTitle(page, 'Lasso Select');
    await loop(page, { left: 300, top: 520, right: 462, bottom: 642 }, 20);
    await sleep(300);
    const shapesBefore = sess.shapes.length;
    const strokesBefore = sess.strokes.length;
    const convert = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Convert to Shape"]'); if (b) b.click(); return Boolean(b); });
    await sleep(600);
    sess = await session(page);
    const made = sess.shapes[sess.shapes.length - 1];
    check('the ink toolbar offers Convert to Shape for snapped ink', convert);
    check('Convert to Shape: the ink becomes a rectangle shape with the ink\'s colour, selected', sess.shapes.length === shapesBefore + 1 && sess.strokes.length === strokesBefore - 1 && made.preset === 'rect' && made.line.color === snapped.color && (await selectedIds(page)).includes(made.id), JSON.stringify({ shapes: sess.shapes.length, strokes: sess.strokes.length, preset: made && made.preset }));
    await key(page, 'Control+z');
    sess = await session(page);
    check('one Ctrl+Z gives the ink back', sess.shapes.length === shapesBefore && sess.strokes.length === strokesBefore, JSON.stringify({ shapes: sess.shapes.length, strokes: sess.strokes.length }));
    await shot(page, 'arrange-laptop');
  } catch (e) {
    check('laptop run finished', false, String((e && e.stack) || e).slice(0, 600));
  }
  check('laptop: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── Phone, finger ────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const client = await page.createCDPSession();
  const touch = async (points, steps = 8) => {
    const tp = ([x, y]) => [{ x, y, id: 1, radiusX: 18, radiusY: 18, force: 0.5 }];
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(points[0]) });
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      for (let k = 1; k <= steps; k++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp([x0 + ((x1 - x0) * k) / steps, y0 + ((y1 - y0) * k) / steps]) });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(300);
  };
  const tapSel = async (selector) => {
    const at = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, selector);
    if (!at) throw new Error('nothing to tap: ' + selector);
    await page.touchscreen.tap(at[0], at[1]);
    await sleep(350);
  };
  try {
    await openPlayground(page);
    for (const [x, y] of [[110, 260], [250, 470]]) {
      await clickTitle(page, 'More Tools');
      await tapSel('button[aria-label="Insert Shapes"]');
      await tapSel('[data-shape-item="rect"]');
      await page.touchscreen.tap(x, y);
      await sleep(400);
    }
    const [P, Q] = (await savedShapes(page)).map((s) => s.id);
    const rp = await rectOf(page, P);
    const rq = await rectOf(page, Q);
    const box = { left: Math.min(rp.left, rq.left) - 20, top: Math.min(rp.top, rq.top) - 20, right: Math.max(rp.right, rq.right) + 20, bottom: Math.max(rp.bottom, rq.bottom) + 20 };
    await page.touchscreen.tap(370, 700); // let go of the new shape (an empty spot, clear of its format bar)
    await sleep(200);
    await touch([[box.left, box.top], [box.right, box.top], [box.right, box.bottom], [box.left, box.bottom], [box.left, box.top + 6]]);
    const sel = await selectedIds(page);
    const hit = await page.evaluate(() => [...document.querySelectorAll('[data-shape-handle^="all-"] circle[fill="transparent"]')].map((c) => Math.round(c.getBoundingClientRect().width)));
    check('phone: a lasso drawn with a finger round two shapes selects both', sel.length === 2, JSON.stringify(sel));
    check('phone: the selection\'s handles take a 44 px touch', hit.length >= 5 && hit.every((w) => w >= 44), JSON.stringify(hit));
    await clickTitle(page, 'More');
    const sheet = await page.evaluate(() => {
      const m = document.querySelector('[data-shape-menu="more"]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      const small = [...m.querySelectorAll('[data-arrange-menu] button')].filter((b) => b.getBoundingClientRect().height < 44).length;
      return { fits: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, small, align: Boolean([...m.querySelectorAll('button')].find((b) => b.innerText.includes('Align Left'))) };
    });
    check('phone: More has Arrange with Align and Group, a sheet that fits, 44 px buttons', sheet && sheet.fits && sheet.align && sheet.small === 0, JSON.stringify(sheet));
    await shot(page, 'arrange-phone');
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-menu="more"] button')].find((b) => b.innerText.includes('Align Left')).click());
    await sleep(300);
    let s = by(await savedShapes(page));
    check('phone: Align Left lines them up', near(s[P].x, s[Q].x, 1e-6), `${s[P].x} ${s[Q].x}`);
    await page.evaluate(() => [...document.querySelectorAll('[data-shape-menu="more"] button')].find((b) => b.innerText.trim().startsWith('Group')).click());
    await sleep(300);
    s = by(await savedShapes(page));
    check('phone: Group from the sheet', s[P].groupId && s[P].groupId === s[Q].groupId);
  } catch (e) {
    check('phone run finished', false, String((e && e.stack) || e).slice(0, 600));
  }
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : `  -> ${r.detail}`}`);
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
