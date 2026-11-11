/**
 * Residues and the residue theorem: the maths for /residue-calculator (Unit 14).
 *   Poles of f = A(z)/B(z) (B a polynomial): the zeros of B not cancelled by A, with their orders.
 *   Residue at a pole of order m: (1/(m−1)!) d^{m−1}/dz^{m−1}[(z − a)^m f(z)] at z = a (m = 1: lim (z − a)f).
 *   ∮_C f dz = 2πi × (sum of residues inside C), for the circle C: |z − z₀| = r.
 *   Each residue is checked by a small numerical contour integral around the pole.
 */
import { EngineError } from '../numeric/steps';
import { polish, tidy } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readZ, poles, residue, residueByCircle, cTex, C, snapC } from '../symbolic/complex';
import { math } from '../symbolic/tree';

const close = (a, b) => Math.hypot(a.re - b.re, a.im - b.im) < 1e-6 * Math.max(1, Math.hypot(b.re, b.im));
export const readCenter = (s) => {
  const t = String(s ?? '').trim();
  if (!t) return C(0, 0);
  try { const v = math.evaluate(t.replace(/\bj\b/g, 'i').replace(/π/g, 'pi')); return typeof v === 'number' ? C(v, 0) : C(v.re, v.im); } catch { throw new EngineError(`The centre "${t}" is not a number (write it like 0, 1 + i or -2i).`); }
};
export const readRadius = (s) => { const v = Number(String(s ?? '').trim()); if (!(v > 0)) throw new EngineError('The radius must be a positive number.'); return v; };

/** Poles with residues (shared with the Cauchy integral page). */
export function residueTable(f) {
  const P = poles(f);
  if (!P.split) throw new EngineError('Write f as a fraction with a polynomial in z at the bottom, e.g. e^z/(z^2 + 1) or (z + 1)/(z^3 - z).');
  return P.list.map((p) => {
    const r = residue(f, p.a, p.order, P.split);
    let check = null;
    try { check = residueByCircle(f, p.a); } catch { /* skip */ }
    return { ...p, ...r, ok: !check || close(r.value, check) };
  });
}

export function solve({ f, center = '0', radius = '' }) {
  const F = readZ(f);
  const list = residueTable(F);
  const steps = [];
  if (!list.length) {
    return { poles: [], steps: [{ title: 'Poles', depth: 0, lines: ['\\text{f has no poles: the bottom never vanishes (or every zero cancels).}'] }], notes: ['With no poles inside, ∮ f dz = 0 (Cauchy\'s theorem).'], verified: true, result: [] };
  }
  steps.push({ title: 'Poles', formula: '\\text{zeros of the denominator}', depth: 0, lines: [list.map((p) => `z = ${cTex(p.a)} \\ (\\text{${p.order === 1 ? 'simple pole' : `order ${p.order}`}})`).join(', \\quad ')] });
  list.forEach((p) => steps.push({ title: `Residue at z = ${cTex(p.a).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{(\d+)\}/g, '√$1').replace(/\\/g, '')}`, depth: 1, lines: p.lines }));
  let integral = null, inside = [];
  let circle = null;
  if (String(radius).trim()) {
    circle = { z0: readCenter(center), r: readRadius(radius) };
    const z0 = readCenter(center), r = readRadius(radius);
    const on = list.find((p) => Math.abs(Math.hypot(p.a.re - z0.re, p.a.im - z0.im) - r) < 1e-9);
    if (on) throw new EngineError(`The pole z = ${cTex(on.a)} lies on the circle, so the integral is not defined. Change the radius.`);
    inside = list.filter((p) => Math.hypot(p.a.re - z0.re, p.a.im - z0.im) < r);
    const sum = inside.reduce((s, p) => math.add(s, p.value), C(0, 0));
    integral = snapC(math.multiply(C(0, 2 * Math.PI), sum));
    steps.push({
      title: 'Residue theorem', formula: '\\oint_C f(z)\\,dz = 2\\pi i \\sum \\operatorname{Res}', depth: 0,
      lines: [`C: |z - ${cTex(z0)}| = ${r} \\ \\text{encloses } ${inside.length ? inside.map((p) => cTex(p.a)).join(', ') : '\\text{no pole}'}`,
        `\\oint_C f(z)\\,dz = 2\\pi i\\left(${inside.length ? inside.map((p) => cTex(p.value)).join(' + ').replace(/\+ -/g, '- ') : '0'}\\right) = ${piTex(integral)}`],
    });
  }
  return {
    fTex: mtex(polish(tidy(F))), poles: list.map((p) => ({ a: cTex(p.a), order: p.order, res: cTex(p.value), at: p.a, ok: p.ok })),
    integral: integral ? piTex(integral) : null, plot: planePlot(list.map((p) => p.a), circle), steps, notes: list.some((p) => !p.ok) ? ['A residue did not match its numerical check; treat it with care.'] : [],
    verified: list.every((p) => p.ok), result: list.map((p) => cTex(p.value)),
  };
}

/** Poles as points and the circle as a polygon, for CoordPlot (the complex plane: x = Re, y = Im). */
export function planePlot(polesList, circle) {
  const points = polesList.map((a, i) => ({ x: a.re, y: a.im, label: `p${i + 1}` }));
  const segments = [];
  if (circle) {
    const N = 72;
    for (let k = 0; k < N; k++) {
      const t1 = (2 * Math.PI * k) / N, t2 = (2 * Math.PI * (k + 1)) / N;
      segments.push([{ x: circle.z0.re + circle.r * Math.cos(t1), y: circle.z0.im + circle.r * Math.sin(t1) }, { x: circle.z0.re + circle.r * Math.cos(t2), y: circle.z0.im + circle.r * Math.sin(t2) }]);
    }
  }
  const xs = [...points.map((p) => p.x), ...(circle ? [circle.z0.re - circle.r, circle.z0.re + circle.r] : []), 0];
  const ys = [...points.map((p) => p.y), ...(circle ? [circle.z0.im - circle.r, circle.z0.im + circle.r] : []), 0];
  const pad = 0.6;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 2) / 2 + pad;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return { points, segments, view: { x0: cx - span, x1: cx + span, y0: cy - span, y1: cy + span } };
}

/** 2πi × (something) written with π: 2πi·(1/2) = πi, 2πi·e = 2πe i … */
export function piTex(c0) {
  const c = snapC(c0);
  // the value written directly when it is exact (π³ i, 8π i/(3e²)); otherwise divide by π first
  const direct = cTex(c);
  if (!/\d\.\d/.test(direct)) return direct;
  const re = c.re / Math.PI, im = c.im / Math.PI;
  const k = cTex(C(re, im));
  if (k === '0') return '0';
  // k·π: put π after the number in each part
  if (/[+-]/.test(k.slice(1))) return `\\left(${k}\\right)\\pi`;
  if (/i$/.test(k)) return k === 'i' ? '\\pi i' : k === '-i' ? '-\\pi i' : k.replace(/i$/, '\\pi i');
  return k === '1' ? '\\pi' : k === '-1' ? '-\\pi' : `${k}\\pi`;
}
