/**
 * Eigenvalues and eigenvectors of a square matrix (2×2 to 4×4), the textbook way:
 *   1. the characteristic equation |A − λI| = 0 (for 2×2 and 3×3 with the trace / minors shortcut)
 *   2. its roots: exact where possible (whole numbers, fractions, surds), complex pairs when they occur
 *   3. for each real λ, solve (A − λI)X = 0: row-reduce, the free unknown(s) give the eigenvector(s)
 * Algebraic multiplicity (repeats of λ) and geometric multiplicity (independent eigenvectors) are both
 * reported. Every pair is checked: A·X = λ·X.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { texNumber, matrixTex } from '../numeric/latex';
import { charPoly, principalMinorSum, nullSpace } from '../numeric/eigen';
import { polyRoots, texOf } from '../symbolic/roots';
import { factorPolynomial, polyTex, primitive } from '../symbolic/algebra';
import { toFraction } from '../numeric/fraction';

const L = '\\lambda';
const num = (v) => (Number.isInteger(v) || toFraction(v, 1000, 1e-9) ? texNumber(v) : texOf(v));
const vecTex = (x) => `\\begin{bmatrix} ${x.map((v) => (Number.isInteger(v) ? String(v) : num(v))).join(' \\\\ ')} \\end{bmatrix}`;

/** A − λI with λ on the diagonal, as LaTeX. */
export function minusLambdaTex(A) {
  return matrixTex(A.map((row, i) => row.map((v, j) => (i !== j ? texNumber(v) : v === 0 ? `-${L}` : `${texNumber(v)} - ${L}`))));
}

/** The characteristic equation with its working (shared with Cayley–Hamilton). */
export function characteristic(A) {
  const n = A.length;
  const c = charPoly(A);
  const lines = [`\\left|A - ${L} I\\right| =${minusLambdaTex(A).replace('\\left[', '\\left|').replace('\\right]', '\\right|')} = 0`];
  if (n === 2) {
    lines.push(`${L}^2 - (\\text{tr}\\,A)${L} + |A| = 0, \\quad \\text{tr}\\,A = ${texNumber(principalMinorSum(A, 1))}, \\ |A| = ${texNumber(principalMinorSum(A, 2))}`);
  } else if (n === 3) {
    lines.push(`${L}^3 - S_1${L}^2 + S_2${L} - |A| = 0`);
    lines.push(`S_1 = \\text{tr}\\,A = ${texNumber(principalMinorSum(A, 1))}, \\quad S_2 = \\text{sum of the } 2 \\times 2 \\text{ principal minors} = ${texNumber(principalMinorSum(A, 2))}, \\quad |A| = ${texNumber(principalMinorSum(A, 3))}`);
  }
  lines.push(`${polyTex(c, L)} = 0`);
  return { c, lines };
}

export function solve({ cells }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  if (!M.isSquare(A)) throw new EngineError('Eigenvalues need a square matrix.');
  const n = A.length;
  if (n < 2 || n > 4) throw new EngineError('Use a 2×2, 3×3 or 4×4 matrix.');

  const { c, lines } = characteristic(A);
  const steps = [{ title: 'Characteristic equation', formula: '|A - \\lambda I| = 0', lines }];

  // Roots: real ones exactly; whatever degree is left over is complex
  const real = polyRoots(c);
  let complex = [];
  const found = real.reduce((s, r) => s + r.m, 0);
  if (found < n) {
    let rest = [...c];
    for (const r of real) for (let k = 0; k < r.m; k++) {
      const out = [rest.at(-1)];
      const desc = [...rest].reverse();
      for (let i = 1; i < desc.length - 1; i++) out.push(desc[i] + out[i - 1] * r.x);
      rest = out.reverse();
    }
    if (rest.length === 3) {
      const [C, B, A2] = rest;
      const re = -B / (2 * A2), im = Math.sqrt(4 * A2 * C - B * B) / (2 * Math.abs(A2));
      const imT = texOf(im);
      complex = [{ re, im, tex: `${Math.abs(re) < 1e-12 ? '' : `${num(re)} `}\\pm ${imT === '1' ? '' : imT}i` }];
    } else {
      complex = [{ tex: '\\text{complex pairs (found numerically)}' }];
    }
  }
  const prim = primitive(c);
  let factored = null;
  if (prim) { try { const f = factorPolynomial(c, L); if (f.factors.length > 1 || f.factors.some((x) => x.m > 1)) factored = f.tex; } catch { /* not factorable here */ } }
  steps.push({
    title: 'Solve for the eigenvalues',
    lines: [
      ...(factored ? [`${factored} = 0`] : []),
      `${L} = ${[...real.map((r) => `${r.tex}${r.m > 1 ? ` \\ (\\text{repeated ${r.m} times})` : ''}`), ...complex.map((z) => z.tex)].join(', \\quad ')}`,
    ],
  });

  // Eigenvectors for each real eigenvalue
  const pairs = [];
  let verified = true;
  for (const r of real) {
    const N = A.map((row, i) => row.map((v, j) => (i === j ? v - r.x : v)));
    const basis = nullSpace(N);
    const { result: R } = M.rref(N);
    for (const x of basis) {
      const Ax = A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
      if (Ax.some((v, i) => Math.abs(v - r.x * x[i]) > 1e-6 * Math.max(1, Math.abs(v)))) verified = false;
    }
    pairs.push({ lambda: r.x, lambdaTex: r.tex, algebraic: r.m, geometric: basis.length, vectors: basis.map(vecTex), raw: basis });
    steps.push({
      title: `Eigenvector for λ = ${r.tex.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\\sqrt\{(\d+)\}/g, '√$1').replace(/\\/g, '')}`,
      formula: '(A - \\lambda I)X = 0',
      lines: [
        `A - (${r.tex})I = ${matrixTex(N)} \\ \\to \\ ${matrixTex(R)}`,
        basis.length ? `X = ${basis.map((x, k) => `${basis.length > 1 ? `t_{${k + 1}}` : 't'}${vecTex(x)}`).join(' + ')}` : '\\text{only } X = 0',
        ...(r.m > basis.length ? [`\\text{λ is repeated ${r.m} times but has only ${basis.length} independent eigenvector${basis.length === 1 ? '' : 's'}.}`] : []),
      ],
    });
  }

  const notes = [];
  if (complex.length) notes.push('Some eigenvalues are complex, so they have no real eigenvectors. Their eigenvectors have complex entries.');
  if (pairs.some((p) => p.algebraic > p.geometric)) notes.push('A repeated eigenvalue with fewer independent eigenvectors than repeats means A cannot be diagonalised.');
  const sum = real.reduce((s, r) => s + r.x * r.m, 0) + complex.reduce((s, z) => s + (z.re ?? 0) * 2, 0);
  steps.push({ title: 'Check', lines: [`\\text{Sum of eigenvalues} = ${texNumber(sum)} = \\text{tr}\\,A = ${texNumber(principalMinorSum(A, 1))}`, '\\text{and } A X = \\lambda X \\text{ for every pair above}'] });
  return { n, A, charTex: `${polyTex(c, L)} = 0`, coeffs: c, eigenvalues: real, complex, pairs, steps, verified, result: real.map((r) => r.x), notes, plot: null };
}
