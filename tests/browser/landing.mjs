import path from 'node:path';
import fs from 'node:fs';
import { launch, sleep, BASE, SHOTS } from './lib.mjs';

// Landing page checks (LANDING_REDESIGN_PLAN.md, "Checks"). Run against a production build:
//   NETZ_URL=http://localhost:3213 node landing.mjs
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
fs.mkdirSync(SHOTS, { recursive: true });

const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

async function open(page, { theme = 'light', tours = null, viewport = null, ua = null } = {}) {
  if (viewport) await page.setViewport(viewport);
  if (ua) await page.setUserAgent(ua);
  await page.evaluateOnNewDocument((t, done) => {
    // Headless Chrome finds NETZ installable and offers its own prompt; hide it so the page takes
    // the path of Safari and Firefox, which have no prompt and get the hint instead
    window.addEventListener('beforeinstallprompt', (e) => e.stopImmediatePropagation(), true);
    localStorage.setItem('theme', t);
    if (done) localStorage.setItem('netz.tours', JSON.stringify(done));
    else localStorage.removeItem('netz.tours');
    localStorage.removeItem('gaussSeidelTourCompleted');
  }, theme, tours);
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 180000 });
  await page.waitForSelector('.ld-root');
  if (theme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'));
  await sleep(800);
}

async function revealAll(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await sleep(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
}

async function fullShot(page, name) {
  await revealAll(page);
  await page.screenshot({ path: path.join(SHOTS, `landing-${name}.png`), fullPage: true });
}

const { browser, page, errors } = await launch({ width: 1280, height: 800 });
try {
  // ---------- Laptop, light ----------
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), t: Date.now() }));
  const t0 = Date.now();
  await open(page);
  const loadAt = await page.evaluate(() => performance.getEntriesByType('navigation')[0].loadEventEnd);
  await sleep(3000);

  const layout = await page.evaluate(() => {
    const footer = document.querySelector('.ld-footer').getBoundingClientRect().bottom + window.scrollY;
    return {
      docH: document.documentElement.scrollHeight,
      footer: Math.round(footer),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
    };
  });
  check('page ends at the footer (no empty scroll)', Math.abs(layout.docH - layout.footer) <= 2, `${layout.docH} vs ${layout.footer}`);
  check('no horizontal scroll on a laptop', layout.overflow <= 0, layout.overflow);
  check('real title and description reach the page', layout.title.startsWith('NETZ: write') && !/Best PWA/.test(layout.desc), `${layout.title} | ${layout.desc.slice(0, 40)}`);
  check('share image is set', layout.ogImage.includes('icon-512'), layout.ogImage);

  const links = await page.evaluate(() => [...document.querySelectorAll('.ld-root a[href]')].map((a) => ({ href: a.getAttribute('href'), brand: a.classList.contains('ld-brand') })));
  check('no link except the logo goes to "/"', links.filter((l) => l.href === '/' && !l.brand).length === 0, links.map((l) => l.href).join(' '));

  const cards = await page.evaluate(() => [...document.querySelectorAll('.ld-tour-grid > .ld-card')].map((c) => ({ tag: c.tagName, href: c.getAttribute('href'), title: c.querySelector('.ld-card-title')?.textContent })));
  check('nine tour cards', cards.length === 9, cards.map((c) => c.title).join(' / '));
  check('each tour card opens its page with ?tour=', cards.filter((c) => c.tag === 'A').every((c) => /\?tour=/.test(c.href)) && cards.filter((c) => c.tag === 'A').length === 7, cards.map((c) => c.href).join(' '));
  const count = await page.$eval('.ld-count', (e) => e.textContent);
  check('tour count starts at 0 of 7', count.trim() === '0 of 7 tours done', count);

  const thirdEarly = requests.filter((r) => /googlesyndication|googletagmanager|doubleclick/.test(r.url) && r.t - t0 < loadAt);
  const thirdAny = requests.filter((r) => /googlesyndication|googletagmanager/.test(r.url));
  check('ads and analytics wait until the page has loaded', thirdEarly.length === 0 && thirdAny.length > 0, `early ${thirdEarly.length}, total ${thirdAny.length}, load ${Math.round(loadAt)} ms`);
  check('no Poppins, Lottie or KaTeX requested', !requests.some((r) => /Poppins|lottie|\/videos\/.*\.json|katex/i.test(r.url)), requests.filter((r) => /Poppins|lottie|katex/i.test(r.url)).map((r) => r.url).join(' '));
  check('original background loads (WebP)', requests.some((r) => r.url.includes('bg1.webp')), '');

  // Step guide: plays by itself while on screen, then follows the step you pick
  await page.evaluate(() => document.querySelector('.ld-guide').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(300);
  const guideStart = await page.evaluate(() => [...document.querySelectorAll('.ld-guide-step')].findIndex((b) => b.getAttribute('aria-current') === 'step'));
  await page.mouse.move(5, 5);
  await sleep(7600);
  const guideAuto = await page.evaluate(() => [...document.querySelectorAll('.ld-guide-step')].findIndex((b) => b.getAttribute('aria-current') === 'step'));
  check('step guide moves on by itself while on screen', guideAuto === (guideStart + 1) % 6, `${guideStart} → ${guideAuto}`);
  await page.evaluate(() => document.querySelectorAll('.ld-guide-step')[3].click());
  await sleep(800);
  const guide = await page.evaluate(() => {
    const img = document.querySelector('.ld-shot-light');
    return {
      current: [...document.querySelectorAll('.ld-guide-step')].findIndex((b) => b.getAttribute('aria-current') === 'step'),
      src: img?.getAttribute('src'),
      loaded: Boolean(img?.complete && img.naturalWidth),
      pins: document.querySelectorAll('.ld-shot .ld-pin').length,
      inside: [...document.querySelectorAll('.ld-shot .ld-pin-dot')].every((d) => {
        const r = d.getBoundingClientRect();
        const s = document.querySelector('.ld-shot').getBoundingClientRect();
        return r.left >= s.left - 16 && r.right <= s.right + 16 && r.top >= s.top - 16 && r.bottom <= s.bottom + 16;
      }),
    };
  });
  check('picking step 4 shows the calculator screenshot with its 4 pins', guide.current === 3 && /guide-calculator-light/.test(guide.src) && guide.loaded && guide.pins === 4 && guide.inside, JSON.stringify(guide));
  await sleep(7600);
  const stays = await page.evaluate(() => [...document.querySelectorAll('.ld-guide-step')].findIndex((b) => b.getAttribute('aria-current') === 'step'));
  check('after you pick a step it stays there', stays === 3, stays);

  // Floating cards: tapping a header brings that card forward
  await page.evaluate(() => document.querySelector('.ld-fc-export .ld-fc-head').click());
  await sleep(100);
  const z = await page.evaluate(() => getComputedStyle(document.querySelector('.ld-fc-export')).zIndex);
  check('tapping a floating card brings it to the front', z === '10', z);

  // Install button without a browser prompt shows the hint
  await page.evaluate(() => document.querySelector('.ld-header .ld-install button').click());
  await sleep(150);
  const hint = await page.$eval('.ld-header .ld-install-hint', (e) => e.textContent).catch(() => '');
  check('Install shows a hint when the browser has no install prompt', /browser menu|Add to Home Screen/.test(hint), hint);
  await page.keyboard.press('Escape');
  await sleep(100);
  const hintGone = await page.$('.ld-header .ld-install-hint');
  check('Escape closes the install hint', !hintGone, '');

  // The hero demo loops by itself: no Replay button, and every part repeats forever
  const loop = await page.evaluate(() => ({
    replay: Boolean(document.querySelector('.ld-replay')),
    infinite: document.querySelector('.ld-demo').getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations === Infinity).length,
  }));
  check('hero demo loops on its own (no Replay button)', !loop.replay && loop.infinite >= 15, JSON.stringify(loop));

  await fullShot(page, 'laptop-light');

  // ---------- Laptop, dark ----------
  await open(page, { theme: 'dark', tours: { notes: true, 'gauss-seidel': true } });
  const dark = await page.evaluate(() => ({
    bg: getComputedStyle(document.querySelector('.ld-root')).backgroundColor,
    bands: getComputedStyle(document.querySelector('.ld-root'), '::before').opacity,
    count: document.querySelector('.ld-count').textContent.trim(),
    done: [...document.querySelectorAll('.ld-card-cta.is-done')].length,
  }));
  check('dark mode: dark paper and the background at full strength', dark.bg === 'rgb(20, 20, 21)' && dark.bands === '1', `${dark.bg} ${dark.bands}`);
  check('finished tours show Done and the count', dark.count === '2 of 7 tours done' && dark.done === 2, `${dark.count}, ${dark.done} done`);
  await fullShot(page, 'laptop-dark');

  // Floating cards: a pile below the fold, spread out once the section is in the middle of the screen
  const pile = await page.$eval('.ld-fc-graph', (e) => Number(getComputedStyle(e).opacity));
  await page.evaluate(() => document.querySelector('.ld-stage').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(500);
  const spread = await page.$eval('.ld-fc-graph', (e) => Number(getComputedStyle(e).opacity));
  check('floating cards spread out when scrolled into view', pile < 1 && spread === 1, `${pile} → ${spread}`);
  await page.screenshot({ path: path.join(SHOTS, 'landing-laptop-dark-float.png') });

  // ---------- Reduce motion ----------
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await open(page);
  const reduced = await page.evaluate(() => ({
    ink: getComputedStyle(document.querySelector('.ld-demo .ld-glyph')).animationName,
    answer: getComputedStyle(document.querySelector('.ld-demo .d-answer')).opacity,
    hidden: [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length,
  }));
  check('reduce motion: no animation, final frame, nothing hidden', reduced.ink === 'none' && reduced.answer === '1' && reduced.hidden === 0, JSON.stringify(reduced));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  // ---------- Phone ----------
  await open(page, { viewport: PHONE, ua: ANDROID_UA });
  const phone = await page.evaluate(() => {
    const h1 = document.querySelector('.ld-h1').getBoundingClientRect();
    const main = document.querySelector('.ld-actions .ld-btn-main').getBoundingClientRect();
    const small = [...document.querySelectorAll('.ld-root a, .ld-root button')]
      .filter((e) => e.offsetParent && !e.closest('.ld-footer'))
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.height < 44 && r.width > 0);
    return {
      h1Bottom: Math.round(h1.bottom),
      mainBottom: Math.round(main.bottom),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      header: getComputedStyle(document.querySelector('.ld-header')).display,
      art: getComputedStyle(document.querySelector('.ld-card-art')).display,
      small: small.length,
    };
  });
  check('phone: headline and main button inside the first screen', phone.mainBottom <= 844, `h1 ends ${phone.h1Bottom}, button ends ${phone.mainBottom}`);
  check('phone: no horizontal scroll', phone.overflow <= 0, phone.overflow);
  check('phone: page header hidden (the app nav bar is there)', phone.header === 'none', phone.header);
  check('phone: tour cards become a list', phone.art === 'none', phone.art);
  check('phone: every button and link at least 44 px tall', phone.small === 0, `${phone.small} smaller`);
  await fullShot(page, 'phone-light');
  await open(page, { viewport: PHONE, ua: ANDROID_UA, theme: 'dark' });
  await fullShot(page, 'phone-dark');

  // ---------- Privacy ----------
  await page.goto(BASE + '/Privacy', { waitUntil: 'load' });
  const privacy = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, title: document.title }));
  check('Privacy page opens', privacy.h1 === 'Privacy' && privacy.title.startsWith('Privacy'), JSON.stringify(privacy));

  check('no page errors', errors.length === 0, errors.join(' | '));
} catch (e) {
  check('script ran to the end', false, e.stack);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && (!r.ok || process.env.VERBOSE) ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
