/**
 * Taylor and Laurent series: the maths for /laurent-series (Unit 14). w = z − z₀, the region is fixed by a radius r
 * (any |z − z₀| = r inside the annulus wanted).
 *   Rational f: partial fractions A/(z − p)^j (A by the (m − 1 − k)-th derivative of (z − p)^m f), then each term
 *     |p − z₀| > r:  A/(w − q)^j = A(−1)^j Σ C(n + j − 1, j − 1) wⁿ / q^{n+j}      (q = p − z₀)
 *     |p − z₀| < r:  A/(w − q)^j = A Σ C(n + j − 1, j − 1) qⁿ / w^{n+j}
 *   Other f with a pole of order m (or none) at z₀: f = g(z)/(z − z₀)^m, g analytic, so cₖ = g^{(k+m)}(z₀)/(k + m)!
 * The series is checked by summing many terms at a point of |w| = r.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, polish, tidy, div, paren } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readZ, rationalZ, rootsZ, poles, splitTop, divLinear, polyNodeZ, cTex, C, snapC, evalP, mulP, addP } from '../symbolic/complex';
import { readCenter, readRadius } from './residues';

const N_TERMS = 4; // terms shown on each side
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const asC = (v) => (typeof v === 'number' ? C(v, 0) : v);
const absC = (c) => Math.hypot(c.re, c.im);

/** Polynomial long division with complex coefficients: { q, r }. */
function divide(Nc, Dc) {
  const r = [...Nc];
  const q = new Array(Math.max(1, Nc.length - Dc.length + 1)).fill(C(0, 0));
  for (let i = Nc.length - Dc.length; i >= 0; i--) {
    const k = math.divide(r[i + Dc.length - 1], Dc[Dc.length - 1]);
    q[i] = k;
    for (let j = 0; j < Dc.length; j++) r[i + j] = math.subtract(r[i + j], math.multiply(k, Dc[j]));
  }
  return { q, r: r.slice(0, Dc.length - 1) };
}

/** LaTeX for Σ cₖ wᵏ with w = z − z₀ (k from low to high). */
function seriesTex(coeffs, z0, more = { below: false, above: false }) {
  const w = absC(z0) < 1e-12 ? 'z' : `(z - ${/[+-]/.test(cTex(z0).slice(1)) ? `(${cTex(z0)})` : cTex(z0)})`;
  const terms = [];
  for (const [k, c0] of coeffs) {
    const c = c0;
    if (absC(c) < 1e-12) continue;
    let ct = coefTex(c);
    const complex = /[+-]/.test(ct.slice(1));
    const neg = !complex && ct.startsWith('-');
    if (neg) ct = ct.slice(1);
    const one = ct === '1';
    let body;
    if (k === 0) body = complex ? `(${ct})` : ct;
    else if (k > 0) body = `${one ? '' : complex ? `(${ct})` : ct}${w}${k > 1 ? `^{${k}}` : ''}`;
    else {
      const den = `${w}${-k > 1 ? `^{${-k}}` : ''}`;
      body = complex ? `\\frac{${ct}}{${den}}` : /^\\frac\{(.+)\}\{(.+)\}$/.test(ct) ? ct.replace(/^\\frac\{(.+)\}\{(.+)\}$/, `\\frac{$1}{$2${den}}`) : `\\frac{${ct}}{${den}}`;
    }
    terms.push({ neg, body });
  }
  if (!terms.length) return '0';
  const s = terms.map((t, i) => `${i === 0 ? (t.neg ? '-' : '') : t.neg ? ' - ' : ' + '}${t.body}`).join('');
  // "⋯ − 1/z⁴", not "⋯ + −1/z⁴"
  const lead = more.below ? (terms[0].neg ? '\\cdots ' : '\\cdots + ') : '';
  return `${lead}${more.below && terms[0].neg ? `- ${s.slice(1)}` : s}${more.above ? ' + \\cdots' : ''}`;
}
/** A coefficient exactly: fractions up to 1/10⁶ (1/24, 1/5040, 1/8! from factorials), else as cTex. */
function coefTex(c) {
  if (Math.abs(c.im) < 1e-12) {
    const f = toFraction(c.re, 1000000, 1e-11);
    if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  }
  return cTex(c);
}

export function solve({ f, center = '0', radius = '' }) {
  const F = readZ(f);
  const z0 = readCenter(center);
  const steps = [];
  const R = rationalZ(F);
  const sing = (R ? rootsZ(R.D) : (poles(F).list || []).map((p) => ({ a: p.a, order: p.order })));
  if (R) {
    // poles that survive cancellation
    const P = poles(F).list;
    const dists = P.map((p) => ({ ...p, d: absC(math.subtract(p.a, z0)) }));
    const r = String(radius).trim() ? readRadius(radius) : (() => { const ds = dists.map((p) => p.d).filter((d) => d > 1e-12).sort((a, b) => a - b); return ds.length ? ds[0] / 2 : 1; })();
    if (dists.some((p) => Math.abs(p.d - r) < 1e-9)) throw new EngineError('A pole lies on |z − z₀| = r: pick a radius between the poles.');
    const inner = Math.max(0, ...dists.filter((p) => p.d < r).map((p) => p.d));
    const outerList = dists.filter((p) => p.d > r).map((p) => p.d);
    const outer = outerList.length ? Math.min(...outerList) : Infinity;
    steps.push({ title: 'Poles and the region', depth: 0, lines: [`\\text{poles: } ${P.length ? P.map((p) => `${cTex(p.a)}${p.order > 1 ? `\\ (\\text{order } ${p.order})` : ''}`).join(', ') : '\\text{none}'}`, `${inner > 1e-12 ? `${numTex(inner)} < ` : inner === 0 && dists.some((p) => p.d < 1e-12) ? '0 < ' : ''}|${absC(z0) < 1e-12 ? 'z' : `z - ${cTex(z0)}`}| < ${outer === Infinity ? '\\infty' : numTex(outer)}`] });
    // polynomial part + proper fraction
    const { q, r: rem } = divide(R.N, R.D);
    const properNode = div(paren(polyNodeZ(rem.length ? rem : [C(0)])), paren(polyNodeZ(R.D)));
    // partial fractions A_{p,j}
    const fractions = [];
    for (const p of P) {
      const g = div(paren(polyNodeZ(rem.length ? rem : [C(0)])), paren(polyNodeZ(divLinear(R.D, p.a, p.order))));
      let d = g;
      for (let k = 0; k < p.order; k++) {
        let v = asC(d.evaluate({ z: p.a }));
        let fact = 1; for (let t = 2; t <= k; t++) fact *= t;
        v = math.divide(v, C(fact));
        fractions.push({ p: p.a, j: p.order - k, A: snapC(v) });
        d = math.derivative(d, 'z');
      }
    }
    const fracTex = fractions.filter((t) => absC(t.A) > 1e-12).map((t) => `\\frac{${cTex(t.A)}}{${zMinus(t.p)}${t.j > 1 ? `^{${t.j}}` : ''}}`).join(' + ').replace(/\+ \\frac\{-/g, '- \\frac{');
    const polyPart = q.some((c) => absC(c) > 1e-12) ? `${mtex(polish(tidy(polyNodeZ(q))))} + ` : '';
    steps.push({ title: 'Partial fractions', depth: 0, lines: [`f(z) = ${polyPart}${fracTex}`] });
    void properNode;
    // coefficients of wᵏ
    const coef = new Map();
    const addC = (k, c) => coef.set(k, math.add(coef.get(k) || C(0), c));
    const lines = [];
    let below = false, above = false;
    for (const t of fractions) {
      if (absC(t.A) < 1e-12) continue;
      const qq = math.subtract(t.p, z0);
      const outside = absC(qq) > r;
      const K = 40;
      for (let n = 0; n < K; n++) {
        const b = binom(n + t.j - 1, t.j - 1);
        if (outside) addC(n, math.multiply(t.A, math.divide(C((-1) ** t.j * b), math.pow(qq, n + t.j))));
        else addC(-(n + t.j), math.multiply(t.A, math.multiply(C(b), math.pow(qq, n))));
      }
      if (outside) above = true; else if (absC(qq) > 1e-12) below = true;
      lines.push(`\\frac{${cTex(t.A)}}{${zMinus(t.p)}${t.j > 1 ? `^{${t.j}}` : ''}}: \\ |${cTex(t.p)}${absC(z0) > 1e-12 ? ` - ${cTex(z0)}` : ''}| ${outside ? '>' : '<'} ${numTex(r)} \\Rightarrow ${outside ? '\\text{powers of } (z - z_0)' : '\\text{powers of } \\frac{1}{z - z_0}'}`);
    }
    // polynomial part in w
    if (q.some((c) => absC(c) > 1e-12)) {
      // shift: P(w + z0)
      let shifted = [C(0)];
      let pw = [C(1)];
      q.forEach((c, k) => { if (k) pw = mulP(pw, [z0, C(1)]); shifted = addP(shifted, pw.map((x) => math.multiply(x, c))); });
      shifted.forEach((c, k) => addC(k, c));
    }
    steps.push({ title: 'Expand each fraction as a geometric series', formula: '\\frac{1}{1 - u} = \\sum_{n=0}^{\\infty} u^n, \\ |u| < 1', depth: 0, lines });
    const ks = [...coef.keys()].sort((a, b) => a - b).filter((k) => absC(coef.get(k)) > 1e-12);
    const shown = ks.filter((k) => k < 0).slice(-N_TERMS).concat(ks.filter((k) => k >= 0).slice(0, N_TERMS));
    const tex = seriesTex(shown.map((k) => [k, coef.get(k)]), z0, { below: below && ks.filter((k) => k < 0).length > N_TERMS, above });
    steps.push({ title: 'The series', depth: 0, lines: [`f(z) = ${tex}`] });
    // check at a point on the circle
    const zt = math.add(z0, C(r * Math.cos(0.7), r * Math.sin(0.7)));
    const w = math.subtract(zt, z0);
    const sum = [...coef].reduce((s, [k, c]) => math.add(s, math.multiply(c, math.pow(w, k))), C(0));
    const fv = asC(F.evaluate({ z: zt }));
    const ok = absC(math.subtract(sum, fv)) < 1e-4 * Math.max(1, absC(fv));
    const kind = !below && !dists.some((p) => p.d < r) ? 'Taylor series' : 'Laurent series';
    const resid = coef.get(-1);
    return { kind, series: tex, region: steps[0].lines[1], residue: resid && dists.some((p) => p.d < 1e-12) ? cTex(resid) : null, steps, notes: [kind === 'Taylor series' ? 'No pole inside |z − z₀| = r, so only non-negative powers appear: a Taylor series.' : 'Negative powers come from the poles inside the circle: this is the principal part.'], verified: ok, result: tex };
  }
  // Not rational: the coefficients by Cauchy's formula cₖ = (1/2πi)∮ f/(z − z₀)^{k+1} dz on a small circle
  // (the trapezoid rule is exact to ~1e-13 for analytic f), made exact afterwards. This also handles a top that
  // vanishes at z₀ (sin z/z³ has a pole of order 2, not 3).
  const others = sing.filter((p) => absC(math.subtract(p.a, z0)) > 1e-9).map((p) => absC(math.subtract(p.a, z0)));
  const Rout = others.length ? Math.min(...others) : Infinity;
  const rho = Math.min(0.5, Rout / 2);
  const NP = 256;
  const samples = [];
  for (let j = 0; j < NP; j++) {
    const th = (2 * Math.PI * j) / NP;
    const z = math.add(z0, C(rho * Math.cos(th), rho * Math.sin(th)));
    let fz;
    try { fz = asC(F.evaluate({ z })); } catch { throw new EngineError('NETZ could not expand this function here.'); }
    if (!Number.isFinite(fz.re) || !Number.isFinite(fz.im)) throw new EngineError('f is not defined on a small circle around z₀: pick another centre.');
    samples.push({ th, fz });
  }
  const cK = (k) => {
    // (1/N) Σ f(z₀ + ρe^{iθ}) ρ^{−k} e^{−ikθ}
    let s = C(0);
    for (const { th, fz } of samples) s = math.add(s, math.multiply(fz, C(Math.cos(-k * th), Math.sin(-k * th))));
    return snapC(math.divide(s, C(NP * rho ** k)));
  };
  // order of the pole: the most negative k with a non-zero coefficient
  let m = 0;
  for (let k = -12; k < 0; k++) if (absC(cK(k)) > 1e-8) { m = -k; break; }
  const coeffs = [];
  for (let k = -m; coeffs.filter(([, c]) => absC(c) > 1e-12).length < N_TERMS && k <= 14; k++) coeffs.push([k, cK(k)]);
  steps.push({ title: m ? `A pole of order ${m} at z₀` : 'f is analytic at z₀', depth: 0, lines: [`f(z) = ${mtex(polish(tidy(F)))}`, `${m ? '0 < ' : ''}|${absC(z0) < 1e-12 ? 'z' : `z - ${cTex(z0)}`}| < ${Rout === Infinity ? '\\infty' : numTex(Rout)}`] });
  const tex = seriesTex(coeffs, z0, { above: true });
  const split = splitTop(F);
  const pure = split && split.B.length > 1 && split.B.slice(0, -1).every((c) => absC(c) < 1e-12) && absC(z0) < 1e-12;
  if (pure) {
    // f = A(z)/zⁿ: write the Taylor series of A, then divide every term by zⁿ (the textbook way)
    const n = split.B.length - 1;
    const A = split.A || polyNodeZ(split.Apoly);
    const aCoeffs = coeffs.map(([k, c]) => [k + n, math.multiply(c, split.B[n])]);
    steps.push({ title: 'Taylor series of the top', depth: 0, lines: [`${mtex(polish(tidy(A)))} = ${seriesTex(aCoeffs.filter(([k]) => k >= 0), z0, { above: true })}`] });
    steps.push({ title: `Divide by ${n > 1 ? `z^${n}` : 'z'}`, depth: 0, lines: [`f(z) = ${tex}`] });
  } else steps.push({ title: 'The coefficients', formula: 'c_k = \\frac{1}{2\\pi i}\\oint \\frac{f(z)}{(z - z_0)^{k+1}}\\,dz', depth: 0, lines: [`f(z) = ${tex}`] });
  void divLinear; void div; void paren;
  // check near z0
  const rr = Math.min(0.3, Rout / 3);
  const zt = math.add(z0, C(rr * Math.cos(0.7), rr * Math.sin(0.7)));
  const sum = coeffs.reduce((s, [k, c]) => math.add(s, math.multiply(c, math.pow(math.subtract(zt, z0), k))), C(0));
  const fv = asC(F.evaluate({ z: zt }));
  const ok = absC(math.subtract(sum, fv)) < 2e-2 * Math.max(1, absC(fv));
  const res = coeffs.find(([k]) => k === -1);
  return { kind: m ? 'Laurent series' : 'Taylor series', series: tex, region: steps[0].lines[1], residue: m && res ? cTex(res[1]) : null, steps, notes: m ? ['The coefficient of 1/(z − z₀) is the residue at z₀.'] : [], verified: ok, result: tex };
}
const zMinus = (p) => (absC(p) < 1e-12 ? 'z' : `(z ${cTex(p).startsWith('-') ? '+' : '-'} ${/[+-]/.test(cTex(p).slice(1)) ? `(${cTex(p).replace(/^-/, '')})` : cTex(p).replace(/^-/, '')})`);
const numTex = (v) => cTex(C(v));
