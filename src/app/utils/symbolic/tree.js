/**
 * Expression trees for the symbolic step engine (NETZ_METHODS_CATALOG.md section 0.1), built on math.js nodes.
 * Parsing what students type, building nodes, tidying them up, and LaTeX for the steps.
 */
import { create, all } from 'mathjs';
import { EngineError } from '../numeric/steps';
import { rationalParts } from './poly';

export const math = create(all);
const { ConstantNode, SymbolNode, OperatorNode, FunctionNode, ParenthesisNode } = math;

// Letters that are numbers, not variables
const CONSTANT_SYMBOLS = new Set(['e', 'pi', 'E', 'PI', 'phi', 'tau']);

/**
 * Reads an expression as students write it: 2x^2 + 3x, x^2 sin(x) (functions need brackets),
 * ln(x) for the natural log, e^x, sqrt(x), and the symbols √ and π. Throws an EngineError with a clear sentence.
 */
export function parse(text, label = 'f(x)') {
  const raw = String(text ?? '').trim();
  if (!raw) throw new EngineError(`${label} is empty.`);
  const s = raw
    .replace(/π/g, 'pi')
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/√\s*([a-z0-9.]+)/gi, 'sqrt($1)')
    .replace(/\bln\s*\(/g, 'log(')
    .replace(/\*\*/g, '^')
    .replace(/[−–]/g, '-')
    .replace(/·|×/g, '*');
  let node;
  try {
    node = math.parse(s);
  } catch {
    throw new EngineError(`${label}: "${raw}" could not be read. Use ^ for powers and brackets for functions, e.g. x^2*sin(3x).`);
  }
  // Only known functions may appear
  node.traverse((n) => {
    if (n.isFunctionNode && !(n.fn.name in DERIVATIVE_TABLE_NAMES)) {
      throw new EngineError(`${label}: "${n.fn.name}" is not a function NETZ can differentiate yet. Try sin, cos, tan, sec, csc, cot, exp, ln (log), sqrt, asin, acos, atan, sinh, cosh, tanh or abs.`);
    }
    if (n.isAssignmentNode || n.isBlockNode || n.isConditionalNode) throw new EngineError(`${label}: write just the expression, without = or ;.`);
  });
  return node;
}

// Functions the engine knows (see rules in derivative.js); kept here so parse() can reject others early
const DERIVATIVE_TABLE_NAMES = Object.fromEntries(
  ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'exp', 'log', 'log10', 'sqrt', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'abs', 'cbrt'].map((k) => [k, true]),
);

/** The letters that act as variables in a node (not e, pi, …). */
export function variablesOf(node) {
  const vars = new Set();
  node.traverse((n, path, parent) => {
    if (n.isSymbolNode && !(parent?.isFunctionNode && path === 'fn') && !CONSTANT_SYMBOLS.has(n.name)) vars.add(n.name);
  });
  return vars;
}

/** True when the node does not contain the variable v (so it is a constant for d/dv). */
export const isConstantIn = (node, v) => !variablesOf(node).has(v);

// ---------- building nodes ----------
export const num = (v) => new ConstantNode(v);
export const sym = (name) => new SymbolNode(name);
export const fn = (name, ...args) => new FunctionNode(new SymbolNode(name), args);
export const neg = (a) => new OperatorNode('-', 'unaryMinus', [a]);
export const add = (a, b) => new OperatorNode('+', 'add', [a, b]);
export const sub = (a, b) => new OperatorNode('-', 'subtract', [a, b]);
export const mul = (a, b) => new OperatorNode('*', 'multiply', [a, b]);
export const div = (a, b) => new OperatorNode('/', 'divide', [a, b]);
export const pow = (a, b) => new OperatorNode('^', 'pow', [a, b]);
export const paren = (a) => new ParenthesisNode(a);
export const unwrap = (n) => (n.isParenthesisNode ? unwrap(n.content) : n);

// ---------- tidying ----------
/** Removes ×1, +0, ^1 and similar without reshaping the expression (math.js simplifyCore). */
export const tidy = (node) => math.simplifyCore(node);

/**
 * math.simplify, but ln 2, √3 and similar stay exact instead of becoming 0.693…, 1.732…
 * (they are swapped for placeholder symbols while simplifying).
 */
export function simplifyExact(node) {
  const kept = [];
  const guarded = node.transform((n) => {
    if (n.isFunctionNode && n.args.every((a) => variablesOf(a).size === 0)) {
      kept.push(n);
      return new SymbolNode(`K${kept.length - 1}__`);
    }
    return n;
  });
  let out;
  try {
    out = math.simplify(guarded);
  } catch {
    out = guarded;
  }
  return out.transform((n) => (n.isSymbolNode && /^K\d+__$/.test(n.name) ? kept[Number(n.name.slice(1, -2))] : n));
}

/**
 * Textbook order inside every product: sign first, then the number, then powers of letters, then functions —
 * so x^2 · 3cos(3x) becomes 3x^2 cos(3x) and 2cos(x) · (−sin(x)) becomes −2 cos(x) sin(x).
 */
export function polish(node) {
  return node.transform((n) => {
    if (!(n.isOperatorNode && n.fn === 'multiply')) return n;
    let sign = 1;
    let coef = 1;
    const others = [];
    const collect = (f) => {
      const x = unwrap(f);
      if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach(collect); return; }
      if (x.isOperatorNode && x.fn === 'unaryMinus') { sign = -sign; collect(x.args[0]); return; }
      if (x.isConstantNode && typeof x.value === 'number') { coef *= x.value; return; }
      others.push(polish(x));
    };
    n.args.forEach(collect);
    if (coef < 0) { sign = -sign; coef = -coef; }
    // Letters and their powers before functions, as textbooks write 3x^2 cos(x)
    // Number-only factors such as (2/3) come first, as in (2/3)x^(3/2)
    const numberOnly = (f) => { let s = false; f.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode) s = true; }); return !s; };
    const rank = (f) => (numberOnly(f) ? 0 : f.isFunctionNode ? 2 : f.isOperatorNode && f.fn !== 'pow' ? 3 : 1);
    others.sort((p, q) => rank(p) - rank(q));
    const factors = coef === 1 && others.length ? others : [num(coef), ...others];
    // Sums inside a product need brackets
    const wrap = (f) => (f.isOperatorNode && ['add', 'subtract'].includes(f.fn) ? paren(f) : f);
    const product = factors.map(wrap).reduce((acc, f) => new OperatorNode('*', 'multiply', [acc, f], !(f.isConstantNode)));
    return sign < 0 ? neg(product) : product;
  });
}

/** How readable a form is: shorter is better, and fractions inside fractions cost extra. */
function score(node) {
  const s = node.toString();
  const divisions = (s.match(/\//g) || []).length;
  return s.length + Math.max(0, divisions - 1) * 20;
}

/** The most readable of: tidied, simplified, a single fraction (rational expressions), or a fraction with a simplified top. */
export function bestForm(node) {
  const base = tidy(node);
  const candidates = [base];
  try { candidates.push(simplifyExact(node)); } catch { /* keep the others */ }
  // math.rationalize slows down exponentially with powers ((2x + 1)^4 takes ~1 s, ^6 never finishes),
  // so only offer the expanded form for small expressions with low powers.
  const hasFunctions = (n) => {
    let f = false, size = 0;
    n.traverse((m) => {
      size++;
      if (m.isFunctionNode) f = true;
      if (m.isOperatorNode && m.fn === 'pow' && !(m.args[1].isConstantNode && Math.abs(m.args[1].value) <= 3)) f = true;
    });
    if (f || size > 40) return true;
    // Powers of powers hide high degrees: ((x + 1)^3)^2 is degree 6. Measure the real degree first.
    const vars = [...variablesOf(n)];
    if (vars.length !== 1) return vars.length > 1;
    const r = rationalParts(n, vars[0]);
    return !r || r.P.length > 5 || r.Q.length > 5;
  };
  try { if (!hasFunctions(node)) candidates.push(math.rationalize(node)); } catch { /* not a rational expression */ }
  const top = unwrap(base);
  if (top.isOperatorNode && top.fn === 'divide') {
    // Quotient-rule answers: simplify the top, keep the bottom as v^2
    const [numer, denom] = top.args;
    const tops = [simplifyExact(numer)];
    try { if (!hasFunctions(numer)) tops.push(math.rationalize(numer)); } catch { /* not polynomial */ }
    tops.forEach((t) => candidates.push(div(paren(t), denom)));
  }
  return polish(tidy(candidates.reduce((best, c) => (score(c) < score(best) ? c : best))));
}

// ---------- LaTeX ----------
/** LaTeX for a node, with "2\cdot x" written as "2x" the way textbooks do. */
export function tex(node) {
  return node
    .toTex({ parenthesis: 'auto', implicit: 'hide' })
    .replace(/(\d)\s*\\cdot\s*(?=[a-zA-Z\\{(])/g, '$1 ')
    .replace(/(\d)~\s*(?=[a-zA-Z\\{])/g, '$1 ')
    .replace(/~\s*/g, '\\, ')
    .replace(/\{\s+/g, '{')
    .replace(/\\left\(\s+/g, '\\left(')
    // math.js prints some letters that are also units (t for tonne, g for gram) upright; write them as variables
    .replace(/\\mathrm\{([a-zA-Z])\}/g, '$1');
}

/** Plain text for a node, e.g. for the answer box: 3 * x ^ 2 → 3x^2. */
export const text = (node) => node.toString({ implicit: 'hide' })
  .replace(/(\d) \* (?=[a-zA-Z(])/g, '$1')
  .replace(/ \^ /g, '^')
  .replace(/(\d) (?=[a-zA-Z(])/g, '$1')
  .replace(/\blog\(/g, 'ln(');
