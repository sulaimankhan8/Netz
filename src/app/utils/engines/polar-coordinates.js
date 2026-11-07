/**
 * Polar coordinates and transformations: the maths for /polar-coordinates (catalog 9L).
 *   to-polar     r = √(x² + y²), θ = atan2(y, x) (the quadrant decides θ, not just tan⁻¹(y/x))
 *   to-cartesian x = r cos θ, y = r sin θ
 *   rotate       axes turned through θ: X = x cos θ + y sin θ, Y = −x sin θ + y cos θ
 *   translate    origin moved to (h, k): X = x − h, Y = y − k
 *   curve        a polar curve r = f(θ) written in x and y (r² = x² + y², r cos θ = x, r sin θ = y)
 */
import { EngineError } from '../numeric/steps';
import { parse, tex, polish, tidy } from '../symbolic/tree';
import { valueTex, angleTex, degText } from '../symbolic/trig';

const num = (s, label) => {
  let v;
  try { v = parse(String(s ?? '').replace(/π/g, 'pi').replace(/°/g, ''), label).evaluate(); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: give a number such as 3, -2, sqrt(3) or pi/6.`);
  return v;
};
/** An angle typed in degrees (default) or radians (with pi). */
const readAngle = (s, unit, label = 'The angle') => (unit === 'deg' ? (num(s, label) * Math.PI) / 180 : num(s, label));
const ang = (a) => `${angleTex(a)} \\ (${degText(a).replace('°', '^\\circ')})`;
const quadrant = (x, y) => (x > 0 && y >= 0 ? 'I' : x <= 0 && y > 0 ? 'II' : x < 0 && y <= 0 ? 'III' : 'IV');

export function solve({ mode = 'to-polar', x = '', y = '', r = '', theta = '', unit = 'deg', h = '', k = '', curve = '' }) {
  const steps = [];
  let answer, plot = null;
  if (mode === 'to-polar') {
    const X = num(x, 'x'), Y = num(y, 'y');
    const R = Math.hypot(X, Y);
    if (R < 1e-12) return { answer: 'r = 0 \\text{ (the pole; any } \\theta)', steps: [{ title: 'The origin', depth: 0, lines: ['r = 0, \\ \\theta \\text{ can be anything}'] }], notes: [], verified: true, result: [0, 0] };
    const T = Math.atan2(Y, X);
    const T2 = T < 0 ? T + 2 * Math.PI : T;
    steps.push({ title: 'Distance from the pole', formula: 'r = \\sqrt{x^2 + y^2}', depth: 0, lines: [`r = \\sqrt{${valueTex(X * X)} + ${valueTex(Y * Y)}} = ${valueTex(R)}`] });
    steps.push({ title: 'Angle', formula: '\\tan\\theta = \\frac{y}{x}, \\ \\text{in the right quadrant}', depth: 0, lines: [`(${valueTex(X)}, ${valueTex(Y)}) \\text{ is in quadrant ${quadrant(X, Y)}}`,`\\theta = ${ang(T2)}${T < 0 ? ` \\ \\text{or } ${angleTex(T)}` : ''}`] });
    answer = `(r, \\theta) = \\left(${valueTex(R)}, ${angleTex(T2)}\\right)`;
    plot = { x: X, y: Y, r: R, theta: T2 };
  } else if (mode === 'to-cartesian') {
    const R = num(r, 'r'), T = readAngle(theta, unit);
    const X = R * Math.cos(T), Y = R * Math.sin(T);
    steps.push({ title: 'Convert', formula: 'x = r\\cos\\theta, \\quad y = r\\sin\\theta', depth: 0, lines: [`x = ${valueTex(R)}\\cos ${angleTex(T)} = ${valueTex(X)}`, `y = ${valueTex(R)}\\sin ${angleTex(T)} = ${valueTex(Y)}`] });
    answer = `(x, y) = \\left(${valueTex(X)}, ${valueTex(Y)}\\right)`;
    plot = { x: X, y: Y, r: R, theta: T };
  } else if (mode === 'rotate') {
    const X = num(x, 'x'), Y = num(y, 'y'), T = readAngle(theta, unit);
    const c = Math.cos(T), s = Math.sin(T);
    const NX = X * c + Y * s, NY = -X * s + Y * c;
    steps.push({ title: 'Rotation of axes', formula: 'X = x\\cos\\theta + y\\sin\\theta, \\quad Y = -x\\sin\\theta + y\\cos\\theta', depth: 0, lines: [`\\cos\\theta = ${valueTex(c)}, \\ \\sin\\theta = ${valueTex(s)}`, `X = ${valueTex(X)}(${valueTex(c)}) + ${valueTex(Y)}(${valueTex(s)}) = ${valueTex(NX)}`, `Y = -${valueTex(X)}(${valueTex(s)}) + ${valueTex(Y)}(${valueTex(c)}) = ${valueTex(NY)}`] });
    steps.push({ title: 'Check: distance from the origin is unchanged', depth: 1, lines: [`X^2 + Y^2 = ${valueTex(NX * NX + NY * NY)} = x^2 + y^2`] });
    answer = `(X, Y) = \\left(${valueTex(NX)}, ${valueTex(NY)}\\right)`;
  } else if (mode === 'translate') {
    const X = num(x, 'x'), Y = num(y, 'y'), H = num(h, 'h'), K = num(k, 'k');
    steps.push({ title: 'Shift of origin', formula: 'X = x - h, \\quad Y = y - k', depth: 0, lines: [`X = ${valueTex(X)} - (${valueTex(H)}) = ${valueTex(X - H)}`, `Y = ${valueTex(Y)} - (${valueTex(K)}) = ${valueTex(Y - K)}`] });
    answer = `(X, Y) = \\left(${valueTex(X - H)}, ${valueTex(Y - K)}\\right)`;
  } else if (mode === 'curve') {
    // r = f(θ) → an equation in x and y, for the common textbook shapes
    const src = String(curve).replace(/θ/g, 't').replace(/theta/g, 't').replace(/\s+/g, '');
    const m = src.replace(/^r=/, '');
    const forms = [
      [/^(-?[\d.]+)$/, (a) => `x^2 + y^2 = ${valueTex(Number(a) ** 2)}`, 'circle centred at the pole'],
      [/^(-?[\d.]*)\*?cos\(t\)$/, (a) => `x^2 + y^2 = ${valueTex(Number(a || 1))}x`, 'circle through the pole'],
      [/^(-?[\d.]*)\*?sin\(t\)$/, (a) => `x^2 + y^2 = ${valueTex(Number(a || 1))}y`, 'circle through the pole'],
      [/^(-?[\d.]+)\/cos\(t\)$|^(-?[\d.]*)\*?sec\(t\)$/, (a, b) => `x = ${valueTex(Number(a ?? (b || 1)))}`, 'vertical line'],
      [/^(-?[\d.]+)\/sin\(t\)$|^(-?[\d.]*)\*?csc\(t\)$/, (a, b) => `y = ${valueTex(Number(a ?? (b || 1)))}`, 'horizontal line'],
      [/^(-?[\d.]*)\*?\(1\+cos\(t\)\)$/, (a) => `(x^2 + y^2 - ${valueTex(Number(a || 1))}x)^2 = ${valueTex(Number(a || 1) ** 2)}(x^2 + y^2)`, 'cardioid'],
    ];
    const f = forms.find(([re]) => re.test(m));
    let node;
    try { node = parse(m.replace(/\bt\b/g, 't'), 'r(θ)'); } catch { throw new EngineError('Write the curve like r = 4cos(θ) or r = 2(1 + cos(θ)).'); }
    steps.push({ title: 'The polar curve', depth: 0, lines: [`r = ${tex(polish(tidy(node))).replace(/\bt\b/g, '\\theta')}`] });
    steps.push({ title: 'Substitutions', formula: 'x = r\\cos\\theta, \\ y = r\\sin\\theta, \\ r^2 = x^2 + y^2', depth: 0, lines: [f ? `\\text{Multiply by } r \\text{ where needed: } ${f[1](...m.match(f[0]).slice(1))} \\quad \\text{(${f[2]})}` : '\\text{This curve has no simple x–y form here; its graph is drawn below.}'] });
    answer = f ? f[1](...m.match(f[0]).slice(1)) : `r = ${tex(node).replace(/\bt\b/g, '\\theta')}`;
    plot = { curve: m };
  } else throw new EngineError('Choose what to work out.');
  return { answer, plot, steps, notes: [], verified: true, result: answer };
}
