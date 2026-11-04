/**
 * Taylor series of f about x = a (Maclaurin when a = 0), up to the (x − a)^n term:
 *   f(x) ≈ Σ_{k=0}^{n} f⁽ᵏ⁾(a)/k! · (x − a)^k
 * Steps: a table of f⁽ᵏ⁾(x), its value at a, and the coefficient f⁽ᵏ⁾(a)/k!; then the polynomial.
 * Optional: the value of the polynomial at some x, next to the true f(x) and the error.
 * Each coefficient is checked against a numerical derivative of f; `verified` says whether they agreed.
 */
import { EngineError } from '../numeric/steps';
import { readConstant, readNumber } from './input';
import { math, parse, variablesOf, tex, polish } from '../symbolic/tree';
import { derivativeOf, valueAt } from '../symbolic/critical';
import { texOf } from '../symbolic/roots';
import { toFraction } from '../numeric/fraction';

const MAX_ORDER = 8;

/** The coefficient f⁽ᵏ⁾(a)/k! exactly: 1/24, −1/5040, √2/12, or a decimal if f⁽ᵏ⁾(a) itself is not exact. */
function coefTex(value, valueTex, kf) {
  const c = value / kf;
  if (Math.abs(c) < 1e-15) return '0';
  const fr = toFraction(c, 1000000, 1e-12);
  if (fr && toFraction(value, 1000, 1e-9)) return fr.d === 1 ? String(fr.n) : `${fr.n < 0 ? '-' : ''}\\frac{${Math.abs(fr.n)}}{${fr.d}}`;
  if (kf === 1) return valueTex;
  if (!/[a-z\\]/.test(valueTex)) return texOf(c); // valueTex is a plain decimal
  const m = valueTex.match(/^(-?)\\frac\{(.+)\}\{(\d+)\}$/);
  if (m) return `${m[1]}\\frac{${m[2]}}{${Number(m[3]) * kf}}`;
  return valueTex.startsWith('-') ? `-\\frac{${valueTex.slice(1)}}{${kf}}` : `\\frac{${valueTex}}{${kf}}`;
}
const factorial = (k) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };

/** Numerical k-th derivative at a (central differences), for checking the symbolic ones. */
function numericDerivative(f, a, k) {
  if (k === 0) return f(a);
  const h = 0.05 * Math.max(1, Math.abs(a)) / k;
  let s = 0;
  for (let j = 0; j <= k; j++) {
    const c = factorial(k) / (factorial(j) * factorial(k - j));
    s += (j % 2 ? -1 : 1) * c * f(a + (k / 2 - j) * h);
  }
  return s / h ** k;
}

export function solve({ f: tf, a: ta = '0', n: tn = '4', at = '' }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readConstant(String(ta).trim() === '' ? '0' : ta, 'The centre a');
  let aTex;
  try { aTex = tex(polish(math.parse(String(ta).trim() === '' ? '0' : String(ta).trim().replace(/π/g, 'pi')))).trim(); } catch { aTex = texOf(a); }
  const n = readNumber(tn, 'The order n');
  if (!Number.isInteger(n) || n < 1 || n > MAX_ORDER) throw new EngineError(`Choose an order n from 1 to ${MAX_ORDER}.`);

  // f, f', f'', … and their values at a
  const rows = [];
  let current = node;
  let verified = true;
  const fNum = (x) => valueAt(node, v, x);
  for (let k = 0; k <= n; k++) {
    if (k > 0) current = derivativeOf(current, v);
    const value = valueAt(current, v, a);
    if (!Number.isFinite(value)) throw new EngineError(`${k === 0 ? 'f' : `The ${k === 1 ? '1st' : k === 2 ? '2nd' : k === 3 ? '3rd' : `${k}th`} derivative`} is not defined at ${v} = ${aTex.replace(/\\/g, '')}, so there is no Taylor series about this point. Try another centre a.`);
    const check = numericDerivative(fNum, a, k);
    if (k <= 4 && Number.isFinite(check) && Math.abs(check - value) > 1e-3 * Math.max(1, Math.abs(value))) verified = false;
    const c = value / factorial(k);
    const dTex = tex(polish(current)).trim();
    const valueTex = texOf(value);
    rows.push({ k, derivative: dTex.length > 160 ? null : dTex, value, valueTex, coef: c, coefTex: coefTex(value, valueTex, factorial(k)) });
  }

  // The polynomial
  const base = Math.abs(a) < 1e-15 ? v : `\\left(${v} ${aTex.startsWith('-') ? `+ ${aTex.slice(1)}` : `- ${aTex}`}\\right)`;
  const terms = [];
  for (const r of rows) {
    if (Math.abs(r.coef) < 1e-14) continue;
    const power = r.k === 0 ? '' : r.k === 1 ? base : `${base}^{${r.k}}`;
    let c = r.coefTex;
    if (power && c === '1') c = '';
    else if (power && c === '-1') c = '-';
    terms.push(`${c}${power}` || '0');
  }
  const poly = terms.length ? terms.map((t, i) => (i === 0 ? t : t.startsWith('-') ? ` - ${t.slice(1)}` : ` + ${t}`)).join('') : '0';
  const P = (x) => rows.reduce((s, r) => s + r.coef * (x - a) ** r.k, 0);
  const name = Math.abs(a) < 1e-15 ? 'Maclaurin' : 'Taylor';

  const ord = (k) => (k === 0 ? 'f' : k <= 3 ? `f${"'".repeat(k)}` : `f^{(${k})}`);
  const steps = [
    { title: 'The formula', formula: `f(x) \\approx \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^k`, lines: [`a = ${aTex}, \\quad n = ${n}`] },
    {
      title: `Differentiate ${n} times and put in x = a`,
      lines: rows.map((r) => `${ord(r.k)}(${v}) = ${r.derivative ?? '\\ldots'} \\quad \\Rightarrow \\quad ${ord(r.k)}(${aTex}) = ${r.valueTex}`),
    },
    {
      title: 'Divide by k! to get each coefficient',
      lines: rows.map((r) => `\\frac{${ord(r.k)}(${aTex})}{${r.k}!} = ${r.valueTex === '0' ? '0' : r.k <= 1 ? r.valueTex : `\\frac{${r.valueTex}}{${factorial(r.k)}}`}${r.k > 1 && r.valueTex !== '0' ? ` = ${r.coefTex}` : ''}`),
    },
    { title: `${name} polynomial of order ${n}`, lines: [`f(${v}) \\approx ${poly}`] },
  ];

  let approx = null;
  if (String(at ?? '').trim()) {
    const x1 = readConstant(at, `The value of ${v}`);
    const p = P(x1), exact = fNum(x1);
    approx = { x: x1, p, exact: Number.isFinite(exact) ? exact : null, error: Number.isFinite(exact) ? Math.abs(exact - p) : null };
    steps.push({
      title: `Use it at ${v} = ${Number(x1.toPrecision(6))}`,
      lines: [
        `P_{${n}}(${Number(x1.toPrecision(6))}) = ${Number(p.toPrecision(10))}`,
        ...(approx.exact !== null ? [`f(${Number(x1.toPrecision(6))}) = ${Number(exact.toPrecision(10))}, \\quad \\text{error} = ${Number(approx.error.toPrecision(3))}`] : []),
      ],
    });
  }

  return {
    variable: v, f: tex(polish(node)).trim(), a, aTex, n, name, rows, poly, approx, steps, verified,
    fAt: fNum, pAt: P, result: poly, notes: [], plot: null,
  };
}
