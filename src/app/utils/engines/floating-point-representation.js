/**
 * IEEE-754 floating point: the maths for /floating-point-representation (Units 1–5).
 *   value = (−1)^s × 1.f × 2^{e − bias}   (single: 8 exponent bits, bias 127, 23 fraction bits;
 *                                           double: 11 bits, bias 1023, 52 bits)
 *   The number is written in binary, normalised, rounded to the nearest representable value (ties to even), and the
 *   rounding error is shown: absolute, relative, and against machine epsilon 2^{−p}.
 */
import { EngineError } from '../numeric/steps';
import { ieee } from '../numeric/extras';

/** exact decimal of a binary64 number (enough digits) */
const full = (v) => (Number.isInteger(v) ? String(v) : v.toPrecision(20).replace(/0+$/, '').replace(/\.$/, ''));

/** binary expansion of a positive decimal: integer part and up to `frac` fraction bits */
function binary(x, frac = 30) {
  const ip = Math.floor(x);
  let f = x - ip;
  let s = '';
  for (let i = 0; i < frac && f > 0; i++) { f *= 2; const b = Math.floor(f); s += b; f -= b; }
  return { int: ip.toString(2), frac: s, more: f > 0 };
}

export function solve({ x: xt, format = 'single' }) {
  const t = String(xt ?? '').trim();
  if (!t) throw new EngineError('Type a number, like 0.1 or -13.625.');
  const x = Number(t);
  if (!Number.isFinite(x)) throw new EngineError(`"${t}" is not a number.`);
  const bits = format === 'double' ? 64 : 32;
  const L = ieee(x, bits);
  const p = bits === 32 ? 23 : 52;
  const steps = [];
  const ax = Math.abs(x);
  if (ax === 0) {
    steps.push({ title: 'Zero', depth: 0, lines: ['\\text{every exponent and fraction bit is 0}'] });
  } else {
    const bn = binary(ax);
    steps.push({ title: 'Write it in binary', depth: 0, lines: [`${ax} = ${bn.int}.${bn.frac || '0'}${bn.more ? '\\ldots' : ''}_{2}`] });
    const e = L.e === 0 ? 1 - L.bias : L.e - L.bias;
    steps.push({ title: L.e === 0 ? 'Subnormal' : 'Normalise', formula: '1.f \\times 2^{E}', depth: 0, lines: [L.e === 0 ? `\\text{too small for the normal range: } 0.f \\times 2^{${e}}` : `${ax} = 1.${L.man.replace(/0+$/, '') || '0'}_{2} \\times 2^{${e}}`] });
    steps.push({ title: 'Exponent', formula: `e = E + ${L.bias}`, depth: 0, lines: [`e = ${e} + ${L.bias} = ${L.e} = ${L.exp}_{2}`] });
  }
  steps.push({ title: 'The bits', depth: 0, lines: [`\\text{sign } ${L.sign} \\quad | \\quad \\text{exponent } ${L.exp} \\quad | \\quad \\text{fraction } ${L.man}`, `\\text{hex: } ${L.hex}`] });
  const err = L.stored - x;
  const rel = x !== 0 ? Math.abs(err / x) : 0;
  const eps = 2 ** -p;
  steps.push({ title: 'Rounding error', formula: `|\\text{rel. error}| \\le \\varepsilon/2, \\ \\varepsilon = 2^{-${p}}`, depth: 0, lines: [`\\text{stored} = ${full(L.stored)}`, `\\text{error} = ${err === 0 ? '0 \\ (\\text{exact})' : err.toExponential(4).replace(/e([+-]\d+)/, ' \\times 10^{$1}')}`, `\\text{relative} = ${rel === 0 ? '0' : rel.toExponential(4).replace(/e([+-]\d+)/, ' \\times 10^{$1}')}, \\quad \\varepsilon = ${eps.toExponential(4).replace(/e([+-]\d+)/, ' \\times 10^{$1}')}`] });
  return { format, sign: L.sign, exponent: L.exp, fraction: L.man, hex: L.hex, stored: full(L.stored), error: err, exact: err === 0, steps, notes: err === 0 ? ['This number is stored exactly: its binary expansion ends within the fraction bits.'] : ['The binary expansion does not end (or is too long), so the nearest representable number is stored.'], // subnormals have a fixed step 2^{−149} (or 2^{−1074}), so the bound there is on the absolute error
    verified: L.e === 0 && x !== 0 ? Math.abs(err) <= 2 ** (bits === 32 ? -150 : -1075) * 1.0000001 : rel <= eps / 2 + 1e-30, result: L.hex };
}
