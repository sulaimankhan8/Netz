/**
 * LaTeX for numbers and matrices, shared by engines and pages (no React here).
 */
import { sig } from '../numberFormat';
import { toFraction } from './fraction';

/** A number as LaTeX: a fraction when it is exactly one (and `fractions` is on), else up to 6 significant figures. */
export function texNumber(v, fractions = true) {
  if (fractions) {
    const f = toFraction(v);
    if (f && f.d !== 1) return `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
    if (f) return String(f.n);
  }
  return sig(v).replace('e', '\\times10^{').replace(/\{([+-]?\d+)$/, '{$1}');
}

/** LaTeX for a matrix. bars: '[' brackets or '|' determinant bars. divider: draw a line after this many columns. */
export function matrixTex(M, { bars = '[', divider = null, fractions = true } = {}) {
  const cols = M[0]?.length || 0;
  const spec = Array.from({ length: cols }, (_, j) => (divider && j === divider ? '|c' : 'c')).join('');
  const body = M.map((row) => row.map((v) => (typeof v === 'number' ? texNumber(v, fractions) : v)).join(' & ')).join(' \\\\ ');
  const [l, r] = bars === '|' ? ['|', '|'] : ['[', ']'];
  return `\\left${l}\\begin{array}{${spec}} ${body} \\end{array}\\right${r}`;
}
