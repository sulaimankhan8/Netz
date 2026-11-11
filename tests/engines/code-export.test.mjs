// Code export for the Batch 1–4 pages: every case's program is generated in all six languages, and the
// JavaScript one is run here and must print the page engine's own answer. Python, C++ and Go are compiled
// and run by `npm run check:code-export` (needs those compilers). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { generateCode, LANG_ORDER } from '../../src/app/utils/codeExport/index.js';
import { CASES, inputsOf, runJs, matches } from './code-export-cases.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
// Every method id has an engine file of the same name (some re-export a shared one)
const engineOf = async (id) => (await import(pathToFileURL(path.join(ROOT, 'src/app/utils/engines', `${id}.js`)).href)).solve;

for (const [k, c] of CASES.entries()) {
  test(`code export ${c.id} #${k}`, async () => {
    const raw = inputsOf(c);
    assert.ok(raw, `${c.id}: no inputs`);
    const out = (await engineOf(c.id))(raw);
    for (const lang of LANG_ORDER) assert.doesNotThrow(() => generateCode(c.id, raw, lang), `${c.id}: ${lang} could not be written`);
    const text = runJs(generateCode(c.id, raw, 'javascript').code);
    const { missing, unsaid } = matches(text, c.pick ? c.pick(out) : [], c.say ? c.say(out) : [], c.tol);
    assert.deepEqual([missing, unsaid], [[], []], `${c.id}: the program printed\n${text.slice(-1500)}`);
  });
}
