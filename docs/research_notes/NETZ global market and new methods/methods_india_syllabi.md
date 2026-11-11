# New NETZ methods from Indian university syllabi and exams (researched 2026-11-03)

Scope: numerical methods, engineering maths and statistics topics that appear in current Indian syllabi or exams and that NETZ's 34 method pages do not cover yet.

How the research went: official university PDFs were mostly unreachable through search. Mumbai R2019, SPPU 2024, AKTU BAS303, RGPV, MAKAUT, DU, MSBTE and the KTU 2024 scheme did not come back as readable documents. The syllabi confirmed below come from five readable documents: Anna, VTU, JNTUH, GTU and IGNOU. Two NIT Kurukshetra and IIT Roorkee/NPTEL snippets add partial support. The ranking should therefore be read as "well supported by about 7 sources", not "counted across all 13 universities".

## 1. Topics in each syllabus that could be confirmed

### Takeaway
All five confirmed syllabi share the same core, and NETZ already covers it: root finding, Gauss elimination, Jacobi and Gauss-Seidel, Newton and Lagrange interpolation, trapezoidal and Simpson rules, Taylor, Euler and RK4. The extras each university adds are where the gaps are: Milne/Adams predictor-corrector, the power method and Jacobi eigenvalues, Picard's method, double integration, difference operators, Bairstow's method, splines, ANOVA/design of experiments, and correlation/regression.

### Cited Findings
- **Anna University, MA3251 Statistics & Numerical Methods (R2021, 2nd semester, taken by most branches)**
  - Unit I: sampling distributions; tests for one mean, a proportion and a difference of means, for large and small samples; tests for one variance and for equality of variances; chi-square for goodness of fit and for independence of attributes.
  - Unit II, Design of Experiments: one-way and two-way classification, completely randomised design, randomised block design, Latin square design, 2² factorial design.
  - Unit III: fixed-point iteration, Newton-Raphson, Gauss elimination with pivoting, Gauss-Jordan, Gauss-Jacobi and Gauss-Seidel; eigenvalues by the **power method** and by **Jacobi's method for symmetric matrices**.
  - Unit IV: Lagrange and Newton divided-difference interpolation; Newton forward and backward interpolation; derivatives from interpolating polynomials; **numerical single and double integration** by the trapezoidal and Simpson 1/3 rules.
  - Unit V: Taylor, Euler, modified Euler and RK4; multi-step methods **Milne and Adams-Bashforth predictor-corrector**.
  - Sources: [Padeepz](https://padeepz.net/ma3251-syllabus-statistics-and-numerical-methods-regulation-2021-anna-university/) and [StuCor](https://stucor.in/syllabus/s-ma3251/). Both are mirrors, not the official PDF.
- **VTU, BMATS201 Mathematics-II for the CSE stream (2022 scheme; lesson plan for AY 2023-24)**
  - Module 4: Regula-Falsi, Newton-Raphson, finite differences, Newton forward and backward formulas, Newton divided difference, Lagrange, Simpson 1/3 and 3/8, trapezoidal.
  - Module 5: Taylor series, modified Euler, RK4, **Milne's predictor-corrector** (two classes).
  - Module 1 includes analytic double and triple integrals and Beta/Gamma functions.
  - Source: [ATME college lesson plan](https://old.atme.edu.in/wp-content/uploads/2024/04/BMATS201-LP.pdf).
- **VTU-affiliated BMSCE elective (2020-21):** "4th order Predictor-Corrector methods: Milne and Adam-Bashforth methods". Source: [BMSCE](https://bmsce.ac.in/Syllabus/IQAC/UG/Mathematics-UG%20Syllabus%202021-22%20(Institutional%20Electives).pdf), as given in the search snippet.
- **JNTUH R22, Numerical Methods & Complex Variables (EEE, 2nd year, 1st semester)**
  - Unit II: bisection, iteration, Newton-Raphson and Regula-Falsi; Jacobi and Gauss-Seidel; **forward, backward and central differences, symbolic relations and separation of symbols**; Newton forward and backward; Gauss forward and backward; Lagrange.
  - Unit III: trapezoidal, Simpson 1/3 and 3/8; Taylor, **Picard's method**, Euler, modified Euler, RK4.
  - Source: [InspireNignite mirror](https://www.inspirenignite.com/ts/numerical-methods-and-complex-variables-eee-syllabus-for-btech-2nd-year-1st-sem-r22-regulation-jntuh/).
- **GTU 2140706, Numerical & Statistical Methods for CE/IT/ICT (4th semester; the document is dated around 2015 and may since have been renumbered)**
  - The syllabus units, with exam weightage out of 70:
    1. Errors (10): significant figures, round-off and truncation error, error propagation.
    2. Roots (15): bisection, Regula-Falsi, NR, secant, successive approximation, **Budan's theorem**, **Bairstow's method**.
    3. Linear systems (15): Gauss elimination and pitfalls, **matrix inversion**, Gauss-Seidel, **ill-conditioned equations**.
    4. Curve fitting (10): linear and **polynomial regression**, Lagrange, **spline interpolation**.
    5. Integration (10): Newton-Cotes, trapezoidal and Simpson.
    6. ODEs (10): Euler, RK, **boundary value problems**.
    7. Statistics (15): frequency distributions, moments, **correlation and regression**, **trend analysis**, **moving average**, MSE, non-parametric statistics, resampling, confidence intervals.
  - The practicals include C programs for Bairstow, **RK2**, numerical differentiation from Newton interpolation, mean, median, mode and percentiles.
  - Source: [GTU 2140706 PDF (MBIT copy)](https://www.mbit.edu.in/wp-content/uploads/syllabus/UGCP/2140706.pdf).
- **IGNOU BCA BCS-054, Computer Oriented Numerical Techniques (assignment 2026-27)**
  - Error topics: fixed- and floating-point representation, round-off, significant digits, normalised floats, overflow, truncation-error bounds.
  - Linear systems: Gauss elimination with **partial pivoting**; Jacobi compared with Gauss-Seidel.
  - Roots: Regula-Falsi, NR, bisection and secant on one equation.
  - Differences: **difference operators** (write Δ³f₁ as a backward and as a central difference) and building difference tables.
  - Source: [IGNOU BCS-054 2026-27 assignment](https://www.ignou.ac.in/viewFile/SOCIS/assignments/BCS-054-BCA-2026-27.pdf).
- **IGNOU MCA:** the numerical course is the elective MCSE-004 Numerical and Statistical Computing. MCS-031 is Design and Analysis of Algorithms. Source: [IGNOU MCA syllabus listing](https://ganpat.yolasite.com/ignoumca-syllabus.php).
- **NIT Kurukshetra, Mathematics-III:** Newton forward and backward, **Bessel's and Stirling's formulae**, Lagrange, numerical differentiation and integration. Source: [NIT KKR](https://nitkkr.ac.in/wp-content/uploads/2022/03/3rd__4th_sem.-Link-6.doc), as given in the search snippet.
- **IIT Roorkee NPTEL numerical course:** "central difference formulae, i.e. Bessel and Stirling's interpolation formulae". Source: [NPTEL 111107105](https://arctest.dev.nptel.ac.in/content/syllabus_pdf/111107105.pdf), as given in the search snippet.
- **KTU cluster syllabus (older scheme):** power method, Jacobi method, **Lagrangian and Hermitian interpolation**, **quadratic and cubic splines**. Source: [search snippet via Wiley India result](https://www.wileyindia.com/wileyproductpdf/download/pdf/id/353/). Which document this comes from is uncertain.

### Inferences
- Milne/Adams predictor-corrector appears in Anna, VTU and BMSCE, and GATE ME and CE list "multi-step methods". It is the most consistently present topic that NETZ is missing.
- Anna's MA3251 is taken by roughly every engineering branch in Tamil Nadu: the mirror sites list about 20 branch variants. That alone makes the power method, Jacobi eigenvalues, double integration and ANOVA (CRD, RBD and Latin square) high-reach topics.

### Gaps
- No readable current syllabus came back for Mumbai R2019 (Engineering Maths III and IV), SPPU 2019/2024 (Engineering Maths III, and Numerical Methods for Mechanical and Civil), AKTU BAS303/BAS403, RGPV, MAKAUT M(CS)/M401, Delhi University B.Sc Numerical Methods (DSC), MSBTE or the KTU 2024 scheme. They are not in the counts.
- From memory only, not verified here:
  - Mumbai and SPPU include Laplace and Fourier transforms, Z-transform, correlation/regression and probability distributions.
  - SPPU Mechanical Numerical Methods includes Gauss quadrature, Thomas algorithm and Liebmann/finite-difference PDEs.
  - DU's Numerical Methods paper includes Muller's method and the power method.
  - AKTU Maths-III includes Stirling, Bessel, Crout's method and Weddle's rule.
  Confirm each against the official PDFs before relying on it.

## 2. GATE engineering mathematics: numerical and statistical topics and marks

### Takeaway
GATE asks only for the basics: root finding, linear systems, trapezoidal and Simpson rules, single-step and multi-step ODE methods, error analysis (CE), and the binomial, Poisson and normal distributions. Coaching sources put numerical methods at about 1–2 marks per paper, within an engineering-maths block of about 13–15 marks.

### Cited Findings
- **GATE ME numerical methods:** numerical solutions of linear and non-linear algebraic equations; integration by the trapezoidal and Simpson rules; single-step and multi-step methods for ODEs. Source: [Careers360](https://engineering.careers360.com/articles/gate-syllabus-for-mechanical-engineering).
- **GATE ME probability and statistics:** probability definitions, sampling theorems, conditional probability, mean, median, mode and standard deviation, random variables, and the binomial, Poisson and normal distributions. Source: same page.
- **GATE CE:** adds error analysis, Newton's and Lagrange polynomials, numerical differentiation, and single- and multi-step methods for first-order ODEs. Source: [Careers360 CE](https://engineering.careers360.com/articles/gate-syllabus-for-civil-engineering), as given in the search snippet.
- **GATE EE:** the maths list includes Numerical Methods and Transform Theory. Source: [PW](https://www.pw.live/gate-exam/ee-syllabus), as given in the search snippet.
- **Weightage:**
  - Engineering mathematics is about 15% of marks. Source: [S.Chand GATE maths book page](https://www.schandpublishing.com/books/competitive-books/gate-exam/engineering-mathematics-gate-2024-ma-xe-ae-ag-ese-iit-jam-csir-ugc-net/9789355019073/).
  - About 13 marks in CSE 2026. Source: [PW syllabus blog](https://store.pw.live/blogs/gate-exams/gate-syllabus), as given in the search snippet.
  - About 12.25 marks expected for ME. Source: [SATHEE IITK](https://sathee.iitk.ac.in/article/gate/gate_syllabus_2024_for_cse_ece_ee_me_da_ec_in_ce_download_paper_wise_pdfs).
  - Numerical methods about 1–2 marks, mostly NR, trapezoidal, interpolation and errors. Source: [IMS](https://www.imsindia.com/blog/gate/gate-mathematics-and-aptitude-preparation-tips/).

### Inferences
- GATE adds little beyond what NETZ already has. The new GATE-relevant items are multi-step predictor-corrector methods, error analysis, and the binomial, Poisson and normal distributions; the distributions are much heavier than numerical methods across all papers.
- GATE numerical questions are usually NAT (numerical answer type). A step table showing the iterates for NR, Simpson or RK fits that question style.

### Gaps
- The official IIT GATE 2026/2027 syllabus PDFs and the CS-specific maths list were not fetched. As I recall, the CS maths list (discrete maths, linear algebra, calculus, probability) has no numerical methods; this is unverified.
- No per-year, per-topic mark counts from actual papers were found. All weightage figures are coaching-site estimates.

## 3. Missing topics, ranked for NETZ

### Takeaway
Ranking by how many confirmed sources include a topic, its exam weight and how well it suits a step-by-step table puts these first:
1. Milne and Adams-Bashforth predictor-corrector
2. Power method for eigenvalues
3. Picard's method
4. Finite-difference tables and operators
5. Stirling and Bessel central-difference interpolation
6. Correlation and regression, plus exponential and power curve fitting
7. Binomial, Poisson and normal distributions
8. Double integration by trapezoidal and Simpson
9. ANOVA (one-way, two-way, Latin square)
10. Jacobi eigenvalue method

### Cited Findings (evidence per topic; sources as in section 1)

| Rank | Missing topic | Confirmed sources | Exam weight | Fits a step table? |
|---|---|---|---|---|
| 1 | Milne / Adams-Bashforth predictor-corrector | Anna MA3251, VTU BMATS201, BMSCE, GATE ME and CE ("multi-step") | Unit-level at Anna and VTU (several lecture hours); GATE syllabus item | Excellent: RK4 start values, then predictor and corrector rows |
| 2 | Power method (largest eigenvalue) | Anna MA3251, KTU cluster | Anna Unit III | Excellent: iterate the vector and normalise in each row |
| 3 | Picard's method | JNTUH R22 | Unit III | Fair: symbolic integrals per row (needs a CAS) |
| 4 | Finite-difference table and operators (Δ, ∇, δ, E) | JNTUH R22, IGNOU BCS-054, VTU module 4 | IGNOU assignment questions; underpins the interpolation units | Excellent: difference table |
| 5 | Stirling and Bessel interpolation | NIT KKR, IIT-R NPTEL | Common in North-India Maths-III (AKTU unverified) | Excellent: same difference table |
| 6 | Correlation and regression (Karl Pearson, rank, regression lines) | GTU 2140706, GATE (statistics) | 15/70 of the GTU statistics unit | Good: Σ columns table |
| 7 | Polynomial regression; exponential and power fits | GTU 2140706 | GTU curve-fitting unit (10/70) | Good: log-transform then normal equations |
| 8 | Binomial, Poisson and normal distributions | GATE ME, CE and all papers | The largest maths share in GATE | Good: probability tables |
| 9 | Double integration (trapezoidal and Simpson) | Anna MA3251 | Unit IV | Good: 2-D grid-weight table |
| 10 | ANOVA: CRD, RBD, Latin square, 2² factorial | Anna MA3251 Unit II | A full unit (about 20%) | Excellent: ANOVA table |
| 11 | Jacobi eigenvalue method (symmetric matrices) | Anna MA3251 | Unit III | Good: rotation per step |
| 12 | Gauss elimination with partial pivoting | Anna, IGNOU | Asked explicitly | Excellent; possibly just an option on the existing page |
| 13 | Errors and floating point (significant digits, truncation bounds) | GTU (10/70), IGNOU, GATE CE | Moderate | Fair: calculator-style rather than iterative |
| 14 | Matrix inversion (Gauss-Jordan) and ill-conditioning | GTU | Part of 15/70 | Good |
| 15 | Bairstow's method; Budan's theorem | GTU | Part of 15/70 | Good: quadratic-factor iterations |
| 16 | Cubic splines; Hermite interpolation | GTU, KTU cluster | Small | Good: tridiagonal solve, then piecewise table |
| 17 | Boundary value problems (finite difference) | GTU | Part of 10/70 | Good |
| 18 | RK2 as its own method | GTU practical list | Small | Excellent; possibly an option on the RK page |
| 19 | Moving averages and trend analysis | GTU | Part of 15/70 | Good |

### Inferences
- **Cheapest to build:**
  - Ranks 1, 4, 5, 12 and 18 reuse existing NETZ engines: RK starting values, the difference table used by Newton forward/backward, Gauss elimination and RK.
  - The power method and double Simpson are small new engines with very clean tables.
- **Highest reach:**
  - Anna's MA3251 extras (ranks 1, 2, 9, 10, 11) reach a very large cohort through one compulsory course.
  - The binomial, Poisson and normal distributions matter most for GATE.
- **Weakly supported in this session** (not confirmed in any syllabus fetched, though they are in standard Indian textbooks): Muller, Graeffe, Ramanujan, Chebyshev, Birge-Vieta, Horner, Crout/Doolittle/Cholesky, SOR, Everett, inverse interpolation, Romberg, shooting method, Laplace/Poisson (Liebmann), Bender-Schmidt, Crank-Nicolson, wave equation, simplex, transportation, assignment, and Laplace/Fourier/Z transforms. Treat them as lower priority until checked against Mumbai, SPPU, AKTU, DU and the OR course syllabi.

### Gaps
- No Operations Research or Optimization course syllabus (simplex, transportation, assignment) was fetched, so their demand is unmeasured.
- Previous-year question-paper frequency counts were not collected. The ranking relies on presence in syllabi and on unit weights, not on how often each topic is asked.
- The PDE methods (Liebmann, Bender-Schmidt, Crank-Nicolson) are commonly said to appear in Anna's older MA8491 and in SPPU Mechanical. Neither was verified in this session.
