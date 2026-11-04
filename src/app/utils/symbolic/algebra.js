/**
 * Factoring polynomials in one variable over the rationals, the way a textbook does it, with steps:
 *   1. take out the common factor (number and power of x)
 *   2. name the identity when there is one: difference of squares, sum/difference of cubes, perfect square
 *   3. quadratics: split the middle term (the "ac method")
 *   4. cubic and higher: the factor theorem (try ± p/q), then synthetic division, repeat
 * What is left has no rational roots (an "irreducible" factor, e.g. x² + 4). Every result is checked by
 * multiplying the factors back out.
 * Polynomials are ascending coefficient arrays: [c0, c1, c2] = c0 + c1·x + c2·x².
 */
import { toFraction } from '../numeric/fraction';
import { polyMul } from './poly';

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const trim = (c) => { const d = [...c]; while (d.length > 1 && Math.abs(d.at(-1)) < 1e-12) d.pop(); return d; };
const deg = (c) => trim(c).length - 1;
const evalPoly = (c, x) => c.reduceRight((acc, k) => acc * x + k, 0);

export const fracTex = (v) => {
  const f = toFraction(v, 100000, 1e-9);
  if (!f) return String(Number(v.toPrecision(6)));
  return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
};

/** LaTeX of an ascending polynomial in v, highest power first: 2x^{2} - 3x + 1. */
export function polyTex(c, v = 'x') {
  const t = trim(c);
  const terms = [];
  for (let k = t.length - 1; k >= 0; k--) {
    const a = t[k];
    if (Math.abs(a) < 1e-12) continue;
    const mag = Math.abs(a);
    const body = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    const coef = body && Math.abs(mag - 1) < 1e-12 ? '' : fracTex(mag);
    terms.push({ neg: a < 0, s: `${coef}${body}` });
  }
  if (!terms.length) return '0';
  return terms.map((p, i) => (i === 0 ? (p.neg ? `-${p.s}` : p.s) : ` ${p.neg ? '-' : '+'} ${p.s}`)).join('');
}
const bracket = (t) => `\\left(${t}\\right)`;

/** Integer coefficients and the rational factor taken out: c = content · ints, ints primitive with positive lead. */
export function primitive(c) {
  const t = trim(c);
  let den = 1;
  for (const k of t) {
    const f = toFraction(k, 100000, 1e-9);
    if (!f) return null;
    den = lcm(den, f.d);
  }
  const ints = t.map((k) => Math.round(k * den));
  let g = 0;
  for (const k of ints) g = gcd(g, k);
  if (!g) return { content: 0, ints: [0] };
  if (ints.at(-1) < 0) g = -g;
  return { content: g / den, ints: ints.map((k) => k / g) };
}

/** Exact division of integer polynomial p by (q·x − r): { quotient } or null. Synthetic division on r/q. */
function divideLinear(p, q, r) {
  const desc = [...p].reverse();
  const out = [desc[0] / q];
  let carry = desc[0];
  const rows = [desc[0]];
  for (let i = 1; i < desc.length; i++) {
    carry = desc[i] + carry * (r / q);
    rows.push(carry);
    if (i < desc.length - 1) out.push(carry / q);
  }
  if (Math.abs(rows.at(-1)) > 1e-9) return null;
  return { quotient: out.reverse(), row: rows };
}

/** Rational roots p/q of an integer polynomial (candidates ± divisors of c0 over divisors of the lead). */
function rationalRoot(p) {
  const divisors = (n) => { n = Math.abs(n); const d = []; for (let i = 1; i <= Math.min(n, 100000); i++) if (n % i === 0) d.push(i); return d.length ? d : [1]; };
  const scale = Math.max(1, ...p.map(Math.abs));
  const cands = [];
  for (const a of divisors(p[0])) for (const b of divisors(p.at(-1))) { cands.push([a, b], [-a, b]); }
  cands.sort((u, w) => Math.abs(u[0] / u[1]) - Math.abs(w[0] / w[1]) || w[0] - u[0]);
  for (const [a, b] of cands) {
    if (gcd(a, b) !== 1) continue;
    if (Math.abs(evalPoly(p, a / b)) < 1e-9 * scale) return { r: a, q: b, tried: cands.length };
  }
  return null;
}

const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
const isCube = (n) => Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n;

/**
 * Factor a polynomial (ascending coefficients). Returns
 *   { content, xPower, factors: [{ c: ascending ints, m }], steps: [{ title, lines }], tex, verified }.
 */
export function factorPolynomial(coeffs, v = 'x') {
  const steps = [];
  const prim = primitive(coeffs);
  if (!prim) throw new Error('Coefficients must be exact numbers (whole numbers or fractions).');
  if (prim.content === 0) return { content: 0, xPower: 0, factors: [], steps, tex: '0', verified: true };
  let { content, ints: p } = prim;
  let xPower = 0;
  while (p.length > 1 && p[0] === 0) { xPower++; p = p.slice(1); }
  const factors = [];
  const add = (c, m = 1) => {
    const key = c.join(',');
    const e = factors.find((f) => f.c.join(',') === key);
    if (e) e.m += m; else factors.push({ c, m });
  };

  // 1. Common factor
  const commonTex = `${content === 1 ? '' : content === -1 ? '-' : fracTex(content)}${xPower ? (xPower === 1 ? v : `${v}^{${xPower}}`) : ''}`;
  if (commonTex) {
    steps.push({ title: 'Take out the common factor', lines: [`${polyTex(coeffs, v)} = ${commonTex}${bracket(polyTex(p, v))}`] });
  }

  // 2. Identities on what is left (only when it is a two- or three-term special form)
  // 2–4. Each piece: a named identity if it is one, else the ac method (quadratics) or the factor theorem
  const queue = [p];
  while (queue.length) {
    const q = queue.shift();
    const d = deg(q);
    if (d <= 0) continue;
    if (d === 1) { add(normalLinear(q)); continue; }
    const id = identity(q, v);
    if (id) { steps.push(id.step); queue.unshift(...id.parts); continue; }
    if (d === 2) {
      const [c, b, a] = q;
      const disc = b * b - 4 * a * c;
      if (isSquare(disc)) {
        const sq = Math.sqrt(disc);
        // roots (−b ± √D)/(2a) as reduced fractions r/s, factors (s x − r)
        const f1 = reduce(-b + sq, 2 * a), f2 = reduce(-b - sq, 2 * a);
        const L1 = [-f1.n, f1.d], L2 = [-f2.n, f2.d];
        const lead = a / (f1.d * f2.d); // whole number by Gauss's lemma (1 for primitive q)
        if (lead !== 1) add([lead]);
        steps.push(acStep(q, v));
        add(L1); add(L2);
      } else {
        add(q);
        steps.push({ title: `${bracket(polyTex(q, v))} does not factor further`, lines: [`b^2 - 4ac = ${disc} ${disc < 0 ? '< 0 \\text{: no real roots}' : '\\text{ is not a perfect square: no rational roots}'}`] });
      }
      continue;
    }
    const rr = rationalRoot(q);
    if (!rr) {
      add(q);
      steps.push({ title: `${bracket(polyTex(q, v))} has no rational roots`, lines: ['\\text{None of the candidates } \\pm\\frac{p}{q} \\text{ makes it zero, so it does not factor over the rationals.}'] });
      continue;
    }
    const { r, q: s } = rr;
    const dv = divideLinear(q, s, r);
    const rootTex = fracTex(r / s);
    steps.push({
      title: `Factor theorem: f(${rootTex}) = 0`,
      formula: 'f(a) = 0 \\Rightarrow (x - a) \\text{ is a factor}',
      lines: [
        `f(${rootTex}) = ${polyTex(q, v).replace(new RegExp(v, 'g'), `\\left(${rootTex}\\right)`)} = 0`,
        `\\text{so } ${bracket(polyTex([-r, s], v))} \\text{ is a factor. Divide (synthetic division):}`,
        `${polyTex(q, v)} = ${bracket(polyTex([-r, s], v))}${bracket(polyTex(dv.quotient, v))}`,
      ],
      synthetic: { root: r / s, rootTex, coeffs: [...q].reverse(), row: dv.row },
    });
    add([-r, s]);
    queue.unshift(trim(dv.quotient));
  }

  // Linear factors first, smallest root first and the positive one on a tie, as textbooks write them:
  // (x + 2)(x + 3), (x − 1)(x − 2)(x − 3), (x − 2)(x + 2). Then the rest by degree.
  const root = (f) => -f.c[0] / f.c[1];
  factors.sort((a, b) => a.c.length - b.c.length || (a.c.length === 2 ? Math.abs(root(a)) - Math.abs(root(b)) || root(b) - root(a) : 0));
  const constants = factors.filter((f) => f.c.length === 1);
  for (const k of constants) content *= k.c[0] ** k.m;
  const real = factors.filter((f) => f.c.length > 1);
  const tex = factorTex(content, xPower, real, v);

  // Check: multiply everything back
  let back = [content];
  for (let i = 0; i < xPower; i++) back = polyMul(back, [0, 1]);
  for (const f of real) for (let i = 0; i < f.m; i++) back = polyMul(back, f.c);
  const orig = trim(coeffs);
  const verified = back.length === orig.length && back.every((k, i) => Math.abs(k - orig[i]) <= 1e-9 * Math.max(1, Math.abs(orig[i])));
  return { content, xPower, factors: real, steps, tex, verified };
}

/**
 * Named identities on an integer polynomial: difference of squares a²xⁿ − b² (n even),
 * sum/difference of cubes a³xⁿ ± b³ (n a multiple of 3), perfect square trinomial.
 * Returns { step, parts: [polynomials] } or null.
 */
function identity(q, v) {
  const n = deg(q);
  const nz = q.map((k, i) => [k, i]).filter(([k]) => k !== 0);
  const power = (k) => (k === 1 ? v : `${v}^{${k}}`);
  if (nz.length === 2 && nz[0][1] === 0 && n >= 2) {
    const [a0, an] = [q[0], q[n]];
    if (n % 2 === 0 && a0 < 0 && isSquare(an) && isSquare(-a0)) {
      const A = Math.sqrt(an), B = Math.sqrt(-a0), h = n / 2;
      const s = `${A === 1 ? '' : A}${power(h)}`;
      const minus = new Array(h + 1).fill(0); minus[0] = -B; minus[h] = A;
      const plus = new Array(h + 1).fill(0); plus[0] = B; plus[h] = A;
      return {
        step: { title: 'Difference of two squares', formula: 'a^2 - b^2 = (a - b)(a + b)', lines: [`${polyTex(q, v)} = \\left(${s}\\right)^2 - ${B}^2 = \\left(${s} - ${B}\\right)\\left(${s} + ${B}\\right)`] },
        parts: [minus, plus],
      };
    }
    if (n % 3 === 0 && isCube(an) && isCube(Math.abs(a0))) {
      const A = Math.round(Math.cbrt(an)), B = Math.round(Math.cbrt(Math.abs(a0))), t = n / 3;
      const sum = a0 > 0, sg = sum ? 1 : -1;
      const lin = new Array(t + 1).fill(0); lin[0] = sg * B; lin[t] = A;
      const quad = new Array(2 * t + 1).fill(0); quad[0] = B * B; quad[t] = -sg * A * B; quad[2 * t] = A * A;
      return {
        step: {
          title: sum ? 'Sum of two cubes' : 'Difference of two cubes',
          formula: sum ? 'a^3 + b^3 = (a + b)(a^2 - ab + b^2)' : 'a^3 - b^3 = (a - b)(a^2 + ab + b^2)',
          lines: [`${polyTex(q, v)} = \\left(${A === 1 ? '' : A}${power(t)}\\right)^3 ${sum ? '+' : '-'} ${B}^3 = ${bracket(polyTex(lin, v))}${bracket(polyTex(quad, v))}`],
        },
        parts: [lin, quad],
      };
    }
  }
  if (n === 2 && q[1] !== 0 && isSquare(q[2]) && isSquare(q[0]) && Math.abs(q[1]) === 2 * Math.sqrt(q[2] * q[0])) {
    const A = Math.sqrt(q[2]), B = Math.sqrt(q[0]) * Math.sign(q[1]);
    const lin = [B, A];
    return {
      step: { title: 'Perfect square', formula: 'a^2 \\pm 2ab + b^2 = (a \\pm b)^2', lines: [`${polyTex(q, v)} = ${bracket(polyTex(lin, v))}^2`] },
      parts: [lin, lin],
    };
  }
  return null;
}

function reduce(n, d) { const g = gcd(n, d) || 1; let a = n / g, b = d / g; if (b < 0) { a = -a; b = -b; } return { n: a, d: b }; }
/** Linear factor with positive x-coefficient and whole numbers. */
function normalLinear(q) { const p = primitive(q); return p.ints; }

/** The "ac method" for a x² + b x + c with a perfect-square discriminant. */
function acStep(q, v) {
  const [c, b, a] = q;
  const ac = a * c;
  let m = null, n = null;
  for (let i = -Math.abs(ac) - Math.abs(b) - 1; i <= Math.abs(ac) + Math.abs(b) + 1; i++) {
    if (i !== 0 && ac % i === 0 && i + ac / i === b) { m = i; n = ac / i; break; }
    if (i === 0 && ac === 0 && b === 0) { m = 0; n = 0; break; }
  }
  if (m === null) { m = 0; n = b; }
  if (Math.abs(m) > Math.abs(n)) [m, n] = [n, m];
  const g1 = gcd(a, m) * (a < 0 ? -1 : 1);
  const inner = [m / g1, a / g1];
  const g2 = n / inner[1];
  const term = (k, x) => (k === 0 ? '' : `${k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 && x ? '' : Math.abs(k)}${x}`);
  const lines = a === 1
    ? [`\\text{Find two numbers that multiply to } ${c} \\text{ and add to } ${b}: \\ ${m} \\text{ and } ${n}`]
    : [`a \\cdot c = ${a} \\times ${c} = ${ac}: \\ \\text{two numbers that multiply to } ${ac} \\text{ and add to } ${b} \\text{ are } ${m} \\text{ and } ${n}`];
  const split = `${a === 1 ? '' : a === -1 ? '-' : a}${v}^{2}${term(m, v)}${term(n, v)}${term(c, '')}`;
  lines.push(`${polyTex(q, v)} = ${split}`);
  const g1x = `${g1 === 1 ? '' : g1 === -1 ? '-' : g1}${v}`;
  lines.push(`= ${g1x}${bracket(polyTex(inner, v))} ${g2 < 0 ? '-' : '+'} ${Math.abs(g2) === 1 ? '' : Math.abs(g2)}${bracket(polyTex(inner, v))}`);
  lines.push(`= ${bracket(polyTex(inner, v))}${bracket(polyTex([g2, g1], v))}`);
  return { title: a === 1 ? 'Find two numbers (sum and product)' : 'Split the middle term (ac method)', formula: 'm \\times n = ac, \\ m + n = b', lines };
}

/** content · x^k · Π factor^m in LaTeX. */
export function factorTex(content, xPower, factors, v = 'x') {
  const parts = [];
  if (xPower) parts.push(xPower === 1 ? v : `${v}^{${xPower}}`);
  for (const f of factors) {
    const t = polyTex(f.c, v);
    const one = f.c.length === 2 && f.c[0] === 0 && f.c[1] === 1;
    parts.push(`${one ? t : bracket(t)}${f.m > 1 ? `^{${f.m}}` : ''}`);
  }
  // A single factor on its own needs no brackets: x^2 + 4, not (x^2 + 4)
  if (content === 1 && !xPower && factors.length === 1 && factors[0].m === 1) return polyTex(factors[0].c, v);
  const c = content === 1 && parts.length ? '' : content === -1 && parts.length ? '-' : fracTex(content);
  return `${c}${parts.join('')}` || '1';
}
