/**
 * Taylor series of f(x, y) about (a, b): the maths for /taylor-series-two-variables (catalog 6D).
 *   f(a + h, b + k) = f + (h f_x + k f_y) + (1/2!)(h² f_xx + 2hk f_xy + k² f_yy) + (1/3!)(h³ f_xxx + 3h²k f_xxy + …) + …
 * with h = x − a, k = y − b and every derivative taken at (a, b). The polynomial is checked numerically:
 * near (a, b), f minus the polynomial must shrink like distance^(order + 1).
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, polish, tidy, simplifyExact } from '../symbolic/tree';
import { readMulti, partial, lettersOf, exactTex, mtex, evalAt, partialName } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n, k) => fact(n) / (fact(k) * fact(n - k));

/** A constant node at the point, as tidy LaTeX: e, cos 1, 1/2, … */
function valueTex(node, value) {
  const e = exactTex(value);
  if (!/\d\.\d{3,}/.test(e)) return e;
  try { return mtex(polish(tidy(simplifyExact(node)))); } catch { return e; }
}

export function solve({ f, a = '0', b = '0', order = '2' }) {
  const node = readMulti(f, 'f(x, y)');
  const vars = lettersOf(node);
  if (vars.some((v) => !['x', 'y'].includes(v))) throw new EngineError(`Write f in x and y only (it uses ${vars.join(', ')}).`);
  const A = math.parse(String(a).trim().replace(/π/g, 'pi') || '0'), B = math.parse(String(b).trim().replace(/π/g, 'pi') || '0');
  let av, bv;
  try { av = A.evaluate({}); bv = B.evaluate({}); } catch { throw new EngineError('The point (a, b) must be two numbers, e.g. 0 and 0, or 1 and pi/2.'); }
  const N = Number(order);
  if (!(N >= 1 && N <= 4)) throw new EngineError('Choose an order from 1 to 4.');
  const XY = ['x', 'y'];
  // D[i][j] = ∂^{i+j} f / ∂x^i ∂y^j
  const D = [[node]];
  for (let i = 0; i <= N; i++) {
    D[i] = D[i] || [];
    for (let j = 0; i + j <= N; j++) {
      if (D[i][j]) continue;
      D[i][j] = j > 0 ? partial(D[i][j - 1], 'y', XY).result : partial(D[i - 1][0], 'x', XY).result;
    }
  }
  const at = { x: av, y: bv };
  const rows = [];
  const terms = [];
  for (let k = 0; k <= N; k++) {
    for (let i = k; i >= 0; i--) {
      const j = k - i;
      const d = D[i][j];
      let val = evalAt(d, at);
      if (!Number.isFinite(val)) throw new EngineError(`A derivative of f is not defined at (${a}, ${b}), so there is no Taylor series there.`);
      if (Math.abs(val) < 1e-13) val = 0;
      const pointNode = substitute(substitute(d, 'x', A), 'y', B);
      const chain = [...Array(i).fill('x'), ...Array(j).fill('y')];
      const name = k === 0 ? 'f' : partialName(chain).sub;
      rows.push({ name, expr: mtex(d), value: val, valueTex: valueTex(pointNode, val) });
      if (val !== 0) terms.push({ i, j, k, val, pointNode, coef: binom(k, i) / fact(k) });
    }
  }
  const h = av === 0 ? 'x' : `(x ${av < 0 ? '+' : '-'} ${exactTex(Math.abs(av))})`;
  const kk = bv === 0 ? 'y' : `(y ${bv < 0 ? '+' : '-'} ${exactTex(Math.abs(bv))})`;
  const pw = (base, p) => (p === 0 ? '' : p === 1 ? base : `${base}^{${p}}`);
  // Each term: coefficient (number, or a constant like e) times h^i k^j
  const termTex = terms.map((t) => {
    const c = t.coef * t.val;
    const exact = exactTex(c);
    let coefTex, neg = c < 0;
    if (!/\d\.\d{3,}/.test(exact)) {
      coefTex = exact.replace(/^-/, '');
    } else {
      // A constant such as e or cos 1: write (number) × that constant
      const f2 = toFraction(t.coef, 1000, 1e-9);
      const v = valueTex(t.pointNode, t.val);
      neg = v.startsWith('-');
      const fr = !f2 || (f2.n === 1 && f2.d === 1) ? '' : f2.d === 1 ? `${f2.n}` : `\\frac{${f2.n}}{${f2.d}}`;
      coefTex = `${fr}${fr ? '\\,' : ''}${v.replace(/^-/, '')}`;
    }
    const mono = `${pw(h, t.i)}${t.i && t.j ? ' ' : ''}${pw(kk, t.j)}`;
    const body = mono ? (coefTex === '1' ? mono : `${coefTex}\\,${mono}`) : coefTex;
    return { neg, body, k: t.k };
  });
  const series = termTex.length ? termTex.map((t, i) => `${i === 0 ? (t.neg ? '-' : '') : t.neg ? ' - ' : ' + '}${t.body}`).join('') : '0';

  // Numeric check: the remainder shrinks like r^(N+1)
  const poly = (x, y) => terms.reduce((s, t) => s + t.coef * t.val * (x - av) ** t.i * (y - bv) ** t.j, 0);
  const err = (r) => Math.max(...[[1, 0.6], [-0.7, 1], [0.4, -0.9]].map(([p, q]) => Math.abs(evalAt(node, { x: av + r * p, y: bv + r * q }) - poly(av + r * p, bv + r * q))));
  const e1 = err(0.02), e2 = err(0.01);
  const verified = e2 < 1e-12 || e2 <= e1 * 2 ** -(N + 1) * 1.6;

  const steps = [
    { title: 'The formula', formula: 'h = x - a, \\ k = y - b', lines: ['f(a + h, b + k) = f + \\left(h f_x + k f_y\\right) + \\frac{1}{2!}\\left(h^2 f_{xx} + 2hk\\,f_{xy} + k^2 f_{yy}\\right) + \\cdots'] },
    { title: `Derivatives at (${a || 0}, ${b || 0})`, lines: rows.map((r) => `${r.name} = ${r.expr} \\;\\Rightarrow\\; ${r.valueTex}`) },
    { title: `Put them in, up to degree ${N}`, lines: [`f(x, y) \\approx ${series}`] },
  ];
  const notes = [`h = ${h.replace(/[()]/g, '')} and k = ${kk.replace(/[()]/g, '')}. Terms whose derivative is 0 at the point are left out.`];
  if (!verified) notes.push('NETZ could not confirm the error shrinks as it should; check the function is smooth at this point.');
  return { f: mtex(polish(node)), a: exactTex(av), b: exactTex(bv), order: N, series, rows, steps, notes, verified };
}
