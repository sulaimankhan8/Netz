import { launch, openPlayground, drawStroke, shot, inkPixels, sleep, clickTitle, BASE } from './lib.mjs';

const { browser, page, errors, logs } = await launch();
const out = {};
try {
  await openPlayground(page);
  out.dock = await page.evaluate(() => [...document.querySelectorAll('button[title]')].map((b) => b.title).slice(0, 40));
  out.before = await inkPixels(page);

  // "1 + 1 =" written with straight strokes
  await drawStroke(page, [[300, 300], [300, 360]]);                 // 1
  await sleep(250);
  await drawStroke(page, [[340, 330], [380, 330]]);                 // + horizontal
  await drawStroke(page, [[360, 310], [360, 350]]);                 // + vertical
  await sleep(250);
  await drawStroke(page, [[420, 300], [420, 360]]);                 // 1
  await sleep(250);
  out.afterInk = await inkPixels(page);
  await shot(page, 'smoke-1-ink');

  // Live recognition is off by default (selection mode): lasso the ink
  await clickTitle(page, 'Lasso Select');
  await drawStroke(page, [[270, 270], [470, 270], [470, 390], [270, 390], [270, 275]], { steps: 12 });
  // wait for the preview pill to settle (model download + recognition)
  for (let i = 0; i < 120; i++) {
    await sleep(1000);
    const state = await page.evaluate(() => {
      const pill = document.querySelector('.z-30 .pointer-events-auto');
      return pill ? pill.innerText : null;
    });
    out.pill = state;
    if (state && !/Recognizing/.test(state)) break;
  }
  await shot(page, 'smoke-2-lasso');
  out.pipelineLogs = logs.filter((l) => /NETZ Neural Pipeline|HMER Decoder|RecognitionPipeline|ModelManager/.test(l)).slice(-6);

  // The collection page
  await page.goto(BASE + '/Playground/collect', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForSelector('canvas', { timeout: 120000 });
  await sleep(1500);
  await drawStroke(page, [[400, 330], [440, 300], [480, 340], [520, 310]]);
  await sleep(300);
  out.collect = await page.evaluate(() => ({
    heading: document.querySelector('h1')?.innerText,
    saveEnabled: ![...document.querySelectorAll('button')].find((b) => /Save & next/.test(b.innerText))?.disabled,
    deviceRows: [...document.querySelectorAll('dl > div')].map((d) => d.innerText.replace(/\n/g, ': ')).slice(0, 8),
  }));
  await shot(page, 'smoke-3-collect');
} catch (e) {
  out.exception = String(e && e.stack || e).slice(0, 600);
}
out.errors = errors.slice(0, 10);
console.log(JSON.stringify(out, null, 2));
await browser.close();
