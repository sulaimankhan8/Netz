/**
 * Logarithms, three ways:
 *   evaluate   log_b(x): exact when x is a power of b (log₂ 8 = 3, log₉ 3 = ½), else the change of base
 *   solve      exponential and log equations with one power or one log in them, e.g.
 *              3·2^(x−1) + 5 = 29, e^(2x) = 7, 2 ln(x + 1) = 6, log_2(x − 3) = 5:
 *              treat the power (or log) as one unknown t, solve for t, then undo it (take a log / raise b)
 *   expand     log_b of a product/quotient/power written as a sum: log(x²y/z) = 2 log x + log y − log z
 * Notation: log means base 10, ln means base e, log_b(…) any base b. Answers are checked by substitution.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';
import { parse, variablesOf, sym, unwrap, tex, polish, isConstantIn } from '../symbolic/tree';
import { rationalParts } from '../symbolic/poly';
import { fracTex } from '../symbolic/algebra';
import { texOf } from '../symbolic/roots';

const approx = (x) => String(Number(x.toPrecision(8)));
const baseTex = (b) => (Math.abs(b - Math.E) < 1e-12 ? 'e' : texOf(b));
const logName = (b) => (Math.abs(b - Math.E) < 1e-12 ? '\\ln' : Math.abs(b - 10) < 1e-12 ? '\\log' : `\\log_{${baseTex(b)}}`);

/** log_b(x) exactly when x = b^k for a simple fraction k, else null. */
function exactLog(x, b) {
  if (!(x > 0)) return null;
  const k = Math.log(x) / Math.log(b);
  const f = toFraction(k, 12, 1e-10);
  if (!f) return null;
  return Math.abs(b ** (f.n / f.d) - x) <= 1e-9 * Math.max(1, x) ? f.n / f.d : null;
}

/** "log_2(x)" and "log_{10}(x)" → log(x, 2); "log(" → "log10(" (base 10); "ln(" stays natural. */
export function prepare(text) {
  let s = String(text ?? '');
  // log_b( … ) with b a number or e: find the matching bracket
  for (let guard = 0; guard < 20; guard++) {
    const m = s.match(/log_\{?([0-9.]+|e)\}?\s*\(/);
    if (!m) break;
    const start = m.index, open = start + m[0].length - 1;
    let depth = 0, end = -1;
    for (let i = open; i < s.length; i++) { if (s[i] === '(') depth++; else if (s[i] === ')') { depth--; if (depth === 0) { end = i; break; } } }
    if (end < 0) throw new EngineError('A bracket is not closed.');
    const base = m[1] === 'e' ? 'e' : m[1];
    s = `${s.slice(0, start)}logb(${s.slice(open + 1, end)}, ${base})${s.slice(end + 1)}`;
  }
  s = s.replace(/\blog\s*\(/g, 'log10(').replace(/logb\(/g, 'log(');
  return s;
}

const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

// ---------- evaluate ----------
function evaluate(tb, tx) {
  const b = readConstant(tb, 'The base b'), x = readConstant(tx, 'The number x');
  if (!(b > 0) || Math.abs(b - 1) < 1e-12) throw new EngineError('The base must be positive and not 1.');
  if (!(x > 0)) throw new EngineError('You can only take the log of a positive number.');
  const L = logName(b), steps = [];
  const k = exactLog(x, b);
  const value = Math.log(x) / Math.log(b);
  let answer;
  if (k !== null) {
    steps.push({ title: `Write ${texOf(x)} as a power of ${baseTex(b)}`, formula: '\\log_b x = k \\iff b^k = x', lines: [`${baseTex(b)}^{${fracTex(k)}} = ${texOf(x)}`, `${L} ${texOf(x)} = ${fracTex(k)}`] });
    answer = fracTex(k);
  } else {
    steps.push({ title: 'Change of base', formula: '\\log_b x = \\frac{\\ln x}{\\ln b}', lines: [`${L} ${texOf(x)} = \\frac{\\ln ${texOf(x)}}{\\ln ${baseTex(b)}} = \\frac{${approx(Math.log(x))}}{${approx(Math.log(b))}} \\approx ${approx(value)}`] });
    answer = `${approx(value)}`;
  }
  steps.push({ title: 'Check', lines: [`${baseTex(b)}^{${k !== null ? fracTex(k) : approx(value)}} = ${approx(b ** value)} \\ \\checkmark`] });
  return { mode: 'evaluate', question: `${L} ${texOf(x)}`, answer, value, exact: k !== null, steps, verified: Math.abs(b ** value - x) < 1e-9 * x };
}

// ---------- solve ----------
function solveEquation(text) {
  const s = prepare(text);
  const sides = s.split('=');
  if (sides.length !== 2) throw new EngineError('Write one equation with one = sign, e.g. 2^(x+1) = 8.');
  const L = parse(sides[0], 'The left side'), R = parse(sides[1], 'The right side');
  const vars = [...new Set([...variablesOf(L), ...variablesOf(R)])];
  if (vars.length !== 1) throw new EngineError(vars.length ? `Use one unknown only (this uses ${vars.join(', ')}).` : 'There is no unknown (like x) in this equation.');
  const v = vars[0];

  // Find the one power with v in the exponent, or the one log of something with v
  const found = [];
  for (const side of [L, R]) side.traverse((m) => {
    const n = unwrap(m);
    if (n.isOperatorNode && n.fn === 'pow' && isConstantIn(n.args[0], v) && !isConstantIn(n.args[1], v)) found.push({ kind: 'exp', node: m, base: n.args[0].evaluate({}), inner: unwrap(n.args[1]) });
    if (n.isFunctionNode && n.fn.name === 'exp' && !isConstantIn(n.args[0], v)) found.push({ kind: 'exp', node: m, base: Math.E, inner: unwrap(n.args[0]) });
    if (n.isFunctionNode && ['log', 'log10'].includes(n.fn.name) && !isConstantIn(n.args[0], v)) {
      const base = n.fn.name === 'log10' ? 10 : n.args.length > 1 ? n.args[1].evaluate({}) : Math.E;
      found.push({ kind: 'log', node: m, base, inner: unwrap(n.args[0]) });
    }
  });
  if (found.length !== 1) throw new EngineError(found.length ? 'NETZ solves equations with one power (like 2^(x+1)) or one log (like log(x − 3)) in them.' : 'There is no power with x in the exponent and no log of x here. Use the Linear Equation page for other equations.');
  const F = found[0];
  if (!(F.base > 0) || Math.abs(F.base - 1) < 1e-12) throw new EngineError('The base must be positive and not 1.');
  const inner = rationalParts(F.inner, v);
  if (!inner || inner.Q.length > 1 || inner.P.length > 2) throw new EngineError('What is inside the power or the log must be linear, like 2x + 1.');
  const p = (inner.P[1] || 0) / inner.Q[0], q = (inner.P[0] || 0) / inner.Q[0];

  // Replace the power/log by t and solve the (linear) equation for t
  const swap = (node) => node.transform((m) => (m === F.node ? sym('t') : m));
  const Lt = swap(L), Rt = swap(R);
  const lt = rationalParts(Lt, 't'), rt = rationalParts(Rt, 't');
  if (!lt || !rt || lt.Q.length > 1 || rt.Q.length > 1 || variablesOf(Lt).has(v) || variablesOf(Rt).has(v)) throw new EngineError('NETZ solves equations of the form a·b^(…) + c = d or a·log(…) + c = d.');
  const A = (lt.P[1] || 0) / lt.Q[0] - (rt.P[1] || 0) / rt.Q[0];
  const C = (rt.P[0] || 0) / rt.Q[0] - (lt.P[0] || 0) / lt.Q[0];
  if (Math.abs(A) < 1e-12) throw new EngineError('The power or log cancels out, so this cannot be solved for x.');
  const T = C / A;
  const Ftex = tex(polish(F.node)).trim(), innerTex = tex(polish(F.inner)).trim();
  const steps = [{ title: `Get ${F.kind === 'exp' ? 'the power' : 'the log'} on its own`, lines: [`${tex(polish(L)).trim()} = ${tex(polish(R)).trim()}`, `${Ftex} = ${texOf(T)}`] }];
  const Lname = logName(F.base);
  let u, uTex;
  if (F.kind === 'exp') {
    if (!(T > 0)) throw new EngineError(`${baseTex(F.base)} to any power is positive, so it can never equal ${approx(T)}: there is no solution.`);
    const k = exactLog(T, F.base);
    u = Math.log(T) / Math.log(F.base);
    uTex = k !== null ? fracTex(k) : Math.abs(F.base - Math.E) < 1e-12 ? `\\ln ${texOf(T)}` : `${Lname} ${texOf(T)}`;
    steps.push({
      title: k !== null ? `Write ${texOf(T)} as a power of ${baseTex(F.base)}` : 'Take logs of both sides',
      formula: k !== null ? 'b^m = b^n \\Rightarrow m = n' : 'b^u = T \\iff u = \\log_b T',
      lines: k !== null ? [`${baseTex(F.base)}^{${innerTex}} = ${baseTex(F.base)}^{${fracTex(k)}}`, `${innerTex} = ${fracTex(k)}`] : [`${innerTex} = ${uTex}${Math.abs(F.base - Math.E) < 1e-12 ? '' : ` = \\frac{\\ln ${texOf(T)}}{\\ln ${baseTex(F.base)}}`} \\approx ${approx(u)}`],
    });
  } else {
    u = F.base ** T;
    // A simple number when b^T is one (2^5 = 32), else the power itself (e^3)
    uTex = toFraction(u, 1000, 1e-12) ? texOf(u) : `${baseTex(F.base)}^{${texOf(T)}}`;
    steps.push({ title: 'Undo the log: raise the base to both sides', formula: '\\log_b u = T \\iff u = b^T', lines: [`${innerTex} = ${baseTex(F.base)}^{${texOf(T)}} = ${uTex}`] });
  }
  if (Math.abs(p) < 1e-12) throw new EngineError('There is no x inside the power or the log.');
  const x = (u - q) / p;
  // Exact only when u really is a simple fraction (not ln 7 ≈ 45545/23406)
  const exact = toFraction(u, 1000, 1e-12) && !/\\ln|\\log|\^/.test(uTex);
  let xTex;
  if (exact) xTex = fracTex(x);
  else {
    const top = Math.abs(q) < 1e-12 ? uTex : `${uTex} ${q > 0 ? '-' : '+'} ${fracTex(Math.abs(q))}`;
    xTex = Math.abs(p - 1) < 1e-12 ? top : `\\frac{${top}}{${fracTex(p)}}`;
  }
  if (Math.abs(p - 1) > 1e-12 || Math.abs(q) > 1e-12) steps.push({ title: `Solve for ${v}`, lines: [`${v} = ${xTex}${exact ? '' : ` \\approx ${approx(x)}`}`] });
  if (F.kind === 'log' && !(p * x + q > 0)) {
    steps.push({ title: 'Check the domain', lines: [`${innerTex} = ${approx(p * x + q)} \\le 0: \\text{ the log is not defined, so there is no solution}`] });
    return { mode: 'solve', variable: v, question: `${tex(polish(L)).trim()} = ${tex(polish(R)).trim()}`, answer: '\\text{no solution}', x: null, steps, verified: true };
  }
  const lv = valueAt(L, v, x), rv = valueAt(R, v, x);
  const ok = Math.abs(lv - rv) <= 1e-7 * Math.max(1, Math.abs(lv));
  steps.push({ title: 'Check: put it back in', lines: [`\\text{Left} = ${approx(lv)}, \\quad \\text{Right} = ${approx(rv)} \\ ${ok ? '\\checkmark' : '\\times'}`] });
  return { mode: 'solve', variable: v, question: `${tex(polish(L)).trim()} = ${tex(polish(R)).trim()}`, answer: `${v} = ${xTex}${exact ? '' : ` \\approx ${approx(x)}`}`, x, steps, verified: ok };
}

// ---------- expand ----------
function expand(text, tb) {
  const b = readConstant(tb || '10', 'The base b');
  if (!(b > 0) || Math.abs(b - 1) < 1e-12) throw new EngineError('The base must be positive and not 1.');
  const node = parse(String(text ?? ''), 'The expression inside the log');
  const L = logName(b);
  const used = new Set();
  const terms = [];
  const walk = (raw, coef) => {
    const n = unwrap(raw);
    if (n.isOperatorNode && n.fn === 'multiply') { used.add('product'); n.args.forEach((a) => walk(a, coef)); return; }
    if (n.isOperatorNode && n.fn === 'divide') { used.add('quotient'); walk(n.args[0], coef); walk(n.args[1], -coef); return; }
    if (n.isOperatorNode && n.fn === 'pow' && isConstantIn(n.args[1], '__')) {
      const k = n.args[1].evaluate ? (() => { try { return n.args[1].evaluate({}); } catch { return null; } })() : null;
      if (typeof k === 'number') { used.add('power'); walk(n.args[0], coef * k); return; }
    }
    if (n.isFunctionNode && n.fn.name === 'sqrt') { used.add('power'); walk(n.args[0], coef / 2); return; }
    if (n.isFunctionNode && n.fn.name === 'cbrt') { used.add('power'); walk(n.args[0], coef / 3); return; }
    terms.push({ coef, arg: n });
  };
  walk(node, 1);
  // Numbers: exact when a power of the base (log_2 8 = 3), else kept as log c
  let constant = 0;
  const shown = [];
  for (const t of terms) {
    if (variablesOf(t.arg).size === 0) {
      const c = t.arg.evaluate({});
      if (!(c > 0)) throw new EngineError('You can only take the log of a positive number.');
      const k = exactLog(c, b);
      if (k !== null) { constant += t.coef * k; continue; }
    }
    const at = tex(polish(t.arg)).trim();
    const arg = t.arg.isSymbolNode || t.arg.isConstantNode ? at : `\\left(${at}\\right)`;
    shown.push({ coef: t.coef, s: `${L} ${arg}` });
  }
  if (Math.abs(constant) > 1e-12) shown.push({ coef: constant, s: '' });
  const answer = shown.map((t, i) => {
    const mag = Math.abs(t.coef), c = t.s && Math.abs(mag - 1) < 1e-12 ? '' : fracTex(mag);
    const body = `${c}${t.s ? (c ? ' ' : '') + t.s : ''}`;
    return i === 0 ? `${t.coef < 0 ? '-' : ''}${body}` : ` ${t.coef < 0 ? '-' : '+'} ${body}`;
  }).join('') || '0';
  const laws = { product: '\\log_b(MN) = \\log_b M + \\log_b N', quotient: '\\log_b\\frac{M}{N} = \\log_b M - \\log_b N', power: '\\log_b M^k = k\\log_b M' };
  const steps = [{ title: 'Laws used', lines: [...used].map((u) => laws[u]) }, { title: 'Expand', lines: [`${L}\\left(${tex(polish(node)).trim()}\\right) = ${answer}`] }];
  if (!used.size) steps[0].lines = ['\\text{Nothing to expand: this is a single log.}'];
  return { mode: 'expand', question: `${L}\\left(${tex(polish(node)).trim()}\\right)`, answer, steps, verified: true };
}

export function solve({ mode = 'evaluate', b = '10', x = '', eq = '', expr = '' }) {
  if (mode === 'evaluate') return { ...evaluate(b, x), notes: [], plot: null, result: null };
  if (mode === 'solve') return { ...solveEquation(eq), notes: ['log means base 10, ln means base e, and log_2(…) is base 2.'], plot: null, result: null };
  if (mode === 'expand') return { ...expand(expr, b), notes: [], plot: null, result: null };
  throw new EngineError('Choose evaluate, solve or expand.');
}
