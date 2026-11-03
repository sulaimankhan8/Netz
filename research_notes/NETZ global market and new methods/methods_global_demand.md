# Global demand for numerical methods, algorithms and applied-maths topics NETZ could add

Research date: 2026-11-03. NETZ already has 34 pages (root finding x5, Gauss-Seidel, 6 interpolation, 7 integration/differentiation, 4 ODE IVP, 4 direct/iterative linear, 4 stats tests, 3 curve fitting).

**Main demand measure used here (collected first-hand for this note):** English Wikipedia pageviews from Oct 2025 to Sep 2026 (12 months, human "user" agent, all devices), taken from the Wikimedia REST pageviews API. The URL pattern is `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{Article}/monthly/2025100100/2026093000` ([Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/); the same numbers can be checked by hand at [pageviews.wmcloud.org](https://pageviews.wmcloud.org/)). Wikipedia views are a global proxy for how much students study a topic, not search volume. Treat them as relative signals. Wherever it says "Wiki 12-mo views", the number comes from this API.

---

## Q1. What do numerical analysis / scientific computing courses cover worldwide, and what is NETZ missing?

### Takeaway
Courses worldwide share a core NETZ already covers: roots, interpolation, quadrature, ODE IVPs and linear systems. Across the US, UK, India, Brazil and others, the biggest gaps are: eigenvalues (power method, QR algorithm), QR/SVD/Cholesky factorisations, splines, nonlinear systems (Newton for systems), multistep ODE methods and stiffness, boundary-value problems (shooting and finite difference), PDEs (heat, Laplace and wave by finite differences), optimisation (golden section, gradient methods, simplex), Fourier/FFT, Romberg/Richardson extrapolation, approximation theory (Chebyshev, least-squares polynomials) and floating-point error analysis.

### Cited Findings
**Textbooks**
- Chapra & Canale, *Numerical Methods for Engineers*, 8th ed. (the most common engineering text): 8 parts, 32 chapters. (1) Modelling, computers, error analysis (round-off, truncation, Taylor). (2) Roots: bracketing, open methods, roots of polynomials. (3) Linear systems: Gauss elimination, LU and matrix inverse, special matrices and Gauss-Seidel. (4) **Optimisation**: 1-D unconstrained, multidimensional unconstrained, constrained. (5) Curve fitting: least-squares regression, interpolation, **Fourier approximation**. (6) Newton-Cotes, integration of equations, numerical differentiation. (7) ODEs: Runge-Kutta, **stiffness and multistep methods**, **boundary-value and eigenvalue problems**. (8) **PDEs**: finite differences for elliptic and parabolic equations, **finite-element method** — [McGraw Hill ISE listing](https://www.mheducation.co.uk/ise-numerical-methods-for-engineers-9781260571387-emea-group); [MH TOC page](https://highered.mheducation.com/sites/0073401064/information_center_view0/table_of_contents.html)
- Burden & Faires, *Numerical Analysis*, 10th ed. A UC Irvine Math 105A syllabus uses this edition and opens with 1.1 Review of Calculus, 1.2 Round-off Errors and Computer Arithmetic, 1.3 Algorithms and Convergence — [UCI 105A syllabus](https://www.math.uci.edu/sites/default/files/105A_suggested_syllabus_0.pdf). A 9th-ed TOC listing names parabolic and hyperbolic PDEs, an introduction to the finite-element method, and a survey of methods and software — [Miami Univ. bookstore TOC](https://campusstore.miamioh.edu/numerical-analysis-9th-burden-richard-l/bk/9780538733519). *Unverified, from the search tool's memory and not a fetched source:* the 10th-ed chapters are 1 Preliminaries and Error; 2 Equations in One Variable; 3 Interpolation; 4 Differentiation and Integration; 5 IVPs; 6 Direct Linear; 7 Iterative Matrix; 8 Approximation Theory; 9 Eigenvalues; 10 Nonlinear Systems; 11 BVPs; 12 PDEs. The book itself should be checked before relying on this.

**US**
- MIT 18.330 Intro to Numerical Analysis (Spring 2012, Demanet): series expansions, integration and differentiation, **interpolation and splines**, ODE IVPs, root finding and Newton, **boundary-value problems**, **Fourier series, Fourier transform and Shannon sampling**, least squares and **PCA**. PDEs are left to 18.303 — [MIT OCW 18.330 syllabus](https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/pages/syllabus)
- MIT 18.335J Intro to Numerical Methods (graduate): direct and **iterative methods** for linear systems, **eigenvalue decompositions, QR and SVD**, stability and accuracy, **IEEE floating point**, sparse and structured matrices. Optional extras: nonlinear optimisation, numerical integration, **FFTs** — [MIT OCW 18.335J syllabus](https://ocw.mit.edu/courses/18-335j-introduction-to-numerical-methods-spring-2019/pages/syllabus/)
- Stanford CME 108: **banded matrices**, least squares, **unconstrained optimisation**, polynomial interpolation, differentiation and integration, ODEs, truncation error, **numerical stability for time-dependent problems**. A 2019-20 syllabus also lists iterative methods and **nonlinear systems** — [Stanford Bulletin archive](https://archive-stanford-bulletin-21-22.coursedog.com/courses/1056641); [CME 108 syllabus PDF](https://cme108.stanford.edu/syllabus.pdf)

**UK**
- Oxford A7 Numerical Analysis 2025-26 (16 lectures): Lagrange interpolation; Gaussian elimination, LU, **QR**, least squares; **eigenvalues (Gershgorin, symmetric QR algorithm, polynomial root-finding via eigenvalues)**; **SVD and low-rank approximation**; best approximation in inner-product spaces, **orthogonal polynomials**, Gauss quadrature; forward and **backward Euler**, trapezium, **leapfrog**, Runge-Kutta; **linear multistep methods and Dahlquist's theorem** — [Oxford A7 2025-26](https://courses.maths.ox.ac.uk/course/info.php?id=6047)
- The Oxford A7 2024-25 learning outcomes include computing eigenvalues and eigenvectors and approximating functions with **piecewise polynomials (splines)**. The 2019-20 version has Newton-Cotes and a splines block — [Oxford A7 2024-25](https://courses.maths.ox.ac.uk/course/view.php?id=5502); [Oxford A7 2019-20](https://courses.maths.ox.ac.uk/course/view.php?id=3982)
- Cambridge IB Numerical Analysis has 12-16 lectures (lecturer A. Shadrin, 2021-23). The topic list was not retrieved — [Cambridge Part IB lecture list 2022-23](https://www.maths.cam.ac.uk/undergrad/files/lecturelist/2022-23/Part_IB.pdf)

**India (NPTEL)**
- One NPTEL syllabus lists "Eigen value computation, Power method". Another has Week 5 on the **power method, inverse power method and Gerschgorin's theorem**. Another covers IVPs, **predictor-corrector**, stability, RK, **linear BVPs by finite differences**. A further outline runs Week 4 eigenvalue problem through Week 8 **PDEs** — [NPTEL 111105164](https://archive.nptel.ac.in/content/syllabus_pdf/111105164.pdf); [NPTEL 111101165](https://archive.nptel.ac.in/content/syllabus_pdf/111101165.pdf); [NPTEL 112104318](https://archive.nptel.ac.in/content/syllabus_pdf/112104318.pdf). The search summary did not say which PDF holds which item. IIT Roorkee also runs a whole NPTEL course on "Numerical Methods: Finite difference approach" — [NPTEL 111107107](https://nptel.ac.in/courses/111107107)

**Latin America (Brazil, "Cálculo Numérico")**
- UFPel: **linear and cubic interpolating splines**; **Romberg** alongside Newton-Cotes and Gauss — [UFPel Cálculo Numérico](https://wp.ufpel.edu.br/matematicanoturno/grade-curricular-2/calculo-numerico/). UFABC lists spline interpolation — [UFABC plano de ensino](https://cds.cmcc.ufabc.edu.br/planoensino/files/20222_NAMCTB009-17SA.pdf). UFU covers discrete and continuous **least squares and nonlinear fitting** — [UFU MAT12](https://ime.ufu.br/system/files/conteudo/ma_fd_mat12.pdf). CEFET-MG covers simple linear regression and regression vs interpolation — [CEFET-MG](https://www.eng-computacao.timoteo.cefetmg.br/wp-content/uploads/sites/197/2025/10/PE_P07_07_MNCA0_2023.pdf). Across these syllabi, Romberg shows up less often than splines and least squares.

**Southeast Asia, Middle East, Africa, Europe**
- NUS MA2213 Numerical Analysis I (Singapore): computational errors, direct methods for linear systems, **interpolation and approximation**, numerical integration, MATLAB — [NUSMods API MA2213](https://api.nusmods.com/v2/2025-2026/modules/MA2213.json)
- South Asian University (SAARC) AM 102: **power method and inverse power method**, piecewise and **cubic spline** interpolation, **Romberg** — [SAU AM 102](https://sau.int/pdf/courses/MAM/AM_102_Numerical_Analysis_and_Methods.pdf). Atilim University (Turkey) MATH522: spline interpolation and Romberg — [Atilim ECTS](https://www.atilim.edu.tr/en/ects/site-courses/289/18843/detail)
- Middle East syllabi turned up (Philadelphia Univ. Jordan, USJ Lebanon, Imam Univ. Saudi Arabia, Univ. of Technology Iraq), but the Imam PDF could not be read. Their topics are not confirmed here — [Philadelphia Univ. syllabus](https://www.philadelphia.edu.jo/academics/fawad/uploads/250371-SYLLABUS-070724.pdf); [USJ syllabus](https://www.usj.edu.lb/esib/course-syllabus-2024/CE/020ANNGS1.pdf)

### Inferences
- Missing topics that **show up in nearly every syllabus regardless of region**: cubic splines, the power method and eigenvalues, nonlinear systems (Newton for systems), multistep/predictor-corrector methods, finite-difference BVPs, and finite-difference PDEs (heat and Laplace). These appear in Chapra, NPTEL, Oxford, MIT, Brazil and SAU alike.
- **Stronger in Western and graduate courses**: QR, SVD, floating point/IEEE, stability, Fourier/FFT, Dahlquist and stiffness, conjugate gradient.
- **Engineering (Chapra) track**: optimisation (golden section, Newton 1-D, gradient/steepest descent, constrained/LP), Fourier approximation, FEM intro.
- NETZ's existing set (Newton forward/backward, Gauss forward/backward, Weddle, Boole) leans towards the Indian university syllabus. Those methods are rare in US, UK and Brazilian syllabi, which favour splines, Romberg and Gauss quadrature.

### Gaps
- No full 10th-ed Burden & Faires TOC was fetched (the chapter list above is unverified). Cambridge IB topics were not retrieved. No African university syllabus (Lagos, Cairo, Nairobi) was found. Middle East topic lists were not extracted.

---

## Q2. Adjacent high-demand subjects students look up

### Takeaway
Adjacent topics draw far more interest than classical numerical methods. These include probability and statistics distributions, Taylor series, eigenvalues and determinants, Laplace transforms, Dijkstra and other graph algorithms, PCA/SVD, FFT, and ML maths (gradient descent, regression). Most top numerical-methods pages get 50-330k English Wikipedia views a year. Many adjacent topics get 200k-1M.

### Cited Findings (Wiki 12-mo views, Oct 2025-Sep 2026, en.wikipedia — [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/))

**Numerical methods NETZ already has (baseline)**
| Article | Views |
|---|---|
| Newton's method | 324,738 |
| Runge–Kutta methods | 233,850 |
| Least squares | 180,476 |
| Gaussian elimination | 171,943 |
| Euler method | 140,217 |
| Trapezoidal rule | 108,619 |
| Simpson's rule | 108,435 |
| LU decomposition | 94,636 |
| Lagrange polynomial | 94,162 |
| Gaussian quadrature | 82,934 |
| Gauss–Seidel | 53,344 |
| Bisection | 51,719 |
| Jacobi method | 38,919 |
| Numerical differentiation | 36,735 |
| Secant | 35,907 |
| Fixed-point iteration | 32,587 |
| Newton polynomial | 28,106 |
| Newton–Cotes | 23,342 |
| Regula falsi | 17,032 |

**Candidate numerical / scientific-computing topics (not in NETZ)**
| Article | Views |
|---|---|
| Monte Carlo method | 509,669 |
| Eigenvalues and eigenvectors | 383,764 |
| Principal component analysis | 380,484 |
| Singular value decomposition | 332,650 |
| Determinant | 313,170 |
| Fast Fourier transform | 297,507 |
| Fourier series | 269,805 |
| Gradient descent | 221,645 |
| Lagrange multiplier | 213,621 |
| Discrete Fourier transform | 208,826 |
| Floating-point arithmetic | 191,891 |
| Linear programming | 188,049 |
| Partial differential equation | 173,506 |
| Heat equation | 169,027 |
| Wave equation | 154,202 |
| Finite element method | 149,199 |
| Chebyshev polynomials | 145,796 |
| Cholesky decomposition | 137,447 |
| Gram–Schmidt process | 131,636 |
| Cramer's rule | 123,121 |
| Spline (mathematics) | 114,837 |
| Simplex algorithm | 113,863 |
| Laplace's equation | 107,280 |
| QR decomposition | 105,054 |
| Hungarian algorithm | 97,727 |
| Row echelon form | 86,346 |
| Levenberg–Marquardt | 78,802 |
| Verlet integration | 77,516 |
| Conjugate gradient | 76,013 |
| Padé approximant | 62,105 |
| Finite difference method | 61,025 |
| Horner's method | 56,417 |
| Nelder–Mead | 51,407 |
| Spline interpolation | 48,051 |
| Gauss–Newton | 47,568 |
| Transportation problem | 46,989 |
| Crank–Nicolson | 44,319 |
| Lanczos | 44,298 |
| Runge's phenomenon | 40,383 |
| Householder transformation | 39,485 |
| Monte Carlo integration | 38,569 |
| Gauss–Legendre quadrature | 33,373 |
| Brent's method | 32,711 |
| Stiff equation | 31,665 |
| Power iteration | 29,785 |
| Hermite interpolation | 29,764 |
| QR algorithm | 28,957 |
| Golden-section search | 25,805 |
| Linear multistep method | 25,788 |
| Richardson extrapolation | 25,047 |
| Quasi-Newton | 23,180 |
| Backward differentiation formula | 22,611 |
| Chebyshev nodes | 21,281 |
| Givens rotation | 20,277 |
| SOR | 19,734 |
| Arnoldi | 16,467 |
| Broyden's method | 13,240 |
| Shooting method | 12,982 |
| Romberg's method | 12,327 |
| Predictor–corrector | 9,922 |
| Muller's method | 8,224 |
| Adaptive quadrature | 5,143 |
| Rayleigh quotient iteration | 5,010 |
| Durand–Kerner | 4,906 |
| Bairstow's method | 2,852 |

The following titles came back with very low counts because they are probably redirects, so their real interest is undercounted and they are excluded: Inverse matrix (7.5k), GMRES (2.1k), BFGS (0.8k), Adams–Bashforth (0.1k).

**Adjacent subjects**
| Article | Views |
|---|---|
| Normal distribution | 989,168 |
| Poisson distribution | 694,121 |
| Taylor series | 642,848 |
| Bayes' theorem | 548,337 |
| Dijkstra's algorithm | 489,787 |
| Binomial distribution | 473,222 |
| Markov chain | 459,682 |
| Laplace transform | 372,605 |
| Big O notation | 363,337 |
| Matrix (mathematics) | 342,857 |
| Matrix multiplication | 315,717 |
| Derivative | 315,610 |
| A* search | 293,011 |
| Logistic regression | 285,562 |
| Chi-squared test | 282,117 |
| Integral | 280,786 |
| Linear regression | 279,980 |
| Student's t-test | 268,747 |
| L'Hôpital's rule | 230,979 |
| Sorting algorithm | 227,742 |
| K-means | 222,330 |
| Boolean algebra | 220,105 |
| Quicksort | 216,334 |
| Backpropagation | 205,134 |
| Dynamic programming | 173,669 |
| ANOVA | 170,489 |
| Integration by parts | 167,169 |
| Euclidean algorithm | 165,657 |
| BFS | 156,591 |
| Knapsack | 153,958 |
| Huffman coding | 151,723 |
| Merge sort | 148,568 |
| Topological sorting | 142,703 |
| DFS | 139,194 |
| Bubble sort | 133,826 |
| Limit | 115,272 |
| Mathematical induction | 114,710 |
| Binary search | 110,700 |
| Karnaugh map | 99,310 |
| Truth table | 85,138 |
| Bellman–Ford | 79,342 |
| Minimum spanning tree | 77,076 |
| Kruskal | 74,667 |
| Heapsort | 72,318 |
| Prim | 63,795 |
| Partial fractions | 63,434 |
| Floyd–Warshall | 62,835 |
| Longest common subsequence | 29,441 |

### Inferences
- Within numerical methods, the strongest missing topics by global interest are: **eigenvalues (384k)**, **SVD (333k)**, **determinant (313k)**, **FFT/DFT (298k + 209k)**, **gradient descent (222k)**, **floating point (192k)**, **linear programming/simplex (188k + 114k)**, **heat/wave/Laplace PDEs (169k / 154k / 107k)**, **Chebyshev (146k)**, **Cholesky (137k)**, **Gram–Schmidt/QR (132k + 105k)**, **splines (115k + 48k)**. Each is at or above NETZ's mid-tier existing pages (Simpson 108k, LU 95k).
- Classical "extension" methods are cheap to build but niche: Romberg 12k, shooting 13k, Broyden 13k, SOR 20k, power iteration 30k, predictor-corrector 10k. These probably earn their place through syllabus coverage (NPTEL, Chapra, Brazil) more than raw search interest.
- Adjacent subjects (distributions, Taylor series, Laplace transform, Dijkstra, regression, ANOVA) carry 2-5x the interest of most numerical methods. They also fit NETZ's step-table format well.

### Gaps
- Wikipedia views measure study interest, not "step-by-step solver" search intent. Indian university demand is under-represented on English Wikipedia relative to Google.

---

## Q3. Search-demand signals: keyword volumes and competitor traffic

### Takeaway
Free keyword data shows that solver-intent searches are dominated by general calculators: "math solver" gets 7.48M US searches a month, "graphing calculator" 1.83M, "factor calculator" 1.5M. Matrix tools are the strongest numerical-adjacent niche: "matrix calculator" 18.1k, "system of equations solver" 9.9k, "system of equations solver with work" 14.8k, "eigenvalue calculator" 6.6k and "rref calculator" 8.1k (all US monthly). Competitors that do well on matrix and linear-algebra tools draw heavy Spanish-speaking traffic. Algorithm visualisers (VisuAlgo, GfG) are led by Bangladesh and India.

### Cited Findings
- **matrixcalc.org** (Sep 2026): 287k visits. US 15.8%, **Spain 13.3%, Mexico 11.2%, Colombia 9.7%, Argentina 5.8%**. US keywords: "matrix calculator" 18,100/mo (#1); "system of equations solver" 9,900; "eigenvalue calculator" 6,600; "system of equations solver with work" 14,800; "eigenvalues and eigenvectors calculator" 1,600 — [Semrush matrixcalc.org](https://sv.semrush.com/website/matrixcalc.org/overview)
- **symbolab.com** (Sep 2026): 5.89M visits. US 46.1%, Bangladesh 5.6%, Mexico 3.7%, Canada 3.6%, Brazil 3.3%. Keywords: "math solver" 7.48M, "graphing calculator" 1.83M, "factor calculator" 1.5M, "gcf calculator" 1.22M, "slope calculator" 1.22M — [Semrush symbolab.com](https://www.semrush.com/website/symbolab.com/overview/). An earlier Semrush snapshot (Feb 2026) showed about 4.2M in Dec 2025-Jan 2026. Third-party country splits conflict (ToolMage US 56.5%; moge.ai US 27%) — [ToolMage](https://www.toolmage.com/es/tool/symbolab/); [moge.ai](https://moge.ai/de/product/symbolab)
- **emathhelp.net** (Sep 2026): 330k visits. US 56.5%, Bangladesh 7.8%, India 4.5%, Brazil 4.1%, Canada 3.3%. Ranks #1 for "rref calculator" (8,100/mo US) — [Semrush emathhelp.net](https://www.semrush.com/website/emathhelp.net/overview/)
- **planetcalc.com** (Sep 2026): 956k visits. US 26.1%, **Mexico 10.1%, Colombia 6.8%, Spain 4.9%, France 4.4%** — [Semrush planetcalc.com](https://www.semrush.com/website/planetcalc.com/overview/)
- **atozmath.com** (Sep 2026): 96.5k visits (Aug 156k). US 43.2%, **India 20.6%, Bangladesh 11.0%**, Canada 6.1%, UK 3.7%. Its top US keywords are unit conversions, not numerical methods — [Semrush atozmath.com](https://www.semrush.com/website/atozmath.com/overview/)
- **geeksforgeeks.org** (Sep 2026): 33.8M visits. **India 31.2%, Bangladesh 23.5%**, US 17.7%, UK 2.0%, Nepal 1.6% — [Semrush geeksforgeeks.org](https://www.semrush.com/website/geeksforgeeks.org/overview/)
- **visualgo.net** (Sep 2026): 283k visits. **Bangladesh 31.5%, India 14.6%**, US 7.8%, **Singapore 6.6%**, Brazil 4.1%. About 60% direct traffic and 23% from Google (Nov 2025) — [Semrush visualgo.net](https://www.semrush.com/website/visualgo.net/overview/); [Semrush IT visualgo](https://it.semrush.com/website/visualgo.net/overview)

### Inferences
- Solver/calculator traffic is US-led, but Latin America (Mexico, Colombia, Argentina, Brazil, Peru) and Spain make up a large second block, especially for matrix and linear-algebra tools. A **Spanish (and Portuguese) UI and URL slugs** are probably worth more than any single new method.
- "With work" / "step by step" variants ("system of equations solver with work" 14.8k > plain 9.9k) show that step-display intent is real. That suits NETZ's step tables.
- The highest-value linear-algebra calculators missing from NETZ are: determinant, inverse, RREF / row reduction, eigenvalues/eigenvectors, and Cramer's rule.

### Gaps
- No Google Trends data was retrieved: trends.google.com returned HTTP 429 to automated fetch. No free per-keyword volumes were found for "newton raphson calculator", "cubic spline calculator", "laplace transform calculator" or "dijkstra algorithm". Semrush public pages only show each site's top 5 keywords. These need checking by hand in Google Trends or Keyword Planner (owner task).

---

## Q4. Which countries / languages have the most numerical-methods interest?

### Takeaway
English dominates, about 5-10x any other language. Among non-English Wikipedias, **German, Russian, French, Japanese, Spanish, Chinese and Polish** have the most readers of numerical-methods pages. Competitor traffic points to the **US, India, Bangladesh, Mexico/Colombia/Spain and Brazil** as the main solver audiences. Bangladesh is unusually large for algorithm/DSA visualisers.

### Cited Findings (12-mo views Oct 2025-Sep 2026 per language edition, via the [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/) with interlanguage links from the [MediaWiki API](https://en.wikipedia.org/w/api.php))
| Article | en | de | ru | fr | ja | zh | es | pl | it | pt | vi | fa | uk | ar | tr | id |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Newton's method | 324,738 | 36,181 | 27,223 | 32,437 | 24,384 | 17,511 | 15,737 | 11,470 | 7,833 | 5,742 | 2,571 | 2,714 | 1,668 | 1,391 | 1,160 | 538 |
| Runge–Kutta | 233,850 | 22,194 | 29,605 | n/a | 18,356 | 7,982 | 12,139 | 5,675 | 5,922 | 3,702 | 1,326 | 1,242 | n/a | 411 | 757 | — |
| Gaussian elimination | 171,943 | 35,847 | 47,813 | — | 9,558 | 11,526 | 17,238 | 13,964 | 8,688 | 4,536 | 5,330 | 966 | 3,543 | 793 | 736 | 1,174 |
| Simpson's rule | 108,435 | 12,650 | n/a | 8,360 | 7,405 | 6,403 | 9,812 | 3,540 | 3,701 | 1,476 | — | 1,025 | 1,004 | 637 | 470 | 481 |

"—" means no linked article; "n/a" means the request failed.

- Competitor country shares are in Q3. Mexico, Colombia, Spain and Argentina together make up about 40% of matrixcalc.org traffic — [Semrush matrixcalc.org](https://sv.semrush.com/website/matrixcalc.org/overview). India and Bangladesh make up about 55% of GeeksforGeeks traffic — [Semrush GfG](https://www.semrush.com/website/geeksforgeeks.org/overview/)

### Inferences
- English-language pages cover the US, UK, India, Bangladesh, Pakistan, Nigeria, the Philippines and many Middle East and African students, since many universities there teach in English. Spanish is the clearest second language, judged from both Wikipedia and calculator traffic. German, Russian and French readers are many on Wikipedia but are probably served by local textbooks and tools.
- Low Arabic, Turkish, Indonesian and Vietnamese Wikipedia numbers probably reflect students reading English pages rather than low demand.

### Gaps
- **Google Trends regional interest for "numerical methods" / "numerical analysis" could not be pulled (HTTP 429).** The owner should check by hand: trends.google.com → "numerical methods", 5 years, worldwide → Interest by region. Wikipedia language editions are not countries (Spanish includes Spain and Latin America; English is global). Chinese-wiki numbers are understated because Wikipedia is blocked in mainland China.

---

## Q5. Recommended top additions (ranked by demand × fit for step tables and visuals)

### Takeaway
Do the linear-algebra and eigenvalue cluster first, which has the highest interest and calculator search volume. Then splines, nonlinear systems, FFT/DFT, optimisation (gradient descent, golden section, simplex), and PDE finite differences (heat/Laplace). After that come cheap syllabus-completers: Romberg, Adams/Milne predictor-corrector, shooting and finite-difference BVPs, SOR, Cholesky, QR. Adjacent wins (Laplace transform, Dijkstra, regression/ANOVA, Taylor series) can follow.

### Cited Findings (the basis for each rank is cited above; views = Wiki 12-mo en)
| # | Addition | Demand evidence | Syllabus evidence | Step-table / visual fit |
|---|---|---|---|---|
| 1 | Eigenvalues & eigenvectors (2×2/3×3 characteristic polynomial) + **Power method** (+ inverse power) | Eigen 384k; "eigenvalue calculator" 6.6k US/mo; power iteration 30k | NPTEL Week 5; Oxford A7; Burden ch. 9 (unverified); SAU | Excellent: iteration table xₖ, λₖ, error; 2-D vector animation |
| 2 | Determinant + matrix inverse + RREF / row reduction (Gauss-Jordan reuse) | Determinant 313k; "matrix calculator" 18.1k; "rref calculator" 8.1k; RREF 86k | Every linear-algebra course | Excellent: row-operation log |
| 3 | Cubic spline interpolation (natural/clamped) | 115k + 48k | MIT 18.330, Oxford, UFPel, UFABC, SAU, Atilim | Excellent: tridiagonal solve table + plotted pieces |
| 4 | Newton's method for nonlinear systems (2×2 Jacobian) | Newton 325k (shared) | Burden ch. 10 (unverified), Stanford CME108 | Good: Jacobian + Δx table per iteration |
| 5 | Cholesky decomposition | 137k | Chapra Part 3 "special matrices" | Excellent: L entries step by step |
| 6 | QR decomposition (Gram–Schmidt; optional Householder) | 132k + 105k + 39k | Oxford A7, MIT 18.335 | Good: orthogonalisation steps, vector picture |
| 7 | SVD (small matrices via AᵀA) | 333k | Oxford A7, MIT 18.335 | Medium: steps exist but long; good image-compression demo |
| 8 | DFT and FFT (N=4/8 butterfly) | 298k + 209k; Fourier series 270k | MIT 18.330, Chapra Part 5, MIT 18.335 | Good: butterfly diagram, table of Xₖ |
| 9 | Gradient descent (+ steepest descent / Newton optimisation) | 222k | Chapra ch. 14, Stanford CME108 | Excellent: contour plot path + iteration table; ML crossover |
| 10 | Golden-section search (+ parabolic interpolation) | 26k | Chapra ch. 13 | Excellent: bracket-shrinking table like bisection |
| 11 | Linear programming: graphical + **Simplex tableau** | 188k + 114k | Chapra ch. 15 | Excellent: tableau pivots |
| 12 | Heat equation: explicit FTCS + Crank–Nicolson | Heat 169k, CN 44k, PDE 174k | Chapra Part 8, NPTEL Week 8, Burden ch. 12 (unverified) | Good: grid table + heat-map over time |
| 13 | Laplace/Poisson equation (Liebmann / Gauss-Seidel on grid) | 107k | Chapra ch. 29 | Good: grid iteration table |
| 14 | Finite-difference BVP + Shooting method | FDM 61k; shooting 13k | Chapra ch. 27, MIT 18.330, NPTEL | Good: reuses RK + tridiagonal |
| 15 | Multistep: Adams–Bashforth–Moulton, Milne predictor–corrector | Multistep 26k; PC 10k | Oxford A7, Chapra ch. 26, NPTEL | Excellent: P/C columns table |
| 16 | Romberg integration / Richardson extrapolation | 12k + 25k | Chapra Part 6, UFPel, SAU, Atilim | Excellent: triangular Romberg table, cheap (reuses trapezoidal) |
| 17 | SOR (with ω slider) | 20k | Chapra Part 3, Burden ch. 7 (unverified) | Excellent: small change to Gauss-Seidel |
| 18 | Floating-point / IEEE-754 & error analysis | 192k | MIT 18.335, UCI 105A §1.2, Chapra ch. 3-4 | Good: bit-layout visual, round-off steps |
| 19 | Chebyshev approximation/nodes + Runge's phenomenon | 146k + 21k + 40k | Oxford (orthogonal polynomials), Burden ch. 8 (unverified) | Good: equispaced vs Chebyshev plot |
| 20 | Monte Carlo integration | MC method 510k; MC integration 39k | General | Good: dart-throw visual, running estimate |
| 21 | Conjugate gradient | 76k | MIT 18.335, Chapra | Medium: small SPD systems table |
| 22 | Laplace transform (+ inverse via partial fractions) — adjacent | 373k; partial fractions 63k | Engineering maths everywhere | Excellent: table lookup + partial fractions steps |
| 23 | Dijkstra (+ BFS/DFS, Prim/Kruskal) — adjacent DSA | 490k; BFS 157k; DFS 139k; Kruskal 75k; Prim 64k | DSA courses; VisuAlgo audience BD/IN | Excellent: classic distance table + graph animation |
| 24 | Linear regression with correlation + ANOVA — stats extension | 280k + 170k | Brazil CEFET-MG regression; stats courses | Excellent: sums table, ANOVA table |
| 25 | Taylor/Maclaurin series expansion (function approximation, not the ODE method) | 643k | Chapra ch. 4, MIT 18.330 | Good: term table + overlay plot |
| (opt.) | Hungarian / Transportation (operations research; popular in South Asia) | 98k + 47k | OR courses | Excellent tableaux |
| (opt.) | Horner / synthetic division, Muller, Bairstow (polynomial roots) | 56k / 8k / 3k | Chapra ch. 7 "roots of polynomials" | Good but low demand |

### Inferences
- **Quick wins that reuse NETZ engines**: Romberg (from trapezoidal), SOR (from Gauss-Seidel), Gauss-Jordan → inverse/RREF/determinant, Newton for systems (from Newton + Gauss elimination), predictor-corrector (from RK starter), shooting (from RK + secant), Liebmann (from Gauss-Seidel), golden section (bracket UI like bisection).
- **Largest audience upside**: the linear-algebra calculator cluster (items 1-2, 5-7) plus Laplace transform and Dijkstra. These have the biggest interest and an existing step-by-step search intent ("with work").
- **Lower priority despite syllabus presence**: adaptive quadrature (5k), Broyden (13k), Rayleigh quotient (5k), Durand-Kerner and Bairstow. These are niche.

### Gaps
- The ranking combines Wikipedia views with syllabus frequency. No true global Google search volumes were available per method. Before final build order, the owner should check the top 10 in Google Trends or Keyword Planner, in English and Spanish.
