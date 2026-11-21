// FAQ and related links for the 34 original method pages (the newer pages keep theirs in the page file).
// One named export per page, so each page bundles only its own text. Answers are plain sentences written from the
// page's search words (docs/methods/NETZ_METHODS_CATALOG.md, ⭐ section, items 6 and 8).

export const bisection = {
  faq: [
    { q: 'What is the bisection method?', a: 'A way to find a root of f(x) = 0. Start with an interval [a, b] where f(a) and f(b) have opposite signs, cut it in half, keep the half where the sign still changes, and repeat. It is also called the interval halving or Bolzano method.' },
    { q: 'Does the bisection method always work?', a: 'Yes, if f is continuous and f(a), f(b) have opposite signs: it always converges. It is slow, though: each step gains only about one binary digit of accuracy.' },
    { q: 'How many iterations does bisection need?', a: 'About log₂((b − a)/ε) steps for an error below ε. Halving an interval of length 1 down to 0.0001 takes 14 steps.' },
  ],
  related: ['false-position', 'secant', 'newton-raphson', 'fixed-point'],
};

export const secant = {
  faq: [
    { q: 'What is the secant method?', a: 'A root-finding method that draws a straight line (a secant) through the last two points on the curve and takes where it crosses the x-axis as the next guess: xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁)/(f(xₙ) − f(xₙ₋₁)).' },
    { q: 'Secant vs Newton-Raphson?', a: 'Secant needs no derivative, only two starting guesses. It converges a little slower (order about 1.618 against 2) but each step is cheaper.' },
    { q: 'Secant vs false position?', a: 'Both use a straight line through two points. False position always keeps a sign change, so it cannot fail; secant simply uses the two latest points, which is faster but can diverge.' },
  ],
  related: ['newton-raphson', 'false-position', 'bisection', 'muller-method'],
};

export const fixedPoint = {
  faq: [
    { q: 'What is the iteration (fixed-point) method?', a: 'Rewrite f(x) = 0 as x = φ(x), pick a starting value, and repeat xₙ₊₁ = φ(xₙ) until the values settle.' },
    { q: 'When does the iteration method converge?', a: 'When |φ′(x)| < 1 near the root. If your rearrangement gives |φ′(x)| > 1, try another way of writing x = φ(x).' },
    { q: 'How do I choose φ(x)?', a: 'Solve the equation for x in a few different ways and pick the one whose derivative is smallest near the root.' },
  ],
  related: ['bisection', 'newton-raphson', 'secant'],
};

export const falsePosition = {
  faq: [
    { q: 'What is the false position method?', a: 'Also called regula falsi. Like bisection it keeps an interval where f changes sign, but instead of the midpoint it uses where the straight line joining (a, f(a)) and (b, f(b)) crosses the x-axis.' },
    { q: 'What is the regula falsi formula?', a: 'x = (a·f(b) − b·f(a)) / (f(b) − f(a)).' },
    { q: 'Is false position faster than bisection?', a: 'Usually yes, because it uses the size of f, not only its sign. On very curved functions one end can get stuck, which makes it slow.' },
  ],
  related: ['bisection', 'secant', 'newton-raphson'],
};

export const newtonRaphson = {
  faq: [
    { q: 'What is the Newton-Raphson formula?', a: 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). Each step follows the tangent line at the current point down to the x-axis.' },
    { q: 'When does Newton-Raphson fail?', a: 'When f′(x) is zero or very small near a guess, when the starting guess is far from the root, or near a repeated root, where it slows down. A sketch to pick a good start fixes most cases.' },
    { q: 'Newton-Raphson vs bisection?', a: 'Newton-Raphson is much faster (each step roughly doubles the correct digits) but needs the derivative and a good start. Bisection is slow but cannot fail once f changes sign.' },
  ],
  related: ['bisection', 'secant', 'false-position', 'newton-system'],
};

export const gaussSeidel = {
  faq: [
    { q: 'What is the Gauss-Seidel method?', a: 'An iterative way to solve linear equations. Make each equation give one unknown, then keep updating x, y, z in turn, always using the newest values.' },
    { q: 'When does Gauss-Seidel converge?', a: 'It is guaranteed when the system is diagonally dominant: in each row the diagonal number is bigger than the sum of the others. NETZ reorders the equations to get this when it can.' },
    { q: 'Gauss-Seidel vs Jacobi?', a: 'Jacobi uses only the previous round’s values; Gauss-Seidel uses each new value straight away, so it usually needs about half as many rounds.' },
  ],
  related: ['jacobi', 'sor', 'gauss-elimination', 'lu'],
};

const EQUAL_INTERVALS = 'They need x values that go up in equal steps (h). For unequal steps use Lagrange or Newton’s divided differences.';

export const newtonForward = {
  faq: [
    { q: 'When do I use Newton’s forward formula?', a: 'To estimate y near the start of a table, with x values in equal steps. Use the backward formula near the end.' },
    { q: 'What is p in Newton’s forward formula?', a: 'p = (x − x₀)/h, how many steps x is from the first value x₀.' },
    { q: 'Can I use it with unequal intervals?', a: EQUAL_INTERVALS },
  ],
  related: ['newton-backward', 'gauss-forward', 'difference-table', 'lagrange'],
};

export const newtonBackward = {
  faq: [
    { q: 'When do I use Newton’s backward formula?', a: 'To estimate y near the end of a table, with x values in equal steps. Use the forward formula near the start.' },
    { q: 'What is p in Newton’s backward formula?', a: 'p = (x − xₙ)/h, measured from the last value xₙ, so p is usually negative.' },
    { q: 'Can I use it with unequal intervals?', a: EQUAL_INTERVALS },
  ],
  related: ['newton-forward', 'gauss-backward', 'difference-table', 'lagrange'],
};

export const gaussForward = {
  faq: [
    { q: 'When do I use Gauss’s forward formula?', a: 'For a value near the middle of a table, just after the central x value (0 < p < 1).' },
    { q: 'How is it different from Newton’s forward formula?', a: 'It uses the central differences around the middle of the table instead of the differences at the top, which is more accurate in the middle.' },
    { q: 'Do the x values need equal steps?', a: 'Yes. ' + EQUAL_INTERVALS },
  ],
  related: ['gauss-backward', 'stirling', 'bessel', 'newton-forward'],
};

export const gaussBackward = {
  faq: [
    { q: 'When do I use Gauss’s backward formula?', a: 'For a value near the middle of a table, just before the central x value (−1 < p < 0).' },
    { q: 'Gauss forward vs backward?', a: 'Both use central differences. Forward suits points just after the centre, backward just before it.' },
    { q: 'Do the x values need equal steps?', a: 'Yes. ' + EQUAL_INTERVALS },
  ],
  related: ['gauss-forward', 'stirling', 'bessel', 'newton-backward'],
};

export const newtonDivided = {
  faq: [
    { q: 'What are Newton’s divided differences?', a: 'A table built from the data where each entry is a difference of the previous column divided by a difference of x values. It gives an interpolating polynomial for unequal intervals.' },
    { q: 'Divided differences vs Lagrange?', a: 'They give the same polynomial. Divided differences make it easy to add another point later without starting again.' },
    { q: 'Do the x values need equal spacing?', a: 'No. That is what this method is for.' },
  ],
  related: ['lagrange', 'newton-forward', 'cubic-spline'],
};

export const lagrange = {
  faq: [
    { q: 'What is Lagrange interpolation?', a: 'A formula for the polynomial through given points: a sum of each y value times a term that is 1 at its own x and 0 at every other x.' },
    { q: 'Does Lagrange need equal intervals?', a: 'No. It works for any distinct x values, which is why it is used for unequal intervals.' },
    { q: 'Can Lagrange find x for a given y?', a: 'Yes: swap the roles of x and y. This is inverse interpolation.' },
  ],
  related: ['newton-divided', 'inverse-interpolation', 'cubic-spline', 'newton-forward'],
};

export const numericalDifferentiation = {
  faq: [
    { q: 'What is numerical differentiation?', a: 'Estimating dy/dx and d²y/dx² from a table of values, by differentiating an interpolation formula such as Newton’s forward or backward formula.' },
    { q: 'Which formula should I use?', a: 'Newton’s forward formula near the start of the table, backward near the end, and Stirling’s central formula in the middle.' },
    { q: 'Why is the answer less accurate than for integration?', a: 'Differences magnify rounding errors in the table, so derivatives (especially the second) are more sensitive than integrals.' },
  ],
  related: ['newton-forward', 'newton-backward', 'difference-table', 'derivative'],
};

const STRIPS = 'The more strips (smaller h), the closer the answer, up to rounding.';

export const trapezoidal = {
  faq: [
    { q: 'What is the trapezoidal rule formula?', a: '∫ y dx ≈ (h/2)[y₀ + 2(y₁ + y₂ + … + yₙ₋₁) + yₙ]: the area is split into trapeziums of width h.' },
    { q: 'How many strips does the trapezoidal rule need?', a: 'Any number. ' + STRIPS },
    { q: 'Trapezoidal vs Simpson’s rule?', a: 'Simpson’s rule fits parabolas instead of straight lines, so it is usually much more accurate for the same h, but needs an even number of strips.' },
  ],
  related: ['simpson-13', 'simpson-38', 'romberg', 'gauss-quadrature'],
};

export const simpson13 = {
  faq: [
    { q: 'What is Simpson’s 1/3 rule?', a: '∫ y dx ≈ (h/3)[y₀ + 4(y₁ + y₃ + …) + 2(y₂ + y₄ + …) + yₙ]: a parabola through every three points.' },
    { q: 'Why does Simpson’s 1/3 rule need an even number of strips?', a: 'Each parabola covers two strips, so the strips must pair up.' },
    { q: 'Simpson 1/3 vs 3/8?', a: 'Use 1/3 when the number of strips is even and 3/8 when it is a multiple of 3. Their accuracy is similar.' },
  ],
  related: ['simpson-38', 'trapezoidal', 'boole', 'weddle'],
};

export const simpson38 = {
  faq: [
    { q: 'What is Simpson’s 3/8 rule?', a: '∫ y dx ≈ (3h/8)[y₀ + 3(y₁ + y₂ + y₄ + y₅ + …) + 2(y₃ + y₆ + …) + yₙ]: a cubic through every four points.' },
    { q: 'When do I use Simpson’s 3/8 rule?', a: 'When the number of strips is a multiple of 3.' },
    { q: 'Is 3/8 more accurate than 1/3?', a: 'Not usually; they are of the same order. Pick the one that matches your number of strips.' },
  ],
  related: ['simpson-13', 'trapezoidal', 'boole', 'weddle'],
};

export const boole = {
  faq: [
    { q: 'What is Boole’s rule?', a: 'A Newton-Cotes rule that fits a 4th-degree polynomial through every five points: (2h/45)[7y₀ + 32y₁ + 12y₂ + 32y₃ + 7y₄] for each group.' },
    { q: 'How many strips does Boole’s rule need?', a: 'A multiple of 4.' },
    { q: 'Is Boole’s rule more accurate than Simpson’s?', a: 'Yes, for smooth functions it is of higher order.' },
  ],
  related: ['weddle', 'simpson-13', 'simpson-38', 'romberg'],
};

export const weddle = {
  faq: [
    { q: 'What is Weddle’s rule?', a: 'A rule over groups of six strips: (3h/10)[y₀ + 5y₁ + y₂ + 6y₃ + y₄ + 5y₅ + y₆].' },
    { q: 'How many strips does Weddle’s rule need?', a: 'A multiple of 6.' },
    { q: 'Why use Weddle’s rule?', a: 'It is very accurate for smooth functions with only simple weights, which made it popular for hand calculation.' },
  ],
  related: ['boole', 'simpson-13', 'simpson-38', 'trapezoidal'],
};

export const gaussQuadrature = {
  faq: [
    { q: 'What is Gauss quadrature?', a: 'An integration rule that picks both the points and the weights cleverly, so n points integrate polynomials up to degree 2n − 1 exactly.' },
    { q: 'Why change the limits to −1 and 1?', a: 'The standard Gauss-Legendre points and weights are for [−1, 1]; the substitution x = ((b − a)t + (b + a))/2 moves any interval there.' },
    { q: 'Gauss quadrature vs Simpson?', a: 'Gauss needs far fewer function values for the same accuracy, but uses uneven points, so it cannot use a fixed table.' },
  ],
  related: ['simpson-13', 'trapezoidal', 'romberg', 'double-integration'],
};

export const gaussElimination = {
  faq: [
    { q: 'What is Gauss elimination?', a: 'Solving linear equations by row operations that turn the system into upper-triangular form, then finding the unknowns from the bottom up (back substitution).' },
    { q: 'What is partial pivoting?', a: 'Swapping rows so the biggest number in the column is used as the pivot. It avoids dividing by zero or by tiny numbers.' },
    { q: 'Gauss elimination vs Gauss-Jordan?', a: 'Gauss-Jordan carries on to make the matrix diagonal (reduced row echelon form), so no back substitution is needed, at the cost of more operations.' },
  ],
  related: ['gauss-jordan', 'lu', 'gauss-seidel', 'system-of-equations'],
};

export const gaussJordan = {
  faq: [
    { q: 'What is the Gauss-Jordan method?', a: 'Row operations that turn the coefficient matrix into the identity, so the last column gives the answers directly. The result is the reduced row echelon form (RREF).' },
    { q: 'Can Gauss-Jordan find the inverse?', a: 'Yes: apply the same row operations to [A | I]; when A becomes I, the right side is A⁻¹.' },
    { q: 'Gauss-Jordan vs Gauss elimination?', a: 'Gauss elimination stops at triangular form and back-substitutes; Gauss-Jordan goes all the way to the identity.' },
  ],
  related: ['gauss-elimination', 'matrix-inverse', 'rank', 'lu'],
};

export const lu = {
  faq: [
    { q: 'What is LU decomposition?', a: 'Writing A as L·U, a lower-triangular times an upper-triangular matrix. Then Ax = b is solved as Ly = b (forward) and Ux = y (backward).' },
    { q: 'Doolittle vs Crout?', a: 'Doolittle puts 1s on the diagonal of L; Crout puts 1s on the diagonal of U. Both give the same solution.' },
    { q: 'Why use LU instead of Gauss elimination?', a: 'Once A is factorised, you can solve for many different right-hand sides b quickly.' },
  ],
  related: ['gauss-elimination', 'cholesky', 'gauss-jordan', 'determinant'],
};

export const jacobi = {
  faq: [
    { q: 'What is the Jacobi method?', a: 'An iterative way to solve linear equations: each round, every unknown is updated from its own equation using the previous round’s values.' },
    { q: 'When does the Jacobi method converge?', a: 'It is guaranteed when the system is diagonally dominant (each diagonal number bigger than the rest of its row added up).' },
    { q: 'Jacobi vs Gauss-Seidel?', a: 'Gauss-Seidel uses new values straight away and usually converges faster; Jacobi is simpler and every unknown can be updated at the same time.' },
  ],
  related: ['gauss-seidel', 'sor', 'gauss-elimination'],
};

const ODE_ORDER = 'A smaller step h gives a more accurate answer but needs more steps.';

export const taylor = {
  faq: [
    { q: 'What is Taylor’s series method for ODEs?', a: 'It expands y(x) about the starting point using y′, y″, y‴ … found by differentiating the equation, and adds up the terms.' },
    { q: 'How many terms should I take?', a: 'Usually up to the 3rd or 4th derivative. More terms help when x is farther from the start.' },
    { q: 'Why is Runge-Kutta usually preferred?', a: 'Taylor’s method needs higher derivatives of f, which can be long to find; Runge-Kutta gets similar accuracy from f alone.' },
  ],
  related: ['euler', 'runge-kutta', 'taylor-series'],
};

export const euler = {
  faq: [
    { q: 'What is Euler’s method?', a: 'The simplest way to solve dy/dx = f(x, y) step by step: yₙ₊₁ = yₙ + h·f(xₙ, yₙ), following the slope at the start of each step.' },
    { q: 'Why is Euler’s method not very accurate?', a: 'It uses only the slope at the start of each step, so the error grows with every step. ' + ODE_ORDER },
    { q: 'Euler vs modified Euler?', a: 'Modified Euler (Heun’s method) averages the slopes at both ends of the step, which is much more accurate.' },
  ],
  related: ['modified-euler', 'runge-kutta', 'rk2', 'taylor'],
};

export const modifiedEuler = {
  faq: [
    { q: 'What is the modified Euler method?', a: 'Predict y with Euler’s method, then correct it using the average of the slopes at the start and end of the step. It is also called Heun’s or the improved Euler method.' },
    { q: 'How many times do I correct?', a: 'Repeat the correction until two values agree to the decimals you need; one or two corrections usually suffice.' },
    { q: 'Modified Euler vs Runge-Kutta?', a: 'Modified Euler is a second-order method; fourth-order Runge-Kutta is more accurate for the same step size.' },
  ],
  related: ['euler', 'runge-kutta', 'rk2', 'milne'],
};

export const rungeKutta = {
  faq: [
    { q: 'What is the RK4 formula?', a: 'yₙ₊₁ = yₙ + (k₁ + 2k₂ + 2k₃ + k₄)/6, where the k’s are slopes at the start, twice in the middle and at the end of the step, each times h.' },
    { q: 'Why is Runge-Kutta so popular?', a: 'It is accurate (fourth order), needs only f(x, y), and starts on its own, with no earlier values needed.' },
    { q: 'How do I pick the step size h?', a: ODE_ORDER + ' Exams usually give h, often 0.1 or 0.2.' },
  ],
  related: ['rk2', 'euler', 'modified-euler', 'milne', 'adams'],
};

export const leastSquares = {
  faq: [
    { q: 'What is the method of least squares?', a: 'A way to fit a curve to data by choosing the constants that make the sum of the squared errors as small as possible.' },
    { q: 'What are normal equations?', a: 'The equations you get by setting the derivatives of the squared error to zero. Solving them gives the best-fit constants.' },
    { q: 'Which curves can be fitted?', a: 'Straight lines, parabolas and, after taking logs, exponential and power curves.' },
  ],
  related: ['straight-line', 'parabola', 'curve-fitting', 'regression'],
};

export const straightLine = {
  faq: [
    { q: 'How do I fit a straight line by least squares?', a: 'For y = a + bx, solve Σy = na + bΣx and Σxy = aΣx + bΣx² for a and b.' },
    { q: 'What is the line of best fit?', a: 'The straight line that makes the sum of squared vertical distances from the points smallest.' },
    { q: 'Is this the same as the regression line?', a: 'Yes: the least-squares line of y on x is the regression line of y on x.' },
  ],
  related: ['least-squares', 'parabola', 'regression', 'correlation'],
};

export const parabola = {
  faq: [
    { q: 'How do I fit a parabola by least squares?', a: 'For y = a + bx + cx², solve the three normal equations made from Σy, Σxy and Σx²y.' },
    { q: 'When should I fit a parabola instead of a line?', a: 'When the points clearly bend, so a straight line leaves a curved pattern of errors.' },
    { q: 'How many points do I need?', a: 'At least three; more points make the fit more reliable.' },
  ],
  related: ['least-squares', 'straight-line', 'curve-fitting'],
};

export const tTest = {
  faq: [
    { q: 'When do I use a t-test?', a: 'To compare means when the sample is small (usually under 30) and the population standard deviation is unknown.' },
    { q: 'What are the degrees of freedom?', a: 'n − 1 for one sample, n₁ + n₂ − 2 for two independent samples, n − 1 for paired data.' },
    { q: 't-test vs z-test?', a: 'Use z for large samples or a known σ; use t for small samples with σ estimated from the data.' },
  ],
  related: ['z-test', 'f-test', 'chi-square', 'confidence-interval'],
};

export const fTest = {
  faq: [
    { q: 'What is the F-test used for?', a: 'To check whether two samples have equal variances, by comparing the larger sample variance with the smaller.' },
    { q: 'How is F calculated?', a: 'F = s₁²/s₂², with the larger variance on top, compared with the F table at (n₁ − 1, n₂ − 1) degrees of freedom.' },
    { q: 'Where else is the F distribution used?', a: 'In ANOVA, to compare the means of several groups.' },
  ],
  related: ['t-test', 'anova', 'chi-square'],
};

export const chiSquare = {
  faq: [
    { q: 'What is the chi-square test?', a: 'A test that compares observed counts with expected counts: χ² = Σ (O − E)²/E. It is used for goodness of fit and for independence in a contingency table.' },
    { q: 'How many degrees of freedom?', a: 'Goodness of fit: categories − 1 (minus any estimated constants). Contingency table: (rows − 1)(columns − 1).' },
    { q: 'What if an expected count is below 5?', a: 'Merge that class with a neighbour before testing; small expected counts make the test unreliable.' },
  ],
  related: ['t-test', 'f-test', 'z-test', 'non-parametric-tests'],
};

export const zTest = {
  faq: [
    { q: 'When do I use a z-test?', a: 'For large samples (usually 30 or more) or when the population standard deviation is known: testing a mean, two means, or proportions.' },
    { q: 'What are the critical values of z?', a: 'At 5% significance: 1.96 for a two-tailed test, 1.645 for one-tailed. At 1%: 2.58 and 2.33.' },
    { q: 'z-test vs t-test?', a: 'Use t when the sample is small and σ is unknown.' },
  ],
  related: ['t-test', 'confidence-interval', 'normal', 'chi-square'],
};
