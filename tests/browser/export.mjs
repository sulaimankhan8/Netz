import fs from 'fs';
import path from 'path';
import { launch, openPlayground, drawStroke, sleep, clickTitle, SHOTS } from './lib.mjs';

const downloads = path.join(SHOTS, '..', 'downloads');
fs.rmSync(downloads, { recursive: true, force: true });
fs.mkdirSync(downloads, { recursive: true });

const { browser, page, errors } = await launch();
const client = await page.createCDPSession();
await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const waitForFile = async (ext) => {
  for (let i = 0; i < 80; i++) {
    const file = fs.readdirSync(downloads).find((f) => f.endsWith(ext));
    if (file) { await sleep(400); return path.join(downloads, file); }
    await sleep(250);
  }
  return null;
};
const exportAs = async (label) => {
  await clickTitle(page, 'Export Canvas');
  await page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === t).click(), label);
};

try {
  await openPlayground(page);

  // Empty page: nothing to export, and it says so
  await exportAs('Export PNG Image');
  await sleep(700);
  const emptyNotice = await page.evaluate(() => document.querySelector('[role="status"]')?.innerText || '');
  check('empty page: says there is nothing to export', /nothing on this page/i.test(emptyNotice), emptyNotice);
  check('empty page: no file is written', fs.readdirSync(downloads).length === 0);

  // Content: a stroke, a highlighter mark, a snapped rectangle, a block, and a stroke that ends up off-screen
  await drawStroke(page, [[300, 300], [360, 250], [420, 300], [480, 350], [540, 300]]);
  await clickTitle(page, 'Highlighter');
  await drawStroke(page, [[300, 300], [540, 300]]);
  await clickTitle(page, 'Shape Tool');
  await drawStroke(page, [[620, 240], [760, 236], [764, 340], [618, 344], [620, 244]], { steps: 12 });
  await clickTitle(page, 'Pen');
  await drawStroke(page, [[1100, 620], [1200, 660]]);
  await clickTitle(page, 'Add Equation Block');
  await sleep(600);
  // Pan the view so the first strokes are off the screen
  await page.mouse.move(640, 400);
  for (let i = 0; i < 8; i++) { await page.mouse.wheel({ deltaX: 150, deltaY: 60 }); await sleep(20); }
  await sleep(300);

  // SVG
  await exportAs('Export SVG Vector');
  const svgFile = await waitForFile('.svg');
  check('SVG file is written', Boolean(svgFile));
  if (svgFile) {
    const svg = fs.readFileSync(svgFile, 'utf8');
    const paths = (svg.match(/<path /g) || []).length;
    check('SVG: every stroke is a vector path', paths === 4, `${paths} paths`);
    check('SVG: not a screenshot (no foreignObject, no toolbar text)', !svg.includes('foreignObject') && !/Theory|Graph|Notes|Add Page/.test(svg.replace(/href="[^"]*"/g, '')));
    check('SVG: the highlighter is under the ink', svg.indexOf('stroke-opacity="0.35"') > 0 && svg.indexOf('stroke-opacity="0.35"') < svg.indexOf('stroke-width="3"'));
    check('SVG: the snapped rectangle has sharp corners', /stroke-linejoin="miter"/.test(svg) && /Z"/.test(svg));
    check('SVG: the block is included as an image', (svg.match(/<image /g) || []).length === 1);
    const vb = (svg.match(/viewBox="([-\d. ]+)"/) || [])[1].split(' ').map(Number);
    check('SVG: covers content that is off-screen (first stroke at x=300, last at x=1200)', vb[0] < 300 && vb[0] + vb[2] > 1200, vb.join(' '));
    check('SVG file name comes from the page title', path.basename(svgFile) === 'netz-page-1.svg', path.basename(svgFile));
  }

  // PNG
  await exportAs('Export PNG Image');
  const pngFile = await waitForFile('.png');
  check('PNG file is written', Boolean(pngFile));
  if (pngFile && svgFile) {
    const buf = fs.readFileSync(pngFile);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    const svg = fs.readFileSync(svgFile, 'utf8');
    const vb = (svg.match(/viewBox="([-\d. ]+)"/) || [])[1].split(' ').map(Number);
    check('PNG: whole page at twice the resolution', w === vb[2] * 2 && h === vb[3] * 2, `${w}x${h} for a ${vb[2]}x${vb[3]} page`);
    check('PNG: is larger than the visible screen area would give', w > 1280, w);
  }

  // PDF
  await exportAs('Export PDF Document');
  const pdfFile = await waitForFile('.pdf');
  check('PDF file is written', Boolean(pdfFile));
  if (pdfFile) {
    const buf = fs.readFileSync(pdfFile);
    check('PDF: is a PDF with one page', buf.slice(0, 5).toString() === '%PDF-' && (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length === 1);
  }
  const doneNotice = await page.evaluate(() => document.querySelector('[role="status"]')?.innerText || '');
  check('a message confirms the export', /Saved netz-page-1\.pdf/.test(doneNotice), doneNotice);
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} export checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
