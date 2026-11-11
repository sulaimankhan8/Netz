/**
 * Horner's method for a real root, digit by digit: the maths for /horner-method (Unit 1).
 *   1. Find the whole number a with a sign change between a and a + 1; diminish the roots by a
 *      (synthetic division repeated: the new coefficients are those of p(x + a)).
 *   2. Multiply the roots by 10 (the k-th coefficient from the top times 10ᵏ); the next digit d is where the new
 *      polynomial changes sign between d and d + 1; diminish by d. Repeat for each decimal place.
 * Also shows Horner's nested evaluation p(c) = (…(aₙc + aₙ₋₁)c + …)c + a₀ at the root found.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';

const val = (a, x) => a.reduce((s, c) => s * x + c, 0);
/** coefficients (high to low) of p(x + h) by repeated synthetic division */
function shift(a, h) {
  const b = [...a], n = b.length - 1;
  for (let k = 0; k < n; k++) for (let i = 1; i <= n - k; i++) b[i] += h * b[i - 1];
  return b;
}

export function solve({ coeffs, places = '3' }) {
  let a = readVector(coeffs, 'The coefficients');
  while (a.length && Math.abs(a[0]) < 1e-14) a.shift();
  if (a.length < 2) throw new EngineError('Give a polynomial (coefficients from the highest power down).');
  const D = Math.max(1, Math.min(6, Math.round(Number(places) || 3)));
  const orig = [...a];
  // whole part: first sign change on 0…20, else −20…0
  let start = null;
  for (let x = 0; x < 50 && start === null; x++) { if (val(a, x) === 0) start = { a: x, exact: true }; else if (val(a, x) * val(a, x + 1) < 0) start = { a: x }; }
  if (start === null) for (let x = -1; x > -50 && start === null; x--) { if (val(a, x) * val(a, x + 1) < 0) start = { a: x }; }
  if (start === null) throw new EngineError('No real root was found between −50 and 50.');
  const steps = [];
  const rows = [];
  let p = shift(a, start.a);
  rows.push({ stage: `diminish by ${start.a}`, coeffs: p.map((c) => Number(c.toPrecision(10))).join(', ') });
  steps.push({ title: 'Whole part', depth: 0, lines: [`p(${start.a}) = ${Number(val(a, start.a).toPrecision(8))}, \\ p(${start.a + 1}) = ${Number(val(a, start.a + 1).toPrecision(8))}: \\ \\text{a root between ${start.a} and ${start.a + 1}}`] });
  const digits = [];
  for (let k = 0; k < D; k++) {
    // multiply roots by 10
    const n = p.length - 1;
    p = p.map((c, i) => c * 10 ** i);
    let d = 0;
    while (d < 9 && val(p, d) * val(p, d + 1) > 0) d++;
    if (val(p, d) === 0) { digits.push(d); break; }
    digits.push(d);
    p = shift(p, d);
    rows.push({ stage: `×10, diminish by ${d}`, coeffs: p.map((c) => Number(c.toPrecision(10))).join(', ') });
    void n;
  }
  const root = Number(`${start.a < 0 && start.a !== 0 ? '' : ''}${start.a}`) + Number(`0.${digits.join('')}`) * (1);
  steps.push({ title: 'Digits', formula: '\\text{multiply the roots by 10, find the next digit, diminish}', depth: 0, lines: [`x \\approx ${root.toFixed(digits.length)}`] });
  // Horner evaluation table at the root
  const evalRows = []; let acc = 0;
  orig.forEach((c, i) => { acc = acc * root + c; evalRows.push(`b_{${orig.length - 1 - i}} = ${Number(acc.toPrecision(8))}`); });
  steps.push({ title: "Horner's scheme at the root", formula: 'p(c) = (\\cdots(a_nc + a_{n-1})c + \\cdots)c + a_0', depth: 0, lines: [evalRows.join(', \\ '), `p(${root.toFixed(digits.length)}) = ${Number(val(orig, root).toPrecision(6))}`] });
  return { root: root.toFixed(digits.length), table: { columns: [{ key: 'stage', label: 'Stage', bold: true }, { key: 'coeffs', label: 'Transformed coefficients', highlight: true }], rows }, steps, notes: ['Each digit is exact (it is not rounded): the root lies between the value shown and the value plus one unit in the last place.'], verified: val(orig, root) * val(orig, root + 10 ** -digits.length) <= 0, result: root.toFixed(digits.length) };
}
