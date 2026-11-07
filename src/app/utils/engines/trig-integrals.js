/**
 * Trigonometric integrals: the maths for /trigonometric-integrals. The integral engine (engines/integral.js with
 * symbolic/integral.js) does the work: odd powers of sin or cos (substitute t = cos x or sin x), even powers
 * (half-angle forms), sinᵐx cosⁿx, sec²/csc², sec·tan, and the trigonometric-substitution results
 * √(a² − x²), √(x² ± a²), 1/√(x² ± a²). Every answer is checked by differentiating it back.
 */
export { solve } from './integral';
