/**
 * Fast polynomial and rational-function arithmetic on math.js nodes, in one variable.
 * Used instead of math.rationalize, which slows down exponentially with powers ((2x + 1)^6 never finishes).
 * Coefficients are ascending: [c0, c1, c2] means c0 + c1·x + c2·x².
 */
const MAX_DEGREE = 40;

const trim = (c) => { const d = [...c]; while (d.length > 1 && Math.abs(d.at(-1)) < 1e-12) d.pop(); return d; };
export const polyAdd = (p, q) => trim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) + (q[i] || 0)));
export const polyScale = (p, k) => trim(p.map((c) => c * k));
export function polyMul(p, q) {
  const out = new Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] += a * b; }));
  return trim(out);
}
const isZero = (p) => p.length === 1 && Math.abs(p[0]) < 1e-12;
const degree = (p) => trim(p).length - 1;

/** A plain number from a node with no variables, or NaN. */
function constantValue(node) {
  try {
    const y = node.evaluate({});
    return typeof y === 'number' ? y : NaN;
  } catch {
    return NaN;
  }
}
const hasSymbol = (node, v) => { let f = false; node.traverse((m) => { if (m.isSymbolNode && m.name === v) f = true; }); return f; };

/**
 * { P, Q } with node = P(v) / Q(v), or null when node is not a rational function of v
 * (other letters, functions of v, non-integer powers…). Q is not reduced: common factors may remain.
 */
export function rationalParts(node, v = 'x') {
  const R = (n) => {
    if (n.isParenthesisNode) return R(n.content);
    if (!hasSymbol(n, v)) {
      const c = constantValue(n);
      return Number.isFinite(c) ? { P: [c], Q: [1] } : null;
    }
    if (n.isSymbolNode) return n.name === v ? { P: [0, 1], Q: [1] } : null;
    if (!n.isOperatorNode) return null;
    const a = n.args.map(R);
    if (a.some((x) => !x)) return null;
    let out;
    switch (n.fn) {
      case 'unaryPlus': out = a[0]; break;
      case 'unaryMinus': out = { P: polyScale(a[0].P, -1), Q: a[0].Q }; break;
      case 'add': out = { P: polyAdd(polyMul(a[0].P, a[1].Q), polyMul(a[1].P, a[0].Q)), Q: polyMul(a[0].Q, a[1].Q) }; break;
      case 'subtract': out = { P: polyAdd(polyMul(a[0].P, a[1].Q), polyScale(polyMul(a[1].P, a[0].Q), -1)), Q: polyMul(a[0].Q, a[1].Q) }; break;
      case 'multiply': out = a.reduce((acc, x) => ({ P: polyMul(acc.P, x.P), Q: polyMul(acc.Q, x.Q) })); break;
      case 'divide':
        if (isZero(a[1].P)) return null;
        out = { P: polyMul(a[0].P, a[1].Q), Q: polyMul(a[0].Q, a[1].P) };
        break;
      case 'pow': {
        if (hasSymbol(n.args[1], v)) return null;
        const k = constantValue(n.args[1]);
        if (!Number.isInteger(k) || Math.abs(k) > MAX_DEGREE) return null;
        let P = [1], Q = [1];
        for (let i = 0; i < Math.abs(k); i++) { P = polyMul(P, a[0].P); Q = polyMul(Q, a[0].Q); }
        out = k >= 0 ? { P, Q } : { P: Q, Q: P };
        break;
      }
      default: return null;
    }
    if (degree(out.P) > MAX_DEGREE || degree(out.Q) > MAX_DEGREE) return null;
    // Keep the bottom's leading coefficient tidy when it is a plain number
    if (out.Q.length === 1 && Math.abs(out.Q[0] - 1) > 1e-12) out = { P: polyScale(out.P, 1 / out.Q[0]), Q: [1] };
    return out;
  };
  try {
    return R(node);
  } catch {
    return null;
  }
}

/** Ascending coefficients of node as a polynomial in v, or null. */
export function polynomialCoeffs(node, v = 'x') {
  const r = rationalParts(node, v);
  if (!r || r.Q.length !== 1) return null;
  return r.P.map((c) => c / r.Q[0]);
}
