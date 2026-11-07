/**
 * 3D geometry: the maths for /3d-geometry (catalog 9K).
 *   dc           direction ratios PQ = Q − P and direction cosines l, m, n = (a, b, c)/√(a² + b² + c²)
 *   line         the line through P and Q: (x − x₁)/a = (y − y₁)/b = (z − z₁)/c, and r = P + λd
 *   plane        the plane through P, Q, S: normal n = PQ × PS, n·(r − P) = 0
 *   point-plane  distance |ax₀ + by₀ + cz₀ − d|/√(a² + b² + c²)
 *   angle-lines  cos θ = |d₁·d₂|/(|d₁||d₂|);  angle-planes  the same with the normals
 *   line-plane   sin θ = |d·n|/(|d||n|)
 *   skew         shortest distance |(P₂ − P₁)·(d₁ × d₂)|/|d₁ × d₂| (parallel lines: |(P₂ − P₁) × d|/|d|)
 */
import { EngineError } from '../numeric/steps';
import { parse } from '../symbolic/tree';
import { valueTex, angleTex, degText } from '../symbolic/trig';

const V = (s, label) => {
  const parts = String(s ?? '').replace(/[()[\]⟨⟩]/g, '').split(/[,;]|\s+(?=[-+]?\d)/).map((x) => x.trim()).filter(Boolean);
  if (parts.length !== 3) throw new EngineError(`${label}: give three numbers, e.g. 1, -2, 3.`);
  return parts.map((p) => { let v; try { v = parse(p, label).evaluate(); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: "${p}" is not a number.`); return v; });
};
/** a x + b y + c z = d from text such as 2x + y - 2z = 5. */
function readPlane(s, label = 'The plane') {
  const [l, r = '0'] = String(s ?? '').split('=');
  if (!l.trim()) throw new EngineError(`${label} is empty. Write it like 2x + y - 2z = 5.`);
  let node;
  try { node = parse(`(${l}) - (${r})`.replace(/(\d)\s*([xyz])/g, '$1*$2'), label); } catch { throw new EngineError(`${label}: write it like 2x + y - 2z = 5.`); }
  const at = (x, y, z) => node.evaluate({ x, y, z });
  const k = -at(0, 0, 0);
  const n = [at(1, 0, 0) + k, at(0, 1, 0) + k, at(0, 0, 1) + k];
  if (Math.abs(at(2, -3, 5) - (2 * n[0] - 3 * n[1] + 5 * n[2] - k)) > 1e-9) throw new EngineError(`${label} must be linear: ax + by + cz = d.`);
  if (n.every((v) => Math.abs(v) < 1e-12)) throw new EngineError(`${label} needs at least one of x, y, z.`);
  return { n, d: k };
}
const sub = (p, q) => p.map((v, i) => v - q[i]);
const dot = (p, q) => p.reduce((s, v, i) => s + v * q[i], 0);
const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const len = (p) => Math.sqrt(dot(p, p));
const vt = (p) => `(${p.map(valueTex).join(', ')})`;
const coefTerm = (c, x, first) => (Math.abs(c) < 1e-12 ? '' : `${c < 0 ? '-' : first ? '' : '+'} ${Math.abs(c) === 1 ? '' : valueTex(Math.abs(c))}${x} `);
const planeTex = (n, d) => `${['x', 'y', 'z'].reduce((s, x, i) => s + coefTerm(n[i], x, s === ''), '').trim()} = ${valueTex(d)}`;
const frac = (x, x0, a) => `\\frac{${x}${Math.abs(x0) < 1e-12 ? '' : x0 > 0 ? ` - ${valueTex(x0)}` : ` + ${valueTex(-x0)}`}}{${valueTex(a)}}`;
const ang = (a) => `${angleTex(a)}${/pi|^0$/.test(angleTex(a)) ? '' : ' \\text{ rad}'} \\ (${degText(a).replace('°', '^\\circ')})`;
const acosSafe = (c) => Math.acos(Math.max(-1, Math.min(1, c)));

export function solve({ mode = 'dc', p = '', q = '', s = '', d1 = '', d2 = '', plane = '', plane2 = '' }) {
  const steps = [];
  let answer, value = null;
  if (mode === 'dc' || mode === 'line') {
    const P = V(p, 'Point P'), Q = V(q, 'Point Q');
    const d = sub(Q, P), L = len(d);
    if (L < 1e-12) throw new EngineError('P and Q must be different points.');
    steps.push({ title: 'Direction ratios', formula: '\\vec{PQ} = (x_2 - x_1, \\ y_2 - y_1, \\ z_2 - z_1)', depth: 0, lines: [`\\vec{PQ} = ${vt(d)}`] });
    if (mode === 'dc') {
      const lmn = d.map((v) => v / L);
      steps.push({ title: 'Direction cosines', formula: 'l, m, n = \\frac{a, b, c}{\\sqrt{a^2 + b^2 + c^2}}', depth: 0, lines: [`|\\vec{PQ}| = \\sqrt{${d.map((v) => (v < 0 ? `(${valueTex(v)})^2` : `${valueTex(v)}^2`)).join(' + ')}} = ${valueTex(L)}`, `l, m, n = ${vt(lmn)}`, `l^2 + m^2 + n^2 = ${valueTex(dot(lmn, lmn))} \\ \\checkmark`] });
      answer = `l, m, n = ${vt(lmn)}`; value = lmn;
    } else {
      const nz = d.map((v) => Math.abs(v) > 1e-12);
      steps.push({ title: 'Equation of the line', formula: '\\frac{x - x_1}{a} = \\frac{y - y_1}{b} = \\frac{z - z_1}{c}', depth: 0, lines: [nz.every(Boolean) ? `${frac('x', P[0], d[0])} = ${frac('y', P[1], d[1])} = ${frac('z', P[2], d[2])}` : `${frac('x', P[0], d[0])} = ${frac('y', P[1], d[1])} = ${frac('z', P[2], d[2])} \\ \\text{(a 0 below means that coordinate is fixed)}`, `\\vec r = ${vt(P)} + \\lambda ${vt(d)}`] });
      answer = `\\vec r = ${vt(P)} + \\lambda ${vt(d)}`; value = d;
    }
  } else if (mode === 'plane') {
    const P = V(p, 'Point P'), Q = V(q, 'Point Q'), S = V(s, 'Point S');
    const u = sub(Q, P), w = sub(S, P), n = cross(u, w);
    if (len(n) < 1e-12) throw new EngineError('The three points are on one line, so they do not fix a plane.');
    const dd = dot(n, P);
    steps.push({ title: 'Two directions in the plane', depth: 0, lines: [`\\vec{PQ} = ${vt(u)}, \\quad \\vec{PS} = ${vt(w)}`] });
    steps.push({ title: 'Normal', formula: '\\vec n = \\vec{PQ} \\times \\vec{PS}', depth: 0, lines: [`\\vec n = \\begin{vmatrix} \\hat i & \\hat j & \\hat k \\\\ ${u.map(valueTex).join(' & ')} \\\\ ${w.map(valueTex).join(' & ')} \\end{vmatrix} = ${vt(n)}`] });
    steps.push({ title: 'Equation', formula: '\\vec n \\cdot (\\vec r - \\vec P) = 0', depth: 0, lines: [planeTex(n, dd)] });
    answer = planeTex(n, dd); value = [...n, dd];
  } else if (mode === 'point-plane') {
    const P = V(p, 'Point P');
    const { n, d } = readPlane(plane);
    const top = dot(n, P) - d, dist = Math.abs(top) / len(n);
    steps.push({ title: 'Distance from a point to a plane', formula: 'D = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}', depth: 0, lines: [`D = \\frac{|${valueTex(dot(n, P))} - ${valueTex(d)}|}{\\sqrt{${valueTex(dot(n, n))}}} = \\frac{${valueTex(Math.abs(top))}}{${valueTex(len(n))}} = ${valueTex(dist)}`] });
    const foot = P.map((v, i) => v - (top / dot(n, n)) * n[i]);
    steps.push({ title: 'Foot of the perpendicular', formula: '\\vec F = \\vec P - \\frac{\\vec n \\cdot \\vec P - d}{|\\vec n|^2}\\vec n', depth: 1, lines: [`F = ${vt(foot)}`] });
    answer = `D = ${valueTex(dist)}`; value = dist;
  } else if (mode === 'angle-lines' || mode === 'angle-planes') {
    const lines2 = mode === 'angle-lines';
    const a = lines2 ? V(d1, 'Direction 1') : readPlane(plane, 'Plane 1').n;
    const b = lines2 ? V(d2, 'Direction 2') : readPlane(plane2, 'Plane 2').n;
    if (len(a) < 1e-12 || len(b) < 1e-12) throw new EngineError('A direction cannot be (0, 0, 0).');
    const c = Math.abs(dot(a, b)) / (len(a) * len(b));
    const th = acosSafe(c);
    steps.push({ title: lines2 ? 'Angle between two lines' : 'Angle between two planes (their normals)', formula: '\\cos\\theta = \\frac{|\\vec a \\cdot \\vec b|}{|\\vec a||\\vec b|}', depth: 0, lines: [`${lines2 ? '' : `\\vec n_1 = ${vt(a)}, \\ \\vec n_2 = ${vt(b)}, \\quad `}\\cos\\theta = \\frac{|${valueTex(dot(a, b))}|}{${valueTex(len(a))} \\cdot ${valueTex(len(b))}} = ${valueTex(c)}`, `\\theta = ${ang(th)}`] });
    if (Math.abs(c) < 1e-12) steps.push({ title: 'Perpendicular', depth: 1, lines: ['\\vec a \\cdot \\vec b = 0'] });
    answer = `\\theta = ${ang(th)}`; value = th;
  } else if (mode === 'line-plane') {
    const a = V(d1, 'Direction of the line');
    const { n } = readPlane(plane);
    const sn = Math.abs(dot(a, n)) / (len(a) * len(n));
    const th = Math.asin(Math.min(1, sn));
    steps.push({ title: 'Angle between a line and a plane', formula: '\\sin\\theta = \\frac{|\\vec d \\cdot \\vec n|}{|\\vec d||\\vec n|}', depth: 0, lines: [`\\vec n = ${vt(n)}, \\quad \\sin\\theta = \\frac{|${valueTex(dot(a, n))}|}{${valueTex(len(a))} \\cdot ${valueTex(len(n))}} = ${valueTex(sn)}`, `\\theta = ${ang(th)}`] });
    answer = `\\theta = ${ang(th)}`; value = th;
  } else if (mode === 'skew') {
    const P1 = V(p, 'Point on line 1'), A = V(d1, 'Direction of line 1'), P2 = V(q, 'Point on line 2'), B = V(d2, 'Direction of line 2');
    const w = sub(P2, P1), c = cross(A, B);
    if (len(c) < 1e-12) {
      const dist = len(cross(w, A)) / len(A);
      steps.push({ title: 'The lines are parallel', formula: 'D = \\frac{|(\\vec P_2 - \\vec P_1) \\times \\vec d|}{|\\vec d|}', depth: 0, lines: [`D = \\frac{${valueTex(len(cross(w, A)))}}{${valueTex(len(A))}} = ${valueTex(dist)}`] });
      answer = `D = ${valueTex(dist)}`; value = dist;
    } else {
      const dist = Math.abs(dot(w, c)) / len(c);
      steps.push({ title: 'Cross product of the directions', formula: '\\vec d_1 \\times \\vec d_2', depth: 0, lines: [`${vt(A)} \\times ${vt(B)} = ${vt(c)}, \\quad |\\vec d_1 \\times \\vec d_2| = ${valueTex(len(c))}`] });
      steps.push({ title: 'Shortest distance', formula: 'D = \\frac{|(\\vec P_2 - \\vec P_1) \\cdot (\\vec d_1 \\times \\vec d_2)|}{|\\vec d_1 \\times \\vec d_2|}', depth: 0, lines: [`\\vec P_2 - \\vec P_1 = ${vt(w)}`, `D = \\frac{|${valueTex(dot(w, c))}|}{${valueTex(len(c))}} = ${valueTex(dist)}`] });
      if (dist < 1e-12) steps.push({ title: 'The lines meet', depth: 1, lines: ['D = 0: \\text{ the lines intersect.}'] });
      answer = `D = ${valueTex(dist)}`; value = dist;
    }
  } else throw new EngineError('Choose what to work out.');
  return { answer, value, steps, notes: [], verified: true, result: value };
}
