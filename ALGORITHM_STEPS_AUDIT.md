# Algorithm steps audit — 34 numerical-method pages

Date: 2026-10-18.

**Status:** findings 1–4 (correctness) were fixed on 2026-10-18 after approval. Backups of the original files are in the session scratchpad (`backup-2026-10-18/`). Groups 2–5 are still open.

What changed:
- Taylor page: derivatives are now found symbolically and shown as steps. Two helpers were added to `src/app/utils/evaluateMath.js`: `simplifyExpression` and `expressionToTex`.
- Notes registry:
  - Iterative methods now stop on their tolerance, and say "not converged" when they don't.
  - Gauss forward/backward use every available difference.
  - Gauss elimination, Gauss–Jordan and LU handle a zero pivot.
  - Taylor uses symbolic derivatives.
  - ODE methods reach the target x.
  - The t-test critical value now depends on df; the z-test uses α.
- Gauss–Seidel x and z substitution lines are corrected.
- Secant, False-position and Fixed-point worked tables are regenerated from the method.

Finding 5 (Gauss forward page edge case) is not fixed yet.

**Groups 2 and 5 (extra steps and 5–6 step demos)** were fixed on 2026-10-18. Backups are in `backup-2026-10-18-round2/`. Demo step counts now:

| Method | Before | Now | Demo answer |
|---|---|---|---|
| Bisection | 14 | 5 | x³ − 4x − 9, ε = 0.05 → 2.71875 ≈ 2.7. Shows the log₂ line; worked example rewritten to the same problem; last card says "stop"; stops on half-width only |
| False position | 7 (root already known) | 6 | x³ − 4x − 9 → 2.706525. Exact root from the scan stops at 0 iterations; \|Cₙ − Cₙ₋₁\| test added; worked example rewritten |
| Fixed point | 29 | 6 | (x + 1)^{1/3}, x₀ = 1.5 → 1.324726, matching the worked example. Step 0 shows the \|g′(x₀)\| < 1 check and refuses forms that would diverge; 6 d.p. |
| Gauss elimination | 5 row operations, no back substitution | 3 row operations + 3 back-substitution steps | (2, 3, −1). Swaps rows only on a zero pivot |
| Gauss–Jordan | 9 | 7 | (5, 3, −2). Swaps only on a zero pivot; skips ÷1 |
| Gauss–Seidel | banner 8 / 7 iterations | 6 / 6 | (1, 2, 3) |
| Jacobi | 8 | 6 | (1, −1, 1) |
| Newton forward | 4 terms (one zero) | 3 terms | 7.25; stops when a difference column is all zero |

The Notes registry mirrors these: bisection stop rule and ε = 0.05 default, Jacobi default system, Newton forward zero-column stop.

Still open: group 3 (LU working, hypothesis-test decisions, rendering `gridLog`), group 4 display bugs and finding 5.

**Question asked:** some methods show about 14 steps for a problem that should take about 7. Are the algorithms efficient, are the answers right, and do the step-by-step views help a student see how the problem is solved?

**Short answer**

- **Most engines compute correctly and stop at the right point.** The "14 steps" you saw is almost certainly **Bisection**. Halving [2, 3] until the error is below 0.0001 takes exactly 14 halvings; no implementation can do it in fewer. At a tolerance of 0.01 it takes exactly 7. So the step count comes from the demo's tolerance, not from a bug.
- **Real step inflation** shows up in five places:
  - Fixed-point demo: 29 iterations, where a better example needs 6.
  - False-position demo: 7 iterations on a root the interval search had already found exactly.
  - Gauss elimination: 5 row operations where 3 are needed.
  - Gauss–Jordan: 9 where 7 are needed.
  - Gauss–Seidel: the banner says 8 iterations when there are 7.
- **Wrong answers:**
  - **Taylor series page**: every answer is wrong, because y‴ is computed as about 0.
  - **Notes solver block** (`algorithmRegistry.js`): six methods give wrong or unconverged answers.
  - **Hand-written worked examples** on the False-position and Secant pages have wrong numbers.
  - **Gauss–Seidel**: the displayed substitutions in the x and z rows are wrong.
- **Missing steps make some pages harder to follow than the method itself:**
  - Gauss elimination has no back-substitution.
  - LU shows only the final L and U.
  - χ², F and t tests compute the statistic but never compare it with the table value or state a conclusion.
  - The setup lines (interval search, h, sums) are computed on 17 pages and never shown.

How this was checked: each engine's loop was copied exactly into a Node script, run on that page's Quick Demo inputs and compared with an independent calculation: an exact solve, Lagrange interpolation, a closed-form integral or the exact ODE solution. The Notes registry was imported and run directly. Scripts: session scratchpad `audit/pages.mjs` and `audit/reg.mjs`.

Path shorthand used below:
- `P/` = `src/app/(pages.algorithems)/`
- `R` = `src/app/(Primary.pages)/Notes/utils/algorithmRegistry.js`

---

## 1. Findings ordered by impact

### A. Wrong answers

1. **Taylor series page gives the wrong value for every ODE.**
   - Where: `P/(UNIT-4)/taylor-s-series-method/algorithems.taylor-series.js:49-50`.
   - Cause: y″ and y‴ come from finite differences of f taken along the tangent line (x₀±ε, y₀±ε·y′), not along the solution curve.
     - y″ comes out right only by luck: the first difference along the tangent equals f_x + f_y·y′.
     - y‴ is wrong. It is the second difference along a straight line, so it drops the f_y·y″ term:
       - for y′ = x + y it gives 0 instead of 2;
       - for y′ = x² + y² it gives 4 instead of 8.
     - It also divides by ε² = 10⁻⁸, which amplifies rounding noise.
   - Demo y′ = x + y, y(0) = 1, x = 0.2:
     - page shows **1.240000**;
     - correct 3rd-order Taylor value is **1.242667**;
     - exact value is 1.242806.
   - It also hides the step that defines the method: differentiating y′ = f(x, y) to get y″, y‴.
   - Fix:
     - Get y″, y‴ symbolically with `getSymbolicDerivative` (already in `src/app/utils/evaluateMath.js`), using y″ = f_x + f_y·f and y‴ = d/dx(y″) with y′ replaced by f.
     - Show those three derivative lines as steps.
     - Allow several steps of size h, as RK4 does.

2. **Notes solver block (`R`) wrong or unconverged answers.** These are separate copies of the algorithms, used by the Notes "solver" block, and they disagree with the pages:
   - **Taylor** (`R:1144`): hard-codes `y'' = 1 + y'` and `y''' = y''`, which holds only for y′ = x + y. For y′ = x² + y² it gives y(0.1) = 1.11034; the true value is 1.111463.
   - **Bisection** (`R:84`): always stops after 10 iterations, whatever the tolerance. It reports "Root x ≈ 2.706055" even when asked for 10⁻⁶; the true root is 2.706528.
   - **False position** (`R:203`): ignores the tolerance parameter (hard-coded 0.0001) and caps at 8 iterations (`R:191`).
   - **Fixed point** (`R:222`), **Gauss–Seidel** (`R:866`) and **Jacobi** (`R:913`): a fixed 6 iterations with no stopping test. On its default system, Jacobi stops with a last change of 0.003 and still labels the result the "Solution".
   - **Gauss forward / backward** (`R:371`, `R:434`): truncated after Δ³.
     - Default data gives 22.3920 and 17.7600.
     - The full formula, which the page uses, gives **22.4592** and **17.8272**.
     - The same problem gives a different answer in Notes and on the page.
   - **t-test** (`R:1518`): critical value fixed at 2.131 (df = 15 only), so the Accept/Reject verdict is wrong for other sample sizes. The **z-test** (`R:1486`) ignores the `alpha` parameter.
   - **Gauss elimination** (`R:967`): no pivoting and no zero-pivot check. A system whose first coefficient is 0 returns NaN.
   - **RK4** (`R:1267`) and **Taylor** (`R:1141`) cap at 5 steps, **Euler** (`R:1190`) at 10. A target beyond that is never reached, and the result is labelled with the x the loop stopped at.
   - Fix: use one tolerance-driven loop shared by the page engine and the registry. Taking the engines out of the React components into plain functions would let both import them.

3. **Gauss–Seidel step cards show wrong substitutions.**
   - Where: `P/(UNIT-1)/Gauss-seidal/algorithems.gauss-seidale-method.js:565` and `:577`.
   - x row: shows `d − a·x⁽ᵏ⁻¹⁾ − b·y⁽ᵏ⁻¹⁾` (its own coefficient and the wrong variables) instead of `d − b·y − c·z`.
   - z row: shows `… − c·z_prev` and divides by `b` instead of `c`.
   - The computed numbers are right (line 560, line 574); only the displayed working is wrong, so a student copying it gets a different number.

4. **Hand-written worked examples with wrong numbers** (the static tables in each page.js).
   - **Secant** (`P/(UNIT-1)/secant-method/page.js:14-16`):
     - Row 2 gives x₂ = 2.094568; the correct value is 2.081264.
     - f(x₂) is shown as "−0.351…"; correct is −0.390800.
     - The first relative error is shown as 2.857%; correct is 45.714%.
     - The table converges in 3 rows; the method actually needs 4.
   - **False position** (`P/(UNIT-1)/false-position-method/page.js:14-18`, text at `:142`):
     - f(2.0588) is shown as −0.3869; correct is −0.3908.
     - The rows that follow drift (2.0895 → 2.0896, 2.0924 → 2.0927, 2.0935 → 2.0939).
   - **Fixed point** (`P/(UNIT-1)/iteration-method/page.js:17-19`): rows 4–6 are off in the 6th decimal (1.324942 should be 1.324939, and so on).
   - Bisection and Newton–Raphson tables are correct.

5. **Gauss forward page silently drops terms near the table's edge.**
   - Where: `P/(UNIT-2)/(interpolation-equal-intervals)/gauss-forward/algorithems.gauss-forward-interpolations.js:563`; the same check is at `gauss-backward/...:546`.
   - The guard `typeof diffTable[m][i] === 'undefined'` never fires, because the table is filled with 0. Terms whose central differences don't exist are added as zeros and still shown as steps.
   - Demo data at x = 4.75 (origin 4.5): 3 of 5 terms use missing differences. The answer is 16.633625; Lagrange gives 16.635473.
   - The demo itself (x = 3.75) is correct.
   - Fix: stop the loop when the needed difference index leaves the table, and say "the next difference isn't available — stop here".

### B. Extra steps (the "14 instead of 7" question)

6. **Bisection: 14 iterations, as the mathematics requires.**
   - Where: `P/(UNIT-1)/bisection-method/algorithems.bisection-method.js:195` (`demoTol = 0.0001`), stopping test at `:172`.
   - Iterations needed from width 1:

     | Tolerance | Iterations |
     |---|---|
     | 0.01 | **7** |
     | 0.001 | 10 |
     | 0.0005 (3 d.p.) | 11 |
     | 0.0001 | **14** |

   - The answer 2.706482 is within 0.0001 of 2.706528.
   - What makes it feel too long:
     - The page's own worked example (`page.js:14-21`) shows 8 rows for a *different* function (x² − 4 on [0, 3]).
     - The demo then runs x³ − 4x − 9 with no explanation of why 14.
   - Fix:
     - Use demo tolerance 0.001 (10 steps) or 0.01 (7), or keep 0.0001 and add one line before the table: "n ≥ log₂((b − a)/ε) = log₂(1/0.0001) ≈ 13.3 → 14 halvings".
     - Use the same function in the worked example and the demo.

7. **Fixed-point iteration: 29 iterations.**
   - Where: `P/(UNIT-1)/iteration-method/algorithems.fixed-point-method.js:158-160`.
   - The demo picks g(x) = cos x, which converges slowly (|g′| ≈ 0.67), and a tolerance of 0.00001. Values are displayed to 8 d.p. (`:418`).

     | Example | Tolerance | Iterations |
     |---|---|---|
     | x = cos x | 10⁻³ | 17 |
     | x = cos x | 10⁻⁴ | 23 |
     | x = cos x | 10⁻⁵ | 29 |
     | x = (4x + 9)^{1/3}, x₀ = 2.5 | 10⁻⁴ | **6** |
     | x = (x + 1)^{1/3} (the page's own worked example) | 10⁻⁴ | 6 |

   - Auto-x₀ (`:140-142`) takes the midpoint of the first sign change of g(x) − x and never checks |g′(x₀)| < 1. A form that does not converge runs 100 iterations and only then shows an error.
   - Fix:
     - Make the demo the page's own example, (x + 1)^{1/3} from 1.5 with 10⁻⁴: 6 iterations, matching the worked table.
     - Show the |g′(x₀)| < 1 check as step 0 and refuse when it fails.
     - Display 4–6 d.p.

8. **False position: 7 iterations for a root it already found.**
   - Where: `P/(UNIT-1)/false-position-method/algorithems.false-positions-method.js:63-64`, demo `:167`.
   - The interval search hits f(2) = 0 exactly, logs "Exact root found at x = 2", then returns [1, 3] and runs 7 chord iterations to reach 1.999983. **Expected: 0 iterations.**
   - The stopping test is |f(c)| < tol only (`:112`). On the textbook cubic it happens to stop at 6, the same as a |cₙ − cₙ₋₁| test.
   - Fix:
     - When the scan finds an exact root, report it and stop.
     - Change the demo to x³ − 2x − 5 on [2, 3] so it matches the worked example.
     - Add |cₙ − cₙ₋₁| < tol as a second stopping test.

9. **Gauss elimination: 5 row operations where the textbook uses 3.**
   - Where: `P/(UNIT-4)/gauss-elimination/algorithems.gauss-elimination.js:34`.
   - Partial pivoting adds 2 row swaps on the demo and turns the clean multipliers (−1.5, −1, 4) into −0.6667, 0.6667, 0.2.
   - Back substitution (`:62`) is computed but **never shown**, although it is half of the method.
   - Fix:
     - Pivot only when the pivot is 0 (or tiny). Optionally offer a "partial pivoting" toggle.
     - Show back substitution as 3 steps.

10. **Gauss–Jordan: 9 steps where 7 are needed.**
    - Where: `P/(UNIT-4)/gauss-jordan/algorithems.gauss-jordan.js:34`.
    - The same pivoting adds a swap and changes every number from the textbook working.
    - Without pivoting, the code would also log a no-op "R1 ÷ 1.0000" (`:51`).
    - Fix: pivot only on zero, and skip the normalise step when the pivot is already 1.

11. **Gauss–Seidel: the banner says "8 iterations", but there are 7.**
    - Where: `P/(UNIT-1)/Gauss-seidal/algorithems.gauss-seidale-method.js:256`. `results` includes the starting guess, pushed at `:544`.
    - The iteration count itself is right: 7 at 10⁻⁴. Jacobi on the same system takes 9, so the page is genuinely Gauss–Seidel. It uses new values immediately (`:568`, `:574`).
    - Fix: show `results.length - 1`, or label row 0 as "initial guess".

12. **Newton forward: an extra zero term.**
    - Where: `.../newton-forward/algorithems.newton-forward-interpolations.js:498`.
    - The demo data is y = x² + 1, so Δ³y₀ = 0, yet a fourth term "(…)·0 = 0.0000" is still shown.
    - Fix: stop adding terms when the next difference column is all zero, and say so. That stopping point is the lesson of the difference table.

### C. Missing steps (the display is harder to follow than the method)

13. **LU decomposition shows no working**, only the final L, U, y and x (`P/(UNIT-4)/lu-decomposition/algorithems.lu-decomposition.js:154`).
    - Textbook Doolittle shows each uᵢⱼ and lᵢⱼ (9 entries for a 3×3 matrix), then Ly = b (3 lines) and Ux = y (3 lines).
    - Fix: log those 15 lines from the loops at `:25-60`.

14. **χ², F and t tests stop at the statistic.**
    - χ² stops at `.../chi-square/algorithems.chi-square.js:320`, F at `.../f-test/algorithems.f-test.js:310`, t at `.../t-test/algorithems.t-test.js:295`.
    - Missing: H₀, the tabulated value at 5%, and Accept/Reject.
    - Only the z-test has the decision step.
    - Demo values for the decision:

      | Test | Statistic | df | Table value at 5% | Decision |
      |---|---|---|---|---|
      | χ² | 2.0 | 3 | 7.815 | accept |
      | F | 1.0571 | (4, 5) | 5.19 | accept |
      | t | 1.271 | 7 | 2.365 | accept |

    - Fix: add an H₀ line and a decision line with a small lookup table for df ≤ 30 at 5% and 1%.

15. **Setup steps are computed but never rendered.**
    - `gridLog` is filled on 17 pages (`setGridLog(log)`) and never displayed. It holds lines such as "h = (b − a)/n", "Estimated Total Steps", the sums and df.
    - Bisection and false position build the sign-change search log (`intervalSteps`, `bisection…js:57-58`) and never show it, so the student never sees *why* [2, 3].
    - Fix: render these as a short step 0 at the top of each Step Derivations card.

16. **Modified Euler is Heun's single-corrector form.**
    - Where: `.../modified-euler.js:81`.
    - Many syllabi repeat the corrector until two values agree. The demo then gives 1.400389 (9 corrector evaluations) instead of 1.398465; the exact value is 1.399718.
    - Not wrong, but the page should say "one correction (Heun)", or offer the iterated form.

### D. Display bugs

17. **Gauss–Seidel variable order shows "x &rarr; y &rarr; z" literally.**
    - Where: `P/(UNIT-1)/Gauss-seidal/algorithems.gauss-seidale-method.js:248`.
    - `' &rarr; '` is a JS string, so React escapes it. Fix: use `' → '`.

18. **Gauss–Seidel chart axis labels are nearly invisible in dark mode.**
    - Where: `…:441` renders `<Plot iterations={results} />` without `darkTheme`.
    - `plot.js:45`, `:61` and the y-axis then fall back to `'black'`/`'#111827'` on a dark card.
    - Grid lines also use Chart.js defaults.
    - Fix: pass the current theme, or read `document.documentElement.classList.contains('dark')` / the CSS variables. Note that the other session made the layouts dark by default, so this now shows on first load.

19. **Gauss–Seidel extras:**
    - The tolerance field is named `error` (`:31`) and stored as a string. An empty field becomes 0, so the loop runs 1000 iterations and ends in a blocking `alert()` (`:610`).

20. **Newton forward/backward: unbalanced parenthesis in every substituted term.**
    - Where: `newton-forward…js:516`, `newton-backward…js:534`. The template `\frac{(v …) * Δ)}{i!}` renders as "(0.5) * 3.0000)".
    - `*` is shown instead of ×.
    - In Newton forward, the h line says "h = x₂ − x₁" while the code uses x₁ − x₀ (`:492`). Gauss forward/backward say "h = x − x₀" (`gauss-forward…js:555`).

21. **Newton divided difference:**
    - The calculated column prints raw floats such as `-0.46950000000000003` (`newton-s-divided…js:493`, `toFixed(4) * product` multiplies a string).
    - The formula shows `f[x_0x_1x_2]` with no commas (`:488`).

22. **Gauss forward: about 7 `console.log` calls per term** (`gauss-forward…js:570-583`, `:638`).

23. **Fitted equations print "+ -"**: `y = 2.0000 x^2 + -2.0000 x + 3.0000` (`fitting-parabola…js:403`; same at `straight-line…js:205`).
    - The straight-line page calls the slope *a* (`y = ax + b`, `:61`), while the textbook and the Notes registry use y = a + bx. A student comparing with notes sees a and b swapped.

24. **Other small display issues:**
    - Bisection's last card still says "New b = c" although the loop has stopped (`bisection…js:533`).
    - Jacobi shows "Converged in N iterations" even when it hit the maximum (`jacobi-method…js:180`).
    - The Jacobi demo is the classic 4×4 system (solution 1, 2, −1, 1) cut to 3×3, so its answer (1.0433, 2.2692, −1.0817) will not match any book.

---

## 2. All 34 methods (ordered by impact)

The "steps" columns use each page's Quick Demo. Steps are iterations, row operations, terms or nodes, as appropriate. "Answer correct" means the page's final value against an independent calculation.

| # | Method | Steps shown | Steps expected | Answer correct | Cause | Suggested fix (file:line) |
|---|---|---|---|---|---|---|
| 1 | Taylor series | 1 step, 4 terms | 1 step, 4 terms plus 3 derivative lines | **No** (1.240000; correct 1.242667) | y‴ taken along the tangent line gives ≈ 0; no symbolic derivative steps | `taylor-series.js:49-50` → symbolic y″, y‴; show them |
| 2 | Gauss–Seidel | banner 8, cards 7 | 7 | Yes (1.5326, 4.2637, 3.1462) | Banner counts iteration 0; x and z substitution lines wrong; `&rarr;`; chart dark mode | `gauss-seidale-method.js:256, 565, 577, 248, 441`; `plot.js:45` |
| 3 | Secant | 4 (engine); static table 3 | 4 | Engine yes (2.094549); **static table no** | Hand-typed table values wrong | `secant-method/page.js:14-16` → regenerate from the engine |
| 4 | False position | **7** | **0** (scan hits root x = 2 exactly); 6 on the cubic | Yes (1.999983); **static table drifts** | Scan finds exact root, then iterates anyway; only an \|f(c)\| test; static numbers wrong | `false-positions-method.js:63-64, 112, 167`; `page.js:14-18, 142` |
| 5 | Fixed point | **29** | 6 with a good g(x); 23 for cos x at 4 d.p. | Yes (0.739082) | Slowest possible demo plus a 10⁻⁵ tolerance; no \|g′\| < 1 check | `fixed-point-method.js:158-160, 140-142`; `page.js:17-19` |
| 6 | Bisection | **14** | 14 at 10⁻⁴ (7 at 0.01, 11 at 3 d.p.) | Yes (2.706482) | Tolerance choice; worked example uses a different function; search log hidden | `bisection-method.js:195, 57-58`; `page.js:14-21` |
| 7 | Gauss elimination | 5 | 3 + 3 back-substitution | Yes (2, 3, −1) | Partial pivoting adds swaps; back substitution not shown | `gauss-elimination.js:34, 62` |
| 8 | Gauss–Jordan | 9 | 7 | Yes (5, 3, −2) | Pivoting adds a swap; would log a no-op ÷1 | `gauss-jordan.js:34, 51` |
| 9 | Gauss forward | 6 terms | 6 (demo); fewer near the edge | Demo yes (19.407426); **edge case no** (16.6336 vs 16.6355) | Missing-difference guard never fires; console spam; h label | `gauss-forward…js:563, 570-583, 555` |
| 10 | Gauss backward | 5 terms | 5 | Yes (22.898438) | Same edge guard | `gauss-backward…js:546` |
| 11 | LU decomposition | 0 working lines | ~15 (u/l entries, Ly = b, Ux = y) | Yes (2, 2, −2) | Only final matrices shown | `lu-decomposition.js:25-60, 154` |
| 12 | χ² test | 4 rows + total | + H₀ + table value + decision | Yes (χ² = 2, df 3) | No decision step | `chi-square.js:320` |
| 13 | F-test | 2 lines | + table value + decision | Yes (F = 1.0571, df 4, 5) | No decision step | `f-test.js:310` |
| 14 | t-test | 2 lines | + table value + decision | Yes (t = 1.2710, df 7) | No decision step | `t-test.js:295` |
| 15 | Newton forward | 4 terms | 3 (Δ³ = 0) | Yes (7.25) | Zero term shown; stray ")"; h label | `newton-forward…js:498, 516, 492` |
| 16 | Newton backward | 4 terms | 4 | Yes (0.615686) | Stray ")" | `newton-backward…js:534` |
| 17 | Newton divided difference | 4 terms | 4 | Yes (19.03125) | Raw floats; `f[x_0x_1]` | `newton-s-divided…js:493, 488` |
| 18 | Jacobi | 8 | 8 | Yes (to 10⁻⁴) | Banner says "converged" even when not; truncated textbook system | `jacobi-method.js:180, 105` |
| 19 | Modified Euler | 3 | 3 (Heun) / 3 steps with 9 corrector evaluations (iterated) | Yes for Heun (1.398465) | Single corrector; not labelled | `modified-euler.js:81` |
| 20 | Fitting parabola | 5 rows + 3 equations | same + elimination of the 3×3 | Yes (2, −2, 3) | "+ -"; 3×3 solve hidden | `fitting-parabola.js:403, 103` |
| 21 | Fitting straight line | 5 rows + 2 equations | same | Yes (y = 1.33x + 0.72) | a/b naming swapped against textbook and Notes; "+ -" | `straight-line.js:61, 205` |
| 22 | Euler | 5 cards (table 6 rows incl. y₀) | 5 | Yes (1.721020) | — (row 0 is the initial value; fine) | — |
| 23 | Runge–Kutta 4 | 2 | 2 | Yes (1.242805) | — | — |
| 24 | Newton–Raphson | 4 | 4 (\|Δx\| < 10⁻⁴) | Yes (2.706528) | — | — |
| 25 | Lagrange | 4 terms | 4 | Yes (14.6667) | — | — |
| 26 | Trapezoidal | 7 nodes | 7 | Yes (0.784241; exact 0.785398) | — | — |
| 27 | Simpson 1/3 | 7 nodes | 7 | Yes (2.000863; exact 2) | — | — |
| 28 | Simpson 3/8 | 7 nodes | 7 | Yes (19.099608; exact 19.085537) | — | — |
| 29 | Boole | 5 nodes | 5 | Yes for the rule (1.617778; ln 5 = 1.609438, h = 1) | — | — |
| 30 | Weddle | 7 nodes | 7 | Yes for the rule (1.373447; textbook 1.3735) | — | — |
| 31 | Gauss quadrature (3-pt) | 3 | 3 | Yes (4/3 exact) | — | — |
| 32 | Numerical differentiation | 3 points, 2 formulas | same | Yes (10.0001, 12.0000) | Page uses central differences on a formula; the Notes catalogue describes a forward-difference *table* method (`R:553`) | Align description or add the table form |
| 33 | Least squares (exp/power) | 5 rows + 3 lines | same | Yes (y = 1.4339 e^{0.5473x}) | The Notes registry's "least-squares" is a *linear* fit (`R:1296`) | Align registry with page |
| 34 | z-test | 2 lines + decision | same | Yes (z = 2.3570 → reject) | — | — |

## 3. Notes solver block (`R`) against the pages

| id | Registry steps (defaults) | Problem | Line |
|---|---|---|---|
| bisection | 10 (fixed cap) | Ignores tolerance; result 2.706055 is not within 10⁻⁴ | `R:84` |
| false-position | ≤ 8 | Tolerance parameter ignored | `R:191, 203` |
| fixed-point | 6 (fixed) | No stopping test | `R:222` |
| secant / newton-raphson | 5 / 4 | OK (caps 10 / 8) | `R:116, 156` |
| gauss-forward / backward | 4 terms | Truncated after Δ³ → 22.3920 / 17.7600 vs full 22.4592 / 17.8272 | `R:371, 434` |
| gauss-seidel / jacobi | 6 (fixed) | No tolerance; Jacobi stops unconverged (change 0.003) | `R:866, 913` |
| gauss-elimination | 4 | No pivot check → NaN on a zero pivot | `R:967` |
| taylor-series | — | y″ = 1 + y′ hard-coded (only valid for x + y) | `R:1144` |
| euler / modified-euler / rk4 | — | Step caps 10 / 8 / 5 silently stop short of the target | `R:1190, 1223, 1267` |
| t-test / z-test | — | t critical fixed at df 15; z ignores α | `R:1518, 1486` |
| everything else | — | Matches the page (or the textbook) | — |

## 4. Suggested order of work (after approval)

1. **Correctness:**
   - Taylor page.
   - The registry items in §3.
   - The Gauss–Seidel displayed substitutions.
   - Regenerate the Secant, False-position and Fixed-point worked tables from the engine instead of typing them.
2. **The "too many steps" fixes:**
   - Bisection: tolerance plus the n ≥ log₂ line.
   - Fixed-point demo.
   - False-position exact-root stop.
   - Gauss elimination / Gauss–Jordan pivot only on zero.
   - Gauss–Seidel banner count.
   - Newton forward zero term.
3. **Missing steps:**
   - Back substitution.
   - LU working.
   - Hypothesis-test decisions.
   - Render `gridLog` / `intervalSteps` as step 0.
4. **Display:**
   - `&rarr;`, dark chart, stray parentheses, raw floats, "+ -", console.log, alert.
5. **Demo problems that finish in 5–6 steps** (the owner's suggestion, details in §5): change each Quick Demo, the matching Reset defaults and the page.js worked example together, so all three show the same problem.

## 5. Group 5 — demo problems that finish in 5–6 steps

Owner's suggestion: pick example problems that need only about 5–6 steps, which is the right length for following a method.

Every count below uses the page's own stopping rule, and each answer was checked independently (script: `audit/demos.mjs` in the session scratchpad). The plan:

- Where a method already takes fewer steps (Newton–Raphson 4, Secant 4, RK4 2), keep its demo. Padding it to reach 5 would teach the wrong thing.
- Where the step count comes from the data size (interpolation, integration, statistics), the demos are already 4–7 rows.

| Method | Current demo → steps | Proposed demo | Steps | Answer (checked) |
|---|---|---|---|---|
| Bisection | x³ − 4x − 9 on [2, 3], ε = 0.0001 → **14** | Same function, "correct to 1 decimal place" (ε = 0.05); drop the \|f(c)\| test | **5** | 2.71875 → 2.7 (root 2.706528) |
| ″ (if 2 d.p. are wanted) | | Same function, ε = 0.02 | 6 | within 0.016 of 2.706528 |
| False position | x² − 4 → **7** (root already found by the scan) | x³ − 4x − 9 on [2, 3], ε = 0.0001 | **6** | 2.70653 |
| Fixed point | x = cos x, ε = 0.00001 → **29** | x = (x + 1)^{1/3}, x₀ = 1.5, ε = 0.0001 (same as the page's worked example) | **6** | 1.324726 (root 1.324718) |
| ″ (alternative, same equation as the other Unit 1 pages) | | x = (4x + 9)^{1/3}, x₀ = 2.5 | 6 | 2.706520 |
| Newton–Raphson | x³ − 4x − 9, x₀ = 2.5 → 4 | keep | 4 | 2.706528 |
| Secant | x³ − 2x − 5, x₀ = 2, x₁ = 3 → 4 | keep | 4 | 2.094549 |
| Gauss–Seidel | 10, 2, 1 \| 27 … → **7** (non-integer answer) | 10x − 2y − z = 3; −2x + 10y − z = 15; −x − y + 10z = 27 | **6** | (1, 2, 3) |
| Jacobi | truncated 4×4 system → **8** (non-integer answer) | 20x + y − 2z = 17; 3x + 20y − z = −18; 2x − 3y + 20z = 25 | **6** | (1, −1, 1) |
| Gauss elimination | 5 row operations (pivoting) | same demo, pivot only on zero, plus back substitution | 3 + 3 = **6** | (2, 3, −1) |
| Gauss–Jordan | 9 operations | same demo, pivot only on zero, skip ÷1 | 7 | (5, 3, −2) |
| Euler | y′ = x + y, h = 0.1 to x = 0.5 → 5 | keep | 5 | 1.721020 |
| Modified Euler / RK4 | 3 / 2 steps | keep (each step already has 2 or 4 sub-lines) | 3 / 2 | 1.398465 / 1.242805 |
| Newton forward | 4 points, Δ³ = 0 | keep; after fix 12 it shows 3 terms | 3 | 7.25 |

Notes:

- Bisection can't reach 4 decimal places in fewer than 14 halvings from an interval of width 1. A 5–6 step demo therefore means asking for 1–2 decimal places. Say so on the page ("each step halves the interval; 5 steps → error < 0.05").
- The Gauss–Seidel and Jacobi systems above are standard textbook systems with whole-number answers. A student can then check the final row by substitution.
- Using one function (x³ − 4x − 9 on [2, 3]) across Bisection, False position, Fixed point and Newton–Raphson lets a student compare methods: 5 / 6 / 6 / 4 steps.

## 6. Longer term

Take each engine out of its React component into a plain `solve()` function that both the page and `algorithmRegistry.js` import. Most of the §3 differences exist because the same algorithm was written twice.

The Gauss–Seidel `page.js` (tour component) and the dark-default layouts belong to the landing-redesign session. Nothing above touches them. Items 17–18 are in the engine and `plot.js`.
