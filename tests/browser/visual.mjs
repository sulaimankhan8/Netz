import { launch, openPlayground, drawStroke, sleep, clickTitle, setPenWidth, shot, addEquationBlock, BASE } from './lib.mjs';

// The look built by PLAYGROUND_VISUAL_REDESIGN_PLAN.md (section 9): one active look for every
// tool, none of the old accent colours in the chrome, DM Sans everywhere (portalled sheets too),
// nothing under 12 px, the two top bars and the dock where they belong at every screen size, one
// context bar for a selection, the selection colour, pen types that keep their width, the empty
// page's hint, and enough contrast in the design tokens, in light and dark.
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

// The colours the old chrome used for "active" and accents (blue-500, blue-600, indigo-500,
// purple-500, violet-500, sky-500)
const OLD_ACCENTS = ['rgb(59, 130, 246)', 'rgb(37, 99, 235)', 'rgb(99, 102, 241)', 'rgb(168, 85, 247)', 'rgb(139, 92, 246)', 'rgb(14, 165, 233)'];
const CHROME = '[data-dock], [data-page-bar], [data-doc-bar], [role="dialog"], [role="menu"], [data-context-bar], [data-reading-pill], [data-status-area]';

// Old accent colours and text under 12 px in the visible chrome. Swatches and other elements
// that paint a colour inline (ink colours, the pen chip's dot) are content and are skipped.
const scanChrome = (page) =>
  page.evaluate(({ OLD, CHROME }) => {
    const bad = new Set();
    const small = new Set();
    for (const root of document.querySelectorAll(CHROME)) {
      for (const el of [root, ...root.querySelectorAll('*')]) {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        let hidden = false;
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (Number(getComputedStyle(p).opacity) === 0) {
            hidden = true;
            break;
          }
        }
        if (hidden) continue;
        const inline = el.getAttribute('style') || '';
        const name = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30);
        if (!/background/.test(inline)) {
          if (OLD.includes(cs.color)) bad.add(`color ${cs.color} "${name}"`);
          if (OLD.includes(cs.backgroundColor)) bad.add(`background ${cs.backgroundColor} "${name}"`);
          for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
            if (parseFloat(cs[`border${side}Width`]) > 0 && OLD.includes(cs[`border${side}Color`])) bad.add(`border ${cs[`border${side}Color`]} "${name}"`);
          }
          if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && OLD.includes(cs.outlineColor)) bad.add(`outline ${cs.outlineColor} "${name}"`);
        }
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (ownText && parseFloat(cs.fontSize) < 11.9) small.add(`${cs.fontSize} "${el.textContent.trim().slice(0, 30)}"`);
      }
    }
    return { bad: [...bad].slice(0, 12), small: [...small].slice(0, 12) };
  }, { OLD: OLD_ACCENTS, CHROME });

const fontOf = (page, selector) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return el ? getComputedStyle(el).fontFamily : '(not found)';
}, selector);
const isDmSans = (family) => /DM_Sans|DM Sans/.test(family);

// Each tool in turn: the pressed one is filled with the ink token, no other tool is filled
const activeLook = async (page, tools) => {
  const problems = [];
  for (const tool of tools) {
    const clicked = await page.evaluate((t) => {
      const b = document.querySelector(`[data-dock] button[aria-label="${t}"]`);
      if (b) b.click();
      return Boolean(b);
    }, tool);
    if (!clicked) {
      problems.push(`${tool}: not in the dock`);
      continue;
    }
    await sleep(300);
    const states = await page.evaluate((list) => {
      const ink = `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--pg-ink').trim().split(/\s+/).join(', ')})`;
      return list.map((t) => {
        const b = document.querySelector(`[data-dock] button[aria-label="${t}"]`);
        return b ? { t, pressed: b.getAttribute('aria-pressed') === 'true', filled: getComputedStyle(b).backgroundColor === ink } : { t, missing: true };
      });
    }, tools);
    for (const s of states) {
      if (s.missing) continue;
      if (s.t === tool && !(s.pressed && s.filled)) problems.push(`${tool} pressed but not graphite`);
      if (s.t !== tool && s.filled) problems.push(`${s.t} filled while ${tool} is active`);
    }
  }
  return problems;
};

// Where the bars are, and what is off screen
const layout = (page) =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return b.width && b.height ? { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height } : null;
    };
    const sidebar = document.querySelector('[data-app-sidebar]');
    const sb = sidebar ? sidebar.getBoundingClientRect() : null;
    const sidebarRight = sb && innerWidth >= 768 && sb.right > 0 && sb.width < innerWidth / 2 ? Math.round(sb.right) : 0;
    const offscreen = [...document.querySelectorAll('[data-page-bar] button, [data-doc-bar] button, [data-dock] button')]
      .filter((b) => {
        const x = b.getBoundingClientRect();
        return x.width && (x.left < -0.5 || x.top < -0.5 || x.right > innerWidth + 0.5 || x.bottom > innerHeight + 0.5);
      })
      .map((b) => b.getAttribute('aria-label') || b.title);
    return {
      vw: innerWidth,
      vh: innerHeight,
      sidebarRight,
      pageBar: r(document.querySelector('[data-page-bar]')),
      docBar: r(document.querySelector('[data-doc-bar]')),
      dock: r(document.querySelector('[data-dock]')),
      status: r(document.querySelector('[data-status-area] > div')),
      offscreen,
    };
  });
const overlaps = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const near = (a, b, tol = 2) => Math.abs(a - b) <= tol;

// The layout rules for one screen
const checkLayout = async (page, label, { phone }) => {
  const L = await layout(page);
  check(`${label}: no bar button is off screen`, L.offscreen.length === 0, L.offscreen.join(', '));
  const pairs = [['page bar', L.pageBar, 'document bar', L.docBar], ['page bar', L.pageBar, 'dock', L.dock], ['document bar', L.docBar, 'dock', L.dock], ['status area', L.status, 'page bar', L.pageBar], ['status area', L.status, 'document bar', L.docBar], ['status area', L.status, 'dock', L.dock]];
  const hits = pairs.filter(([, a, , b]) => overlaps(a, b)).map(([n1, , n2]) => `${n1} / ${n2}`);
  check(`${label}: the top bars, the status area and the dock do not overlap`, hits.length === 0, hits.join(', '));
  if (phone) {
    check(`${label}: the top bar spans the screen, 12 px from each edge`, L.pageBar && near(L.pageBar.l, 12) && near(L.pageBar.r, L.vw - 12), JSON.stringify(L.pageBar));
    check(`${label}: the dock spans the screen, 12 px from each edge`, L.dock && near(L.dock.l, 12) && near(L.dock.r, L.vw - 12), JSON.stringify(L.dock));
  } else {
    check(`${label}: the page bar starts 16 px right of the app sidebar`, L.pageBar && near(L.pageBar.l, L.sidebarRight + 16), `${L.pageBar && L.pageBar.l} vs ${L.sidebarRight + 16}`);
    check(`${label}: the document bar ends 16 px from the right edge`, L.docBar && near(L.docBar.r, L.vw - 16), `${L.docBar && L.docBar.r} vs ${L.vw - 16}`);
    check(`${label}: the dock is centred in the space right of the sidebar`, L.dock && near((L.dock.l + L.dock.r) / 2, (L.sidebarRight + L.vw) / 2, 3), `${L.dock && (L.dock.l + L.dock.r) / 2} vs ${(L.sidebarRight + L.vw) / 2}`);
  }
  return L;
};

// Contrast of the token pairs people read
const tokenContrast = (page) =>
  page.evaluate(() => {
    const rgb = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--pg-${name}`).trim().split(/\s+/).map(Number);
    const lum = ([r, g, b]) => {
      const f = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    return [['text2', 'surface'], ['text2', 'paper'], ['ink', 'paper'], ['on-ink', 'ink'], ['accent-on-tint', 'accent-tint'], ['danger', 'danger-tint']].map(([a, b]) => ({ pair: `${a} on ${b}`, ratio: Math.round(ratio(a, b) * 100) / 100 }));
  });

const setDark = (page, on) => page.evaluate((d) => document.documentElement.classList.toggle('dark', d), on);

const openPanelBy = async (page, selector) => {
  const ok = await page.evaluate((s) => {
    const b = document.querySelector(s);
    if (b) b.click();
    return Boolean(b);
  }, selector);
  await sleep(400);
  return ok;
};
const closePanels = async (page) => {
  await page.keyboard.press('Escape');
  await sleep(250);
};

// ───────────────────────────── Laptop, mouse ─────────────────────────────
for (const size of [{ width: 1366, height: 768 }, { width: 1280, height: 800 }]) {
  const label = `laptop ${size.width}`;
  const { browser, page, errors } = await launch({ ...size, extraArgs: ['--disable-gpu', '--disable-accelerated-2d-canvas'] });
  try {
    await openPlayground(page);
    await checkLayout(page, label, { phone: false });

    const controls = await page.evaluate(() => [...document.querySelectorAll('[data-dock] button')].filter((b) => b.getBoundingClientRect().width && !/ menu$/.test(b.getAttribute('aria-label') || '')).map((b) => b.getAttribute('aria-label')));
    const expected = ['Undo', 'Redo', 'Pen', 'Highlighter', 'Eraser', 'Lasso Select', 'Move page', 'Pen options', 'Insert Picture', 'Screenshot', 'Shapes', 'Symbol', 'Equation', 'Blocks'];
    check(`${label}: the dock holds the 14 controls of the plan, in order`, controls.join('|') === expected.join('|'), controls.join('|'));
    check(`${label}: zoom and the page menu are not in the dock`, !controls.some((c) => ['Zoom', 'Zoom In', 'Zoom Out', 'Page'].includes(c)), controls.join('|'));

    if (size.width === 1366) {
      // The empty page's hint: shown, never takes a press, gone with the first stroke, back after Clear page
      const hint = () => page.evaluate(() => {
        const el = document.querySelector('[data-empty-hint]');
        return el ? { shown: true, pointer: getComputedStyle(el).pointerEvents, text: el.innerText.replace(/\n/g, ' | ') } : { shown: false };
      });
      const h0 = await hint();
      check('empty page: the hint shows and never takes a press', h0.shown && h0.pointer === 'none', JSON.stringify(h0));
      await shot(page, 'visual-laptop-empty');

      // One active look for every tool
      const look = await activeLook(page, ['Pen', 'Highlighter', 'Eraser', 'Lasso Select', 'Move page', 'Pen']);
      check('laptop: every tool shows the same graphite active look', look.length === 0, look.join('; '));

      await drawStroke(page, [[500, 380], [540, 400], [580, 392], [620, 410]]);
      await sleep(500);
      check('empty page: the hint goes with the first stroke', !(await hint()).shown);

      // Fonts and the chrome scan, with the pen options open
      check('laptop: the dock uses DM Sans', isDmSans(await fontOf(page, '[data-dock]')), await fontOf(page, '[data-dock]'));
      check('laptop: the page bar uses DM Sans', isDmSans(await fontOf(page, '[data-page-bar]')), await fontOf(page, '[data-page-bar]'));
      check('laptop: the document bar uses DM Sans', isDmSans(await fontOf(page, '[data-doc-bar]')), await fontOf(page, '[data-doc-bar]'));
      await openPanelBy(page, 'button[data-tool-options]');
      const penType = () => page.evaluate(() => ({
        type: document.querySelector('[aria-label="Pen type"] [aria-pressed="true"]')?.innerText.trim(),
        width: [...document.querySelectorAll('span')].find((s) => /^\d+ px$/.test(s.innerText.trim()) && s.closest('[role="dialog"]'))?.innerText.trim(),
      }));
      const p0 = await penType();
      check('pen type: Ballpoint is chosen when the options first open', p0.type === 'Ballpoint', JSON.stringify(p0));
      const scanOptions = await scanChrome(page);
      check('laptop, pen options open: no old accent colours', scanOptions.bad.length === 0, scanOptions.bad.join('; '));
      check('laptop, pen options open: no text under 12 px', scanOptions.small.length === 0, scanOptions.small.join('; '));
      await setPenWidth(page, 7);
      await sleep(250);
      const p1 = await penType();
      check('pen type: moving the width slider keeps Ballpoint chosen', p1.type === 'Ballpoint' && p1.width === '7 px', JSON.stringify(p1));
      await page.evaluate(() => [...document.querySelectorAll('[aria-label="Pen type"] button')].find((b) => b.innerText.trim() === 'Marker').click());
      await sleep(250);
      const p2 = await penType();
      check('pen type: Marker has its own width (10 px)', p2.type === 'Marker' && p2.width === '10 px', JSON.stringify(p2));
      await page.evaluate(() => [...document.querySelectorAll('[aria-label="Pen type"] button')].find((b) => b.innerText.trim() === 'Ballpoint').click());
      await sleep(250);
      const p3 = await penType();
      check('pen type: back to Ballpoint, its 7 px is kept', p3.type === 'Ballpoint' && p3.width === '7 px', JSON.stringify(p3));
      await shot(page, 'visual-laptop-pen-options');
      await closePanels(page);

      // The page menu and the zoom menu: scan them too
      await openPanelBy(page, '[data-doc-bar] button[aria-label="Page"]');
      const scanPage = await scanChrome(page);
      check('laptop, page menu open: no old accent colours', scanPage.bad.length === 0, scanPage.bad.join('; '));
      check('laptop, page menu open: no text under 12 px', scanPage.small.length === 0, scanPage.small.join('; '));
      await shot(page, 'visual-laptop-page-menu');
      await closePanels(page);

      // Lasso: one context bar, no separate reading pill, the box in the selection colour
      await page.evaluate(() => document.querySelector('[data-dock] button[aria-label="Lasso Select"]').click());
      await sleep(250);
      const loop = [];
      for (let i = 0; i <= 24; i++) loop.push([560 + 120 * Math.cos((i / 24) * Math.PI * 2), 395 + 70 * Math.sin((i / 24) * Math.PI * 2)]);
      await drawStroke(page, loop, { steps: 2 });
      await sleep(1500);
      const sel = await page.evaluate(() => {
        const visible = (el) => {
          const b = el.getBoundingClientRect();
          if (!b.width) return false;
          for (let p = el; p && p !== document.body; p = p.parentElement) if (Number(getComputedStyle(p).opacity) === 0) return false;
          return true;
        };
        const bars = [...document.querySelectorAll('[data-context-bar]')].filter(visible);
        const loosePills = [...document.querySelectorAll('[data-reading-pill]')].filter((p) => visible(p) && !p.closest('[data-context-bar]'));
        const c = document.querySelector('canvas.z-20');
        let accent = 0;
        let violet = 0;
        if (c) {
          const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 100) continue; // the 1.5 px outline is anti-aliased
            if (Math.abs(d[i] - 79) < 20 && Math.abs(d[i + 1] - 70) < 20 && Math.abs(d[i + 2] - 229) < 20) accent++;
            if (Math.abs(d[i] - 139) < 12 && Math.abs(d[i + 1] - 92) < 12 && Math.abs(d[i + 2] - 246) < 12) violet++;
          }
        }
        const bar = bars[0] && bars[0].getBoundingClientRect();
        return { bars: bars.length, loosePills: loosePills.length, accent, violet, barBottom: bar && bar.bottom, barTop: bar && bar.top };
      });
      check('lasso: one context bar and no separate reading pill', sel.bars === 1 && sel.loosePills === 0, JSON.stringify(sel));
      check('lasso: the selection box is drawn in the selection colour (indigo), not violet', sel.accent > 20 && sel.violet === 0, JSON.stringify(sel));
      // The selected ink spans y 380..410; its box is 8 px larger, and the bar sits 8 px above the box
      check('lasso: the context bar sits above the selection', sel.barBottom !== undefined && sel.barBottom <= 380 - 8 - 8 + 2, JSON.stringify(sel));
      await shot(page, 'visual-laptop-lasso');
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.querySelector('[data-dock] button[aria-label="Pen"]').click());
      await sleep(250);

      // A block: its bar above it, outside its frame, one size at every zoom; outline in the selection colour
      await clickTitle(page, 'Add Theory Block');
      await sleep(800);
      // A new block opens ready for typing: Done closes it
      for (let tries = 0; tries < 3; tries++) {
        await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').forEach((b) => b.click()));
        if (await page.waitForSelector('[data-block-id] [data-block-body]', { timeout: 2000 }).then(() => true, () => false)) break;
      }
      await sleep(300);
      const blockMid = await page.evaluate(() => {
        const r = document.querySelector('[data-block-id] [data-block-body]').getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
      // Hover shows the block's bar (mouse); pressing its handle selects the block without opening
      // it (a click in a Text block's writing area opens it for typing)
      await page.mouse.move(blockMid[0], blockMid[1]);
      await sleep(300);
      const grab = await page.evaluate(() => {
        const r = document.querySelector('[data-block-id] [data-context-bar] .cursor-grab').getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
      await page.mouse.click(grab[0], grab[1]);
      await sleep(400);
      const blockBar = () => page.evaluate(() => {
        const b = document.querySelector('[data-block-id]');
        if (!b) return { missing: 'block', blocks: document.querySelectorAll('[data-block-id]').length };
        const bar = b.querySelector('[data-context-bar]');
        if (!bar) return { missing: 'bar' };
        const top = document.querySelector('[data-page-bar]').getBoundingClientRect().bottom;
        const rb = b.getBoundingClientRect();
        const rr = bar.getBoundingClientRect();
        const ink = getComputedStyle(document.documentElement).getPropertyValue('--pg-accent').trim().split(/\s+/).join(', ');
        return {
          selected: b.hasAttribute('data-selected'),
          shown: getComputedStyle(bar).opacity === '1',
          above: rr.bottom <= rb.top + 1,
          below: rr.top >= rb.bottom - 1,
          clearOfTop: rr.top >= top,
          height: Math.round(rr.height * 10) / 10,
          outline: getComputedStyle(b.firstElementChild).outlineColor === `rgb(${ink})` && getComputedStyle(b.firstElementChild).outlineStyle !== 'none',
        };
      });
      const b1 = await blockBar();
      check('block: pressing its handle selects it and shows its bar', b1.selected && b1.shown, JSON.stringify(b1));
      check('block: the bar sits outside the block (above it, or below near the top bars)', (b1.above || b1.below) && b1.clearOfTop, JSON.stringify(b1));
      check('block: the selected outline is the selection colour', b1.outline, JSON.stringify(b1));
      await page.keyboard.down('Control');
      await page.keyboard.press('-');
      await page.keyboard.press('-');
      await page.keyboard.press('-');
      await page.keyboard.up('Control');
      await sleep(400);
      const b2 = await blockBar();
      await page.keyboard.down('Control');
      for (let i = 0; i < 7; i++) await page.keyboard.press('=');
      await page.keyboard.up('Control');
      await sleep(400);
      const b3 = await blockBar();
      check('block: the bar keeps one size at every zoom', near(b2.height, b1.height, 1) && near(b3.height, b1.height, 1), `${b1.height} / ${b2.height} / ${b3.height}`);
      await shot(page, 'visual-laptop-block');
      await page.keyboard.down('Control');
      await page.keyboard.press('0');
      await page.keyboard.up('Control');
      await sleep(300);

      // A shape: its handles edged in the selection colour
      try {
        await clickTitle(page, 'Shapes (');
        await sleep(400);
        await page.evaluate(() => document.querySelector('[data-shape-section="rectangles"] [data-shape-item]').click());
        await sleep(300);
        await page.mouse.click(900, 260);
        await sleep(600);
        const handle = await page.evaluate(() => {
          const h = document.querySelector('[data-shape-handle] rect');
          return h ? h.getAttribute('stroke') : null;
        });
        check('shape: the resize handles are edged in the selection colour', handle && handle.toUpperCase() === '#4F46E5', handle);
        await shot(page, 'visual-laptop-shape');
      } catch (e) {
        check('shape: the resize handles are edged in the selection colour', false, String(e).slice(0, 200));
      }
      await page.keyboard.press('Escape');
      await sleep(200);

      // The pen type is remembered after a reload
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
      await sleep(1500);
      await page.evaluate(() => document.querySelector('[data-dock] button[aria-label="Pen"]').click());
      await sleep(200);
      await openPanelBy(page, 'button[data-tool-options]');
      const p4 = await penType();
      check('pen type: the choice and its width survive a reload', p4.type === 'Ballpoint' && p4.width === '7 px', JSON.stringify(p4));
      await closePanels(page);

      // Clear page brings the hint back (the page has ink, a block and a shape)
      await clickTitle(page, 'Clear page');
      await sleep(700);
      check('empty page: the hint comes back after Clear page', (await hint()).shown);

      // Contrast, light then dark; the dark theme's chrome has no old accents either
      const light = await tokenContrast(page);
      const lowLight = light.filter((x) => x.ratio < 4.5);
      check('contrast (light): every token pair people read is at least 4.5:1', lowLight.length === 0, JSON.stringify(light));
      await setDark(page, true);
      await sleep(300);
      const dark = await tokenContrast(page);
      const lowDark = dark.filter((x) => x.ratio < 4.5);
      check('contrast (dark): every token pair people read is at least 4.5:1', lowDark.length === 0, JSON.stringify(dark));
      const look2 = await activeLook(page, ['Highlighter', 'Pen']);
      check('dark: the active tool is filled with the ink token', look2.length === 0, look2.join('; '));
      await openPanelBy(page, '[data-doc-bar] button[aria-label="Page"]');
      const scanDark = await scanChrome(page);
      check('dark, page menu open: no old accent colours', scanDark.bad.length === 0, scanDark.bad.join('; '));
      await shot(page, 'visual-laptop-dark');
      await closePanels(page);
      await setDark(page, false);
    }
  } catch (e) {
    check(`${label} part ran to the end`, false, String((e && e.stack) || e).slice(0, 400));
  }
  check(`${label}: no console errors`, errors.length === 0, errors.join(' || ').slice(0, 300));
  await browser.close();
}

// ───────────────────────────── Blocks (laptop, mouse) ─────────────────────────────
// The blocks round (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, section 10): the formula alone at rest
// with Plot in the bar, an SVG graph, a Text block a click selects, the one-row voice memo, a
// little colour per type, and nothing inside a block redrawn while the page pans.
{
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  try {
    await openPlayground(page);

    // Equation: write it, finish with Enter
    await addEquationBlock(page);
    await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
    await sleep(300);
    await page.keyboard.type('y=x^2-4x+3');
    await sleep(300);
    await page.keyboard.press('Enter');
    await sleep(500);
    const eq = await page.evaluate(() => {
      const b = document.querySelector('[data-block-id]');
      return {
        editing: b.getAttribute('data-editing'),
        katex: Boolean(b.querySelector('[data-block-body] .katex')),
        buttonsOverFormula: b.querySelectorAll('[data-block-body] button').length,
        plotInBar: Boolean(b.querySelector('[data-context-bar] button[aria-label="Plot"]')),
        edge: getComputedStyle(b.firstElementChild).borderTopColor,
      };
    });
    check('equation at rest: the formula alone, nothing on top of it', eq.editing !== 'true' && eq.katex && eq.buttonsOverFormula === 0, JSON.stringify(eq));
    check("equation: Plot is in the block's bar", eq.plotInBar, JSON.stringify(eq));
    check('equation: its edge is in its type colour (teal)', /15, 118, 110/.test(eq.edge), eq.edge);

    await page.evaluate(() => document.querySelector('[data-block-id] [data-context-bar] button[aria-label="Plot"]').click());
    await sleep(1200);
    const graph = await page.evaluate(() => {
      const blocks = [...document.querySelectorAll('[data-block-id]')];
      const g = blocks.find((b) => b.querySelector('svg[data-graph-plot]'));
      return {
        blocks: blocks.length,
        paths: g ? g.querySelectorAll('svg[data-graph-plot] path').length : 0,
        canvases: document.querySelectorAll('[data-block-id] canvas').length,
        edge: g ? getComputedStyle(g.firstElementChild).borderTopColor : null,
      };
    });
    check('Plot in the bar adds a graph block drawn as SVG (no canvas)', graph.blocks === 2 && graph.paths >= 1 && graph.canvases === 0, JSON.stringify(graph));
    check('graph: its edge is in its type colour (blue)', graph.edge && /37, 99, 235/.test(graph.edge), graph.edge);

    // The graph shows the value under the mouse
    const plotBox = await page.evaluate(() => {
      const r = document.querySelector('svg[data-graph-plot]').getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    await page.mouse.move(plotBox[0], plotBox[1]);
    await sleep(250);
    const readout = await page.evaluate(() => [...document.querySelectorAll('[data-block-id] div')].some((d) => /^x = /.test(d.innerText || '')));
    check('graph: a mouse over the plot shows the values there', readout);
    await page.mouse.move(200, 640);
    await sleep(200);

    // Text: a click selects it, it does not open it
    await clickTitle(page, 'Add Theory Block');
    await sleep(700);
    await page.keyboard.type('- one point');
    await sleep(200);
    await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').forEach((b) => b.click()));
    await sleep(500);
    const textMid = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-block-id]')].pop();
      const r = b.querySelector('[data-block-body]').getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    await page.mouse.click(textMid[0], textMid[1]);
    await sleep(400);
    const text = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-block-id]')].pop();
      const dot = [...b.querySelectorAll('[data-block-body] span')].find((s) => s.getAttribute('aria-hidden') === 'true' && s.className.includes('rounded-full'));
      return {
        selected: b.hasAttribute('data-selected'),
        editing: b.getAttribute('data-editing'),
        bullet: dot ? getComputedStyle(dot).backgroundColor : null,
        size: getComputedStyle(b.querySelector('[data-block-body] > div')).fontSize,
      };
    });
    check('text: a click selects the block and does not open it', text.selected && text.editing !== 'true', JSON.stringify(text));
    check('text: 15 px, with its list marker in its type colour (amber)', text.size === '15px' && text.bullet && /180, 83, 9/.test(text.bullet), JSON.stringify(text));
    await page.mouse.click(200, 640);
    await sleep(300);

    // Panning the page redraws nothing inside the blocks (they are memoized)
    const blocksBefore = await page.evaluate(() => [...document.querySelectorAll('[data-block-id]')].map((b) => b.style.transform));
    await page.evaluate(() => {
      window.__blockMutations = 0;
      window.__blockObserver = new MutationObserver((list) => {
        window.__blockMutations += list.length;
      });
      for (const body of document.querySelectorAll('[data-block-body]')) {
        window.__blockObserver.observe(body, { subtree: true, childList: true, attributes: true, characterData: true });
      }
    });
    await page.mouse.move(200, 640);
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel({ deltaX: 12, deltaY: 18 });
      await sleep(30);
    }
    await sleep(400);
    const pan = await page.evaluate(() => {
      window.__blockObserver.disconnect();
      return { mutations: window.__blockMutations, transforms: [...document.querySelectorAll('[data-block-id]')].map((b) => b.style.transform) };
    });
    check('panning moves the blocks', pan.transforms.some((t, i) => t !== blocksBefore[i]), JSON.stringify(pan.transforms));
    check('panning redraws nothing inside the blocks', pan.mutations === 0, `${pan.mutations} changes inside blocks`);

    // Voice memo: one compact row, a round play button in its type colour (rose)
    await clickTitle(page, 'Record Voice Note');
    await sleep(1800);
    await clickTitle(page, 'Stop Voice Recording');
    await sleep(1500);
    await page.keyboard.press('Escape');
    await sleep(200);
    const memo = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-block-id]')].find((x) => x.querySelector('audio'));
      if (!b) return null;
      const play = b.querySelector('button[aria-label="Play"]');
      const r = b.getBoundingClientRect();
      return {
        height: Math.round(r.height),
        play: play ? { w: Math.round(play.getBoundingClientRect().width), bg: getComputedStyle(play).backgroundColor } : null,
        controls: ['Back 10 seconds', 'Position in the recording'].every((l) => b.querySelector(`[aria-label="${l}"]`)),
      };
    });
    check('voice memo: one row (about 104 px high) with play, track, back 10 s and speed', memo && memo.height <= 112 && memo.controls && memo.play && memo.play.w >= 44, JSON.stringify(memo));
    check('voice memo: the play button is in its type colour (rose)', memo && memo.play && /190, 24, 93/.test(memo.play.bg), JSON.stringify(memo));
    await shot(page, 'visual-blocks');
  } catch (e) {
    check('blocks part ran to the end', false, String((e && e.stack) || e).slice(0, 400));
  }
  check('blocks: no console errors', errors.length === 0, errors.join(' || ').slice(0, 300));
  await browser.close();
}

// ───────────────────────── Touch screens: tablet, phone, phone on its side ─────────────────────────
for (const screen of [
  { label: 'tablet 768', width: 768, height: 1024, phone: false },
  { label: 'phone 390', width: 390, height: 844, phone: true },
  { label: 'phone landscape 844', width: 844, height: 390, phone: false },
]) {
  const { browser, page, errors } = await launch({ width: screen.width, height: screen.height });
  await page.setViewport({ width: screen.width, height: screen.height, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  try {
    await openPlayground(page);
    await checkLayout(page, screen.label, { phone: screen.phone });

    if (screen.label === 'tablet 768') {
      const controls = await page.evaluate(() => [...document.querySelectorAll('[data-dock] button')].filter((b) => b.getBoundingClientRect().width).map((b) => b.getAttribute('aria-label')));
      check('tablet: the Insert group is one Insert menu, then Blocks', controls.includes('Insert') && controls.includes('Blocks') && !controls.includes('Symbol'), controls.join('|'));
    }

    if (screen.phone) {
      const controls = await page.evaluate(() => [...document.querySelectorAll('[data-dock] button')].filter((b) => b.getBoundingClientRect().width).map((b) => b.getAttribute('aria-label')));
      check('phone: the dock is Undo, Pen, Highlighter, Eraser, Lasso, ●, +', controls.join('|') === 'Undo|Pen|Highlighter|Eraser|Lasso Select|Pen options|Add to page', controls.join('|'));
      const look = await activeLook(page, ['Highlighter', 'Eraser', 'Lasso Select', 'Pen']);
      check('phone: every tool shows the same graphite active look', look.length === 0, look.join('; '));

      for (const [name, opener] of [
        ['+ sheet', '[data-dock] button[aria-label="Add to page"]'],
        ['page menu', '[data-page-bar] button[aria-label="Page"]'],
        ['pen options', 'button[data-tool-options]'],
      ]) {
        const opened = await openPanelBy(page, opener);
        const family = await fontOf(page, '[role="dialog"]');
        check(`phone, ${name}: opens as a sheet in DM Sans (a portal keeps the font)`, opened && isDmSans(family), family);
        const scan = await scanChrome(page);
        check(`phone, ${name}: no old accent colours`, scan.bad.length === 0, scan.bad.join('; '));
        check(`phone, ${name}: no text under 12 px`, scan.small.length === 0, scan.small.join('; '));
        if (name === '+ sheet') {
          const tiles = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] button')].map((b) => b.getAttribute('aria-label')).filter((l) => /^(Insert |Add |Record )/.test(l || '')));
          check('phone, + sheet: the five Insert tiles in WPS order, then Graph, Text, Voice memo', tiles.join('|') === 'Insert Picture|Insert Screenshot|Insert Shapes|Insert Symbol|Insert Equation|Add Graph Block|Add Text Block|Record a voice memo', tiles.join('|'));
        }
        await shot(page, `visual-phone-${name.replace(/[^a-z]+/g, '-')}`);
        await closePanels(page);
      }

      await setDark(page, true);
      await sleep(300);
      await openPanelBy(page, '[data-page-bar] button[aria-label="Page"]');
      const scanDark = await scanChrome(page);
      check('phone, dark, page menu: no old accent colours', scanDark.bad.length === 0, scanDark.bad.join('; '));
      await shot(page, 'visual-phone-dark');
      await closePanels(page);
    }
  } catch (e) {
    check(`${screen.label} part ran to the end`, false, String((e && e.stack) || e).slice(0, 400));
  }
  check(`${screen.label}: no console errors`, errors.length === 0, errors.join(' || ').slice(0, 300));
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} visual redesign checks passed (${BASE})`);
