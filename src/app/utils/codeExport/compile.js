/**
 * Turns one small description of a program (see programs.js) into Python, MATLAB, C++, JavaScript,
 * Rust or Go. Expressions are written in mathjs syntax and parsed with mathjs, so the student's own
 * function (x^3 - 4x - 9, sin(x), e^x …) goes through the same path as the program's own maths.
 *
 * Types: 'num' (a real number), 'int' (a whole number used for counting and indexing), 'bool',
 * 'vec' (a list of numbers) and 'mat' (a table of numbers). Indexes start at 0; MATLAB adds 1.
 *
 * Statements:
 *   { k: 'decl', name, type, init }   init: expression string, or { zeros: n }, { zeros2: [n, m] },
 *                                     { vec: [numbers] }, { mat: [[numbers]] }, { copy: name }
 *   { k: 'set', target, value }       target: 'x', 'x[i]' or 'A[i, j]'
 *   { k: 'for', v, from, to, body }   v = from, from + 1, … to - 1
 *   { k: 'down', v, from, to, body }  v = from, from - 1, … to (to included)
 *   { k: 'while', cond, body }
 *   { k: 'if', cond, then, else }
 *   { k: 'break' }
 *   { k: 'print', parts }             parts: text, or { e: expression, p: decimals, w: width }
 *   { k: 'swap', m, i, j }            swaps two rows of a table
 *   { k: 'comment', text }
 */

import { create, all } from 'mathjs';

const math = create(all, {});

export const LANGS = {
  python: { label: 'Python', ext: 'py', comment: '#' },
  matlab: { label: 'MATLAB', ext: 'm', comment: '%' },
  cpp: { label: 'C++', ext: 'cpp', comment: '//' },
  javascript: { label: 'JavaScript', ext: 'js', comment: '//' },
  rust: { label: 'Rust', ext: 'rs', comment: '//' },
  go: { label: 'Go', ext: 'go', comment: '//' },
};

export class ExportError extends Error {}

/* ---------------- expressions ---------------- */

const parseCache = new Map();
function parse(src) {
  const key = String(src);
  if (!parseCache.has(key)) {
    let node;
    try {
      node = math.parse(key.replace(/\*\*/g, '^').replace(/Math\./g, ''));
    } catch {
      throw new ExportError(`Could not read "${key}".`);
    }
    if (parseCache.size > 400) parseCache.clear();
    parseCache.set(key, node);
  }
  return parseCache.get(key);
}

const unwrap = (n) => (n.type === 'ParenthesisNode' ? unwrap(n.content) : n);

// Maths functions a student may type, with how many arguments they take
const MATH_FUNCS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'ln', 'log10', 'log2', 'sqrt', 'cbrt', 'abs', 'sec', 'csc', 'cot', 'nthRoot', 'floor', 'ceil']);
// Program-only helpers
const HELPERS = new Set(['float', 'int', 'len', 'rows', 'cols', 'pow']);

/** The type of an expression node: 'num', 'int', 'bool' or 'lit' (a bare number that fits either). */
function typeOf(node, env, funcs) {
  const n = node;
  switch (n.type) {
    case 'ParenthesisNode':
      return typeOf(n.content, env, funcs);
    case 'ConstantNode':
      if (typeof n.value === 'boolean') return 'bool';
      return 'lit';
    case 'SymbolNode':
      if (env[n.name]) return env[n.name];
      if (n.name === 'pi' || n.name === 'e' || n.name === 'E' || n.name === 'PI') return 'num';
      throw new ExportError(`Unknown name "${n.name}" in the function. Use x${env.y ? ' and y' : ''}.`);
    case 'AccessorNode':
      return 'num';
    case 'OperatorNode': {
      if (['smaller', 'larger', 'smallerEq', 'largerEq', 'equal', 'unequal', 'and', 'or', 'not'].includes(n.fn)) return 'bool';
      const ts = n.args.map((a) => typeOf(a, env, funcs));
      if (n.fn === 'divide' || n.fn === 'pow') return 'num';
      if (ts.includes('num')) return 'num';
      if (ts.includes('int')) return 'int';
      return 'lit';
    }
    case 'FunctionNode': {
      const name = n.fn.name;
      if (name === 'int' || name === 'len' || name === 'rows' || name === 'cols') return 'int';
      return 'num';
    }
    default:
      throw new ExportError('That function uses something code export cannot write yet.');
  }
}

const isAtom = (n) => {
  const u = n.type === 'ParenthesisNode' ? n : n;
  return u.type === 'SymbolNode' || u.type === 'ConstantNode' || u.type === 'FunctionNode' || u.type === 'ParenthesisNode' || u.type === 'AccessorNode';
};

const OPS = { add: '+', subtract: '-', multiply: '*', divide: '/', mod: '%' };
const CMP = { smaller: '<', larger: '>', smallerEq: '<=', largerEq: '>=', equal: '==', unequal: '!=' };

/** Writes one number literal for a language and type. */
function literal(value, type, lang) {
  const v = Number(value);
  if (type === 'int') return String(Math.trunc(v));
  let s = Number.isInteger(v) ? String(v) : String(v);
  if (['cpp', 'rust', 'go'].includes(lang) && !/[.eE]/.test(s)) s += '.0';
  if (lang === 'rust' && /[eE]/.test(s) && !s.includes('.')) s = s.replace(/[eE]/, '.0e');
  return s;
}

/**
 * Writes an expression in a language. `want` is the type the surrounding code needs, used for bare numbers.
 * ctx: { lang, env, funcs, uses } — uses.math is set when the code calls a maths library function.
 */
function emit(node, ctx, want = 'num') {
  const { lang, env } = ctx;
  const n = node;
  const E = (child, w) => emit(child, ctx, w);
  const T = (child) => typeOf(child, env, ctx.funcs);

  switch (n.type) {
    case 'ParenthesisNode':
      return `(${E(n.content, want)})`;
    case 'ConstantNode':
      if (typeof n.value === 'boolean') return lang === 'python' ? (n.value ? 'True' : 'False') : String(n.value);
      return literal(n.value, want === 'int' ? 'int' : 'num', lang);
    case 'SymbolNode':
      if (env[n.name]) return n.name;
      if (n.name === 'pi' || n.name === 'PI') return constant('pi', ctx);
      return constant('e', ctx);
    case 'AccessorNode': {
      const obj = n.object.name;
      const dims = n.index.dimensions;
      const idx = dims.map((d) => E(d, 'int'));
      if (lang === 'matlab') return `${obj}(${idx.map((i) => `${i} + 1`).join(', ')})`;
      return `${obj}${idx.map((i) => `[${i}]`).join('')}`;
    }
    case 'OperatorNode':
      return emitOperator(n, ctx, want, E, T);
    case 'FunctionNode':
      return emitFunction(n, ctx, E, T);
    default:
      throw new ExportError('That function uses something code export cannot write yet.');
  }
}

function constant(which, ctx) {
  const { lang } = ctx;
  if (which === 'pi') {
    if (lang === 'python') { ctx.uses.math = true; return 'math.pi'; }
    if (lang === 'matlab') return 'pi';
    if (lang === 'cpp') return 'M_PI';
    if (lang === 'javascript') return 'Math.PI';
    if (lang === 'rust') return 'std::f64::consts::PI';
    ctx.uses.math = true;
    return 'math.Pi';
  }
  if (lang === 'python') { ctx.uses.math = true; return 'math.e'; }
  if (lang === 'matlab') return 'exp(1)';
  if (lang === 'cpp') return 'M_E';
  if (lang === 'javascript') return 'Math.E';
  if (lang === 'rust') return 'std::f64::consts::E';
  ctx.uses.math = true;
  return 'math.E';
}

function emitOperator(n, ctx, want, E, T) {
  const { lang } = ctx;
  const [a, b] = n.args;
  if (n.fn === 'unaryMinus') {
    const t = T(a);
    const inner = E(a, t === 'int' ? 'int' : 'num');
    return `-${inner}`;
  }
  if (n.fn === 'unaryPlus') return E(a, want);
  if (n.fn === 'not') return lang === 'python' ? `not ${E(a)}` : lang === 'matlab' ? `~${E(a)}` : `!${E(a)}`;
  if (n.fn === 'and' || n.fn === 'or') {
    const op = lang === 'python' ? n.fn : n.fn === 'and' ? '&&' : '||';
    return `${E(a)} ${op} ${E(b)}`;
  }
  if (CMP[n.fn]) {
    const ta = T(a);
    const tb = T(b);
    const w = ta === 'int' || tb === 'int' ? (ta === 'num' || tb === 'num' ? 'num' : 'int') : 'num';
    const op = lang === 'matlab' && n.fn === 'unequal' ? '~=' : CMP[n.fn];
    return `${E(a, w)} ${op} ${E(b, w)}`;
  }
  if (n.fn === 'pow') return power(a, b, ctx, E, T);
  if (n.fn === 'mod') {
    if (lang === 'matlab') return `mod(${E(a, 'int')}, ${E(b, 'int')})`;
    return `${E(a, 'int')} % ${E(b, 'int')}`;
  }
  if (OPS[n.fn]) {
    let w = T(n);
    if (w === 'lit') w = want === 'int' ? 'int' : 'num';
    // A whole number taking part in real arithmetic is converted first (C++, Rust and Go need it)
    const side = (child) => {
      const t = T(child);
      if (w === 'num' && t === 'int') return castToNum(E(child, 'int'), child, ctx);
      return E(child, w);
    };
    return `${side(a)} ${OPS[n.fn]} ${side(b)}`;
  }
  throw new ExportError(`Code export cannot write the "${n.op}" operator yet.`);
}

function castToNum(code, node, ctx) {
  const { lang } = ctx;
  const wrap = isAtom(node) ? code : `(${code})`;
  if (lang === 'cpp') return `(double)${wrap}`;
  if (lang === 'rust') return `(${wrap} as f64)`;
  if (lang === 'go') return `float64(${code})`;
  return wrap;
}

function power(a, b, ctx, E, T) {
  const { lang } = ctx;
  const base = unwrap(a);
  // e^x is written as exp(x)
  if (base.type === 'SymbolNode' && (base.name === 'e' || base.name === 'E') && !ctx.env[base.name]) {
    return callMath('exp', [b], ctx, E, T);
  }
  const num = (child) => (T(child) === 'int' ? castToNum(E(child, 'int'), child, ctx) : E(child, 'num'));
  if (lang === 'python') {
    const l = isAtom(a) ? num(a) : `(${num(a)})`;
    const r = isAtom(b) ? num(b) : `(${num(b)})`;
    return `${l} ** ${r}`;
  }
  if (lang === 'matlab') {
    const l = isAtom(a) ? num(a) : `(${num(a)})`;
    const r = isAtom(b) ? num(b) : `(${num(b)})`;
    return `${l}^${r}`;
  }
  if (lang === 'cpp') return `std::pow(${num(a)}, ${num(b)})`;
  if (lang === 'javascript') return `Math.pow(${num(a)}, ${num(b)})`;
  if (lang === 'go') { ctx.uses.math = true; return `math.Pow(${num(a)}, ${num(b)})`; }
  return `${rustReceiver(a, ctx, E, T)}.powf(${num(b)})`;
}

function rustReceiver(node, ctx, E, T) {
  const u = unwrap(node);
  if (u.type === 'ConstantNode') return `${literal(u.value, 'num', 'rust')}_f64`;
  const code = T(node) === 'int' ? `(${E(node, 'int')} as f64)` : E(node, 'num');
  if (u.type === 'SymbolNode' || u.type === 'AccessorNode' || node.type === 'ParenthesisNode') return code;
  if (u.type === 'FunctionNode' && ctx.lang === 'rust' && !code.startsWith('-')) return code;
  return `(${code})`;
}

// name → [python, matlab, cpp, javascript, rust method, go]
const FN_NAMES = {
  sin: ['math.sin', 'sin', 'std::sin', 'Math.sin', 'sin', 'math.Sin'],
  cos: ['math.cos', 'cos', 'std::cos', 'Math.cos', 'cos', 'math.Cos'],
  tan: ['math.tan', 'tan', 'std::tan', 'Math.tan', 'tan', 'math.Tan'],
  asin: ['math.asin', 'asin', 'std::asin', 'Math.asin', 'asin', 'math.Asin'],
  acos: ['math.acos', 'acos', 'std::acos', 'Math.acos', 'acos', 'math.Acos'],
  atan: ['math.atan', 'atan', 'std::atan', 'Math.atan', 'atan', 'math.Atan'],
  sinh: ['math.sinh', 'sinh', 'std::sinh', 'Math.sinh', 'sinh', 'math.Sinh'],
  cosh: ['math.cosh', 'cosh', 'std::cosh', 'Math.cosh', 'cosh', 'math.Cosh'],
  tanh: ['math.tanh', 'tanh', 'std::tanh', 'Math.tanh', 'tanh', 'math.Tanh'],
  exp: ['math.exp', 'exp', 'std::exp', 'Math.exp', 'exp', 'math.Exp'],
  log: ['math.log', 'log', 'std::log', 'Math.log', 'ln', 'math.Log'],
  log10: ['math.log10', 'log10', 'std::log10', 'Math.log10', 'log10', 'math.Log10'],
  log2: ['math.log2', 'log2', 'std::log2', 'Math.log2', 'log2', 'math.Log2'],
  sqrt: ['math.sqrt', 'sqrt', 'std::sqrt', 'Math.sqrt', 'sqrt', 'math.Sqrt'],
  cbrt: ['math.cbrt', 'nthroot', 'std::cbrt', 'Math.cbrt', 'cbrt', 'math.Cbrt'],
  abs: ['abs', 'abs', 'std::fabs', 'Math.abs', 'abs', 'math.Abs'],
  floor: ['math.floor', 'floor', 'std::floor', 'Math.floor', 'floor', 'math.Floor'],
  ceil: ['math.ceil', 'ceil', 'std::ceil', 'Math.ceil', 'ceil', 'math.Ceil'],
};
const LANG_COL = { python: 0, matlab: 1, cpp: 2, javascript: 3, rust: 4, go: 5 };

function callMath(name, args, ctx, E, T) {
  const { lang } = ctx;
  const num = (child) => (T(child) === 'int' ? castToNum(E(child, 'int'), child, ctx) : E(child, 'num'));
  if (name === 'ln') name = 'log';
  if (name === 'sec' || name === 'csc' || name === 'cot') {
    const base = { sec: 'cos', csc: 'sin', cot: 'tan' }[name];
    return `${literal(1, 'num', lang)} / ${callMath(base, args, ctx, E, T)}`;
  }
  if (name === 'log' && args.length === 2) {
    return `${callMath('log', [args[0]], ctx, E, T)} / ${callMath('log', [args[1]], ctx, E, T)}`;
  }
  if (name === 'nthRoot') {
    const fake = new math.OperatorNode('/', 'divide', [new math.ConstantNode(1), args[1] || new math.ConstantNode(2)]);
    return power(args[0], new math.ParenthesisNode(fake), ctx, E, T);
  }
  const names = FN_NAMES[name];
  if (!names) throw new ExportError(`Code export cannot write the function "${name}" yet.`);
  if (args.length !== 1) throw new ExportError(`"${name}" takes one value.`);
  const fn = names[LANG_COL[lang]];
  if (lang === 'rust') return `${rustReceiver(args[0], ctx, E, T)}.${fn}()`;
  if (lang === 'python' && fn.startsWith('math.')) ctx.uses.math = true;
  if (lang === 'go') ctx.uses.math = true;
  if (lang === 'matlab' && name === 'cbrt') return `nthroot(${num(args[0])}, 3)`;
  return `${fn}(${num(args[0])})`;
}

function emitFunction(n, ctx, E, T) {
  const { lang } = ctx;
  const name = n.fn.name;
  const args = n.args;
  if (ctx.funcs[name]) {
    const list = args.map((a) => (T(a) === 'int' ? castToNum(E(a, 'int'), a, ctx) : E(a, 'num'))).join(', ');
    return `${name}(${list})`;
  }
  if (name === 'float') return castToNum(E(args[0], 'int'), args[0], ctx);
  if (name === 'int') {
    const inner = E(args[0], 'num');
    if (lang === 'python') { ctx.uses.math = true; return `int(math.floor(${inner}))`; }
    if (lang === 'matlab') return `floor(${inner})`;
    if (lang === 'cpp') return `(int)std::floor(${inner})`;
    if (lang === 'javascript') return `Math.floor(${inner})`;
    if (lang === 'rust') return `(${inner}).floor() as usize`;
    ctx.uses.math = true;
    return `int(math.Floor(${inner}))`;
  }
  if (name === 'len' || name === 'rows') {
    const v = args[0].name;
    if (lang === 'python' || lang === 'go') return `len(${v})`;
    if (lang === 'matlab') return name === 'len' ? `numel(${v})` : `size(${v}, 1)`;
    if (lang === 'cpp') return `(int)${v}.size()`;
    if (lang === 'javascript') return `${v}.length`;
    return `${v}.len()`;
  }
  if (name === 'pow') return power(args[0], args[1], ctx, E, T);
  if (MATH_FUNCS.has(name)) return callMath(name, args, ctx, E, T);
  throw new ExportError(`Code export cannot write the function "${name}" yet.`);
}

/** Checks a student's function and returns its mathjs tree (throws ExportError when it can't be written). */
export function checkUserExpression(src, vars = ['x']) {
  const node = parse(src);
  const env = Object.fromEntries(vars.map((v) => [v, 'num']));
  node.traverse((c) => {
    if (c.type === 'SymbolNode' && !env[c.name] && !['pi', 'e', 'E', 'PI'].includes(c.name)) {
      if (!MATH_FUNCS.has(c.name)) throw new ExportError(`Unknown name "${c.name}" in the function. Use ${vars.join(' and ')}.`);
    }
    if (c.type === 'FunctionNode' && !MATH_FUNCS.has(c.fn.name)) throw new ExportError(`Code export cannot write the function "${c.fn.name}" yet.`);
    if (c.type === 'OperatorNode' && !['add', 'subtract', 'multiply', 'divide', 'pow', 'unaryMinus', 'unaryPlus'].includes(c.fn)) {
      throw new ExportError(`Code export cannot write "${c.op}" in a function yet.`);
    }
  });
  return node;
}

/** The symbolic derivative of a student's function, as mathjs text. */
export function derivative(src, variable = 'x') {
  return math.simplify(math.derivative(parse(src), variable)).toString();
}

/** y'' (and further) for y' = f(x, y): the total derivative d/dx g(x, y) = g_x + g_y * f. */
export function totalDerivative(g, f) {
  const node = math.parse(`(${math.derivative(parse(g), 'x').toString()}) + (${math.derivative(parse(g), 'y').toString()}) * (${f})`);
  return math.simplify(node).toString();
}

/* ---------------- statements ---------------- */

function exprCode(src, ctx, want = 'num') {
  return emit(parse(src), ctx, want);
}

function typedExpr(src, ctx, type) {
  const node = parse(src);
  const t = typeOf(node, ctx.env, ctx.funcs);
  if (type === 'num' && t === 'int') return castToNum(emit(node, ctx, 'int'), node, ctx);
  return emit(node, ctx, type === 'int' ? 'int' : type === 'bool' ? 'bool' : 'num');
}

function numList(values, lang) {
  return values.map((v) => literal(v, 'num', lang)).join(', ');
}

function typeName(type, lang) {
  if (lang === 'cpp') return { num: 'double', int: 'int', bool: 'bool', vec: 'std::vector<double>', mat: 'std::vector<std::vector<double>>' }[type];
  if (lang === 'rust') return { num: 'f64', int: 'usize', bool: 'bool', vec: 'Vec<f64>', mat: 'Vec<Vec<f64>>' }[type];
  if (lang === 'go') return { num: 'float64', int: 'int', bool: 'bool', vec: '[]float64', mat: '[][]float64' }[type];
  return '';
}

function initCode(st, ctx) {
  const { lang } = ctx;
  const init = st.init;
  if (typeof init === 'string' || typeof init === 'number' || typeof init === 'boolean') return typedExpr(String(init), ctx, st.type);
  if (init.vec) {
    const list = numList(init.vec, lang);
    if (lang === 'python' || lang === 'javascript') return `[${list}]`;
    if (lang === 'matlab') return `[${list}]`;
    if (lang === 'cpp') return `{${list}}`;
    if (lang === 'rust') return `vec![${list}]`;
    return `[]float64{${list}}`;
  }
  if (init.mat) {
    const rowsCode = init.mat.map((r) => numList(r, lang));
    if (lang === 'python' || lang === 'javascript') return `[\n${rowsCode.map((r) => `    [${r}],`).join('\n')}\n]`;
    if (lang === 'matlab') return `[\n${rowsCode.map((r) => `    ${r.replace(/, /g, ', ')};`).join('\n')}\n]`;
    if (lang === 'cpp') return `{\n${rowsCode.map((r) => `        {${r}},`).join('\n')}\n    }`;
    if (lang === 'rust') return `vec![\n${rowsCode.map((r) => `        vec![${r}],`).join('\n')}\n    ]`;
    return `[][]float64{\n${rowsCode.map((r) => `\t\t{${r}},`).join('\n')}\n\t}`;
  }
  if (init.zeros !== undefined) {
    const n = typedExpr(String(init.zeros), ctx, 'int');
    if (lang === 'python') return `[0.0] * ${n}`;
    if (lang === 'matlab') return `zeros(1, ${n})`;
    if (lang === 'cpp') return `std::vector<double>(${n}, 0.0)`;
    if (lang === 'javascript') return `new Array(${n}).fill(0)`;
    if (lang === 'rust') return `vec![0.0; ${n}]`;
    return `make([]float64, ${n})`;
  }
  if (init.zeros2) {
    const [r, c] = init.zeros2.map((v) => typedExpr(String(v), ctx, 'int'));
    if (lang === 'python') return `[[0.0] * ${c} for _ in range(${r})]`;
    if (lang === 'matlab') return `zeros(${r}, ${c})`;
    if (lang === 'cpp') return `std::vector<std::vector<double>>(${r}, std::vector<double>(${c}, 0.0))`;
    if (lang === 'javascript') return `Array.from({ length: ${r} }, () => new Array(${c}).fill(0))`;
    if (lang === 'rust') return `vec![vec![0.0; ${c}]; ${r}]`;
    return null; // Go: written as a loop in emitStatements
  }
  if (init.copy) {
    const v = init.copy;
    if (lang === 'python') return `list(${v})`;
    if (lang === 'javascript') return `[...${v}]`;
    if (lang === 'rust') return `${v}.clone()`;
    if (lang === 'go') return `append([]float64(nil), ${v}...)`;
    return v;
  }
  throw new Error('bad init');
}

function targetCode(target, ctx) {
  const node = parse(target);
  if (node.type === 'SymbolNode') return node.name;
  return emit(node, ctx);
}

function escapeText(text, lang) {
  if (lang === 'matlab') return text.replace(/%/g, '%%').replace(/'/g, "''");
  if (lang === 'rust') return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\{/g, '{{').replace(/\}/g, '}}');
  if (lang === 'javascript') return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  if (lang === 'python') return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\{/g, '{{').replace(/\}/g, '}}');
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/%/g, '%%');
}

function printCode(parts, ctx) {
  const { lang } = ctx;
  let fmt = '';
  const args = [];
  parts.forEach((p) => {
    if (typeof p === 'string') {
      fmt += escapeText(p, lang);
      return;
    }
    const node = parse(p.e);
    const t = typeOf(node, ctx.env, ctx.funcs);
    const isInt = t === 'int' || p.int;
    const code = emit(node, ctx, isInt ? 'int' : 'num');
    const w = p.w || '';
    const prec = p.p ?? 6;
    if (lang === 'python') fmt += isInt ? `{${code}${w ? `:${w}d` : ''}}` : `{${code}:${w}.${prec}f}`;
    else if (lang === 'javascript') {
      const body = isInt ? `${code}` : `${isAtom(node) ? code : `(${code})`}.toFixed(${prec})`;
      fmt += w ? `\${String(${body}).padStart(${w})}` : `\${${body}}`;
    } else if (lang === 'rust') fmt += isInt ? `{${w ? `:${w}` : ''}}` : `{:${w}.${prec}}`;
    else fmt += isInt ? `%${w}d` : `%${w}.${prec}f`;
    if (!['python', 'javascript'].includes(lang)) args.push(code);
  });
  const rest = args.length ? `, ${args.join(', ')}` : '';
  if (lang === 'python') return `print(f"${fmt}")`;
  if (lang === 'javascript') return `console.log(\`${fmt}\`);`;
  if (lang === 'matlab') return `fprintf('${fmt}\\n'${rest});`;
  if (lang === 'cpp') return `std::printf("${fmt}\\n"${rest});`;
  if (lang === 'rust') return `println!("${fmt}"${rest});`;
  return `fmt.Printf("${fmt}\\n"${rest})`;
}

/** Names that are changed after they are made (Rust needs `mut` on these). */
function changedNames(body, out = new Set()) {
  body.forEach((st) => {
    if (st.k === 'set') out.add(parse(st.target).type === 'SymbolNode' ? st.target : (unwrap(parse(st.target)).object?.name));
    if (st.k === 'swap') out.add(st.m);
    ['body', 'then', 'else'].forEach((key) => st[key] && changedNames(st[key], out));
  });
  return out;
}

function emitStatements(body, ctx, depth) {
  const { lang } = ctx;
  const ind = (d) => (lang === 'go' ? '\t'.repeat(d) : '    '.repeat(d));
  const lines = [];
  const push = (d, text) => text.split('\n').forEach((l, i) => lines.push(i === 0 ? ind(d) + l : l ? (lang === 'go' ? l : l) : l));
  const end = lang === 'python' ? null : lang === 'matlab' ? 'end' : '}';
  const semi = ['cpp', 'javascript', 'rust'].includes(lang) ? ';' : '';

  body.forEach((st) => {
    switch (st.k) {
      case 'comment':
        push(depth, `${LANGS[lang].comment} ${st.text}`);
        break;
      case 'decl': {
        const code = initCode(st, ctx);
        ctx.env[st.name] = st.type;
        if (lang === 'go' && code === null) {
          const [r, c] = st.init.zeros2.map((v) => typedExpr(String(v), ctx, 'int'));
          push(depth, `${st.name} := make([][]float64, ${r})`);
          push(depth, `for i := range ${st.name} {`);
          push(depth + 1, `${st.name}[i] = make([]float64, ${c})`);
          push(depth, '}');
          break;
        }
        if (lang === 'python' || lang === 'matlab') push(depth, `${st.name} = ${code}${lang === 'matlab' ? ';' : ''}`);
        else if (lang === 'cpp') push(depth, `${typeName(st.type, 'cpp')} ${st.name} = ${code};`);
        else if (lang === 'javascript') push(depth, `${ctx.changed.has(st.name) ? 'let' : 'const'} ${st.name} = ${code};`);
        else if (lang === 'rust') {
          const annotate = ['num', 'int'].includes(st.type) && typeof st.init === 'string' && /^-?[\d.]+$/.test(st.init.trim());
          push(depth, `let ${ctx.changed.has(st.name) ? 'mut ' : ''}${st.name}${annotate ? `: ${typeName(st.type, 'rust')}` : ''} = ${code};`);
        } else push(depth, `${st.name} := ${code}`);
        break;
      }
      case 'set': {
        const node = parse(st.target);
        const t = node.type === 'SymbolNode' ? ctx.env[node.name] : 'num';
        const value = typedExpr(st.value, ctx, t === 'int' ? 'int' : t === 'bool' ? 'bool' : 'num');
        push(depth, `${targetCode(st.target, ctx)} = ${value}${lang === 'matlab' ? ';' : semi}`);
        break;
      }
      case 'for':
      case 'down': {
        const had = ctx.env[st.v];
        ctx.env[st.v] = 'int';
        const from = typedExpr(String(st.from), ctx, 'int');
        const to = typedExpr(String(st.to), ctx, 'int');
        const v = st.v;
        if (st.k === 'for') {
          if (lang === 'python') push(depth, `for ${v} in range(${from === '0' ? '' : `${from}, `}${to}):`);
          else if (lang === 'matlab') push(depth, `for ${v} = ${from}:${/^\d+$/.test(to) ? Number(to) - 1 : `${to} - 1`}`);
          else if (lang === 'cpp') push(depth, `for (int ${v} = ${from}; ${v} < ${to}; ${v}++) {`);
          else if (lang === 'javascript') push(depth, `for (let ${v} = ${from}; ${v} < ${to}; ${v}++) {`);
          else if (lang === 'rust') push(depth, `for ${v} in ${from}..${to} {`);
          else push(depth, `for ${v} := ${from}; ${v} < ${to}; ${v}++ {`);
        } else if (lang === 'python') push(depth, `for ${v} in range(${from}, ${/^\d+$/.test(to) ? Number(to) - 1 : `${to} - 1`}, -1):`);
        else if (lang === 'matlab') push(depth, `for ${v} = ${from}:-1:${to}`);
        else if (lang === 'cpp') push(depth, `for (int ${v} = ${from}; ${v} >= ${to}; ${v}--) {`);
        else if (lang === 'javascript') push(depth, `for (let ${v} = ${from}; ${v} >= ${to}; ${v}--) {`);
        else if (lang === 'rust') push(depth, `for ${v} in (${to}..=${from}).rev() {`);
        else push(depth, `for ${v} := ${from}; ${v} >= ${to}; ${v}-- {`);
        lines.push(...emitStatements(st.body, ctx, depth + 1));
        if (end) push(depth, end);
        if (had) ctx.env[st.v] = had;
        else delete ctx.env[st.v];
        break;
      }
      case 'while': {
        const cond = typedExpr(st.cond, ctx, 'bool');
        if (lang === 'python') push(depth, `while ${cond}:`);
        else if (lang === 'matlab') push(depth, `while ${cond}`);
        else if (lang === 'rust' || lang === 'go') push(depth, `${lang === 'go' ? 'for' : 'while'} ${cond} {`);
        else push(depth, `while (${cond}) {`);
        lines.push(...emitStatements(st.body, ctx, depth + 1));
        if (end) push(depth, end);
        break;
      }
      case 'if': {
        const cond = typedExpr(st.cond, ctx, 'bool');
        if (lang === 'python') push(depth, `if ${cond}:`);
        else if (lang === 'matlab') push(depth, `if ${cond}`);
        else if (lang === 'rust' || lang === 'go') push(depth, `if ${cond} {`);
        else push(depth, `if (${cond}) {`);
        lines.push(...emitStatements(st.then, ctx, depth + 1));
        if (st.else && st.else.length) {
          if (lang === 'python') push(depth, 'else:');
          else if (lang === 'matlab') push(depth, 'else');
          else push(depth, '} else {');
          lines.push(...emitStatements(st.else, ctx, depth + 1));
        }
        if (end) push(depth, end);
        break;
      }
      case 'break':
        push(depth, `break${semi}`);
        break;
      case 'print':
        push(depth, printCode(st.parts, ctx));
        break;
      case 'swap': {
        const i = typedExpr(String(st.i), ctx, 'int');
        const j = typedExpr(String(st.j), ctx, 'int');
        const m = st.m;
        if (lang === 'python') push(depth, `${m}[${i}], ${m}[${j}] = ${m}[${j}], ${m}[${i}]`);
        else if (lang === 'matlab') push(depth, `${m}([${i} + 1, ${j} + 1], :) = ${m}([${j} + 1, ${i} + 1], :);`);
        else if (lang === 'cpp') push(depth, `std::swap(${m}[${i}], ${m}[${j}]);`);
        else if (lang === 'javascript') push(depth, `[${m}[${i}], ${m}[${j}]] = [${m}[${j}], ${m}[${i}]];`);
        else if (lang === 'rust') push(depth, `${m}.swap(${i}, ${j});`);
        else push(depth, `${m}[${i}], ${m}[${j}] = ${m}[${j}], ${m}[${i}]`);
        break;
      }
      default:
        throw new Error(`unknown statement ${st.k}`);
    }
  });
  return lines;
}

/* ---------------- whole programs ---------------- */

function funcCode(fn, ctx) {
  const { lang } = ctx;
  const env = Object.fromEntries(fn.params.map((p) => [p, 'num']));
  const inner = { ...ctx, env };
  const body = emit(parse(fn.expr), inner, 'num');
  const ps = fn.params;
  const doc = fn.doc ? `${LANGS[lang].comment} ${fn.doc}\n` : '';
  if (lang === 'python') return `${doc}def ${fn.name}(${ps.join(', ')}):\n    return ${body}`;
  if (lang === 'matlab') return `${doc}${fn.name} = @(${ps.join(', ')}) ${body};`;
  if (lang === 'cpp') return `${doc}double ${fn.name}(${ps.map((p) => `double ${p}`).join(', ')}) {\n    return ${body};\n}`;
  if (lang === 'javascript') return `${doc}function ${fn.name}(${ps.join(', ')}) {\n  return ${body};\n}`;
  if (lang === 'rust') return `${doc}fn ${fn.name}(${ps.map((p) => `${p}: f64`).join(', ')}) -> f64 {\n    ${body}\n}`;
  return `${doc}func ${fn.name}(${ps.join(', ')} float64) float64 {\n\treturn ${body}\n}`;
}

/**
 * @param {object} program { title, about: [lines], funcs: [{ name, params, expr, doc }], body: [statements] }
 * @param {string} lang    a key of LANGS
 * @returns {string} the whole source file
 */
export function compile(program, lang) {
  if (!LANGS[lang]) throw new Error(`unknown language ${lang}`);
  const funcs = Object.fromEntries((program.funcs || []).map((f) => [f.name, f]));
  const ctx = { lang, env: {}, funcs, uses: { math: false }, changed: changedNames(program.body) };
  const c = LANGS[lang].comment;

  // Body first, so we know which libraries it uses
  const fnTexts = (program.funcs || []).map((f) => funcCode(f, ctx));
  const bodyLines = emitStatements(program.body, ctx, ['python', 'matlab', 'javascript'].includes(lang) ? 0 : 1);
  const header = [`${c} ${program.title}`, ...(program.about || []).map((l) => `${c} ${l}`), `${c} Made with NETZ (netz-ruby.vercel.app)`];

  if (lang === 'python') {
    return [...header, '', ...(ctx.uses.math ? ['import math', '', ''] : []), ...fnTexts.flatMap((t) => [t, '', '']), ...bodyLines, ''].join('\n');
  }
  if (lang === 'matlab') {
    return [...header, '', ...fnTexts, '', ...bodyLines, ''].join('\n');
  }
  if (lang === 'cpp') {
    return [...header, '', '#define _USE_MATH_DEFINES', '#include <cmath>', '#include <cstdio>', '#include <utility>', '#include <vector>', '', ...fnTexts.flatMap((t) => [t, '']), 'int main() {', ...bodyLines, '    return 0;', '}', ''].join('\n');
  }
  if (lang === 'javascript') {
    return [...header, `${c} Run with: node ${program.file || 'netz'}.js`, '', ...fnTexts.flatMap((t) => [t, '']), ...bodyLines, ''].join('\n');
  }
  if (lang === 'rust') {
    return [...header, `${c} Run with: rustc -O ${program.file || 'netz'}.rs && ./${program.file || 'netz'}`, '', ...fnTexts.flatMap((t) => [t, '']), 'fn main() {', ...bodyLines, '}', ''].join('\n');
  }
  const imports = ctx.uses.math ? 'import (\n\t"fmt"\n\t"math"\n)' : 'import "fmt"';
  return [...header, `${c} Run with: go run ${program.file || 'netz'}.go`, '', 'package main', '', imports, '', ...fnTexts.flatMap((t) => [t, '']), 'func main() {', ...bodyLines, '}', ''].join('\n');
}
