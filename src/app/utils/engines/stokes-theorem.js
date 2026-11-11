/**
 * Stokes' theorem: the maths for /stokes-theorem (Unit 6).
 *   ∮_C F·dr = ∬_S (curl F)·n dS, C the edge of S taken anticlockwise seen from the side n points to.
 *   Surfaces: a rectangle in the plane z = c, a disc z = h, the upper hemisphere (edge: the circle z = 0), and the
 *   triangle cut from the plane x/a + y/b + z/c = 1 by the axes. Both sides are worked out and compared.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, polish } from '../symbolic/tree';
import { mtex, exactTex, curl } from '../symbolic/multi';
import { numNode } from '../symbolic/ode';
import { lineIntegral, surface, surfaceIntegral, comp, onlyLetters, numberIn, readPath, XYZ, vecTex } from '../symbolic/vectorint';

function setup(input) {
  const kind = input.surface || 'rectangle';
  if (kind === 'rectangle') {
    const x0 = numberIn(input.xlo, 'x from'), x1 = numberIn(input.xhi, 'x to'), y0 = numberIn(input.ylo, 'y from'), y1 = numberIn(input.yhi, 'y to');
    const c = String(input.c ?? '').trim() ? numberIn(input.c, 'z = c') : 0;
    if (!(x1 > x0 && y1 > y0)) throw new EngineError('The rectangle needs x from < x to and y from < y to.');
    const S = { r: [sym('x'), sym('y'), numNode(c)], u: 'y', v: 'x', dims: [{ v: 'y', lo: numNode(y0), hi: numNode(y1) }, { v: 'x', lo: numNode(x0), hi: numNode(x1) }], tex: `z = ${exactTex(c)}, \\ ${exactTex(x0)} \\le x \\le ${exactTex(x1)}, \\ ${exactTex(y0)} \\le y \\le ${exactTex(y1)}`, swap: true };
    return { S, C: readPath(`(${x0},${y0},${c}) -> (${x1},${y0},${c}) -> (${x1},${y1},${c}) -> (${x0},${y1},${c}) -> (${x0},${y0},${c})`) };
  }
  if (kind === 'disc' || kind === 'hemisphere') {
    const a = numberIn(input.a, 'The radius');
    const h = kind === 'disc' && String(input.c ?? '').trim() ? numberIn(input.c, 'z = h') : 0;
    const S = kind === 'disc' ? surface('disc', { a: String(a), h: String(h) }) : surface('sphere', { a: String(a), half: true });
    return { S, C: readPath(`x = ${a}*cos(t), y = ${a}*sin(t), z = ${h}`, '0', '2*pi') };
  }
  if (kind === 'triangle') {
    const a = numberIn(input.ia, 'The x-intercept a'), b = numberIn(input.ib, 'The y-intercept b'), c = numberIn(input.ic, 'The z-intercept c');
    if (!(a > 0 && b > 0 && c > 0)) throw new EngineError('Use positive intercepts (the triangle in the first octant).');
    const S = surface('graph', { g: `${c}*(1 - x/${a} - y/${b})`, xlo: '0', xhi: String(a), ylo: '0', yhi: `${b}*(1 - x/${a})` });
    S.tex = `\\frac{x}{${exactTex(a)}} + \\frac{y}{${exactTex(b)}} + \\frac{z}{${exactTex(c)}} = 1, \\ x, y, z \\ge 0`;
    return { S, C: readPath(`(${a},0,0) -> (0,${b},0) -> (0,0,${c}) -> (${a},0,0)`) };
  }
  throw new EngineError('Pick a surface.');
}

export function solve(input) {
  const F = [comp(input.P, 'P'), comp(input.Q, 'Q'), comp(input.R, 'R')];
  onlyLetters(F, XYZ, 'F');
  if (F.every((c) => c.isConstantNode && Number(c.value) === 0)) throw new EngineError('Type at least one component of F.');
  const { S, C } = setup(input);
  const steps = [{ title: 'The theorem', formula: '\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F})\\cdot\\mathbf{n}\\,dS', depth: 0, lines: [`\\mathbf{F} = ${vecTex(F)}`, `S: ${S.tex}`] }];
  const L = lineIntegral(F, C, 'work');
  steps.push({ title: 'Round the edge C', depth: 0, lines: [...L.lines, `\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = ${L.tex}`] });
  const cu = curl(F, XYZ);
  const Sf = surfaceIntegral(cu, S, 'flux');
  steps.push({ title: 'Flux of curl F through S', formula: '\\nabla \\times \\mathbf{F}', depth: 0, lines: [`\\nabla \\times \\mathbf{F} = ${vecTex(cu)}`, `\\mathbf{N} = ${vecTex(Sf.N)}`, `(\\nabla \\times \\mathbf{F})\\cdot\\mathbf{N} = ${mtex(polish(Sf.integrand))}`, ...Sf.lines, `\\iint_S = ${Sf.tex}`] });
  const verified = Math.abs(L.number - Sf.number) < 1e-6 * Math.max(1, Math.abs(Sf.number));
  steps.push({ title: 'Compare', depth: 0, lines: [`${L.tex} ${verified ? '=' : '\\neq'} ${Sf.tex}`] });
  void math; void num;
  return { line: L.tex, surface: Sf.tex, curlTex: vecTex(cu), value: Sf.exact ? Sf.tex : L.tex, steps, notes: verified ? [] : ['The two sides did not agree numerically.'], verified, result: Sf.tex };
}
