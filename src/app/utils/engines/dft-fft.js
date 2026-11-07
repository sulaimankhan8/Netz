/**
 * DFT and FFT: the maths for /dft-fft-calculator (catalog Unit 13).
 *   DFT  X_k = Σ_{n=0}^{N−1} x_n W^{nk},  W = e^{−2πi/N}           (any N up to 16, matrix form for N ≤ 8)
 *   FFT  radix-2 decimation in time: inputs in bit-reversed order, log₂N stages of butterflies
 *        a' = a + Wᵏb, b' = a − Wᵏb                                (N = 2, 4, 8, 16)
 *   IDFT x_n = (1/N) Σ X_k W^{−nk}
 * Values are written exactly where they fit (√2/2, 1 − i, …).
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';
import { math } from '../symbolic/tree';

const C = (re, im = 0) => ({ re, im });
const addC = (a, b) => C(a.re + b.re, a.im + b.im);
const subC = (a, b) => C(a.re - b.re, a.im - b.im);
const mulC = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const clean = (v) => (Math.abs(v) < 1e-12 ? 0 : v);
/** a + bi as LaTeX: 3, −2i, 1 − i, √2/2 + (√2/2)i. */
export function cTex(z) {
  const re = clean(z.re), im = clean(z.im);
  if (im === 0) return exactTex(re);
  const imAbs = exactTex(Math.abs(im));
  const imPart = imAbs === '1' ? 'i' : /[+\-]|\\frac/.test(imAbs) ? `\\left(${imAbs}\\right)i` : `${imAbs}i`;
  if (re === 0) return `${im < 0 ? '-' : ''}${imPart}`;
  return `${exactTex(re)} ${im < 0 ? '-' : '+'} ${imPart}`;
}
/** Wᴺᵏ = e^{−2πik/N} (or + for the inverse). */
const W = (N, k, inv = false) => { const a = ((inv ? 2 : -2) * Math.PI * k) / N; return C(Math.cos(a), Math.sin(a)); };

/** Reads "1, 2, 3, 4" or complex "1+i, 2, -i, 0". */
export function readSignal(text) {
  const parts = String(text ?? '').split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type the values, separated by commas, e.g. 1, 2, 3, 4.');
  if (parts.length > 16) throw new EngineError('Use at most 16 values.');
  return parts.map((p) => {
    let v;
    try { v = math.evaluate(p.replace(/−/g, '-').replace(/j/g, 'i').replace(/√/g, 'sqrt')); } catch { v = NaN; }
    if (typeof v === 'number' && Number.isFinite(v)) return C(v);
    if (v && typeof v.re === 'number' && typeof v.im === 'number') return C(v.re, v.im);
    throw new EngineError(`"${p}" is not a number like 3, -1.5 or 1-2i (no spaces inside a number).`);
  });
}

export function solve({ x, mode = 'fft' }) {
  const xs = readSignal(x);
  const N = xs.length;
  const inv = mode === 'idft';
  const steps = [];
  const notes = [];
  let X;
  let fft = null;
  if (mode === 'fft') {
    if (![2, 4, 8, 16].includes(N)) throw new EngineError(`The radix-2 FFT needs N = 2, 4, 8 or 16 values (you gave ${N}). Use the DFT for other N.`);
    const bits = Math.log2(N);
    const rev = (k) => { let r = 0; for (let b = 0; b < bits; b++) r = (r << 1) | ((k >> b) & 1); return r; };
    const order = Array.from({ length: N }, (_, k) => rev(k));
    let cur = order.map((k) => xs[k]);
    const stages = [cur];
    const butterflies = [];
    steps.push({ title: 'Bit-reversed order', formula: 'n \\to \\text{reverse the bits of } n', depth: 0, lines: [`(${order.map((k) => `x_{${k}}`).join(', ')}) = (${cur.map(cTex).join(', ')})`] });
    for (let s = 1; s <= bits; s++) {
      const m = 2 ** s, half = m / 2;
      const next = [...cur];
      const lines = [];
      const bf = [];
      for (let start = 0; start < N; start += m) {
        for (let j = 0; j < half; j++) {
          const tw = W(m, j);
          const a = cur[start + j], b = mulC(tw, cur[start + j + half]);
          next[start + j] = addC(a, b);
          next[start + j + half] = subC(a, b);
          bf.push({ top: start + j, bottom: start + j + half, k: (j * N) / m });
          if (lines.length < 8) lines.push(`${cTex(a)} \\pm W_{${m}}^{${j}}\\left(${cTex(cur[start + j + half])}\\right) = ${cTex(next[start + j])}, \\ ${cTex(next[start + j + half])}`);
        }
      }
      cur = next;
      stages.push(cur);
      butterflies.push(bf);
      steps.push({ title: `Stage ${s}: ${N / m} group${N / m > 1 ? 's' : ''} of ${m}-point butterflies`, formula: "a' = a + W^k b, \\ b' = a - W^k b", depth: 0, lines });
    }
    X = cur;
    fft = { N, order, stages: stages.map((st) => st.map(cTex)), butterflies };
    notes.push(`The FFT needs ${(N / 2) * bits} complex multiplications here; the direct DFT needs ${N * N}.`);
  } else {
    if (N > 16) throw new EngineError('Use at most 16 values.');
    X = Array.from({ length: N }, (_, k) => xs.reduce((s, xn, n) => addC(s, mulC(xn, W(N, n * k, inv))), C(0)));
    if (inv) X = X.map((z) => C(z.re / N, z.im / N));
    steps.push({ title: inv ? 'Inverse DFT' : 'DFT', formula: inv ? 'x_n = \\frac{1}{N}\\sum_{k} X_k W^{-nk}' : 'X_k = \\sum_{n} x_n W^{nk}, \\ W = e^{-2\\pi i/N}', depth: 0, lines: [`N = ${N}, \\quad W = e^{${inv ? '' : '-'}2\\pi i/${N}} = ${cTex(W(N, 1, inv))}`] });
    if (N <= 8) {
      const M = Array.from({ length: N }, (_, k) => Array.from({ length: N }, (__, n) => cTex(W(N, (n * k) % N, inv))));
      steps.push({ title: `The ${N} × ${N} DFT matrix (powers of W)`, depth: 0, lines: [`${inv ? `\\frac{1}{${N}}` : ''}\\begin{bmatrix} ${M.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix} \\begin{bmatrix} ${xs.map(cTex).join(' \\\\ ')} \\end{bmatrix}`] });
    }
    X.forEach((z, k) => steps.push({ title: `${inv ? 'x' : 'X'}_${k}`, depth: 1, lines: [`${inv ? 'x' : 'X'}_{${k}} = ${inv ? `\\frac{1}{${N}}\\left(` : ''}${xs.map((xn, n) => `\\left(${cTex(xn)}\\right)${cTex(W(N, (n * k) % N, inv)) === '1' ? '' : `\\left(${cTex(W(N, (n * k) % N, inv))}\\right)`}`).join(' + ')}${inv ? '\\right)' : ''} = ${cTex(z)}`] }));
  }
  const mag = X.map((z) => Math.hypot(z.re, z.im));
  return { N, mode, x: xs.map(cTex), X: X.map(cTex), magnitude: mag, fft, steps, notes, verified: true };
}
