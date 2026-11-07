/**
 * Truth tables and logical equivalence: the maths for /truth-table-generator (Unit 15).
 * Connectives (highest binding first): ¬ (not, ~, !), ∧ (and, &), ∨ (or, |), ⊕ (xor), → (->, implies), ↔ (<->, iff).
 * Every sub-formula gets a column; the last column decides tautology / contradiction / contingency. With a second
 * formula, the two final columns are compared (logically equivalent or not).
 */
import { EngineError } from '../numeric/steps';

const OPS = { '¬': 5, '∧': 4, '∨': 3, '⊕': 2, '→': 1, '↔': 0 };
const NAMES = { '∧': '\\land', '∨': '\\lor', '⊕': '\\oplus', '→': '\\to', '↔': '\\leftrightarrow' };

/** Tokens from text, with words and ASCII forms turned into symbols. */
function tokenize(text) {
  const s = String(text ?? '')
    .replace(/<->|<=>|\biff\b/gi, '↔').replace(/->|=>|\bimplies\b/gi, '→').replace(/\bxor\b/gi, '⊕')
    .replace(/\band\b|&&|&|\^|·/gi, '∧').replace(/\bor\b|\|\||\||\+/gi, '∨').replace(/\bnot\b|~|!|¬/gi, '¬');
  const out = [];
  for (const ch of s.replace(/\s+/g, '')) {
    if ('¬∧∨⊕→↔()'.includes(ch)) out.push(ch);
    else if (/[a-zA-Z]/.test(ch)) out.push(ch);
    else if (ch === 'T' || ch === '1') out.push('T');
    else if (ch === 'F' || ch === '0') out.push('F');
    else throw new EngineError(`"${ch}" is not a connective or a letter. Use ¬ ∧ ∨ → ↔ (or not, and, or, ->, <->).`);
  }
  if (!out.length) throw new EngineError('Type a formula, e.g. (p → q) ∧ p.');
  return out;
}
/** Parse into a tree { op, args } or { v }. → is right-associative. */
function parseFormula(text) {
  const t = tokenize(text);
  let i = 0;
  const peek = () => t[i];
  const primary = () => {
    const tok = t[i++];
    if (tok === '(') { const e = expr(0); if (t[i++] !== ')') throw new EngineError('A bracket is not closed.'); return e; }
    if (tok === '¬') return { op: '¬', args: [unary()] };
    if (tok && /^[a-zA-ZTF]$/.test(tok)) return { v: tok };
    throw new EngineError('The formula is incomplete or has two connectives in a row.');
  };
  const unary = () => primary();
  const expr = (minPrec) => {
    let left = unary();
    while (peek() && peek() in OPS && peek() !== '¬' && OPS[peek()] >= minPrec) {
      const op = t[i++];
      const right = expr(op === '→' ? OPS[op] : OPS[op] + 1);
      left = { op, args: [left, right] };
    }
    return left;
  };
  const tree = expr(0);
  if (i < t.length) throw new EngineError('Something is left over at the end; check the brackets.');
  return tree;
}
const evalF = (n, env) => {
  if (n.v) return n.v === 'T' ? true : n.v === 'F' ? false : env[n.v];
  const [a, b] = n.args.map((x) => evalF(x, env));
  switch (n.op) { case '¬': return !a; case '∧': return a && b; case '∨': return a || b; case '⊕': return a !== b; case '→': return !a || b; default: return a === b; }
};
const texOf = (n, top = true) => {
  if (n.v) return n.v;
  if (n.op === '¬') return `\\lnot ${texOf(n.args[0], false)}`;
  const s = `${texOf(n.args[0], false)} ${NAMES[n.op]} ${texOf(n.args[1], false)}`;
  return top ? s : `(${s})`;
};
const vars = (n, set = new Set()) => { if (n.v && n.v !== 'T' && n.v !== 'F') set.add(n.v); (n.args || []).forEach((a) => vars(a, set)); return set; };
/** Sub-formulas, innermost first, without repeats. */
const subs = (n, out = []) => { (n.args || []).forEach((a) => subs(a, out)); if (n.op && !out.some((o) => texOf(o) === texOf(n))) out.push(n); return out; };

export function solve({ f, g = '' }) {
  const A = parseFormula(f);
  const B = String(g).trim() ? parseFormula(g) : null;
  const V = [...new Set([...vars(A), ...(B ? vars(B) : [])])].sort();
  if (V.length > 6) throw new EngineError('Use at most 6 letters (that is 64 rows).');
  const cols = [...subs(A), ...(B ? subs(B).filter((x) => !subs(A).some((y) => texOf(y) === texOf(x))) : [])];
  const rows = [];
  const lastA = [], lastB = [];
  for (let m = 0; m < 2 ** V.length; m++) {
    const env = Object.fromEntries(V.map((v, k) => [v, !((m >> (V.length - 1 - k)) & 1)]));
    const row = Object.fromEntries(V.map((v) => [v, env[v] ? 'T' : 'F']));
    cols.forEach((c, k) => { row[`c${k}`] = evalF(c, env) ? 'T' : 'F'; });
    rows.push(row);
    lastA.push(evalF(A, env));
    if (B) lastB.push(evalF(B, env));
  }
  const columns = [...V.map((v) => ({ key: v, label: v, bold: true })), ...cols.map((c, k) => ({ key: `c${k}`, label: texOf(c).replace(/\\lnot /g, '¬').replace(/\\land/g, '∧').replace(/\\lor/g, '∨').replace(/\\oplus/g, '⊕').replace(/\\to/g, '→').replace(/\\leftrightarrow/g, '↔'), highlight: texOf(c) === texOf(A) || (B && texOf(c) === texOf(B)) }))];
  const kind = (col) => (col.every(Boolean) ? 'tautology' : col.every((x) => !x) ? 'contradiction' : 'contingency');
  const verdictA = kind(lastA);
  const equivalent = B ? lastA.every((x, k) => x === lastB[k]) : null;
  const steps = [
    { title: 'Columns', depth: 0, lines: [`${V.length} \\text{ letters} \\Rightarrow 2^{${V.length}} = ${rows.length} \\text{ rows; one column per sub-formula, innermost first}`] },
    { title: 'Result', depth: 0, lines: [`${texOf(A)} \\text{ is a ${verdictA}}`, ...(B ? [`${texOf(A)} ${equivalent ? '\\equiv' : '\\not\\equiv'} ${texOf(B)}`] : [])] },
  ];
  return { fTex: texOf(A), gTex: B ? texOf(B) : null, verdict: verdictA, equivalent, columns, rows, steps, notes: [verdictA === 'tautology' ? 'True in every row: a tautology.' : verdictA === 'contradiction' ? 'False in every row: a contradiction.' : 'True in some rows and false in others: a contingency.'], verified: true };
}
