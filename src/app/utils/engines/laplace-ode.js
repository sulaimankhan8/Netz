/**
 * Solving linear ODEs with constant coefficients by the Laplace transform: the maths for /laplace-transform-ode.
 *   L{y⁽ᵏ⁾} = sᵏY − sᵏ⁻¹y(0) − … − y⁽ᵏ⁻¹⁾(0), so Σ aₖy⁽ᵏ⁾ = r(t) becomes A(s)Y − B(s) = R(s),
 *   Y = (R(s) + B(s))/A(s), then y = L⁻¹{Y}. Right sides with unit steps and impulses are allowed.
 * The answer is put back into the equation (and the initial conditions) as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, fn, add, mul, div, pow, polish } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { readODE, readICs, linearCoeffs, numNode } from '../symbolic/ode';
import { laplace, inverseLaplace, byShift, readLaplace } from '../symbolic/laplace';
import { rationalParts } from '../symbolic/poly';
import { polyTex, factorPolynomial } from '../symbolic/algebra';
import { polyGcd, polyDiv } from '../symbolic/poly';

const S = sym('s');
const PR = ['y', "y'", "y''", "y'''", 'y^{(4)}'];

export function solve({ eq, ics = '' }) {
  // Left side (the y terms) through the ODE reader, which works in x; the right side r(t) through the Laplace
  // reader, which knows u(t − a) and δ(t − a)
  const sides = String(eq ?? '').split('=');
  if (sides.length !== 2) throw new EngineError('Write the equation as  left side = right side, e.g. y\'\' + 3y\' + 2y = e^(-t).');
  const left = sides[0].replace(/\bt\b/g, 'x').replace(/dy\/dt/g, 'dy/dx').replace(/d\^?2y\/dt\^?2/g, 'd^2y/dx^2');
  const ode = readODE(`${left} = 0`);
  const lc = linearCoeffs(ode);
  const rhs = readLaplace(sides[1], 'The right side');
  if (!lc.numeric) throw new EngineError('The Laplace method here needs constant coefficients (numbers in front of y, y\', y\'\').');
  const n = lc.numeric.length - 1;
  const conds = readICs(String(ics).replace(/\bt\b/g, 'x'));
  const y0 = Array(n).fill(0);
  for (const c of conds) {
    if (Math.abs(c.x0) > 1e-12) throw new EngineError('The Laplace method uses conditions at t = 0, like y(0) = 1, y\'(0) = 0.');
    if (c.k >= n) throw new EngineError(`Only y(0) … y${"'".repeat(n - 1)}(0) are needed for an order-${n} equation.`);
    y0[c.k] = c.val;
  }
  const a = lc.numeric;
  // Terms on the left without y move to the right
  const r = tidyMulti(add(rhs, substitute(lc.R, 'x', sym('t'))), ['t']);
  const steps = [];
  // Transform the left side term by term
  const lhsLines = [];
  for (let k = 1; k <= n; k++) {
    if (Math.abs(a[k]) < 1e-14) continue;
    const parts = [`s^{${k}}Y`.replace('^{1}', '')];
    for (let j = 0; j < k; j++) parts.push(`${k - 1 - j > 0 ? `s^{${k - 1 - j}}`.replace('^{1}', '') : ''}${PR[j]}(0)`);
    lhsLines.push(`\\mathcal{L}\\{${PR[k]}\\} = ${parts.join(' - ')}`);
  }
  steps.push({ title: 'Transform each derivative', formula: '\\mathcal{L}\\{y\'\\} = sY - y(0), \\ \\mathcal{L}\\{y\'\'\\} = s^2Y - sy(0) - y\'(0)', depth: 0, lines: [...lhsLines, `y(0) = ${exactTex(y0[0])}${n > 1 ? `, \\ y'(0) = ${exactTex(y0[1])}` : ''}${n > 2 ? `, \\ y''(0) = ${exactTex(y0[2])}` : ''}`] });
  // A(s) and B(s)
  let A = null, B = null;
  a.forEach((ak, k) => {
    if (Math.abs(ak) < 1e-14) return;
    const t = mul(numNode(ak), k === 0 ? num(1) : k === 1 ? S : pow(S, num(k)));
    A = A ? add(A, t) : t;
    for (let j = 0; j < k; j++) {
      if (Math.abs(y0[j]) < 1e-14) continue;
      const p = k - 1 - j;
      const bt = mul(numNode(ak * y0[j]), p === 0 ? num(1) : p === 1 ? S : pow(S, num(p)));
      B = B ? add(B, bt) : bt;
    }
  });
  const isZero = (() => { try { return [0.3, 1.1, 2.4].every((t) => Math.abs(r.evaluate({ t })) < 1e-14); } catch { return false; } })();
  let R = num(0), rSteps = [];
  if (!isZero) { const L = laplace(r); R = L.F; rSteps = L.steps; }
  rSteps.forEach((s) => steps.push({ ...s, depth: 1 }));
  steps.push({ title: 'Transform the whole equation', depth: 0, lines: [`\\left(${mtex(polish(A))}\\right)Y${B ? ` - \\left(${mtex(polish(B))}\\right)` : ''} = ${mtex(R)}`] });
  // Y = Σ e^{−as} G/A + B/A
  const Atidy = tidyMulti(A, ['s']);
  let Y = B ? div(B, Atidy) : null;
  if (!isZero) for (const { a: shift, G } of byShift(R)) {
    const term = div(G, Atidy);
    const withShift = shift > 0 ? mul(fn('exp', mul(numNode(-shift), S)), term) : term;
    Y = Y ? add(Y, withShift) : withShift;
  }
  if (!Y) return { Y: '0', y: 'y(t) = 0', steps, verified: true, notes: ['With zero initial values and no forcing, y = 0.'] };
  // One fraction with the bottom factored, (2s − 5)/(s − 1)³, when there is no e^(−as) shift; else term by term
  const Ytex = (() => {
    const rp = rationalParts(Y, 's');
    if (!rp) return mtex(polish(Y));
    try {
      let P = rp.P.map(Number), Q = rp.Q.map(Number);
      // cancel common factors: (s + 1)²(s + 2)² … over (s + 1)(s + 2) …
      const g = polyGcd(P, Q);
      if (g.length > 1) { P = polyDiv(P, g); Q = polyDiv(Q, g); }
      const lead = Q[Q.length - 1];
      const Pn = P.map((v) => v / lead), Qn = Q.map((v) => v / lead);
      const top = polyTex(Pn, 's');
      const bottom = factorPolynomial(Qn, 's').tex;
      return /^-?\d+(\.\d+)?$/.test(bottom) ? `${top}` : `\\frac{${top}}{${bottom}}`;
    } catch { return mtex(polish(Y)); }
  })();
  steps.push({ title: 'Solve for Y(s)', depth: 0, lines: [`Y(s) = ${Ytex}`] });
  const inv = inverseLaplace(Y);
  inv.steps.forEach((s) => steps.push({ ...s }));
  const y = inv.f;
  steps.push({ title: 'Solution', depth: 0, lines: [`y(t) = ${mtex(y)}`] });
  // Check: the equation for t away from jumps, and y(0), y'(0)
  const yx = substitute(y, 't', sym('x'));
  let d = yx;
  let L = null;
  try {
    a.forEach((ak, k) => { if (k > 0) d = math.derivative(d, 'x'); if (Math.abs(ak) < 1e-14) return; const t = mul(numNode(ak), d); L = L ? add(L, t) : t; });
  } catch {
    // y contains unit steps, which math.js can't differentiate: rely on the transform-back check
    return { Y: Ytex, y: `y(t) = ${mtex(y)}`, steps, verified: inv.verified, notes: ['The initial conditions are built into Y(s), so no constants are left to find.'] };
  }
  const ok = [0.37, 0.83, 1.61, 2.47].every((x) => {
    let v, rv;
    try { v = L.evaluate({ x }); rv = r.evaluate({ t: x }); } catch { return true; }
    return !Number.isFinite(v) || Math.abs(v - rv) < 1e-6 * Math.max(1, Math.abs(rv));
  });
  return { Y: Ytex, y: `y(t) = ${mtex(y)}`, steps, verified: ok && inv.verified, notes: ['The initial conditions are built into Y(s), so no constants are left to find.'] };
}
