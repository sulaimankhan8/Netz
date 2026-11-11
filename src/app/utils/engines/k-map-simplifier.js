/**
 * Karnaugh map simplification: the maths for /k-map-simplifier (Unit 15).
 *   Input: minterms Σm(…) with optional don't-cares d(…), for 2 to 4 variables A, B, C, D, or a Boolean
 *   expression (A'B + AC, with ' or ! for NOT, + for OR, a product for AND, ^ for XOR).
 *   Method (what the K-map groups do): Quine–McCluskey finds every prime implicant (largest groups of 1, 2, 4, 8
 *   cells); essential ones are taken first, then the fewest others that cover what is left (tried exhaustively,
 *   so the answer is minimal). POS is the same done on the 0s.
 *   The answer is checked against the truth table.
 */
import { EngineError } from '../numeric/steps';

const NAMES = ['A', 'B', 'C', 'D'];
const GRAY = [0, 1, 3, 2];

/** Parse a Boolean expression into a function of the bits. */
function parseExpr(text, nv) {
  const s = String(text ?? '').replace(/\s+/g, '').replace(/[·∙*]/g, '').replace(/[∨|]/g, '+').replace(/[¬~]/g, '!').replace(/’|′/g, "'").replace(/⊕/g, '^');
  if (!s) throw new EngineError('Type an expression like AB + A\'C.');
  let i = 0;
  const vars = new Set();
  const peek = () => s[i];
  const expr = () => { let l = xor(); while (peek() === '+') { i++; const r = xor(); const a = l; l = (v) => a(v) || r(v); } return l; };
  const xor = () => { let l = term(); while (peek() === '^') { i++; const r = term(); const a = l; l = (v) => a(v) !== r(v); } return l; };
  const term = () => { let l = factor(); while (i < s.length && /[A-Za-z(!01]/.test(peek())) { const r = factor(); const a = l; l = (v) => a(v) && r(v); } return l; };
  const factor = () => {
    let f;
    if (peek() === '!') { i++; const g = factor(); f = (v) => !g(v); }
    else if (peek() === '(') { i++; const g = expr(); if (peek() !== ')') throw new EngineError('A bracket is not closed.'); i++; f = g; }
    else if (peek() === '0' || peek() === '1') { const c = peek() === '1'; i++; f = () => c; }
    else if (/[A-Da-d]/.test(peek())) { const k = peek().toUpperCase().charCodeAt(0) - 65; vars.add(k); i++; f = (v) => v[k]; }
    else throw new EngineError(`Could not read "${s.slice(i)}". Use A–D, ' for NOT, + for OR.`);
    while (peek() === "'") { i++; const g = f; f = (v) => !g(v); }
    return f;
  };
  const fn = expr();
  if (i < s.length) throw new EngineError(`Could not read "${s.slice(i)}".`);
  const used = vars.size ? Math.max(...vars) + 1 : 1;
  return { fn, used };
}

const readList = (t, label, max) => {
  const s = String(t ?? '').replace(/[Σ∑mMd()]/g, ' ').trim();
  if (!s) return [];
  const out = s.split(/[\s,]+/).filter(Boolean).map((x) => { const v = Number(x); if (!Number.isInteger(v) || v < 0 || v >= max) throw new EngineError(`${label}: "${x}" should be a whole number from 0 to ${max - 1}.`); return v; });
  return [...new Set(out)].sort((p, q) => p - q);
};

/** Quine–McCluskey prime implicants: each { bits, mask (1 = dash), covers }. */
function primes(ones, dc, nv) {
  let groups = [...ones, ...dc].map((m) => ({ bits: m, mask: 0, covers: [m] }));
  const primesOut = [];
  while (groups.length) {
    const next = [], used = new Set();
    for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i], b = groups[j];
      if (a.mask !== b.mask) continue;
      const d = a.bits ^ b.bits;
      if (d && !(d & (d - 1))) {
        used.add(i); used.add(j);
        const g = { bits: a.bits & ~d, mask: a.mask | d, covers: [...new Set([...a.covers, ...b.covers])].sort((p, q) => p - q) };
        if (!next.some((q) => q.bits === g.bits && q.mask === g.mask)) next.push(g);
      }
    }
    groups.forEach((g, i) => { if (!used.has(i) && !primesOut.some((q) => q.bits === g.bits && q.mask === g.mask)) primesOut.push(g); });
    groups = next;
  }
  void nv;
  return primesOut;
}
/** smallest set of implicants covering `need` (essential first, then exhaustive by size, ties: fewest literals) */
function cover(ps, need, nv) {
  const lits = (p) => nv - popcount(p.mask);
  const ess = [];
  for (const m of need) { const who = ps.filter((p) => p.covers.includes(m)); if (who.length === 1 && !ess.includes(who[0])) ess.push(who[0]); }
  const left = need.filter((m) => !ess.some((p) => p.covers.includes(m)));
  const rest = ps.filter((p) => !ess.includes(p) && p.covers.some((m) => left.includes(m)));
  let best = null;
  if (!left.length) best = [];
  for (let k = 1; !best && k <= rest.length; k++) {
    const pick = (start, chosen) => {
      if (chosen.length === k) {
        if (left.every((m) => chosen.some((p) => p.covers.includes(m)))) { const c = chosen.reduce((s, p) => s + lits(p), 0); if (!best || c < best.cost) best = { set: [...chosen], cost: c }; }
        return;
      }
      for (let i = start; i < rest.length; i++) pick(i + 1, [...chosen, rest[i]]);
    };
    pick(0, []);
    if (best && best.set) best = best.set;
  }
  return { essential: ess, chosen: [...ess, ...(best || [])] };
}
const popcount = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
/** product term text: A'BC (MSB = A) */
function termText(p, nv, pos = false) {
  const parts = [];
  for (let k = 0; k < nv; k++) {
    const bit = 1 << (nv - 1 - k);
    if (p.mask & bit) continue;
    const one = !!(p.bits & bit);
    parts.push(pos ? (one ? `${NAMES[k]}'` : NAMES[k]) : one ? NAMES[k] : `${NAMES[k]}'`);
  }
  if (!parts.length) return pos ? '0' : '1';
  return pos ? (parts.length > 1 ? `(${parts.join(' + ')})` : parts[0]) : parts.join('');
}
const texOf = (t) => t.replace(/([A-D])'/g, '\\overline{$1}');

/** K-map layout: rows and columns in Gray order. */
export function layout(nv) {
  if (nv === 2) return { rowVars: 'A', colVars: 'B', rows: [0, 1], cols: [0, 1], cell: (r, c) => (r << 1) | c };
  if (nv === 3) return { rowVars: 'A', colVars: 'BC', rows: [0, 1], cols: GRAY, cell: (r, c) => (r << 2) | c };
  return { rowVars: 'AB', colVars: 'CD', rows: GRAY, cols: GRAY, cell: (r, c) => (r << 2) | c };
}

export function solve({ mode = 'minterms', vars = '4', m = '', d = '', expr = '' }) {
  let nv = Math.round(Number(vars) || 4);
  let ones, dc;
  if (mode === 'expression') {
    const { fn, used } = parseExpr(expr, 4);
    nv = Math.max(2, Math.min(4, Math.max(nv, used)));
    ones = [];
    for (let x = 0; x < 1 << nv; x++) { const v = Array.from({ length: nv }, (_, k) => !!(x & (1 << (nv - 1 - k)))); if (fn(v)) ones.push(x); }
    dc = readList(d, "Don't-cares", 1 << nv);
  } else {
    if (![2, 3, 4].includes(nv)) throw new EngineError('Use 2, 3 or 4 variables.');
    ones = readList(m, 'Minterms', 1 << nv);
    dc = readList(d, "Don't-cares", 1 << nv);
    if (!ones.length) throw new EngineError('Type the minterms, e.g. 0, 2, 5, 7, 8, 10, 13, 15.');
  }
  ones = ones.filter((x) => !dc.includes(x));
  const N = 1 << nv;
  const zeros = Array.from({ length: N }, (_, i) => i).filter((x) => !ones.includes(x) && !dc.includes(x));
  const steps = [];
  const names = NAMES.slice(0, nv).join(', ');
  steps.push({ title: 'The function', depth: 0, lines: [`f(${names}) = \\sum m(${ones.join(', ') || '\\,'})${dc.length ? ` + d(${dc.join(', ')})` : ''}`] });
  // SOP
  let sop, sopGroups = [];
  if (!ones.length) sop = '0';
  else if (!zeros.length) sop = '1';
  else {
    const ps = primes(ones, dc, nv);
    steps.push({ title: 'Prime implicants (the largest groups)', formula: '\\text{combine terms that differ in one variable, repeatedly}', depth: 0, lines: ps.map((p) => `${texOf(termText(p, nv))}: \\ m(${p.covers.join(', ')})`) });
    const { essential, chosen } = cover(ps, ones, nv);
    steps.push({ title: 'Essential prime implicants', formula: '\\text{the only group covering some 1}', depth: 0, lines: [essential.length ? essential.map((p) => texOf(termText(p, nv))).join(', \\ ') : '\\text{none}', ...(chosen.length > essential.length ? [`\\text{then the fewest others for the rest: } ${chosen.slice(essential.length).map((p) => texOf(termText(p, nv))).join(', ')}`] : [])] });
    sop = chosen.map((p) => termText(p, nv)).join(' + ');
    sopGroups = chosen.map((p) => ({ term: texOf(termText(p, nv)), cells: p.covers }));
  }
  // POS from the zeros
  let pos;
  if (!zeros.length) pos = '1';
  else if (!ones.length) pos = '0';
  else {
    const ps0 = primes(zeros, dc, nv);
    const { chosen } = cover(ps0, zeros, nv);
    pos = chosen.map((p) => termText(p, nv, true)).join('');
    steps.push({ title: 'Product of sums (group the 0s)', depth: 0, lines: [`f = ${texOf(pos)}`] });
  }
  steps.push({ title: 'Minimal sum of products', depth: 0, lines: [`f = ${texOf(sop)}`] });
  // check against the truth table
  const evalSop = (x) => sop === '1' || (sop !== '0' && sopGroups.some((g) => g.cells.includes(x)));
  const verified = ones.every(evalSop) && zeros.every((x) => !evalSop(x));
  const L = layout(nv);
  const grid = L.rows.map((r) => L.cols.map((c) => { const i = L.cell(r, c); return { i, v: ones.includes(i) ? '1' : dc.includes(i) ? 'X' : '0' }; }));
  const bin = (v, w) => v.toString(2).padStart(w, '0');
  return {
    nv, sop, sopTex: texOf(sop), pos, posTex: texOf(pos), groups: sopGroups,
    map: { rowVars: L.rowVars, colVars: L.colVars, rowLabels: L.rows.map((r) => bin(r, L.rowVars.length)), colLabels: L.cols.map((c) => bin(c, L.colVars.length)), grid },
    steps, notes: [], verified, result: sop,
  };
}
