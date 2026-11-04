/**
 * Differentiation, rule by rule, with the working recorded (NETZ_METHODS_CATALOG.md section 0.1).
 * Each step: { rule, formula, line, depth } where `line` reads  d/dx[part] = …  for that part of the expression.
 * Steps are listed outermost first, the way a textbook writes them.
 */
import { EngineError } from '../numeric/steps';
import {
  num, fn, neg, add, sub, mul, div, pow, unwrap, tidy, tex, isConstantIn, polish,
} from './tree';

const RULE = {
  sum: ['Sum rule', "(u + v)' = u' + v'"],
  difference: ['Difference rule', "(u - v)' = u' - v'"],
  negative: ['Negative sign', "(-u)' = -u'"],
  constant: ['Constant multiple rule', "(c\\,u)' = c\\,u'"],
  product: ['Product rule', "(uv)' = u'v + uv'"],
  quotient: ['Quotient rule', "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}"],
  power: ['Power rule', "(x^n)' = n\\,x^{n-1}"],
  powerChain: ['Power rule with the chain rule', "(u^n)' = n\\,u^{n-1}\\cdot u'"],
  exp: ['Exponential rule', "(e^u)' = e^u\\cdot u'"],
  expBase: ['Exponential rule (base a)', "(a^u)' = a^u \\ln a \\cdot u'"],
  general: ['Logarithmic differentiation', "(u^v)' = u^v\\left(v' \\ln u + \\frac{v\\,u'}{u}\\right)"],
};

// f'(u) for each function, and the formula shown in the step
const FUNCS = {
  sin: [(u) => fn('cos', u), "\\frac{d}{dx}\\sin u = \\cos u \\cdot u'"],
  cos: [(u) => neg(fn('sin', u)), "\\frac{d}{dx}\\cos u = -\\sin u \\cdot u'"],
  tan: [(u) => pow(fn('sec', u), num(2)), "\\frac{d}{dx}\\tan u = \\sec^2 u \\cdot u'"],
  sec: [(u) => mul(fn('sec', u), fn('tan', u)), "\\frac{d}{dx}\\sec u = \\sec u \\tan u \\cdot u'"],
  csc: [(u) => neg(mul(fn('csc', u), fn('cot', u))), "\\frac{d}{dx}\\csc u = -\\csc u \\cot u \\cdot u'"],
  cot: [(u) => neg(pow(fn('csc', u), num(2))), "\\frac{d}{dx}\\cot u = -\\csc^2 u \\cdot u'"],
  exp: [(u) => fn('exp', u), "\\frac{d}{dx}e^u = e^u \\cdot u'"],
  log: [(u) => div(num(1), u), "\\frac{d}{dx}\\ln u = \\frac{u'}{u}"],
  log10: [(u) => div(num(1), mul(u, fn('log', num(10)))), "\\frac{d}{dx}\\log_{10} u = \\frac{u'}{u \\ln 10}"],
  sqrt: [(u) => div(num(1), mul(num(2), fn('sqrt', u))), "\\frac{d}{dx}\\sqrt{u} = \\frac{u'}{2\\sqrt{u}}"],
  cbrt: [(u) => div(num(1), mul(num(3), pow(fn('cbrt', u), num(2)))), "\\frac{d}{dx}\\sqrt[3]{u} = \\frac{u'}{3\\sqrt[3]{u}^2}"],
  asin: [(u) => div(num(1), fn('sqrt', sub(num(1), pow(u, num(2))))), "\\frac{d}{dx}\\sin^{-1} u = \\frac{u'}{\\sqrt{1 - u^2}}"],
  acos: [(u) => neg(div(num(1), fn('sqrt', sub(num(1), pow(u, num(2)))))), "\\frac{d}{dx}\\cos^{-1} u = -\\frac{u'}{\\sqrt{1 - u^2}}"],
  atan: [(u) => div(num(1), add(num(1), pow(u, num(2)))), "\\frac{d}{dx}\\tan^{-1} u = \\frac{u'}{1 + u^2}"],
  sinh: [(u) => fn('cosh', u), "\\frac{d}{dx}\\sinh u = \\cosh u \\cdot u'"],
  cosh: [(u) => fn('sinh', u), "\\frac{d}{dx}\\cosh u = \\sinh u \\cdot u'"],
  tanh: [(u) => sub(num(1), pow(fn('tanh', u), num(2))), "\\frac{d}{dx}\\tanh u = (1 - \\tanh^2 u) \\cdot u'"],
  abs: [(u) => div(u, fn('abs', u)), "\\frac{d}{dx}|u| = \\frac{u}{|u|} \\cdot u' \\ (u \\neq 0)"],
};

// How each function is named in the step titles
const NAMES = { log: 'ln', log10: 'log₁₀', sqrt: '√', cbrt: '∛', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', abs: '|x|', exp: 'eˣ' };

/** Exponent minus one, as a number when the exponent is a plain number (3 → 2) or as (n − 1). */
const minusOne = (ex) => (ex.isConstantNode ? num(ex.value - 1) : sub(ex, num(1)));
const isSymbol = (n, name) => n.isSymbolNode && n.name === name;

/** One derivative with its steps. Returns { result (tidied node), steps }. */
export function differentiate(node, v = 'x') {
  const steps = [];
  const ddx = `\\frac{d}{d${v}}`;
  let count = 0;

  function d(raw, depth) {
    if (++count > 400) throw new EngineError('This expression is too big to show step by step.');
    const n = unwrap(raw);
    if (isConstantIn(n, v)) return num(0);
    if (isSymbol(n, v)) return num(1);

    // Reserve this step's place so steps read outermost first
    const slot = steps.length;
    steps.push(null);
    const record = (kind, result, extra = {}) => {
      const [rule, formula] = Array.isArray(kind) ? kind : RULE[kind];
      steps[slot] = { rule, formula, line: `${ddx}\\left[${tex(polish(n))}\\right] = ${tex(polish(result))}`, depth, ...extra };
      return result;
    };

    if (n.isOperatorNode) {
      // Fold a × b × c into (a × b) × c so every rule sees two parts
      if (n.args.length > 2) {
        const folded = n.args.slice(1).reduce((acc, a) => new n.constructor(n.op, n.fn, [acc, a]), n.args[0]);
        steps.pop();
        return d(folded, depth);
      }
      const [a, b] = n.args;
      switch (n.fn) {
        case 'unaryPlus': steps.pop(); return d(a, depth);
        case 'unaryMinus': return record('negative', tidy(neg(d(a, depth + 1))));
        case 'add':
        case 'subtract': {
          // a + b − c + d …: one step for the whole sum, then each term
          const terms = [];
          const collect = (t, sign) => {
            const x = unwrap(t);
            if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract') && x.args.length === 2) {
              collect(x.args[0], sign);
              collect(x.args[1], x.fn === 'subtract' ? -sign : sign);
            } else terms.push({ node: x, sign });
          };
          collect(n, 1);
          const parts = terms.map((t) => ({ ...t, d: d(t.node, depth + 1) }));
          const result = parts.slice(1).reduce((acc, t) => (t.sign > 0 ? add(acc, t.d) : sub(acc, t.d)), parts[0].sign > 0 ? parts[0].d : neg(parts[0].d));
          const mixed = terms.some((t) => t.sign < 0);
          return record(mixed ? ['Sum and difference rule', "(u \\pm v)' = u' \\pm v'"] : 'sum', tidy(result));
        }
        case 'multiply':
          if (isConstantIn(a, v)) return record('constant', tidy(mul(a, d(b, depth + 1))));
          if (isConstantIn(b, v)) return record('constant', tidy(mul(b, d(a, depth + 1))));
          {
            const da = d(a, depth + 1), db = d(b, depth + 1);
            return record('product', tidy(add(mul(da, b), mul(a, db))), { parts: { u: tex(a), v: tex(b), du: tex(da), dv: tex(db) } });
          }
        case 'divide':
          if (isConstantIn(b, v)) return record('constant', tidy(div(d(a, depth + 1), b)));
          {
            const da = d(a, depth + 1), db = d(b, depth + 1);
            return record('quotient', tidy(div(sub(mul(da, b), mul(a, db)), pow(b, num(2)))), { parts: { u: tex(a), v: tex(b), du: tex(da), dv: tex(db) } });
          }
        case 'pow': {
          const base = unwrap(a), ex = unwrap(b);
          if (isConstantIn(ex, v)) {
            if (isSymbol(base, v)) return record('power', tidy(mul(ex, pow(base, minusOne(ex)))));
            return record('powerChain', tidy(mul(mul(ex, pow(base, minusOne(ex))), d(base, depth + 1))));
          }
          if (isConstantIn(base, v)) {
            const dex = d(ex, depth + 1);
            if (isSymbol(base, 'e')) return record('exp', tidy(mul(pow(base, ex), dex)));
            return record('expBase', tidy(mul(mul(pow(base, ex), fn('log', base)), dex)));
          }
          const da = d(base, depth + 1), dex = d(ex, depth + 1);
          return record('general', tidy(mul(pow(base, ex), add(mul(dex, fn('log', base)), div(mul(ex, da), base)))));
        }
        default:
          throw new EngineError(`The operation "${n.op}" can't be differentiated here.`);
      }
    }

    if (n.isFunctionNode) {
      const name = n.fn.name;
      // log(u, b) = ln u / ln b
      if (name === 'log' && n.args.length === 2) {
        steps.pop();
        return d(div(fn('log', n.args[0]), fn('log', n.args[1])), depth);
      }
      const entry = FUNCS[name];
      if (!entry) throw new EngineError(`NETZ can't differentiate "${name}" yet.`);
      const u = unwrap(n.args[0]);
      const outer = entry[0](u);
      if (isSymbol(u, v)) return record([`Derivative of ${NAMES[name] || name}`, entry[1]], tidy(outer));
      return record([`Derivative of ${NAMES[name] || name} with the chain rule`, entry[1]], tidy(mul(outer, d(u, depth + 1))));
    }

    // A letter other than the variable is a constant (handled above), so this is unexpected
    throw new EngineError('Part of this expression could not be differentiated.');
  }

  const result = tidy(d(node, 0));
  return { result, steps: steps.filter(Boolean) };
}

