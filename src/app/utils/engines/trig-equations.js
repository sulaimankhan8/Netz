/**
 * Trigonometric equations: the maths for /trigonometric-equations (catalog 9F).
 *   1. Write F = left − right in sin w and cos w (tan, sec, … rewritten; 2w, 3w and w ± a expanded).
 *   2. One fraction N/D. Cut powers with sin² + cos² = 1 so N is a polynomial in ONE function, or that
 *      function times a polynomial in the other, or a sin w + b cos w + d (then R cos(w − φ) = −d).
 *   3. Each factor T(w) = r gives a principal value α and the general solution
 *        sin w = sin α:  w = nπ + (−1)ⁿα     cos w = cos α:  w = 2nπ ± α     tan w = tan α:  w = nπ + α
 *   4. w = kx + b, so x follows. Every family is checked in the original equation; the solutions
 *      in [0, 2π) are listed. If no rule fits, the solutions in [0, 2π) are found numerically.
 */
import { EngineError } from '../numeric/steps';
import { parse, tex, polish, tidy } from '../symbolic/tree';
import { evalAt } from '../symbolic/multi';
import { polyRoots } from '../symbolic/roots';
import { toSinCos, expandAngles, trigCalls, toRationalSC, polySCTex, angleTex, degText, valueTex } from '../symbolic/trig';

const TWO_PI = 2 * Math.PI;
const t = (n) => tex(polish(tidy(n)));
const readEq = (s) => String(s).replace(/θ/g, 'x').replace(/(sin|cos|tan|sec|csc|cot)\s*\^\s*(\d)\s*\(([^()]*)\)/g, '$1($3)^$2').replace(/(sin|cos|tan|sec|csc|cot)\s+([a-z])\b/g, '$1($2)');

/** Coefficients of a one-function polynomial from the map (power index 0 = sin, 1 = cos). */
const coeffsOf = (p, idx) => { const c = []; p.forEach((v, k) => { const e = k.split(',').map(Number)[idx]; c[e] = (c[e] || 0) + v; }); for (let i = 0; i < c.length; i++) c[i] = c[i] || 0; return c; };
const onlyPowersOf = (p, idx) => [...p.keys()].every((k) => k.split(',').map(Number)[1 - idx] === 0);

/** The principal value and the general solution of T(w) = r, as one family. */
function family(T, r, rootTex, wTex) {
  const v = valueTex(r);
  const rTex = /\./.test(v) && !/\./.test(rootTex) ? rootTex : v;
  if ((T === 'sin' || T === 'cos') && Math.abs(r) > 1 + 1e-12) return { T, r, rTex, none: true };
  const rr = Math.max(-1, Math.min(1, r));
  const a = T === 'sin' ? Math.asin(rr) : T === 'cos' ? Math.acos(rr) : Math.atan(r);
  const nice = angleTex(a);
  const aTex = /pi|^0$/.test(nice) ? nice : `\\${T}^{-1}\\left(${rTex}\\right)`;
  const general = T === 'sin' ? `${wTex} = n\\pi + (-1)^{n}${/^-/.test(aTex) ? `\\left(${aTex}\\right)` : aTex}` : T === 'cos' ? `${wTex} = 2n\\pi \\pm ${aTex}` : `${wTex} = n\\pi ${/^-/.test(aTex) ? '' : '+ '}${aTex}`;
  const values = (n) => (T === 'sin' ? [n * Math.PI + (n % 2 === 0 ? a : -a)] : T === 'cos' ? [2 * n * Math.PI + a, 2 * n * Math.PI - a] : [n * Math.PI + a]);
  return { T, r, rTex, alpha: a, aTex, general, values, line: `\\${T} ${wTex} = ${rTex} \\ \\Rightarrow \\ \\alpha = ${aTex}${/pi|^0$/.test(nice) ? '' : ` \\approx ${Number(a.toFixed(4))}`}` };
}

export function solve({ equation }) {
  const text = String(equation ?? '').trim();
  const parts = text.split('=');
  if (parts.length > 2) throw new EngineError('Use one = sign, e.g. 2sin(x) - 1 = 0.');
  const L = parse(readEq(parts[0]), 'The left side');
  const R = parse(readEq(parts[1] ?? '0'), 'The right side');
  const F = parse(`(${L.toString()}) - (${R.toString()})`, 'The equation');
  const f = (x) => evalAt(F, { x });
  if (!trigCalls(F).length) throw new EngineError('There is no sin, cos or tan in this equation.');
  const steps = [{ title: 'The equation', depth: 0, lines: [`${t(L)} = ${t(R)}`] }];

  // Rewrite in sin w, cos w with one angle w
  let G = toSinCos(F);
  // Expand 2x, 3x, x ± a only when the equation mixes angles (sin 3x = 1/2 keeps w = 3x)
  if (new Set(trigCalls(G).map((c) => c.arg)).size > 1) for (let i = 0; i < 3; i++) { const e = expandAngles(G); if (!e.changed) break; G = toSinCos(e.node); }
  const args = [...new Set(trigCalls(G).map((c) => c.arg))];
  const w = args.length === 1 ? args[0] : null;
  // w = kx + b
  let k = null, b = 0;
  if (w) {
    const wn = parse(w, 'The angle');
    const w0 = evalAt(wn, { x: 0 }), w1 = evalAt(wn, { x: 1 }), w2 = evalAt(wn, { x: 2.5 });
    if ([w0, w1, w2].every(Number.isFinite) && Math.abs(w0 + 2.5 * (w1 - w0) - w2) < 1e-9 && Math.abs(w1 - w0) > 1e-12) { k = w1 - w0; b = w0; }
  }
  const wTex = w ? (w === 'x' ? 'x' : `(${tex(parse(w))})`) : 'x';
  const families = [];
  let method = null;
  if (w && k !== null) {
    // Homogeneous in sin and cos (every term of degree m, sinᵐ present): divide by cosᵐ → a polynomial in tan
    const raw = toRationalSC(G, w, null);
    if (raw && raw.N.size) {
      const degs = [...raw.N.keys()].map((q) => q.split(',').map(Number));
      const m = degs[0][0] + degs[0][1];
      if (m >= 1 && degs.every((q) => q[0] + q[1] === m) && Math.abs(raw.N.get(`${m},0`) || 0) > 1e-12) {
        const c = Array.from({ length: m + 1 }, (_, i) => raw.N.get(`${i},${m - i}`) || 0);
        families.push(...polyRoots(c).map((r) => family('tan', r.x, r.tex, wTex)));
        method = { lines: [`${polySCTex(raw.N, wTex)} = 0`, `\\text{Divide by } \\cos${m > 1 ? `^{${m}}` : ''} ${wTex} \\ (\\cos ${wTex} = 0 \\text{ is not a solution here}):`, `${c.map((v, i) => [v, i]).filter(([v]) => Math.abs(v) > 1e-12).reverse().map(([v, i], j) => `${v < 0 ? '-' : j ? '+' : ''} ${Math.abs(v) === 1 && i ? '' : valueTex(Math.abs(v))}${i ? `\\tan${i > 1 ? `^{${i}}` : ''} ${wTex}` : ''}`).join(' ')} = 0`] };
      }
    }
    for (const mode of method ? [] : ['sin', 'cos']) {
      const rat = toRationalSC(G, w, mode);
      if (!rat) break;
      const N = rat.N;
      // index of the function that keeps all its powers in this mode
      const keep = mode === 'sin' ? 1 : 0; // after cutting sin powers, cos is the free one
      const name = keep === 1 ? 'cos' : 'sin';
      const other = keep === 1 ? 'sin' : 'cos';
      const lines = [`${polySCTex(N, wTex)} = 0 \\quad \\text{(in } \\sin, \\cos \\text{, using } \\sin^2 + \\cos^2 = 1)`];
      const rootsOf = (c, T) => polyRoots(c).forEach((r) => families.push(family(T, r.x, r.tex, wTex)));
      if (onlyPowersOf(N, keep)) {
        const c = coeffsOf(N, keep);
        lines.push(`\\text{A polynomial in } \\${name} ${wTex}`);
        rootsOf(c, name);
        method = { lines };
        break;
      }
      // other(w) × polynomial in name(w)? (every term has the other function to power exactly 1)
      const keysArr = [...N.keys()].map((q) => q.split(',').map(Number));
      if (keysArr.every((q) => q[1 - keep] === 1)) {
        const rest = new Map([...N].map(([q, v]) => { const e = q.split(',').map(Number); e[1 - keep] = 0; return [e.join(','), v]; }));
        lines.push(`\\${other} ${wTex} \\left(${polySCTex(rest, wTex)}\\right) = 0`);
        families.push(family(other, 0, '0', wTex));
        rootsOf(coeffsOf(rest, keep), name);
        method = { lines };
        break;
      }
    }
    // a sin w + b cos w + d = 0
    if (!method) {
      const rat = toRationalSC(G, w, null);
      if (rat && [...rat.N.keys()].every((q) => ['0,0', '1,0', '0,1'].includes(q))) {
        const A = rat.N.get('1,0') || 0, B = rat.N.get('0,1') || 0, d = rat.N.get('0,0') || 0;
        const Rr = Math.hypot(A, B), phi = Math.atan2(A, B);
        const phiTex = angleTex(phi);
        const lines = [`${polySCTex(rat.N, wTex)} = 0`, `R = \\sqrt{${valueTex(A)}^2 + ${valueTex(B)}^2} = ${valueTex(Rr)}, \\quad \\tan\\varphi = \\frac{${valueTex(A)}}{${valueTex(B)}} \\Rightarrow \\varphi = ${phiTex}`, `${valueTex(Rr)}\\cos\\left(${wTex} - ${phiTex}\\right) = ${valueTex(-d)}`];
        const fam = family('cos', -d / Rr, valueTex(-d / Rr), `\\left(${wTex} - ${phiTex}\\right)`);
        if (!fam.none) { const base = fam.values; fam.values = (n) => base(n).map((v) => v + phi); }
        families.push(fam);
        method = { lines };
      }
    }
  }
  const candidates = [];
  if (method) {
    steps.push({ title: 'Write in one trig function', depth: 0, lines: method.lines });
    for (const fam of families) {
      if (fam.none) { steps.push({ title: `\\${fam.T} = ${fam.rTex}`.replace(/\\/g, ''), depth: 1, lines: [`\\${fam.T} ${wTex} = ${fam.rTex} \\text{ has no solution (it must lie between } -1 \\text{ and } 1)`] }); continue; }
      // keep the family only if it solves the original equation (drops roots where tan, sec … are undefined)
      const xs = [];
      for (let n = -40; n <= 40; n++) fam.values(n).forEach((v) => xs.push((v - b) / k));
      const good = xs.filter((x) => Math.abs(f(x)) < 1e-7);
      if (!good.length) { steps.push({ title: 'Rejected', depth: 1, lines: [`${fam.line} \\ \\text{(makes the equation undefined, so rejected)}`] }); continue; }
      fam.ok = true;
      steps.push({ title: `General solution`, depth: 1, lines: [fam.line, fam.general, ...(w === 'x' ? [] : [`\\text{Solve for } x: \\quad x = \\frac{1}{${valueTex(k)}}\\left(\\text{each value}${b > 0 ? ` - ${angleTex(b)}` : b < 0 ? ` + ${angleTex(-b)}` : ''}\\right)`])] });
      good.forEach((x) => candidates.push(x));
    }
  }
  let numeric = false;
  if (!method) {
    numeric = true;
    steps.push({ title: 'Solve numerically', depth: 0, lines: ['\\text{No exact rule fits, so the solutions in } [0, 2\\pi) \\text{ are found by scanning and bisection.}'] });
  }
  // Solutions in [0, 2π)
  const inRange = [];
  const push = (x) => { const y = ((x % TWO_PI) + TWO_PI) % TWO_PI; const z = Math.abs(y - TWO_PI) < 1e-9 ? 0 : y; if (Math.abs(f(z)) < 1e-7 && !inRange.some((q) => Math.abs(q - z) < 1e-7)) inRange.push(z); };
  if (numeric) {
    // a quick numeric root finder on [0, 2π)
    const n = 6000, xs = Array.from({ length: n + 1 }, (_, i) => (TWO_PI * i) / n);
    for (let i = 0; i < n; i++) {
      let lo = xs[i], hi = xs[i + 1], flo = f(lo), fhi = f(hi);
      if (!Number.isFinite(flo) || !Number.isFinite(fhi)) continue;
      if (Math.abs(flo) < 1e-12) { push(lo); continue; }
      if (flo * fhi > 0) continue;
      for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2, fm = f(m); if (flo * fm <= 0) hi = m; else { lo = m; flo = fm; } }
      push((lo + hi) / 2);
    }
  } else candidates.forEach(push);
  inRange.sort((p, q) => p - q);
  if (inRange.length > 24) inRange.length = 24;
  steps.push({ title: 'Solutions in [0, 2π)', depth: 0, lines: [inRange.length ? `x = ${inRange.map(angleTex).join(', \\ ')}` : '\\text{none}', ...(inRange.length ? [`\\text{In degrees: } ${inRange.map(degText).join(', ').replace(/°/g, '^\\circ')}`] : [])] });
  const generals = families.filter((x) => x.ok).map((x) => x.general);
  const verified = inRange.every((x) => Math.abs(f(x)) < 1e-7);
  return {
    generals, inRange: inRange.map(angleTex), degrees: inRange.map(degText), numeric, steps, verified,
    notes: [numeric ? 'Solved numerically: these are the solutions between 0 and 2π only.' : 'n is any integer (…, −2, −1, 0, 1, 2, …). Every family was checked in the original equation.'],
    result: inRange.map((x) => Number(x.toFixed(6))),
  };
}
