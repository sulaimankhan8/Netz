import { create, all } from 'mathjs';

const math = create(all, {});

// In-memory AST compilation cache to avoid re-parsing math strings on every iteration
const compileCache = new Map();

/**
 * Sanitizes math expressions entered by users.
 * Replaces JS Math prefix and JS exponentiation `**` with mathjs `^`.
 */
export function sanitizeMathString(expr) {
  if (!expr || typeof expr !== 'string') return '';
  return expr
    .replace(/Math\./g, '')
    .replace(/\*\*/g, '^')
    .trim();
}

/**
 * Returns a compiled mathjs expression, retrieving from cache if available.
 */
function getCompiledExpression(sanitizedExpr) {
  if (compileCache.has(sanitizedExpr)) {
    return compileCache.get(sanitizedExpr);
  }
  const compiled = math.compile(sanitizedExpr);
  if (compileCache.size > 500) {
    const firstKey = compileCache.keys().next().value;
    compileCache.delete(firstKey);
  }
  compileCache.set(sanitizedExpr, compiled);
  return compiled;
}

/**
 * Safely evaluates a mathematical expression string for a given x value (or object of variables).
 * Accepts standard math syntax like x^3 - 4*x - 9, x**2 - 4, sin(x), e^x, etc.
 * 
 * @param {string} expr - The math expression entered by the user
 * @param {number|object} xVal - Value for x (or scope object like { x: 2, y: 3 })
 * @returns {number} Evaluated result
 */
export function evaluateMath(expr, xVal) {
  if (!expr || typeof expr !== 'string') {
    throw new Error('Invalid expression provided');
  }

  const sanitizedExpr = sanitizeMathString(expr);
  const compiled = getCompiledExpression(sanitizedExpr);
  const scope = typeof xVal === 'object' ? xVal : { x: xVal };
  const result = compiled.evaluate(scope);

  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error(`Expression evaluated to invalid number (${result})`);
  }

  return result;
}

/**
 * Parses user function input and returns a JavaScript callable function `f(x)` or `f(x, y)`.
 * 
 * @param {string} expr - The input string (e.g. "x^2 - 4" or "x**2 - 4")
 * @param {Array<string>} [vars=['x']] - Array of variable names
 * @returns {(...args: number[]) => number} Function evaluating expression
 */
export function parseUserFunction(expr, vars = ['x']) {
  if (!expr || typeof expr !== 'string') {
    throw new Error('Please enter a valid mathematical function.');
  }

  const sanitized = sanitizeMathString(expr);
  const compiled = getCompiledExpression(sanitized);

  return (...args) => {
    const scope = {};
    vars.forEach((v, index) => {
      scope[v] = args[index];
    });
    const val = compiled.evaluate(scope);
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      throw new Error(`Math domain or calculation error at x = ${args.join(', ')}`);
    }
    return val;
  };
}

/**
 * Computes the symbolic derivative of a function string with respect to a variable.
 * Uses MathJS derivative engine.
 * 
 * @param {string} expr - Mathematical expression (e.g. "x^3 - 4*x - 9")
 * @param {string} [variable='x'] - Variable to differentiate with respect to
 * @returns {string} Derivative string expression
 */
export function getSymbolicDerivative(expr, variable = 'x') {
  if (!expr || typeof expr !== 'string') return '';
  const sanitized = sanitizeMathString(expr);
  const node = math.parse(sanitized);
  const derivedNode = math.derivative(node, variable);
  return derivedNode.toString();
}

/**
 * Simplifies an expression string (e.g. "1 + 1 * (x + y)" -> "x + y + 1").
 *
 * @param {string} expr - Mathematical expression
 * @returns {string} Simplified expression string
 */
export function simplifyExpression(expr) {
  return math.simplify(sanitizeMathString(expr)).toString();
}

/**
 * Converts an expression string to LaTeX for KaTeX display.
 *
 * @param {string} expr - Mathematical expression
 * @returns {string} LaTeX string
 */
export function expressionToTex(expr) {
  return math.parse(sanitizeMathString(expr)).toTex({ parenthesis: 'auto', implicit: 'hide' });
}

export default evaluateMath;
