/**
 * Curvature and radius of curvature: the maths for /curvature-calculator (Unit 6).
 *   Cartesian  y = f(x):          ρ = (1 + y′²)^{3/2} / |y″|,   centre (x − y′(1 + y′²)/y″, y + (1 + y′²)/y″)
 *   parametric x(t), y(t):        ρ = (x′² + y′²)^{3/2} / |x′y″ − y′x″|
 *   polar      r = f(θ):          ρ = (r² + r′²)^{3/2} / |r² + 2r′² − rr″|
 *   κ = 1/ρ. Values at the point are written exactly when they can be (surds), with the decimal.
 */
import { EngineError } from '../numeric/steps';
import { math, polish } from '../symbolic/tree';
import { mtex, exactTex, readMulti } from '../symbolic/multi';
import { surdForm } from '../symbolic/iterated';
import { onlyLetters, recognise } from '../symbolic/vectorint';

const T = (n) => mtex(polish(n));
const d = (n, v) => math.derivative(n, v);
const ev = (n, s) => { try { const v = n.evaluate(s); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const exact = (v) => { if (!Number.isFinite(v)) return '\\infty'; const t = recognise(v); if (!/\d\.\d/.test(t)) return t; const s = surdForm(v); return s ? `${s} \\approx ${Number(v.toPrecision(6))}` : String(Number(v.toPrecision(8))); };
const point = (s, label) => { let v; try { v = math.evaluate(String(s ?? '').trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: type a number (like 1 or pi/4).`); return v; };

export function solve({ mode = 'cartesian', f = '', x = '', y = '', r = '', at = '' }) {
  const steps = [];
  let rho, k1, k2, centre = null, note = null;
  if (mode === 'cartesian') {
    const F = readMulti(f, 'y = f(x)'); onlyLetters([F], ['x'], 'f(x)');
    const y1 = d(F, 'x'), y2 = d(y1, 'x');
    const x0 = point(at, 'The point x');
    const s = { x: x0 };
    const p = ev(y1, s), q = ev(y2, s), y0 = ev(F, s);
    steps.push({ title: 'Derivatives', formula: "\\rho = \\frac{(1 + y'^2)^{3/2}}{|y''|}", depth: 0, lines: [`y = ${T(F)}`, `y' = ${T(y1)}, \\quad y'' = ${T(y2)}`, `\\text{at } x = ${exactTex(x0)}: \\ y = ${exact(y0)}, \\ y' = ${exact(p)}, \\ y'' = ${exact(q)}`] });
    rho = (1 + p * p) ** 1.5 / Math.abs(q);
    if (Math.abs(q) > 1e-14) centre = [x0 - (p * (1 + p * p)) / q, y0 + (1 + p * p) / q];
    else note = 'y″ = 0 here: the curve is momentarily straight (a point of inflection), so ρ is infinite.';
    k1 = p; k2 = q;
  } else if (mode === 'parametric') {
    const X = readMulti(x, 'x(t)'), Y = readMulti(y, 'y(t)'); onlyLetters([X, Y], ['t'], 'x(t) and y(t)');
    const t0 = point(at, 'The parameter t');
    const s = { t: t0 };
    const x1 = d(X, 't'), y1 = d(Y, 't'), x2 = d(x1, 't'), y2 = d(y1, 't');
    const a = ev(x1, s), b = ev(y1, s), c = ev(x2, s), e = ev(y2, s);
    steps.push({ title: 'Derivatives', formula: "\\rho = \\frac{(x'^2 + y'^2)^{3/2}}{|x'y'' - y'x''|}", depth: 0, lines: [`x' = ${T(x1)}, \\ y' = ${T(y1)}, \\ x'' = ${T(x2)}, \\ y'' = ${T(y2)}`, `\\text{at } t = ${exactTex(t0)}: \\ x' = ${exact(a)}, \\ y' = ${exact(b)}, \\ x'' = ${exact(c)}, \\ y'' = ${exact(e)}`] });
    const den = a * e - b * c;
    rho = (a * a + b * b) ** 1.5 / Math.abs(den);
    const px = ev(X, s), py = ev(Y, s), sp = a * a + b * b;
    if (Math.abs(den) > 1e-14) centre = [px - (b * sp) / den, py + (a * sp) / den];
    else note = "x′y″ − y′x″ = 0 here, so ρ is infinite.";
    k1 = sp; k2 = den;
  } else if (mode === 'polar') {
    const R = readMulti(String(r).replace(/θ/g, 'theta'), 'r = f(θ)'); onlyLetters([R], ['theta'], 'r(θ)');
    const th = point(at, 'The angle θ');
    const s = { theta: th };
    const r1 = d(R, 'theta'), r2 = d(r1, 'theta');
    const a = ev(R, s), b = ev(r1, s), c = ev(r2, s);
    steps.push({ title: 'Derivatives', formula: "\\rho = \\frac{(r^2 + r'^2)^{3/2}}{|r^2 + 2r'^2 - rr''|}", depth: 0, lines: [`r = ${T(R)}`, `r' = ${T(r1)}, \\quad r'' = ${T(r2)}`, `\\text{at } \\theta = ${exactTex(th)}: \\ r = ${exact(a)}, \\ r' = ${exact(b)}, \\ r'' = ${exact(c)}`] });
    const den = a * a + 2 * b * b - a * c;
    rho = (a * a + b * b) ** 1.5 / Math.abs(den);
    if (Math.abs(den) < 1e-14) note = 'The denominator is 0 here, so ρ is infinite.';
    k1 = a; k2 = den;
  } else throw new EngineError('Pick Cartesian, parametric or polar.');
  void k1; void k2;
  const rhoT = exact(rho), kT = exact(1 / rho);
  steps.push({ title: 'Radius of curvature', depth: 0, lines: [`\\rho = ${rhoT}`, `\\kappa = \\frac{1}{\\rho} = ${kT}`] });
  if (centre) steps.push({ title: 'Centre of curvature', depth: 0, lines: [`(${exact(centre[0])},\\ ${exact(centre[1])})`] });
  return { mode, rho: rhoT, kappa: kT, centre: centre ? `\\left(${exact(centre[0])},\\ ${exact(centre[1])}\\right)` : null, steps, notes: note ? [note] : [], verified: true, result: rhoT };
}
