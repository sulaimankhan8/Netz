/**
 * The definite integral as the limit of a sum (Riemann sum): the maths for /integral-as-limit-of-a-sum.
 *   ∫ₐᵇ f(x) dx = lim (n → ∞) h · Σ f(xᵢ),   h = (b − a)/n
 * The page cuts [a, b] into n strips, adds up the rectangles (left, right or midpoint), shows how the sum closes in on
 * the exact area as n grows and, for polynomials up to degree 3, does the textbook "limit of a sum" derivation with the
 * standard sums Σi, Σi², Σi³.
 */
import { EngineError } from '../numeric/steps';
import { readWhole } from './input';
import { readLimit, between, valueOf } from './definite-helpers';
import { simpson } from './integral';
import { parse, variablesOf, tex, polish, num, sym, add } from '../symbolic/tree';
import { polyCoeffs, integrate } from '../symbolic/integral';
import { texValue } from '../symbolic/limit';

const RULES = {
  left: { name: 'left-hand rectangles', point: (i) => i, label: 'x_i = a + (i-1)h', first: 0 },
  right: { name: 'right-hand rectangles', point: (i) => i + 1, label: 'x_i = a + ih', first: 1 },
  mid: { name: 'midpoint rectangles', point: (i) => i + 0.5, label: 'x_i = a + (i - \\tfrac12)h', first: 0.5 },
};

function riemann(g, a, b, n, rule) {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const y = g(a + RULES[rule].point(i) * h);
    if (!Number.isFinite(y)) return NaN;
    s += y;
  }
  return s * h;
}

const ex = (y) => texValue(Math.abs(y) < 1e-12 ? 0 : y);

export function solve({ f: tf, a: ta, b: tb, n: tn = '4', rule = 'right' }) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  if (!RULES[rule]) throw new EngineError('Choose left, right or midpoint rectangles.');
  const A = readLimit(ta, 'The lower limit a'), B = readLimit(tb, 'The upper limit b');
  if (!(B.value > A.value)) throw new EngineError('b must be larger than a.');
  const n = readWhole(tn, 'n (the number of strips)', 1, 100000);
  const g = (x) => valueOf(f, { [v]: x });
  const a = A.value, b = B.value, h = (b - a) / n;

  const sum = riemann(g, a, b, n, rule);
  if (!Number.isFinite(sum)) throw new EngineError('f is not defined at one of the rectangle points. Choose limits where f is defined.');

  // The exact area, for comparison
  let exact = null;
  try {
    const F = integrate(f, v).result;
    const r = between(F, f, v, A, B);
    if (Number.isFinite(r.value)) exact = { value: r.value, tex: r.valueTex };
  } catch { /* numerical value below */ }
  if (!exact) { const y = simpson(g, a, b); exact = { value: y, tex: ex(y), numeric: true }; }

  // The strips (shown in full up to 8, otherwise first and last)
  const shown = n <= 8 ? [...Array(n).keys()] : [0, 1, 2, n - 2, n - 1];
  const rows = shown.map((i) => { const x = a + RULES[rule].point(i) * h; return { i: i + 1, x, y: g(x) }; });

  // The sum closing in as n grows
  const ns = [...new Set([2, 5, 10, 50, 100, 1000, n])].sort((p, q) => p - q);
  const convergence = ns.map((m) => { const s = riemann(g, a, b, m, rule); return { n: m, sum: s, error: Math.abs(s - exact.value) }; });

  const steps = [];
  steps.push({
    title: 'Cut [a, b] into n equal strips',
    text: `Each strip is h wide. With n = ${n} strips, h = (b − a)/n.`,
    formula: 'h = \\frac{b - a}{n}',
    lines: [`h = \\frac{${B.tex} - ${A.tex}}{${n}} = ${ex(h)}`],
  });
  steps.push({
    title: `Draw a rectangle on each strip (${RULES[rule].name})`,
    text: rule === 'left' ? 'The height of each rectangle is f at the left end of its strip.' : rule === 'right' ? 'The height of each rectangle is f at the right end of its strip.' : 'The height of each rectangle is f at the middle of its strip.',
    formula: RULES[rule].label,
    lines: [
      `\\begin{array}{c|${'c'.repeat(rows.length)}} i & ${rows.map((r) => r.i).join(' & ')} \\\\ \\hline x_i & ${rows.map((r) => ex(r.x)).join(' & ')} \\\\ f(x_i) & ${rows.map((r) => ex(r.y)).join(' & ')} \\end{array}`,
      ...(n > 8 ? ['\\text{(first three and last two strips shown)}'] : []),
    ],
  });
  steps.push({
    title: 'Add the rectangle areas',
    text: 'Each rectangle has area (height × h). The total is h times the sum of the heights.',
    formula: 'S_n = h\\sum f(x_i)',
    lines: [`S_{${n}} = ${ex(h)}\\times\\sum f(x_i) = ${ex(sum)}`],
  });

  // Textbook derivation for a polynomial of degree ≤ 3 with the right-hand rule
  const deg3 = (() => { const c = polyCoeffs(f, v); return c && c.length <= 4 ? c : null; })();
  if (deg3 && rule === 'right') {
    // f(a + t) in powers of t
    const shifted = f.transform((nd) => (nd.isSymbolNode && nd.name === v ? add(num(a), sym('t')) : nd));
    const d = polyCoeffs(shifted, 't') || deg3;
    const terms = d.map((c, j) => ({ j, c })).filter((t) => Math.abs(t.c) > 1e-12);
    steps.push({
      title: 'Write f(a + ih) as powers of i',
      text: 'For the limit of a sum we need xᵢ = a + i·h and the sum over i = 1 to n, so expand f(a + ih).',
      formula: '\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} h\\sum_{i=1}^{n} f(a + ih)',
      lines: [`f(a + ih) = ${terms.map((t) => `${ex(t.c)}${t.j ? `(ih)^{${t.j}}` : ''}`).join(' + ') || '0'}`],
    });
    const sumFormula = { 0: '\\sum_{i=1}^{n} 1 = n', 1: '\\sum i = \\frac{n(n+1)}{2}', 2: '\\sum i^2 = \\frac{n(n+1)(2n+1)}{6}', 3: '\\sum i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2' };
    steps.push({
      title: 'Use the standard sums',
      text: 'These four sums are the tools. Put them in term by term.',
      lines: [...new Set(terms.map((t) => sumFormula[t.j]))],
    });
    const parts = terms.map((t) => ({ ...t, limit: (t.c * (b - a) ** (t.j + 1)) / (t.j + 1) }));
    steps.push({
      title: 'Let n → ∞',
      text: 'As n grows, each term settles to a fixed number: the factor (n(n+1)…)/nᵏ tends to 1/k and h·n = b − a.',
      formula: '\\lim_{n\\to\\infty} h\\cdot h^{j}\\sum i^{j} = \\frac{(b-a)^{j+1}}{j+1}',
      lines: [
        ...parts.map((p) => `${ex(p.c)}\\cdot\\frac{(${ex(b - a)})^{${p.j + 1}}}{${p.j + 1}} = ${ex(p.limit)}`),
        `\\int_{${A.tex}}^{${B.tex}} ${tex(polish(f))}\\,dx = ${parts.map((p) => ex(p.limit)).join(' + ')} = ${ex(parts.reduce((s, p) => s + p.limit, 0))}`,
      ],
    });
  } else if (!deg3 || rule !== 'right') {
    steps.push({
      title: 'Let n grow',
      text: 'The more strips, the thinner the rectangles and the closer the sum gets to the true area. The limit of the sums is the definite integral.',
      lines: [`\\int_{${A.tex}}^{${B.tex}} ${tex(polish(f))}\\,dx = \\lim_{n\\to\\infty} S_n = ${exact.tex}${exact.numeric ? '\\ \\text{(numerical)}' : ''}`],
    });
  }

  const ys = Array.from({ length: 160 }, (_, i) => g(a + ((b - a) * i) / 159)).filter(Number.isFinite);
  const y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
  return {
    variable: v, f: tex(polish(f)), a: A.tex, b: B.tex, n, h, rule, ruleName: RULES[rule].name,
    sum, exactValue: exact.value, exactTex: exact.tex, exactNumeric: Boolean(exact.numeric), error: Math.abs(sum - exact.value),
    convergence, rows, steps, notes: [], verified: true, result: sum,
    plot: { fn: g, view: { x0: a - (b - a) * 0.15, x1: b + (b - a) * 0.15, y0, y1 }, shade: { a, b } },
  };
}
