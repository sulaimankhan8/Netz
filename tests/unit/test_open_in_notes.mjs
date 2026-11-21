/**
 * "Open in Notes": every page that shows the link (AlgorithmNavigation: the 34 original pages, and newer pages listed
 * in methodWidgetIds.js) has a Notes widget that /Notes?method=<id> can put in a note (Notes/utils/methodNote.js).
 *
 *   npm run test:unit -- open_in_notes
 */
const { METHODS } = await import('../../src/app/data/methods.js');
const { NOTES_WIDGET_IDS } = await import('../../src/app/data/methodWidgetIds.js');
const { ALGORITHMS_CATALOG } = await import('../../src/app/(Primary.pages)/Notes/utils/algorithmRegistry.js');

let pass = 0;
let fail = 0;
const expect = (name, ok, extra = '') => { if (ok) pass += 1; else { fail += 1; console.log(`FAIL ${name} ${extra}`); } };

const routes = new Set(ALGORITHMS_CATALOG.map((a) => (a.route || '').toLowerCase()));
const originals = METHODS.filter((m) => m.batch === 0 && m.status === 'live');
expect('34 original pages', originals.length === 34, `(${originals.length})`);
for (const m of originals) expect(`${m.id}: has a Notes widget`, routes.has(m.route.toLowerCase()), m.route);

// Newer pages: every listed id is a real method; once live, the Notes list picks up its widget by route
for (const id of NOTES_WIDGET_IDS) {
  const m = METHODS.find((x) => x.id === id);
  expect(`${id}: is a method`, !!m);
  if (m?.status === 'live') expect(`${id}: live page has its widget in Notes`, routes.has(m.route.toLowerCase()));
}

console.log(`${pass}/${pass + fail} checks passed`);
process.exitCode = fail ? 1 : 0;
