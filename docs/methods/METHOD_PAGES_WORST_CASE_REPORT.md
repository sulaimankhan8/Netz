# Method pages: worst-case input report

> **Status (2026-11-03): all 15 findings fixed in code.** Every changed file compiles, the helpers have unit
> checks, and `test_code_export.mjs` (650/650) and `test_feature_parity.mjs` pass. **Re-checked in the browser the
> same day:** all 63 worst-case runs (7 families × 9 states/widths) finished with no freezes, no console errors and nothing
> spilling sideways; Simpson n = 1,000 went from a 33,600px page and 1.8 s freeze to 5,208px and 0.65 s; n = 10,000 and
> 10,000 RK steps now show the cap message. All 34 pages still solve their demo inputs at 375px. What changed:
>
> 1. Root finders (bisection, false position, Newton-Raphson, secant, Gauss-Seidel): a shared `ConvergenceBanner`
>    is green only when the method converged; otherwise amber "Did not converge · stopped after N iterations", with
>    "Last estimate … is not a confirmed root".
> 2–3. A 2,000-step cap with a clear message on the 5 integration pages and Euler / modified Euler / Runge-Kutta.
>    Any table over 30 rows (all 34 pages) shows the first 15 and last 5 rows plus a "Show all N rows" button
>    (`components/LongTables.js`). ODE worked-step cards stop at 20. Each calculation now clears the previous result first.
> 4. Matrix input on phones: one card per equation with labelled boxes (x₁ … = b); laptop cells widened to 6rem.
> 5, 9. Newton forward rebuilt in the editorial style (same maths). All 6 interpolation pages use a shared
>    `DataPointsInput` with wide boxes.
> 6. ODE pages explain why they stopped (blow-up or a bad value) and keep the steps done so far.
> 7. 127 on-screen numbers use `fixed()`: no more `-0.0000`.
> 8. Gauss elimination / Gauss-Jordan / LU steps use 6 significant figures.
> 10. Line and parabola buttons now match the page notation (y = a + bx, y = a + bx + cx²).
> 11. All 11 comma lists (fits, chi-square, t, F) name the bad item instead of dropping it (`"3O"` used to be read as 3).
> 12. Equal-interval formulas get a general term past 11 points (checked equal to the written terms 1–10).
> 13. Iteration counts say "1 iteration" / "N iterations".
> 14. Newton-Raphson's tolerance box no longer turns into NaN when cleared.
> 15. Text boxes accept up to 2,000 characters (300 would cut off real data lists).
>
> Not done: the optional Simpson accuracy hint (Part 2, last item).

**Date:** 2026-11-03 · **Scope:** the calculators on the 34 method pages, tested through one page per family:
Newton-Raphson (roots), Newton forward (interpolation tables), Simpson 1/3 (integration), Gauss elimination (matrices),
Runge-Kutta (ODEs), chi-square (statistics), straight-line fit (curve fitting).
The other 27 pages share the same code patterns, so most findings apply to them as well (noted per row).

**How it was tested.** Each calculator got five input sets, typed into its real form fields:
**Demo** (the page's own defaults), **Worst case**, **Empty**, **One** (smallest valid input) and **Huge**.
Every value is something a student could actually type, for example `x^2 + 1`, census years 1891–1981, a 6×6 matrix with
`-1234.5678` and `0.000123`, or Simpson with n = 1,000. The worst case was also checked at 320px, at 200% zoom
(a 640px layout), on a laptop (1280px) and in light mode.

**What was verified in the browser:** Newton-Raphson, Newton forward, Simpson and Gauss in every state; Runge-Kutta in
Demo, Worst, Empty and One at 375px (its Huge state froze the browser, see #2).
**Not verified in the browser:** chi-square and straight-line fit. The dev server was stopped before their run, so their
rows below come from reading the code and are marked *(code)*.

---

## Part 1: What broke

Severity: **Broken** = wrong answer shown, content unreadable or the page stops working. **Ugly** = readable but visibly
wrong. **Fragile** = fine today, one realistic step from breaking.

| # | Severity | Where | Worst-case input | What happens | Fix |
|---|---|---|---|---|---|
| 1 | **Broken** | Root finders (5 pages) | `f(x) = x^2 + 1` (no real root), x₀ = 0.5 | Green box: "**CONVERGENCE REACHED (50 ITERATIONS)** … Approximate root at x = −0.870753". The method never converged, and −0.87 is not a root. A student would copy it down as the answer. | Keep a `converged` flag. When it is false, show an amber box "Did not converge after 50 iterations", with no "root". Jacobi already does this right (`jacobi-method/algorithems.jacobi-method.js:103`). |
| 2 | **Broken** | Runge-Kutta (and Euler, modified Euler, Taylor) | h = 0.001, target x = 10 → 10,000 steps | The browser tab froze and never recovered. The test browser had to be killed. | Cap the step count (e.g. 2,000) with a clear message, and draw only the first and last rows of the table with "Show all". `runge-kutta-method/algorithems.runge-kutta.js:55` (no cap), tables at `:377` and `:411`. |
| 3 | **Broken** | Simpson (and the 13 calculators that draw every row) | n = 10,000 (n = 1,000 for the worst case) | n = 10,000: about 7 s frozen, 62,000 page elements, page 294,600px tall (~360 phone screens). n = 1,000: about 1.8 s frozen, page 33,600px tall. | Same as #2: a sensible cap on n, plus a collapsed table (first 10 / last 10 rows, then "Show all 1,001 rows"). `simpson-1-3-Rule/algorithems.simpson-1-3-rule.js:34` (no cap), table `:372`. |
| 4 | **Broken** | Gauss elimination, Gauss-Jordan, LU, Jacobi (shared matrix input) | 6×6 matrix with `-1234.5678`, `98765.4321`, `0.000123` | On a phone the cells cut off what you typed: `-1234.5678` shows as `-1234.`, `98765.4321` as `98765.`, `100000` as `10000(`. The 7th column (the constants) is half off the screen. | On phones, let the matrix slide sideways with wider cells (`minmax(4.5rem, …)`), or enter it one equation per row. `components/MatrixInputGrid.js:83`, `:95`. |
| 5 | **Broken** | Newton forward (data table) | Y values with 6 decimals, e.g. `479.425539` | The Y boxes are too narrow at 375px, so `479.425539` shows as `479.42553`. You cannot check what you typed. | Make the delete button icon-sized and give the number boxes the width. `newton-forward/algorithems.newton-forward-interpolations.js:180`, `:193`. |
| 6 | Ugly | Runge-Kutta (blow-up) | `y' = y^2 + x`, y(0) = 1, target 2 | Only output: "Evaluation error at RK4 step 21." It doesn't say the solution grew without limit, and the 20 good steps are thrown away. | Say what happened ("y grows without limit near x ≈ 1, try a smaller target") and keep the steps computed before it. `runge-kutta.js:74`. |
| 7 | Ugly | Newton forward difference table, Simpson table | Census data; `exp(-x^2)…` | Zeros show as `-0.0000` / `-0.000000` (negative zero from rounding). | Turn `-0` and tiny values into `0` before formatting. The check at `newton-forward…js:324–328` compares only with `"0.0000"`, so `"-0.0000"` gets through. |
| 8 | Ugly | Gauss elimination steps | Entries like `0.000123` | Step tables round to 4 decimals: `0.000123` → `0.0001` and multiplier `-0.000203` → `-0.0002`, so the working looks wrong. | Use significant figures (`toPrecision(6)`) instead of `toFixed(4)`. `gauss-elimination/algorithems.gauss-elimination.js:59`, `:72`, `:75`. |
| 9 | Ugly | Newton forward | Any | It is the only calculator still in the old look: red trash buttons, purple "Demo", green "Interpolate". The difference table is also narrower than its card. | Move it to the shared editorial controls like the other 33 pages. |
| 10 | Ugly *(code)* | Straight-line fit | Any | The button says "Fit Line Y = aX + b", but the steps say "Intercept a = …, Slope b = … (line y = a + bx)". **a** and **b** swap meaning between the two. | Use one form everywhere. `fitting-straight-lines/algorithems.straight-line.js:73` and the button label. |
| 11 | Fragile *(code)* | Chi-square, line fit and other comma-list inputs | Observed `20, 3O, 25` (letter O typed for zero) | Values that aren't numbers are silently dropped (`.filter(v => !isNaN(v))`). With a typo in both lists, the values shift and get paired wrongly, and the page still shows a result. | Reject with "Item 2, '3O', is not a number". `chi-square/algorithems.chi-square.js:30–31`, `straight-line.js:34–35`. |
| 12 | Fragile | Newton forward | 25 rows of data | The calculator's text contained "undefined" or "null" 14 times. Not traced to the exact spot, because the server was stopped before the re-run. | Re-run `?data=huge` and remove the literal. |
| 13 | Fragile | Labels on 12 calculators | Method that finishes in 1 step | Labels are written as `({n} iterations)`, so a 1-step result would read "1 iterations". Not hit in this run. | Pick "iteration" / "iterations" by count. |
| 14 | Fragile | Root finders | Clearing the tolerance box | The value becomes `NaN` and React logs "Received NaN for the value attribute". `newton-raphson-method/aldorithems.newton-raphson.js:318` | Keep the text as typed and parse it on Calculate. |
| 15 | Fragile | All inputs | Very long pasted expressions | No input on any page has a length limit (0 files use `maxLength`). | Add a sensible limit (e.g. 300 characters) with a message. |

## Part 2: Decisions for you

- **Big step counts (#2, #3): cap them, or allow them but collapse the table?** Recommendation: both. Cap at 2,000 steps
  with a message ("Too many steps for the page; use h ≥ 0.005"), and collapse any table over 20 rows to first 10 / last 10
  with "Show all". Students rarely need row 600, and a frozen phone loses them.
- **Matrix input on phones (#4): slide sideways, or one equation per row?** Recommendation: slide sideways for 2–4
  unknowns and one equation per row for 5–6. A 7-column grid can't show 10-character numbers in 375px.
- **No-convergence result (#1): show the last value or not?** Recommendation: show it, labelled "last value, not a root",
  with the table, because seeing the method wander is the lesson.
- **Accuracy warning (Simpson):** with n = 1,000 over [−25.75, 1284.5] the step is 1.31, far too coarse for sin(10x), and
  the page shows I ≈ −0.970 (the true value is about 0) with no warning. Showing a hint when h is large compared to the
  interval of interest is optional. Recommendation: a one-line note ("Large step size h = 1.31: the result may be
  inaccurate").

## Part 3: What held up

- **Nothing pushed the page sideways** in any state at 320, 375, 640 or 1280px, dark or light (every measured run).
  The phone layout from 2026-11-02 holds with worst-case data too.
- **Phone inputs are 16px**, so iPhones don't zoom in.
- **Long equations** fit or fade at the edge; at 320px the longest ones slide inside their box instead of breaking the page.
- **A 50-row iteration table** stays inside its box and slides sideways on phones.
- **Guarded inputs:** Simpson rejects odd n; a singular matrix gives "Zero pivot at column 3. System may have no unique
  solution."; an empty matrix gives "Cell [1][1] has an invalid value."; chi-square rejects expected values ≤ 0 *(code)*;
  the line fit rejects identical x values *(code)*.
- **Jacobi** handles non-convergence correctly. It is the model for fixing #1.
- **Chi-square critical values** are computed for any degrees of freedom, so 60 categories still work *(code)*.
- **A long textbook function** (`x*exp(x) - cos(x) + log(1 + x^2) - …`, tolerance 1e-15) converges in 6 iterations in
  about 1.2 s and lays out fine.
- No `NaN` or `Infinity` was shown in any measured run.

---

## Test tools (dev only, never in production)

- **Switch:** open any of the 7 pages above with `?data=worst` (or `demo`, `empty`, `one`, `huge`), e.g.
  `http://localhost:3210/simpson-1-3-Rule?data=worst`. A small Demo / Worst case / Empty / One / Huge bar appears at the
  bottom and types each input set into the form. Files: `src/app/components/dev/WorstCaseToggle.js`,
  `src/app/utils/dev/worstCaseInputs.js` (the input sets), one line in `src/app/(pages.algorithems)/layout.js`.
  It renders nothing in a production build.
- **Check script:** `tests/browser/alg-break.mjs` (set `ONLY=<page>` and `STATES=<states>`). Run one page family per
  process: a frozen page (#2) stops the run. Screenshots are in `tests/browser/shots/alg-break/`.
