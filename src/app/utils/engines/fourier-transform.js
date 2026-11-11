/**
 * Fourier transforms: the maths for /fourier-transform (Unit 13).
 *   complex  F(ω) = ∫_{−∞}^{∞} f(x) e^{−iωx} dx = A(ω) − iB(ω),  A = ∫ f cos ωx,  B = ∫ f sin ωx
 *   sine     F_s(ω) = ∫_0^∞ f(x) sin ωx dx;   cosine  F_c(ω) = ∫_0^∞ f(x) cos ωx dx
 *   inverse  f(x) = (1/2π) ∫ F(ω) e^{iωx} dω  (the Fourier integral);  f = (2/π) ∫_0^∞ F_s sin ωx dω, same for F_c
 * f is one expression or pieces ("1 for |x| < 1"), zero outside. Finite pieces are integrated with ω as a letter.
 * Pieces running to ∞ must be P(x)e^{−ax} from 0 (or from −∞ to 0), using ∫_0^∞ xᵏe^{−ax}e^{−iωx}dx = k!/(a + iω)^{k+1}.
 * The Gaussian c·e^{−ax²} has F = c√(π/a) e^{−ω²/4a}. Every answer is checked by numerical integration at two ω.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, neg, paren, polish, tidy, tex } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti } from '../symbolic/multi';
import { substitute, gaussLegendre } from '../symbolic/iterated';
import { integrate, polyNode } from '../symbolic/integral';
import { numNode } from '../symbolic/ode';

const X = sym('x'), W = sym('w');
const INF = /^(\+?inf(inity)?|∞|oo)$/i;
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const bound = (t) => {
  const s = String(t).trim();
  if (INF.test(s)) return Infinity;
  if (/^-\s*(inf(inity)?|∞|oo)$/i.test(s)) return -Infinity;
  let v;
  try { v = math.evaluate(s.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`"${s}" is not a number (write a number, pi or inf).`);
  return v;
};
const snap = (v) => { if (Math.abs(v) < 1e-12) return 0; const f = toFraction(v, 1000, 1e-9); return f ? f.n / f.d : v; };

/** "1 for |x| < 1; x for 0 < x < 2; e^(-x) for x > 0" → [{ g, lo, hi }]. One expression → the whole range. */
export function readPieces(text, mode) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type f(x), e.g. "1 for |x| < 1" or e^(-|x|).');
  if (parts.length > 6) throw new EngineError('Use at most 6 pieces.');
  const out = parts.map((p) => {
    const m = p.match(/^(.+?)\s+(?:for|if|when)\s+(.+)$/);
    const g = readMulti((m ? m[1] : p).replace(/\|x\|/g, 'abs(x)'), 'f(x)');
    if (!m) return { g, lo: mode === 'complex' ? -Infinity : 0, hi: Infinity };
    const c = m[2].replace(/\s+/g, ' ').replace(/≤|<=/g, '<').replace(/≥|>=/g, '>').trim();
    let r;
    if ((r = c.match(/^\|\s*x\s*\|\s*<\s*(.+)$/))) { const a = bound(r[1]); return { g, lo: -a, hi: a }; }
    if ((r = c.match(/^(.+?)\s*<\s*x\s*<\s*(.+)$/))) return { g, lo: bound(r[1]), hi: bound(r[2]) };
    if ((r = c.match(/^x\s*>\s*(.+)$/))) return { g, lo: bound(r[1]), hi: Infinity };
    if ((r = c.match(/^x\s*<\s*(.+)$/))) return { g, lo: -Infinity, hi: bound(r[1]) };
    throw new EngineError(`Write each piece like "1 for |x| < 1", "x for 0 < x < 2" or "e^(-x) for x > 0" (could not read "${m[2]}").`);
  });
  for (const p of out) {
    if (!(p.hi > p.lo)) throw new EngineError('Each piece needs its lower end below its upper end.');
    p.g.traverse((n) => { if (n.isSymbolNode && !n.isFunctionNode && !['x', 'pi', 'e'].includes(n.name) && !(n.name in math && typeof math[n.name] === 'function')) throw new EngineError(`f(x) may use only x (it uses ${n.name}). Put numbers in for constants like a.`); });
  }
  if (mode !== 'complex' && out.some((p) => p.lo < 0)) throw new EngineError('Sine and cosine transforms use f on 0 < x < ∞ only.');
  // |x|: split at 0 and write it as x or −x
  const split = [];
  for (const p of out) {
    let hasAbs = false;
    p.g.traverse((n) => { if (n.isFunctionNode && n.fn.name === 'abs') hasAbs = true; });
    const noAbs = (sgn) => p.g.transform((n) => (n.isFunctionNode && n.fn.name === 'abs' ? (sgn > 0 ? paren(n.args[0]) : neg(paren(n.args[0]))) : n));
    if (!hasAbs) { split.push(p); continue; }
    if (p.lo < 0 && p.hi > 0) { split.push({ g: noAbs(-1), lo: p.lo, hi: 0 }, { g: noAbs(1), lo: 0, hi: p.hi }); }
    else split.push({ g: noAbs(p.lo >= 0 ? 1 : -1), lo: p.lo, hi: p.hi });
  }
  return { pieces: split, shown: out };
}

/** g = P(x)·e^{bx}: { b, P (ascending coefficients) } by sampling, or null. */
function polyExp(g) {
  let b = 0, found = false;
  g.traverse((n) => {
    const ex = n.isFunctionNode && n.fn.name === 'exp' ? n.args[0] : n.isOperatorNode && n.fn === 'pow' && n.args[0].isSymbolNode && n.args[0].name === 'e' ? n.args[1] : null;
    if (!ex) return;
    const s = evalAt(ex, { x: 1 }) - evalAt(ex, { x: 0 });
    if (Math.abs(evalAt(ex, { x: 2.3 }) - evalAt(ex, { x: 0 }) - 2.3 * s) > 1e-9) { found = NaN; return; }
    b += s; found = true;
  });
  if (Number.isNaN(found)) return null;
  const h = (x) => evalAt(g, { x }) * Math.exp(-b * x);
  // fit a polynomial of degree ≤ 4 through 5 points, check at two more
  const xs = [0, 0.5, 1, 1.5, 2], ys = xs.map(h);
  if (!ys.every(Number.isFinite)) return null;
  const n = xs.length;
  const A = xs.map((x) => Array.from({ length: n }, (_, k) => x ** k));
  const c = solveLinear(A, ys);
  if (!c) return null;
  const P = c.map(snap);
  while (P.length > 1 && Math.abs(P.at(-1)) < 1e-10) P.pop();
  const ok = [0.73, 2.9, 3.7].every((x) => Math.abs(P.reduceRight((s, k) => s * x + k, 0) - h(x)) < 1e-7 * Math.max(1, Math.abs(h(x))));
  return ok ? { b: snap(b), P } : null;
}
function solveLinear(A, y) {
  const n = y.length, M = A.map((r, i) => [...r, y[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    if (Math.abs(M[p][i]) < 1e-14) return null;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/**
 * ∫ over a half line of P(x)e^{bx}e^{−iωx}: as { re, im } nodes in w.
 * (0, ∞), b = −a < 0:  Σ c_k k!/(a + iω)^{k+1} = Σ c_k k!(a − iω)^{k+1}/(a² + ω²)^{k+1}
 * (−∞, 0), b = a > 0:   x = −t gives Σ c_k (−1)^k k!/(a − iω)^{k+1} = Σ c_k(−1)^k k!(a + iω)^{k+1}/(a² + ω²)^{k+1}
 */
function halfLine(pe, side) {
  const a = side > 0 ? -pe.b : pe.b;
  if (!(a > 0)) throw new EngineError(side > 0 ? 'On x > 0 the function must die away, like e^(-2x) or x e^(-x).' : 'On x < 0 the function must die away, like e^(3x).');
  let re = null, im = null;
  const plus = (s, t) => (s ? add(s, t) : t);
  pe.P.forEach((ck, k) => {
    if (Math.abs(ck) < 1e-14) return;
    const coef = ck * fact(k) * (side > 0 ? 1 : (-1) ** k);
    // (a ∓ iω)^{k+1} = Σ_j C(k+1, j) a^{k+1−j} (∓iω)^j : real part from even j, imaginary from odd j
    const reC = [], imC = [];
    for (let j = 0; j <= k + 1; j++) {
      const term = binom(k + 1, j) * a ** (k + 1 - j) * (side > 0 ? -1 : 1) ** j;
      // i^j: 1, i, −1, −i
      const ij = j % 4;
      reC[j] = ij === 0 ? term : ij === 2 ? -term : 0;
      imC[j] = ij === 1 ? term : ij === 3 ? -term : 0;
    }
    const den = pow(paren(add(num(a * a), pow(W, num(2)))), num(k + 1));
    const R = div(mul(numNode(coef), paren(polyNode(reC, 'w'))), den);
    const I = imC.some((v) => Math.abs(v) > 1e-14) ? div(mul(numNode(coef), paren(polyNode(imC, 'w'))), den) : null;
    re = plus(re, R); if (I) im = plus(im, I);
  });
  return { re: re || num(0), im: im || num(0) };
}

/** ∫_lo^hi g(x)·k(ωx) dx with k = cos or sin, for finite ends, with ω as a letter. */
function finite(g, lo, hi, kern) {
  const integrand = tidy(mul(paren(g), fn(kern, mul(W, X))));
  let r;
  try { r = integrate(integrand, 'x'); } catch { throw new EngineError(`NETZ can't integrate ${tex(polish(integrand))} yet.`); }
  const F = r.result;
  const val = add(substitute(F, 'x', numNode(hi)), neg(paren(substitute(F, 'x', numNode(lo)))));
  return parity(val);
}

/** sin(−kω) → −sin(kω), cos(−kω) → cos(kω), so the two ends combine (sin ω − sin(−ω) = 2 sin ω). */
function parity(node) {
  return node.transform((m) => {
    if (!(m.isFunctionNode && ['sin', 'cos'].includes(m.fn.name))) return m;
    const k = evalAt(m.args[0], { w: 1 });
    if (!(k < 0) || Math.abs(evalAt(m.args[0], { w: 2.5 }) - 2.5 * k) > 1e-12) return m;
    const arg = Math.abs(k + 1) < 1e-12 ? W : mul(numNode(-k), W);
    return m.fn.name === 'sin' ? neg(fn('sin', arg)) : fn('cos', arg);
  });
}

/** Numerical ∫ f(x) k(ωx) over the pieces (the check). */
function numeric(pieces, w, kern) {
  const { xs, ws } = gaussLegendre(24);
  let s = 0;
  for (const p of pieces) {
    const lo = Number.isFinite(p.lo) ? p.lo : -60, hi = Number.isFinite(p.hi) ? p.hi : 60;
    const n = 400;
    for (let k = 0; k < n; k++) {
      const A = lo + ((hi - lo) * k) / n, B = lo + ((hi - lo) * (k + 1)) / n, c = (A + B) / 2, h = (B - A) / 2;
      for (let i = 0; i < xs.length; i++) { const x = c + h * xs[i]; const v = evalAt(p.g, { x }) * Math[kern](w * x); if (Number.isFinite(v)) s += ws[i] * h * v; }
    }
  }
  return s;
}

const omega = (node) => node.transform((n) => (n.isSymbolNode && n.name === 'w' ? sym('omega') : n));
const showTex = (node) => node.netzTex || mtex(omega(node)).replace(/\\mathrm\{omega\}/g, '\\omega');
const neat = (node) => { try { return tidyMulti(node, ['w']); } catch { return node; } };
const isZero = (node) => [0.7, 1.9, 3.1].every((w) => Math.abs(evalAt(node, { w })) < 1e-12);

export function solve({ mode = 'complex', f }) {
  if (!['complex', 'sine', 'cosine'].includes(mode)) throw new EngineError('Pick the complex, sine or cosine transform.');
  const { pieces, shown } = readPieces(f, mode);
  const steps = [];
  const rangeTex = (p) => `${Number.isFinite(p.lo) ? exactTex(p.lo) : '-\\infty'} < x < ${Number.isFinite(p.hi) ? exactTex(p.hi) : '\\infty'}`;
  steps.push({ title: 'The function', depth: 0, lines: [`f(x) = ${shown.length === 1 && !Number.isFinite(shown[0].lo) && !Number.isFinite(shown[0].hi) ? mtex(polish(shown[0].g)) : `\\begin{cases} ${shown.map((p) => `${mtex(polish(p.g))} & ${rangeTex(p)}`).join(' \\\\ ')} \\\\ 0 & \\text{otherwise} \\end{cases}`}`] });
  const defn = { complex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-i\\omega x}\\,dx = \\int f\\cos\\omega x\\,dx - i\\int f\\sin\\omega x\\,dx', sine: 'F_s(\\omega) = \\int_0^{\\infty} f(x)\\sin\\omega x\\,dx', cosine: 'F_c(\\omega) = \\int_0^{\\infty} f(x)\\cos\\omega x\\,dx' }[mode];
  steps.push({ title: 'Definition', depth: 0, lines: [defn] });

  // Gaussian c e^{−ax²} on the whole range (complex) or (0, ∞) (cosine)
  const one = shown.length === 1 && pieces.length === 1 ? pieces[0] : null;
  const whole = one && ((mode === 'complex' && one.lo === -Infinity && one.hi === Infinity) || (mode !== 'complex' && one.lo === 0 && one.hi === Infinity));
  let A = null, B = null, gauss = null;
  if (whole) {
    const c = evalAt(one.g, { x: 0 });
    const a = c ? -Math.log(evalAt(one.g, { x: 1 }) / c) : NaN;
    if (a > 0 && [0.5, 1.7, 2.4].every((x) => Math.abs(evalAt(one.g, { x }) - c * Math.exp(-a * x * x)) < 1e-9 * Math.max(1, Math.abs(c)))) gauss = { c: snap(c), a: snap(a) };
  }
  if (gauss) {
    if (mode === 'sine') throw new EngineError('The sine transform of e^(-ax²) is not an elementary function; try the cosine or complex transform.');
    const k = mode === 'complex' ? 1 : 0.5;
    // c√(π/a) e^{−ω²/4a}
    A = mul(mul(numNode(gauss.c * k), fn('sqrt', div(sym('pi'), numNode(gauss.a)))), fn('exp', neg(div(pow(W, num(2)), numNode(4 * gauss.a)))));
    const ck = snap(gauss.c * k);
    A.netzTex = `${ck === 1 ? '' : `${exactTex(ck)}\\,`}${gauss.a === 1 ? '\\sqrt{\\pi}' : `\\sqrt{\\frac{\\pi}{${exactTex(gauss.a)}}}`}\\,e^{-\\frac{\\omega^{2}}{${exactTex(snap(4 * gauss.a))}}}`;
    B = num(0);
    steps.push({ title: 'Gaussian integral', formula: '\\int_{-\\infty}^{\\infty} e^{-ax^2}e^{-i\\omega x}dx = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\omega^2/4a}', depth: 0, lines: [`a = ${exactTex(gauss.a)}${mode === 'cosine' ? ', \\ F_c \\text{ is half of the whole-line integral (f is even)}' : ''}`] });
  } else {
    const kernels = mode === 'complex' ? ['cos', 'sin'] : [mode === 'sine' ? 'sin' : 'cos'];
    const acc = { cos: null, sin: null };
    const plus = (s, t) => (s ? add(s, t) : t);
    for (const p of pieces) {
      const lines = [];
      if (Number.isFinite(p.lo) && Number.isFinite(p.hi)) {
        for (const k of kernels) {
          const v = neat(finite(p.g, p.lo, p.hi, k));
          acc[k] = plus(acc[k], v);
          lines.push(`\\int_{${exactTex(p.lo)}}^{${exactTex(p.hi)}} ${mtex(polish(p.g))}\\,\\${k}\\omega x\\,dx = ${showTex(v)}`);
        }
      } else {
        const side = p.hi === Infinity ? 1 : -1;
        if ((side > 0 && Math.abs(p.lo) > 1e-12) || (side < 0 && Math.abs(p.hi) > 1e-12)) throw new EngineError('A piece running to infinity must start at 0 (x > 0 or x < 0).');
        const pe = polyExp(p.g);
        if (!pe) throw new EngineError(`On an infinite range NETZ handles a polynomial times e^(-ax) (or the Gaussian e^(-ax²)); ${mtex(polish(p.g))} is not one.`);
        const h = halfLine(pe, side);
        // e^{−iωx} = cos − i sin: ∫ f cos = Re, ∫ f sin = −Im
        const cosV = neat(h.re), sinV = neat(neg(paren(h.im)));
        if (kernels.includes('cos')) acc.cos = plus(acc.cos, cosV);
        if (kernels.includes('sin')) acc.sin = plus(acc.sin, sinV);
        lines.push(`\\int_{${side > 0 ? '0' : '-\\infty'}}^{${side > 0 ? '\\infty' : '0'}} x^k e^{${side > 0 ? '-' : ''}ax}e^{-i\\omega x}dx = \\frac{${side > 0 ? '' : '(-1)^k'}k!}{(a ${side > 0 ? '+' : '-'} i\\omega)^{k+1}}, \\ a = ${exactTex(side > 0 ? -pe.b : pe.b)}`);
        for (const k of kernels) lines.push(`\\int ${mtex(polish(p.g))}\\,\\${k}\\omega x\\,dx = ${showTex(k === 'cos' ? cosV : sinV)}`);
      }
      steps.push({ title: `On ${rangeTex(p).replace(/\\infty/g, '∞').replace(/\\/g, '')}`, depth: 1, lines });
    }
    A = acc.cos ? neat(acc.cos) : num(0);
    B = acc.sin ? neat(acc.sin) : num(0);
  }

  // The answer
  let F, Ftex;
  if (mode === 'complex') {
    const aZ = isZero(A), bZ = isZero(B);
    const aT = showTex(A), bT = showTex(B);
    Ftex = aZ && bZ ? '0' : bZ ? aT : aZ ? `-i\\left(${bT}\\right)` : `${aT} - i\\left(${bT}\\right)`;
    F = { A, B };
    steps.push({ title: 'Put it together', depth: 0, lines: [`A(\\omega) = \\int f\\cos\\omega x\\,dx = ${aZ ? '0' : aT}`, `B(\\omega) = \\int f\\sin\\omega x\\,dx = ${bZ ? '0 \\ (f \\text{ is even})' : bT}${aZ && !bZ ? ' \\ (A = 0: f \\text{ is odd})' : ''}`, `F(\\omega) = A(\\omega) - iB(\\omega) = ${Ftex}`] });
    steps.push({ title: 'Fourier integral (inverse)', depth: 0, lines: ['f(x) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} F(\\omega)\\,e^{i\\omega x}\\,d\\omega', '\\text{at a jump, the integral gives the average of the two sides}'] });
  } else {
    const V = mode === 'sine' ? B : A;
    Ftex = showTex(V);
    F = { V };
    steps.push({ title: 'Answer', depth: 0, lines: [`${mode === 'sine' ? 'F_s' : 'F_c'}(\\omega) = ${Ftex}`, `f(x) = \\frac{2}{\\pi}\\int_0^{\\infty} ${mode === 'sine' ? 'F_s(\\omega)\\sin' : 'F_c(\\omega)\\cos'}\\omega x\\,d\\omega`] });
  }

  // Check at two ω, and F at ω = 0 (often a 0/0 limit in the formula)
  const ws = [0.7, 1.9];
  const fA = (w) => evalAt(A, { w }), fB = (w) => evalAt(B, { w });
  const verified = ws.every((w) => {
    const okA = mode === 'sine' || Math.abs(numeric(pieces, w, 'cos') - fA(w)) < 1e-5 * Math.max(1, Math.abs(fA(w)));
    const okB = mode === 'cosine' || Math.abs(numeric(pieces, w, 'sin') - fB(w)) < 1e-5 * Math.max(1, Math.abs(fB(w)));
    return okA && okB;
  });
  const notes = [];
  if (mode !== 'sine') {
    const at0 = numeric(pieces, 0, 'cos');
    if (!Number.isFinite(fA(0))) notes.push(`At ω = 0 the formula is a 0/0 limit: ${mode === 'complex' ? 'F(0)' : 'F_c(0)'} = ∫ f dx = ${exactTex(snap(at0)).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')}.`);
  }
  // spectrum: |F(ω)| (or F_s, F_c) on −8 … 8
  const amp = (w) => (mode === 'complex' ? Math.hypot(fA(w), fB(w)) : mode === 'sine' ? fB(w) : fA(w));
  const pts = [];
  for (let k = 0; k <= 160; k++) { const w = -8 + k / 10 + (k === 80 ? 1e-6 : 0); const y = amp(w); if (Number.isFinite(y)) pts.push({ x: w, y }); }
  const segments = pts.slice(1).map((p, i) => [pts[i], p]);
  const ys = pts.map((p) => p.y);
  const y0 = Math.min(0, ...ys), y1 = Math.max(0.5, ...ys);
  const plot = { points: [], segments, view: { x0: -8, x1: 8, y0: y0 - 0.1 * (y1 - y0), y1: y1 + 0.1 * (y1 - y0) } };
  return { mode, Ftex, F, steps, notes, verified, plot, result: Ftex };
}
