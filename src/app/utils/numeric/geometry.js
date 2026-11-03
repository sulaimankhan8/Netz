/**
 * Shared helpers for the geometry and trigonometry pages (Unit 9): π choices, angles, exact surds,
 * and LaTeX number formatting for step-by-step working.
 */
import { EngineError, clean } from './steps';
import { parseNumber, toFraction } from './fraction';

// School books use π, 22/7 or 3.14; the student picks which, so answers match their book.
export const PI_CHOICES = {
  exact: { value: Math.PI, tex: '\\pi', label: 'π (exact)' },
  '22/7': { value: 22 / 7, tex: '\\tfrac{22}{7}', label: '22/7' },
  '3.14': { value: 3.14, tex: '3.14', label: '3.14' },
};
export const piChoice = (key) => PI_CHOICES[key] || PI_CHOICES.exact;

/** A number for LaTeX steps: up to 6 significant figures, "−" for negatives, no float noise. */
export function n(v, digits = 6) {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '-\\infty';
  const c = clean(Number(v.toPrecision(digits)));
  const s = Math.abs(c) >= 1e9 || (Math.abs(c) < 1e-6 && c !== 0) ? c.toExponential(digits - 1).replace(/e([+-]\d+)/, '\\times10^{$1}') : String(c);
  return s;
}

/** A number for LaTeX as a fraction when it is a simple one (3/4 → \frac{3}{4}), else like n(). */
export function q(v) {
  const f = toFraction(v, 1000, 1e-9);
  if (!f) return n(v);
  if (f.d === 1) return String(f.n);
  return `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}

/** n(v) in brackets when negative, for substitutions like 3 × (−2). */
export const nb = (v) => (v < 0 ? `(${n(v)})` : n(v));

export const toRad = (deg) => (deg * Math.PI) / 180;
export const toDeg = (rad) => (rad * 180) / Math.PI;
/** sin/cos/tan of degrees, with 0 instead of 1e-17 at 180°, 90° … */
export const sinD = (d) => clean(Math.sin(toRad(d)));
export const cosD = (d) => clean(Math.cos(toRad(d)));
export const tanD = (d) => clean(Math.tan(toRad(d)));
/** Inverse trig in degrees, clamping tiny float overshoot (1.0000000002) into range. */
export const asinD = (x) => toDeg(Math.asin(Math.max(-1, Math.min(1, x))));
export const acosD = (x) => toDeg(Math.acos(Math.max(-1, Math.min(1, x))));

/** √n for a whole number n as k√m in lowest form: 50 → { k: 5, m: 2 }. */
export function simplifySqrt(nInt) {
  let k = 1;
  let m = nInt;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) { m /= f * f; k *= f; }
  }
  return { k, m };
}

/**
 * Exact LaTeX for √(square) when `square` is a whole number (or a simple fraction): 50 → 5\sqrt{2}, 49 → 7.
 * Returns null when there is no tidy exact form.
 */
export function sqrtTex(square) {
  if (!(square >= 0)) return null;
  const f = toFraction(square, 100, 1e-9);
  if (!f) return null;
  const top = simplifySqrt(f.n);
  const bottom = simplifySqrt(f.d);
  if (bottom.m !== 1) return null; // keep it simple: only denominators that are perfect squares
  const num = top.m === 1 ? String(top.k) : `${top.k === 1 ? '' : top.k}\\sqrt{${top.m}}`;
  return bottom.k === 1 ? num : `\\frac{${num}}{${bottom.k}}`;
}

/** Degrees as a multiple of π for LaTeX: 60 → \frac{\pi}{3}, 270 → \frac{3\pi}{2}; null if not a simple fraction. */
export function radiansTex(deg) {
  const f = toFraction(deg / 180, 36, 1e-9);
  if (!f) return null;
  if (f.n === 0) return '0';
  const sign = f.n < 0 ? '-' : '';
  const top = Math.abs(f.n) === 1 ? '\\pi' : `${Math.abs(f.n)}\\pi`;
  return f.d === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${f.d}}`;
}

/**
 * Reads an angle typed as degrees ("45") or radians ("pi/3", "2π/3", "1.2 rad").
 * unit: 'deg' or 'rad' (a "π" in the text always means radians). Returns degrees.
 */
export function parseAngle(text, unit = 'deg', where = 'The angle') {
  const s = String(text ?? '').trim().toLowerCase().replace(/π/g, 'pi').replace(/\s*rad(ians?)?$/, '').replace(/−/g, '-');
  if (!s) throw new EngineError(`${where} is empty.`);
  const m = s.match(/^([+-]?\d*\.?\d*)\s*\*?\s*pi(?:\s*\/\s*(\d*\.?\d+))?$/);
  if (m) {
    const k = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const d = m[2] ? Number(m[2]) : 1;
    if (!Number.isFinite(k) || !d) throw new EngineError(`${where}: "${text}" is not an angle.`);
    return (k / d) * 180;
  }
  const v = parseNumber(s);
  if (!Number.isFinite(v)) throw new EngineError(`${where}: "${text}" is not an angle. Use numbers like 45, or pi/3 for radians.`);
  return unit === 'rad' ? toDeg(v) : v;
}

/** Reads a measurement that must be more than 0. */
export function positive(text, where) {
  const v = parseNumber(text);
  if (!String(text ?? '').trim()) throw new EngineError(`${where} is empty.`);
  if (!Number.isFinite(v)) throw new EngineError(`${where}: "${String(text).trim()}" is not a number.`);
  if (!(v > 0)) throw new EngineError(`${where} must be more than 0.`);
  return v;
}

/** Like positive(), but blank is allowed (returns null). */
export const optionalPositive = (text, where) => (String(text ?? '').trim() ? positive(text, where) : null);
