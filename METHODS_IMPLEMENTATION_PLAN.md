# NETZ — Implementation Plan for the New Methods

> **Written**: 2026-11-03
> **What this is**: *how* to build the methods listed in `NETZ_METHODS_CATALOG.md`. The catalog says *what*; `NETZ_ROADMAP.md` says *when*.
> **Scope**: about 300 topics across Units 1–15, built in 4 batches. Batch 1 is planned page by page; Batches 2–4 are planned by group.
> **Progress**: A1 done 2026-11-03 (`src/app/data/methods.js`; `public/sitemap.xml` deleted). A2 done 2026-11-04 (per-page titles, descriptions, canonical links and JSON-LD; covers roadmap F1–F3 and F7). A3 done 2026-11-04 (`src/app/components/method/`; Newton-Raphson page moved onto it as the reference, checked identical by screenshot; `Faq`, `RelatedMethods`, `UsedIn`, `OpenInNotes` built but not on any page yet). A4 done 2026-11-04 (`src/app/utils/numeric/`: steps, matrix, tridiagonal, differences, ode; 53 hand-worked checks pass, now in `tests/engines/`; no page uses it yet). A5 done 2026-11-04: `npm run new-method -- --id … --route … --unit … --name "…"`, `npm run test:engines`, `npm run check:methods`; units 6–15 and a `building` status (hidden, noindex) added to `methods.js`. **Foundation (A1–A5) complete.** Batch 1, Unit 8 (pages 1–4) built and published (live) 2026-11-04: `/determinant`, `/matrix-inverse`, `/rank-of-matrix`, `/matrix-calculator`; shared `components/method/Matrix.js` (input with paste and fractions, textbook display, row operations) and `Calculator.js`. No Notes widget, code export or task yet. Unit 9 (pages 5–10) built and published (live) 2026-11-04: `/area-and-perimeter`, `/volume-and-surface-area`, `/pythagoras-theorem`, `/triangle-solver`, `/unit-circle`, `/coordinate-geometry`; shared `utils/numeric/geometry.js`, `components/method/ShapeCalculator.js`, `ShapeDiagrams.js`, `TriangleDiagram.js`, `CoordPlot.js`. Unit 10 (pages 11–13) built and published (live) 2026-11-04: `/percentage-calculator`, `/compound-interest`, `/emi-calculator`; shared `utils/finance/money.js` (₹ with Indian grouping, 6 currencies) and `components/method/StackedBars.js` (palette validated with the dataviz script: light #3B6FC2/#D9692A, dark #4F80D4/#DD7135). Unit 11 (pages 14–15) built 2026-11-04 as `building`, and they **stay hidden until the owner checks the rates** (NETZ_OWNER_TODO.md section K): `/gst-calculator`, `/vat-calculator`; rates files `src/app/data/rates/in.js` (GST 2.0 + previous slabs) and `vat.js` (UK, EU 27, Gulf, Asia–Pacific), `utils/rates/getRule.js`, `components/method/RatesBadge.js`, fixed cases in `tests/engines/rates.test.mjs`. Unit 7 (pages 16–19) built and published (live) 2026-11-04: `/quadratic-equation`, `/system-of-equations`, `/arithmetic-geometric-progression`, `/permutations-and-combinations`; shared `utils/numeric/latex.js`; `CoordPlot` draws curves and keeps labels inside. Units 1–4 additions (pages 20–29) built and published (live) 2026-11-04: `/sor-method`, `/difference-table`, `/stirling-interpolation`, `/bessel-interpolation`, `/cubic-spline`, `/romberg-integration`, `/power-method`, `/rk2-method`, `/milne-predictor-corrector`, `/adams-bashforth-moulton`; partial-pivoting option added to Gauss elimination and Gauss-Jordan (default unchanged); shared `engines/input.js`, `OdeCalculator`, `InterpolationCalculator`, `DifferenceTable`. **All 29 Batch 1 pages are built.** Batch 2 started 2026-11-04: symbolic step engine in `src/app/utils/symbolic/` (`tree.js`: parsing, tidy/polish/bestForm with exact ln and roots, LaTeX; `derivative.js`: sum, constant, power, product, quotient, chain, exponential, logarithmic and 18 functions, steps outermost first). Decision D3 taken as the default (own rules on math.js; every answer checked against math.js's derivative at sample points). First page `/derivative-calculator` (Unit 6) published (live) 2026-11-04. `CoordPlot` gained a fixed `view` with separate x/y scales. Limits built 2026-11-04 in `src/app/utils/symbolic/limit.js` (substitution, factor-and-cancel by synthetic division, degree comparison at ±∞, L'Hôpital up to 5 rounds, number/0 sign check, one-sided limits, numeric cross-check and labelled numeric estimates), page `/limit-calculator` (Unit 6) published (live) 2026-11-04, listed before Differentiation as in textbooks. Integrals built 2026-11-04: `symbolic/integral.js` (table with linear inside, sin²/cos²/tan² identities, f′/f, u-substitution, by parts incl. tabular and e^ax·sin bx, partial fractions incl. repeated and irreducible quadratic), every answer checked by differentiating it; definite integrals with exact values (π/4, 2 ln 2 − 1) or a labelled numeric value; new `symbolic/poly.js` replaces math.rationalize (which hung on (2x+1)^6) in limits, integrals and bestForm; page `/integral-calculator` (Unit 6) built, hidden (building) until published. Differentiation group built 2026-11-04 (hidden): /first-principles-derivative (polynomials, fractions, roots, sin, cos, eˣ, ln), /implicit-differentiation (term by term, slope and vertical tangents at a point), /logarithmic-differentiation (xˣ, long products), /parametric-differentiation (dy/dx, d²y/dx², tangent at t); shared `symbolic/present.js` picks the tidiest equal form (incl. sin² + cos² = 1) and `components/method/StepList.js` shows symbolic steps. Applications group built 2026-11-04 (hidden): /tangent-normal-calculator, /increasing-decreasing-calculator, /maxima-minima-calculator, /area-under-curve-calculator (under and between curves), /taylor-series-calculator; new shared `symbolic/roots.js` (exact polynomial roots incl. surds, numeric search) and `symbolic/critical.js` (sign analysis of f′). Unit 6 Batch 2 is complete. Unit 7 algebra built 2026-11-04 (hidden): /linear-equation-solver, /factoring-calculator, /inequality-solver, /rational-expressions-calculator, /binomial-theorem-calculator, /complex-number-calculator, /logarithm-calculator; new `symbolic/algebra.js` (factoring with steps: common factor, identities, ac method, factor theorem) and `components/method/SymbolicCalculator.js` (shared calculator shell). Unit 8 built 2026-11-04 (hidden): /consistency-of-linear-equations, /linear-dependence-calculator, /eigenvalues-eigenvectors, /cayley-hamilton-theorem, /vector-calculator; new `numeric/eigen.js` (characteristic polynomial, null space) and `components/method/MatrixMethodCalculator.js`. Unit 5 built 2026-11-04 (hidden): /descriptive-statistics, /correlation-coefficient, /regression-lines, /curve-fitting, /binomial-distribution, /poisson-distribution, /normal-distribution, /bayes-theorem, /random-variables, /anova; new `numeric/distributions.js` (normal CDF/inverse, pmfs, ranks, deviation table) reusing the gamma/beta functions now exported from `utils/criticalValues.js`. Unit 9 built 2026-11-04 (hidden): /circle-equation-calculator, /conic-sections-calculator, /heights-and-distances (exact answers in p + q√3); `readQuadratic` in engines/circles.js reads second-degree equations for both coordinate pages. Units 1–4 Batch 2 built 2026-11-04 (hidden): /newton-raphson-system (2 or 3 equations, symbolic Jacobian), /double-integration (trapezoidal and Simpson grids), /cholesky-decomposition (exact surds, optional Ax = b), /qr-decomposition (Gram–Schmidt and QR iteration), /jacobi-eigenvalue-method (symmetric, up to 6 × 6); `MatrixMethodCalculator` gained extra fields and custom steps. Next: the tax and savings pages, which wait for the owner's rate check.

---

## 1. What the code looks like today

Checked in `src/` on 2026-11-03.

| Finding | Where | Why it matters for new methods |
| :--- | :--- | :--- |
| **Every method is listed by hand in about 10 places** | `components/AlgorithmNavigation.js` (`ALGORITHMS_REGISTRY`), `components/editorial/navData.js` (`UNITS_DATA`), `components/Sidenav.js`, `app/sitemap.js`, `Notes/utils/algorithmRegistry.js`, `Notes/components/EmbeddedMathWidget.js`, `utils/codeExport/index.js` + `programs.js`, `utils/progress/catalog.js`, `components/mascot/taskEmblems.js`, `tests/browser/alg-phone.mjs` | 300 new methods × 10 files = 3,000 hand edits. Lists already disagree (Gauss-Seidel is Unit 1 in `catalog.js`, Unit 4 in `AlgorithmNavigation.js`; the sitemap misses 7 pages) |
| **Pages are `'use client'` and use `next/head`** | e.g. `(UNIT-1)/newton-raphson-method/page.js` | The App Router ignores `next/head`, so every page is titled "NETZ". New pages must not copy this |
| **Each page is one long hand-written file** | `page.js` ≈ 245 lines of repeated Tailwind; engine file ≈ 560 lines | Copying this 300 times makes later design changes impossible |
| **Solver logic lives twice** | Page engine (`algorithems.<name>.js`) and Notes widget (`algorithmRegistry.js`, 1,700 lines) | Two copies of every algorithm drift apart (already noted in the algorithm audit) |
| **math.js and nerdamer are already installed** | `package.json`; `utils/evaluateMath.js` already has `getSymbolicDerivative`, `simplifyExpression`, `expressionToTex` | The symbolic engine can start without a new dependency |
| **Phone layout is shared** | `alg.css .alg-body` + `FitMath` + `LongTables` in `(pages.algorithems)/layout.js` | New pages get phone support for free if they use the same layout |
| **Next.js 16** | `AGENTS.md` | Read `node_modules/next/dist/docs/` on `metadata` and route layouts before step A2 |

**Conclusion:** build a small foundation first (section 2), then pages go fast. Without it, Batch 1 alone means ~300 hand edits across shared files.

---

## 2. Step A — Foundations (before any new page)

Estimated **5–7 working days**. Each step is useful on its own and also fixes the 34 existing pages.

### A1. One methods list

New file **`src/app/data/methods.js`**: one entry per method, the only place a method is declared.

```js
{
  id: 'newton-raphson',              // used by activity, code export, Notes, tasks
  route: '/newton-raphson-method',
  unit: 1, group: 'Roots of equations',
  name: 'Newton-Raphson Method',
  title: 'Newton-Raphson Method Calculator with Steps',   // <title>
  description: 'Solve f(x)=0 by Newton-Raphson…',         // meta, ~150 chars
  searchWords: ['newton raphson', "newton's method", 'nr method'],
  related: ['secant', 'bisection', 'newton-systems'],
  usedIn: ['Anna', 'VTU', 'GTU'],
  engine: 'num',                       // num | sym | rate
  batch: 0,                            // 0 = live today
  status: 'live',                      // live | building | planned
  lastmod: '2026-11-03',
}
```

Then make every list **read from it** instead of keeping its own copy:
- `AlgorithmNavigation.js`, `navData.js`, `Sidenav.js` → build their menus from `methods.js` grouped by unit.
- `sitemap.js` → every `status: 'live'` entry, with `lastmod`. Delete `next-sitemap.config.js`'s sitemap output so there is one source (roadmap F4).
- `tests/browser/alg-phone.mjs` → reads the routes from `methods.js`.
- `catalog.js`, `taskEmblems.js`, `codeExport`, Notes registry keep their own per-method *behaviour*, but key it by the same `id`, and a small check (A5) fails if any id is unknown.

Fill it with the 34 live pages first. Fix the unit mismatches while doing it.

### A2. Titles and descriptions per page (roadmap F1–F3)

- Fix the placeholder description in `(pages.algorithems)/layout.js` and `(Primary.pages)/layout.js`.
- Add `src/app/utils/seo/methodMetadata.js`: `methodMetadata(id)` returns a Next `metadata` object from `methods.js`.
- Each method folder gets a 3-line server `layout.js`: `export const metadata = methodMetadata('newton-raphson')`.
- Remove `<Head>` from page files.
- Add `components/seo/JsonLd.js` (`BreadcrumbList` + `LearningResource`) to the same layout (roadmap F7).

### A3. A shared page shell

New **`src/app/components/method/`**, built from what the existing pages repeat:

| Component | Replaces |
| :--- | :--- |
| `MethodPage` | header badge, h1, theme toggle, fullscreen, `AlgorithmNavigation`, widths |
| `AnswerFirst` | the intro paragraph (one plain sentence + formula) |
| `FormulaBox` | "How it works" card with 3 step tiles |
| `WorkedExample` + `ExampleStep` | the hand-written step cards |
| `StepTable` | iteration / difference tables (works with `LongTables`) |
| `Faq` | 3–5 questions from `searchWords` |
| `RelatedMethods` | links from `related` |
| `UsedIn` | "Used in: Anna, VTU, GTU" line |
| `OpenInNotes` | "Open in Notes" / "Try it on the Board" button (roadmap F13) |

Keep the current editorial look exactly — this is a refactor of markup into components, not a redesign. Move the existing pages over only when someone touches them; new pages use the shell from day one.

### A4. Shared maths code

New **`src/app/utils/numeric/`** — pure functions, no React, used by both the page and the Notes widget (ends the "solver lives twice" problem for new methods):

| File | Contents | First used by |
| :--- | :--- | :--- |
| `matrix.js` | multiply, transpose, power, determinant (expansion + row reduction, with steps), inverse (adjoint + Gauss-Jordan), RREF, rank | Unit 8 batch 1 |
| `tridiagonal.js` | Thomas algorithm with steps | cubic spline, BVPs, heat equation |
| `differences.js` | forward / backward / central difference table | difference table, Stirling, Bessel |
| `ode.js` | one RK4 / RK2 / Euler step, start-value helper | Milne, Adams, shooting |
| `steps.js` | `{ rows, headers, notes }` step-record shape every engine returns | everything |

Every engine returns the same shape: `{ result, steps: { headers, rows }, notes, plot? }`. The page renders it with `StepTable`; the Notes widget and code export read the same object.

### A5. A new-page script and checks

- **`scripts/new-method.mjs <id>`** creates the folder, `layout.js`, a `page.js` using the shell, an empty engine file and a test stub, and adds the `methods.js` entry with `status: 'building'`.
- **`tests/engines/*.test.mjs`** (Node's built-in test runner): each engine is checked against its textbook answer (Grewal for engineering, NCERT for school). Fast, no browser.
- **`tests/methods-list.mjs`**: every `methods.js` route has a folder; every id used in `catalog.js`, `codeExport`, Notes registry exists in `methods.js`.

---

## 3. Batch 1 — 29 pages, no symbolic engine (roadmap Phase 1, task 1.9)

Order follows catalog section 13. Routes are lowercase and use the main search phrase. "Calculator" goes in the route only when that's the phrase people search ("emi-calculator").

New unit folders: `(UNIT-7)`…`(UNIT-11)` (route groups, so they don't change URLs).

### 3.1 Unit 8 — Matrices (`(UNIT-8)/`)

| # | Route | Engine (in `utils/numeric/matrix.js`) | Reuses | Notes |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `/matrix-calculator` | add, subtract, multiply, transpose, power | — | Shared `MatrixInput` component (sizes 1×1 to 6×6, paste from text) |
| 2 | `/determinant` | cofactor expansion (≤4×4) + row reduction | `gauss-elimination` | Show both methods as tabs |
| 3 | `/matrix-inverse` | adjoint method + Gauss-Jordan `[A｜I]` | `gauss-jordan` | Singular matrix message |
| 4 | `/rank-of-matrix` | RREF / echelon form + rank | `gauss-jordan` | Also answers "rref calculator" |

`MatrixInput` is built once here and reused by Units 4 and 7.

### 3.2 Unit 9 — Geometry and trigonometry (`(UNIT-9)/`)

| # | Route | What it does | Notes |
| :---: | :--- | :--- | :--- |
| 5 | `/area-and-perimeter` | Shape picker: square → ellipse (11 shapes, incl. Heron) | One formula table per shape in `utils/numeric/shapes.js`; SVG drawing of the shape with labels |
| 6 | `/volume-and-surface-area` | 9 solids | Same pattern as 5 |
| 7 | `/pythagoras-theorem` | Any two sides → third; SOH-CAH-TOA | Right-triangle SVG |
| 8 | `/triangle-solver` | SSS, SAS, ASA, AAS, SSA (ambiguous case shows both triangles) | Sine and cosine rules |
| 9 | `/unit-circle` | Interactive circle: drag angle, see sin/cos/tan, degrees ↔ radians | Touch-first drag (owner rule: all devices, touch first) |
| 10 | `/coordinate-geometry` | Slope, distance, midpoint, section formula, line equation in all forms, angle between lines, point-to-line distance, triangle area | Tabs per formula; plot with `UnifiedPlot` |

### 3.3 Unit 10 — Interest and finance (`(UNIT-10)/`)

| # | Route | What it does | Notes |
| :---: | :--- | :--- | :--- |
| 11 | `/percentage-calculator` | % of, % change, profit/loss, discount, successive discount, markup vs margin | Formula steps |
| 12 | `/compound-interest` | SI + CI (any frequency), continuous, effective rate, rule of 72 | Year-by-year table; also serves "simple interest" via a tab |
| 13 | `/emi-calculator` | EMI, full amortisation schedule, flat vs reducing, prepayment | Month-by-month table (needs `LongTables` on phones) |

Formulas live in `utils/finance/`. Number format: ₹ with Indian grouping by default, switch to other currencies.

### 3.4 Unit 11 — Taxes (`(UNIT-11)/`)

**First build the rates file** (catalog 0.2):
- `src/app/data/rates/in.json`, `eu.json`, `uk.json`, … each rule with `valid_from`, `valid_to`, `source`, `checked_on`, `status`.
- `utils/rates/getRate(country, kind, date)` — pages never contain a rate.
- `components/method/RatesBadge` ("Rates as of …", year picker, "use my own rate", "not tax advice").
- `tests/engines/rates.test.mjs` with fixed cases per rule.

| # | Route | What it does |
| :---: | :--- | :--- |
| 14 | `/gst-calculator` | Add / remove GST, CGST+SGST vs IGST split |
| 15 | `/vat-calculator` | Add / remove VAT by country |

**Owner task** (add to `NETZ_OWNER_TODO.md`): check every GST and VAT rate on CBIC and the EU Commission list before these two go live. Pages ship with `status: 'building'` until then.

### 3.5 Unit 7 — Algebra (`(UNIT-7)/`)

| # | Route | What it does | Notes |
| :---: | :--- | :--- | :--- |
| 16 | `/quadratic-equation` | Formula, discriminant, nature of roots, vertex, completing the square, complex roots | Numeric is enough for batch 1; factoring step uses rational-root check |
| 17 | `/system-of-equations` | 2×2 and 3×3: substitution, elimination, Cramer's rule | Reuses `matrix.js` determinant |
| 18 | `/arithmetic-geometric-progression` | AP and GP nth term, sum, sum to infinity, Σn, Σn² | Tabs |
| 19 | `/permutations-and-combinations` | nPr, nCr, factorial, circular, with repetition | BigInt for large factorials |

### 3.6 Units 1–4 — numerical additions

| # | Route | Unit | Reuses | Notes |
| :---: | :--- | :---: | :--- | :--- |
| 20 | `/power-method` | 4 | `matrix.js` | Plus inverse power as a switch |
| 21 | `/milne-predictor-corrector` | 4 | `ode.js` (RK4 start values) | |
| 22 | `/adams-bashforth-moulton` | 4 | `ode.js` | |
| 23 | `/rk2-method` | 4 | `runge-kutta-method` | Heun / midpoint switch |
| 24 | `/cubic-spline` | 2 | `tridiagonal.js` | Natural / clamped |
| 25 | `/difference-table` | 2 | `differences.js` | Δ, ∇, δ, E operators |
| 26 | `/stirling-interpolation` | 2 | `differences.js`, `gauss-forward` | |
| 27 | `/bessel-interpolation` | 2 | `differences.js`, `gauss-backward` | |
| 28 | `/romberg-integration` | 3 | `trapezoidal-Rule` | Romberg triangle table |
| 29 | `/sor-method` | 1 | `Gauss-seidal` | ω slider |
| — | *Partial pivoting switch* | 4 | — | Option on existing `gauss-elimination` and `gauss-jordan`, not a new page |

These 10 pages also get **code export** (`programs.js`) and a **Notes widget**, like the existing numeric methods.

### 3.7 Batch 1 per-page work and pace

For each page, in this order:
1. `node scripts/new-method.mjs <id>`
2. Engine in `utils/numeric/` (or `finance/`, `rates/`) + textbook test case
3. Page with the shell: answer-first intro, formula box, one worked example (Grewal / NCERT), solver, FAQ, related links
4. Notes widget entry (numeric pages), code export (numeric pages)
5. Task and medal — **only if the owner approves** (the 50-task sheet is fixed today; see section 6)
6. `status: 'live'` in `methods.js` → sitemap and nav pick it up automatically

Roadmap pace is 2–3 pages a week → **Batch 1 takes about 10–12 weeks** after the 1-week foundation. Pages 5, 6, 10 and 11 are larger (many sub-calculators) and count as two each.

Testing follows the owner's rule: build the whole batch first, then run engine tests, `alg-phone.mjs`, `alg-break.mjs` (worst-case inputs) and the methods-list check together at the end.

---

## 4. Batch 2 — symbolic engine and core calculus (roadmap Phase 2)

### 4.1 The symbolic step engine (catalog 0.1) — build first

**Recommendation:** our own rule engine on top of the **math.js expression tree**, with **nerdamer** as a back-up checker. No Pyodide yet.

- math.js is already used everywhere (`evaluateMath.js`), so parsing and LaTeX output (`toTex`) are shared with existing pages.
- Neither library gives student-style steps, so the step layer is ours in every option. Writing it on the tree we already parse is cheapest.
- nerdamer (already installed) checks the final answer of integrals, factoring and equation solving, so a wrong step shows up in tests.
- Pyodide/SymPy (~10 MB) only if Batch 3 (ODEs, Laplace) proves too hard. Decide after differentiation ships.

Layout — **`src/app/utils/symbolic/`**:

| File | Job |
| :--- | :--- |
| `tree.js` | parse, print, compare, simplify (math.js nodes) |
| `rules/derivative.js` | power, constant, sum, product, quotient, chain, trig, exp, log — each rule returns `{ before, after, rule, tex }` |
| `rules/integral.js` | table lookup, power rule, linearity, substitution (pattern `f(g(x))·g'(x)`), by parts (ILATE), partial fractions |
| `rules/limit.js` | substitution, factor-and-cancel, rationalise, L'Hôpital (repeat) |
| `rules/algebra.js` | expand, factor (GCF, grouping, identities, rational roots), polynomial division |
| `stepper.js` | applies rules depth-first, records a step list, stops on a size/step limit |
| `verify.js` | compares the result with nerdamer and with numeric checks at random points |

Order: derivative (2–3 weeks) → limits → integrals (hardest, 3–4 weeks) → algebra rules. Each new rule gets a test file of textbook problems before it is wired to a page.

Symbolic pages export steps as **LaTeX** instead of code (catalog checklist item 5).

### 4.2 Batch 2 pages (by group)

| Group | Pages (from catalog) | Depends on |
| :--- | :--- | :--- |
| Unit 6A–6C, 6E–6F, 6H | limits, first principles, derivative, implicit, logarithmic, parametric, tangent/normal, increasing/decreasing, maxima/minima, integrals (standard, substitution, parts, partial fractions, definite), area, Taylor series | 4.1 |
| Unit 7 | linear equations, factoring, rational expressions, inequalities, logs, complex numbers, binomial theorem | 4.1 (`algebra.js`); complex numbers and inequalities are numeric |
| Unit 8 | consistency, linear dependence, eigenvalues, Cayley-Hamilton, vectors | `matrix.js` + characteristic polynomial from `algebra.js` |
| Unit 5 | descriptive statistics, correlation, regression, curve fits, binomial / Poisson / normal, Bayes, random variables, ANOVA | numeric; add `utils/numeric/distributions.js` (normal CDF, z-table) |
| Unit 9 | circles, conics, heights and distances | numeric |
| Units 10–11 | India savings (rates file), US sales tax, Canada, India income tax | rates file; **owner verifies rates** |
| Units 1–4 | Newton for systems, double integration, Cholesky, QR, Jacobi eigenvalue | `matrix.js`, existing engines |

---

## 5. Batches 3 and 4 (roadmap Phase 3)

Planned in detail when Batch 2 ends; these are the build notes known now.

| Batch | Groups | New shared code needed |
| :---: | :--- | :--- |
| 3 | Unit 6 multivariable (partials, Jacobians, multiple integrals, beta/gamma, Fourier, vector calculus basics) | multi-variable support in `symbolic/`; 3D plot (check `UnifiedPlot` first) |
| 3 | Unit 12 first- and higher-order ODEs | `symbolic/rules/ode.js` (classify, then IF / CF+PI / variation of parameters) — **the point to re-decide Pyodide** |
| 3 | Unit 13 Laplace, DFT/FFT | Laplace table rules; FFT is numeric with a butterfly diagram SVG |
| 3 | Unit 9 trig identities, inverse trig, 3D geometry, polar | trig rewrite rules |
| 3 | Unit 10 TVM, NPV/IRR, depreciation | IRR calls the existing secant / Newton-Raphson engines ("IRR is Newton-Raphson on NPV" link) |
| 3 | Unit 11 capital gains, HRA, TDS, US/UK income tax | rates file; owner verification |
| 3 | Unit 15 truth tables, modular arithmetic, graph algorithms, simplex | graph editor component (touch drag nodes) |
| 3 | Units 1–5 golden section, gradient descent, BVPs, heat/Laplace PDEs, distributions, estimation | `tridiagonal.js`, grid heatmap component |
| 4 | Units 12–14 PDEs, Fourier/Z transforms, complex variables; Unit 15 rest; vector integral theorems; "later" items; bill discounting; corporate tax | depends on how far the symbolic engine got |

---

## 6. Decisions for the owner

| # | Question | Default if no answer |
| :---: | :--- | :--- |
| D1 | Do new pages get tasks and medals? Today the task sheet is fixed at 50 tasks. Options: one task per new **unit** ("solve 3 Unit 8 problems"), or none until a later rewards update | One task per new unit, added when the unit's first 3 pages are live |
| D2 | Are pages behind a Pro wall? (e.g. code export Pro as today, steps free) | Same as today: steps free, code export Pro |
| D3 | Symbolic engine: own rules on math.js (recommended) vs Pyodide/SymPy | Own rules |
| D4 | Route style for new pages (section 3) | Lowercase search phrase, as in section 3 |
| D5 | Rate checks for GST/VAT/income tax (owner-only, added to `NETZ_OWNER_TODO.md`) | Tax pages stay unlisted until checked |

---

## 7. Risks

- **Symbolic integration is hard.** Integrals with no simple rule must say "NETZ can't show steps for this one" rather than give a wrong answer. `verify.js` guards this.
- **Wrong tax rates hurt trust.** No rate ships without a `source` and `checked_on`.
- **Refactor creep.** A1–A4 must not redesign the existing pages; the owner already reverted one hub redesign (2026-10-22).
- **Search demand is US-weighted.** Check Google Trends India before fixing the order inside each batch (catalog section 15).
- **Next.js 16 changes.** Read the bundled docs before writing `metadata`, route layouts or the sitemap.

---

## 8. Done when

- **Foundation:** adding a method touches `methods.js` + its own folder + engine (+ optional Notes/export/task files) and nothing else; every live page has its own title.
- **Each batch:** every page is live in `methods.js`, passes its engine test, `alg-phone.mjs` and `alg-break.mjs`, and appears in the sitemap and nav.
