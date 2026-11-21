// Guide mode words for the Unit 4 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const ODE_STEPS = (extra) => [
  "Write your equation as **dy/dx = …** and type the right-hand side, e.g. `x + y`.",
  "Type the starting point: x₀ and the value y₀ there (for y(0) = 1: x₀ = `0`, y₀ = `1`).",
  "Type the step size h and the x where you want y.",
  ...(extra ? [extra] : []),
  "Press {button} to see a row for every step.",
];

const GUIDES = {
  rk2: { howTo: ODE_STEPS("Choose Heun's or the midpoint version, whichever your syllabus uses.") },
  milne: { howTo: ODE_STEPS("Milne needs four starting values; NETZ makes them with Runge-Kutta and then predicts and corrects.") },
  adams: { howTo: ODE_STEPS('Adams needs four starting values; NETZ makes them with Runge-Kutta and then predicts and corrects.') },
  cholesky: {
    howTo: [
      "Pick the size of A and type its numbers. A must be **symmetric**: the number in row i, column j equals the one in row j, column i.",
      "Optionally type b to also solve Ax = b.",
      "Press {button} to get L with A = L·Lᵀ and every step.",
    ],
    help: {
      matrix: "Type each number of A in its box. Fractions like `1/2` are fine.",
      b: "Optional: the right-hand side numbers, separated by commas, to solve Ax = b.",
    },
  },
  'jacobi-eigen': {
    howTo: [
      "Pick the size of A and type its numbers. A must be **symmetric** (row i, column j equals row j, column i).",
      "Leave the stopping value as it is unless your question gives one.",
      "Press {button}. Each rotation removes the largest number off the diagonal; the eigenvalues end up on the diagonal.",
    ],
    help: {
      matrix: "Type each number of A in its box.",
      tol: "Stop once every number off the diagonal is smaller than this.",
    },
  },
  qr: {
    howTo: [
      "Choose what to find: the QR factors, or eigenvalues by QR iteration.",
      "Pick the size of A and type its numbers.",
      "Press {button} to see each Gram–Schmidt step (or each iteration).",
    ],
    help: {
      matrix: "Type each number of A in its box.",
      mode: "QR factors: A = Q·R. Eigenvalues: repeat A = QR, A ← RQ until A becomes triangular.",
    },
  },
  'conjugate-gradient': {
    howTo: [
      "Type the matrix A row by row, with spaces between numbers and `;` between rows: `4 1; 1 3`. A must be symmetric.",
      "Type b, the right-hand side, e.g. `1 2`.",
      "Press {button} to see each step. In exact arithmetic it finishes in at most n steps for an n × n matrix.",
    ],
    help: {
      A: "Rows separated by `;`, numbers by spaces: `4 1; 1 3`. Must be symmetric.",
      b: "The right-hand side numbers: `1 2`.",
      x0: "Starting guess. Leave empty to start from all zeros.",
      tol: "Stop when the error is below this.",
    },
  },
  'finite-difference-bvp': {
    howTo: [
      "Write your equation as **y'' + p(x) y' + q(x) y = r(x)** and type p, q and r. For y'' − y = 0: p = `0`, q = `-1`, r = `0`.",
      "Type the interval a to b and the end values y(a) and y(b).",
      "Choose how many equal intervals n to split into, then press {button}.",
    ],
    help: {
      p: "What multiplies y' (type `0` if there is no y' term).",
      q: "What multiplies y (type `0` if there is no y term).",
      r: "The right-hand side (type `0` if there is none).",
      a: "Left end of the interval.",
      b: "Right end of the interval.",
      ya: "The value of y at the left end.",
      yb: "The value of y at the right end.",
      n: "Number of equal intervals. More intervals: more accurate, more equations.",
      exact: "Optional: the exact solution, to compare the error at each point.",
    },
    maths: ['p', 'q', 'r', 'exact'],
  },
  'heat-equation': {
    howTo: [
      "Choose the scheme: **Bender–Schmidt** (simple, fixed time step) or **Crank–Nicolson** (any time step).",
      "Type the starting temperature along the rod, u(x, 0), e.g. `4x - x^2`, and the rod's length L.",
      "Type c², the step sizes and the temperatures kept at the two ends.",
      "Press {button} to see the table of temperatures, one row per time step.",
    ],
    help: {
      method: "Bender–Schmidt fixes k = h²/(2c²). Crank–Nicolson lets you choose k.",
      f: "The temperature along the rod at the start, in x: `4x - x^2`.",
      L: "The length of the rod.",
      c2: "The constant c² in uₜ = c² uₓₓ.",
      h: "The step in x (the space between grid points).",
      k: "The step in time. Leave empty to use h²/c².",
      g0: "The temperature kept at the left end, x = 0.",
      g1: "The temperature kept at the right end, x = L.",
      steps: "How many time steps (rows) to compute.",
    },
    maths: ['f'],
  },
  'laplace-liebmann': {
    howTo: [
      "Choose how many squares per side the plate is divided into.",
      "Type the temperature on each side: one number fills the whole side.",
      "Press {button}. Each interior point becomes the average of its four neighbours until the values stop changing.",
    ],
    help: {
      n: "How many squares along each side. 4 gives 9 interior points.",
      tol: "Stop when no value changes by more than this.",
      top: "The temperature along the top edge (one number), or one value per grid point.",
      bottom: "The temperature along the bottom edge.",
      left: "The temperature along the left edge, top to bottom.",
      right: "The temperature along the right edge, top to bottom.",
    },
  },
  'shooting-method': {
    howTo: [
      "Write the equation as **y'' = F(x, y, y')** and type F. Use `y'` for the first derivative: `-y' + x`.",
      "Type the interval a to b and the end values y(a) and y(b).",
      "Type two guesses for the starting slope y'(a); NETZ adjusts them until the far end hits y(b).",
      "Press {button}.",
    ],
    help: {
      F: "The right-hand side of y'' = …, using x, y and y'.",
      a: "Left end.",
      b: "Right end.",
      ya: "y at the left end.",
      yb: "y at the right end (the target).",
      s0: "First guess for the slope y'(a).",
      s1: "Second guess, different from the first.",
      n: "Runge-Kutta steps for each shot. 10 is usually enough.",
    },
    maths: ['F'],
  },
  'wave-equation': {
    howTo: [
      "Type the string's starting shape u(x, 0), e.g. `x(4 - x)`, and its starting speed (usually `0`).",
      "Type the length L, the wave speed c and the step h.",
      "Press {button} to see the displacement table, one row per time step.",
    ],
    help: {
      f: "The starting shape of the string, in x: `x(4 - x)`.",
      g: "The starting speed of each point, in x. Usually `0` (released from rest).",
      L: "The length of the string.",
      c: "The wave speed c in uₜₜ = c² uₓₓ.",
      h: "The step in x.",
      k: "The time step. Leave empty for k = h/c, the usual choice.",
      steps: "How many time steps (rows).",
    },
    maths: ['f', 'g'],
  },
  'power-method': {
    howTo: [
      "Pick the size of A and type its numbers.",
      "Type a starting vector, e.g. `1, 1, 1` (it must not be all zeros).",
      "Press {button}. Each round multiplies by A and divides by the largest entry; that number tends to the largest eigenvalue.",
    ],
  },
};

export default GUIDES;
