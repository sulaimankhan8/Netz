// Guide mode words for the Unit 6 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const F = "Your function, written with x: `x^2 sin(3x)`, `e^(2x)/x`. Open **How to type maths** below for powers, roots and fractions.";
const FROM = 'The lower limit (where the integral starts). Numbers or `pi/2`.';
const TO = 'The upper limit (where it ends).';
const AT_OPT = 'Optional: an x where you also want the value. Leave empty to skip.';
const PQR = {
  P: 'The i part of the vector field F = P i + Q j + R k, in x, y, z.',
  Q: 'The j part of F.',
  R: 'The k part of F (`0` for a field in the plane).',
};
// Region boxes: flat regions (Green's theorem, centre of mass) and solids (divergence, volume integrals)
const RECT = { xlo: 'Smallest x of the region.', xhi: 'Largest x.', ylo: 'Smallest y.', yhi: 'Largest y.', a: 'The radius.' };
const PLANE = {
  ...RECT,
  g1: 'The lower boundary curve, as y = … in x.', g2: 'The upper boundary curve, as y = … in x.',
  A: 'First corner of the triangle, as `(x, y)`.', B: 'Second corner, `(x, y)`.', C: 'Third corner, `(x, y)`.',
};
const SOLID = { ...RECT, zlo: 'Smallest z.', zhi: 'Largest z.', h: 'The height.' };

const GUIDES = {
  derivative: {
    howTo: [
      "Type the function you want to differentiate, e.g. `x^2 sin(3x)`.",
      "Choose 1st, 2nd or 3rd derivative. Optionally type an x to get the slope there.",
      "Press {button}. Each step names the rule used (product, chain, quotient …).",
    ],
    help: { f: F, order: "1st f′ is the usual derivative; 2nd f″ is the derivative of that, and so on.", at: AT_OPT },
    maths: ['f'],
  },
  'first-principles': {
    howTo: [
      "Type the function, e.g. `x^2` or `sqrt(x)`.",
      "Press {button}. NETZ works out the limit of [f(x + h) − f(x)] / h as h → 0, step by step.",
    ],
    help: { f: F, at: AT_OPT },
    maths: ['f'],
  },
  implicit: {
    howTo: [
      "Type the whole equation in x and y, with its = sign: `x^2 + y^2 = 25`.",
      "Optionally type a point (x₀, y₀) on the curve to get the slope there.",
      "Press {button} to get dy/dx, differentiating each term with respect to x.",
    ],
    help: {
      eq: "The equation linking x and y, e.g. `x^3 + y^3 = 6xy`. Write xy for x times y.",
      x0: "Optional: x of a point on the curve.",
      y0: "Optional: y of the same point.",
    },
    maths: ['eq'],
  },
  logarithmic: {
    howTo: [
      "Type y, e.g. `x^x` or a long product like `(x+1)^2 (x-2)^3`.",
      "Press {button}. NETZ takes ln of both sides, differentiates and multiplies back.",
    ],
    help: { f: "The function y, in x: `x^x`, `x^(sin(x))`.", at: AT_OPT },
    maths: ['f'],
  },
  parametric: {
    howTo: [
      "Type x and y in terms of t: x(t) = `cos(t)`, y(t) = `sin(t)`.",
      "Choose whether you also want d²y/dx², and optionally a value of t.",
      "Press {button}. dy/dx = (dy/dt) ÷ (dx/dt).",
    ],
    help: {
      x: "x written in t: `a cos(t)`, `t^2`.",
      y: "y written in t: `a sin(t)`, `2t`.",
      second: "The second derivative d²y/dx² as well, if you need it.",
      at: "Optional: a value of t, e.g. `pi/4`.",
    },
    maths: ['x', 'y'],
  },
  limit: {
    howTo: [
      "Type the function, e.g. `(x^2-5x+6)/(x^2-4)`.",
      "Type what x approaches: a number, `pi/2`, `inf` (∞) or `-inf`.",
      "Choose both sides, or only from the left or right. Press {button}.",
    ],
    help: {
      f: F,
      a: "The value x approaches: `2`, `0`, `pi`, `inf`.",
      dir: "Both sides is the usual limit. Left (x → a⁻) or right (x → a⁺) for one-sided limits.",
    },
    maths: ['f'],
  },
  integral: {
    howTo: [
      "Choose **indefinite** (answer + C) or **definite** (a number between limits).",
      "Type the function to integrate, e.g. `x^2 e^x`.",
      "For a definite integral, type the limits a and b. Press {button}; each step names the method (substitution, by parts …).",
    ],
    help: {
      kind: "Indefinite: ∫ f dx, an antiderivative + C. Definite: ∫ from a to b, a number.",
      f: F, a: FROM, b: TO,
    },
    maths: ['f'],
  },
  'area-under-curve': {
    howTo: [
      "Choose what you want: area under one curve, between two curves, or the average value.",
      "Type the curve (and the second curve if needed).",
      "Type the x-limits a and b, or leave them for NETZ to find where the curves meet. Press {button}.",
    ],
    help: {
      mode: "Under a curve: between it and the x-axis. Between curves: between f and g.",
      f: "The (top) curve, in x: `x^2`.",
      g: "The second (bottom) curve, in x.",
      a: "Where the area starts (x).",
      b: "Where it ends (x).",
    },
    maths: ['f', 'g'],
  },
  'tangent-normal': {
    howTo: [
      "Type the curve y = f(x), e.g. `x^2`.",
      "Type the x of the point, e.g. `1` or `pi/4`.",
      "Press {button} for the slope, the tangent line and the normal line.",
    ],
    help: { f: F, a: "The x-coordinate of the point where you want the tangent." },
    maths: ['f'],
  },
  monotonicity: {
    howTo: [
      "Type the function, e.g. `x^3 - 3x`.",
      "Optionally limit the search to an interval.",
      "Press {button}. NETZ finds where f′(x) is positive (increasing) and negative (decreasing).",
    ],
    help: { f: F, a: "Optional: start of the interval.", b: "Optional: end of the interval." },
    maths: ['f'],
  },
  'maxima-minima': {
    howTo: [
      "Type the function, e.g. `x^3 - 6x^2 + 9x`.",
      "Optionally give an interval to also check its end points.",
      "Press {button}. NETZ solves f′(x) = 0 and uses f″(x) to say maximum or minimum.",
    ],
    help: { f: F, a: "Optional: left end of the interval.", b: "Optional: right end of the interval." },
    maths: ['f'],
  },
  'taylor-series': {
    howTo: [
      "Type the function, e.g. `e^x` or `sin(x)`.",
      "Type the point a to expand about (`0` gives the Maclaurin series).",
      "Choose how many terms (the order n). Press {button}.",
    ],
    help: {
      f: F,
      a: "The centre of the expansion. `0` for Maclaurin.",
      n: "The highest power of (x − a) to keep.",
      at: "Optional: an x where you want the approximate value.",
    },
    maths: ['f'],
  },
  'arc-length': {
    howTo: [
      "Choose the kind of curve: y = f(x), parametric (x(t), y(t)) or polar r(θ).",
      "Type the curve and the range of x, t or θ.",
      "Press {button} for the length (or the surface area when turned round the axis).",
    ],
    help: {
      mode: "How your curve is given.",
      f: "The curve y = f(x): `x^(3/2)`.",
      xt: "x in terms of t: `cos(t)^3`.",
      yt: "y in terms of t: `sin(t)^3`.",
      r: "r in terms of θ: `1 + cos(θ)`.",
      a: "Start of the range (x, t or θ). Use `pi` for π.",
      b: "End of the range.",
    },
    maths: ['f', 'xt', 'yt', 'r'],
  },
  asymptotes: {
    howTo: ["Type the function, e.g. `(2x + 1)/(x - 3)`.", "Press {button} for its vertical, horizontal and slant asymptotes."],
    help: { f: F },
    maths: ['f'],
  },
  'beta-gamma': {
    howTo: [
      "Choose what to work out: Γ(n), B(m, n), or an integral of sinᵖθ cosᵠθ or xⁿe^(−ax).",
      "Type the numbers. Fractions such as `7/2` are fine.",
      "Press {button}. Whole and half-whole numbers give exact answers with √π.",
    ],
    help: {
      mode: "Which function or standard integral to evaluate.",
      m: "The first number in B(m, n).",
      n: "The number in Γ(n), or the second number in B(m, n).",
      p: "The power of sin θ.",
      q: "The power of cos θ.",
      a: "The a in e^(−ax).",
    },
  },
  'centre-of-mass': {
    howTo: [
      "Choose the shape of the region: rectangle, between two curves, triangle, or disc.",
      "Type its size (the limits, curves, corners or radius).",
      "Optionally type a density ρ(x, y); empty means even density. Press {button}.",
    ],
    help: { region: "The shape of the plate.", ...PLANE, rho: "How heavy the plate is at each point, e.g. `x y`. Leave empty for 1 (uniform)." },
    maths: ['g1', 'g2', 'rho'],
  },
  'change-of-order': {
    howTo: [
      "Choose the order of the integral you have (dy dx or dx dy).",
      "Type the integrand and the four limits exactly as in your question. The inner limits may use the outer letter.",
      "Press {button}. NETZ sketches the region and rewrites the limits the other way round.",
    ],
    help: {
      order: "dy dx: the inner integral is in y. dx dy: the inner integral is in x.",
      f: "What is being integrated, in x and y: `x y`.",
      innerFrom: "Lower limit of the inner integral (may contain the outer letter, e.g. `x^2`).",
      innerTo: "Upper limit of the inner integral (e.g. `sqrt(x)`).",
      outerFrom: "Lower limit of the outer integral: a number.",
      outerTo: "Upper limit of the outer integral: a number.",
    },
    maths: ['f', 'innerFrom', 'innerTo'],
  },
  continuity: {
    howTo: [
      "Type the function. For a piecewise function, write each piece with its condition and separate pieces with `;`: `x^2 for x < 1; 2x - 1 for x >= 1`.",
      "Type the x where you want to test continuity.",
      "Press {button}. NETZ compares the left limit, right limit and f(a). An unknown like k is solved for.",
    ],
    help: {
      f: "One formula, or pieces like `kx + 1 for x <= 2; 3x - 1 for x > 2`.",
      a: "The point to test, e.g. `1`.",
    },
    maths: ['f'],
  },
  'convergence-tests': {
    howTo: [
      "Type the nth term aₙ using n: `n/2^n`, `1/n^2`, `(-1)^n/n`.",
      "Type where the sum starts (usually `1`).",
      "Press {button}. NETZ picks the right test (ratio, root, comparison, alternating …) and explains it.",
    ],
    help: { a: "The general term in n. Use `n!` for factorial.", n0: "The first value of n in the sum." },
    maths: ['a'],
  },
  'curvature-calculator': {
    howTo: [
      "Choose the kind of curve: y = f(x), parametric, or polar.",
      "Type the curve and the point (x, t or θ).",
      "Press {button} for the radius of curvature ρ and the curvature κ = 1/ρ.",
    ],
    help: {
      mode: "How your curve is given.",
      f: "y in terms of x: `x^2`.",
      x: "x in terms of t: `2cos(t)`.",
      y: "y in terms of t: `3sin(t)`.",
      r: "r in terms of θ: `1 + cos(theta)`.",
      at: "The point: an x, a t or a θ value.",
    },
    maths: ['f', 'x', 'y', 'r'],
  },
  'divergence-theorem': {
    howTo: [
      "Type the vector field F = P i + Q j + R k.",
      "Choose the solid (box, cylinder, sphere …) and type its size.",
      "Press {button}. NETZ works out both sides: the volume integral of div F and the flux through the surface.",
    ],
    help: { ...PQR, region: "The solid that the surface encloses.", ...SOLID },
    maths: ['P', 'Q', 'R'],
  },
  'double-integral': {
    howTo: [
      "Choose the order: dy dx, dx dy or polar.",
      "Type the integrand, e.g. `x y^2`.",
      "Type the limits: inner ones may use the outer letter, outer ones are numbers. Press {button}.",
    ],
    help: {
      order: "dy dx: integrate in y first. Polar: type θ as `theta` and include the extra r in the integrand.",
      f: "What is being integrated, in x and y.",
      innerFrom: "Lower limit of the inner integral.",
      innerTo: "Upper limit of the inner integral.",
      outerFrom: "Lower limit of the outer integral (a number).",
      outerTo: "Upper limit of the outer integral (a number).",
    },
    maths: ['f', 'innerFrom', 'innerTo'],
  },
  'errors-approximations': {
    howTo: [
      "Choose what to find (approximate value, error, or percentage error).",
      "Type y = f(x), e.g. `sqrt(x)`, the value of x and the small change Δx.",
      "Press {button}. NETZ uses dy = f′(x) Δx.",
    ],
    help: {
      mode: "Approximation: estimate f(x + Δx). Error: how much y changes for a small error in x.",
      f: "The formula, e.g. `sqrt(x)` or `(4/3) pi r^3`.",
      x0: "The value you start from, e.g. `25` to estimate √25.3.",
      dx: "The small change (or error) in x, e.g. `0.3`.",
    },
    maths: ['f'],
  },
  'euler-homogeneous': {
    howTo: [
      "Type u in x and y (or x, y, z), e.g. `x^3 + y^3 + 3x^2 y`.",
      "Choose whether to check the second-order form too.",
      "Press {button}. NETZ finds the degree n and checks x uₓ + y u_y = n u.",
    ],
    help: { u: "A homogeneous function. Write xy for x times y.", second: "Also check x² uₓₓ + 2xy uₓᵧ + y² uᵧᵧ = n(n − 1) u." },
    maths: ['u'],
  },
  'fourier-series': {
    howTo: [
      "Choose the series: full range, half-range sine or half-range cosine.",
      "Type f(x). For a piecewise function separate the pieces with `;`: `0 for -pi < x < 0; x for 0 < x < pi`.",
      "Type the interval (use `pi` for π) and press {button} for a₀, aₙ, bₙ.",
    ],
    help: {
      mode: "Full range uses the whole interval; half-range sine or cosine use 0 to L.",
      f: "The function over one period, or its pieces.",
      from: "Start of the interval, e.g. `-pi`.",
      to: "End of the interval, e.g. `pi`.",
    },
    maths: ['f'],
  },
  'grad-div-curl': {
    howTo: [
      "Choose what to find: gradient of a scalar φ, or divergence/curl of a vector field.",
      "Type φ, or the three parts P, Q, R of F = P i + Q j + R k.",
      "Optionally type a point (and a direction for the directional derivative). Press {button}.",
    ],
    help: {
      mode: "Gradient needs a scalar function; divergence and curl need a vector field.",
      phi: "The scalar function in x, y, z: `x^2 y z`.",
      ...PQR,
      point: "Optional: a point, e.g. `1, -1, 1`.",
      dir: "Optional: a direction, e.g. `2, 1, -2` (for the directional derivative).",
    },
    maths: ['phi', 'P', 'Q', 'R'],
  },
  'greens-theorem': {
    howTo: [
      "Write the line integral as ∮ M dx + N dy and type M and N.",
      "Choose the region (rectangle, between curves, triangle, disc) and type its size.",
      "Press {button}. NETZ works out both sides of Green's theorem.",
    ],
    help: { M: "What multiplies dx, in x and y.", N: "What multiplies dy, in x and y.", region: "The region inside the closed curve.", ...PLANE },
    maths: ['M', 'N', 'g1', 'g2'],
  },
  'harmonic-analysis': {
    howTo: [
      "Type the y values over one full period, equally spaced, starting at θ = 0. Do not repeat the last point (360°).",
      "Choose how many harmonics to find.",
      "Press {button} for a₀, aₙ and bₙ from the table.",
    ],
    help: { y: "One period's y values, separated by commas.", harmonics: "How many sine and cosine terms to find." },
  },
  'improper-integrals': {
    howTo: [
      "Type the function, e.g. `e^(-x)` or `1/x^2`.",
      "Type the limits. Use `inf` for ∞ and `-inf` for −∞.",
      "Press {button}. NETZ says whether it converges and, if so, its value.",
    ],
    help: { f: F, a: "Lower limit: a number or `-inf`.", b: "Upper limit: a number or `inf`." },
    maths: ['f'],
  },
  jacobian: {
    howTo: [
      "Type your **first formula**, e.g. `x = r cos(θ)`. You can give it a name (x =) or type only the right-hand side.",
      "Type the **second formula** the same way. Add a third only for three variables (a 3 × 3 Jacobian).",
      "Say which letters you differentiate **by** (for polar: `r, θ`). Leave it empty to use the letters NETZ finds.",
      "Press {button} for the matrix of partial derivatives, its determinant and every step.",
    ],
    help: {
      f1: "The first formula of your change of variables, such as `u = x + y` or `x = r cos(θ)`.",
      f2: "The second formula, written the same way, such as `v = x y`.",
      f3: "Only for three variables, such as `z = r cos(θ)`. Leave it empty for two.",
      wrt: "The letters you differentiate by, separated by commas: `r, θ` or `x, y`.",
    },
    maths: ['f1', 'f2', 'f3'],
  },
  'lagrange-multipliers': {
    howTo: [
      "Type the function to make biggest or smallest, e.g. `x y`.",
      "Type the condition it must meet, with its = sign: `x + y = 10`.",
      "Press {button}. NETZ solves ∇f = λ∇g with the condition and lists each point.",
    ],
    help: { f: "The function to maximise or minimise. Write xy for x times y.", g: "The constraint, as an equation: `x^2 + y^2 = 1`." },
    maths: ['f', 'g'],
  },
  'leibniz-integral-rule': {
    howTo: [
      "Choose what to do: differentiate F(a) = ∫ f(x, a) dx, or use that to evaluate an integral.",
      "Type f(x, a) and the limits (inf is allowed when evaluating).",
      "Press {button}.",
    ],
    help: {
      mode: "Differentiate: find F′(a). Evaluate: find F(a) by integrating F′(a) back.",
      f: "The integrand with the parameter a: `(x^a - 1)/log(x)`.",
      lo: "Lower limit of the integral.",
      hi: "Upper limit (`inf` allowed when evaluating).",
      a0: "Optional: a value of a where F is known (0, 1 or inf), to find the constant.",
    },
    maths: ['f'],
  },
  'line-integral': {
    howTo: [
      "Choose the integral: of a vector field (work done) or of a function (along arc length).",
      "Type the field (or the function) and the path: `x = cos(t), y = sin(t)`, or corner points `(0,0) -> (1,0) -> (1,1)`.",
      "Type the range of t and press {button}.",
    ],
    help: {
      mode: "Vector field: ∫ F · dr (work). Scalar: ∫ f ds.",
      ...PQR,
      f: "The function along the path; empty means arc length.",
      path: "The curve in t (`x = cos(t), y = sin(t)`) or straight pieces between points.",
      t0: "Where t starts.",
      t1: "Where t ends, e.g. `2pi`.",
    },
    maths: ['P', 'Q', 'R', 'f'],
  },
  'maxima-minima-2var': {
    howTo: [
      "Type f(x, y), e.g. `x^3 + y^3 - 3xy`.",
      "Press {button}. NETZ finds the points where fₓ = 0 and f_y = 0, then uses rt − s² to say maximum, minimum or saddle point.",
    ],
    help: { f: "The function in x and y. Write xy for x times y." },
    maths: ['f'],
  },
  'mean-value-theorem': {
    howTo: [
      "Choose Rolle's theorem or the mean value theorem.",
      "Type f(x) and the interval a to b.",
      "Press {button}. NETZ checks the conditions and finds c.",
    ],
    help: {
      theorem: "Rolle's needs f(a) = f(b). The mean value theorem works for any a, b.",
      f: F, a: "Left end of the interval.", b: "Right end of the interval.",
    },
    maths: ['f'],
  },
  'nth-derivative': {
    howTo: [
      "Choose the method: a standard form (n stays a letter) or Leibniz's theorem for a product u·v.",
      "Type y (or u and v) and n.",
      "Press {button}.",
    ],
    help: {
      mode: "Standard forms: 1/(ax + b), sin(ax + b), eᵃˣ and partial fractions. Leibniz: the nth derivative of u·v.",
      f: "The function y, e.g. `1/((x - 1)(x - 2))`.",
      u: "The first factor, e.g. `x^2`.",
      v: "The second factor, e.g. `e^(3x)`.",
      n: "Which derivative (a whole number for Leibniz).",
    },
    maths: ['f', 'u', 'v'],
  },
  optimization: {
    howTo: ["Pick a problem from the list.", "Change its numbers to match your question.", "Press {button} for the set-up, the derivative and the best value."],
    help: { template: "A standard word problem (box, fence, cylinder …)." },
  },
  'related-rates': {
    howTo: ["Pick a problem from the list.", "Change its numbers to match your question.", "Press {button}. NETZ differentiates with respect to time t."],
    help: { template: "A standard word problem (ladder, balloon, cone …)." },
  },
  'partial-derivative': {
    howTo: [
      "Choose what to find: partial derivatives, or a total derivative along a path.",
      "Type f(x, y) or f(x, y, z), e.g. `x^2 y + e^(xy)`.",
      "Type the letters to differentiate by, in order: `x`, or `xy` for ∂²f/∂y∂x. Press {button}.",
    ],
    help: {
      mode: "Partial: with respect to one letter. Total: when x, y depend on t.",
      f: "The function. Write xy for x times y.",
      order: "Letters in order: `x`, `y`, `xx`, `xy`.",
      xt: "x in terms of t.", yt: "y in terms of t.", zt: "z in terms of t (only if f uses z).",
    },
    maths: ['f', 'xt', 'yt', 'zt'],
  },
  'power-series': {
    howTo: [
      "Write your series as Σ cₙ (x − a)ⁿ and type only the coefficient cₙ: for Σ n xⁿ / 3ⁿ type `n/3^n`.",
      "Type the centre a (usually `0`).",
      "Press {button} for the radius and the interval of convergence, with the end points checked.",
    ],
    help: { c: "The coefficient in n. Use `n!` for factorial.", center: "The a in (x − a)ⁿ.", power: "Whether each term has (x − a)ⁿ, (x − a)²ⁿ and so on." },
    maths: ['c'],
  },
  'reduction-formula': {
    howTo: ["Choose the integral (∫ sinⁿx, ∫ cosⁿx, ∫ xⁿeᵃˣ …).", "Type n (and a if asked), and choose the limits.", "Press {button} to see the formula used again and again until it stops."],
    help: { kind: "Which standard integral.", n: "The power n, a whole number.", a: "The a in eᵃˣ.", wallis: "0 to π/2 gives Wallis's formula." },
  },
  'stokes-theorem': {
    howTo: [
      "Type the vector field F = P i + Q j + R k.",
      "Choose the surface and type its size.",
      "Press {button}. NETZ works out both sides of Stokes' theorem.",
    ],
    help: {
      ...PQR, surface: "The surface whose edge is the curve.", ...RECT,
      c: "The height of the plane z = c.", ia: "Where the plane cuts the x-axis.", ib: "Where it cuts the y-axis.", ic: "Where it cuts the z-axis.",
    },
    maths: ['P', 'Q', 'R'],
  },
  'surface-integral': {
    howTo: [
      "Choose the integral: flux of a vector field, a surface integral of a function, or a volume integral.",
      "Type the field or function.",
      "Choose the surface or solid and type its size. Press {button}.",
    ],
    help: {
      mode: "Flux: ∬ F · n dS. Surface: ∬ f dS. Volume: ∭ f dV.",
      ...PQR, f: "The function to integrate; empty means 1 (area or volume).",
      surface: "The surface to integrate over.", g: "The surface as z = g(x, y), e.g. `1 - x - y`.",
      region: "The solid for a volume integral.", ...SOLID,
      ylo: "Smallest y (may use x).", yhi: "Largest y (may use x, e.g. `1 - x`).",
    },
    maths: ['P', 'Q', 'R', 'f', 'g'],
  },
  'taylor-2var': {
    howTo: ["Type f(x, y), e.g. `e^x sin(y)`.", "Type the point (a, b) to expand about; (0, 0) gives Maclaurin.", "Choose the order and press {button}."],
    help: { f: "The function in x and y.", a: "The x of the centre.", b: "The y of the centre.", order: "Up to which powers to keep." },
    maths: ['f'],
  },
  'trig-integrals': {
    howTo: [
      "Choose the kind: powers of sin and cos, or a trig substitution form like √(a² − x²).",
      "Type the integrand: `sin(x)^2 cos(x)^3`.",
      "Optionally type limits and press {button}.",
    ],
    help: { kind: "Which family of trig integral.", f: "Powers go after the bracket: `sin(x)^3`.", a: FROM, b: TO },
    maths: ['f'],
  },
  'triple-integral': {
    howTo: [
      "Type the integrand, e.g. `x y z`, and the order, innermost first: `dz dy dx`.",
      "Type the limits from the inside out. Inner limits may use the outer letters; the outermost are numbers.",
      "Press {button}.",
    ],
    help: {
      f: "What is being integrated. For cylindrical or spherical, include r or ρ² sin φ.",
      order: "Innermost first: `dz dy dx`.",
      l1from: "Innermost lower limit.", l1to: "Innermost upper limit.",
      l2from: "Middle lower limit.", l2to: "Middle upper limit.",
      l3from: "Outermost lower limit (a number).", l3to: "Outermost upper limit (a number).",
    },
    maths: ['f', 'l1from', 'l1to', 'l2from', 'l2to'],
  },
  'volume-revolution': {
    howTo: [
      "Choose the axis to turn about (x-axis, y-axis, or a line y = k or x = k).",
      "Type the top curve (and the bottom curve, if the region is between two).",
      "Type the limits, or leave them empty to use where the curves meet. Press {button}.",
    ],
    help: {
      axis: "About the x-axis NETZ uses washers; about the y-axis, shells.",
      f: "The upper curve, in x: `sqrt(x)`.",
      g: "Optional lower curve; empty means the axis.",
      a: "Optional start x.", b: "Optional end x.", k: "The line y = k or x = k (0 means the axis itself).",
    },
    maths: ['f', 'g'],
  },
  "limit-laws": {
    "howTo": [
      "Type the function, for example `(x^2 + 1)/(x + 1)`.",
      "Type the number $x$ approaches.",
      "Press {button}. Each step names the law used (sum, product, quotient …)."
    ],
    "help": {
      "f": "Your function, written with x: `x^2 + 3x`, `(2x + 1)*sqrt(x + 4)`. Put `*` between a bracket and a letter.",
      "a": "The number x gets close to, like `2` or `pi/2`."
    },
    "maths": [
      "f"
    ]
  },
  "indeterminate-forms": {
    "howTo": [
      "Type the function, like `(x^2 - 1)/(x - 1)`.",
      "Type where x is heading: a number, or `inf` / `-inf`.",
      "Press {button}. NETZ names the form, rewrites it and finds the limit."
    ],
    "help": {
      "f": "Your function in x. For a product write `x*ln(x)`; for a power `(1 + 1/x)^x`.",
      "a": "A number like `0` or `1`, or `inf` for infinity."
    },
    "maths": [
      "f"
    ]
  },
  "ivt": {
    "howTo": [
      "Type the function, like `x^3 - x - 1`.",
      "Type the two ends $a$ and $b$.",
      "Leave the target empty to look for a root, or type the height N you want. Press {button}."
    ],
    "help": {
      "f": "Your function in x, like `x^3 - x - 1` or `cos(x) - x`.",
      "a": "The left end of the interval, like `1`.",
      "b": "The right end (bigger than the left), like `2`.",
      "y": "The height N to reach. Empty means N = 0 (find a root)."
    },
    "maths": [
      "f"
    ]
  },
  "discontinuity-types": {
    "howTo": [
      "Type the function. For a piecewise function write each piece with a condition, separated by `;`.",
      "Choose the stretch of x to search (the default −10 to 10 is fine).",
      "Press {button}. NETZ checks each suspect point and names the type."
    ],
    "help": {
      "f": "Your function: `1/(x - 2)`, or pieces like `x + 1 for x < 0; x - 1 for x >= 0`.",
      "lo": "Where to start searching along the x-axis.",
      "hi": "Where to stop searching."
    },
    "maths": [
      "f"
    ]
  },
  "product-rule": {
    "howTo": [
      "Type the first factor $u$ in the first box and the second factor $v$ in the second box.",
      "Optionally type an $x$ to get the slope there.",
      "Press {button}. NETZ finds $u'$ and $v'$ and puts them in the rule."
    ],
    "help": {
      "u": "The first factor, like `x^2`.",
      "v": "The second factor, like `sin(x)`.",
      "at": "Optional: an x where you also want the slope. Leave empty to skip."
    },
    "maths": [
      "u",
      "v"
    ]
  },
  "quotient-rule": {
    "howTo": [
      "Type the top $u$ in the first box and the bottom $v$ in the second box.",
      "Optionally type an $x$ to get the slope there.",
      "Press {button}. NETZ finds $u'$ and $v'$ and puts them in the rule."
    ],
    "help": {
      "u": "The top of the fraction, like `x`.",
      "v": "The bottom of the fraction, like `x^2 + 1`. It must not be 0.",
      "at": "Optional: an x where you also want the slope. Leave empty to skip."
    },
    "maths": [
      "u",
      "v"
    ]
  },
  "chain-rule": {
    "howTo": [
      "Type the function that has a function inside another function, like `sin(x^2)`.",
      "Optionally type an $x$ to get the slope there.",
      "Press {button}. NETZ finds the layers, differentiates each and multiplies."
    ],
    "help": {
      "f": "A function inside a function: `sin(x^2)`, `(3x + 1)^5`, `e^(2x)`, `sqrt(x^2 + 1)`.",
      "at": "Optional: an x where you also want the slope. Leave empty to skip."
    },
    "maths": [
      "f"
    ]
  },
  "curve-tracing": {
    "howTo": [
      "Type the function $y = f(x)$, like `x^3 - 3x`.",
      "Press {button}.",
      "Read the checklist in the working below, and compare it with the graph."
    ],
    "help": {
      "f": "Your function in x: `x^3 - 3x`, `x^2/(x^2 - 1)`, `x*e^x`."
    },
    "maths": [
      "f"
    ]
  },
  "riemann-sum": {
    "howTo": [
      "Choose where the rectangle heights are taken: left end, right end or middle.",
      "Type the function and the limits $a$ and $b$.",
      "Type the number of strips $n$ and press {button}. Try a bigger $n$ to see the sum close in."
    ],
    "help": {
      "rule": "Left or right end of each strip, or the middle. The right end is the textbook limit-of-a-sum choice.",
      "f": "The function to integrate, like `x^2`.",
      "a": "Where the area starts, like `0`.",
      "b": "Where it ends, like `1`.",
      "n": "How many strips to cut it into: a whole number like `4`, `10` or `100`."
    },
    "maths": [
      "f"
    ]
  },
  "fundamental-theorem": {
    "howTo": [
      "Choose \"Find an area\" to evaluate a definite integral, or \"Differentiate an integral\" for a variable limit.",
      "For an area, type the function and the two limits. For the derivative, type the integrand in $t$ and the limits in $x$.",
      "Press {button}. The working shows each part of the theorem."
    ],
    "help": {
      "mode": "Part 2 gives a number (the area). Part 1 differentiates an integral and gives a function of x.",
      "f": "The function to integrate, like `x^2`.",
      "a": "The lower limit, like `0`.",
      "b": "The upper limit, like `3`.",
      "h": "The integrand written in t, like `sqrt(1 + t^2)`.",
      "lo": "The lower limit: a number like `0`, or an expression in x.",
      "up": "The upper limit, an expression in x, like `x^2`."
    },
    "maths": [
      "f",
      "h"
    ]
  },
  "standard-integrals": {
    "howTo": [
      "Type the function you want to integrate.",
      "Press {button}.",
      "Each step names the table formula that was used."
    ],
    "help": {
      "f": "Your function: `3x^2 + 2/x - cos(x)`. Sums are done term by term."
    },
    "maths": [
      "f"
    ]
  },
  "u-substitution": {
    "howTo": [
      "Type the integrand. Put `*` between a letter and a bracket, like `2*x*(x^2 + 1)^3`.",
      "Leave u empty and NETZ finds a good one, or type your own u to try it.",
      "For a definite integral, fill in both limits. Press {button}."
    ],
    "help": {
      "f": "The function to integrate: `2*x*(x^2 + 1)^3`, `x*e^(x^2)`, `cos(x)/sin(x)`.",
      "u": "Optional: the inside part you want as u, like `x^2 + 1`. Empty means NETZ looks for one.",
      "a": "Optional lower limit, for a definite integral.",
      "b": "Optional upper limit."
    },
    "maths": [
      "f",
      "u"
    ]
  },
  "integration-by-parts": {
    "howTo": [
      "Type the product to integrate, with `*` between the two parts, like `x*e^x`.",
      "Leave u empty and NETZ picks it with ILATE, or type your own u to compare.",
      "For a definite integral, fill in both limits. Press {button}."
    ],
    "help": {
      "f": "The product to integrate: `x*e^x`, `x*sin(x)`, `ln(x)`.",
      "u": "Optional: the part you want as u, like `x`. Empty means NETZ uses ILATE.",
      "a": "Optional lower limit, for a definite integral.",
      "b": "Optional upper limit."
    },
    "maths": [
      "f",
      "u"
    ]
  },
  "definite-integral-properties": {
    "howTo": [
      "Type the function and the two limits.",
      "Press {button}. NETZ finds the value, then tests each property on your integral.",
      "Green means the property gives a shortcut here; blue means it is always true."
    ],
    "help": {
      "f": "The function: `x^3`, `sin(x)/(sin(x) + cos(x))`.",
      "a": "The lower limit, like `-1` or `0`.",
      "b": "The upper limit, like `1` or `pi/2`."
    },
    "maths": [
      "f"
    ]
  },
};

export default GUIDES;
