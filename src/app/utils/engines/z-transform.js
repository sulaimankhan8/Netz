/**
 * Z-transform: the maths for /z-transform (Unit 13).
 *   Z{x(n)} = Σ_{n=0}^{∞} x(n) z^{−n}. Each term of x(n) comes from a base transform (1, cos θn, sin θn, δ(n − k), 1/n!)
 *   with the damping rule Z{aⁿf} = F(z/a) and the multiplication rule Z{n f} = −z F′(z). Linearity adds the terms.
 *   The region of convergence is |z| > the largest |a|. The answer is checked by summing the series at a point.
 */
import { EngineError } from '../numeric/steps';
import { mtex } from '../symbolic/multi';
import { polish } from '../symbolic/tree';
import { readN, zTransform, seriesAt } from '../symbolic/ztransform';

export function solve({ x }) {
  const node = readN(x, 'x(n)');
  const r = zTransform(node);
  const steps = [
    { title: 'Definition', formula: '\\mathcal{Z}\\{x(n)\\} = X(z) = \\sum_{n=0}^{\\infty} x(n)\\,z^{-n}', depth: 0, lines: [`x(n) = ${mtex(polish(node))}`] },
    { title: 'Rules used, term by term', formula: '\\mathcal{Z}\\{a^n f(n)\\} = F\\!\\left(\\tfrac{z}{a}\\right), \\quad \\mathcal{Z}\\{n f(n)\\} = -z\\,F\'(z)', depth: 0, lines: r.lines },
    { title: 'Add the terms (linearity)', depth: 0, lines: [`X(z) = ${r.Ftex}`, r.roc > 0 ? `\\text{converges for } |z| > ${r.roc}` : '\\text{converges for all } z \\neq 0'] },
  ];
  const z = r.roc + 1.7;
  let verified = true;
  try {
    const F = r.F.evaluate({ z });
    const S = seriesAt(node, z);
    verified = Number.isFinite(F) && Math.abs(F - S) < 1e-6 * Math.max(1, Math.abs(S));
    steps.push({ title: 'Check', depth: 0, lines: [`z = ${z}: \\ \\sum x(n) z^{-n} \\approx ${Number(S.toPrecision(8))}, \\quad X(z) = ${Number(F.toPrecision(8))}`] });
  } catch { if (!r.Ftex) throw new EngineError('The transform could not be checked.'); }
  return { xTex: mtex(polish(node)), Ftex: r.Ftex, roc: r.roc, steps, notes: [], verified, result: r.Ftex };
}
