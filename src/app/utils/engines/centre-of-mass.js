/**
 * Centre of mass and moments of inertia of a lamina: the maths for /centre-of-mass (Unit 6).
 *   M = ∬ρ dA,  x̄ = (1/M)∬xρ dA,  ȳ = (1/M)∬yρ dA
 *   I_x = ∬y²ρ dA (about the x-axis),  I_y = ∬x²ρ dA,  I_O = I_x + I_y (polar, about the origin)
 * Regions as on the Green's theorem page: rectangle, triangle, disc, half-disc, between two curves.
 * ρ(x, y) is the density (1 for a uniform lamina). Each integral is done by hand when it can, checked numerically.
 */
import { EngineError } from '../numeric/steps';
import { mul, paren, polish, sym } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { iterated, comp, onlyLetters, recognise } from '../symbolic/vectorint';
import { planeRegion } from './greens-theorem';

/** a/b written exactly when it can be (4a/3π for a half-disc). */
function ratioTex(a, b) {
  const v = a / b;
  const t = recognise(v);
  if (!/\d\.\d/.test(t)) return t;
  // v·π rational?  (x̄ = 4/(3π))
  const k = exactTex(v * Math.PI);
  if (!/\d\.\d|\\pi/.test(k)) return k.startsWith('\\frac') ? k.replace(/^\\frac\{([^}]*)\}\{([^}]*)\}$/, '\\frac{$1}{$2\\pi}') : `\\frac{${k}}{\\pi}`;
  return `\\approx ${Number(v.toPrecision(8))}`;
}

export function solve(input) {
  const rho = comp(String(input.rho ?? '').trim() || '1', 'The density ρ');
  onlyLetters([rho], ['x', 'y'], 'ρ');
  const R = planeRegion(input);
  const letters = R.dims.map((d) => d.v);
  const at = (node) => tidyMulti(mul(paren(substitute(substitute(node, 'x', paren(R.map[0])), 'y', paren(R.map[1]))), R.jac), letters);
  const X = sym('x'), Y = sym('y');
  const parts = {
    M: { node: rho, name: 'M = \\iint \\rho\\,dA' },
    My: { node: mul(X, paren(rho)), name: '\\iint x\\rho\\,dA' },
    Mx: { node: mul(Y, paren(rho)), name: '\\iint y\\rho\\,dA' },
    Ix: { node: mul(mul(Y, Y), paren(rho)), name: 'I_x = \\iint y^2\\rho\\,dA' },
    Iy: { node: mul(mul(X, X), paren(rho)), name: 'I_y = \\iint x^2\\rho\\,dA' },
  };
  const steps = [{ title: 'The lamina', depth: 0, lines: [`R: ${R.tex}`, `\\rho = ${mtex(polish(rho))}`] }];
  const val = {};
  for (const [k, p] of Object.entries(parts)) {
    const r = iterated(at(p.node), R.dims);
    val[k] = r;
    steps.push({ title: { M: 'Mass', My: 'Moment about the y-axis', Mx: 'Moment about the x-axis', Ix: 'Moment of inertia about the x-axis', Iy: 'Moment of inertia about the y-axis' }[k], formula: p.name, depth: 0, lines: [...r.lines.slice(-2), `= ${r.tex}`] });
  }
  if (!(Math.abs(val.M.number) > 1e-14)) throw new EngineError('The mass is 0: check the region and the density.');
  const xb = ratioTex(val.My.number, val.M.number), yb = ratioTex(val.Mx.number, val.M.number);
  const I0 = val.Ix.number + val.Iy.number;
  // an exact sum only when both parts were exact (else as many digits as the rougher part has)
  const I0t = val.Ix.exact && val.Iy.exact ? recognise(I0) : `\\approx ${Number(I0.toPrecision(4))}`;
  steps.push({ title: 'Centre of mass', formula: '\\bar{x} = \\frac{1}{M}\\iint x\\rho\\,dA, \\quad \\bar{y} = \\frac{1}{M}\\iint y\\rho\\,dA', depth: 0, lines: [`\\bar{x} = ${xb}, \\quad \\bar{y} = ${yb}`] });
  steps.push({ title: 'Polar moment', formula: 'I_O = I_x + I_y', depth: 0, lines: [`I_O = ${I0t}`] });
  return { mass: val.M.tex, xbar: xb, ybar: yb, Ix: val.Ix.tex, Iy: val.Iy.tex, I0: I0t, steps, notes: [], verified: true, result: [xb, yb] };
}
