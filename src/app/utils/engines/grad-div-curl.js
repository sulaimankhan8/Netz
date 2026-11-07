/**
 * Gradient, divergence, curl: the maths for /grad-div-curl (catalog 6I).
 *   grad φ = (φ_x, φ_y, φ_z); with a point and a direction: the directional derivative ∇φ·â, the greatest rate
 *   |∇φ| and the unit normal ∇φ/|∇φ|
 *   div F = P_x + Q_y + R_z (solenoidal when 0)
 *   curl F = (R_y − Q_z, P_z − R_x, Q_x − P_y) (irrotational when 0)
 *   potential: for an irrotational F, φ with ∇φ = F: ∫P dx, then the y and z parts left over
 */
import { EngineError } from '../numeric/steps';
import { math, sub, add, polish } from '../symbolic/tree';
import { readMulti, partial, divergence, curl, mtex, exactTex, isZero, tidyMulti, lettersOf, evalAt } from '../symbolic/multi';
import { antiderivative } from '../symbolic/ode';

const V = ['x', 'y', 'z'];
const readVec = (t, label) => {
  const s = String(t ?? '').trim();
  if (!s) return null;
  const p = s.replace(/[()[\]⟨⟩<>]/g, '').split(',').map((x) => x.trim());
  if (p.length !== 3 || p.some((x) => x === '')) throw new EngineError(`${label} should be three numbers like 1, -2, 3.`);
  return p.map((x) => { const v = math.evaluate(x.replace(/π/g, 'pi')); if (typeof v !== 'number') throw new EngineError(`${label}: "${x}" is not a number.`); return v; });
};
const comp = (t, label) => { const s = String(t ?? '').trim(); return s ? readMulti(s, label) : math.parse('0'); };
const vecTex = (nodes) => `\\left(${nodes.map((n) => mtex(n)).join(',\\ ')}\\right)`;
const numVec = (vals) => `\\left(${vals.map(exactTex).join(',\\ ')}\\right)`;
const checkVars = (nodes) => { const bad = lettersOf(...nodes).filter((v) => !V.includes(v)); if (bad.length) throw new EngineError(`Use x, y and z only (found ${bad.join(', ')}).`); };

export function solve({ mode = 'grad', phi = '', P = '', Q = '', R = '', point = '', dir = '' }) {
  const steps = [];
  const notes = [];
  const pt = readVec(point, 'The point');
  const scope = pt ? { x: pt[0], y: pt[1], z: pt[2] } : null;
  if (mode === 'grad') {
    const f = readMulti(phi, 'φ');
    checkVars([f]);
    const g = V.map((v) => partial(f, v, V).result);
    steps.push({ title: 'Partial derivatives', formula: '\\nabla\\phi = \\phi_x\\mathbf{i} + \\phi_y\\mathbf{j} + \\phi_z\\mathbf{k}', depth: 0, lines: V.map((v, i) => `\\phi_${v} = ${mtex(g[i])}`) });
    const out = { mode, phi: mtex(polish(f)), result: `\\nabla\\phi = ${vecTex(g)}` };
    if (scope) {
      const gv = g.map((n) => evalAt(n, scope));
      const mag = Math.hypot(...gv);
      steps.push({ title: `At (${pt.join(', ')})`, depth: 0, lines: [`\\nabla\\phi = ${numVec(gv)}, \\qquad |\\nabla\\phi| = ${exactTex(mag)} \\ (\\text{the greatest rate of change})`, mag > 0 ? `\\text{unit normal } \\hat{n} = \\frac{\\nabla\\phi}{|\\nabla\\phi|} = ${numVec(gv.map((v) => v / mag))}` : '\\nabla\\phi = 0 \\text{ here (a stationary point)}'] });
      out.atPoint = `\\nabla\\phi(${pt.join(', ')}) = ${numVec(gv)}`;
      const d = readVec(dir, 'The direction');
      if (d) {
        const len = Math.hypot(...d);
        if (len === 0) throw new EngineError('The direction can\'t be the zero vector.');
        const dd = gv.reduce((s, v, i) => s + (v * d[i]) / len, 0);
        steps.push({ title: 'Directional derivative', formula: 'D_{\\hat a}\\phi = \\nabla\\phi\\cdot\\hat{a}, \\ \\hat a = \\frac{\\vec a}{|\\vec a|}', depth: 0, lines: [`\\hat{a} = \\frac{${numVec(d)}}{${exactTex(len)}}, \\qquad \\nabla\\phi\\cdot\\hat{a} = \\frac{${gv.map((v, i) => `(${exactTex(v)})(${exactTex(d[i])})`).join(' + ')}}{${exactTex(len)}} = ${exactTex(dd)}`] });
        out.directional = exactTex(dd);
      }
    }
    return { ...out, steps, notes, verified: true };
  }
  const F = [comp(P, 'P'), comp(Q, 'Q'), comp(R, 'R')];
  checkVars(F);
  if (F.every((n) => isZero(n, V) && n.toString() === '0')) throw new EngineError('Type at least one component of F.');
  const Ftex = vecTex(F.map((n) => polish(n)));
  if (mode === 'div') {
    const parts = V.map((v, i) => partial(F[i], v, V).result);
    const d = divergence(F, V);
    steps.push({ title: 'Divergence', formula: '\\nabla\\cdot\\vec F = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}', depth: 0, lines: [`\\nabla\\cdot\\vec F = ${parts.map((p) => `(${mtex(p)})`).join(' + ')} = ${mtex(d)}`] });
    const sol = isZero(d, V);
    if (sol) notes.push('div F = 0 everywhere: F is solenoidal.');
    const out = { mode, F: Ftex, result: `\\nabla\\cdot\\vec F = ${mtex(d)}`, solenoidal: sol };
    if (scope) out.atPoint = `\\text{at } (${pt.join(', ')}): \\ ${exactTex(evalAt(d, scope))}`;
    return { ...out, steps, notes, verified: true };
  }
  if (mode === 'curl' || mode === 'potential') {
    const c = curl(F, V);
    const irr = c.every((n) => isZero(n, V));
    steps.push({
      title: 'Curl', formula: '\\nabla\\times\\vec F = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ \\partial_x & \\partial_y & \\partial_z \\\\ P & Q & R \\end{vmatrix}',
      depth: 0, lines: [`\\nabla\\times\\vec F = \\left(R_y - Q_z,\\ P_z - R_x,\\ Q_x - P_y\\right) = ${vecTex(c)}`],
    });
    if (mode === 'curl') {
      if (irr) notes.push('curl F = 0 everywhere: F is irrotational, so F = ∇φ for a scalar potential φ (choose "Scalar potential").');
      const out = { mode, F: Ftex, result: `\\nabla\\times\\vec F = ${vecTex(c)}`, irrotational: irr };
      if (scope) out.atPoint = `\\text{at } (${pt.join(', ')}): \\ ${numVec(c.map((n) => evalAt(n, scope)))}`;
      return { ...out, steps, notes, verified: true };
    }
    if (!irr) throw new EngineError('curl F is not 0, so F is not irrotational and has no scalar potential.');
    // φ = ∫P dx + ∫(Q − ∂y ∫P dx) dy + ∫(R − ∂z(…)) dz
    const I1 = antiderivative(F[0], 'x', V).F;
    const restY = tidyMulti(sub(F[1], math.derivative(I1, 'y')), V);
    const I2 = isZero(restY, V) ? math.parse('0') : antiderivative(restY, 'y', V).F;
    const partialPhi = add(I1, I2);
    const restZ = tidyMulti(sub(F[2], math.derivative(partialPhi, 'z')), V);
    const I3 = isZero(restZ, V) ? math.parse('0') : antiderivative(restZ, 'z', V).F;
    const phiN = tidyMulti(add(partialPhi, I3), V);
    steps.push({ title: 'Scalar potential', formula: '\\vec F = \\nabla\\phi', depth: 0, lines: [`\\int P\\,dx = ${mtex(I1)}`, `\\text{left over in } Q: ${mtex(restY)} \\Rightarrow \\int dy = ${mtex(I2)}`, `\\text{left over in } R: ${mtex(restZ)} \\Rightarrow \\int dz = ${mtex(I3)}`, `\\phi = ${mtex(phiN)} + C`] });
    const ok = V.every((v, i) => isZero(sub(math.derivative(phiN, v), F[i]), V));
    return { mode, F: Ftex, result: `\\phi = ${mtex(phiN)} + C`, steps, notes: ['Check: the gradient of φ gives F back.'], verified: ok };
  }
  throw new EngineError('Choose grad, div, curl or scalar potential.');
}
