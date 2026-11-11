/**
 * Surface and volume integrals: the maths for /surface-integral (Unit 6).
 *   flux    ∬_S F·n dS = ∬ F(r(u, v))·(r_u × r_v) du dv   (outward / upward normal)
 *   scalar  ∬_S f dS = ∬ f(r(u, v)) |r_u × r_v| du dv     (surface area when f = 1)
 *   volume  ∭_V f dV in Cartesian, spherical (r² sin φ) or cylindrical (ρ) coordinates
 * Surfaces: z = g(x, y) over a region, a sphere (or upper half), a cylinder's side, a disc z = h.
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { surface, surfaceIntegral, volumeRegion, volumeIntegral, comp, onlyLetters, XYZ, vecTex } from '../symbolic/vectorint';

const surfArgs = (i) => ({ g: i.g, xlo: i.xlo, xhi: i.xhi, ylo: i.ylo, yhi: i.yhi, a: i.a, h: i.h, half: i.surface === 'hemisphere' });

export function solve(input) {
  const { mode = 'flux', P = '', Q = '', R = '', f = '' } = input;
  const steps = [];
  if (mode === 'volume') {
    const fn = comp(f || '1', 'f');
    onlyLetters([fn], XYZ, 'f');
    const V = volumeRegion(input.region || 'box', input);
    steps.push({ title: 'The region', depth: 0, lines: [V.tex, `f = ${mtex(polish(fn))}`] });
    const r = volumeIntegral(fn, V);
    steps.push({ title: 'Integrate, inside out', formula: '\\iiint_V f\\,dV', depth: 0, lines: [`\\text{integrand} = ${mtex(polish(r.integrand))}`, ...r.lines] });
    return { mode, value: r.tex, number: r.number, steps, notes: r.exact ? [] : ['Worked out numerically (the hand rules could not finish every stage).'], verified: true, result: r.tex };
  }
  const kind = input.surface === 'hemisphere' ? 'sphere' : input.surface || 'graph';
  const S = surface(kind, surfArgs(input));
  if (mode === 'flux') {
    const F = [comp(P, 'P'), comp(Q, 'Q'), comp(R, 'R')];
    onlyLetters(F, XYZ, 'F');
    if (F.every((c) => c.isConstantNode && Number(c.value) === 0)) throw new EngineError('Type at least one component of F.');
    const r = surfaceIntegral(F, S, 'flux');
    steps.push({ title: 'The surface', formula: '\\mathbf{r}(u, v), \\quad \\mathbf{N} = \\mathbf{r}_u \\times \\mathbf{r}_v', depth: 0, lines: [S.tex, `\\mathbf{r} = ${vecTex(S.r)}`, `\\mathbf{N} = ${vecTex(r.N)} \\ (\\text{${kind === 'graph' || kind === 'disc' ? 'upward' : 'outward'}})`] });
    steps.push({ title: 'Flux', formula: '\\iint \\mathbf{F}\\cdot\\mathbf{N}\\,du\\,dv', depth: 0, lines: [`\\mathbf{F}\\cdot\\mathbf{N} = ${mtex(polish(r.integrand))}`, ...r.lines] });
    return { mode, value: r.tex, number: r.number, steps, notes: r.exact ? [] : ['Worked out numerically (the hand rules could not finish every stage).'], verified: true, result: r.tex };
  }
  const fn = comp(f || '1', 'f');
  onlyLetters([fn], XYZ, 'f');
  const r = surfaceIntegral(fn, S, 'scalar');
  steps.push({ title: 'The surface', formula: 'dS = |\\mathbf{r}_u \\times \\mathbf{r}_v|\\,du\\,dv', depth: 0, lines: [S.tex, `\\mathbf{N} = ${vecTex(r.N)}`] });
  steps.push({ title: String(f).trim() ? '∬ f dS' : 'Surface area', depth: 0, lines: [`\\text{integrand} = ${mtex(polish(r.integrand))}`, ...r.lines] });
  return { mode, value: r.tex, number: r.number, steps, notes: r.exact ? [] : ['Worked out numerically (the hand rules could not finish every stage).'], verified: true, result: r.tex };
}
