/**
 * Shooting method: the maths for /shooting-method (Units 1–5).
 *   y'' = F(x, y, y'),  y(a) = α, y(b) = β.  Guess the slope s = y'(a), solve the initial value problem with RK4, and
 *   adjust s by the secant method until y(b) hits β:  s_{k+1} = s_k − (y_b(s_k) − β)(s_k − s_{k−1})/(y_b(s_k) − y_b(s_{k−1})).
 */
import { EngineError } from '../numeric/steps';
import { readMulti } from '../symbolic/multi';
import { readConstant } from './input';

const r6 = (v) => Number(v.toPrecision(7));

/** RK4 for y' = z, z' = F(x, y, z); returns the y values on the grid. */
function shoot(F, a, b, alpha, s, n) {
  const h = (b - a) / n;
  let x = a, y = alpha, z = s;
  const ys = [y];
  for (let i = 0; i < n; i++) {
    const k1 = [z, F(x, y, z)];
    const k2 = [z + (h / 2) * k1[1], F(x + h / 2, y + (h / 2) * k1[0], z + (h / 2) * k1[1])];
    const k3 = [z + (h / 2) * k2[1], F(x + h / 2, y + (h / 2) * k2[0], z + (h / 2) * k2[1])];
    const k4 = [z + h * k3[1], F(x + h, y + h * k3[0], z + h * k3[1])];
    y += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    z += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    x += h;
    ys.push(y);
  }
  return ys;
}

export function solve({ F, a, b, ya, yb, s0 = '0', s1 = '1', n = '10' }) {
  const node = readMulti(String(F ?? '').replace(/y'/g, 'z'), "y'' = F(x, y, y')", ['z']);
  const bad = [...new Set(node.toString().match(/[a-z]+/g) || [])].filter((w) => !['x', 'y', 'z', 'sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'pi', 'e'].includes(w));
  if (bad.length) throw new EngineError(`F may use x, y and y' only (found ${bad.join(', ')}).`);
  const Ff = (x, y, z) => { const v = node.evaluate({ x, y, z }); if (!Number.isFinite(v)) throw new EngineError('F gave an undefined value while shooting; try other guesses.'); return v; };
  const A = readConstant(a, 'a'), B = readConstant(b, 'b'), alpha = readConstant(ya, 'y(a)'), beta = readConstant(yb, 'y(b)');
  const N = Math.round(readConstant(n, 'n'));
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  if (!(N >= 2 && N <= 200)) throw new EngineError('Use 2 to 200 RK4 steps.');
  let sPrev = readConstant(s0, 'The first guess'), s = readConstant(s1, 'The second guess');
  let yPrev = shoot(Ff, A, B, alpha, sPrev, N).at(-1), yCur = shoot(Ff, A, B, alpha, s, N).at(-1);
  const rows = [{ k: 0, s: r6(sPrev), yb: r6(yPrev), miss: r6(yPrev - beta) }, { k: 1, s: r6(s), yb: r6(yCur), miss: r6(yCur - beta) }];
  for (let k = 2; k < 30 && Math.abs(yCur - beta) > 1e-10; k++) {
    if (Math.abs(yCur - yPrev) < 1e-15) throw new EngineError('Two shots landed at the same place; choose different guesses.');
    const sNew = s - ((yCur - beta) * (s - sPrev)) / (yCur - yPrev);
    sPrev = s; yPrev = yCur; s = sNew; yCur = shoot(Ff, A, B, alpha, s, N).at(-1);
    rows.push({ k, s: r6(s), yb: r6(yCur), miss: r6(yCur - beta) });
  }
  const h = (B - A) / N;
  const ys = shoot(Ff, A, B, alpha, s, N);
  const table = ys.map((y, i) => ({ i, x: r6(A + i * h), y: r6(y) }));
  const steps = [
    { title: 'Turn it into an initial value problem', formula: "y' = z, \\ z' = F(x, y, z), \\ y(a) = \\alpha, \\ z(a) = s", depth: 0, lines: [`\\text{Solve with RK4 } (h = ${r6(h)}) \\text{ and look at } y(b) - \\beta`] },
    { title: 'Secant method on the slope', formula: "s_{k+1} = s_k - \\frac{(y_b(s_k) - \\beta)(s_k - s_{k-1})}{y_b(s_k) - y_b(s_{k-1})}", depth: 0, lines: rows.slice(0, 8).map((r) => `s_{${r.k}} = ${r.s} \\Rightarrow y(b) = ${r.yb}`) },
    { title: 'Result', depth: 0, lines: [`y'(a) = ${r6(s)}`] },
  ];
  return {
    slope: r6(s), steps, rows, table,
    columns: [{ key: 'k', label: 'k', bold: true }, { key: 's', label: "s = y'(a)" }, { key: 'yb', label: 'y(b)' }, { key: 'miss', label: 'y(b) − β', highlight: true }],
    tableColumns: [{ key: 'i', label: 'i', bold: true }, { key: 'x', label: 'x' }, { key: 'y', label: 'y', highlight: true }],
    notes: ['For a linear equation the secant step lands exactly on the second try; nonlinear ones take a few more.'], verified: Math.abs(yCur - beta) < 1e-6,
    plot: { points: table.map((r) => ({ x: r.x, y: r.y })) },
  };
}
