/**
 * Unit circle: the maths for /unit-circle. For any angle: where it lands on the circle (cos θ, sin θ),
 * its quadrant and reference angle, sin/cos/tan (exact for multiples of 30° and 45°), and radians.
 */
import { EngineError } from '../numeric/steps';
import { n, sinD, cosD, radiansTex, parseAngle } from '../numeric/geometry';

// sin and cos of the reference angles that have exact values
const EXACT = {
  0: ['0', '1'],
  30: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}'],
  45: ['\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}'],
  60: ['\\frac{\\sqrt{3}}{2}', '\\frac{1}{2}'],
  90: ['1', '0'],
};
const TAN = { 0: '0', 30: '\\frac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}' };

const signed = (sign, tex) => (tex === '0' || sign > 0 ? tex : `-${tex}`);

/** Where an angle (degrees) sits: 1–4, or an axis. */
export function quadrantOf(t) {
  if (t % 90 === 0) return { quadrant: 0, axis: ['positive x-axis', 'positive y-axis', 'negative x-axis', 'negative y-axis'][t / 90] };
  return { quadrant: t < 90 ? 1 : t < 180 ? 2 : t < 270 ? 3 : 4, axis: null };
}

/** Reference angle: the acute angle to the x-axis. */
export function referenceAngle(t) {
  if (t <= 90) return t;
  if (t <= 180) return 180 - t;
  if (t <= 270) return t - 180;
  return 360 - t;
}

/** Everything the page shows for one angle in degrees (any size, any sign). */
export function at(deg) {
  if (!Number.isFinite(deg)) throw new EngineError('Enter an angle.');
  // Round tiny float noise (e.g. from π/3 typed as radians) so 59.99999999 counts as 60
  const d = Math.abs(deg - Math.round(deg)) < 1e-9 ? Math.round(deg) : deg;
  const t = ((d % 360) + 360) % 360;
  const { quadrant, axis } = quadrantOf(t);
  const ref = referenceAngle(t);
  const sin = sinD(t), cos = cosD(t);
  const tanUndefined = Math.abs(cos) < 1e-12;
  const tan = tanUndefined ? null : sin / cos;

  let exact = null;
  if (Number.isInteger(t) && EXACT[ref]) {
    const sSign = Math.sign(sin) || 1, cSign = Math.sign(cos) || 1;
    exact = {
      sin: signed(sSign, EXACT[ref][0]),
      cos: signed(cSign, EXACT[ref][1]),
      tan: tanUndefined ? null : signed(sSign * cSign, TAN[ref]),
    };
  }

  return {
    deg: d, t, quadrant, axis, ref, sin, cos, tan, tanUndefined, exact,
    radTex: radiansTex(d), radians: (d * Math.PI) / 180,
    coterminal: t !== d,
    // ASTC: which ratios are positive in this quadrant
    positive: quadrant === 1 ? 'All' : quadrant === 2 ? 'Sin' : quadrant === 3 ? 'Tan' : quadrant === 4 ? 'Cos' : null,
  };
}

/** { angle: text, unit: 'deg' | 'rad' } → the angle's values, with the working lines. */
export function solve({ angle, unit = 'deg' }) {
  const deg = parseAngle(angle, unit);
  if (Math.abs(deg) > 1e6) throw new EngineError('Use an angle between −1,000,000° and 1,000,000°.');
  const r = at(deg);
  const lines = [];
  if (r.coterminal) lines.push(`${n(r.deg)}^\\circ \\text{ points the same way as } ${n(r.t)}^\\circ \\ (\\text{add or subtract } 360^\\circ)`);
  lines.push(`${n(r.deg)}^\\circ \\times \\frac{\\pi}{180^\\circ} = ${r.radTex ?? n(r.radians)}${r.radTex ? ` \\approx ${n(r.radians)}` : ''} \\text{ rad}`);
  if (r.quadrant) {
    lines.push(`\\text{Quadrant ${['', 'I', 'II', 'III', 'IV'][r.quadrant]}, reference angle } = ${n(r.ref)}^\\circ`);
  }
  return { ...r, lines, result: r.sin, steps: { headers: [], rows: [] }, notes: [], plot: null };
}

/** The special angles table (0° to 360°), for the page. */
export const SPECIAL_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].map((d) => ({ d, ...at(d) }));
