/**
 * The one list of units and method pages (ALGORITHM_HUB_REDESIGN_PLAN.md). The hub, the method
 * page shell and the previous/next links all read it, so they can't disagree about units again.
 *
 * Units follow the hub catalog (Notes/utils/algorithmRegistry.js). `route` is the page's address;
 * the folders under (pages.algorithems) are only URL groups and don't decide the unit.
 * `glyph` is the short formula shown on the card tile; `needs` says what the solver asks for.
 */

export const UNITS = [
  { id: 'u1', num: 1, name: 'Roots of equations', short: 'Roots', lede: 'Find the x where f(x) = 0.' },
  { id: 'u2', num: 2, name: 'Interpolation', short: 'Interpolation', lede: 'Estimate a value between points in a table.' },
  { id: 'u3', num: 3, name: 'Differentiation and integration', short: 'Calculus', lede: 'Slopes and areas from numbers.' },
  { id: 'u4', num: 4, name: 'Linear systems and ODEs', short: 'Systems & ODEs', lede: 'Solve Ax = b, and step along dy/dx.' },
  { id: 'u5', num: 5, name: 'Curve fitting and tests', short: 'Fitting & tests', lede: 'Fit a line or curve, then test a claim.' },
];

export const METHODS = [
  // Unit 1
  { route: '/bisection-method', unit: 'u1', name: 'Bisection method', glyph: '½(a+b)', needs: 'f(x)', desc: 'Halve an interval until the root is boxed in.' },
  { route: '/false-position-method', unit: 'u1', name: 'False position', glyph: 'chord', needs: 'f(x)', desc: 'Like bisection, but cut where the straight line between the ends crosses zero.' },
  { route: '/secant-method', unit: 'u1', name: 'Secant method', glyph: 'x₀ x₁', needs: 'f(x), x₀, x₁', desc: 'Two starting guesses, no derivative needed.' },
  { route: '/newton-raphson-method', unit: 'u1', name: 'Newton–Raphson', glyph: 'f/f′', needs: 'f(x), x₀', desc: 'Follow the tangent line. Fast when the guess is close.' },
  { route: '/iteration-method', unit: 'u1', name: 'Fixed-point iteration', glyph: 'g(x)', needs: 'g(x), x₀', desc: 'Rewrite as x = g(x) and repeat until it settles.' },
  // Unit 2
  { route: '/newton-forward', unit: 'u2', name: 'Newton forward', glyph: 'Δy', needs: 'x, y table', desc: 'Equal steps, x near the start of the table.' },
  { route: '/newton-backward', unit: 'u2', name: 'Newton backward', glyph: '∇y', needs: 'x, y table', desc: 'Equal steps, x near the end of the table.' },
  { route: '/gauss-forward', unit: 'u2', name: 'Gauss forward', glyph: 'δ +', needs: 'x, y table', desc: 'Equal steps, x just after the middle of the table.' },
  { route: '/gauss-backward', unit: 'u2', name: 'Gauss backward', glyph: 'δ −', needs: 'x, y table', desc: 'Equal steps, x just before the middle of the table.' },
  { route: '/lagrange-interpolation', unit: 'u2', name: 'Lagrange', glyph: 'Lᵢ(x)', needs: 'x, y table', desc: 'Any spacing. One formula through every point.' },
  { route: '/newton-divided', unit: 'u2', name: 'Divided difference', glyph: 'f[ , ]', needs: 'x, y table', desc: 'Any spacing, built up one point at a time.' },
  // Unit 3
  { route: '/numerical-differentiation', unit: 'u3', name: 'Numerical differentiation', glyph: 'dy/dx', needs: 'x, y table', desc: 'First and second derivatives from a table.' },
  { route: '/trapezoidal-Rule', unit: 'u3', name: 'Trapezoidal rule', glyph: 'h/2', needs: 'f(x), a, b, n', desc: 'Area as straight-edged strips.' },
  { route: '/simpson-1-3-Rule', unit: 'u3', name: 'Simpson’s 1/3 rule', glyph: 'h/3', needs: 'f(x), a, b, n', desc: 'Area under parabolas. n must be even.' },
  { route: '/simpson-3-8-Rule', unit: 'u3', name: 'Simpson’s 3/8 rule', glyph: '3h/8', needs: 'f(x), a, b, n', desc: 'Area under cubics. n a multiple of 3.' },
  { route: '/boole-Rule', unit: 'u3', name: 'Boole’s rule', glyph: '2h/45', needs: 'f(x), a, b, n', desc: 'Higher order. n a multiple of 4.' },
  { route: '/weddle-Rule', unit: 'u3', name: 'Weddle’s rule', glyph: '3h/10', needs: 'f(x), a, b, n', desc: 'Six strips at a time, very accurate.' },
  { route: '/gauss-quadrature', unit: 'u3', name: 'Gauss quadrature', glyph: '±0.577', needs: 'f(x), a, b, points', desc: 'A few well-chosen points instead of many strips.' },
  // Unit 4
  { route: '/gauss-elimination', unit: 'u4', name: 'Gauss elimination', glyph: '[A|b]', needs: 'linear system', desc: 'Zero out below the diagonal, then back-substitute.' },
  { route: '/gauss-jordan', unit: 'u4', name: 'Gauss–Jordan', glyph: 'I', needs: 'linear system', desc: 'Reduce all the way to the identity matrix.' },
  { route: '/lu-decomposition', unit: 'u4', name: 'LU decomposition', glyph: 'L·U', needs: 'linear system', desc: 'Split A into two triangles, then solve twice.' },
  { route: '/jacobi-method', unit: 'u4', name: 'Jacobi method', glyph: 'xᵏ', needs: 'linear system', desc: 'Update every unknown from the last round.' },
  { route: '/Gauss-seidal', unit: 'u4', name: 'Gauss–Seidel', glyph: 'xᵏ⁺¹', needs: 'linear system', desc: 'Use each new value as soon as you have it.' },
  { route: '/taylor-s-series-method', unit: 'u4', name: 'Taylor series', glyph: 'y′ y″', needs: 'dy/dx, x₀, y₀, h', desc: 'Build y(x) from its derivatives.' },
  { route: '/euler-s-method', unit: 'u4', name: 'Euler’s method', glyph: 'y+hf', needs: 'dy/dx, x₀, y₀, h', desc: 'Step forward along the slope.' },
  { route: '/modified-euler-s-method', unit: 'u4', name: 'Modified Euler', glyph: 'y*', needs: 'dy/dx, x₀, y₀, h', desc: 'Predict, then correct with the average slope.' },
  { route: '/runge-kutta-method', unit: 'u4', name: 'Runge–Kutta (RK4)', glyph: 'k₁…k₄', needs: 'dy/dx, x₀, y₀, h', desc: 'Four slopes per step for high accuracy.' },
  // Unit 5
  { route: '/least-squares', unit: 'u5', name: 'Least squares', glyph: 'Σe²', needs: 'x, y data', desc: 'The line that keeps the squared errors smallest.' },
  { route: '/fitting-straight-lines', unit: 'u5', name: 'Fit a straight line', glyph: 'a+bx', needs: 'x, y data', desc: 'y = a + bx with the correlation r.' },
  { route: '/fitting-parabola', unit: 'u5', name: 'Fit a parabola', glyph: 'cx²', needs: 'x, y data', desc: 'y = a + bx + cx² from the normal equations.' },
  { route: '/test-significance', unit: 'u5', name: 'Z-test', glyph: 'z', needs: 'x̄, μ, σ, n', desc: 'Large samples (30 or more), σ known.' },
  { route: '/t-test', unit: 'u5', name: 'Student’s t-test', glyph: 't', needs: 'sample, μ', desc: 'Small samples, σ unknown.' },
  { route: '/chi-square', unit: 'u5', name: 'Chi-square test', glyph: 'χ²', needs: 'O and E lists', desc: 'Do observed counts fit the expected ones?' },
  { route: '/f-test', unit: 'u5', name: 'F-test', glyph: 'F', needs: 'two samples', desc: 'Do two samples have the same spread?' },
];

export const unitById = (id) => UNITS.find((u) => u.id === id);

export function methodByRoute(route) {
  const r = (route || '').toLowerCase().replace(/\/+$/, '');
  return METHODS.find((m) => m.route.toLowerCase() === r) || null;
}

/** Previous and next method in catalog order (crosses unit borders). */
export function neighbours(route) {
  const i = METHODS.findIndex((m) => m.route.toLowerCase() === (route || '').toLowerCase());
  if (i === -1) return { prev: null, next: null };
  return { prev: METHODS[i - 1] || null, next: METHODS[i + 1] || null };
}

export const methodsInUnit = (unitId) => METHODS.filter((m) => m.unit === unitId);

/** Words a search should also match for a method: its unit's name. */
export function searchText(m) {
  const u = unitById(m.unit);
  return `${m.name} ${m.desc} ${m.needs} ${m.glyph} ${u ? u.name : ''} unit ${u ? u.num : ''}`.toLowerCase();
}
