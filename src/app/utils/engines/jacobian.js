/**
 * Jacobians: the maths for /jacobian-calculator (catalog 6D).
 *   J = ∂(u, v)/∂(x, y) = det [[u_x, u_y], [v_x, v_y]]   (3 × 3 for u, v, w in x, y, z)
 * J ≡ 0 means u and v are functionally dependent (one is a function of the other).
 */
import { EngineError } from '../numeric/steps';
import { mul, sub, polish } from '../symbolic/tree';
import { readMulti, jacobianMatrix, determinant, lettersOf, matrixTex, mtex, isZero } from '../symbolic/multi';

const texV = (v) => ({ theta: '\\theta', varphi: '\\varphi', rho: '\\rho' }[v] || v);

/** "u = x + y" → { name: 'u', node }, or a bare expression with the default name. */
function readFn(text, fallback) {
  const s = String(text ?? '').trim();
  const m = s.match(/^\s*([a-zA-Z]\w*)\s*=\s*(.+)$/);
  return m ? { name: m[1], node: readMulti(m[2], m[1]) } : { name: fallback, node: readMulti(s, fallback) };
}

export function solve({ f1, f2, f3 = '', wrt = '' }) {
  const fns = [readFn(f1, 'u'), readFn(f2, 'v')];
  if (String(f3).trim()) fns.push(readFn(f3, 'w'));
  let vars;
  if (String(wrt).trim()) {
    vars = String(wrt).replace(/θ/g, 'theta').replace(/[φϕ]/g, 'varphi').replace(/ρ/g, 'rho').split(/[\s,]+/).filter(Boolean);
  } else {
    vars = lettersOf(...fns.map((f) => f.node));
  }
  if (vars.length !== fns.length) {
    throw new EngineError(`${fns.length} functions need ${fns.length} variables, but ${vars.length ? `found ${vars.join(', ')}` : 'none were found'}. Type them in "with respect to", e.g. ${fns.length === 2 ? 'x, y or r, θ' : 'x, y, z or r, θ, z'}.`);
  }
  const M = jacobianMatrix(fns.map((f) => f.node), vars);
  const det = determinant(M, vars);
  const names = fns.map((f) => f.name).join(', ');
  const steps = [];
  steps.push({
    title: 'Partial derivatives',
    lines: fns.map((f, i) => vars.map((v, j) => `\\frac{\\partial ${f.name}}{\\partial ${texV(v)}} = ${mtex(M[i][j])}`).join(', \\quad ')),
  });
  const symbolic = `\\frac{\\partial(${names})}{\\partial(${vars.map(texV).join(', ')})}`;
  steps.push({ title: 'The Jacobian matrix', formula: `J = ${symbolic}`, lines: [`J = \\begin{vmatrix} ${M.map((r) => r.map((c) => mtex(c)).join(' & ')).join(' \\\\ ')} \\end{vmatrix}`] });
  if (M.length === 2) {
    const raw = sub(mul(M[0][0], M[1][1]), mul(M[0][1], M[1][0]));
    steps.push({ title: 'Expand the determinant', formula: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc', lines: [`J = \\left(${mtex(M[0][0])}\\right)\\left(${mtex(M[1][1])}\\right) - \\left(${mtex(M[0][1])}\\right)\\left(${mtex(M[1][0])}\\right)`, `= ${mtex(polish(raw))}`, `= ${mtex(det)}`] });
  } else {
    steps.push({ title: 'Expand along the first row', formula: 'a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13}', lines: [`J = ${mtex(det)}`] });
  }
  const dependent = isZero(det, vars);
  const notes = [dependent
    ? `J = 0 everywhere, so ${names} are functionally dependent: one of them can be written as a function of the other${fns.length > 2 ? 's' : ''}.`
    : `The inverse Jacobian ∂(${vars.join(', ')})/∂(${names}) is 1/J wherever J ≠ 0, so J × J′ = 1.`];
  return { names, vars: vars.map(texV), symbolic, matrix: matrixTex(M), det: mtex(det), dependent, steps, notes, verified: true };
}
