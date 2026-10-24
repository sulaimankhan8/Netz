/**
 * The NETZ file (.netz) and the checks on anything that comes from outside
 * (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps B0 and 1):
 * src/app/utils/netzFile.js and src/app/(Primary.pages)/Notes/utils/importSafety.js.
 *
 *   node test_netz_file.mjs
 */

const { buildNetzFile, parseNetzFile, sanitizeStroke, sanitizeCanvasBlock, netzFileName, NETZ_FILE_VERSION } = await import('./src/app/utils/netzFile.js');
const { safeImageSrc, sanitizeNote, sanitizeBlock, sanitizeTable } = await import('./src/app/(Primary.pages)/Notes/utils/importSafety.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

// ── Pictures are only ever image data ──
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
expect('png data URL kept', safeImageSrc(PNG) === PNG);
expect('https kept', safeImageSrc('https://example.com/a.png') === 'https://example.com/a.png');
expect('raw svg becomes image data', safeImageSrc('<svg onload="alert(1)"></svg>').startsWith('data:image/svg+xml'));
expect('javascript: refused', safeImageSrc('javascript:alert(1)') === '');
expect('html data refused', safeImageSrc('data:text/html;base64,PHNjcmlwdD4=') === '');
expect('http (not https) refused', safeImageSrc('http://example.com/a.png') === '');
expect('quote in URL refused', safeImageSrc('https://x.com/a"onerror="x') === '');

// ── Blocks ──
expect('unknown block type dropped', sanitizeBlock({ id: 'b1', type: 'script', content: 'x' }) === null);
const ink = sanitizeBlock({ id: 'b2', type: 'ink', content: '<svg><script>alert(1)</script></svg>' });
expect('ink svg markup made image data', ink.content.startsWith('data:image/svg+xml;charset=utf-8,'));
const bad = sanitizeBlock({ id: 'has spaces and <tags>', type: 'paragraph', content: 42 });
expect('bad id replaced', /^b-/.test(bad.id), bad.id);
expect('non-string content made empty', bad.content === '');
const t = sanitizeTable({ rows: [['a', 'b', 'c'], ['d']], align: ['center', 'nope'] });
expect('table rows padded', t.rows[1].length === 3 && t.rows[1][2] === '');
expect('table align checked', t.align[0] === 'center' && t.align[1] === 'left');
const huge = sanitizeTable({ rows: Array.from({ length: 500 }, () => Array.from({ length: 50 }, () => 'x')) });
expect('table capped', huge.rows.length === 200 && huge.rows[0].length === 30);
const assetBlock = sanitizeBlock({ id: 'b3', type: 'board', asset: { id: 'ast_abc123', kind: 'board', title: 'T', preview: 'javascript:1' }, display: 'card' });
expect('asset ref kept, bad preview dropped', assetBlock.asset.id === 'ast_abc123' && assetBlock.asset.preview === '' && assetBlock.display === 'card');

const note = sanitizeNote({ title: 'N', tags: ['a', 7, ''], blocks: [{ id: 'x', type: 'paragraph', content: 'hi' }, { type: 'evil' }], accessKey: 'SECRET', isPinned: true });
expect('note keeps known fields only', note.accessKey === undefined && note.isPinned === undefined);
expect('note tags cleaned', note.tags.length === 1 && note.tags[0] === 'a');
expect('note bad blocks dropped', note.blocks.length === 1);

// ── Strokes and Playground blocks ──
const stroke = sanitizeStroke({ id: 's1', color: 'red;background:url(x)', width: 9999, tool: 'laser', points: [{ x: 1, y: 2, pressure: 0.5, pointerType: 'pen' }, { x: 'a', y: 3 }, [4, 5, 0.3]] });
expect('stroke bad colour replaced', stroke.color === '#1e293b');
expect('stroke width capped', stroke.width === 200);
expect('stroke unknown tool is pen', stroke.tool === 'pen');
expect('stroke bad point dropped', stroke.points.length === 2);
expect('stroke point fields kept', stroke.points[0].pressure === 0.5 && stroke.points[0].pointerType === 'pen');
expect('stroke with no points dropped', sanitizeStroke({ points: [] }) === null);
const img = sanitizeCanvasBlock({ blockId: 'b', type: 'image', content: { imageUrl: 'javascript:alert(1)', caption: 'c' }, position: { x: 1, y: 2 }, size: { width: 10, height: 'auto' } });
expect('canvas image url checked', img.content.imageUrl === '' && img.content.caption === 'c');
expect('canvas auto height kept', img.size.height === 'auto');
const audio = sanitizeCanvasBlock({ blockId: 'a', type: 'audio', content: { audioUrl: 'blob:https://x/1' } });
expect('blob audio url dropped', audio.content.audioUrl === '');
expect('unknown canvas block dropped', sanitizeCanvasBlock({ type: 'iframe' }) === null);

// ── Round trip: a note ──
const noteFile = buildNetzFile({
  kind: 'note',
  note: { title: 'Calculus', subtitle: 's', tags: ['math'], blocks: [{ id: 'b1', type: 'math', content: 'x^2' }, { id: 'b2', type: 'table', table: { rows: [['a', '$x$']], header: true } }] },
  assets: [{ id: 'ast_xyz789', kind: 'image', title: 'p.png', mime: 'image/png', data: 'iVBORw0KGgo=', preview: PNG }],
});
const readNote = parseNetzFile(noteFile);
expect('note file opens', readNote.ok && readNote.kind === 'note', JSON.stringify(readNote).slice(0, 200));
expect('note blocks survive', readNote.note.blocks.length === 2 && readNote.note.blocks[0].content === 'x^2');
expect('note table survives', readNote.note.blocks[1].table.rows[0][1] === '$x$');
expect('embedded asset survives', readNote.assets.length === 1 && readNote.assets[0].data === 'iVBORw0KGgo=');

// ── Round trip: a board ──
const docFile = buildNetzFile({
  kind: 'document',
  document: {
    title: 'Board',
    pages: [
      { id: 'p1', title: 'Page 1', strokes: [{ id: 's', color: '#000', width: 3, tool: 'pen', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }], blocks: [{ blockId: 'e', type: 'equation', content: { latex: 'a+b' }, position: { x: 5, y: 5 }, size: { width: 100, height: 50 } }], shapes: [{ id: 'sh', x: 1, y: 2, w: 3, h: 4 }] },
      { id: 'p2', title: 'Page 2', strokes: [], blocks: [] },
    ],
  },
});
const readDoc = parseNetzFile(docFile);
expect('board file opens', readDoc.ok && readDoc.kind === 'document');
expect('board pages survive', readDoc.document.pages.length === 2);
expect('board ink survives', readDoc.document.pages[0].strokes[0].points.length === 2);
expect('board block survives', readDoc.document.pages[0].blocks[0].content.latex === 'a+b');
expect('board shape survives', readDoc.document.pages[0].shapes[0].w === 3);

// ── Bad files ──
expect('empty refused', !parseNetzFile('').ok);
expect('not JSON refused', !parseNetzFile('<html>').ok);
expect('JSON without netz refused', !parseNetzFile('{"a":1}').ok);
expect('newer version refused with a message', /newer version/.test(parseNetzFile(JSON.stringify({ netz: NETZ_FILE_VERSION + 1, kind: 'note', note: {} })).error || ''));
expect('unknown kind refused', !parseNetzFile(JSON.stringify({ netz: 1, kind: 'spreadsheet' })).ok);
expect('too big refused', !parseNetzFile('x'.repeat(41 * 1024 * 1024)).ok);
const badAsset = parseNetzFile(JSON.stringify({ netz: 1, kind: 'note', note: { title: 't', blocks: [] }, assets: [{ id: 'ast_ok12345', kind: 'image', data: 'not base64!!<script>' }, { id: '../../etc', kind: 'file', data: 'AAAA' }] }));
expect('bad embedded assets dropped', badAsset.ok && badAsset.assets.length === 0);

// ── File names ──
expect('file name from title', netzFileName('Newton & Raphson!') === 'newton-raphson.netz');
expect('file name fallback', netzFileName('', 'board') === 'board.netz');

console.log(`\n${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
