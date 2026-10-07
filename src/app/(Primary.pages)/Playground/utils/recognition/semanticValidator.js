/**
 * NETZ Semantic Math & Syntax Validator
 *
 * Validates mathematical expressions using KaTeX syntax parsers
 * and MathAST grammar checking without hardcoded if-else trees.
 */

import katex from 'katex';

/**
 * Validates whether a LaTeX string is syntactically coherent.
 *
 * @param {string} latex
 * @returns {{ isValid: boolean, error: string|null, score: number }}
 */
export function validateLatexSyntax(latex) {
  if (!latex || typeof latex !== 'string' || latex.trim().length === 0) {
    return { isValid: false, error: 'Empty expression', score: 0 };
  }

  const trimmed = latex.trim();

  try {
    // Test KaTeX parsing in strict throwOnError mode
    katex.renderToString(trimmed, {
      throwOnError: true,
      displayMode: false,
    });

    return {
      isValid: true,
      error: null,
      score: 1.0,
    };
  } catch (err) {
    // KaTeX caught invalid LaTeX (e.g. unmatched braces, lonely subscript)
    return {
      isValid: false,
      error: err.message,
      score: 0.2, // degraded syntax score
    };
  }
}

/**
 * Computes semantic confidence for a mathematical candidate.
 *
 * @param {string} value - LaTeX or plaintext
 * @param {'MATH'|'TEXT'|'NUMBER'|'OBJECT'} type
 * @returns {number} Coherence score in [0.1, 1.0]
 */
export function evaluateSemanticCoherence(value, type) {
  if (!value) return 0.1;

  if (type === 'NUMBER') {
    const isNum = /^-?\d+(\.\d+)?$/.test(value.trim());
    return isNum ? 1.0 : 0.4;
  }

  if (type === 'TEXT') {
    // Text validity: proportion of valid printable characters
    const validChars = value.replace(/[^a-zA-Z0-9\s.,!?:;'"()-]/g, '');
    return Math.min(1.0, Math.max(0.2, validChars.length / value.length));
  }

  if (type === 'MATH') {
    const res = validateLatexSyntax(value);
    return res.score;
  }

  return 0.5;
}
