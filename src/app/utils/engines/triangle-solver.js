/**
 * Triangle solver: the maths for /triangle-solver. Sides a, b, c are opposite angles A, B, C (degrees).
 *   SSS  a, b, c          cosine rule for the angles
 *   SAS  b, c and A       cosine rule for a, then the other angles
 *   ASA  A, B and c       C = 180° − A − B, then the sine rule
 *   AAS  A, B and a       C = 180° − A − B, then the sine rule
 *   SSA  a, b and A       sine rule for B — the ambiguous case: 0, 1 or 2 triangles
 */
import { EngineError } from '../numeric/steps';
import { n, nb, sinD, cosD, asinD, acosD, positive } from '../numeric/geometry';

export const MODES = [
  { id: 'SSS', label: 'SSS: three sides', inputs: ['a', 'b', 'c'] },
  { id: 'SAS', label: 'SAS: two sides and the angle between', inputs: ['b', 'c', 'A'] },
  { id: 'ASA', label: 'ASA: two angles and the side between', inputs: ['A', 'B', 'c'] },
  { id: 'AAS', label: 'AAS: two angles and a side not between', inputs: ['A', 'B', 'a'] },
  { id: 'SSA', label: 'SSA: two sides and an angle not between', inputs: ['a', 'b', 'A'] },
];

const angleIn = (text, name) => {
  const v = positive(text, `Angle ${name}`);
  if (v >= 180) throw new EngineError(`Angle ${name} must be less than 180°.`);
  return v;
};

/** Everything about one finished triangle: area, perimeter, kind. */
function describe(t) {
  const area = 0.5 * t.b * t.c * sinD(t.A);
  const s = (t.a + t.b + t.c) / 2;
  const angles = [t.A, t.B, t.C];
  const close = (x, y) => Math.abs(x - y) < 1e-7 * Math.max(1, x, y);
  const byAngle = angles.some((x) => close(x, 90)) ? 'right' : angles.some((x) => x > 90) ? 'obtuse' : 'acute';
  const equalSides = [close(t.a, t.b), close(t.b, t.c), close(t.a, t.c)].filter(Boolean).length;
  const bySide = equalSides === 3 ? 'equilateral' : equalSides ? 'isosceles' : 'scalene';
  return {
    ...t, area, perimeter: 2 * s, kind: `${bySide}, ${byAngle}`,
    areaLine: `\\text{Area} = \\tfrac{1}{2} bc \\sin A = \\tfrac{1}{2} \\times ${n(t.b)} \\times ${n(t.c)} \\times \\sin ${n(t.A, 5)}^\\circ = ${n(area)}`,
  };
}

export function solve({ mode, values = {} }) {
  const m = MODES.find((x) => x.id === mode);
  if (!m) throw new EngineError('Choose what you know: SSS, SAS, ASA, AAS or SSA.');
  const side = (k) => positive(values[k], `Side ${k}`);

  if (mode === 'SSS') {
    const a = side('a'), b = side('b'), c = side('c');
    const [x, y, z] = [a, b, c].sort((p, q) => p - q);
    if (x + y <= z) throw new EngineError(`These sides can't make a triangle: ${n(x)} + ${n(y)} is not more than ${n(z)}.`);
    const A = acosD((b * b + c * c - a * a) / (2 * b * c));
    const B = acosD((a * a + c * c - b * b) / (2 * a * c));
    const C = 180 - A - B;
    const lines = [
      `\\cos A = \\frac{b^2 + c^2 - a^2}{2bc} = \\frac{${nb(b)}^2 + ${nb(c)}^2 - ${nb(a)}^2}{2 \\times ${n(b)} \\times ${n(c)}} = ${n(Math.cos((A * Math.PI) / 180))} \\Rightarrow A = ${n(A, 5)}^\\circ`,
      `\\cos B = \\frac{a^2 + c^2 - b^2}{2ac} = \\frac{${nb(a)}^2 + ${nb(c)}^2 - ${nb(b)}^2}{2 \\times ${n(a)} \\times ${n(c)}} \\Rightarrow B = ${n(B, 5)}^\\circ`,
      `C = 180^\\circ - A - B = ${n(C, 5)}^\\circ`,
    ];
    return finish(mode, [describe({ a, b, c, A, B, C, lines })]);
  }

  if (mode === 'SAS') {
    const b = side('b'), c = side('c'), A = angleIn(values.A, 'A');
    const a = Math.sqrt(b * b + c * c - 2 * b * c * cosD(A));
    const B = acosD((a * a + c * c - b * b) / (2 * a * c));
    const C = 180 - A - B;
    const lines = [
      `a^2 = b^2 + c^2 - 2bc\\cos A = ${nb(b)}^2 + ${nb(c)}^2 - 2 \\times ${n(b)} \\times ${n(c)} \\times \\cos ${n(A)}^\\circ = ${n(a * a)}`,
      `a = \\sqrt{${n(a * a)}} = ${n(a)}`,
      `\\cos B = \\frac{a^2 + c^2 - b^2}{2ac} \\Rightarrow B = ${n(B, 5)}^\\circ`,
      `C = 180^\\circ - A - B = ${n(C, 5)}^\\circ`,
    ];
    return finish(mode, [describe({ a, b, c, A, B, C, lines })]);
  }

  if (mode === 'ASA' || mode === 'AAS') {
    const A = angleIn(values.A, 'A'), B = angleIn(values.B, 'B');
    if (A + B >= 180) throw new EngineError('Angles A and B add up to 180° or more, so there is no room for C.');
    const C = 180 - A - B;
    let a, b, c, lines;
    if (mode === 'ASA') {
      c = side('c');
      const k = c / sinD(C);
      a = k * sinD(A); b = k * sinD(B);
      lines = [
        `C = 180^\\circ - A - B = 180^\\circ - ${n(A)}^\\circ - ${n(B)}^\\circ = ${n(C)}^\\circ`,
        `\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = \\frac{${n(c)}}{\\sin ${n(C)}^\\circ} = ${n(k)}`,
        `a = ${n(k)} \\times \\sin ${n(A)}^\\circ = ${n(a)}, \\quad b = ${n(k)} \\times \\sin ${n(B)}^\\circ = ${n(b)}`,
      ];
    } else {
      a = side('a');
      const k = a / sinD(A);
      b = k * sinD(B); c = k * sinD(C);
      lines = [
        `C = 180^\\circ - A - B = 180^\\circ - ${n(A)}^\\circ - ${n(B)}^\\circ = ${n(C)}^\\circ`,
        `\\frac{a}{\\sin A} = \\frac{${n(a)}}{\\sin ${n(A)}^\\circ} = ${n(k)}`,
        `b = ${n(k)} \\times \\sin ${n(B)}^\\circ = ${n(b)}, \\quad c = ${n(k)} \\times \\sin ${n(C)}^\\circ = ${n(c)}`,
      ];
    }
    return finish(mode, [describe({ a, b, c, A, B, C, lines })]);
  }

  // SSA — the ambiguous case
  const a = side('a'), b = side('b'), A = angleIn(values.A, 'A');
  const sinB = (b * sinD(A)) / a;
  const first = `\\sin B = \\frac{b \\sin A}{a} = \\frac{${n(b)} \\times \\sin ${n(A)}^\\circ}{${n(a)}} = ${n(sinB)}`;
  if (sinB > 1 + 1e-12) {
    return finish(mode, [], [first, '\\sin B > 1 \\Rightarrow \\text{no triangle}'], 'No triangle fits: side a is too short to reach the third side.');
  }
  // sin B = 1 (to rounding) means exactly one triangle, right-angled at B. Near 1, asin magnifies float
  // noise (0.9999999999999999 → 89.9999988°), which would otherwise look like two triangles.
  const rightAtB = Math.abs(1 - sinB) < 1e-9;
  const B1 = rightAtB ? 90 : asinD(sinB);
  const options = [B1];
  const B2 = 180 - B1;
  if (!rightAtB && A + B2 < 180 - 1e-9) options.push(B2);
  const triangles = options.filter((B) => A + B < 180 - 1e-9).map((B, i) => {
    const C = 180 - A - B;
    const c = (a * sinD(C)) / sinD(A);
    return describe({
      a, b, c, A, B, C,
      lines: [
        first,
        i === 0 ? `B = \\sin^{-1}(${n(sinB)}) = ${n(B, 5)}^\\circ` : `B = 180^\\circ - ${n(B1, 5)}^\\circ = ${n(B, 5)}^\\circ \\text{ (the other angle with the same sine)}`,
        `C = 180^\\circ - A - B = ${n(C, 5)}^\\circ`,
        `c = \\frac{a \\sin C}{\\sin A} = \\frac{${n(a)} \\times \\sin ${n(C, 5)}^\\circ}{\\sin ${n(A)}^\\circ} = ${n(c)}`,
      ],
    });
  });
  const note = triangles.length === 2
    ? 'Two different triangles fit these measurements (the ambiguous case): B can be acute or obtuse.'
    : triangles.length === 1 ? 'Only one triangle fits.' : 'No triangle fits these measurements.';
  return finish(mode, triangles, triangles.length ? null : [first], note);
}

function finish(mode, triangles, failLines = null, note = null) {
  return { mode, triangles, failLines, note, result: triangles.length, steps: { headers: [], rows: [] }, notes: note ? [note] : [], plot: null };
}
