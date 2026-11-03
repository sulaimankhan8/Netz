/**
 * Coordinate geometry: the maths for /coordinate-geometry. Every mode returns working lines and plot data
 * (points, segments, full lines) for the page's graph.
 */
import { EngineError } from '../numeric/steps';
import { parseNumber } from '../numeric/fraction';
import { n, nb, q, sqrtTex, toDeg } from '../numeric/geometry';

export const MODES = [
  { id: 'distance', label: 'Distance', points: 2 },
  { id: 'midpoint', label: 'Midpoint', points: 2 },
  { id: 'section', label: 'Section formula', points: 2 },
  { id: 'slope', label: 'Slope', points: 2 },
  { id: 'line', label: 'Equation of a line', points: 2 },
  { id: 'angle', label: 'Angle between lines', points: 0 },
  { id: 'point-line', label: 'Point to line distance', points: 1 },
  { id: 'triangle', label: 'Area of a triangle', points: 3 },
];

const num = (text, where) => {
  const v = parseNumber(text);
  if (!String(text ?? '').trim()) throw new EngineError(`${where} is empty.`);
  if (!Number.isFinite(v)) throw new EngineError(`${where}: "${String(text).trim()}" is not a number.`);
  return v;
};
const point = (p, name) => ({ x: num(p?.x, `${name}: x`), y: num(p?.y, `${name}: y`), label: name });
const pt = (P) => `(${q(P.x)}, ${q(P.y)})`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

/** ax + by + c = 0 as LaTeX, dropping 1s and zero terms. */
export function generalTex(a, b, c) {
  const term = (k, v, first) => {
    if (Math.abs(k) < 1e-12) return '';
    const sign = k < 0 ? '-' : first ? '' : '+';
    const mag = Math.abs(k);
    const coef = v && Math.abs(mag - 1) < 1e-12 ? '' : q(mag);
    return `${first ? sign : ` ${sign} `}${coef}${v}`;
  };
  let s = term(a, 'x', true);
  s += term(b, 'y', !s);
  s += term(c, '', !s);
  return `${s || '0'} = 0`;
}

/** y = mx + c as LaTeX: y = 3x - 1, y = -x, y = 4. */
export function slopeInterceptTex(m, c) {
  const flat = Math.abs(m) < 1e-12;
  const mx = flat ? '' : q(m) === '1' ? 'x' : q(m) === '-1' ? '-x' : `${q(m)}x`;
  if (flat) return `y = ${q(c)}`;
  if (Math.abs(c) < 1e-12) return `y = ${mx}`;
  return `y = ${mx} ${c < 0 ? '-' : '+'} ${q(Math.abs(c))}`;
}

/** Integer coefficients when the inputs allow it, with a ≥ 0 (textbook style). */
function tidy(a, b, c) {
  const ints = [a, b, c].every((v) => Math.abs(v - Math.round(v)) < 1e-9);
  if (ints) {
    [a, b, c] = [a, b, c].map(Math.round);
    const g = gcd(gcd(a, b), c) || 1;
    [a, b, c] = [a / g, b / g, c / g];
  }
  if (a < 0 || (a === 0 && b < 0)) [a, b, c] = [-a, -b, -c];
  return [a, b, c];
}

export function solve({ mode, p1, p2, p3, m, n: nRatio, external = false, m1, m2, a, b, c }) {
  const plot = { points: [], segments: [], lines: [] };
  const done = (result, lines, extra = {}) => ({ mode, result, lines, plot, ...extra, steps: { headers: [], rows: [] }, notes: [] });

  switch (mode) {
    case 'distance': {
      const A = point(p1, 'A'), B = point(p2, 'B');
      const dx = B.x - A.x, dy = B.y - A.y, sq = dx * dx + dy * dy, d = Math.sqrt(sq);
      plot.points.push(A, B); plot.segments.push([A, B]);
      const exact = sqrtTex(sq);
      return done(d, [
        'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        `d = \\sqrt{(${q(B.x)} - ${nb(A.x)})^2 + (${q(B.y)} - ${nb(A.y)})^2} = \\sqrt{${nb(dx)}^2 + ${nb(dy)}^2}`,
        `d = \\sqrt{${n(sq)}}${exact && exact !== n(d) ? ` = ${exact}` : ''} \\approx ${n(d)}`,
      ]);
    }
    case 'midpoint': {
      const A = point(p1, 'A'), B = point(p2, 'B');
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, label: 'M' };
      plot.points.push(A, B, M); plot.segments.push([A, B]);
      return done(M, [
        'M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)',
        `M = \\left(\\frac{${q(A.x)} + ${nb(B.x)}}{2}, \\frac{${q(A.y)} + ${nb(B.y)}}{2}\\right) = ${pt(M)}`,
      ]);
    }
    case 'section': {
      const A = point(p1, 'A'), B = point(p2, 'B');
      const mm = num(m, 'Ratio m'), nn = num(nRatio, 'Ratio n');
      if (!(mm > 0 && nn > 0)) throw new EngineError('The ratio m : n needs two positive numbers.');
      if (external && Math.abs(mm - nn) < 1e-12) throw new EngineError('External division needs m ≠ n (the point would be at infinity).');
      const s = external ? -1 : 1;
      const denom = mm + s * nn;
      const P = { x: (mm * B.x + s * nn * A.x) / denom, y: (mm * B.y + s * nn * A.y) / denom, label: 'P' };
      plot.points.push(A, B, P); plot.segments.push(external ? [A, P] : [A, B], ...(external ? [[B, P]] : []));
      const op = external ? '-' : '+';
      return done(P, [
        `P = \\left(\\frac{m x_2 ${op} n x_1}{m ${op} n}, \\frac{m y_2 ${op} n y_1}{m ${op} n}\\right)${external ? '\\ \\text{(external)}' : '\\ \\text{(internal)}'}`,
        `P = \\left(\\frac{${q(mm)} \\times ${nb(B.x)} ${op} ${q(nn)} \\times ${nb(A.x)}}{${q(mm)} ${op} ${q(nn)}}, \\frac{${q(mm)} \\times ${nb(B.y)} ${op} ${q(nn)} \\times ${nb(A.y)}}{${q(mm)} ${op} ${q(nn)}}\\right)`,
        `P = ${pt(P)}`,
      ]);
    }
    case 'slope': {
      const A = point(p1, 'A'), B = point(p2, 'B');
      plot.points.push(A, B); plot.lines.push(lineThrough(A, B));
      if (Math.abs(B.x - A.x) < 1e-12) {
        if (Math.abs(B.y - A.y) < 1e-12) throw new EngineError('A and B are the same point, so there is no line through them.');
        return done(null, ['m = \\frac{y_2 - y_1}{x_2 - x_1}', `m = \\frac{${n(B.y - A.y)}}{0}`, '\\text{The line is vertical: its slope is undefined.}'], { vertical: true });
      }
      const slope = (B.y - A.y) / (B.x - A.x);
      return done(slope, [
        'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        `m = \\frac{${q(B.y)} - ${nb(A.y)}}{${q(B.x)} - ${nb(A.x)}} = \\frac{${q(B.y - A.y)}}{${q(B.x - A.x)}} = ${q(slope)}`,
        `\\text{Angle with the x-axis: } \\tan^{-1}(${q(slope)}) = ${n(toDeg(Math.atan(slope)), 5)}^\\circ`,
      ], { angle: toDeg(Math.atan(slope)) });
    }
    case 'line': {
      const A = point(p1, 'A'), B = point(p2, 'B');
      if (Math.abs(B.x - A.x) < 1e-12 && Math.abs(B.y - A.y) < 1e-12) throw new EngineError('A and B are the same point: give two different points.');
      plot.points.push(A, B);
      const [ga, gb, gc] = tidy(B.y - A.y, A.x - B.x, B.x * A.y - A.x * B.y);
      plot.lines.push({ a: ga, b: gb, c: gc });
      if (Math.abs(B.x - A.x) < 1e-12) {
        return done({ a: ga, b: gb, c: gc }, [`\\text{Both points have } x = ${q(A.x)}, \\text{ so the line is vertical:}`, `x = ${q(A.x)}`, `\\text{General form: } ${generalTex(ga, gb, gc)}`], { vertical: true });
      }
      const slope = (B.y - A.y) / (B.x - A.x);
      const icpt = A.y - slope * A.x;
      return done({ a: ga, b: gb, c: gc, slope, intercept: icpt }, [
        `m = \\frac{${q(B.y)} - ${nb(A.y)}}{${q(B.x)} - ${nb(A.x)}} = ${q(slope)}`,
        `\\text{Point-slope: } y - ${nb(A.y)} = ${q(slope)}(x - ${nb(A.x)})`,
        `\\text{Slope-intercept: } ${slopeInterceptTex(slope, icpt)}`,
        `\\text{General form: } ${generalTex(ga, gb, gc)}`,
      ]);
    }
    case 'angle': {
      const s1 = num(m1, 'Slope m₁'), s2 = num(m2, 'Slope m₂');
      plot.lines.push({ a: -s1, b: 1, c: 0 }, { a: -s2, b: 1, c: 0 });
      const den = 1 + s1 * s2;
      if (Math.abs(s1 - s2) < 1e-12) return done(0, ['m_1 = m_2 \\Rightarrow \\text{the lines are parallel: the angle is } 0^\\circ'], { parallel: true });
      if (Math.abs(den) < 1e-12) return done(90, ['\\tan\\theta = \\left|\\frac{m_1 - m_2}{1 + m_1 m_2}\\right|', `1 + m_1 m_2 = 1 + (${q(s1)})(${q(s2)}) = 0`, '\\Rightarrow \\theta = 90^\\circ \\text{ (the lines are perpendicular)}'], { perpendicular: true });
      const tanT = Math.abs((s1 - s2) / den);
      const theta = toDeg(Math.atan(tanT));
      return done(theta, [
        '\\tan\\theta = \\left|\\frac{m_1 - m_2}{1 + m_1 m_2}\\right|',
        `\\tan\\theta = \\left|\\frac{${q(s1)} - ${nb(s2)}}{1 + (${q(s1)})(${q(s2)})}\\right| = ${q(tanT)}`,
        `\\theta = \\tan^{-1}(${q(tanT)}) = ${n(theta, 5)}^\\circ \\quad (\\text{the other angle is } ${n(180 - theta, 5)}^\\circ)`,
      ]);
    }
    case 'point-line': {
      const P = point(p1, 'P');
      const la = num(a, 'a'), lb = num(b, 'b'), lc = num(c, 'c');
      if (Math.abs(la) < 1e-12 && Math.abs(lb) < 1e-12) throw new EngineError('a and b can\'t both be 0: that is not a line.');
      plot.points.push(P); plot.lines.push({ a: la, b: lb, c: lc });
      const top = la * P.x + lb * P.y + lc, bottom = Math.sqrt(la * la + lb * lb), d = Math.abs(top) / bottom;
      // Foot of the perpendicular, for the drawing
      const k = top / (la * la + lb * lb);
      const F = { x: P.x - la * k, y: P.y - lb * k, label: 'F' };
      plot.points.push(F); plot.segments.push([P, F]);
      return done(d, [
        'd = \\frac{|a x_1 + b y_1 + c|}{\\sqrt{a^2 + b^2}}',
        `d = \\frac{|${q(la)} \\times ${nb(P.x)} + ${nb(lb)} \\times ${nb(P.y)} + ${nb(lc)}|}{\\sqrt{${nb(la)}^2 + ${nb(lb)}^2}} = \\frac{${q(Math.abs(top))}}{${sqrtTex(la * la + lb * lb) ?? n(bottom)}}`,
        `d \\approx ${n(d)}`,
      ]);
    }
    case 'triangle': {
      const A = point(p1, 'A'), B = point(p2, 'B'), C = point(p3, 'C');
      const inner = A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y);
      const area = Math.abs(inner) / 2;
      plot.points.push(A, B, C); plot.segments.push([A, B], [B, C], [C, A]);
      return done(area, [
        '\\text{Area} = \\tfrac{1}{2}\\left|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\\right|',
        `= \\tfrac{1}{2}\\left|${q(A.x)}(${q(B.y)} - ${nb(C.y)}) + ${nb(B.x)}(${q(C.y)} - ${nb(A.y)}) + ${nb(C.x)}(${q(A.y)} - ${nb(B.y)})\\right|`,
        `= \\tfrac{1}{2}\\left|${q(inner)}\\right| = ${q(area)}`,
        ...(area < 1e-12 ? ['\\text{The area is 0, so the three points lie on one line (collinear).}'] : []),
      ], { collinear: area < 1e-12 });
    }
    default:
      throw new EngineError('Choose what to work out.');
  }
}

/** The line through two points as { a, b, c } with ax + by + c = 0. */
function lineThrough(A, B) {
  return { a: B.y - A.y, b: A.x - B.x, c: B.x * A.y - A.x * B.y };
}
