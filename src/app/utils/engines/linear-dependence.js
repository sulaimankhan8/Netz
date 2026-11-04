/**
 * Linear dependence of vectors v₁ … v_k (each entered as a row):
 *   put the vectors as the COLUMNS of a matrix, row-reduce, and look at the rank:
 *     rank = k   linearly independent (only c₁ = … = c_k = 0 solves c₁v₁ + … + c_kv_k = 0)
 *     rank < k   linearly dependent; a free column gives a relation, scaled to whole numbers
 * Also: more vectors than entries (k > n) are always dependent. The relation is checked.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import * as M from '../numeric/matrix';
import { texNumber } from '../numeric/latex';

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const sub = (i) => `v_{${i + 1}}`;

/** Σ cᵢvᵢ in LaTeX: 2v₁ − v₂ + v₃. */
function combo(c) {
  const parts = c.map((x, i) => [x, i]).filter(([x]) => Math.abs(x) > 1e-12);
  return parts.map(([x, i], k) => {
    const mag = Math.abs(x), t = texNumber(mag);
    const s = `${t === '1' ? '' : t}${sub(i)}`;
    return k === 0 ? `${x < 0 ? '-' : ''}${s}` : ` ${x < 0 ? '-' : '+'} ${s}`;
  }).join('') || '0';
}

export function solve({ cells }) {
  const V = M.fromStrings(cells, 'The vectors');
  M.check(V);
  const k = V.length, n = V[0].length;
  if (k < 1) throw new EngineError('Enter at least one vector.');
  const A = M.transpose(V); // vectors as columns
  const { result: R, ops, rank, pivots } = M.rref(A);
  const vecTex = V.map((v, i) => `${sub(i)} = (${v.map((x) => texNumber(x)).join(', ')})`);
  const steps = [
    { title: 'Put the vectors as the columns of a matrix', formula: 'c_1v_1 + c_2v_2 + \\cdots + c_kv_k = 0', lines: [vecTex.join(', \\quad ')] },
  ];
  if (k > n) steps.push({ title: 'More vectors than entries', lines: [`${k} \\text{ vectors in } \\mathbb{R}^{${n}} \\text{ are always dependent (rank can be at most } ${n}\\text{).}`] });

  const independent = rank === k;
  let relation = null, coefficients = null;
  steps.push({ title: 'Compare the rank with the number of vectors', lines: [`\\text{rank} = ${rank}, \\quad k = ${k}`, independent ? '\\text{rank} = k: \\text{ linearly independent}' : '\\text{rank} < k: \\text{ linearly dependent}'] });

  if (!independent) {
    // The first free column j: c_j = 1, pivot unknowns from the reduced rows
    const free = Array.from({ length: k }, (_, j) => j).filter((j) => !pivots.includes(j));
    const j = free[0];
    const c = new Array(k).fill(0);
    c[j] = 1;
    pivots.forEach((p, r) => { c[p] = -R[r][j]; });
    // Whole numbers: multiply by the LCM of the denominators
    let den = 1;
    for (const x of c) { const f = toFraction(x, 1000, 1e-9); if (f) den = lcm(den, f.d); }
    coefficients = c.map((x) => Math.round(x * den * 1e9) / 1e9);
    // First non-zero coefficient positive: 2v₁ − v₂ = 0 rather than −2v₁ + v₂ = 0
    if (coefficients.find((x) => Math.abs(x) > 1e-12) < 0) coefficients = coefficients.map((x) => (x === 0 ? 0 : -x));
    relation = `${combo(coefficients)} = 0`;
    // v_j in terms of the others, when its coefficient is not 0
    const cj = coefficients[j];
    const others = coefficients.map((x, i) => (i === j ? 0 : -x / cj));
    steps.push({
      title: 'Find a relation from a free column',
      lines: [`\\text{Column ${j + 1} has no pivot: put } c_{${j + 1}} = 1 \\text{ and read the others from the reduced rows}`, relation, `${sub(j)} = ${combo(others)}`],
    });
  }

  // Check the relation
  let verified = true;
  if (coefficients) {
    for (let e = 0; e < n; e++) {
      const s = coefficients.reduce((acc, ci, i) => acc + ci * V[i][e], 0);
      if (Math.abs(s) > 1e-7) verified = false;
    }
  }
  return { k, n, V, A, rref: R, ops, rank, independent, relation, coefficients, steps, verified, result: independent ? 'independent' : 'dependent', notes: [], plot: null };
}
