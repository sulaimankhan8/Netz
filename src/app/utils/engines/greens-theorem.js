/**
 * Green's theorem in the plane: the maths for /greens-theorem (Unit 6).
 *   ∮_C (M dx + N dy) = ∬_R (∂N/∂x − ∂M/∂y) dA,   C the boundary of R taken anticlockwise.
 *   Regions: a rectangle, a triangle (any three vertices), the disc x² + y² ≤ a², the region between y = g₁(x) and
 *   y = g₂(x) for a ≤ x ≤ b. Both sides are worked out on their own and compared.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, sub, paren, tidy, polish } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { lineIntegral, iterated, comp, onlyLetters, numberIn, readPath } from '../symbolic/vectorint';

const P = (s) => math.parse(String(s));
const pt = (s, label) => { const v = String(s ?? '').replace(/[()]/g, '').split(',').map((x) => numberIn(x, label)); if (v.length !== 2) throw new EngineError(`${label} should be a point like (1, 2).`); return v; };

/** { boundary: path pieces, dims (for ∬, innermost first), map (x, y in the region letters), jac, tex } (shared with the centre-of-mass page) */
export function planeRegion(input) { return region(input); }
function region(input) {
  const kind = input.region || 'rectangle';
  if (kind === 'rectangle') {
    const x0 = numberIn(input.xlo, 'x from'), x1 = numberIn(input.xhi, 'x to'), y0 = numberIn(input.ylo, 'y from'), y1 = numberIn(input.yhi, 'y to');
    if (!(x1 > x0 && y1 > y0)) throw new EngineError('The rectangle needs x from < x to and y from < y to.');
    return { boundary: readPath(`(${x0},${y0}) -> (${x1},${y0}) -> (${x1},${y1}) -> (${x0},${y1}) -> (${x0},${y0})`), dims: [{ v: 'y', lo: numNode(y0), hi: numNode(y1) }, { v: 'x', lo: numNode(x0), hi: numNode(x1) }], map: [sym('x'), sym('y')], jac: num(1), tex: `${exactTex(x0)} \\le x \\le ${exactTex(x1)}, \\ ${exactTex(y0)} \\le y \\le ${exactTex(y1)}` };
  }
  if (kind === 'triangle') {
    let A = pt(input.A, 'Vertex A'), B = pt(input.B, 'Vertex B'), C = pt(input.C, 'Vertex C');
    const area2 = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
    if (Math.abs(area2) < 1e-12) throw new EngineError('The three vertices lie on a line.');
    if (area2 < 0) [B, C] = [C, B]; // anticlockwise
    // (u, v) in the unit square: point = A + u[(B − A) + v(C − B)], dA = u·|det|
    const d1 = [B[0] - A[0], B[1] - A[1]], d2 = [C[0] - B[0], C[1] - B[1]];
    const map = [0, 1].map((k) => tidy(add(numNode(A[k]), mul(sym('u'), add(numNode(d1[k]), mul(sym('v'), numNode(d2[k])))))));
    const det = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);
    const f = (p) => `(${exactTex(p[0])}, ${exactTex(p[1])})`;
    return { boundary: readPath(`(${A}) -> (${B}) -> (${C}) -> (${A})`.replace(/\((-?[\d.e+-]+),(-?[\d.e+-]+)\)/g, '($1,$2)')), dims: [{ v: 'v', lo: num(0), hi: num(1) }, { v: 'u', lo: num(0), hi: num(1) }], map, jac: mul(numNode(det), sym('u')), tex: `\\text{triangle } ${f(A)}, ${f(B)}, ${f(C)}` };
  }
  if (kind === 'circle') {
    const a = numberIn(input.a, 'The radius');
    if (!(a > 0)) throw new EngineError('The radius must be positive.');
    return { boundary: readPath(`x = ${a}*cos(t), y = ${a}*sin(t)`, '0', '2*pi'), dims: [{ v: 'rho', lo: num(0), hi: numNode(a) }, { v: 'theta', lo: num(0), hi: P('2*pi') }], map: [P('rho*cos(theta)'), P('rho*sin(theta)')], jac: sym('rho'), tex: `x^2 + y^2 \\le ${exactTex(a * a)} \\ (dA = \\rho\\,d\\rho\\,d\\theta)` };
  }
  if (kind === 'semicircle') {
    const a = numberIn(input.a, 'The radius');
    if (!(a > 0)) throw new EngineError('The radius must be positive.');
    const boundary = [...readPath(`(${-a},0) -> (${a},0)`), ...readPath(`x = ${a}*cos(t), y = ${a}*sin(t)`, '0', 'pi')];
    return { boundary, dims: [{ v: 'rho', lo: num(0), hi: numNode(a) }, { v: 'theta', lo: num(0), hi: P('pi') }], map: [P('rho*cos(theta)'), P('rho*sin(theta)')], jac: sym('rho'), tex: `x^2 + y^2 \\le ${exactTex(a * a)}, \\ y \\ge 0 \\ (dA = \\rho\\,d\\rho\\,d\\theta)` };
  }
  if (kind === 'between') {
    const g1 = readMulti(input.g1, 'The lower curve'), g2 = readMulti(input.g2, 'The upper curve');
    onlyLetters([g1, g2], ['x'], 'The curves');
    const a = numberIn(input.xlo, 'x from'), b = numberIn(input.xhi, 'x to');
    if (!(b > a)) throw new EngineError('x from must be less than x to.');
    const at = (g, x) => substitute(g, 'x', numNode(x)).evaluate({});
    const pieces = [{ r: [sym('t'), substitute(g1, 'x', sym('t')), num(0)], t0: a, t1: b, label: `y = ${mtex(polish(g1))}, \\ x: ${exactTex(a)} \\to ${exactTex(b)}` }];
    const gb = [at(g1, b), at(g2, b)], ga = [at(g2, a), at(g1, a)];
    if (Math.abs(gb[1] - gb[0]) > 1e-12) pieces.push({ r: [numNode(b), sym('t'), num(0)], t0: gb[0], t1: gb[1], label: `x = ${exactTex(b)}, \\ y: ${exactTex(gb[0])} \\to ${exactTex(gb[1])}` });
    pieces.push({ r: [sym('t'), substitute(g2, 'x', sym('t')), num(0)], t0: b, t1: a, label: `y = ${mtex(polish(g2))}, \\ x: ${exactTex(b)} \\to ${exactTex(a)}` });
    if (Math.abs(ga[1] - ga[0]) > 1e-12) pieces.push({ r: [numNode(a), sym('t'), num(0)], t0: ga[0], t1: ga[1], label: `x = ${exactTex(a)}, \\ y: ${exactTex(ga[0])} \\to ${exactTex(ga[1])}` });
    return { boundary: pieces, dims: [{ v: 'y', lo: g1, hi: g2 }, { v: 'x', lo: numNode(a), hi: numNode(b) }], map: [sym('x'), sym('y')], jac: num(1), tex: `${mtex(polish(g1))} \\le y \\le ${mtex(polish(g2))}, \\ ${exactTex(a)} \\le x \\le ${exactTex(b)}` };
  }
  throw new EngineError('Pick a region.');
}

export function solve(input) {
  const M = comp(input.M, 'M'), N = comp(input.N, 'N');
  onlyLetters([M, N], ['x', 'y'], 'M and N');
  if ([M, N].every((c) => c.isConstantNode && Number(c.value) === 0)) throw new EngineError('Type M or N.');
  const R = region(input);
  const steps = [{ title: 'The theorem', formula: "\\oint_C (M\\,dx + N\\,dy) = \\iint_R \\left(\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}\\right)dA", depth: 0, lines: [`M = ${mtex(polish(M))}, \\quad N = ${mtex(polish(N))}`, `R: ${R.tex}`] }];
  // line integral side: F = (M, N, 0)
  const L = lineIntegral([M, N, num(0)], R.boundary, 'work');
  steps.push({ title: 'Line integral round C (anticlockwise)', depth: 0, lines: [...L.lines, `\\oint_C = ${L.tex}`] });
  // double integral side
  const curlz = tidyMulti(sub(math.derivative(N, 'x'), math.derivative(M, 'y')), ['x', 'y']);
  const integrand = tidyMulti(mul(paren(substitute(substitute(curlz, 'x', paren(R.map[0])), 'y', paren(R.map[1]))), R.jac), R.dims.map((d) => d.v));
  const D = iterated(integrand, R.dims);
  steps.push({ title: 'Double integral over R', formula: '\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}', depth: 0, lines: [`\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y} = ${mtex(polish(curlz))}`, ...(R.jac.isConstantNode ? [] : [`\\text{integrand with } dA = ${mtex(polish(R.jac))}\\,du\\,dv: \\ ${mtex(polish(integrand))}`]), ...D.lines, `\\iint_R = ${D.tex}`] });
  const verified = Math.abs(L.number - D.number) < 1e-6 * Math.max(1, Math.abs(D.number));
  steps.push({ title: 'Compare', depth: 0, lines: [`${L.tex} ${verified ? '=' : '\\neq'} ${D.tex}`] });
  return { line: L.tex, double: D.tex, value: D.exact ? D.tex : L.tex, steps, notes: verified ? [] : ['The two sides did not agree numerically: check that C is the whole boundary.'], verified, result: D.tex };
}
