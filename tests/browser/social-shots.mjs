// Screenshots for the LinkedIn / X launch series (NETZ_SOCIAL_SERIES.md).
//   NETZ_URL=http://localhost:3211 node social-shots.mjs [only]
// Writes PNGs to ../../../social-shots/ (Desktop/netz1/social-shots).
import fs from 'fs';
import path from 'path';
import { launch, sleep, drawStroke, clickTitle, BASE } from './lib.mjs';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..', 'social-shots');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const report = [];

async function go(page, route, theme = 'light') {
  await page.evaluateOnNewDocument((t) => {
    try { localStorage.setItem('theme', t); } catch {}
  }, theme);
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 }).catch(() => {});
  await page.evaluate((t) => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
  // Hide cookie / consent / ad bits so the pictures are clean
  await page.addStyleTag({ content: 'ins.adsbygoogle,[id*="consent" i],[class*="consent" i],nextjs-portal{display:none!important}' }).catch(() => {});
  await sleep(2500);
}

async function save(page, name, clip) {
  const file = path.join(OUT, name + '.png');
  await page.screenshot({ path: file, ...(clip ? { clip } : {}) });
  report.push(name);
}

const jobs = {
  // Parts 1 + 6: landing page, laptop and phone
  async landing() {
    for (const theme of ['light', 'dark']) {
      const { browser, page } = await launch({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await go(page, '/', theme);
      await sleep(7000);
      await save(page, `1-landing-laptop-${theme}`);
      await browser.close();
    }
    const { browser, page } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
    await go(page, '/');
    await save(page, '1-landing-phone');
    await browser.close();
  },
  // Part 2: hub + a method page (Learn) + its solved results
  async hub() {
    const { browser, page } = await launch({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await go(page, '/Algorithems');
    await save(page, '2-algorithm-hub');
    await go(page, '/Gauss-seidal');
    await save(page, '2-method-learn');
    await go(page, '/Gauss-seidal?mode=solve');
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Quick Demo/i.test(b.textContent))?.click());
    await page.waitForSelector('#gauss-seidel-results-container', { timeout: 60000 }).catch(() => {});
    await sleep(2500);
    for (const [tab, name] of [[/Vector Log/i, '2-method-table'], [/Convergence Curve/i, '2-method-graph']]) {
      await page.evaluate((src) => {
        const re = new RegExp(src, 'i');
        [...document.querySelectorAll('button')].find((b) => re.test(b.textContent))?.click();
      }, tab.source);
      await sleep(1200);
      const clip = await page.evaluate(() => {
        const el = document.querySelector('#gauss-seidel-results-container');
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left - 16, y: r.top - 16 + window.scrollY, width: r.width + 32, height: Math.min(r.height + 32, 900) };
      });
      if (clip) await save(page, name, clip);
    }
    const { browser: b2, page: phone } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
    await go(phone, '/Algorithems');
    await save(phone, '2-algorithm-hub-phone');
    await b2.close();
    await browser.close();
  },
  // Part 3: handwriting "1 + 1 =" gets a live answer, then "x" and a graph block
  async playground() {
    const { browser, page, logs } = await launch({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await go(page, '/Playground');
    await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
    await sleep(1500);
    await clickTitle(page, 'Switch to Notes Mode');
    const S = 1.6; // write bigger than the test so it reads in a post
    const at = (x, y) => [Math.round(420 + (x - 300) * S), Math.round(300 + (y - 300) * S)];
    await drawStroke(page, [at(300, 300), at(300, 360)]);
    await sleep(200);
    await drawStroke(page, [at(340, 330), at(380, 330)]);
    await drawStroke(page, [at(360, 310), at(360, 350)]);
    await sleep(200);
    await drawStroke(page, [at(420, 300), at(420, 360)]);
    await sleep(200);
    await drawStroke(page, [at(470, 322), at(510, 322)]);
    await drawStroke(page, [at(470, 338), at(510, 338)]);
    let pill = null;
    for (let i = 0; i < 90; i++) {
      await sleep(1000);
      pill = await page.evaluate(() => document.querySelector('.z-30 .pointer-events-auto')?.innerText || null);
      if (pill && !/Recognizing|Reading|ready/i.test(pill)) break;
    }
    await sleep(800);
    report.push('playground pill: ' + JSON.stringify(pill));
    await save(page, '3-playground-handwriting');
    await browser.close();
  },
  // Part 4: notes
  async notes() {
    const { browser, page } = await launch({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await go(page, '/Notes');
    await save(page, '4-notes');
    await browser.close();
  },
  // Part 5: profile (streaks, medals, mascot) + pricing
  async profile() {
    const { browser, page } = await launch({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await go(page, '/Profile');
    await save(page, '5-robot-onboarding');
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^Skip$/i.test(b.textContent.trim()))?.click());
    await sleep(1500);
    await save(page, '5-profile');
    await go(page, '/Pricing');
    await save(page, '5-pricing');
    await browser.close();
  },
};

for (const [name, job] of Object.entries(jobs)) {
  if (only && only !== name) continue;
  try {
    await job();
  } catch (e) {
    report.push(`${name} FAILED: ${String(e.message || e).slice(0, 200)}`);
  }
}
console.log(report.join('\n'));
console.log('OUT', OUT);
