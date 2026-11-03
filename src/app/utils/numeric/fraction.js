/**
 * Fractions for display: exam answers are written 5/49, not 0.10204.
 * Engines still work in decimals; pages turn results back into fractions when it is exact enough.
 */
import { EngineError } from './steps';

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

/**
 * The fraction n/d (d ≥ 1, lowest terms) equal to v within `tol`, with d ≤ maxDen; null if there is none.
 * Uses continued fractions, so 0.333333333 → 1/3 and 0.142857142857 → 1/7.
 */
export function toFraction(v, maxDen = 1000, tol = 1e-9) {
  if (!Number.isFinite(v)) return null;
  if (Number.isInteger(v)) return { n: v, d: 1 };
  const sign = v < 0 ? -1 : 1;
  let x = Math.abs(v);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(x);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (k1 > maxDen) return null;
    if (Math.abs(Math.abs(v) - h1 / k1) <= tol * Math.max(1, Math.abs(v))) {
      const g = gcd(h1, k1);
      return { n: (sign * h1) / g, d: k1 / g };
    }
    const frac = x - a;
    if (frac < 1e-15) break;
    x = 1 / frac;
  }
  return null;
}

/** A number as plain text for step notes: "1/3", "-5/2", "4", or 6 significant figures when it isn't a simple fraction. */
export function formatNumber(v) {
  if (!Number.isFinite(v)) return String(v);
  const f = toFraction(v);
  if (f) return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  return String(Number(v.toPrecision(6)));
}

/**
 * Reads a number the way students type it: "3", "-2.5", "1/3", "-7/2", " 4 ".
 * Returns a number, or NaN when it isn't one.
 */
export function parseNumber(text) {
  const s = String(text ?? '').trim().replace(/−/g, '-');
  if (!s) return NaN;
  const m = s.match(/^([+-]?\d*\.?\d+)\s*\/\s*([+-]?\d*\.?\d+)$/);
  if (m) {
    const d = Number(m[2]);
    return d === 0 ? NaN : Number(m[1]) / d;
  }
  return /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s) ? Number(s) : NaN;
}

/** Like parseNumber, but throws an EngineError naming the place: "Matrix A, row 2, column 3". */
export function requireNumber(text, where) {
  const v = parseNumber(text);
  if (!Number.isFinite(v)) {
    const shown = String(text ?? '').trim();
    throw new EngineError(shown ? `${where}: "${shown}" is not a number. Use numbers like 3, -2.5 or 1/3.` : `${where} is empty.`);
  }
  return v;
}
