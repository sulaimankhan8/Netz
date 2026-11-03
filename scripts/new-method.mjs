/**
 * Sets up a new method page (METHODS_IMPLEMENTATION_PLAN.md, step A5).
 *
 *   npm run new-method -- --id determinant --route /determinant --unit 8 --name "Determinant" [--category "Matrix Basics"] [--engine num] [--batch 1]
 *
 * Creates:
 *   src/app/(pages.algorithems)/(UNIT-<n>)/<route>/layout.js       title, description, structured data
 *   src/app/(pages.algorithems)/(UNIT-<n>)/<route>/page.js         the page, built from components/method
 *   src/app/(pages.algorithems)/(UNIT-<n>)/<route>/algorithems.<route>.js   the live calculator
 *   src/app/utils/engines/<id>.js                                  the maths (no React)
 *   tests/engines/<id>.test.mjs                                    textbook checks for the maths
 * and adds the method to src/app/data/methods.js as "building": hidden from menus, sitemap and search
 * until you change building( to live(.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const METHODS_FILE = path.join(ROOT, 'src/app/data/methods.js');

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

// ---------- arguments ----------
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) fail(`Unexpected "${a}". Options look like --id determinant.`);
  args[a.slice(2)] = process.argv[i + 1];
  i++;
}
const usage = 'Usage: npm run new-method -- --id <id> --route /<route> --unit <1-15> --name "<Menu name>" [--category "<Sub-group>"] [--engine num|sym|rate] [--batch 1-4]';
for (const k of ['id', 'route', 'unit', 'name']) if (!args[k]) fail(`Missing --${k}.\n${usage}`);

const id = args.id;
// Git Bash turns "/determinant" into "C:/Program Files/Git/determinant"; take the last part back
const rawRoute = /^[A-Za-z]:[\\/]/.test(args.route) ? args.route.split(/[\\/]/).pop() : args.route;
const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`;
const slug = route.slice(1);
const unit = Number(args.unit);
const name = args.name;
const category = args.category || null;
const engine = args.engine || 'num';
const batch = Number(args.batch || 1);

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('--id must be lowercase words joined by hyphens, e.g. matrix-inverse.');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('--route must be lowercase words joined by hyphens, e.g. /matrix-inverse.');
if (!['num', 'sym', 'rate'].includes(engine)) fail('--engine must be num, sym or rate.');
if (!(batch >= 1 && batch <= 4)) fail('--batch must be 1, 2, 3 or 4.');
if (/['\\`$]/.test(name + (category || ''))) fail('Please keep quotes, backslashes and $ out of --name and --category.');

const { METHODS, UNITS } = await import(pathToFileURL(METHODS_FILE).href);
const unitInfo = UNITS.find((u) => u.unit === unit);
if (!unitInfo) fail(`Unit ${args.unit} is not in UNITS in src/app/data/methods.js.`);
if (METHODS.some((m) => m.id === id)) fail(`A method with id "${id}" already exists.`);
if (METHODS.some((m) => m.route.toLowerCase() === route.toLowerCase())) fail(`The route ${route} is already used.`);

const pageDir = path.join(ROOT, 'src/app/(pages.algorithems)', `(UNIT-${unit})`, slug);
const engineFile = path.join(ROOT, 'src/app/utils/engines', `${id}.js`);
const testFile = path.join(ROOT, 'tests/engines', `${id}.test.mjs`);
for (const p of [pageDir, engineFile, testFile]) if (fs.existsSync(p)) fail(`${path.relative(ROOT, p)} already exists.`);

// ---------- file contents ----------
const pascal = id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const badge = `${unitInfo.shortTitle.toUpperCase()} • ${unitInfo.description.toUpperCase()}`;

const layout = `// Title, description and structured data for this page, from src/app/data/methods.js
import { methodMetadata, methodJsonLd } from '@/app/utils/seo/methodMetadata';
import JsonLd from '@/app/components/seo/JsonLd';

export const metadata = methodMetadata('${id}');

export default function Layout({ children }) {
  return (
    <>
      <JsonLd data={methodJsonLd('${id}')} />
      {children}
    </>
  );
}
`;

const page = `'use client';

// TODO: write the page. Copy the pattern from (UNIT-1)/newton-raphson-method/page.js.
// Worked example in textbook notation (Grewal for engineering, NCERT for school topics).
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ${pascal}Calculator from './algorithems.${slug}';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

export default function ${pascal}Page() {
  return (
    <MethodPage>
      <MethodHeader badge="${badge}" title="${name}" subtitle="TODO: subtitle">
        TODO: one plain sentence saying what ${name} does (answer first).
      </MethodHeader>

      <FormulaBox label="HOW IT WORKS" tag="TODO">
        <Formula math="TODO" />
        <FormulaSteps
          steps={[
            { title: '1. TODO', text: 'TODO' },
            { title: '2. TODO', text: 'TODO' },
            { title: '3. TODO', text: 'TODO' },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>TODO: the example problem.</ExampleProblem>
        <ExampleStep n={1} title="TODO">
          <StepText>TODO</StepText>
          <MathPanel>
            <BlockMath math="TODO" />
          </MathPanel>
        </ExampleStep>
        <Conclusion result="TODO: the answer" />
      </WorkedExample>

      <Lab>
        <${pascal}Calculator />
      </Lab>

      <Faq items={[]} />
      <RelatedMethods ids={[]} />
    </MethodPage>
  );
}
`;

const calculator = `'use client';
// The live calculator for ${name}. The maths lives in src/app/utils/engines/${id}.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import { StepTable } from '@/app/components/method';
import { EditorialButton } from '@/app/components/editorial';
import { solve } from '@/app/utils/engines/${id}';

export default function ${pascal}Calculator() {
  // TODO: replace with this method's inputs
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('${id}', ${unit}, answer, () => ({}));

  const run = (e) => {
    e.preventDefault();
    try {
      setError('');
      setAnswer(solve({ input }));
    } catch (err) {
      setAnswer(null);
      // EngineError messages are written for the student; anything else is a bug
      setError(err.name === 'EngineError' ? err.message : 'Something went wrong. Please check your input.');
    }
  };

  const columns = answer ? answer.steps.headers.map((label, i) => ({ key: String(i), label })) : [];
  const rows = answer ? answer.steps.rows.map((cells) => Object.fromEntries(cells.map((c, i) => [String(i), c]))) : [];

  return (
    <form onSubmit={run} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-mono font-bold uppercase text-neutral-500">Input</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[44px] px-3 border-2 border-black/80 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-900 text-base font-mono"
        />
      </label>
      <EditorialButton type="submit">Calculate</EditorialButton>
      {error && <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
      {answer && (
        <div className="space-y-3">
          <p className="text-lg font-bold">{String(answer.result)}</p>
          {rows.length > 0 && <StepTable columns={columns} rows={rows} />}
        </div>
      )}
    </form>
  );
}
`;

const engineSrc = `/**
 * ${name}: the maths, with the working recorded. No React, so the page, a Notes widget and code export can share it.
 * Shared helpers: src/app/utils/numeric (matrices, difference tables, ODE steps, Thomas algorithm).
 */
import { createRecord, EngineError } from '../numeric';

/** TODO: describe the input. Returns { result, steps: { headers, rows }, notes, plot }. */
export function solve({ input }) {
  if (!String(input ?? '').trim()) throw new EngineError('Enter a value first.');
  const rec = createRecord(['Step', 'Value']);
  // TODO: the method. rec.row(...cells) adds a table row; rec.note(text) adds an explanation.
  rec.row(1, input);
  return rec.done(input);
}
`;

const testSrc = `// ${name}: checks against textbook answers. Run: npm run test:engines
import { test } from 'node:test';
// import assert from 'node:assert/strict';
// import { solve } from '../../src/app/utils/engines/${id}.js';

test.todo('${name}: worked example from the textbook (Grewal / NCERT) gives the book answer');
test.todo('${name}: bad input gives an EngineError with a clear message');
`;

// ---------- methods.js ----------
let methodsSrc = fs.readFileSync(METHODS_FILE, 'utf8');
const SEO_MARK = '  // new-method.mjs adds SEO entries above this line';
const METHOD_MARK = '  // new-method.mjs adds methods above this line';
if (!methodsSrc.includes(SEO_MARK) || !methodsSrc.includes(METHOD_MARK)) fail('Could not find the marker lines in src/app/data/methods.js.');
const q = (s) => `'${s.replace(/'/g, "\\'")}'`;
const key = /^[a-z][a-z0-9]*$/.test(id) ? id : q(id);
const seoTitle = /calculator$/i.test(name) ? `${name} with Steps` : `${name} Calculator with Steps`;
methodsSrc = methodsSrc.replace(SEO_MARK, `  ${key}: [${q(seoTitle)},
    'TODO: about 150 characters saying what the page does, using the words people search for.',
    []],
${SEO_MARK}`);
const opts = [engine !== 'num' && `engine: '${engine}'`, `batch: ${batch}`].filter(Boolean).join(', ');
methodsSrc = methodsSrc.replace(METHOD_MARK, `  building(${q(id)}, ${q(route)}, ${unit}, ${category ? q(category) : 'null'}, ${q(name)}, { ${opts} }),
${METHOD_MARK}`);

// ---------- write ----------
fs.mkdirSync(pageDir, { recursive: true });
fs.mkdirSync(path.dirname(engineFile), { recursive: true });
fs.writeFileSync(path.join(pageDir, 'layout.js'), layout);
fs.writeFileSync(path.join(pageDir, 'page.js'), page);
fs.writeFileSync(path.join(pageDir, `algorithems.${slug}.js`), calculator);
fs.writeFileSync(engineFile, engineSrc);
fs.writeFileSync(testFile, testSrc);
fs.writeFileSync(METHODS_FILE, methodsSrc);

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
console.log(`
✓ ${name} set up as "building" (hidden from menus, sitemap and search).

  ${rel(pageDir)}/page.js
  ${rel(pageDir)}/algorithems.${slug}.js
  ${rel(pageDir)}/layout.js
  ${rel(engineFile)}
  ${rel(testFile)}
  src/app/data/methods.js  (new entry + SEO placeholder)

Next:
  1. Write the maths in ${rel(engineFile)} and its textbook checks in ${rel(testFile)}
  2. Build the calculator and the page (open ${route} on your dev server)
  3. Fill in the title, description and search words in methods.js
  4. Optional: Notes widget, code export, task and medal
  5. Publish: change building( to live( in methods.js and set lastmod
  6. npm run check:methods && npm run test:engines
`);
