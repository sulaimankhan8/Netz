// Checks for the Note look (board "Netz Notes Redesign", artboards 11 to 14): note colour, icon
// (maths, icons, letters), cover patterns, status with the list filter, tag colours.
// Run against a server, e.g. NETZ_URL=http://localhost:3211 node notes-look.mjs
import fs from 'fs';
import path from 'path';
import { launch, sleep, shot, BASE, SHOTS } from './lib.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

async function openNotes(page) {
  await page.goto(`${BASE}/Notes`, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.waitForSelector('aside[aria-label="Notes"], main', { timeout: 60000 });
  await sleep(600);
}

/** Clicks (or taps) the first visible element matching css whose aria-label or text contains text. */
async function press(page, css, text, { tap = false, exact = false } = {}) {
  const handle = await page.evaluateHandle(
    (css, text, exact) => {
      const visible = (el) => el.getClientRects().length > 0;
      return (
        [...document.querySelectorAll(css)].find((el) => {
          if (!visible(el)) return false;
          const label = (el.getAttribute('aria-label') || '').trim();
          const inner = el.innerText.trim();
          return exact ? label === text || inner === text : (label + ' ' + inner).includes(text);
        }) || null
      );
    },
    css,
    text,
    exact
  );
  const el = handle.asElement();
  if (!el) throw new Error(`not found: ${css} "${text}"`);
  if (tap) await el.tap();
  else await el.click();
  await sleep(250);
}

const savedNote = (page, index = 0) =>
  page.evaluate((i) => {
    const notes = JSON.parse(localStorage.getItem('netz_notes_v2_data') || '[]');
    return notes[i] ? { title: notes[i].title, look: notes[i].look || null, status: notes[i].status || null, badges: notes[i].badges || [] } : null;
  }, index);
const bg = (page, css) => page.evaluate((css) => { const el = document.querySelector(css); return el ? getComputedStyle(el).backgroundColor : null; }, css);

// ---------------------------------------------------------------- laptop
{
  const { browser, page, errors } = await launch({ width: 1440, height: 900 });
  // Keep the picture the PDF export makes, to look at it
  await page.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      const url = original.apply(this, args);
      if (this.width > 1000 && this.height > 1000) window.__pdfPicture = url;
      return url;
    };
  });
  try {
    await openNotes(page);
    check('a note without a look shows the dashed look tile', !!(await page.$('button[aria-label="Give this note a look"]')));
    check('no cover, icon or status yet', !(await page.$('[data-note-cover]')) && !(await page.$('[data-note-icon]')));

    await press(page, 'main button', 'Note look');
    const panel = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Note look"]');
      if (!d) return null;
      const r = d.getBoundingClientRect();
      return { inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight + 1, w: Math.round(r.width) };
    });
    check('Note look opens as a panel by its button, on screen', panel && panel.inView, JSON.stringify(panel));

    // Note colour
    await press(page, '[data-note-look] button', 'Purple', { exact: true });
    let saved = await savedNote(page);
    check('choosing a colour saves it on the note', saved?.look?.colour === 'purple', JSON.stringify(saved?.look));

    // Icon: line icons, maths, letters
    await press(page, '[data-note-look] button', 'Icons', { exact: true });
    await press(page, '[data-note-look] button', 'Atom', { exact: true });
    saved = await savedNote(page);
    check('Icons tab: Atom becomes the page icon', saved?.look?.icon?.kind === 'icon' && saved.look.icon.value === 'atom' && !!(await page.$('[data-note-icon]')));
    await press(page, '[data-note-look] button', 'Maths', { exact: true });
    await press(page, '[data-note-look] button', 'Symbol σ', { exact: true });
    saved = await savedNote(page);
    check('Maths tab: σ becomes the page icon', saved?.look?.icon?.kind === 'maths' && saved.look.icon.value === 'σ');
    await press(page, '[data-note-look] button', 'Letters', { exact: true });
    await page.click('[data-note-look] input[aria-label^="Up to two"]');
    await page.keyboard.type('U1x');
    await sleep(250);
    saved = await savedNote(page);
    const iconText = await page.evaluate(() => document.querySelector('[data-note-icon]')?.innerText);
    check('Letters tab: up to two characters (U1)', saved?.look?.icon?.value === 'U1' && iconText === 'U1', `${saved?.look?.icon?.value} / ${iconText}`);
    await press(page, '[data-note-look] button', 'Icons', { exact: true });
    await press(page, '[data-note-look] button', 'Atom', { exact: true });

    // Cover
    await press(page, '[data-note-look] button', 'Graph', { exact: true });
    const coverBg = await page.evaluate(() => {
      const c = document.querySelector('[data-note-cover]');
      const f = c?.querySelector('[data-banner-fill]');
      return f ? { pattern: c.dataset.noteCover, colour: getComputedStyle(f).backgroundColor, image: getComputedStyle(f).backgroundImage.slice(0, 15) } : null;
    });
    check('Graph cover shows in the note colour with its pattern', coverBg?.pattern === 'graph' && coverBg.colour === 'rgb(241, 235, 253)' && coverBg.image.startsWith('linear-gradient'), JSON.stringify(coverBg));
    const overlap = await page.evaluate(() => {
      const c = document.querySelector('[data-note-cover]').getBoundingClientRect();
      const i = document.querySelector('[data-note-icon]').getBoundingClientRect();
      return Math.round(c.bottom - i.top);
    });
    check('the icon sits on the cover edge', overlap > 20 && overlap < 60, `${overlap} px over the cover`);

    // Banner art
    await press(page, '[data-note-look] button', 'Art', { exact: true });
    await press(page, '[data-note-look] button', 'Waves art', { exact: true });
    const art = await page.evaluate(() => {
      const c = document.querySelector('[data-note-cover]');
      const svg = c?.querySelector('svg[data-banner-fill="art"]');
      return { kind: c?.dataset.coverKind, value: c?.dataset.noteCover, shapes: svg ? svg.querySelectorAll('path, circle, text, rect, ellipse').length : 0 };
    });
    check('Art tab: Waves art fills the banner', art.kind === 'art' && art.value === 'waves' && art.shapes >= 5, JSON.stringify(art));

    // A picture from this device, kept in IndexedDB
    const picture = path.join(SHOTS, 'banner-upload.png');
    const png = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 400;
      const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 1200, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#6366f1');
      g.fillStyle = grad;
      g.fillRect(0, 0, 1200, 400);
      return c.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync(picture, Buffer.from(png, 'base64'));
    await press(page, '[data-note-look] button', 'Picture', { exact: true });
    const input = await page.$('[data-note-look] input[type="file"]');
    await input.uploadFile(picture);
    let uploaded = null;
    for (let i = 0; i < 30 && !uploaded; i++) {
      await sleep(200);
      uploaded = await page.evaluate(() => {
        const c = document.querySelector('[data-note-cover][data-cover-kind="image"]');
        const f = c?.querySelector('[data-banner-fill="image"]');
        const img = f ? getComputedStyle(f).backgroundImage : '';
        return img.startsWith('url("blob:') ? { id: c.dataset.noteCover } : null;
      });
    }
    const idbCount = () =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const req = indexedDB.open('NETZ_NOTES_IMAGES', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('banners');
            req.onsuccess = () => {
              const db = req.result;
              const count = db.transaction('banners').objectStore('banners').count();
              count.onsuccess = () => {
                resolve(count.result);
                db.close();
              };
            };
            req.onerror = () => resolve(-1);
          })
      );
    check('Picture tab: an uploaded picture becomes the banner, kept on this device', !!uploaded && (await idbCount()) === 1, JSON.stringify(uploaded));
    await shot(page, 'notes-look-picture');
    await press(page, '[data-note-look] button', 'Patterns', { exact: true });
    await press(page, '[data-note-look] button', 'Graph', { exact: true });
    await sleep(300);
    check('replacing the picture deletes it from the device', (await idbCount()) === 0);

    // Status
    await press(page, '[data-note-look] button', 'Revise', { exact: true });
    saved = await savedNote(page);
    const rowStatus = await page.evaluate(() => document.querySelector('aside [aria-current]')?.innerText.includes('Revise'));
    const filterChip = await page.evaluate(() => document.querySelector('[data-status-filter="revise"]')?.innerText.replace(/\s+/g, ' ').trim());
    check('status Revise: on the note, in its list row, and in the filter with a count', saved?.status === 'revise' && rowStatus && filterChip === 'Revise 1', `${saved?.status} / ${rowStatus} / ${filterChip}`);

    // Tag colours
    await press(page, '[data-note-look] section[aria-label="Tag colours"] button', '# Calculus');
    await press(page, '[data-note-look] button', 'Pink for Calculus', { exact: true });
    const tagChip = await page.evaluate(() => [...document.querySelectorAll('main [data-tag-colour]')].find((t) => t.innerText.includes('Calculus'))?.dataset.tagColour);
    const listTag = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-filter-row] button')].find((x) => x.innerText.includes('# Calculus'));
      return b ? getComputedStyle(b).backgroundColor : null;
    });
    check('tag colour: Calculus is pink in the note and in the list filter', tagChip === 'pink' && listTag === 'rgb(252, 232, 241)', `${tagChip} / ${listTag}`);

    // Badges: up to four, in the banner's corner
    for (const name of ['Exam topic', 'Formula sheet', 'Tricky', 'Mastered']) await press(page, '[data-note-look] section[aria-label="Badges"] button', name, { exact: true });
    const badgeState = await page.evaluate(() => ({
      onBanner: document.querySelectorAll('[data-note-cover] [data-badge]').length,
      fifthOff: [...document.querySelectorAll('[data-note-look] section[aria-label="Badges"] button')].find((b) => b.innerText.includes('Favourite'))?.disabled,
      corner: (() => {
        const c = document.querySelector('[data-note-cover]').getBoundingClientRect();
        const b = document.querySelector('[data-note-cover] [role="list"]').getBoundingClientRect();
        return { top: Math.round(b.top - c.top), right: Math.round(c.right - b.right) };
      })()
    }));
    saved = await savedNote(page);
    check('four badges show in the banner\'s top right corner; a fifth is not offered', badgeState.onBanner === 4 && badgeState.fifthOff === true && badgeState.corner.top <= 16 && badgeState.corner.right <= 16 && saved?.badges?.length === 4, JSON.stringify(badgeState));
    await shot(page, 'notes-look-panel');

    await page.keyboard.press('Escape');
    await sleep(250);
    check('Escape closes Note look', !(await page.$('[role="dialog"][aria-label="Note look"]')));

    // The list shows the icon tile in the note colour
    const tile = await page.evaluate(() => {
      const t = document.querySelector('aside [aria-current] span[aria-hidden="true"]');
      return t ? getComputedStyle(t).backgroundColor : null;
    });
    check('list row shows the icon tile in the note colour', tile === 'rgb(241, 235, 253)', tile);

    // Status filter
    await page.click('[data-status-filter="revise"]');
    await sleep(250);
    const filtered = await page.evaluate(() => document.querySelectorAll('aside button.flex-1').length);
    await page.click('[data-status-filter="revise"]');
    await sleep(250);
    const unfiltered = await page.evaluate(() => document.querySelectorAll('aside button.flex-1').length);
    check('status filter shows only Revise notes, and off again', filtered === 1 && unfiltered === 3, `${filtered} then ${unfiltered}`);
    await shot(page, 'notes-look-laptop');

    // Everything survives a reload
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(800);
    const after = await page.evaluate(() => ({
      cover: document.querySelector('[data-note-cover]')?.dataset.noteCover,
      icon: !!document.querySelector('[data-note-icon]'),
      status: document.querySelector('main')?.innerText.includes('Revise'),
      tag: [...document.querySelectorAll('main [data-tag-colour]')].find((t) => t.innerText.includes('Calculus'))?.dataset.tagColour,
      badges: document.querySelectorAll('[data-note-cover] [data-badge]').length
    }));
    check('after a reload: banner, icon, status, tag colour and badges are kept', after.cover === 'graph' && after.icon && after.status && after.tag === 'pink' && after.badges === 4, JSON.stringify(after));

    // The PDF shows the banner, its badges and the icon
    await page.evaluate(() => (window.__pdfPicture = null));
    await page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => b.innerText.includes('Export'))?.click());
    await sleep(250);
    await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"]')].find((b) => b.innerText.includes('PDF'))?.click());
    let pdfPicture = null;
    for (let i = 0; i < 60 && !pdfPicture; i++) {
      await sleep(400);
      pdfPicture = await page.evaluate(() => window.__pdfPicture);
    }
    if (pdfPicture) fs.writeFileSync(path.join(SHOTS, 'notes-look-pdf.png'), Buffer.from(pdfPicture.split(',')[1], 'base64'));
    check('PDF export runs with the banner on the page', !!pdfPicture);

    // Dark mode uses the dark look colours
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(300);
    const dark = await bg(page, '[data-note-cover] [data-banner-fill]');
    check('dark mode: cover uses the dark purple tint', dark === 'rgb(42, 33, 66)', dark);
    await shot(page, 'notes-look-laptop-dark');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Remove icon and cover
    await press(page, 'main button', 'Note look');
    await page.evaluate(() => [...document.querySelectorAll('[data-note-look] section[aria-label="Icon"] button')].find((b) => b.innerText === 'Remove')?.click());
    await sleep(200);
    await page.evaluate(() => [...document.querySelectorAll('[data-note-look] section[aria-label="Banner"] button')].find((b) => b.innerText === 'Remove')?.click());
    await sleep(250);
    check('Remove takes the icon and the cover away', !(await page.$('[data-note-icon]')) && !(await page.$('[data-note-cover]')));
    const badgesWithoutBanner = await page.evaluate(() => document.querySelectorAll('main [data-badge]').length);
    check('without a banner, the badges sit beside the status', badgesWithoutBanner === 4, String(badgesWithoutBanner));
    await page.keyboard.press('Escape');

    // A banner saved before art existed (just a pattern name) still shows
    await page.evaluate(() => {
      const notes = JSON.parse(localStorage.getItem('netz_notes_v2_data'));
      notes[2].look = { colour: 'green', cover: 'dots' };
      localStorage.setItem('netz_notes_v2_data', JSON.stringify(notes));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(800);
    await press(page, 'aside button.flex-1', 'Unit 5');
    await sleep(300);
    const oldStyle = await page.evaluate(() => {
      const c = document.querySelector('[data-note-cover]');
      return c ? { kind: c.dataset.coverKind, value: c.dataset.noteCover } : null;
    });
    check('an older note whose banner is just "dots" still shows it', oldStyle?.kind === 'pattern' && oldStyle.value === 'dots', JSON.stringify(oldStyle));

    check('laptop: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    check('laptop run', false, e.message);
    await shot(page, 'notes-look-failure').catch(() => {});
  }
  await browser.close();
}

// ---------------------------------------------------------------- phone
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  try {
    await openNotes(page);
    await press(page, 'aside button.flex-1', 'Unit 2', { tap: true });
    await sleep(400);
    await press(page, 'main button', 'More: note look', { tap: true });
    await press(page, '[role="menuitem"]', 'Note look', { tap: true });
    await sleep(300);
    const sheet = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label="Note look"]');
      if (!d) return null;
      const r = d.getBoundingClientRect();
      const small = [...d.querySelectorAll('button')].filter((b) => {
        const s = b.getBoundingClientRect();
        return s.width > 0 && (s.width < 43.5 || s.height < 43.5);
      }).map((b) => `${(b.getAttribute('aria-label') || b.innerText).slice(0, 18)} ${Math.round(b.getBoundingClientRect().width)}x${Math.round(b.getBoundingClientRect().height)}`);
      return { width: Math.round(r.width), bottom: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, small };
    });
    check('phone: Note look opens as a bottom sheet from the ⋯ menu', sheet && sheet.width >= sheet.vw - 1 && sheet.bottom >= sheet.vh - 1, JSON.stringify({ ...sheet, small: sheet?.small.length }));
    check('phone: every control in the sheet is at least 44 px', sheet && sheet.small.length === 0, sheet?.small.slice(0, 6).join(' | '));
    await press(page, '[data-note-look] button', 'Teal', { exact: true, tap: true });
    await press(page, '[data-note-look] button', 'Dots', { exact: true, tap: true });
    await press(page, '[data-note-look] button', 'Exam ready', { exact: true, tap: true });
    await shot(page, 'notes-look-phone-sheet');
    await press(page, '[role="dialog"] button', 'Close Note look', { tap: true });
    const phone = await page.evaluate(() => ({
      cover: document.querySelector('[data-note-cover]')?.dataset.noteCover,
      coverWidth: Math.round(document.querySelector('[data-note-cover]')?.getBoundingClientRect().width || 0),
      status: document.querySelector('main')?.innerText.includes('Exam ready'),
      overflow: document.querySelector('main').scrollWidth - document.querySelector('main').clientWidth
    }));
    check('phone: dots cover edge to edge, Exam ready shown, no sideways scroll', phone.cover === 'dots' && phone.coverWidth >= 389 && phone.status && phone.overflow <= 0, JSON.stringify(phone));
    await shot(page, 'notes-look-phone');
    check('phone: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    check('phone run', false, e.message);
    await shot(page, 'notes-look-phone-failure').catch(() => {});
  }
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
