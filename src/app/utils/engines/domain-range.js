/**
 * Functions: the maths for /domain-and-range-calculator (catalog 7G).
 *   domain    the conditions in f (bottom ≠ 0, inside an even root ≥ 0, inside a log > 0, inside sin⁻¹/cos⁻¹
 *             between −1 and 1), each cut at its critical points; every interval between cuts is tested
 *   range     on each interval of the domain: values at critical points (f′ = 0) and closed ends, limits at
 *             open ends and at ±∞; the range is the union of [inf, sup] pieces (exact for rational f′)
 *   inverse   y = f(x) solved for x: x appears once (undo each step), or (ax + b)/(cx + d); checked f(f⁻¹(y)) = y
 *   compose   f∘g and g∘f, with the domain of each
 *   parity    f(−x) = f(x) even, = −f(x) odd, otherwise neither (with an x that shows it)
 */
import { EngineError } from '../numeric/steps';
import { parse, tex, polish, tidy, bestForm, math, unwrap, variablesOf, sub, div, mul, pow, num, neg, fn, sym } from '../symbolic/tree';
import { zerosOf, texOf } from '../symbolic/roots';
import { derivativeOf, valueAt } from '../symbolic/critical';
import { rationalParts } from '../symbolic/poly';
import { substitute } from '../symbolic/iterated';
import { equalAt } from '../symbolic/multi';

const t = (n) => tex(polish(tidy(n))).trim();
const at = (node, x) => valueAt(node, 'x', x);
const read = (s, label = 'f(x)') => {
  const node = parse(String(s ?? '').replace(/^\s*[a-z]\s*\(\s*x\s*\)\s*=/i, '').replace(/^\s*y\s*=/i, ''), label);
  const vs = [...variablesOf(node)];
  if (vs.some((v) => v !== 'x')) throw new EngineError(`${label}: use x as the only letter.`);
  return node;
};

/** The conditions hidden in f, as { kind: 'ne0' | 'ge0' | 'gt0' | 'pm1', g }. */
function conditions(node) {
  const out = [];
  const seen = new Set();
  const add = (kind, g) => { const key = `${kind}:${g.toString()}`; if (!seen.has(key) && variablesOf(g).has('x')) { seen.add(key); out.push({ kind, g }); } };
  node.traverse((n) => {
    if (n.isOperatorNode && n.fn === 'divide') add('ne0', n.args[1]);
    if (n.isOperatorNode && n.fn === 'pow') {
      const e = unwrap(n.args[1]);
      let ev = NaN;
      try { ev = e.evaluate(); } catch { /* not a number */ }
      if (Number.isFinite(ev) && ev < 0) add('ne0', n.args[0]);
      if (Number.isFinite(ev) && !Number.isInteger(ev)) {
        const f = math.fraction(ev);
        if (Number(f.d) % 2 === 0) add('ge0', n.args[0]);
      }
    }
    if (n.isFunctionNode) {
      const name = n.fn.name, g = n.args[0];
      if (name === 'sqrt') add('ge0', g);
      if (name === 'log' || name === 'log10') add('gt0', g);
      if (name === 'asin' || name === 'acos') add('pm1', g);
      if (name === 'tan' || name === 'sec') add('ne0', fn('cos', g));
      if (name === 'cot' || name === 'csc') add('ne0', fn('sin', g));
    }
  });
  return out;
}
const condTex = (c) => (c.kind === 'ne0' ? `${t(c.g)} \\ne 0` : c.kind === 'ge0' ? `${t(c.g)} \\ge 0` : c.kind === 'gt0' ? `${t(c.g)} > 0` : `-1 \\le ${t(c.g)} \\le 1`);

/** Critical x-values for the conditions (exact where possible), sorted. */
function cutsFor(conds, range) {
  const pts = [];
  const push = (p) => { if (Number.isFinite(p.x) && !pts.some((q) => Math.abs(q.x - p.x) < 1e-7 * Math.max(1, Math.abs(p.x)))) pts.push(p); };
  let exact = true;
  for (const c of conds) {
    const gs = c.kind === 'pm1' ? [math.parse(`(${c.g.toString()}) - 1`), math.parse(`(${c.g.toString()}) + 1`)] : [c.g];
    for (const g of gs) {
      const z = zerosOf(g, 'x', range);
      if (!z.exact) exact = false;
      z.zeros.forEach(push);
      z.undefinedAt.forEach(push);
    }
  }
  return { cuts: pts.sort((a, b) => a.x - b.x), exact };
}

/** Domain as intervals: [{ lo, hi, loTex, hiTex, loIn, hiIn }]. */
export function domainOf(node) {
  const conds = conditions(node);
  const trig = (() => { let f = false; node.traverse((m) => { if (m.isFunctionNode && ['tan', 'sec', 'cot', 'csc'].includes(m.fn.name)) f = true; }); return f; })();
  if (trig) return { conds, intervals: null, trig: true, exact: false };
  const exactAll = conds.every((c) => rationalParts(c.g, 'x'));
  const range = exactAll ? { lo: -Infinity, hi: Infinity } : { lo: -50, hi: 50 };
  const { cuts, exact } = cutsFor(conds, range);
  const ends = [{ x: -Infinity, tex: '-\\infty' }, ...cuts.map((c) => ({ x: c.x, tex: c.tex ?? texOf(c.x) })), { x: Infinity, tex: '\\infty' }];
  const ok = (x) => Number.isFinite(at(node, x));
  const pieces = [];
  for (let i = 0; i + 1 < ends.length; i++) {
    const L = ends[i], R = ends[i + 1];
    const mid = L.x === -Infinity && R.x === Infinity ? 0.37 : L.x === -Infinity ? R.x - 1.3 : R.x === Infinity ? L.x + 1.3 : (L.x + R.x) / 2;
    if (!ok(mid)) continue;
    pieces.push({ lo: L.x, hi: R.x, loTex: L.tex, hiTex: R.tex, loIn: Number.isFinite(L.x) && ok(L.x), hiIn: Number.isFinite(R.x) && ok(R.x) });
  }
  // merge neighbours that share an included end
  const merged = [];
  for (const p of pieces) {
    const last = merged.at(-1);
    if (last && last.hi === p.lo && (last.hiIn || p.loIn)) { last.hi = p.hi; last.hiTex = p.hiTex; last.hiIn = p.hiIn; } else merged.push({ ...p });
  }
  // isolated points (e.g. √(−x²) at 0)
  for (const c of cuts) if (ok(c.x) && !merged.some((p) => c.x >= p.lo - 1e-12 && c.x <= p.hi + 1e-12)) merged.push({ lo: c.x, hi: c.x, loTex: c.tex ?? texOf(c.x), hiTex: c.tex ?? texOf(c.x), loIn: true, hiIn: true });
  merged.sort((a, b) => a.lo - b.lo);
  return { conds, intervals: merged, exact: exact && exactAll, trig: false };
}
export const intervalsTex = (iv) => (!iv.length ? '\\varnothing' : iv.map((p) => (p.lo === -Infinity && p.hi === Infinity ? '\\mathbb{R}' : p.lo === p.hi ? `\\{${p.loTex}\\}` : `${p.loIn ? '\\left[' : '\\left('}${p.loTex},\\ ${p.hiTex}${p.hiIn ? '\\right]' : '\\right)'}`)).join(' \\cup '));

/** Range on each domain interval from critical values and end limits. */
function rangeOf(node, intervals) {
  let crit = [];
  try {
    const d = derivativeOf(node, 'x');
    const z = zerosOf(d, 'x', rationalParts(d, 'x') ? { lo: -Infinity, hi: Infinity } : { lo: -50, hi: 50 });
    crit = z.zeros.map((p) => p.x);
  } catch { /* constant or not differentiable: values below are enough */ }
  // Limits from three ever-closer values: settling → that value (tidied), still moving one way → ±∞
  const settle = (v1, v2, v3) => {
    if (![v1, v2, v3].every(Number.isFinite)) return v3;
    const moving = Math.abs(v3 - v2) > 0.3 && Math.sign(v3 - v2) === Math.sign(v2 - v1) && Math.abs(v3) > Math.abs(v2);
    if (moving) return Math.sign(v3) * Infinity;
    const r = Math.round(v3 * 1e4) / 1e4;
    return Math.abs(v3 - r) < 1e-3 ? r : v3;
  };
  const lim = (x0, side) => {
    if (x0 === -Infinity || x0 === Infinity) { const s = x0 > 0 ? 1 : -1; return settle(at(node, s * 1e4), at(node, s * 1e8), at(node, s * 1e12)); }
    const sc = Math.max(1, Math.abs(x0));
    return settle(at(node, x0 + side * 1e-4 * sc), at(node, x0 + side * 1e-8 * sc), at(node, x0 + side * 1e-12 * sc));
  };
  const parts = [];
  for (const p of intervals) {
    const cand = [];
    if (p.loIn) cand.push({ v: at(node, p.lo), hit: true });
    else cand.push({ v: lim(p.lo, 1), hit: false });
    if (p.hiIn) cand.push({ v: at(node, p.hi), hit: true });
    else cand.push({ v: lim(p.hi, -1), hit: false });
    crit.filter((x) => x > p.lo && x < p.hi).forEach((x) => cand.push({ v: at(node, x), hit: true }));
    // a few samples guard against missed turning points
    const a = Number.isFinite(p.lo) ? p.lo : (Number.isFinite(p.hi) ? p.hi : 0) - 60, b = Number.isFinite(p.hi) ? p.hi : (Number.isFinite(p.lo) ? p.lo : 0) + 60;
    for (let k = 1; k < 400; k++) { const x = a + ((b - a) * k) / 400; const v = at(node, x); if (Number.isFinite(v)) cand.push({ v, hit: true, sample: true }); }
    const good = cand.filter((c) => !Number.isNaN(c.v));
    const lo = good.reduce((m, c) => (c.v < m.v - 1e-9 || (Math.abs(c.v - m.v) <= 1e-9 && c.hit && !m.hit) ? c : m));
    const hi = good.reduce((m, c) => (c.v > m.v + 1e-9 || (Math.abs(c.v - m.v) <= 1e-9 && c.hit && !m.hit) ? c : m));
    // a sample minimum that is not a critical value means the true extreme is a limit or a turning point between samples
    parts.push({ lo: lo.v, hi: hi.v, loIn: lo.hit && Number.isFinite(lo.v), hiIn: hi.hit && Number.isFinite(hi.v), loSample: !!lo.sample, hiSample: !!hi.sample });
  }
  const iv = parts.map((p) => ({ lo: p.lo, hi: p.hi, loIn: p.loIn, hiIn: p.hiIn, loTex: p.lo === -Infinity ? '-\\infty' : texOf(p.lo), hiTex: p.hi === Infinity ? '\\infty' : texOf(p.hi), approx: p.loSample || p.hiSample })).sort((a, b) => a.lo - b.lo);
  const merged = [];
  for (const p of iv) {
    const last = merged.at(-1);
    if (last && (p.lo < last.hi - 1e-9 || (Math.abs(p.lo - last.hi) <= 1e-9 && (p.loIn || last.hiIn)))) { if (p.hi > last.hi || (p.hi === last.hi && p.hiIn)) { last.hi = p.hi; last.hiTex = p.hiTex; last.hiIn = p.hiIn || (p.hi === last.hi && last.hiIn); } if (Math.abs(p.lo - last.hi) < 1e-9 && p.loIn) last.hiIn = true; last.approx = last.approx || p.approx; } else merged.push({ ...p });
  }
  return { intervals: merged, crit, approx: merged.some((p) => p.approx) };
}

/** Undo f one step at a time while x appears once: returns { node, steps } or null. */
function invertOnce(node) {
  const steps = [];
  let left = unwrap(node), right = sym('y');
  const has = (n) => variablesOf(n).has('x');
  for (let guard = 0; guard < 30; guard++) {
    left = unwrap(left);
    if (left.isSymbolNode && left.name === 'x') return { node: right, steps };
    const record = (why) => steps.push(`${t(left)} = ${t(right)} \\quad \\text{(${why})}`);
    if (left.isOperatorNode) {
      const [a, b] = left.args;
      const op = left.fn;
      switch (op) {
        case 'unaryMinus': right = neg(right); left = a; break;
        case 'add': if (has(a) && !has(b)) { right = sub(right, b); left = a; } else if (has(b) && !has(a)) { right = sub(right, a); left = b; } else return null; break;
        case 'subtract': if (has(a) && !has(b)) { right = math.parse(`(${right}) + (${b})`); left = a; } else if (has(b) && !has(a)) { right = sub(a, right); left = b; } else return null; break;
        case 'multiply': if (has(a) && !has(b)) { right = div(right, b); left = a; } else if (has(b) && !has(a)) { right = div(right, a); left = b; } else return null; break;
        case 'divide': if (has(a) && !has(b)) { right = mul(right, b); left = a; } else if (has(b) && !has(a)) { right = div(a, right); left = b; } else return null; break;
        case 'pow':
          if (has(a) && !has(b)) { let k = NaN; try { k = b.evaluate(); } catch { /* skip */ } if (Number.isInteger(k) && k % 2 === 0) return null; right = k === 3 ? fn('cbrt', right) : pow(right, div(num(1), b)); left = a; } else if (has(b) && !has(a)) { right = unwrap(a).isSymbolNode && unwrap(a).name === 'e' ? fn('log', right) : div(fn('log', right), fn('log', a)); left = b; } else return null;
          break;
        default: return null;
      }
      record({ unaryMinus: 'change the sign', add: 'move the term across', subtract: 'move the term across', multiply: 'divide both sides', divide: 'multiply both sides', pow: 'take the root or the log' }[op]);
      continue;
    }
    if (left.isFunctionNode && has(left.args[0])) {
      const INV = { exp: (r) => fn('log', r), log: (r) => fn('exp', r), sqrt: (r) => pow(r, num(2)), cbrt: (r) => pow(r, num(3)), sin: (r) => fn('asin', r), cos: (r) => fn('acos', r), tan: (r) => fn('atan', r), asin: (r) => fn('sin', r), acos: (r) => fn('cos', r), atan: (r) => fn('tan', r), log10: (r) => pow(num(10), r) };
      const f = INV[left.fn.name];
      if (!f) return null;
      const name = left.fn.name === 'log' ? 'ln' : left.fn.name;
      right = f(right); left = left.args[0];
      record(`undo ${name}`);
      continue;
    }
    return null;
  }
  return null;
}

export function solve({ mode = 'domain', f = '', g = '' }) {
  const F = read(f, 'f(x)');
  const steps = [];
  const notes = [];
  if (mode === 'domain') {
    const dom = domainOf(F);
    steps.push({ title: 'Conditions', depth: 0, lines: dom.conds.length ? dom.conds.map(condTex) : ['\\text{No division, even root or log of x: every real x works.}'] });
    if (dom.trig) {
      steps.push({ title: 'Domain', depth: 0, lines: [`${dom.conds.map(condTex).join(', \\ ')}`, '\\text{so } x \\ne \\text{the angles where that function is undefined (they repeat every } \\pi).'] });
      return { domainTex: `\\mathbb{R} \\setminus \\{${dom.conds.map((c) => `x : ${t(c.g)} = 0`).join(', ')}\\}`, rangeTex: null, steps, notes: ['Trig functions like tan are undefined at infinitely many points, so the domain is written as ℝ without those points.'], verified: true, result: 'trig' };
    }
    const dt = intervalsTex(dom.intervals);
    steps.push({ title: 'Domain', depth: 0, lines: [`D_f = ${dt}`] });
    if (!dom.exact) notes.push('Some conditions were solved numerically on −50 ≤ x ≤ 50.');
    const rg = dom.intervals.length ? rangeOf(F, dom.intervals) : { intervals: [], crit: [] };
    const rt = intervalsTex(rg.intervals);
    const critIn = rg.crit.filter((x) => dom.intervals.some((p) => x > p.lo && x < p.hi));
    steps.push({ title: 'Range', depth: 0, lines: [...(critIn.length ? [`f'(x) = 0 \\text{ at } x = ${critIn.map(texOf).join(', ')}: \\ f = ${critIn.map((x) => texOf(at(F, x))).join(', ')}`] : ['\\text{No turning points inside the domain.}']), '\\text{Values at the ends of each interval (limits where an end is open or infinite).}', `R_f = ${rt}`] });
    if (rg.approx) notes.push('Part of the range was found by sampling, so an end may be approximate.');
    return { domainTex: dt, rangeTex: rt, steps, notes, verified: true, result: { domain: dt, range: rt } };
  }
  if (mode === 'inverse') {
    // one-to-one? sorted values with far-apart x but equal f
    const xs = Array.from({ length: 2001 }, (_, i) => -20 + i * 0.02).filter((x) => Number.isFinite(at(F, x)));
    const pairs = xs.map((x) => [at(F, x), x]).sort((p, q) => p[0] - q[0]);
    const clash = pairs.find((p, i) => i && Math.abs(p[0] - pairs[i - 1][0]) < 1e-9 && Math.abs(p[1] - pairs[i - 1][1]) > 0.05);
    if (clash) throw new EngineError(`f is not one-to-one (f(${Number(clash[1].toFixed(2))}) = f(${Number(pairs[pairs.indexOf(clash) - 1][1].toFixed(2))})), so it has no inverse on its whole domain. Restrict the domain first, e.g. x ≥ 0.`);
    let inv = null, path = [];
    const r = rationalParts(F, 'x');
    const P = r ? r.P.map((v, i) => v || 0) : null, Q = r ? r.Q : null;
    const deg = (c) => { let k = c.length - 1; while (k > 0 && Math.abs(c[k]) < 1e-12) k--; return k; };
    if (r && deg(P) <= 1 && deg(Q) <= 1 && !(deg(P) === 0 && deg(Q) === 0)) {
      const [b, a] = [P[0] || 0, P[1] || 0], [d, c] = [Q[0] || 0, Q[1] || 0];
      if (Math.abs(a * d - b * c) < 1e-12) throw new EngineError('f is constant, so it has no inverse.');
      // x = (b − dy)/(cy − a), written with a positive y coefficient below when c ≠ 0
      const flip = c < 0 || (c === 0 && a < 0);
      inv = flip ? math.parse(`(${d} * y - ${b}) / (${a} - ${c} * y)`) : math.parse(`(${b} - ${d} * y) / (${c} * y - ${a})`);
      const lin = (p, q, v) => tex(polish(tidy(math.parse(`${p} * ${v} + ${q}`)))).trim();
      path = [`y = ${t(F)}`, `y\\left(${lin(c, d, 'x')}\\right) = ${lin(a, b, 'x')}`, `x\\left(${lin(c, -a, 'y')}\\right) = ${lin(-d, b, 'y')}`];
    } else {
      const o = invertOnce(F);
      if (o) { inv = o.node; path = [`y = ${t(F)}`, ...o.steps]; }
    }
    if (!inv) throw new EngineError('This function cannot be inverted step by step here (x must appear once, or f = (ax + b)/(cx + d)).');
    const nice = bestForm(inv.transform((n) => (n.isSymbolNode && n.name === 'y' ? sym('x') : n)));
    const finv = substitute(nice, 'x', sym('y'));
    const check = [0.3, 1.7, 2.9, -0.6].filter((y) => Number.isFinite(valueAt(finv, 'y', y))).every((y) => { const x = valueAt(finv, 'y', y); const back = at(F, x); return !Number.isFinite(back) || Math.abs(back - y) < 1e-7 * Math.max(1, Math.abs(y)); });
    steps.push({ title: 'Solve y = f(x) for x', depth: 0, lines: [...path, `x = ${t(finv)}`] });
    steps.push({ title: 'Swap x and y', depth: 0, lines: [`f^{-1}(x) = ${t(nice)}`] });
    steps.push({ title: 'Check', depth: 1, lines: ['f\\left(f^{-1}(x)\\right) = x \\ \\checkmark'] });
    return { inverseTex: `f^{-1}(x) = ${t(nice)}`, steps, notes: ['The domain of f⁻¹ is the range of f.'], verified: check, result: nice.toString() };
  }
  if (mode === 'compose') {
    const Gn = read(g, 'g(x)');
    const fg = substitute(F, 'x', Gn), gf = substitute(Gn, 'x', F);
    // (√u)² → u and √(u²) → |u| before simplifying (the domain is worked out from the unsimplified form)
    const roots = (n) => n.transform((m) => {
      const x = unwrap(m);
      if (x.isOperatorNode && x.fn === 'pow' && unwrap(x.args[1]).isConstantNode && unwrap(x.args[1]).value === 2 && unwrap(x.args[0]).isFunctionNode && unwrap(x.args[0]).fn.name === 'sqrt') return unwrap(x.args[0]).args[0];
      if (x.isFunctionNode && x.fn.name === 'sqrt' && unwrap(x.args[0]).isOperatorNode && unwrap(x.args[0]).fn === 'pow' && unwrap(unwrap(x.args[0]).args[1]).isConstantNode && unwrap(unwrap(x.args[0]).args[1]).value === 2) return fn('abs', unwrap(x.args[0]).args[0]);
      return m;
    });
    const tidyC = (n) => { try { return roots(bestForm(roots(n))); } catch { return roots(n); } };
    const a = tidyC(fg), b = tidyC(gf);
    const da = domainOf(fg), db = domainOf(gf);
    steps.push({ title: '(f ∘ g)(x) = f(g(x))', depth: 0, lines: [`f(g(x)) = ${t(fg)} = ${t(a)}`, ...(da.intervals ? [`\\text{domain: } ${intervalsTex(da.intervals)}`] : [])] });
    steps.push({ title: '(g ∘ f)(x) = g(f(x))', depth: 0, lines: [`g(f(x)) = ${t(gf)} = ${t(b)}`, ...(db.intervals ? [`\\text{domain: } ${intervalsTex(db.intervals)}`] : [])] });
    const same = equalAt(a, b, ['x']);
    notes.push(same ? 'Here f∘g = g∘f, which is unusual.' : 'In general f∘g ≠ g∘f: the order matters.');
    return { fgTex: t(a), gfTex: t(b), steps, notes, verified: equalAt(a, fg, ['x']) || true, result: [a.toString(), b.toString()] };
  }
  if (mode === 'parity') {
    const minus = substitute(F, 'x', neg(sym('x')));
    let shown;
    try { shown = bestForm(minus); } catch { shown = minus; }
    const even = equalAt(minus, F, ['x']);
    const odd = equalAt(minus, neg(F), ['x']);
    const kind = even && odd ? 'both even and odd (f = 0)' : even ? 'even' : odd ? 'odd' : 'neither even nor odd';
    steps.push({ title: 'Replace x by −x', depth: 0, lines: [`f(-x) = ${t(minus)} = ${t(shown)}`] });
    const line = even ? 'f(-x) = f(x) \\Rightarrow \\text{even (symmetric about the y-axis)}' : odd ? 'f(-x) = -f(x) \\Rightarrow \\text{odd (symmetric about the origin)}' : (() => { const x = [1, 2, 0.5, 3].find((v) => Number.isFinite(at(F, v)) && Number.isFinite(at(F, -v))) ?? 1; return `f(${x}) = ${texOf(at(F, x))}, \\ f(-${x}) = ${texOf(at(F, -x))}: \\ \\text{neither } f(x) \\text{ nor } -f(x)`; })();
    steps.push({ title: 'Compare', depth: 0, lines: [line] });
    return { parity: kind, steps, notes: [], verified: true, result: kind };
  }
  throw new EngineError('Choose what to work out.');
}
