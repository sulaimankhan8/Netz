import { launch, openPlayground, sleep, clickTitle } from './lib.mjs';
const { browser, page, errors } = await launch();
const out = {};
try {
  await openPlayground(page);
  out.pickedType = await page.evaluate(() => ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)));
  await clickTitle(page, 'Record Voice Note');
  await sleep(1500);
  await clickTitle(page, 'Stop Voice Recording');
  await sleep(1200);
  out.audioBlock = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
    const b = ((s.pages && s.pages[0].blocks) || []).find((x) => x.type === 'audio');
    return b ? { urlStart: b.content.audioUrl.slice(0, 40), seconds: b.content.durationSec } : null;
  });
  // Two blocks added one after the other must not sit on the same spot
  await clickTitle(page, 'Add Theory Block');
  await sleep(300);
  await clickTitle(page, 'Add Graph Block');
  await sleep(500);
  out.positions = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
    return ((s.pages && s.pages[0].blocks) || []).map((b) => `${b.type}@${b.position.x},${b.position.y}`);
  });
  // Writing mode gives back the previous "Read my writing" setting
  const mode = () => page.evaluate(() => localStorage.getItem('netz_playground_read_mode') || 'select');
  out.ocrBefore = await mode();
  await clickTitle(page, 'Switch to Notes Mode');
  await sleep(200);
  out.ocrInNotes = await mode();
  await clickTitle(page, 'Switch to Whiteboard Mode');
  await sleep(200);
  out.ocrAfter = await mode();
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 400);
}
out.errors = errors.slice(0, 5);
console.log(JSON.stringify(out, null, 2));
await browser.close();
