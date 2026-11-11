/**
 * Inverse Z-transform: the maths for /inverse-z-transform (Unit 13).
 *   Partial fractions of F(z)/z, then z/(z − p) ↔ pⁿ, z/(z − p)² ↔ n p^{n−1}, z/(z − p)³ ↔ n(n − 1)p^{n−2}/2;
 *   complex poles come in pairs and give rⁿ cos(nθ + φ). Long division in powers of 1/z gives x(0), x(1), …
 *   directly, and is used as the check (and as the second method).
 */
import { EngineError } from '../numeric/steps';
import { polish, tidy } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readZ, cTex, cText } from '../symbolic/complex';
import { inverseZ, longDivision, tidyZ, fracTex } from '../symbolic/ztransform';

const close = (a, b) => Math.hypot(a.re - b.re, a.im - b.im) < 1e-6 * Math.max(1, Math.hypot(b.re, b.im));

export function solve({ F, terms = '6' }) {
  const node = readZ(F, 'F(z)');
  const count = Math.max(3, Math.min(12, Math.round(Number(terms) || 6)));
  const tidyF = tidyZ(node);
  const r = inverseZ(node);
  const ld = longDivision(node, count);
  if (!ld) throw new EngineError('F(z) must be a fraction of polynomials in z.');
  const steps = [
    { title: 'The function', depth: 0, lines: [`F(z) = ${fracTex(tidyF)}`] },
    { title: 'Partial fractions of F(z)/z', formula: '\\frac{z}{z - p} \\leftrightarrow p^n, \\quad \\frac{z}{(z - p)^2} \\leftrightarrow n\\,p^{n-1}', depth: 0, lines: [...r.lines, '\\text{multiply back by } z \\text{ and read off each term}'] },
    { title: 'Inverse', depth: 0, lines: [`x(n) = ${r.xTex}, \\quad n \\ge 0`] },
    { title: 'Long division (powers of 1/z)', formula: 'F(z) = x(0) + x(1)z^{-1} + x(2)z^{-2} + \\cdots', depth: 0, lines: [`F(z) = ${ld.map((v, n) => { if (Math.hypot(v.re, v.im) < 1e-12) return null; const c = cTex(v); const k = /[+-]/.test(c.slice(1)) ? `\\left(${c}\\right)` : c; return !n ? c : `${k === '1' ? '' : k === '-1' ? '-' : k}z^{-${n}}`; }).filter(Boolean).join(' + ').replace(/\+ -/g, '- ') || '0'} + \\cdots`] },
  ];
  const table = { columns: [{ key: 'n', label: 'n', bold: true }, { key: 'f', label: 'x(n) from the formula', highlight: true }, { key: 'ld', label: 'x(n) by long division' }], rows: ld.map((v, n) => ({ n, f: cText(r.at(n)), ld: cText(v) })) };
  const verified = ld.every((v, n) => close(r.at(n), v));
  return { Ftex: mtex(polish(tidy(node))), xTex: r.xTex, steps, table, notes: [], verified, result: r.xTex };
}
