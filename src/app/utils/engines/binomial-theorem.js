/**
 * Binomial theorem for (a + b)^n, where a and b are single terms like 2x, -3, x^2 or 1/x.
 *   general term   T(r+1) = nCr · a^(n−r) · b^r
 *   modes          expand (all n + 1 terms), a chosen term, the coefficient of x^k, the term
 *                  independent of x (k = 0), the middle term(s)
 * Coefficients are exact (whole numbers or fractions). The full expansion is checked numerically.
 */
import { EngineError } from '../numeric/steps';
import { readWhole } from './input';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { rationalParts } from '../symbolic/poly';
import { fracTex } from '../symbolic/algebra';

const MAX_N = 15;
function nCr(n, r) { let x = 1; for (let i = 1; i <= r; i++) x = (x * (n - r + i)) / i; return Math.round(x); }

/** A single term c·x^e (e may be negative or 0), or an error. */
function monomial(text, label) {
  const node = parse(text, label);
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`${label}: use one variable only.`);
  const v = vars[0] || null;
  if (!v) { const c = node.evaluate({}); return { c, e: 0, v, tex: termTex(c, 0, null) }; }
  const r = rationalParts(node, v);
  const nzP = r ? r.P.map((k, i) => [k, i]).filter(([k]) => Math.abs(k) > 1e-12) : [];
  const nzQ = r ? r.Q.map((k, i) => [k, i]).filter(([k]) => Math.abs(k) > 1e-12) : [];
  if (nzP.length !== 1 || nzQ.length !== 1) throw new EngineError(`${label} must be a single term like 2x, -3, x^2 or 1/x (not a sum).`);
  return { c: nzP[0][0] / nzQ[0][0], e: nzP[0][1] - nzQ[0][1], v, tex: termTex(nzP[0][0] / nzQ[0][0], nzP[0][1] - nzQ[0][1], v) };
}

/** c·x^e in LaTeX, with negative powers as fractions: 3x^{2}, -\frac{5}{x^{3}}. */
function termTex(c, e, v) {
  if (Math.abs(c) < 1e-15) return '0';
  const mag = Math.abs(c), sign = c < 0 ? '-' : '';
  if (!v || e === 0) return `${sign}${fracTex(mag)}`;
  const pw = (k) => (k === 1 ? v : `${v}^{${k}}`);
  if (e > 0) return `${sign}${Math.abs(mag - 1) < 1e-12 ? '' : fracTex(mag)}${pw(e)}`;
  const f = fracTex(mag);
  const m = f.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
  return m ? `${sign}\\frac{${m[1]}}{${m[2]}${pw(-e)}}` : `${sign}\\frac{${f}}{${pw(-e)}}`;
}
const join = (terms) => terms.map((t, i) => (i === 0 ? t : t.startsWith('-') ? ` - ${t.slice(1)}` : ` + ${t}`)).join('');

export function solve({ a: ta, b: tb, n: tn, mode = 'expand', r: tr = '', k: tk = '' }) {
  const A = monomial(ta, 'The first term a'), B = monomial(tb, 'The second term b');
  const two = Boolean(A.v && B.v && A.v !== B.v); // (x + y)^n: two letters
  const v = A.v || B.v;
  const n = readWhole(tn, 'The power n', 0, MAX_N);
  const term = (r) => {
    const coef = nCr(n, r) * A.c ** (n - r) * B.c ** r;
    const e = A.e * (n - r) + B.e * r;
    let t;
    if (two) {
      // c · x^p · y^q, with each power written only when it is not 0
      const p = A.e * (n - r), q = B.e * r;
      const pw = (name, k) => (k === 0 ? '' : k === 1 ? name : `${name}^{${k}}`);
      const letters = `${pw(A.v, p)}${pw(B.v, q)}`;
      const neg = p < 0 || q < 0;
      t = neg ? `${termTex(coef, 0, null)}${pw(A.v, p)}${pw(B.v, q)}` : `${coef < 0 ? '-' : ''}${Math.abs(Math.abs(coef) - 1) < 1e-12 && letters ? '' : fracTex(Math.abs(coef))}${letters}`;
    } else t = termTex(coef, e, v);
    return { r, coef, e, tex: t, nCr: nCr(n, r) };
  };
  if (two && (mode === 'coef' || mode === 'constant')) throw new EngineError('With two letters, choose "expand", "a chosen term" or "middle term".');
  const all = Array.from({ length: n + 1 }, (_, r) => term(r));
  const wrap = (t) => (/^-|[+-]/.test(t) || t.length > 1 ? `\\left(${t}\\right)` : t);
  const general = `T_{r+1} = \\binom{${n}}{r} ${wrap(A.tex)}^{${n} - r} ${wrap(B.tex)}^{r}`;
  const working = (t) => `T_{${t.r + 1}} = \\binom{${n}}{${t.r}} ${wrap(A.tex)}^{${n - t.r}} ${wrap(B.tex)}^{${t.r}} = ${t.nCr} \\cdot ${termTex(A.c ** (n - t.r), A.e * (n - t.r), A.v)} \\cdot ${termTex(B.c ** t.r, B.e * t.r, B.v)} = ${t.tex}`;
  const steps = [{ title: 'The general term', formula: '(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r', lines: [`a = ${A.tex}, \\ b = ${B.tex}, \\ n = ${n}`, general] }];
  let answer, picked = [];

  if (mode === 'expand') {
    steps.push({ title: `Coefficients nCr for n = ${n} (row ${n} of Pascal's triangle)`, lines: [all.map((t) => t.nCr).join(', \\ ')] });
    steps.push({ title: 'Each term', lines: all.map(working) });
    answer = join(all.filter((t) => Math.abs(t.coef) > 1e-15).map((t) => t.tex));
    steps.push({ title: 'Add them up', lines: [`\\left(${A.tex} + ${B.tex}\\right)^{${n}} = ${answer}`.replace('+ -', '- ')] });
    picked = all;
  } else if (mode === 'term') {
    const R = readWhole(tr, 'The term number', 1, n + 1);
    const t = all[R - 1];
    steps.push({ title: `Term number ${R}: put r = ${R - 1}`, lines: [working(t)] });
    answer = t.tex; picked = [t];
  } else if (mode === 'coef' || mode === 'constant') {
    if (!v) throw new EngineError('There is no variable in a or b, so every term is a number.');
    const K = mode === 'constant' ? 0 : Number(String(tk).trim());
    if (!Number.isInteger(K)) throw new EngineError('Enter the power k as a whole number (it can be negative).');
    // power of x in T(r+1): A.e(n − r) + B.e·r = K
    const slope = B.e - A.e;
    const pw = `${A.e === 0 ? '' : `${A.e}(${n} - r)`}${B.e === 0 ? '' : `${A.e === 0 ? '' : ' + '}${B.e}r`}` || '0';
    const lines = [`\\text{Power of } ${v} \\text{ in } T_{r+1}: \\ ${pw} = ${K}`];
    if (slope === 0) throw new EngineError(`Every term has the same power of ${v}.`);
    const r = (K - A.e * n) / slope;
    if (!Number.isInteger(r) || r < 0 || r > n) {
      lines.push(`r = ${fracTex(r)} \\text{ is not a whole number from 0 to } ${n}`);
      steps.push({ title: mode === 'constant' ? 'Solve for r (power 0)' : `Solve for r (power ${K})`, lines });
      answer = mode === 'constant' ? '\\text{There is no term independent of } ' + v : `\\text{There is no } ${v}^{${K}} \\text{ term: the coefficient is } 0`;
    } else {
      lines.push(`r = ${r}`);
      steps.push({ title: mode === 'constant' ? 'Solve for r (power 0)' : `Solve for r (power ${K})`, lines });
      const t = all[r];
      steps.push({ title: `Put r = ${r}`, lines: [working(t)] });
      answer = mode === 'constant' ? `T_{${r + 1}} = ${t.tex}` : `\\text{Coefficient of } ${v}^{${K}} = ${fracTex(t.coef)}`;
      picked = [t];
    }
  } else if (mode === 'middle') {
    const mids = n % 2 === 0 ? [n / 2] : [(n - 1) / 2, (n + 1) / 2];
    steps.push({ title: n % 2 === 0 ? `n = ${n} is even: one middle term, T(${n / 2 + 1})` : `n = ${n} is odd: two middle terms, T(${(n + 1) / 2}) and T(${(n + 3) / 2})`, lines: mids.map((r) => working(all[r])) });
    picked = mids.map((r) => all[r]);
    answer = picked.map((t) => `T_{${t.r + 1}} = ${t.tex}`).join(', \\quad ');
  } else {
    throw new EngineError('Choose what to find.');
  }

  // Check the expansion against (a + b)^n at a few points
  let verified = true;
  if (v) {
    for (const x of [0.7, 1.3, 2.1]) {
      const y = two ? x + 0.45 : x; // a second letter gets its own value
      const want = (A.c * x ** A.e + B.c * y ** B.e) ** n;
      const got = all.reduce((s, t) => s + t.coef * x ** (A.e * (n - t.r)) * y ** (B.e * t.r), 0);
      if (Math.abs(want - got) > 1e-7 * Math.max(1, Math.abs(want))) verified = false;
    }
  }
  return { variable: v, a: A.tex, b: B.tex, bShown: `${B.c < 0 ? '-' : '+'} ${termTex(Math.abs(B.c), B.e, B.v)}`, n, mode, terms: all, picked, answer, steps, verified, result: answer, notes: [], plot: null };
}
