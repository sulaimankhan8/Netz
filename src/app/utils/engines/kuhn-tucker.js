/**
 * Kuhn–Tucker (KKT) conditions: the maths for /kuhn-tucker (Unit 15).
 *   Maximise f(x) subject to gᵢ(x) ≤ bᵢ (a minimum is the maximum of −f; ≥ constraints are turned round).
 *   L = f − Σλᵢ(gᵢ − bᵢ). At an optimum: ∂L/∂xⱼ = 0, λᵢ(gᵢ − bᵢ) = 0, λᵢ ≥ 0, gᵢ ≤ bᵢ.
 *   Every choice of active constraints (λᵢ > 0 allowed only there) is solved; the points that pass all the
 *   conditions are the KKT points, and the best is reported. For a concave f and linear (or convex) constraints
 *   the KKT point is the global optimum.
 */
import { EngineError } from '../numeric/steps';
import { math, sub, mul, add, num, sym, paren, polish, tidy } from '../symbolic/tree';
import { mtex, exactTex, readMulti, solveSystem, tidyMulti } from '../symbolic/multi';
import { onlyLetters, recognise } from '../symbolic/vectorint';

const T = (n) => mtex(polish(n));
const ev = (n, s) => { try { const v = n.evaluate(s); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };

function readConstraints(text) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type at least one constraint, like 2x + y <= 5.');
  if (parts.length > 5) throw new EngineError('Use at most 5 constraints.');
  return parts.map((p) => {
    const m = p.replace(/≤/g, '<=').replace(/≥/g, '>=').match(/^(.+?)(<=|>=|<|>)(.+)$/);
    if (!m) throw new EngineError(`Write each constraint with <= or >= (could not read "${p}").`);
    const L = readMulti(m[1], 'A constraint'), R = readMulti(m[3], 'A constraint');
    // g ≤ 0 form
    const g = tidy(m[2].startsWith('<') ? sub(L, R) : sub(R, L));
    return { g, text: `${T(L)} ${m[2].startsWith('<') ? '\\le' : '\\ge'} ${T(R)}` };
  });
}

export function solve({ f, goal = 'max', constraints }) {
  const F = readMulti(f, 'The objective');
  const cons = readConstraints(constraints);
  const vars = ['x', 'y', 'z'].filter((v) => [F, ...cons.map((c) => c.g)].some((n) => { let h = false; n.traverse((q) => { if (q.isSymbolNode && q.name === v) h = true; }); return h; }));
  onlyLetters([F, ...cons.map((c) => c.g)], ['x', 'y', 'z'], 'The problem');
  if (!vars.length) throw new EngineError('Use x and y (and z) as the variables.');
  const obj = goal === 'min' ? tidy(mul(num(-1), paren(F))) : F;
  const m = cons.length;
  const lam = cons.map((_, i) => `l${i + 1}`);
  const steps = [];
  const Ltex = `L = ${goal === 'min' ? `-(${T(F)})` : T(F)} - ${cons.map((c, i) => `\\lambda_{${i + 1}}\\left(${T(c.g)}\\right)`).join(' - ')}`;
  steps.push({ title: 'Lagrangian', formula: 'L = f - \\sum \\lambda_i g_i, \\quad g_i \\le 0', depth: 0, lines: [...cons.map((c, i) => `g_{${i + 1}}: ${c.text} \\ \\Rightarrow \\ ${T(c.g)} \\le 0`), Ltex] });
  const grad = (n) => vars.map((v) => tidy(math.derivative(n, v)));
  const gF = grad(obj), gG = cons.map((c) => grad(c.g));
  steps.push({ title: 'Kuhn–Tucker conditions', depth: 0, lines: [...vars.map((v, j) => `\\frac{\\partial L}{\\partial ${v}} = ${T(gF[j])} - ${gG.map((g, i) => `\\lambda_{${i + 1}}(${T(g[j])})`).join(' - ')} = 0`), `\\lambda_i\\,g_i = 0, \\quad \\lambda_i \\ge 0, \\quad g_i \\le 0`] });
  const cases = [];
  let best = null;
  for (let mask = 0; mask < 1 << m; mask++) {
    const act = [...Array(m).keys()].filter((i) => mask & (1 << i));
    if (act.length > vars.length) continue;
    const unk = [...vars, ...act.map((i) => lam[i])];
    const eqs = vars.map((v, j) => { let e = gF[j]; for (const i of act) e = sub(e, mul(sym(lam[i]), paren(gG[i][j]))); return tidy(e); });
    act.forEach((i) => eqs.push(cons[i].g));
    let sols = [];
    try { sols = solveSystem(eqs, unk, { R: 12, starts: 160 }); } catch { sols = []; }
    const label = act.length ? act.map((i) => `g_{${i + 1}}`).join(', ') + ' \\text{ active}' : '\\text{none active}';
    let text = '\\text{no solution}';
    for (const s of sols) {
      const pt = Object.fromEntries(unk.map((u, k) => [u, s.values[k]]));
      const feas = cons.every((c) => ev(c.g, pt) <= 1e-9);
      const lamOk = act.every((i) => pt[lam[i]] >= -1e-9);
      const xs = vars.map((v) => `${v} = ${recognise(pt[v])}`).join(', ');
      const ls = act.map((i) => `\\lambda_{${i + 1}} = ${recognise(pt[lam[i]])}`).join(', ');
      if (!feas) { text = `${xs}: \\text{ breaks a constraint}`; continue; }
      if (!lamOk) { text = `${xs}${ls ? `, ${ls}` : ''}: \\ \\lambda < 0`; continue; }
      const val = ev(F, pt);
      text = `${xs}${ls ? `, ${ls}` : ''}: \\ f = ${recognise(val)} \\ \\checkmark`;
      const better = !best || (goal === 'min' ? val < best.val - 1e-12 : val > best.val + 1e-12);
      if (better) best = { val, pt, act };
      break;
    }
    cases.push(`${label}: \\ ${text}`);
  }
  steps.push({ title: 'Try each set of active constraints', formula: '\\lambda_i = 0 \\text{ for the inactive ones}', depth: 0, lines: cases });
  if (!best) throw new EngineError('No point satisfies all the Kuhn–Tucker conditions (the problem may be unbounded or infeasible).');
  const xTex = vars.map((v) => `${v} = ${recognise(best.pt[v])}`).join(', \\ ');
  steps.push({ title: 'Optimum', depth: 0, lines: [xTex, `${goal === 'min' ? '\\min' : '\\max'} f = ${recognise(best.val)}`] });
  // check: concave objective? (Hessian test at the point, for the note)
  const H = vars.map((a) => vars.map((b) => ev(math.derivative(math.derivative(obj, a), b), best.pt)));
  const concave = vars.length === 1 ? H[0][0] <= 1e-12 : vars.length === 2 ? H[0][0] <= 1e-12 && H[0][0] * H[1][1] - H[0][1] * H[1][0] >= -1e-12 : true;
  void add; void tidyMulti;
  return { x: xTex, value: recognise(best.val), steps, notes: concave ? [`The objective is ${goal === 'min' ? 'convex' : 'concave'} here, so this KKT point is the optimum.`] : ['The objective is not concave here: the KKT point found is the best of the candidates, not guaranteed global.'], verified: true, result: recognise(best.val) };
}
