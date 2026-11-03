/**
 * One-step ODE formulas for dy/dx = f(x, y), plus starting values for the multi-step methods
 * (Milne, Adams-Bashforth-Moulton) and the shooting method.
 *
 * `f` is a plain JS function (x, y) => number. Pages build it with parseUserFunction(expr, ['x', 'y']).
 * Each step returns the slopes it used, so a page can show k₁, k₂, … in its table.
 */
import { EngineError, clean } from './steps';

function slope(f, x, y) {
  const v = f(x, y);
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`f(x, y) is not a number at x = ${x}, y = ${y}.`);
  return v;
}

/** Euler: yₙ₊₁ = yₙ + h·f(xₙ, yₙ). */
export function eulerStep(f, x, y, h) {
  const k1 = slope(f, x, y);
  return { x: x + h, y: y + h * k1, k1 };
}

/**
 * Second-order Runge-Kutta.
 *   'heun'     (modified / improved Euler): yₙ₊₁ = yₙ + h/2·(k₁ + k₂), k₂ = f(xₙ + h, yₙ + h·k₁)
 *   'midpoint':                             yₙ₊₁ = yₙ + h·k₂,          k₂ = f(xₙ + h/2, yₙ + h/2·k₁)
 */
export function rk2Step(f, x, y, h, variant = 'heun') {
  const k1 = slope(f, x, y);
  if (variant === 'midpoint') {
    const k2 = slope(f, x + h / 2, y + (h / 2) * k1);
    return { x: x + h, y: y + h * k2, k1, k2 };
  }
  const k2 = slope(f, x + h, y + h * k1);
  return { x: x + h, y: y + (h / 2) * (k1 + k2), k1, k2 };
}

/**
 * Classical fourth-order Runge-Kutta. Slopes are returned as h·f(…) (the textbook k₁…k₄, as in Grewal),
 * so yₙ₊₁ = yₙ + (k₁ + 2k₂ + 2k₃ + k₄)/6.
 */
export function rk4Step(f, x, y, h) {
  const k1 = h * slope(f, x, y);
  const k2 = h * slope(f, x + h / 2, y + k1 / 2);
  const k3 = h * slope(f, x + h / 2, y + k2 / 2);
  const k4 = h * slope(f, x + h, y + k3);
  return { x: x + h, y: y + (k1 + 2 * k2 + 2 * k3 + k4) / 6, k1, k2, k3, k4 };
}

/** xₙ = x₀ + n·h, with float noise rounded off (12 significant digits). */
export const gridX = (x0, h, n) => clean(Number((x0 + n * h).toPrecision(12)));

/**
 * Runs `count` steps of a one-step method from (x0, y0).
 * points: [{ x, y }] including the start. records: [{ n, x, y, k1, …, xNext, yNext }], one per step.
 */
export function march(stepFn, f, x0, y0, h, count) {
  if (!(h !== 0 && Number.isFinite(h))) throw new EngineError('The step h must be a non-zero number.');
  if (!Number.isInteger(count) || count < 1) throw new EngineError('There must be at least one step.');
  if (count > 2000) throw new EngineError('That is more than 2000 steps. Use a bigger h or a nearer end point.');
  const points = [{ x: x0, y: y0 }];
  const records = [];
  let x = x0, y = y0;
  for (let n = 0; n < count; n++) {
    const { y: yNext, ...slopes } = stepFn(f, x, y, h);
    delete slopes.x;
    // x from the start, not by adding h each time, so 0.1 + 0.1 + 0.1 shows as 0.3
    const xNext = gridX(x0, h, n + 1);
    // One table row: where the step starts, its slopes, and where it lands
    records.push({ n, x, y, ...slopes, xNext, yNext });
    x = xNext; y = yNext;
    points.push({ x, y });
  }
  return { points, records };
}

/**
 * The first `count` points (x₀ plus count − 1 more) by RK4. Milne and Adams need 4 points before they can start.
 * Also returns f at each point, which those methods use as y′.
 */
export function startValues(f, x0, y0, h, count = 4) {
  const { points, records } = march(rk4Step, f, x0, y0, h, count - 1);
  return { points, records, slopes: points.map((p) => slope(f, p.x, p.y)) };
}
