import { launch, openPlayground, sleep, clickTitle, shot, addEquationBlock } from './lib.mjs';

// Blocks in the real app: new blocks open ready to type, Done closes them,
// Equation -> Plot Graph -> Sync to Notes.
const { browser, page, errors } = await launch();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const blockInfo = () => page.evaluate(() => [...document.querySelectorAll('[data-block-id]')].map((b) => ({
  id: b.getAttribute('data-block-id'),
  editing: b.getAttribute('data-editing') === 'true',
  inputs: b.querySelectorAll('input[type="text"], textarea, math-field').length,
  text: b.innerText.slice(0, 80).replace(/\n/g, ' | '),
  transform: b.style.transform,
})));
const clickButtonText = (text) => page.evaluate((t) => {
  const el = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === t);
  if (!el) return false;
  el.click();
  return true;
}, text);

try {
  await openPlayground(page);

  // Equation block (Insert > Equation): opens empty, in edit mode, with the cursor in the visual editor
  await addEquationBlock(page);
  await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
  await sleep(300);
  let blocks = await blockInfo();
  check('a new equation block opens in edit mode', blocks.length === 1 && blocks[0].editing && blocks[0].inputs === 1, JSON.stringify(blocks));
  const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, value: document.activeElement.value }));
  check('it is empty and focused, ready to type', focus.tag === 'MATH-FIELD' && focus.value === '', JSON.stringify(focus));
  await page.keyboard.type('y = x^2 - 4x + 3');
  await sleep(200);
  const typed = await page.evaluate(() => document.activeElement.value);
  // The visual editor writes the equation without spaces
  check('typing goes into the equation', typed === 'y=x^2-4x+3', typed);

  // Enter finishes editing (frame and content together)
  await page.keyboard.press('Enter');
  await sleep(300);
  blocks = await blockInfo();
  check('Enter closes the editor and the frame together', !blocks[0].editing && blocks[0].inputs === 0, JSON.stringify(blocks[0]));

  // With a mouse, a click selects the block (bar and handles) without opening it
  {
    const body = await page.$('[data-block-id] [data-block-body]');
    const box = await body.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(300);
    blocks = await blockInfo();
    const selected = await page.evaluate(() => Boolean(document.querySelector('[data-block-id][data-selected]')));
    check('a click selects the block without opening it', selected && !blocks[0].editing, JSON.stringify(blocks[0]));
    // A double click reopens it; the Done button closes it
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
  }
  await page.waitForSelector('[data-block-id] math-field', { timeout: 30000 });
  await sleep(300);
  blocks = await blockInfo();
  check('a double click reopens the editor with its content', blocks[0].editing && blocks[0].inputs === 1, JSON.stringify(blocks[0]));
  const reopened = await page.evaluate(() => document.querySelector('[data-block-id] math-field').value);
  check('the equation text is kept', reopened === 'y=x^2-4x+3', reopened);
  check('Plot Graph is offered while editing', await clickButtonText('Plot Graph'));
  await sleep(900);
  blocks = await blockInfo();
  check('Plot Graph adds a linked graph block', blocks.length === 2, JSON.stringify(blocks.map((b) => b.text)));
  // The graph is drawn as SVG (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, blocks round): one path per curve
  const charts = await page.evaluate(() => document.querySelectorAll('[data-block-id] svg[data-graph-plot] path').length);
  check('the graph draws its curve', charts >= 1, charts);
  const links = await page.evaluate(() => document.querySelectorAll('svg.z-30 path').length);
  check('a link is drawn between equation and graph', links >= 1, links);
  check('the Done button closes the editor', await clickButtonText('Done'));
  await sleep(300);
  blocks = await blockInfo();
  check('Done closes the frame and the field', !blocks[0].editing && blocks[0].inputs === 0, JSON.stringify(blocks[0]));

  // Theory block: opens ready to type as well, and does not land on top of the others
  await clickTitle(page, 'Add Theory');
  await sleep(500);
  blocks = await blockInfo();
  const theory = blocks[blocks.length - 1];
  check('a new theory block opens in edit mode', blocks.length === 3 && theory.editing && theory.inputs >= 1, JSON.stringify(theory));
  const theoryFocus = await page.evaluate(() => document.activeElement.tagName);
  check('its text area is focused', theoryFocus === 'TEXTAREA', theoryFocus);
  check('new blocks do not stack on one spot', new Set(blocks.map((b) => b.transform)).size === blocks.length, JSON.stringify(blocks.map((b) => b.transform)));
  await page.keyboard.type('Roots at x = 1 and x = 3');
  await sleep(200);
  await clickButtonText('Done');
  await sleep(300);

  // Sync to Notes: everything preselected, creates a note with the blocks
  await clickTitle(page, 'Sync Whiteboard to Notes Workspace');
  await sleep(400);
  const sendButton = () => [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.innerText.trim() === 'Send to Notes');
  const syncDisabled = await page.evaluate((f) => eval(f)()?.disabled, sendButton.toString());
  check('Sync opens with the blocks already selected', syncDisabled === false, syncDisabled);
  await shot(page, 'blocks-sync');
  await page.evaluate((f) => eval(f)().click(), sendButton.toString());
  await sleep(500);
  const sent = await page.evaluate(() => ({
    message: document.querySelector('[role="dialog"] [role="status"]')?.innerText || '',
    open: Boolean([...document.querySelectorAll('[role="dialog"] button')].find((b) => b.innerText.trim() === 'Open note')),
  }));
  check('it says the note was sent and offers Open note', /Sent to Notes/.test(sent.message) && sent.open, JSON.stringify(sent));
  await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.innerText.trim() === 'Close').click());
  await sleep(300);
  const note = await page.evaluate(() => {
    const notes = JSON.parse(localStorage.getItem('netz_notes_v2_data') || '[]');
    return notes[0] ? notes[0].blocks.map((b) => `${b.type}: ${String(b.content).slice(0, 40)}`) : null;
  });
  check('the note holds the equation and the theory text', note && note.some((b) => /x\^2/.test(b)) && note.some((b) => /Roots at/.test(b)), JSON.stringify(note));

  // Reload: blocks come back closed, with their content
  await sleep(1200);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await sleep(2000);
  blocks = await blockInfo();
  check('blocks come back after a reload, closed', blocks.length === 3 && blocks.every((b) => !b.editing), JSON.stringify(blocks.map((b) => [b.editing, b.text])));
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} block checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
