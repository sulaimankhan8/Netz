/**
 * Sets and relations: the maths for /set-operations (catalog 7M).
 *   sets        union, intersection, differences, symmetric difference, complements (with U), the
 *               Venn regions, n(A ∪ B) = n(A) + n(B) − n(A ∩ B) (and the three-set version), power set size
 *   expression  any formula in A, B, C with ∪ ∩ − △ and ' (complement), e.g. (A ∪ B)' ∩ C
 *   relation    a relation R on A as pairs: reflexive, symmetric, antisymmetric, transitive; equivalence
 *               classes or a partial order; whether R is a function
 */
import { EngineError } from '../numeric/steps';

const readSet = (s, label) => {
  const raw = String(s ?? '').replace(/[{}]/g, '').trim();
  if (!raw) return [];
  const items = raw.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
  if (items.length > 60) throw new EngineError(`${label}: use at most 60 elements.`);
  return [...new Set(items)];
};
const order = (xs) => [...xs].sort((a, b) => (Number.isFinite(+a) && Number.isFinite(+b) ? a - b : String(a).localeCompare(String(b))));
const setTex = (xs) => (xs.length ? `\\{${order(xs).map((x) => (/^[\w.+-]+$/.test(x) ? x : `\\text{${x}}`)).join(', ')}\\}` : '\\varnothing');
const union = (a, b) => [...new Set([...a, ...b])];
const inter = (a, b) => a.filter((x) => b.includes(x));
const minus = (a, b) => a.filter((x) => !b.includes(x));

/** Parse and evaluate a set formula: ∪ (also u, |, +), ∩ (n, &), − (\, -), △ (^), ' (complement). */
function evaluate(expr, sets, U) {
  const src = String(expr).replace(/∪/g, '|').replace(/∩/g, '&').replace(/[△Δ]/g, '^').replace(/[−\\]/g, '-').replace(/’|ᶜ/g, "'").replace(/\s+/g, '');
  let i = 0;
  const lines = [];
  const peek = () => src[i];
  const atom = () => {
    let v, name;
    if (peek() === '(') { i++; const r = expr2(); if (peek() !== ')') throw new EngineError('A bracket is not closed.'); i++; v = r.v; name = `(${r.name})`; }
    else if (/[ABC]/.test(peek())) { name = peek(); v = sets[name]; i++; if (!v) throw new EngineError(`Set ${name} is not given.`); }
    else if (peek() === 'U') { name = 'U'; v = U; i++; if (!U) throw new EngineError('Give the universal set U.'); }
    else throw new EngineError('Use A, B, C, U with ∪ (or |), ∩ (or &), −, △ and \' for the complement.');
    while (peek() === "'") { i++; if (!U) throw new EngineError("A complement (') needs the universal set U."); v = minus(U, v); name = `${name}'`; lines.push(`${name} = ${setTex(v)}`); }
    return { v, name };
  };
  const expr2 = () => {
    let left = atom();
    while (i < src.length && '|&-^+un'.includes(peek())) {
      const op = peek(); i++;
      const right = atom();
      const sym = { '|': '\\cup', '+': '\\cup', u: '\\cup', '&': '\\cap', n: '\\cap', '-': '-', '^': '\\triangle' }[op];
      const v = sym === '\\cup' ? union(left.v, right.v) : sym === '\\cap' ? inter(left.v, right.v) : sym === '-' ? minus(left.v, right.v) : union(minus(left.v, right.v), minus(right.v, left.v));
      left = { v, name: `${left.name} ${sym} ${right.name}` };
      lines.push(`${left.name} = ${setTex(v)}`);
    }
    return left;
  };
  const r = expr2();
  if (i < src.length) throw new EngineError(`Could not read "${src.slice(i)}".`);
  return { ...r, lines };
}

export function solve({ mode = 'sets', U = '', A = '', B = '', C = '', expression = '', relation = '' }) {
  const u = String(U).trim() ? readSet(U, 'U') : null;
  const a = readSet(A, 'A'), b = readSet(B, 'B'), c = String(C).trim() ? readSet(C, 'C') : null;
  const sets = { A: a, B: b, ...(c ? { C: c } : {}) };
  const steps = [];
  if (u) for (const [k, v] of Object.entries(sets)) { const out = minus(v, u); if (out.length) throw new EngineError(`${k} has ${out.join(', ')}, which is not in U.`); }
  if (mode === 'sets') {
    const ops = [['A \\cup B', union(a, b)], ['A \\cap B', inter(a, b)], ['A - B', minus(a, b)], ['B - A', minus(b, a)], ['A \\triangle B', union(minus(a, b), minus(b, a))]];
    if (u) ops.push(["A'", minus(u, a)], ["B'", minus(u, b)]);
    steps.push({ title: 'Operations', depth: 0, lines: ops.map(([n, v]) => `${n} = ${setTex(v)}`) });
    const nAB = union(a, b).length;
    steps.push({ title: 'Counting', formula: 'n(A \\cup B) = n(A) + n(B) - n(A \\cap B)', depth: 0, lines: [`${nAB} = ${a.length} + ${b.length} - ${inter(a, b).length} \\ \\checkmark`] });
    if (c) {
      const all = union(union(a, b), c);
      steps.push({ title: 'Three sets', formula: 'n(A \\cup B \\cup C) = \\sum n(A) - \\sum n(A \\cap B) + n(A \\cap B \\cap C)', depth: 0, lines: [`${all.length} = ${a.length} + ${b.length} + ${c.length} - ${inter(a, b).length} - ${inter(b, c).length} - ${inter(a, c).length} + ${inter(inter(a, b), c).length} \\ \\checkmark`] });
    }
    if (u) steps.push({ title: "De Morgan's laws", depth: 1, lines: [`(A \\cup B)' = ${setTex(minus(u, union(a, b)))} = A' \\cap B'`, `(A \\cap B)' = ${setTex(minus(u, inter(a, b)))} = A' \\cup B'`] });
    steps.push({ title: 'Power set', depth: 1, lines: [`n(P(A)) = 2^{${a.length}} = ${2 ** a.length}`] });
    // Venn regions: elements by membership pattern
    const names = c ? ['A', 'B', 'C'] : ['A', 'B'];
    const pool = union(u || [], union(union(a, b), c || []));
    const regions = {};
    for (const x of pool) { const key = names.map((n) => (sets[n].includes(x) ? '1' : '0')).join(''); (regions[key] ||= []).push(x); }
    Object.values(regions).forEach((r) => r.splice(0, r.length, ...order(r)));
    return { ops: ops.map(([n, v]) => ({ name: n, tex: setTex(v), n: v.length })), regions, names, hasU: !!u, steps, notes: [], verified: true, result: ops.map(([, v]) => v.length) };
  }
  if (mode === 'expression') {
    const r = evaluate(expression, sets, u);
    steps.push({ title: 'Work it out from the inside', depth: 0, lines: r.lines.length ? r.lines : [`${r.name} = ${setTex(r.v)}`] });
    const names = c ? ['A', 'B', 'C'] : ['A', 'B'];
    const pool = union(u || [], union(union(a, b), c || []));
    const regions = {}, shade = {};
    for (const x of pool) { const key = names.map((n) => (sets[n].includes(x) ? '1' : '0')).join(''); (regions[key] ||= []).push(x); if (r.v.includes(x)) shade[key] = true; }
    return { answerTex: `${r.name} = ${setTex(r.v)}`, regions, shade, names, hasU: !!u, steps, notes: [], verified: true, result: order(r.v) };
  }
  if (mode === 'relation') {
    if (!a.length) throw new EngineError('Give the set A the relation is on.');
    const pairs = [...String(relation).matchAll(/\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g)].map((m) => [m[1], m[2]]);
    if (!pairs.length && String(relation).trim()) throw new EngineError('Write the pairs like (1,2), (2,3).');
    const bad = pairs.find(([x, y]) => !a.includes(x) || !a.includes(y));
    if (bad) throw new EngineError(`(${bad.join(', ')}) uses an element that is not in A.`);
    const has = (x, y) => pairs.some(([p, q]) => p === x && q === y);
    const missRefl = a.filter((x) => !has(x, x));
    const missSym = pairs.find(([x, y]) => !has(y, x));
    const antiFail = pairs.find(([x, y]) => x !== y && has(y, x));
    let missTrans = null;
    outer: for (const [x, y] of pairs) for (const [p, q] of pairs) if (y === p && !has(x, q)) { missTrans = [x, y, q]; break outer; }
    const refl = !missRefl.length, sym = !missSym, anti = !antiFail, trans = !missTrans;
    const pt = (x, y) => `(${x}, ${y})`;
    steps.push({ title: 'Reflexive', formula: '(a, a) \\in R \\text{ for every } a', depth: 0, lines: [refl ? '\\text{Yes: every } (a, a) \\text{ is in R.}' : `\\text{No: } ${missRefl.map((x) => pt(x, x)).join(', ')} \\notin R`] });
    steps.push({ title: 'Symmetric', formula: '(a, b) \\in R \\Rightarrow (b, a) \\in R', depth: 0, lines: [sym ? '\\text{Yes.}' : `\\text{No: } ${pt(...missSym)} \\in R \\text{ but } ${pt(missSym[1], missSym[0])} \\notin R`] });
    steps.push({ title: 'Antisymmetric', formula: '(a, b), (b, a) \\in R \\Rightarrow a = b', depth: 0, lines: [anti ? '\\text{Yes.}' : `\\text{No: } ${pt(...antiFail)} \\text{ and } ${pt(antiFail[1], antiFail[0])} \\text{ with } ${antiFail[0]} \\ne ${antiFail[1]}`] });
    steps.push({ title: 'Transitive', formula: '(a, b), (b, c) \\in R \\Rightarrow (a, c) \\in R', depth: 0, lines: [trans ? '\\text{Yes.}' : `\\text{No: } ${pt(missTrans[0], missTrans[1])}, ${pt(missTrans[1], missTrans[2])} \\in R \\text{ but } ${pt(missTrans[0], missTrans[2])} \\notin R`] });
    const kinds = [];
    let classes = null;
    if (refl && sym && trans) {
      kinds.push('equivalence relation');
      const seen = new Set();
      classes = order(a).filter((x) => !seen.has(x)).map((x) => { const cls = a.filter((y) => has(x, y)); cls.forEach((y) => seen.add(y)); return cls; });
      steps.push({ title: 'Equivalence classes', depth: 0, lines: classes.map((cls) => `[${order(cls)[0]}] = ${setTex(cls)}`) });
    }
    if (refl && anti && trans) kinds.push('partial order');
    const isFunction = a.every((x) => pairs.filter(([p]) => p === x).length === 1);
    steps.push({ title: 'Is R a function A → A?', depth: 1, lines: [isFunction ? '\\text{Yes: each element has exactly one image.}' : '\\text{No: some element has no image, or more than one.}'] });
    return { properties: { reflexive: refl, symmetric: sym, antisymmetric: anti, transitive: trans }, kinds, classes: classes && classes.map(setTex), isFunction, steps, notes: [kinds.length ? `R is a ${kinds.join(' and a ')}.` : 'R is neither an equivalence relation nor a partial order.'], verified: true, result: kinds };
  }
  throw new EngineError('Choose what to work out.');
}
