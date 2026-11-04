/**
 * ODE methods for dy/dx = f(x, y): RK2 (/rk2-method), Milne (/milne-predictor-corrector) and
 * Adams-Bashforth-Moulton (/adams-bashforth-moulton). The multi-step methods take their first three
 * steps by RK4 (utils/numeric/ode.js) and then predict and correct:
 *   Milne      P: yₙ₊₁ = yₙ₋₃ + 4h/3 (2fₙ₋₂ − fₙ₋₁ + 2fₙ)        C: yₙ₊₁ = yₙ₋₁ + h/3 (fₙ₋₁ + 4fₙ + fₙ₊₁)
 *   Adams      P: yₙ₊₁ = yₙ + h/24 (55fₙ − 59fₙ₋₁ + 37fₙ₋₂ − 9fₙ₋₃)
 *              C: yₙ₊₁ = yₙ + h/24 (9fₙ₊₁ + 19fₙ − 5fₙ₋₁ + fₙ₋₂)
 * The corrector is repeated until it changes by less than 10⁻⁶ (at most 5 times).
 */
import { EngineError } from '../numeric/steps';
import { march, rk2Step, startValues, gridX } from '../numeric/ode';
import { readFunction, readNumber } from './input';

function readOde({ f: tf, x0: tx0, y0: ty0, h: th, xn: txn }, minSteps = 1) {
  const f = readFunction(tf, ['x', 'y'], 'f(x, y)');
  const x0 = readNumber(tx0, 'x₀'), y0 = readNumber(ty0, 'y₀'), h = readNumber(th, 'Step h'), xn = readNumber(txn, 'Target x');
  if (!(h > 0)) throw new EngineError('The step h must be more than 0.');
  if (!(xn > x0)) throw new EngineError('The target x must be after x₀.');
  const steps = Math.round((xn - x0) / h);
  if (Math.abs(x0 + steps * h - xn) > 1e-9 * Math.max(1, Math.abs(xn))) throw new EngineError(`Target x − x₀ must be a whole number of steps of size ${h}.`);
  if (steps < minSteps) throw new EngineError(`This method needs at least ${minSteps} steps: make h smaller or the target x further away.`);
  if (steps > 2000) throw new EngineError('That is more than 2000 steps. Use a bigger h.');
  return { f, x0, y0, h, xn, steps };
}

export function rk2({ variant = 'heun', ...input }) {
  const { f, x0, y0, h, steps } = readOde(input);
  const { points, records } = march((ff, x, y, hh) => rk2Step(ff, x, y, hh, variant), f, x0, y0, h, steps);
  return {
    method: 'rk2', variant, h, points, rows: records, result: points.at(-1).y,
    steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}

function multiStep(kind, input) {
  const { f, x0, y0, h, steps } = readOde(input, 4);
  const start = startValues(f, x0, y0, h, 4);
  const xs = start.points.map((p) => p.x);
  const ys = start.points.map((p) => p.y);
  const fs = start.slopes.slice();
  const rows = start.points.map((p, i) => ({ n: i, x: p.x, y: p.y, f: fs[i], how: i === 0 ? 'given' : 'RK4' }));

  for (let m = 3; m < steps; m++) {
    const x = gridX(x0, h, m + 1);
    const yp = kind === 'milne'
      ? ys[m - 3] + ((4 * h) / 3) * (2 * fs[m - 2] - fs[m - 1] + 2 * fs[m])
      : ys[m] + (h / 24) * (55 * fs[m] - 59 * fs[m - 1] + 37 * fs[m - 2] - 9 * fs[m - 3]);
    const fp = f(x, yp);
    let yc = yp, fc = fp, passes = 0, change = Infinity;
    while (passes < 5 && change >= 1e-6) {
      const next = kind === 'milne'
        ? ys[m - 1] + (h / 3) * (fs[m - 1] + 4 * fs[m] + fc)
        : ys[m] + (h / 24) * (9 * fc + 19 * fs[m] - 5 * fs[m - 1] + fs[m - 2]);
      change = Math.abs(next - yc);
      yc = next; fc = f(x, yc); passes++;
    }
    if (!Number.isFinite(yc)) throw new EngineError(`The solution blew up near x = ${x}. Try a smaller h.`);
    xs.push(x); ys.push(yc); fs.push(fc);
    rows.push({ n: m + 1, x, yp, fp, y: yc, f: fc, passes, how: 'P-C' });
  }
  return {
    method: kind, h, rows, points: xs.map((x, i) => ({ x, y: ys[i] })), startRows: start.records,
    result: ys.at(-1), steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}

export const milne = (input) => multiStep('milne', input);
export const adams = (input) => multiStep('adams', input);
