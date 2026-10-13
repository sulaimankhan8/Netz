import { launch, openPlayground, drawStroke, shot, sleep, clickTitle } from './lib.mjs';

// Notes mode: write "1 + 1 =" and expect the live answer "2" beside it.
const { browser, page, errors, logs } = await launch();
const out = {};
try {
  await openPlayground(page);
  await clickTitle(page, 'Switch to Notes Mode');
  await drawStroke(page, [[300, 300], [300, 360]]);
  await sleep(200);
  await drawStroke(page, [[340, 330], [380, 330]]);
  await drawStroke(page, [[360, 310], [360, 350]]);
  await sleep(200);
  await drawStroke(page, [[420, 300], [420, 360]]);
  await sleep(200);
  await drawStroke(page, [[470, 322], [510, 322]]); // =
  await drawStroke(page, [[470, 338], [510, 338]]);
  for (let i = 0; i < 90; i++) {
    await sleep(1000);
    out.pill = await page.evaluate(() => {
      const pill = document.querySelector('.z-30 .pointer-events-auto');
      return pill ? pill.innerText.replace(/\n/g, ' | ') : null;
    });
    if (out.pill && !/Recognizing/.test(out.pill)) break;
  }
  out.answer = await page.evaluate(() => document.querySelector('.z-30 .text-blue-600, .z-30 .dark\\:text-blue-400')?.innerText ?? null);
  out.allPills = await page.evaluate(() => [...document.querySelectorAll('.z-30 .pointer-events-auto')].map((p) => p.innerText.split('\n').join(' | ')));
  out.decoded = logs.filter((l) => /HMER Decoder|Recognized:/.test(l)).slice(-2);
  await shot(page, 'equals');
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 500);
}
out.errors = errors.slice(0, 8);
console.log(JSON.stringify(out, null, 2));
await browser.close();
