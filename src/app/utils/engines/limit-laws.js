/**
 * Properties (laws) of limits: the maths for /limit-laws-calculator.
 * The page splits the function with the law that fits (sum, constant multiple, product, quotient, power, root,
 * function of a limit), finds the limit of each piece, and puts the pieces back together. Where a law does not apply
 * (a quotient whose bottom tends to 0, an infinite piece) it says so and hands over to the limit calculator's method.
 * Every answer is compared with the limit calculator's own value.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, variablesOf, tex, polish, unwrap, isConstantIn } from '../symbolic/tree';
import { limit, readPoint, texValue } from '../symbolic/limit';

const INF = Infinity;
const ok = (y) => Number.isFinite(y);
const close = (p, q) => Math.abs(p - q) <= 1e-8 * Math.max(1, Math.abs(p), Math.abs(q));

export function solve({ f: tf, a: ta }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readPoint(ta);
  if (!ok(a)) throw new EngineError('The limit laws are shown here for x approaching a number. For x → ∞ use the limit calculator.');
  const aTex = texValue(a);
  const steps = [];
  const lawsUsed = [];
  let stuck = null;

  const L = (n) => `\\lim_{${v}\\to ${aTex}} ${tex(polish(n))}`;

  /** The limit of n using the laws; records a step for every law used. Returns a number, or NaN when the laws cannot decide. */
  function lim(raw, depth) {
    const n = unwrap(raw);
    if (isConstantIn(n, v)) {
      const y = n.evaluate({});
      steps.push({ title: 'Constant', text: 'The limit of a constant is that constant.', formula: '\\lim c = c', depth, lines: [`${L(n)} = ${texValue(y)}`] });
      return y;
    }
    if (n.isSymbolNode) {
      steps.push({ title: `Identity: ${v} → ${aTex}`, text: `As ${v} gets close to ${aTex}, ${v} itself gets close to ${aTex}.`, formula: `\\lim_{x \\to a} x = a`, depth, lines: [`${L(n)} = ${aTex}`] });
      return a;
    }
    if (n.isOperatorNode && n.args.length === 1 && n.fn === 'unaryMinus') {
      const slot = steps.length; steps.push(null);
      const y = lim(n.args[0], depth + 1);
      steps[slot] = { title: 'Constant multiple law (−1)', text: 'A minus sign just comes out of the limit.', formula: '\\lim c\\,f = c\\lim f', depth, lines: [`${L(n)} = -(${texValue(y)}) = ${texValue(-y)}`] };
      lawsUsed.push('constant multiple');
      return -y;
    }
    if (n.isOperatorNode && n.args.length === 2) {
      const [p, q] = n.args;
      const named = {
        add: ['Sum law', 'The limit of a sum is the sum of the limits (when each exists).', '\\lim (f + g) = \\lim f + \\lim g', (x, y) => x + y, '+'],
        subtract: ['Difference law', 'The limit of a difference is the difference of the limits.', '\\lim (f - g) = \\lim f - \\lim g', (x, y) => x - y, '-'],
        multiply: ['Product law', 'The limit of a product is the product of the limits.', '\\lim (f\\,g) = \\lim f \\cdot \\lim g', (x, y) => x * y, '\\cdot'],
        divide: ['Quotient law', 'The limit of a quotient is the quotient of the limits, as long as the bottom limit is not 0.', '\\lim \\frac{f}{g} = \\frac{\\lim f}{\\lim g}, \\ \\lim g \\neq 0', (x, y) => x / y, '\\div'],
      }[n.fn];
      if (named) {
        const slot = steps.length; steps.push(null);
        const isConstMult = n.fn === 'multiply' && (isConstantIn(p, v) || isConstantIn(q, v));
        const x = lim(p, depth + 1), y = lim(q, depth + 1);
        if (!ok(x) || !ok(y)) { steps[slot] = { title: named[0], text: 'One of the pieces does not settle to a number, so this law cannot be used.', depth, lines: [`${L(n)}`] }; if (!stuck) stuck = `a piece of ${tex(polish(n))} has no finite limit`; return NaN; }
        if (n.fn === 'divide' && Math.abs(y) < 1e-12) {
          steps[slot] = { title: 'Quotient law: not allowed', text: 'The bottom tends to 0, so the quotient law cannot be used. A different method is needed: factor, rationalise or use L’Hôpital’s rule.', formula: named[2], depth, lines: [`\\lim_{${v}\\to ${aTex}} \\text{bottom} = 0`] };
          if (!stuck) stuck = 'the bottom of a quotient tends to 0';
          return NaN;
        }
        const r = named[3](x, y);
        const title = isConstMult ? 'Constant multiple law' : named[0];
        steps[slot] = {
          title, text: isConstMult ? 'A constant factor comes straight out of the limit.' : named[1],
          formula: isConstMult ? '\\lim c\\,f = c\\lim f' : named[2], depth,
          lines: [`${L(n)} = ${texValue(x)} ${named[4]} ${y < 0 ? `(${texValue(y)})` : texValue(y)} = ${texValue(r)}`],
        };
        lawsUsed.push(isConstMult ? 'constant multiple' : named[0].toLowerCase());
        return r;
      }
      if (n.fn === 'pow' && isConstantIn(q, v)) {
        const slot = steps.length; steps.push(null);
        const x = lim(p, depth + 1);
        const e = q.evaluate({});
        const r = ok(x) ? x ** e : NaN;
        if (!ok(r)) { if (!stuck) stuck = `${tex(polish(p))}^{${texValue(e)}} is not defined at the limit of the base`; steps[slot] = { title: 'Power law', text: 'The power of the limit is not a real number here.', depth, lines: [L(n)] }; return NaN; }
        steps[slot] = { title: 'Power law', text: 'The limit of a power is the power of the limit.', formula: '\\lim f^{n} = \\left(\\lim f\\right)^{n}', depth, lines: [`${L(n)} = (${texValue(x)})^{${texValue(e)}} = ${texValue(r)}`] };
        lawsUsed.push('power');
        return r;
      }
    }
    if (n.isFunctionNode && n.args.length === 1) {
      const slot = steps.length; steps.push(null);
      const x = lim(n.args[0], depth + 1);
      const r = ok(x) ? callValue(n.fn.name, x) : NaN;
      const name = n.fn.name === 'sqrt' ? 'Root law' : 'Continuous function law';
      if (!ok(r)) { if (!stuck) stuck = `${n.fn.name} is not defined at the limit of its inside`; steps[slot] = { title: name, text: 'The function is not defined there.', depth, lines: [L(n)] }; return NaN; }
      steps[slot] = {
        title: name, text: n.fn.name === 'sqrt' ? 'The limit of a square root is the square root of the limit (the limit must not be negative).' : 'For a function that is continuous at the limiting value, the limit goes inside it.',
        formula: '\\lim g(f(x)) = g\\left(\\lim f(x)\\right)', depth,
        lines: [`${L(n)} = ${callTex(n.fn.name, texValue(x))} = ${texValue(r)}`],
      };
      lawsUsed.push(n.fn.name === 'sqrt' ? 'root' : 'continuity');
      return r;
    }
    steps.push({ title: 'This piece', depth, lines: [L(n)] });
    if (!stuck) stuck = 'a piece could not be split further';
    return NaN;
  }

  const value = lim(node, 0);
  const reference = limit(node, v, a, 'both');
  let finalValue = value;
  let usedLaws = lawsUsed.length > 0 && ok(value);
  if (!ok(value)) {
    usedLaws = false;
    steps.push({
      title: 'The laws cannot finish this one',
      text: `The limit laws need every piece to settle to a number, and ${stuck || 'a piece does not'}. Use the limit calculator's methods (factoring, rationalising, L'Hôpital).`,
      lines: reference.steps.length ? reference.steps.map((s) => s.lines?.[s.lines.length - 1]).filter(Boolean) : [`${L(node)}`],
    });
    finalValue = reference.value;
  }
  const verified = !usedLaws || (ok(reference.value) && close(value, reference.value));
  return {
    variable: v, f: tex(polish(node)), a: aTex, usedLaws, lawsUsed: [...new Set(lawsUsed)],
    value: finalValue, valueTex: ok(finalValue) ? texValue(finalValue) : finalValue === INF ? '\\infty' : finalValue === -INF ? '-\\infty' : '\\text{does not exist}',
    verified, notes: [], steps, result: finalValue, plot: null,
  };
}

/** g(x) for a function name and a number; NaN when it has no real value there. */
function callValue(name, x) {
  try { const y = math.evaluate(`${name}(${x})`); return typeof y === 'number' ? y : NaN; } catch { return NaN; }
}

const FUNCTION_TEX = { asin: '\\sin^{-1}', acos: '\\cos^{-1}', atan: '\\tan^{-1}', log: '\\ln', log10: '\\log_{10}', abs: '\\operatorname{abs}' };

/** g(inside) written as LaTeX, e.g. \sin\left(\frac{1}{2}\right). */
function callTex(name, inside) {
  if (name === 'sqrt') return `\\sqrt{${inside}}`;
  if (name === 'exp') return `e^{${inside}}`;
  return `${FUNCTION_TEX[name] || `\\${name}`}\\left(${inside}\\right)`;
}
