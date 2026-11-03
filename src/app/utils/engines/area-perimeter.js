/**
 * Area and perimeter of 2D shapes: the maths for /area-and-perimeter.
 * Each shape lists its inputs and returns outputs with three LaTeX lines each: formula → numbers → answer.
 */
import { EngineError } from '../numeric/steps';
import { n, nb, piChoice, positive, optionalPositive } from '../numeric/geometry';

/** One answer: label, value, power of the unit (1 = cm, 2 = cm², 3 = cm³, 0 = degrees), and the working lines. */
const out = (key, label, power, value, lines) => ({ key, label, power, value, lines });

export const SHAPES_2D = [
  {
    id: 'square', name: 'Square',
    inputs: [{ key: 'a', label: 'Side a' }],
    solve: ({ a }) => [
      out('area', 'Area', 2, a * a, ['A = a^2', `A = ${nb(a)}^2`]),
      out('perimeter', 'Perimeter', 1, 4 * a, ['P = 4a', `P = 4 \\times ${n(a)}`]),
      out('diagonal', 'Diagonal', 1, a * Math.SQRT2, ['d = a\\sqrt{2}', `d = ${n(a)}\\sqrt{2}`]),
    ],
  },
  {
    id: 'rectangle', name: 'Rectangle',
    inputs: [{ key: 'l', label: 'Length l' }, { key: 'b', label: 'Breadth b' }],
    solve: ({ l, b }) => [
      out('area', 'Area', 2, l * b, ['A = l \\times b', `A = ${n(l)} \\times ${n(b)}`]),
      out('perimeter', 'Perimeter', 1, 2 * (l + b), ['P = 2(l + b)', `P = 2(${n(l)} + ${n(b)})`]),
      out('diagonal', 'Diagonal', 1, Math.hypot(l, b), ['d = \\sqrt{l^2 + b^2}', `d = \\sqrt{${nb(l)}^2 + ${nb(b)}^2}`]),
    ],
  },
  {
    id: 'triangle-bh', name: 'Triangle (base & height)',
    inputs: [{ key: 'b', label: 'Base b' }, { key: 'h', label: 'Height h' }],
    note: 'Perimeter needs all three sides: choose "Triangle (3 sides)".',
    solve: ({ b, h }) => [
      out('area', 'Area', 2, (b * h) / 2, ['A = \\tfrac{1}{2} \\times b \\times h', `A = \\tfrac{1}{2} \\times ${n(b)} \\times ${n(h)}`]),
    ],
  },
  {
    id: 'triangle-sss', name: "Triangle (3 sides, Heron's formula)",
    inputs: [{ key: 'a', label: 'Side a' }, { key: 'b', label: 'Side b' }, { key: 'c', label: 'Side c' }],
    solve: ({ a, b, c }) => {
      const [x, y, z] = [a, b, c].sort((p, q) => p - q);
      if (x + y <= z) throw new EngineError(`These sides can't make a triangle: ${n(x)} + ${n(y)} is not more than ${n(z)}.`);
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      return [
        out('perimeter', 'Perimeter', 1, a + b + c, ['P = a + b + c', `P = ${n(a)} + ${n(b)} + ${n(c)}`]),
        out('area', "Area (Heron's formula)", 2, area, [
          `s = \\frac{a + b + c}{2} = \\frac{${n(a + b + c)}}{2} = ${n(s)}`,
          'A = \\sqrt{s(s - a)(s - b)(s - c)}',
          `A = \\sqrt{${n(s)} \\times ${n(s - a)} \\times ${n(s - b)} \\times ${n(s - c)}} = \\sqrt{${n(s * (s - a) * (s - b) * (s - c))}}`,
        ]),
      ];
    },
  },
  {
    id: 'circle', name: 'Circle',
    inputs: [{ key: 'r', label: 'Radius r' }],
    usesPi: true,
    solve: ({ r }, pi) => [
      out('area', 'Area', 2, pi.value * r * r, ['A = \\pi r^2', `A = ${pi.tex} \\times ${nb(r)}^2`, ...(pi.tex === '\\pi' ? [`A = ${n(r * r)}\\pi`] : [])]),
      out('circumference', 'Circumference', 1, 2 * pi.value * r, ['C = 2\\pi r', `C = 2 \\times ${pi.tex} \\times ${n(r)}`, ...(pi.tex === '\\pi' ? [`C = ${n(2 * r)}\\pi`] : [])]),
      out('diameter', 'Diameter', 1, 2 * r, ['d = 2r', `d = 2 \\times ${n(r)}`]),
    ],
  },
  {
    id: 'sector', name: 'Sector (and arc)',
    inputs: [{ key: 'r', label: 'Radius r' }, { key: 'theta', label: 'Angle θ (degrees)', max: 360 }],
    usesPi: true,
    solve: ({ r, theta }, pi) => {
      const arc = (theta / 360) * 2 * pi.value * r;
      return [
        out('area', 'Area of sector', 2, (theta / 360) * pi.value * r * r, ['A = \\frac{\\theta}{360^\\circ} \\times \\pi r^2', `A = \\frac{${n(theta)}}{360} \\times ${pi.tex} \\times ${nb(r)}^2`]),
        out('arc', 'Arc length', 1, arc, ['l = \\frac{\\theta}{360^\\circ} \\times 2\\pi r', `l = \\frac{${n(theta)}}{360} \\times 2 \\times ${pi.tex} \\times ${n(r)}`]),
        out('perimeter', 'Perimeter of sector', 1, 2 * r + arc, ['P = 2r + l', `P = 2 \\times ${n(r)} + ${n(arc)}`]),
      ];
    },
  },
  {
    id: 'trapezium', name: 'Trapezium (trapezoid)',
    inputs: [
      { key: 'a', label: 'Parallel side a' }, { key: 'b', label: 'Parallel side b' }, { key: 'h', label: 'Height h' },
      { key: 'c', label: 'Slant side c (for perimeter)', optional: true }, { key: 'd', label: 'Slant side d (for perimeter)', optional: true },
    ],
    solve: ({ a, b, h, c, d }) => [
      out('area', 'Area', 2, ((a + b) * h) / 2, ['A = \\tfrac{1}{2}(a + b)h', `A = \\tfrac{1}{2}(${n(a)} + ${n(b)}) \\times ${n(h)}`]),
      ...(c && d ? [out('perimeter', 'Perimeter', 1, a + b + c + d, ['P = a + b + c + d', `P = ${n(a)} + ${n(b)} + ${n(c)} + ${n(d)}`])] : []),
    ],
    note: 'Add both slant sides to get the perimeter too.',
  },
  {
    id: 'parallelogram', name: 'Parallelogram',
    inputs: [{ key: 'b', label: 'Base b' }, { key: 'h', label: 'Height h' }, { key: 's', label: 'Side s (for perimeter)', optional: true }],
    solve: ({ b, h, s }) => [
      out('area', 'Area', 2, b * h, ['A = b \\times h', `A = ${n(b)} \\times ${n(h)}`]),
      ...(s ? [out('perimeter', 'Perimeter', 1, 2 * (b + s), ['P = 2(b + s)', `P = 2(${n(b)} + ${n(s)})`])] : []),
    ],
    note: 'Add the slanted side s to get the perimeter too.',
  },
  {
    id: 'rhombus', name: 'Rhombus',
    inputs: [{ key: 'd1', label: 'Diagonal d₁' }, { key: 'd2', label: 'Diagonal d₂' }],
    solve: ({ d1, d2 }) => {
      const side = Math.hypot(d1 / 2, d2 / 2);
      return [
        out('area', 'Area', 2, (d1 * d2) / 2, ['A = \\tfrac{1}{2} d_1 d_2', `A = \\tfrac{1}{2} \\times ${n(d1)} \\times ${n(d2)}`]),
        out('side', 'Side', 1, side, ['s = \\sqrt{\\left(\\tfrac{d_1}{2}\\right)^2 + \\left(\\tfrac{d_2}{2}\\right)^2}', `s = \\sqrt{${nb(d1 / 2)}^2 + ${nb(d2 / 2)}^2}`]),
        out('perimeter', 'Perimeter', 1, 4 * side, ['P = 4s', `P = 4 \\times ${n(side)}`]),
      ];
    },
  },
  {
    id: 'polygon', name: 'Regular polygon',
    inputs: [{ key: 'sides', label: 'Number of sides n', whole: true, min: 3 }, { key: 's', label: 'Side length s' }],
    solve: ({ sides, s }) => {
      const apothem = s / (2 * Math.tan(Math.PI / sides));
      return [
        out('perimeter', 'Perimeter', 1, sides * s, ['P = n s', `P = ${n(sides)} \\times ${n(s)}`]),
        out('area', 'Area', 2, (sides * s * s) / (4 * Math.tan(Math.PI / sides)), [
          'A = \\frac{n s^2}{4 \\tan(180^\\circ / n)}',
          `A = \\frac{${n(sides)} \\times ${nb(s)}^2}{4 \\tan(${n(180 / sides)}^\\circ)}`,
        ]),
        out('apothem', 'Apothem (centre to side)', 1, apothem, ['a = \\frac{s}{2\\tan(180^\\circ / n)}', `a = \\frac{${n(s)}}{2\\tan(${n(180 / sides)}^\\circ)}`]),
        out('angle', 'Interior angle', 0, ((sides - 2) * 180) / sides, ['\\text{angle} = \\frac{(n - 2) \\times 180^\\circ}{n}', `\\text{angle} = \\frac{${n(sides - 2)} \\times 180^\\circ}{${n(sides)}}`]),
      ];
    },
  },
  {
    id: 'ellipse', name: 'Ellipse',
    inputs: [{ key: 'a', label: 'Semi-major axis a' }, { key: 'b', label: 'Semi-minor axis b' }],
    usesPi: true,
    note: "An ellipse's perimeter has no exact simple formula; this uses Ramanujan's approximation (very close).",
    solve: ({ a, b }, pi) => [
      out('area', 'Area', 2, pi.value * a * b, ['A = \\pi a b', `A = ${pi.tex} \\times ${n(a)} \\times ${n(b)}`]),
      out('perimeter', 'Perimeter (approx.)', 1, pi.value * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))), [
        'P \\approx \\pi\\left[3(a + b) - \\sqrt{(3a + b)(a + 3b)}\\right]',
        `P \\approx ${pi.tex}\\left[3(${n(a + b)}) - \\sqrt{${n(3 * a + b)} \\times ${n(a + 3 * b)}}\\right]`,
      ]),
    ],
  },
];

/** Reads and checks a shape's inputs. Shared with the volume page. */
export function readInputs(shape, values) {
  const v = {};
  for (const inp of shape.inputs) {
    const where = inp.label.replace(/\s*\(.*\)$/, '');
    const x = inp.optional ? optionalPositive(values[inp.key], where) : positive(values[inp.key], where);
    if (x !== null && inp.whole && !Number.isInteger(x)) throw new EngineError(`${where} must be a whole number.`);
    if (x !== null && inp.min && x < inp.min) throw new EngineError(`${where} must be at least ${inp.min}.`);
    if (x !== null && inp.max && x > inp.max) throw new EngineError(`${where} can be at most ${inp.max}.`);
    v[inp.key] = x;
  }
  return v;
}

/** { shape, values: { key: text }, pi: 'exact' | '22/7' | '3.14' } → { shape, outputs, note, pi } */
export function solve({ shape: id, values = {}, pi = 'exact' }) {
  const shape = SHAPES_2D.find((s) => s.id === id);
  if (!shape) throw new EngineError('Choose a shape.');
  const piInfo = piChoice(pi);
  const outputs = shape.solve(readInputs(shape, values), piInfo);
  const missingOptional = shape.inputs.some((i) => i.optional && !String(values[i.key] ?? '').trim());
  return {
    shape: shape.id, name: shape.name, pi: piInfo, outputs,
    note: shape.id === 'triangle-bh' || shape.id === 'ellipse' || missingOptional ? shape.note : null,
    result: outputs[0].value, steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
