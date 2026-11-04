/**
 * Implicit differentiation: dy/dx for an equation in x and y, worked the textbook way.
 *   1. differentiate every term with respect to x, treating y as a function of x:
 *        d/dx[t(x, y)] = ∂t/∂x + ∂t/∂y · dy/dx      (so y² gives 2y dy/dx, xy gives y + x dy/dx)
 *   2. collect the dy/dx terms on one side
 *   3. divide:  dy/dx = −F_x / F_y  where F = left side − right side
 * Optional: the slope at a point (x₀, y₀) on the curve. The answer is checked against −F_x/F_y from
 * math.js at several points; `verified` says whether it agreed.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { math, parse, variablesOf, neg, add, sub, mul, div, unwrap, tidy, tex, polish, bestForm, simplifyExact } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';

const DYDX = '\\frac{dy}{dx}';
const SAMPLE = [[0.37, 1.21], [0.81, -0.66], [1.29, 2.4], [2.13, 0.53], [-0.64, 1.7]];

/** Terms of a sum with their signs: a − b + c → [{t: a, s: 1}, {t: b, s: −1}, {t: c, s: 1}]. */
function termsOf(node) {
  const out = [];
  const walk = (n, s) => {
    const x = unwrap(n);
    if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { walk(x.args[0], s); walk(x.args[1], x.fn === 'subtract' ? -s : s); return; }
    if (x.isOperatorNode && x.fn === 'unaryMinus') { walk(x.args[0], -s); return; }
    out.push({ t: x, s });
  };
  walk(node, 1);
  return out;
}
const isZero = (n) => { const x = unwrap(n); return x.isConstantNode && x.value === 0; };
const bracket = (t) => (/[+-]/.test(t.replace(/^-/, '')) ? `\\left(${t}\\right)` : t);
/** "a + b dy/dx" in LaTeX, leaving out zero parts. */
function partsTex(px, py) {
  const a = isZero(px) ? '' : tex(polish(px)).trim();
  const bRaw = isZero(py) ? '' : tex(polish(py)).trim();
  const b = !bRaw ? '' : bRaw === '1' ? DYDX : bRaw === '-1' ? `-${DYDX}` : `${bracket(bRaw)}\\,${DYDX}`;
  if (!a && !b) return '0';
  if (!a) return b;
  if (!b) return a;
  return b.startsWith('-') ? `${a} ${b}` : `${a} + ${b}`;
}
/** Sum of signed nodes. */
const sum = (list) => list.reduce((acc, { n, s }) => (isZero(n) ? acc : acc ? (s < 0 ? sub(acc, n) : add(acc, n)) : (s < 0 ? neg(n) : n)), null) || math.parse('0');
const d = (t, v) => { const r = differentiate(t, v).result; return bestForm(r); };

export function solve({ eq, x0 = '', y0 = '' }) {
  const s = String(eq ?? '').trim();
  if (!s) throw new EngineError('Enter an equation in x and y, e.g. x^2 + y^2 = 25.');
  const sides = s.split('=');
  if (sides.length > 2) throw new EngineError('Use one = sign only.');
  // Students write xy for x·y (and x2y, 3xy^2): split x and y that touch
  const split = (t) => t.replace(/([xy])(?=[xy])/g, '$1*');
  const L = parse(split(sides[0]), 'The left side');
  const R = sides.length === 2 ? parse(split(sides[1]), 'The right side') : math.parse('0');
  const vars = new Set([...variablesOf(L), ...variablesOf(R)]);
  const extra = [...vars].filter((v) => v !== 'x' && v !== 'y');
  if (extra.length) throw new EngineError(`Use only x and y (this also uses ${extra.join(', ')}).`);
  if (!vars.has('y')) throw new EngineError('There is no y in this equation, so it is not implicit. Use the Derivative Calculator for y = f(x).');

  // 1. Each term, each side
  const rows = [];
  const fx = [], fy = [];
  for (const [side, node, sign] of [['left', L, 1], ['right', R, -1]]) {
    for (const { t, s: ts } of termsOf(node)) {
      if (isZero(t)) continue;
      const tx = d(t, 'x'), ty = d(t, 'y');
      rows.push({ side, line: `\\frac{d}{dx}\\left[${tex(polish(t)).trim()}\\right] = ${partsTex(tx, ty)}` });
      fx.push({ n: tx, s: ts * sign });
      fy.push({ n: ty, s: ts * sign });
    }
  }
  const Fx = tidy(sum(fx)), Fy = tidy(sum(fy));
  if (isZero(bestForm(Fy))) throw new EngineError('After differentiating, no dy/dx terms are left, so dy/dx cannot be found from this equation.');

  // 2 and 3. Collect and divide
  const FxB = bestForm(Fx), FyB = bestForm(Fy);
  const answerNode = bestForm(div(neg(FxB), FyB));
  /** One side after differentiating: (its x-parts) + (its y-parts) dy/dx. */
  const diffLine = (sideNode) => {
    const terms = termsOf(sideNode).filter(({ t }) => !isZero(t));
    if (!terms.length) return '0';
    const parts = terms.map(({ t, s: ts }) => ({ px: d(t, 'x'), py: d(t, 'y'), s: ts }));
    return partsTex(bestForm(sum(parts.map((p) => ({ n: p.px, s: p.s })))), bestForm(sum(parts.map((p) => ({ n: p.py, s: p.s })))));
  };
  // −F_x written as −2x, not −(2x)
  let minusFx;
  try { minusFx = simplifyExact(mul(math.parse('-1'), FxB)); } catch { minusFx = neg(FxB); }
  const differentiated = `${diffLine(L)} = ${diffLine(R)}`;
  const fxTex = tex(polish(FxB)).trim();
  const minusTex = /[+-]/.test(fxTex.replace(/^-/, '')) ? tex(polish(minusFx)).trim() : fxTex.startsWith('-') ? fxTex.slice(1).trim() : `-${fxTex}`;
  const collected = `${bracket(tex(polish(FyB)).trim())}\\,${DYDX} = ${minusTex}`;
  const steps = [
    {
      title: 'Differentiate every term with respect to x (y is a function of x)',
      formula: `\\frac{d}{dx}\\left[y^n\\right] = n y^{n-1} ${DYDX}`,
      lines: rows.map((r) => r.line),
    },
    { title: 'Write the differentiated equation', lines: [differentiated] },
    ...(collected === differentiated ? [] : [{ title: 'Collect the dy/dx terms on the left', lines: [collected] }]),
    {
      title: 'Divide to get dy/dx',
      formula: `${DYDX} = -\\frac{F_x}{F_y}`,
      lines: [`${DYDX} = ${tex(polish(answerNode)).trim()}`],
    },
  ];

  // Check against math.js partial derivatives
  let verified = false;
  try {
    const F = sub(L, R);
    const Fxr = math.derivative(F, 'x'), Fyr = math.derivative(F, 'y');
    let compared = 0, ok = true;
    for (const [x, y] of SAMPLE) {
      let a, b;
      try { a = answerNode.evaluate({ x, y }); b = -Fxr.evaluate({ x, y }) / Fyr.evaluate({ x, y }); } catch { continue; }
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      compared++;
      if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) ok = false;
    }
    verified = ok && compared >= 2;
  } catch { verified = false; }

  // Slope at a point
  let point = null;
  if (String(x0 ?? '').trim() || String(y0 ?? '').trim()) {
    const a = readNumber(x0, 'x₀'), b = readNumber(y0, 'y₀');
    let gap = NaN, slope = NaN, fyAt = NaN;
    try { gap = L.evaluate({ x: a, y: b }) - R.evaluate({ x: a, y: b }); } catch { /* checked below */ }
    try { fyAt = FyB.evaluate({ x: a, y: b }); slope = answerNode.evaluate({ x: a, y: b }); } catch { /* checked below */ }
    const scale = Math.max(1, Math.abs((() => { try { return L.evaluate({ x: a, y: b }); } catch { return 1; } })()));
    const onCurve = Number.isFinite(gap) && Math.abs(gap) <= 1e-6 * scale;
    const vertical = Number.isFinite(fyAt) && Math.abs(fyAt) < 1e-12;
    point = { x: a, y: b, onCurve, vertical, slope: vertical || !Number.isFinite(slope) ? null : slope };
    steps.push({
      title: `Put in the point (${a}, ${b})`,
      lines: vertical
        ? [`\\text{The denominator is } 0 \\text{ here: the tangent is vertical (dy/dx is undefined).}`]
        : [`${DYDX}\\Big|_{(${a},\\,${b})} = ${Number.isFinite(slope) ? Number(slope.toPrecision(10)) : '\\text{undefined}'}`],
    });
  }

  const eqTex = `${tex(polish(L)).trim()} = ${tex(polish(R)).trim()}`;
  return {
    eq: eqTex, F: { L, R }, steps, answer: tex(polish(answerNode)).trim(), answerNode, verified, point,
    result: answerNode.toString(), notes: point && !point.onCurve ? ['The point is not on the curve (the two sides are not equal there), so this slope is only the value of the formula, not a tangent slope.'] : [],
    plot: null,
  };
}
