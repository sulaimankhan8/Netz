/**
 * Conic sections Ax² + Cy² + Dx + Ey + F = 0 (axes parallel to the coordinate axes; no xy term):
 *   classify     A·C = 0 parabola, A·C > 0 ellipse (A = C a circle), A·C < 0 hyperbola
 *   standard     complete the square: (y − k)² = 4a(x − h), (x − h)²/a² + (y − k)²/b² = 1, …
 *   properties   centre or vertex, foci, vertices, directrices, eccentricity, latus rectum, axes, asymptotes
 * Values are exact where they are simple surds (√5, 2√3, 3/2).
 */
import { EngineError } from '../numeric/steps';
import { n, q, sqrtTex } from '../numeric/geometry';
import { readQuadratic } from './circles';

const rt = (sq) => sqrtTex(sq) ?? n(Math.sqrt(sq));
/** "h ± c" in LaTeX (c given as LaTeX). */
const pm = (h, cT) => (Math.abs(h) < 1e-12 ? `\\pm ${cT}` : `${q(h)} \\pm ${cT}`);
const shift = (s, v) => (Math.abs(v) < 1e-12 ? s : `(${s} ${v > 0 ? '-' : '+'} ${q(Math.abs(v))})`);
const line = (a, b, c) => ({ a, b, c }); // ax + by + c = 0, for the graph
/** p/q in LaTeX where p and q are already LaTeX (used when there is no single tidy surd). */
const over = (p, qq) => (qq === '1' ? p : `\\frac{${p}}{${qq}}`);
/** a, b, c, e = c/a, a²/c (directrix distance) and 2b²/a (latus rectum), exact where possible: 9/√5 rather than 4.0249. */
function exactParts(a2, b2, c2) {
  const aT = rt(a2), bT = rt(b2), cT = rt(c2);
  return {
    aT, bT, cT,
    eT: sqrtTex(c2 / a2) ?? over(cT, aT),
    dT: sqrtTex((a2 * a2) / c2) ?? over(q(a2), cT),
    lrT: sqrtTex((4 * b2 * b2) / a2) ?? over(q(2 * b2), aT),
  };
}
/** (x − h)² over d as a fraction, or just (x − h)² when d = 1. */
const sqOver = (s, d) => (Math.abs(d - 1) < 1e-12 ? `${s}^2` : `\\frac{${s}^2}{${q(d)}}`);

export function solve({ eq }) {
  const Q = readQuadratic(eq);
  const { A, B, C, D, E, F } = Q;
  if (Math.abs(B) > 1e-12) throw new EngineError('This conic has an xy term, so its axes are rotated. NETZ handles conics with axes parallel to x and y (no xy term).');
  if (Math.abs(A) < 1e-12 && Math.abs(C) < 1e-12) throw new EngineError('There is no x² or y² term: this is a straight line, not a conic.');
  const steps = [];
  const eqTex = `${[[A, 'x^2'], [C, 'y^2'], [D, 'x'], [E, 'y'], [F, '']].filter(([k]) => Math.abs(k) > 1e-12).map(([k, s], i) => `${i === 0 ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${q(Math.abs(k)) === '1' && s ? '' : q(Math.abs(k))}${s}`).join('')} = 0`;
  steps.push({ title: 'Compare with Ax² + Cy² + Dx + Ey + F = 0', lines: [eqTex, `A = ${q(A)}, \\ C = ${q(C)}, \\ D = ${q(D)}, \\ E = ${q(E)}, \\ F = ${q(F)}`] });
  let r;

  if (Math.abs(A) < 1e-12 || Math.abs(C) < 1e-12) {
    // Parabola
    const alongX = Math.abs(A) < 1e-12; // y² term only: opens left/right
    const sq = alongX ? C : A, lin = alongX ? D : E, other = alongX ? E : D;
    if (Math.abs(lin) < 1e-12) throw new EngineError('This is a pair of parallel lines (or no points), not a parabola.');
    const m = -other / (2 * sq); // the squared variable's shift
    const Fp = F - (other * other) / (4 * sq);
    const a = -lin / (4 * sq); // (… − m)² = 4a(… − t)
    const t = -Fp / lin;
    const [h, k] = alongX ? [t, m] : [m, t];
    const std = alongX ? `${shift('y', k)}^2 = ${q(4 * a)}${shift('x', h)}` : `${shift('x', h)}^2 = ${q(4 * a)}${shift('y', k)}`;
    steps.push({ title: 'Complete the square', lines: [std] });
    const focus = alongX ? [h + a, k] : [h, k + a];
    const directrix = alongX ? `x = ${q(h - a)}` : `y = ${q(k - a)}`;
    const opens = alongX ? (a > 0 ? 'right' : 'left') : a > 0 ? 'up' : 'down';
    steps.push({
      title: 'Read off the parabola',
      formula: alongX ? '(y - k)^2 = 4a(x - h)' : '(x - h)^2 = 4a(y - k)',
      lines: [
        `4a = ${q(4 * a)} \\Rightarrow a = ${q(a)} \\ \\text{(opens ${opens})}`,
        `\\text{Vertex } (${q(h)}, ${q(k)}), \\quad \\text{focus } (${q(focus[0])}, ${q(focus[1])}), \\quad \\text{directrix } ${directrix}`,
        `\\text{Axis } ${alongX ? `y = ${q(k)}` : `x = ${q(h)}`}, \\quad \\text{latus rectum} = |4a| = ${q(Math.abs(4 * a))}, \\quad e = 1`,
      ],
    });
    const curve = [];
    const T = Math.max(3, 3 * Math.sqrt(Math.abs(a)));
    for (let s = -T; s <= T + 1e-9; s += T / 60) {
      const u = s, w = (u * u) / (4 * a);
      curve.push(alongX ? { x: h + w, y: k + u } : { x: h + u, y: k + w });
    }
    r = {
      type: 'parabola', standard: std, e: 1, eTex: '1',
      facts: [['Vertex', `(${q(h)}, ${q(k)})`], ['Focus', `(${q(focus[0])}, ${q(focus[1])})`], ['Directrix', directrix], ['Axis', alongX ? `y = ${q(k)}` : `x = ${q(h)}`], ['Latus rectum', q(Math.abs(4 * a))], ['Eccentricity e', '1']],
      branches: [curve], points: [{ x: h, y: k, label: 'V' }, { x: focus[0], y: focus[1], label: 'S' }],
      lines: [alongX ? line(1, 0, -(h - a)) : line(0, 1, -(k - a))],
    };
  } else {
    // Ellipse or hyperbola: A(x − h)² + C(y − k)² = R
    const h = -D / (2 * A), k = -E / (2 * C);
    const R = (D * D) / (4 * A) + (E * E) / (4 * C) - F;
    steps.push({ title: 'Complete the square', lines: [`${q(A)}${shift('x', h)}^2 ${C < 0 ? '-' : '+'} ${q(Math.abs(C))}${shift('y', k)}^2 = ${q(R)}`.replace(/^1\(/, '(').replace(/\+ 1\(/, '+ (').replace(/- 1\(/, '- (')] });
    if (Math.abs(R) < 1e-12) throw new EngineError(A * C > 0 ? 'The right side is 0: this is a single point, not an ellipse.' : 'The right side is 0: this is a pair of crossing lines, not a hyperbola.');
    const P = R / A, S = R / C; // (x − h)²/P + (y − k)²/S = 1
    const stdT = (v) => (v < 0 ? '-' : '+');
    // The positive term first: y²/9 − x²/16 = 1 rather than −x²/16 + y²/9 = 1
    const std = P < 0
      ? `${sqOver(shift('y', k), Math.abs(S))} - ${sqOver(shift('x', h), Math.abs(P))} = 1`
      : `${sqOver(shift('x', h), Math.abs(P))} ${stdT(S)} ${sqOver(shift('y', k), Math.abs(S))} = 1`;
    steps.push({ title: 'Divide to get the standard form', lines: [std] });
    if (A * C > 0) {
      if (P < 0) throw new EngineError('The squares add up to a negative number: this equation has no real points.');
      if (Math.abs(P - S) < 1e-12) throw new EngineError('x² and y² have equal coefficients: this is a circle. Use the Circle Equations page.');
      const alongX = P > S;
      const a2 = Math.max(P, S), b2 = Math.min(P, S), c2 = a2 - b2;
      const { aT, bT, cT, eT, dT, lrT } = exactParts(a2, b2, c2);
      const a = Math.sqrt(a2), b = Math.sqrt(b2), c = Math.sqrt(c2);
      steps.push({
        title: `Ellipse with its major axis along ${alongX ? 'x' : 'y'}`,
        formula: 'c^2 = a^2 - b^2, \\quad e = \\frac{c}{a}',
        lines: [
          `a^2 = ${q(a2)}, \\ b^2 = ${q(b2)} \\Rightarrow a = ${aT}, \\ b = ${bT}, \\ c = \\sqrt{${q(a2)} - ${q(b2)}} = ${cT}`,
          `e = \\frac{${cT}}{${aT}} = ${eT}`,
          alongX ? `\\text{Foci } (${pm(h, cT)}, ${q(k)}), \\quad \\text{vertices } (${pm(h, aT)}, ${q(k)})` : `\\text{Foci } (${q(h)}, ${pm(k, cT)}), \\quad \\text{vertices } (${q(h)}, ${pm(k, aT)})`,
          `\\text{Directrices } ${alongX ? `x = ${pm(h, dT)}` : `y = ${pm(k, dT)}`}, \\quad \\text{latus rectum} = \\frac{2b^2}{a} = ${lrT}`,
        ],
      });
      const curve = [];
      for (let i = 0; i <= 120; i++) { const t = (i / 120) * 2 * Math.PI; const [u, w] = [Math.cos(t), Math.sin(t)]; curve.push(alongX ? { x: h + a * u, y: k + b * w } : { x: h + b * u, y: k + a * w }); }
      const fo = alongX ? [[h + c, k], [h - c, k]] : [[h, k + c], [h, k - c]];
      const dd = a2 / c;
      r = {
        type: 'ellipse', standard: std, e: c / a, eTex: eT,
        facts: [['Centre', `(${q(h)}, ${q(k)})`], ['a, b, c', `${aT}, ${bT}, ${cT}`], ['Foci', alongX ? `(${pm(h, cT)}, ${q(k)})` : `(${q(h)}, ${pm(k, cT)})`], ['Vertices', alongX ? `(${pm(h, aT)}, ${q(k)})` : `(${q(h)}, ${pm(k, aT)})`], ['Eccentricity e', eT], ['Directrices', alongX ? `x = ${pm(h, dT)}` : `y = ${pm(k, dT)}`], ['Latus rectum', lrT], ['Major / minor axis', `${rt(4 * a2)} / ${rt(4 * b2)}`]],
        branches: [curve], points: [{ x: h, y: k, label: 'C' }, ...fo.map(([x, y]) => ({ x, y, label: 'S' }))],
        lines: alongX ? [line(1, 0, -(h + dd)), line(1, 0, -(h - dd))] : [line(0, 1, -(k + dd)), line(0, 1, -(k - dd))],
      };
    } else {
      const alongX = P > 0; // transverse axis along x
      const a2 = alongX ? P : S, b2 = alongX ? -S : -P, c2 = a2 + b2;
      const { aT, bT, cT, eT, dT, lrT } = exactParts(a2, b2, c2);
      const a = Math.sqrt(a2), b = Math.sqrt(b2), c = Math.sqrt(c2);
      const slopeRaw = alongX ? rt(b2 / a2) : rt(a2 / b2), slope = alongX ? b / a : a / b;
      const slopeT = slopeRaw === '1' ? '' : slopeRaw; // y = ±x, not ±1x
      steps.push({
        title: `Hyperbola with its transverse axis along ${alongX ? 'x' : 'y'}`,
        formula: 'c^2 = a^2 + b^2, \\quad e = \\frac{c}{a}',
        lines: [
          `a^2 = ${q(a2)}, \\ b^2 = ${q(b2)} \\Rightarrow a = ${aT}, \\ b = ${bT}, \\ c = \\sqrt{${q(a2)} + ${q(b2)}} = ${cT}`,
          `e = \\frac{${cT}}{${aT}} = ${eT}`,
          alongX ? `\\text{Foci } (${pm(h, cT)}, ${q(k)}), \\quad \\text{vertices } (${pm(h, aT)}, ${q(k)})` : `\\text{Foci } (${q(h)}, ${pm(k, cT)}), \\quad \\text{vertices } (${q(h)}, ${pm(k, aT)})`,
          `\\text{Asymptotes } ${shift('y', k)} = \\pm ${slopeT}${shift('x', h)}, \\quad \\text{directrices } ${alongX ? `x = ${pm(h, dT)}` : `y = ${pm(k, dT)}`}, \\quad \\text{latus rectum} = ${lrT}`,
        ],
      });
      const branches = [[], []];
      for (let i = -60; i <= 60; i++) {
        const t = (i / 60) * 2.2;
        const [u, w] = [Math.cosh(t), Math.sinh(t)];
        if (alongX) { branches[0].push({ x: h + a * u, y: k + b * w }); branches[1].push({ x: h - a * u, y: k + b * w }); }
        else { branches[0].push({ x: h + b * w, y: k + a * u }); branches[1].push({ x: h + b * w, y: k - a * u }); }
      }
      const fo = alongX ? [[h + c, k], [h - c, k]] : [[h, k + c], [h, k - c]];
      r = {
        type: 'hyperbola', standard: std, e: c / a, eTex: eT,
        facts: [['Centre', `(${q(h)}, ${q(k)})`], ['a, b, c', `${aT}, ${bT}, ${cT}`], ['Foci', alongX ? `(${pm(h, cT)}, ${q(k)})` : `(${q(h)}, ${pm(k, cT)})`], ['Vertices', alongX ? `(${pm(h, aT)}, ${q(k)})` : `(${q(h)}, ${pm(k, aT)})`], ['Eccentricity e', eT], ['Asymptotes', `${shift('y', k)} = \\pm ${slopeT}${shift('x', h)}`], ['Directrices', alongX ? `x = ${pm(h, dT)}` : `y = ${pm(k, dT)}`], ['Latus rectum', lrT]],
        branches, points: [{ x: h, y: k, label: 'C' }, ...fo.map(([x, y]) => ({ x, y, label: 'S' }))],
        // y − k = ±m(x − h)  →  m x − y + (k − m h) = 0
        lines: [line(slope, -1, k - slope * h), line(-slope, -1, k + slope * h)],
      };
    }
  }

  // Check: points on the drawn curve satisfy the original equation
  const f = (x, y) => A * x * x + C * y * y + D * x + E * y + F;
  const scale = Math.max(1, Math.abs(A), Math.abs(C), Math.abs(D), Math.abs(E), Math.abs(F));
  const sample = r.branches.flatMap((b) => [b[5], b[Math.floor(b.length / 2)], b[b.length - 6]]).filter(Boolean);
  const verified = sample.every((p) => Math.abs(f(p.x, p.y)) < 1e-6 * scale * Math.max(1, p.x * p.x + p.y * p.y));
  return { ...r, equation: eqTex, steps, verified, result: r.type, notes: [], plot: null };
}
