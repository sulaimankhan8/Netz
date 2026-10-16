import {
  saveSession,
  readSessionBackup,
  pickNewerSession,
  isUsableSession,
  estimateSessionChars,
  backupState,
} from './src/app/(Primary.pages)/Playground/utils/smartBlockStore.js';
import {
  scaledImageSize,
  fitImageBox,
  resizeKeepingAspect,
  dataUrlBytes,
  needsShrinking,
  MAX_IMAGE_SIDE,
  KEEP_AS_IS_BYTES,
} from './src/app/(Primary.pages)/Playground/utils/imageSizing.js';

/**
 * Session storage: the newer of the two saved copies wins, and a backup that no longer fits
 * in localStorage is removed instead of being left behind as a stale copy.
 * Image sizing: pictures are scaled down on the way in and keep their proportions.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

// --- A localStorage stand-in with a size limit, like the real one
function makeStorage(limitChars) {
  const data = new Map();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => {
      if (String(v).length > limitChars) {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      data.set(k, String(v));
    },
    removeItem: (k) => data.delete(k),
  };
}
const KEY = 'NETZ_PLAYGROUND_SESSION_BACKUP';
const session = (strokes, extra = {}) => ({ pages: [{ id: 'p1', strokes, blocks: [], links: [] }], currentPageIndex: 0, blocks: [], links: [], ...extra });

// --- pickNewerSession
const older = session(['a'], { updatedAt: 1000 });
const newer = session(['a', 'b'], { updatedAt: 2000 });
const unstamped = session(['legacy']);
expect('the later save wins (second newer)', pickNewerSession(older, newer) === newer);
expect('the later save wins (first newer)', pickNewerSession(newer, older) === newer);
expect('a tie keeps the first copy', pickNewerSession(older, { ...older }) === older);
expect('a copy from before timestamps loses to a stamped one', pickNewerSession(unstamped, older) === older);
expect('two unstamped copies keep the first', pickNewerSession(unstamped, session(['other'])) === unstamped);
expect('a missing first copy falls back to the second', pickNewerSession(null, older) === older);
expect('a missing second copy keeps the first', pickNewerSession(older, null) === older);
expect('nothing saved gives null', pickNewerSession(null, null) === null);
expect('a copy with no pages is not usable', pickNewerSession({ pages: [] , updatedAt: 9999 }, older) === older);
expect('isUsableSession rejects junk', !isUsableSession(null) && !isUsableSession({}) && !isUsableSession({ pages: 'x' }) && !isUsableSession({ pages: [] }));
expect('isUsableSession accepts a session with a page', isUsableSession(older));

// --- saveSession / readSessionBackup
globalThis.localStorage = makeStorage(2000);
expect('with nothing saved the backup reads as null', readSessionBackup() === null);

const before = Date.now();
const wrote = saveSession('default_session', session(['s1']));
expect('a session that fits is written to the backup', wrote === true && globalThis.localStorage.data.has(KEY));
const back = readSessionBackup();
expect('the backup reads back with its content', back && back.pages[0].strokes[0] === 's1');
expect('the backup carries a timestamp', back && back.updatedAt >= before && back.updatedAt <= Date.now());

// A session that has outgrown localStorage
const big = session(new Array(400).fill('a-long-stroke-record'));
const wroteBig = saveSession('default_session', big);
expect('a session too large for localStorage reports that the backup was not written', wroteBig === false);
expect('and the old, now stale backup is removed', !globalThis.localStorage.data.has(KEY) && readSessionBackup() === null);

// Back under the limit: the backup returns
expect('once the session fits again the backup is written again', saveSession('default_session', session(['s2'])) === true && readSessionBackup().pages[0].strokes[0] === 's2');

// Corrupt or foreign data never crashes start-up
globalThis.localStorage.data.set(KEY, '{not json');
expect('a corrupt backup reads as null', readSessionBackup() === null);
globalThis.localStorage.data.set(KEY, JSON.stringify({ pages: [] }));
expect('a backup with no pages reads as null', readSessionBackup() === null);

// Storage that throws on every call (private mode on some browsers)
globalThis.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
let threw = false;
let result;
try { result = saveSession('default_session', session(['x'])); } catch (e) { threw = true; }
expect('storage that refuses everything does not throw on save', !threw && result === false);
threw = false;
try { result = readSessionBackup(); } catch (e) { threw = true; }
expect('storage that refuses everything does not throw on read', !threw && result === null);

// The caller's object is not modified (history snapshots share these objects)
globalThis.localStorage = makeStorage(1e6);
const untouched = session(['keep']);
saveSession('default_session', untouched);
expect('saving does not add fields to the caller\'s object', !('updatedAt' in untouched));

// --- estimateSessionChars: close enough to decide whether a session can fit, without writing it
{
  let seed = 7;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const inkStroke = (i, n) => {
    const points = [];
    for (let j = 0; j < n; j++) points.push({ x: 200 + rand() * 900, y: 100 + rand() * 600, pressure: rand(), timestamp: 1791863284304 + i * 400 + j * 8.3, pointerType: 'pen', tiltX: Math.round(rand() * 40), tiltY: Math.round(rand() * 40) });
    return { id: `stroke_${1791863284304 + i}_ab12cd`, color: '#3B82F6', width: 3, tool: 'pen', points, bbox: { minX: 200.123456, minY: 100.123456, maxX: 1100.123456, maxY: 700.123456 }, hasPressure: true };
  };
  const mouseStroke = (i, n) => {
    const points = [];
    for (let j = 0; j < n; j++) points.push({ x: 300 + j * 2, y: 240 + j, pressure: 0.5, timestamp: 5000 + j * 16, pointerType: 'mouse' });
    return { id: `stroke_${i}`, color: '#18181B', width: 2, tool: 'pen', points, bbox: { minX: 300, minY: 240, maxX: 400, maxY: 290 } };
  };
  const ratio = (s) => estimateSessionChars(s) / JSON.stringify(s).length;

  const penPage = session(Array.from({ length: 300 }, (_, i) => inkStroke(i, 45)));
  expect('estimate: pen ink is within 35% of the real size', ratio(penPage) > 0.65 && ratio(penPage) < 1.35, `(ratio ${ratio(penPage).toFixed(2)})`);
  const mousePage = session(Array.from({ length: 300 }, (_, i) => mouseStroke(i, 20)));
  expect('estimate: mouse ink is never underestimated by much', ratio(mousePage) > 0.9 && ratio(mousePage) < 2.2, `(ratio ${ratio(mousePage).toFixed(2)})`);

  const picture = 'data:image/webp;base64,' + 'A'.repeat(800000);
  const withPicture = { pages: [{ id: 'p', strokes: [], blocks: [{ blockId: 'b1', type: 'image', content: { imageUrl: picture, caption: '', aspectRatio: 1.5 }, position: { x: 1, y: 2 }, size: { width: 360, height: 240 }, linkedBlockIds: [] }], links: [] }], currentPageIndex: 0, blocks: [], links: [] };
  withPicture.blocks = withPicture.pages[0].blocks;
  expect('estimate: a picture is counted, in both places it is stored', ratio(withPicture) > 0.95 && ratio(withPicture) < 1.05, `(ratio ${ratio(withPicture).toFixed(2)})`);

  const graph = { blockId: 'g', type: 'graph', content: { graphData: { datasets: [{ label: 'f', data: Array.from({ length: 400 }, (_, i) => ({ x: i / 20 - 10, y: Math.sin(i / 20) })) }] } }, position: { x: 0, y: 0 }, size: { width: 440, height: 320 }, linkedBlockIds: [] };
  const withGraph = { pages: [{ id: 'p', strokes: [], blocks: [graph], links: [] }], currentPageIndex: 0, blocks: [graph], links: [] };
  expect('estimate: a graph\'s plotted points are counted', ratio(withGraph) > 0.5 && ratio(withGraph) < 2, `(ratio ${ratio(withGraph).toFixed(2)})`);

  expect('estimate: an empty session is small', estimateSessionChars(session([])) < 1000);
  expect('estimate: junk is zero, not an error', estimateSessionChars(null) === 0 && estimateSessionChars({}) === 0);
  const twoPages = { pages: [penPage.pages[0], penPage.pages[0]], currentPageIndex: 0, blocks: [], links: [] };
  expect('estimate: every page is counted', estimateSessionChars(twoPages) > estimateSessionChars(penPage) * 1.9);

  // A refusal of a tiny session (storage switched off, earlier in this file) must not stop small saves being tried
  expect('the limit never drops below a size that is cheap to try', backupState.limitChars >= 200000, `(${backupState.limitChars})`);
  backupState.limitChars = 4000000;

  // A session that cannot fit is never turned into text at all
  const realStringify = JSON.stringify;
  let stringifyCalls = 0;
  JSON.stringify = (...a) => { stringifyCalls++; return realStringify(...a); };
  globalThis.localStorage = makeStorage(5e6);
  saveSession('default_session', session(['small']));
  const callsForSmall = stringifyCalls;
  const huge = session(Array.from({ length: 2500 }, (_, i) => inkStroke(i, 30)));
  stringifyCalls = 0;
  const wroteHuge = saveSession('default_session', huge);
  JSON.stringify = realStringify;
  expect('a small session is serialised once', callsForSmall === 1, `(${callsForSmall})`);
  expect('a session estimated over the limit is not serialised', stringifyCalls === 0 && wroteHuge === false, `(${stringifyCalls} calls)`);
  expect('and the older backup is removed', !globalThis.localStorage.data.has(KEY));

  // A browser with a lower limit than assumed: learnt from the first refusal
  backupState.limitChars = 4000000;
  globalThis.localStorage = makeStorage(1500000); // refuses anything over 1.5 M characters
  const medium = session(Array.from({ length: 500 }, (_, i) => inkStroke(i, 40))); // about 3 MB
  let setItemCalls = 0;
  const countingSetItem = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = (k, v) => { setItemCalls++; return countingSetItem(k, v); };
  expect('first save: tried, and refused by the browser', saveSession('default_session', medium) === false && setItemCalls === 1);
  expect('the limit is lowered to below that session', backupState.limitChars < estimateSessionChars(medium));
  expect('second save of the same session: not tried again', saveSession('default_session', medium) === false && setItemCalls === 1, `(${setItemCalls} tries)`);
  expect('a small session is still written after that', saveSession('default_session', session(['tiny'])) === true && setItemCalls === 2);
  backupState.limitChars = 4000000;
}

// --- scaledImageSize
let s = scaledImageSize(4032, 3024);
expect('a 12 MP landscape photo is scaled to 1600 on the long side', s.width === 1600 && s.height === 1200, JSON.stringify(s));
s = scaledImageSize(3024, 4032);
expect('a portrait photo is scaled to 1600 on the long side', s.width === 1200 && s.height === 1600, JSON.stringify(s));
s = scaledImageSize(800, 600);
expect('a small picture is never scaled up', s.width === 800 && s.height === 600);
s = scaledImageSize(1600, 900);
expect('a picture exactly at the limit is unchanged', s.width === 1600 && s.height === 900);
s = scaledImageSize(10000, 10);
expect('a very thin picture never gets a zero side', s.width === 1600 && s.height >= 1, JSON.stringify(s));
s = scaledImageSize(0, 0);
expect('a picture with no size gives 0 x 0, not NaN', s.width === 0 && s.height === 0);
for (const [w, h] of [[4032, 3024], [5000, 1234], [1234, 5000], [2000, 2000]]) {
  const r = scaledImageSize(w, h);
  expect(`proportions kept for ${w}x${h}`, Math.abs(r.width / r.height - w / h) < 0.01, `${r.width}x${r.height}`);
  expect(`long side at the limit for ${w}x${h}`, Math.max(r.width, r.height) === MAX_IMAGE_SIDE);
}

// --- fitImageBox
let box = fitImageBox(1600, 1200);
expect('a 4:3 picture gets a 360 x 270 block', box.width === 360 && box.height === 270, JSON.stringify(box));
box = fitImageBox(1200, 1600);
expect('a portrait picture is limited by height', box.height === 420 && box.width === 315, JSON.stringify(box));
box = fitImageBox(100, 100);
expect('a small square picture is enlarged to fill the block width', box.width === 360 && box.height === 360, JSON.stringify(box));
box = fitImageBox(3000, 100);
expect('a very wide picture keeps a usable height', box.width === 360 && box.height === 80, JSON.stringify(box));
box = fitImageBox(0, 0);
expect('a picture with no size falls back to a 4:3 block', box.width === 360 && box.height === 270, JSON.stringify(box));

// --- resizeKeepingAspect
let r = resizeKeepingAspect(360, 270, 100, 0, 4 / 3);
expect('dragging right widens and heightens together', r.width === 460 && r.height === 345, JSON.stringify(r));
r = resizeKeepingAspect(360, 270, 0, 90, 4 / 3);
expect('dragging down alone resizes too', r.width === 480 && r.height === 360, JSON.stringify(r));
r = resizeKeepingAspect(360, 270, -1000, -1000, 4 / 3);
expect('the block cannot shrink below the minimum width', r.width === 120 && r.height === 90, JSON.stringify(r));
r = resizeKeepingAspect(360, 270, 0, 0, 4 / 3);
expect('no movement leaves the size alone', r.width === 360 && r.height === 270);
for (const [dx, dy] of [[37, 5], [-60, 20], [10, 200], [-150, -150], [300, -40]]) {
  const out = resizeKeepingAspect(300, 200, dx, dy, 1.5);
  expect(`proportions kept after dragging ${dx},${dy}`, Math.abs(out.width / out.height - 1.5) < 0.02, JSON.stringify(out));
}

// --- dataUrlBytes / needsShrinking
expect('base64 payload size: 4 characters are 3 bytes', dataUrlBytes('data:image/png;base64,' + 'A'.repeat(4000)) === 3000);
expect('a non-base64 data URL counts its characters', dataUrlBytes('data:image/svg+xml,' + 'x'.repeat(500)) === 500);
expect('something that is not a string counts as empty', dataUrlBytes(undefined) === 0);
expect('a small light picture is stored as it is', needsShrinking(800, 600, 100 * 1024) === false);
expect('a picture over the pixel limit is shrunk', needsShrinking(4032, 3024, 100 * 1024) === true);
expect('a heavy picture is re-encoded even when small in pixels', needsShrinking(800, 600, KEEP_AS_IS_BYTES + 1) === true);
expect('a picture exactly at both limits is left alone', needsShrinking(MAX_IMAGE_SIDE, 900, KEEP_AS_IS_BYTES) === false);

// ── A save reports whether IndexedDB (the real store) has it ─────────────────
{
  const stored = await new Promise((resolve) => {
    saveSession('default_session', session(['idb']), { onStored: (ok, err) => resolve({ ok, err }) });
  });
  expect('without IndexedDB the save reports a failure (so the page can say "Couldn\'t save")', stored.ok === false && Boolean(stored.err));
  expect('the localStorage copy is still written and returns true as before', saveSession('default_session', session(['idb2'])) === true);
}

if (failed > 0) {
  console.error(`\n ${failed}/${checks} session and image checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} session and image checks passed!`);
