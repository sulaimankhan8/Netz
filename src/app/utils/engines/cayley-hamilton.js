/**
 * Cayley–Hamilton theorem: every square matrix satisfies its own characteristic equation.
 *   1. the characteristic equation p(λ) = λⁿ + c_{n−1}λⁿ⁻¹ + … + c₀ = 0
 *   2. verify p(A) = Aⁿ + c_{n−1}Aⁿ⁻¹ + … + c₀I = O (the powers of A are shown)
 *   3. use it for the inverse: multiply by A⁻¹ and rearrange (when |A| ≠ 0)
 *        A⁻¹ = −(1/c₀)(Aⁿ⁻¹ + c_{n−1}Aⁿ⁻² + … + c₁I)
 * The inverse is checked: A·A⁻¹ = I.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { texNumber, matrixTex } from '../numeric/latex';
import { polyOfMatrix } from '../numeric/eigen';
import { characteristic } from './eigenvalues';

const mul = (A, B) => M.multiply(A, B).result; // multiply also returns its working; only the product is needed here

const powTex = (k) => (k === 0 ? 'I' : k === 1 ? 'A' : `A^{${k}}`);
/** c₀I + c₁A + … in LaTeX, highest power first, with the coefficients' signs. */
function matrixPolyTex(c) {
  const parts = [];
  for (let k = c.length - 1; k >= 0; k--) {
    if (Math.abs(c[k]) < 1e-12) continue;
    const mag = Math.abs(c[k]), t = texNumber(mag);
    parts.push({ neg: c[k] < 0, s: `${t === '1' ? '' : t}${powTex(k)}` });
  }
  return parts.map((p, i) => (i === 0 ? `${p.neg ? '-' : ''}${p.s}` : ` ${p.neg ? '-' : '+'} ${p.s}`)).join('') || 'O';
}

export function solve({ cells }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  if (!M.isSquare(A)) throw new EngineError('The Cayley–Hamilton theorem is about square matrices.');
  const n = A.length;
  if (n < 2 || n > 4) throw new EngineError('Use a 2×2, 3×3 or 4×4 matrix.');

  const { c, lines } = characteristic(A);
  const steps = [{ title: 'Characteristic equation', formula: '|A - \\lambda I| = 0', lines }];

  // Powers of A
  const powers = [M.identity(n), A];
  for (let k = 2; k <= n; k++) powers.push(mul(powers[k - 1], A));
  steps.push({ title: 'Powers of A', lines: powers.slice(2).map((P, i) => `A^{${i + 2}} = ${matrixTex(P)}`) });

  // p(A) = O
  const pA = polyOfMatrix(c, A);
  const zero = pA.every((row) => row.every((v) => Math.abs(v) < 1e-7));
  steps.push({
    title: 'Replace λ by A (and the constant by a multiple of I)',
    formula: 'p(A) = O',
    lines: [`${matrixPolyTex(c)} = ${matrixTex(pA.map((row) => row.map((v) => (Math.abs(v) < 1e-9 ? 0 : v))))} = O \\ ${zero ? '\\checkmark' : '\\times'}`],
  });

  // Inverse from the theorem
  let inverse = null, inverseOk = true;
  if (Math.abs(c[0]) < 1e-12) {
    steps.push({ title: 'No inverse', lines: ['|A| = 0 \\text{ (the constant term is 0), so } A^{-1} \\text{ does not exist.}'] });
  } else {
    const rest = c.slice(1); // A⁻¹ = −(1/c₀)(Aⁿ⁻¹ + c_{n−1}Aⁿ⁻² + … + c₁I)
    const inner = polyOfMatrix(rest, A);
    inverse = M.scale(inner, -1 / c[0]);
    const check = mul(A, inverse);
    inverseOk = check.every((row, i) => row.every((v, j) => Math.abs(v - (i === j ? 1 : 0)) < 1e-7));
    steps.push({
      title: 'Multiply by A⁻¹ to get the inverse',
      lines: [
        // rest[i] is the coefficient of Aⁱ after multiplying p(A) = O by A⁻¹
        `${matrixPolyTex(rest)} ${c[0] < 0 ? '-' : '+'} ${texNumber(Math.abs(c[0]))}A^{-1} = O`,
        `A^{-1} = ${c[0] > 0 ? '-' : ''}\\frac{1}{${texNumber(Math.abs(c[0]))}}\\left(${matrixPolyTex(rest)}\\right)`,
        `= ${c[0] > 0 ? '-' : ''}\\frac{1}{${texNumber(Math.abs(c[0]))}}${matrixTex(inner)} = ${matrixTex(inverse)}`,
      ],
    });
  }

  return { n, A, charTex: lines.at(-1), coeffs: c, powers: powers.slice(2), pA, satisfied: zero, inverse, steps, verified: zero && inverseOk, result: inverse, notes: [], plot: null };
}
