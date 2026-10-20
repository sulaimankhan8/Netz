// One-off move of the 34 method pages into MethodShell (ALGORITHM_HUB_REDESIGN_PLAN.md).
//
//   node scripts/am-codemod.mjs            dry run: prints what it would do per page
//   node scripts/am-codemod.mjs --write    rewrites the page.js files (and calculator headings)
//
// Content is moved, never retyped: every kept block is copied from the source by character range.
// What changes: the old wrappers (FullscreenToggle, page background, header with h1 and badge,
// "LABORATORY" calculator block, AlgorithmNavigation) become <MethodShell solve={…}>; each
// "STEP 0n • TITLE" card becomes <Step n title>; ALL-CAPS labels become sentence case.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const PAGES = path.join(ROOT, 'src', 'app', '(pages.algorithems)');
const WRITE = process.argv.includes('--write');

// ---------- sentence case ----------

const KEEP = {
  NEWTON: 'Newton', 'NEWTON-RAPHSON': 'Newton–Raphson', RAPHSON: 'Raphson', GAUSS: 'Gauss',
  'GAUSS-LEGENDRE': 'Gauss–Legendre', 'GAUSS-SEIDEL': 'Gauss–Seidel', LEGENDRE: 'Legendre', SEIDEL: 'Seidel',
  JACOBI: 'Jacobi', LAGRANGE: 'Lagrange', BOOLE: 'Boole', "BOOLE'S": 'Boole’s', WEDDLE: 'Weddle',
  "WEDDLE'S": 'Weddle’s', "SIMPSON'S": 'Simpson’s', EULER: 'Euler', TAYLOR: 'Taylor', "STUDENT'S": 'Student’s',
  RREF: 'RREF', ODE: 'ODE', RK4: 'RK4', LU: 'LU', 'F-STATISTIC': 'F-statistic', 'T-STATISTIC': 't-statistic',
  'Z-STATISTIC': 'z-statistic', 'T-DISTRIBUTION': 't-distribution', APPRX: 'approx.', DIST: 'distribution',
  'REGULA-FALSI': 'Regula falsi', REGULA: 'Regula', 'F-TEST': 'F-test', 'T-TEST': 't-test', 'Z-TEST': 'z-test',
};

export function sentence(text) {
  let words = text.replace(/\s+/g, ' ').trim().split(' ');
  words = words.filter((w, i) => !(i > 0 && w === words[i - 1] && /^[A-Z]{3,}$/.test(w))); // "TAYLOR TAYLOR"
  const out = words.map((word) => {
    const m = word.match(/^([^A-Za-z0-9']*)(.*?)([^A-Za-z0-9'₀-₉]*)$/);
    const [, pre, core, post] = m || ['', '', word, ''];
    if (KEEP[core]) return pre + KEEP[core] + post;
    if (/^[A-Z]$/.test(core)) return word; // a single letter is a variable
    if (/[₀-₉]/.test(core)) return word; // C₁, x₂
    if (core !== core.toUpperCase()) return word; // already mixed case: f'(2), v
    return pre + core.toLowerCase() + post;
  });
  let s = out.join(' ');
  const i = s.search(/[A-Za-z]/);
  if (i >= 0) s = s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
  return s;
}

const isCaps = (t) => /[A-Z]{3}/.test(t) && t === t.toUpperCase();

// ---------- helpers ----------

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const nameOf = (el) => el.openingElement.name.name || '';
const childEls = (el) => el.children.filter((c) => c.type === 'JSXElement');

function flatText(node) {
  if (!node) return '';
  if (node.type === 'JSXText') return node.value;
  if (node.type === 'JSXExpressionContainer' && node.expression.type === 'StringLiteral') return node.expression.value;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return node.children.map(flatText).join('');
  return '';
}

function findAll(node, pred, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'JSXElement' && pred(node)) out.push(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra') continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => findAll(c, pred, out));
    else if (v && typeof v === 'object' && v.type) findAll(v, pred, out);
  }
  return out;
}

const contains = (outer, inner) => outer.start <= inner.start && inner.end <= outer.end;
const attrStr = (s) => (s.includes('"') ? `{${JSON.stringify(s)}}` : `"${s}"`);

function applyEdits(src, edits) {
  const sorted = [...edits].sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start));
  let out = src;
  let floor = Infinity;
  for (const e of sorted) {
    if (e.end > floor && e.start !== e.end) throw new Error(`overlapping edit at ${e.start}`);
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    if (e.start !== e.end) floor = e.start;
  }
  return out;
}

// ---------- one page ----------

function routeOf(file) {
  return '/' + path.basename(path.dirname(file));
}

function convertPage(file) {
  const src = fs.readFileSync(file, 'utf8');
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const report = { file: path.relative(PAGES, file), notes: [] };
  const edits = [];
  const dropped = []; // ranges removed whole: no edits inside them

  // The content container and the wrappers around it
  const full = findAll(ast.program, (el) => nameOf(el) === 'FullscreenToggle')[0];
  const section = findAll(ast.program, (el) => nameOf(el) === 'section')[0];
  if (!full || !section) throw new Error('no FullscreenToggle/section');
  const head = findAll(ast.program, (el) => nameOf(el) === 'Head')[0];

  const blocks = childEls(section);
  let solve = null;
  for (const b of blocks) {
    const text = flatText(b);
    if (nameOf(b) === 'AlgorithmNavigation') {
      edits.push({ start: b.start, end: b.end, text: '' });
      dropped.push(b);
    } else if (findAll(b, (el) => nameOf(el) === 'h1').length) {
      // Header: keep only the intro paragraph(s); the badge, h1 and theme toggle go
      const ps = findAll(b, (el) => nameOf(el) === 'p');
      edits.push({ start: b.start, end: b.end, text: ps.map((p) => src.slice(p.start, p.end)).join('\n') });
      dropped.push(b);
    } else if (/LABORATORY/.test(text) || /Interactive Live Calculator/.test(text)) {
      const comps = childEls(b).filter((c) => /^[A-Z]/.test(nameOf(c)));
      if (comps.length !== 1) throw new Error(`calculator block has ${comps.length} components`);
      if (solve) throw new Error('two calculator blocks');
      solve = src.slice(comps[0].start, comps[0].end);
      edits.push({ start: b.start, end: b.end, text: '' });
      dropped.push(b);
    }
  }
  if (!solve) report.notes.push('NO CALCULATOR');
  const inDropped = (n) => dropped.some((d) => contains(d, n));

  // Steps: a card whose first child reads "STEP 0n • TITLE"
  const stepCards = findAll(section, (el) => {
    const first = childEls(el)[0];
    if (!first) return false;
    return /^STEP\s*\d+\s*•/.test(flatText(first).replace(/\s+/g, ' ').trim());
  }).filter((el) => !inDropped(el));
  const titles = [];
  stepCards.forEach((card, i) => {
    const first = childEls(card)[0];
    const raw = flatText(first).replace(/\s+/g, ' ').trim().replace(/^STEP\s*\d+\s*•\s*/, '');
    const title = sentence(raw);
    titles.push(title);
    const cls = (card.openingElement.attributes.find((a) => a.name?.name === 'className')?.value?.value) || '';
    edits.push({ start: card.openingElement.start, end: card.openingElement.end, text: `<Step n={${i + 1}} title=${attrStr(title)}>` });
    edits.push({ start: first.start, end: first.end, text: '' });
    edits.push({ start: card.closingElement.start, end: card.closingElement.end, text: '</Step>' });
    if (/step-intro-\d/.test(cls)) report.notes.push(`step card had tour class ${cls.match(/step-intro-\d/)[0]}`);
  });
  const total = stepCards.length;

  // Controls after the last step; what follows it in the same parent waits until all are shown
  let closeDoneAtSection = false;
  if (total) {
    const last = stepCards[total - 1];
    let parent = null;
    traverse(ast, {
      JSXElement(p) {
        if (p.node === last) parent = p.parentPath.node;
      },
    });
    const sameParent = stepCards.every((c) => parent.children.includes(c));
    if (!sameParent) report.notes.push('steps not in one parent');
    edits.push({ start: last.end, end: last.end, text: '\n<StepControls />\n<StepsDone>' });
    if (parent === section) closeDoneAtSection = true;
    else edits.push({ start: parent.closingElement.start, end: parent.closingElement.start, text: '</StepsDone>\n' });
  }

  // "Step-by-Step Worked Example" title row → one plain section title
  for (const h2 of findAll(section, (el) => nameOf(el) === 'h2')) {
    if (inDropped(h2)) continue;
    const t = flatText(h2).replace(/\s+/g, ' ').trim();
    if (/worked example/i.test(t)) {
      let row = null;
      traverse(ast, {
        JSXElement(p) {
          if (p.node === h2) row = p.parentPath.node;
        },
      });
      const target = row && row.type === 'JSXElement' && childEls(row).length <= 2 && row !== section ? row : h2;
      edits.push({ start: target.start, end: target.end, text: '<div className="am-section-title"><h2>Worked example</h2></div>' });
      dropped.push(target);
    } else if (h2.children.every((c) => c.type === 'JSXText')) {
      const st = sentence(t.toUpperCase() === t ? t : t.replace(/\b([A-Z])([a-z]+)\b/g, (w, a, b) => (KEEP[w.toUpperCase()] ? w : a.toLowerCase() + b)));
      const fixed = st.charAt(0).toUpperCase() + st.slice(1);
      edits.push({ start: h2.children[0].start, end: h2.children[h2.children.length - 1].end, text: fixed });
      dropped.push(h2);
    }
  }

  // ALL-CAPS labels left in the learn content → sentence case
  const stepHeads = stepCards.map((c) => childEls(c)[0]);
  traverse(ast, {
    JSXText(p) {
      const n = p.node;
      if (!contains(section, n) || inDropped(n) || stepHeads.some((h) => contains(h, n))) return;
      const t = n.value.trim();
      if (!t || !isCaps(t)) return;
      const lead = n.value.match(/^\s*/)[0];
      const trail = n.value.match(/\s*$/)[0];
      edits.push({ start: n.start, end: n.end, text: lead + sentence(t) + trail });
    },
  });

  // Wrappers → MethodShell
  const open = `<MethodShell route="${routeOf(file)}" steps={${total}} solve={${solve || 'null'}}>`;
  edits.push({ start: full.start, end: section.openingElement.end, text: open });
  edits.push({ start: section.closingElement.start, end: full.end, text: (closeDoneAtSection ? '</StepsDone>\n' : '') + '</MethodShell>' });
  if (head) edits.push({ start: head.start, end: head.end, text: '' });

  // Imports
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const from = node.source.value;
    if (/FullscreenToggle|AlgorithmNavigation|^next\/head$/.test(from) || (/components\/editorial$/.test(from) && node.specifiers.every((s) => s.local.name === 'EditorialThemeToggle'))) {
      const end = src[node.end] === '\n' ? node.end + 1 : node.end;
      edits.push({ start: node.start, end, text: '' });
    }
  }
  const firstImport = ast.program.body.find((n) => n.type === 'ImportDeclaration');
  const usesStep = total > 0;
  edits.push({
    start: firstImport.start,
    end: firstImport.start,
    text: `import MethodShell${usesStep ? ', { Step, StepControls, StepsDone }' : ''} from '@/app/components/algorithms/MethodShell';\n`,
  });

  let out = applyEdits(src, edits);
  out = out.replace(/\n{3,}/g, '\n\n');
  report.steps = total;
  report.titles = titles;
  report.solve = solve;
  return { out, report };
}

// ---------- calculator headings ----------

function convertCalculator(file) {
  const src = fs.readFileSync(file, 'utf8');
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const edits = [];
  traverse(ast, {
    JSXText(p) {
      const t = p.node.value.trim();
      if (!/(LABORATORY|SOLVER|INTERPOLATOR|HYPOTHESIS TESTING)$/.test(t) || !isCaps(t)) return;
      const lead = p.node.value.match(/^\s*/)[0];
      const trail = p.node.value.match(/\s*$/)[0];
      edits.push({ start: p.node.start, end: p.node.end, text: lead + sentence(t.replace(/LABORATORY$/, 'CALCULATOR')) + trail });
    },
  });
  return { out: applyEdits(src, edits), count: edits.length };
}

// ---------- run ----------

const files = walk(PAGES).filter((f) => f.includes('UNIT-'));
const pages = files.filter((f) => path.basename(f) === 'page.js');
const calcs = files.filter((f) => /algorithems\..*\.js$/.test(path.basename(f)));
let failed = 0;
for (const f of pages) {
  try {
    const { out, report } = convertPage(f);
    console.log(`${report.file}: ${report.steps} steps, solve=${report.solve}${report.notes.length ? '  NOTE ' + report.notes.join('; ') : ''}`);
    if (process.argv.includes('--titles')) report.titles.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));
    if (WRITE) fs.writeFileSync(f, out);
  } catch (e) {
    failed++;
    console.log(`${path.relative(PAGES, f)}: FAILED ${e.message}`);
  }
}
let headings = 0;
for (const f of calcs) {
  const { out, count } = convertCalculator(f);
  headings += count;
  if (WRITE && count) fs.writeFileSync(f, out);
}
console.log(`${pages.length} pages, ${failed} failed; ${headings} calculator headings${WRITE ? ' written' : ''}`);
