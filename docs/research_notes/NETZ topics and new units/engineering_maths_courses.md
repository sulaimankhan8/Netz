# Engineering maths courses at Indian universities: topic and method lists

Researched 2026-11-03 for NETZ. The goal is one NETZ page per topic or method.

**Legend:** **[C]** means a solver can show the working step by step. **[P]** means the work is partly computable: the steps follow a fixed recipe, but they need a symbolic or structural check (proof-style verification, a sketch, or a classification). **[T]** means the topic is theoretical or definition-only, and the page would explain it rather than solve it.

**How reliable the sources are.** Rows marked "verbatim" were read from the official PDF or from a college copy of it. Rows marked "mirror" were read from StuCor, Padeepz, aplustopper, inspirenignite, vtucrack or career-shiksha. Rows marked "inferred" come from course outcomes, question banks or unit titles only. Their sub-topics are my reconstruction and still need checking.

---

## 1. Anna University (Regulation 2021)

### MA3151 Matrices and Calculus (Semester 1, all branches)
Source: mirror, https://padeepz.net/ma3151-syllabus-matrix-and-calculus-regulation-2021-anna-university/ . A second copy is at https://www.aplustopper.com/ma3151-matrices-and-calculus-syllabus/
- **U1 Matrices:** eigenvalues and eigenvectors [C], properties [T], Cayley–Hamilton theorem (verify it, then use it for the inverse and for powers of a matrix) [C], orthogonal diagonalisation [C], quadratic form → canonical form by orthogonal transformation [C], nature of a quadratic form [C], elastic membrane (application) [C]
- **U2 Differential calculus:** functions, limits and continuity [P], differentiation rules (sum, product, quotient, chain) [C], implicit differentiation [C], logarithmic differentiation [C], maxima and minima of one variable [C]
- **U3 Functions of several variables:** partial derivatives [C], total derivative [C], Euler's theorem for homogeneous functions [C], Jacobians [C], partial differentiation of implicit functions [C], Taylor series in two variables [C], maxima and minima of two variables [C], Lagrange multipliers [C]
- **U4 Integral calculus:** substitution [C], integration by parts [C], trigonometric integrals and trigonometric substitution [C], partial fractions [C], irrational functions [C], improper integrals [C], hydrostatic force [C], moments and centre of mass [C]
- **U5 Multiple integrals:** double integrals [C], change of order [C], polar coordinates [C], area [C], triple integrals and volume [C], change of variables [C], centre of mass and moment of inertia [C]

### MA3251 Statistics and Numerical Methods (Semester 2)
Source: mirror, https://stucor.in/syllabus/s-ma3251/
- **U1 Testing of hypotheses:** sampling distributions [T]. Large-sample z-tests for a mean, a proportion and a difference of means [C]. Small-sample t-tests [C]. F-test for variances [C]. χ² goodness of fit [C]. χ² independence (contingency table) [C].
- **U2 Design of experiments:** one-way and two-way classification [C], completely randomised design (CRD) [C], randomised block design (RBD) [C], Latin square [C], 2² factorial [C]
- **U3 Equations and eigenvalue problems:** fixed-point iteration [C], Newton–Raphson [C], Gauss elimination with pivoting [C], Gauss–Jordan [C], Gauss–Jacobi [C], Gauss–Seidel [C], power method [C], Jacobi method for symmetric matrices [C]
- **U4 Interpolation, differentiation and integration:** Lagrange [C], Newton divided difference [C], Newton forward and backward [C], derivatives from an interpolating polynomial [C], trapezoidal rule [C], Simpson 1/3 [C], double integrals by the trapezoidal and Simpson rules [C]
- **U5 Numerical ODE:** Taylor series [C], Euler [C], modified Euler [C], fourth-order Runge–Kutta (RK4) [C], Milne predictor–corrector [C], Adams–Bashforth [C]

### MA3351 Transforms and Partial Differential Equations (Semester 3; mechanical, civil, EEE and others)
Source: mirror, https://stucor.in/syllabus/s-ma3351/
- **U1 PDE:** forming PDEs by eliminating constants and functions [C], singular integral [C], standard first-order types (Clairaut and the others) [C], Lagrange linear equation Pp+Qq=R [C], homogeneous and non-homogeneous linear PDEs with constant coefficients (CF and PI) [C]
- **U2 Fourier series:** Dirichlet conditions [T], general Fourier series [C], odd and even functions [C], half-range sine and cosine series [C], complex form [C], Parseval's identity [C], harmonic analysis [C]
- **U3 Applications of PDE:** classification [C], separation of variables [P], 1-D wave equation [C], 1-D heat equation [C], 2-D steady-state heat equation [C]
- **U4 Fourier transform:** Fourier integral theorem [T], Fourier transform pair [C], sine and cosine transforms [C], properties [T], convolution theorem [C], Parseval's identity [C]
- **U5 Z-transform:** Z-transform and its properties [C], inverse by partial fractions [C], inverse by residues [C], initial and final value theorems [C], convolution [C], forming a difference equation [C], solving difference equations by Z-transform [C]

### MA3354 Discrete Mathematics (Semester 3; CSE, IT, AI&DS)
Source: mirror, https://stucor.in/syllabus/s-ma3354/
- **U1 Logic and proofs:** propositional logic and truth tables [C], equivalences (normal forms, tautologies) [C], predicates and quantifiers [P], nested quantifiers [P], rules of inference [P], proof methods [T]
- **U2 Combinatorics:** induction and strong induction [P], well-ordering [T], counting [C], pigeonhole principle [P], permutations and combinations [C], recurrence relations [C], solving linear recurrences [C], generating functions [C], inclusion–exclusion [C]
- **U3 Graphs:** graph models and terminology [T], special graphs [T], adjacency and incidence matrices [C], isomorphism [P], connectivity [C], Euler and Hamilton paths [C/P]
- **U4 Algebraic structures:** semigroups and monoids [P], groups and subgroups [P], homomorphisms [P], cosets and normal subgroups [P], Lagrange's theorem [T], rings and fields [T]
- **U5 Lattices and Boolean algebra:** posets and Hasse diagrams [C], lattices [P], sublattices [P], special lattices [T], Boolean algebra and its homomorphisms [P]

### MA3391 Probability and Statistics (Semesters 3–4; AI&DS, CSBS and others)
Source: mirror, https://www.aplustopper.com/ma3391-probability-and-statistics-syllabus/
- **U1 Probability and random variables:** axioms [T], conditional probability [C], Bayes' theorem [C], discrete and continuous random variables [C], moments and moment generating function (MGF) [C], binomial, Poisson, geometric, uniform, exponential and normal distributions [C], functions of a random variable [C]
- **U2 Two-dimensional random variables:** joint, marginal and conditional distributions [C], covariance [C], correlation [C], linear regression [C], transformation of random variables [C], central limit theorem [C]
- **U3 Estimation:** properties of estimators [T], method of moments [C], maximum likelihood [C], interval estimation for means, differences, variances and variance ratios [C]
- **U4 Non-parametric tests:** sign test [C], signed-rank test [C], rank-sum test [C], U-test [C], H-test [C], runs test (randomness) [C], Kolmogorov test [C]
- **U5 Statistical quality control:** X̄ and R charts [C], p, np and c charts [C], tolerance limits [C], acceptance sampling [C]

---

## 2. VTU (2022 scheme; 2021 scheme for the 21MAT courses)

### BMATS101 Mathematics-I for CSE stream (2022 scheme)
Source: mirror, https://vtucrack.odoo.com/mathematics-i-bmats101 . Module 1 checked against the AJIET notes: https://ajiet.edu.in/img/basic-science/BMATS101%20Notes%20AJIET.pdf
- **M1 Calculus:** polar curves [P], angle between radius vector and tangent [C], angle between two curves [C], pedal equations [C], curvature and radius of curvature in Cartesian, parametric, polar and pedal forms [C]
- **M2 Series expansion and multivariable calculus:** Taylor and Maclaurin series in one variable [C], indeterminate forms by L'Hospital's rule [C], partial differentiation [C], total derivative and composite functions [C], Jacobian [C], maxima and minima of two variables [C]
- **M3 First-order and non-linear ODE:** linear [C], Bernoulli [C], exact [C], reducible to exact (integrating factors) [C], orthogonal trajectories [C], L-R and C-R circuits [C], Clairaut's equation with general and singular solutions [C], equations solvable for p, x or y [C]
- **M4 Modular arithmetic:** congruences [C], linear congruences [C], remainder theorem [C], Euler's theorem (with φ) [C], Wilson's theorem [C], Fermat's little theorem [C], RSA [C]. Chinese Remainder Theorem appears in question banks [C].
- **M5 Linear algebra:** row operations and rank [C], consistency [C], Gauss elimination [C], Gauss–Jordan [C], Gauss–Seidel [C], eigenvalues and eigenvectors [C], Rayleigh power method [C]
- Other streams' first-semester maths papers (BMATE101, BMATM101, BMATC101) share M1/M2/M5 and swap M4 for other topics. Not read.

### BMATS201 Mathematics-II for CSE stream (2022 scheme)
Source: verbatim from a college copy, https://old.atme.edu.in/wp-content/uploads/2024/04/BMATS201-Course-Module.pdf
- **M1 Integral calculus:** double and triple integrals [C], change of order [C], polar coordinates [C], area and volume [C], beta and gamma functions with their relation [C]
- **M2 Vector calculus:** gradient [C], directional derivative [C], divergence and curl [C], solenoidal and irrotational fields [C], curvilinear coordinates with scale factors (cylindrical and spherical) [C], orthogonality of coordinate systems [C]. Self-study: volume and line integrals [C].
- **M3 Vector spaces and linear transformations:** subspace [P], span [C], linear dependence and independence [C], basis and dimension [C], matrix of a linear transformation [C], change of coordinates [C], rank–nullity [C], inner product and orthogonality [C], rotation, reflection and projection [C]
- **M4 Numerical methods 1:** Regula falsi [C], Newton–Raphson [C], finite differences [C], Newton forward and backward [C], divided differences [C], Lagrange [C], trapezoidal [C], Simpson 1/3 and 3/8 [C]. Self-study: bisection [C], inverse interpolation [C].
- **M5 Numerical methods 2:** Taylor series [C], modified Euler [C], RK4 [C], Milne predictor–corrector [C]. Self-study: Adams–Bashforth [C].
- **Lab (Python/SageMath):** the same methods, plus Ramanujan's method for roots [C].

### 21MAT11 Calculus and Differential Equations (2021 scheme)
Source: mirror, https://www.inspirenignite.com/vtu/21mat11-calculus-differential-equations-syllabus-physics-group-2021-scheme/
- **M1:** polar curves [P], angle between curves [C], pedal equations [C], curvature in Cartesian, parametric, polar and pedal forms [C]. Self-study: evolutes [C].
- **M2:** Taylor and Maclaurin series [C], L'Hospital's rule [C], partial and total derivatives [C], composite functions [C], Jacobians [C], maxima and minima [C]. Self-study: Euler's theorem [C], Lagrange multipliers [C].
- **M3** (inferred; the mirror page was blank): linear and Bernoulli equations [C], exact and reducible to exact [C], orthogonal trajectories [C], Newton's law of cooling [C], non-linear ODEs and Clairaut [C]
- **M4 Higher-order ODE:** constant coefficients with the inverse operator [C], variation of parameters [C], Cauchy and Legendre homogeneous equations [C]
- **M5 Linear algebra:** rank [C], consistency [C], Gauss elimination [C], Gauss–Jordan [C], Gauss–Seidel [C], eigenvalues [C], power method [C]. Self-study: Gauss–Jacobi [C], inverse by Cayley–Hamilton [C].

### 21MAT21 Advanced Calculus and Numerical Methods (2021 scheme)
Source: mirror, https://www.inspirenignite.com/vtu/21mat21-advanced-calculus-and-numerical-methods-syllabus-physics-group-2021-scheme/
- **M1 Integral calculus:** double and triple integrals [C], change of order [C], polar coordinates [C], area and volume [C], beta and gamma [C]. Self-study: centre of gravity [C].
- **M2 Vector calculus:** gradient, divergence and curl [C], solenoidal and irrotational fields [C], line and surface integrals [C], work and flux [C], Green's theorem [C], Stokes' theorem [C]. Self-study: Gauss divergence theorem [C].
- **M3** (not shown on the mirror; inferred from model papers): PDEs, covering formation [C], direct integration [C], Lagrange linear equation [C] and the separation-of-variables derivation of the 1-D heat and wave equations [P]. Needs checking.
- **M4 Numerical methods 1:** Regula falsi [C], Newton–Raphson [C], finite differences [C], Newton forward and backward [C], divided differences [C], Lagrange [C], Simpson 1/3 and 3/8 [C]. Self-study: bisection [C], Weddle's rule [C].
- **M5 Numerical methods 2:** Taylor series [C], modified Euler [C], RK4 [C], Milne [C]. Self-study: Adams–Bashforth [C].

### BCS301 Mathematics for Computer Science (Semester 3, 2022 scheme; CSE, ISE, AI&ML)
Source: mirror, https://vtucrack.odoo.com/mathematics-for-computer-science-bcs301
- **M1 Probability distributions:** discrete and continuous random variables [C], pmf and pdf [C], expectation and variance [C], binomial, Poisson, normal and exponential distributions [C]
- **M2 Joint distributions and Markov chains:** joint pmf [C], covariance and correlation [C], probability vectors and stochastic matrices [C], regular chains [C], higher transition probabilities [C], stationary distribution [C], absorbing states [C]
- **M3 Statistical inference 1:** sampling distribution and standard error [C], hypothesis testing and levels of significance [T], large-sample tests (attributes, comparison of samples) [C], confidence limits [C]
- **M4 Statistical inference 2:** central limit theorem [C], confidence limits for a mean [C], t-test for two small samples [C], χ² goodness of fit [C], F-distribution [C]
- **M5 Design of experiments and ANOVA:** CRD [C], RBD [C], one-way and two-way ANOVA [C], Latin square [C], analysis of covariance [C]

### BMATE301 Mathematics-III for EC stream (branch equivalent; SJCIT copy of the 2024 scheme)
Source: verbatim from a college copy, https://ece.sjcit.ac.in/wp-content/uploads/2026/09/ECE-3rd-Sem-syllabus-2024-scheme.pdf . The 2022-scheme code is BMATEC301, and its module text was not found.
- **M1 Curve fitting, correlation and regression:** least squares for a line, a parabola and y=ax^b [C], Karl Pearson correlation [C], rank correlation [C], regression lines [C]
- **M2 Higher-order ODE:** constant coefficients with the inverse operator [C], Cauchy–Euler [C], RLC circuits [C]. Self-study: variation of parameters [C], Legendre equations [C].
- **M3 Fourier series:** period 2π and arbitrary period [C], half-range series [C], practical harmonic analysis [C]
- **M4 Fourier transform:** infinite Fourier transform [C], sine and cosine transforms with their inverses [C], DFT [C]. Self-study: FFT [C].
- **M5 Z-transform:** standard sequences [C], properties (shifting, multiplication by n) [C], initial and final value theorems [C], inverse Z-transform [C], difference equations [C]

---

## 3. RGPV (AICTE-based scheme, in use since 2018 and still current)

### BT-102 Mathematics-I
Unit titles from a mirror, https://career-shiksha.com/?p=196 . The sub-topics are inferred from the AICTE model curriculum and a Scribd preview (https://www.scribd.com/document/545551867/Rgpv-Syllabus-Aicte-Bt-102-Mathematics-1), which confirms Rolle's theorem, Taylor, definite integral as a limit of a sum, and vector spaces.
- **U1 Calculus-I:** Rolle's theorem and mean value theorems [P], Taylor and Maclaurin series in one variable [C], Taylor series in two variables [C], partial differentiation [C], maxima and minima [C], Lagrange multipliers [C]
- **U2 Calculus-II:** definite integral as a limit of a sum [C], beta and gamma [C], double and triple integrals [C], change of order [C], Cartesian→polar change of variables [C], area and volume [C]
- **U3 Sequences and series:** convergence tests [C], power series [C], series for exponential, trigonometric and log functions [C], Fourier series and half-range series [C]
- **U4 Vector spaces:** subspace [P], linear combination [C], dependence and independence [C], basis and dimension [C], linear transformations [C], range and kernel [C], rank–nullity [C]
- **U5 Matrices:** rank [C], consistency [C], eigenvalues and eigenvectors [C], Cayley–Hamilton [C], diagonalisation [C]

### BT-202 Mathematics-II
Unit titles from a mirror, https://career-shiksha.com/post/important-rgpv-question-bt-202-mathematics-ii-1st-year/ . The sub-topics are inferred from the AICTE model curriculum and an RGPV-aligned textbook table of contents.
- **U1 ODE-I:** exact [C], linear [C], Bernoulli [C], equations not of first degree (solvable for p, y or x; Clairaut) [C]
- **U2 ODE-II:** second-order linear equations [C], variation of parameters [C], Cauchy–Euler [C], power-series solutions [C], Legendre polynomials [C], Bessel functions of the first kind [P]
- **U3 PDE:** formation [C], Lagrange linear equation [C], non-linear first-order PDEs [C], higher-order linear PDEs with constant coefficients [C], wave and heat equations [C]
- **U4 Complex variable:** analytic functions and Cauchy–Riemann (CR) equations [C], harmonic functions and conjugates [C], Cauchy integral theorem and formula [C], Taylor and Laurent series [C], singularities [C], residue theorem [C]
- **U5 Vector calculus:** gradient, divergence and curl [C], line, surface and volume integrals [C], Green's theorem [C], Stokes' theorem [C], Gauss divergence theorem [C]

### BT-401 Mathematics-III (Semester 4; CSE, IT, EC and others)
Source: mirror, https://career-shiksha.com/post/syllabus-of-btech-4th-sem-cse-rgpv
- **U1:** bisection [C], Newton–Raphson [C], Regula falsi [C], finite-difference operators [C], Newton forward and backward [C], divided differences [C], Lagrange [C]
- **U2:** numerical differentiation [C], trapezoidal and Simpson 1/3 and 3/8 [C], Gauss elimination [C], Gauss–Jordan [C], Crout's method (LU) [C], Jacobi [C], Gauss–Seidel [C], relaxation [C]
- **U3:** Taylor series [C], Euler and modified Euler [C], RK4 for first- and second-order equations [C], Milne and Adams predictor–corrector [C], finite-difference solution of the Laplace and Poisson equations [C], Bender–Schmidt [C], Crank–Nicolson [C], explicit method for the wave equation [C]
- **U4 Transforms:** Laplace transform and properties [C], periodic functions [C], inverse Laplace transform [C], convolution [C], evaluating integrals [C], solving ODEs [C], Fourier transform [C]
- **U5 Probability:** pmf and pdf [C], binomial, Poisson, normal and exponential distributions [C]

---

## 4. GTU (official PDFs from syllabus.gtu.ac.in, read verbatim)

### 3110014 Mathematics-1
Source: https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/Syallbus/3110014.pdf
- **1:** L'Hospital's rule [C]
- **2:** improper integrals and their convergence [C], beta and gamma [C]
- **3:** volume by cross-sections [C], arc length [C], surface area of revolution [C]
- **4:** sequences (sandwich theorem, monotone sequences) [P]. Series tests: nth-term, geometric and telescoping series, integral, p-series, comparison, limit comparison, ratio, Raabe, root, alternating series, absolute and conditional convergence [C]. Power series and radius of convergence [C], Taylor and Maclaurin series [C].
- **5:** Fourier series for period 2π and 2L [C], even and odd functions [C], half-range series [C]
- **6:** limits in several variables and showing a limit does not exist [C], partial derivatives [C], chain rule [C], implicit differentiation [C], gradient and directional derivative [C], tangent plane and normal line [C], total differential [C], local extrema [C], Lagrange multipliers [C]
- **7:** double integrals over rectangles and general regions [C], change of order [C], polar coordinates [C], area [C], triple integrals in Cartesian, cylindrical and spherical coordinates [C], Jacobian substitution [C]
- **8:** row-echelon and RREF form [C], rank [C], Gauss–Jordan inverse [C], Gauss elimination [C], Gauss–Jordan solution of systems [C], eigenvalues [C], Cayley–Hamilton [C], diagonalisation [C]

### 3110015 Mathematics-2
Source: https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/Syallbus/3110015.pdf . The 2018 syllabus covers vector calculus, Laplace transforms and ODEs. Its linear-algebra content sits in 3110014.
- **1 Vector calculus:** parametrised curves and arc length [C], line integrals [C], work, circulation and flux [C], path independence and potential function [C], conservative-field test [C], exact differentials [C], divergence and curl [C], Green's theorem in the plane [C]
- **2 Laplace transform:** linearity [C], s-shifting [C], transforms of derivatives and integrals [C], unit step function and t-shifting [C], periodic functions [C], Dirac delta [C], convolution [C], integral equations [C], differentiating and integrating transforms [C], ODEs (including variable coefficients) [C], systems of ODEs [C]
- **3:** Fourier integral, cosine integral and sine integral [C]
- **4 First-order ODE:** exact [C], linear [C], Bernoulli [C], equations solvable for p, y or x [C], Clairaut [C]
- **5 Higher-order ODE:** homogeneous constant-coefficient equations [C], Euler–Cauchy [C], Wronskian [C], undetermined coefficients [C], variation of parameters [C]
- **6 Series solutions:** power-series method [C], Legendre equation and polynomials [C], Frobenius method [C], Bessel equation [P]

### 3130005 Complex Variables and Partial Differential Equations
Source: https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/Syallbus/3130005.pdf
- **1:** polar form, powers and roots [C], CR equations [C], analytic functions [C], harmonic conjugate [C], elementary complex functions [C], conformal mapping [P], Möbius transformations [C]
- **2:** contour integrals [C], Cauchy–Goursat theorem and Cauchy integral formula [C], Liouville and maximum-modulus theorems [T], complex series and power series [C], Taylor and Maclaurin series [C]
- **3:** Laurent series [C], zeros and singularities [C], residues [C], residue theorem [C], real integrals by residues [C]
- **4:** first-order linear and non-linear PDEs [C], Charpit's method [C]
- **5:** higher-order linear PDEs (CF and PI) [C], separation of variables [C], classification [C], heat, wave and Laplace equations [C]

### 2140706 Numerical and Statistical Methods for Computer Engineering (old GTU code, as named in the brief)
Source: https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/Syallbus/2140706.pdf
- **1:** errors, significant figures, round-off and truncation error, error propagation [C]
- **2:** bisection [C], Regula falsi [C], Newton–Raphson [C], secant [C], successive approximation [C], Budan's theorem [P], Bairstow's method [C]
- **3:** Gauss elimination and pivoting [C], matrix inversion [C], Gauss–Seidel [C], ill-conditioned systems [P]
- **4:** least-squares linear and polynomial regression [C], Lagrange interpolation [C], spline interpolation [C]
- **5:** Newton–Cotes [C], trapezoidal and Simpson rules [C]
- **6:** Euler [C], Runge–Kutta [C], predictor–corrector [C], boundary value problems (shooting/finite difference) [C]
- **7:** frequency distributions [C], moments [C], correlation and regression [C], trend and moving average [C], seasonal effects [C], mean squared error (MSE) [C], non-parametric tests [C], resampling [P], confidence intervals [C]

---

## 5. AKTU (2022 scheme onwards)

### BAS103 Engineering Mathematics-I
Inferred. Unit titles come from a question bank (https://www.scribd.com/document/806760855/Question-Bank-BAS-103) and the official course outcomes (https://mail.mitmeerut.ac.in/media_image/course_outcome/2025_01_11_04_00_50_8448.pdf). The sub-topics are from a search snippet and the AKTU textbook pattern.
- **U1 Matrices:** inverse by elementary transformations [C], rank in echelon and normal form [C], linear dependence [C], consistency [C], eigenvalues [C], Cayley–Hamilton [C], diagonalisation [C]. Possibly also Hermitian and unitary matrices [P].
- **U2 Differential calculus I:** successive differentiation [C], Leibniz theorem [C], partial derivatives [C], Euler's theorem [C], total derivative [C], curve tracing in Cartesian and polar forms [P]
- **U3 Differential calculus II:** Taylor and Maclaurin series [C], maxima and minima [C], Lagrange multipliers [C], Jacobians [C], errors and approximation [C]
- **U4 Multivariable calculus I:** double and triple integrals [C], change of order [C], change of variables [C], area and volume [C], centre of mass and centre of gravity [C], beta and gamma [C], Dirichlet integral [C]
- **U5 Vector calculus:** gradient, divergence, curl and directional derivative [C], line, surface and volume integrals [C], Green's theorem [C], Stokes' theorem [C], Gauss divergence theorem [C]

### BAS203 Engineering Mathematics-II
Inferred from the course outcomes in the same MIT Meerut PDF.
- **U1 Higher-order linear ODE:** constant coefficients [C], Cauchy–Euler [C], variation of parameters [C], simultaneous equations [C], (likely) normal form and change of independent variable [C]
- **U2 Laplace transform:** transforms [C], unit step and periodic functions [C], convolution [C], inverse transform [C], solving ODEs [C]
- **U3 Sequences and series:** convergence tests [C], Fourier series and half-range series [C]
- **U4 Complex differentiation:** analytic functions and CR equations [C], harmonic functions and Milne–Thomson method [C], conformal and bilinear mapping [C]
- **U5 Complex integration:** Cauchy theorem and integral formula [C], Taylor and Laurent series [C], residues [C], real integrals [C]

### KAS302/402 or BAS303/403 Mathematics-IV (PDE, Probability and Statistics)
Source: mirror, https://www.inspirenignite.com/up/maths-iv-cse-4th-sem-syllabus-for-aktu-b-tech-2019-20-scheme . Module III and the BAS code come from a Scribd copy (https://www.scribd.com/document/747804106/a).
- **M1 PDE:** formation [C], Lagrange's method [C], Charpit's method [C], Cauchy characteristics [C], higher-order linear PDEs with constant coefficients [C], equations reducible to constant coefficients [C]
- **M2 Applications of PDE:** classification [C], separation of variables [C], wave and heat equations in up to 2-D [C], Laplace equation [C], transmission lines [C]
- **M3 Statistics I:** moments [C], skewness and kurtosis [C], MGF [C], curve fitting (line, parabola, exponential) [C], correlation and rank correlation [C], regression [C]
- **M4 Probability:** addition and multiplication laws [C], conditional probability [C], Bayes [C], random variables [C], expectation and variance [C], binomial, Poisson and normal distributions [C]
- **M5 Statistics II:** large and small samples [C], t-test [C], F-test [C], χ² [C], one-way ANOVA [C], X̄ and R charts [C], p, np and c charts [C]

---

## 6. Mumbai University (Rev-2019 "C" scheme. First year moved to NEP 2024; that version was not read.)

### FEC101 Engineering Mathematics-I
Source: verbatim from a college copy of the MU PDF, https://www.sfit.ac.in/pdf/FE/Syllabus/SEM%201/EM%20I.pdf
- **1 Complex numbers:** De Moivre's theorem [C], expanding sinⁿθ and cosⁿθ [C], powers and roots [C]
- **2 Hyperbolic functions and complex logarithms:** circular and hyperbolic functions and their inverses [C], separating real and imaginary parts [C], logarithm of a complex number [C]
- **3 Partial differentiation:** composite functions [C], Euler's theorem with its deductions [C]
- **4 Applications:** maxima and minima [C], Lagrange multipliers with one constraint [C], nth derivatives [C], Leibniz theorem [C]. Self-study: Jacobians [C].
- **5 Matrices:** types (Hermitian, unitary, orthogonal) [P], rank in echelon form, normal form and PAQ form [C], homogeneous and non-homogeneous systems [C]
- **6 Numerical methods and series:** Newton–Raphson [C], Regula falsi [C], Gauss–Jacobi [C], Gauss–Seidel [C], Maclaurin series of standard functions [C]. Self-study: L'Hospital's rule [C], Gauss elimination and Gauss–Jordan [C].

### FEC201 Engineering Mathematics-II
Source: verbatim, https://www.sfit.ac.in/pdf/FE/Syllabus/SEM%202/EM%20II.pdf
- **1:** exact equations and integrating factors [C], linear equations [C], reducible to linear [C], Bernoulli [C]
- **2:** constant-coefficient higher-order equations with CF and PI for the standard forms of X [C], variation of parameters [C]. Self-study: Cauchy and Legendre equations [C].
- **3:** beta and gamma [C], differentiation under the integral sign [C], rectification in Cartesian and polar forms [C]
- **4–5:** double integrals in Cartesian and polar coordinates [C], change of order [C], integrals over a region [C], change to polar [C], area [C], triple integrals in Cartesian, cylindrical and spherical coordinates [C]
- **6:** Euler [C], modified Euler [C], RK4 [C], trapezoidal [C], Simpson 1/3 and 3/8 [C]

### ITC301 Engineering Mathematics-III (IT branch; CSC301 for Computer is similar)
Source: verbatim from a college copy, https://www.xavier.ac.in/pdf/IT/Syllabus/SE_IT_Final_Syllabus_R2019.pdf
- **1 Laplace transform:** standard functions [C], shifting theorems, change of scale, multiplication and division by t [C], derivatives and integrals [C], evaluating improper integrals [C]. Self-study: periodic functions, step and delta functions [C].
- **2 Inverse Laplace transform:** standard forms [C], partial fractions [C], convolution [C]. Self-study: solving ODEs [C].
- **3 Fourier series:** period 2π and 2l [C], even and odd functions [C], half-range series [C], Parseval's identity [C]
- **4 Complex variables:** analytic functions [C], CR equations [C], Milne–Thomson method [C], harmonic conjugate and orthogonal trajectories [C]. Self-study: bilinear mapping, cross-ratio and fixed points [C].
- **5 Statistics:** Karl Pearson correlation [C], Spearman rank correlation (with repeated ranks) [C], regression lines [C], fitting first- and second-degree curves [C]
- **6 Probability:** conditional probability [C], total probability and Bayes [C], pmf and pdf [C], expectation, variance, MGF and moments up to fourth order [C]

### ITC401 Engineering Mathematics-IV (IT branch)
Source: as above.
- **1 Linear algebra:** characteristic equation, eigenvalues and eigenvectors [C], Cayley–Hamilton with reduction of polynomials [C], similarity and diagonalisability [C]. Self-study: derogatory matrices [C], functions of a matrix [C], quadratic forms [C].
- **2 Complex integration:** line integrals [C], Cauchy theorem and integral formula [C], Taylor and Laurent series [C], singularities and residues [C], residue theorem [C]
- **3 Z-transform:** region of convergence (ROC) [C], standard functions [C], properties [C], convolution [C], inverse by partial fractions and by convolution [C]
- **4 Distributions and sampling:** Poisson and normal [C], t-test for a mean and for two means [C], χ² goodness of fit and independence [C]
- **5 Linear programming (LPP):** standard form [C], simplex method [C], Big-M method [C], duality and dual simplex [C]
- **6 Non-linear programming (NLPP):** Lagrange multipliers with one or two equality constraints [C], Kuhn–Tucker conditions [C]

---

## 7. SPPU (first year on the 2024 pattern; EM-III on the 2019 pattern)

### BSC-101-BES Engineering Mathematics-I (2024 pattern)
Source: verbatim from a college copy of the SPPU PDF, https://www.avcoe.org/pdf/syllbus/electrical/FE%202024%20Pattern%20Syllabus%20-16%20July%202024_compressed.pdf
- **U1:** Rolle's theorem and mean value theorems [P], Taylor and Maclaurin series [C], L'Hospital's rule [C], full-range and half-range Fourier series [C], harmonic analysis [C]
- **U2:** limits, continuity and partial derivatives [C], Euler's theorem [C], composite functions and total derivative [C], change of variables [C]
- **U3:** Jacobian [C], errors and approximations [C], maxima and minima [C], Lagrange multipliers [C]
- **U4:** rank [C], linear systems [C], linear dependence [C], linear and orthogonal transformations [C]
- **U5:** eigenvalues [C], Cayley–Hamilton [C], diagonalisation [C], quadratic forms → canonical form [C]

### BSC-151-BES Engineering Mathematics-II (2024 pattern)
Source: as above.
- **U1:** reduction formulae [C], beta and gamma [C], differentiation under the integral sign [C], error function [C]
- **U2:** curve tracing in Cartesian, polar and parametric forms [P], rectification [C], sphere, cone and cylinder (solid geometry) [C]
- **U3:** double and triple integrals [C], change of order [C], area, volume, mass, centre of gravity and moment of inertia [C]
- **U4:** exact equations [C], reducible to exact [C], linear [C], reducible to linear [C], Bernoulli [C]
- **U5 Applications:** orthogonal trajectories [C], Newton's law of cooling [C], Kirchhoff circuits [C], rectilinear motion and SHM [C], 1-D heat conduction [C]

### 207006 Engineering Mathematics-III (2019 pattern, Electrical copy. Mechanical and civil use 207002/207003 with near-identical units. Computer uses its own EM-III, which was not read.)
Source: verbatim from a college copy, https://zcoer.in/wp-content/uploads/2022/03/SE_Electrical_2019.pdf
- **U1 Linear ODE:** nth-order constant-coefficient equations, CF and PI by the general and short methods [C], variation of parameters [C], Cauchy and Legendre equations [C], simultaneous and symmetric simultaneous equations [C], electrical-circuit models [C]
- **U2 Laplace transform:** transforms and their inverses [C], periodic, unit-step and impulse functions [C], solving ODEs [C]
- **U3 Fourier and Z-transforms:** complex Fourier series [C], Fourier integral [C], sine and cosine transforms [C], Z-transform and its inverse [C], difference equations [C]
- **U4 Statistics and probability:** central tendency and dispersion [C], coefficient of variation [C], moments, skewness and kurtosis [C], correlation and regression with reliability of estimates [C], binomial, Poisson and normal distributions [C], χ² [C]
- **U5 Vector calculus:** gradient, divergence, curl and directional derivative [C], solenoidal and irrotational fields [C], vector identities [P], line, surface and volume integrals [C], Green, Gauss and Stokes theorems [C]
- **U6 Complex variables:** analytic functions and CR equations [C], conformal and bilinear mapping [C], Cauchy theorem and integral formula [C], residue theorem [C]

---

## Courses not read, or only partly read
- **VTU BMATEC301** (2022-scheme EC Mathematics-III): no module text found. The SJCIT 2024-scheme BMATE301 was used in its place.
- **VTU 21MAT11 M3 and 21MAT21 M3:** the mirror pages were blank, so the contents are inferred.
- **RGPV BT-102 and BT-202:** only unit titles were confirmed. The official rgpv.ac.in PDF and Scribd were not readable, so the sub-topics are inferred from the AICTE model curriculum.
- **AKTU BAS103 and BAS203:** no syllabus text was readable (aktu.ac.in was not reached). The sub-topics are inferred from course outcomes, a question bank and search snippets.
- **Mumbai CSC301 and CSC401** (Computer branch): not read. The IT versions ITC301 and ITC401 were used instead. The Computer EM-IV probably swaps LPP and NLPP for other topics. The MU NEP-2024 first-year syllabus was not read.
- **SPPU EM-I and EM-II** (2019 pattern, 107001 and 107008): the AVCOE copies returned 404, so the current 2024-pattern versions were used. The SPPU Computer EM-III (2019) was not read.
- **GTU 2140706** is an older code. The current Computer branch numerical-methods course is likely 3140708 or similar. Not checked.

---

## MASTER LIST (de-duplicated)

**N** = how many of the 28 course papers above include the topic. The 28 are: Anna ×5, VTU ×6, RGPV ×3, GTU ×4, AKTU ×3, MU ×4, SPPU ×3. Self-study items count; inferred items count. Methods are grouped under their topic. [C], [P] and [T] mean the same as in the legend.

### A. Differential calculus (single and several variables)
| Topic / method | N | |
|---|---|---|
| Partial derivatives, total derivative, chain rule and composite functions | 8 | C |
| Maxima and minima of two variables | 8 | C |
| Lagrange multipliers (including NLPP equality constraints) | 8 | C |
| Jacobians | 7 | C |
| Taylor/Maclaurin series in one variable (standard expansions) | 6 | C |
| Indeterminate forms / L'Hospital's rule | 5 | C |
| Euler's theorem for homogeneous functions | 5 | C |
| Limits and continuity (one and several variables) | 3 | P |
| Taylor series in two variables | 3 | C |
| Successive differentiation (nth derivative) and Leibniz theorem | 2 | C |
| Polar curves: angle between curves, pedal equation, curvature and radius of curvature | 2 | C |
| Curve tracing (Cartesian, polar, parametric) | 2 | P |
| Errors and approximations | 2 | C |
| Rolle's theorem and mean value theorems | 2 | P |
| Differentiation rules, implicit and logarithmic differentiation | 1 | C |
| Maxima and minima in one variable | 1 | C |
| Gradient, directional derivative, tangent plane and normal line | (see I) | C |

### B. Integral calculus
| Topic / method | N | |
|---|---|---|
| Double integrals (Cartesian and polar) | 8 | C |
| Change of order of integration | 8 | C |
| Triple integrals (Cartesian, cylindrical, spherical) | 8 | C |
| Area and volume by multiple integrals | 8 | C |
| Beta and gamma functions | 7 | C |
| Change of variables in multiple integrals (Jacobian) | 4 | C |
| Centre of mass, centre of gravity, moment of inertia | 4 | C |
| Improper integrals and their convergence | 3 | C |
| Rectification / arc length | 3 | C |
| Differentiation under the integral sign | 2 | C |
| Techniques of integration (parts, partial fractions, trigonometric substitution) | 1 | C |
| Reduction formulae; error function | 1 | C |
| Volume by cross-sections; surface area of revolution | 1 | C |
| Definite integral as a limit of a sum | 1 | C |
| Dirichlet integral | 1 | C |
| Hydrostatic force | 1 | C |
| Solid geometry (sphere, cone, cylinder) | 1 | C |

### C. Sequences, series and Fourier series
| Topic / method | N | |
|---|---|---|
| Fourier series (period 2π and 2L, odd/even functions, half-range) | 7 | C |
| Convergence tests for series (comparison, ratio, root, Raabe, integral, alternating) | 3 | C |
| Power series, radius of convergence | 3 | C |
| Harmonic analysis | 3 | C |
| Complex form of Fourier series | 3 | C |
| Parseval's identity | 2 | C |
| Convergence of sequences (sandwich theorem, monotone sequences) | 1 | P |

### D. Matrices and linear algebra
| Topic / method | N | |
|---|---|---|
| Eigenvalues and eigenvectors | 8 | C |
| Rank (echelon, normal and PAQ forms) | 7 | C |
| Consistency and solution of linear systems | 7 | C |
| Cayley–Hamilton (verification, inverse, powers) | 7 | C |
| Diagonalisation (including orthogonal) | 6 | C |
| Linear dependence and independence of vectors | 4 | C |
| Quadratic form → canonical form, nature of the form | 3 | C |
| Linear and orthogonal transformations | 3 | C |
| Inverse by Gauss–Jordan / elementary operations | 2 | C |
| Types of matrices (Hermitian, unitary, orthogonal) | 2 | P |
| Vector spaces, basis and dimension, rank–nullity, inner product | 2 | C |
| Similar, derogatory and non-derogatory matrices; functions of a matrix | 1 | C |

### E. Ordinary differential equations
| Topic / method | N | |
|---|---|---|
| Higher-order linear ODE with constant coefficients (CF + PI, inverse operator) | 7 | C |
| Variation of parameters | 7 | C |
| Cauchy–Euler and Legendre equations | 7 | C |
| First-order linear (and reducible to linear) | 6 | C |
| Bernoulli equation | 6 | C |
| Exact and reducible to exact (integrating factors) | 6 | C |
| Equations not of first degree: solvable for p, x or y; Clairaut | 3 | C |
| Applications (orthogonal trajectories, Newton cooling, circuits, SHM) | 3 | C |
| Simultaneous and symmetric simultaneous ODEs | 2 | C |
| Series solutions, Legendre polynomials, Frobenius, Bessel | 2 | C/P |
| Wronskian; undetermined coefficients | 1 | C |
| Normal form, change of independent variable, reduction of order | 1 | C |

### F. Partial differential equations
| Topic / method | N | |
|---|---|---|
| Lagrange linear equation Pp+Qq=R | 4 | C |
| Non-linear first-order PDE (standard types, Charpit) | 4 | C |
| Higher-order linear PDE with constant coefficients (CF + PI) | 4 | C |
| Separation of variables: wave, heat and Laplace equations | 4 | C |
| Formation of PDEs | 3 | C |
| Classification of second-order PDEs | 3 | C |
| Cauchy method of characteristics; transmission lines | 1 | C |
| Numerical PDE (Laplace/Poisson finite differences, Bender–Schmidt, Crank–Nicolson, explicit wave) | 1 | C |

### G. Laplace transform
| Topic / method | N | |
|---|---|---|
| Laplace transform of standard functions and its properties (shifting, ×t, ÷t, derivatives, integrals) | 5 | C |
| Inverse Laplace transform (partial fractions, convolution) | 5 | C |
| Unit step, Dirac delta, periodic functions | 5 | C |
| Solving ODEs and systems by Laplace transform | 5 | C |
| Evaluating integrals by Laplace transform | 2 | C |

### H. Fourier and Z-transforms
| Topic / method | N | |
|---|---|---|
| Fourier transform, sine and cosine transforms and their inverses | 5 | C |
| Z-transform of sequences and its properties | 4 | C |
| Inverse Z-transform (partial fractions, residues, convolution) | 4 | C |
| Fourier integral (sine and cosine integrals) | 3 | C |
| Difference equations by Z-transform; initial and final value theorems | 3 | C |
| Convolution and Parseval's identity for the Fourier transform | 1 | C |
| DFT / FFT | 1 | C |

### I. Vector calculus
| Topic / method | N | |
|---|---|---|
| Gradient, divergence, curl, directional derivative | 7 | C |
| Line integrals (work, circulation, conservative fields, potential function) | 6 | C |
| Solenoidal and irrotational fields | 5 | C |
| Green's theorem | 5 | C |
| Surface and volume integrals | 4 | C |
| Stokes' theorem | 4 | C |
| Gauss divergence theorem | 4 | C |
| Curvilinear coordinates, scale factors | 1 | C |
| Vector identities | 1 | P |

### J. Complex variables
| Topic / method | N | |
|---|---|---|
| Analytic functions, Cauchy–Riemann (Cartesian and polar) | 5 | C |
| Harmonic functions, harmonic conjugate, Milne–Thomson | 5 | C |
| Cauchy integral theorem and formula | 5 | C |
| Singularities, residues, residue theorem | 5 | C |
| Conformal mapping, bilinear (Möbius) transformation, fixed points | 4 | C |
| Taylor and Laurent series | 4 | C |
| Real integrals by contour integration | 3 | C |
| Complex numbers: De Moivre, roots, hyperbolic functions, complex logarithm | 2 | C |

### K. Probability
| Topic / method | N | |
|---|---|---|
| Random variables: pmf, pdf, expectation, variance | 6 | C |
| Binomial, Poisson and normal distributions | 6 | C |
| Conditional probability, total probability, Bayes | 4 | C |
| Moments and MGF | 3 | C |
| Geometric, uniform and exponential distributions | 3 | C |
| Joint, marginal and conditional distributions; covariance | 2 | C |
| Transformation of random variables; central limit theorem | 2 | C |
| Markov chains (stochastic matrices, stationary distribution, absorbing states) | 1 | C |

### L. Statistics
| Topic / method | N | |
|---|---|---|
| Correlation (Karl Pearson, Spearman rank) and regression lines | 6 | C |
| χ² tests (goodness of fit, independence) | 5 | C |
| Central tendency, dispersion, skewness, kurtosis | 4 | C |
| Curve fitting by least squares (line, parabola, exponential, power) | 4 | C |
| Large-sample z-tests (mean, proportion, difference) | 4 | C |
| Small-sample t-tests | 4 | C |
| F-test | 3 | C |
| ANOVA and design of experiments (CRD, RBD, Latin square, 2² factorial) | 3 | C |
| Estimation (MLE, method of moments, confidence intervals) | 2 | C |
| Non-parametric tests (sign, signed-rank, U, H, runs, Kolmogorov) | 2 | C |
| Statistical quality control (X̄, R, p, np and c charts; acceptance sampling) | 2 | C |
| Time series (trend, moving average, seasonal effects) | 1 | C |

### M. Numerical methods
| Topic / method | N | |
|---|---|---|
| Gauss elimination (with pivoting) | 7 | C |
| Newton–Raphson | 6 | C |
| Gauss–Seidel | 6 | C |
| Simpson 1/3 rule | 6 | C |
| Euler and modified Euler | 6 | C |
| Runge–Kutta 4 | 6 | C |
| Regula falsi | 5 | C |
| Gauss–Jordan | 5 | C |
| Lagrange interpolation | 5 | C |
| Trapezoidal rule | 5 | C |
| Taylor series method for ODEs | 5 | C |
| Bisection | 4 | C |
| Gauss–Jacobi | 4 | C |
| Newton forward and backward differences | 4 | C |
| Newton divided differences | 4 | C |
| Simpson 3/8 rule | 4 | C |
| Milne predictor–corrector | 4 | C |
| Adams–Bashforth | 4 | C |
| Power method (dominant eigenvalue) | 3 | C |
| Fixed-point / successive approximation | 2 | C |
| Numerical differentiation | 2 | C |
| Secant, Bairstow, Ramanujan; Crout/LU; relaxation; Jacobi eigenvalue method; spline; Weddle; numerical double integrals; boundary value problems; error analysis | 1 each | C |

### N. Discrete mathematics and number theory (Anna MA3354 and VTU BMATS101 only)
| Topic / method | N | |
|---|---|---|
| Modular arithmetic: congruences, linear congruences, Fermat, Euler φ, Wilson, CRT, RSA | 1 | C |
| Propositional logic, truth tables, normal forms, equivalences | 1 | C |
| Predicates, quantifiers, rules of inference, proofs, induction | 1 | P/T |
| Counting, permutations and combinations, pigeonhole principle | 1 | C |
| Recurrence relations (solving linear recurrences), generating functions | 1 | C |
| Inclusion–exclusion | 1 | C |
| Graphs: matrices, isomorphism, connectivity, Euler and Hamilton paths | 1 | C/P |
| Groups, subgroups, cosets, Lagrange's theorem, rings and fields | 1 | P/T |
| Posets, Hasse diagrams, lattices, Boolean algebra | 1 | C/P |

### O. Optimisation (Mumbai EM-IV, IT branch)
| Topic / method | N | |
|---|---|---|
| LPP: simplex, Big-M, duality, dual simplex | 1 | C |
| NLPP: Kuhn–Tucker conditions | 1 | C |

### Notes for NETZ
- Almost everything is **[C]**. The truly theoretical items are few: axioms, the theorems listed "without proof", estimator properties, Liouville's theorem, and the definitions in algebraic structures and logic. These become explanation pages.
- **Highest-value pages** (N ≥ 6), which appear in every university's first-year papers: partial derivatives, maxima and minima, Lagrange multipliers, Jacobians, multiple integrals with change of order, beta and gamma, eigenvalues, rank and consistency, Cayley–Hamilton, diagonalisation, Fourier series, the first-order ODE trio (linear, Bernoulli, exact), higher-order constant-coefficient ODEs with variation of parameters and Cauchy–Euler, grad/div/curl, line integrals, random variables and binomial/Poisson/normal, correlation and regression, and the core numerical methods (Gauss elimination, Gauss–Seidel, Newton–Raphson, Simpson, Euler, RK4).
- **Topics specific to one university** but cheap to add: VTU polar-curve curvature and pedal equations, VTU modular arithmetic and RSA, VTU Markov chains, MU complex numbers and hyperbolic functions, MU LPP and NLPP, Anna non-parametric tests and SQC, and GTU error analysis, Bairstow and splines.
