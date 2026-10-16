/**
 * Examples to try the equation block's CAS actions (the AI menu) with. Picking one puts it in
 * the equation and runs that action. Each was run through the action and gives a correct result
 * (2026-10-16); equations the actions do not handle yet are left out (for example a product to
 * integrate, such as x sin x, or a non-zero right-hand side to solve, such as 2x + 3 = 7).
 */
export const CAS_EXAMPLES = [
  {
    action: 'PLOT_GRAPH',
    label: 'Plot Graph',
    items: [
      { name: 'Parabola', latex: 'y=x^2-4x+3' },
      { name: 'Sine wave', latex: 'y=\\sin\\left(x\\right)' },
      { name: 'Cubic', latex: 'y=\\frac{1}{2}x^3-2x' },
      { name: 'Bell curve', latex: 'y=e^{-x^2}' },
      { name: 'Square root', latex: 'y=\\sqrt{x}' },
      { name: 'Absolute value', latex: 'y=\\left|x\\right|' },
    ],
  },
  {
    action: 'DIFFERENTIATE',
    label: 'Differentiate',
    items: [
      { name: 'Polynomial', latex: 'x^3-3x^2+2' },
      { name: 'Quartic', latex: 'x^4-2x' },
      { name: 'Product of sine and cosine', latex: '\\sin\\left(x\\right)\\cos\\left(x\\right)' },
      { name: 'Natural log', latex: '\\ln\\left(x\\right)' },
      { name: 'Tangent', latex: '\\tan\\left(x\\right)' },
    ],
  },
  {
    action: 'INTEGRATE',
    label: 'Integrate',
    items: [
      { name: 'Polynomial', latex: '3x^2+2x' },
      { name: 'Cube', latex: 'x^3' },
      { name: 'Cosine', latex: '\\cos\\left(x\\right)' },
      { name: 'Exponential', latex: 'e^x' },
      { name: 'Arctangent integrand', latex: '\\frac{1}{1+x^2}' },
    ],
  },
  {
    action: 'FIND_ROOTS',
    label: 'Find Roots / Solve',
    items: [
      { name: 'Two roots', latex: 'x^2-5x+6' },
      { name: 'Equation equal to zero', latex: 'x^2-x-6=0' },
      { name: 'Three roots', latex: 'x^3-6x^2+11x-6' },
      { name: 'Double root', latex: 'x^2+2x+1' },
      { name: 'Irrational roots', latex: 'x^2-2' },
      { name: 'Root at zero', latex: 'x^3-x' },
    ],
  },
];
