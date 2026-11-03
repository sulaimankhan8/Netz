# NETZ Units 1–4 (numerical methods): search demand and on-page SEO spec

Research date: 2026-11-03. Scope: every method in catalog Units 1–4 (✅ live and planned), from `Netz/NETZ_METHODS_CATALOG.md` lines 192–245 and the ⭐ table (P1–P13, P65–P67). Live slugs are the folder names under `src/app/(pages.algorithems)/` (route groups dropped).

**Sources used, and how:**
- **Wikipedia pageviews** (collected first-hand for this note, 2026-11-03): English Wikipedia, human "user" agent, all devices, Oct 2025–Sep 2026, summed over 12 months. Endpoint pattern: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/<Title>/monthly/20251001/20260930` — [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/). This is the **global** demand signal for every row below. The figures match the earlier note [methods_global_demand.md](../NETZ%20global%20market%20and%20new%20methods/methods_global_demand.md) where they overlap (e.g. Newton's method 324,738; Runge–Kutta 233,850).
- **Google autocomplete** (collected first-hand, 2026-11-03): `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=<in|us>&q=<seed>`, seeds = method name, "+ calculator", "+ formula", for India (`gl=in`) and US (`gl=us`). Autocomplete shows that people search a phrase, but not how many do. Raw output for 55 seeds is in the session scratchpad (`ac.txt`) and summarised per method below.
- **Keyword volume tools: no numbers obtained.** The Ahrefs free keyword generator page returned no figures without running its interactive form ([Ahrefs](https://ahrefs.com/keyword-generator)). seodata.dev offers "20 lookups a day, anonymous" with keyword pages at `/keyword/<slug>` ([seodata.dev](https://seodata.dev/)), but every request from this session got HTTP 429 / Cloudflare error 1015 (rate limit). Semrush, Ubersuggest and WordStream need a login or an interactive form. A web search for a published "newton raphson method" volume found none ([search result summary](https://dcode.fr/newton-raphson-method) was the nearest unrelated hit).
- **Live Google SERPs: not obtained.** A scripted Google request returned the "enable JavaScript" interstitial, so top-3 rankings, People-also-ask boxes, AI Overviews and calculator boxes could **not** be observed. The web-search tool used here is not Google and is US-only; its results for "calculator" queries were dominated by spam pages, so they are **not** a ranking proxy (details in Q2).

---

## Q1. Monthly search volume per method (main keyword + variants; US, India, global)

### Takeaway
No free tool returned keyword volumes from this session, so **no US or India monthly volume is reported for any method**. Global demand is given instead as English-Wikipedia views (12 months to Sep 2026), plus which keyword variants Google autocomplete confirms for India and the US. The strongest live pages by global interest are Newton-Raphson (325k views/yr), Runge-Kutta (234k), Gaussian elimination (172k), Euler (140k), trapezoidal (109k) and Simpson (108k). Among planned pages, gradient descent (222k), SVD (333k), Cholesky (137k), Gram-Schmidt/QR (132k + 105k) and heat equation (169k) stand out.

### Cited Findings

**Demand tier key (my own estimate, not a tool figure):** A = ≥100k Wikipedia views/yr; B = 30k–100k; C = 10k–30k; D = <10k. "Calc ✓" means Google autocomplete (gl=in) offers "<method> calculator …" phrases; "steps ✓" means it offers "… calculator with steps" or "step by step".

#### Unit 1 — Roots of equations and iteration

| Method | Status / live slug | Wikipedia article | Global views (Oct 25–Sep 26) | Avg /mo | Tier | Autocomplete variants confirmed (IN unless noted) |
| :--- | :--- | :--- | ---: | ---: | :---: | :--- |
| Newton-Raphson | ✅ `/newton-raphson-method` | Newton's_method | 324,738 | 27,062 | A | formula, example, calculator, **calculator with steps**, calculator 2 variables, derivation, "is used for", "in power system"; US adds matlab, python, "for square root", "power flow analysis" |
| Bisection | ✅ `/bisection-method` | Bisection_method | 51,719 | 4,310 | B | questions, formula, example, "solved examples pdf", python code; calc ✓, **step by step ✓**, "calculator technique/trick" (Casio), online |
| False position / regula falsi | ✅ `/false-position-method` | Regula_falsi | 17,032 | 1,419 | C | regula falsi: formula, solved examples, "is also known as", **calculator with steps**; false position: calculator, "calculator technique", solver, online calculator |
| Secant | ✅ `/secant-method` | Secant_method | 35,907 | 2,992 | B | example, "in numerical analysis", "is also known as", **calculator with steps**, calculator technique, formula derivation, solver |
| Fixed-point iteration | ✅ `/iteration-method` | Fixed-point_iteration | 32,587 | 2,716 | B | "fixed point iteration method solved examples pdf", formula, example; **calculator with steps**, online calculator. "iteration method numerical" gives no calculator phrases |
| Gauss-Seidel | ✅ `/Gauss-seidal` | Gauss–Seidel_method | 53,344 | 4,445 | B | formula, questions, example, "to solve linear equations", matrix form, **"in power system"**; calc ✓, calculator technique, solver; "gauss seidel calculator with steps", 4x4, excel. Google rewrites "gauss seidal" to "gauss seidel" in suggestions |
| SOR | planned (B1) | Successive_over-relaxation | 19,734 | 1,644 | C | "successive over relaxation method solved example (pdf)", formula, "sor"; **no calculator phrases** |
| Newton for nonlinear systems | planned (B2) | (no own article; see Newton's_method) | — | — | — | "newton method for system of nonlinear equations calculator", "…newton raphson method calculator", matlab; NR page autocomplete also shows "calculator 2 variables" |
| Golden-section search | planned (B3) | Golden-section_search | 25,805 | 2,150 | C | solved examples, formula, algorithm, python, matlab; "golden section search method calculator" |
| Gradient descent | planned (B3) | Gradient_descent | 221,645 | 18,470 | A | "gradient descent calculator with steps", "steepest descent calculator", online calculator, "calculation example" |
| Muller | later | Muller's_method | 8,224 | 685 | D | formula, "numerical analysis", solved example (pdf); no calculator phrase |
| Horner | later | Horner's_method | 56,417 | 4,701 | B | not checked in autocomplete (article also covers polynomial evaluation, so views overstate root-finding demand) |
| Bairstow | later | Bairstow's_method | 2,852 | 238 | D | not checked |
| Graeffe | later | Graeffe's_method | 2,116 | 176 | D | not checked |
| Ramanujan's method | later | not looked up | — | — | — | not checked |

#### Unit 2 — Interpolation and finite differences

| Method | Status / live slug | Wikipedia article | Global views | Avg /mo | Tier | Autocomplete variants confirmed |
| :--- | :--- | :--- | ---: | ---: | :---: | :--- |
| Lagrange interpolation | ✅ `/lagrange-interpolation` | Lagrange_polynomial | 94,162 | 7,847 | B | method, "formula solved examples", example, questions, **"formula for unequal intervals"**; **calculator with steps**, online, calculator technique, "lagrange polynomial calculator" |
| Newton forward | ✅ `/newton-forward` | Newton_polynomial (shared) | 28,106 (shared) | 2,342 | C | formula example, "formula in numerical methods", questions, derivation; "newton forward difference calculator" |
| Newton backward | ✅ `/newton-backward` | Newton_polynomial (shared) | (shared) | — | C | formula example, method, questions, derivation, pdf; "newton backward interpolation calculator", "newton backward difference calculator" |
| Gauss forward | ✅ `/gauss-forward` | no article | — | — | D? | formula (pdf, example, derivation, proof); **no calculator phrases** |
| Gauss backward | ✅ `/gauss-backward` | no article | — | — | D? | formula example, pdf, derivation; **no calculator phrases** |
| Newton divided difference | ✅ `/newton-divided` | Divided_differences | 13,394 | 1,116 | C | "interpolation formula", solved example, table; "…interpolation calculator", "…formula calculator", "…polynomial calculator", "…table calculator" |
| Difference table + operators | planned (B1) | Finite_difference | 102,105 | 8,509 | A* | "forward difference table" example, formula, **calculator**, "forward and backward difference table"; "finite difference table calculator". *Article is broad (also PDE use) |
| Stirling interpolation | planned (B1) | Bessel's_interpolation_formula redirect, no Stirling-interpolation article (Stirling's_approximation 188,634 is a different topic) | — | — | D? | formula pdf, method, derivation, examples, "central interpolation formula"; no calculator phrase |
| Bessel interpolation | planned (B1) | no article (title returned 1 view) | — | — | D? | formula pdf, examples, derivation, "stirling and bessel interpolation formula" |
| Cubic spline | planned (B1) | Spline_interpolation | 48,051 | 4,004 | B | formula, example, **solved example**, python, excel, **calculator**, "natural cubic spline", "example with solution pdf" |
| Hermite interpolation | later | Hermite_interpolation | 29,764 | 2,480 | C | not checked |
| Inverse interpolation, Everett | later | not looked up | — | — | — | not checked |
| (Topic hub) Interpolation | — | Interpolation / Polynomial_interpolation | 95,206 / 41,507 | — | — | — |

#### Unit 3 — Numerical integration and differentiation

| Method | Status / live slug | Wikipedia article | Global views | Avg /mo | Tier | Autocomplete variants confirmed |
| :--- | :--- | :--- | ---: | ---: | :---: | :--- |
| Trapezoidal rule | ✅ `/trapezoidal-Rule` | Trapezoidal_rule | 108,619 | 9,052 | A | formula, "formula for area", "in surveying", "for volume", examples; **calculator with steps**, "with data points", integral, desmos |
| Simpson's 1/3 | ✅ `/simpson-1-3-Rule` | Simpson's_rule (shared) | 108,435 | 9,036 | A | "and 3/8 formula", "formula for area/volume", example, derivation, **"in surveying"**; "simpson's 1 3 rule calculator", "…calculator table", online, composite |
| Simpson's 3/8 | ✅ `/simpson-3-8-Rule` | Simpson's_rule (shared) | (shared) | — | B | example, derivation, "solved examples pdf"; "simpson 3 8 rule formula calculator" |
| Boole's rule | ✅ `/boole-Rule` | Boole's_rule | 6,294 | 524 | D | formula, "in numerical analysis", derivation, **"boole's rule calculator"** |
| Weddle's rule | ✅ `/weddle-Rule` | no article found (not looked up) | — | — | D | formula, **"formula for n 6 / n 12"**, solved examples, error formula; no calculator phrase |
| Gauss quadrature | ✅ `/gauss-quadrature` | Gaussian_quadrature / Gauss–Legendre_quadrature | 82,934 / 33,373 | 6,911 / 2,781 | B | "2 point / 3 point formula", table, method; "gauss legendre quadrature calculator", "2 point / 3 point gauss quadrature calculator", integration calculator |
| Numerical differentiation | ✅ `/numerical-differentiation` | Numerical_differentiation | 36,735 | 3,061 | B | formula, "forward difference formula", "solved examples pdf"; solver, online calculator, "forward difference calculator" |
| Romberg integration | planned (B1) | Romberg's_method | 12,327 | 1,027 | C | formula, method, example, pdf, table, "trapezoidal rule"; no calculator phrase |
| Double integration (trap/Simpson) | planned (B2) | not looked up | — | — | — | not checked |
| Monte Carlo integration | planned (B4) | Monte_Carlo_integration | 38,569 | 3,214 | B | pdf, examples, formula, python, importance sampling; no calculator phrase |
| (Topic hub) Numerical integration / Newton–Cotes | — | Numerical_integration / Newton–Cotes_formulas | 59,383 / 23,342 | — | — | — |

#### Unit 4 — ODEs and linear systems (numerical)

| Method | Status / live slug | Wikipedia article | Global views | Avg /mo | Tier | Autocomplete variants confirmed |
| :--- | :--- | :--- | ---: | ---: | :---: | :--- |
| Euler's method | ✅ `/euler-s-method` | Euler_method | 140,217 | 11,685 | A | formula, "to solve differential equation", questions; **"euler's method calculator with steps"**, ti 84, ti nspire, casio, symbolab; "formula calc bc" (US AP Calculus) |
| Modified Euler | ✅ `/modified-euler-s-method` | Heun's_method (shared idea) | 23,655 | 1,971 | C | formula, "solved problems pdf", example; "improved euler's method calculator", "improved euler method formula" |
| Runge-Kutta (RK4) | ✅ `/runge-kutta-method` | Runge–Kutta_methods | 233,850 | 19,488 | A | "4th order", formula, **pronunciation**, "2nd order formula"; "runge kutta calculator (4th / 2nd order)", **calculator with steps**, "rk4 method calculator", solver |
| Taylor series method | ✅ `/taylor-s-series-method` | (Taylor_series 642,848 is mostly calculus, not this ODE method) | — | — | C? | formula, "in numerical methods", solved examples, "for solving differential equations"; no calculator phrase |
| Gauss elimination | ✅ `/gauss-elimination` | Gaussian_elimination | 171,943 | 14,329 | A | example, questions, "solved problems pdf", formula; **calculator with steps**, solver, "gaussian elimination equation calculator" |
| Gauss-Jordan | ✅ `/gauss-jordan` | (inside Gaussian_elimination) | (shared) | — | B? | **"to find inverse of matrix"**, example, questions; **calculator with steps**, "elimination calculator inverse", "…system of equations" |
| Jacobi iteration | ✅ `/jacobi-method` | Jacobi_method | 38,919 | 3,243 | B | example, formula, "is also known as" (Gauss-Jacobi); **calculator step by step**, calculator technique, "jacobi iteration calculator with steps" |
| LU decomposition | ✅ `/lu-decomposition` | LU_decomposition | 94,636 | 7,886 | B | method, "solved examples", **"lu decomposition gate"**, calculator; **calculator with steps**, "calculator ax b", "with pivoting", "lu factorization calculator" |
| RK2 (Heun / midpoint) | planned (B1) | Heun's_method / Midpoint_method | 23,655 / 19,253 | — | C | Heun: formula, **calculator**, example, "and euler's method", "is also known as"; RK page: "2nd order formula", "runge kutta calculator 2nd order" |
| Partial pivoting | planned (B1) | Pivot_element | 13,201 | 1,100 | C | "partial and complete pivoting", "in gauss elimination"; "gaussian elimination partial pivoting calculator", "scaled partial pivoting calculator", "lu decomposition partial pivoting calculator" |
| Milne predictor-corrector | planned (B1) | Predictor–corrector_method | 9,922 | 827 | D | "formula", "method formula", "solved examples pdf", example, derivation; "milne's predictor corrector formula" |
| Adams-Bashforth-Moulton | planned (B1) | Linear_multistep_method | 25,788 | 2,149 | C | formula, "predictor and corrector formula", "adams bashforth 2"; "adams bashforth method calculator", "adams bashforth moulton method calculator" |
| Power method (+ inverse) | planned (B1) | Power_iteration | 29,785 | 2,482 | C | eigenvalue, "in numerical analysis", "to find eigenvalues", example; **calculator with steps**, "inverse power method calculator", "rayleigh power method calculator" |
| Cholesky | planned (B2) | Cholesky_decomposition | 137,447 | 11,454 | A | example (3x3), method, formula; **calculator with steps**, "cholesky factorization calculator" |
| QR (Gram-Schmidt) | planned (B2) | QR_decomposition / Gram–Schmidt_process | 105,054 / 131,636 | 8,754 / 10,970 | A | method, calculator, matlab, formula; "qr decomposition calculator with steps", "…householder", "qr factorization calculator" |
| Jacobi eigenvalue | planned (B2) | Jacobi_eigenvalue_algorithm | 10,218 | 852 | C | method, decomposition, python, solver; no calculator phrase (suggestions drift to "jacobian matrix calculator") |
| BVP: finite difference | planned (B3) | Finite_difference_method | 61,025 | 5,085 | B | not checked |
| Shooting method | planned (B3) | Shooting_method | 12,982 | 1,082 | C | "for boundary value problems", "in numerical analysis pdf", formula, solved examples; "shooting method solver" |
| Heat eq.: Bender-Schmidt, Crank-Nicolson | planned (B3) | Heat_equation / Crank–Nicolson_method | 169,027 / 44,319 | — | B | C-N: formula, scheme, "for heat equation"; Bender-Schmidt: formula, "method solved problems"; no calculator phrases |
| Laplace eq. (Liebmann) | planned (B3) | Laplace's_equation | 107,280 | 8,940 | B* | Liebmann: example, **"liebmann method calculator"**, formula, matlab, "accelerated liebmann". *Article is general Laplace's equation |
| Wave equation (explicit) | planned (B4) | not looked up | — | — | — | not checked |
| Conjugate gradient | planned (B4) | Conjugate_gradient_method | 76,013 | 6,334 | B | optimization, solved example, algorithm; no calculator phrase |
| SVD | planned (B4) | Singular_value_decomposition | 332,650 | 27,721 | A | not checked |
| IEEE-754 / floating point | planned (B4) | IEEE_754 | 288,757 | 24,063 | A | not checked (demand is largely programmers, not maths students) |
| Chebyshev nodes + Runge's phenomenon | planned (B4) | Chebyshev_nodes / Runge's_phenomenon | 21,281 / 40,383 | — | C/B | not checked |

All view counts: [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/), queried 2026-11-03. All autocomplete phrases: [Google suggest endpoint](https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=newton+raphson+method), queried 2026-11-03 (gl=in and gl=us).

### Inferences
- **India-specific intent is visible in autocomplete**, though not as a volume: "calculator technique / trick" (solving the method on a Casio fx-991 for exams) appears for bisection, false position, secant, Gauss-Seidel, Jacobi and Lagrange; "solved examples pdf", "questions" and "formula derivation" are everywhere; "in power system" appears for Newton-Raphson and Gauss-Seidel (power-flow, electrical engineering); "lu decomposition gate" appears for LU. A short "How to do this on a Casio fx-991" section and a printable PDF of the worked example would match these searches.
- **US intent differs**: "matlab", "python", "ti 84", "calc bc" and "explained". A "Code export: Python / MATLAB" mention in the meta description helps capture US/global searches.
- **"Calculator with steps" is confirmed by Google for**: Newton-Raphson, regula falsi, secant, fixed-point, Gauss-Seidel, Lagrange, trapezoidal, Euler, Runge-Kutta, Gauss elimination, Gauss-Jordan, Jacobi, LU, Cholesky, QR, power method, gradient descent, bisection ("step by step"). These are the pages where the "Calculator with Steps" title pattern fits best.
- **For methods with no calculator autocomplete** (Gauss forward/backward, Stirling, Bessel, Weddle, Romberg, Milne, Taylor series method, Crank-Nicolson, Bender-Schmidt, SOR, Monte Carlo), people search for the **formula** and **solved examples** instead. Those pages should lead with "Formula, Solved Example and Calculator" in the title rather than "Calculator with Steps".
- **Rough priority by global demand (estimate)**: of the planned pages, Cholesky, QR/Gram-Schmidt and gradient descent are tier A and also have "calculator with steps" autocomplete, so they beat the Indian-syllabus-only additions (Stirling, Bessel, Milne) on reach. SVD and IEEE-754 are tier A but are mostly searched outside the step-by-step student context.
- Wikipedia views understate India-first, exam-style demand (Indian students search "formula pdf" and YouTube more than they read Wikipedia), so tier D for Weddle/Gauss forward does not mean "no searches".

### Gaps
- **No US, India or global keyword-volume numbers** for any method: Ahrefs/Semrush/Ubersuggest/WordStream need a login or interactive form; seodata.dev rate-limited this session (HTTP 429 / Cloudflare 1015). **Owner action**: run the ~60 primary keywords through Google Keyword Planner (free with a Google Ads account, gives IN and US) or seodata.dev's 20 free lookups/day, and fill a "Volume (US / IN)" column.
- **No keyword difficulty or competition** figures for the same reason.
- Wikipedia figures are English Wikipedia only; they do not split US vs India.
- Ramanujan's method, inverse interpolation, Everett, double integration, wave equation and Weddle had no Wikipedia lookup; Horner, Bairstow, Graeffe, Hermite, finite-difference BVP, SVD, IEEE-754 and Chebyshev had no autocomplete check.

---

## Q2. Keyword difficulty, who ranks top 3, AI Overview / calculator box

### Takeaway
Not observable from this session: Google served a JavaScript interstitial to scripted requests, and the available web-search tool is not Google. The only competitor evidence found is that **planetcalc** and **eMathHelp** have dedicated Newton's-method and RK4 step calculators, and that several "calculator" queries return spam/SEO-farm pages with no working tool (a sign of weak competition for exact-match calculator queries, but not proof of Google rankings).

### Cited Findings
- A scripted `google.com/search` request for "newton raphson method calculator" (gl=in) returned only the "Please click here if you are not redirected" enable-JavaScript page, so no SERP features could be read — first-hand, 2026-11-03.
- "newton raphson method calculator with steps": results included PlanetCalc's Newton's method calculator and a newton-raphson iterations page ([planetcalc 7748](https://planetcalc.com/7748/?thanks=1), [planetcalc 7999](https://planetcalc.com/7999)), EveryCalculators ([everycalculators](https://everycalculators.com/newton-method-optimization-calculator.html)) and a GeeksforGeeks example, plus spam pages on hijacked domains (e.g. [cvs.pantherdb.org](https://cvs.pantherdb.org/?p=1277952)).
- "runge kutta 4th order calculator": eMathHelp's Fourth Order Runge-Kutta Method Calculator "with steps shown" ([eMathHelp](https://emathhelp.net/calculators/differential-equations/fourth-order-runge-kutta-method-calculator)) and PlanetCalc's Runge–Kutta calculators ([planetcalc 8400](https://planetcalc.com/8400/?license=1)).
- "gauss seidel method calculator": every result was a templated spam page ("Gauss Seidel Calculator: Solve Equations Fast") with no working tool ([example](https://heartbeatapi.appbase.io/?p=34648)).
- "simpson's 1/3 rule calculator": mostly the same spam template, plus small tools at TotalCalcHub, Ultimate Finance Calculator, codingace and MathWorks File Exchange code ([TotalCalcHub](https://www.totalcalchub.com/us/academic/simpsons-rule-calculator), [codingace](https://codingace.net/general/simpsons_1_3_rule.html), [MathWorks](https://www.mathworks.com/matlabcentral/fileexchange/33493-simpson-s-1-3-and-3-8-rules)).
- "newton forward interpolation calculator": codingace has a dedicated tool with steps and graph export ([codingace](https://codingace.net/maths/newton_forward_interpolation.html)); IIT Bombay virtual lab procedure page ([vlabs](https://nm-interpolation-iitb.vlabs.ac.in/exp/newton-interpolation-forward/procedure.html)).
- "weddle's rule calculator": no dedicated online calculator found; results were John D. Cook's blog post, MathWorks composite-Weddle code and a GeeksforGeeks "Weedle's Rule" article ([John D. Cook](https://www.johndcook.com/blog/2025/11/20/weddle-integration-rule/), [MathWorks](https://mathworks.com/matlabcentral/fileexchange/72527-weddle-s-rule-composite)).

### Inferences
- Weddle, Boole, Gauss forward/backward, Stirling and Bessel look like **open niches** for a working step-by-step calculator (none found), so NETZ could rank with modest authority even though demand is small.
- Newton-Raphson, RK4, Euler and Gaussian elimination have established calculator competitors (planetcalc, eMathHelp; and, from general knowledge not verified here, Symbolab, atozmath and Wolfram|Alpha), so those pages need the strongest differentiation: exam-style table, graph, code export.

### Gaps
- Real Google top-3 per keyword, People-also-ask boxes, AI Overview presence and calculator/answer boxes were **not observed**. **Owner action**: check in an incognito browser with location India and US, or use Search Console once pages are indexed.
- atozmath's ranking was not confirmed in any result.

---

## Q3. People-also-ask and autocomplete questions (FAQ inputs)

### Takeaway
PAA boxes could not be read (see Q2). Autocomplete gives the question-style seeds; the most repeated are "formula", "example / solved example", "derivation", "is also known as", "is used for", "vs" comparisons, and "how to do it on a calculator". The FAQ lists in Q4 are built from these seeds plus standard textbook questions, and are labelled as drafted, not observed PAA.

### Cited Findings
- Question-shaped autocomplete phrases seen (gl=in, 2026-11-03, [Google suggest](https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=regula+falsi+method)): "regula falsi method is also known as", "false position method is also known as", "secant method is also known as", "jacobi method is also known as", "heun's method is also known as", "newton raphson method is used for", "what is fixed point iteration method", "what is modified euler method", "what is partial pivoting", "partial pivoting vs full pivoting", "heun's method and euler's method", "what is rk4 method", "what is the shooting method", "what is conjugate gradient", "runge kutta method pronunciation", "weddle's rule formula for n 6 / n 12", "lagrange interpolation formula for unequal intervals", "gauss jordan method to find inverse of matrix".

### Inferences
- "Is also known as" → answer with the alternative names in the first paragraph (regula falsi = false position; secant ≈ chord method; Jacobi = Gauss-Jacobi / simultaneous displacement; Heun = improved/modified Euler; Gauss-Seidel = successive displacement / Liebmann method).
- "Calculator technique / trick" → an FAQ "Can I do this on a Casio fx-991?" is likely to match Indian exam searches.

### Gaps
- No observed PAA questions; FAQ lists below are drafts to be checked against real PAA boxes later.

---

## Q4. SEO spec per method

### Takeaway
Use one pattern: **Title** = "<Method> Calculator with Steps | NETZ" where Google confirms "calculator with steps", otherwise "<Method>: Formula, Example & Calculator | NETZ". Fix 11 live slugs that have capitals, misspellings or "-s-" possessives, with permanent 301 redirects from the old paths. All titles below are ≤60 characters and descriptions ≤155 characters (checked with a script).

### Cited Findings
- The catalog records every live page titled "NETZ" with description "current objective: survive" (checked on the live site 2026-11-03) — [NETZ_METHODS_CATALOG.md](../../NETZ_METHODS_CATALOG.md) lines 41–42.
- Live slugs read from `src/app/(pages.algorithems)/`: `Gauss-seidal`, `bisection-method`, `false-position-method`, `iteration-method`, `newton-raphson-method`, `secant-method`, `gauss-backward`, `gauss-forward`, `newton-backward`, `newton-forward`, `lagrange-interpolation`, `newton-divided`, `boole-Rule`, `simpson-1-3-Rule`, `simpson-3-8-Rule`, `trapezoidal-Rule`, `weddle-Rule`, `gauss-quadrature`, `numerical-differentiation`, `euler-s-method`, `gauss-elimination`, `gauss-jordan`, `jacobi-method`, `lu-decomposition`, `modified-euler-s-method`, `runge-kutta-method`, `taylor-s-series-method` — first-hand directory listing, 2026-11-03.

#### Slug fixes (live pages)

| Current slug | Problem | Recommended slug | Action |
| :--- | :--- | :--- | :--- |
| `/Gauss-seidal` | capital G + misspelling ("seidal") | `/gauss-seidel-method` | 301 |
| `/trapezoidal-Rule` | capital R | `/trapezoidal-rule` | 301 |
| `/simpson-1-3-Rule` | capital R; missing "s" | `/simpsons-1-3-rule` | 301 |
| `/simpson-3-8-Rule` | capital R; missing "s" | `/simpsons-3-8-rule` | 301 |
| `/boole-Rule` | capital R | `/booles-rule` | 301 |
| `/weddle-Rule` | capital R | `/weddles-rule` | 301 |
| `/euler-s-method` | odd "-s-" possessive | `/eulers-method` | 301 |
| `/modified-euler-s-method` | "-s-" | `/modified-eulers-method` | 301 |
| `/taylor-s-series-method` | "-s-" | `/taylor-series-method` | 301 |
| `/iteration-method` | vague; searches say "fixed point iteration" | `/fixed-point-iteration-method` | 301 |
| `/newton-divided` | truncated | `/newton-divided-difference` | 301 |
| `/newton-forward`, `/newton-backward`, `/gauss-forward`, `/gauss-backward` | missing "interpolation" | `/newton-forward-interpolation` etc. | 301 (optional, lower priority) |
| `/bisection-method`, `/false-position-method`, `/newton-raphson-method`, `/secant-method`, `/lagrange-interpolation`, `/gauss-quadrature`, `/numerical-differentiation`, `/gauss-elimination`, `/gauss-jordan`, `/jacobi-method`, `/lu-decomposition`, `/runge-kutta-method` | fine | keep | — |

Every redirect must be permanent (301/308), the old URL removed from the sitemap, internal links updated, and the canonical tag set to the new slug.

#### Unit 1 specs

| Method | Primary keyword | Secondary keywords | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Newton-Raphson | newton raphson method calculator | newton raphson method formula; newton's method; newton raphson example; nr method | /newton-raphson-method | Newton-Raphson Method Calculator with Steps \| NETZ | Solve f(x)=0 with Newton-Raphson. Enter f(x) and x₀ to get every iteration in an exam-style table, a graph and Python code. | Newton-Raphson Method Calculator | What is the Newton-Raphson formula? · When does Newton-Raphson fail? · Newton-Raphson vs bisection: which is faster? · How do I pick the starting value x₀? · Is Newton's method the same as Newton-Raphson? |
| Bisection | bisection method calculator | bisection method formula; bisection method example; interval halving; bolzano method | /bisection-method | Bisection Method Calculator with Steps \| NETZ | Find a root by the bisection method. Enter f(x), a and b to see each halving step in a table, the error bound and a graph. | Bisection Method Calculator | What is the bisection method formula? · How many iterations does bisection need? · Why does bisection always converge? · Bisection vs false position? · Can I do bisection on a Casio fx-991? |
| False position | regula falsi method calculator | false position method; regula falsi formula; method of false position | /false-position-method | Regula Falsi (False Position) Calculator with Steps \| NETZ | Solve f(x)=0 by regula falsi (false position). Get every iteration in an exam-style table with the formula and a graph. | Regula Falsi (False Position) Method Calculator | What is the regula falsi formula? · Is false position the same as regula falsi? · Regula falsi vs bisection? · Regula falsi vs secant? · When is regula falsi slow? |
| Secant | secant method calculator | secant method formula; secant method example; chord method | /secant-method | Secant Method Calculator with Steps \| NETZ | Find roots with the secant method. Enter f(x), x₀ and x₁ to get each iteration in a table, with the formula and a graph. | Secant Method Calculator | What is the secant method formula? · Secant vs Newton-Raphson? · Secant vs regula falsi? · What is the order of convergence of the secant method? · What is the secant method also known as? |
| Fixed-point iteration | fixed point iteration calculator | iteration method; fixed point iteration formula; x = g(x); simple iteration method | /fixed-point-iteration-method (301 from /iteration-method) | Fixed Point Iteration Calculator with Steps \| NETZ | Solve x = g(x) by fixed point iteration. Check the convergence condition and see every iteration in an exam-style table. | Fixed Point Iteration Method Calculator | What is the fixed point iteration method? · When does fixed point iteration converge? · How do I choose g(x)? · Is it the same as the iteration method? |
| Gauss-Seidel | gauss seidel method calculator | gauss seidel method formula; gauss seidel example; gauss seidel iteration; diagonally dominant | /gauss-seidel-method (301 from /Gauss-seidal) | Gauss-Seidel Method Calculator with Steps \| NETZ | Solve linear equations by Gauss-Seidel iteration. See each iteration in a table, the diagonal-dominance check and the code. | Gauss-Seidel Method Calculator | What is the Gauss-Seidel formula? · Gauss-Seidel vs Jacobi: which is faster? · When does Gauss-Seidel converge? · Why must the matrix be diagonally dominant? · How is Gauss-Seidel used in power systems? |
| SOR (planned) | successive over relaxation method | sor method; over relaxation formula; relaxation factor ω | /sor-method | SOR Method (Successive Over-Relaxation) with Steps \| NETZ | Solve Ax=b by successive over-relaxation. Pick ω, see each iteration in a table and compare it with Gauss-Seidel. | Successive Over-Relaxation (SOR) Method | What is the SOR formula? · How do I choose ω? · SOR vs Gauss-Seidel? · What happens if ω>2? |
| Newton for systems (planned) | newton raphson method for system of nonlinear equations | newton method 2 variables; jacobian newton method; nonlinear system solver | /newton-raphson-system | Newton-Raphson for Nonlinear Systems with Steps \| NETZ | Solve two nonlinear equations by Newton-Raphson. See the Jacobian, each update and the iteration table step by step. | Newton-Raphson Method for Nonlinear Systems | How does Newton's method work for two equations? · What is the Jacobian here? · Does it always converge? · How is it used in power-flow analysis? |
| Golden-section (planned) | golden section search method | golden section search example; golden ratio search; 1-D optimisation | /golden-section-search | Golden Section Search Calculator with Steps \| NETZ | Find the minimum of f(x) by golden section search. See each bracket, the 0.618 ratio and the iteration table. | Golden Section Search Method | What is the golden section search? · Why 0.618? · Golden section vs bisection? · Does it find a maximum too? |
| Gradient descent (planned) | gradient descent calculator | gradient descent formula; steepest descent; learning rate | /gradient-descent | Gradient Descent Calculator with Steps \| NETZ | Minimise f(x, y) by gradient descent. Set the learning rate and see each step, the gradient and the path on a graph. | Gradient Descent Calculator | What is the gradient descent formula? · How do I choose the learning rate? · Gradient descent vs steepest descent? · Why does it diverge? · How is it used in machine learning? |
| Muller / Graeffe / Horner / Bairstow / Ramanujan (later) | muller method / horner method / bairstow method | "<name> method formula", "solved example" | /muller-method, /horner-method, /bairstow-method, /graeffe-method | <Name> Method: Formula, Example & Calculator \| NETZ | Learn the <name> method with its formula and a solved example, then run it on your own equation step by step. | <Name> Method | What is the <name> method? · Formula? · When is it used? |

#### Unit 2 specs

| Method | Primary keyword | Secondary keywords | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Lagrange | lagrange interpolation calculator | lagrange interpolation formula; unequal intervals; lagrange polynomial | /lagrange-interpolation | Lagrange Interpolation Calculator with Steps \| NETZ | Find f(x) by Lagrange interpolation for unequal intervals. See each term, the polynomial and a graph, step by step. | Lagrange Interpolation Calculator | What is the Lagrange interpolation formula? · Why use it for unequal intervals? · Lagrange vs Newton divided difference? · What degree is the polynomial? |
| Newton forward | newton forward interpolation | newton forward difference formula; forward difference table; equal intervals | /newton-forward-interpolation | Newton Forward Interpolation Calculator with Steps \| NETZ | Build the forward difference table and interpolate with Newton's forward formula. Every step shown, exam-style. | Newton Forward Interpolation Formula and Calculator | What is Newton's forward interpolation formula? · When do I use forward vs backward? · How do I find p = (x−x₀)/h? · How do I build the difference table? |
| Newton backward | newton backward interpolation | newton backward difference formula; backward difference table | /newton-backward-interpolation | Newton Backward Interpolation Calculator with Steps \| NETZ | Interpolate near the end of a table with Newton's backward formula. Get the difference table and each step. | Newton Backward Interpolation Formula and Calculator | What is Newton's backward formula? · Forward vs backward interpolation? · How is p defined here? · Can I extrapolate with it? |
| Gauss forward | gauss forward interpolation formula | gauss forward example; central difference interpolation | /gauss-forward-interpolation | Gauss Forward Interpolation: Formula & Example \| NETZ | Gauss forward interpolation formula with a solved example. Enter your table to get the central differences and answer. | Gauss Forward Interpolation Formula | What is the Gauss forward formula? · When is it used instead of Newton's? · Gauss forward vs backward? · What range of p suits it? |
| Gauss backward | gauss backward interpolation formula | gauss backward example; central differences | /gauss-backward-interpolation | Gauss Backward Interpolation: Formula & Example \| NETZ | Gauss backward interpolation formula with a solved example. Enter a table to see the central differences step by step. | Gauss Backward Interpolation Formula | What is the Gauss backward formula? · Gauss forward vs backward? · When is p negative? |
| Newton divided difference | newton divided difference interpolation calculator | divided difference table; newton's divided difference formula | /newton-divided-difference | Newton Divided Difference Calculator with Steps \| NETZ | Build the divided difference table and Newton's interpolating polynomial for unequal x-values, step by step. | Newton Divided Difference Interpolation Calculator | What is a divided difference? · Divided difference vs Lagrange? · How do I build the table? · Does point order matter? |
| Difference table (planned) | forward difference table calculator | finite difference table; difference operators Δ ∇ δ E | /difference-table | Finite Difference Table Calculator (Δ, ∇, δ) \| NETZ | Make forward, backward and central difference tables from your data, with the Δ, ∇, δ and E operators explained. | Finite Difference Table Calculator | What is a forward difference table? · Δ vs ∇ vs δ? · What is the shift operator E? · How do I spot an error in a table? |
| Stirling (planned) | stirling interpolation formula | stirling central difference; stirling example | /stirling-interpolation | Stirling Interpolation Formula with Solved Example \| NETZ | Stirling's central difference interpolation formula with a solved example. Enter your table to get each term. | Stirling Interpolation Formula | What is Stirling's interpolation formula? · When is it best (−¼<p<¼)? · Stirling vs Bessel? |
| Bessel (planned) | bessel interpolation formula | bessel's formula example; stirling and bessel | /bessel-interpolation | Bessel Interpolation Formula with Solved Example \| NETZ | Bessel's interpolation formula with a solved example. Enter equally spaced data to get the central differences and value. | Bessel Interpolation Formula | What is Bessel's formula? · When is it best (p near ½)? · Bessel vs Stirling? |
| Cubic spline (planned) | cubic spline interpolation calculator | natural cubic spline; clamped spline; spline interpolation example | /cubic-spline-interpolation | Cubic Spline Interpolation Calculator with Steps \| NETZ | Fit a natural or clamped cubic spline. See the tridiagonal system, each M value and every spline piece on a graph. | Cubic Spline Interpolation Calculator | What is a natural cubic spline? · Natural vs clamped? · Why splines instead of one polynomial? · How many equations are there? |
| Hermite / inverse / Everett (later) | hermite interpolation | — | /hermite-interpolation etc. | Hermite Interpolation: Formula & Example \| NETZ | (same pattern as Bessel row) | Hermite Interpolation | — |

#### Unit 3 specs

| Method | Primary keyword | Secondary keywords | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Trapezoidal | trapezoidal rule calculator | trapezoidal rule formula; trapezium rule; trapezoid rule; data points | /trapezoidal-rule (301) | Trapezoidal Rule Calculator with Steps \| NETZ | Estimate an integral by the trapezoidal rule from f(x) or a data table. See h, every ordinate and the sum, exam-style. | Trapezoidal Rule Calculator | What is the trapezoidal rule formula? · Trapezoidal vs Simpson's rule? · What is the error of the trapezoidal rule? · Can I use data points instead of f(x)? |
| Simpson 1/3 | simpson's 1/3 rule calculator | simpson's rule formula; composite simpson; simpson 1/3 example | /simpsons-1-3-rule (301) | Simpson's 1/3 Rule Calculator with Steps \| NETZ | Integrate with Simpson's 1/3 rule from f(x) or a table. See h, the odd/even ordinates and the answer step by step. | Simpson's 1/3 Rule Calculator | What is the Simpson's 1/3 rule formula? · Why must n be even? · Simpson 1/3 vs 3/8? · What is the error term? · How is it used in surveying? |
| Simpson 3/8 | simpson's 3/8 rule calculator | simpson 3/8 formula; simpson 3/8 example | /simpsons-3-8-rule (301) | Simpson's 3/8 Rule Calculator with Steps \| NETZ | Integrate with Simpson's 3/8 rule. Enter f(x) or data with n a multiple of 3 and see every ordinate and the sum. | Simpson's 3/8 Rule Calculator | What is the Simpson's 3/8 formula? · Why must n be a multiple of 3? · 3/8 vs 1/3: which is more accurate? |
| Boole | boole's rule | boole's rule formula; boole's rule calculator | /booles-rule (301) | Boole's Rule Calculator: Formula & Steps \| NETZ | Integrate with Boole's rule (n a multiple of 4). See the 7-32-12-32-7 weights, every ordinate and the result. | Boole's Rule Calculator | What is Boole's rule formula? · Why must n be a multiple of 4? · Boole's rule vs Simpson's? · Is it the same as Bode's rule? |
| Weddle | weddle's rule formula | weddle's rule n=6; weddle's rule example | /weddles-rule (301) | Weddle's Rule: Formula, Example & Calculator \| NETZ | Weddle's rule formula for n = 6 and n = 12 with a solved example. Enter your function to get every ordinate and the sum. | Weddle's Rule Calculator | What is Weddle's rule formula? · Why must n be a multiple of 6? · Weddle vs Simpson's rule? · How accurate is Weddle's rule? |
| Gauss quadrature | gauss quadrature calculator | gauss legendre quadrature; 2 point gauss quadrature; 3 point gauss quadrature formula | /gauss-quadrature | Gauss Quadrature Calculator (2- and 3-Point) \| NETZ | Integrate with 2- or 3-point Gauss-Legendre quadrature. See the change of limits, nodes, weights and each term. | Gauss Quadrature Calculator | What is the 2-point Gauss quadrature formula? · What are the 3-point nodes and weights? · How do I change limits to [−1, 1]? · Gauss quadrature vs Simpson? |
| Numerical differentiation | numerical differentiation calculator | forward difference derivative; numerical differentiation formula | /numerical-differentiation | Numerical Differentiation Calculator with Steps \| NETZ | Find dy/dx and d²y/dx² from a data table using Newton's forward or backward difference formulas, step by step. | Numerical Differentiation Calculator | What is numerical differentiation? · Which formula: forward or backward? · How do I find the second derivative? · What is the error? |
| Romberg (planned) | romberg integration | romberg integration formula; romberg table | /romberg-integration | Romberg Integration: Formula, Table & Steps \| NETZ | Build the Romberg table from trapezoidal estimates and Richardson extrapolation. Every row shown step by step. | Romberg Integration Calculator | What is Romberg integration? · How is the Romberg table built? · Romberg vs Simpson? |
| Double integration (planned) | double integration trapezoidal rule | double integral simpson's rule; numerical double integral | /numerical-double-integration | Double Integral by Trapezoidal & Simpson's Rule \| NETZ | Evaluate a double integral numerically with the trapezoidal or Simpson's rule. See the grid and the weights. | Numerical Double Integration | How does the trapezoidal rule work for double integrals? · What weights does Simpson's rule use on a grid? |
| Monte Carlo (planned) | monte carlo integration | monte carlo integration example; monte carlo formula | /monte-carlo-integration | Monte Carlo Integration: Formula & Example \| NETZ | Estimate an integral with random samples. See the formula, the running estimate and how error shrinks with N. | Monte Carlo Integration | What is Monte Carlo integration? · How accurate is it? · Why use it for high dimensions? |

#### Unit 4 specs

| Method | Primary keyword | Secondary keywords | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Euler | euler's method calculator | euler method formula; euler's method table; differential equation | /eulers-method (301) | Euler's Method Calculator with Steps \| NETZ | Solve dy/dx = f(x, y) by Euler's method. Enter y₀, h and the end point to get each step in a table and a graph. | Euler's Method Calculator | What is the Euler's method formula? · How accurate is Euler's method? · Euler vs modified Euler? · How do I choose h? |
| Modified Euler | modified euler method | improved euler method calculator; heun's method | /modified-eulers-method (301) | Modified Euler Method Calculator with Steps \| NETZ | Solve an ODE by the modified (improved) Euler method. See the predictor, corrector and every step in a table. | Modified Euler Method Calculator | What is the modified Euler formula? · Is it the same as Heun's method? · Modified Euler vs Euler accuracy? |
| Runge-Kutta | runge kutta method calculator | rk4 calculator; runge kutta 4th order formula; runge kutta 2nd order | /runge-kutta-method | Runge-Kutta (RK4) Calculator with Steps \| NETZ | Solve dy/dx = f(x, y) by 4th-order Runge-Kutta. See k₁ to k₄ for every step in an exam-style table, with a graph. | Runge-Kutta Method Calculator (RK4) | What is the RK4 formula? · RK4 vs Euler? · What are k₁, k₂, k₃, k₄? · How do you pronounce Runge-Kutta? · What is RK2? |
| Taylor series method | taylor series method | taylor series method for ode; taylor method formula | /taylor-series-method (301) | Taylor Series Method for ODEs: Formula & Steps \| NETZ | Solve an initial value problem with the Taylor series method. See y′, y″, y‴ at x₀ and the series, step by step. | Taylor Series Method for Differential Equations | What is the Taylor series method? · How many terms do I need? · Taylor method vs Runge-Kutta? |
| Gauss elimination | gauss elimination method calculator | gaussian elimination calculator; gauss elimination example; back substitution | /gauss-elimination | Gauss Elimination Calculator with Steps \| NETZ | Solve linear equations by Gauss elimination. See every row operation, the upper triangular matrix and back substitution. | Gauss Elimination Method Calculator | What is the Gauss elimination method? · Gauss elimination vs Gauss-Jordan? · What is partial pivoting? · What if a pivot is zero? |
| Gauss-Jordan | gauss jordan method calculator | gauss jordan elimination; inverse of matrix by gauss jordan; rref | /gauss-jordan | Gauss-Jordan Calculator with Steps (Inverse Too) \| NETZ | Solve equations or find a matrix inverse by Gauss-Jordan. See every row operation down to reduced row echelon form. | Gauss-Jordan Method Calculator | How do I find an inverse by Gauss-Jordan? · Gauss-Jordan vs Gauss elimination? · What is reduced row echelon form? |
| Jacobi | jacobi method calculator | jacobi iteration; gauss jacobi method; jacobi method formula | /jacobi-method | Jacobi Method Calculator with Steps \| NETZ | Solve linear equations by Jacobi (Gauss-Jacobi) iteration. See each iteration in a table and the convergence check. | Jacobi Iteration Method Calculator | What is the Jacobi method formula? · Jacobi vs Gauss-Seidel? · When does Jacobi converge? · Is it the same as Gauss-Jacobi? |
| LU | lu decomposition calculator | lu factorization; doolittle; crout; lu decomposition ax=b | /lu-decomposition | LU Decomposition Calculator with Steps \| NETZ | Factor A = LU by Doolittle or Crout and solve Ax = b. See L, U and forward and back substitution step by step. | LU Decomposition Calculator | What is LU decomposition? · Doolittle vs Crout? · How do I solve Ax=b with LU? · When does LU need pivoting? |
| RK2 / Heun (planned) | runge kutta 2nd order | heun's method calculator; midpoint method; rk2 formula | /runge-kutta-2nd-order | Runge-Kutta 2nd Order (Heun) Calculator \| NETZ | Solve an ODE by 2nd-order Runge-Kutta (Heun or midpoint). See k₁ and k₂ for every step in a table. | Runge-Kutta 2nd Order Method (RK2) | What is the RK2 formula? · Heun vs midpoint method? · RK2 vs RK4? |
| Partial pivoting (planned) | gaussian elimination with partial pivoting | partial pivoting calculator; partial vs complete pivoting | /gauss-elimination-partial-pivoting (or a switch on /gauss-elimination) | Gauss Elimination with Partial Pivoting \| NETZ | See Gauss elimination with partial pivoting: each row swap, multiplier and the final solution, step by step. | Gaussian Elimination with Partial Pivoting | What is partial pivoting? · Partial vs complete pivoting? · Why does pivoting reduce error? |
| Milne (planned) | milne's predictor corrector method | milne predictor formula; milne corrector formula | /milne-predictor-corrector | Milne's Predictor-Corrector Method with Steps \| NETZ | Solve an ODE by Milne's predictor-corrector. Get starting values by RK4, then each predictor and corrector step. | Milne's Predictor-Corrector Method | What are Milne's predictor and corrector formulas? · How are starting values found? · Milne vs Adams? |
| Adams-Bashforth-Moulton (planned) | adams bashforth method | adams moulton; adams bashforth moulton calculator | /adams-bashforth-moulton | Adams-Bashforth-Moulton Method Calculator \| NETZ | Solve an ODE with the Adams-Bashforth predictor and Adams-Moulton corrector. Every step in a table. | Adams-Bashforth-Moulton Method | What is the Adams-Bashforth formula? · Bashforth vs Moulton? · Why is it multistep? |
| Power method (planned) | power method calculator | power method eigenvalue; dominant eigenvalue; inverse power method | /power-method | Power Method Calculator for Eigenvalues \| NETZ | Find the dominant eigenvalue and eigenvector by the power method. See each iteration and the scaling step by step. | Power Method Calculator (Eigenvalues) | What does the power method find? · What is the inverse power method? · When does it converge slowly? |
| Cholesky (planned) | cholesky decomposition calculator | cholesky factorization; cholesky example 3x3 | /cholesky-decomposition | Cholesky Decomposition Calculator with Steps \| NETZ | Factor a symmetric positive definite matrix as A = LLᵀ. See every entry of L and the solution of Ax = b. | Cholesky Decomposition Calculator | What is Cholesky decomposition? · When can it be used? · Cholesky vs LU? |
| QR (planned) | qr decomposition calculator | qr factorization; gram schmidt; householder | /qr-decomposition | QR Decomposition Calculator with Steps \| NETZ | Find A = QR by Gram-Schmidt. See each orthogonal vector, Q and R, step by step, and check QR = A. | QR Decomposition Calculator (Gram-Schmidt) | What is QR decomposition? · Gram-Schmidt vs Householder? · What is QR used for? |
| Jacobi eigenvalue (planned) | jacobi eigenvalue method | jacobi rotation method; symmetric eigenvalues | /jacobi-eigenvalue-method | Jacobi Eigenvalue Method with Steps \| NETZ | Find all eigenvalues of a symmetric matrix by Jacobi rotations. See each rotation angle and matrix. | Jacobi Method for Eigenvalues | How does the Jacobi eigenvalue method work? · How is the rotation angle found? |
| FD BVP (planned) | finite difference method boundary value problem | finite difference method example | /finite-difference-bvp | Finite Difference Method for BVPs with Steps \| NETZ | Solve a boundary value problem by finite differences. See the grid, the tridiagonal system and the solution. | Finite Difference Method for Boundary Value Problems | How does the finite difference method solve a BVP? · What is the Thomas algorithm? |
| Shooting (planned) | shooting method | shooting method for boundary value problems | /shooting-method | Shooting Method for BVPs: Steps & Example \| NETZ | Solve a boundary value problem by the shooting method: guess the slope, run RK4 and correct with the secant method. | Shooting Method | What is the shooting method? · How are the guesses corrected? · Shooting vs finite difference? |
| Heat eq. (planned) | crank nicolson method | bender schmidt method; heat equation numerical | /heat-equation-crank-nicolson (+ /bender-schmidt-method) | Crank-Nicolson & Bender-Schmidt (Heat Equation) \| NETZ | Solve the heat equation by Bender-Schmidt or Crank-Nicolson. See the grid, the formula and every time level. | Heat Equation: Bender-Schmidt and Crank-Nicolson | What is the Crank-Nicolson formula? · What is Bender-Schmidt? · When is the explicit method stable? |
| Laplace eq. (planned) | liebmann method | laplace equation numerical; liebmann iteration | /laplace-equation-liebmann | Liebmann's Method for Laplace's Equation \| NETZ | Solve Laplace's equation on a grid by Liebmann's (Gauss-Seidel) iteration. See every mesh value step by step. | Laplace Equation by Liebmann's Method | What is Liebmann's method? · Standard vs diagonal five-point formula? |
| Wave eq., CG, SVD, IEEE-754, Chebyshev (B4) | wave equation numerical / conjugate gradient method / svd calculator / ieee 754 converter / runge's phenomenon | — | /wave-equation-numerical, /conjugate-gradient-method, /svd-calculator, /ieee-754-converter, /runges-phenomenon | "<Name> with Steps \| NETZ" pattern | (same pattern) | — | — |

### Inferences
- **Titles**: keep "| NETZ" at the end; the method name first. Where Google offers both names (regula falsi / false position; Jacobi / Gauss-Jacobi; modified / improved Euler), put the less common one in the H1 subtitle or first sentence, not in the slug.
- **India**: add "Casio fx-991 tip" and "PDF of this example" to Unit 1 and Unit 2 pages; these match the "calculator technique" and "solved examples pdf" autocomplete phrases.
- **Consolidation**: Simpson's 1/3 and 3/8 share one Wikipedia article and their autocomplete overlaps ("simpson 1/3 rule and 3/8 formula"); keep two pages but cross-link them and add a comparison FAQ to both. The same applies to Newton forward/backward and Gauss forward/backward.

### Gaps
- Title and description lengths were checked by script, but titles have not been checked for truncation in a real Google SERP.
- FAQ questions are drafts from autocomplete and textbooks, not observed PAA boxes.
