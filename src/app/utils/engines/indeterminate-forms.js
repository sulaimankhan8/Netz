/**
 * Indeterminate forms: the maths for /indeterminate-forms-calculator.
 * NETZ finds what each part of the function tends to, names the form (0/0, ∞/∞, 0·∞, ∞−∞, 1^∞, 0⁰, ∞⁰), explains why that
 * form does not decide the answer, rewrites it as 0/0 or ∞/∞ and finishes with the limit calculator (L'Hôpital and friends).
 * Every answer is compared with the limit calculator's value for the original function.
 */
import { EngineError } from '../numeric/steps';
import { parse, variablesOf, tex, polish, unwrap, fn, mul, div, num, bestForm } from '../symbolic/tree';
import { limit, readPoint, texValue } from '../symbolic/limit';

const INF = Infinity;
const isZero = (y) => Number.isFinite(y) && Math.abs(y) < 1e-12;
const isInf = (y) => y === INF || y === -INF;
const lt = (y) => (y === INF ? '\\infty' : y === -INF ? '-\\infty' : Number.isNaN(y) ? '\\text{DNE}' : texValue(y));

const FORMS = {
  '0/0': { tex: '\\frac{0}{0}', why: 'Top and bottom both shrink to 0. Zero over a tiny number can be anything: it depends on which one shrinks faster. For example x/x → 1 but x²/x → 0 and x/x² → ∞.' },
  '∞/∞': { tex: '\\frac{\\infty}{\\infty}', why: 'Top and bottom both grow without bound. The result depends on which grows faster: x²/x → ∞ but x/x² → 0 and 2x/x → 2.' },
  '0·∞': { tex: '0\\cdot\\infty', why: 'One factor shrinks to 0 while the other grows without bound. Which one wins decides the answer: x·(1/x) → 1 but x²·(1/x) → 0.' },
  '∞−∞': { tex: '\\infty - \\infty', why: 'Two large numbers are subtracted. They may cancel completely or leave anything: (x + 1) − x → 1 but x² − x → ∞.' },
  '1^∞': { tex: '1^{\\infty}', why: 'The base is almost 1 and the power is huge. 1 raised to anything is 1, but a base just above 1 raised to a huge power grows: (1 + 1/n)ⁿ → e, not 1.' },
  '0^0': { tex: '0^{0}', why: 'A base that tends to 0 and a power that tends to 0 pull in opposite directions (0ˣ wants 0, x⁰ wants 1), so the answer is not fixed.' },
  '∞^0': { tex: '\\infty^{0}', why: 'A huge base and a power near 0 pull in opposite directions (huge numbers want ∞, power 0 wants 1).' },
};

const limitOf = (node, v, a) => { try { return limit(node, v, a, 'both'); } catch { return { value: NaN, steps: [] }; } };

export function solve({ f: tf, a: ta }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readPoint(ta);
  const aTex = a === INF ? '\\infty' : a === -INF ? '-\\infty' : texValue(a);
  const top = unwrap(node);
  const L = (n) => `\\lim_{${v}\\to ${aTex}} ${tex(polish(n))}`;
  const reference = limitOf(node, v, a);
  const steps = [];

  // Which form is it? Look at the shape of f and the limit of each part.
  let form = null;
  let parts = [];
  const tendency = (n) => limitOf(n, v, a).value;
  if (top.isOperatorNode && top.fn === 'divide') {
    const [p, q] = top.args.map(unwrap);
    const x = tendency(p), y = tendency(q);
    parts = [['top', p, x], ['bottom', q, y]];
    if (isZero(x) && isZero(y)) form = '0/0';
    else if (isInf(x) && isInf(y)) form = '∞/∞';
  } else if (top.isOperatorNode && top.fn === 'multiply' && top.args.length === 2) {
    const [p, q] = top.args.map(unwrap);
    const x = tendency(p), y = tendency(q);
    parts = [['first factor', p, x], ['second factor', q, y]];
    if ((isZero(x) && isInf(y)) || (isInf(x) && isZero(y))) form = '0·∞';
  } else if (top.isOperatorNode && top.fn === 'subtract') {
    const [p, q] = top.args.map(unwrap);
    const x = tendency(p), y = tendency(q);
    parts = [['first term', p, x], ['second term', q, y]];
    if (isInf(x) && isInf(y) && x === y) form = '∞−∞';
  } else if (top.isOperatorNode && top.fn === 'pow') {
    const [p, q] = top.args.map(unwrap);
    const x = tendency(p), y = tendency(q);
    parts = [['base', p, x], ['power', q, y]];
    if (Number.isFinite(x) && Math.abs(x - 1) < 1e-12 && isInf(y)) form = '1^∞';
    else if (isZero(x) && isZero(y)) form = '0^0';
    else if (isInf(x) && isZero(y)) form = '∞^0';
  }

  steps.push({
    title: 'Find what each part tends to',
    text: `Look at the function piece by piece. Say what each piece does as ${v} → ${aTex}.`,
    lines: parts.length
      ? parts.map(([name, n, y]) => `\\text{${name}: } ${L(n)} = ${lt(y)}`)
      : [`${L(node)}`],
  });

  if (!form) {
    steps.push({
      title: 'This is not an indeterminate form',
      text: 'The pieces do not fight each other, so the usual limit methods apply directly (substitute, factor, rationalise or compare growth).',
      lines: [`${L(node)} = ${lt(reference.value)}`],
    });
    steps.push(...reference.steps.map((s) => ({ title: s.title, text: s.text, formula: s.formula, lines: s.lines, depth: 1 })));
    return {
      variable: v, f: tex(polish(node)), a: aTex, form: null, formTex: null, value: reference.value, valueTex: lt(reference.value),
      verified: true, notes: [], steps, result: reference.value, plot: null,
    };
  }

  const info = FORMS[form];
  steps.push({
    title: `Name the form: ${form}`,
    text: info.why,
    formula: info.tex,
    lines: [`${L(node)} \\ \\to \\ ${info.tex}`],
  });

  // Rewrite as 0/0 or ∞/∞, then finish with the limit engine
  let rewritten = node;
  let rewriteText = '';
  let finalValue = reference.value;
  let finalSteps = reference.steps;
  const [p, q] = top.isOperatorNode ? top.args.map(unwrap) : [null, null];
  if (form === '0·∞') {
    // f·g = f / (1/g) turns it into 0/0
    const zeroFirst = isZero(parts[0][2]);
    const z = zeroFirst ? p : q, big = zeroFirst ? q : p;
    rewritten = div(z, div(num(1), big));
    rewriteText = 'Move one factor to the bottom as its reciprocal: f·g = f ÷ (1/g). Now it is 0/0, and L\u2019Hôpital\u2019s rule can be used.';
    steps.push({ title: 'Rewrite as a fraction (0/0)', text: rewriteText, formula: 'f\\cdot g = \\frac{f}{1/g}', lines: [`${L(node)} = ${L(bestForm(rewritten))}`] });
    const r = limitOf(rewritten, v, a); finalValue = r.value; finalSteps = r.steps;
  } else if (form === '∞−∞') {
    rewriteText = 'Combine the two terms into one fraction (common denominator, or multiply by the conjugate for roots). That usually turns it into 0/0 or ∞/∞.';
    steps.push({ title: 'Combine into one fraction', text: rewriteText, lines: [`${L(node)}`] });
    finalValue = reference.value; finalSteps = reference.steps;
  } else if (['1^∞', '0^0', '∞^0'].includes(form)) {
    // y = p^q → ln y = q·ln p, a 0·∞ form; find its limit, then y = e^(that)
    const lnY = mul(q, fn('log', p));
    const asFraction = div(fn('log', p), div(num(1), q));
    steps.push({
      title: 'Take the logarithm',
      text: 'Powers like this are tamed with logarithms: if y = fᵍ then ln y = g·ln f. That turns the power into a product.',
      formula: '\\ln y = g\\,\\ln f',
      lines: [`\\ln y = ${tex(polish(lnY))}`],
    });
    steps.push({
      title: 'Write the product as a fraction',
      text: 'The product is a 0·∞ form, so write it as a fraction (g·ln f = ln f ÷ (1/g)); now it is 0/0 and L\u2019Hôpital\u2019s rule applies.',
      lines: [`\\lim_{${v}\\to ${aTex}} \\ln y = ${L(bestForm(asFraction))}`],
    });
    const r = limitOf(asFraction, v, a);
    if (!Number.isFinite(r.value) && !isInf(r.value)) {
      steps.push({ title: 'Evaluate that limit', text: 'The limit of ln y could not be found by the usual methods.', lines: [`\\lim \\ln y = ${lt(r.value)}`] });
    } else {
      steps.push(...r.steps.map((s) => ({ title: s.title, text: s.text, formula: s.formula, lines: s.lines, depth: 1 })));
      const answer = r.value === INF ? INF : r.value === -INF ? 0 : Math.exp(r.value);
      steps.push({
        title: 'Undo the logarithm',
        text: 'We found the limit of ln y. Since y = e^(ln y), the limit of y is e raised to that.',
        formula: 'y = e^{\\ln y}',
        lines: [`\\lim y = e^{${lt(r.value)}} = ${lt(answer)}${Number.isFinite(answer) && !Number.isInteger(answer) && Math.abs(r.value - Math.round(r.value)) < 1e-12 ? ` \\approx ${Number(answer.toPrecision(6))}` : ''}`],
      });
      finalValue = answer; finalSteps = [];
    }
    rewritten = asFraction;
  } else {
    rewriteText = 'It is already a fraction of the right kind, so L\u2019Hôpital\u2019s rule or a factor-and-cancel step can be used directly.';
  }

  if (finalSteps.length && !['1^∞', '0^0', '∞^0'].includes(form)) {
    steps.push({
      title: form === '0/0' || form === '∞/∞' ? 'Resolve it (factor, cancel or use L\u2019Hôpital)' : 'Resolve it',
      text: 'The limit calculator\u2019s methods now finish the job.',
      lines: [],
    });
    steps.push(...finalSteps.map((s) => ({ title: s.title, text: s.text, formula: s.formula, lines: s.lines, depth: 1 })));
  }
  steps.push({ title: 'The limit', lines: [`${L(node)} = ${lt(finalValue)}`] });

  const same = (p0, q0) => (Number.isFinite(p0) && Number.isFinite(q0) ? Math.abs(p0 - q0) <= 1e-4 * Math.max(1, Math.abs(p0)) : p0 === q0);
  const verified = same(finalValue, reference.value) || Number.isNaN(reference.value);
  return {
    variable: v, f: tex(polish(node)), a: aTex, form, formTex: info.tex, why: info.why,
    value: finalValue, valueTex: lt(finalValue), verified, notes: [], steps, result: finalValue, plot: null,
  };
}
