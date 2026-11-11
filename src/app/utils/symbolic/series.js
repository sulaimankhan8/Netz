/**
 * Infinite series: convergence tests (catalog 6H; plan 5.1 group 3C).
 * Terms a(n) are evaluated with 60-digit BigNumbers, so n!, nⁿ and 3ⁿ at n = 10 000 don't overflow. Limits as
 * n → ∞ are taken by the symbolic limit engine when it can, otherwise estimated from n = 10², 10³, 10⁴ with
 * Richardson extrapolation and written exactly when a simple value fits (and labelled "numerically").
 * Tests, in the order textbooks try them: nth-term, geometric, p-series, ratio, root, limit comparison with 1/nᵖ,
 * alternating series (Leibniz).
 */
import { create, all } from 'mathjs';
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, add, div, polish, simplifyExact, variablesOf, unwrap } from './tree';
import { mtex, exactTex, snap, readMulti } from './multi';
import { substitute } from './iterated';
import { limit } from './limit';
import { integrate } from './integral';

const big = create(all, { number: 'BigNumber', precision: 64 });

/** Reads aₙ: n is the index; n! is allowed. */
export function readTerm(text, label = 'aₙ', extra = []) {
  // n(n + 1) is a product here, never a function called n
  const s = String(text ?? '').replace(/(\w|\))!/g, '$1!').replace(/\bn\s*\(/g, 'n*(');
  const node = readMulti(s, label);
  const bad = [...variablesOf(node)].filter((v) => v !== 'n' && !extra.includes(v));
  if (bad.length) throw new EngineError(`${label} may use only n${extra.length ? ` and ${extra.join(', ')}` : ''} (it uses ${bad.join(', ')}).`);
  if (!variablesOf(node).has('n')) throw new EngineError(`${label} should depend on n.`);
  return node;
}

/** a(N) as a BigNumber (or null when undefined). */
export function bigAt(node, N, scope = {}) {
  try {
    const v = big.evaluate(node.toString(), { n: big.bignumber(N), ...Object.fromEntries(Object.entries(scope).map(([k, x]) => [k, big.bignumber(x)])) });
    if (v && typeof v.isFinite === 'function') return v.isFinite() ? v : null;
    if (typeof v === 'number') return Number.isFinite(v) ? big.bignumber(v) : null;
    return null;
  } catch { return null; }
}
const toNum = (b) => (b === null ? NaN : b.toNumber());

/**
 * The limit of g(N) as N → ∞ from samples at 10², 10³, 10⁴ (Richardson with an error ~ 1/N).
 * Returns { L, exact (LaTeX), numeric (bool) } — L may be ±Infinity, or NaN when the samples don't settle.
 */
export function numericLimit(g) {
  const Ns = [100, 1000, 10000];
  const v = Ns.map((N) => { try { return g(N); } catch { return NaN; } });
  if (v.some((x) => Number.isNaN(x))) return { L: NaN };
  if (v.every((x) => Math.abs(x) > 1e6) && Math.abs(v[2]) > Math.abs(v[1]) * 2) return { L: v[2] > 0 ? Infinity : -Infinity, exact: v[2] > 0 ? '\\infty' : '-\\infty', numeric: true };
  if (Math.abs(v[2] - v[1]) > 0.05 * Math.max(1, Math.abs(v[2]))) return { L: NaN };
  const L = (10 * v[2] - v[1]) / 9;
  const snapped = Math.abs(L) < 1e-6 ? 0 : (() => { const f = toFraction(L, 100, 1e-5); return f ? f.n / f.d : L; })();
  const ex = exactTex(Math.abs(L - snapped) < 1e-5 ? snapped : L);
  return { L: Math.abs(L - snapped) < 1e-5 ? snapped : L, exact: /\d\.\d{4,}/.test(ex) ? `${Number(L.toPrecision(6))}` : ex, numeric: true };
}

/** lim aₙ as n → ∞: symbolic limit engine first, then numbers. */
export function limitN(node) {
  try {
    const r = limit(node, 'n', Infinity);
    if (r && (Number.isFinite(r.value) || Math.abs(r.value) === Infinity)) return { L: r.value, exact: r.exactTex ?? exactTex(r.value), numeric: false };
  } catch { /* fall back */ }
  return numericLimit((N) => toNum(bigAt(node, N)));
}

/** (n + k)! → n!(n + 1)…(n + k) for small whole k, so ratios cancel. */
function expandFactorials(node) {
  return node.transform((m) => {
    if (!(m.isOperatorNode && m.fn === 'factorial')) return m;
    const arg = unwrap(m.args[0]);
    let k = null, base = null;
    try {
      const d = math.derivative(arg, 'n');
      const slope = d.evaluate({});
      const at0 = substitute(arg, 'n', num(0)).evaluate({});
      if (Number.isInteger(slope) && slope >= 1 && Number.isInteger(at0) && at0 > 0 && at0 <= 6) { k = at0; base = math.parse(`${slope}*n`); }
    } catch { return m; }
    if (k === null) return m;
    let out = new math.OperatorNode('!', 'factorial', [base]);
    for (let j = 1; j <= k; j++) out = new math.OperatorNode('*', 'multiply', [out, math.parse(`(${base.toString()} + ${j})`)]);
    return out;
  });
}

/** Run the tests on Σ aₙ from n = n0. Returns { verdict, by, tests[], partial }. */
export function testSeries(a, n0 = 1) {
  const tests = [];
  const A = (N) => toNum(bigAt(a, N));
  const ratioBig = (N) => { const p = bigAt(a, N + 1), q = bigAt(a, N); return p === null || q === null || q.isZero() ? NaN : p.div(q).toNumber(); };
  // 1. nth-term test
  const l0 = limitN(a);
  // a numeric "limit" of 0.01 can be 1/√n still shrinking: check much further out before calling it non-zero
  if (l0.numeric && Number.isFinite(l0.L) && Math.abs(l0.L) > 1e-6) {
    const far = [1e6, 1e10, 1e14].map((N) => Math.abs(toNum(bigAt(a, N))));
    if (far.every(Number.isFinite) && far[2] < far[0] * 0.5) { l0.L = 0; l0.exact = '0'; }
  }
  if (Number.isFinite(l0.L) && Math.abs(l0.L) > 1e-6) {
    tests.push({ name: 'nth-term test', result: 'diverges', lines: [`\\lim_{n\\to\\infty} a_n = ${l0.exact} \\neq 0${l0.numeric ? ' \\ (\\text{numerically})' : ''}`] });
    return { verdict: 'diverges', by: 'nth-term test', tests };
  }
  if (Math.abs(l0.L) === Infinity) {
    tests.push({ name: 'nth-term test', result: 'diverges', lines: ['a_n \\to \\pm\\infty, \\text{ not } 0'] });
    return { verdict: 'diverges', by: 'nth-term test', tests };
  }
  tests.push({ name: 'nth-term test', result: 'inconclusive', lines: [`\\lim a_n = ${Number.isFinite(l0.L) ? l0.exact : '0'}: \\text{ this test can only show divergence}`] });
  // 2. Geometric
  const rs = [1, 2, 3, 4, 5].map((k) => ratioBig(n0 + k));
  if (rs.every((r) => Number.isFinite(r) && Math.abs(r - rs[0]) < 1e-12 * Math.max(1, Math.abs(r)))) {
    const r = snap(rs[0]);
    const first = A(n0);
    if (Math.abs(r) < 1) {
      const S = first / (1 - r);
      tests.push({ name: 'Geometric series', result: 'converges', lines: [`r = \\frac{a_{n+1}}{a_n} = ${exactTex(r)}, \\ |r| < 1`, `S = \\frac{a_{${n0}}}{1 - r} = \\frac{${exactTex(first)}}{1 - ${exactTex(r).startsWith('-') ? `(${exactTex(r)})` : exactTex(r)}} = ${exactTex(S)}`] });
      return { verdict: 'converges', by: 'geometric series', tests, sum: exactTex(S) };
    }
    tests.push({ name: 'Geometric series', result: 'diverges', lines: [`r = ${exactTex(r)}, \\ |r| \\ge 1`] });
    return { verdict: 'diverges', by: 'geometric series', tests };
  }
  // 3. p-series c/nᵖ
  const ps = [2, 4, 8, 16].map((N) => -Math.log2(Math.abs(A(2 * N) / A(N))));
  const signs = [1, 2, 3, 4, 5, 6].map((k) => Math.sign(A(n0 + k)));
  const positive = signs.every((s) => s > 0) || signs.every((s) => s < 0);
  if (positive && ps.every((p) => Number.isFinite(p) && Math.abs(p - ps[0]) < 1e-9)) {
    const p = snap(ps[0]);
    const conv = p > 1;
    tests.push({ name: 'p-series', result: conv ? 'converges' : 'diverges', lines: [`a_n = \\frac{c}{n^{p}} \\text{ with } p = ${exactTex(p)} ${conv ? '> 1' : '\\le 1'}`] });
    const out = { verdict: conv ? 'converges' : 'diverges', by: 'p-series', tests };
    // Σ c/n² = cπ²/6 (only when the sum starts at n = 1)
    if (conv && Math.abs(p - 2) < 1e-12 && n0 === 1) { const c = A(1); out.sum = Math.abs(c - 1) < 1e-12 ? '\\frac{\\pi^2}{6}' : `${exactTex(c)}\\cdot\\frac{\\pi^2}{6}`; }
    return out;
  }
  const alternating = signs.every((s, i) => i === 0 || s === -signs[i - 1]);
  // 4. Ratio test (on |aₙ|)
  let ratio;
  try {
    const rnode = simplifyExact(div(expandFactorials(substitute(a, 'n', add(sym('n'), num(1)))), expandFactorials(a)));
    const r = limit(math.parse(`abs(${rnode.toString()})`), 'n', Infinity);
    if (Number.isFinite(r.value) || r.value === Infinity) ratio = { L: r.value, exact: r.exactTex ?? exactTex(r.value), numeric: false, node: rnode };
  } catch { /* numbers */ }
  if (!ratio) ratio = numericLimit((N) => Math.abs(ratioBig(N)));
  if (Number.isFinite(ratio.L) || ratio.L === Infinity) {
    const L = ratio.L;
    // limits are often numeric (0.9999999 for n/(n + 1)): near 1 the test cannot decide
    const atOne = String(ratio.exact).trim() === '1' || Math.abs(L - 1) < 1e-5;
    const verdict = atOne ? 'inconclusive' : L < 1 ? 'converges' : 'diverges';
    tests.push({
      name: "Ratio test (d'Alembert)", result: verdict,
      lines: [`\\left|\\frac{a_{n+1}}{a_n}\\right|${ratio.node ? ` = \\left|${mtex(polish(ratio.node))}\\right|` : ''} \\to ${ratio.exact}${ratio.numeric ? ' \\ (\\text{numerically})' : ''} ${verdict === 'converges' ? '< 1' : verdict === 'diverges' ? '> 1' : '= 1 \\ (\\text{no decision})'}`],
    });
    if (verdict !== 'inconclusive') return { verdict: verdict === 'converges' ? (alternating ? 'converges absolutely' : 'converges') : 'diverges', by: 'ratio test', tests };
  }
  // 5. Root test
  if (/\^/.test(a.toString())) {
    const root = numericLimit((N) => { const v = bigAt(a, N); return v === null ? NaN : v.abs().pow(big.bignumber(1).div(N)).toNumber(); });
    // |aₙ|^{1/n} creeps to 1 like 1 − (ln n)/n, so numeric values within 0.01 of 1 decide nothing
    if (Number.isFinite(root.L) && Math.abs(root.L - 1) > 1e-2) {
      const verdict = root.L < 1 ? 'converges' : 'diverges';
      tests.push({ name: 'Root test (Cauchy)', result: verdict, lines: [`|a_n|^{1/n} \\to ${root.exact} ${root.L < 1 ? '< 1' : '> 1'} \\ (\\text{numerically})`] });
      return { verdict: verdict === 'converges' && alternating ? 'converges absolutely' : verdict, by: 'root test', tests };
    }
  }
  // 5b. Integral test: positive, decreasing terms; ∫ₙ₀^∞ f(x) dx finite ⇔ the series converges (Σ 1/(n ln n))
  if (!alternating && signs.every((s) => s > 0)) {
    const mags = [10, 20, 40, 80, 160].map((N) => A(N));
    if (mags.every((m, i) => i === 0 || m <= mags[i - 1])) {
      try {
        const fx = substitute(a, 'n', sym('x'));
        const F = integrate(fx, 'x').result;
        // for x ≥ n₀ the terms are positive, so |…| inside logs can go; the limit engine struggles with nested abs
        const Fp = F.transform((m) => (m.isFunctionNode && m.fn.name === 'abs' ? m.args[0] : m));
        let atInf = NaN;
        try { atInf = limit(Fp, 'x', Infinity).value; } catch { /* numeric below */ }
        if (Number.isNaN(atInf)) {
          // F at 1e50, 1e150, 1e300: still climbing → ∞; settled → that value
          const v = [50, 150, 300].map((e) => { try { return Fp.evaluate({ x: 10 ** e }); } catch { return NaN; } });
          if (v.every(Number.isFinite)) atInf = v[2] - v[1] > 0.3 && v[1] - v[0] > 0.3 ? Infinity : Math.abs(v[2] - v[1]) < 1e-9 ? v[2] : NaN;
        }
        const at0 = F.evaluate({ x: n0 });
        if ((Number.isFinite(atInf) || atInf === Infinity) && Number.isFinite(at0)) {
          const conv = Number.isFinite(atInf);
          tests.push({ name: 'Integral test', result: conv ? 'converges' : 'diverges', lines: [`\\int_{${n0}}^{\\infty} ${mtex(polish(fx))}\\,dx = \\Big[${mtex(polish(F))}\\Big]_{${n0}}^{\\infty} ${conv ? `= ${exactTex(atInf - at0)} \\ (\\text{finite})` : '= \\infty'}`] });
          return { verdict: conv ? 'converges' : 'diverges', by: 'integral test', tests };
        }
      } catch { /* no antiderivative: try the next test */ }
    }
  }
  // 6. Limit comparison with 1/nᵖ (p from log|aₙ| / log n)
  const pEst = numericLimit((N) => -Math.log(Math.abs(A(N))) / Math.log(N));
  let absConv = null;
  if (Number.isFinite(pEst.L)) {
    const pf = toFraction(pEst.L, 12, 2e-3);
    if (pf) {
      const p = pf.n / pf.d;
      const c = numericLimit((N) => Math.abs(A(N)) * N ** p);
      if (Number.isFinite(c.L) && c.L > 1e-9) {
        absConv = p > 1;
        tests.push({ name: 'Limit comparison with 1/nᵖ', result: absConv ? 'converges' : 'diverges', lines: [`\\lim_{n\\to\\infty} |a_n|\\, n^{${exactTex(p)}} = ${c.exact} \\ (\\text{finite, not } 0) \\Rightarrow \\text{behaves like } \\sum \\frac{1}{n^{${exactTex(p)}}}, \\ p ${p > 1 ? '> 1' : '\\le 1'}`] });
        if (!alternating) return { verdict: absConv ? 'converges' : 'diverges', by: 'limit comparison test', tests };
      }
    }
  }
  // 7. Alternating series (Leibniz)
  if (alternating) {
    const mags = [10, 20, 40, 80, 160].map((N) => Math.abs(A(N)));
    const decreasing = mags.every((m, i) => i === 0 || m <= mags[i - 1]);
    if (decreasing && Number.isFinite(l0.L) && Math.abs(l0.L) < 1e-6) {
      const verdict = absConv === true ? 'converges absolutely' : absConv === false ? 'converges conditionally' : 'converges';
      tests.push({ name: 'Alternating series test (Leibniz)', result: 'converges', lines: ['|a_n| \\text{ decreases and } a_n \\to 0'] });
      return { verdict, by: 'alternating series test', tests };
    }
  }
  return { verdict: 'inconclusive', by: null, tests };
}

/** Partial sums S_N (numbers), for a feel of the sum. */
export function partialSums(a, n0 = 1, Ns = [10, 100, 1000]) {
  const out = [];
  let s = big.bignumber(0);
  let N = n0;
  for (const target of Ns) {
    for (; N <= target; N++) { const v = bigAt(a, N); if (v === null) return out; s = s.add(v); }
    out.push({ N: target, S: s.toNumber() });
  }
  return out;
}

export { big, aTexOf };
function aTexOf(a) { return mtex(polish(a)); }
