/**
 * Integration by parts: the maths for /integration-by-parts-calculator.
 *   ∫ u dv = u v − ∫ v du
 * u is chosen by ILATE (Inverse trig, Logarithmic, Algebraic, Trigonometric, Exponential: the first kind in that
 * list is u), or typed by the student. The page shows each round: u, dv, du, v, the formula filled in. When the new
 * integral still needs parts, the next round is shown too (up to 3 rounds). The e^x·sin x type, where the integral
 * comes back, is handled by the integral engine and shown with its own steps. Every answer is checked by differentiating.
 */
import { EngineError } from '../numeric/steps';
import { derivativeMatches } from './integral';
import { readLimit, between } from './definite-helpers';
import {
  math, parse, variablesOf, tex, text, polish, tidy, bestForm, num, mul, div, sub, unwrap, isConstantIn,
} from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { integrate } from '../symbolic/integral';
import { cleanest } from '../symbolic/present';

const INVERSE = new Set(['asin', 'acos', 'atan']);
const TRIG = new Set(['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'sinh', 'cosh']);

const ILATE_NAME = ['inverse trig', 'logarithmic', 'algebraic', 'trigonometric', 'exponential'];

/** Which letter of ILATE a factor is: 0 inverse trig, 1 log, 2 algebraic, 3 trig, 4 exponential. */
function rankOf(n, v) {
  const m = unwrap(n);
  if (m.isFunctionNode) {
    const name = m.fn.name;
    if (INVERSE.has(name)) return 0;
    if (name === 'log' || name === 'log10') return 1;
    if (name === 'exp') return 4;
    if (TRIG.has(name)) return 3;
    if (name === 'sqrt' || name === 'cbrt' || name === 'abs') return 2;
  }
  if (m.isOperatorNode && m.fn === 'pow' && isConstantIn(m.args[0], v) && !isConstantIn(m.args[1], v)) return 4;
  return 2;
}

function factorsOf(raw) {
  const out = [];
  const walk = (t, inv) => {
    const n = unwrap(t);
    if (n.isOperatorNode && n.fn === 'multiply') { n.args.forEach((a) => walk(a, inv)); return; }
    if (n.isOperatorNode && n.fn === 'divide') { walk(n.args[0], inv); walk(n.args[1], !inv); return; }
    if (n.isOperatorNode && n.fn === 'unaryMinus') { out.push({ node: num(-1), inv: false }); walk(n.args[0], inv); return; }
    out.push({ node: n, inv });
  };
  walk(raw, false);
  return out;
}

const product = (list) => list.reduce((acc, f) => (acc ? (f.inv ? div(acc, f.node) : mul(acc, f.node)) : (f.inv ? div(num(1), f.node) : f.node)), null) ?? num(1);

const wrap = (node) => {
  const n = unwrap(node);
  return n.isSymbolNode || (n.isConstantNode && n.value >= 0) ? tex(n) : `\\left(${tex(polish(n))}\\right)`;
};

/** Split an integrand into u and dv. `given` is the student's u, or null for ILATE. */
function split(f, v, given) {
  if (given) {
    const u = parse(given, 'u');
    if (!variablesOf(u).has(v)) throw new EngineError(`u must use ${v}, for example u = ${v}.`);
    const dv = tidy(math.simplify(div(f, u)));
    // u times dv must give back f
    for (const x of [0.4, 1.3, 2.2]) {
      const a = valueOf(f, { [v]: x }), b = valueOf(mul(u, dv), { [v]: x });
      if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) > 1e-8 * Math.max(1, Math.abs(a))) throw new EngineError('u times dv does not give back the integrand. Check the u you typed.');
    }
    return { u, dv, why: 'You chose u yourself, so dv is everything else.' };
  }
  const factors = factorsOf(f);
  if (factors.length === 1 && !factors[0].inv) {
    return { u: factors[0].node, dv: num(1), why: 'There is only one factor. Write it as (the function) × 1, make the function u and let dv = 1 dx.' };
  }
  const ranks = factors.map((fc) => (fc.inv ? 2 : rankOf(fc.node, v)));
  const best = Math.min(...ranks);
  const pick = factors.filter((_, i) => ranks[i] === best);
  const others = factors.filter((_, i) => ranks[i] !== best);
  return {
    u: product(pick), dv: product(others),
    why: `By ILATE, the ${ILATE_NAME[best]} part comes first in the list, so it is u; everything else is dv.`,
  };
}

const valueOf = (node, scope) => { try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

/** Does the integral engine need by parts to do this integrand? */
function usesParts(node, v) {
  try { return integrate(node, v).steps.some((s) => /by parts/i.test(s.title)); } catch { return false; }
}

export function solve({ f: tf, u: tu = '', a: ta = '', b: tb = '' }) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no x here, so parts is not needed.');
  const v = vars[0];
  const top = unwrap(f);
  if (top.isOperatorNode && (top.fn === 'add' || top.fn === 'subtract')) throw new EngineError('This is a sum. Integrate it term by term, using parts only on the term that needs it.');

  const steps = [];
  const rounds = [];
  let current = f;
  let given = String(tu).trim() || null;
  let cyclic = false;

  for (let k = 1; k <= 3; k++) {
    const { u, dv, why } = split(current, v, given);
    given = null;
    const du = bestForm(differentiate(u, v).result);
    let vNode;
    try {
      vNode = bestForm(integrate(dv, v).result);
    } catch (e) {
      if (!(e instanceof EngineError)) throw e;
      if (k === 1) throw new EngineError(`dv = ${text(dv)} cannot be integrated, so this choice of u does not work. Try another u.`);
      break;
    }
    const next = tidy(mul(vNode, du));
    rounds.push({ k, from: current, u, dv, du, v: vNode, next, why });
    // Is another round needed? Only when the new integral is a product that still needs parts
    const nextTop = unwrap(bestForm(next));
    const again = k < 3 && nextTop.isOperatorNode && usesParts(nextTop, v);
    if (!again) break;
    // The integral coming back (e^x sin x): leave it to the integral engine
    const sample = [0.5, 1.1, 1.9].map((x) => valueOf(f, { [v]: x }) / valueOf(nextTop, { [v]: x }));
    if (sample.every((s) => Number.isFinite(s)) && sample.every((s) => Math.abs(s - sample[0]) < 1e-8 * Math.max(1, Math.abs(sample[0])))) { cyclic = true; break; }
    current = nextTop;
  }

  // Build the answer from the last round back: I = u v − I_next
  const last = rounds[rounds.length - 1];
  let tail;
  try { tail = integrate(last.next, v).result; } catch (e) { if (!(e instanceof EngineError)) throw e; throw new EngineError('The new integral ∫ v du is not one NETZ can finish. Try a different u.'); }
  let total = tail;
  // Each round says  I = u v − (the next integral), so work from the last round back to the first
  for (let i = rounds.length - 1; i >= 0; i--) total = sub(mul(rounds[i].u, rounds[i].v), total);
  // The e^x·sin x type comes back to itself: the integral engine solves that equation, so use its answer
  if (cyclic) { try { total = integrate(f, v).result; } catch (e) { if (!(e instanceof EngineError)) throw e; } }
  const answer = cleanest(tidy(total), v, (g) => derivativeMatches(g, f, v, {})) || bestForm(tidy(total));
  if (!derivativeMatches(answer, f, v, {})) throw new EngineError('NETZ found an answer but it failed the check, so it is not shown. Try a different u.');

  rounds.forEach((r, i) => {
    const label = rounds.length > 1 ? ` (round ${r.k})` : '';
    steps.push({
      title: `Choose u and dv${label}`,
      text: r.why,
      formula: 'u = \\text{the part to differentiate}, \\quad dv = \\text{the part to integrate}',
      lines: [`\\int ${tex(polish(r.from))}\\,d${v} = \\int u\\,dv, \\quad u = ${tex(polish(r.u))}, \\quad dv = ${tex(polish(r.dv))}\\,d${v}`],
    });
    steps.push({
      title: `Find du and v${label}`,
      text: 'Differentiate u to get du. Integrate dv to get v (no +C yet; it is added at the very end).',
      lines: [`du = ${wrap(r.du)}\\,d${v}`, `v = \\int ${tex(polish(r.dv))}\\,d${v} = ${tex(polish(r.v))}`],
    });
    steps.push({
      title: `Put them into the formula${label}`,
      text: 'The formula turns one integral into u v minus a new integral. The aim is that the new integral is easier.',
      formula: '\\int u\\,dv = u\\,v - \\int v\\,du',
      lines: [`\\int ${tex(polish(r.from))}\\,d${v} = ${wrap(r.u)}\\cdot ${wrap(r.v)} - \\int ${wrap(r.v)}\\cdot ${wrap(r.du)}\\,d${v}`, `\\phantom{\\int ${tex(polish(r.from))}\\,d${v}} = ${tex(polish(bestForm(mul(r.u, r.v))))} - \\int ${tex(polish(bestForm(r.next)))}\\,d${v}`],
    });
    if (i < rounds.length - 1) steps.push({ title: 'The new integral still has a product in it', text: 'Use parts again on it. Keep the same pattern: the same kind of part is u each time.', lines: [`\\int ${tex(polish(bestForm(r.next)))}\\,d${v}`] });
  });
  steps.push({
    title: cyclic ? 'Finish the new integral' : 'Integrate what is left',
    text: cyclic
      ? 'This integral leads back to the one we started with. The trick is to treat it as an equation and solve for the integral. NETZ finished it with that method.'
      : 'The last integral is a basic one. Integrate it, then join everything up.',
    lines: [`\\int ${tex(polish(bestForm(last.next)))}\\,d${v} = ${tex(polish(bestForm(tail)))}`],
  });

  let definite = null;
  if (String(ta).trim() || String(tb).trim()) {
    const A = readLimit(ta, 'The lower limit a'), B = readLimit(tb, 'The upper limit b');
    const r = between(answer, f, v, A, B);
    definite = { a: A.tex, b: B.tex, ...r };
    steps.push({
      title: 'Put in the limits',
      text: 'Put the upper limit into the answer, then the lower, and subtract. (No +C for a definite integral.)',
      formula: 'F(b) - F(a)',
      lines: [`\\left[${tex(polish(answer))}\\right]_{${A.tex}}^{${B.tex}} = ${r.valueTex}`],
    });
  } else {
    steps.push({
      title: 'Put it together and check',
      text: 'Add the constant of integration, and check by differentiating: the derivative of the answer must be the integrand.',
      lines: [`\\int ${tex(polish(f))}\\,d${v} = ${tex(polish(answer))} + C`, `\\frac{d}{d${v}}\\left[${tex(polish(answer))}\\right] = ${tex(polish(f))} \\;\\checkmark`],
    });
  }

  return {
    variable: v, f: tex(polish(f)), rounds: rounds.map((r) => ({ k: r.k, u: tex(polish(r.u)), dv: tex(polish(r.dv)), du: tex(polish(r.du)), v: tex(polish(r.v)) })),
    answer: tex(polish(answer)), answerText: text(polish(answer)), definite, cyclic,
    verified: true, notes: [], steps,
    result: definite ? (Number.isFinite(definite.value) ? definite.value : definite.numeric) : `${text(polish(answer))} + C`, plot: null,
  };
}
