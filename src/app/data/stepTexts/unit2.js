// Plain-words sentences for the Unit 2 calculators' working steps (see src/app/components/method/calcGuide.js, withStepText).
// id: { 'Step title (or its start)': 'One sentence: what this step does and why.' }
const TEXTS = {
  'everett-interpolation': {
    'p and q': 'p measures how far x is past x₀ in steps of h; q = 1 − p measures how far it is before x₁. Everett uses both symmetrically.',
    "Everett's formula": 'Everett uses only even differences (δ², δ⁴, …) from the two rows either side of x: a weighted mix of y₀ and y₁, then corrections from their second differences.',
  },
  'hermite-interpolation': {
    'Repeated nodes': 'Hermite matches both the value and the slope at each point, so each x is written twice; a divided difference over a repeated x is the given slope f′(x).',
    'Divided differences': 'Build the divided difference table on the repeated list; the top entries are the coefficients, exactly as in Newton’s divided difference formula.',
    'Hermite polynomial': "Newton's form with the repeated points, multiplied out: this polynomial has the right value and the right slope at every point.",
    'At x =': 'Put the x you asked for into the polynomial.',
  },
  'chebyshev-nodes': {
    'Chebyshev nodes': 'Chebyshev points crowd towards the ends of the interval; this spacing keeps the interpolation error small everywhere.',
    'Equally spaced nodes': 'For comparison, the same number of equally spaced points.',
    'Largest error': 'The biggest gap between f and each interpolating polynomial on the interval. Equal spacing can wiggle badly near the ends (Runge’s phenomenon); Chebyshev points do not.',
  },
  'inverse-interpolation': {
    'Successive': 'Newton’s forward formula is solved for p by repeated substitution: start with p from the first difference, put it back into the formula and repeat until it settles.',
  },
};

export default TEXTS;
