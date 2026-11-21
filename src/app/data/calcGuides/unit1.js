// Guide mode words for the Unit 1 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for.
const GUIDES = {
  sor: {
    howTo: [
      "Write your equations with the unknowns in the same order, e.g. `4x + 3y + 0z = 24`. Pick the size of A (3×3 for three unknowns), then type the **numbers in front of x, y, z** into grid A, one equation per row. A missing unknown is `0`.",
      "Type the **numbers after the = sign** into Right-hand side b, top to bottom, separated by commas.",
      "Leave ω, tolerance and max iterations as they are unless your question gives other values.",
      "Press {button} to get each unknown and a table of every iteration.",
    ],
    help: {
      b: "The number after the = sign of each equation, top to bottom: `24, 30, -24`.",
      omega: "The relaxation factor ω (omega): how far each step pushes past Gauss-Seidel. `1` is plain Gauss-Seidel; 1.1 to 1.5 is usually faster. Keep it between 0 and 2.",
      tol: "When to stop: once no unknown changes by more than this. `0.0001` gives about 4 correct decimals.",
      maxIter: "A safety limit: the most rounds to try before giving up. 100 is plenty.",
    },
  },
  'bairstow-method': {
    howTo: [
      "Write your polynomial with **every power**, highest first, and type only the numbers in front of them. For x⁴ − 1.1x³ + 2.3x² + 0.5x + 3.3 type `1 -1.1 2.3 0.5 3.3`. A missing power is `0`.",
      "Bairstow pulls out one quadratic factor x² − r x − s at a time. Type a guess for r and s; `-1` and `-1` usually work.",
      "Press {button}. You get each quadratic factor, all the roots (real and complex) and every iteration.",
    ],
    help: {
      coeffs: "The numbers in front of each power of x, highest power first, separated by spaces. Put `0` for a missing power.",
      r0: "Your first guess for r in the factor x² − r x − s. Any small number; `-1` is a common start.",
      s0: "Your first guess for s in the same factor. `-1` is a common start.",
      tol: "When to stop: once r and s change by less than this. `1e-8` means 0.00000001.",
    },
  },
  'floating-point-representation': {
    howTo: [
      "Type any **decimal number**, such as `0.1` or `-13.625`.",
      "Choose the format: **single** (32-bit, `float`) or **double** (64-bit, `double`).",
      "Press {button} to see the sign, exponent and mantissa bits, and the rounding error.",
    ],
    help: {
      x: "The number to store, written normally: `0.1`, `-2.5`, `1e-3` (= 0.001).",
      format: "Single precision uses 32 bits (about 7 digits); double uses 64 bits (about 16 digits).",
    },
  },
  'golden-section': {
    howTo: [
      "Choose whether you want the **minimum** or the **maximum** of f.",
      "Type your function in x, e.g. `x^2 - 4x + 5`.",
      "Type an interval **a to b** where the function has just one lowest (or highest) point. A quick sketch helps.",
      "Press {button}. The interval shrinks by the golden ratio each step until it is narrower than your stopping width.",
    ],
    help: {
      goal: "Minimum: the lowest point of the curve. Maximum: the highest point.",
      f: "The function to search, written with x: `x^2 - 4x + 5`, `sin(x)`.",
      a: "The left end of the search interval.",
      b: "The right end of the search interval. It must be bigger than a.",
      tol: "Stop when the interval is narrower than this. `0.001` gives about 3 decimals.",
    },
    maths: ['f'],
  },
  'gradient-descent': {
    howTo: [
      "Type the function you want to make as **small** as possible, in x (and y if you like): `x^2 + 3y^2`.",
      "Type a starting point x₀ (and y₀ if f uses y).",
      "Choose the learning rate α: how big each downhill step is. Start with `0.1`.",
      "Press {button} to follow each step downhill to the lowest point.",
    ],
    help: {
      f: "The function to minimise, using x or x and y: `x^2 + 3y^2`.",
      x0: "Where to start in x. Any number; the answer should not depend on it for a bowl-shaped function.",
      y0: "Where to start in y. Only used when f contains y.",
      alpha: "The learning rate α: the size of each step. Too big and it jumps around; too small and it crawls. `0.1` is a good start.",
      steps: "The most steps to take. 20 to 100 is typical.",
    },
    maths: ['f'],
  },
  'graeffe-root-squaring': {
    howTo: [
      "Write your polynomial with every power, highest first, and type only the numbers in front: for x³ − 6x² + 11x − 6 type `1 -6 11 -6`.",
      "Choose how many times to square the roots; 3 or 4 is usual in exams.",
      "Press {button}. You get the table of squared coefficients and the size of each root.",
    ],
    help: {
      coeffs: "The numbers in front of each power of x, highest first, separated by spaces. A missing power is `0`.",
      m: "How many root-squaring rounds. More rounds separate the roots better; 3 is a good start.",
    },
  },
  'horner-method': {
    howTo: [
      "Write your polynomial with every power, highest first, and type only the numbers in front: for x³ + 3x − 5 type `1 0 3 -5` (the 0 is the missing x²).",
      "Choose how many decimal places you want the root to.",
      "Press {button}. Horner's method finds the root one digit at a time and shows each table.",
    ],
    help: {
      coeffs: "The numbers in front of each power of x, highest first. Put `0` for a missing power.",
      places: "How many digits after the decimal point to find. 2 or 3 is usual in exams.",
    },
  },
  'muller-method': {
    howTo: [
      "Type the equation's left side f(x), where you want f(x) = 0: for x³ − x − 1 = 0 type `x^3 - x - 1`.",
      "Type **three starting guesses** x₀, x₁, x₂ near the root (they need not bracket it).",
      "Press {button}. Each step fits a parabola through the last three points; complex roots are found too.",
    ],
    help: {
      f: "The function whose root you want, written with x: `x^3 - x - 1`.",
      x0: "First starting guess.",
      x1: "Second starting guess, different from the first.",
      x2: "Third starting guess, different from the other two.",
      tol: "Stop when the root changes by less than this. `1e-6` is 0.000001.",
      max: "The most iterations to try before giving up.",
    },
    maths: ['f'],
  },
  'newton-system': {
    howTo: [
      "Type each equation as it is in your book, e.g. `x^2 + y^2 = 4` and `x*y = 1`. Use a third equation (with z) only for three unknowns.",
      "Type a starting point close to the answer you want. A rough sketch of the curves helps you pick one.",
      "Press {button}. NETZ builds the Jacobian matrix and shows every Newton step.",
    ],
    help: {
      f1: "The first equation in x and y. Write a product of letters with *, like `x*y`.",
      f2: "The second equation, written the same way.",
      f3: "Only for three unknowns: a third equation that uses z. Leave empty for two equations.",
      x0: "Starting guess for x.",
      y0: "Starting guess for y.",
      z0: "Starting guess for z (only with three equations).",
      tol: "Stop when the answer changes by less than this.",
    },
    maths: ['f1', 'f2', 'f3'],
  },
};

export default GUIDES;
