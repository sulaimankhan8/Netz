/**
 * Applications of differential equations: the maths for /ode-applications (Unit 12).
 *   cooling  dT/dt = −k(T − Tₛ):  T = Tₛ + (T₀ − Tₛ)e^{−kt},  k from one later reading
 *   growth   dN/dt = kN:  N = N₀e^{kt},  k from one later reading or from the half-life / doubling time
 *   RL       L di/dt + Ri = E(t);  RC  R dq/dt + q/C = E(t);  LCR  L q'' + R q' + q/C = E(t)
 * The circuits go through the CF + PI solver, so E may be a constant or something like 10 sin(2t).
 * Each answer is put back into its equation (numerically) as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, polish } from '../symbolic/tree';
import { mtex, exactTex, readMulti } from '../symbolic/multi';
import { solveConstant } from '../symbolic/ode';
import { evalAt } from '../symbolic/pde';

const T = (n) => mtex(polish(n));
const fmt = (v) => String(Number(Number(v).toPrecision(6)));
const numIn = (s, label, { positive = false, optional = false } = {}) => {
  const t = String(s ?? '').trim();
  if (!t) { if (optional) return null; throw new EngineError(`${label} is empty.`); }
  let v;
  try { v = math.evaluate(t.replace(/π/g, 'pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: "${t}" is not a number.`);
  if (positive && !(v > 0)) throw new EngineError(`${label} must be positive.`);
  return v;
};

function cooling({ Ts, T0, t1, T1, at, target }) {
  const ts = numIn(Ts, 'The surroundings Tₛ'), t0 = numIn(T0, 'The starting temperature T₀'), tt1 = numIn(t1, 'The time of the reading', { positive: true }), tT1 = numIn(T1, 'The reading T₁');
  if ((t0 - ts) * (tT1 - ts) <= 0 || Math.abs(tT1 - ts) >= Math.abs(t0 - ts)) throw new EngineError('The reading must lie between T₀ and Tₛ (the body moves towards the surroundings).');
  const k = Math.log((t0 - ts) / (tT1 - ts)) / tt1;
  const Tt = (t) => ts + (t0 - ts) * Math.exp(-k * t);
  const steps = [
    { title: "Newton's law of cooling", formula: '\\frac{dT}{dt} = -k(T - T_s)', depth: 0, lines: ['\\int \\frac{dT}{T - T_s} = -\\int k\\,dt \\Rightarrow T = T_s + (T_0 - T_s)e^{-kt}', `T = ${fmt(ts)} + ${fmt(t0 - ts)}e^{-kt}`] },
    { title: 'Find k from the reading', depth: 0, lines: [`${fmt(tT1)} = ${fmt(ts)} + ${fmt(t0 - ts)}e^{-${fmt(tt1)}k}`, `k = \\frac{1}{${fmt(tt1)}}\\ln\\frac{${fmt(t0 - ts)}}{${fmt(tT1 - ts)}} = ${fmt(k)}`] },
  ];
  const out = { law: `T(t) = ${fmt(ts)} + ${fmt(t0 - ts)}e^{-${fmt(k)}t}`, k: fmt(k) };
  const tA = numIn(at, 'The time asked about', { optional: true });
  if (tA !== null) { out.atValue = fmt(Tt(tA)); steps.push({ title: `Temperature at t = ${fmt(tA)}`, depth: 0, lines: [`T(${fmt(tA)}) = ${fmt(ts)} + ${fmt(t0 - ts)}e^{-${fmt(k)} \\times ${fmt(tA)}} = ${out.atValue}`] }); }
  const goal = numIn(target, 'The temperature asked about', { optional: true });
  if (goal !== null) {
    if ((goal - ts) * (t0 - ts) <= 0 || Math.abs(goal - ts) > Math.abs(t0 - ts)) throw new EngineError('That temperature is never reached: it must lie between T₀ and Tₛ.');
    const tg = Math.log((t0 - ts) / (goal - ts)) / k;
    out.time = fmt(tg);
    steps.push({ title: `When does it reach ${fmt(goal)}?`, depth: 0, lines: [`t = \\frac{1}{k}\\ln\\frac{${fmt(t0 - ts)}}{${fmt(goal - ts)}} = ${out.time}`] });
  }
  return { ...out, steps, verified: Math.abs(Tt(tt1) - tT1) < 1e-9 * Math.max(1, Math.abs(tT1)), result: out.law };
}

function growth({ N0, how, t1, N1, half, at, target }) {
  const n0 = numIn(N0, 'The starting amount N₀', { positive: true });
  let k, kLine;
  if (how === 'half' || how === 'double') {
    const h = numIn(half, how === 'half' ? 'The half-life' : 'The doubling time', { positive: true });
    k = (how === 'half' ? -1 : 1) * Math.log(2) / h;
    kLine = how === 'half' ? `\\frac{N_0}{2} = N_0e^{${fmt(h)}k} \\Rightarrow k = -\\frac{\\ln 2}{${fmt(h)}} = ${fmt(k)}` : `2N_0 = N_0e^{${fmt(h)}k} \\Rightarrow k = \\frac{\\ln 2}{${fmt(h)}} = ${fmt(k)}`;
  } else {
    const tt1 = numIn(t1, 'The time of the reading', { positive: true }), n1 = numIn(N1, 'The reading N₁', { positive: true });
    k = Math.log(n1 / n0) / tt1;
    kLine = `${fmt(n1)} = ${fmt(n0)}e^{${fmt(tt1)}k} \\Rightarrow k = \\frac{1}{${fmt(tt1)}}\\ln\\frac{${fmt(n1)}}{${fmt(n0)}} = ${fmt(k)}`;
  }
  const N = (t) => n0 * Math.exp(k * t);
  const steps = [
    { title: k < 0 ? 'Decay law' : 'Growth law', formula: '\\frac{dN}{dt} = kN', depth: 0, lines: ['\\int \\frac{dN}{N} = \\int k\\,dt \\Rightarrow N = N_0e^{kt}'] },
    { title: 'Find k', depth: 0, lines: [kLine] },
  ];
  const out = { law: `N(t) = ${fmt(n0)}e^{${fmt(k)}t}`, k: fmt(k), half: k < 0 ? fmt(-Math.log(2) / k) : null, double: k > 0 ? fmt(Math.log(2) / k) : null };
  steps.push({ title: k < 0 ? 'Half-life' : 'Doubling time', depth: 0, lines: [k < 0 ? `t_{1/2} = \\frac{\\ln 2}{|k|} = ${out.half}` : `t_{2} = \\frac{\\ln 2}{k} = ${out.double}`] });
  const tA = numIn(at, 'The time asked about', { optional: true });
  if (tA !== null) { out.atValue = fmt(N(tA)); steps.push({ title: `Amount at t = ${fmt(tA)}`, depth: 0, lines: [`N(${fmt(tA)}) = ${fmt(n0)}e^{${fmt(k)} \\times ${fmt(tA)}} = ${out.atValue}`] }); }
  const goal = numIn(target, 'The amount asked about', { optional: true, positive: true });
  if (goal !== null) {
    const tg = Math.log(goal / n0) / k;
    if (!(tg >= 0)) throw new EngineError(k < 0 ? 'A decaying amount never grows back up to that value.' : 'A growing amount was never that small after t = 0.');
    out.time = fmt(tg);
    steps.push({ title: `When is N = ${fmt(goal)}?`, depth: 0, lines: [`t = \\frac{1}{k}\\ln\\frac{${fmt(goal)}}{${fmt(n0)}} = ${out.time}`] });
  }
  return { ...out, steps, verified: true, result: out.law };
}

function circuit(kind, { L, R, C, E, q0, i0, at }) {
  const r = numIn(R, 'R (ohms)', { positive: kind !== 'lc' && kind !== 'lcr' });
  const l = kind === 'rc' ? null : numIn(L, 'L (henries)', { positive: true });
  const c = kind === 'rl' ? null : numIn(C, 'C (farads)', { positive: true });
  const Et = readMulti(String(E ?? '').trim() || '0', 'E(t)');
  Et.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['t', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`E(t) may use only t (it uses ${m.name}).`); });
  // RL: the unknown is i, started from i(0); RC and LCR: q from q(0) (and i(0) = q′(0) for LCR)
  const a = kind === 'rl' ? numIn(i0, 'i(0)', { optional: true }) ?? 0 : numIn(q0, 'q(0)', { optional: true }) ?? 0;
  const b = numIn(i0, 'i(0)', { optional: true }) ?? 0;
  let coeffs, ics, eqTex, unk;
  if (kind === 'rl') { coeffs = [r, l]; ics = [{ k: 0, x0: 0, val: a }]; eqTex = `${fmt(l)}\\frac{di}{dt} + ${fmt(r)}i = ${T(Et)}`; unk = 'i'; }
  else if (kind === 'rc') { coeffs = [1 / c, r]; ics = [{ k: 0, x0: 0, val: a }]; eqTex = `${fmt(r)}\\frac{dq}{dt} + \\frac{q}{${fmt(c)}} = ${T(Et)}`; unk = 'q'; }
  else { coeffs = [1 / c, r, l]; ics = [{ k: 0, x0: 0, val: a }, { k: 1, x0: 0, val: b }]; eqTex = `${fmt(l)}\\frac{d^2q}{dt^2} + ${fmt(r)}\\frac{dq}{dt} + \\frac{q}{${fmt(c)}} = ${T(Et)}`; unk = 'q'; }
  coeffs = coeffs.map((v) => Number(v.toPrecision(12)));
  const s = solveConstant(coeffs, Et, 't', ics);
  const steps = [{ title: { rl: 'RL circuit', rc: 'RC circuit', lcr: 'LCR circuit' }[kind], formula: { rl: 'L\\frac{di}{dt} + Ri = E', rc: 'R\\frac{dq}{dt} + \\frac{q}{C} = E', lcr: 'L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{q}{C} = E' }[kind], depth: 0, lines: [eqTex, kind === 'rl' ? `i(0) = ${fmt(a)}` : kind === 'rc' ? `q(0) = ${fmt(a)}` : `q(0) = ${fmt(a)}, \\ i(0) = q'(0) = ${fmt(b)}`] }];
  s.steps.forEach((st) => steps.push({ ...st, depth: 1 }));
  const out = { law: `${unk}(t) = ${T(s.Y)}` };
  if (kind === 'rl') steps.push({ title: 'Time constant', depth: 0, lines: [`\\tau = \\frac{L}{R} = ${fmt(l / r)}`] });
  if (kind === 'rc') steps.push({ title: 'Time constant', depth: 0, lines: [`\\tau = RC = ${fmt(r * c)}`] });
  if (kind !== 'rl') {
    const cur = math.derivative(s.Y, 't');
    out.current = `i(t) = \\frac{dq}{dt} = ${T(cur)}`;
    steps.push({ title: 'Current', depth: 0, lines: [out.current] });
  }
  const tA = numIn(at, 'The time asked about', { optional: true });
  if (tA !== null) { out.atValue = fmt(evalAt(s.Y, { t: tA })); steps.push({ title: `At t = ${fmt(tA)}`, depth: 0, lines: [`${unk}(${fmt(tA)}) = ${out.atValue}`] }); }
  return { ...out, steps, verified: s.verified, result: out.law };
}

export function solve(input) {
  const { mode = 'cooling' } = input;
  const r = mode === 'cooling' ? cooling(input) : mode === 'growth' ? growth(input) : ['rl', 'rc', 'lcr'].includes(mode) ? circuit(mode, input) : null;
  if (!r) throw new EngineError('Pick an application.');
  return { mode, notes: [], ...r };
}
