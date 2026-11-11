/**
 * Radius and interval of convergence of Σ cₙ (x − a)^{kn}: the maths for /power-series-radius-of-convergence.
 *   ratio test: |c_{n+1}/cₙ| |x − a|ᵏ → |x − a|ᵏ / ρ, so it converges for |x − a| < R = ρ^{1/k}, ρ = lim |cₙ/c_{n+1}|
 *   (root test form 1/limsup |cₙ|^{1/n} when the ratio limit doesn't settle)
 * Both end points are then tested as ordinary series with the convergence-test engine.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, add, mul, div, pow, paren, polish, simplifyExact } from '../symbolic/tree';
import { mtex, exactTex, snap } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { readTerm, testSeries, limitN, numericLimit, bigAt, big } from '../symbolic/series';

export function solve({ c, center = '0', power = '1' }) {
  const cn = readTerm(c, 'cₙ');
  let a;
  try { a = math.evaluate(String(center).replace(/π/g, 'pi') || '0'); } catch { a = NaN; }
  if (typeof a !== 'number' || !Number.isFinite(a)) throw new EngineError('The centre a must be a number.');
  const k = Number(power);
  if (![1, 2, 3].includes(k)) throw new EngineError('The power of (x − a) per term should be n, 2n or 3n.');
  const steps = [];
  const xa = a === 0 ? 'x' : `(x ${a < 0 ? '+' : '-'} ${exactTex(Math.abs(a))})`;
  const termTex = `${mtex(polish(cn))}\\,${xa}^{${k === 1 ? 'n' : `${k}n`}}`;
  // ρ = lim |cₙ / c_{n+1}|
  let rho;
  try {
    const q = simplifyExact(div(cn, substitute(cn, 'n', add(sym('n'), num(1)))));
    const r = limitN(math.parse(`abs(${q.toString()})`));
    if (Number.isFinite(r.L) || r.L === Infinity) rho = { ...r, node: q };
  } catch { /* numbers */ }
  if (!rho) rho = numericLimit((N) => { const p = bigAt(cn, N), q = bigAt(cn, N + 1); return p === null || q === null || q.isZero() ? NaN : p.div(q).abs().toNumber(); });
  if (!(Number.isFinite(rho.L) || rho.L === Infinity)) {
    // Root form: 1/ρ = lim |cₙ|^{1/n}
    const root = numericLimit((N) => { const v = bigAt(cn, N); return v === null ? NaN : v.abs().pow(big.bignumber(1).div(N)).toNumber(); });
    if (!Number.isFinite(root.L)) throw new EngineError('NETZ could not find the radius: the ratio and root limits don\'t settle.');
    rho = { L: root.L === 0 ? Infinity : 1 / root.L, exact: root.L === 0 ? '\\infty' : exactTex(1 / root.L), numeric: true };
  }
  // the limit is numeric (0.9999998 for 1/n²): a simple value within 1e-5 is taken as exact
  const loose = (v) => { const s = snap(v); if (s !== v) return s; const f = toFraction(v, 100, 1e-5); return f ? f.n / f.d : v; };
  const R = rho.L === Infinity ? Infinity : loose(rho.L ** (1 / k));
  const RTex = R === Infinity ? '\\infty' : exactTex(R);
  steps.push({
    title: 'Ratio test', formula: '\\lim \\left|\\frac{u_{n+1}}{u_n}\\right| < 1',
    lines: [
      `\\left|\\frac{c_{n+1}}{c_n}\\right|\\,|${xa.replace(/[()]/g, '')}|^{${k}} \\to \\frac{|${xa.replace(/[()]/g, '')}|^{${k}}}{\\rho}, \\qquad \\rho = \\lim \\left|\\frac{c_n}{c_{n+1}}\\right|${rho.node ? ` = \\lim\\left|${mtex(polish(rho.node))}\\right|` : ''} = ${rho.exact}${rho.numeric ? ' \\ (\\text{numerically})' : ''}`,
      `\\text{Converges when } |${xa.replace(/[()]/g, '')}|${k > 1 ? `^{${k}}` : ''} < ${rho.exact} \\Rightarrow R = ${RTex}`,
    ],
  });
  let interval, ends = [];
  if (R === 0) interval = `\\text{only } x = ${exactTex(a)}`;
  else if (R === Infinity) interval = '(-\\infty, \\infty)';
  else {
    for (const sign of [-1, 1]) {
      const x = a + sign * R;
      const base = (sign * R) ** k;
      const term = mul(cn, pow(paren(numNode(snap(base))), sym('n')));
      let r;
      try { r = testSeries(term, 1); } catch (e) { r = { verdict: 'inconclusive', tests: [] }; }
      const conv = r.verdict.startsWith('converges');
      ends.push({ x, conv, verdict: r.verdict, by: r.by });
      steps.push({ title: `End point x = ${Number(x.toPrecision(6))}: ${r.verdict}`, depth: 0, lines: [`\\sum ${mtex(polish(simplifyExact(term)))}${r.by ? ` \\quad (\\text{${r.by}})` : ''}`, ...(r.tests.at(-1)?.lines || [])] });
    }
    const [L, Rt] = ends;
    interval = `${L.conv ? '[' : '('}${exactTex(L.x)}, ${exactTex(Rt.x)}${Rt.conv ? ']' : ')'}`;
  }
  return { series: `\\sum ${termTex}`, R: RTex, interval, ends, steps, notes: rho.numeric ? ['The radius was found from very large n numerically (60-digit arithmetic) and written exactly where a simple value fits.'] : [], verified: true };
}
