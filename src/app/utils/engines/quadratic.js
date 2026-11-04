/**
 * Quadratic equations ax² + bx + c = 0: the maths for /quadratic-equation.
 * Discriminant and nature of roots, roots by the formula (exact surds and complex roots when the
 * coefficients are whole numbers or simple fractions), factor form, sum/product of roots,
 * completing the square, vertex and the data for a graph.
 */
import { EngineError, isZero } from '../numeric/steps';
import { requireNumber, toFraction } from '../numeric/fraction';
import { n, q, simplifySqrt } from '../numeric/geometry';

/** "x^2" terms as LaTeX: 2x^2 - 7x + 3. */
export function polyTex(a, b, c, v = 'x') {
  const term = (k, pow, first) => {
    if (isZero(k)) return '';
    const sign = k < 0 ? '-' : first ? '' : '+';
    const mag = Math.abs(k);
    const coef = pow && Math.abs(mag - 1) < 1e-12 ? '' : q(mag);
    const body = pow === 2 ? `${v}^2` : pow === 1 ? v : '';
    return `${first ? sign : ` ${sign} `}${coef}${body}`;
  };
  let s = term(a, 2, true);
  s += term(b, 1, !s);
  s += term(c, 0, !s);
  return s || '0';
}

/** (q·x − p) for a root p/q, as LaTeX: (2x - 1), (x + 3). */
const factorTex = (f, v = 'x') => {
  const coef = f.d === 1 ? '' : String(f.d);
  if (f.n === 0) return coef ? `${coef}${v}` : v;
  return `(${coef}${v} ${f.n > 0 ? '-' : '+'} ${Math.abs(f.n)})`;
};

export function solve({ a: ta, b: tb, c: tc }) {
  const a = requireNumber(ta, 'a (the x² coefficient)');
  const b = requireNumber(tb, 'b (the x coefficient)');
  const c = requireNumber(tc, 'c (the constant)');
  if (isZero(a)) {
    throw new EngineError(isZero(b)
      ? 'With a = 0 and b = 0 there is no x left to solve for.'
      : `With a = 0 this is not a quadratic but a linear equation: x = −c/b = ${n(-c / b)}.`);
  }

  const D = b * b - 4 * a * c;
  const eq = `${polyTex(a, b, c)} = 0`;
  const lines = {
    discriminant: [`D = b^2 - 4ac = (${q(b)})^2 - 4(${q(a)})(${q(c)}) = ${q(b * b)} - ${q(4 * a * c)} = ${q(D)}`],
    roots: [],
    vertex: [],
    square: [],
  };

  // Exact forms are only attempted when a, b, c are simple fractions
  const rational = [a, b, c].every((v) => toFraction(v, 1000) !== null);
  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);

  let nature, roots, exact = null, factored = null;
  if (D > 1e-12) {
    const s = Math.sqrt(D);
    roots = [(-b + s) / (2 * a), (-b - s) / (2 * a)].sort((x, y) => x - y);
    const fD = rational ? toFraction(D, 1000000) : null;
    const perfect = fD && Number.isInteger(Math.sqrt(fD.n)) && Number.isInteger(Math.sqrt(fD.d));
    nature = perfect ? 'two different rational roots (D is a perfect square)' : 'two different real roots (irrational)';
    lines.roots.push(`x = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{${q(-b)} \\pm \\sqrt{${q(D)}}}{${q(2 * a)}}`);
    if (perfect) {
      lines.roots.push(`x = \\frac{${q(-b)} + ${q(s)}}{${q(2 * a)}} = ${q((-b + s) / (2 * a))} \\quad \\text{or} \\quad x = \\frac{${q(-b)} - ${q(s)}}{${q(2 * a)}} = ${q((-b - s) / (2 * a))}`);
      const [f1, f2] = roots.map((r) => toFraction(r, 1000));
      if (f1 && f2) {
        const lead = a / (f1.d * f2.d);
        factored = `${isZero(lead - 1) ? '' : isZero(lead + 1) ? '-' : q(lead)}${factorTex(f1)}${factorTex(f2)}`;
        if (f1.n === f2.n && f1.d === f2.d) factored = `${isZero(lead - 1) ? '' : q(lead)}${factorTex(f1)}^2`;
      }
    } else if (fD && Number.isInteger(fD.n) && fD.d === 1) {
      // Surd: −b/2a ± (k/2a)√m
      const { k: out, m } = simplifySqrt(fD.n);
      const coef = out / (2 * a);
      const coefTex = Math.abs(Math.abs(coef) - 1) < 1e-12 ? '' : q(Math.abs(coef));
      exact = `${isZero(h) ? '' : `${q(h)} `}\\pm ${coefTex}\\sqrt{${m}}`;
      lines.roots.push(`x = ${exact} \\approx ${n(roots[1])},\\ ${n(roots[0])}`);
    } else {
      lines.roots.push(`x \\approx ${n(roots[1])} \\quad \\text{or} \\quad x \\approx ${n(roots[0])}`);
    }
  } else if (D > -1e-12) {
    nature = 'two equal real roots (one repeated root)';
    roots = [h];
    lines.roots.push(`D = 0 \\Rightarrow x = -\\frac{b}{2a} = -\\frac{${q(b)}}{${q(2 * a)}} = ${q(h)} \\ (\\text{twice})`);
    const f = toFraction(h, 1000);
    if (f) factored = `${isZero(a / (f.d * f.d) - 1) ? '' : q(a / (f.d * f.d))}${factorTex(f)}^2`;
  } else {
    nature = 'no real roots: two complex roots';
    roots = [];
    const im = Math.sqrt(-D) / (2 * Math.abs(a));
    const fD = rational ? toFraction(-D, 1000000) : null;
    let imTex = q(im);
    if (fD && fD.d === 1 && !Number.isInteger(Math.sqrt(fD.n))) {
      const { k: out, m } = simplifySqrt(fD.n);
      const cf = out / (2 * Math.abs(a));
      imTex = `${Math.abs(cf - 1) < 1e-12 ? '' : q(cf)}\\sqrt{${m}}`;
    }
    exact = `${isZero(h) ? '' : `${q(h)} `}\\pm ${imTex === '1' ? '' : imTex}\\,i`;
    // √(negative) = i√(positive)
    const rootNeg = Number.isInteger(Math.sqrt(-D)) ? `${Math.sqrt(-D)}\\,i` : `\\sqrt{${q(-D)}}\\,i`;
    lines.roots.push(`x = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{${q(-b)} \\pm \\sqrt{${q(D)}}}{${q(2 * a)}} = \\frac{${q(-b)} \\pm ${rootNeg}}{${q(2 * a)}}`);
    lines.roots.push(`x = ${exact}`);
  }

  lines.vertex.push(`\\text{Vertex: } h = -\\frac{b}{2a} = ${q(h)}, \\quad k = c - \\frac{b^2}{4a} = ${q(k)}`);
  lines.vertex.push(`\\text{Axis } x = ${q(h)}, \\text{ opens ${a > 0 ? 'upwards (minimum)' : 'downwards (maximum)'}}`);
  lines.square.push(`${eq} \\;\\Rightarrow\\; ${q(a) === '1' ? '' : q(a) === '-1' ? '-' : q(a)}\\left(x ${h < 0 ? '+' : '-'} ${q(Math.abs(h))}\\right)^2 ${k < 0 ? '-' : '+'} ${q(Math.abs(k))} = 0`);

  return {
    a, b, c, D, nature, roots, exact, factored, h, k, eq,
    sum: -b / a, product: c / a,
    lines, result: roots, steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
