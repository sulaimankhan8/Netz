/**
 * The product rule, the quotient rule and the chain rule, one rule per page, each shown the way a textbook teaches it:
 * name the parts, differentiate each part, put them into the rule, simplify, check.
 * Used by /product-rule-calculator, /quotient-rule-calculator and /chain-rule-calculator.
 * The parts are differentiated by src/app/utils/symbolic/derivative.js; every answer is compared with math.js's own
 * derivative at several points, and `verified` says whether they agree.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import {
  math, parse, variablesOf, bestForm, tex, text, polish, num, sym, fn, mul, add, sub, div, pow, unwrap, tidy, isConstantIn,
} from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { zerosOf } from '../symbolic/roots';

const SAMPLE = [0.37, 0.81, 1.29, 2.13, -0.64, 3.7, 0.55, 1.9];

const at = (node, scope) => { try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

function agree(mine, reference, v, others) {
  let compared = 0;
  for (const x of SAMPLE) {
    const a = at(mine, { ...others, [v]: x }), b = at(reference, { ...others, [v]: x });
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) return false;
  }
  return compared >= 2;
}

/** The variable of the problem (x if it is used, else the only letter) and the other letters, which act as constants. */
function variableOf(nodes) {
  const vars = [...new Set(nodes.flatMap((n) => [...variablesOf(n)]))];
  const v = vars.includes('x') || vars.length === 0 ? 'x' : vars.length === 1 ? vars[0] : 'x';
  return { v, others: vars.filter((s) => s !== v) };
}

/** A part of a formula with brackets only where they are needed: 3x stays 3x, x + 1 becomes (x + 1). */
function wrap(node) {
  const n = unwrap(node);
  if (n.isSymbolNode || (n.isConstantNode && n.value >= 0)) return tex(n);
  return `\\left(${tex(polish(n))}\\right)`;
}

const ruleNames = (steps) => [...new Set(steps.map((s) => s.rule.replace(/ with the chain rule$/, '')))];

/** The lines that show how a part was differentiated: each rule used, then the result. */
function partLines(label, node, steps, result, v) {
  const lines = steps.length > 1 ? steps.map((s) => s.line) : [];
  lines.push(`${label} = \\frac{d}{d${v}}\\left[${tex(polish(node))}\\right] = ${tex(polish(result))}`);
  return lines;
}

function checkNote(verified) {
  return verified
    ? 'NETZ compared this answer with an independent derivative at several values of x. They agree.'
    : 'NETZ could not compare this answer with an independent derivative. Treat it with care.';
}

function slopeAt(atText, answer, original, v, others) {
  if (!String(atText ?? '').trim()) return null;
  if (others.length) throw new EngineError(`To get the slope at a point, only ${v} may appear (this also uses ${others.join(', ')}).`);
  const a = readNumber(atText, `The ${v}-value`);
  const slope = at(answer, { [v]: a });
  if (!Number.isFinite(slope)) throw new EngineError(`The derivative is not defined at ${v} = ${a}.`);
  const fa = at(original, { [v]: a });
  return { a, fa: Number.isFinite(fa) ? fa : null, slope };
}

// ---------------------------------------------------------------- product rule
export function solveProduct({ u: tu, v: tv, at: tAt = '' }) {
  const U = parse(tu, 'u(x)'), V = parse(tv, 'v(x)');
  const { v: x, others } = variableOf([U, V]);
  const dU = differentiate(U, x), dV = differentiate(V, x);
  const du = bestForm(dU.result), dv = bestForm(dV.result);
  const whole = mul(U, V);
  const answer = bestForm(tidy(add(mul(du, V), mul(U, dv))));
  const verified = agree(answer, math.derivative(whole, x), x, Object.fromEntries(others.map((s, i) => [s, 1.7 + i * 0.3])));

  const steps = [
    {
      title: 'Split f into two factors, u and v',
      text: 'The product rule is for two things multiplied together. Call the first one u and the second one v.',
      formula: 'f(x) = u \\cdot v',
      lines: [`u = ${tex(polish(U))}`, `v = ${tex(polish(V))}`, `f(${x}) = u \\cdot v = ${wrap(U)}\\cdot ${wrap(V)}`],
    },
    {
      title: 'Differentiate u on its own',
      text: `Leave v alone for now and find u′. Rules used: ${ruleNames(dU.steps).join(', ') || 'constant'}.`,
      lines: partLines("u'", U, dU.steps, du, x),
    },
    {
      title: 'Differentiate v on its own',
      text: `Now find v′ the same way. Rules used: ${ruleNames(dV.steps).join(', ') || 'constant'}.`,
      lines: partLines("v'", V, dV.steps, dv, x),
    },
    {
      title: 'Put the four pieces into the product rule',
      text: 'Differentiate the first factor and keep the second as it is, then keep the first and differentiate the second. Add the two.',
      formula: "(u\\,v)' = u'\\,v + u\\,v'",
      lines: [`(u\\,v)' = ${wrap(du)}\\cdot ${wrap(V)} + ${wrap(U)}\\cdot ${wrap(dv)}`],
    },
    {
      title: 'Simplify',
      text: 'Multiply out and collect like terms to reach the tidiest form.',
      lines: [`\\frac{d}{d${x}}\\left[${tex(polish(whole))}\\right] = ${tex(polish(answer))}`],
    },
  ];
  const point = slopeAt(tAt, answer, whole, x, others);
  return {
    variable: x, kind: 'product', f: tex(polish(whole)), u: tex(polish(U)), v: tex(polish(V)), du: tex(polish(du)), dv: tex(polish(dv)),
    answer: tex(polish(answer)), answerText: text(answer), verified, point,
    notes: [checkNote(verified), ...(others.length ? [`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} treated as ${others.length === 1 ? 'a constant' : 'constants'}.`] : [])],
    steps, result: text(answer), plot: null,
  };
}

// ---------------------------------------------------------------- quotient rule
export function solveQuotient({ u: tu, v: tv, at: tAt = '' }) {
  const U = parse(tu, 'top u(x)'), V = parse(tv, 'bottom v(x)');
  const { v: x, others } = variableOf([U, V]);
  if (!variablesOf(V).size && at(V, {}) === 0) throw new EngineError('The bottom cannot be 0.');
  const dU = differentiate(U, x), dV = differentiate(V, x);
  const du = bestForm(dU.result), dv = bestForm(dV.result);
  const whole = div(U, V);
  const answer = bestForm(tidy(div(sub(mul(du, V), mul(U, dv)), pow(V, num(2)))));
  const verified = agree(answer, math.derivative(whole, x), x, Object.fromEntries(others.map((s, i) => [s, 1.7 + i * 0.3])));

  // Where the bottom is 0 the quotient does not exist
  let zeros = [];
  if (!others.length && variablesOf(V).has(x)) {
    try { zeros = zerosOf(V, x, { lo: -30, hi: 30 }).zeros; } catch { zeros = []; }
  }
  const steps = [
    {
      title: 'Name the top u and the bottom v',
      text: 'The quotient rule is for one thing divided by another. The top is u, the bottom is v.',
      formula: 'f(x) = \\frac{u}{v}',
      lines: [`u = ${tex(polish(U))}`, `v = ${tex(polish(V))}`, `f(${x}) = \\frac{${tex(polish(U))}}{${tex(polish(V))}}`],
    },
    {
      title: 'Differentiate the top',
      text: `Find u′. Rules used: ${ruleNames(dU.steps).join(', ') || 'constant'}.`,
      lines: partLines("u'", U, dU.steps, du, x),
    },
    {
      title: 'Differentiate the bottom',
      text: `Find v′. Rules used: ${ruleNames(dV.steps).join(', ') || 'constant'}.`,
      lines: partLines("v'", V, dV.steps, dv, x),
    },
    {
      title: 'Put the pieces into the quotient rule',
      text: 'Bottom times derivative of the top, minus top times derivative of the bottom, all over the bottom squared. Remember "low d-high minus high d-low".',
      formula: "\\left(\\frac{u}{v}\\right)' = \\frac{u'\\,v - u\\,v'}{v^{2}}",
      lines: [`\\left(\\frac{u}{v}\\right)' = \\frac{${wrap(du)}\\cdot ${wrap(V)} - ${wrap(U)}\\cdot ${wrap(dv)}}{${wrap(V)}^{2}}`],
    },
    {
      title: 'Simplify',
      text: 'Expand the top, collect like terms and cancel anything common to the top and the bottom.',
      lines: [`\\frac{d}{d${x}}\\left[${tex(polish(whole))}\\right] = ${tex(polish(answer))}`],
    },
  ];
  const point = slopeAt(tAt, answer, whole, x, others);
  const notes = [checkNote(verified)];
  if (zeros.length) notes.push(`The bottom is 0 at ${x} = ${zeros.map((z) => Number(z.x.toPrecision(6))).join(', ')}, so the quotient and its derivative do not exist there.`);
  if (others.length) notes.push(`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} treated as ${others.length === 1 ? 'a constant' : 'constants'}.`);
  return {
    variable: x, kind: 'quotient', f: tex(polish(whole)), u: tex(polish(U)), v: tex(polish(V)), du: tex(polish(du)), dv: tex(polish(dv)),
    answer: tex(polish(answer)), answerText: text(answer), verified, point, notes, steps, result: text(answer), plot: null,
  };
}

// ---------------------------------------------------------------- chain rule
const isVar = (n, v) => n.isSymbolNode && n.name === v;
const FUNCTION_LABEL = { log: 'ln', sqrt: '\\sqrt{\\ }', exp: 'e^{(\\,)}' };

/** One layer of f: a function g acting on an inner expression. outer(u) gives g(u). Null when f is not a composite. */
function layerOf(raw, v) {
  const n = unwrap(raw);
  if (n.isFunctionNode && n.args.length === 1) {
    const inner = unwrap(n.args[0]);
    if (!isConstantIn(inner, v) && !isVar(inner, v)) return { inner, outer: (u) => fn(n.fn.name, u), name: FUNCTION_LABEL[n.fn.name] || n.fn.name };
    return null;
  }
  if (n.isOperatorNode && n.fn === 'pow') {
    const base = unwrap(n.args[0]), ex = unwrap(n.args[1]);
    if (isConstantIn(ex, v) && !isConstantIn(base, v) && !isVar(base, v)) return { inner: base, outer: (u) => pow(u, ex), name: 'power' };
    if (isConstantIn(base, v) && !isConstantIn(ex, v) && !isVar(ex, v)) return { inner: ex, outer: (u) => pow(base, u), name: 'exponential' };
  }
  return null;
}

/** Peel a constant multiple off the front: 3 sin(2x) → { c: 3, rest: sin(2x) }. */
function stripConstant(raw, v) {
  const n = unwrap(raw);
  if (n.isOperatorNode && n.fn === 'unaryMinus') return { c: num(-1), rest: unwrap(n.args[0]) };
  if (n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2) {
    if (isConstantIn(n.args[0], v)) return { c: n.args[0], rest: unwrap(n.args[1]) };
    if (isConstantIn(n.args[1], v)) return { c: n.args[1], rest: unwrap(n.args[0]) };
  }
  return { c: null, rest: n };
}

const replaceSymbol = (node, name, by) => node.transform((n) => (n.isSymbolNode && n.name === name ? by : n));

export function solveChain({ f: tf, at: tAt = '' }) {
  const F = parse(tf, 'f(x)');
  const { v: x, others } = variableOf([F]);
  const { c, rest } = stripConstant(F, x);
  const layers = [];
  let current = rest;
  for (let k = 0; k < 4; k++) {
    const L = layerOf(current, x);
    if (!L) break;
    layers.push(L);
    current = L.inner;
  }
  if (!layers.length) {
    const top = unwrap(F);
    const why = top.isOperatorNode && (top.fn === 'add' || top.fn === 'subtract')
      ? 'This is a sum, so differentiate it term by term first; the chain rule is for a function sitting inside another function.'
      : top.isOperatorNode && (top.fn === 'multiply' || top.fn === 'divide')
        ? 'This is a product or a quotient. Use the product rule or the quotient rule; use the chain rule on any piece that has a function inside a function.'
        : `Nothing sits inside another function here, so there is no chain: it is a basic derivative. Try something like sin(${x}^2), (3${x} + 1)^5 or e^(2${x}).`;
    throw new EngineError(why);
  }

  const names = layers.length === 1 ? ['u'] : layers.map((_, i) => `u_{${i + 1}}`);
  const symNames = layers.length === 1 ? ['u'] : layers.map((_, i) => `u${i + 1}`);
  // Each layer's derivative with respect to its own inner letter
  const layerWork = layers.map((L, i) => {
    const d = differentiate(L.outer(sym(symNames[i])), symNames[i]);
    return { L, i, d, expr: bestForm(d.result) };
  });
  const dLast = differentiate(current, x);
  const dInner = bestForm(dLast.result);
  const inners = layers.map((L) => L.inner);

  // Replace every u by what it stands for, innermost value last
  const subIn = (node) => layers.reduce((acc, L, i) => replaceSymbol(acc, symNames[i], L.inner), node);
  const pieces = [...layerWork.map((w) => subIn(w.expr)), dInner];
  let product = pieces.slice(1).reduce((acc, p) => mul(acc, p), pieces[0]);
  if (c) product = mul(c, product);
  const answer = bestForm(tidy(product));
  const reference = math.derivative(F, x);
  const verified = agree(answer, reference, x, Object.fromEntries(others.map((s, i) => [s, 1.7 + i * 0.3])));

  const dyTex = (i) => (layers.length === 1 ? '\\frac{dy}{du}' : i === 0 ? `\\frac{dy}{d${names[0]}}` : `\\frac{d${names[i - 1]}}{d${names[i]}}`);
  const duTex = (i) => (i === layers.length - 1 ? `\\frac{d${names[i]}}{d${x}}` : '');
  const chainFormula = layers.length === 1
    ? `\\frac{dy}{d${x}} = \\frac{dy}{du}\\cdot\\frac{du}{d${x}}`
    : `\\frac{dy}{d${x}} = ${layers.map((_, i) => dyTex(i)).join('\\cdot ')}\\cdot ${duTex(layers.length - 1)}`;

  const steps = [];
  if (c) {
    steps.push({
      title: 'Take the constant out front',
      text: 'A number multiplying the whole function just waits outside; we multiply it back in at the end.',
      lines: [`f(${x}) = ${tex(polish(c))}\\cdot ${wrap(rest)}`],
    });
  }
  steps.push({
    title: layers.length === 1 ? 'Find the inside and the outside' : 'Find the layers, outside to inside',
    text: 'Look for a function sitting inside another function. The inside part is u. Writing the whole thing in terms of u shows the outside function.',
    formula: layers.length === 1 ? 'y = g(u), \\quad u = h(x)' : 'y = g(u_1),\\ u_1 = h(u_2),\\ \\ldots',
    lines: [
      ...layers.map((L, i) => `${i === 0 ? 'y' : names[i - 1]} = ${tex(polish(L.outer(sym(symNames[i]))))} \\quad\\text{where } ${names[i]} = ${tex(polish(L.inner))}`.replace(/u1|u2|u3|u4/g, (m) => `u_{${m[1]}}`)),
    ],
  });
  layerWork.forEach((w, i) => {
    steps.push({
      title: layers.length === 1 ? 'Differentiate the outside function with respect to u' : `Differentiate layer ${i + 1} with respect to ${names[i]}`,
      text: `Treat ${names[i]} as if it were just a letter x. Rules used: ${ruleNames(w.d.steps).join(', ')}.`,
      lines: [`${dyTex(i)} = ${tex(polish(w.expr)).replace(/u1|u2|u3|u4/g, (m) => `u_{${m[1]}}`)}`],
    });
  });
  steps.push({
    title: layers.length === 1 ? 'Differentiate the inside function with respect to x' : `Differentiate the innermost part, ${names[names.length - 1]}, with respect to ${x}`,
    text: `Now find how the inside changes with ${x}. Rules used: ${ruleNames(dLast.steps).join(', ') || 'constant'}.`,
    lines: partLines(duTex(layers.length - 1), inners[inners.length - 1], dLast.steps, dInner, x).map((l) => l.replace(/^\\frac\{d[^}]*\}\{d[^}]*\} = /, `${duTex(layers.length - 1)} = `)),
  });
  steps.push({
    title: 'Multiply the derivatives together',
    text: 'The chain rule: the derivative of the outside (with the inside left as it is) times the derivative of the inside. Then put u back as its expression in x.',
    formula: chainFormula,
    lines: [
      `\\frac{dy}{d${x}} = ${c ? `${wrap(c)}\\cdot ` : ''}${pieces.map((p) => wrap(p)).join('\\cdot ')}`,
    ],
  });
  steps.push({
    title: 'Simplify',
    text: 'Tidy the product into its simplest form.',
    lines: [`\\frac{d}{d${x}}\\left[${tex(polish(F))}\\right] = ${tex(polish(answer))}`],
  });

  const point = slopeAt(tAt, answer, F, x, others);
  return {
    variable: x, kind: 'chain', f: tex(polish(F)),
    layers: layers.map((L, i) => ({ name: names[i], inner: tex(polish(L.inner)), outer: tex(polish(L.outer(sym(symNames[i])))).replace(/u1|u2|u3|u4/g, (m) => `u_{${m[1]}}`) })),
    answer: tex(polish(answer)), answerText: text(answer), verified, point,
    notes: [checkNote(verified), ...(others.length ? [`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} treated as ${others.length === 1 ? 'a constant' : 'constants'}.`] : [])],
    steps, result: text(answer), plot: null,
  };
}
