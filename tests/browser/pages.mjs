import { launch, openPlayground, drawStroke, shot, inkPixels, sleep, clickTitle } from './lib.mjs';

// Draw on page 1, add a page, draw there, go back: is page 1's ink still there? Also after a reload?
const { browser, page, errors } = await launch({ deviceScaleFactor: Number(process.env.DPR || 1) });
const out = {};
try {
  await openPlayground(page);
  out.canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas.z-10');
    return { backing: `${c.width}x${c.height}`, css: `${c.clientWidth}x${c.clientHeight}`, dpr: window.devicePixelRatio };
  });
  await drawStroke(page, [[300, 300], [420, 360], [520, 300]]);
  await drawStroke(page, [[300, 400], [520, 400]]);
  await sleep(300);
  out.page1Ink = await inkPixels(page);
  await shot(page, 'pages-1');

  await clickTitle(page, 'Add Fresh Blank Page');
  await sleep(400);
  out.page2InkEmpty = await inkPixels(page);
  await drawStroke(page, [[600, 200], [700, 260]]);
  await sleep(300);
  out.page2Ink = await inkPixels(page);

  await clickTitle(page, 'Previous Page');
  await sleep(400);
  out.backOnPage1Ink = await inkPixels(page);
  await clickTitle(page, 'Next Page');
  await sleep(400);
  out.backOnPage2Ink = await inkPixels(page);
  await clickTitle(page, 'Previous Page');
  await sleep(600);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
  await sleep(2500);
  out.afterReload = await page.evaluate(() => document.querySelector('.fixed.top-4')?.innerText.replace(/\n/g, ' ').slice(0, 40));
  out.afterReloadInk = await inkPixels(page);
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 500);
}
out.errors = errors.slice(0, 8);
console.log(JSON.stringify(out, null, 2));
await browser.close();
