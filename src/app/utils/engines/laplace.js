/**
 * Laplace transform: the maths for /laplace-transform, using src/app/utils/symbolic/laplace.js.
 * The answer is checked against ∫₀^∞ e^{−st} f(t) dt at two values of s.
 */
import { polish } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { laplace, readLaplace } from '../symbolic/laplace';

export function solve({ f }) {
  const node = readLaplace(f, 'f(t)');
  const r = laplace(node);
  const notes = ['Each term is transformed on its own (the transform is linear), using the table and the shifting rules.'];
  if (!r.verified) notes.push('NETZ could not confirm this numerically; treat it with care.');
  return { f: mtex(polish(node)), F: mtex(r.F), steps: r.steps, verified: r.verified, notes };
}
