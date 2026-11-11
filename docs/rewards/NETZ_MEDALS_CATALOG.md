# NETZ Medals Catalog — every task and medal, with its design

> **Written**: 2026-10-19 · Goes with `docs/launch/NETZ_LAUNCH_PLAN.md` (section 2 rules, section 3 art).
> **Status**: list for the owner to check. The sample medals are on the design board; the rest gets drawn after the samples are approved.
> **Count**: 50 task + 5 onboarding + 20 streak = **75 permanent medals**, plus every year's **season set**
> (12 monthly medals + 1 year badge + the Pro season items).
> **2026-11-09**: Units 6–15 add **157 task medals**, one per method page (owner picked Option B on the
> medals board). Built and checked; see section 2b.

---

## 1. The four medal families

Each family has **one shared frame**, so you can tell the family at a glance. What changes inside the frame is
the **emblem**, a small picture of the thing you did.

| Family | Frame | Colour | Emblem |
| :--- | :--- | :--- | :--- |
| **Task** (50) | **Hexagon** (a net cell, from the name NETZ) with a thick rim | one colour per group (below) | a picture of the method itself: the tangent for Newton-Raphson, the strips for the Trapezoidal rule… |
| **Onboarding** (5) | **Amber circle with a bolt rim** (like a robot's panel), navy inside | the Classic Calc robot | one robot part "powering on". Together the 5 medals **build the whole robot**. |
| **Streak** (20) | **Shield with a flame** and the **day number** | walks through the sunset: coral → orange → amber → cream → plum → purple → night navy | the flame grows and gets more detailed at each tier |
| **Season** (each year) | **Round coin with a 12-notch ring**, the same for all 12 months and the year badge of that year | the season's colours (Season 1: navy, purple, orange, amber) | the month's emblem in the season style. The lit notch shows which month it is. |

**All art uses only the bg1 sunset palette** (updated 2026-10-19): `#141415` black · `#132034` navy · `#4D345E` purple ·
`#96456E` plum · `#D55E64` coral · `#F88F4A` orange · `#FBAE3D` amber · `#F4F4F2` cream, plus a darker shade of each for rims.

### Task group colours

| Group | Main / rim | Emblem colour |
| :--- | :--- | :--- |
| Unit 1: roots and systems | coral `#D55E64` / `#A63E48` | white |
| Unit 2: interpolation | amber `#FBAE3D` / `#C98318` | navy (white is too pale on amber) |
| Unit 3: integration | plum `#96456E` / `#6C2C4E` | white + amber |
| Unit 4: ODEs and matrices | navy `#2B4570` / `#0C1626` | amber + orange |
| Unit 5: statistics | purple `#5E3F75` / `#33213F` | white + amber |
| Notes | cream `#F4F4F2` / plum rim | purple |
| Playground | orange `#F88F4A` / `#C2632A` | white + purple |
| Sharing | the full sunset bands | white |
| Units 6–15 | split hexagon, two colours per unit (section 2b) | picked per unit to read on both halves |

### Streak tiers

| Days | Tier colour |
| :--- | :--- |
| 1 · 5 · 10 | coral |
| 25 · 50 · 75 | orange |
| 100 · 150 · 200 | amber |
| 250 · 300 · 365 | cream (365 with laurel) |
| 400 · 450 · 500 | plum |
| 600 · 700 · 800 | purple |
| 900 · 1000 | night navy with stars (1000 with laurel) |

### Mascot

**Classic Calc** (from ChatGPT's option 1, rebuilt as moving vector parts): purple screen head with orange/coral ear lights,
black screen face with amber eyes, keypad belly with an orange "=" key, coral hands and feet.
Reactions: idle (blink, eyes follow the pointer), wave, think, press "=", cheer, surprised, sad, sleep, wake up. Board artboard 6.

### Banners

Drawn 4 : 1, key shapes in the middle half, no words. One banner is used as the **Profile header**, a **Notes cover**
and a **shop card**. Starter set: Sunset Bands (free), Hex Net 250, Graph Paper 300, Sine Dunes 400, Dusk Peaks 500,
Origami 700, Orbit 900, Circuit Night (Pro Season 1). Board artboard 7.

---

## 2. The 50 task medals

**First time** = medal + 20 💎. **Each repeat** = 5 💎, once per task per day (`docs/launch/NETZ_LAUNCH_PLAN.md` 2.5).
"Solve" means the method finished with a real answer.

### Unit 1: roots and systems (coral)


| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 1 | Solve with Bisection | **Halfway Hero** | an interval bar cut in the middle; one half shaded, an arrow into the other half |
| 2 | Solve with False Position | **Chord Cutter** | a curve with a straight chord between two points, crossing the x-axis |
| 3 | Solve with Newton-Raphson | **Tangent Rider** | a curve with a tangent line sliding down to the x-axis |
| 4 | Solve with Secant | **Two-Point Shot** | two dots on a curve with a line through both, reaching the axis |
| 5 | Solve with Iteration (fixed point) | **Cobweb Climber** | the cobweb staircase between y = x and the curve |
| 6 | Solve with Gauss-Seidel | **Seidel Spinner** | a 3×3 grid with a looping arrow, cells filling one by one |
| 7 | Solve one function with 2 root methods | **Root Rivals** | two arrows meeting at the same point on the axis |

### Unit 2: interpolation (amber)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 8 | Newton Forward | **Forward Stepper** | a difference-table triangle with an arrow going forward |
| 9 | Newton Backward | **Backward Stepper** | the same triangle, mirrored, with the arrow going back |
| 10 | Gauss Forward | **Zigzag Forward** | a zigzag path through the middle of the table, going forward |
| 11 | Gauss Backward | **Zigzag Back** | the zigzag going back |
| 12 | Lagrange | **Point Weaver** | a smooth curve through 4 dots, each dot with its own thin arc |
| 13 | Newton Divided Difference | **Divider** | a table with a fraction bar across it |
| 14 | Interpolate with 6 or more points | **Big Table** | a tall table with 6 dots and a curve through them |

### Unit 3: integration and differentiation (plum)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 15 | Trapezoidal | **Strip Builder** | area under a curve as trapezoid strips |
| 16 | Simpson 1/3 | **Arc Pair** | strips in pairs, each pair capped by a parabola arc |
| 17 | Simpson 3/8 | **Triple Arc** | strips in threes, capped by a cubic arc |
| 18 | Boole | **Boole's Five** | 4 strips with 5 dots on the curve |
| 19 | Weddle | **Wave of Six** | 6 strips under a wavy cap |
| 20 | Gauss Quadrature | **Sharp Sampler** | a curve with 3 dots at uneven "special" places, little target rings on them |
| 21 | Numerical Differentiation | **Slope Spotter** | a curve with a small slope triangle (Δy over Δx) |
| 22 | The same integral with 3 rules | **Rule Trio** | three area shapes overlapping |

### Unit 4: ODEs and matrices (navy)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 23 | Euler | **Step Walker** | straight steps following a curve |
| 24 | Modified Euler | **Second Guess** | one dashed predictor step and one solid corrected step |
| 25 | Runge-Kutta | **Four Slopes** | four small slope arrows joining into one |
| 26 | Taylor Series | **Close Hugger** | a curve with 3 approximation curves hugging it closer and closer |
| 27 | Gauss Elimination | **Zero Maker** | a matrix with zeros falling away below the diagonal |
| 28 | Gauss-Jordan | **Diagonal Shine** | an identity matrix with a glowing diagonal |
| 29 | Jacobi | **Jacobi Loop** | two matrices side by side with a repeat arrow between them |
| 30 | LU Decomposition | **Split Matrix** | a square split into a lower and an upper triangle |

### Unit 5: statistics (purple)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 31 | Chi-square | **Chi Tail** | a skewed chi-square curve with its right tail shaded |
| 32 | F-test | **Spread Judge** | two bell curves, one wide and one narrow |
| 33 | t-test | **t-Bell** | a bell curve with heavier tails and a marker line |
| 34 | Test of Significance | **Significant!** | a bell curve with both tails shaded and a check mark |
| 35 | Fit a Straight Line | **Line Fitter** | scattered dots with a straight line through them |
| 36 | Fit a Parabola | **Curve Fitter** | scattered dots with a parabola |
| 37 | Least Squares | **Square Keeper** | dots with small squares between each dot and the line |

### Notes (cream)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 38 | Write a note with 3 or more blocks | **Note Builder** | a page with 3 stacked blocks |
| 39 | Put a solver widget in a note | **Live Page** | a page with a small working graph inside |
| 40 | Write a maths (KaTeX) block | **Math Scribe** | a page with a big Σ |
| 41 | Make a quiz block | **Quiz Maker** | a card with a question mark and A B C dots |
| 42 | Answer a quiz correctly | **Quiz Ace** | the card with a check mark |
| 43 | Export a note as PDF | **Print Ready** | a page with a down arrow |

### Playground (orange)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 44 | Turn handwritten maths into an equation | **Ink to Math** | a pen stroke turning into a neat x² |
| 45 | Turn handwritten words into text | **Ink to Words** | a pen stroke turning into neat "Aa" |
| 46 | Get a live `=` answer | **Instant Answer** | a handwritten "=" with a spark |
| 47 | Make a graph block | **Graph Maker** | a card with a plotted curve |
| 48 | Insert a shape or symbol | **Shape Shifter** | a triangle, circle and square together |
| 49 | Export a page | **Page Out** | a page with a share arrow |

### Sharing (sunset)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| 50 | Publish a note to the web | **Publisher** | a globe with a page in front of it |

## 2b. Units 6–15: one medal per page (157)

Chosen 2026-11-09 (Option B on the medals board). Same hexagon and rules as Units 1–5: solve the page once
for the medal and 20 gems, 5 gems a day after. The frame is split: top colour, bottom colour, rim.

- **Where it lives**: medal names and unit colours in `src/app/utils/progress/unitTasks.js`; pictures in
  `src/app/components/mascot/unitEmblems.js`. The task list is built from `methods.js`.
- **Hidden pages stay hidden**: a page's task (and its unit on the Profile and in the onboarding unit
  picker) shows only once the page is live. Today 21 of the 157 are live.
- **New page checklist**: add a medal name and an emblem; `npm run check:methods` fails without them and
  also checks that no medal name is used twice.

| Unit | Top / bottom / rim | Emblem colours |
| :--- | :--- | :--- |
| 6 Calculus | coral `#D55E64` / amber `#FBAE3D` / `#A63E48` | white + navy |
| 7 Algebra | amber `#FBAE3D` / plum `#96456E` / `#6C2C4E` | white + navy |
| 8 Matrices | navy `#132034` / coral `#D55E64` / `#0C1626` | white + amber |
| 9 Geometry | plum `#96456E` / amber `#FBAE3D` / `#6C2C4E` | white + navy |
| 10 Finance | amber `#FBAE3D` / navy `#132034` / `#C98318` | cream + coral |
| 11 Taxes | cream `#F4F4F2` / navy `#132034` / `#132034` | coral + orange |
| 12 Differential equations | navy `#132034` / orange `#F88F4A` / `#0C1626` | white + amber |
| 13 Transforms | purple `#4D345E` / coral `#D55E64` / `#33213F` | white + amber |
| 14 Complex variables | purple `#4D345E` / amber `#FBAE3D` / `#33213F` | white + coral |
| 15 Discrete maths | black `#141415` / orange `#F88F4A` / `#000000` | cream + amber |

### Unit 6: calculus (coral / amber, 47)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Limit Calculator | **Edge Walker** | yes |
| Derivative Calculator | **Slope Seeker** | yes |
| Integral Calculator | **Area Sweeper** |  |
| First Principles | **From Scratch** |  |
| Implicit Differentiation | **Hidden Slope** |  |
| Logarithmic Differentiation | **Log Slider** |  |
| Parametric Differentiation | **Path Tracer** |  |
| Tangent & Normal | **Right Angle** |  |
| Increasing & Decreasing | **Up and Down** |  |
| Maxima & Minima | **Peak Finder** |  |
| Area Under a Curve | **Region Painter** |  |
| Taylor & Maclaurin Series | **Series Builder** |  |
| Partial Derivatives | **Slice Cutter** |  |
| Euler's Theorem (Homogeneous) | **Even Scaler** |  |
| Jacobian | **Grid Warper** |  |
| Maxima & Minima (Two Variables) | **Saddle Rider** |  |
| Lagrange Multipliers | **Constraint Keeper** |  |
| Taylor Series (Two Variables) | **Surface Hugger** |  |
| Double Integrals | **Double Layer** |  |
| Change of Order of Integration | **Order Swapper** |  |
| Triple Integrals | **Cube Counter** |  |
| Beta & Gamma Functions | **Factorial Bridge** |  |
| Series Convergence Tests | **Converger** |  |
| Power Series (Radius of Convergence) | **Radius Ranger** |  |
| Fourier Series | **Wave Builder** |  |
| Harmonic Analysis | **Harmonic Ear** |  |
| Gradient, Divergence & Curl | **Field Reader** |  |
| Trigonometric Integrals | **Sine Sweeper** |  |
| Improper Integrals | **Infinity Reach** |  |
| Volume of Revolution | **Volume Spinner** |  |
| Arc Length & Surface Area | **Curve Measurer** |  |
| nth Derivative & Leibniz Theorem | **Leibniz Ladder** |  |
| Rolle's & Mean Value Theorem | **Mean Line** |  |
| Errors & Approximations | **Small Change** |  |
| Continuity | **No Gaps** |  |
| Asymptotes | **Line Chaser** |  |
| Related Rates | **Rate Linker** |  |
| Optimisation Problems | **Best Box** |  |
| Line Integrals | **Path Walker** |  |
| Surface & Volume Integrals | **Flux Catcher** |  |
| Green's Theorem | **Loop Closer** |  |
| Stokes' Theorem | **Cap Spinner** |  |
| Divergence Theorem | **Outflow** |  |
| Centre of Mass & Moment of Inertia | **Balance Point** |  |
| Reduction Formulas | **Step Down** |  |
| Differentiation Under the Integral Sign | **Under the Sign** |  |
| Radius of Curvature | **Curve Hugger** |  |

### Unit 7: algebra (amber / plum, 13)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Quadratic Equation | **Root Cracker** | yes |
| System of Equations | **Crossing Lines** | yes |
| AP & GP | **Pattern Spotter** | yes |
| Permutations & Combinations | **Arranger** | yes |
| Linear Equations | **Balance Keeper** |  |
| Factoring Polynomials | **Factor Finder** |  |
| Inequalities | **Range Marker** |  |
| Rational Expressions | **Fraction Folder** |  |
| Binomial Theorem | **Pascal's Peak** |  |
| Complex Numbers | **Imaginary Friend** |  |
| Logarithms | **Log Lifter** |  |
| Domain & Range | **Domain Ranger** |  |
| Sets & Relations | **Set Builder** |  |

### Unit 8: matrices & linear algebra (navy / coral, 13)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Determinant | **Cross Multiplier** | yes |
| Inverse of a Matrix | **Undo Master** | yes |
| Rank & Echelon Form | **Echelon Stair** | yes |
| Matrix Calculator | **Grid Master** | yes |
| Consistency of Equations | **System Solver** |  |
| Linear Dependence | **Line Up** |  |
| Eigenvalues & Eigenvectors | **Eigen Eye** |  |
| Cayley-Hamilton Theorem | **Self Solver** |  |
| Vector Calculator | **Arrow Aimer** |  |
| Diagonalization | **Diagonal Line** |  |
| Quadratic Forms | **Bowl Shaper** |  |
| Singular Value Decomposition | **Stretch Spinner** |  |
| Linear Transformations | **Space Mover** |  |

### Unit 9: geometry & trigonometry (plum / amber, 14)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Area & Perimeter | **Fence Builder** | yes |
| Volume & Surface Area | **Box Filler** | yes |
| Pythagoras Theorem | **Square Sum** | yes |
| Triangle Solver | **Triangle Tamer** | yes |
| Unit Circle | **Wave Rider** | yes |
| Coordinate Geometry | **Point Plotter** | yes |
| Circle Equations | **Ring Maker** |  |
| Conic Sections | **Cone Cutter** |  |
| Heights & Distances | **Tower Gazer** |  |
| Trig Identities | **Identity Checker** |  |
| Trig Equations | **Angle Finder** |  |
| Inverse Trig Functions | **Angle Back** |  |
| 3D Geometry | **Space Plotter** |  |
| Polar Coordinates | **Rose Drawer** |  |

### Unit 10: interest & finance (amber / navy, 13)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Percentage Calculator | **Percent Pro** | yes |
| Simple & Compound Interest | **Interest Earner** | yes |
| EMI Calculator | **EMI Planner** | yes |
| FD Calculator | **Locked Saver** |  |
| RD Calculator | **Monthly Saver** |  |
| PPF Calculator | **Long Haul** |  |
| SIP Calculator | **Steady Investor** |  |
| Lump Sum Calculator | **Lump Sum Hero** |  |
| Time Value of Money | **Time Traveller** |  |
| NPV & IRR | **Cash Flow Reader** |  |
| CAGR Calculator | **Growth Grower** |  |
| Depreciation | **Value Slider** |  |
| Bill Discounting | **Bill Discounter** |  |

### Unit 11: taxes (cream / navy, 11)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| GST Calculator | **Bill Checker** |  |
| VAT Calculator | **World Shopper** |  |
| US Sales Tax Calculator | **Checkout Champ** |  |
| Canada GST/HST Calculator | **Maple Ledger** |  |
| Income Tax Calculator (India) | **Tax Filer** |  |
| Capital Gains Tax (India) | **Gain Spotter** |  |
| HRA Exemption | **Rent Saver** |  |
| TDS Calculator | **Source Cutter** |  |
| US Income Tax | **Bracket Climber** |  |
| UK Income Tax | **Band Reader** |  |
| Corporate Tax Calculator | **Company Clerk** |  |

### Unit 12: differential equations (navy / orange, 18)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Differential Equation Solver | **First Steps** |  |
| Variable Separable | **Splitter** |  |
| Homogeneous Equations | **Ray Rider** |  |
| Linear Equations (Integrating Factor) | **Factor Lifter** |  |
| Bernoulli Equation | **Power Tamer** |  |
| Exact Equations | **Exact Match** |  |
| Constant Coefficients (CF + PI) | **Spring Solver** |  |
| Variation of Parameters | **Parameter Shifter** |  |
| Cauchy-Euler & Legendre | **Power Ladder** |  |
| Clairaut's Equation | **Envelope Maker** |  |
| Simultaneous Linear Equations | **Twin Tracker** |  |
| Applications of ODEs | **Cooling Cup** |  |
| Series Solutions (Frobenius) | **Term Stacker** |  |
| Formation of PDEs | **Equation Former** |  |
| Lagrange's Linear Equation | **Curve Follower** |  |
| Charpit's Method | **Charpit Climber** |  |
| Linear PDEs (Constant Coefficients) | **Wave Maker** |  |
| Separation of Variables | **Heat Spreader** |  |

### Unit 13: transforms (purple / coral, 10)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Laplace Transform | **Laplace Lens** |  |
| Inverse Laplace Transform | **Back Through** |  |
| Unit Step & Periodic Functions | **Switch Flipper** |  |
| ODEs by Laplace Transform | **Transform Solver** |  |
| DFT & FFT | **Butterfly** |  |
| Fourier Transform | **Frequency Finder** |  |
| Z-Transform | **Sample Stacker** |  |
| Inverse Z-Transform | **Sequence Finder** |  |
| Difference Equations (Z) | **Step Predictor** |  |
| Complex Fourier Series | **Spinning Circles** |  |

### Unit 14: complex variables (purple / amber, 7)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Cauchy-Riemann Equations | **Smooth Operator** |  |
| Harmonic Conjugate | **Perfect Partner** |  |
| Cauchy Integral Formula | **Circle Integrator** |  |
| Laurent Series | **Ring Reader** |  |
| Residue Theorem | **Residue Hunter** |  |
| Contour Integration | **Contour Drawer** |  |
| Bilinear Transformation | **Map Bender** |  |

### Unit 15: discrete maths & optimisation (black / orange, 11)

| Page | Medal name | Live |
| :--- | :--- | :---: |
| Truth Tables | **Logic Gate** |  |
| Modular Arithmetic & RSA | **Clock Counter** |  |
| Dijkstra's Algorithm | **Path Finder** |  |
| BFS & DFS | **Tree Explorer** |  |
| Minimum Spanning Tree | **Tree Spanner** |  |
| Simplex Method | **Corner Finder** |  |
| Recurrence Relations | **Next Term** |  |
| K-Map Simplifier | **Map Grouper** |  |
| Transportation Problem | **Route Planner** |  |
| Assignment Problem (Hungarian) | **Match Maker** |  |
| Kuhn-Tucker Conditions | **Edge Optimiser** |  |

---

## 3. The 5 onboarding medals (build the robot)

Each medal shows the **robot calculator** with one more part lit up. Holding all 5 shows the full robot,
switched on. (The robot's final look comes from art round 1; the samples use a simple robot.)

| # | Task | Medal name | Emblem |
| :---: | :--- | :--- | :--- |
| O1 | Meet the robot: name it and pick your units | **Power On** | the robot's screen lights up with a power symbol |
| O2 | First solve | **First Spark** | the keypad on the belly lights up |
| O3 | First note | **First Page** | the arms come out, holding a page |
| O4 | First ink in the Playground | **First Stroke** | one hand holds a pen |
| O5 | Create an account | **Cloud Link** | the antenna lights up, linked to a small cloud |

---

## 4. The 20 streak medals

A streak day = at least 1 task done that day. The number of days is written on the medal (digits only, so it needs no translation).

| Tier | Days | Look |
| :--- | :--- | :--- |
| **Bronze** | **1 · 5 · 10** | small flame, plain bronze shield |
| **Silver** | **25 · 50 · 75** | taller flame, silver shield with one rim line |
| **Gold** | **100 · 150 · 200** | gold shield, a double flame, small rays |
| **Platinum** | **250 · 300 · 365** | platinum shield, blue-white flame; **365 has a laurel wreath** (one year) |
| **Ruby** | **400 · 450 · 500** | deep red gem shield, flame with sparks |
| **Diamond** | **600 · 700 · 800** | faceted diamond shield |
| **Legend** | **900 · 1000** | cosmic shield (stars inside), flame made of light; **1000 has a double laurel** and is the last streak medal |

---

## 5. Seasons: monthly medals, the year badge and Pro items

Every year is a **season** with its own name, colours and frame, like a season in Mobile Legends.
All medals and items of one season **share the same design**, so a full year looks like one set.

### 5.1 What a season contains

| Item | Who | How | Look |
| :--- | :--- | :--- | :--- |
| **12 monthly medals** | everyone | tasks on 20 days of that month | the season coin; the month's notch lit; the month's emblem in the centre |
| **Year badge** | everyone | 6 or more monthly medals in that year (to confirm, `docs/launch/NETZ_LAUNCH_PLAN.md` section 8) | the same coin, larger, **all 12 notches lit**, the season emblem in the centre |
| **Pro season banner** | Pro | 3 of the 10 Pro tasks of that year | the season art as a wide banner |
| **Pro season skin** | Pro | 6 of the 10 Pro tasks | the robot dressed in the season theme |
| **Pro season medal** | Pro | all 10 Pro tasks | the year badge made **premium**: gold rim, wings, a shine animation, and the season crest |

Pro season items are earned with even a **single paid month** and kept **forever** (`docs/launch/NETZ_LAUNCH_PLAN.md` 2.7).

### 5.2 Season themes (ideas)

| Year | Season name | Theme | Colours |
| :--- | :--- | :--- | :--- |
| **2026** | **Season 1 · Circuit** | circuit-board lines, glowing chips. It fits the robot's first year. | navy + purple + orange + amber |
| 2027 | Season 2 · Orbit | planets, orbits, stars | deep indigo + orange |
| 2028 | Season 3 · Crystal | faceted crystals, light | mint + violet |
| 2029 | Season 4 · Origami | folded paper shapes | red + cream |

### 5.3 Month emblems (the same 12 ideas every year, drawn new in each season's style)

| Month | Emblem | Month | Emblem |
| :--- | :--- | :--- | :--- |
| January | snowflake | July | mango |
| February | kite | August | flag ribbon / tricolour knot |
| March | sprout | September | falling leaf |
| April | rain cloud | October | diya (lamp) |
| May | sun | November | lantern |
| June | wave | December | star |

### 5.4 Launch year

NETZ launches in **late 2026**, so only **October, November and December 2026** can be earned.
Suggestion: for 2026 only, the year badge needs **2 of those 3** monthly medals, and the 10 Pro tasks run until 31 December 2026.

---

## 6. What the sample board shows

To check the design language before the other ~80 medals are drawn:

1. **Task medals**: Halfway Hero (Unit 1), Arc Pair (Unit 3), Four Slopes (Unit 4), Line Fitter (Unit 5), Ink to Math (Playground). Same frame, different colours and emblems.
2. **Onboarding**: Power On.
3. **Streak**: 1 (bronze), 25 (silver), 100 (gold), 365 (platinum with laurel), 1000 (legend). Shows how the tiers grow.
4. **Season 1 · Circuit**: October 2026 monthly medal, the 2026 year badge, and the 2026 Pro season medal. Shows how one season shares one design.
5. Each medal also shown **locked** (grey outline) and at **small size** (48 px), as it will look in the Profile medal case.
