// Guide mode words for the Unit 12 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const EQ = "The equation as in your book. Write dy/dx as `dy/dx` or `y'`, and d²y/dx² as `y''`.";
const ICS = "Optional: starting values to find the constants, e.g. `y(0) = 1, y'(0) = 0`.";
const ode = (example, what) => ({
  howTo: [
    `Type the differential equation, e.g. \`${example}\`. Use \`y'\` for dy/dx and \`y''\` for d²y/dx².`,
    "Optionally type initial conditions to get the particular solution.",
    `Press {button}. ${what}`,
  ],
  help: { eq: EQ, ics: ICS },
  maths: ['eq'],
});

const GUIDES = {
  'ode-solver': ode('dy/dx + y/x = x^2', 'NETZ recognises the type of equation and solves it with steps.'),
  'linear-ode': ode('dy/dx + y/x = x^2', 'NETZ finds the integrating factor e^(∫P dx) and solves.'),
  'ode-cc': ode("y'' - 3y' + 2y = e^(3x)", 'You get the auxiliary equation, the CF, the PI and the general solution.'),
  'cauchy-euler': ode("x^2 y'' - x y' + y = log(x)", 'NETZ puts x = eᶻ to get constant coefficients, then solves.'),
  bernoulli: { ...ode('dy/dx + y/x = x^2 y^6', 'NETZ divides by yⁿ and substitutes v = y¹⁻ⁿ.'), howTo: ['Type the equation, e.g. `dy/dx + y/x = x^2 y^6`.', 'Press {button}. NETZ divides by yⁿ and substitutes v = y¹⁻ⁿ to make it linear.'] },
  'exact-ode': { howTo: ['Type the equation in the form M dx + N dy = 0: `(2xy + 3) dx + (x^2 - 1) dy = 0`.', 'Press {button}. NETZ checks ∂M/∂y = ∂N/∂x (or finds an integrating factor) and solves.'], help: { eq: 'Written with dx and dy.' }, maths: ['eq'] },
  'homogeneous-ode': { howTo: ['Type dy/dx = …, e.g. `dy/dx = (x + y)/x`.', 'Press {button}. NETZ substitutes y = vx and separates the variables.'], help: { eq: EQ }, maths: ['eq'] },
  'variable-separable': { howTo: ['Type the equation, e.g. `dy/dx = x y`.', 'Press {button}. NETZ moves all y to one side and all x to the other, then integrates.'], help: { eq: EQ }, maths: ['eq'] },
  'variation-of-parameters': { howTo: ["Type the second-order equation, e.g. `y'' + y = sec(x)`.", 'Press {button}. NETZ finds the CF, the Wronskian and the particular integral.'], help: { eq: EQ }, maths: ['eq'] },
  'series-solution-ode': {
    howTo: ["Type the equation set equal to 0: `y'' + x y' + y = 0`.", 'Choose up to which power of x.', 'Press {button} for the recurrence relation and the series.'],
    help: { eq: 'The equation, with = 0.', terms: 'Keep terms up to xⁿ.' }, maths: ['eq'],
  },
  'simultaneous-differential-equations': {
    howTo: ['Type the two equations: `dx/dt = 2x + y` and `dy/dt = x + 2y`.', 'Optionally type starting values.', 'Press {button}.'],
    help: { eq1: 'The first equation in t.', eq2: 'The second equation in t.', ics: 'Optional: `x(0) = 1, y(0) = 0`.' }, maths: ['eq1', 'eq2'],
  },
  'clairaut-equation': { howTo: ['Type the equation using p for dy/dx: `y = px + p^2`.', 'Press {button} for the general and the singular solution.'], help: { eq: 'Use p for dy/dx.' }, maths: ['eq'] },
  'charpit-method': { howTo: ['Type the PDE using p = ∂z/∂x and q = ∂z/∂y: `p^2 + q^2 = x + y`.', "Press {button}. NETZ writes Charpit's auxiliary equations and solves."], help: { eq: 'Use p and q.' }, maths: ['eq'] },
  'lagrange-linear-pde': { howTo: ['Type the equation in the form Pp + Qq = R: `x^2 p + y^2 q = z^2`.', 'Press {button}. NETZ solves dx/P = dy/Q = dz/R.'], help: { eq: 'Use p = ∂z/∂x and q = ∂z/∂y.' }, maths: ['eq'] },
  'pde-constant-coefficients': { howTo: ["Type the equation with D = ∂/∂x and D' = ∂/∂y: `(D^2 - 2DD' + D'^2)z = e^(x + y)`.", 'Press {button} for the CF and the PI.'], help: { eq: "Use D and D'." }, maths: ['eq'] },
  'formation-of-pde': {
    howTo: ['Choose what to eliminate: constants or an arbitrary function.', 'Type the relation, e.g. `z = (x - a)^2 + (y - b)^2`.', 'Press {button}.'],
    help: { mode: 'Constants like a, b, or a function like f(x² + y²).', z: 'The relation for z.' }, maths: ['z'],
  },
  'separation-of-variables': {
    howTo: ['Choose the equation: heat, wave or Laplace.', 'Type the starting shape f(x) (and g(x) for the wave equation), and the size.', 'Press {button} for the series solution.'],
    help: {
      kind: 'Which partial differential equation.', f: 'The starting temperature or shape, in x: `x(pi - x)`.',
      g: 'Optional: the starting speed, for the wave equation.', L: 'The length (or width).', c: 'The constant in the equation.', b: 'The height of the plate (Laplace).',
    },
    maths: ['f', 'g'],
  },
  'ode-applications': {
    howTo: ['Choose the application: cooling, growth and decay, or an electric circuit.', 'Type the numbers from the question.', 'Optionally ask for the value at a time, or the time to reach a value. Press {button}.'],
    help: {
      mode: "Newton's cooling, population growth, radioactive decay, LR/RC/LRC circuits.",
      Ts: 'Temperature of the surroundings.', T0: 'Temperature at the start.', N0: 'Amount at the start.',
      how: 'How the rate is given: a second reading or a half-life.', t1: 'Time of the second reading.', T1: 'Temperature at that time.', N1: 'Amount at that time.',
      half: 'Half-life (decay) or doubling time (growth).', L: 'Inductance, henries.', R: 'Resistance, ohms.', C: 'Capacitance, farads.',
      E: 'The voltage, a number or a formula in t.', q0: 'Charge at t = 0.', i0: 'Current at t = 0.', at: 'Optional: the time you want the value at.', target: 'Optional: the value you want the time for.',
    },
    maths: ['E'],
  },
};

export default GUIDES;
