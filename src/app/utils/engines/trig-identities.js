/**
 * Trigonometric identities: the maths for /trigonometric-identities (catalog 9F).
 *   1. Check the identity numerically at many points (true or false, with a counter-example).
 *   2. If true, look for a step path: write both sides in sin and cos, expand double/compound angles,
 *      and turn each side into one fraction in sin u, cos u, using sin² = 1 − cos². When the two fractions
 *      agree, those are the steps. Otherwise it says "true, checked at random points" and invents no steps.
 */
import { EngineError } from '../numeric/steps';
import { parse, tex, polish, tidy } from '../symbolic/tree';
import { evalAt } from '../symbolic/multi';
import { toSinCos, expandAngles, trigCalls, toRationalSC, sameRational, rationalSCTex } from '../symbolic/trig';

const POINTS = [0.37, 0.91, 1.23, 2.05, 2.71, 3.62, 4.4, 5.13, -0.58, -1.37, 0.12, 1.49];
const t = (n) => tex(polish(tidy(n)));
const same = (p, q) => p.toString() === q.toString();
const readSide = (s, label) => parse(String(s).replace(/θ/g, 'x').replace(/(sin|cos|tan|sec|csc|cot)\s*\^\s*(\d)\s*\(([^()]*)\)/g, '$1($3)^$2').replace(/(sin|cos|tan|sec|csc|cot)\s*\^\s*(\d)\s*([a-z])\b/g, '$1($3)^$2').replace(/(sin|cos|tan|sec|csc|cot)\s+([a-z])\b/g, '$1($2)'), label);

export function solve({ identity }) {
  const text = String(identity ?? '').trim();
  const parts = text.split('=');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) throw new EngineError('Write the identity with one = sign, e.g. (1 - cos(2x))/sin(2x) = tan(x).');
  const L = readSide(parts[0], 'The left side');
  const R = readSide(parts[1], 'The right side');
  // 1. Is it true?
  let compared = 0, counter = null;
  for (const x of POINTS) {
    const a = evalAt(L, { x }), b = evalAt(R, { x });
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) > 1e6 || Math.abs(b) > 1e6) continue;
    compared++;
    if (Math.abs(a - b) > 1e-8 * Math.max(1, Math.abs(a))) { counter = { x, a, b }; break; }
  }
  if (compared < 4 && !counter) throw new EngineError('Could not evaluate both sides. Use x as the angle, e.g. sin(x)^2 + cos(x)^2 = 1.');
  const head = { title: 'The identity', depth: 0, lines: [`${t(L)} \\overset{?}{=} ${t(R)}`] };
  if (counter) {
    return {
      holds: false, proved: false, steps: [head, { title: 'Not an identity', depth: 0, lines: [`x = ${Number(counter.x.toFixed(2))}: \\quad \\text{left} = ${Number(counter.a.toFixed(6))}, \\quad \\text{right} = ${Number(counter.b.toFixed(6))}`] }],
      notes: ['The two sides differ at this angle, so the statement is not true for all x.'], verified: true, result: 'false',
    };
  }
  // 2. A step path: both sides as one fraction in sin u and cos u (s² + c² = 1 used to cut powers of sin)
  const prep = (n) => { const out = []; let cur = n; const sc = toSinCos(cur); if (!same(sc, cur)) { cur = sc; out.push({ why: 'Write in sin and cos', node: cur }); } let ex = expandAngles(cur); for (let k = 0; ex.changed && k < 3; k++) { cur = ex.node; if (k === 0) out.push({ why: 'Expand the double / compound angles', node: cur }); ex = expandAngles(toSinCos(cur)); } return { node: cur, steps: out }; };
  const l = prep(L), r = prep(R);
  const args = [...new Set([...trigCalls(l.node), ...trigCalls(r.node)].map((c) => c.arg))];
  const u = args.length === 1 ? args[0] : null;
  const uTex = u ? (u.length === 1 ? u : `(${tex(parse(u))})`) : '';
  const lr = u ? toRationalSC(l.node, u) : null, rr = u ? toRationalSC(r.node, u) : null;
  const proved = !!(lr && rr && sameRational(lr, rr));
  const steps = [head];
  const sideLines = (name, n, p, rat) => [`\\text{${name}} = ${t(n)}`, ...p.steps.map((s) => `= ${t(s.node)} \\quad \\text{(${s.why})}`), ...(rat ? [`= ${rationalSCTex(rat, uTex)} \\quad \\text{(one fraction; } \\sin^2 + \\cos^2 = 1)`] : [])];
  if (proved) {
    steps.push({ title: 'Left side', depth: 0, lines: sideLines('LHS', L, l, lr) });
    steps.push({ title: 'Right side', depth: 0, lines: sideLines('RHS', R, r, rr) });
    const a = rationalSCTex(lr, uTex), b = rationalSCTex(rr, uTex);
    steps.push(a === b
      ? { title: 'Both sides agree', depth: 0, lines: [`\\text{LHS} = ${a} = \\text{RHS} \\ \\checkmark`] }
      : { title: 'Cross-multiply', depth: 0, lines: [`(${rationalSCTex({ N: lr.N, D: new Map([['0,0', 1]]) }, uTex)})(${rationalSCTex({ N: rr.D, D: new Map([['0,0', 1]]) }, uTex)}) - (${rationalSCTex({ N: rr.N, D: new Map([['0,0', 1]]) }, uTex)})(${rationalSCTex({ N: lr.D, D: new Map([['0,0', 1]]) }, uTex)}) = 0`, '\\text{after writing } \\sin^2 = 1 - \\cos^2, \\text{ so LHS = RHS } \\checkmark'] });
  } else {
    steps.push({ title: 'True, checked at random points', depth: 0, lines: [`\\text{Both sides agree at ${compared} angles, so the identity holds.}`, '\\text{No step-by-step path was found here, so none is shown.}'] });
  }
  return {
    holds: true, proved, steps, verified: true, result: 'true',
    notes: [proved ? 'Proved by rewriting both sides in sin and cos and simplifying.' : 'The identity is true (checked numerically), but these rewriting rules could not reach the same form on both sides.'],
  };
}
