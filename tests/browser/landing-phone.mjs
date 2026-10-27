import { launch, sleep } from './lib.mjs';

// The landing page's phone layout (board "NETZ landing on a phone"): first screen holds the demo,
// tours swipe with dots, method cards are a still 2x2 grid, the step guide uses phone shots,
// footer drops the app links. Run at 390x844 (default) and 360x740.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 390), H = Number(process.env.H || 844);
const { browser, page, errors } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
let pass = 0, fail = 0;
const check = (name, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? '  ' + info : ''}`); };

await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(1500);
let m = await page.evaluate(() => {
  const demo = document.querySelector('.ld-demo').getBoundingClientRect();
  const tabs = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  const answer = document.querySelector('.ld-answer');
  return {
    demoBottom: demo.bottom, demoTop: demo.top, tabsTop: tabs.top,
    answerOneLine: answer.getBoundingClientRect().height < 50,
    docW: document.documentElement.scrollWidth, vw: innerWidth,
    pageH: document.documentElement.scrollHeight,
  };
});
check('no sideways scroll', m.docW <= m.vw, `${m.docW}/${m.vw}`);
// Tall phones (800 px+) show the whole demo on the first screen; shorter ones show its start
if (H >= 800) check('live demo fits on the first screen', m.demoBottom <= m.tabsTop + 2, `demo ends ${Math.round(m.demoBottom)}, row at ${Math.round(m.tabsTop)}`);
else check('live demo starts on the first screen', m.demoTop <= m.tabsTop - 120, `demo starts ${Math.round(m.demoTop)}, row at ${Math.round(m.tabsTop)}`);
check('demo answer on one line', m.answerOneLine);
check('page is under 4,000 px (was 5,760)', m.pageH < 4000, `${m.pageH} px`);

// Tours: one swipe row, dots follow it, the "Soon" card is hidden
m = await page.evaluate(async () => {
  const row = document.querySelector('.ld-tour-grid');
  const cards = [...row.children].filter((c) => getComputedStyle(c).display !== 'none');
  const dots = document.querySelectorAll('.ld-tour-dots span');
  const before = [...dots].findIndex((d) => d.classList.contains('is-on'));
  row.scrollTo({ left: cards[0].getBoundingClientRect().width * 3 + 30, behavior: 'instant' });
  row.dispatchEvent(new Event('scroll'));
  await new Promise((r) => setTimeout(r, 400));
  const after = [...dots].findIndex((d) => d.classList.contains('is-on'));
  return {
    scrolls: row.scrollWidth > row.clientWidth, cards: cards.length, dots: dots.length, before, after,
    soonHidden: !cards.some((c) => c.classList.contains('is-soon')),
    meter: getComputedStyle(document.querySelector('.ld-tour-meter')).display,
  };
});
check('tours are one swipe row', m.scrolls);
check('one dot per card, Soon card hidden', m.dots === m.cards && m.soonHidden, `${m.dots} dots, ${m.cards} cards`);
check('dots follow the swipe', m.before === 0 && m.after === 3, `${m.before} -> ${m.after}`);
check('tours progress bar shown', m.meter === 'flex');

// Method cards: 2x2 and still
m = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.ld-fc')].map((c) => c.getBoundingClientRect());
  const cols = new Set(cards.map((r) => Math.round(r.left))).size;
  return { cols, rows: new Set(cards.map((r) => Math.round(r.top))).size, anim: getComputedStyle(document.querySelector('.ld-fc')).animationName };
});
check('method cards are a 2x2 grid', m.cols === 2 && m.rows === 2, `${m.cols} cols, ${m.rows} rows`);
check('method cards hold still', m.anim === 'none', m.anim);

// Step guide: phone shots, readable, Next works
m = await page.evaluate(async () => {
  const img = [...document.querySelectorAll('.ld-shot img')].find((i) => i.offsetParent);
  const first = img?.getAttribute('src');
  const width = img?.getBoundingClientRect().width;
  [...document.querySelectorAll('.ld-guide-nav button')].find((b) => /Next/.test(b.textContent)).click();
  await new Promise((r) => setTimeout(r, 600));
  const img2 = [...document.querySelectorAll('.ld-shot img')].find((i) => i.offsetParent);
  return {
    first, width, second: img2?.getAttribute('src'),
    kicker: document.querySelector('.ld-guide-caption-kicker')?.textContent,
    pins: document.querySelectorAll('.ld-shot .ld-pin').length,
  };
});
check('step guide uses phone shots', /-phone\.webp$/.test(m.first || ''), m.first);
check('step shot is phone-wide', m.width > W - 80, `${Math.round(m.width)} px`);
check('Next moves to step 2', /Step 2 of 6/.test(m.kicker || '') && m.second !== m.first, m.kicker);
check('step 2 has its pins', m.pins >= 2, `${m.pins} pins`);

// Closing card and footer
m = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.ld-cta .ld-btn')].map((b) => b.getBoundingClientRect());
  return {
    heights: btns.map((r) => Math.round(r.height)), widths: btns.map((r) => Math.round(r.width)),
    footer: [...document.querySelectorAll('.ld-footer a')].filter((a) => a.offsetParent).map((a) => a.textContent),
  };
});
check('closing buttons match', m.heights.every((h) => h >= 48) && new Set(m.widths).size === 1, `${m.heights} / ${m.widths}`);
check('footer keeps Pricing, Privacy, Terms, Refunds, Contact', m.footer.join(',') === 'Pricing,Privacy,Terms,Refunds,Contact', m.footer.join(','));

check('no page errors', errors.filter((e) => !/hydrat/i.test(e)).length === 0, errors.slice(0, 2).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
