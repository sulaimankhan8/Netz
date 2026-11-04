/**
 * Permutations and combinations: the maths for /permutations-and-combinations.
 * Uses BigInt, so answers stay exact however big (25! has 26 digits).
 *   factorial n!, nPr = n!/(n − r)!, nCr = n!/(r!(n − r)!), circular (n − 1)! (or ÷ 2 for necklaces),
 *   with repetition: nʳ arrangements, C(n + r − 1, r) selections; words with repeated letters n!/(p!q!…)
 */
import { EngineError } from '../numeric/steps';
import { requireNumber } from '../numeric/fraction';

export const MAX_N = 1000;

const whole = (text, where, min = 0) => {
  const v = requireNumber(text, where);
  if (!Number.isInteger(v) || v < min) throw new EngineError(`${where} must be a whole number${min ? ` of at least ${min}` : ' (0 or more)'}.`);
  if (v > MAX_N) throw new EngineError(`${where} must be ${MAX_N} or less.`);
  return v;
};

/** n! as BigInt. */
export function factorial(n) {
  let f = 1n;
  for (let k = 2n; k <= BigInt(n); k++) f *= k;
  return f;
}

/** n × (n − 1) × … for `count` factors, as BigInt. */
function fallingProduct(n, count) {
  let p = 1n;
  for (let k = 0; k < count; k++) p *= BigInt(n - k);
  return p;
}

export function nPr(n, r) { return fallingProduct(n, r); }
export function nCr(n, r) {
  const k = Math.min(r, n - r);
  return fallingProduct(n, k) / factorial(k);
}

/** "1,23,45,678" style grouping is for money; counts use plain thousands: 2,598,960. */
export const group = (big) => big.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** LaTeX for a BigInt, with long numbers allowed to break. */
const tex = (big) => (big.toString().length > 40 ? `\\text{${big.toString().replace(/(\d{20})/g, '$1 ')}}` : group(big).replace(/,/g, '{,}'));

/** "10 × 9 × 8" (shortened with … when long). */
const productTex = (n, count) => {
  if (count === 0) return '1';
  if (count <= 6) return Array.from({ length: count }, (_, k) => n - k).join(' \\times ');
  return `${n} \\times ${n - 1} \\times \\cdots \\times ${n - count + 1}`;
};

const done = (mode, result, lines, extra = {}) => ({ mode, result, text: group(result), digits: result.toString().length, lines, ...extra, steps: { headers: [], rows: [] }, notes: [], plot: null });

export function solve({ mode, n: tn, r: tr, word, necklace = false }) {
  switch (mode) {
    case 'factorial': {
      const n = whole(tn, 'n');
      const f = factorial(n);
      return done(mode, f, [n <= 1 ? `${n}! = 1 \\ (\\text{by definition, } 0! = 1)` : `${n}! = ${productTex(n, n)} = ${tex(f)}`]);
    }
    case 'npr':
    case 'ncr': {
      const n = whole(tn, 'n'), r = whole(tr, 'r');
      if (r > n) throw new EngineError(`r can't be bigger than n: you can't choose ${r} from ${n}.`);
      if (mode === 'npr') {
        const p = nPr(n, r);
        return done(mode, p, [
          `{}^{${n}}P_{${r}} = \\frac{n!}{(n - r)!} = \\frac{${n}!}{${n - r}!}`,
          `= ${productTex(n, r)} = ${tex(p)}`,
        ]);
      }
      const c = nCr(n, r);
      const k = Math.min(r, n - r);
      return done(mode, c, [
        `{}^{${n}}C_{${r}} = \\frac{n!}{r!\\,(n - r)!} = \\frac{${n}!}{${r}!\\;${n - r}!}`,
        `= \\frac{${productTex(n, k)}}{${productTex(k, k)}} = ${tex(c)}`,
        ...(k !== r ? [`\\text{(}{}^{${n}}C_{${r}} = {}^{${n}}C_{${n - r}}\\text{, so the shorter product is used.)}`] : []),
      ], { permutations: nPr(n, r) });
    }
    case 'circular': {
      const n = whole(tn, 'n', 1);
      const ways = factorial(n - 1) / (necklace && n > 2 ? 2n : 1n);
      return done(mode, ways, [
        `\\text{Fix one person's seat; arrange the other } ${n - 1}: \\ (n - 1)! = ${n - 1}! = ${tex(factorial(n - 1))}`,
        ...(necklace && n > 2 ? [`\\text{A necklace can be flipped over, so clockwise and anticlockwise are the same: } \\frac{(n - 1)!}{2} = ${tex(ways)}`] : []),
      ]);
    }
    case 'repetition': {
      const n = whole(tn, 'n', 1), r = whole(tr, 'r');
      const arrangements = BigInt(n) ** BigInt(r);
      const selections = nCr(n + r - 1, r);
      return done(mode, arrangements, [
        `\\text{Arrangements (order matters, repeats allowed): } n^r = ${n}^{${r}} = ${tex(arrangements)}`,
        `\\text{Selections (order doesn't matter, repeats allowed): } {}^{n + r - 1}C_{r} = {}^{${n + r - 1}}C_{${r}} = ${tex(selections)}`,
      ], { selections });
    }
    case 'word': {
      const letters = String(word ?? '').toUpperCase().replace(/[^A-Z]/g, '');
      if (!letters) throw new EngineError('Type a word (letters only).');
      if (letters.length > 100) throw new EngineError('Use a word of 100 letters or fewer.');
      const counts = {};
      for (const ch of letters) counts[ch] = (counts[ch] || 0) + 1;
      const repeats = Object.entries(counts).filter(([, c]) => c > 1);
      let denom = 1n;
      repeats.forEach(([, c]) => { denom *= factorial(c); });
      const ways = factorial(letters.length) / denom;
      return done(mode, ways, [
        `\\text{${letters}: ${letters.length} letters${repeats.length ? `; ${repeats.map(([ch, c]) => `${ch} appears ${c} times`).join(', ')}` : ', all different'}}`,
        repeats.length
          ? `\\frac{${letters.length}!}{${repeats.map(([, c]) => `${c}!`).join('\\,')}} = \\frac{${tex(factorial(letters.length))}}{${tex(denom)}} = ${tex(ways)}`
          : `${letters.length}! = ${tex(ways)}`,
      ], { counts });
    }
    default:
      throw new EngineError('Choose what to work out.');
  }
}
