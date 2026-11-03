/**
 * Every method page NETZ has, in menu order. This is the one place a method is declared:
 * the side bar, phone menu, previous/next links, sitemap and phone test all read from here.
 * Adding a method = one entry here + its page folder (METHODS_IMPLEMENTATION_PLAN.md, step A1).
 *
 * Fields:
 *   id       same id the page records with useRecordSolve, and the rewards (progress/catalog.js) use
 *   route    the page URL
 *   unit     unit number (1–15), see UNITS
 *   category sub-group inside the unit's menu, or null for a top-level item
 *   name     menu name
 *   engine   'num' numeric | 'sym' symbolic | 'rate' needs the rates file
 *   batch    0 = live before the catalog; 1–4 = build batch in NETZ_METHODS_CATALOG.md
 *   status   'live' (in menus and sitemap) | 'building' (page exists, hidden) | 'planned'
 *   lastmod  last real content change, for the sitemap (YYYY-MM-DD)
 */

export const UNITS = [
  { unit: 1, id: 'unit-1', title: 'Unit 1: Equations & Systems', shortTitle: 'Unit 1', description: 'Root Finding & Linear Systems' },
  { unit: 2, id: 'unit-2', title: 'Unit 2: Interpolation', shortTitle: 'Unit 2', description: 'Equal & Unequal Intervals' },
  { unit: 3, id: 'unit-3', title: 'Unit 3: Differentiation & Integration', shortTitle: 'Unit 3', description: 'Calculus & Quadrature Rules' },
  { unit: 4, id: 'unit-4', title: 'Unit 4: Matrix Methods & ODEs', shortTitle: 'Unit 4', description: 'Linear Algebra & Differential Equations' },
  { unit: 5, id: 'unit-5', title: 'Unit 5: Curve Fitting & Hypothesis Testing', shortTitle: 'Unit 5', description: 'Regression & Statistical Tests' },
  // New units from NETZ_METHODS_CATALOG.md. A unit shows in the menus once it has a live method.
  { unit: 6, id: 'unit-6', title: 'Unit 6: Calculus', shortTitle: 'Unit 6', description: 'Limits, Derivatives & Integrals' },
  { unit: 7, id: 'unit-7', title: 'Unit 7: Algebra', shortTitle: 'Unit 7', description: 'Equations, Polynomials & Series' },
  { unit: 8, id: 'unit-8', title: 'Unit 8: Matrices & Linear Algebra', shortTitle: 'Unit 8', description: 'Determinants, Inverse, Rank & Eigenvalues' },
  { unit: 9, id: 'unit-9', title: 'Unit 9: Geometry & Trigonometry', shortTitle: 'Unit 9', description: 'Shapes, Triangles & Coordinates' },
  { unit: 10, id: 'unit-10', title: 'Unit 10: Interest & Finance', shortTitle: 'Unit 10', description: 'Percentages, Interest & Loans' },
  { unit: 11, id: 'unit-11', title: 'Unit 11: Taxes', shortTitle: 'Unit 11', description: 'GST, VAT & Income Tax' },
  { unit: 12, id: 'unit-12', title: 'Unit 12: Differential Equations', shortTitle: 'Unit 12', description: 'ODEs & PDEs (Analytical)' },
  { unit: 13, id: 'unit-13', title: 'Unit 13: Transforms', shortTitle: 'Unit 13', description: 'Laplace, Fourier & Z' },
  { unit: 14, id: 'unit-14', title: 'Unit 14: Complex Variables', shortTitle: 'Unit 14', description: 'Analytic Functions & Residues' },
  { unit: 15, id: 'unit-15', title: 'Unit 15: Discrete Maths & Optimisation', shortTitle: 'Unit 15', description: 'Logic, Graphs & Linear Programming' },
];

/**
 * What Google and AI assistants read (NETZ_METHODS_CATALOG.md, ⭐ section):
 *   title        browser-tab title; the layout adds " — NETZ"
 *   description  meta description, about 150 characters, saying what the page does
 *   searchWords  what people type: other names and textbook names (for the intro and FAQ, not a keyword list)
 */
const SEO = {
  bisection: ['Bisection Method Calculator with Steps',
    'Find a root of f(x) = 0 by the bisection (interval halving) method. Enter f(x) and get every iteration in an exam-style table, with a graph.',
    ['bisection method', 'interval halving', 'bolzano method', 'root of equation']],
  secant: ['Secant Method Calculator with Steps',
    'Solve f(x) = 0 by the secant method from two starting guesses. Every iteration is shown in an exam-style table, with a graph. No derivative needed.',
    ['secant method', 'root finding', 'two point method']],
  'fixed-point': ['Iteration Method Calculator with Steps (Fixed-Point)',
    'Solve f(x) = 0 by the iteration method x = φ(x), also called fixed-point iteration. See every step in an exam-style table, with a graph.',
    ['iteration method', 'fixed point iteration', 'successive approximation']],
  'false-position': ['False Position (Regula Falsi) Calculator with Steps',
    'Find a root of f(x) = 0 by the method of false position (regula falsi). Every iteration is shown in an exam-style table, with a graph.',
    ['regula falsi', 'false position', 'method of false position']],
  'newton-raphson': ['Newton-Raphson Method Calculator with Steps',
    'Solve f(x) = 0 by the Newton-Raphson method. Enter your function and get every iteration in an exam-style table, with a graph.',
    ['newton raphson', "newton's method", 'nr method', 'root finding']],
  'gauss-seidel': ['Gauss-Seidel Method Calculator with Steps',
    'Solve a system of linear equations by the Gauss-Seidel iterative method. See every iteration in an exam-style table until the values converge.',
    ['gauss seidel', 'iterative method linear equations']],

  'newton-forward': ['Newton Forward Interpolation Calculator with Steps',
    "Interpolate equally spaced data with Newton's forward difference formula. Builds the forward difference table and shows every term, with a graph.",
    ['newton forward', 'forward difference', 'interpolation']],
  'newton-backward': ['Newton Backward Interpolation Calculator with Steps',
    "Interpolate near the end of equally spaced data with Newton's backward difference formula. Shows the difference table and every term, with a graph.",
    ['newton backward', 'backward difference', 'interpolation']],
  'gauss-forward': ['Gauss Forward Interpolation Calculator with Steps',
    "Interpolate near the middle of equally spaced data with Gauss's forward formula. Shows the difference table and every term, with a graph.",
    ['gauss forward', 'central difference', 'interpolation']],
  'gauss-backward': ['Gauss Backward Interpolation Calculator with Steps',
    "Interpolate near the middle of equally spaced data with Gauss's backward formula. Shows the difference table and every term, with a graph.",
    ['gauss backward', 'central difference', 'interpolation']],
  'newton-divided': ['Newton Divided Difference Calculator with Steps',
    "Interpolate unequally spaced data with Newton's divided difference formula. Builds the divided difference table and every term, with a graph.",
    ['divided difference', 'newton divided difference', 'unequal intervals']],
  lagrange: ['Lagrange Interpolation Calculator with Steps',
    "Interpolate unequally spaced data with Lagrange's formula. See each basis term Lᵢ(x), the interpolated value and a graph, step by step.",
    ['lagrange', 'lagrange interpolation', 'unequal intervals']],

  'numerical-differentiation': ['Numerical Differentiation Calculator with Steps',
    'Find derivatives from a function or a table of values with central difference formulas. See the difference table and every step of the working.',
    ['numerical differentiation', 'central difference', 'finite difference derivative']],
  trapezoidal: ['Trapezoidal Rule Calculator with Steps',
    'Evaluate a definite integral by the trapezoidal rule. Enter f(x), the limits and the strips to get the table of values and every step, with a graph.',
    ['trapezoidal rule', 'trapezium rule', 'trapezoid rule']],
  'simpson-13': ["Simpson's 1/3 Rule Calculator with Steps",
    "Evaluate a definite integral by Simpson's 1/3 rule. Get the table of ordinates and every step of the working, with a graph.",
    ['simpson 1/3', 'simpsons rule', 'numerical integration']],
  'simpson-38': ["Simpson's 3/8 Rule Calculator with Steps",
    "Evaluate a definite integral by Simpson's 3/8 rule. Get the table of ordinates and every step of the working, with a graph.",
    ['simpson 3/8', 'simpsons rule', 'numerical integration']],
  boole: ["Boole's Rule Calculator with Steps",
    "Evaluate a definite integral by Boole's rule, which needs a multiple of 4 strips. Shows the table of ordinates and every step, with a graph.",
    ["boole's rule", 'boole rule', 'numerical integration']],
  weddle: ["Weddle's Rule Calculator with Steps",
    "Evaluate a definite integral by Weddle's rule, which needs a multiple of 6 strips. Shows the table of ordinates and every step, with a graph.",
    ["weddle's rule", 'weddle rule', 'numerical integration']],
  'gauss-quadrature': ['Gauss Quadrature Calculator with Steps',
    'Evaluate a definite integral by Gauss-Legendre quadrature. See the change of limits, the nodes and weights, and every step of the sum.',
    ['gauss quadrature', 'gauss legendre', 'gaussian quadrature']],

  'gauss-elimination': ['Gauss Elimination Calculator with Steps',
    'Solve a system of linear equations by Gaussian elimination. See every row operation, the upper triangular matrix and the back substitution.',
    ['gauss elimination', 'gaussian elimination', 'row reduction', 'linear equations']],
  'gauss-jordan': ['Gauss-Jordan Elimination Calculator with Steps',
    'Solve a system of linear equations by Gauss-Jordan elimination. See every row operation down to the reduced form and the solution.',
    ['gauss jordan', 'rref', 'reduced row echelon']],
  lu: ['LU Decomposition Calculator with Steps',
    'Solve a system of linear equations by LU decomposition. Find the L and U matrices, then forward and back substitution, step by step.',
    ['lu decomposition', 'lu factorization', 'doolittle', 'crout']],
  jacobi: ['Jacobi Method Calculator with Steps',
    'Solve a system of linear equations by the Jacobi iterative method. See every iteration in an exam-style table until the values converge.',
    ['jacobi method', 'jacobi iteration', 'iterative method linear equations']],
  taylor: ["Taylor Series Method Calculator for ODEs with Steps",
    'Solve an initial value problem dy/dx = f(x, y) by the Taylor series method, with every derivative and term of the series shown step by step.',
    ['taylor series method', 'taylor method ode', 'ode numerical']],
  euler: ["Euler's Method Calculator with Steps",
    "Solve dy/dx = f(x, y) by Euler's method. Get every step in an exam-style table, with a graph of the solution.",
    ['euler method', 'ode numerical']],
  'modified-euler': ["Modified Euler's Method Calculator with Steps",
    "Solve dy/dx = f(x, y) by the modified Euler (Heun) method. See every predictor and corrector step in a table, with a graph.",
    ['modified euler', 'heun', 'improved euler']],
  'runge-kutta': ['Runge-Kutta Method Calculator (RK4) with Steps',
    'Solve dy/dx = f(x, y) by the fourth-order Runge-Kutta method. See k₁, k₂, k₃, k₄ for every step in a table, with a graph.',
    ['runge kutta', 'rk4', 'rk method', 'ode numerical']],

  'least-squares': ['Least Squares Method Calculator with Steps',
    'Fit a curve to data by the method of least squares. Build the sums table, form the normal equations and solve them step by step.',
    ['least squares', 'curve fitting', 'line of best fit']],
  'straight-line': ['Fitting a Straight Line Calculator (Least Squares)',
    'Fit y = a + bx to your data by least squares. Get the Σx, Σy, Σxy, Σx² table, the normal equations and the line, with a graph.',
    ['fitting straight line', 'linear fit', 'line of best fit']],
  parabola: ['Fitting a Parabola Calculator (Least Squares)',
    'Fit a second-degree parabola y = a + bx + cx² to your data by least squares. See the sums table, the three normal equations and a graph.',
    ['fitting parabola', 'second degree curve', 'quadratic fit']],
  'z-test': ['Z-Test Calculator (Test of Significance) with Steps',
    'Run a large-sample z-test of significance for means. See the hypotheses, the test statistic, the critical value and the decision, step by step.',
    ['z test', 'test of significance', 'large sample test']],
  't-test': ["Student's t-Test Calculator with Steps",
    "Run Student's t-test on small samples. See the hypotheses, the t statistic, the degrees of freedom, the critical value and the decision.",
    ['t test', 'student t', "student's t-test"]],
  'f-test': ['F-Test Calculator with Steps',
    'Compare two sample variances with the F-test. See the variances, the F ratio, the critical value from the F table and the decision.',
    ['f test', 'variance ratio test']],
  'chi-square': ['Chi-Square Test Calculator with Steps',
    'Run a chi-square (χ²) goodness-of-fit test. See (O − E)²/E for every class, the χ² value, the critical value and the decision.',
    ['chi square', 'chi-squared', 'goodness of fit', 'χ² test']],
  determinant: ['Determinant Calculator with Steps',
    'Find the determinant of a 2×2 to 6×6 matrix by cofactor expansion or row reduction. Every minor, sign and row operation is shown.',
    ['determinant', 'det', 'matrix determinant', 'cofactor expansion', 'laplace expansion']],
  'matrix-inverse': ['Inverse of a Matrix Calculator with Steps',
    'Find the inverse of a matrix by the adjoint method or Gauss-Jordan. See the cofactors, the adjoint and every row operation, with answers as fractions.',
    ['inverse matrix', 'matrix inverse', 'adjoint', 'adjugate', 'inverse by gauss jordan']],
  rank: ['Rank of a Matrix Calculator (RREF) with Steps',
    'Find the rank of any matrix by reducing it to row echelon form (RREF). Every row operation is shown, with the pivot columns marked.',
    ['rank of matrix', 'echelon form', 'rref', 'reduced row echelon form', 'normal form']],
  'matrix-calculator': ['Matrix Calculator with Steps',
    'Add, subtract and multiply matrices, find a transpose, a scalar multiple or a power. Each entry of a product shows how it was worked out.',
    ['matrix calculator', 'matrix multiplication', 'transpose', 'matrix addition', 'matrix power']],
  'area-perimeter': ['Area and Perimeter Calculator with Steps',
    'Area and perimeter of a square, rectangle, triangle (incl. Heron), circle, sector, trapezium, rhombus, polygon or ellipse, with the formula and every step.',
    ['area', 'perimeter', 'area of circle', 'area of triangle', "heron's formula", 'area of trapezium']],
  'volume-surface-area': ['Volume and Surface Area Calculator with Steps',
    'Volume and surface area of a cube, cuboid, cylinder, cone, frustum, sphere, hemisphere, prism or pyramid, with the formula and every step shown.',
    ['volume', 'surface area', 'volume of cylinder', 'volume of cone', 'volume of sphere', 'curved surface area']],
  pythagoras: ['Pythagoras Theorem Calculator with Steps',
    'Find the missing side of a right triangle with Pythagoras theorem, a² + b² = c². Also gives both angles (SOH-CAH-TOA), the area and the exact surd.',
    ['pythagoras', 'pythagorean theorem', 'hypotenuse', 'right triangle', 'soh cah toa']],
  'triangle-solver': ['Triangle Solver: Sine and Cosine Rule Calculator',
    'Solve any triangle from SSS, SAS, ASA, AAS or SSA using the sine rule and cosine rule. Gives every side, angle, the area and a drawing to scale.',
    ['triangle calculator', 'sine rule', 'cosine rule', 'law of sines', 'law of cosines', 'ambiguous case']],
  'unit-circle': ['Unit Circle Calculator: Sin, Cos, Tan Values',
    'Drag around the unit circle to see sin, cos and tan of any angle, with exact values for special angles and degrees to radians conversion.',
    ['unit circle', 'trig values', 'radians to degrees', 'degrees to radians', 'sin cos tan table']],
  'coordinate-geometry': ['Coordinate Geometry Calculator with Steps',
    'Distance, midpoint, section formula, slope, equation of a line, angle between lines, point-to-line distance and triangle area from coordinates.',
    ['slope', 'gradient of line', 'distance formula', 'midpoint', 'equation of line', 'section formula']],
  percentage: ['Percentage Calculator: % Change, Profit & Loss, Discount',
    'Percentage of a number, percent change, profit and loss %, successive discounts, and markup vs margin, each with the formula and every step.',
    ['percentage', 'percent change', 'profit and loss', 'discount', 'markup', 'margin']],
  'compound-interest': ['Compound Interest Calculator (and Simple Interest)',
    'Simple and compound interest with a year-by-year table: yearly, half-yearly, quarterly, monthly or continuous compounding, plus effective rate.',
    ['compound interest', 'simple interest', 'si ci', 'interest calculator', 'effective annual rate', 'rule of 72']],
  emi: ['EMI Calculator with Amortisation Schedule',
    'Loan EMI with a month-by-month amortisation schedule: interest and principal in every payment, flat vs reducing rate, and what a prepayment saves.',
    ['emi', 'emi calculator', 'loan', 'amortisation schedule', 'home loan emi', 'flat vs reducing rate']],
  // new-method.mjs adds SEO entries above this line
};

function entry(status, id, route, unit, category, name, { engine = 'num', batch = 0, lastmod = '2026-11-03' } = {}) {
  const [title, description, searchWords] = SEO[id] || [/calculator$/i.test(name) ? `${name} with Steps` : `${name} Calculator with Steps`, '', []];
  return { id, route, unit, category, name, title, description, searchWords, engine, batch, status, lastmod };
}

/** A page visitors can see. */
const live = (id, route, unit, category, name, opts) => entry('live', id, route, unit, category, name, opts);

/** A page that exists but is hidden from menus and the sitemap, and asks search engines not to index it. */
const building = (id, route, unit, category, name, opts) => entry('building', id, route, unit, category, name, opts);

export const METHODS = [
  // Unit 1
  live('bisection', '/bisection-method', 1, null, 'Bisection Method'),
  live('secant', '/secant-method', 1, null, 'Secant Method'),
  live('fixed-point', '/iteration-method', 1, null, 'Iteration Method'),
  live('false-position', '/false-position-method', 1, null, 'False Position Method'),
  live('newton-raphson', '/newton-raphson-method', 1, null, 'Newton-Raphson Method'),
  live('gauss-seidel', '/Gauss-seidal', 1, null, 'Gauss Seidel Method'),

  // Unit 2
  live('newton-forward', '/newton-forward', 2, 'Interpolation for Equal Intervals', "Newton's Forward Formula"),
  live('newton-backward', '/newton-backward', 2, 'Interpolation for Equal Intervals', "Newton's Backward Formula"),
  live('gauss-forward', '/gauss-forward', 2, 'Interpolation for Equal Intervals', 'Gauss Forward Formula'),
  live('gauss-backward', '/gauss-backward', 2, 'Interpolation for Equal Intervals', 'Gauss Backward Formula'),
  live('newton-divided', '/newton-divided', 2, 'Interpolation for Unequal Intervals', "Newton's Divided Difference Formula"),
  live('lagrange', '/lagrange-interpolation', 2, 'Interpolation for Unequal Intervals', "Lagrange's Interpolation Formula"),

  // Unit 3
  live('numerical-differentiation', '/numerical-differentiation', 3, null, 'Numerical Differentiation'),
  live('trapezoidal', '/trapezoidal-Rule', 3, 'Numerical Integration', 'Trapezoidal Rule'),
  live('simpson-13', '/simpson-1-3-Rule', 3, 'Numerical Integration', "Simpson's 1/3 Rule"),
  live('simpson-38', '/simpson-3-8-Rule', 3, 'Numerical Integration', "Simpson's 3/8 Rule"),
  live('boole', '/boole-Rule', 3, 'Numerical Integration', "Boole's Rule"),
  live('weddle', '/weddle-Rule', 3, 'Numerical Integration', "Weddle's Rule"),
  live('gauss-quadrature', '/gauss-quadrature', 3, 'Numerical Integration', 'Gauss Quadrature'),

  // Unit 4
  live('gauss-elimination', '/gauss-elimination', 4, 'Matrix Methods', 'Gauss Elimination'),
  live('gauss-jordan', '/gauss-jordan', 4, 'Matrix Methods', 'Gauss-Jordan Elimination'),
  live('lu', '/lu-decomposition', 4, 'Matrix Methods', 'LU Decomposition'),
  live('jacobi', '/jacobi-method', 4, 'Matrix Methods', 'Jacobi Method'),
  live('taylor', '/taylor-s-series-method', 4, 'ODE Methods', "Taylor's Series Method"),
  live('euler', '/euler-s-method', 4, 'ODE Methods', "Euler's Method"),
  live('modified-euler', '/modified-euler-s-method', 4, 'ODE Methods', "Modified Euler's Method"),
  live('runge-kutta', '/runge-kutta-method', 4, 'ODE Methods', 'Runge-Kutta Methods'),

  // Unit 5
  live('least-squares', '/least-squares', 5, null, 'Method of Least Squares'),
  live('straight-line', '/fitting-straight-lines', 5, null, 'Fitting of Straight Lines'),
  live('parabola', '/fitting-parabola', 5, null, 'Fitting of Second Degree Parabola'),
  live('z-test', '/test-significance', 5, 'Testing of Hypothesis', 'Test of Significance (Z-test)'),
  live('t-test', '/t-test', 5, 'Testing of Hypothesis', 't-test'),
  live('f-test', '/f-test', 5, 'Testing of Hypothesis', 'F-test'),
  live('chi-square', '/chi-square', 5, 'Testing of Hypothesis', 'Chi-Square Test'),

  // New pages (batches 1–4). To publish one: change building( to live( and set lastmod.
  live('determinant', '/determinant', 8, 'Matrix Basics', 'Determinant', { batch: 1, lastmod: '2026-11-04' }),
  live('matrix-inverse', '/matrix-inverse', 8, 'Matrix Basics', 'Inverse of a Matrix', { batch: 1, lastmod: '2026-11-04' }),
  live('rank', '/rank-of-matrix', 8, 'Matrix Basics', 'Rank & Echelon Form', { batch: 1, lastmod: '2026-11-04' }),
  live('matrix-calculator', '/matrix-calculator', 8, 'Matrix Basics', 'Matrix Calculator', { batch: 1, lastmod: '2026-11-04' }),
  live('area-perimeter', '/area-and-perimeter', 9, 'Shapes', 'Area & Perimeter', { batch: 1, lastmod: '2026-11-04' }),
  live('volume-surface-area', '/volume-and-surface-area', 9, 'Shapes', 'Volume & Surface Area', { batch: 1, lastmod: '2026-11-04' }),
  live('pythagoras', '/pythagoras-theorem', 9, 'Triangles', 'Pythagoras Theorem', { batch: 1, lastmod: '2026-11-04' }),
  live('triangle-solver', '/triangle-solver', 9, 'Triangles', 'Triangle Solver', { batch: 1, lastmod: '2026-11-04' }),
  live('unit-circle', '/unit-circle', 9, 'Trigonometry', 'Unit Circle', { batch: 1, lastmod: '2026-11-04' }),
  live('coordinate-geometry', '/coordinate-geometry', 9, 'Coordinate Geometry', 'Coordinate Geometry', { batch: 1, lastmod: '2026-11-04' }),
  live('percentage', '/percentage-calculator', 10, 'Percentages & Trade', 'Percentage Calculator', { batch: 1, lastmod: '2026-11-04' }),
  live('compound-interest', '/compound-interest', 10, 'Interest', 'Simple & Compound Interest', { batch: 1, lastmod: '2026-11-04' }),
  live('emi', '/emi-calculator', 10, 'Loans', 'EMI Calculator', { batch: 1, lastmod: '2026-11-04' }),
  // new-method.mjs adds methods above this line
];

/** Methods visitors can see (menus, sitemap, previous/next). */
export const LIVE_METHODS = METHODS.filter((m) => m.status === 'live');

export const methodById = (id) => METHODS.find((m) => m.id === id) || null;

export const methodByRoute = (route) => {
  const r = String(route || '').toLowerCase();
  return METHODS.find((m) => m.route.toLowerCase() === r) || null;
};

/**
 * The menu tree: units → (method | category → methods), in METHODS order.
 * Shape: [{ ...unit, subTopics: [{ title, link } | { title, subTopics: [{ title, link }] }] }]
 */
export function unitMenus(methods = LIVE_METHODS) {
  return UNITS.map((u) => {
    const subTopics = [];
    for (const m of methods.filter((x) => x.unit === u.unit)) {
      const leaf = { title: m.name, link: m.route };
      if (!m.category) { subTopics.push(leaf); continue; }
      let group = subTopics.find((s) => s.subTopics && s.title === m.category);
      if (!group) { group = { title: m.category, subTopics: [] }; subTopics.push(group); }
      group.subTopics.push(leaf);
    }
    return { ...u, subTopics };
  }).filter((u) => u.subTopics.length > 0);
}
