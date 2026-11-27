/**
 * Integration by u-substitution: the maths for /u-substitution-calculator.
 * The idea: if the integrand contains an inside part g(x) and, as a factor, its derivative g′(x) (up to a number),
 * then letting u = g(x) turns the integral into a simpler one in u.
 *   1. choose u (the page tries the candidates itself, or takes the one you type)
 *   2. du = g′(x) dx
 *   3. rewrite everything in u, integrate, put g(x) back
 *   4. for a definite integral the limits change to u(a) and u(b) and x never comes back
 * Every answer is checked by differentiating it (as the integral calculator does).
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readLimit } from './definite-helpers';
import { derivativeMatches, simpson } from './integral';
import {
  math, parse, variablesOf, tex, text, polish, tidy, bestForm, simplifyExact, num, sym, mul, div, sub, paren, unwrap, isConstantIn,
} from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { integrate } from '../symbolic/integral';
import { cleanest } from '../symbolic/present';

const POINTS = [0.37, 0.81, 1.29, 2.13, 0.64, 1.7];
const val = (node, scope) => { try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

/** A number as a node: exact fractions stay fractions. */
function numberNode(y) {
  const f = toFraction(y, 1000, 1e-9);
  if (!f) return num(Number(y.toPrecision(10)));
  return f.d === 1 ? num(f.n) : div(num(f.n), num(f.d));
}

/** Are two expressions in x the same function? Same text, or the same values at several points. */
function sameFunction(a, b, v) {
  if (a.toString() === b.toString()) return true;
  if (!variablesOf(a).has(v) || !variablesOf(b).has(v)) return false;
  let compared = 0;
  for (const x of POINTS) {
    const p = val(a, { [v]: x }), q = val(b, { [v]: x });
    if (!Number.isFinite(p) || !Number.isFinite(q)) continue;
    compared++;
    if (Math.abs(p - q) > 1e-9 * Math.max(1, Math.abs(p))) return false;
  }
  return compared >= 3;
}

/** Everything the integrand is built from, as factors: top level of products and quotients. */
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

const build = (list) => list.reduce((acc, f) => {
  const piece = f.inv ? (acc ? div(acc, f.node) : div(num(1), f.node)) : (acc ? mul(acc, f.node) : f.node);
  return piece;
}, null) ?? num(1);

/** Every part of f that contains v and could be u, biggest first (so u = x² + 1 is tried before u = x²). */
function candidatesOf(f, v) {
  const seen = new Map();
  f.traverse((n, path, parent) => {
    if (parent?.isFunctionNode && path === 'fn') return;
    const m = unwrap(n);
    if (m === unwrap(f) || m.isSymbolNode || m.isConstantNode || isConstantIn(m, v)) return;
    if (m.isOperatorNode && (m.fn === 'multiply' || m.fn === 'divide' || m.fn === 'unaryMinus')) return;
    const key = m.toString();
    if (!seen.has(key)) seen.set(key, m);
  });
  return [...seen.values()].sort((p, q) => q.toString().length - p.toString().length);
}

/** Try u = g: find g′(x) among the factors, rewrite the rest in u. Returns null when it does not work. */
function attempt(f, g, v) {
  const dgRaw = differentiate(g, v).result;
  const dg = bestForm(dgRaw);
  const factors = factorsOf(f);
  const U = 'u';
  const replace = (node) => node.transform((n) => (!n.isSymbolNode && !n.isConstantNode && sameFunction(n, g, v) && variablesOf(n).has(v) ? sym(U) : n));

  let c = 1;
  let rest = factors;
  if (isConstantIn(dg, v)) {
    c = val(dg, {});
    if (!Number.isFinite(c) || c === 0) return null;
    c = 1 / c;
  } else {
    // One factor must be a number times g′(x)
    let hit = -1;
    for (let i = 0; i < factors.length && hit < 0; i++) {
      const { node, inv } = factors[i];
      if (isConstantIn(node, v)) continue;
      let ratio = null, ok = true;
      for (const x of POINTS) {
        const m = val(node, { [v]: x }), d = val(dg, { [v]: x });
        const mv = inv ? 1 / m : m;
        if (!Number.isFinite(mv) || !Number.isFinite(d) || Math.abs(d) < 1e-9) { continue; }
        const r = mv / d;
        if (ratio === null) ratio = r; else if (Math.abs(r - ratio) > 1e-8 * Math.max(1, Math.abs(ratio))) { ok = false; break; }
      }
      if (ok && ratio !== null && Math.abs(ratio) > 1e-12) { hit = i; c = ratio; }
    }
    if (hit < 0) return null;
    rest = factors.filter((_, i) => i !== hit);
  }
  // Plain numbers left among the factors (the 2 in 2x(x² + 1)³) join the number c, so the u-integral shows one tidy coefficient
  const kept = [];
  for (const fc of rest) {
    if (!variablesOf(fc.node).size) {
      const y = val(fc.node, {});
      if (Number.isFinite(y) && y !== 0) { c *= fc.inv ? 1 / y : y; continue; }
    }
    kept.push(fc);
  }
  const body = tidy(replace(build(kept)));
  if (variablesOf(body).has(v)) return null;
  // Whatever is left may not use x at all; the number c goes in front
  const inU = Math.abs(c - 1) < 1e-12 ? body : tidy(mul(numberNode(c), body));
  return { g, dg, c, inU, bodyU: body };
}

export function solve({ f: tf, u: tu = '', a: ta = '', b: tb = '' }) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no x here: a constant needs no substitution.');
  const v = vars[0];
  const top = unwrap(f);
  if (top.isOperatorNode && (top.fn === 'add' || top.fn === 'subtract')) {
    throw new EngineError('This is a sum. Substitution works on one piece at a time, so split it into separate integrals first and substitute in each.');
  }

  let found = null;
  let chosen = false;
  if (String(tu).trim()) {
    const g = parse(tu, 'u');
    if (!variablesOf(g).has(v)) throw new EngineError(`u must use ${v}, for example u = ${v}^2 + 1.`);
    found = attempt(f, g, v);
    chosen = true;
    if (!found) throw new EngineError(`With u = ${text(g)}, the rest of the integrand cannot be written using only u (it needs ${text(bestForm(differentiate(g, v).result))} as a factor, up to a number). Try another u, or leave the box empty and let NETZ look for one.`);
  } else {
    for (const g of candidatesOf(f, v)) { found = attempt(f, g, v); if (found) break; }
    if (!found) throw new EngineError('NETZ could not find a substitution here: no part of the integrand has its own derivative sitting beside it. Try the integral calculator, which also uses by parts and partial fractions.');
  }

  const { g, dg, c, inU, bodyU } = found;
  const U = 'u';
  const r = integrate(inU, U);
  const Fu = r.result;
  const Fx = tidy(Fu.transform((n) => (n.isSymbolNode && n.name === U ? g : n)));
  const scope = {};
  if (!derivativeMatches(Fx, f, v, scope)) throw new EngineError('NETZ found a substitution but its answer failed the check, so it is not shown. Try another u.');
  const answer = cleanest(Fx, v, (g) => derivativeMatches(g, f, v, scope)) || bestForm(Fx);

  const gTex = tex(polish(g)), dgTex = tex(polish(dg));
  const cTex = c === 1 ? '' : tex(polish(numberNode(c)));
  const steps = [];
  steps.push({
    title: 'Choose u',
    text: chosen
      ? 'You picked u. A good choice is an inside part of the integrand whose derivative also appears beside it.'
      : `Look for an inside part of the integrand whose derivative also appears beside it. Here ${text(g)} works, because its derivative ${text(dg)} is in the integrand (up to a number).`,
    formula: 'u = g(x)',
    lines: [`u = ${gTex}`],
  });
  steps.push({
    title: 'Differentiate u to get du',
    text: `Differentiate u with respect to ${v}, then multiply both sides by d${v}.`,
    formula: `du = g'(${v})\\,d${v}`,
    lines: [`\\frac{du}{d${v}} = ${dgTex}`, `du = ${isConstantIn(dg, v) ? tex(polish(dg)) : `\\left(${dgTex}\\right)`}\\,d${v}`],
  });
  steps.push({
    title: `Rewrite the whole integral using u and du (no ${v} left)`,
    text: `${c === 1 ? 'The piece' : 'A number times the piece'} that matches du is replaced by du, and every ${text(g)} becomes u.`,
    lines: [`\\int ${tex(polish(f))}\\,d${v} = \\int ${cTex ? `${cTex}\\,` : ''}${tex(polish(bodyU))}\\,du`],
  });

  // Definite integral: the limits change with u
  let definite = null;
  if (String(ta).trim() || String(tb).trim()) {
    const A = readLimit(ta, 'The lower limit a'), B = readLimit(tb, 'The upper limit b');
    const at = (L) => val(g, { [v]: L.value });
    const ua = at(A), ub = at(B);
    if (!Number.isFinite(ua) || !Number.isFinite(ub)) throw new EngineError(`u = ${text(g)} is not defined at one of the limits.`);
    const subst = (L) => tidy(g.transform((n) => (n.isSymbolNode && n.name === v ? L.node : n)));
    const uaNode = simplifyExact(subst(A)), ubNode = simplifyExact(subst(B));
    const Fa = tidy(Fu.transform((n) => (n.isSymbolNode && n.name === U ? uaNode : n))), Fb = tidy(Fu.transform((n) => (n.isSymbolNode && n.name === U ? ubNode : n)));
    const valueNode = simplifyExact(tidy(sub(paren(Fb), paren(Fa))));
    const value = val(valueNode, {});
    const dx = (y) => val(f, { [v]: y });
    const numeric = simpson(dx, A.value, B.value);
    if (Number.isFinite(value) && Math.abs(value - numeric) > 1e-5 * Math.max(1, Math.abs(numeric))) {
      throw new EngineError('The substitution crosses a point where u is not smooth between the limits, so the new limits would give a wrong value. Split the integral there, or use the integral calculator.');
    }
    definite = { a: tex(polish(A.node)), b: tex(polish(B.node)), ua: tex(polish(uaNode)), ub: tex(polish(ubNode)), value, valueTex: tex(polish(valueNode)), numeric };
    steps.push({
      title: 'Change the limits to u',
      text: `The limits belong to ${v}, so put them through u = ${text(g)}. Then you never need to turn back to ${v}.`,
      formula: `${v} = a \\Rightarrow u = g(a), \\quad ${v} = b \\Rightarrow u = g(b)`,
      lines: [`${v} = ${definite.a}: \\ u = ${definite.ua}`, `${v} = ${definite.b}: \\ u = ${definite.ub}`],
    });
  }

  steps.push({
    title: 'Integrate with respect to u',
    text: 'This integral is a basic one. Use the table or the usual rules.',
    lines: [
      ...r.steps.map((s) => s.lines?.[s.lines.length - 1]).filter(Boolean),
      ...(definite ? [] : [`\\int ${cTex ? `${cTex}\\,` : ''}${tex(polish(bodyU))}\\,du = ${tex(polish(bestForm(Fu)))} + C`]),
    ].filter((line, i, all) => all.indexOf(line) === i),
  });
  if (definite) {
    steps.push({
      title: 'Evaluate between the new limits',
      text: 'Put the upper u-limit in, then the lower, and subtract.',
      formula: 'F(b) - F(a)',
      lines: [`\\left[${tex(polish(bestForm(Fu)))}\\right]_{${definite.ua}}^{${definite.ub}} = ${definite.valueTex}`],
    });
  } else {
    steps.push({
      title: `Put ${v} back`,
      text: `The answer must be in ${v}, because the question was. Replace every u by ${text(g)}.`,
      lines: [`${tex(polish(bestForm(Fu)))} + C \\ \\xrightarrow{u = ${gTex}} \\ ${tex(polish(answer))} + C`],
    });
    steps.push({
      title: 'Check by differentiating',
      text: 'Differentiating the answer must give back the integrand. It does.',
      formula: `\\frac{d}{d${v}}F(${v}) = f(${v})`,
      lines: [`\\frac{d}{d${v}}\\left[${tex(polish(answer))}\\right] = ${tex(polish(f))} \\;\\checkmark`],
    });
  }

  return {
    variable: v, f: tex(polish(f)), u: gTex, du: dgTex, uText: text(g), integrandInU: `${cTex ? `${cTex}\\,` : ''}${tex(polish(bodyU))}`,
    answer: tex(polish(answer)), answerText: text(polish(answer)), definite, chosen,
    verified: true, notes: [], steps,
    result: definite ? (Number.isFinite(definite.value) ? definite.value : definite.numeric) : `${text(polish(answer))} + C`, plot: null,
  };
}
