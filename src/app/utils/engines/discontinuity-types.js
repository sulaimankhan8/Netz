/**
 * Types of discontinuity: the maths for /types-of-discontinuity.
 * Type f (a formula, or pieces like "x + 1 for x < 0; x - 1 for x >= 0"). NETZ hunts for every point where f might break
 * (where a bottom is 0, where a piece starts or ends), checks each one with the continuity engine, and names it:
 *   removable: both side limits agree but f(a) is missing or different; jump: the side limits differ;
 *   infinite: a side limit is ±∞.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, variablesOf } from '../symbolic/tree';
import { zerosOf } from '../symbolic/roots';
import { solve as continuityAt } from './continuity';

const KIND = {
  'removable discontinuity': { name: 'Removable', rule: 'Both side limits are equal, but f(a) is missing or has a different value. Filling in the common limit would repair the graph (a "hole").' },
  'jump discontinuity': { name: 'Jump', rule: 'The left and right limits are both numbers but they are different. The graph jumps from one height to another.' },
  'infinite discontinuity': { name: 'Infinite', rule: 'At least one side limit is ±∞. The graph shoots off to infinity at a vertical asymptote.' },
};

function candidatesOf(tf, lo, hi) {
  const found = [];
  const parts = String(tf).split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  const piecewise = parts.length > 1 || /\b(for|if)\b/.test(parts[0] ?? '');
  for (const p of parts) {
    const m = p.match(/^(.+?)\s+(?:for|if)\s+(.+)$/);
    const expr = m ? m[1] : p;
    const cond = m ? m[2] : '';
    const node = parse(expr, 'A piece');
    const vars = [...variablesOf(node)].filter((s) => s !== 'x');
    if (vars.length) throw new EngineError(`Use only x (found ${vars.join(', ')}). To solve for a letter such as k, use the continuity calculator.`);
    try {
      zerosOf(node, 'x', { lo, hi }).undefinedAt.forEach((z) => found.push(z.x));
    } catch { /* no exact candidates from this piece */ }
    (cond.match(/-?\d+(?:\.\d+)?|pi/g) || []).forEach((t) => found.push(t === 'pi' ? Math.PI : Number(t)));
  }
  return { points: found, piecewise };
}

export function solve({ f: tf, lo: tlo = '-10', hi: thi = '10' }) {
  const lo = Number(math.evaluate(String(tlo).trim().replace(/π/g, 'pi')));
  const hi = Number(math.evaluate(String(thi).trim().replace(/π/g, 'pi')));
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(lo < hi)) throw new EngineError('Search from a smaller number to a larger one, for example −10 to 10.');
  const { points, piecewise } = candidatesOf(tf, lo, hi);
  const unique = [...new Set(points.map((p) => Math.round(p * 1e9) / 1e9))].filter((p) => p >= lo - 1e-9 && p <= hi + 1e-9).sort((p, q) => p - q);

  const rows = [];
  const steps = [];
  for (const a of unique) {
    let r;
    try { r = continuityAt({ f: tf, a: String(a) }); } catch { continue; }
    rows.push({ a, verdict: r.verdict, left: r.left, right: r.right, value: r.value });
  }
  const broken = rows.filter((r) => r.verdict !== 'continuous');
  const smooth = rows.filter((r) => r.verdict === 'continuous');

  steps.push({
    title: 'Look for the places f might break',
    text: piecewise
      ? 'A piecewise function can break where one piece ends and the next begins, and wherever a piece has a bottom that is 0.'
      : 'A formula can only break where it is not defined: most often where a bottom is 0.',
    lines: [unique.length ? `\\text{Suspect points: } ${unique.map((p) => `x = ${Number(p.toPrecision(7))}`).join(',\\ ')}` : '\\text{No suspect points between } ' + `${lo} \\text{ and } ${hi}`],
  });
  for (const r of rows) {
    const k = KIND[r.verdict];
    steps.push({
      title: `x = ${Number(r.a.toPrecision(7))}: ${k ? `${k.name} discontinuity` : 'continuous'}`,
      text: k ? k.rule : 'The left limit, the right limit and f(a) are all equal, so there is no break here.',
      formula: '\\lim_{x\\to a^-} f \\quad \\lim_{x\\to a^+} f \\quad f(a)',
      lines: [`\\lim_{x\\to a^-} f = ${r.left}, \\quad \\lim_{x\\to a^+} f = ${r.right}, \\quad f(a) = ${r.value === 'undefined' ? '\\text{undefined}' : r.value}`],
    });
  }
  steps.push({
    title: 'Summary',
    lines: [broken.length
      ? broken.map((r) => `x = ${Number(r.a.toPrecision(7))}: \\text{${KIND[r.verdict]?.name ?? r.verdict}}`).join(',\\ ')
      : `\\text{f is continuous at every point checked between } ${lo} \\text{ and } ${hi}`],
  });

  return {
    f: String(tf).trim(), piecewise, lo, hi,
    points: rows.map((r) => ({ ...r, kind: KIND[r.verdict]?.name ?? 'Continuous' })), broken: broken.length, checked: smooth.length,
    verified: true, steps, notes: ['Only points that could be breaks are checked: where a bottom is 0, or where a piece starts or ends.'], result: broken.length, plot: null,
  };
}
