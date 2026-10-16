import { launch, openPlayground, sleep, clickTitle, shot } from './lib.mjs';

// How the Playground fits a phone, a tablet and a laptop: what is off screen, what is too small to tap.
const SIZES = [
  ['phone-portrait', 390, 844, 3],
  ['phone-landscape', 844, 390, 3],
  ['tablet-portrait', 820, 1180, 2],
  ['laptop', 1366, 768, 1],
];
const only = process.argv[2];
for (const [name, width, height, dpr] of SIZES) {
  if (only && only !== name) continue;
  const { browser, page, errors } = await launch({ width, height, deviceScaleFactor: dpr });
  await page.setViewport({ width, height, deviceScaleFactor: dpr, hasTouch: name !== 'laptop', isMobile: name.startsWith('phone') });
  const out = { name, width, height };
  try {
    await openPlayground(page);
    await sleep(800);
    out.audit = await page.evaluate(() => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const visible = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0; };
      const buttons = [...document.querySelectorAll('button, [role="button"], input[type="color"], a[href]')].filter(visible);
      const label = (b) => (b.title || b.getAttribute('aria-label') || b.innerText || '').trim().slice(0, 32);
      const offScreen = [], small = [];
      for (const b of buttons) {
        const r = b.getBoundingClientRect();
        if (r.right > vw + 1 || r.bottom > vh + 1 || r.left < -1 || r.top < -1) offScreen.push(label(b));
        if (r.width < 44 || r.height < 44) small.push(`${label(b)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      const sizes = buttons.map((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height));
      const dock = [...document.querySelectorAll('div')].filter((d) => d.querySelector(':scope > button[title^="Pen"]'))[0];
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      const dockParent = dock ? dock.parentElement.getBoundingClientRect() : null;
      return {
        viewport: `${vw}x${vh}`,
        pageScrolls: document.documentElement.scrollWidth > vw + 1 || document.documentElement.scrollHeight > vh + 1,
        scrollSize: `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`,
        buttons: buttons.length,
        offScreen: offScreen.length,
        offScreenNames: offScreen.slice(0, 14),
        under44: small.length,
        smallest: Math.round(Math.min(...sizes)),
        medianSize: Math.round(sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)]),
        dock: dockRect && `${Math.round(dockRect.left)},${Math.round(dockRect.top)} ${Math.round(dockRect.width)}x${Math.round(dockRect.height)}`,
        dockContainer: dockParent && `${Math.round(dockParent.left)},${Math.round(dockParent.top)} ${Math.round(dockParent.width)}x${Math.round(dockParent.height)}`,
        hoverOnly: document.querySelectorAll('[class*="group-hover:opacity-100"], [class*="group-hover/"]').length,
        viewportMeta: document.querySelector('meta[name="viewport"]')?.content || '(none)',
      };
    });
    await shot(page, `screen-${name}`);
    await clickTitle(page, 'Stroke & Canvas Settings').catch((e) => { out.settingsError = String(e.message); });
    await sleep(300);
    out.settingsPanel = await page.evaluate(() => {
      const el = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Ballpoint');
      if (!el) return 'not found';
      let panel = el;
      for (let i = 0; i < 6 && panel.parentElement; i++) { panel = panel.parentElement; if (getComputedStyle(panel).position === 'absolute' || getComputedStyle(panel).position === 'fixed') break; }
      const r = panel.getBoundingClientRect();
      return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} (fits: ${r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight})`;
    });
    await shot(page, `screen-${name}-settings`);

    // Close settings panel
    await clickTitle(page, 'Stroke & Canvas Settings').catch(() => {});
    await sleep(200);

    // Dialog 1: Send to Notes (InkToBlockConverterModal)
    await clickTitle(page, 'Sync Whiteboard to Notes Workspace').catch(() => {});
    await sleep(350);
    out.syncDialog = await page.evaluate(() => {
      const modal = document.querySelector('[data-insert-dialog="Send to Notes"]');
      if (!modal) return 'not found';
      const r = modal.getBoundingClientRect();
      return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} (fits: ${r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight})`;
    });
    await shot(page, `screen-${name}-sync`);
    await page.evaluate(() => {
      const cancel = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Cancel');
      if (cancel) cancel.click();
    });
    await sleep(250);

    // Dialog 2: the leave prompt (UnsavedChangesModal). It only shows after a failed save, so
    // IndexedDB is made to fail and the page is changed first.
    await page.evaluate(() => {
      window.indexedDB.open = () => {
        throw new Error('IndexedDB switched off for this check');
      };
    });
    await page.mouse.move(width / 2 - 20, height / 2);
    await page.mouse.down();
    await page.mouse.move(width / 2 + 20, height / 2 + 10, { steps: 4 });
    await page.mouse.up();
    await sleep(1200);
    await page.evaluate(() => {
      if (window.__NETZ_OPEN_UNSAVED_MODAL__) window.__NETZ_OPEN_UNSAVED_MODAL__('/');
    });
    await sleep(350);
    out.unsavedDialog = await page.evaluate(() => {
      const modal = document.querySelector('[data-insert-dialog^="Your latest changes"]');
      if (!modal) return 'not found';
      const r = modal.getBoundingClientRect();
      return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} (fits: ${r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight})`;
    });
    await shot(page, `screen-${name}-unsaved`);
    await page.evaluate(() => {
      const stay = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Stay');
      if (stay) stay.click();
    });
    await sleep(250);
  } catch (e) {
    out.exception = String((e && e.stack) || e).slice(0, 300);
  }
  out.errors = errors.slice(0, 3);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
