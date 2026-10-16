import fs from 'fs';
import path from 'path';
import { launch, openPlayground, sleep, clickTitle, drawStroke, shot, SHOTS } from './lib.mjs';

// Insert > Screenshot in the real app (plan step 5): the WPS menu, a screen capture (through a
// stand-in screen, so the run does not depend on the machine), Hide Current Window's countdown,
// the shortcuts, the region editor in all four shapes with mouse and touch, mark-up, Finish;
// Screen Grab Main Window (the Playground view); on a phone (no screen capture): the view,
// From Photos and Paste. Last, a real screen capture is tried with Chrome's auto-accept flags.
const results = [];
const notes = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

// The screen the stand-in shares: left half red, right half blue, 1600 × 900
const FAKE_SCREEN = `
  navigator.mediaDevices.getDisplayMedia = async function () {
    window.__displayMediaCalls = (window.__displayMediaCalls || 0) + 1;
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 900;
    const x = c.getContext('2d');
    const paint = () => { x.fillStyle = '#FF0000'; x.fillRect(0, 0, 800, 900); x.fillStyle = '#0000FF'; x.fillRect(800, 0, 800, 900); };
    paint();
    const stream = c.captureStream(10);
    setInterval(paint, 50);
    window.__lastStream = stream;
    return stream;
  };`;
const NO_SCREEN_CAPTURE = 'try { delete MediaDevices.prototype.getDisplayMedia; } catch (e) {}';

const savedBlocks = (page) => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return (s.pages && s.pages[s.currentPageIndex || 0] && s.pages[s.currentPageIndex || 0].blocks) || [];
});
const editorOpen = (page) => page.evaluate(() => Boolean(document.querySelector('[data-screenshot-editor]')));
const item = (page, id) => page.evaluate((i) => {
  const el = document.querySelector(`[data-screenshot-item="${i}"]`);
  if (el) el.click();
  return Boolean(el);
}, id);
const toolbarButton = (page, label) => page.evaluate((l) => {
  const el = document.querySelector(`[data-screenshot-toolbar] button[aria-label="${l}"]`);
  if (el && !el.disabled) el.click();
  return Boolean(el && !el.disabled);
}, label);
// Where a picture pixel is on screen in the editor
const pictureToScreen = (page, px, py) => page.evaluate(([x, y]) => {
  const img = document.querySelector('[data-screenshot-editor] img');
  const r = img.getBoundingClientRect();
  return [r.left + (x / img.naturalWidth) * r.width, r.top + (y / img.naturalHeight) * r.height];
}, [px, py]);
// Alpha and colour of a pixel of the last picture block's stored image
const imagePixel = (page, fx, fy) => page.evaluate(async ([x, y]) => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  const blocks = s.pages[s.currentPageIndex || 0].blocks.filter((b) => b.type === 'image');
  const url = blocks[blocks.length - 1].content.imageUrl;
  const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = url; });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(Math.min(c.width - 1, Math.floor(x * c.width)), Math.min(c.height - 1, Math.floor(y * c.height)), 1, 1).data;
  return { rgba: [...d], width: c.width, height: c.height };
}, [fx, fy]);

// ── Laptop, mouse ────────────────────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  await page.evaluateOnNewDocument(FAKE_SCREEN);
  try {
    await openPlayground(page);
    const group = await page.evaluate(() => [...document.querySelector('[role="group"][aria-label="Insert"]').querySelectorAll('button')].map((b) => b.getAttribute('aria-label')));
    check('Insert group in WPS order: Picture, Screenshot, Shapes, Symbol, Equation', group.join('|') === 'Insert Picture|Screenshot|Screenshot menu|Shapes|Symbol|Equation|Equation menu', JSON.stringify(group));

    await clickTitle(page, 'Screenshot menu');
    const menu = await page.evaluate(() => [...document.querySelectorAll('[data-screenshot-menu] [data-screenshot-item]')].map((b) => ({ id: b.getAttribute('data-screenshot-item'), text: b.innerText.replace(/\s+/g, ' ').trim(), checked: b.getAttribute('aria-checked') })));
    check('the menu has WPS\'s items in WPS\'s order', menu.map((m) => m.text).join('|') === 'Rectangle Screenshot|Oval Screenshot|Rounded rectangle screenshot|Polygon screenshot|Screenshot Ctrl+Alt+X|Hide Current Window During Screenshot Ctrl+Alt+C|Screen Grab Main Window', JSON.stringify(menu.map((m) => m.text)));
    check('Screenshot is ticked by default', menu.find((m) => m.id === 'screenshot').checked === 'true' && menu.find((m) => m.id === 'hide').checked === 'false');
    await shot(page, 'screenshot-menu-laptop');

    // The Screenshot button: the browser asks what to share, one frame is taken, sharing stops
    await page.keyboard.press('Escape');
    await sleep(150);
    await clickTitle(page, 'Screenshot (Ctrl+Alt+X)');
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 10000 });
    const frame = await page.evaluate(() => ({
      calls: window.__displayMediaCalls,
      stopped: window.__lastStream.getTracks().every((t) => t.readyState === 'ended'),
      size: [document.querySelector('[data-screenshot-editor] img').naturalWidth, document.querySelector('[data-screenshot-editor] img').naturalHeight],
      hint: document.querySelector('[data-screenshot-hint]')?.innerText,
    }));
    check('the Screenshot button captures one frame and stops sharing at once', frame.calls === 1 && frame.stopped, JSON.stringify(frame));
    check('the frame opens full size in the editor, waiting for a region', frame.size.join('x') === '1600x900' && /Drag/.test(frame.hint || ''), JSON.stringify(frame));

    // Rectangle across the red / blue edge: 600..1000 x 300..600 in picture pixels
    let [x0, y0] = await pictureToScreen(page, 600, 300);
    let [x1, y1] = await pictureToScreen(page, 1000, 600);
    await drawStroke(page, [[x0, y0], [x1, y1]], { steps: 8 });
    await sleep(200);
    const region = await page.evaluate(() => ({ size: document.querySelector('[data-screenshot-size]')?.innerText, handles: document.querySelectorAll('[data-region-handle]').length }));
    check('dragging chooses a region; its size shows in picture pixels; 8 handles', /^(399|400|401) × (299|300|301)$/.test(region.size || '') && region.handles === 8, JSON.stringify(region));

    // Resize from the right handle to 1100
    const east = await page.evaluate(() => { const r = document.querySelector('[data-region-handle="e"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const [ex] = await pictureToScreen(page, 1100, 450);
    await drawStroke(page, [east, [ex, east[1]]], { steps: 6 });
    await sleep(150);
    check('the right handle resizes, the left side staying put', /^(499|500|501) × /.test(await page.evaluate(() => document.querySelector('[data-screenshot-size]').innerText)), await page.evaluate(() => document.querySelector('[data-screenshot-size]').innerText));

    const barOnScreen = await page.evaluate(() => { const r = document.querySelector('[data-screenshot-toolbar]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; });
    check('the editor bar sits under the region, inside the screen', barOnScreen);

    // Mark-up: a rectangle, then Undo
    await toolbarButton(page, 'Rectangle');
    [x0, y0] = await pictureToScreen(page, 650, 350);
    [x1, y1] = await pictureToScreen(page, 750, 450);
    await drawStroke(page, [[x0, y0], [x1, y1]], { steps: 5 });
    await sleep(150);
    const marked = await page.evaluate(() => document.querySelectorAll('[data-screenshot-editor] svg rect[stroke="#FF0000"]').length);
    await toolbarButton(page, 'Undo (Ctrl+Z)');
    await sleep(150);
    const unmarked = await page.evaluate(() => document.querySelectorAll('[data-screenshot-editor] svg rect[stroke="#FF0000"]').length);
    check('a mark-up rectangle is drawn, and Undo takes it away', marked === 1 && unmarked === 0, `${marked} then ${unmarked}`);
    await toolbarButton(page, 'Rectangle'); // off again
    await shot(page, 'screenshot-editor-laptop');

    // Ctrl+Z inside the editor does not undo the page
    const before = (await savedBlocks(page)).length;
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    await sleep(200);
    check('keys go to the editor, not the page underneath', (await editorOpen(page)) && (await savedBlocks(page)).length === before);

    await toolbarButton(page, 'Finish');
    await sleep(800);
    let blocks = await savedBlocks(page);
    const pic = blocks[blocks.length - 1];
    check('Finish puts the region on the page as a picture', !(await editorOpen(page)) && pic && pic.type === 'image' && Math.abs(pic.content.aspectRatio - 500 / 300) < 0.02, JSON.stringify(pic && { type: pic.type, ar: pic.content.aspectRatio }));
    const left = await imagePixel(page, 0.1, 0.5);
    const right = await imagePixel(page, 0.9, 0.5);
    check('the picture is the chosen part of the screen (red left of the edge, blue right)', left.rgba[0] > 200 && left.rgba[2] < 50 && right.rgba[2] > 200 && right.rgba[0] < 50, JSON.stringify([left, right]));

    // Oval: transparent outside the ellipse
    await clickTitle(page, 'Screenshot menu');
    await item(page, 'oval');
    await page.waitForSelector('[data-screenshot-editor]');
    [x0, y0] = await pictureToScreen(page, 200, 200);
    [x1, y1] = await pictureToScreen(page, 600, 500);
    await drawStroke(page, [[x0, y0], [x1, y1]], { steps: 8 });
    await sleep(150);
    check('Oval Screenshot draws an oval region', await page.evaluate(() => /A/.test(document.querySelector('[data-screenshot-region]')?.getAttribute('d') || '')));
    await page.keyboard.press('Enter');
    await sleep(800);
    const corner = await imagePixel(page, 0.02, 0.02);
    const middle = await imagePixel(page, 0.5, 0.5);
    check('an oval screenshot is transparent outside the oval (Enter finishes)', corner.rgba[3] === 0 && middle.rgba[3] === 255, JSON.stringify([corner.rgba, middle.rgba]));

    // Polygon: click the corners, click the first one to close
    await clickTitle(page, 'Screenshot menu');
    await item(page, 'polygon');
    await page.waitForSelector('[data-screenshot-editor]');
    for (const [px, py] of [[900, 100], [1300, 100], [1100, 500], [900, 100]]) {
      const [sx, sy] = await pictureToScreen(page, px, py);
      await page.mouse.click(sx, sy);
      await sleep(120);
    }
    const poly = await page.evaluate(() => ({ size: document.querySelector('[data-screenshot-size]')?.innerText, finish: !document.querySelector('[data-screenshot-toolbar] button[aria-label="Finish"]').disabled }));
    check('Polygon screenshot: clicking the first corner again closes the shape', poly.finish && /^(399|400|401) × (399|400|401)$/.test(poly.size || ''), JSON.stringify(poly));
    await toolbarButton(page, 'Finish');
    await sleep(800);
    const polyCorner = await imagePixel(page, 0.02, 0.95);
    const polyInside = await imagePixel(page, 0.5, 0.3);
    check('a polygon screenshot is transparent outside the polygon', polyCorner.rgba[3] === 0 && polyInside.rgba[3] === 255 && polyInside.rgba[2] > 200, JSON.stringify([polyCorner.rgba, polyInside.rgba]));

    // Escape cancels without adding anything
    blocks = await savedBlocks(page);
    await clickTitle(page, 'Screenshot menu');
    await item(page, 'rounded');
    await page.waitForSelector('[data-screenshot-editor]');
    await page.keyboard.press('Escape');
    await sleep(400);
    check('Escape cancels: the editor closes and nothing is added', !(await editorOpen(page)) && (await savedBlocks(page)).length === blocks.length);

    // Hide Current Window During Screenshot: a 3 second countdown, then the frame; it becomes the ticked choice
    await clickTitle(page, 'Screenshot menu');
    await item(page, 'hide');
    await sleep(400);
    const counting = await page.evaluate(() => document.querySelector('[data-screenshot-countdown]')?.innerText || '');
    check('Hide Current Window During Screenshot counts down from 3 before taking the frame', /Screenshot in 3/.test(counting) && !(await editorOpen(page)), counting);
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 6000 });
    check('the frame is taken when the countdown ends', true);
    await page.keyboard.press('Escape');
    await sleep(200);
    await clickTitle(page, 'Screenshot menu');
    const ticked = await page.evaluate(() => document.querySelector('[data-screenshot-item="hide"]').getAttribute('aria-checked'));
    const title = await page.evaluate(() => document.querySelector('button[aria-label="Screenshot"]').title);
    check('Hide Current Window is now the ticked choice, and the Screenshot button does it', ticked === 'true' && /Hide Current Window/.test(title), `${ticked} ${title}`);
    await item(page, 'screenshot'); // back to the default (this also takes one)
    await page.waitForSelector('[data-screenshot-editor]');
    await page.keyboard.press('Escape');
    await sleep(200);

    // Shortcuts
    const calls = await page.evaluate(() => window.__displayMediaCalls);
    await page.mouse.click(700, 300); // focus on the page, not a field
    await page.keyboard.down('Control');
    await page.keyboard.down('Alt');
    await page.keyboard.press('x');
    await page.keyboard.up('Alt');
    await page.keyboard.up('Control');
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 5000 }).catch(() => {});
    check('Ctrl+Alt+X takes a screenshot', (await editorOpen(page)) && (await page.evaluate(() => window.__displayMediaCalls)) === calls + 1);
    await page.keyboard.press('Escape');
    await sleep(200);

    // Screen Grab Main Window: the Playground view itself, with what is drawn on it
    await drawStroke(page, [[500, 300], [700, 320], [900, 300]], { steps: 10 });
    await sleep(400);
    await clickTitle(page, 'Screenshot menu');
    await item(page, 'view');
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 10000 });
    const view = await page.evaluate(async () => {
      const img = document.querySelector('[data-screenshot-editor] img');
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const ink = ctx.getImageData(700 - 3, 320 - 6, 7, 13).data;
      let dark = 0;
      for (let i = 0; i < ink.length; i += 4) if (ink[i] < 128 && ink[i + 3] > 0) dark++;
      return { size: [img.naturalWidth, img.naturalHeight], dark, calls: window.__displayMediaCalls };
    });
    check('Screen Grab Main Window: the Playground view at screen size, with its ink, without asking the browser', view.size.join('x') === '1366x768' && view.dark > 0, JSON.stringify(view));
    await page.keyboard.press('Escape');
  } catch (e) {
    check('laptop run finished', false, String((e && e.stack) || e).slice(0, 600));
  }
  check('laptop: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── Phone, finger: no screen capture in mobile browsers ──────────────────────
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await page.evaluateOnNewDocument(NO_SCREEN_CAPTURE);
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
  const swipe = async (from, to) => drawStroke(page, [from, to], { steps: 8, pointerType: 'touch' });
  try {
    await openPlayground(page);
    await clickTitle(page, 'More Tools');
    const row = await page.evaluate(() => {
      const tiles = ['Insert Picture', 'Insert Screenshot', 'Insert Shapes', 'Insert Symbol', 'Insert Equation'].map((l) => document.querySelector(`button[aria-label="${l}"]`));
      return {
        all: tiles.every(Boolean),
        order: tiles.every((t, i) => !i || (t && tiles[i - 1] && t.getBoundingClientRect().left > tiles[i - 1].getBoundingClientRect().left)),
        fits: tiles.every((t) => t && t.getBoundingClientRect().right <= innerWidth && t.scrollWidth <= t.clientWidth + 1),
        smallest: Math.round(Math.min(...tiles.filter(Boolean).map((t) => Math.min(t.getBoundingClientRect().width, t.getBoundingClientRect().height)))),
      };
    });
    check('phone: the Insert row has the five tools in WPS order, labels fitting, 44 px or more', row.all && row.order && row.fits && row.smallest >= 44, JSON.stringify(row));
    await tap('button[aria-label="Insert Screenshot"]');
    const sheet = await page.evaluate(() => {
      const m = document.querySelector('[data-screenshot-menu]');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      return {
        items: [...m.querySelectorAll('[data-screenshot-item]')].map((b) => b.getAttribute('data-screenshot-item')),
        fits: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
        width: Math.round(r.width),
        small: [...m.querySelectorAll('button')].filter((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) < 44).length,
        onTop: m.contains(document.elementFromPoint(195, r.top + 60)),
      };
    });
    check('phone: the Screenshot sheet offers what works: the Playground view, From Photos, Paste', sheet && sheet.items.join(',') === 'view,photos,paste', JSON.stringify(sheet));
    check('phone: the sheet is full width, on top, every button 44 px or more', sheet && sheet.fits && sheet.width === 390 && sheet.small === 0 && sheet.onTop, JSON.stringify(sheet));
    await shot(page, 'screenshot-menu-phone');

    // The Playground view, cropped to an oval by finger
    await tap('[data-screenshot-item="view"]');
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 10000 });
    const ed = await page.evaluate(() => {
      const bar = document.querySelector('[data-screenshot-toolbar]').getBoundingClientRect();
      const img = document.querySelector('[data-screenshot-editor] img');
      const tools = document.querySelector('[data-screenshot-tools]');
      const finish = document.querySelector('[data-screenshot-toolbar] button[aria-label="Finish"]').getBoundingClientRect();
      return { size: [img.naturalWidth, img.naturalHeight], bar: [Math.round(bar.left), Math.round(bar.right), Math.round(innerHeight - bar.bottom)], scrolls: tools.scrollWidth > tools.clientWidth, finish: finish.right <= innerWidth && finish.left >= 0 };
    });
    check('phone: the view is captured at the screen\'s sharpness (3x)', ed.size.join('x') === '1170x2532', JSON.stringify(ed));
    check('phone: the editor toolbar sits along the bottom, inside the screen; its tools scroll sideways, Finish always shows', ed.bar[0] >= 0 && ed.bar[1] <= 390 && ed.bar[2] >= 0 && ed.scrolls && ed.finish, JSON.stringify(ed));
    await tap('[data-screenshot-toolbar] button[aria-label="Oval Screenshot"]');
    await swipe([80, 200], [300, 420]);
    await sleep(200);
    const handles = await page.evaluate(() => [...document.querySelectorAll('[data-region-handle]')].map((h) => Math.round(h.getBoundingClientRect().width)));
    check('phone: an oval region by finger, with 44 px handles', handles.length === 8 && handles.every((w) => w >= 44), JSON.stringify(handles));
    const moved = await page.evaluate(() => document.querySelector('[data-screenshot-size]').innerText);
    await swipe([190, 310], [200, 330]); // drag inside: moves
    await sleep(150);
    check('phone: dragging inside the region moves it (same size)', (await page.evaluate(() => document.querySelector('[data-screenshot-size]').innerText)) === moved);
    await shot(page, 'screenshot-editor-phone');
    let count = (await savedBlocks(page)).length;
    await tap('[data-screenshot-toolbar] button[aria-label="Finish"]');
    await sleep(800);
    let blocks = await savedBlocks(page);
    check('phone: Finish adds the picture', blocks.length === count + 1 && blocks[blocks.length - 1].type === 'image');
    const oc = await imagePixel(page, 0.02, 0.02);
    check('phone: transparent outside the oval', oc.rgba[3] === 0, JSON.stringify(oc.rgba));

    // From Photos: a screenshot taken with the phone's own buttons
    const photo = path.join(SHOTS, 'fixture-phone-screenshot.png');
    const b64 = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 300;
      c.height = 600;
      const x = c.getContext('2d');
      x.fillStyle = '#00B050';
      x.fillRect(0, 0, 300, 600);
      return c.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync(photo, Buffer.from(b64, 'base64'));
    await clickTitle(page, 'More Tools');
    await tap('button[aria-label="Insert Screenshot"]');
    const [chooser] = await Promise.all([page.waitForFileChooser({ timeout: 5000 }), tap('[data-screenshot-item="photos"]')]);
    await chooser.accept([photo]);
    await page.waitForSelector('[data-screenshot-editor]', { timeout: 5000 });
    check('phone: From Photos opens the chosen picture in the editor', (await page.evaluate(() => document.querySelector('[data-screenshot-editor] img').naturalWidth)) === 300);
    await swipe([60, 250], [330, 600]);
    count = (await savedBlocks(page)).length;
    await tap('[data-screenshot-toolbar] button[aria-label="Finish"]');
    await sleep(800);
    const green = await imagePixel(page, 0.5, 0.5);
    check('phone: and Finish adds the cropped photo', (await savedBlocks(page)).length === count + 1 && green.rgba[1] > 150 && green.rgba[0] < 50, JSON.stringify(green.rgba));

    // Paste: a copied picture
    await browser.defaultBrowserContext().overridePermissions(new URL(page.url()).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    const wrote = await page.evaluate(async () => {
      try {
        const c = document.createElement('canvas');
        c.width = 200;
        c.height = 100;
        const x = c.getContext('2d');
        x.fillStyle = '#FFC000';
        x.fillRect(0, 0, 200, 100);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return 'ok';
      } catch (e) {
        return String(e);
      }
    });
    if (wrote === 'ok') {
      await clickTitle(page, 'More Tools');
      await tap('button[aria-label="Insert Screenshot"]');
      await tap('[data-screenshot-item="paste"]');
      await page.waitForSelector('[data-screenshot-editor]', { timeout: 5000 }).catch(() => {});
      check('phone: Paste opens the copied picture in the editor', (await page.evaluate(() => document.querySelector('[data-screenshot-editor] img')?.naturalWidth)) === 200);
      await tap('[data-screenshot-toolbar] button[aria-label="Cancel (Esc)"]');
    } else {
      notes.push(`Paste not checked: headless Chrome would not put a picture on the clipboard (${wrote})`);
    }
    // An empty clipboard says so
    await page.evaluate(async () => navigator.clipboard.writeText('just text'));
    await clickTitle(page, 'More Tools');
    await tap('button[aria-label="Insert Screenshot"]');
    await tap('[data-screenshot-item="paste"]');
    await sleep(500);
    check('phone: Paste with no picture on the clipboard explains, and opens nothing', !(await editorOpen(page)) && (await page.evaluate(() => /no picture on the clipboard/i.test(document.body.innerText))));
  } catch (e) {
    check('phone run finished', false, String((e && e.stack) || e).slice(0, 600));
  }
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── A real screen capture (Chrome picks the screen itself) ───────────────────
{
  const { browser, page } = await launch({ width: 1366, height: 768, extraArgs: ['--auto-select-desktop-capture-source=Entire screen', '--auto-accept-this-tab-capture', '--enable-usermedia-screen-capturing'] });
  try {
    await openPlayground(page);
    await clickTitle(page, 'Screenshot (Ctrl+Alt+X)');
    const opened = await page.waitForSelector('[data-screenshot-editor]', { timeout: 8000 }).then(() => true).catch(() => false);
    if (opened) {
      const size = await page.evaluate(() => { const i = document.querySelector('[data-screenshot-editor] img'); return [i.naturalWidth, i.naturalHeight]; });
      check('a real screen capture works', size[0] > 0 && size[1] > 0, size.join('x'));
    } else {
      const said = await page.evaluate(() => document.body.innerText.match(/[^\n]*(captur|Screen Grab)[^\n]*/i)?.[0] || '(nothing shown)');
      notes.push(`Real screen capture: headless Chrome did not provide a screen; this one has to be tried by hand. The app said: ${said}`);
    }
  } catch (e) {
    notes.push(`Real screen capture: could not be tried (${String(e).slice(0, 200)})`);
  }
  await browser.close();
}

for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : `  -> ${r.detail}`}`);
for (const n of notes) console.log(`note ${n}`);
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
