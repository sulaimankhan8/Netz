/**
 * Circles, x² + y² + 2gx + 2fy + c = 0 with centre (−g, −f) and radius √(g² + f² − c):
 *   from     centre and radius; a diameter's end points; three points on the circle; or a general equation
 *   point    whether P is inside, on or outside (the sign of S₁ = x₁² + y₁² + 2gx₁ + 2fy₁ + c), the tangent
 *            at P when it is on the circle (xx₁ + yy₁ + g(x + x₁) + f(y + y₁) + c = 0), the length of the
 *            tangent from P when it is outside (√S₁)
 * Equations are read by readQuadratic, shared with the conic sections page.
 */
import { EngineError } from '../numeric/steps';
import { n, q, sqrtTex } from '../numeric/geometry';
import { readNumber } from './input';
import { toFraction } from '../numeric/fraction';
import { parse, variablesOf, sub, paren } from '../symbolic/tree';

const close = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const rt = (sq) => sqrtTex(sq) ?? n(Math.sqrt(sq));
// Coefficients come from floating-point evaluation: snap 0.1111111111 back to 1/9 exactly
const snap = (v) => {
  if (Math.abs(v) < 1e-12) return 0;
  const fr = toFraction(v, 10000, 1e-10);
  return fr ? fr.n / fr.d : v;
};

/**
 * Coefficients of Ax² + Bxy + Cy² + Dx + Ey + F = 0 from an equation in x and y (either side may have terms).
 * Found by evaluating at a few points, then checked at others so cubes or functions are refused.
 */
export function readQuadratic(text) {
  const s = String(text ?? '').trim();
  if (!s) throw new EngineError('Enter an equation in x and y.');
  const sides = s.split('=');
  if (sides.length !== 2) throw new EngineError('Write one equation with one = sign.');
  // xy means x·y (as in xy = 1)
  const split = (t) => t.replace(/([xy])(?=[xy])/g, '$1*');
  const L = parse(split(sides[0]), 'The left side'), R = parse(split(sides[1]), 'The right side');
  const extra =[...new Set([...variablesOf(L), ...variablesOf(R)])].filter((v) => v !== 'x' && v !== 'y');
  if (extra.length) throw new EngineError(`Use only x and y (this also uses ${extra.join(', ')}).`);
  const h = sub(paren(L), paren(R));
  const f = (x, y) => { const v = h.evaluate({ x, y }); if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError('The equation is not defined everywhere: use powers of x and y only.'); return v; };
  const F = f(0, 0);
  const D = (f(1, 0) - f(-1, 0)) / 2, A = (f(1, 0) + f(-1, 0)) / 2 - F;
  const E = (f(0, 1) - f(0, -1)) / 2, C = (f(0, 1) + f(0, -1)) / 2 - F;
  const B = f(1, 1) - (A + C + D + E + F);
  const coef = [A, B, C, D, E, F].map(snap);
  const model = (x, y) => coef[0] * x * x + coef[1] * x * y + coef[2] * y * y + coef[3] * x + coef[4] * y + coef[5];
  for (const [x, y] of [[2, 3], [-1.5, 2.5], [3.7, -0.4], [0.3, 4.1]]) {
    if (Math.abs(f(x, y) - model(x, y)) > 1e-7 * Math.max(1, Math.abs(f(x, y)))) throw new EngineError('This is not a second-degree equation in x and y (it has higher powers, roots or functions).');
  }
  const [a, b, c, d, e, ff] = coef;
  return { A: a, B: b, C: c, D: d, E: e, F: ff };
}

/** x² + y² + 2gx + 2fy + c = 0 in LaTeX. */
export function generalTex(g, f, c) {
  const t = (k, s) => (Math.abs(k) < 1e-12 ? '' : ` ${k < 0 ? '-' : '+'} ${q(Math.abs(k)) === '1' && s ? '' : q(Math.abs(k))}${s}`);
  return `x^2 + y^2${t(2 * g, 'x')}${t(2 * f, 'y')}${t(c, '')} = 0`;
}
/** (x − h)² + (y − k)² = r² in LaTeX. */
export function standardTex(h, k, r2) {
  const b = (v, s) => (Math.abs(v) < 1e-12 ? `${s}^2` : `\\left(${s} ${v > 0 ? '-' : '+'} ${q(Math.abs(v))}\\right)^2`);
  return `${b(h, 'x')} + ${b(k, 'y')} = ${q(r2)}`;
}
const pt = (x, y) => `(${q(x)}, ${q(y)})`;

export function solve({ from = 'centre', h: th = '', k: tk = '', r: tr = '', x1 = '', y1 = '', x2 = '', y2 = '', x3 = '', y3 = '', eq = '', px = '', py = '' }) {
  const steps = [];
  let g, f, c;
  if (from === 'centre') {
    const h = readNumber(th, 'The centre h'), k = readNumber(tk, 'The centre k'), r = readNumber(tr, 'The radius r');
    if (!(r > 0)) throw new EngineError('The radius must be more than 0.');
    g = -h; f = -k; c = h * h + k * k - r * r;
    steps.push({ title: 'Standard form', formula: '(x - h)^2 + (y - k)^2 = r^2', lines: [standardTex(h, k, r * r)] });
    steps.push({ title: 'Expand to the general form', lines: [generalTex(g, f, c)] });
  } else if (from === 'diameter') {
    const a = [readNumber(x1, 'x₁'), readNumber(y1, 'y₁')], b = [readNumber(x2, 'x₂'), readNumber(y2, 'y₂')];
    if (a[0] === b[0] && a[1] === b[1]) throw new EngineError('The two ends of a diameter must be different points.');
    g = -(a[0] + b[0]) / 2; f = -(a[1] + b[1]) / 2; c = a[0] * b[0] + a[1] * b[1];
    steps.push({ title: 'Diameter form', formula: '(x - x_1)(x - x_2) + (y - y_1)(y - y_2) = 0', lines: [`(x - ${q(a[0])})(x - ${q(b[0])}) + (y - ${q(a[1])})(y - ${q(b[1])}) = 0`.replace(/- -/g, '+ '), generalTex(g, f, c)] });
  } else if (from === 'three') {
    const P = [[x1, y1], [x2, y2], [x3, y3]].map(([a, b], i) => [readNumber(a, `x${'₁₂₃'[i]}`), readNumber(b, `y${'₁₂₃'[i]}`)]);
    // x² + y² + Dx + Ey + F = 0 through each point: a 3×3 linear system in D, E, F
    const M = P.map(([x, y]) => [x, y, 1, -(x * x + y * y)]);
    const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const base = M.map((r) => r.slice(0, 3)), dt = det3(base);
    if (Math.abs(dt) < 1e-12) throw new EngineError('These three points are on one straight line, so no circle passes through all three.');
    const col = (j) => det3(base.map((r, i) => r.map((v, k) => (k === j ? M[i][3] : v))));
    const D = col(0) / dt, E = col(1) / dt, F = col(2) / dt;
    g = D / 2; f = E / 2; c = F;
    steps.push({
      title: 'Put each point into x² + y² + 2gx + 2fy + c = 0',
      lines: P.map(([x, y]) => `${q(2 * x)}g + ${q(2 * y)}f + c = ${q(-(x * x + y * y))}`.replace(/\+ -/g, '- ')),
    });
    steps.push({ title: 'Solve the three equations', lines: [`g = ${q(g)}, \\quad f = ${q(f)}, \\quad c = ${q(c)}`, generalTex(g, f, c)] });
  } else if (from === 'general') {
    const Q = readQuadratic(eq);
    if (Math.abs(Q.B) > 1e-12 || Math.abs(Q.A - Q.C) > 1e-12 || Math.abs(Q.A) < 1e-12) throw new EngineError('For a circle the x² and y² terms need equal coefficients and there can be no xy term. Use the Conic Sections page for other curves.');
    g = Q.D / (2 * Q.A); f = Q.E / (2 * Q.A); c = Q.F / Q.A;
    if (Math.abs(Q.A - 1) > 1e-12) steps.push({ title: `Divide by ${q(Q.A)} so x² and y² have coefficient 1`, lines: [generalTex(g, f, c)] });
    steps.push({ title: 'Compare with x² + y² + 2gx + 2fy + c = 0', lines: [`2g = ${q(2 * g)}, \\ 2f = ${q(2 * f)} \\Rightarrow g = ${q(g)}, \\ f = ${q(f)}, \\ c = ${q(c)}`] });
  } else {
    throw new EngineError('Choose how the circle is given.');
  }

  const r2 = g * g + f * f - c;
  if (r2 < -1e-12) throw new EngineError(`g² + f² − c = ${q(r2)} is negative, so this equation has no real points: it is not a circle.`);
  if (Math.abs(r2) < 1e-12) throw new EngineError('g² + f² − c = 0: the "circle" is a single point (radius 0).');
  const h = -g, k = -f, r = Math.sqrt(r2);
  steps.push({ title: 'Centre and radius', formula: '\\text{centre } (-g, -f), \\quad r = \\sqrt{g^2 + f^2 - c}', lines: [`\\text{Centre } ${pt(h, k)}, \\quad r = \\sqrt{${q(g * g)} + ${q(f * f)} - ${c < 0 ? `(${q(c)})` : q(c)}} = \\sqrt{${q(r2)}} = ${rt(r2)}`] });

  // A point P
  let point = null;
  if (String(px ?? '').trim() || String(py ?? '').trim()) {
    const X = readNumber(px, 'The point x'), Y = readNumber(py, 'The point y');
    const S1 = X * X + Y * Y + 2 * g * X + 2 * f * Y + c;
    const where = Math.abs(S1) < 1e-9 ? 'on' : S1 < 0 ? 'inside' : 'outside';
    const lines = [`S_1 = ${q(X)}^2 + ${q(Y)}^2 + ${q(2 * g)}(${q(X)}) + ${q(2 * f)}(${q(Y)}) + ${q(c)} = ${q(S1)}`.replace(/\+ -/g, '- '), `S_1 ${where === 'on' ? '= 0: \\text{ P is on the circle}' : where === 'inside' ? '< 0: \\text{ P is inside the circle}' : '> 0: \\text{ P is outside the circle}'}`];
    point = { x: X, y: Y, S1, where };
    if (where === 'on') {
      // Tangent: (X + g)x + (Y + f)y + (gX + fY + c) = 0
      const a = X + g, b = Y + f, cc = g * X + f * Y + c;
      const t = (v, s, first) => (Math.abs(v) < 1e-12 ? '' : `${first ? (v < 0 ? '-' : '') : v < 0 ? ' - ' : ' + '}${q(Math.abs(v)) === '1' && s ? '' : q(Math.abs(v))}${s}`);
      const tan = `${t(a, 'x', true)}${t(b, 'y', !Math.abs(a))}${t(cc, '', false)} = 0`;
      point.tangent = tan;
      lines.push(`\\text{Tangent at P: } xx_1 + yy_1 + g(x + x_1) + f(y + y_1) + c = 0`, tan);
    } else if (where === 'outside') {
      point.tangentLength = Math.sqrt(S1);
      lines.push(`\\text{Length of the tangent from P} = \\sqrt{S_1} = ${rt(S1)}`);
    }
    steps.push({ title: 'Where is the point?', lines });
  }

  // Check: three points of the circle satisfy the equation
  const on = (t) => [h + r * Math.cos(t), k + r * Math.sin(t)];
  const verified = [0.3, 2.1, 4.4].every((t) => { const [x, y] = on(t); return Math.abs(x * x + y * y + 2 * g * x + 2 * f * y + c) < 1e-7 * Math.max(1, r2); });
  return {
    from, g, f, c, h, k, r, r2, centreTex: pt(h, k), radiusTex: rt(r2), general: generalTex(g, f, c), standard: standardTex(h, k, r2),
    point, steps, verified, result: { h, k, r }, notes: [], plot: null,
  };
}
