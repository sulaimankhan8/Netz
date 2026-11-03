/**
 * Pythagoras theorem: the maths for /pythagoras-theorem.
 * Right triangle with legs a, b and hypotenuse c. Give any two; the third is found, then both acute angles
 * (SOH-CAH-TOA), area and perimeter. Give all three to check whether the triangle is right-angled.
 */
import { EngineError } from '../numeric/steps';
import { n, nb, sqrtTex, positive, asinD } from '../numeric/geometry';

export function solve({ a: ta, b: tb, c: tc }) {
  const given = { a: String(ta ?? '').trim(), b: String(tb ?? '').trim(), c: String(tc ?? '').trim() };
  const blanks = Object.keys(given).filter((k) => !given[k]);
  if (blanks.length > 1) throw new EngineError('Enter any two sides; leave the one you want to find empty.');
  const v = {};
  for (const k of Object.keys(given)) if (given[k]) v[k] = positive(given[k], k === 'c' ? 'Hypotenuse c' : `Side ${k}`);

  // All three given: check a² + b² = c²
  if (!blanks.length) {
    const lhs = v.a * v.a + v.b * v.b;
    const rhs = v.c * v.c;
    const right = Math.abs(lhs - rhs) <= 1e-9 * Math.max(1, rhs);
    return {
      mode: 'check', ...v, right,
      lines: ['a^2 + b^2 \\overset{?}{=} c^2', `${nb(v.a)}^2 + ${nb(v.b)}^2 = ${n(lhs)}, \\quad ${nb(v.c)}^2 = ${n(rhs)}`, right ? `${n(lhs)} = ${n(rhs)} \\ \\checkmark` : `${n(lhs)} ${lhs < rhs ? '<' : '>'} ${n(rhs)}`],
      verdict: right
        ? 'Yes: a² + b² = c², so this is a right triangle (the right angle is opposite c).'
        : `No: a² + b² ${lhs < rhs ? '<' : '>'} c², so the angle opposite c is ${lhs < rhs ? 'obtuse (more than 90°)' : 'acute (less than 90°)'}.`,
      result: right, steps: { headers: [], rows: [] }, notes: [], plot: null,
    };
  }

  const unknown = blanks[0];
  let lines;
  if (unknown === 'c') {
    const sq = v.a * v.a + v.b * v.b;
    v.c = Math.sqrt(sq);
    const exact = sqrtTex(sq);
    lines = ['c^2 = a^2 + b^2', `c^2 = ${nb(v.a)}^2 + ${nb(v.b)}^2 = ${n(v.a * v.a)} + ${n(v.b * v.b)} = ${n(sq)}`, `c = \\sqrt{${n(sq)}}${exact && exact !== n(v.c) ? ` = ${exact}` : ''}`];
  } else {
    const other = unknown === 'a' ? 'b' : 'a';
    if (!(v.c > v[other])) throw new EngineError('The hypotenuse c must be the longest side: make c bigger than the other side.');
    const sq = v.c * v.c - v[other] * v[other];
    v[unknown] = Math.sqrt(sq);
    const exact = sqrtTex(sq);
    lines = [`${unknown}^2 = c^2 - ${other}^2`, `${unknown}^2 = ${nb(v.c)}^2 - ${nb(v[other])}^2 = ${n(v.c * v.c)} - ${n(v[other] * v[other])} = ${n(sq)}`, `${unknown} = \\sqrt{${n(sq)}}${exact && exact !== n(v[unknown]) ? ` = ${exact}` : ''}`];
  }

  const A = asinD(v.a / v.c);
  const B = 90 - A;
  return {
    mode: 'find', unknown, a: v.a, b: v.b, c: v.c, lines, value: v[unknown],
    angles: {
      A, B,
      lines: [
        `\\sin A = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{a}{c} = \\frac{${n(v.a)}}{${n(v.c)}} \\Rightarrow A = ${n(A, 5)}^\\circ`,
        `B = 90^\\circ - A = ${n(B, 5)}^\\circ`,
      ],
    },
    area: (v.a * v.b) / 2,
    perimeter: v.a + v.b + v.c,
    result: v[unknown], steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
