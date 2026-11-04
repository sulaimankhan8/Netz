/**
 * Logarithmic differentiation, for y = u(x)^v(x) (like xˣ) and products/quotients of many factors.
 *   1. take ln of both sides:          ln y = ln f(x)
 *   2. expand with the log laws:       ln(ab) = ln a + ln b,  ln(a/b) = ln a − ln b,  ln(aᵏ) = k ln a
 *   3. differentiate both sides:       (1/y) dy/dx = d/dx[ … ]
 *   4. multiply by y:                  dy/dx = f(x) · [ … ]
 * The answer is checked against math.js's derivative of f at several points; `verified` says whether it agreed.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { math, parse, variablesOf, num, fn, add, sub, mul, div, paren, unwrap, tidy, tex, polish, bestForm, isConstantIn } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { cleanest } from '../symbolic/present';

const SAMPLE = [0.37, 0.81, 1.29, 2.13, 3.7];
const NOT_FOR_THIS = 'Logarithmic differentiation is for powers with x in the exponent (like x^x or (sin x)^x) and for products or quotients of several factors. For this function the Derivative Calculator is simpler.';

/** ln(node) expanded with the log laws. Returns the expanded node and whether a law was used. */
function expandLog(node, v) {
  let used = false;
  const L = (raw) => {
    const n = unwrap(raw);
    if (n.isOperatorNode && n.fn === 'multiply') { used = true; return n.args.map(L).reduce((acc, t) => add(acc, t)); }
    if (n.isOperatorNode && n.fn === 'divide') { used = true; return sub(L(n.args[0]), L(n.args[1])); }
    if (n.isOperatorNode && n.fn === 'pow') {
      used = true;
      const [base, ex] = n.args.map(unwrap);
      if (base.isSymbolNode && base.name === 'e') return ex;
      return mul(isConstantIn(ex, v) ? ex : paren2(ex), L(base));
    }
    if (n.isFunctionNode && n.fn.name === 'sqrt') { used = true; return mul(div(num(1), num(2)), L(n.args[0])); }
    if (n.isFunctionNode && n.fn.name === 'exp') { used = true; return unwrap(n.args[0]); }
    return fn('log', n);
  };
  const out = L(node);
  return { node: out, used };
}
// A sum in the exponent keeps its brackets: (x + 1) ln x
const paren2 = (n) => (n.isOperatorNode && (n.fn === "add" || n.fn === "subtract") ? paren(n) : n);

/** Is there an x in an exponent, or several factors with x? (Otherwise the method gains nothing.) */
function worthIt(node, v) {
  let variableExponent = false, factors = 0;
  node.traverse((m) => {
    if (m.isOperatorNode && m.fn === 'pow' && !isConstantIn(m.args[1], v) && !isConstantIn(m.args[0], v)) variableExponent = true;
  });
  const count = (raw) => {
    const n = unwrap(raw);
    if (n.isOperatorNode && (n.fn === 'multiply' || n.fn === 'divide')) n.args.forEach(count);
    else if (!isConstantIn(n, v)) factors++;
  };
  count(node);
  return variableExponent || factors >= 2;
}

function agree(mine, f, v) {
  let reference;
  try { reference = math.derivative(f, v); } catch { return false; }
  let compared = 0;
  for (const x of SAMPLE) {
    let a, b;
    try { a = mine.evaluate({ [v]: x }); b = reference.evaluate({ [v]: x }); } catch { continue; }
    if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) return false;
  }
  return compared >= 2;
}

export function solve({ f: tf, at = '' }) {
  const text = String(tf ?? '').trim().replace(/^y\s*=\s*/i, '');
  const node = parse(text, 'y');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  if (!vars.length) throw new EngineError('There is no x here, so y is a constant and dy/dx = 0.');
  if (!worthIt(unwrap(node), v)) throw new EngineError(NOT_FOR_THIS);

  const fTex = tex(polish(node)).trim();
  const { node: lnRight } = expandLog(node, v);
  const lnTidy = polish(tidy(lnRight));
  const { result: dRight } = differentiate(lnTidy, v);
  // The tidiest form of the bracket that still equals d/dx[ln y]
  const same = (g) => SAMPLE.every((x) => { try { const a = g.evaluate({ [v]: x }), b = dRight.evaluate({ [v]: x }); return !Number.isFinite(b) || Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)); } catch { return true; } });
  const bracketed = cleanest(dRight, v, same) || bestForm(dRight);
  const answerNode = mul(paren(node), paren(bracketed));
  const brTex = tex(polish(bracketed)).trim();
  const top = unwrap(node);
  const answer = `${top.isOperatorNode && (top.fn === 'add' || top.fn === 'subtract') ? `\\left(${fTex}\\right)` : fTex}\\left[${brTex}\\right]`;
  const verified = agree(answerNode, node, v);

  const steps = [
    { title: 'Take ln of both sides', lines: [`y = ${fTex}`, `\\ln y = \\ln\\left(${fTex}\\right)`] },
    { title: 'Expand with the log laws', formula: '\\ln(ab) = \\ln a + \\ln b, \\ \\ln\\frac{a}{b} = \\ln a - \\ln b, \\ \\ln a^{k} = k\\ln a', lines: [`\\ln y = ${tex(lnTidy).trim()}`] },
    { title: 'Differentiate both sides with respect to x', formula: '\\frac{d}{dx}\\ln y = \\frac{1}{y}\\frac{dy}{dx}', lines: [`\\frac{1}{y}\\frac{dy}{dx} = ${brTex}`] },
    { title: 'Multiply both sides by y', lines: [`\\frac{dy}{dx} = y\\left[${brTex}\\right] = ${answer}`] },
  ];

  let point = null;
  if (String(at ?? '').trim()) {
    const a = readNumber(at, `The ${v}-value`);
    // The slope comes from f itself: y·[…] is undefined where a factor is 0 even when the slope exists
    let slope, ya;
    try { slope = math.derivative(node, v).evaluate({ [v]: a }); ya = node.evaluate({ [v]: a }); } catch { /* handled below */ }
    if (typeof slope !== 'number' || !Number.isFinite(slope)) throw new EngineError(`dy/dx is not defined at ${v} = ${a}.`);
    point = { a, y: typeof ya === 'number' ? ya : null, slope };
  }

  const asFunction = (m) => (x) => { try { const y = m.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  return {
    variable: v, f: fTex, steps, answer, verified, point, fAt: asFunction(node), dAt: asFunction(answerNode),
    result: answerNode.toString(), plot: null,
    notes: ['ln only works for positive values, so this assumes y > 0 (and each factor > 0). The formula for dy/dx still holds wherever y is defined and not 0.'],
  };
}
