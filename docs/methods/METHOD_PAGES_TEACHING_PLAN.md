# Method pages: teaching plan

Written 2026-11-20 at the owner's request. **Status: plan written, shared parts and sample pages built; waiting for the owner to approve the samples before the rollout (Phase 2 onwards).**

> The owner's words: "even if a kid is at zero in math … he goes to that page and learns it completely, or practises everything, and even how to write it in the exam hall by himself. He doesn't have to Google anything." And for the calculator: each step told — the formula, what it becomes with the numbers in, each iteration worked, the table, the graph — as on the original pages (Newton forward), for every method.

## 1. Where the pages stand (audit 2026-11-20)

Measured by `npm run audit:teaching` → `docs/methods/METHOD_PAGES_TEACHING_AUDIT.md` (every page, lowest score first).

| | Pages | Words of explanation (avg) | Worked-example steps (avg) | Practice | Exam layout |
|---|---|---|---|---|---|
| Original 34 | 34 | about 146 | 2.7 | none | none |
| Newer pages | 210 | about 144 | 2.4 | none | none |

Calculator working, newer pages whose engine runs in the audit (150): 51 show a table, 36 a graph, **none says in words what each step does**, and they average fewer than 4 steps. The original 34 calculators already show the table, the formula, the substitution and the graph; their theory is as thin as the newer pages'.

So both halves need work on **every** page, the original 34 included.

## 2. The standard: what every method page must have

### Learn (the theory, top of the page)

1. **In one line**, then **what problem it solves**: when you meet it (exam, real life), and what you get out of it.
2. **Before you start**: the few things you must know (e.g. "what is f(x)", "what is a derivative"), each with a two-line refresher and a link to its own page. Nothing assumed.
3. **The idea**: why the method works, in plain words, with a picture or graph.
4. **The formula**, then **every symbol explained** in a table: symbol, what it means, example value.
5. **The method, step by step**: numbered steps in plain words, including when to stop and how to check.
6. **Worked example 1**, exam style, every step shown: what we do and why → the formula → the numbers put in → the arithmetic → the table → the graph → the answer, boxed, with a check.
7. **Worked example 2**: a different kind of question (a harder or trickier case) worked the same way.
8. **How to write it in the exam**: the layout the examiner expects (Given · To find · Formula · Table/working · Answer), what earns the marks, how much to write, time-savers.
9. **Common mistakes**, each with how to avoid it, and **when the method fails** or which method to use instead.
10. **Practice**: 5–8 questions from easy to exam level; each with a hint, the final answer, and **Solve it in the calculator** (loads the question into the calculator so the full working is shown).
11. FAQ and related methods (already on every page).

### Calculator (the working)

- Every step has a **title**, **one plain sentence saying what is done and why**, the **formula in general**, the **formula with the numbers put in**, and the **result**.
- A **table** wherever the method has rounds, rows or a textbook table (iterations, differences, ANOVA, amortisation …).
- A **graph** wherever there is a function, a curve, data or a region.
- The **final answer boxed**, with a check line where one exists (e.g. substitute the root back).
- Guide and Demo (built 2026-11-15) stay as they are.

## 3. How it is built

- **Lessons as data.** Each page's Learn content lives in `src/app/data/lessons/<method id>.js` and is shown by one shared component, `components/method/Lesson.js`, so every page looks and reads the same and the audit can measure it. Text uses `$…$` for inline maths and `$$…$$` for display maths. The lesson is rendered on the server, so search engines and AI assistants read all of it.
- **Lesson parts** (`Lesson.js`): `OneLine`, `Prerequisites`, `Idea`, `SymbolTable`, `Procedure`, `Example` (steps with text, maths, table and graph), `ExamLayout`, `Mistakes`, `Practice`.
- **Practice → calculator.** A practice question carries the calculator inputs; *Solve it in the calculator* scrolls to the calculator, types them in (the Demo's typing) and solves.
- **Working.** Engine steps gain a `text` field (one plain sentence); `StepList` shows it between the title and the maths. Steps that substitute show the general formula and the substituted line. Tables come back from the engine as `table: { columns, rows }`; graphs are drawn by the page's calculator from the answer.

## 4. Phases

Each phase ends with its checks (section 5). The owner approves the samples before Phase 2.

| Phase | Pages | What |
|---|---|---|
| **1. Standard and samples** | 2 | Shared parts (`Lesson.js`, lesson data, `text` in `StepList`, practice → calculator), this plan, the audit, and two sample pages built fully to the standard: **Newton's forward interpolation** (an original page) and **Integral calculator** (a newer, symbolic page). |
| **2. Units 1–5, the core** | 34 original + 45 newer | Roots, interpolation, integration, ODEs and matrices, statistics: the syllabus most students come for, and the ⭐ pages. Theory to the standard for all; working: explained steps, tables and graphs in the newer engines. |
| **3. Unit 6, calculus** | 47 | Limits, derivatives, integrals and their applications, multivariable calculus, series, vector calculus. |
| **4. Units 7–9** | 39 | Algebra, matrices and vectors, geometry and trigonometry. |
| **5. Units 10–11** | 24 | Finance and taxes (tax pages stay hidden until section K of the owner's to-do list). |
| **6. Units 12–15** | 46 | Differential equations, transforms, complex variables, discrete maths and operations research. |

Pace: a page to the full standard is roughly 1,500–2,500 words of teaching, two worked examples, a practice set and its engine's steps reworded. Phases are worked one unit at a time; within a phase, ⭐ pages first.

## 5. Checks (each phase, once, at the end)

- `npm run audit:teaching`: every page in the phase scores **Theory 6/6** and, where its engine runs here, **Working 4/4** (steps explained in words, a table and a graph where the method has them).
- New unit test `test_lessons.mjs`: every lesson has all parts, every practice question's inputs are valid boxes of its calculator and its stated answer matches the engine's answer.
- `npm run test:engines`, `npm run check:methods`, `npm run test:unit`, strict KaTeX on every lesson's maths, `guide-sweep.mjs` and `alg-phone.mjs` (no sideways scrolling on phones) on a production build.

## 6. Progress

- 2026-11-20: audit and plan written. Phase 1 built:
  - Shared parts: `components/method/Lesson.js` (all lesson parts, "On this page" links, tables with highlighted cells, graphs), `StepList` shows each step's plain sentence (`text`), practice → calculator (`loadIntoCalculator` / `useLoadInput` in `calcDemo.js`; wired into `SymbolicCalculator`, the integral calculator and Newton forward), `id="calculator"` on the calculator section.
  - Sample 1, **Integral calculator**: lesson `src/app/data/lessons/integral.js` (3 worked examples, 8 practice questions); every integration step explained in words (`symbolic/explainIntegral.js`); tabular parts now shows the ILATE choice and a sign/differentiate/integrate/product table; partial fractions shows factorise, set up A, B, cover-up values, rewrite, integrate each piece (and the missing brackets in the factorised bottom are fixed); the working ends with simplify, put in the limits and a check by differentiating.
  - Sample 2, **Newton's forward interpolation** (original page): lesson `src/app/data/lessons/newton-forward.js` (census example with the full difference table and every term worked; finding the polynomial; 5 practice questions, answers computed and checked); practice loads into its calculator.
  - Checks: integral engine tests 7/7, strict KaTeX on the new working, `tests/browser/lesson-check.mjs` 16/16 on laptop and on phone (all parts, maths renders, practice solves in the calculator, no console errors, no sideways scrolling), lint clean.
  - Waiting for the owner's approval of the two samples before Phase 2.
- 2026-11-20, Phase 2 (owner: "implement all phases, then test them all together at the end"; no checks run mid-phase):
  - Tooling: `scripts/place-lesson.mjs <id>` puts a lesson on a page (original layout or MethodPage layout); `tests/unit/test_lessons.mjs` (standard + KaTeX + page wiring); `solveSoon()` / `useLoadInput()` in `calcDemo.js` for practice → calculator on the original pages; `checkParses()` in `utils/evaluateMath.js` (original root-finders no longer reject ln x, log10 x, 1/x, √x).
  - **Unit 1 done (15/15)**: bisection, false-position, newton-raphson, secant, fixed-point, gauss-seidel (tour retargeted to the lesson), sor, muller-method, golden-section, gradient-descent, graeffe-root-squaring, horner-method, bairstow-method, floating-point-representation, newton-system. Engines given first-iteration-in-full working and step text: sor (`working`, shown by its calculator), muller, golden-section, gradient-descent, graeffe, horner (one step per digit), bairstow, floating-point (binary conversion shown), newton-system (text).
  - **Unit 2 done (14/14)** incl. Bessel/Stirling working with every term substituted (`central-interpolation.js`), inverse Lagrange weights shown; step sentences now also come from `src/app/data/stepTexts/unitN.js` (`withStepText`, used by SymbolicCalculator and MatrixMethodCalculator; the audit counts them); practice → calculator added to all six shared frames and 29 hand-built calculators (not percentage, system-of-equations, matrix-calculator, triangle-solver, unit-circle).
  - **Unit 3 done (10/10)**; step sentences for double-integration and monte-carlo in `stepTexts/unit3.js`.
  - Unit 4 done (21/21, 2026-11-21): lessons on all 21 pages; first-step-in-full working added to the heat, wave, Laplace, Cholesky and conjugate-gradient engines; stepTexts/unit4.js filled. Also fixed: 23 older lesson files used r'…' (a parse error), now String.raw templates. Not yet tested. Next: Unit 5, then Phases 3–6, then every check together.

## 7. Rollback (2026-11-21)

The owner rejected the Lesson design (it read like an instruction manual and lost the pages' own style). Done:
- `<Lesson>` removed from all 58 pages; each page's original theory is back exactly as committed. The FAQ/related-links extras and `id="calculator"` stay.
- Removed: `src/app/data/lessons/`, `components/method/Lesson.js`, `scripts/place-lesson.mjs`, `tests/unit/test_lessons.mjs`, `tests/browser/lesson-check.mjs` (copies kept in that session's scratchpad only). The gauss-seidel tour points at its original `.step-intro-*` classes again.
- Kept for now (not theory): the engine working improvements, `stepTexts/`, practice wiring (`useLoadInput`), `checkParses`.

New approach, one page at a time, owner audits each: keep the original intro, formula box and worked example; add inside that design a "What each symbol means" grid and a "Common Mistakes" section; in the calculator show the formula first, then the iteration count worked out in plain steps, then every iteration with all numbers substituted, at normal size (no tiny inline fractions). Sample: bisection (`utils/evaluateMath.js` `substituteTex()` puts the numbers into f(x) for the working). Waiting for the owner's audit before any other page.

Progress (2026-11-21, after the owner approved bisection):
- Shared parts: `components/method/TheoryExtras.js` (`SymbolKey`, `CommonMistakes`), used by bisection and the pages below.
- Done in the original style: bisection, false position, Newton–Raphson, secant, fixed-point iteration. Each has a symbol key in its formula box, Common Mistakes after the worked example, worked-example iterations shown in full (false position 2–6, secant 2–4, fixed point 3–6, Newton 3–4), and calculator steps that give the formula first, then every iteration with the numbers substituted (`substituteTex`), and the stopping check.
- Checked in headless Chrome, laptop and phone: no console or KaTeX errors, no sideways scrolling.
- Next: the other Unit 1 pages (Gauss–Seidel, SOR, Muller, …), then Units 2–4 originals.

Progress (2026-11-21, Unit 1 finished):
- All 15 Unit 1 pages now have the symbol key, Common Mistakes, and worked examples with each iteration in full plus a table: Gauss–Seidel, SOR, Muller, Horner (synthetic division shown), Bairstow, Graeffe, golden section, gradient descent, Newton system, floating point, plus the five above.
- Wrong numbers fixed in the old pages: Gauss–Seidel table row 4 and conclusion (now 1.4555, 4.3960, 1.7822); Muller first step (1.263763, not 1.2649).
- `StepList` (every SymbolicCalculator page, ~130) now shows each step's formula full size before the working, instead of tiny text in the title bar.
- Checked in headless Chrome on laptop and phone: all 15 pages render, no KaTeX errors, no sideways scrolling. On the phone the first two pages loaded logged a React hydration-attribute warning once (not seen again on the other 13).
- Next: Unit 2 originals (Newton forward/backward, Gauss forward/backward, Lagrange, divided differences, Bessel, Stirling, difference table) and the newer Unit 2 pages.

Progress (2026-11-21, Units 2–4 built; owner: "first build them then check"):
- Unit 2 (14 pages): symbol keys, mistakes, difference working on every table page; Everett/Hermite/inverse/Chebyshev/Bessel/Stirling/spline examples expanded. Calculators: `components/method/TermWorking.js` (Newton fwd/bwd, Gauss fwd/bwd, divided differences) shows the step, the formula over several lines, each term with numbers, and the sum; Lagrange shows every weight Lᵢ, each yᵢLᵢ and the sum. Gauss backward now opens on its example. Checked once in a browser (all 14 render, no errors) before the later edits; Lagrange did not load in that run.
- Unit 3 (10 pages): symbol keys and mistakes; Romberg, double integral, Monte Carlo examples expanded. Calculators: `components/method/RuleWorking.js` (trapezoidal, Simpson 1/3 and 3/8, Boole, Weddle) shows h, every point with its weight, each group summed term by term, the bracket and the answer; Gauss quadrature shows the mapping, the first point in full and the sum; differentiation shows f at x − h, x, x + h.
- Unit 4 (21 pages): symbol keys and mistakes on all; Gauss–Jordan and LU got full worked examples (they had none); Gauss elimination and Jacobi examples finished. The 13 newer pages draw their worked example from `data/workedExamples/unit4.js` with `components/method/DataExample.js` (original card style). Calculators: `OdeCalculator` takes a `working` hook (`components/method/odeWorking.js` for RK2, Milne, Adams: first step in full); Euler and RK4 show the formula first and every slope with its point substituted (`substituteTexVars`).
- Wrong numbers fixed: Gauss elimination worked example (now 2, 3, −1 with full working); Jacobi example's "expected 1, 2, −1" (true 1.0433, 2.2692, −1.0817).
- Not yet checked in a browser: Unit 3 and Unit 4 (to be checked together at the end).

Progress (2026-11-21, Unit 5 built, not yet checked in a browser):
- 20 newer pages: worked example, symbol key and mistakes from `data/workedExamples/unit5.js`. The example steps are each page engine's own working for the calculator's first example (so page and calculator match); the question, answer, symbols and mistakes are hand-written. Bayes uses machines M1–M3 so the event "A" does not clash with a machine name.
- 7 original pages (chi-square, F, t, z tests; straight line, parabola, least squares): symbol key in the formula box and mistakes; their worked examples were already complete (parabola solution re-checked).
- Calculators: chi-square now shows each category's (O − E)²/E and the sum; least squares shows the sums and b, A′, a with the numbers put in; the test and fitting calculators' working is normal size (no tiny monospace).

Progress (2026-11-21, Unit 6 built, not yet checked in a browser):
- All 47 pages: worked example, symbol key and mistakes from `data/workedExamples/unit6.js` (built by the session's make_unit.mjs from each engine's own working; questions, answers, symbols and mistakes hand-written). Every engine result that is reported was compared with the stated answer (all agree).
- The derivative calculator now uses the shared StepList (formula full size before each line).
- Integral page: its formula-box imports had gone missing after the rollback; restored.

Progress (2026-11-21, Unit 7 built, not yet checked in a browser):
- All 13 pages: worked example, symbol key and mistakes from `data/workedExamples/unit7.js` (engine working for the calculator's example; hand-written question, answer, symbols, mistakes). All 13 engine results agree with the stated answers. Engines that return `lines` instead of steps (progressions, permutations, quadratic, systems) are split into titled steps.
- Calculators already show full-size working with the formula first; no changes needed.

Progress (2026-11-21, Unit 8 built, not yet checked in a browser):
- 9 pages (Cayley–Hamilton, consistency, diagonalisation, eigenvalues, linear dependence, linear transformations, quadratic form, SVD, vectors): worked example, symbol key and mistakes from `data/workedExamples/unit8.js`. Consistency and linear dependence have hand-written row-reduction steps; the engine shows only the ranks. Their results were cross-checked with the engines: x = t − 2, y = 8 − 2t, z = t; v₁ − 2v₂ + v₃ = 0. The other 7 use the engine's own working.
- 4 pages keep their own full worked examples (determinant, matrix calculator, inverse, rank), because their engines return structured results with no steps. They gain the symbol key and mistakes only.
- Calculators already use StepList (formula full size); no changes needed.

Progress (2026-11-21, Unit 9 built, not yet checked in a browser):
- 8 pages (3D geometry, circles, conics, heights and distances, inverse trig, polar, trig equations, trig identities): worked example, symbol key and mistakes from `data/workedExamples/unit9.js`. Each keeps the page's own question, so the 3D page solves the skew-lines example, conics the ellipse 4x² + 9y² = 36, and the trig equation 2cos²x + 3cos x + 1 = 0. Most steps are written out in full, because the engine skips a line: the factorising, the reference angle, the cross-product determinant. The engine was run on the same input and every result agrees.
- 6 pages keep their own full worked examples (area, coordinate geometry, Pythagoras, triangle solver, unit circle, volume) and gain the symbol key and mistakes.
- Calculators already show full-size working with the formula first (SymbolicCalculator/StepList, ShapeCalculator, BlockMath lines); no changes needed.

Progress (2026-11-21, Units 10 and 12–15 built; owner: "do all the units"):
- Unit 10 (finance, 13 pages): 10 new worked examples with every number put in (CAGR via logs, the NPV discount table, IRR Newton–Raphson table, the depreciation schedule, FD/RD/SIP/PPF/lumpsum/TVM). Values computed exactly in node. Compound interest, EMI and percentage keep their full examples and gain the symbol key and mistakes. ₹ inside maths is written `\text{₹}`.
- Unit 11 (tax): left as it is, because the tax pages stay hidden.
- Unit 12 (ODE/PDE, 18 pages): engine working where it reads cleanly. Bernoulli, linear (tan x), simultaneous and separation of variables are written by hand: the engine's lines for those questions contain `exp(-(2x))`, `+-cos t` and decimal π. All 18 results agree with the engines.
- Unit 13 (transforms, 10 pages): all written by hand (engine lines have decimal π, `s--3`). Each answer is checked by substitution or against the engine.
- Unit 14 (complex analysis, 7 pages): contour, residue, harmonic conjugate and Laurent are hand-written; the rest is engine working.
- Unit 15 (discrete/optimisation, 11 pages): the Dijkstra, Kruskal, BFS, Euclid and simplex examples show the engine's own tables (`steps(out)` in the content file); BFS/DFS shows both orders; Kuhn–Tucker and the truth table are hand-written.
- Known calculator issue, not fixed here: the symbolic integration lines in the calculators for Fourier series, separation of variables and Bernoulli print π as 3.14159265359 and signs like "--" and "+-". The theory examples avoid this, but the calculators still show it.

Checks (2026-11-21, all units built; each check run once):
- Lint: 0 errors (6 older warnings in Notes/landing). Unit tests 33/33 files, engine tests 437/437, method-list checks 10/10. Production build passed.
- Browser sweep of all 218 pages in Units 1–10 and 12–15, on laptop (1280×800) and phone (375×812), on port 3211. Every page has the symbol key and Common Mistakes, no console errors, and no sideways scrolling. Pressing solve shows the calculator working without KaTeX errors on every page.
- The sweep found 2 KaTeX errors: symbol-key cells in finite-difference BVP and RK2 had `$` inside a maths field. Both are fixed in `data/workedExamples/unit4.js`. Then all 3,525 maths strings in the worked-example data were parsed with KaTeX in node: 0 problems. These two pages were not re-loaded in the browser after the fix.

Progress (2026-11-21, calculator working fix + Unit 11; owner: "do unit 11 also and make it public with date of the latest source read"):
- Calculator integration lines (Fourier series, complex Fourier, separation of variables, Bernoulli):
  - interval ends that are multiples of π stay exact (`endNode` in engines/fourier-series.js);
  - scales read 1/π, 2/π (`scaleTex`);
  - the tabular method shows each integral in its tidiest form (sin(nx)/n², not a fraction inside a fraction; only when the raw form nests);
  - the tabular method's product column writes "− (−a)" as "+ a";
  - `tidySigns` (symbolic/tree.js) turns "--" and "+-" into "+" and "−", in integration working lines only. Applying it to every TeX string changed which form other engines pick as shortest.
- Unit 11 (11 tax pages): 9 new worked examples (same numbers as before, cross-checked against the stored-rate engines: ₹22,750, ₹1,56,000, ₹26,000, ₹10,000, 108.25 and 114.975 dollars, £22,750, £34,299.60, 60,727.50 dollars); GST and VAT keep their full examples. All 11 gain the symbol key and mistakes.
- Published: the 11 tax entries in data/methods.js are now `live(` with `lastmod` = the date their rate source was last read (`verifiedOn` in data/rates): GST and VAT 3 Nov, sales tax / Canada / India income tax 4 Nov, the rest 8 Nov 2026. Each page's RatesBadge shows "Source … · checked <date>". PPF (Unit 10) is still `building`.
- Checks: lint 0 errors, check:methods 10/10, unit tests 33/33, engine tests 437/437, build passed. In a browser (port 3211): no noindex on the 11 tax pages, the "checked" date is on each page, all 11 are in sitemap.xml with that lastmod. The sweep of Units 6 and 11–13 on laptop and phone found 0 problems in 172 loads.
- Rates re-checked 2026-11-21 against official sites (details in docs/launch/NETZ_OWNER_TODO.md section K). Now `official`: UK 2026/27 income tax and NI, UK VAT, Canada, India company tax, UAE, Singapore. Read but still `secondary`: India FY 2025-26, US 2026, US sales tax (Tax Foundation midyear 2026), UK corporation tax. No stored rate was found wrong. The 115BAB label now says 15% applies to manufacturing business income only. Japan's VAT entry notes the proposed food-and-drink cut. Sitemap lastmod is 2026-11-21 for sales tax, Canada, UK/US income tax, corporate tax and VAT; the other pages keep the date their in-force rule was last read.
