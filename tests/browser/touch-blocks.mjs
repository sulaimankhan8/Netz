import { launch, openPlayground, sleep, clickTitle, shot, addEquationBlock } from './lib.mjs';

// Task B4: Touch-only block interaction on a 390x844 mobile phone.
// Moves, resizes, edits, and deletes a block using touch events only.
const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 3 });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
const client = await page.createCDPSession();

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const touch = (type, pts) => client.send('Input.dispatchTouchEvent', {
  type,
  touchPoints: pts.map(([x, y], id) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 18, radiusY: 18, force: 0.5 }))
});

async function fingerTap([x, y]) {
  await page.touchscreen.tap(Math.round(x), Math.round(y));
  await sleep(250);
}

async function fingerDrag(from, to, steps = 12, pauseAtStartMs = 0) {
  await touch('touchStart', [from]);
  if (pauseAtStartMs > 0) await sleep(pauseAtStartMs);
  for (let s = 1; s <= steps; s++) {
    const x = from[0] + ((to[0] - from[0]) * s) / steps;
    const y = from[1] + ((to[1] - from[1]) * s) / steps;
    await touch('touchMove', [[x, y]]);
    await sleep(20);
  }
  await touch('touchEnd', []);
  await sleep(250);
}

try {
  await openPlayground(page);
  await sleep(600);

  // 1. Add an Equation block on mobile (Insert > Equation in the More Tools sheet)
  await addEquationBlock(page);

  const blockBox1 = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { id: el.getAttribute('data-block-id'), x: r.left, y: r.top, w: r.width, h: r.height };
  });
  check('new equation block spawned', Boolean(blockBox1), JSON.stringify(blockBox1));
  check('new block fits within 390px mobile screen width', blockBox1 && blockBox1.w <= 370 && blockBox1.x >= 0, JSON.stringify(blockBox1));

  // Type something into equation block using keyboard
  await page.keyboard.type('y = 2x + 1');
  await sleep(200);

  // Close editor using the Done button via touch tap
  const doneRect = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Done');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  check('found Done button on active block', Boolean(doneRect), doneRect);
  if (doneRect) {
    await fingerTap(doneRect);
    await sleep(300);
  }

  // Verify block is now in view mode
  const inViewMode = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    return el && !el.className.includes('border-blue-500');
  });
  check('block entered view mode after Done', inViewMode);

  // 2. Touch Tap to Select Block
  const blockMid = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  await fingerTap(blockMid);
  await sleep(300);

  const isSelected = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id] > div');
    return el && el.className.includes('ring-2 ring-blue-500');
  });
  check('touch tap selects the block without entering edit mode', isSelected);

  // 3. Touch Drag (Move) Block via Grab Handle or Body Drag
  const grabHandlePos = await page.evaluate(() => {
    const handle = document.querySelector('[data-block-id] [class*="cursor-grab"]');
    if (!handle) return null;
    const r = handle.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  check('found visible grab handle on selected block', Boolean(grabHandlePos), grabHandlePos);
  if (grabHandlePos) {
    await fingerDrag(grabHandlePos, [grabHandlePos[0], grabHandlePos[1] + 40], 10);
    await sleep(300);
  }

  const blockBoxAfterMove = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const movedOk = blockBoxAfterMove && (Math.abs(blockBoxAfterMove.x - blockBox1.x) > 15 || Math.abs(blockBoxAfterMove.y - blockBox1.y) > 15);
  check('touch drag moved the block position', movedOk, JSON.stringify({ before: blockBox1, after: blockBoxAfterMove }));

  // 4. Touch Resize Block via Resize Handle
  const resizeHandlePos = await page.evaluate(() => {
    const handle = document.querySelector('[data-block-id] [data-resize-handle]');
    if (!handle) return null;
    const r = handle.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  check('found resize handle on selected block', Boolean(resizeHandlePos), resizeHandlePos);
  if (resizeHandlePos) {
    await fingerDrag(resizeHandlePos, [resizeHandlePos[0], resizeHandlePos[1] + 50], 10);
    await sleep(300);
  }

  const blockBoxAfterResize = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  const resizedOk = blockBoxAfterResize && (blockBoxAfterResize.w > blockBoxAfterMove.w || blockBoxAfterResize.h > blockBoxAfterMove.h);
  check('touch drag on resize handle resized the block', resizedOk, JSON.stringify({ before: blockBoxAfterMove, after: blockBoxAfterResize }));

  // 5. Touch Edit Block via Edit Button
  const editBtnPos = await page.evaluate(() => {
    const btn = document.querySelector('[data-block-id] button[title="Edit Block"]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  check('found Edit Block button on selected block', Boolean(editBtnPos), editBtnPos);
  if (editBtnPos) {
    await fingerTap(editBtnPos);
    await sleep(300);
  }

  const isEditingAgain = await page.evaluate(() => {
    const el = document.querySelector('[data-block-id]');
    return el && el.className.includes('border-blue-500');
  });
  const debugInfo = await page.evaluate(() => ({
    blockClass: document.querySelector('[data-block-id]')?.className,
    innerClass: document.querySelector('[data-block-id] > div')?.className,
    hasEditBtn: Boolean(document.querySelector('[data-block-id] button[title="Edit Block"]')),
    hasDoneBtn: Boolean([...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Done')),
  }));
  check('touch tap on edit button re-opened edit mode', isEditingAgain, JSON.stringify(debugInfo));

  // 6. Touch Delete Block
  const deleteBtnPos = await page.evaluate(() => {
    const btn = document.querySelector('[data-block-id] button[title="Delete Block"]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  check('found Delete Block button', Boolean(deleteBtnPos), deleteBtnPos);
  if (deleteBtnPos) {
    await fingerTap(deleteBtnPos);
    await sleep(300);
  }

  const remainingBlocks = await page.evaluate(() => document.querySelectorAll('[data-block-id]').length);
  check('touch tap on delete button removed the block', remainingBlocks === 0, `remaining: ${remainingBlocks}`);

  await shot(page, 'touch-blocks-success');
} catch (e) {
  check('test ran without fatal exceptions', false, String((e && e.stack) || e).slice(0, 300));
}

await client.detach();
await browser.close();

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`\n--- Touch Blocks Test Results (390x844) ---`);
console.log(`Passed: ${passed}/${results.length}`);
if (failed.length > 0) {
  console.log('Failures:', JSON.stringify(failed, null, 2));
  process.exit(1);
} else {
  console.log('ALL TOUCH BLOCK CHECKS PASSED!');
  process.exit(0);
}
