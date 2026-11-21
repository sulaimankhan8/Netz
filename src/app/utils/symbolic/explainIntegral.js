// One plain sentence for each kind of integration step: what is done and why, for someone meeting it for the first time.
// The integrator (symbolic/integral.js) names its steps; this turns the name into words. Used by engines/integral.js
// and any engine that shows integration steps. Standard: docs/methods/METHOD_PAGES_TEACHING_PLAN.md, section 2.

const RULES = [
  [/^Integrate term by term/, 'An integral of a sum is the sum of the integrals, so each term is integrated on its own and the answers are added.'],
  [/^Take the constant outside/, 'A number multiplying the function can be moved outside the integral sign; we integrate what is left and multiply back at the end.'],
  [/^Take out the minus sign/, 'A minus sign is a multiplication by −1, so it moves outside the integral like any other constant.'],
  [/^Constant rule/, 'The integral of a plain number k is k times the variable, because the derivative of kx is k.'],
  [/^Power rule \(linear inside\)/, 'For a power of (ax + b): raise the power by one, divide by the new power, and also divide by a, the number in front of x inside the bracket.'],
  [/^Power rule/, 'Raise the power by one and divide by the new power. Check: differentiating brings the power back down.'],
  [/^Exponential rule \(base a\)/, 'For aˣ, the answer is aˣ divided by ln a, because the derivative of aˣ is aˣ·ln a.'],
  [/^Exponential rule/, 'eˣ is its own derivative, so it is its own integral; with eᵃˣ⁺ᵇ we also divide by a.'],
  [/^Standard integral: 1\/x/, 'The integral of 1/x is ln|x|: the absolute value is there because x can be negative.'],
  [/^Standard integral/, 'This matches a formula from the standard integrals table (shown on the right); we copy the answer, putting our numbers in place of a.'],
  [/^Expand first/, 'Multiplying out the brackets turns the integrand into a sum of simple powers, which the power rule handles one by one.'],
  [/^Substitution/, 'The integrand contains a function and (a multiple of) its derivative. Calling that function u turns the integral into a simpler one in u; at the end, u is replaced by what it stands for.'],
  [/^Integration by parts \(tabular method\)/, 'Parts would be needed several times, so the tabular method does it in one table: differentiate u down one column until it reaches 0, integrate dv down the other, and multiply along the diagonals with alternating signs.'],
  [/^Integration by parts twice/, 'Using parts twice brings the original integral back. Calling it I and solving the equation for I gives the answer.'],
  [/^Integration by parts/, 'The integrand is a product. Choose u by ILATE (Inverse trig, Log, Algebraic, Trig, Exponential), the rest is dv, then use ∫u dv = uv − ∫v du: the new integral is simpler than the old one.'],
  [/^Partial fractions/, 'A fraction of polynomials is split into simpler fractions (one for each factor of the bottom), each of which has a standard integral.'],
  [/^The top is the derivative of the bottom/, 'When the top of a fraction is the derivative of the bottom, the integral is ln|bottom|, because differentiating ln|f(x)| gives f′(x)/f(x).'],
  [/^Use the identity sin²x/, 'sin²x has no direct formula, but the half-angle identity turns it into 1 and cos 2x, which both integrate easily.'],
  [/^Use the identity cos²x/, 'cos²x has no direct formula, but the half-angle identity turns it into 1 and cos 2x, which both integrate easily.'],
  [/^Use the identity tan²x/, 'tan²x is rewritten as sec²x − 1, because sec²x is the derivative of tan x and has a standard integral.'],
  [/^Use sin² = 1 − cos²/, 'Replacing sin² by 1 − cos² leaves terms whose integrals are standard (or ready for a substitution).'],
  [/^Even powers/, 'Even powers of sin and cos are lowered with the half-angle identities until every term is a standard integral.'],
  [/^Odd power/, 'With an odd power, save one sin (or cos) for the derivative and write the rest in terms of the other function; then substitute t for it.'],
  [/^Product to sum/, 'A product of sines and cosines is rewritten as a sum using the product-to-sum identities, because each term of the sum has a standard integral.'],
  [/^Combine the powers of e/, 'eᵃ·eᵇ = eᵃ⁺ᵇ, so the exponentials are joined into one before integrating.'],
  [/^Rewrite the integrand/, 'The integrand is rewritten in an equal but easier form before integrating.'],
];

/** The plain sentence for a step title, or null if none fits. */
export function explainIntegralStep(title = '') {
  const hit = RULES.find(([re]) => re.test(title));
  return hit ? hit[1] : null;
}

/** Adds text to each step that has none. */
export function withIntegralText(steps = []) {
  return steps.map((s) => (s && !s.text ? { ...s, text: explainIntegralStep(s.title) || undefined } : s));
}
