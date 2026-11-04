/**
 * Simplifying rational expressions (fractions of polynomials), including sums and differences of them.
 *   1. restrictions: every value that makes a denominator in the ORIGINAL expression zero
 *   2. sums/differences: the lowest common denominator (LCD), then one fraction over it
 *   3. factor the top and the bottom (src/app/utils/symbolic/algebra.js)
 *   4. cancel common factors; the restrictions stay, even for factors that cancelled
 * The answer is checked numerically against the original expression.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { parse, variablesOf, unwrap, tex, polish } from '../symbolic/tree';
import { rationalParts, polyMul } from '../symbolic/poly';
import { factorPolynomial, polyTex, fracTex } from '../symbolic/algebra';
import { polyRoots } from '../symbolic/roots';

const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const key = (f) => f.c.join(',');

/** Factor list of a polynomial: { k (number), list: [{ c, m }] } with x itself as the factor [0, 1]. */
function factorList(c, v) {
  const r = factorPolynomial(c, v);
  const list = r.factors.map((f) => ({ c: f.c, m: f.m }));
  if (r.xPower) list.unshift({ c: [0, 1], m: r.xPower });
  return { k: r.content, list, steps: r.steps };
}
const product = (k, list) => list.reduce((acc, f) => { let p = acc; for (let i = 0; i < f.m; i++) p = polyMul(p, f.c); return p; }, [k]);

/** LaTeX for k · Π factors over Π factors. */
function fractionTex(k, top, bottom, v) {
  const f = toFraction(k, 100000, 1e-9) || { n: k, d: 1 };
  const part = (list, num) => {
    // One factor on its own with no number in front needs no brackets: \frac{x - 1}{x + 1}
    if (list.length === 1 && list[0].m === 1 && Math.abs(num) === 1) return polyTex(list[0].c, v);
    const t = list.map((g) => {
      const p = polyTex(g.c, v);
      const plain = g.c.length === 2 && g.c[0] === 0 && g.c[1] === 1;
      return `${plain ? p : `\\left(${p}\\right)`}${g.m > 1 ? `^{${g.m}}` : ''}`;
    }).join('');
    const n = Math.abs(num);
    if (!t) return String(n);
    return `${n === 1 ? '' : n}${t}`;
  };
  const sign = f.n < 0 ? '-' : '';
  const T = part(top, f.n), B = part(bottom, f.d);
  if (B === '1') return `${sign}${T}`;
  return `${sign}\\frac{${T}}{${B}}`;
}

export function solve({ expr }) {
  const node = parse(expr, 'The expression');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const whole = rationalParts(node, v);
  if (!whole) throw new EngineError('NETZ simplifies fractions of polynomials. Use whole-number powers only (no roots or functions).');
  if (whole.P.length > 13 || whole.Q.length > 13) throw new EngineError('These polynomials are too big; use degree 12 or less.');
  const steps = [];

  // 1. Restrictions from every denominator in the original expression
  const dens = [];
  node.traverse((m) => {
    if (m.isOperatorNode && m.fn === 'divide' && variablesOf(m.args[1]).has(v)) dens.push(unwrap(m.args[1]));
    if (m.isOperatorNode && m.fn === 'pow' && m.args[1].isConstantNode && m.args[1].value < 0) dens.push(unwrap(m.args[0]));
  });
  const restricted = [];
  for (const d of dens) {
    const r = rationalParts(d, v);
    if (!r) continue;
    for (const z of [...polyRoots(r.P), ...polyRoots(r.Q)]) if (!restricted.some((y) => Math.abs(y.x - z.x) < 1e-9)) restricted.push(z);
  }
  restricted.sort((a, b) => a.x - b.x);
  if (restricted.length) steps.push({ title: 'Restrictions: a denominator cannot be 0', lines: [`${v} \\neq ${restricted.map((z) => z.tex).join(', \\ ')}`] });

  // 2. A sum or difference: the LCD and one fraction
  const top = unwrap(node);
  const isSum = top.isOperatorNode && (top.fn === 'add' || top.fn === 'subtract') && dens.length > 0;
  const Q = factorList(whole.Q, v);
  if (isSum) {
    const lcd = new Map();
    for (const d of dens) {
      const r = rationalParts(d, v);
      if (!r || r.Q.length > 1) continue;
      for (const f of factorList(r.P, v).list) { const e = lcd.get(key(f)); if (!e || e.m < f.m) lcd.set(key(f), { ...f }); }
    }
    const lcdList = [...lcd.values()];
    const lcdPoly = product(1, lcdList);
    // Numerator over the LCD: P · LCD / Q
    const num = divideExact(polyMul(whole.P, lcdPoly), whole.Q);
    if (num) {
      steps.push({ title: 'Write every fraction over the lowest common denominator', lines: [`\\text{LCD} = ${fractionTex(1, lcdList, [], v)}`, `${tex(polish(node)).trim()} = \\frac{${polyTex(num, v)}}{${fractionTex(1, lcdList, [], v)}}`] });
    }
  }

  // 3. Factor the top and the bottom
  const P = factorList(whole.P, v);
  steps.push({
    title: 'Factor the top and the bottom',
    lines: [`\\frac{${polyTex(whole.P, v)}}{${polyTex(whole.Q, v)}} = ${fractionTex(P.k / Q.k, P.list, Q.list, v)}`],
  });

  // 4. Cancel
  const topLeft = [], botLeft = Q.list.map((f) => ({ ...f }));
  const cancelled = [];
  for (const f of P.list) {
    const b = botLeft.find((g) => key(g) === key(f));
    if (!b) { topLeft.push({ ...f }); continue; }
    const m = Math.min(f.m, b.m);
    cancelled.push({ c: f.c, m });
    if (f.m > m) topLeft.push({ c: f.c, m: f.m - m });
    b.m -= m;
  }
  const bottom = botLeft.filter((g) => g.m > 0);
  const k = P.k / Q.k;
  const answer = fractionTex(k, topLeft, bottom, v);
  if (cancelled.length) {
    steps.push({ title: 'Cancel the common factors', lines: [`\\text{Cancel } ${cancelled.map((f) => `\\left(${polyTex(f.c, v)}\\right)${f.m > 1 ? `^{${f.m}}` : ''}`).join(', ')}`, `= ${answer}`] });
  } else {
    steps.push({ title: 'No common factors to cancel', lines: [`= ${answer}`] });
  }
  steps.push({ title: 'Answer', lines: [`${answer}${restricted.length ? `, \\quad ${v} \\neq ${restricted.map((z) => z.tex).join(', \\ ')}` : ''}`] });

  // Check against the original at a few points away from the restrictions
  const topP = product(k, topLeft), botP = product(1, bottom);
  const ev = (c, x) => c.reduceRight((acc, a) => acc * x + a, 0);
  let verified = true;
  for (const x of [0.37, 1.29, 2.13, -0.71, 3.7]) {
    const want = valueAt(node, v, x), got = ev(topP, x) / ev(botP, x);
    if (Number.isFinite(want) && Number.isFinite(got) && Math.abs(want - got) > 1e-7 * Math.max(1, Math.abs(want))) verified = false;
  }
  return { variable: v, input: tex(polish(node)).trim(), answer, restrictions: restricted.map((z) => z.tex), steps, verified, result: answer, notes: [], plot: null };
}

/** p / q when q divides p exactly (polynomial long division), else null. */
function divideExact(p, q) {
  const P = [...p], Q = [...q];
  while (Q.length > 1 && Math.abs(Q.at(-1)) < 1e-12) Q.pop();
  if (P.length < Q.length) return null;
  const out = new Array(P.length - Q.length + 1).fill(0);
  for (let k = P.length - Q.length; k >= 0; k--) {
    const c = P[k + Q.length - 1] / Q.at(-1);
    out[k] = c;
    for (let j = 0; j < Q.length; j++) P[k + j] -= c * Q[j];
  }
  return P.slice(0, Q.length - 1).every((r) => Math.abs(r) < 1e-9) ? out : null;
}
