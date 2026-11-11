/**
 * Hermite interpolation: the maths for /hermite-interpolation (Unit 2).
 *   Given f(xᵢ) and f′(xᵢ) at n points, the polynomial of degree 2n − 1 matching both: Newton divided differences
 *   with every node repeated, f[xᵢ, xᵢ] = f′(xᵢ). H(x) = f[z₀] + f[z₀, z₁](x − z₀) + f[z₀, z₁, z₂](x − z₀)(x − z₁) + …
 * Checked: H and H′ take the given values at every node.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';
import { toFraction } from '../numeric/fraction';
import { polyTex } from '../symbolic/algebra';

const fx = (v) => { if (Math.abs(v) < 1e-12) return '0'; const f = toFraction(v, 10000, 1e-10); return f ? (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`) : String(Number(v.toPrecision(8))); };

export function solve({ x: xt, y: yt, dy: dt, at = '' }) {
  const X = readVector(xt, 'x'), Y = readVector(yt, 'f(x)'), Dv = readVector(dt, "f′(x)");
  const n = X.length;
  if (Y.length !== n || Dv.length !== n) throw new EngineError('Give the same number of x, f(x) and f′(x) values.');
  if (n < 1 || n > 6) throw new EngineError('Use 1 to 6 points.');
  if (new Set(X).size !== n) throw new EngineError('The x values must be different.');
  const z = X.flatMap((v) => [v, v]), N = 2 * n;
  const Q = Array.from({ length: N }, (_, i) => [Y[Math.floor(i / 2)]]);
  for (let j = 1; j < N; j++) for (let i = j; i < N; i++) {
    Q[i][j] = j === 1 && i % 2 === 1 ? Dv[Math.floor(i / 2)] : (Q[i][j - 1] - Q[i - 1][j - 1]) / (z[i] - z[i - j]);
  }
  const coef = Array.from({ length: N }, (_, j) => Q[j][j]);
  // expand to ascending powers
  let poly = [0];
  let basis = [1];
  for (let j = 0; j < N; j++) {
    poly = Array.from({ length: Math.max(poly.length, basis.length) }, (_, k) => (poly[k] || 0) + coef[j] * (basis[k] || 0));
    const nb = Array(basis.length + 1).fill(0);
    basis.forEach((c, k) => { nb[k + 1] += c; nb[k] -= z[j] * c; });
    basis = nb;
  }
  const snapC = poly.map((v) => { const f = toFraction(v, 10000, 1e-10); return f ? f.n / f.d : v; });
  const H = (x) => snapC.reduceRight((s, c) => s * x + c, 0);
  const dH = (x) => snapC.slice(1).map((c, k) => c * (k + 1)).reduceRight((s, c) => s * x + c, 0);
  const steps = [
    { title: 'Repeated nodes', formula: "f[x_i, x_i] = f'(x_i)", depth: 0, lines: [`z = ${z.map(fx).join(', ')}`] },
    { title: 'Divided differences (the top diagonal)', depth: 0, lines: [coef.map((c, j) => `f[z_0, \\ldots, z_{${j}}] = ${fx(c)}`).join(', \\ ')] },
    { title: 'Hermite polynomial', depth: 0, lines: [`H(x) = ${polyTex(snapC, 'x')}`] },
  ];
  let value = null;
  if (String(at).trim()) { const x0 = Number(at); if (!Number.isFinite(x0)) throw new EngineError('The point must be a number.'); value = fx(H(x0)); steps.push({ title: `At x = ${at}`, depth: 0, lines: [`H(${at}) = ${value}`] }); }
  const rows = Array.from({ length: N }, (_, i) => ({ z: fx(z[i]), ...Object.fromEntries(Array.from({ length: i + 1 }, (_, j) => [`d${j}`, fx(Q[i][j])])) }));
  const columns = [{ key: 'z', label: 'z', bold: true }, ...Array.from({ length: N }, (_, j) => ({ key: `d${j}`, label: j === 0 ? 'f[z]' : `order ${j}`, highlight: false }))];
  const verified = X.every((x, i) => Math.abs(H(x) - Y[i]) < 1e-6 * Math.max(1, Math.abs(Y[i])) && Math.abs(dH(x) - Dv[i]) < 1e-6 * Math.max(1, Math.abs(Dv[i])));
  return { poly: polyTex(snapC, 'x'), value, table: { columns, rows }, steps, notes: [`Degree at most ${2 * n - 1}: two conditions at each of ${n} points.`], verified, result: value ?? polyTex(snapC, 'x') };
}
