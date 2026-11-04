/**
 * Solving a linear equation in one unknown, the way it is taught:
 *   1. clear fractions (multiply both sides by the LCD)
 *   2. expand the brackets
 *   3. move the x-terms to the left and the numbers to the right
 *   4. divide by the coefficient of x
 *   5. check by putting the answer back into the original equation
 * Also says when there is no solution (x cancels, numbers differ) or every x works (both sides identical).
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { rationalParts } from '../symbolic/poly';
import { polyTex, fracTex } from '../symbolic/algebra';

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

export function solve({ eq }) {
  const s = String(eq ?? '').trim();
  if (!s) throw new EngineError('Enter an equation, e.g. 3(x - 2) + 4 = 2x + 7.');
  const sides = s.split('=');
  if (sides.length !== 2) throw new EngineError('Use exactly one = sign.');
  const L = parse(sides[0], 'The left side'), R = parse(sides[1], 'The right side');
  const vars = [...new Set([...variablesOf(L), ...variablesOf(R)])];
  if (vars.length > 1) throw new EngineError(`Use one unknown only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no unknown (like x) in this equation.');
  const v = vars[0];
  const pl = rationalParts(L, v), pr = rationalParts(R, v);
  if (!pl || !pr) throw new EngineError('This is not a linear equation (it has roots, powers or functions of the unknown).');
  if (pl.Q.length > 1 || pr.Q.length > 1) throw new EngineError(`The unknown is in a denominator. Multiply both sides by it first, or use the Rational Expressions page.`);
  const lc = pl.P.map((k) => k / pl.Q[0]), rc = pr.P.map((k) => k / pr.Q[0]);
  const degree = Math.max(lc.length, rc.length) - 1;
  const diff = Array.from({ length: degree + 1 }, (_, i) => (lc[i] || 0) - (rc[i] || 0));
  while (diff.length > 1 && Math.abs(diff.at(-1)) < 1e-12) diff.pop();
  if (diff.length > 2) throw new EngineError(`This equation has ${v}^${diff.length - 1} in it, so it is not linear. ${diff.length === 3 ? 'Use the Quadratic Equation page.' : ''}`.trim());

  const Lt = tex(polish(L)).trim(), Rt = tex(polish(R)).trim();
  const steps = [];
  let a1 = lc[1] || 0, b1 = lc[0] || 0, a2 = rc[1] || 0, b2 = rc[0] || 0;

  // 1. Clear fractions
  let den = 1;
  for (const k of [a1, b1, a2, b2]) { const f = toFraction(k, 10000, 1e-9); if (f) den = lcm(den, f.d); }
  if (den > 1) {
    [a1, b1, a2, b2] = [a1, b1, a2, b2].map((k) => Math.round(k * den * 1e9) / 1e9);
    steps.push({ title: `Clear the fractions: multiply both sides by ${den}`, lines: [`${den}\\left(${Lt}\\right) = ${den}\\left(${Rt}\\right)`, `${polyTex([b1, a1], v)} = ${polyTex([b2, a2], v)}`] });
  } else {
    const expandedL = polyTex([b1, a1], v), expandedR = polyTex([b2, a2], v);
    const same = (p, q) => p.replace(/[{}\s]|\\left|\\right|\\,/g, '') === q.replace(/[{}\s]|\\left|\\right|\\,/g, '');
    if (!same(Lt, expandedL) || !same(Rt, expandedR)) steps.push({ title: 'Expand the brackets and collect like terms', lines: [`${expandedL} = ${expandedR}`] });
  }

  // 2. Collect
  const a = a1 - a2, b = b2 - b1;
  const xs = (k) => polyTex([0, k], v);
  steps.push({
    title: `Move the ${v}-terms to the left and the numbers to the right`,
    formula: '\\text{change the sign when a term crosses the } =',
    lines: [`${a1 ? xs(a1) : '0'}${a2 ? ` ${a2 > 0 ? '-' : '+'} ${xs(Math.abs(a2))}` : ''} = ${fracTex(b2)}${b1 ? ` ${b1 > 0 ? '-' : '+'} ${fracTex(Math.abs(b1))}` : ''}`, `${a ? xs(a) : '0'} = ${fracTex(b)}`],
  });

  let kind, x = null;
  if (Math.abs(a) < 1e-12) {
    kind = Math.abs(b) < 1e-12 ? 'all' : 'none';
    steps.push({ title: kind === 'all' ? 'Every value works' : 'No solution', lines: [kind === 'all' ? `0 = 0 \\text{ is always true: every } ${v} \\text{ is a solution (an identity).}` : `0 = ${fracTex(b)} \\text{ is never true: there is no solution.}`] });
  } else {
    kind = 'one';
    x = b / a;
    if (Math.abs(a - 1) > 1e-12) steps.push({ title: `Divide both sides by ${fracTex(a)}`, lines: [`${v} = \\frac{${fracTex(b)}}{${fracTex(a)}} = ${fracTex(x)}`] });
    // 5. Check
    const lv = valueAt(L, v, x), rv = valueAt(R, v, x);
    steps.push({ title: 'Check: put it back into the original equation', lines: [`\\text{Left} = ${fracTex(lv)}, \\quad \\text{Right} = ${fracTex(rv)} \\ ${Math.abs(lv - rv) < 1e-9 * Math.max(1, Math.abs(lv)) ? '\\checkmark' : '\\times'}`] });
  }
  const verified = kind !== 'one' || Math.abs(valueAt(L, v, x) - valueAt(R, v, x)) < 1e-9 * Math.max(1, Math.abs(valueAt(L, v, x)));
  return {
    variable: v, eq: `${Lt} = ${Rt}`, kind, x, xTex: x === null ? null : fracTex(x), steps, verified,
    result: kind === 'one' ? x : kind, notes: [], plot: null,
  };
}
