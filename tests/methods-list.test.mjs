// Checks the one methods list (src/app/data/methods.js) against the page folders and every file that
// refers to methods by id: rewards, code export, Notes widgets. Run: npm run check:methods
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/app');
const PAGES = path.join(SRC, '(pages.algorithems)');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const { METHODS, UNITS } = await import('../src/app/data/methods.js');
const { TASKS, PRO_TASKS = [] } = await import('../src/app/utils/progress/catalog.js');
const { EXPORTABLE } = await import('../src/app/utils/codeExport/index.js');
const { ALGORITHMS_CATALOG } = await import('../src/app/(Primary.pages)/Notes/utils/algorithmRegistry.js');

const ids = new Set(METHODS.map((m) => m.id));
const routes = new Set(METHODS.map((m) => m.route));
const shown = METHODS.filter((m) => m.status !== 'planned');

// Every folder under (UNIT-*) that has a page.js: { route: '/name', dir }
const folders = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (fs.existsSync(path.join(p, 'page.js'))) folders.push({ route: '/' + e.name, dir: p });
    walk(p);
  }
})(PAGES);
const unitFolders = folders.filter((f) => path.relative(PAGES, f.dir).startsWith('(UNIT-'));
assert.ok(unitFolders.length >= 34 && TASKS.length && EXPORTABLE.size && ALGORITHMS_CATALOG.length, 'the check could not read the pages or the lists it compares');

// "key: 'value'" pairs inside `const NAME = { … };` in a source file
function objectPairs(file, name, valuePattern) {
  const src = read(file);
  const start = src.indexOf(`const ${name} = {`);
  assert.ok(start >= 0, `${name} not found in ${file}`);
  const body = src.slice(start, src.indexOf('\n};', start));
  const pairs = [...body.matchAll(new RegExp(`^\\s*'?([\\w-]+)'?:\\s*${valuePattern}`, 'gm'))].map((m) => [m[1], m[2]]);
  assert.ok(pairs.length >= 5, `read only ${pairs.length} entries from ${name} in ${file}; has its layout changed?`);
  return pairs;
}

test('ids, routes and titles are unique; units exist', () => {
  assert.equal(ids.size, METHODS.length, 'duplicate id');
  assert.equal(new Set(METHODS.map((m) => m.route.toLowerCase())).size, METHODS.length, 'duplicate route');
  const live = METHODS.filter((m) => m.status === 'live');
  assert.equal(new Set(live.map((m) => m.title)).size, live.length, 'two live pages share a title');
  const units = new Set(UNITS.map((u) => u.unit));
  for (const m of METHODS) {
    assert.ok(units.has(m.unit), `${m.id}: unit ${m.unit} is not in UNITS`);
    assert.match(m.route, /^\/[A-Za-z0-9-]+$/, `${m.id}: route should look like /some-name`);
    assert.ok(['live', 'building', 'planned'].includes(m.status), `${m.id}: unknown status ${m.status}`);
    assert.ok(['num', 'sym', 'rate'].includes(m.engine), `${m.id}: unknown engine ${m.engine}`);
  }
});

test('live pages have a title and a search description', () => {
  for (const m of METHODS.filter((x) => x.status === 'live')) {
    assert.ok(m.title && !/TODO/.test(m.title), `${m.id}: no title`);
    assert.ok(m.description && !/TODO/.test(m.description), `${m.id}: no description`);
    assert.ok(m.description.length >= 50 && m.description.length <= 170, `${m.id}: description is ${m.description.length} characters (aim for about 150)`);
  }
});

test('every listed page has its folder, layout.js and page.js', () => {
  for (const m of shown) {
    const f = unitFolders.find((x) => x.route === m.route);
    assert.ok(f, `${m.id}: no folder for ${m.route} under (pages.algorithems)/(UNIT-…)`);
    const layout = path.join(f.dir, 'layout.js');
    assert.ok(fs.existsSync(layout), `${m.id}: missing layout.js (it sets the page title)`);
    assert.match(fs.readFileSync(layout, 'utf8'), new RegExp(`methodMetadata\\('${m.id}'\\)`), `${m.id}: layout.js uses a different id`);
    assert.ok(!/from 'next\/head'/.test(fs.readFileSync(path.join(f.dir, 'page.js'), 'utf8')), `${m.id}: page.js uses next/head, which the App Router ignores`);
  }
});

test('every method folder is in the methods list', () => {
  for (const f of unitFolders) assert.ok(routes.has(f.route), `${path.relative(PAGES, f.dir)} has a page but no entry in methods.js`);
});

test('pages record solves under their own id', () => {
  for (const m of shown) {
    const f = unitFolders.find((x) => x.route === m.route);
    if (!f) continue;
    const src = fs.readdirSync(f.dir).filter((n) => n.endsWith('.js')).map((n) => fs.readFileSync(path.join(f.dir, n), 'utf8')).join('\n');
    const used = [...src.matchAll(/useRecordSolve\('([\w-]+)'/g)].map((x) => x[1]);
    if (m.status === 'live') assert.ok(used.length, `${m.id}: the calculator never calls useRecordSolve, so solves don't count for tasks`);
    for (const u of used) assert.equal(u, m.id, `${m.id}: page records solves as "${u}"`);
  }
});

test('rewards use known method ids', () => {
  for (const t of [...TASKS, ...PRO_TASKS]) if (t.method) assert.ok(ids.has(t.method), `task ${t.id}: unknown method "${t.method}"`);
});

test('code export uses known method ids', () => {
  for (const id of EXPORTABLE) assert.ok(ids.has(id), `codeExport CLEAN: unknown method "${id}"`);
  const notesIds = new Set(ALGORITHMS_CATALOG.map((a) => a.id));
  for (const [widget, method] of objectPairs('utils/codeExport/index.js', 'REGISTRY', `\\['([\\w-]+)'`)) {
    assert.ok(notesIds.has(widget), `codeExport REGISTRY: no Notes widget "${widget}"`);
    assert.ok(ids.has(method), `codeExport REGISTRY: unknown method "${method}"`);
  }
});

test('Notes widgets point at real pages and method ids', () => {
  const taskMethod = Object.fromEntries(objectPairs('(Primary.pages)/Notes/components/EmbeddedMathWidget.js', 'TASK_METHOD', `'([\\w-]+)'`));
  for (const a of ALGORITHMS_CATALOG) {
    if (a.route) assert.ok(routes.has(a.route), `Notes widget ${a.id}: route ${a.route} is not in methods.js`);
    const method = taskMethod[a.id] || a.id;
    assert.ok(ids.has(method), `Notes widget ${a.id}: records solves as "${method}", which is not a method id (add it to TASK_METHOD)`);
  }
});
