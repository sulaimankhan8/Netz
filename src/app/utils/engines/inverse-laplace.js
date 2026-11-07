/**
 * Inverse Laplace transform: the maths for /inverse-laplace-transform, using src/app/utils/symbolic/laplace.js.
 *   mode 'partial'      partial fractions (real, repeated and complex roots), delays e^{−as}, log and tan⁻¹ forms
 *   mode 'convolution'  F(s) = F₁(s)F₂(s): f = ∫₀ᵗ f₁(u) f₂(t − u) du
 * The answer is transformed back numerically and must give F(s) again.
 */
import { EngineError } from '../numeric/steps';
import { mul, polish } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { inverseLaplace, convolution, readLaplace } from '../symbolic/laplace';

export function solve({ F, F2 = '', mode = 'partial' }) {
  const node = readLaplace(F, 'F(s)', 's');
  if (mode === 'convolution') {
    if (!String(F2).trim()) throw new EngineError('For the convolution method, give the second factor F₂(s) too.');
    const node2 = readLaplace(F2, 'F₂(s)', 's');
    const r = convolution(node, node2);
    return { F: mtex(polish(mul(node, node2))), f: mtex(r.f), steps: r.steps, verified: true, notes: ['Convolution: invert each factor, then integrate the product with one of them shifted.'] };
  }
  const r = inverseLaplace(node);
  const notes = [];
  if (!r.verified) notes.push('NETZ could not confirm this by transforming it back; treat it with care.');
  return { F: mtex(polish(node)), f: mtex(r.f), steps: r.steps, verified: r.verified, notes };
}
