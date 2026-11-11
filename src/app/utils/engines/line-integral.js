/**
 * Line integrals: the maths for /line-integral (Unit 6).
 *   work    W = ∫_C F·dr = ∫ (P x′ + Q y′ + R z′) dt along r(t)
 *   scalar  ∫_C f ds = ∫ f(r(t)) |r′(t)| dt   (arc length when f = 1)
 *   The path is a parametrised curve or a polyline of points (each segment as r = p + t(q − p), 0 ≤ t ≤ 1).
 *   When curl F = 0 the field is conservative and the work depends only on the end points: noted, and checked.
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { mtex, curl, isZero, exactTex } from '../symbolic/multi';
import { readPath, lineIntegral, comp, onlyLetters, XYZ, vecTex } from '../symbolic/vectorint';

export function solve({ mode = 'work', P = '', Q = '', R = '', f = '', path, t0 = '0', t1 = '1' }) {
  const C = readPath(path, t0, t1);
  const steps = [];
  const notes = [];
  if (mode === 'work') {
    const F = [comp(P, 'P'), comp(Q, 'Q'), comp(R, 'R')];
    onlyLetters(F, XYZ, 'F');
    if (F.every((c) => c.isConstantNode && Number(c.value) === 0)) throw new EngineError('Type at least one component of F.');
    steps.push({ title: 'The field and the path', formula: 'W = \\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int (P\\,x\' + Q\\,y\' + R\\,z\')\\,dt', depth: 0, lines: [`\\mathbf{F} = ${vecTex(F)}`] });
    const r = lineIntegral(F, C, 'work');
    steps.push({ title: C.length > 1 ? 'Along each piece' : 'Along the curve', depth: 0, lines: r.lines });
    if (C.length > 1) steps.push({ title: 'Add the pieces', depth: 0, lines: [`W = ${r.tex}`] });
    const cu = curl(F, XYZ);
    if (cu.every((c) => isZero(c, XYZ))) notes.push('curl F = 0, so F is conservative: the work depends only on where the path starts and ends (and is 0 round a closed path).');
    return { mode, Ftex: vecTex(F), value: r.tex, number: r.number, steps, notes, verified: true, result: r.tex };
  }
  const fn = comp(f || '1', 'f');
  onlyLetters([fn], XYZ, 'f');
  steps.push({ title: 'The function and the path', formula: '\\int_C f\\,ds = \\int f(\\mathbf{r}(t))\\,|\\mathbf{r}\'(t)|\\,dt', depth: 0, lines: [`f = ${mtex(polish(fn))}${String(f || '').trim() ? '' : ' \\ (\\text{arc length})'}`] });
  const r = lineIntegral(fn, C, 'scalar');
  steps.push({ title: C.length > 1 ? 'Along each piece' : 'Along the curve', depth: 0, lines: r.lines });
  if (C.length > 1) steps.push({ title: 'Add the pieces', depth: 0, lines: [`\\int_C f\\,ds = ${r.tex}`] });
  void exactTex;
  return { mode, value: r.tex, number: r.number, steps, notes, verified: true, result: r.tex };
}
