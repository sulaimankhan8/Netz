/**
 * Asymptotes of y = f(x): the maths for /asymptotes-calculator (catalog 6A).
 *   vertical:   x = a where f → ±∞ (zeros of the denominator that are not cancelled)
 *   horizontal: y = L with L = lim_{x→±∞} f(x)
 *   oblique:    y = mx + c with m = lim f(x)/x (finite, ≠ 0) and c = lim (f(x) − mx)
 */
import { EngineError } from '../numeric/steps';
import { math, sym, sub, div, mul, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex } from '../symbolic/multi';
import { numNode } from '../symbolic/ode';
import { zerosOf } from '../symbolic/roots';
import { limit } from '../symbolic/limit';

export function solve({ f }) {
  const node = parse(f, 'f(x)');
  if ([...variablesOf(node)].some((w) => w !== 'x')) throw new EngineError('Write f in x only.');
  const steps = [];
  const fx = (x) => { try { const y = node.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  // Vertical
  const cand = zerosOf(div(math.parse('1'), node), 'x', { lo: -30, hi: 30 }).zeros.map((p) => p.x)
    .concat(zerosOf(node, 'x', { lo: -30, hi: 30 }).undefinedAt.map((p) => p.x));
  const vert = [];
  for (const a of [...new Set(cand.map((v) => Math.round(v * 1e9) / 1e9))].sort((p, q) => p - q)) {
    let L, R;
    try { L = limit(node, 'x', a, 'left').value; R = limit(node, 'x', a, 'right').value; } catch { continue; }
    if (!Number.isFinite(L) || !Number.isFinite(R)) vert.push({ a, L, R });
  }
  steps.push({ title: 'Vertical asymptotes', formula: 'f(x) \\to \\pm\\infty \\text{ as } x \\to a', depth: 0, lines: vert.length ? vert.map((v) => `x = ${exactTex(v.a)}: \\ \\lim_{x\\to ${exactTex(v.a)}^-} f = ${Number.isFinite(v.L) ? exactTex(v.L) : v.L > 0 ? '\\infty' : '-\\infty'}, \\ \\lim_{x\\to ${exactTex(v.a)}^+} f = ${Number.isFinite(v.R) ? exactTex(v.R) : v.R > 0 ? '\\infty' : '-\\infty'}`) : ['\\text{none}'] });
  // Horizontal and oblique, at each end
  const ends = [];
  for (const side of [Infinity, -Infinity]) {
    const name = side > 0 ? '+\\infty' : '-\\infty';
    let L;
    try { L = limit(node, 'x', side); } catch { L = { value: NaN }; }
    if (Number.isFinite(L.value)) { ends.push({ side, kind: 'horizontal', m: 0, c: L.value, tex: `y = ${L.exactTex ?? exactTex(L.value)}`, how: `\\lim_{x\\to ${name}} f(x) = ${L.exactTex ?? exactTex(L.value)}` }); continue; }
    let m, c;
    try { m = limit(div(node, sym('x')), 'x', side); } catch { m = { value: NaN }; }
    if (Number.isFinite(m.value) && Math.abs(m.value) > 1e-12) {
      try { c = limit(sub(node, mul(numNode(m.value), sym('x'))), 'x', side); } catch { c = { value: NaN }; }
      if (Number.isFinite(c.value)) {
        const mT = m.exactTex ?? exactTex(m.value), cT = c.exactTex ?? exactTex(c.value);
        ends.push({ side, kind: 'oblique', m: m.value, c: c.value, tex: `y = ${mT === '1' ? '' : mT === '-1' ? '-' : mT}x${c.value === 0 ? '' : c.value > 0 ? ` + ${cT}` : ` - ${cT.replace(/^-/, '')}`}`, how: `m = \\lim_{x\\to ${name}} \\frac{f(x)}{x} = ${mT}, \\quad c = \\lim_{x\\to ${name}} (f(x) - ${mT}x) = ${cT}` });
      }
    }
  }
  steps.push({ title: 'Horizontal and oblique asymptotes', formula: 'y = \\lim_{x\\to\\pm\\infty} f, \\ \\text{or } y = mx + c', depth: 0, lines: ends.length ? ends.map((e) => `${e.how} \\Rightarrow ${e.tex} \\ (\\text{${e.kind}, as } x \\to ${e.side > 0 ? '+' : '-'}\\infty)`) : ['\\text{none}'] });
  const uniq = [];
  ends.forEach((e) => { if (!uniq.some((u) => u.tex === e.tex)) uniq.push(e); });
  const xs = vert.map((v) => v.a);
  const x0 = Math.min(-6, ...xs.map((x) => x - 3)), x1 = Math.max(6, ...xs.map((x) => x + 3));
  const vals = Array.from({ length: 200 }, (_, i) => fx(x0 + ((x1 - x0) * i) / 199)).filter((y) => Number.isFinite(y) && Math.abs(y) < 50);
  const y0 = Math.max(-12, Math.min(-2, ...vals)), y1 = Math.min(12, Math.max(2, ...vals));
  return {
    f: mtex(polish(node)), vertical: vert.map((v) => `x = ${exactTex(v.a)}`), other: uniq.map((e) => ({ tex: e.tex, kind: e.kind })),
    steps, notes: [], verified: true,
    plot: { fn: fx, view: { x0, x1, y0, y1 }, lines: [...vert.map((v) => ({ a: 1, b: 0, c: -v.a })), ...uniq.map((e) => ({ a: e.m, b: -1, c: e.c }))] },
  };
}
