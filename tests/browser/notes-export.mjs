// Notes: PDF and Markdown export, and opening a note from a link (?open=, ?key=).
// Run against a server, e.g. NETZ_URL=http://localhost:3211 node notes-export.mjs
import fs from 'fs';
import path from 'path';
import { launch, sleep, BASE, SHOTS } from './lib.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const downloads = path.join(SHOTS, 'notes-downloads');
fs.rmSync(downloads, { recursive: true, force: true });
fs.mkdirSync(downloads, { recursive: true });

async function openNotes(page, query = '') {
  await page.goto(`${BASE}/Notes${query}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.waitForSelector('main', { timeout: 30000 });
  await sleep(600);
}

async function clickMenu(page, label) {
  await page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => b.innerText.includes('Export'))?.click());
  await sleep(250);
  await page.evaluate((label) => [...document.querySelectorAll('[role="menuitem"]')].find((b) => b.innerText.includes(label))?.click(), label);
}

const { browser, page, errors } = await launch({ width: 1440, height: 900 });
const cdp = await page.createCDPSession();
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });

// Keep the picture html2canvas makes for the PDF, so it can be looked at
await page.evaluateOnNewDocument(() => {
  const original = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    const url = original.apply(this, args);
    if (this.width > 1000 && this.height > 1000) window.__pdfPicture = url;
    return url;
  };
});

for (const theme of ['light', 'dark']) {
  await openNotes(page);
  if (theme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'));
  await sleep(300);
  await page.evaluate(() => (window.__pdfPicture = null));
  await clickMenu(page, 'Export PDF');
  let picture = null;
  for (let i = 0; i < 60 && !picture; i++) {
    await sleep(500);
    picture = await page.evaluate(() => window.__pdfPicture);
  }
  check(`PDF (${theme}): page picture made`, !!picture);
  if (picture) fs.writeFileSync(path.join(SHOTS, `notes-pdf-${theme}.png`), Buffer.from(picture.split(',')[1], 'base64'));
  await sleep(1500);
}
const pdfs = fs.readdirSync(downloads).filter((f) => f.endsWith('.pdf'));
check('PDF: file downloaded', pdfs.length >= 1, pdfs.join(', '));

// Markdown
await openNotes(page);
await clickMenu(page, 'Export Markdown');
await sleep(1500);
const mdFile = fs.readdirSync(downloads).find((f) => f.endsWith('.md'));
const md = mdFile ? fs.readFileSync(path.join(downloads, mdFile), 'utf8') : '';
check('Markdown: file downloaded with title, tags and formula', md.startsWith('# Unit 1') && md.includes('**Tags**') && md.includes('$$'), mdFile || 'none');

// ?open=<id> opens that note (the Playground's "Open note")
await openNotes(page, '?open=note-demo-2');
const openedTitle = await page.evaluate(() => document.querySelector('main textarea[aria-label="Title"]')?.value);
check('?open= opens that note', /Unit 2/.test(openedTitle || ''), openedTitle);

// ?key=<key> imports a community note and opens it
await openNotes(page, '?key=NETZ-ROOTS1');
const importedTitle = await page.evaluate(() => document.querySelector('main textarea[aria-label="Title"]')?.value);
check('?key= imports and opens the note', /Root Finding/.test(importedTitle || '') && /Imported/.test(importedTitle || ''), importedTitle);

// Phone: a link opens straight on the note, not the list
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await openNotes(page, '?open=note-demo-2');
const phone = await page.evaluate(() => ({ list: !!document.querySelector('aside[aria-label="Notes"]'), title: document.querySelector('main textarea[aria-label="Title"]')?.value }));
check('phone: ?open= shows the note itself', !phone.list && /Unit 2/.test(phone.title || ''), JSON.stringify(phone));

check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
