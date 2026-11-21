/**
 * Guide mode words (src/app/data/calcGuides/unitN.js) cover every calculator built on the shared card, and each
 * help line names a box that really exists on that page (a typo would quietly hide the help).
 *
 *   npm run test:unit -- calc_guides
 */
import fs from 'node:fs';
import path from 'node:path';

const { METHODS } = await import('../../src/app/data/methods.js');
const unitOf = Object.fromEntries(METHODS.map((m) => [m.id, m.unit]));

let pass = 0;
let fail = 0;
const expect = (name, ok, extra = '') => { if (ok) pass += 1; else { fail += 1; console.log(`FAIL ${name} ${extra}`); } };

// Every guide, and the unit file it is in
const guides = {};
for (let u = 1; u <= 15; u += 1) {
  const { default: g } = await import(`../../src/app/data/calcGuides/unit${u}.js`);
  for (const [id, entry] of Object.entries(g)) {
    expect(`${id} is in the file for its unit`, unitOf[id] === u, `(file unit${u}, method unit ${unitOf[id]})`);
    expect(`${id} has How to use steps`, Array.isArray(entry.howTo) && entry.howTo.length >= 2);
    guides[id] = entry;
  }
}

// Every calculator on the shared card, with the keys of its boxes
const FRAME_KEYS = {
  OdeCalculator: ['f', 'x0', 'y0', 'h', 'xn', 'variant'],
  InterpolationCalculator: ['x', 'y', 'at', 'notation'],
  MatrixMethodCalculator: ['matrix'],
  ShapeCalculator: [],
};
const root = 'src/app/(pages.algorithems)';
const calculators = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/^algorithems\..*\.js$/.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      if (!/CalcCard|Calculator\b/.test(s) || !/(SymbolicCalculator|MatrixMethodCalculator|OdeCalculator|InterpolationCalculator|SavingsCalculator|ShapeCalculator|CalcCard)/.test(s)) continue;
      const id = (s.match(/\bid="([^"]+)"/) || s.match(/exportId="([^"]+)"/) || s.match(/useRecordSolve\('([^']+)'/) || [])[1]?.replace('netz-solve-', '');
      if (!id) continue;
      const keys = new Set([...s.matchAll(/key:\s*'(\w+)'/g)].map((m) => m[1]));
      for (const m of s.matchAll(/set\w*\(\{\s*(\w+)/g)) keys.add(m[1]);
      for (const m of s.matchAll(/set\('(\w+)'/g)) keys.add(m[1]);
      for (const m of s.matchAll(/(\w+):\s*'[^']*'/g)) keys.add(m[1]); // START objects: { principal: '…', … }
      if (/MatrixInput/.test(s)) keys.add('matrix');
      for (const [frame, k] of Object.entries(FRAME_KEYS)) if (s.includes(frame)) k.forEach((x) => keys.add(x));
      calculators.push({ id, file: p, keys });
    }
  }
}(root));

expect('found the calculators', calculators.length > 200, `(${calculators.length})`);
for (const c of calculators) {
  const g = guides[c.id];
  expect(`${c.id} has a guide`, !!g, c.file);
  if (!g) continue;
  for (const key of Object.keys(g.help || {})) expect(`${c.id}: help "${key}" matches a box`, c.keys.has(key));
  for (const key of g.maths || []) expect(`${c.id}: maths "${key}" matches a box`, c.keys.has(key));
}
const ids = new Set(calculators.map((c) => c.id));
for (const id of Object.keys(guides)) expect(`guide ${id} belongs to a calculator`, ids.has(id));

console.log(`${pass}/${pass + fail} checks passed`);
process.exitCode = fail ? 1 : 0;
