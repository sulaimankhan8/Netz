/**
 * Browser-Native Computer Algebra System (CAS) Engine
 * Leverages Math.js & Nerdamer for zero-API-cost symbolic math operations:
 * Differentiation, Integration, Simplification, and Root Finding.
 * Converts outputs into pure LaTeX math symbols (\sqrt{}, \sin, \cos, \theta, \alpha, \beta, \pi, etc.)
 */

import { getSymbolicDerivative, sanitizeMathString } from '../../../utils/evaluateMath';
import { extractExpressionFromLatex } from './equationToGraph';
import nerdamer from 'nerdamer';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';

/**
 * Converts raw computer math strings into beautiful LaTeX formatted strings.
 * e.g. "sqrt(4 + 4*y)" -> "\sqrt{4 + 4y}"
 * e.g. "alpha * sin(theta)" -> "\alpha \sin(\theta)"
 */
export function formatRawMathToTeX(mathStr) {
  if (!mathStr || typeof mathStr !== 'string') return '';

  let str = mathStr.trim();

  // Convert sqrt(...) -> \sqrt{...}
  while (/sqrt\(([^()]+)\)/i.test(str)) {
    str = str.replace(/sqrt\(([^()]+)\)/gi, '\\sqrt{$1}');
  }
  // Convert root(n, x) -> \sqrt[n]{x}
  while (/root\((\d+),\s*([^()]+)\)/i.test(str)) {
    str = str.replace(/root\((\d+),\s*([^()]+)\)/gi, '\\sqrt[$1]{$2}');
  }

  // Convert Greek letter names to LaTeX symbols: theta -> \theta, alpha -> \alpha, etc.
  const greeks = [
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
    'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
    'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Sigma', 'Omega', 'Phi'
  ];
  for (const g of greeks) {
    const re = new RegExp(`(?<!\\\\)\\b${g}\\b`, 'g');
    str = str.replace(re, `\\${g}`);
  }

  // Convert functions: sin, cos, tan, log, ln, asin, acos, atan, sec, csc, cot
  str = str.replace(/(?<!\\\\)\b(asin|acos|atan)\b/gi, (m) => `\\arc${m.slice(1).toLowerCase()}`);
  str = str.replace(/(?<!\\\\)\b(sin|cos|tan|log|ln|sec|csc|cot)\b/gi, (m) => `\\${m.toLowerCase()}`);

  // Convert multiplication * -> \cdot or clean spacing
  str = str.replace(/\s*\*\s*/g, ' ');

  // Clean up double backslashes
  str = str.replace(/\\\\+/g, '\\');

  return str;
}

/**
 * Computes symbolic derivative d/dx of a LaTeX string.
 */
export function differentiateExpression(latexStr, variable = 'x') {
  if (!latexStr) return '';
  try {
    const cleanExpr = extractExpressionFromLatex(latexStr);
    const sanitized = sanitizeMathString(cleanExpr);
    const derivative = getSymbolicDerivative(sanitized, variable);
    return `f'(${variable}) = ${formatRawMathToTeX(derivative)}`;
  } catch (err) {
    try {
      const cleanExpr = extractExpressionFromLatex(latexStr);
      const deriv = nerdamer(`diff(${cleanExpr}, ${variable})`).toTeX();
      return `f'(${variable}) = ${deriv}`;
    } catch {
      return `f'(${variable}) = \\frac{d}{d${variable}}(${latexStr})`;
    }
  }
}

/**
 * Computes symbolic indefinite integral \int f(x) dx of a LaTeX string using Nerdamer.
 */
export function integrateExpression(latexStr, variable = 'x') {
  if (!latexStr) return '';
  try {
    const cleanExpr = extractExpressionFromLatex(latexStr);
    let integralTeX = '';
    try {
      integralTeX = nerdamer(`integrate(${cleanExpr}, ${variable})`).toTeX();
    } catch {
      integralTeX = nerdamer(`integrate(${cleanExpr}, ${variable})`).text('latex');
    }
    return `\\int f(${variable})\\, d${variable} = ${integralTeX || formatRawMathToTeX(cleanExpr)} + C`;
  } catch (err) {
    return `\\int (${latexStr})\\, d${variable} + C`;
  }
}

/**
 * Simplifies a mathematical expression string using Nerdamer / MathJS.
 */
export function simplifyExpression(latexStr) {
  if (!latexStr) return '';
  try {
    const cleanExpr = extractExpressionFromLatex(latexStr);
    let simplifiedTeX = '';
    try {
      simplifiedTeX = nerdamer(`simplify(${cleanExpr})`).toTeX();
    } catch {
      simplifiedTeX = nerdamer(`simplify(${cleanExpr})`).text('latex');
    }
    return simplifiedTeX || formatRawMathToTeX(latexStr);
  } catch (err) {
    return latexStr;
  }
}

/**
 * Solves f(x) = 0 for roots using Nerdamer solver.
 * Returns TeX array e.g. ["\sqrt{2}", "-\sqrt{2}"]
 */
export function solveRootsExpression(latexStr, variable = 'x') {
  if (!latexStr) return [];
  try {
    const cleanExpr = extractExpressionFromLatex(latexStr);
    const solutions = nerdamer.solve(cleanExpr, variable);

    if (solutions && solutions.elements) {
      return solutions.elements.map((el) => {
        try {
          return el.toTeX();
        } catch {
          return formatRawMathToTeX(el.text());
        }
      });
    }

    const textSolutions = solutions.text();
    return textSolutions
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => formatRawMathToTeX(s.trim()));
  } catch (err) {
    return [];
  }
}
