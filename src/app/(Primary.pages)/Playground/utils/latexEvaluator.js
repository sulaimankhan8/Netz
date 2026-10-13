/**
 * Live "=" Evaluator for Recognised Handwriting (Apple Math Notes parity)
 *
 * Turns the LaTeX / plain math text produced by the recognition pipeline into a
 * mathjs expression and evaluates it when the user ends a line with "=".
 *
 * The recognisers are left untouched: all normalisation happens here, on their output.
 *   - HMER emits one token per digit, joined with spaces ("2 4 \times 5 =")
 *   - LaTeX structure (\frac, \sqrt, ^{...}) is converted with the same
 *     extractExpressionFromLatex() the Graph and CAS blocks already use
 */

import { evaluateMath } from '../../../utils/evaluateMath.js';
import { extractExpressionFromLatex } from './equationToGraph.js';
import { scopeManager } from './scopeManager.js';

/**
 * Formats a numeric result for display, hiding floating point noise (0.1 + 0.2 -> 0.3).
 */
function formatResult(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (Number.isInteger(value)) return String(value);
  return String(parseFloat(value.toPrecision(10)));
}

/**
 * Converts a recognised expression ending in "=" into a mathjs-evaluable string.
 *
 * @param {string} latexStr - e.g. "2 4 \\times 5 =", "\\frac{3}{4}+2="
 * @returns {string} mathjs expression, or '' when the input cannot be evaluated
 */
export function latexToEvaluableExpression(latexStr) {
  if (!latexStr || typeof latexStr !== 'string') return '';

  let str = latexStr.trim().replace(/\s*=\s*$/, '').trim();
  if (!str) return '';

  // "y = 2 + 3 =" -> evaluate the right-most side
  if (str.includes('=')) {
    str = str.slice(str.lastIndexOf('=') + 1).trim();
    if (!str) return '';
  }

  // Re-join numbers the decoder split into single-digit tokens: "2 4" -> "24", "3 . 5" -> "3.5"
  str = str.replace(/(\d)\s*\.\s*(?=\d)/g, '$1.');
  str = str.replace(/(\d)\s+(?=\d)/g, '$1');

  // Operators and spacing commands extractExpressionFromLatex does not cover
  str = str.replace(/\\div/g, '/');
  str = str.replace(/÷/g, '/');
  str = str.replace(/×/g, '*');
  str = str.replace(/−/g, '-');
  str = str.replace(/\\%/g, '/100');
  str = str.replace(/\\[,;:! ]/g, ' ');

  // extractExpressionFromLatex only converts innermost groups, so nested structure
  // (\frac{2^{3}}{4}, \frac{\sqrt{16}}{2}) is resolved from the inside out.
  let expr = str;
  for (let pass = 0; pass < 6; pass++) {
    const next = extractExpressionFromLatex(expr.replace(/\^\{([^{}]*)\}/g, '^($1)'));
    if (next === expr) break;
    expr = next;
  }

  // Remaining grouping braces become parentheses
  expr = expr.replace(/\{/g, '(').replace(/\}/g, ')');

  // Any LaTeX command still present has no numeric meaning here
  if (/\\/.test(expr)) return '';

  return expr.trim();
}

/**
 * Evaluates a recognised expression if it ends with "=".
 * Symbols defined in Equation Blocks (a = 5) are taken from the shared CAS scope;
 * an expression with an undefined variable has no single answer and returns null.
 *
 * @param {string} latexStr - LaTeX or plain math expression
 * @returns {string|null} Evaluated result string, or null if not evaluable
 */
export function evaluateLatexExpression(latexStr) {
  if (!latexStr || typeof latexStr !== 'string') return null;
  if (!latexStr.trim().endsWith('=')) return null;

  const expr = latexToEvaluableExpression(latexStr);
  if (!expr) return null;

  try {
    return formatResult(evaluateMath(expr, scopeManager.getScopeObject()));
  } catch (err) {
    // Evaluation failed — expression may be symbolic
    return null;
  }
}
