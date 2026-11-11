/**
 * Series solutions of linear second-order ODEs: the maths for /series-solution-ode (Unit 12).
 *   P(x)y'' + Q(x)y' + R(x)y = 0 with polynomial P, Q, R, about x = 0.
 *   Ordinary point (P(0) ≠ 0): y = Σ cₙxⁿ. The coefficient of xⁿ gives the recurrence Σⱼ Pⱼ(n) c_{n+j} = 0, so
 *     c_{n+2} follows from the earlier ones; y = c₀(1 + …) + c₁(x + …).
 *   Regular singular point (Frobenius): multiply so the equation is x²A(x)y'' + xB(x)y' + C(x)y = 0, A(0) ≠ 0;
 *     y = Σ cₙx^{n+r}, indicial equation A₀r(r − 1) + B₀r + C₀ = 0, and cₙF(n + r) = −Σ_{k≥1}[…]c_{n−k}.
 *     Roots not differing by a whole number give two series; otherwise the first series is given and the
 *     second (with ln x) is described.
 * Coefficients are exact fractions. The check: the series put into the equation leaves only terms beyond the last one kept.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math } from '../symbolic/tree';
import { exactTex } from '../symbolic/multi';
import { readODE, linearCoeffs } from '../symbolic/ode';
import { polynomialCoeffs } from '../symbolic/poly';
import { polyTex, factorPolynomial } from '../symbolic/algebra';

const F = (v) => { const f = toFraction(v, 100000, 1e-12); if (!f) throw new EngineError('NETZ needs exact (whole or fraction) coefficients for a series solution.'); return math.fraction(f.n, f.d); };
const Z = () => math.fraction(0);
const fTex = (f) => { const n = Number(f.s * f.n), d = Number(f.d); return d === 1 ? String(n) : `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`; };
const isZ = (f) => Number(f.n) === 0;
const at = (arr, k) => (k >= 0 && k < arr.length ? arr[k] : Z());

/** ascending exact coefficients of a polynomial node in x */
function polyOf(node, label) {
  const c = polynomialCoeffs(node, 'x');
  if (!c) throw new EngineError(`${label} must be a polynomial in x for a series solution (e.g. 1 - x^2, 2x, 6).`);
  const out = c.map((v) => F(Number(v)));
  while (out.length > 1 && isZ(out.at(-1))) out.pop();
  return out;
}
/** Σ aₖxᵏ as LaTeX with exact coefficients, terms up to x^top (with "+ ⋯"). */
function seriesTex(cs, r = 0, more = true) {
  const parts = [];
  cs.forEach((c, n) => {
    if (isZ(c)) return;
    const p = n + r;
    const xs = p === 0 ? '' : p === 1 ? 'x' : `x^{${exactTex(p)}}`;
    const t = fTex(c);
    const coef = !xs ? t : t === '1' ? '' : t === '-1' ? '-' : t;
    parts.push(`${coef}${xs}`);
  });
  if (!parts.length) return '0';
  return parts.join(' + ').replace(/\+ -/g, '- ') + (more ? ' + \\cdots' : '');
}
/** (n + a)(n + b)-style polynomial in n as LaTeX, factored when it can be. */
const nPolyTex = (c) => { const t = c.map(Number); try { return factorPolynomial(t, 'n').tex; } catch { return polyTex(t, 'n'); } };

export function solve({ eq, terms = '6' }) {
  const N = Math.max(4, Math.min(12, Math.round(Number(terms) || 6)));
  const ode = readODE(eq);
  if (ode.order !== 2) throw new EngineError('Enter a second-order equation, e.g. (1 - x^2)y\'\' - 2x y\' + 6y = 0.');
  const lc = linearCoeffs(ode);
  if (!(lc.R.isConstantNode && Number(lc.R.value) === 0) && Math.abs(Number(lc.R.evaluate ? (() => { try { return lc.R.evaluate({ x: 0.7 }); } catch { return 1; } })() : 1)) > 1e-12) throw new EngineError('The series method here is for equations = 0 (homogeneous).');
  const P = polyOf(lc.coeffs[2], "The coefficient of y''"), Q = polyOf(lc.coeffs[1], "The coefficient of y'"), R = polyOf(lc.coeffs[0], 'The coefficient of y');
  const steps = [];
  const eqTex = `\\left(${polyTex(P.map(Number), 'x')}\\right)y'' + \\left(${polyTex(Q.map(Number), 'x')}\\right)y' + \\left(${polyTex(R.map(Number), 'x')}\\right)y = 0`.replace(/\\left\(1\\right\)/g, '');
  if (!isZ(P[0])) {
    // ---------- ordinary point ----------
    steps.push({ title: 'x = 0 is an ordinary point', formula: 'y = \\sum_{n=0}^{\\infty} c_n x^n', depth: 0, lines: [eqTex, `P(0) = ${fTex(P[0])} \\neq 0`] });
    // recurrence: Σ_j P_j(n) c_{n+j}, P_j(n) = P_{2−j}(n+j)(n+j−1) + Q_{1−j}(n+j) + R_{−j}
    const jMin = -Math.max(P.length - 3, Q.length - 2, R.length - 1, 0);
    const rel = [];
    for (let j = 2; j >= jMin; j--) {
      // as a polynomial in n (ascending): (n+j)(n+j−1) = n² + (2j−1)n + j(j−1)
      const a = Number(at(P, 2 - j)), b = Number(at(Q, 1 - j)), c = Number(at(R, -j));
      const poly = [a * j * (j - 1) + b * j + c, a * (2 * j - 1) + b, a];
      while (poly.length > 1 && Math.abs(poly.at(-1)) < 1e-14) poly.pop();
      if (poly.every((v) => Math.abs(v) < 1e-14)) continue;
      rel.push({ j, poly });
    }
    const cn = (j) => `c_{n${j > 0 ? ` + ${j}` : j < 0 ? ` - ${-j}` : ''}}`;
    const lead = rel.find((q) => q.j === 2);
    const others = rel.filter((q) => q.j !== 2);
    const relTex = rel.map((q) => `\\left(${nPolyTex(q.poly)}\\right)${cn(q.j)}`).join(' + ').replace(/\\left\((n[^()]*|\d+)\\right\)/g, '($1)');
    const solved = others.length ? `${cn(2)} = -\\frac{${others.map((q) => `(${nPolyTex(q.poly)})${cn(q.j)}`).join(' + ')}}{${nPolyTex(lead.poly)}}` : `${cn(2)} = 0`;
    steps.push({ title: 'Recurrence relation', formula: '\\text{coefficient of } x^n = 0', depth: 0, lines: [`${relTex} = 0`, solved] });
    // c_n as (α, β): c_n = α c₀ + β c₁
    const cs = [[math.fraction(1), Z()], [Z(), math.fraction(1)]];
    for (let n = 0; cs.length < N + 1; n++) {
      // P_2(n) c_{n+2} = −Σ_{j<2} P_j(n) c_{n+j}
      const val = (poly) => poly.reduce((s, k, d) => s + k * n ** d, 0);
      const L = F(val(lead.poly));
      if (isZ(L)) throw new EngineError('The recurrence breaks down (the leading factor is 0).');
      let A = Z(), B = Z();
      for (const q of others) {
        const idx = n + q.j;
        if (idx < 0) continue;
        const w = F(val(q.poly));
        A = math.add(A, math.multiply(w, cs[idx][0])); B = math.add(B, math.multiply(w, cs[idx][1]));
      }
      cs.push([math.divide(math.unaryMinus(A), L), math.divide(math.unaryMinus(B), L)]);
    }
    steps.push({ title: 'First coefficients', depth: 0, lines: cs.slice(2).map((c, i) => `c_{${i + 2}} = ${[[c[0], 'c_0'], [c[1], 'c_1']].filter(([v]) => !isZ(v)).map(([v, s]) => `${fTex(v) === '1' ? '' : fTex(v) === '-1' ? '-' : fTex(v)}${s}`).join(' + ').replace(/\+ -/g, '- ') || '0'}`) });
    const y1 = cs.map((c) => c[0]), y2 = cs.map((c) => c[1]);
    // check: put the truncated series in; coefficients of xⁿ for n ≤ N − 2 vanish
    const verified = [y1, y2].every((c) => residualOk(P, Q, R, c, 0, N - 2));
    const y1T = seriesTex(y1, 0, !isPolyEnd(y1)), y2T = seriesTex(y2, 0, !isPolyEnd(y2));
    const general = `y = c_0\\left(${y1T}\\right) + c_1\\left(${y2T}\\right)`;
    steps.push({ title: 'Solution', depth: 0, lines: [general] });
    const poly1 = y1.slice(2).every(isZ) || isPolyEnd(y1), poly2 = isPolyEnd(y2);
    const notes = [];
    if (poly1 || poly2) notes.push(`One series stops: ${poly1 ? 'the c₀ series' : 'the c₁ series'} is a polynomial (as for Legendre's equation with a whole-number n).`);
    return { kind: 'ordinary', general, y1: y1T, y2: y2T, steps, notes, verified, result: general };
  }
  // ---------- Frobenius ----------
  let s = 0;
  while (s < P.length && isZ(P[s])) s++;
  if (s > 2) throw new EngineError('x = 0 is an irregular singular point (P has too high a power of x), so Frobenius does not apply.');
  // multiply by x^{2−s}: A = P/x^s, B = Q·x^{2−s}/x, C = R·x^{2−s}
  const shift = (c, k) => (k >= 0 ? [...Array(k).fill(Z()), ...c] : (c.slice(0, -k).every(isZ) ? c.slice(-k) : null));
  const A = P.slice(s), B = shift(Q, 2 - s - 1), Cc = shift(R, 2 - s);
  if (!B || !Cc) throw new EngineError('x = 0 is an irregular singular point (xQ/P or x²R/P blows up), so Frobenius does not apply.');
  const A0 = Number(A[0]), B0 = Number(at(B, 0)), C0 = Number(at(Cc, 0));
  // A₀r² + (B₀ − A₀)r + C₀ = 0
  const qa = A0, qb = B0 - A0, qc = C0, disc = qb * qb - 4 * qa * qc;
  if (disc < -1e-12) throw new EngineError('The indicial equation has complex roots; NETZ handles real roots here.');
  const r1 = (-qb + Math.sqrt(Math.max(0, disc))) / (2 * qa), r2 = (-qb - Math.sqrt(Math.max(0, disc))) / (2 * qa);
  const rf = (r) => toFraction(r, 1000, 1e-10);
  if (!rf(r1) || !rf(r2)) throw new EngineError('The indicial roots are not fractions, which this page does not handle.');
  steps.push({ title: 'x = 0 is a regular singular point', formula: 'y = \\sum_{n=0}^{\\infty} c_n x^{n + r}, \\quad c_0 \\neq 0', depth: 0, lines: [eqTex, `P(0) = 0; \\ \\text{written as } x^2A(x)y'' + xB(x)y' + C(x)y = 0 \\text{ with } A(0) = ${fTex(A[0])}`] });
  const indTex = polyTex([qc, qb, qa], 'r');
  steps.push({ title: 'Indicial equation', formula: 'A_0 r(r - 1) + B_0 r + C_0 = 0', depth: 0, lines: [`${indTex} = 0 \\Rightarrow r = ${exactTex(r1)}${Math.abs(r1 - r2) > 1e-12 ? `, \\ ${exactTex(r2)}` : ' \\ (\\text{twice})'}`] });
  const Fs = (x) => A0 * x * (x - 1) + B0 * x + C0;
  // x^r (1 + c₁x + …), five terms
  const frobTex = (r, c) => (Math.abs(r) < 1e-12 ? `\\left(${seriesTex(c.slice(0, 5))}\\right)` : `x^{${exactTex(r)}}\\left(${seriesTex(c.slice(0, 5))}\\right)`);
  const series = (r) => {
    const rr = rf(r), rF = math.fraction(rr.n, rr.d);
    const c = [math.fraction(1)];
    for (let n = 1; n <= N; n++) {
      const lead = F(Fs(n + r));
      let S = Z();
      for (let k = 1; k <= n; k++) {
        const m = math.add(math.fraction(n - k), rF);
        const term = math.add(math.add(math.multiply(at(A, k), math.multiply(m, math.subtract(m, 1))), math.multiply(at(B, k), m)), at(Cc, k));
        S = math.add(S, math.multiply(term, c[n - k]));
      }
      if (isZ(lead)) { if (!isZ(S)) return null; c.push(Z()); continue; }
      c.push(math.divide(math.unaryMinus(S), lead));
    }
    return c;
  };
  const diff = r1 - r2;
  const intDiff = Math.abs(diff - Math.round(diff)) < 1e-12;
  const s1 = series(r1);
  const y1T = frobTex(r1, s1);
  steps.push({ title: `r = ${exactTex(r1)}`, formula: 'c_n F(n + r) = -\\sum_{k \\ge 1}[\\ldots]\\,c_{n-k}', depth: 1, lines: s1.slice(1, 6).map((c, i) => `c_{${i + 1}} = ${fTex(c)}`) });
  let general, y2T = null;
  const notes = [];
  if (!intDiff) {
    const s2 = series(r2);
    y2T = frobTex(r2, s2);
    steps.push({ title: `r = ${exactTex(r2)}`, depth: 1, lines: s2.slice(1, 6).map((c, i) => `c_{${i + 1}} = ${fTex(c)}`) });
    general = `y = A\\,${y1T} + B\\,${y2T}`;
  } else {
    const s2 = Math.abs(diff) > 1e-12 ? series(r2) : null;
    if (s2) { y2T = frobTex(r2, s2); general = `y = A\\,${y1T} + B\\,${y2T}`; notes.push('The roots differ by a whole number, but the recurrence did not break, so both series work.'); }
    else { general = `y_1 = ${y1T}`; notes.push(Math.abs(diff) < 1e-12 ? 'The indicial roots are equal: the second solution is y₂ = y₁ ln x + x^r Σ dₙxⁿ (found by differentiating with respect to r).' : 'The roots differ by a whole number and the recurrence breaks for the smaller root: the second solution contains y₁ ln x.'); }
  }
  steps.push({ title: 'Solution', depth: 0, lines: [general] });
  const verified = residualOk(A, B, Cc, s1, r1, N - 1, true);
  return { kind: 'frobenius', roots: [exactTex(r1), exactTex(r2)], general, y1: y1T, y2: y2T, steps, notes, verified, result: general };
}

const isPolyEnd = (c) => { let last = -1; c.forEach((v, i) => { if (!isZ(v)) last = i; }); return last >= 0 && last < c.length - 3; };

/** Coefficients of the residual up to x^top vanish (for Frobenius, in the x²A, xB, C form with powers n + r). */
function residualOk(P, Q, R, c, r, top, frob = false) {
  const cf = c.map(Number);
  for (let n = 0; n <= top; n++) {
    let s = 0;
    if (!frob) {
      for (let k = 0; k < P.length; k++) { const m = n - k + 2; if (m >= 0 && m < cf.length) s += Number(P[k]) * m * (m - 1) * cf[m]; }
      for (let k = 0; k < Q.length; k++) { const m = n - k + 1; if (m >= 0 && m < cf.length) s += Number(Q[k]) * m * cf[m]; }
      for (let k = 0; k < R.length; k++) { const m = n - k; if (m >= 0 && m < cf.length) s += Number(R[k]) * cf[m]; }
    } else {
      for (let k = 0; k <= n; k++) { const m = n - k + r; const cm = cf[n - k]; if (cm === undefined) continue; s += (Number(at(P, k)) * m * (m - 1) + Number(at(Q, k)) * m + Number(at(R, k))) * cm; }
    }
    if (Math.abs(s) > 1e-8) return false;
  }
  return true;
}
