# NETZ — Methods and Units Catalog

> **Written**: 2026-11-03
> **What this is**: every method, topic and calculator NETZ should add, grouped into units, with a build order.
> **When to build** each batch is in `NETZ_ROADMAP.md`; this file only says *what*.
> **Research behind it** (in `research_notes/`):
> - `NETZ global market and new methods/` — demand data and Indian syllabi for numerical methods
> - `NETZ topics and new units/engineering_maths_courses.md` — 28 course papers from Anna, VTU, RGPV, GTU, AKTU, Mumbai and SPPU
> - `NETZ topics and new units/basic_maths_taxonomy.md` — calculus, algebra and geometry menus, school curricula, US search volumes
> - `NETZ topics and new units/interest_and_taxes.md` — finance formulas, tax rates, rates-file design

## How to read this

- **No course-code pages.** Each *topic* gets its own page. Courses only tell us which topics matter. Each page can carry a small "Used in: Anna, VTU, GTU…" line.
- **N** = how many of the 28 Indian engineering-maths course papers include the topic (out of 28).
- **US/mo** = US monthly Google searches for the calculator, where known. India-heavy topics get few US searches, so a low number there doesn't mean low value.
- **Engine**:
  - **num** — numeric, like today's pages
  - **sym** — needs symbolic maths (see section 0)
  - **rate** — needs the tax and rates file (section 0)
- **Batch** = build order 1 → 4 (section 13). It matches the roadmap phases.
- ✅ = already in NETZ.
- ⭐ = **high priority**: listed in the next section. These are the first pages to make findable on **Google** and in answers from **ChatGPT, Gemini, Claude and Perplexity**.

---

## ⭐ High-priority methods: findable on Google and AI assistants

These are the pages people look for most. They were picked by search demand, the number of courses that include them (N), and school or exam weight. **Make these pages show up first** in two places:
- **Google search**, including the AI Overview box at the top.
- **AI assistants** (ChatGPT, Gemini, Claude, Perplexity), so they quote and link NETZ when a student asks "how do I do Newton-Raphson?".

The **"Search words"** column lists what people actually type: other names, Indian textbook names and common misspellings. Use these words in the page's **title, URL, main heading, first paragraph and FAQ**. Don't put them in a hidden keyword list; Google ignores those.

### What every ⭐ page needs

**A. Things Google and AI tools read**

| # | Need | Example for Newton-Raphson | Now |
| :---: | :--- | :--- | :--- |
| 1 | **Its own title** with the method name and "calculator with steps" | `Newton-Raphson Method Calculator with Steps — NETZ` | ❌ every page is titled "NETZ" (checked on the live site 2026-11-03) |
| 2 | **Its own meta description** (about 150 characters) saying what the page does | "Solve f(x)=0 by Newton-Raphson. Enter your function and get every iteration in an exam-style table, with a graph." | ❌ live description is "current objective: survive" |
| 3 | **A clear URL** with the main search words | `/newton-raphson-method` | ✅ already good |
| 4 | **Content in the HTML the server sends** (AI crawlers often don't run JavaScript) | Definition, formula, worked example and table visible without clicking | ✅ the live page already sends the worked example as HTML |
| 5 | **Answer first**: one plain sentence saying what the method is, then the formula, then the steps | "The Newton-Raphson method finds a root of f(x)=0 by repeating xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)." | partly |
| 6 | **A short FAQ** using the search words as questions. Google removed FAQ rich results on 7 May 2026, so this won't show as a special result. It still helps AI answers quote the page | "What is the Newton-Raphson formula?", "When does Newton-Raphson fail?", "Newton-Raphson vs bisection?" | ❌ |
| 7 | **Structured data** (JSON-LD): `BreadcrumbList` + `LearningResource` on each page. `MathSolver` markup goes on the **site as a whole** (home page), pointing at a solver URL that accepts the user's expression; it is not per method | One `<script type="application/ld+json">` per page, plus one site-level MathSolver block | ❌ none found in `src/` |
| 8 | **Links between related pages** | Newton-Raphson ↔ Secant ↔ Bisection ↔ "Newton for systems" | partly |
| 9 | **Unique worked example** per page (no near-copy template text) | Different function and numbers on every page | check |

**B. Site-wide setup (do once)**

| # | Need | Why |
| :---: | :--- | :--- |
| 10 | **Custom domain** (not `netz-ruby.vercel.app`) | Trust and ranking; also needed for AdSense |
| 11 | **robots.txt allows the search crawlers**: `Googlebot` (Google, AI Overviews and Gemini answers), `Bingbot`, `OAI-SearchBot` + `ChatGPT-User` (ChatGPT search), `Claude-SearchBot` + `Claude-User` (Claude), `PerplexityBot`. The training-only bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`) don't affect being cited. Allowing them is the owner's choice | Allowed today by `User-agent: * Allow: /`, but name them explicitly so a later rule doesn't block them by mistake |
| 12 | **Google Search Console + Bing Webmaster Tools**, sitemap submitted to both, **IndexNow** pings on new pages | ChatGPT search relies largely on Bing's index, so Bing matters as much as Google |
| 13 | **Sitemap complete with `lastmod`** dates | The sitemap is missing 7 method pages today |
| 14 | **`/llms.txt`**: a short plain-text list of the ⭐ pages with one-line descriptions | A proposed standard; cheap to add, though it's unclear which AI tools read it |
| 15 | **Fast pages on phones** (Core Web Vitals) | Ranking factor; most students are on phones |
| 16 | **Track it**: Search Console impressions per page, plus visits whose referrer is chatgpt.com, gemini.google.com, claude.ai or perplexity.ai | Shows which pages AI tools actually send people to |

> These are standard practices as of late 2026, not guarantees: Google and the AI companies change what they reward. Check Google's current structured-data docs before building item 7.

### Already in NETZ ✅ (index these on day one)

| # | Method | Unit | Search words |
| :---: | :--- | :---: | :--- |
| P1 | Newton-Raphson ✅ | 1 | newton raphson, newton's method, nr method, root finding, newton rapson |
| P2 | Bisection ✅ | 1 | bisection, interval halving, bolzano method, root of equation |
| P3 | False position ✅ | 1 | regula falsi, false position, method of false position |
| P4 | Gauss-Seidel ✅ | 1 | gauss seidel, gauss seidal, iterative method linear equations |
| P5 | Lagrange interpolation ✅ | 2 | lagrange, lagrange interpolation, unequal intervals |
| P6 | Newton forward / backward ✅ | 2 | newton forward, newton backward, forward difference, backward difference, interpolation |
| P7 | Simpson 1/3 and 3/8 ✅ | 3 | simpson, simpsons rule, simpson 1/3, simpson 3/8, numerical integration |
| P8 | Trapezoidal ✅ | 3 | trapezoidal, trapezium rule, trapezoid rule |
| P9 | Runge-Kutta ✅ | 4 | runge kutta, rk4, rk method, range kutta, ode numerical |
| P10 | Euler / Modified Euler ✅ | 4 | euler method, modified euler, heun, improved euler |
| P11 | Gauss elimination ✅ | 4 | gauss elimination, gaussian elimination, row reduction, linear equations |
| P12 | Gauss-Jordan ✅ | 4 | gauss jordan, rref, reduced row echelon |
| P13 | LU decomposition ✅ | 4 | lu decomposition, lu factorization, doolittle, crout |
| P14 | Chi-square ✅ | 5 | chi square, chi-squared, goodness of fit, χ² test |
| P15 | t-test ✅ | 5 | t test, student t, students t-test |
| P16 | Least squares / straight-line fit ✅ | 5 | least squares, curve fitting, line of best fit, linear fit |

### New — calculus and algebra (need the symbolic engine)

| # | Method | Unit | Why | Search words |
| :---: | :--- | :---: | :--- | :--- |
| P17 | Derivative (power, product, quotient, chain) | 6B | 135K US/mo | derivative, differentiation, differentiate, chain rule, product rule, quotient rule, d/dx |
| P18 | Implicit and logarithmic differentiation | 6B | NCERT 12, JEE | implicit differentiation, logarithmic differentiation, dy/dx |
| P19 | Integral (substitution, by parts, partial fractions) | 6E | 165K US/mo | integral, integration, integrate, antiderivative, by parts, ilate, substitution, partial fractions |
| P20 | Definite integral and area under a curve | 6E / 6F | NCERT 12, AP | definite integral, area under curve, area between curves |
| P21 | Limits and L'Hôpital's rule | 6A | 33.1K US/mo; N=5 | limit, limits, lhopital, l'hospital, l hospital rule, 0/0 |
| P22 | Maxima and minima (one variable) | 6C | NCERT 12, AP | maxima minima, maximum minimum, critical points, extrema, optimisation |
| P23 | Taylor and Maclaurin series | 6H | N=6; 643k views/yr | taylor series, maclaurin series, series expansion |
| P24 | Partial derivatives and Euler's theorem | 6D | N=8 | partial derivative, partial differentiation, euler theorem homogeneous |
| P25 | Maxima / minima of two variables + Lagrange multipliers | 6D | N=8 each | lagrange multiplier, maxima minima two variables, saddle point |
| P26 | Jacobian | 6D | N=7 | jacobian, jacobian determinant |
| P27 | Double and triple integrals, change of order | 6G | N=8 | double integral, triple integral, change of order, multiple integral |
| P28 | Beta and gamma functions | 6G | N=7 | beta function, gamma function |
| P29 | Fourier series | 6H | N=7 | fourier series, half range series, fourier coefficients |
| P30 | Gradient, divergence, curl | 6I | N=7 | grad div curl, gradient, divergence, curl, del operator |
| P31 | Quadratic equation | 7B | Formula 450K US/mo | quadratic formula, quadratic equation, discriminant, roots of quadratic, sridharacharya |
| P32 | Factoring polynomials | 7C | 40.5K US/mo | factoring, factorise, factorize, polynomial roots, synthetic division |
| P33 | Logarithms and exponential equations | 7H | 22K US/mo | log, logarithm, ln, exponential equation, change of base |
| P34 | First-order ODEs (separable, linear, Bernoulli, exact) | 12 | N=6 each | differential equation, ode, linear differential equation, bernoulli, exact equation, integrating factor |
| P35 | Higher-order ODE with constant coefficients | 12 | N=7 | complementary function, particular integral, cf pi, auxiliary equation |
| P36 | Laplace and inverse Laplace transform | 13 | N=5; 373k views/yr | laplace transform, inverse laplace, laplace table |

### New — formula pages (no symbolic engine needed)

| # | Method | Unit | Why | Search words |
| :---: | :--- | :---: | :--- | :--- |
| P37 | System of equations | 7F | 49.5K US/mo | system of equations, simultaneous equations, cramer's rule, linear equations solver |
| P38 | AP and GP | 7J | NCERT 11 | arithmetic progression, geometric progression, ap gp, nth term, sum of series |
| P39 | Permutations and combinations | 7L | NCERT 11, JEE | permutation, combination, npr, ncr, factorial |
| P40 | Binomial theorem | 7K | NCERT 11 | binomial theorem, binomial expansion, general term |
| P41 | Matrix calculator (arithmetic) | 8 | 33.1K US/mo | matrix calculator, matrix multiplication, transpose |
| P42 | Determinant | 8 | 313k views/yr | determinant, det, matrix determinant |
| P43 | Matrix inverse | 8 | NCERT 12, GTU | inverse matrix, matrix inverse, adjoint |
| P44 | Rank and echelon form | 8 | N=7 | rank of matrix, echelon form, normal form |
| P45 | Eigenvalues and eigenvectors | 8 | N=8; 384k views/yr | eigenvalue, eigenvector, characteristic equation, eigen value |
| P46 | Cayley-Hamilton theorem | 8 | N=7 | cayley hamilton |
| P47 | Unit circle | 9E | 823K US/mo | unit circle, trig values, radians to degrees |
| P48 | Triangle solver (sine and cosine rules) | 9D | 60.5K US/mo | triangle calculator, sine rule, cosine rule, law of sines, law of cosines, heron's formula |
| P49 | Pythagoras theorem | 9C | 40.5K US/mo | pythagoras, pythagorean theorem, hypotenuse |
| P50 | Area and perimeter (2D shapes) | 9A | 27K US/mo | area, perimeter, area of circle, area of triangle |
| P51 | Volume and surface area (3D shapes) | 9B | 40.5K US/mo | volume, surface area, volume of cylinder, volume of cone, volume of sphere |
| P52 | Slope, distance, midpoint, line equation | 9H | 40.5K + 33.1K US/mo | slope, gradient of line, distance formula, midpoint, equation of line, section formula |
| P53 | Conic sections | 9J | NCERT 11, JEE | parabola, ellipse, hyperbola, conic, eccentricity, focus directrix |
| P54 | Percentages, profit and loss, discount | 10A | Every school level | percentage, percent change, profit loss, discount, markup, margin |
| P55 | Simple and compound interest | 10B | CBSE 8–12 | simple interest, compound interest, si ci, interest calculator |
| P56 | EMI and loan schedule | 10C | Very high India demand | emi, emi calculator, loan, amortization, amortisation, home loan |
| P57 | SIP, FD, RD | 10D | High India demand | sip, sip calculator, fd, fixed deposit, rd, recurring deposit, ppf |
| P58 | GST (add / remove, CGST/SGST/IGST) | 11A | High India demand | gst, gst calculator, cgst sgst, igst, gst inclusive, gst exclusive |
| P59 | VAT (add / remove, by country) | 11B | Worldwide | vat, vat calculator, value added tax, reverse vat |
| P60 | India income tax (new vs old regime) | 11E | High India demand | income tax, tax calculator, new regime, old regime, tax slab |
| P61 | US sales tax | 11C | US demand | sales tax, sales tax calculator |
| P62 | Mean, median, mode, standard deviation | 5 | N=4; every level | mean, median, mode, average, standard deviation, variance, sd |
| P63 | Correlation and regression | 5 | N=6 | correlation, regression, karl pearson, spearman rank, regression line |
| P64 | Normal, binomial, Poisson distributions | 5 | N=6; 989k + 473k + 694k views/yr | normal distribution, z score, binomial distribution, poisson distribution, bell curve |
| P65 | Power method (eigenvalues) | 4 | N=3 | power method, power iteration, dominant eigenvalue |
| P66 | Milne / Adams predictor-corrector | 4 | N=4 | milne, predictor corrector, adams bashforth, adams moulton |
| P67 | Cubic spline | 2 | 115k views/yr | cubic spline, spline interpolation, natural spline |

**How to use the search words:**
- **Title + main heading:** the most-searched name plus "calculator with steps".
- **First paragraph and FAQ:** the other names and textbook names, written as real sentences ("also called regula falsi").
- **Misspellings** ("range kutta", "gauss seidal"): don't put them on the page. Google already corrects them. Just check in Search Console that the page still shows up for them.
- **On every ⭐ page:** a clear "Open in Notes" / "Try it on the Board" button, so visitors from Google and AI land in the paid product.

---

## 0. Two new foundations to build first

### 0.1 A symbolic step engine (unlocks Units 6, 7, 8, 12, 13, 14)

Today's NETZ engines work with numbers. Derivatives, integrals, factoring, limits and ODEs need an engine that works on expressions and records each rule it applies, so the page can show "chain rule → …" as steps.

- **Choose one:**
  - a JS computer-algebra library (Algebrite, nerdamer, or math.js for derivatives only), plus NETZ's own step-recording layer;
  - or SymPy running in the browser through Pyodide. It is far stronger but large (about 10+ MB), so load it only on the pages that need it.
- **Build the rule-by-rule step layer ourselves.** No free library outputs student-style steps. This is the main engineering cost of the new units.
- **Start with differentiation.** It is the easiest symbolic engine and has very high demand (135K US searches a month).

### 0.2 A rates file (unlocks Units 10 and 11)

Tax and interest rates change every year, so rates must never be written into page code.

- **One file per country**, e.g. `src/app/data/rates/in.json`, `uk.json`, `us.json`. Each rule has:
  - `valid_from` / `valid_to`
  - `source` (URL)
  - `checked_on` (date)
  - `status`: `verified`, `secondary` or `unverified`
- **Pages hold only formulas.** They look up the rule for the date the user picks.
- **Every tax page shows:**
  - a "Rates as of …" badge
  - a year picker
  - a "use my own rate" box
  - a "not tax advice" line
- **Fixed test cases** for every rule, so a rate change that breaks a page shows up straight away.
- **Owner review calendar:**
  - India Budget (Feb)
  - GST Council meetings
  - small-savings rates (each quarter)
  - US IRS update (Oct)
  - UK tax year (Apr)

---

## Units 1–5 — existing numerical-methods units (additions)

### Unit 1 — Roots of equations and iteration

| Method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Bisection, False position, Newton-Raphson, Secant, Fixed-point iteration, Gauss-Seidel ✅ | — | — | num | — |
| SOR (ω slider) | Chapra; Brazil | `Gauss-seidal` | num | 1 |
| Newton's method for nonlinear systems (2×2 Jacobian) | Stanford CME108, Burden | `newton-raphson-method` + `gauss-elimination` | num | 2 |
| Golden-section search | Optimisation | `bisection-method` bracket UI | num | 3 |
| Gradient descent | 222k Wikipedia views/yr; draws ML students | new, small | num | 3 |
| Muller, Graeffe, Horner, Bairstow, Ramanujan | Niche; check Mumbai/SPPU first | — | num | later |

### Unit 2 — Interpolation and finite differences

| Method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Newton forward/backward, Gauss forward/backward, Lagrange, Newton divided difference ✅ | — | — | num | — |
| Difference table + operators (Δ, ∇, δ, E) | JNTUH, IGNOU, VTU | `newton-forward` table | num | 1 |
| Stirling interpolation | NIT KKR, NPTEL | `gauss-forward` / `gauss-backward` | num | 1 |
| Bessel interpolation | NIT KKR, NPTEL | `gauss-forward` / `gauss-backward` | num | 1 |
| Cubic spline (natural / clamped) | 115k + 48k views/yr; MIT, Oxford, GTU, KTU | new, small (Thomas solve) | num | 1 |
| Hermite, inverse interpolation, Everett | GTU, KTU | Lagrange | num | later |

### Unit 3 — Numerical integration and differentiation

| Method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Trapezoidal, Simpson 1/3 and 3/8, Boole, Weddle, Gauss quadrature, Numerical differentiation ✅ | — | — | num | — |
| Romberg integration | Chapra, Brazil | `trapezoidal-Rule` | num | 1 |
| Double integration (trapezoidal / Simpson) | Anna Unit IV | `simpson-1-3-Rule`, `trapezoidal-Rule` | num | 2 |
| Monte Carlo integration | 510k views/yr | new, small | num | 4 |

### Unit 4 — ODEs and linear systems (numerical)

| Method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Euler, Modified Euler, Runge-Kutta, Taylor series method, Gauss elimination, Gauss-Jordan, Jacobi, LU ✅ | — | — | num | — |
| RK2 (Heun / midpoint) | GTU practicals | `runge-kutta-method` | num | 1 |
| Partial pivoting (switch on Gauss elimination / Gauss-Jordan) | Anna, IGNOU | `gauss-elimination` | num | 1 |
| Milne predictor-corrector | N=4; GATE "multi-step" | `runge-kutta-method` (start values) | num | 1 |
| Adams-Bashforth-Moulton | N=4; Oxford | `runge-kutta-method` | num | 1 |
| Power method (+ inverse power) | N=3; 384k views/yr for eigenvalues | new, small | num | 1 |
| Cholesky | 137k views/yr | `lu-decomposition` | num | 2 |
| QR (Gram-Schmidt) | 132k + 105k views/yr | new, medium | num | 2 |
| Jacobi eigenvalue method | Anna | new, medium | num | 2 |
| Boundary value problems: finite difference | Chapra, MIT, GTU | Thomas solve from cubic spline | num | 3 |
| Shooting method | Chapra, MIT | `runge-kutta-method` + `secant-method` | num | 3 |
| Heat equation (Bender-Schmidt, Crank-Nicolson) | 169k views/yr | Thomas solve | num | 3 |
| Laplace equation (Liebmann) | 107k views/yr | `Gauss-seidal` | num | 3 |
| Wave equation (explicit) | NPTEL | heat-equation grid | num | 4 |
| Conjugate gradient, SVD | Oxford, MIT | — | num | 4 |
| Floating-point / IEEE-754 error analysis | GTU, IGNOU error units | new, small | num | 4 |
| Chebyshev nodes + Runge's phenomenon | MIT | Lagrange | num | 4 |

### Unit 5 — Probability and statistics

The research shows probability is in about 6 of the 28 papers, so it belongs here.

| Method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Chi-square, F-test, t-test, Large-sample tests, Straight-line fit, Parabola fit, Least squares ✅ | — | — | num | — |
| Mean, median, mode, variance, SD, skewness, kurtosis (grouped + ungrouped) | N=4 | new, small | num | 2 |
| Correlation (Karl Pearson, Spearman rank) | N=6 | new, small | num | 2 |
| Regression lines (y on x, x on y) | N=6 | `least-squares` | num | 2 |
| Exponential / power / polynomial curve fits | N=4 | `least-squares`, `fitting-parabola` | num | 2 |
| Binomial distribution | N=6; 473k views/yr | new, small | num | 2 |
| Poisson distribution | N=6; 694k views/yr | new, small | num | 2 |
| Normal distribution (z-table, areas) | N=6; 989k views/yr | new, small | num | 2 |
| Bayes' theorem | N=4 | new, small | num | 2 |
| Random variables: PMF/PDF, expectation, variance | N=6 | new, small | num | 2 |
| Moments and moment generating function | N=3 | new, small | sym | 3 |
| Exponential, uniform, geometric, gamma distributions | N=3 | normal-distribution page | num | 3 |
| Joint distributions, covariance | N=2 | new | num | 3 |
| ANOVA (one-way, two-way, Latin square, 2² factorial) | N=3; a full Anna unit | `f-test` | num | 2 |
| Confidence intervals / estimation | N=2 | t-test, z-test | num | 3 |
| Non-parametric tests (sign, Mann-Whitney) | N=2 | new | num | 4 |
| Control charts (x̄, R, p, c) | N=2 | new, small | num | 4 |
| Markov chains (n-step transition) | N=1 | matrix power | num | 4 |

---

## Unit 6 — Calculus

The strongest new unit. It has the biggest global search demand and is in every first-year engineering paper.

### 6A — Limits and continuity

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Limit by substitution, factoring, rationalising | "limit calculator" 33.1K US/mo | sym | 2 |
| L'Hôpital's rule (0/0, ∞/∞, repeated) | N=5 | sym | 2 |
| Standard limits (sin x / x, (1+1/x)^x) | NCERT 11, JEE | sym | 2 |
| Squeeze theorem | AP Calculus | sym | 3 |
| One-sided limits, continuity check, asymptotes | AP Calc, A-level | sym | 3 |

### 6B — Differentiation

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Derivative from first principles | NCERT 11, A-level | sym | 2 |
| Power, product, quotient and chain rules | "derivative calculator" 135K US/mo | sym | 2 |
| Implicit differentiation | AP Calc, JEE | sym | 2 |
| Logarithmic differentiation | NCERT 12, JEE | sym | 2 |
| Parametric differentiation | NCERT 12 | sym | 2 |
| Higher-order and nth derivative, Leibniz theorem | N=2 | sym | 3 |

### 6C — Applications of derivatives

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Tangent and normal lines | NCERT 12, AP Calc | sym | 2 |
| Increasing / decreasing, critical points | NCERT 12 | sym | 2 |
| Maxima and minima of one variable (1st and 2nd derivative tests) | NCERT 12, AP | sym | 2 |
| Optimisation word problems | AP Calc | sym | 3 |
| Related rates | AP Calc | sym | 3 |
| Rolle's theorem, mean value theorem | N=2 | sym | 3 |
| Errors and approximations (differentials) | N=2 | sym | 3 |
| Curvature, polar curves, curve tracing | N=2 | sym | 4 |

### 6D — Partial differentiation and several variables

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Partial and total derivatives | N=8 | sym | 3 |
| Euler's theorem on homogeneous functions | N=5 | sym | 3 |
| Jacobians | N=7 | sym | 3 |
| Taylor series in two variables | N=3 | sym | 3 |
| Maxima and minima of two variables | N=8 | sym | 3 |
| Lagrange multipliers | N=8 | sym | 3 |

### 6E — Integration techniques

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Standard integrals and the power rule | "integral calculator" 165K US/mo | sym | 2 |
| Substitution | AP, NCERT 12 | sym | 2 |
| Integration by parts (incl. tabular) | 32K US/mo | sym | 2 |
| Partial fractions | NCERT 12, JEE | sym | 2 |
| Trigonometric integrals and trig substitution | Calc II | sym | 3 |
| Definite integrals and properties | NCERT 12 | sym | 2 |
| Improper integrals | N=3 | sym | 3 |
| Differentiation under the integral sign (Leibniz rule) | N=2 | sym | 4 |
| Reduction formulae | Mumbai, SPPU | sym | 4 |

### 6F — Applications of integrals

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Area under a curve, area between curves | 27K US/mo for area | sym | 2 |
| Volume of revolution (disc, washer, shell) | AP Calc BC | sym | 3 |
| Arc length, surface area of revolution | N=3 | sym | 3 |
| Average value of a function | AP Calc | sym | 3 |

### 6G — Multiple integrals and special functions

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Double integrals (Cartesian and polar) | N=8; 19K US/mo | sym | 3 |
| Change of order of integration | N=8 | sym | 3 |
| Triple integrals | N=8 | sym | 3 |
| Change of variables | N=4 | sym | 3 |
| Area and volume by multiple integrals | N=8 | sym | 3 |
| Centre of mass, moment of inertia | N=4 | sym | 4 |
| Beta and gamma functions | N=7 | sym + num | 3 |

### 6H — Sequences and series

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Convergence tests (nth term, comparison, ratio, root, integral, alternating) | N=3 | sym | 3 |
| Power series, radius and interval of convergence | N=3; 25K US/mo | sym | 3 |
| Taylor and Maclaurin series | N=6; 643k views/yr | sym | 2 |
| Fourier series (full and half-range) | N=7 | sym + num | 3 |
| Complex Fourier series, Parseval's identity | N=3 | sym | 4 |
| Harmonic analysis (Fourier from a data table) | N=3 | num | 3 |

### 6I — Vector calculus

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Gradient, divergence, curl; directional derivative | N=7 | sym | 3 |
| Solenoidal and irrotational fields, scalar potential | N=5 | sym | 3 |
| Line integrals, work done | N=6 | sym | 4 |
| Surface and volume integrals | N=4 | sym | 4 |
| Green's, Stokes' and Gauss divergence theorems (verify) | N=4–5 | sym | 4 |

---

## Unit 7 — Algebra

The biggest school-level demand: "algebra calculator / equation solver" gets 110K US searches a month.

| Sub-part | Topics / methods | Demand / courses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| 7A Linear equations | One-variable, literal equations, word problems | Algebra I | sym | 2 |
| 7B Quadratics | Quadratic formula, completing the square, factoring, discriminant, nature of roots, vertex | Formula 450K, calculator 50–90K US/mo | num + sym | **1** |
| 7C Polynomials and factoring | Long division, synthetic division, remainder and factor theorems, rational roots, factoring (GCF, grouping, identities) | Factoring 40.5K | sym | 2 |
| 7D Rational expressions | Simplify, add/subtract, partial fractions | NCERT, Algebra II | sym | 2 |
| 7E Inequalities | Linear, quadratic, absolute value, graphing; linear programming (graphical) | NCERT 11–12 | num | 2 |
| 7F Systems of equations | Substitution, elimination, Cramer's rule, 3×3 | 49.5K US/mo | num | **1** |
| 7G Functions | Domain and range, inverse, composition, even/odd, transformations | Precalc, NCERT 12 | sym | 3 |
| 7H Exponents and logarithms | Laws, solving exponential and log equations, change of base | Log calculator 22K | sym | 2 |
| 7I Complex numbers | Arithmetic, modulus/argument, polar form, De Moivre, roots of unity | NCERT 11; N=2 | num | 2 |
| 7J Sequences and series | AP and GP nth term and sum, sum to infinity, special series (Σn, Σn²) | NCERT 11 | num | **1** |
| 7K Binomial theorem | Expansion, general term, middle term | NCERT 11 | sym | 2 |
| 7L Permutations and combinations | nPr, nCr, circular, with repetition | NCERT 11, JEE | num | **1** |
| 7M Sets, relations and logic | Venn diagrams, relation types, truth tables | NCERT 11, discrete maths | num | 3 |

---

## Unit 8 — Matrices and linear algebra

| Topic / method | Notes | Reuses | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| Matrix arithmetic (add, multiply, transpose, power) | "matrix calculator" 33.1K US/mo | new, small | num | **1** |
| Determinant (expansion + row reduction) | 313k views/yr | `gauss-elimination` | num | **1** |
| Inverse (adjoint and Gauss-Jordan) | NCERT 12, GTU | `gauss-jordan` | num | **1** |
| RREF / echelon form, rank | N=7; "rref calculator" 8.1k | `gauss-jordan` | num | **1** |
| Consistency of linear systems (rank method) | N=7 | rank | num | 2 |
| Linear dependence / independence | N=4 | rank | num | 2 |
| Eigenvalues and eigenvectors (characteristic polynomial, 2×2 / 3×3) | N=8 | new | num + sym | 2 |
| Cayley-Hamilton theorem (verify, inverse, powers) | N=7 | eigen page | num | 2 |
| Diagonalisation, orthogonal reduction | N=6 | eigen page | num | 3 |
| Quadratic form → canonical form, nature | N=3 | diagonalisation | num | 3 |
| Linear transformations, vector spaces, basis, dimension | N=2–3 | rank | num | 4 |
| Vectors: dot, cross, triple product, projection | Cross product 18K; NCERT 12 | new, small | num | 2 |

---

## Unit 9 — Geometry and trigonometry

Mostly formula-based, so it needs no symbolic engine: cheap to build, with high search demand.

| Sub-part | Topics / methods | Demand | Engine | Batch |
| :--- | :--- | :--- | :--- | :---: |
| 9A 2D shapes | Area and perimeter: square, rectangle, triangle (incl. Heron), circle, sector, arc, trapezium, parallelogram, rhombus, regular polygon, ellipse | Area 27K US/mo | num | **1** |
| 9B 3D shapes | Volume and surface area: cube, cuboid, cylinder, cone, frustum, sphere, hemisphere, prism, pyramid | Volume 40.5K | num | **1** |
| 9C Right triangles | Pythagoras, special triangles, SOH-CAH-TOA solving | Pythagoras 40.5K | num | **1** |
| 9D Any triangle | Sine rule, cosine rule, ambiguous case, area = ½ab sin C, triangle solver | Triangle 60.5K | num | **1** |
| 9E Trig functions and unit circle | Values, radians ↔ degrees, unit-circle explorer, graphs | Unit circle 823K | num | **1** |
| 9F Trig identities and equations | Verify identities, compound and multiple angles, general solutions | NCERT 11, JEE | sym | 3 |
| 9G Inverse trig | Principal values, identities | NCERT 12 | sym | 3 |
| 9H Coordinate geometry: points and lines | Distance, midpoint, section formula, slope, line equations (all forms), angle between lines, distance point→line, triangle area from coordinates | Slope 40.5K, distance 33.1K | num | **1** |
| 9I Circles | Equation from centre/radius or 3 points, tangent, chord | NCERT 11 | num | 2 |
| 9J Conic sections | Parabola, ellipse, hyperbola: focus, directrix, eccentricity, latus rectum, graph | NCERT 11, JEE | num | 2 |
| 9K 3D geometry | Direction cosines, line and plane equations, angle, shortest distance, point–plane distance | NCERT 12 | num | 3 |
| 9L Polar coordinates and transformations | Polar ↔ Cartesian, rotation, translation | Precalc | num | 3 |
| 9M Heights and distances | Angle of elevation and depression problems | NCERT 10–11 | num | 2 |

---

## Unit 10 — Interest and finance

Formula-based, needs the rates file (section 0.2) for savings rates. Large Indian search demand.

| Sub-part | Calculators | Inputs → steps | Batch |
| :--- | :--- | :--- | :---: |
| 10A Percentages and trade | % of, % change, profit and loss %, discount (incl. successive discounts), markup vs margin | Formula steps | **1** |
| 10B Simple and compound interest | Simple interest, compound interest (any frequency), continuous compounding, effective vs nominal rate, rule of 72 | Year-by-year table | **1** |
| 10C Loans | EMI with a full amortisation schedule, flat vs reducing rate, prepayment effect | Month-by-month table | **1** |
| 10D India savings | FD, RD, PPF (rate from the rates file), SIP, step-up SIP, lump sum | Year-by-year table | 2 |
| 10E Time value of money | Present and future value of annuity (ordinary and due), perpetuity, sinking fund, bond price | Cash-flow table | 3 |
| 10F Investment appraisal | CAGR, real (inflation-adjusted) return, NPV, IRR (iterations shown; reuses secant / Newton-Raphson), payback period | Iteration table | 3 |
| 10G Depreciation | Straight-line, written-down value / declining balance, sum of years' digits | Year-by-year schedule | 3 |
| 10H Bill discounting | True discount, banker's discount, banker's gain | Formula steps | 4 |

**IRR** reuses the Unit 1 root-finding engines. This is a good link between the finance unit and the numerical-methods units: "IRR is just Newton-Raphson on NPV".

---

## Unit 11 — Taxes

Every rate lives in the rates file (section 0.2) with its source and the date it was checked. Pages show "Rates as of …" and "Not tax advice".

> ⚠ **Check every rate on the official site before shipping.** Most rates below came from tax portals and news, not official pages. They are tagged *secondary* in `research_notes/NETZ topics and new units/interest_and_taxes.md`.

| Sub-part | Calculators | What to put in the rates file | Batch |
| :--- | :--- | :--- | :---: |
| 11A India GST | Add GST / remove GST (inclusive ↔ exclusive), CGST + SGST vs IGST split, input tax credit, reverse charge basics | GST 2.0 slabs 5 / 18 / 40% from 22 Sep 2025, plus special rates (0.25%, 3%, leftover 12% items). Verify on CBIC | **1** |
| 11B VAT worldwide | Add / remove VAT by country | UK 20%, EU standard rates by country, UAE 5%, Saudi 15%, Australia 10%, NZ 15%, Singapore 9%, Japan 10% / 8%. Verify EU rates on the EU Commission list | **1** |
| 11C US sales tax | State + local sales tax | State base rates plus a local-rate box | 2 |
| 11D Canada | GST / HST / PST by province | 5% GST; HST by province (e.g. Nova Scotia 14%, verified on CRA) | 2 |
| 11E India income tax | New vs old regime comparison, slabs, standard deduction, rebate with marginal relief, surcharge, 4% cess | Tax year 2026-27 under the Income-tax Act 2025. New regime: nil to ₹4L, then 5–30% in ₹4L steps, standard deduction ₹75k, rebate up to ₹12L. Verify on incometax.gov.in | 2 |
| 11F India other | HRA exemption, capital gains (STCG 20%, LTCG 12.5% above ₹1.25L), TDS (generic, user-entered rate) | Several thresholds unverified; check first | 3 |
| 11G US federal income tax | Brackets, standard deduction, take-home pay | 2026 brackets; only the standard deduction verified on irs.gov | 3 |
| 11H UK income tax + National Insurance | Take-home pay | 2026-27 bands; verify on GOV.UK | 3 |
| 11I Corporate tax basics | India, UK, US headline rates | Unverified; check first | 4 |

---

## Unit 12 — Differential equations (analytical)

| Topic / method | N | Engine | Batch |
| :--- | :---: | :--- | :---: |
| Variable separable, homogeneous | 6 | sym | 3 |
| Linear first order (integrating factor) | 6 | sym | 3 |
| Bernoulli equation | 6 | sym | 3 |
| Exact equations, integrating factors | 6 | sym | 3 |
| Clairaut, equations solvable for p / x / y | 3 | sym | 4 |
| Higher-order linear with constant coefficients (CF + PI) | 7 | sym | 3 |
| Variation of parameters | 7 | sym | 3 |
| Cauchy-Euler and Legendre linear equations | 7 | sym | 3 |
| Simultaneous linear ODEs | 2 | sym | 4 |
| Applications (circuits, Newton's cooling, growth and decay) | 3 | sym | 4 |
| Series solutions, Bessel, Legendre | 2 | sym | 4 |
| PDE: formation (eliminate constants / functions) | 3 | sym | 4 |
| PDE: Lagrange Pp + Qq = R | 4 | sym | 4 |
| PDE: Charpit, standard non-linear forms | 4 | sym | 4 |
| PDE: higher-order linear with constant coefficients | 4 | sym | 4 |
| PDE: separation of variables (heat, wave, Laplace) | 4 | sym | 4 |

## Unit 13 — Transforms

| Topic / method | N | Engine | Batch |
| :--- | :---: | :--- | :---: |
| Laplace transform (table + properties) | 5 | sym | 3 |
| Inverse Laplace (partial fractions, convolution) | 5 | sym | 3 |
| Unit step, Dirac delta, periodic functions | 5 | sym | 3 |
| Solving ODEs by Laplace transform | 5 | sym | 3 |
| Fourier transform, sine / cosine transforms | 5 | sym | 4 |
| Fourier integral | 3 | sym | 4 |
| Z-transform and inverse Z-transform | 4 | sym | 4 |
| Difference equations by Z-transform | 3 | sym | 4 |
| DFT / FFT (N = 4 or 8, butterfly diagram) | — (298k + 209k views/yr) | num | 3 |

## Unit 14 — Complex variables

| Topic / method | N | Engine | Batch |
| :--- | :---: | :--- | :---: |
| Analytic functions, Cauchy-Riemann check | 5 | sym | 4 |
| Harmonic functions, harmonic conjugate, Milne-Thomson | 5 | sym | 4 |
| Cauchy integral formula | 5 | sym | 4 |
| Taylor and Laurent series | 4 | sym | 4 |
| Residues and the residue theorem | 5 | sym | 4 |
| Real integrals by contour integration | 3 | sym | 4 |
| Conformal mapping, bilinear transformation | 4 | sym | 4 |

## Unit 15 — Discrete maths and optimisation

| Topic / method | Notes | Engine | Batch |
| :--- | :--- | :--- | :---: |
| Truth tables, logical equivalence | Anna MA3354 | num | 3 |
| Recurrence relations (characteristic roots) | Anna MA3354 | sym | 4 |
| Modular arithmetic, GCD (Euclid), RSA toy example | VTU BMATS101 | num | 3 |
| Boolean algebra simplification, K-maps | Anna MA3354 | num | 4 |
| Graph algorithms: BFS, DFS, Dijkstra, Prim, Kruskal | Dijkstra 490k views/yr | num | 3 |
| Linear programming: simplex, Big-M, duality | Mumbai EM-IV; LP 188k views/yr | num | 3 |
| Transportation and assignment (Hungarian) | Operations Research | num | 4 |
| Non-linear programming (Kuhn-Tucker) | Mumbai EM-IV | sym | 4 |

---

## 13. Build order

Each batch matches a phase in `NETZ_ROADMAP.md`. Within a batch, build top to bottom.

### Batch 1 — quick wins, no symbolic engine needed (Phase 1)

1. Unit 8: matrix arithmetic, determinant, inverse, RREF and rank (reuse Gauss elimination and Gauss-Jordan)
2. Unit 9: 2D and 3D shapes, right triangles, triangle solver, unit circle, points and lines
3. Unit 10: percentages, simple and compound interest, EMI schedule
4. Unit 11: GST and VAT add/remove (build the **rates file** first)
5. Unit 7: quadratics, systems of equations, AP/GP, permutations and combinations
6. Units 1–4: power method, Milne, Adams-Bashforth-Moulton, cubic spline, difference table, Stirling, Bessel, plus the cheap options (Romberg, SOR, pivoting, RK2)

### Batch 2 — symbolic engine and core calculus (Phase 2)

1. **Build the symbolic step engine** (section 0.1), starting with differentiation
2. Unit 6: limits, differentiation, applications of derivatives, core integration, area, Taylor series
3. Unit 7: linear equations, polynomials and factoring, rational expressions, inequalities, logs, complex numbers, binomial theorem
4. Unit 8: consistency, linear dependence, eigenvalues, Cayley-Hamilton, vectors
5. Unit 5: descriptive statistics, correlation, regression, curve fits, binomial/Poisson/normal, Bayes, random variables, ANOVA
6. Unit 9: circles, conics, heights and distances
7. Units 10–11: India savings, US sales tax, Canada, India income tax
8. Units 1–4: Newton for systems, double integration, Cholesky, QR, Jacobi eigenvalue

### Batch 3 — multivariable, ODEs, transforms (Phase 3)

- Unit 6: partial derivatives, multiple integrals, beta and gamma, series and Fourier series, vector calculus basics, the remaining applications
- Unit 12: first-order ODEs and higher-order ODEs
- Unit 13: Laplace transform, DFT/FFT
- Unit 9: trig identities and equations, inverse trig, 3D geometry, polar coordinates
- Unit 10: time value of money, NPV and IRR, depreciation
- Unit 11: India capital gains, HRA and TDS; US and UK income tax
- Unit 15: truth tables, modular arithmetic, graph algorithms, simplex
- Units 1–5: golden section, gradient descent, BVPs, heat and Laplace PDEs, more distributions, estimation

### Batch 4 — advanced and niche

- Units 12–14: PDEs (analytical), Fourier and Z transforms, complex variables
- Unit 15: the rest
- Unit 6: vector integral theorems, centre of mass, reduction formulae
- Units 1–5 "later" items (SVD, conjugate gradient, Monte Carlo, control charts, Markov chains, Muller, Bairstow…)
- Unit 10: bill discounting
- Unit 11: corporate tax

---

## 14. Checklist for every new page

1. Page folder + engine file `algorithems.<name>.js` under `src/app/(pages.algorithems)/(UNIT-n)/`. New units 6–15 need new `(UNIT-n)` folders.
2. Notes widget: `src/app/(Primary.pages)/Notes/utils/algorithmRegistry.js` (and `EmbeddedMathWidget.js` if needed)
3. Navigation: `src/app/components/AlgorithmNavigation.js`, `components/editorial/navData.js`, `components/Sidenav.js`. New units need new nav groups.
4. Sitemap: `src/app/sitemap.js`
5. Code export: `src/app/utils/codeExport/programs.js` + `index.js` (numeric pages; for symbolic pages, export the steps as LaTeX)
6. Tasks and medals: `src/app/utils/progress/catalog.js`, `components/mascot/taskEmblems.js`
7. Phone layout: shared `alg.css .alg-body` + `FitMath`; check with `tests/browser/alg-phone.mjs`
8. Worst-case inputs, as in `METHOD_PAGES_WORST_CASE_REPORT.md`
9. Its own page title and meta description, plus one worked example in textbook notation (Grewal for engineering, NCERT for school topics)
10. A "Used in: …" line listing the courses that include the topic (from `engineering_maths_courses.md`)
11. Tax and interest pages only: rates read from the rates file, with a "Rates as of" badge and fixed test cases
12. Google and AI findability: own title, meta description, answer-first intro, FAQ and JSON-LD built from the page's search words (see the ⭐ section, items 1–9). Then add the page to the sitemap and `llms.txt`.

---

## 15. Gaps in this catalog

- **US-only search volumes.** India-heavy topics (JEE, NCERT, engineering) are under-counted. Check Google Trends for India against the world before fixing the order inside each batch.
- **Course syllabi read only partly:**
  - RGPV BT-102 and BT-202, and AKTU BAS103 and BAS203: topics inferred
  - Mumbai Computer branch and SPPU Computer EM-III: not read
- **Tax rates:** most are *secondary*. Check every rate on CBIC, incometax.gov.in, IRS, GOV.UK and the EU Commission before shipping.
- **Symbolic engine:** not yet chosen. Its size and step quality decide how fast Units 6, 7 and 12–14 can ship.
