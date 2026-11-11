/**
 * Code export for the Unit 9 geometry and trigonometry pages: area and perimeter, volume and surface area,
 * Pythagoras, the triangle solver, the unit circle, coordinate geometry, circles, conics, heights and
 * distances, inverse trig, 3D geometry and polar coordinates. `raw` is what the page passes to its engine.
 * Each page's own engine checks the inputs first, so the export accepts exactly what the page accepts.
 */

import { evaluate } from 'mathjs';
import { piChoice, parseAngle } from '../numeric/geometry.js';
import { parseNumber } from '../numeric/fraction.js';
import { solve as areaSolve, SHAPES_2D } from '../engines/area-perimeter.js';
import { solve as volumeSolve, SHAPES_3D } from '../engines/volume-surface-area.js';
import { solve as pythagorasSolve } from '../engines/pythagoras.js';
import { solve as triangleSolve } from '../engines/triangle-solver.js';
import { solve as coordSolve } from '../engines/coordinate-geometry.js';
import { solve as circleSolve, readQuadratic } from '../engines/circles.js';
import { solve as conicSolve } from '../engines/conics.js';
import { solve as heightsSolve } from '../engines/heights-distances.js';
import { solve as inverseTrigSolve } from '../engines/inverse-trig.js';
import { solve as solid3dSolve } from '../engines/geometry-3d.js';
import { solve as polarSolve } from '../engines/polar-coordinates.js';
import { D, S, FOR, IF, P, C, num, lit, fn, normal, cn, choice, ExportError } from './kit.js';

/* ---------------- helpers ---------------- */

/** Runs the page's engine on raw, so the export rejects the same inputs with the same message. */
function check(solve, raw) {
  try {
    return solve(raw);
  } catch (e) {
    throw new ExportError(e?.message || 'Please check the inputs.');
  }
}

/** A program that declares some numbers and prints formulas of them. */
const formulas = (title, about, inputs, outputs, pre = []) => ({
  title,
  about,
  body: [
    ...inputs.map(([name, v]) => D(name, 'num', typeof v === 'string' ? v : lit(v))),
    ...pre,
    ...outputs.map(([label, expr, p = 4]) => P(`${label} = `, num(expr, p))),
  ],
});

const numIn = (v, label) => {
  const x = parseNumber(String(v ?? '').trim());
  if (!Number.isFinite(x)) throw new ExportError(`Enter a number for ${label}.`);
  return x;
};

const PI_NOTE = (key) => (key === '3.14' ? 'pi taken as 3.14' : key === '22/7' ? 'pi taken as 22/7' : 'pi to full accuracy');
const piValue = (key) => (key === '3.14' || key === '22/7' ? lit(piChoice(key).value) : 'pi');

/** Three numbers typed as "1, 2, 3" (sqrt and fractions allowed). */
const point3 = (v, label) => {
  const parts = String(v ?? '').replace(/[()]/g, '').split(/[,;]+|\s+(?=[-+\d.])/).map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 3) throw new ExportError(`${label}: give three numbers, like 1, 2, 3.`);
  return parts.map((s) => cn(s, label));
};

/** A plane a x + b y + c z = d from text like 2x + y - 2z = 5. */
function plane(v, label) {
  const [l, r = '0'] = String(v ?? '').split('=');
  const expr = normal(`(${l}) - (${r})`, label);
  const at = (x, y, z) => Number(evaluate(expr, { x, y, z }));
  const k = -at(0, 0, 0);
  return { nrm: [at(1, 0, 0) + k, at(0, 1, 0) + k, at(0, 0, 1) + k], d: k };
}

const vec3 = (name, v) => D(name, 'vec', { vec: v });
const dot3 = (u, v) => `${u}[0] * ${v}[0] + ${u}[1] * ${v}[1] + ${u}[2] * ${v}[2]`;
const len3 = (u) => `sqrt(${dot3(u, u)})`;
const cross3 = (u, v, into) => [
  D(into, 'vec', { zeros: 3 }),
  S(`${into}[0]`, `${u}[1] * ${v}[2] - ${u}[2] * ${v}[1]`),
  S(`${into}[1]`, `${u}[2] * ${v}[0] - ${u}[0] * ${v}[2]`),
  S(`${into}[2]`, `${u}[0] * ${v}[1] - ${u}[1] * ${v}[0]`),
];

/* ---------------- shape formulas (inputs are the engine's keys) ---------------- */

const AREA = {
  square: [['Area', 'a * a'], ['Perimeter', '4 * a'], ['Diagonal', 'a * sqrt(2)']],
  rectangle: [['Area', 'l * b'], ['Perimeter', '2 * (l + b)'], ['Diagonal', 'sqrt(l * l + b * b)']],
  'triangle-bh': [['Area', 'b * h / 2']],
  'triangle-sss': [['Perimeter', 'a + b + c'], ["Area (Heron's formula)", 'sqrt(s * (s - a) * (s - b) * (s - c))']],
  circle: [['Area', 'piv * r * r'], ['Circumference', '2 * piv * r'], ['Diameter', '2 * r']],
  sector: [['Area of sector', 'theta / 360 * piv * r * r'], ['Arc length', 'theta / 360 * 2 * piv * r'], ['Perimeter of sector', '2 * r + theta / 360 * 2 * piv * r']],
  trapezium: [['Area', '(a + b) * h / 2']],
  parallelogram: [['Area', 'b * h']],
  rhombus: [['Area', 'd1 * d2 / 2'], ['Side', 'sqrt(d1 * d1 / 4 + d2 * d2 / 4)'], ['Perimeter', '4 * sqrt(d1 * d1 / 4 + d2 * d2 / 4)']],
  polygon: [['Perimeter', 'sides * s'], ['Area', 'sides * s * s / (4 * tan(pi / sides))'], ['Apothem (centre to side)', 's / (2 * tan(pi / sides))'], ['Interior angle (degrees)', '(sides - 2) * 180 / sides']],
  ellipse: [['Area', 'piv * a * b'], ["Perimeter (Ramanujan's approximation)", 'piv * (3 * (a + b) - sqrt((3 * a + b) * (a + 3 * b)))']],
};
const VOLUME = {
  cube: [['Volume', 'a * a * a'], ['Lateral surface area', '4 * a * a'], ['Total surface area', '6 * a * a'], ['Diagonal', 'a * sqrt(3)']],
  cuboid: [['Volume', 'l * b * h'], ['Lateral surface area', '2 * h * (l + b)'], ['Total surface area', '2 * (l * b + b * h + h * l)'], ['Diagonal', 'sqrt(l * l + b * b + h * h)']],
  cylinder: [['Volume', 'piv * r * r * h'], ['Curved surface area', '2 * piv * r * h'], ['Total surface area', '2 * piv * r * (r + h)']],
  cone: [['Slant height', 'sl'], ['Volume', 'piv * r * r * h / 3'], ['Curved surface area', 'piv * r * sl'], ['Total surface area', 'piv * r * (sl + r)']],
  frustum: [['Slant height', 'sl'], ['Volume', 'piv * h * (R * R + R * r + r * r) / 3'], ['Curved surface area', 'piv * (R + r) * sl'], ['Total surface area', 'piv * ((R + r) * sl + R * R + r * r)']],
  sphere: [['Volume', '4 / 3 * piv * r * r * r'], ['Surface area', '4 * piv * r * r']],
  hemisphere: [['Volume', '2 / 3 * piv * r * r * r'], ['Curved surface area', '2 * piv * r * r'], ['Total surface area', '3 * piv * r * r']],
  prism: [['Volume', 'B * h'], ['Lateral surface area', 'P * h'], ['Total surface area', 'P * h + 2 * B']],
  pyramid: [['Slant height', 'sl'], ['Volume', 'a * a * h / 3'], ['Lateral surface area', '2 * a * sl'], ['Total surface area', 'a * a + 2 * a * sl']],
};
const SLANT = { cone: 'sqrt(r * r + h * h)', frustum: 'sqrt(h * h + (R - r) * (R - r))', pyramid: 'sqrt(h * h + a * a / 4)' };

function shapeExport(kind) {
  const table = kind === 'area' ? AREA : VOLUME;
  const solve = kind === 'area' ? areaSolve : volumeSolve;
  return {
    name: kind === 'area' ? 'Area and perimeter' : 'Volume and surface area',
    clean: (raw) => {
      check(solve, raw);
      if (!table[raw.shape]) throw new ExportError('Choose a shape.');
      const shape = (kind === 'area' ? SHAPES_2D : SHAPES_3D).find((x) => x.id === raw.shape);
      // Only this shape's own boxes: the page keeps the other shapes' values too
      const values = Object.fromEntries(shape.inputs.map((inp) => [inp.key, raw.values?.[inp.key]]).filter(([, v]) => String(v ?? '').trim() !== '').map(([k, v]) => [k, numIn(v, k)]));
      return { shape: raw.shape, values, pi: raw.pi || 'exact' };
    },
    program: (p) => {
      const outs = [...table[p.shape]];
      const v = p.values;
      if (p.shape === 'trapezium' && v.c && v.d) outs.push(['Perimeter', 'a + b + c + d']);
      if (p.shape === 'parallelogram' && v.s) outs.push(['Perimeter', '2 * (b + s)']);
      const usesPi = outs.some(([, e]) => e.includes('piv'));
      const inputs = Object.entries(v).map(([k, x]) => [k, x]);
      return formulas(
        `${kind === 'area' ? 'Area and perimeter' : 'Volume and surface area'}: ${p.shape.replace(/-/g, ' ')}`,
        usesPi ? [PI_NOTE(p.pi)] : [],
        [...inputs, ...(usesPi ? [['piv', piValue(p.pi)]] : [])],
        outs,
        [
          ...(p.shape === 'triangle-sss' ? [D('s', 'num', '(a + b + c) / 2')] : []),
          ...(SLANT[p.shape] ? [D('sl', 'num', SLANT[p.shape])] : []),
        ],
      );
    },
  };
}

/* ---------------- programs ---------------- */

export const EXPORTS = {
  'area-perimeter': shapeExport('area'),
  'volume-surface-area': shapeExport('volume'),

  pythagoras: {
    name: 'Pythagoras theorem',
    clean: (raw) => {
      check(pythagorasSolve, raw);
      const get = (k) => (String(raw[k] ?? '').trim() ? numIn(raw[k], k) : null);
      return { a: get('a'), b: get('b'), c: get('c') };
    },
    program: (p) => {
      if (p.a !== null && p.b !== null && p.c !== null) {
        return {
          title: 'Is it a right triangle? (a^2 + b^2 = c^2)',
          body: [
            D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('c', 'num', lit(p.c)),
            P('a^2 + b^2 = ', num('a * a + b * b', 4), ', c^2 = ', num('c * c', 4)),
            IF('abs(a * a + b * b - c * c) <= 1e-9 * max(1, c * c)', [P('Yes: it is a right triangle (the right angle is opposite c).')],
              [IF('a * a + b * b < c * c', [P('No: the angle opposite c is obtuse.')], [P('No: the angle opposite c is acute.')])]),
          ],
        };
      }
      const find = p.c === null ? 'c' : p.a === null ? 'a' : 'b';
      return {
        title: `Pythagoras theorem: find ${find === 'c' ? 'the hypotenuse c' : `side ${find}`}`,
        about: ['a^2 + b^2 = c^2, with c the hypotenuse'],
        body: [
          ...['a', 'b', 'c'].filter((k) => k !== find).map((k) => D(k, 'num', lit(p[k]))),
          D(find, 'num', find === 'c' ? 'sqrt(a * a + b * b)' : `sqrt(c * c - ${find === 'a' ? 'b * b' : 'a * a'})`),
          P(`${find} = `, num(find, 6)),
          D('A', 'num', 'asin(a / c) * 180 / pi'),
          P('Angle A = ', num('A', 4), ' degrees, angle B = ', num('90 - A', 4), ' degrees'),
          P('Area = ', num('a * b / 2', 4), ', perimeter = ', num('a + b + c', 4)),
        ],
      };
    },
  },

  'triangle-solver': {
    name: 'Triangle solver',
    clean: (raw) => {
      check(triangleSolve, raw);
      const mode = choice(raw.mode, ['SSS', 'SAS', 'ASA', 'AAS', 'SSA']);
      const keys = { SSS: ['a', 'b', 'c'], SAS: ['b', 'c', 'A'], ASA: ['A', 'B', 'c'], AAS: ['A', 'B', 'a'], SSA: ['a', 'b', 'A'] }[mode];
      return { mode, v: Object.fromEntries(keys.map((k) => [k, numIn(raw.values?.[k], k)])) };
    },
    program: (p) => {
      const rad = (d) => `${d} * pi / 180`;
      const finish = [
        P('a = ', num('a', 4), ', b = ', num('b', 4), ', c = ', num('c', 4)),
        P('A = ', num('A', 4), ', B = ', num('B', 4), ', C = ', num('C', 4), ' (degrees)'),
        P('Area = ', num(`0.5 * b * c * sin(${rad('A')})`, 4), ', perimeter = ', num('a + b + c', 4)),
      ];
      const given = Object.entries(p.v).map(([k, x]) => D(k, 'num', lit(x)));
      const body = {
        SSS: [D('A', 'num', `acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / pi`), D('B', 'num', 'acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / pi'), D('C', 'num', '180 - A - B'), ...finish],
        SAS: [D('a', 'num', `sqrt(b * b + c * c - 2 * b * c * cos(${rad('A')}))`), D('B', 'num', 'acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / pi'), D('C', 'num', '180 - A - B'), ...finish],
        ASA: [D('C', 'num', '180 - A - B'), D('k', 'num', `c / sin(${rad('C')})`), D('a', 'num', `k * sin(${rad('A')})`), D('b', 'num', `k * sin(${rad('B')})`), ...finish],
        AAS: [D('C', 'num', '180 - A - B'), D('k', 'num', `a / sin(${rad('A')})`), D('b', 'num', `k * sin(${rad('B')})`), D('c', 'num', `k * sin(${rad('C')})`), ...finish],
        SSA: [
          C('The ambiguous case: sin B = b sin A / a can give one, two or no triangles'),
          D('sinB', 'num', `b * sin(${rad('A')}) / a`),
          IF('sinB > 1 + 1e-12', [P('No triangle: b sin A is longer than a.')], [
            D('B1', 'num', 'asin(min(1, sinB)) * 180 / pi'),
            D('count', 'num', '0'),
            FOR('t', 0, 2, [
              D('B', 'num', 'B1'),
              IF('t == 1', [S('B', '180 - B1')]),
              IF('A + B < 180 - 1e-9 and (t == 0 or abs(B - B1) > 1e-9)', [
                S('count', 'count + 1'),
                D('C', 'num', '180 - A - B'),
                D('c', 'num', `a * sin(${rad('C')}) / sin(${rad('A')})`),
                P('Triangle ', num('count', 0), ':'),
                ...finish,
              ]),
            ]),
          ]),
        ],
      }[p.mode];
      return { title: `Triangle solver (${p.mode})`, about: ['Law of cosines: a^2 = b^2 + c^2 - 2bc cos A; law of sines: a / sin A = b / sin B = c / sin C'], body: [...given, ...body] };
    },
  },

  'unit-circle': {
    name: 'Unit circle',
    clean: (raw) => {
      let deg;
      try {
        deg = parseAngle(raw.angle, raw.unit === 'rad' ? 'rad' : 'deg');
      } catch (e) {
        throw new ExportError(e?.message || 'Enter an angle.');
      }
      return { deg };
    },
    program: (p) => ({
      title: 'Unit circle: sin, cos and tan of an angle',
      about: ['The point at angle t on the unit circle is (cos t, sin t); tan t = sin t / cos t'],
      body: [
        D('deg', 'num', lit(p.deg)),
        D('t', 'num', 'deg - 360 * floor(deg / 360)'),
        D('rad', 'num', 't * pi / 180'),
        D('s', 'num', 'sin(rad)'), D('c', 'num', 'cos(rad)'),
        IF('abs(s) < 1e-12', [S('s', '0')]), IF('abs(c) < 1e-12', [S('c', '0')]),
        P('Angle ', num('deg', 4), ' degrees is ', num('t', 4), ' degrees on the circle (', num('rad', 6), ' radians)'),
        D('ref', 'num', 't'),
        IF('t > 90 and t <= 180', [S('ref', '180 - t')]), IF('t > 180 and t <= 270', [S('ref', 't - 180')]), IF('t > 270', [S('ref', '360 - t')]),
        P('Reference angle = ', num('ref', 4), ' degrees'),
        P('sin = ', num('s', 6), ', cos = ', num('c', 6)),
        IF('c == 0', [P('tan is undefined (cos = 0)')], [P('tan = ', num('s / c', 6))]),
      ],
    }),
  },

  'coordinate-geometry': {
    name: 'Coordinate geometry',
    clean: (raw) => {
      check(coordSolve, raw);
      const pt = (q, label) => [numIn(q?.x, `${label} x`), numIn(q?.y, `${label} y`)];
      const mode = raw.mode;
      const out = {
        mode,
        A: mode === 'angle' ? null : pt(raw.p1, mode === 'point-line' ? 'P' : 'A'),
        B: ['distance', 'midpoint', 'section', 'slope', 'line', 'triangle'].includes(mode) ? pt(raw.p2, 'B') : null,
        Cp: mode === 'triangle' ? pt(raw.p3, 'C') : null,
      };
      if (raw.mode === 'section') Object.assign(out, { m: numIn(raw.m, 'm'), nr: numIn(raw.n, 'n'), external: !!raw.external });
      if (raw.mode === 'angle') Object.assign(out, { m1: numIn(raw.m1, 'm1'), m2: numIn(raw.m2, 'm2') });
      if (raw.mode === 'point-line') Object.assign(out, { a: numIn(raw.a, 'a'), b: numIn(raw.b, 'b'), c: numIn(raw.c, 'c') });
      return out;
    },
    program: (p) => {
      const pts = [
        ...(p.A ? [D('x1', 'num', lit(p.A[0])), D('y1', 'num', lit(p.A[1]))] : []),
        ...(p.B ? [D('x2', 'num', lit(p.B[0])), D('y2', 'num', lit(p.B[1]))] : []),
        ...(p.Cp ? [D('x3', 'num', lit(p.Cp[0])), D('y3', 'num', lit(p.Cp[1]))] : []),
      ];
      const body = {
        distance: [P('Distance AB = ', num('sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))', 6))],
        midpoint: [P('Midpoint = (', num('(x1 + x2) / 2', 4), ', ', num('(y1 + y2) / 2', 4), ')')],
        section: [D('m', 'num', lit(p.m)), D('nr', 'num', lit(p.external ? -p.nr : p.nr)),
          P(`Point dividing AB ${p.external ? 'externally' : 'internally'} in ${lit(p.m)} : ${lit(p.nr)} = (`, num('(m * x2 + nr * x1) / (m + nr)', 4), ', ', num('(m * y2 + nr * y1) / (m + nr)', 4), ')')],
        slope: [IF('abs(x2 - x1) < 1e-12', [P('The line is vertical: the slope is undefined.')], [
          D('m', 'num', '(y2 - y1) / (x2 - x1)'), P('Slope = ', num('m', 6), ', angle with the x-axis = ', num('atan(m) * 180 / pi', 4), ' degrees')])],
        line: [
          P('Line through A and B: (', num('y2 - y1', 4), ') x + (', num('x1 - x2', 4), ') y + (', num('x2 * y1 - x1 * y2', 4), ') = 0'),
          IF('abs(x2 - x1) > 1e-12', [D('m', 'num', '(y2 - y1) / (x2 - x1)'), P('y = ', num('m', 4), ' x + ', num('y1 - m * x1', 4))]),
        ],
        angle: [D('m1', 'num', lit(p.m1)), D('m2', 'num', lit(p.m2)),
          IF('abs(1 + m1 * m2) < 1e-12', [P('The lines are perpendicular: the angle is 90 degrees.')], [P('Acute angle between the lines = ', num('atan(abs((m1 - m2) / (1 + m1 * m2))) * 180 / pi', 4), ' degrees')])],
        'point-line': [D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('c', 'num', lit(p.c)),
          P('Distance from the point to the line = ', num('abs(a * x1 + b * y1 + c) / sqrt(a * a + b * b)', 6))],
        triangle: [P('Area = ', num('abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2', 4))],
      }[p.mode];
      return { title: `Coordinate geometry: ${p.mode.replace('-', ' ')}`, body: [...pts, ...body] };
    },
  },

  circles: {
    name: 'Circle equations',
    clean: (raw) => {
      check(circleSolve, raw);
      const from = choice(raw.from, ['centre', 'general', 'three', 'diameter']);
      const out = { from };
      if (from === 'centre') Object.assign(out, { h: cn(raw.h, 'h'), k: cn(raw.k, 'k'), r: cn(raw.r, 'r') });
      if (from === 'diameter') out.pts = [[cn(raw.x1, 'x1'), cn(raw.y1, 'y1')], [cn(raw.x2, 'x2'), cn(raw.y2, 'y2')]];
      if (from === 'three') out.pts = [[cn(raw.x1, 'x1'), cn(raw.y1, 'y1')], [cn(raw.x2, 'x2'), cn(raw.y2, 'y2')], [cn(raw.x3, 'x3'), cn(raw.y3, 'y3')]];
      if (from === 'general') out.Q = readQuadratic(raw.eq);
      if (String(raw.px ?? '').trim() || String(raw.py ?? '').trim()) out.point = [cn(raw.px, 'the point x'), cn(raw.py, 'the point y')];
      return out;
    },
    program: (p) => {
      const make = {
        centre: [D('g', 'num', lit(-p.h)), D('f', 'num', lit(-p.k)), D('c', 'num', `${lit(p.h * p.h + p.k * p.k)} - ${lit(p.r)} * ${lit(p.r)}`)],
        diameter: p.pts ? [
          C('Ends of a diameter (x1, y1), (x2, y2): (x - x1)(x - x2) + (y - y1)(y - y2) = 0'),
          D('g', 'num', `-(${lit(p.pts[0][0])} + ${lit(p.pts[1][0])}) / 2`), D('f', 'num', `-(${lit(p.pts[0][1])} + ${lit(p.pts[1][1])}) / 2`),
          D('c', 'num', `${lit(p.pts[0][0])} * ${lit(p.pts[1][0])} + ${lit(p.pts[0][1])} * ${lit(p.pts[1][1])}`),
        ] : [],
        three: p.pts ? [
          C('x^2 + y^2 + D x + E y + F = 0 through three points: solve for D, E, F'),
          D('M', 'mat', { mat: p.pts.map(([x, y]) => [x, y, 1]) }),
          D('rhs', 'vec', { vec: p.pts.map(([x, y]) => -(x * x + y * y)) }),
          ...gauss3(),
          D('g', 'num', 'sol[0] / 2'), D('f', 'num', 'sol[1] / 2'), D('c', 'num', 'sol[2]'),
        ] : [],
        general: p.Q ? [
          C('Divide by the coefficient of x^2, then compare with x^2 + y^2 + 2gx + 2fy + c = 0'),
          D('g', 'num', lit(p.Q.D / (2 * p.Q.A))), D('f', 'num', lit(p.Q.E / (2 * p.Q.A))), D('c', 'num', lit(p.Q.F / p.Q.A)),
        ] : [],
      }[p.from];
      return {
        title: 'Circle: centre, radius and equation',
        about: ['x^2 + y^2 + 2gx + 2fy + c = 0 has centre (-g, -f) and radius sqrt(g^2 + f^2 - c)'],
        body: [
          ...make,
          D('r2', 'num', 'g * g + f * f - c'),
          P('Equation: x^2 + y^2 + (', num('2 * g', 4), ') x + (', num('2 * f', 4), ') y + (', num('c', 4), ') = 0'),
          P('Centre = (', num('-g', 4), ', ', num('-f', 4), ')'),
          IF('r2 < 0', [P('g^2 + f^2 - c < 0: this is not a real circle.')], [P('Radius = ', num('sqrt(r2)', 6))]),
          ...(p.point ? [
            D('X', 'num', lit(p.point[0])), D('Y', 'num', lit(p.point[1])),
            D('S1', 'num', 'X * X + Y * Y + 2 * g * X + 2 * f * Y + c'),
            IF('abs(S1) < 1e-9', [P('The point is on the circle. Tangent: (', num('X + g', 4), ') x + (', num('Y + f', 4), ') y + (', num('g * X + f * Y + c', 4), ') = 0')],
              [IF('S1 < 0', [P('The point is inside the circle.')], [P('The point is outside; tangent length = ', num('sqrt(S1)', 6))])]),
          ] : []),
        ],
      };
    },
  },

  conics: {
    name: 'Conic sections',
    clean: (raw) => {
      check(conicSolve, raw);
      return { Q: readQuadratic(raw.eq) };
    },
    program: (p) => {
      const { A, C: Cc, D: Dd, E, F } = p.Q;
      const coeffs = [D('A', 'num', lit(A)), D('C', 'num', lit(Cc)), D('Dx', 'num', lit(Dd)), D('E', 'num', lit(E)), D('F', 'num', lit(F))];
      if (Math.abs(A) < 1e-12 || Math.abs(Cc) < 1e-12) {
        const alongX = Math.abs(A) < 1e-12;
        return {
          title: 'Parabola: vertex, focus and directrix',
          about: [alongX ? '(y - k)^2 = 4a(x - h)' : '(x - h)^2 = 4a(y - k)', 'Completing the square on the squared variable'],
          body: [
            ...coeffs,
            P('Coefficients: A = ', num('A', 4), ', C = ', num('C', 4), ', D = ', num('Dx', 4), ', E = ', num('E', 4), ', F = ', num('F', 4)),
            D('sq', 'num', alongX ? 'C' : 'A'), D('lin', 'num', alongX ? 'Dx' : 'E'), D('oth', 'num', alongX ? 'E' : 'Dx'),
            D('shift', 'num', '-oth / (2 * sq)'),
            D('Fp', 'num', 'F - oth * oth / (4 * sq)'),
            D('a', 'num', '-lin / (4 * sq)'),
            D('t', 'num', '-Fp / lin'),
            ...(alongX ? [D('h', 'num', 't'), D('k', 'num', 'shift')] : [D('h', 'num', 'shift'), D('k', 'num', 't')]),
            P('Vertex = (', num('h', 4), ', ', num('k', 4), '), a = ', num('a', 4)),
            P('Focus = (', num(alongX ? 'h + a' : 'h', 4), ', ', num(alongX ? 'k' : 'k + a', 4), ')'),
            P(`Directrix: ${alongX ? 'x' : 'y'} = `, num(alongX ? 'h - a' : 'k - a', 4)),
            P('Latus rectum = ', num('abs(4 * a)', 4), ', eccentricity = 1'),
          ],
        };
      }
      const ellipse = A * Cc > 0;
      return {
        title: ellipse ? 'Ellipse: centre, axes, foci and eccentricity' : 'Hyperbola: centre, axes, foci and eccentricity',
        about: ['Complete the squares: (x - h)^2 / P + (y - k)^2 / S = 1'],
        body: [
          ...coeffs,
          D('h', 'num', '-Dx / (2 * A)'), D('k', 'num', '-E / (2 * C)'),
          D('R', 'num', 'Dx * Dx / (4 * A) + E * E / (4 * C) - F'),
          D('Pq', 'num', 'R / A'), D('Sq', 'num', 'R / C'),
          ...(ellipse ? [
            D('alongX', 'bool', 'Pq > Sq'),
            D('a2', 'num', 'max(Pq, Sq)'), D('b2', 'num', 'min(Pq, Sq)'),
            D('c', 'num', 'sqrt(a2 - b2)'),
          ] : [
            D('alongX', 'bool', 'Pq > 0'),
            D('a2', 'num', 'Sq'), D('b2', 'num', '-Pq'),
            IF('alongX', [S('a2', 'Pq'), S('b2', '-Sq')]),
            D('c', 'num', 'sqrt(a2 + b2)'),
          ]),
          D('a', 'num', 'sqrt(a2)'), D('b', 'num', 'sqrt(b2)'),
          P('Centre = (', num('h', 4), ', ', num('k', 4), ')'),
          P('a = ', num('a', 4), ', b = ', num('b', 4), ', c = ', num('c', 4)),
          P('Eccentricity e = c / a = ', num('c / a', 4)),
          IF('alongX', [P('Foci = (', num('h + c', 4), ', ', num('k', 4), ') and (', num('h - c', 4), ', ', num('k', 4), ')')],
            [P('Foci = (', num('h', 4), ', ', num('k + c', 4), ') and (', num('h', 4), ', ', num('k - c', 4), ')')]),
          P('Latus rectum = 2 b^2 / a = ', num('2 * b2 / a', 4)),
          P('Directrices at distance a / e = ', num('a2 / c', 4), ' from the centre'),
        ],
      };
    },
  },

  'heights-distances': {
    name: 'Heights and distances',
    clean: (raw) => {
      check(heightsSolve, raw);
      const type = choice(raw.type, ['height', 'distance', 'angle', 'two-points', 'depression']);
      const ang = (v) => parseAngle(v, 'deg');
      const out = { type };
      if (type === 'height') Object.assign(out, { d: numIn(raw.d, 'd'), th: ang(raw.theta), eye: String(raw.eye ?? '').trim() ? numIn(raw.eye, 'the eye height') : 0 });
      if (type === 'distance') Object.assign(out, { h: numIn(raw.h, 'h'), th: ang(raw.theta) });
      if (type === 'angle') Object.assign(out, { h: numIn(raw.h, 'h'), d: numIn(raw.d, 'd') });
      if (type === 'two-points') Object.assign(out, { d: numIn(raw.d, 'd'), al: ang(raw.alpha), be: ang(raw.beta), same: raw.side !== 'opposite' });
      if (type === 'depression') Object.assign(out, { h: numIn(raw.h, 'h'), al: ang(raw.alpha), be: ang(raw.beta) });
      return out;
    },
    program: (p) => {
      const t = (deg) => `tan(${lit(deg)} * pi / 180)`;
      const body = {
        height: [D('d', 'num', lit(p.d)), D('eye', 'num', lit(p.eye ?? 0)), P('Height = d tan(theta) + eye height = ', num(`d * ${t(p.th)} + eye`, 4))],
        distance: [D('h', 'num', lit(p.h)), P('Distance = h / tan(theta) = ', num(`h / ${t(p.th)}`, 4))],
        angle: [D('h', 'num', lit(p.h)), D('d', 'num', lit(p.d)), P('Angle = atan(h / d) = ', num('atan(h / d) * 180 / pi', 4), ' degrees')],
        'two-points': [D('d', 'num', lit(p.d)), D('ta', 'num', t(p.al)), D('tb', 'num', t(p.be)),
          D('ht', 'num', p.same ? 'd * ta * tb / (ta - tb)' : 'd * ta * tb / (ta + tb)'),
          P('Height = ', num('ht', 4)), P('Distance from the nearer point = ', num('ht / ta', 4))],
        depression: [D('h', 'num', lit(p.h)), P('Distance between the two objects = h / tan(beta) - h / tan(alpha) = ', num(`h / ${t(p.be)} - h / ${t(p.al)}`, 4))],
      }[p.type];
      return { title: `Heights and distances (${p.type.replace('-', ' ')})`, about: ['tan(angle) = opposite / adjacent in each right triangle'], body };
    },
  },

  'inverse-trig': {
    name: 'Inverse trig functions',
    clean: (raw) => {
      check(inverseTrigSolve, raw);
      const mode = choice(raw.mode, ['value', 'compose', 'sum']);
      const fnName = choice(raw.fn, ['sin', 'cos', 'tan', 'cot', 'sec', 'csc']);
      if (mode === 'value') return { mode, fn: fnName, v: cn(raw.value, 'the value') };
      if (mode === 'compose') return { mode, fn: fnName, th: cn(raw.angle, 'the angle') };
      return { mode, x: cn(raw.a, 'a'), y: cn(raw.b, 'b'), sign: raw.op === '-' ? -1 : 1 };
    },
    program: (p) => {
      // The principal value of fn^-1(v) into target
      const principal = (f, v, target) => ({
        sin: [D(target, 'num', `asin(${v})`)], cos: [D(target, 'num', `acos(${v})`)], tan: [D(target, 'num', `atan(${v})`)],
        sec: [D(target, 'num', `acos(1 / (${v}))`)], csc: [D(target, 'num', `asin(1 / (${v}))`)],
        cot: [D(target, 'num', 'pi / 2'), IF(`${v} > 0`, [S(target, `atan(1 / (${v}))`)]), IF(`${v} < 0`, [S(target, `pi + atan(1 / (${v}))`)])],
      }[f]);
      const FWD = { sin: 'sin(th)', cos: 'cos(th)', tan: 'tan(th)', cot: '1 / tan(th)', sec: '1 / cos(th)', csc: '1 / sin(th)' };
      if (p.mode === 'value') {
        return {
          title: `Principal value of ${p.fn}^-1`,
          body: [D('v', 'num', lit(p.v)), ...principal(p.fn, 'v', 'ang'), P(`${p.fn}^-1(`, num('v', 6), ') = ', num('ang', 6), ' radians = ', num('ang * 180 / pi', 4), ' degrees')],
        };
      }
      if (p.mode === 'compose') {
        return {
          title: `${p.fn}^-1(${p.fn}(theta))`,
          about: [`Equals theta only when theta is in the principal range of ${p.fn}^-1`],
          body: [D('th', 'num', lit(p.th)), D('v', 'num', FWD[p.fn]), ...principal(p.fn, 'v', 'ang'),
            P(`${p.fn}(theta) = `, num('v', 6)), P('Answer = ', num('ang', 6), ' radians = ', num('ang * 180 / pi', 4), ' degrees')],
        };
      }
      return {
        title: `tan^-1(a) ${p.sign < 0 ? '-' : '+'} tan^-1(b)`,
        about: [`tan^-1 a ${p.sign < 0 ? '-' : '+'} tan^-1 b = tan^-1((a ${p.sign < 0 ? '-' : '+'} b) / (1 ${p.sign < 0 ? '+' : '-'} ab)), plus pi when needed`],
        body: [D('a', 'num', lit(p.x)), D('b', 'num', lit(p.y)),
          D('total', 'num', `atan(a) ${p.sign < 0 ? '-' : '+'} atan(b)`),
          P('Answer = ', num('total', 6), ' radians = ', num('total * 180 / pi', 4), ' degrees'),
          IF(`abs(1 ${p.sign < 0 ? '+' : '-'} a * b) > 1e-12`, [P('tan of the answer = ', num(`(a ${p.sign < 0 ? '-' : '+'} b) / (1 ${p.sign < 0 ? '+' : '-'} a * b)`, 6))])],
      };
    },
  },

  'geometry-3d': {
    name: '3D geometry',
    clean: (raw) => {
      check(solid3dSolve, raw);
      const mode = choice(raw.mode, ['dc', 'line', 'plane', 'point-plane', 'angle-lines', 'angle-planes', 'line-plane', 'skew']);
      const out = { mode };
      if (['dc', 'line', 'plane'].includes(mode)) { out.P = point3(raw.p, 'Point P'); out.Q = point3(raw.q, 'Point Q'); }
      if (mode === 'plane') out.S = point3(raw.s, 'Point S');
      if (mode === 'point-plane') { out.P = point3(raw.p, 'Point P'); out.pl = plane(raw.plane, 'the plane'); }
      if (mode === 'angle-lines') { out.u = point3(raw.d1, 'Direction 1'); out.w = point3(raw.d2, 'Direction 2'); }
      if (mode === 'angle-planes') { out.u = plane(raw.plane, 'Plane 1').nrm; out.w = plane(raw.plane2, 'Plane 2').nrm; }
      if (mode === 'line-plane') { out.u = point3(raw.d1, 'the direction of the line'); out.w = plane(raw.plane, 'the plane').nrm; }
      if (mode === 'skew') Object.assign(out, { P: point3(raw.p, 'Point on line 1'), u: point3(raw.d1, 'Direction of line 1'), Q: point3(raw.q, 'Point on line 2'), w: point3(raw.d2, 'Direction of line 2') });
      return out;
    },
    program: (p) => {
      const deg = (e) => `${e} * 180 / pi`;
      const body = {
        dc: [vec3('Pp', p.P), vec3('Qp', p.Q), D('d', 'vec', { zeros: 3 }), FOR('i', 0, 3, [S('d[i]', 'Qp[i] - Pp[i]')]), D('L', 'num', len3('d')),
          P('Direction ratios: ', num('d[0]', 4), ', ', num('d[1]', 4), ', ', num('d[2]', 4)),
          P('Direction cosines l, m, n = ', num('d[0] / L', 6), ', ', num('d[1] / L', 6), ', ', num('d[2] / L', 6))],
        line: [vec3('Pp', p.P), vec3('Qp', p.Q), D('d', 'vec', { zeros: 3 }), FOR('i', 0, 3, [S('d[i]', 'Qp[i] - Pp[i]')]),
          P('Line: (x - ', num('Pp[0]', 4), ') / ', num('d[0]', 4), ' = (y - ', num('Pp[1]', 4), ') / ', num('d[1]', 4), ' = (z - ', num('Pp[2]', 4), ') / ', num('d[2]', 4))],
        plane: [vec3('Pp', p.P), vec3('Qp', p.Q), vec3('Sp', p.S), D('u', 'vec', { zeros: 3 }), D('w', 'vec', { zeros: 3 }),
          FOR('i', 0, 3, [S('u[i]', 'Qp[i] - Pp[i]'), S('w[i]', 'Sp[i] - Pp[i]')]), ...cross3('u', 'w', 'nv'),
          P('Plane: ', num('nv[0]', 4), ' x + ', num('nv[1]', 4), ' y + ', num('nv[2]', 4), ' z = ', num(dot3('nv', 'Pp'), 4))],
        'point-plane': p.pl ? [vec3('Pp', p.P), vec3('nv', p.pl.nrm), D('dd', 'num', lit(p.pl.d)),
          D('top', 'num', `${dot3('nv', 'Pp')} - dd`),
          P('Distance from P to the plane = ', num(`abs(top) / ${len3('nv')}`, 6)),
          P('Foot of the perpendicular = (', num(`Pp[0] - top / (${dot3('nv', 'nv')}) * nv[0]`, 4), ', ', num(`Pp[1] - top / (${dot3('nv', 'nv')}) * nv[1]`, 4), ', ', num(`Pp[2] - top / (${dot3('nv', 'nv')}) * nv[2]`, 4), ')')] : [],
        'angle-lines': [vec3('u', p.u), vec3('w', p.w), P('Angle between the lines = ', num(deg(`acos(min(1, abs(${dot3('u', 'w')}) / (${len3('u')} * ${len3('w')})))`), 4), ' degrees')],
        'angle-planes': [vec3('u', p.u), vec3('w', p.w), P('Angle between the planes = ', num(deg(`acos(min(1, abs(${dot3('u', 'w')}) / (${len3('u')} * ${len3('w')})))`), 4), ' degrees')],
        'line-plane': [vec3('u', p.u), vec3('w', p.w), P('Angle between the line and the plane = ', num(deg(`asin(min(1, abs(${dot3('u', 'w')}) / (${len3('u')} * ${len3('w')})))`), 4), ' degrees')],
        skew: [vec3('P1', p.P), vec3('A1', p.u), vec3('P2', p.Q), vec3('B1', p.w), D('w', 'vec', { zeros: 3 }), FOR('i', 0, 3, [S('w[i]', 'P2[i] - P1[i]')]),
          ...cross3('A1', 'B1', 'cv'),
          IF(`${len3('cv')} < 1e-12`, [...cross3('w', 'A1', 'wa'), P('The lines are parallel; distance = ', num(`${len3('wa')} / ${len3('A1')}`, 6))],
            [P('Shortest distance = |w . (a x b)| / |a x b| = ', num(`abs(${dot3('w', 'cv')}) / ${len3('cv')}`, 6))])],
      }[p.mode];
      return { title: `3D geometry: ${p.mode.replace('-', ' ')}`, body };
    },
  },

  'polar-coordinates': {
    name: 'Polar coordinates',
    clean: (raw) => {
      check(polarSolve, raw);
      const mode = choice(raw.mode, ['to-polar', 'to-cartesian', 'rotate', 'translate', 'curve']);
      const angle = (v) => (raw.unit === 'rad' ? cn(v, 'θ') : (cn(String(v ?? '').replace(/°/g, ''), 'θ') * Math.PI) / 180);
      const out = { mode };
      if (['to-polar', 'rotate', 'translate'].includes(mode)) { out.x = cn(raw.x, 'x'); out.y = cn(raw.y, 'y'); }
      if (mode === 'to-cartesian') { out.r = cn(raw.r, 'r'); out.t = angle(raw.theta); }
      if (mode === 'rotate') out.t = angle(raw.theta);
      if (mode === 'translate') { out.h = cn(raw.h, 'h'); out.k = cn(raw.k, 'k'); }
      if (mode === 'curve') out.curve = String(raw.curve ?? '').replace(/\s+/g, '').replace(/^r=/, '').replace(/θ/g, 't');
      return out;
    },
    program: (p) => {
      if (p.mode === 'curve') {
        return {
          title: `Polar curve r = ${p.curve.replace(/\bt\b/g, 'theta')}`,
          about: ['Points of the curve every 30 degrees: x = r cos(theta), y = r sin(theta)'],
          funcs: [fn('r', p.curve, ['t'], 'r(theta) as you typed it (theta written as t)')],
          body: [FOR('i', 0, 13, [D('t', 'num', 'i * pi / 6'), D('rv', 'num', 'r(t)'),
            P('theta = ', num('i * 30', 0, 3), ' degrees: r = ', num('rv', 4, 9), ', x = ', num('rv * cos(t)', 4, 9), ', y = ', num('rv * sin(t)', 4, 9))])],
        };
      }
      const body = {
        'to-polar': [D('x', 'num', lit(p.x)), D('y', 'num', lit(p.y)), D('r', 'num', 'sqrt(x * x + y * y)'), D('t', 'num', 'atan2(y, x)'), IF('t < 0', [S('t', 't + 2 * pi')]),
          P('r = ', num('r', 6), ', theta = ', num('t', 6), ' radians = ', num('t * 180 / pi', 4), ' degrees')],
        'to-cartesian': [D('r', 'num', lit(p.r)), D('t', 'num', lit(p.t)), P('x = r cos(theta) = ', num('r * cos(t)', 6), ', y = r sin(theta) = ', num('r * sin(t)', 6))],
        rotate: [D('x', 'num', lit(p.x)), D('y', 'num', lit(p.y)), D('t', 'num', lit(p.t)),
          P("Rotated axes: x' = x cos(theta) + y sin(theta) = ", num('x * cos(t) + y * sin(t)', 6)), P("y' = -x sin(theta) + y cos(theta) = ", num('-x * sin(t) + y * cos(t)', 6))],
        translate: [D('x', 'num', lit(p.x)), D('y', 'num', lit(p.y)), D('h', 'num', lit(p.h)), D('k', 'num', lit(p.k)),
          P("Shifted origin (h, k): x' = x - h = ", num('x - h', 6), ", y' = y - k = ", num('y - k', 6))],
      }[p.mode];
      return { title: `Polar coordinates: ${p.mode.replace('-', ' ')}`, body };
    },
  },
};

/** sol = M⁻¹ rhs for the 3×3 system in M, rhs (Gaussian elimination). */
function gauss3() {
  return [
    D('sol', 'vec', { zeros: 3 }),
    FOR('gc', 0, 3, [
      D('gp', 'int', 'gc'),
      FOR('gr', 'gc + 1', 3, [IF('abs(M[gr, gc]) > abs(M[gp, gc])', [S('gp', 'gr')])]),
      FOR('gk', 0, 3, [D('gt', 'num', 'M[gc, gk]'), S('M[gc, gk]', 'M[gp, gk]'), S('M[gp, gk]', 'gt')]),
      D('gv', 'num', 'rhs[gc]'), S('rhs[gc]', 'rhs[gp]'), S('rhs[gp]', 'gv'),
      FOR('gr', 'gc + 1', 3, [
        D('gm', 'num', 'M[gr, gc] / M[gc, gc]'),
        FOR('gk', 'gc', 3, [S('M[gr, gk]', 'M[gr, gk] - gm * M[gc, gk]')]),
        S('rhs[gr]', 'rhs[gr] - gm * rhs[gc]'),
      ]),
    ]),
    FOR('gi', 0, 3, [
      D('gr', 'int', '2 - gi'),
      D('gs', 'num', 'rhs[gr]'),
      FOR('gk', 'gr + 1', 3, [S('gs', 'gs - M[gr, gk] * sol[gk]')]),
      S('sol[gr]', 'gs / M[gr, gr]'),
    ]),
  ];
}
