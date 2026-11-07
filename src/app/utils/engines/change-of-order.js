/**
 * Change of order of integration: the maths for /change-of-order-of-integration (catalog 6G).
 * Given ∫_a^b ∫_{g1(x)}^{g2(x)} f dy dx (or the dx dy form), it finds the same region described the other way:
 *   1. y runs from c = min g1 to d = max g2;
 *   2. for each y, x runs over {x in [a, b] : g1(x) ≤ y ≤ g2(x)} — scanned numerically, so we know whether the
 *      left and right ends come from the line x = a / x = b or from a curve, and where that changes (those
 *      heights split the new integral into pieces);
 *   3. each curve is solved for x (y = x² → x = √y, y = √x → x = y², a line, a circle, …) and checked on samples.
 * Both orders are then evaluated (step by step where possible) and must give the same number.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, variablesOf } from '../symbolic/tree';
import { definite, readExpr, numericIterated, fnOf, exactTex, mtex, texVar } from '../symbolic/iterated';
import { tidyMulti, snap, integrandTex } from '../symbolic/multi';
import { ORDERS, readLimits, regionOf } from './double-integral';

const NW = 1600; // grid across the outer interval
const fmt = (v) => {
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? `(${f.n})` : `(${f.n}/${f.d})`;
  for (const k of [2, 3, 5]) { const g = toFraction(v / Math.sqrt(k), 100, 1e-9); if (g) return `(${g.n}/${g.d}*sqrt(${k}))`; }
  return `(${Number(v.toPrecision(12))})`;
};

/** Solve u = g(w) for w, checked against samples [{ u, w }]. Returns a node in u, or null. */
export function invertCurve(gF, u, samples) {
  if (samples.length < 4) return null;
  const ws = samples.map((s) => s.w);
  const lo = Math.min(...ws), hi = Math.max(...ws);
  const pick = (t) => lo + (hi - lo) * t;
  const ok = (node) => {
    const c = node.compile();
    return samples.every((s) => { try { const v = c.evaluate({ [u]: s.u }); return Math.abs(v - s.w) < 1e-6 * Math.max(1, Math.abs(s.w)); } catch { return false; } });
  };
  const tryExpr = (text) => { try { const n = math.parse(text); return ok(n) ? tidyMulti(n, [u]) : null; } catch { return null; } };
  const fitQuad = (h) => {
    const [w0, w1, w2] = [pick(0.1), pick(0.5), pick(0.9)];
    const [y0, y1, y2] = [h(w0), h(w1), h(w2)];
    // Lagrange form → A w² + B w + C
    const A = y0 / ((w0 - w1) * (w0 - w2)) + y1 / ((w1 - w0) * (w1 - w2)) + y2 / ((w2 - w0) * (w2 - w1));
    const B = -y0 * (w1 + w2) / ((w0 - w1) * (w0 - w2)) - y1 * (w0 + w2) / ((w1 - w0) * (w1 - w2)) - y2 * (w0 + w1) / ((w2 - w0) * (w2 - w1));
    const C = y0 - A * w0 * w0 - B * w0;
    const fits = samples.every((s) => Math.abs(A * s.w * s.w + B * s.w + C - h(s.w)) < 1e-7 * Math.max(1, Math.abs(h(s.w))));
    return fits ? { A: snap(A), B: snap(B), C: snap(C) } : null;
  };
  const solveQuad = ({ A, B, C }, rhs) => {
    if (Math.abs(A) < 1e-12) return Math.abs(B) < 1e-12 ? [] : [`(${rhs} - ${fmt(C)})/${fmt(B)}`];
    if (Math.abs(B) < 1e-12) return [`sqrt((${rhs} - ${fmt(C)})/${fmt(A)})`, `-sqrt((${rhs} - ${fmt(C)})/${fmt(A)})`];
    const D = `(${fmt(B)}^2 - 4*${fmt(A)}*(${fmt(C)} - ${rhs}))`;
    return [`(-${fmt(B)} + sqrt(${D}))/(2*${fmt(A)})`, `(-${fmt(B)} - sqrt(${D}))/(2*${fmt(A)})`];
  };
  const g = (w) => gF({ w });
  // 1–2: g is a polynomial of degree ≤ 2 in w
  const q = fitQuad(g);
  if (q) for (const e of solveQuad(q, u)) { const r = tryExpr(e); if (r) return r; }
  // 3: g² is a polynomial of degree ≤ 2 (y = √x, y = √(a² − x²), y = 2√(ax))
  const q2 = fitQuad((w) => g(w) ** 2);
  if (q2) for (const e of solveQuad(q2, `${u}^2`)) { const r = tryExpr(e); if (r) return r; }
  // 4: g = K w^p
  if (lo > 0 && samples.every((s) => s.u > 0)) {
    const [w0, w1] = [pick(0.2), pick(0.8)];
    const p = Math.log(g(w1) / g(w0)) / Math.log(w1 / w0);
    const K = g(w0) / w0 ** p;
    if (Number.isFinite(p) && Math.abs(p) > 1e-9) { const r = tryExpr(`(${u}/${fmt(snap(K))})^(1/${fmt(snap(p))})`); if (r) return r; }
  }
  // 5–6: g = K e^(p w) or g = K ln w + C
  if (samples.every((s) => s.u > 0)) {
    const [w0, w1] = [pick(0.2), pick(0.8)];
    const p = Math.log(g(w1) / g(w0)) / (w1 - w0);
    const K = g(w0) / Math.exp(p * w0);
    const r = tryExpr(`log(${u}/${fmt(snap(K))})/${fmt(snap(p))}`);
    if (r) return r;
  }
  if (lo > 0) {
    const [w0, w1] = [pick(0.2), pick(0.8)];
    const K = (g(w1) - g(w0)) / Math.log(w1 / w0);
    const C = g(w0) - K * Math.log(w0);
    const r = tryExpr(`exp((${u} - ${fmt(snap(C))})/${fmt(snap(K))})`);
    if (r) return r;
  }
  return null;
}

export function solve({ f, order = 'dydx', innerFrom, innerTo, outerFrom, outerTo }) {
  if (order === 'polar') throw new EngineError('Change of order works with dy dx or dx dy integrals.');
  const o = ORDERS[order];
  const fn = readExpr(f, 'The integrand');
  const lim = readLimits({ innerFrom, innerTo, outerFrom, outerTo }, o.inner, o.outer);
  if (!(lim.bv > lim.av)) throw new EngineError('The outer limits should go from the smaller number to the larger one.');
  const bad = [...variablesOf(fn)].filter((v) => v !== 'x' && v !== 'y' && v !== 'pi' && v !== 'e');
  if (bad.length) throw new EngineError(`The integrand may use only x and y (it uses ${bad.join(', ')}).`);
  const u = o.inner, w = o.outer; // old inner and outer
  const g1 = fnOf(lim.lo), g2 = fnOf(lim.hi);
  const G1 = (t) => g1({ [w]: t }), G2 = (t) => g2({ [w]: t });
  const a = lim.av, b = lim.bv;
  const grid = Array.from({ length: NW + 1 }, (_, i) => a + ((b - a) * i) / NW);
  if (grid.some((t) => !Number.isFinite(G1(t)) || !Number.isFinite(G2(t)))) throw new EngineError('The inner limits must be defined all the way across the outer range.');
  if (grid.some((t) => G1(t) > G2(t) + 1e-9)) throw new EngineError(`The inner lower limit should be below the upper one for every ${w} from ${exactTex(a)} to ${exactTex(b)}.`);

  // New outer range: c = min g1, d = max g2 (refined, then snapped to an exact value when one fits)
  const refine = (h, sign) => {
    let best = 0;
    grid.forEach((t, i) => { if (sign * h(t) < sign * h(grid[best])) best = i; });
    let L = grid[Math.max(0, best - 1)], R = grid[Math.min(NW, best + 1)];
    for (let k = 0; k < 80; k++) { const m1 = L + (R - L) / 3, m2 = R - (R - L) / 3; if (sign * h(m1) < sign * h(m2)) R = m2; else L = m1; }
    return snap(Math.min(...[grid[best], (L + R) / 2].map((t) => sign * h(t))) * sign);
  };
  const c = refine(G1, 1), d = refine(G2, -1);
  if (!(d > c)) throw new EngineError('The region has no height, so there is nothing to change.');

  const exactCands = [G1(a), G1(b), G2(a), G2(b), c, d].map(snap);
  // For one height y: the x-interval and what bounds it at each end
  const slice = (y) => {
    const inside = grid.map((t) => G1(t) <= y + 1e-12 && y <= G2(t) + 1e-12);
    let runs = 0;
    for (let i = 0; i <= NW; i++) if (inside[i] && (i === 0 || !inside[i - 1])) runs++;
    if (runs === 0) return null;
    if (runs > 1) return { split: true };
    const i0 = inside.indexOf(true), i1 = inside.lastIndexOf(true);
    const edge = (iIn, iOut) => {
      let L = grid[iOut], R = grid[iIn];
      const inn = (t) => G1(t) <= y && y <= G2(t);
      for (let k = 0; k < 60; k++) { const m = (L + R) / 2; if (inn(m)) R = m; else L = m; }
      const out = grid[iOut];
      return { at: R, kind: y < G1(out) ? 'g1' : 'g2' };
    };
    const left = i0 === 0 ? { at: a, kind: 'a' } : edge(i0, i0 - 1);
    const right = i1 === NW ? { at: b, kind: 'b' } : edge(i1, i1 + 1);
    return { left, right };
  };
  const M = 240;
  const ys = Array.from({ length: M }, (_, k) => c + ((d - c) * (k + 0.5)) / M);
  const slices = ys.map((y) => ({ y, s: slice(y) }));
  if (slices.some((t) => t.s?.split)) throw new EngineError('At some heights the region breaks into separate pieces, so it can\'t be written as one x-from-to-x range. NETZ can\'t reverse this one yet.');
  const label = (s) => (s ? `${s.left.kind}|${s.right.kind}` : 'none');
  // Group runs of the same boundaries; find each change height by bisection
  const groups = [];
  slices.forEach((t, k) => {
    const lab = label(t.s);
    if (!groups.length || groups.at(-1).lab !== lab) groups.push({ lab, from: k === 0 ? c : null, items: [] });
    groups.at(-1).items.push(t);
  });
  for (let g = 1; g < groups.length; g++) {
    let L = groups[g - 1].items.at(-1).y, R = groups[g].items[0].y;
    const want = groups[g - 1].lab;
    for (let k = 0; k < 60; k++) { const m = (L + R) / 2; if (label(slice(m)) === want) L = m; else R = m; }
    const raw = (L + R) / 2;
    const near = exactCands.find((e) => Math.abs(e - raw) < 1e-6);
    groups[g].from = near ?? snap(raw);
    groups[g - 1].to = groups[g].from;
  }
  groups.at(-1).to = d;
  if (groups.some((g) => g.lab === 'none')) throw new EngineError('The region has gaps at some heights; NETZ can\'t reverse this one yet.');

  // Each boundary as an expression in the new outer letter
  const boundary = (kind, items, side) => {
    if (kind === 'a') return lim.a;
    if (kind === 'b') return lim.b;
    const gF = kind === 'g1' ? g1 : g2;
    const samples = items.map((t) => ({ u: t.y, w: t.s[side].at })).filter((s) => Number.isFinite(s.w));
    const inv = invertCurve((s) => gF({ [w]: s.w }), u, samples.filter((_, i) => i % Math.max(1, Math.floor(samples.length / 24)) === 0));
    if (!inv) throw new EngineError(`NETZ could not solve ${u} = ${(kind === 'g1' ? lim.lo : lim.hi).toString({ implicit: 'hide' })} for ${w}. Try a simpler boundary.`);
    return inv;
  };
  const pieces = groups.map((g) => {
    const [lk, rk] = g.lab.split('|');
    return { from: g.from, to: g.to, lo: boundary(lk, g.items, 'left'), hi: boundary(rk, g.items, 'right'), lk, rk };
  });
  // Merge neighbours with the same formulas
  const merged = [];
  pieces.forEach((p) => {
    const last = merged.at(-1);
    if (last && last.lo.toString() === p.lo.toString() && last.hi.toString() === p.hi.toString()) last.to = p.to;
    else merged.push({ ...p });
  });

  // Values: the old order, the new order (each piece), both numerically
  const F = fnOf(fn);
  const oldNum = numericIterated(F, [{ v: u, lo: g1, hi: g2 }, { v: w, lo: () => a, hi: () => b }], 32);
  const piecesNum = merged.map((p) => numericIterated(F, [{ v: w, lo: fnOf(p.lo), hi: fnOf(p.hi) }, { v: u, lo: () => p.from, hi: () => p.to }], 32));
  const newNum = piecesNum.reduce((s, v) => s + v, 0);
  // The old order step by step too (when it works), for an exact comparison
  let oldSym = null;
  try {
    const t1 = definite(fn, u, lim.lo, lim.hi, [u, w]);
    oldSym = definite(t1.value, w, lim.a, lim.b, [w]).number;
  } catch (e) { if (e.name !== 'EngineError') throw e; }

  const iT = texVar(u), oT = texVar(w);
  const oldSetup = `\\int_{${mtex(lim.a)}}^{${mtex(lim.b)}} \\int_{${mtex(lim.lo)}}^{${mtex(lim.hi)}} ${integrandTex(fn)}\\,d${iT}\\,d${oT}`;
  const newSetup = merged.map((p) => `\\int_{${exactTex(p.from)}}^{${exactTex(p.to)}} \\int_{${mtex(p.lo)}}^{${mtex(p.hi)}} ${integrandTex(fn)}\\,d${oT}\\,d${iT}`).join(' + ');
  const steps = [
    { title: 'Read the region from the limits', lines: [`${exactTex(a)} \\le ${oT} \\le ${exactTex(b)}, \\qquad ${mtex(lim.lo)} \\le ${iT} \\le ${mtex(lim.hi)}`] },
    { title: `Range of ${u} over the region`, lines: [`${iT} \\text{ runs from } ${exactTex(c)} \\text{ (lowest point) to } ${exactTex(d)} \\text{ (highest point)}`] },
    ...merged.map((p) => ({
      title: merged.length > 1 ? `For ${exactTex(p.from).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')} ≤ ${u} ≤ ${exactTex(p.to).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')}: a ${o.inner === 'y' ? 'horizontal' : 'vertical'} strip` : `A ${o.inner === 'y' ? 'horizontal' : 'vertical'} strip at height ${u}`,
      lines: [
        ...[['left', p.lk, p.lo], ['right', p.rk, p.hi]].filter(([, k]) => k === 'g1' || k === 'g2').map(([side, k, node]) => `\\text{${side} end on } ${iT} = ${mtex(k === 'g1' ? lim.lo : lim.hi)} \\;\\Rightarrow\\; ${oT} = ${mtex(node)}`),
        `${mtex(p.lo)} \\le ${oT} \\le ${mtex(p.hi)}, \\qquad ${exactTex(p.from)} \\le ${iT} \\le ${exactTex(p.to)}`,
      ],
    })),
    { title: 'The integral with the order changed', lines: [`${oldSetup} = ${newSetup}`] },
  ];

  // Evaluate the new form step by step where we can
  let symbolic = true, newSym = null;
  try {
    let total = 0;
    merged.forEach((p, i) => {
      const s1 = definite(fn, w, p.lo, p.hi, [w, u]);
      const s2 = definite(s1.value, u, math.parse(String(p.from)), math.parse(String(p.to)), [u]);
      steps.push({ title: `${merged.length > 1 ? `Piece ${i + 1}: ` : ''}inner integral (with respect to ${w})`, lines: s1.lines, depth: 0 });
      s1.steps.forEach((s) => steps.push(s));
      steps.push({ title: `${merged.length > 1 ? `Piece ${i + 1}: ` : ''}outer integral (with respect to ${u})`, lines: s2.lines.map((l) => l.replace(/\{0\.\d{6,}\}|\{\d+\.\d{6,}\}/g, (m) => `{${exactTex(Number(m.slice(1, -1)))}}`)), depth: 0 });
      s2.steps.forEach((s) => steps.push(s));
      total += s2.number;
    });
    symbolic = Math.abs(total - newNum) <= 1e-4 * Math.max(1, Math.abs(newNum));
    if (symbolic) newSym = total;
    if (merged.length > 1) steps.push({ title: 'Add the pieces', lines: [`= ${exactTex(total)}`] });
  } catch (e) {
    if (e.name !== 'EngineError') throw e;
    symbolic = false;
  }
  const value = newSym ?? newNum;
  const valueTex = exactTex(value);
  // Exact comparison when both orders were done by hand rules; otherwise numbers (√ boundaries cost some accuracy)
  const agree = oldSym !== null && newSym !== null
    ? Math.abs(oldSym - newSym) <= 1e-9 * Math.max(1, Math.abs(oldSym))
    : Math.abs(oldNum - newNum) <= 1e-4 * Math.max(1, Math.abs(oldNum));
  const notes = [agree ? 'Checked: both orders give the same value numerically.' : 'The two orders give different numbers, so the region was not read correctly. Please check the limits.'];
  if (!symbolic) notes.push('The new integral is evaluated numerically (NETZ can\'t do every step by hand rules here).');
  // Sketch: the old region with a strip in the new direction
  const reg = regionOf(order, lim);
  const midY = c + (d - c) * 0.5;
  const sl = slice(midY);
  if (reg && sl && !sl.split) reg.strip = order === 'dydx' ? { dir: 'horizontal', at: midY, from: sl.left.at, to: sl.right.at } : { dir: 'vertical', at: midY, from: sl.left.at, to: sl.right.at };
  return { oldSetup, newSetup, pieces: merged.length, value, valueTex, verified: agree, steps, notes, region: reg, result: value };
}
