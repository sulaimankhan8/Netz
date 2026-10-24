/**
 * Tables (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 5 and 6), the ZIP writer used by the
 * LaTeX-with-pictures export, and the Playground helpers that place inserted content
 * (src/app/utils/tableCore.js, src/app/utils/zip.js, Playground/utils/boardStudio.js).
 *
 *   node test_tables.mjs
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const T = await import('./src/app/utils/tableCore.js');
const { makeZip, crc32, dataUrlBytes } = await import('./src/app/utils/zip.js');
const B = await import('./src/app/(Primary.pages)/Playground/utils/boardStudio.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

// ── Editing ──
let t = T.newTable(2, 3);
expect('new table size', t.rows.length === 2 && t.rows[0].length === 3 && t.header === true);
t = T.setCell(t, 0, 1, 'x');
expect('set cell', t.rows[0][1] === 'x');
t = T.insertRow(t, 1);
expect('insert row in the middle', t.rows.length === 3 && t.rows[1].every((c) => c === '') && t.rows[0][1] === 'x');
t = T.insertCol(t, 0);
expect('insert column first', T.colCount(t) === 4 && t.rows[0][2] === 'x' && t.align.length === 4);
t = T.removeCol(t, 0);
expect('remove column', T.colCount(t) === 3 && t.rows[0][1] === 'x');
t = T.removeRow(t, 1);
expect('remove row', t.rows.length === 2);
expect('last row cannot go', T.removeRow(T.newTable(1, 2), 0).rows.length === 1);
expect('last column cannot go', T.colCount(T.removeCol(T.newTable(2, 1), 0)) === 1);
t = T.setAlign(t, 2, 'right');
expect('align a column', t.align[2] === 'right');
expect('row cap', T.insertRow({ ...T.newTable(200, 1) }).rows.length === 200);

// ── Exports ──
const sample = { rows: [['Method', 'Order'], ['Newton', '$2$'], ['a|b', 'x\ny']], header: true, align: ['left', 'center'] };
const md = T.tableToMarkdown(sample);
expect('markdown header and rule', md.split('\n')[1] === '| --- | :---: |', md);
expect('markdown pipe escaped', md.includes('a\\|b'));
expect('markdown newline in cell', md.includes('x<br>y'));
expect('markdown without header gets an empty one', T.tableToMarkdown({ ...sample, header: false }).split('\n').length === 5);
const tex = T.tableToTex(sample);
expect('latex column spec', tex.includes('\\begin{tabular}{lc}'));
expect('latex maths kept', tex.includes('$2$'));
expect('latex text escaped', T.tableToTex({ rows: [['50% & #1_x']], header: false }).includes('50\\% \\& \\#1\\_x'));
expect('latex header rule', tex.includes('\\midrule'));
const html = T.tableToHtml({ rows: [['<script>', '$a$']], header: true }, (m) => `<m>${m}</m>`);
expect('html escaped', html.includes('&lt;script&gt;') && !html.includes('<script>'));
expect('html maths drawn', html.includes('<m>a</m>'));
expect('html header cells', html.startsWith('<table><thead><tr><th>'));
expect('plain text', T.tableToText(sample).split('\n')[1] === 'Newton\t$2$');

// ── ZIP ──
expect('crc32 known value', crc32(new TextEncoder().encode('The quick brown fox jumps over the lazy dog')) === 0x414fa339);
const zip = makeZip([{ name: 'note.tex', data: '\\documentclass{article}' }, { name: 'images/picture-1.png', data: new Uint8Array([1, 2, 3, 4]) }]);
expect('zip starts with a local header', zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 3 && zip[3] === 4);
// Unpack it with Python's zipfile when Python is there (a real reader, not our own code)
const tmp = path.join(os.tmpdir(), `netz-test-${Date.now()}.zip`);
fs.writeFileSync(tmp, zip);
try {
  const out = execFileSync('python', ['-c', 'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); print(z.testzip()); print(",".join(z.namelist())); print(z.read("note.tex").decode())', tmp], { encoding: 'utf8' });
  const [bad, names, body] = out.trim().split(/\r?\n/);
  expect('zip passes a real reader', bad === 'None', out);
  expect('zip names', names === 'note.tex,images/picture-1.png');
  expect('zip content', body === '\\documentclass{article}');
} catch {
  console.log('(Python not found: the ZIP was not unpacked by a second reader)');
} finally {
  fs.rmSync(tmp, { force: true });
}
const parsed = dataUrlBytes('data:image/png;base64,AQIDBA==');
expect('data URL bytes', parsed.mime === 'image/png' && parsed.bytes.length === 4 && parsed.bytes[3] === 4);

// ── Placing inserted content in the Playground ──
const page = {
  strokes: [{ id: 's', points: [{ x: 10, y: 20 }, [30, 60]], bbox: { minX: 10, minY: 20, maxX: 30, maxY: 60 } }],
  blocks: [{ blockId: 'b', position: { x: 5, y: 100 }, size: { width: 50, height: 40 }, linkedBlockIds: [] }],
  shapes: [{ id: 'sh', x: 0, y: 0, w: 10, h: 200 }],
  links: [],
};
expect('top left', JSON.stringify(B.pageTopLeft(page)) === JSON.stringify({ x: 0, y: 0 }));
expect('bottom', B.pageBottom(page) === 200);
expect('empty page has no corner', B.pageTopLeft({ strokes: [], blocks: [], shapes: [] }) === null);
const moved = B.offsetPage(page, 100, 1000);
expect('offset moves object points', moved.strokes[0].points[0].x === 110 && moved.strokes[0].points[0].y === 1020);
expect('offset moves array points', moved.strokes[0].points[1][0] === 130 && moved.strokes[0].points[1][1] === 1060);
expect('offset moves the box', moved.strokes[0].bbox.minY === 1020);
expect('offset moves blocks and shapes', moved.blocks[0].position.y === 1100 && moved.shapes[0].x === 100);
const fresh = B.freshPages([{ ...page, id: 'p', title: 'Page 1', links: [{ sourceBlockId: 'b', targetBlockId: 'b' }] }]);
expect('fresh ids', fresh[0].id !== 'p' && fresh[0].strokes[0].id !== 's' && fresh[0].blocks[0].blockId !== 'b');
expect('links follow new block ids', fresh[0].links[0].sourceBlockId === fresh[0].blocks[0].blockId);
const canvasBlocks = B.noteBlocksToCanvas([
  { type: 'heading1', content: 'Title' },
  { type: 'paragraph', content: 'Some words' },
  { type: 'math', content: 'x^2' },
  { type: 'table', table: { rows: [['a']] } },
  { type: 'ink', content: 'javascript:alert(1)', caption: 'cap' },
  { type: 'paragraph', content: '' },
]);
expect('note blocks become canvas blocks', canvasBlocks.map((b) => b.type).join(',') === 'theory,theory,equation,table,theory', canvasBlocks.map((b) => b.type).join(','));
expect('heading becomes markdown heading', canvasBlocks[0].content.text === '# Title');
expect('blocks stack downwards', canvasBlocks[1].position.y > canvasBlocks[0].position.y && canvasBlocks[2].position.y > canvasBlocks[1].position.y);
expect('bad picture becomes its caption', canvasBlocks[4].content.text === '[cap]');
expect('board title from a named page', B.boardTitle([{ title: 'Page 1' }, { title: 'Integration' }]) === 'Integration');
expect('board title fallback', /^Board · /.test(B.boardTitle([{ title: 'Page 1' }])));

console.log(`\n${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
