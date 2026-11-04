/**
 * Factoring a polynomial in one variable, step by step (src/app/utils/symbolic/algebra.js does the work):
 * common factor, identities, the ac method, the factor theorem with synthetic division.
 * The answer is checked by multiplying the factors back out; `verified` says whether it matched.
 */
import { EngineError } from '../numeric/steps';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { polynomialCoeffs } from '../symbolic/poly';
import { factorPolynomial, polyTex } from '../symbolic/algebra';

export function solve({ f: tf }) {
  const node = parse(tf, 'The polynomial');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const c = polynomialCoeffs(node, v);
  if (!c) throw new EngineError('This is not a polynomial. Use whole-number powers of x only (no x in a denominator, no roots or functions).');
  if (c.length > 13) throw new EngineError('Use a polynomial of degree 12 or less.');
  if (c.length === 1) throw new EngineError('This is a constant: there is nothing to factor.');
  let r;
  try { r = factorPolynomial(c, v); } catch (e) { throw new EngineError(e.message); }

  const typed = tex(polish(node)).trim();
  const expanded = polyTex(c, v);
  const steps = [];
  if (typed.replace(/[{}\s]/g, '') !== expanded.replace(/[{}\s]/g, '')) {
    steps.push({ title: 'Expand first', lines: [`${typed} = ${expanded}`] });
  }
  steps.push(...r.steps);
  steps.push({ title: 'Answer', lines: [`${expanded} = ${r.tex}`] });

  const linear = r.factors.filter((f) => f.c.length === 2);
  const roots = linear.map((f) => -f.c[0] / f.c[1]);
  if (r.xPower) roots.unshift(0);
  return {
    variable: v, input: typed, expanded, answer: r.tex, steps, verified: r.verified,
    prime: r.factors.length === 1 && r.factors[0].m === 1 && r.content === 1 && !r.xPower,
    roots, result: r.tex, notes: [], plot: null,
  };
}
