/**
 * Choosing how an answer is written: the shortest, most textbook-like of several equal forms.
 * Shared by the integral and logarithmic-differentiation engines.
 */
import { simplifyExact, num, sub, add, neg, mul, div, pow, paren, unwrap, tidy, tex, polish, bestForm, math } from './tree';

const { SymbolNode, OperatorNode, ParenthesisNode } = math;
import { polyNode } from './integral';
import { polynomialCoeffs } from './poly';
import { toFraction } from '../numeric/fraction';

/** Polynomials inside an expression written in descending powers: x^2 + 2 - 2x → x^2 - 2x + 2. */
export function orderPolynomials(node, v) {
  return node.transform((m) => {
    const x = unwrap(m);
    if (!(x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract'))) return m;
    const c = polynomialCoeffs(x, v);
    return c && c.length > 1 ? (m.isParenthesisNode ? paren(polyNode(c, v)) : polyNode(c, v)) : m;
  });
}

/** Fractions inside fractions made into one: (a/b)/c → a/(bc), a/(b/c) → ac/b. */
export function flattenFractions(node) {
  let out = node;
  for (let i = 0; i < 4; i++) {
    out = out.transform((m) => {
      if (!(m.isOperatorNode && m.fn === 'divide')) return m;
      const [p, q] = m.args.map(unwrap);
      if (p.isOperatorNode && p.fn === 'divide') return div(p.args[0], mul(paren(p.args[1]), paren(q)));
      if (q.isOperatorNode && q.fn === 'divide') return div(mul(paren(p), paren(q.args[1])), q.args[0]);
      return m;
    });
  }
  return out;
}

/** sin²u + cos²u → 1 wherever both appear in the same sum with the same sign. */
export function pythagoras(node) {
  const square = (n, name) => {
    const x = unwrap(n);
    return x.isOperatorNode && x.fn === 'pow' && x.args[1].isConstantNode && x.args[1].value === 2
      && unwrap(x.args[0]).isFunctionNode && unwrap(x.args[0]).fn.name === name ? unwrap(x.args[0]).args[0].toString() : null;
  };
  // a·a → a², (−a)(−a) → a², a·(−a) → −a², so squares written as products are found too
  const squared = node.transform((m) => {
    if (!(m.isOperatorNode && m.fn === 'multiply' && m.args.length === 2)) return m;
    let sign = 1;
    const [a, b] = m.args.map((x) => { let y = unwrap(x); while (y.isOperatorNode && y.fn === 'unaryMinus') { sign = -sign; y = unwrap(y.args[0]); } return y; });
    if (a.toString() !== b.toString()) return m;
    const sq = pow(a, num(2));
    return sign < 0 ? neg(sq) : sq;
  });
  return squared.transform((m) => {
    if (!(m.isOperatorNode && (m.fn === 'add' || m.fn === 'subtract'))) return m;
    const terms = [];
    const collect = (t, s) => {
      const x = unwrap(t);
      if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0], s); collect(x.args[1], x.fn === 'subtract' ? -s : s); return; }
      if (x.isOperatorNode && x.fn === 'unaryMinus') { collect(x.args[0], -s); return; }
      terms.push({ t: x, s });
    };
    collect(m, 1);
    for (let i = 0; i < terms.length; i++) {
      const u = square(terms[i].t, 'sin');
      if (u === null) continue;
      const j = terms.findIndex((q, k) => k !== i && q.s === terms[i].s && square(q.t, 'cos') === u);
      if (j < 0) continue;
      const s = terms[i].s;
      const rest = terms.filter((_, k) => k !== i && k !== j);
      rest.push({ t: num(1), s });
      return rest.reduce((acc, { t, s: ts }) => (acc ? (ts < 0 ? sub(acc, t) : add(acc, t)) : ts < 0 ? neg(t) : t), null);
    }
    return m;
  });
}

/** Simplify each term of a sum on its own and put every minus sign in front: a + (−b)/2 → a − b/2. */
export function termwise(node, v) {
  const terms = [];
  const collect = (t, s) => {
    const x = unwrap(t);
    if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0], s); collect(x.args[1], x.fn === 'subtract' ? -s : s); return; }
    if (x.isOperatorNode && x.fn === 'unaryMinus') { collect(x.args[0], -s); return; }
    terms.push({ t: x, s });
  };
  collect(node, 1);
  const cleaned = terms.map(({ t, s }) => {
    let y;
    try { y = unwrap(orderPolynomials(flattenFractions(simplifyExact(flattenFractions(t))), v)); } catch { y = t; }
    // Pull a minus sign out of −a and (−a)/b
    for (let i = 0; i < 3; i++) {
      if (y.isOperatorNode && y.fn === 'unaryMinus') { s = -s; y = unwrap(y.args[0]); continue; }
      if (y.isOperatorNode && y.fn === 'divide' && unwrap(y.args[0]).isOperatorNode && unwrap(y.args[0]).fn === 'unaryMinus') { s = -s; y = div(unwrap(y.args[0]).args[0], y.args[1]); continue; }
      if (y.isOperatorNode && y.fn === 'divide' && unwrap(y.args[1]).isOperatorNode && unwrap(y.args[1]).fn === 'unaryMinus') { s = -s; y = div(y.args[0], unwrap(y.args[1]).args[0]); continue; }
      break;
    }
    return { y, s };
  });
  return cleaned.reduce((acc, { y, s }) => (acc ? (s < 0 ? sub(acc, y) : add(acc, y)) : s < 0 ? neg(y) : y), null);
}

/** How untidy a form looks: longer is worse, and decimals, "+ −", nested fractions cost extra. */
export function ugliness(node) {
  const t = tex(node);
  const count = (re) => (t.match(re) || []).length;
  return t.length + 40 * count(/\d\.\d/g) + 25 * count(/\+\s*-/g) + 25 * count(/\\left\(\\frac/g)
    + 25 * count(/\\frac\{-/g) + 25 * count(/\}\{-/g) + 30 * count(/\\frac\{\\frac/g) + 30 * count(/\}\{\\frac/g)
    + 15 * count(/\\frac\{[^{}]*\}\{[^{}]*\}\\,\s*\\frac/g);
}

/**
 * All the forms worth trying for a raw answer (each polished), in a fixed order.
 * `accept` filters them (e.g. a numerical check); the tidiest accepted form wins.
 */
/**
 * Like terms collected, with functions treated as symbols: (x + sin 2x)/4 + (sin 4x/16 + x/4)/2 → 3x/8 + sin 2x/4 + sin 4x/32.
 * Uses math.rationalize on the symbol version, then turns its decimal coefficients back into fractions.
 */
export function collectLike(raw) {
  const calls = [];
  const masked = raw.transform((n) => {
    if (!n.isFunctionNode) return n;
    const key = n.toString();
    let i = calls.findIndex((c) => c.key === key);
    if (i < 0) { calls.push({ key, node: n }); i = calls.length - 1; }
    return new SymbolNode(`F${i}__`);
  });
  if (!calls.length) return raw;
  // math.rationalize slows down exponentially with size and powers: only small expressions, powers up to 5
  // …and with more than one letter (x and n in a Fourier integral took 5 s): one letter, modest size only
  let size = 0, bigPow = false;
  const letters = new Set();
  masked.traverse((n) => {
    size++;
    if (n.isOperatorNode && n.fn === 'pow' && !(n.args[1].isConstantNode && Math.abs(n.args[1].value) <= 5)) bigPow = true;
    if (n.isSymbolNode && !/^F\d+__$/.test(n.name) && !['pi', 'e'].includes(n.name)) letters.add(n.name);
  });
  if (size > 40 || bigPow || calls.length > 4 || letters.size > 1) return raw;
  const r = math.rationalize(masked);
  let bad = false;
  const exact = r.transform((n) => {
    if (!(n.isConstantNode && typeof n.value === 'number')) return n;
    const f = toFraction(n.value, 1000, 1e-9);
    if (!f) { bad = true; return n; }
    return f.d === 1 ? num(f.n) : new ParenthesisNode(new OperatorNode('/', 'divide', [num(f.n), num(f.d)]));
  });
  if (bad) throw new Error('not exact');
  return exact.transform((n) => (n.isSymbolNode && /^F\d+__$/.test(n.name) ? calls[Number(n.name.slice(1, -2))].node : n));
}

export function cleanest(raw, v, accept = () => true) {
  const forms = [];
  const tryForm = (make) => { try { forms.push(polish(tidy(orderPolynomials(make(), v)))); } catch { /* skip this form */ } };
  tryForm(() => raw);
  // math.simplify takes seconds on big expressions (second partials of tan⁻¹((x³ + y³)/(x − y)) froze the Euler page
  // for a minute). The work depends on size only, never on time, so the same input always gives the same answer:
  //   ≤ 40 nodes every form;  41–90 the costly combinations are skipped;  > 90 cheap forms and one simplify
  let size = 0;
  raw.traverse(() => { size++; });
  if (size > 90) {
    tryForm(() => flattenFractions(raw));
    if (size <= 140) tryForm(() => simplifyExact(raw));
    return forms.filter(accept).sort((p, q) => ugliness(p) - ugliness(q))[0] || null;
  }
  const full = size <= 40;
  tryForm(() => bestForm(raw));
  tryForm(() => simplifyExact(raw));
  tryForm(() => termwise(raw, v));
  if (full) tryForm(() => termwise(bestForm(raw), v));
  tryForm(() => flattenFractions(raw));
  // With sin²u + cos²u = 1 used (only changes anything when both squares appear in one sum)
  const starts = full ? [flattenFractions(raw), (() => { try { return simplifyExact(flattenFractions(raw)); } catch { return raw; } })(), ...forms] : [raw, flattenFractions(raw), ...forms];
  for (const before of starts) {
    const p = pythagoras(before);
    if (p.toString() === before.toString()) continue;
    tryForm(() => p);
    tryForm(() => termwise(p, v));
    tryForm(() => simplifyExact(p));
    if (full) tryForm(() => termwise(pythagoras(simplifyExact(p)), v));
  }
  // Like terms collected (cheap, guarded); last, so it only wins when strictly tidier
  try { forms.push(polish(tidy(orderPolynomials(collectLike(raw), v)))); } catch { /* not collectable */ }
  return forms.filter(accept).sort((p, q) => ugliness(p) - ugliness(q))[0] || null;
}

/** Well-known constants a definite integral often gives. */
const CONSTANTS = [
  ['\\pi', Math.PI], ['\\ln 2', Math.LN2], ['\\ln 3', Math.log(3)], ['\\sqrt{2}', Math.SQRT2], ['\\sqrt{3}', Math.sqrt(3)],
  ['e', Math.E], ['\\ln 5', Math.log(5)], ['\\sqrt{5}', Math.sqrt(5)], ['\\sqrt{6}', Math.sqrt(6)], ['\\pi^2', Math.PI ** 2], ['\\frac{1}{e}', 1 / Math.E], ['\\pi\\sqrt{3}', Math.PI * Math.sqrt(3)],
];
const gcdInt = (x, y) => { while (y) [x, y] = [y, x % y]; return Math.abs(x); };

/** y as exact LaTeX: a simple fraction, or p + q·K for a constant K above (π/4, 2 ln 2 − 1, …); null if neither. */
export function recognise(y) {
  if (!Number.isFinite(y)) return null;
  const frac = (v) => toFraction(v, 12, 1e-10);
  const fracTex = (f) => (f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`);
  const plain = frac(y);
  if (plain) return fracTex(plain);
  for (let d = 1; d <= 12; d++) {
    for (let n = 1; n <= 48; n++) {
      if (gcdInt(n, d) !== 1) continue;
      for (const sign of [1, -1]) {
        for (const [K, k] of CONSTANTS) {
          const pf = frac(y - (sign * n * k) / d);
          if (!pf) continue;
          const top = n === 1 ? K : `${n}${K.startsWith('\\frac') ? '\\cdot ' : ''}${K}`;
          const kTex = d === 1 ? top : `\\frac{${top}}{${d}}`;
          const lead = `${sign < 0 ? '-' : ''}${kTex}`;
          if (pf.n === 0) return lead;
          return `${lead} ${pf.n < 0 ? '-' : '+'} ${fracTex({ n: Math.abs(pf.n), d: pf.d })}`;
        }
      }
    }
  }
  return null;
}
