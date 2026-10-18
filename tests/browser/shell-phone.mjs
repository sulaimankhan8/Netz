// How the app shell fits a phone: does any page lay out wider than the screen, and where is the
// phone nav bar? Run against a server, e.g. NETZ_URL=http://localhost:3211 node shell-phone.mjs [tag]
import { launch, sleep, shot, BASE } from './lib.mjs';

const PAGES = ['/', '/Notes', '/Algorithems', '/bisection-method', '/newton-forward', '/Setting', '/Profile', '/Playground'];
const tag = process.argv[2] || 'now';
const { browser, page } = await launch({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
let bad = 0;
for (const p of PAGES) {
  try {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(800);
    const m = await page.evaluate(() => {
      const nav = document.querySelector('nav.bg-black');
      const r = nav?.getBoundingClientRect();
      return {
        layoutWidth: window.innerWidth,
        docWidth: document.documentElement.scrollWidth,
        docHeight: document.documentElement.scrollHeight,
        nav: r ? `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}` : 'none'
      };
    });
    const ok = m.layoutWidth <= 391 && m.docWidth <= 391;
    if (!ok) bad++;
    console.log(`${ok ? 'OK  ' : 'WIDE'} ${p.padEnd(18)} layout ${m.layoutWidth}  doc ${m.docWidth}x${m.docHeight}  nav ${m.nav}`);
    await shot(page, `shell-${tag}${p === '/' ? '-home' : p.replace(/\//g, '-')}`);
    // The phone menu button can be tapped and opens the menu
    const menuButton = await page.$('nav[data-app-nav] button[aria-label="Open menu"]');
    if (menuButton) {
      const box = await menuButton.boundingBox();
      await menuButton.tap();
      await sleep(300);
      const items = await page.evaluate(() => [...document.querySelectorAll('nav[data-app-nav] .absolute button')].map((b) => b.innerText.trim()));
      const menuOk = box && box.width >= 44 && box.height >= 44 && box.x + box.width <= 390 && items.length === 4;
      if (!menuOk) bad++;
      console.log(`${menuOk ? 'OK  ' : 'BAD '} ${p.padEnd(18)} menu button ${box ? `${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)}` : 'none'}, items: ${items.join(' / ')}`);
      if (p === '/') await shot(page, `shell-${tag}-menu-open`);
    } else if (p !== '/Playground') {
      bad++;
      console.log(`BAD  ${p.padEnd(18)} no menu button`);
    }
  } catch (e) {
    bad++;
    console.log(`ERR  ${p}  ${e.message}`);
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
