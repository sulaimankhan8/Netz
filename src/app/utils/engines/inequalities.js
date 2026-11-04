/**
 * Solving inequalities in one variable: linear, polynomial and fractions of polynomials.
 *   linear:     solve like an equation; dividing by a negative number reverses the sign
 *   otherwise:  move everything to one side, h(x) ? 0; factor; critical points (zeros of the top, zeros
 *               of the bottom); a sign chart with one test value per interval; keep the intervals whose
 *               sign fits. ≤ and ≥ include the zeros of h, never the zeros of the bottom.
 * The answer is in interval notation, with a number-line description for the page.
 */
import { EngineError } from '../numeric/steps';
import { parse, variablesOf, sub, paren, tex, polish } from '../symbolic/tree';
import { rationalParts } from '../symbolic/poly';
import { polyRoots } from '../symbolic/roots';
import { factorPolynomial, polyTex, fracTex } from '../symbolic/algebra';

const OPS = { '<=': '\\le', '>=': '\\ge', '<': '<', '>': '>' };
const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };

export function solve({ ineq }) {
  const s = String(ineq ?? '').trim().replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/=</g, '<=').replace(/=>/g, '>=');
  const m = s.match(/^(.*?)(<=|>=|<|>)(.*)$/);
  if (!m || /<|>/.test(m[3])) throw new EngineError('Write one inequality with one sign: <, >, <= (≤) or >= (≥). For example x^2 - 5x + 6 <= 0.');
  const [, ls, op, rs] = m;
  const L = parse(ls, 'The left side'), R = parse(rs, 'The right side');
  const vars = [...new Set([...variablesOf(L), ...variablesOf(R)])];
  if (vars.length !== 1) throw new EngineError(vars.length ? `Use one variable only (this uses ${vars.join(', ')}).` : 'There is no variable (like x) in this inequality.');
  const v = vars[0];
  const h = sub(paren(L), paren(R));
  const r = rationalParts(h, v);
  if (!r) throw new EngineError('NETZ solves inequalities with polynomials and fractions of polynomials.');
  const P = r.P, Q = r.Q;
  const strict = op === '<' || op === '>';
  const wantPositive = op === '>' || op === '>=';
  const opTex = OPS[op];
  const Lt = tex(polish(L)).trim(), Rt = tex(polish(R)).trim();
  const steps = [];

  const degP = P.length - 1, degQ = Q.length - 1;
  let pieces, chart = null;
  if (degQ === 0 && degP <= 1) {
    // Linear (or no x at all)
    const a = (P[1] || 0) / Q[0], b = -(P[0] || 0) / Q[0];
    steps.push({ title: `Move the ${v}-terms to one side and the numbers to the other`, lines: [`${polyTex([0, a], v)} ${opTex} ${fracTex(b)}`] });
    if (Math.abs(a) < 1e-12) {
      const holds = strict ? (wantPositive ? 0 > b : 0 < b) : (wantPositive ? 0 >= b : 0 <= b);
      pieces = holds ? [{ lo: -Infinity, hi: Infinity }] : [];
      steps.push({ title: holds ? 'Always true' : 'Never true', lines: [`0 ${opTex} ${fracTex(b)} \\text{ is ${holds ? 'always' : 'never'} true}`] });
    } else {
      const x = b / a;
      const newOp = a < 0 ? flip[op] : op;
      steps.push({
        title: `Divide both sides by ${fracTex(a)}${a < 0 ? ' (negative: reverse the sign)' : ''}`,
        formula: a < 0 ? '\\text{dividing by a negative number reverses } < \\text{ and } >' : null,
        lines: [`${v} ${OPS[newOp]} ${fracTex(x)}`],
      });
      const up = newOp === '>' || newOp === '>=', closed = newOp.length === 2;
      pieces = [up ? { lo: x, hi: Infinity, loClosed: closed, loTex: fracTex(x) } : { lo: -Infinity, hi: x, hiClosed: closed, hiTex: fracTex(x) }];
    }
  } else {
    // Sign chart
    const topF = factorPolynomial(P, v), botF = degQ ? factorPolynomial(Q, v) : null;
    const hTex = botF ? `\\frac{${topF.tex}}{${botF.tex}}` : topF.tex;
    steps.push({ title: 'Move everything to one side and factor', lines: [`${Lt} ${opTex} ${Rt}`, `${botF ? `\\frac{${polyTex(P, v)}}{${polyTex(Q, v)}}` : polyTex(P, v)} ${opTex} 0`, `${hTex} ${opTex} 0`] });
    const zeros = polyRoots(P), poles = degQ ? polyRoots(Q) : [];
    const cuts = [...zeros.map((z) => ({ ...z, pole: poles.some((p) => Math.abs(p.x - z.x) < 1e-9) })), ...poles.filter((p) => !zeros.some((z) => Math.abs(z.x - p.x) < 1e-9)).map((p) => ({ ...p, pole: true }))].sort((a, b) => a.x - b.x);
    steps.push({
      title: 'Critical points',
      lines: [
        zeros.length ? `\\text{Top} = 0: \\ ${v} = ${zeros.map((z) => z.tex).join(', \\ ')}` : '\\text{The top is never } 0',
        ...(poles.length ? [`\\text{Bottom} = 0: \\ ${v} = ${poles.map((z) => z.tex).join(', \\ ')} \\ \\text{(never included)}`] : []),
      ],
    });
    const ends = [{ x: -Infinity }, ...cuts, { x: Infinity }];
    const segs = [];
    for (let i = 0; i + 1 < ends.length; i++) {
      const [lo, hi] = [ends[i].x, ends[i + 1].x];
      let t = lo === -Infinity && hi === Infinity ? 0 : lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
      const w = Math.round(t); if (w > lo && w < hi) t = w;
      const sign = Math.sign(valueAt(h, v, t));
      segs.push({ lo, hi, loTex: ends[i].tex, hiTex: ends[i + 1].tex, t, sign, ok: wantPositive ? sign > 0 : sign < 0 });
    }
    steps.push({
      title: 'Sign chart: test one value in each interval',
      lines: segs.map((g) => `${v} = ${fracTex(g.t)}: \\ h ${g.sign > 0 ? '> 0' : '< 0'} \\ ${g.ok ? '\\checkmark' : '\\times'}`),
    });
    // Walk segment, point, segment, …: keep segments with the right sign, and zeros when ≤ / ≥
    const items = [];
    segs.forEach((g, i) => {
      items.push({ kind: 'seg', ...g });
      if (i < cuts.length) items.push({ kind: 'pt', x: cuts[i].x, tex: cuts[i].tex, ok: !strict && !cuts[i].pole });
    });
    pieces = [];
    let run = null;
    for (const it of items) {
      if (it.ok) {
        if (!run) run = it.kind === 'seg' ? { lo: it.lo, loTex: it.loTex, loClosed: false } : { lo: it.x, loTex: it.tex, loClosed: true };
        run.hi = it.kind === 'seg' ? it.hi : it.x; run.hiTex = it.kind === 'seg' ? it.hiTex : it.tex; run.hiClosed = it.kind === 'pt';
      } else if (run) { pieces.push(run); run = null; }
    }
    if (run) pieces.push(run);
    chart = { cuts: cuts.map((c) => ({ x: c.x, tex: c.tex, filled: !strict && !c.pole })), segs: segs.map((g) => ({ lo: g.lo, hi: g.hi, sign: g.sign, ok: g.ok })) };
  }

  const answer = intervalsTex(pieces);
  steps.push({ title: 'Answer', lines: [`${v} \\in ${answer}`] });

  // Check a few values inside and outside the answer against the original inequality
  const holds = (x) => { const a = valueAt(L, v, x), b = valueAt(R, v, x); if (!Number.isFinite(a) || !Number.isFinite(b)) return null; return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b + 1e-12 : a >= b - 1e-12; };
  const inside = (x) => pieces.some((p) => (x > p.lo || (p.loClosed && Math.abs(x - p.lo) < 1e-12)) && (x < p.hi || (p.hiClosed && Math.abs(x - p.hi) < 1e-12)));
  let verified = true;
  for (let x = -12.37; x < 12.5; x += 0.731) { const want = holds(x); if (want !== null && want !== inside(x)) verified = false; }

  return {
    variable: v, ineq: `${Lt} ${opTex} ${Rt}`, op, answer, pieces, chart,
    steps, verified, result: answer, notes: [], plot: null,
  };
}

/** Interval notation: (−∞, 2] ∪ (3, ∞), {1}, ℝ or ∅. */
export function intervalsTex(pieces) {
  if (!pieces.length) return '\\varnothing';
  return pieces.map((p) => {
    if (p.lo === -Infinity && p.hi === Infinity) return '\\mathbb{R}';
    if (p.lo === p.hi) return `\\left\\{${p.loTex}\\right\\}`;
    const lo = p.lo === -Infinity ? '\\left(-\\infty' : `\\left${p.loClosed ? '[' : '('}${p.loTex}`;
    const hi = p.hi === Infinity ? '\\infty\\right)' : `${p.hiTex}\\right${p.hiClosed ? ']' : ')'}`;
    return `${lo},\\ ${hi}`;
  }).join(' \\cup ');
}
