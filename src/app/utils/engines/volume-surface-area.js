/**
 * Volume and surface area of 3D solids: the maths for /volume-and-surface-area.
 * Same shape as the area engine: each output has formula → numbers lines; the page adds "= answer".
 */
import { EngineError } from '../numeric/steps';
import { n, nb, piChoice } from '../numeric/geometry';
import { readInputs } from './area-perimeter';

const out = (key, label, power, value, lines) => ({ key, label, power, value, lines });
/** "= 25\pi" line when π is kept exact, so answers can be left in terms of π like the textbook. */
const inPi = (pi, sym, k) => (pi.tex === '\\pi' ? [`${sym} = ${n(k)}\\pi`] : []);

export const SHAPES_3D = [
  {
    id: 'cube', name: 'Cube',
    inputs: [{ key: 'a', label: 'Edge a' }],
    solve: ({ a }) => [
      out('volume', 'Volume', 3, a ** 3, ['V = a^3', `V = ${nb(a)}^3`]),
      out('lsa', 'Lateral surface area (4 faces)', 2, 4 * a * a, ['LSA = 4a^2', `LSA = 4 \\times ${nb(a)}^2`]),
      out('tsa', 'Total surface area', 2, 6 * a * a, ['TSA = 6a^2', `TSA = 6 \\times ${nb(a)}^2`]),
      out('diagonal', 'Diagonal', 1, a * Math.sqrt(3), ['d = a\\sqrt{3}', `d = ${n(a)}\\sqrt{3}`]),
    ],
  },
  {
    id: 'cuboid', name: 'Cuboid (box)',
    inputs: [{ key: 'l', label: 'Length l' }, { key: 'b', label: 'Breadth b' }, { key: 'h', label: 'Height h' }],
    solve: ({ l, b, h }) => [
      out('volume', 'Volume', 3, l * b * h, ['V = l \\times b \\times h', `V = ${n(l)} \\times ${n(b)} \\times ${n(h)}`]),
      out('lsa', 'Lateral surface area (4 walls)', 2, 2 * h * (l + b), ['LSA = 2h(l + b)', `LSA = 2 \\times ${n(h)} \\times (${n(l)} + ${n(b)})`]),
      out('tsa', 'Total surface area', 2, 2 * (l * b + b * h + h * l), ['TSA = 2(lb + bh + hl)', `TSA = 2(${n(l * b)} + ${n(b * h)} + ${n(h * l)})`]),
      out('diagonal', 'Diagonal', 1, Math.sqrt(l * l + b * b + h * h), ['d = \\sqrt{l^2 + b^2 + h^2}', `d = \\sqrt{${nb(l)}^2 + ${nb(b)}^2 + ${nb(h)}^2}`]),
    ],
  },
  {
    id: 'cylinder', name: 'Cylinder',
    inputs: [{ key: 'r', label: 'Radius r' }, { key: 'h', label: 'Height h' }],
    usesPi: true,
    solve: ({ r, h }, pi) => [
      out('volume', 'Volume', 3, pi.value * r * r * h, ['V = \\pi r^2 h', `V = ${pi.tex} \\times ${nb(r)}^2 \\times ${n(h)}`, ...inPi(pi, 'V', r * r * h)]),
      out('csa', 'Curved surface area', 2, 2 * pi.value * r * h, ['CSA = 2\\pi r h', `CSA = 2 \\times ${pi.tex} \\times ${n(r)} \\times ${n(h)}`, ...inPi(pi, 'CSA', 2 * r * h)]),
      out('tsa', 'Total surface area', 2, 2 * pi.value * r * (r + h), ['TSA = 2\\pi r(r + h)', `TSA = 2 \\times ${pi.tex} \\times ${n(r)} \\times (${n(r)} + ${n(h)})`, ...inPi(pi, 'TSA', 2 * r * (r + h))]),
    ],
  },
  {
    id: 'cone', name: 'Cone',
    inputs: [{ key: 'r', label: 'Radius r' }, { key: 'h', label: 'Height h' }],
    usesPi: true,
    solve: ({ r, h }, pi) => {
      const l = Math.hypot(r, h);
      return [
        out('slant', 'Slant height', 1, l, ['l = \\sqrt{r^2 + h^2}', `l = \\sqrt{${nb(r)}^2 + ${nb(h)}^2}`]),
        out('volume', 'Volume', 3, (pi.value * r * r * h) / 3, ['V = \\tfrac{1}{3}\\pi r^2 h', `V = \\tfrac{1}{3} \\times ${pi.tex} \\times ${nb(r)}^2 \\times ${n(h)}`, ...inPi(pi, 'V', (r * r * h) / 3)]),
        out('csa', 'Curved surface area', 2, pi.value * r * l, ['CSA = \\pi r l', `CSA = ${pi.tex} \\times ${n(r)} \\times ${n(l)}`]),
        out('tsa', 'Total surface area', 2, pi.value * r * (l + r), ['TSA = \\pi r(l + r)', `TSA = ${pi.tex} \\times ${n(r)} \\times (${n(l)} + ${n(r)})`]),
      ];
    },
  },
  {
    id: 'frustum', name: 'Frustum of a cone',
    inputs: [{ key: 'R', label: 'Bottom radius R' }, { key: 'r', label: 'Top radius r' }, { key: 'h', label: 'Height h' }],
    usesPi: true,
    solve: ({ R, r, h }, pi) => {
      const l = Math.hypot(h, R - r);
      return [
        out('slant', 'Slant height', 1, l, ['l = \\sqrt{h^2 + (R - r)^2}', `l = \\sqrt{${nb(h)}^2 + ${nb(R - r)}^2}`]),
        out('volume', 'Volume', 3, (pi.value * h * (R * R + R * r + r * r)) / 3, ['V = \\tfrac{1}{3}\\pi h(R^2 + Rr + r^2)', `V = \\tfrac{1}{3} \\times ${pi.tex} \\times ${n(h)} \\times (${n(R * R)} + ${n(R * r)} + ${n(r * r)})`]),
        out('csa', 'Curved surface area', 2, pi.value * (R + r) * l, ['CSA = \\pi(R + r)l', `CSA = ${pi.tex} \\times (${n(R)} + ${n(r)}) \\times ${n(l)}`]),
        out('tsa', 'Total surface area', 2, pi.value * ((R + r) * l + R * R + r * r), ['TSA = \\pi(R + r)l + \\pi R^2 + \\pi r^2', `TSA = ${pi.tex}(${n((R + r) * l)} + ${n(R * R)} + ${n(r * r)})`]),
      ];
    },
  },
  {
    id: 'sphere', name: 'Sphere',
    inputs: [{ key: 'r', label: 'Radius r' }],
    usesPi: true,
    solve: ({ r }, pi) => [
      out('volume', 'Volume', 3, (4 / 3) * pi.value * r ** 3, ['V = \\tfrac{4}{3}\\pi r^3', `V = \\tfrac{4}{3} \\times ${pi.tex} \\times ${nb(r)}^3`, ...inPi(pi, 'V', (4 / 3) * r ** 3)]),
      out('tsa', 'Surface area', 2, 4 * pi.value * r * r, ['S = 4\\pi r^2', `S = 4 \\times ${pi.tex} \\times ${nb(r)}^2`, ...inPi(pi, 'S', 4 * r * r)]),
    ],
  },
  {
    id: 'hemisphere', name: 'Hemisphere',
    inputs: [{ key: 'r', label: 'Radius r' }],
    usesPi: true,
    solve: ({ r }, pi) => [
      out('volume', 'Volume', 3, (2 / 3) * pi.value * r ** 3, ['V = \\tfrac{2}{3}\\pi r^3', `V = \\tfrac{2}{3} \\times ${pi.tex} \\times ${nb(r)}^3`, ...inPi(pi, 'V', (2 / 3) * r ** 3)]),
      out('csa', 'Curved surface area', 2, 2 * pi.value * r * r, ['CSA = 2\\pi r^2', `CSA = 2 \\times ${pi.tex} \\times ${nb(r)}^2`, ...inPi(pi, 'CSA', 2 * r * r)]),
      out('tsa', 'Total surface area', 2, 3 * pi.value * r * r, ['TSA = 3\\pi r^2', `TSA = 3 \\times ${pi.tex} \\times ${nb(r)}^2`, ...inPi(pi, 'TSA', 3 * r * r)]),
    ],
  },
  {
    id: 'prism', name: 'Right prism (any base)',
    inputs: [{ key: 'B', label: 'Base area B' }, { key: 'P', label: 'Base perimeter P' }, { key: 'h', label: 'Height h' }],
    note: 'Work out the base area and perimeter on the Area & Perimeter page if you need to.',
    solve: ({ B, P, h }) => [
      out('volume', 'Volume', 3, B * h, ['V = B \\times h', `V = ${n(B)} \\times ${n(h)}`]),
      out('lsa', 'Lateral surface area', 2, P * h, ['LSA = P \\times h', `LSA = ${n(P)} \\times ${n(h)}`]),
      out('tsa', 'Total surface area', 2, P * h + 2 * B, ['TSA = Ph + 2B', `TSA = ${n(P * h)} + 2 \\times ${n(B)}`]),
    ],
  },
  {
    id: 'pyramid', name: 'Square pyramid',
    inputs: [{ key: 'a', label: 'Base edge a' }, { key: 'h', label: 'Height h' }],
    solve: ({ a, h }) => {
      const l = Math.hypot(h, a / 2);
      return [
        out('slant', 'Slant height', 1, l, ['l = \\sqrt{h^2 + \\left(\\tfrac{a}{2}\\right)^2}', `l = \\sqrt{${nb(h)}^2 + ${nb(a / 2)}^2}`]),
        out('volume', 'Volume', 3, (a * a * h) / 3, ['V = \\tfrac{1}{3} a^2 h', `V = \\tfrac{1}{3} \\times ${nb(a)}^2 \\times ${n(h)}`]),
        out('lsa', 'Lateral surface area (4 triangles)', 2, 2 * a * l, ['LSA = 2al', `LSA = 2 \\times ${n(a)} \\times ${n(l)}`]),
        out('tsa', 'Total surface area', 2, a * a + 2 * a * l, ['TSA = a^2 + 2al', `TSA = ${nb(a)}^2 + 2 \\times ${n(a)} \\times ${n(l)}`]),
      ];
    },
  },
];

export function solve({ shape: id, values = {}, pi = 'exact' }) {
  const shape = SHAPES_3D.find((s) => s.id === id);
  if (!shape) throw new EngineError('Choose a solid.');
  const piInfo = piChoice(pi);
  const outputs = shape.solve(readInputs(shape, values), piInfo);
  return {
    shape: shape.id, name: shape.name, pi: piInfo, outputs, note: shape.note || null,
    result: outputs.find((o) => o.key === 'volume').value, steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
