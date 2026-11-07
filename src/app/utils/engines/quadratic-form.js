/**
 * Quadratic forms: the maths for /quadratic-form (Unit 8 leftovers).
 *   Q = XᵀAX with A symmetric: aᵢᵢ = coefficient of xᵢ², aᵢⱼ = aⱼᵢ = half the coefficient of xᵢxⱼ.
 *   Orthogonal transformation X = NY (N from the eigenvectors) gives the canonical form λ₁y₁² + … + λₙyₙ².
 *   rank = number of non-zero λ, index p = number of positive λ, signature = p − (rank − p).
 *   nature: positive/negative (semi-)definite or indefinite; checked again by the leading principal minors.
 * The form is read as an expression; its matrix comes from values: aᵢᵢ = Q(eᵢ), aᵢⱼ = [Q(eᵢ + eⱼ) − Q(eᵢ) − Q(eⱼ)]/2.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { texNumber } from '../numeric/latex';
import { readMulti, lettersOf, evalAt } from '../symbolic/multi';
import { solve as diagonalize, surdTex } from './diagonalization';

const snap = (v) => { const r = Math.round(v * 1e9) / 1e9; return Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : r; };
const termTex = (c, body, first) => {
  if (Math.abs(c) < 1e-12) return '';
  const s = c < 0 ? '-' : first ? '' : '+';
  const a = Math.abs(c);
  return `${s} ${a === 1 ? '' : texNumber(a)}${body} `;
};

export function solve({ form }) {
  const node = readMulti(form, 'The quadratic form');
  const vars = lettersOf(node);
  if (vars.length < 2 || vars.length > 4) throw new EngineError('Use 2 to 4 variables, e.g. 2x² + 2y² + 3z² + 2xy − 4yz.');
  const n = vars.length;
  const at = (v) => evalAt(node, Object.fromEntries(vars.map((x, i) => [x, v[i]])));
  const unit = (i) => vars.map((_, k) => (k === i ? 1 : 0));
  const A = vars.map((_, i) => vars.map((_, j) => {
    if (i === j) return snap(at(unit(i)));
    const ij = unit(i).map((v, k) => v + unit(j)[k]);
    return snap((at(ij) - at(unit(i)) - at(unit(j))) / 2);
  }));
  if (A.some((r) => r.some((v) => !Number.isFinite(v)))) throw new EngineError('Use numbers as coefficients, e.g. 3x² − 2xy + y².');
  // Is it really XᵀAX? Compare at a few points (catches linear terms, constants and cubes)
  for (const p of [[0.7, -1.3, 0.4, 2.1], [1.9, 0.6, -0.8, -0.5], [-1.1, 2.4, 1.7, 0.3]]) {
    const x = p.slice(0, n);
    const q = x.reduce((s, xi, i) => s + xi * A[i].reduce((t, a, j) => t + a * x[j], 0), 0);
    if (Math.abs(q - at(x)) > 1e-7 * Math.max(1, Math.abs(q))) throw new EngineError('That is not a quadratic form: every term must have degree 2 (like x², xy), with no x, constant or x³ terms.');
  }
  const X = vars.map((v) => (v.length > 1 ? `${v[0]}_{${v.slice(1)}}` : v));
  const Y = vars.map((_, i) => `y_{${i + 1}}`);
  const Atex = `\\begin{bmatrix} ${A.map((r) => r.map(texNumber).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
  const steps = [{
    title: 'Matrix of the form', formula: 'Q = X^{T}AX, \\quad a_{ij} = a_{ji} = \\tfrac12(\\text{coefficient of } x_i x_j)', depth: 0,
    lines: [`A = ${Atex}, \\quad X = \\begin{bmatrix} ${X.join(' \\\\ ')} \\end{bmatrix}`],
  }];
  const d = diagonalize({ cells: A.map((r) => r.map(String)) });
  if (!d.diagonalizable) throw new EngineError('Could not reduce this form.');
  steps.push(...d.steps.map((s) => ({ ...s, depth: 1 })));
  const lambdas = d.result;
  const canonical = lambdas.reduce((s, l, i) => s + termTex(l, `${Y[i]}^2`, s === ''), '').trim() || '0';
  const rank = lambdas.filter((l) => Math.abs(l) > 1e-9).length;
  const pos = lambdas.filter((l) => l > 1e-9).length;
  const neg = rank - pos;
  const nature = rank === n && neg === 0 ? 'positive definite' : rank === n && pos === 0 ? 'negative definite' : neg === 0 ? 'positive semi-definite' : pos === 0 ? 'negative semi-definite' : 'indefinite';
  steps.push({
    title: 'Canonical form', formula: 'X = NY \\ \\Rightarrow \\ Q = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2', depth: 0,
    lines: [`N = ${d.Ntex}`, `Q = ${canonical}`],
  });
  steps.push({
    title: 'Rank, index, signature and nature', depth: 0,
    lines: [`\\text{rank } r = ${rank}, \\quad \\text{index } p = ${pos}, \\quad \\text{signature } s = p - (r - p) = ${pos - neg}`, `\\text{Nature: ${nature}}`],
  });
  // Sylvester: leading principal minors
  const minors = Array.from({ length: n }, (_, k) => snap(M.det(A.slice(0, k + 1).map((r) => r.slice(0, k + 1)))));
  steps.push({
    title: 'Check by principal minors', formula: 'D_1, D_2, \\ldots, D_n', depth: 0,
    lines: [minors.map((m, k) => `D_{${k + 1}} = ${texNumber(m)}`).join(', \\quad '),
      minors.every((m) => m > 0) ? '\\text{All positive: positive definite } \\checkmark'
        : minors.every((m, k) => (k % 2 === 0 ? m < 0 : m > 0)) ? '\\text{Signs alternate } -, +, -, \\ldots \\text{: negative definite } \\checkmark'
          : minors.some((m) => Math.abs(m) < 1e-12) ? '\\text{A zero minor: the eigenvalues decide (semi-definite or indefinite).}'
            : '\\text{Neither pattern: indefinite } \\checkmark'],
  });
  return {
    A, Atex, vars, canonical, rank, index: pos, signature: pos - neg, nature, lambdas: lambdas.map(surdTex), Ntex: d.Ntex,
    steps, notes: [`Q is ${nature}: ${nature.startsWith('positive definite') ? 'Q > 0 for every X ≠ 0.' : nature.startsWith('negative definite') ? 'Q < 0 for every X ≠ 0.' : nature === 'indefinite' ? 'Q takes both positive and negative values.' : 'Q never changes sign but is 0 for some X ≠ 0.'}`],
    verified: d.verified, result: canonical,
  };
}
