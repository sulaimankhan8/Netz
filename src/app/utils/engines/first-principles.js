/**
 * Derivative from first principles: f'(x) = lim_{h→0} [f(x + h) − f(x)] / h, worked the way textbooks do.
 *   polynomials        expand f(x + h), cancel f(x), divide by h, let h → 0
 *   P(x)/Q(x)          one fraction over Q(x + h)Q(x), the top has a factor h
 *   √g(x)              multiply by the conjugate (rationalise)
 *   sin x, cos x       sum-to-product, then sin θ / θ → 1
 *   eˣ, ln x           the standard limits (eʰ − 1)/h → 1 and ln(1 + t)/t → 1
 * The answer is checked against math.js's derivative at several points; `verified` says whether it agreed.
 * Expansions use exact coefficient arithmetic (src/app/utils/symbolic/poly.js), never math.rationalize.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readNumber } from './input';
import { math, parse, variablesOf, bestForm, num, sym, fn, mul, add, div, pow, paren, unwrap, tidy, tex, polish } from '../symbolic/tree';
import { polynomialCoeffs, rationalParts, polyAdd, polyMul, polyScale } from '../symbolic/poly';
import { polyNode } from '../symbolic/integral';

const SAMPLE = [0.37, 0.81, 1.29, 2.13, 3.7];
const UNSUPPORTED = 'First-principles steps work for polynomials, fractions of polynomials, square roots of polynomials, and sin x, cos x, eˣ and ln x. For other functions use the Derivative Calculator.';

const texNum = (v) => {
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `\\frac{${Math.abs(f.n)}}{${f.d}}`;
  return String(Number(v.toPrecision(6)));
};
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };

// ---- two-variable polynomials in x and h: B[j] = coefficients (in x) of h^j ----
/** P(x + h) for P with ascending coefficients c. */
function shift(c) {
  return c.map((_, j) => c.slice(j).map((ck, i) => ck * binom(i + j, j)));
}
function bmul(A, B) {
  const out = [];
  A.forEach((a, j1) => B.forEach((b, j2) => { out[j1 + j2] = polyAdd(out[j1 + j2] || [0], polyMul(a, b)); }));
  return out;
}
function bsub(A, B) {
  return Array.from({ length: Math.max(A.length, B.length) }, (_, j) => polyAdd(A[j] || [0], polyScale(B[j] || [0], -1)));
}
const isZeroPoly = (p) => p.every((c) => Math.abs(c) < 1e-12);

/** LaTeX of a two-variable polynomial: x² + 2xh + h², highest total degree first. */
function btex(B, v = 'x') {
  const mons = [];
  B.forEach((xs, j) => xs.forEach((c, i) => { if (Math.abs(c) > 1e-12) mons.push({ c, i, j }); }));
  if (!mons.length) return '0';
  mons.sort((p, q) => (q.i + q.j) - (p.i + p.j) || p.j - q.j);
  return mons.map(({ c, i, j }, k) => {
    const mag = Math.abs(c);
    const body = `${i ? (i === 1 ? v : `${v}^{${i}}`) : ''}${j ? (j === 1 ? 'h' : `h^{${j}}`) : ''}`;
    const coef = body && Math.abs(mag - 1) < 1e-12 ? '' : texNum(mag);
    const sign = c < 0 ? '-' : '+';
    return k === 0 ? `${c < 0 ? '-' : ''}${coef}${body}` : ` ${sign} ${coef}${body}`;
  }).join('');
}
const ptex = (c, v) => tex(polish(polyNode(c, v))).trim();
const bracket = (t) => (/[+-]/.test(t.replace(/^-/, '')) ? `\\left(${t}\\right)` : t);
/** a·b in LaTeX, leaving out a factor of 1. */
const times = (a, b) => (a === '1' ? bracket(b) : b === '1' ? bracket(a) : bracket(a) + bracket(b));
/** h times a polynomial: h, −h, 3h or h(2x + h). */
const hTimes = (t) => (t === '1' ? 'h' : t === '-1' ? '-h' : /[+-]/.test(t.replace(/^-/, '')) ? `h\\left(${t}\\right)` : `${t}h`);

// ---- the cases ----
function polynomialCase(c, v) {
  const S = shift(c);
  const diff = S.slice(1); // f(x + h) − f(x): the h^0 part is f(x) itself
  const overH = diff; // divided by h: B[j] → h^(j−1)
  const shown = (B) => btex(B, v);
  const fxh = shown(S);
  const answer = polyNode(S[1] || [0], v);
  return {
    family: 'polynomial',
    answer,
    steps: [
      { title: 'Write down f(x + h)', lines: [`f(${v} + h) = ${tex(polish(subst(polyNode(c, v), v)))}`, `= ${fxh}`] },
      { title: 'Subtract f(x): its terms cancel', lines: [`f(${v} + h) - f(${v}) = ${shown([[0], ...diff])}`] },
      { title: 'Divide by h', lines: [`\\frac{f(${v} + h) - f(${v})}{h} = ${shown(overH)}`] },
      { title: 'Let h → 0: every term with h vanishes', lines: [`f'(${v}) = \\lim_{h \\to 0} \\left(${shown(overH)}\\right) = ${tex(polish(answer))}`] },
    ],
  };
}

function rationalCase(P, Q, v) {
  const SP = shift(P), SQ = shift(Q);
  const N = bsub(bmul(SP, [Q]), bmul([P], SQ));
  if (!isZeroPoly(N[0] || [0])) throw new EngineError(UNSUPPORTED);
  const top = N.slice(1);
  const Pt = ptex(P, v), Qt = ptex(Q, v);
  const Ph = btex(SP, v), Qh = btex(SQ, v);
  const limTop = polyNode(N[1] || [0], v);
  const answer = tidy(div(limTop, pow(paren(polyNode(Q, v)), num(2))));
  return {
    family: 'rational',
    answer,
    steps: [
      { title: 'Write down f(x + h) and f(x)', lines: [`f(${v} + h) = \\frac{${Ph}}{${Qh}}, \\qquad f(${v}) = \\frac{${Pt}}{${Qt}}`] },
      { title: 'Subtract as one fraction', lines: [`f(${v} + h) - f(${v}) = \\frac{${times(Ph, Qt)} - ${times(Pt, Qh)}}{${bracket(Qh)}${bracket(Qt)}}`] },
      { title: 'Expand the top: f(x) cancels and h is a factor', lines: [`\\text{Top} = ${btex([[0], ...top], v)}${hTimes(btex(top, v)) === btex([[0], ...top], v) ? '' : ` = ${hTimes(btex(top, v))}`}`] },
      { title: 'Divide by h', lines: [`\\frac{f(${v} + h) - f(${v})}{h} = \\frac{${btex(top, v)}}{${bracket(Qh)}${bracket(Qt)}}`] },
      { title: 'Let h → 0', lines: [`f'(${v}) = \\frac{${ptex(N[1] || [0], v)}}{${bracket(Qt)}^{2}}`] },
    ],
  };
}

function sqrtCase(g, v) {
  const S = shift(g);
  const top = S.slice(1);
  const gt = ptex(g, v), gh = btex(S, v);
  const answer = tidy(div(polyNode(S[1] || [0], v), mul(num(2), fn("sqrt", polyNode(g, v)))));
  const rootH = `\\sqrt{${gh}}`, root = `\\sqrt{${gt}}`;
  return {
    family: 'sqrt',
    answer,
    steps: [
      { title: 'Set up the limit', lines: [`f'(${v}) = \\lim_{h \\to 0} \\frac{${rootH} - ${root}}{h}`] },
      { title: 'Multiply top and bottom by the conjugate', lines: [`= \\lim_{h \\to 0} \\frac{${rootH} - ${root}}{h} \\cdot \\frac{${rootH} + ${root}}{${rootH} + ${root}}`, `= \\lim_{h \\to 0} \\frac{\\left(${gh}\\right) - \\left(${gt}\\right)}{h\\left(${rootH} + ${root}\\right)}`] },
      { title: 'Simplify the top and cancel h', lines: [`= \\lim_{h \\to 0} \\frac{${hTimes(btex(top, v))}}{h\\left(${rootH} + ${root}\\right)} = \\lim_{h \\to 0} \\frac{${btex(top, v)}}{${rootH} + ${root}}`] },
      { title: 'Let h → 0', lines: [`f'(${v}) = \\frac{${ptex(S[1] || [0], v)}}{2${root}}`] },
    ],
  };
}

function standardCase(name, v) {
  const x = v;
  const T = {
    sin: {
      answer: `cos(${x})`,
      steps: [
        { title: 'Set up the limit', lines: [`f'(${x}) = \\lim_{h \\to 0} \\frac{\\sin(${x} + h) - \\sin ${x}}{h}`] },
        { title: 'Use sin A − sin B = 2 cos((A + B)/2) sin((A − B)/2)', lines: [`= \\lim_{h \\to 0} \\frac{2\\cos\\left(${x} + \\frac{h}{2}\\right)\\sin\\frac{h}{2}}{h} = \\lim_{h \\to 0} \\cos\\left(${x} + \\frac{h}{2}\\right) \\cdot \\frac{\\sin(h/2)}{h/2}`] },
        { title: 'Use the standard limit sin θ / θ → 1', lines: [`= \\cos ${x} \\cdot 1 = \\cos ${x}`] },
      ],
    },
    cos: {
      answer: `-sin(${x})`,
      steps: [
        { title: 'Set up the limit', lines: [`f'(${x}) = \\lim_{h \\to 0} \\frac{\\cos(${x} + h) - \\cos ${x}}{h}`] },
        { title: 'Use cos A − cos B = −2 sin((A + B)/2) sin((A − B)/2)', lines: [`= \\lim_{h \\to 0} \\frac{-2\\sin\\left(${x} + \\frac{h}{2}\\right)\\sin\\frac{h}{2}}{h} = \\lim_{h \\to 0} -\\sin\\left(${x} + \\frac{h}{2}\\right) \\cdot \\frac{\\sin(h/2)}{h/2}`] },
        { title: 'Use the standard limit sin θ / θ → 1', lines: [`= -\\sin ${x} \\cdot 1 = -\\sin ${x}`] },
      ],
    },
    exp: {
      answer: `e^${x}`,
      steps: [
        { title: 'Set up the limit', lines: [`f'(${x}) = \\lim_{h \\to 0} \\frac{e^{${x} + h} - e^{${x}}}{h}`] },
        { title: 'Take out the common factor eˣ', lines: [`= \\lim_{h \\to 0} e^{${x}} \\cdot \\frac{e^{h} - 1}{h}`] },
        { title: 'Use the standard limit (eʰ − 1)/h → 1', lines: [`= e^{${x}} \\cdot 1 = e^{${x}}`] },
      ],
    },
    log: {
      answer: `1/${x}`,
      steps: [
        { title: 'Set up the limit', lines: [`f'(${x}) = \\lim_{h \\to 0} \\frac{\\ln(${x} + h) - \\ln ${x}}{h}`] },
        { title: 'Combine the logs: ln a − ln b = ln(a/b)', lines: [`= \\lim_{h \\to 0} \\frac{1}{h}\\ln\\left(1 + \\frac{h}{${x}}\\right) = \\lim_{h \\to 0} \\frac{1}{${x}} \\cdot \\frac{\\ln(1 + h/${x})}{h/${x}}`] },
        { title: 'Use the standard limit ln(1 + t)/t → 1 (t = h/x → 0)', lines: [`= \\frac{1}{${x}} \\cdot 1 = \\frac{1}{${x}} \\quad (${x} > 0)`] },
      ],
    },
  }[name];
  return { family: name, answer: math.parse(T.answer), steps: T.steps };
}

/** f(x + h) as a node (for showing it before expanding). */
function subst(node, v) {
  return node.transform((n) => (n.isSymbolNode && n.name === v ? paren(add(sym(v), sym('h'))) : n));
}

/** Does `mine` agree with math.js's derivative of f at the sample points? */
function agree(mine, f, v) {
  let reference;
  try { reference = math.derivative(f, v); } catch { return false; }
  let compared = 0;
  for (const x of SAMPLE) {
    let a, b;
    try { a = mine.evaluate({ [v]: x }); b = reference.evaluate({ [v]: x }); } catch { continue; }
    if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) return false;
  }
  return compared >= 2;
}

export function solve({ f: tf, at = '' }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  if (v === 'h') throw new EngineError('Use x (not h) as the variable: h is the small step in the definition.');
  const n = unwrap(node);

  let work;
  const c = polynomialCoeffs(n, v);
  if (c) {
    if (c.length > 9) throw new EngineError('Use a polynomial of degree 8 or less here (the expansion gets very long).');
    work = polynomialCase(c, v);
  } else {
    const r = rationalParts(n, v);
    const isFn = (name) => n.isFunctionNode && n.fn.name === name && unwrap(n.args[0]).isSymbolNode && unwrap(n.args[0]).name === v;
    const sqrtArg = n.isFunctionNode && n.fn.name === 'sqrt' ? unwrap(n.args[0])
      : n.isOperatorNode && n.fn === 'pow' && n.args[1].isConstantNode && n.args[1].value === 0.5 ? unwrap(n.args[0]) : null;
    const sqrtPoly = sqrtArg && polynomialCoeffs(sqrtArg, v);
    if (r && r.Q.length > 1) {
      if (r.P.length > 5 || r.Q.length > 5) throw new EngineError('Use a fraction with degree 4 or less on top and bottom here.');
      work = rationalCase(r.P, r.Q, v);
    } else if (sqrtPoly && sqrtPoly.length > 1 && sqrtPoly.length <= 4) work = sqrtCase(sqrtPoly, v);
    else if (isFn('sin')) work = standardCase('sin', v);
    else if (isFn('cos')) work = standardCase('cos', v);
    else if (isFn('exp') || (n.isOperatorNode && n.fn === 'pow' && n.args[0].isSymbolNode && n.args[0].name === 'e' && unwrap(n.args[1]).isSymbolNode && unwrap(n.args[1]).name === v)) work = standardCase('exp', v);
    else if (isFn('log')) work = standardCase('log', v);
    else throw new EngineError(UNSUPPORTED);
  }

  const definition = `f'(${v}) = \\lim_{h \\to 0} \\frac{f(${v} + h) - f(${v})}{h}`;
  const raw = polish(tidy(work.answer));
  const answer = bestForm(work.answer);
  if (tex(raw) !== tex(answer)) work.steps.push({ title: 'Simplify', lines: [`f'(${v}) = ${tex(answer)}`] });
  const verified = agree(answer, node, v) && agree(raw, node, v);

  let point = null;
  if (String(at ?? '').trim()) {
    const a = readNumber(at, `The ${v}-value`);
    let slope;
    try { slope = answer.evaluate({ [v]: a }); } catch { /* handled below */ }
    if (typeof slope !== 'number' || !Number.isFinite(slope)) throw new EngineError(`f'(${v}) is not defined at ${v} = ${a}.`);
    point = { a, slope };
  }

  const asFunction = (m) => (x) => { try { const y = m.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  return {
    variable: v, f: tex(polish(node)), definition, family: work.family, steps: work.steps,
    answer: tex(answer), verified, point, fAt: asFunction(node), dAt: asFunction(answer),
    result: answer.toString(), notes: [], plot: null,
  };
}
