/**
 * Several-variable calculus on top of the one-variable engine (catalog 6D, 6G, 6I; plan section 5.1, E2).
 * differentiate(node, v) already treats the other letters as constants, so a partial derivative is just
 * differentiate with that letter. This file adds: tidy forms checked numerically in every variable, chains of
 * partials (f_xy …), gradient, Hessian, Jacobian matrix and determinant, div and curl, and a solver for small
 * nonlinear systems (critical points, Lagrange points) that runs Newton's method from many starting points
 * and turns the answers back into exact values where it can.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, mul, sub, add, tidy, polish, tex, simplifyExact, variablesOf, parse } from './tree';
import { differentiate } from './derivative';
import { cleanest, recognise, ugliness } from './present';

const KNOWN_WORDS = new Set([
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'exp', 'log', 'ln', 'log10', 'sqrt', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'abs', 'cbrt',
  'pi', 'theta', 'varphi', 'phi', 'rho', 'lambda', 'alpha', 'beta', 'mu', 'sigma', 'tau', 'omega', 'heaviside', 'dirac', 'gamma',
]);

/**
 * Reads a function of several letters as students type it: xy and xyz mean x·y·z, θ φ ρ are allowed
 * (as theta, varphi, rho), ² and ³ are powers. Function names are checked by parse().
 */
export function readMulti(text, label = 'f', extra = []) {
  const raw = String(text ?? '').trim();
  if (!raw) throw new EngineError(`${label} is empty.`);
  const s = raw
    .replace(/θ/g, 'theta').replace(/[φϕ]/g, 'varphi').replace(/ρ/g, 'rho').replace(/λ/g, 'lambda')
    .replace(/²/g, '^2').replace(/³/g, '^3')
    // x(π − x), 3y(1 − y): a variable before a bracket is a product (x, y, z, t are never function names here)
    .replace(/(?<![a-zA-Z])([xyzt])\s*\(/g, '$1*(')
    // xy, 3axy, xyz → x*y, 3*a*x*y …: any word that is not a function or a known name is a product of letters
    .replace(/[a-zA-Z]+/g, (w, at, str) => {
      if (KNOWN_WORDS.has(w) || extra.includes(w) || w.length === 1) return w;
      if (!/^\s*\(/.test(str.slice(at + w.length))) return w.split('').join('*');
      // a word before a bracket: xsin( → x*sin(, xy( → x*y*(
      const fnEnd = [...KNOWN_WORDS].filter((k) => w.endsWith(k)).sort((a, b) => b.length - a.length)[0];
      if (fnEnd) return [...w.slice(0, -fnEnd.length).split(''), fnEnd].join('*');
      return `${w.split('').join('*')}*`;
    });
  return parse(s, label);
}

// Points where two expressions are compared (all letters get these values in turn)
// (small positive points too, so functions like x^(1/3) or sin⁻¹(…) are defined at enough of them)
const PROBES = [
  [0.37, 1.21, -0.53], [1.43, -0.67, 0.81], [-0.92, 0.48, 1.67], [2.11, 1.73, -1.19], [0.61, -1.38, 0.29], [-1.57, -0.83, 2.04],
  [0.21, 0.33, 0.17], [0.38, 0.27, 0.45], [0.52, 0.61, 0.29], [0.13, 0.42, 0.36],
];
const valueAt = (node, scope) => { try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const scopeOf = (vars, p) => Object.fromEntries(vars.map((v, i) => [v, p[i % p.length] + 0.13 * Math.floor(i / p.length)]));

/** Do p and q agree at the probe points where both are defined? (At least 3 points must be compared.) */
export function equalAt(p, q, vars) {
  let compared = 0;
  for (const pt of PROBES) {
    const s = scopeOf(vars, pt);
    const a = valueAt(p, s), b = valueAt(q, s);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) return false;
  }
  return compared >= 3;
}

/** All letters in a node (and in some extra nodes), sorted x, y, z first. */
export function lettersOf(...nodes) {
  const set = new Set();
  nodes.forEach((n) => variablesOf(n).forEach((v) => set.add(v)));
  const order = ['x', 'y', 'z', 'u', 'v', 'w', 'r', 's', 't'];
  return [...set].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));
}

/** The tidiest form of raw that still equals `reference` everywhere we look. */
export function tidyMulti(raw, vars, reference = raw) {
  const all = lettersOf(raw, reference).concat(vars).filter((v, i, a) => a.indexOf(v) === i);
  const accept = (g) => equalAt(g, reference, all);
  // Also try with sin² written as 1 − cos² (and the other way): r²(cos²θ sin θ + sin³θ) becomes r² sin θ
  // (only for small expressions: each variant is a full cleanest() run, seconds on big ones; decided by size, not time)
  const forms = [raw];
  let size = 0;
  raw.traverse(() => { size++; });
  if (hasTrigPower(raw) && size <= 60) for (const from of ['sin', 'cos']) { try { forms.push(simplifyExact(squareSwap(raw, from))); } catch { /* skip */ } }
  const best = forms.map((f) => cleanest(f, all[0] || 'x', accept)).filter(Boolean).sort((p, q) => ugliness(p) - ugliness(q))[0];
  if (best) return best;
  try { return polish(tidy(simplifyExact(raw))); } catch { return polish(tidy(raw)); }
}
const hasTrigPower = (node) => { let f = false; node.traverse((n) => { if (n.isOperatorNode && n.fn === 'pow' && n.args[0].isFunctionNode && ['sin', 'cos'].includes(n.args[0].fn.name)) f = true; }); return f; };
/** sinᵏu → sinᵏ⁻²u (1 − cos²u) for k ≥ 2 (or the same with cos). */
export function squareSwap(node, from) {
  const other = from === 'sin' ? 'cos' : 'sin';
  return node.transform((n) => {
    if (!(n.isOperatorNode && n.fn === 'pow' && n.args[0].isFunctionNode && n.args[0].fn.name === from)) return n;
    const k = n.args[1].isConstantNode ? n.args[1].value : NaN;
    if (!(Number.isInteger(k) && k >= 2)) return n;
    const u = n.args[0].args[0];
    const swap = math.parse(`(1 - ${other}(${u.toString()})^2)`);
    return k === 2 ? swap : mul(math.parse(`${from}(${u.toString()})^${k - 2}`), swap);
  });
}

/** ∂f/∂v with the step list from the one-variable engine; the result checked against math.js. */
export function partial(node, v, vars = lettersOf(node)) {
  const r = differentiate(node, v);
  let check;
  // the check only compares values at sample points, so math.js need not simplify it (that took seconds on big u)
  try { check = math.derivative(node, v, { simplify: false }); } catch { check = r.result; }
  const all = lettersOf(node, r.result).concat(vars).filter((x, i, a) => a.indexOf(x) === i);
  if (!equalAt(r.result, check, all) && !isZero(check, all)) throw new EngineError(`NETZ could not check ∂/∂${v} of this function.`);
  // The derivative engine records { rule, line }; step lists here use { title, lines }. Partials are written ∂/∂v.
  const dv = `\\frac{d}{d${v}}`, pv = `\\frac{\\partial}{\\partial ${v === 'theta' ? '\\theta' : v}}`;
  const steps = r.steps.filter(Boolean).map((s) => (s.lines ? s : { title: s.rule, formula: s.formula, lines: [String(s.line || '').split(dv).join(pv)], depth: s.depth || 0 }));
  return { result: tidyMulti(r.result, all, check), steps };
}

/** Is a node 0 at every probe point? */
export function isZero(node, vars) {
  return PROBES.every((pt) => { const y = valueAt(node, scopeOf(vars, pt)); return !Number.isFinite(y) || Math.abs(y) < 1e-10; })
    && PROBES.some((pt) => Number.isFinite(valueAt(node, scopeOf(vars, pt))));
}

/** Subscript name of a chain of partials: ['x', 'y'] → "f_{xy}", and the ∂ form ∂²f/∂y∂x. */
export function partialName(chain, f = 'f') {
  const counts = chain.length;
  const sub = chain.join('');
  const denom = [];
  // ∂²f/∂y∂x means first x then y (read right to left)
  for (let i = chain.length - 1; i >= 0;) {
    let j = i;
    while (j > 0 && chain[j - 1] === chain[i]) j--;
    const k = i - j + 1;
    denom.push(`\\partial ${chain[i]}${k > 1 ? `^{${k}}` : ''}`);
    i = j - 1;
  }
  const top = counts === 1 ? `\\partial ${f}` : `\\partial^{${counts}} ${f}`;
  return { sub: `${f}_{${sub}}`, frac: `\\frac{${top}}{${denom.join(' ')}}` };
}

/** Successive partials along a chain, e.g. ['x', 'x', 'y'] for f_xxy. Returns [{ chain, node, steps }]. */
export function partialChain(node, chain, vars = lettersOf(node)) {
  const out = [];
  let cur = node;
  chain.forEach((v, i) => {
    const r = partial(cur, v, vars);
    cur = r.result;
    out.push({ chain: chain.slice(0, i + 1), node: cur, steps: r.steps });
  });
  return out;
}

export const gradient = (node, vars) => vars.map((v) => partial(node, v, vars).result);
export const hessian = (node, vars) => {
  const g = gradient(node, vars);
  return vars.map((_, i) => vars.map((w) => partial(g[i], w, vars).result));
};
/** Jacobian matrix of functions fs with respect to vars: rows = functions. */
export const jacobianMatrix = (fs, vars) => fs.map((f) => vars.map((v) => partial(f, v, vars).result));

/** Determinant of a 2×2 or 3×3 matrix of nodes, expanded along the first row, then tidied. */
export function determinant(M, vars) {
  let raw;
  if (M.length === 2) raw = sub(mul(M[0][0], M[1][1]), mul(M[0][1], M[1][0]));
  else if (M.length === 3) {
    const minor = (i, j) => M.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
    const d2 = (m) => sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0]));
    raw = add(sub(mul(M[0][0], d2(minor(0, 0))), mul(M[0][1], d2(minor(0, 1)))), mul(M[0][2], d2(minor(0, 2))));
  } else throw new EngineError('Only 2 × 2 and 3 × 3 determinants are supported.');
  return tidyMulti(raw, vars);
}

/** div F and curl F for F = [P, Q, R] in x, y, z. */
export const divergence = (F, vars = ['x', 'y', 'z']) => tidyMulti(F.map((f, i) => partial(f, vars[i], vars).result).reduce((a, b) => add(a, b)), vars);
export function curl(F, vars = ['x', 'y', 'z']) {
  const [x, y, z] = vars;
  const d = (f, v) => partial(f, v, vars).result;
  return [
    tidyMulti(sub(d(F[2], y), d(F[1], z)), vars),
    tidyMulti(sub(d(F[0], z), d(F[2], x)), vars),
    tidyMulti(sub(d(F[1], x), d(F[0], y)), vars),
  ];
}

/** LaTeX for a matrix of nodes. */
export const matrixTex = (M) => `\\begin{bmatrix} ${M.map((r) => r.map((c) => mtex(c)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** A number as exact LaTeX when we can (1/2, √3, π/4, …), else 6 significant figures. */
export function exactTex(y, deep = true) {
  if (Math.abs(y) < 1e-12) return '0';
  const r = recognise(y);
  if (r) return r;
  // a/b·√k for small k
  for (const k of [2, 3, 5, 6, 7, 10]) {
    const f = toFraction(y / Math.sqrt(k), 24, 1e-9);
    if (f && f.n !== 0) {
      const top = Math.abs(f.n) === 1 ? `\\sqrt{${k}}` : `${Math.abs(f.n)}\\sqrt{${k}}`;
      return `${f.n < 0 ? '-' : ''}${f.d === 1 ? top : `\\frac{${top}}{${f.d}}`}`;
    }
  }
  // A simple number times e, e², π or πe (e cos(π/4) = √2 e/2), π², π³, or divided by e or e² (8/(3e²))
  if (deep) {
    const KS = [['e', Math.E], ['e^{2}', Math.E ** 2], ['\\pi', Math.PI], ['\\pi e', Math.PI * Math.E], ['\\pi^{2}', Math.PI ** 2], ['\\pi^{3}', Math.PI ** 3]];
    // first a plain number times one constant (−π³, not −π²·π), then anything recognisable times a constant
    for (const [K, k] of KS) {
      const f = toFraction(y / k, 24, 1e-9);
      if (!f || f.n === 0) continue;
      const a = Math.abs(f.n);
      return `${f.n < 0 ? '-' : ''}${f.d === 1 ? `${a === 1 ? '' : a}${K}` : `\\frac{${a === 1 ? '' : a}${K}}{${f.d}}`}`;
    }
    for (const [K, k] of KS) {
      const t = exactTex(y / k, false);
      if (/\d\.\d/.test(t) || t === '0') continue;
      if (t === '1') return K;
      if (t === '-1') return `-${K}`;
      // a sum such as 5√5/6 − 1/6: bracket it, (5√5/6 − 1/6)π (the fraction merge below is for one fraction only)
      if (/.\s[+-]\s/.test(t)) return `\\left(${t}\\right)${K}`;
      const m = t.match(/^(-?)\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{(\d+)\}$/);
      if (m) return `${m[1]}\\frac{${m[2] === '1' ? '' : m[2]}${m[2] === '1' ? '' : '\\,'}${K}}{${m[3]}}`;
      return `${t}\\,${K}`;
    }
    // divided by e, e² or e³ (and possibly times π): 8π/(3e²)
    for (const [K, k] of [['e', Math.E], ['e^{2}', Math.E ** 2], ['e^{3}', Math.E ** 3]]) {
      for (const [P, p] of [['', 1], ['\\pi', Math.PI]]) {
        const f = toFraction((y * k) / p, 24, 1e-9);
        if (!f || f.n === 0) continue;
        const top = Math.abs(f.n) === 1 && P ? P : `${Math.abs(f.n)}${P}`;
        return `${f.n < 0 ? '-' : ''}\\frac{${top}}{${f.d === 1 ? '' : f.d}${K}}`;
      }
    }
  }
  return String(Number(y.toPrecision(6)));
}
/** A number snapped to a nearby simple value (fraction or a/b·√k), so later checks see exact zeros. */
export function snap(y) {
  if (Math.abs(y) < 1e-9) return 0;
  const f = toFraction(y, 1000, 1e-9);
  if (f) return f.n / f.d;
  for (const k of [2, 3, 5, 6, 7, 10]) { const g = toFraction(y / Math.sqrt(k), 100, 1e-9); if (g) return (g.n / g.d) * Math.sqrt(k); }
  return y;
}

/** The nearest simple value (n/d with d ≤ 12, or that times √k) within 10⁻³, or null. */
function snapLoose(y) {
  if (Math.abs(y) < 1e-3) return 0;
  const cands = [];
  for (let d = 1; d <= 12; d++) cands.push(Math.round(y * d) / d);
  for (const k of [2, 3, 5, 6]) for (let d = 1; d <= 6; d++) cands.push((Math.round((y / Math.sqrt(k)) * d) / d) * Math.sqrt(k));
  const best = cands.filter((c) => c !== 0).sort((a, b) => Math.abs(a - y) - Math.abs(b - y))[0];
  return best !== undefined && Math.abs(best - y) < 1e-3 ? best : null;
}

/** LaTeX for a node without the brackets math.js puts round a negated product: −(r sin θ) → −r sin θ. */
export function mtex(node) {
  return textbookNames(constantFirst(expAsPower(dropMinusBrackets(tex(node)))));
}

/** heaviside → u, dirac → δ, and "+ \frac{-u}{v}" → "- \frac{u}{v}" (only when the top is one term). */
function textbookNames(t) {
  const named = t.replace(/\\mathrm\{heaviside\}/g, 'u').replace(/\\mathrm\{dirac\}/g, '\\delta')
    // atan2(y, x) is written tan⁻¹(y/x) in textbooks (the quadrant is said in the steps)
    .replace(/\\mathrm\{atan2\}\\left\(([^,(){}]+), ([^,(){}]+)\\right\)/g, '\\tan^{-1}\\left(\\frac{$1}{$2}\\right)');
  // a whole expression that is one fraction with a lone negative top: \frac{-y}{…} → -\frac{y}{…}
  const lead = named.match(/^\\frac\{-\s*([^{}+-]+)\}/);
  return minusOutOfFraction(lead ? `-\\frac{${lead[1]}}${named.slice(lead[0].length)}` : named);
}
export function minusOutOfFraction(t) {
  let out = t;
  for (let from = 0; ;) {
    const m = /\+\s*\\frac\{-\s*/.exec(out.slice(from));
    if (!m) return out;
    const start = from + m.index, body = start + m[0].length;
    // scan the top to its closing brace; a + or − at depth 0 means more than one term
    let depth = 1, j = body, single = true;
    for (; j < out.length && depth > 0; j++) {
      const c = out[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 1 && (c === '+' || c === '-') && j > body) single = false;
      if (out.startsWith('\\left', j)) depth++;
      if (out.startsWith('\\right', j)) depth--;
    }
    if (single) { out = `${out.slice(0, start)}-\\frac{${out.slice(body)}`; from = start + 1; } else from = body;
  }
}

/** "-y+2" → "2-y" and "-{x}^{2}+4" → "4-{x}^{2}" (a lone negative term then a positive number). */
function constantFirst(t) {
  return t.replace(/(^|[{(]|\\left\()\s*-\s*((?:\{?[a-z]\}?|\\[a-z]+)(?:\^\{\d+\})?)\s*\+\s*(\d+(?:\.\d+)?)(?=\s*(?:[})]|\\right|$))/g, '$1$3-$2');
}

/** \exp\left(u\right) → e^{u}, as textbooks write it. */
function expAsPower(t) {
  let out = '';
  let i = 0;
  while (i < t.length) {
    const at = t.indexOf('\\exp\\left(', i);
    if (at < 0) { out += t.slice(i); break; }
    let depth = 1, j = at + 10;
    while (j < t.length && depth > 0) {
      if (t.startsWith('\\left', j)) { depth++; j += 5; continue; }
      if (t.startsWith('\\right', j)) { depth--; if (depth === 0) break; j += 6; continue; }
      j++;
    }
    if (depth !== 0) { out += t.slice(i); break; }
    out += `${t.slice(i, at)}e^{${expAsPower(t.slice(at + 10, j))}}`;
    i = j + 7;
  }
  return out;
}

/** Integrand LaTeX, bracketed when it is a sum: ∫ (x² + y²) dy. */
export function integrandTex(node) {
  const t = mtex(node);
  const top = node.isParenthesisNode ? node.content : node;
  return top.isOperatorNode && ['add', 'subtract'].includes(top.fn) ? `\\left(${t}\\right)` : t;
}

function dropMinusBrackets(t) {
  let out = '';
  let i = 0;
  while (i < t.length) {
    const at = t.indexOf('-\\left(', i);
    if (at < 0) { out += t.slice(i); break; }
    // Find the matching \right), counting nested \left( … \right)
    let depth = 1, j = at + 7, plain = true;
    while (j < t.length && depth > 0) {
      if (t.startsWith('\\left', j)) { depth++; j += 5; continue; }
      if (t.startsWith('\\right', j)) { depth--; if (depth === 0) break; j += 6; continue; }
      if (depth === 1 && (t[j] === '+' || t[j] === '-')) plain = false;
      j++;
    }
    const before = at > 0 ? t[at - 1] : '';
    const opens = at === 0 || /[\s({=,&]/.test(before);
    if (depth === 0 && plain && opens) {
      out += t.slice(i, at) + '-' + t.slice(at + 7, j);
      i = j + 7; // skip "\right)"
    } else {
      out += t.slice(i, at + 7);
      i = at + 7;
    }
  }
  return out;
}

/**
 * Real solutions of a square system eqs = 0 in vars, by Newton's method from many starting points in
 * [−R, R]^n (Halton points), with a symbolic Jacobian. Solutions are de-duplicated and snapped.
 * Returns [{ values: number[], tex: string[] }], sorted. May miss solutions on curves or far outside the box.
 */
export function solveSystem(eqs, vars, { R = 6, starts = 500, extra = [] } = {}) {
  const n = vars.length;
  if (eqs.length !== n) throw new EngineError('The system needs as many equations as unknowns.');
  const F = eqs.map((e) => e.compile());
  const J = eqs.map((e) => vars.map((v) => { try { return math.derivative(e, v).compile(); } catch { return null; } }));
  if (J.some((r) => r.some((c) => !c))) throw new EngineError('NETZ could not differentiate these equations.');
  const at = (fns, x) => { const s = Object.fromEntries(vars.map((v, i) => [v, x[i]])); return fns.map((f) => { try { const y = f.evaluate(s); return typeof y === 'number' ? y : NaN; } catch { return NaN; } }); };
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  const primes = [2, 3, 5, 7, 11];
  const startPts = [...extra];
  for (let i = 1; i <= starts; i++) startPts.push(vars.map((_, k) => (halton(i, primes[k]) * 2 - 1) * R));
  startPts.push(vars.map(() => 0), vars.map(() => 0.5), vars.map(() => -0.5));
  const found = [];
  for (const x0 of startPts) {
    let x = [...x0];
    let ok = false;
    for (let it = 0; it < 60; it++) {
      const f = at(F, x);
      if (f.some((v) => !Number.isFinite(v))) break;
      const norm = Math.max(...f.map(Math.abs));
      if (norm < 1e-12) { ok = true; break; }
      const A = J.map((row) => at(row, x));
      const dx = gauss(A, f.map((v) => -v));
      if (!dx) break;
      x = x.map((v, i) => v + dx[i]);
      if (x.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e4)) break;
      if (Math.max(...dx.map(Math.abs)) < 1e-14 * Math.max(1, ...x.map(Math.abs))) { ok = Math.max(...at(F, x).map(Math.abs)) < 1e-9; break; }
    }
    if (!ok) continue;
    // Newton crawls towards a degenerate root (e.g. 0.00006 for 0), so try nearby simple values too
    const res = (p) => Math.max(...at(F, p).map(Math.abs));
    let use = x;
    const loose = x.map(snapLoose);
    const s = x.map(snap);
    if (loose.every((v) => v !== null) && res(loose) < 1e-12) use = loose;
    else if (res(s) < 1e-9) use = s;
    if (!found.some((p) => p.every((v, i) => Math.abs(v - use[i]) < 1e-6 * Math.max(1, Math.abs(v))))) found.push(use);
  }
  found.sort((p, q) => { for (let i = 0; i < n; i++) if (Math.abs(p[i] - q[i]) > 1e-9) return p[i] - q[i]; return 0; });
  return found.map((values) => ({ values, tex: values.map(exactTex) }));
}

/** Gaussian elimination with partial pivoting; null if singular. */
function gauss(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-14) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** Value of a node at a point given as { x: …, y: … }. */
export const evalAt = (node, point) => valueAt(node, point);
export { num };
