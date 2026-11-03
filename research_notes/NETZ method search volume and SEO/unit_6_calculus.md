# Unit 6 — Calculus (6A–6I): search volume and on-page SEO spec

Researched 2026-11-03. Covers the 50 topic and method rows in `NETZ_METHODS_CATALOG.md`, Unit 6 (lines 274–377), and ⭐ items P17–P30.

**What each source means. Every number in this file is labelled with one of these codes.**

| Code | Source | Region | What the number is |
| :--- | :--- | :--- | :--- |
| **SD-US** / **SD-IN** | seodata.dev keyword pages and API (Google Ads API data). Pages: `https://www.seodata.dev/keyword/<slug>`. API: `https://api.seodata.dev/v1/keyword?q=<kw>&country=us\|in`. Pulled 2026-11-03. The date of each cached figure is given where seodata showed one. | US or India | Monthly average Google searches. Google Ads groups near-synonyms together, so several variants can show the same number. |
| **WP** | Wikipedia pageviews API, en.wikipedia, all-access, user agents only, 2025-10 to 2026-09 (12 months): `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/<Title>/monthly/20251001/20260930` | Global, English | Average views of the article per month. This is a **proxy for global interest, not search volume**. |
| **AC-IN** | Google autocomplete: `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=<seed>` | India locale | The top 8 suggestions, in order. No volume. |
| **EST** | My own estimate from the data above. | — | Clearly an estimate, not measured data. |

---

## 1. Monthly search volume for the main keyword and its variants (US, India, global)

### Takeaway
The big Unit 6 head terms are calculator keywords: "integral calculator" (165K US / 27.1K IN), "derivative calculator" (135K US / 4.4K IN), "chain rule" (90.5K US) and "integration by parts" (74K US / 22.2K IN). The engineering-maths topics that India searches for (Fourier series, maxima/minima, change of order, beta/gamma) have smaller absolute volume, but India's share is high. "fourier series" gets 12.1K searches a month in India, the same as in the US.

### Cited findings: master demand table

Volumes are per month. "—" means not measured, either because seodata had no cached page or the anonymous rate limit was hit.

| ID | Topic / method | Main keyword | US volume (source) | India volume (source) | Global interest: Wikipedia views/mo (WP) | Variants with volume (source) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6A-1 | Limits: substitution, factoring, rationalising | limit calculator | **33,100** (SD-US, upd 2026-08-08) | — | Limit_of_a_function 7,044 | "calculator for limits" 60,500; "limits calculator with steps" 5,400; "limit calculator step by step" 3,600 (SD-US) |
| 6A-2 | L'Hôpital's rule | l'hopital's rule | — (the "lhopital rule" spelling returned 0 on SD-US, because Ads files it under the apostrophe spelling) | — | L'Hôpital's_rule **19,248** | AC-IN: "l'hopital's rule example / questions / conditions / proof" |
| 6A-3 | Standard limits | sin x / x limit | — | — | (in Limit_of_a_function) | no data |
| 6A-4 | Squeeze theorem | squeeze theorem | — | — | Squeeze_theorem 5,347 | AC-IN: "squeeze theorem examples / for sequences / proof" |
| 6A-5 | One-sided limits, continuity, asymptotes | continuity of a function | — | — | Continuous_function 10,707 | AC-IN: "limit calculator multivariable" |
| 6B-1 | First principles | derivative from first principles | — | — | (Derivative: rate-limited) | AC-IN: "first principle of derivative", "first principle of differentiation" |
| 6B-2 | Power, product, quotient, chain rules | derivative calculator | **135,000** (SD-US, upd 2026-05-22) | **4,400** (SD-IN, cached 2026-10-17) | Chain_rule 18,604; Quotient_rule 7,090; Product_rule 5,560 | "chain rule" **90,500** US; "chain rule formula" 6,600; "derivative calculator with steps" 2,400; "differentiation calculator" 3,600 US / 4,400 IN; "find the derivative calculator" 2,900 (SD-US) |
| 6B-3 | Implicit differentiation | implicit differentiation | **33,100** (SD-US, upd 2026-06-17) | — | Implicit_function 1,615 | "implicit differentiation examples" 1,300; "how to do implicit differentiation" 1,300 (SD-US) |
| 6B-4 | Logarithmic differentiation | logarithmic differentiation | — | — | Logarithmic_differentiation 861 | AC-IN: "…class 12", "…questions class 12", "…formula" (India-heavy) |
| 6B-5 | Parametric differentiation | parametric differentiation | — | — | — | AC-IN: "…class 12", "…second derivative", "…formula" |
| 6B-6 | nth derivative, Leibniz theorem | leibniz theorem | — | — | General_Leibniz_rule: rate-limited | AC-IN: "leibniz theorem for nth derivative", "nth derivative of tan inverse x", "nth derivative of log(1+x)" |
| 6C-1 | Tangent and normal | equation of tangent line | **12,100** (SD-US, upd 2026-06-27) | — | Tangent 7,793 | "how to find tangent line" 4,400; "tangent line formula" 2,400 (SD-US); AC-IN: "tangent and normal class 12", "…jee pyq" |
| 6C-2 | Increasing/decreasing, critical points | critical points calculator | — (no cached page) | — | — | no data |
| 6C-3 | Maxima/minima, one variable | maxima and minima | — | **12,100** (SD-IN, 2026-11-03) | Maximum_and_minimum 5,426 | "local maxima and minima" 1,900 IN (SD-IN); AC-IN: "maxima and minima class 12 / formula / questions with solutions pdf" |
| 6C-4 | Optimisation word problems | optimization problems | **2,400** (SD-US, upd 2026-10-04) | — | Mathematical_optimization 9,100 (a broader topic) | "optimization calculus problems" 1,000 (SD-US) |
| 6C-5 | Related rates | related rates | — | — | Related_rates 463 | AC-IN: "related rates problems with solutions pdf", "…worksheet" |
| 6C-6 | Rolle's theorem, MVT | mean value theorem | **40,500** (SD-US, upd 2026-10-02) | — | Mean_value_theorem 12,320; Rolle's_theorem 5,106 | "mean value theorem calculus" 1,300; "mean value theorem example" 590 (SD-US) |
| 6C-7 | Errors and approximations | linear approximation | — | — | Linear_approximation 1,382 | AC-IN: "errors and approximations class 11 formulas / class 12 / pdf" |
| 6C-8 | Curvature, polar curves, curve tracing | radius of curvature | — | — | Curvature 9,473 (most views are not about calculus) | AC-IN "curvature" is dominated by non-maths results |
| 6D-1 | Partial and total derivatives | partial derivative | **14,800** (SD-US, 2026-11-03) | — | Partial_derivative 10,445; Total_derivative 3,798 | "partial derivatives" / "multivariable derivative" 14,800 (SD-US) |
| 6D-2 | Euler's theorem (homogeneous) | euler's theorem on homogeneous function | — | — | Homogeneous_function 3,522 | AC-IN: "euler's theorem on homogeneous function" is the #2 suggestion (India intent) |
| 6D-3 | Jacobians | jacobian matrix | **18,100** (SD-US, 2026-11-03) | — | Jacobian_matrix_and_determinant **26,630** | "what is jacobian" 1,300 (SD-US); AC-IN: "jacobian of implicit function" |
| 6D-4 | Taylor series in 2 variables | taylor series in two variables | — | — | — | AC-IN: "…formula", "taylor series expansion in two variables", "maclaurin series in two variables" |
| 6D-5 | Maxima/minima of two variables | maxima and minima of two variables | — | — | Saddle_point 4,220 | AC-IN: "…engineering mathematics", "…questions", "…pdf" |
| 6D-6 | Lagrange multipliers | lagrange multiplier | **14,800** (SD-US, 2026-11-03) | — | Lagrange_multiplier **17,802** | "lagrange multipliers" / "lagrange method" 14,800 (SD-US) |
| 6E-1 | Standard integrals, power rule | integral calculator | **165,000** (SD-US, cached 2026-05-16) | **27,100** (SD-IN, cached 2026-10-17) | Integral 23,399; Antiderivative 5,166 | "calculator integral" 246,000 US; "integration calculator" 22,200 IN; "definite integral solver" 2,400 IN (SD) |
| 6E-2 | Substitution | u substitution | — | — | Integration_by_substitution 5,896 | no data |
| 6E-3 | Integration by parts (incl. tabular) | integration by parts | **74,000** (SD-US, 2026-11-03) | **22,200** (SD-IN, 2026-11-03) | Integration_by_parts 13,931 | "by parts formula in integration" **33,100** IN; "integration by parts equation" 22,200 US; "integration by parts calculator" 2,900 US; "…calculator with steps" 110 US (SD) |
| 6E-4 | Partial fractions | partial fraction calculator | **9,900** (SD-US, upd 2026-10-30) | — | Partial_fraction_decomposition 5,286 | "partial fractions decomposition calculator" 18,100; "partial fraction expansion calculator" 480 (SD-US) |
| 6E-5 | Trig integrals and trig substitution | trig substitution | — | — | Trigonometric_substitution 1,992 | AC-IN: "trig substitution formulas / calc 2 / practice problems" |
| 6E-6 | Definite integrals and properties | definite integral calculator | **6,600** (SD-US, upd 2026-05-21) | — | (Integral) | "definite integrals calculator" 14,800; "integral solver" 8,100 (SD-US) |
| 6E-7 | Improper integrals | improper integral calculator | **1,300** (SD-US, upd 2026-10-30) | — | Improper_integral 2,896 | "integral convergence calculator" 210; "improper integral calculator with steps" 50 (SD-US) |
| 6E-8 | Leibniz rule (differentiation under the integral sign) | differentiation under integral sign | — | — | Leibniz_integral_rule **14,187** | AC-IN: "…solved problems pdf", "…leibniz rule", "…questions" |
| 6E-9 | Reduction formulae | reduction formula | — | — | Integration_by_reduction_formulae 976 | AC-IN: "reduction formula for sin^nx / cos^nx / tan^nx / cosec^nx / cot^nx" |
| 6F-1 | Area under / between curves | area between curves | **4,400** (SD-US, related list) | — | — | "area between curves calculator" 1,900; "area bounded by two curves calculator" 880 (SD-US) |
| 6F-2 | Volume of revolution (disc, washer, shell) | volume of revolution | — | — | Solid_of_revolution 1,909; Shell_integration 862; Disc_integration 766 | AC-IN: "…about y axis", "…formula" |
| 6F-3 | Arc length, surface of revolution | arc length calculator | **8,100** (SD-US, upd 2026-10-30) | — | Arc_length 6,751 | "length of curve calculator" 1,600; "arc length formula calculator" 590 (SD-US). Warning: much of the "arc length" demand is for circle geometry. |
| 6F-4 | Average value of a function | average value of a function | — | — | — | AC-IN: "…over an interval", "…calculator", "…formula" |
| 6G-1 | Double integrals | double integral calculator | **12,100** (SD-US, 2026-11-03) | — | Multiple_integral 3,188 | "double integrals calculator" 27,100; "iterated integral calculator" 1,300 (SD-US); AC-IN: "double integrals in polar coordinates" |
| 6G-2 | Change of order of integration | change of order of integration | — | **1,300** (SD-IN, 2026-11-03) | — | "change the order of integration" 1,300 IN (SD-IN); AC-IN: "…solved problems pdf", "…engineering mathematics pdf" |
| 6G-3 | Triple integrals | triple integral calculator | — (rate-limited) | — | (Multiple_integral) | AC-IN: "triple integral in spherical coordinates" |
| 6G-4 | Change of variables | change of variables jacobian | — | — | — | AC-IN: "change of variables in double integrals (examples)" |
| 6G-5 | Area and volume by multiple integrals | area by double integration | — | — | — | no data |
| 6G-6 | Centre of mass, moment of inertia | centre of mass | — | — | Center_of_mass 7,949; Moment_of_inertia 21,894 (mostly physics intent) | AC-IN is physics-dominated: "centre of mass of solid hemisphere / cone" |
| 6G-7 | Beta and gamma functions | gamma function / beta function | — | "beta function" **2,900** (SD-IN, 2026-11-03) | Gamma_function **44,300**; Beta_function 10,316 | "beta gamma function" 2,900 IN (SD-IN); AC-IN: "gamma function of 1/2", "beta function in terms of gamma" |
| 6H-1 | Convergence tests | series convergence calculator | **2,900** (SD-US, 2026-11-03) | — | Convergence_tests 2,799; Ratio_test 2,350 | "convergent series calculator" 3,600 (SD-US) |
| 6H-2 | Power series, radius/interval of convergence | radius of convergence | — | — | Radius_of_convergence 2,764; Power_series 6,643 | "power series" 22,200 US (SD-US) is **polluted by the TV show "Power"**. Use "radius of convergence" instead. |
| 6H-3 | Taylor and Maclaurin series | taylor series | **49,500** (SD-US, 2026-11-03) | — | Taylor_series **53,571** (the largest in the unit) | "taylor expansion formula" 14,800; "maclaurin series" 14,800; "taylor series calculator" 5,400; "taylor polynomial calculator" 4,400; "maclaurin series calculator" 1,300 (SD-US) |
| 6H-4 | Fourier series (full and half range) | fourier series | **12,100** (SD-US, 2026-11-03) | **12,100** (SD-IN, 2026-11-03) | Fourier_series 22,484 | "fourier coefficients formula" 1,900 US; "fourier series calculator" 1,600 US; "fourier sine/cosine series calculator" 140 US; "fourier series definition" 880 IN (SD) |
| 6H-5 | Complex Fourier, Parseval | parseval's identity | — | — | Parseval's_identity 2,812 | AC-IN: "parseval's theorem for fourier series" |
| 6H-6 | Harmonic analysis | harmonic analysis in fourier series | — | — | — | AC-IN: "harmonic analysis in fourier series (formula)". Most of the head term's demand is non-maths (Ansys, power systems). |
| 6I-1 | Grad, div, curl, directional derivative | gradient divergence curl | — | — | Gradient 20,703; Divergence 13,518; Curl 12,297; Directional_derivative 4,661 | "gradient" 49,500 US (mixed intent); "curl" 110,000 US is **mostly the curl command-line tool**, so do not target it (SD-US) |
| 6I-2 | Solenoidal / irrotational, scalar potential | solenoidal vector field | — | — | Solenoidal_vector_field 1,130; Conservative_vector_field 2,371 | AC-IN: "solenoidal and irrotational", "solenoidal vector meaning in hindi" |
| 6I-3 | Line integrals, work done | line integral | — | — | Line_integral 7,138 | AC-IN: "line integral of vector field" (and physics: "…of electric field") |
| 6I-4 | Surface and volume integrals | surface integral | — | — | Surface_integral 3,865 | AC-IN: "surface integral to volume integral", "…of a vector field" |
| 6I-5 | Green's, Stokes', Gauss divergence theorems | divergence theorem | **12,100** (SD-US, 2026-11-03) | — | Green's_theorem 11,601; Stokes'_theorem 11,341; Divergence_theorem: rate-limited | AC-IN: "green's theorem solved examples", "stokes theorem and gauss divergence theorem", "gauss divergence theorem in hindi" |

### Inferences
- **EST: India-to-US ratios.** For calculator head terms, India is about 3–16% of US volume: integral calculator 27.1K / 165K ≈ 16%, derivative calculator 4.4K / 135K ≈ 3%. For engineering-maths topics, India matches or exceeds the US: Fourier series 12.1K = 12.1K, and integration by parts 22.2K IN versus 74K US, plus "by parts formula in integration" at 33.1K IN. India searchers phrase things as "formula", "class 12", "questions", "pdf", "engineering mathematics" and "in hindi", not "calculator".
- **EST: 6D/6G/6H/6I in India.** Autocomplete on these consistently ends with "engineering mathematics", "solved problems pdf" and "in hindi". This points to Indian B.Tech first-year demand of roughly 1–10K a month per topic, an estimate scaled from the two measured points: change of order 1.3K IN, beta function 2.9K IN.
- **EST: global volume.** Wikipedia views per month track roughly with US search volume for academic terms. Taylor series: 53.6K WP views vs 49.5K SD-US searches. Fourier series: 22.5K WP vs 12.1K SD-US. Lagrange: 17.8K WP vs 14.8K SD-US. A rough global search estimate is 2–3× the US figure for academic terms. Do not apply this to calculator terms, where Wikipedia does not capture intent.
- The ⭐ table's existing figures (135K derivative, 165K integral, 33.1K limit, 643k Taylor views/yr) match this pull: Taylor_series had 642,848 views over 12 months (WP).

### Gaps
- seodata had no cached page for many keywords (404), and the anonymous API limit is 20 lookups a day, which ran out. Not measured: US volumes for l'hopital's rule, product/quotient rule, squeeze theorem, u-substitution, triple integral calculator, gamma function, Green's/Stokes', and most India figures. Registering a free seodata key (500 lookups a month) would close this. It is an owner action: it needs an email sign-up.
- Wikipedia pageviews for Derivative, General_Leibniz_rule and Divergence_theorem were rate-limited (HTTP 429).
- No source gave keyword difficulty. Ahrefs' free keyword generator showed no data without interaction, and Semrush public pages were not reachable for keyword-level difficulty.

---

## 2. Difficulty, top 3 results, AI Overviews and Google's own maths solver

### Takeaway
Calculator head terms are effectively unwinnable for a new site. They are owned by long-established tools, and Google has its own step-by-step maths solver. Concept and "examples" long-tail terms are different: they rank university PDFs, LibreTexts, Scribd and Slideshare. These are weak, non-interactive pages a well-built NETZ page can beat.

### Cited findings
- Semrush lists derivative-calculator.net as ranking #1 for "derivative calculator", with about 165K monthly searches and CPC about $0.04. The country database was not stated. — [Semrush overview of derivative-calculator.net](https://ja.semrush.com/website/derivative-calculator.net/overview)
- In October 2023 Google Search added a maths solver: you type an equation or integral, or photograph it with Lens, and get a step-by-step solution covering calculus, trigonometry and geometry. Rollout and availability were reported as uneven. — [TechCrunch, 2023-11-01](https://techcrunch.com/2023/11/01/google-search-update-math-solver-lens/); [TechRadar](https://www.techradar.com/computing/software/google-search-can-help-you-with-your-math-homework-thanks-to-new-update)
- Google announced that AI Overviews would extend to advanced maths and coding questions. — [TechCrunch, 2024-12-11](https://techcrunch.com/2024/12/11/googles-ai-overviews-will-soon-answer-math-and-coding-questions)
- Reported AI Overview rates for the education sector vary widely: 83% (BrightEdge data, early 2026) vs about 48–52% (SE Ranking). About 99% of AIO-triggering keywords are informational. — [Omnibound AIO statistics](https://www.omnibound.ai/blog/google-ai-overviews-statistics); [Digital Marketing Agency SG](https://www.digitalmarketingagency.sg/blog/google-ai-overviews-statistics); [llmpulse](https://llmpulse.ai/blog/glossary/google-ai-overviews/)
- Searching "change of order of integration examples" returned mathinsight.org, a davidmathlogic.com PDF, UT Austin course pages, Scribd and Slideshare. The results are academic pages and document dumps, with no calculator brands. — [Math Insight](https://mathinsight.org/double_integral_change_order_integration_examples); [UT Austin LM15-3-7](https://web.ma.utexas.edu/users/m408s/CurrentWeb/LM15-3-7.php)
- Searching "jacobian of polar coordinates" returned University of Regina and Dartmouth PDFs, LibreTexts, Valparaiso and Oregon State study guides, and PhysicsForums. — [LibreTexts 3.8 Jacobians](https://math.libretexts.org/Bookshelves/Calculus/Supplemental_Modules_(Calculus)/Vector_Calculus/3:_Multiple_Integrals/3.8:_Jacobians); [Oregon State](https://sites.science.oregonstate.edu/math/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/jacpol/jacpol.html)
- Searching "lagrange multiplier 3 variables example" returned Purdue, SFU, Colorado, Harvard and Rutgers course notes, plus StudyPug and Varsity Tutors. — [Harvard Math 21a Lagrange handout](https://legacy-www.math.harvard.edu/archive/21a_fall_01/supplements/Lagrange.pdf); [SFU notes](https://www.sfu.ca/math-coursenotes/Math%20157%20Course%20Notes/sec_LagrangeMultipliers.html)
- Searching "half range fourier series examples engineering mathematics" returned university lecture PDFs (UMP, Bath, Banha, Al-Mustaqbal), Vaia, ProofWiki and Scribd. — [Bath notes](https://people.bath.ac.uk/masrs/ma20010/chap4.pdf); [Vaia](https://vaia.com/en-us/explanations/engineering/engineering-mathematics/half-range-fourier-series)
- Searching "fourier series calculator with steps" ranked Symbolab first, with steps behind an "Upgrade to Pro" gate. The rest were EveryCalculators, Mathos AI and thin spam pages. — [Symbolab Fourier series calculator](https://api.symbolab.com/solver/fourier-series-calculator)
- Autocomplete names the competitors directly: "derivative calculator symbolab / desmos / wolfram / .net", "integral calculator symbolab / wolfram / desmos / google", "limit calculator desmos / google" (AC-IN).

### Difficulty and AI Overview (EST, by tier)

Difficulty is estimated from the brand-dominated autocomplete and the SERPs observed. No KD tool data was available.

| Tier | Example keywords | EST difficulty | Likely SERP features | NETZ chance |
| :--- | :--- | :--- | :--- | :--- |
| Calculator head terms | integral calculator, derivative calculator, limit calculator, double integral calculator, taylor series calculator | Very high. Symbolab, Wolfram, Mathway, derivative-calculator.net / integral-calculator.com, eMathHelp and Desmos have years of links. | Google's maths solver widget for typed expressions; AI Overview less likely on bare "calculator" queries (EST) | Low for 12–18 months |
| Concept head terms | taylor series, chain rule, mean value theorem, jacobian matrix, lagrange multiplier, fourier series | High. Wikipedia, Khan Academy, Paul's Online Notes, LibreTexts, BYJU'S / GeeksforGeeks (India). | AI Overview very likely (informational) | Low–medium |
| Long-tail examples / formula / class 12 / engineering | "change of order of integration examples", "jacobian of polar coordinates", "half range fourier series examples", "leibniz theorem for nth derivative", "reduction formula for sin^n x" | Low–medium. SERPs are PDFs, Scribd, Slideshare and course pages. | AI Overview likely, but the cited sources are weak pages | **Good**: interactive, step-by-step and mobile-friendly beats a PDF |
| Niche calculators | "fourier cosine series calculator" 140, "improper integral calculator with steps" 50, "integration by parts calculator with steps" 110, "partial fraction expansion calculator" 480 (SD-US) | Medium; few tools, often paywalled steps | Few features | **Good** |

### Inferences
- NETZ's real edge is free, full steps, where Symbolab gates them behind Pro. Lead with "free step-by-step" in titles and descriptions on calculator pages.
- AI Overviews will absorb many plain definition queries. Pages should give a quotable, answer-first formula block and a worked example so they get cited, plus an interactive solver that an overview can't replace.

### Gaps
- Google's actual top 3 and PAA boxes for India (google.co.in) could not be captured. The WebSearch tool is US-only and not Google's own SERP. Verify the top 3 manually in an incognito google.co.in session, or with a SERP API.
- No measured AI Overview rate for maths queries specifically.

---

## 3. Long-tail keywords a new site can realistically rank for

### Takeaway
The best targets combine a method with a specific case ("…of polar coordinates", "…3 variables", "…for sin^n x"), a syllabus tag ("class 12", "engineering mathematics", "jee"), or an output format ("examples with solutions", "questions", "with steps"). Autocomplete (AC-IN) shows these phrasings exist in India.

### Cited findings: long-tail shortlist

Each phrase is from AC-IN unless a volume is shown. Volumes are SD-US unless marked IN.

| Item | Winnable long-tail keywords |
| :--- | :--- |
| 6A-1 Limits | limits calculator with steps (5,400), limit calculator step by step (3,600), limit by rationalising examples, limits by factoring examples |
| 6A-2 L'Hôpital | l'hopital's rule examples, l'hopital's rule questions, l'hopital's rule conditions, l'hopital's rule 0/0 and ∞/∞, repeated l'hopital |
| 6A-3 Standard limits | lim sin x/x = 1 proof, (1+1/x)^x limit e, standard limits formulas class 11 |
| 6A-4 Squeeze | squeeze theorem examples, squeeze theorem for sequences |
| 6A-5 Continuity | one sided limits examples, continuity of piecewise function, limit calculator multivariable |
| 6B-1 First principles | derivative by first principle examples, first principle of differentiation class 11 |
| 6B-2 Rules | derivative calculator with steps (2,400), chain rule formula (6,600), chain rule calculus (5,400), product rule and quotient rule examples |
| 6B-3 Implicit | implicit differentiation examples (1,300), how to do implicit differentiation (1,300), implicit differentiation questions and answers |
| 6B-4 Log diff | logarithmic differentiation class 12, logarithmic differentiation questions class 12, x^x derivative |
| 6B-5 Parametric | parametric differentiation class 12, parametric differentiation second derivative |
| 6B-6 nth / Leibniz | leibniz theorem for nth derivative, nth derivative of tan inverse x, nth derivative of log(1+x), nth derivative of e^ax sin bx |
| 6C-1 Tangent | how to find tangent line (4,400), tangent line formula (2,400), tangent and normal class 12, tangent and normal jee pyq |
| 6C-2 Increasing | increasing and decreasing functions class 12, find intervals where function is increasing |
| 6C-3 Maxima 1-var | maxima and minima class 12, local maxima and minima (1,900 IN), second derivative test examples |
| 6C-4 Optimisation | optimization calculus problems (1,000), optimization word problems with solutions |
| 6C-5 Related rates | related rates problems with solutions, related rates ladder problem, related rates cone water |
| 6C-6 Rolle/MVT | mean value theorem example (590), rolle's theorem questions, rolle's theorem and mean value theorem |
| 6C-7 Errors | errors and approximations class 12, approximate value using differentials |
| 6C-8 Curvature | radius of curvature formula, radius of curvature in polar form, curve tracing engineering mathematics |
| 6D-1 Partial | partial derivative examples, partial derivative questions engineering mathematics, total derivative examples |
| 6D-2 Euler | euler's theorem on homogeneous function, euler's theorem questions, euler's theorem for homogeneous function of degree n |
| 6D-3 Jacobian | jacobian of polar coordinates, jacobian of spherical coordinates, jacobian of implicit function, what is jacobian (1,300) |
| 6D-4 Taylor 2-var | taylor series in two variables formula, taylor series expansion in two variables, maclaurin series in two variables |
| 6D-5 Max/min 2-var | maxima and minima of two variables (engineering mathematics / examples / questions), saddle point examples |
| 6D-6 Lagrange | lagrange multiplier 3 variables, lagrange multiplier method example, lagrange multiplier method for maxima and minima, lagrange multiplier in economics |
| 6E-1 Standard | integral calculator with steps, integration formulas list, integration calculator (22,200 IN) |
| 6E-2 Substitution | u substitution examples, integration by substitution class 12 |
| 6E-3 By parts | by parts formula in integration (33,100 IN), integration by parts ilate, tabular integration, integration by parts calculator with steps (110) |
| 6E-4 Partial fractions | partial fraction expansion calculator (480), partial fractions integration, partial fractions class 12, repeated linear factors |
| 6E-5 Trig sub | trig substitution formulas, trig substitution practice problems, integral of sin^m x cos^n x |
| 6E-6 Definite | definite integral properties class 12, definite integral solver (2,400 IN) |
| 6E-7 Improper | improper integral of first / second kind, integral convergence calculator (210), improper integral calculator with steps (50) |
| 6E-8 Leibniz rule | differentiation under integral sign solved problems, Feynman trick integration, Leibniz rule examples |
| 6E-9 Reduction | reduction formula for sin^n x / cos^n x / tan^n x / sec^n x, Walli's formula |
| 6F-1 Area | area between two curves calculator (880), area bounded by two curves calculator (880), area between curves with respect to y |
| 6F-2 Volume | volume of revolution about y axis, shell method vs disk method, washer method examples |
| 6F-3 Arc length | length of curve calculator (1,600), arc length of parametric curve, surface area of revolution formula |
| 6F-4 Average value | average value of a function over an interval, average value of a function calculator |
| 6G-1 Double | double integrals in polar coordinates, iterated integral calculator (1,300), double integral examples with solutions |
| 6G-2 Change of order | change of order of integration examples, change of order of integration solved problems, change the order of integration (1,300 IN) |
| 6G-3 Triple | triple integral in spherical coordinates, triple integral in cylindrical coordinates, volume using triple integral |
| 6G-4 Change of vars | change of variables in double integrals examples, change of variables jacobian examples |
| 6G-5 Area/volume | area using double integration, volume of sphere using triple integral |
| 6G-6 CoM / MoI | centre of mass using double integral, moment of inertia of lamina double integral |
| 6G-7 Beta/gamma | gamma function of 1/2, relation between beta and gamma function, beta function in terms of sin and cos, beta gamma function (2,900 IN) |
| 6H-1 Tests | series convergence calculator (2,900), ratio test for convergence, convergence test for alternating series |
| 6H-2 Power series | radius of convergence of power series, interval of convergence calculator |
| 6H-3 Taylor | taylor polynomial calculator (4,400), maclaurin series of sin x / e^x / log(1+x) / tan x, taylor series calculator (5,400) |
| 6H-4 Fourier | half range sine series, half range cosine series formula, fourier series of square wave, fourier series engineering mathematics, fourier cosine series calculator (140) |
| 6H-5 Parseval | parseval's identity for fourier series, complex form of fourier series |
| 6H-6 Harmonic | harmonic analysis in fourier series formula, harmonic analysis from table |
| 6I-1 Grad/div/curl | gradient divergence curl formula, directional derivative formula, directional derivative example, del operator |
| 6I-2 Solenoidal | solenoidal and irrotational vector, scalar potential of irrotational field |
| 6I-3 Line integral | line integral of vector field, work done by force line integral |
| 6I-4 Surface / volume | surface integral of a vector field, surface integral to volume integral |
| 6I-5 Theorems | green's theorem solved examples, verify stokes theorem, verify gauss divergence theorem, stokes theorem and gauss divergence theorem |

### Inferences
- **"Verify X theorem" pages for engineering students** (Green, Stokes, Gauss) are a strong fit for NETZ. Indian exam questions are phrased "verify Green's theorem for…", and the current results are PDFs.
- **Named-function pages are cheap wins.** Each nth-derivative, reduction-formula or Maclaurin-series case can be its own section or sub-page, with an answer-first formula ("maclaurin series of tan x", "reduction formula for sin^n x").
- **Avoid ambiguous heads.** "curl" is a command-line tool, "power series" is a TV show, "curvature", "gradient" and "centre of mass" are mostly physics or geometry, and "arc length" is mostly circles. Use qualified primaries such as "curl of a vector field", "radius of convergence", "radius of curvature" and "arc length of a curve".

### Gaps
- Exact volumes for most long-tail phrases were not measured; they are autocomplete-verified only.

---

## 4. "People also ask" questions and autocomplete suggestions

### Takeaway
Autocomplete was captured for 57 seeds in the India locale (AC-IN). PAA boxes could not be pulled: no Google SERP access. The FAQs in section 5 are therefore drawn from question-form autocomplete suggestions plus common exam phrasing. They are marked as derived, not as measured PAA.

### Cited findings: autocomplete (AC-IN, 2026-11-03)

All rows below come from the source above; only the top suggestions are shown.

| Seed | Top suggestions |
| :--- | :--- |
| limit calculator | with steps; desmos; google; calculus; multivariable; online; with steps free |
| l'hopital's rule | proof; example; questions; "or l'hospital's rule"; definition; conditions; limits |
| derivative calculator | with steps; symbolab; desmos; .net; online; wolfram; at a point |
| implicit differentiation | formula; questions; meaning; examples; calculator; questions and answers pdf; worksheet pdf |
| logarithmic differentiation | formula; class 12; questions class 12; questions; questions and answers pdf; formulas pdf |
| parametric differentiation | class 12; formula; class 12 questions; questions; problems and solutions pdf; examples; second derivative |
| leibniz theorem | formula; for nth derivative; proof; integration; differentiation; in hindi; for alternating series |
| nth derivative | formula; of tan inverse x; of log(1+x); of sinx; of e^x; of cosx; of e^ax |
| tangent and normal | in hindi; in jee syllabus; class 12; formula; bsc 1st year; to a curve; jee pyq |
| maxima and minima | class 12; formula; of a function; class 12 solutions; questions with solutions pdf; in hindi |
| related rates | calculus; problems with solutions pdf; worksheet; of change; derivatives |
| rolle's theorem | proof; formula; and mean value theorem; questions; statement; examples with solutions pdf |
| mean value theorem | for integrals; of integral calculus; formula; proof; class 12; and rolle's theorem |
| errors and approximations | class 11 formulas; formulas; class 11 pdf; class 12; questions and answers |
| partial derivative | formula; symbol; examples; questions; engineering mathematics; definition; questions engineering mathematics |
| euler's theorem | on homogeneous function; formula; in hindi; questions; proof; questions and answers; in economics |
| jacobian | matrix; formula; theorem; conjecture; of implicit function |
| lagrange multiplier | method; formula; method for maxima and minima; questions; method example; theorem; in economics |
| maxima and minima of two variables | questions; engineering mathematics; pdf; examples; function; several variables |
| taylor series in two variables | formula; multiple variables; several variables; maclaurin series in two variables; expansion in two variables |
| integral calculator | with steps; online; with limits; symbolab; wolfram; desmos; google |
| integration by parts | formula; formula class 12; formula ilate; rule; examples; for definite integrals; questions |
| partial fractions | formula; integration; examples and solutions; rules; a level questions and answers; class 12 |
| trig substitution | integration; formulas; calc 2; examples; practice problems; identities; rules |
| improper integral | definition; pdf; examples; of first kind; of second kind; formula; notes pdf |
| reduction formula | integration; for sin^nx; in trigonometry; of cos^nx; for tan^nx; for cosec^nx; for cot^nx |
| differentiation under integral sign | leibniz rule; solved problems pdf; questions; formula; pdf; examples; proof |
| area between curves | formula; calculator; practice problems; calc 2; calculus; with respect to y; integral |
| volume of revolution | formula; about x axis; about y axis; integration formula; parametric formula |
| arc length | formula; of a circle; calculator; formula of circle; formula radians; in hindi; class 10 |
| average value of a function | over an interval; formula; calculus; calculator; calc 2; practice problems; integral |
| double integral | calculator; formula; in polar coordinates; questions; meaning; examples with solutions; pdf |
| change of order of integration | in double integrals; solved problems pdf; in double integrals questions; engineering mathematics pdf; questions; examples |
| triple integral | calculator; formula; question; definition; pdf; in spherical coordinates; examples |
| change of variables | in double integrals; in integration; jacobian; formula; theorem; jacobian examples |
| beta function | formula; and gamma function; integration; definition; properties; in terms of sin and cos; in terms of gamma |
| gamma function | formula; integration; properties; of 1/2; sign; integral formula; definition |
| ratio test | for convergence; for series; "of transformer" (off-topic); for sequence; formula; conditions |
| radius of convergence | of power series; formula; meaning; of a series; in complex analysis; of taylor series |
| taylor series | expansion; formula; for two variables; of sinx; expansion for two variables; of e^x |
| maclaurin series | formula; expansion; of sinx; of tanx; of cos x; of e^x; of log(1+x) |
| fourier series | formula; and fourier transform; engineering mathematics; pdf; of square wave; in signals and systems; expansion |
| half range… | cosine series formula; fourier series; sine series formula; sine and cosine series |
| parseval… | theorem; identity; theorem for fourier series; identity for fourier series; relation |
| harmonic analysis | in fourier series; "ansys" (off-topic); in fourier series formula; in power system (off-topic) |
| gradient divergence curl | and laplacian; definition; formula; in spherical coordinates; significance; physical meaning |
| directional derivative | formula; definition; example; questions; of a vector; and gradient |
| solenoidal… | vector; meaning in hindi; vector field; field; and irrotational |
| line integral | meaning; formula; of magnetic field (physics); of electric field; of vector field |
| surface integral | formula; symbol; to volume integral; meaning; of a vector field; example |
| green's theorem | formula; statement; proof; in the plane; solved examples; statement and proof |
| stokes theorem | statement; formula; in hindi; proof; and divergence theorem; and gauss divergence theorem |
| gauss divergence theorem | proof; formula; statement; in hindi; and stokes theorem; state and proof |
| squeeze theorem | for limits; proof; examples; for sequences; in real analysis; worksheet; statement |
| convergence test | "eye" / "vision" (off-topic); tests for series; questions; for infinite series; for alternating series |
| first principle | dominated by "first principles ias / thinking" (off-topic); "first principle of derivative" #4 |
| curvature | dominated by non-maths ("meaning in hindi", film, spine, lens) |

### Inferences
- "In hindi" appears for Leibniz, tangent and normal, maxima/minima, Euler, Stokes, Gauss and solenoidal. A Hindi explanation toggle or Hindi FAQ could capture extra India demand. This is an estimate; no volume was measured.
- "statement and proof" and "proof" appear for every theorem. Theorem pages should have a short statement, a proof sketch, and a "verify" solver.

### Gaps
- Real PAA questions were not captured; verify them manually on google.co.in.

---

## 5. SEO spec per item (primary, secondary, slug, title ≤60, meta ≤155, H1, FAQs)

### Takeaway
Use the measured head term as primary only where NETZ can plausibly compete (concept pages). For calculator pages, keep the calculator term in the title for relevance, but aim the content and secondary keywords at the long tail ("with steps, free", "examples", "class 12", "engineering mathematics"). Slugs assume a `/calculus/` prefix; adjust to the NETZ route scheme. Titles and metas were written to the length limits; recount after editing.

### Cited findings
All keyword choices come from the volume table (section 1) and the autocomplete table (section 4). The specs below are recommendations (inferences), not measured data.

### Inferences: spec tables

#### 6A — Limits and continuity

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6A-1 | limit calculator with steps | limit calculator; limits by factoring; rationalising limits; limit step by step | /calculus/limit-calculator | Limit Calculator with Steps – Free, Step by Step \| NETZ | Solve limits step by step: substitution, factoring and rationalising, with every step explained. Free, works on phone and tablet. | Limit Calculator with Steps | How do you find a limit by factoring? · When do you rationalise a limit? · What if substitution gives 0/0? · Is a limit the same as the function value? |
| 6A-2 | l'hopital's rule | l'hopital's rule examples; conditions; 0/0 ∞/∞; l'hospital rule calculator | /calculus/lhopitals-rule | L'Hôpital's Rule: Conditions, Examples and Steps \| NETZ | Use L'Hôpital's rule on 0/0 and ∞/∞ limits, step by step. Conditions, repeated use and worked examples, with a free solver. | L'Hôpital's Rule, Step by Step | When can you use L'Hôpital's rule? · Can you apply it more than once? · Does it work for 0·∞ or 1^∞? · Is it l'Hospital or l'Hôpital? |
| 6A-3 | standard limits formulas | lim sin x/x; (1+1/x)^x = e; standard limits class 11 | /calculus/standard-limits | Standard Limits: sin x/x, (1+1/x)^x and More \| NETZ | All the standard limits for Class 11 and JEE, with proofs and worked examples: sin x/x, (1+1/x)^x, (aˣ−1)/x and more. | Standard Limits and How to Use Them | Why is lim sin x/x = 1? · What is lim (1+1/x)^x? · What is lim (aˣ−1)/x? · Do I need radians? |
| 6A-4 | squeeze theorem | squeeze theorem examples; sandwich theorem; for sequences | /calculus/squeeze-theorem | Squeeze Theorem: Statement, Proof and Examples \| NETZ | The squeeze (sandwich) theorem explained, with worked examples like x²sin(1/x), its use for sequences and a step-by-step checker. | Squeeze Theorem with Examples | What does the squeeze theorem say? · Is it the same as the sandwich theorem? · How do you choose the bounding functions? · Does it work for sequences? |
| 6A-5 | continuity of a function | one sided limits; continuity of piecewise function; asymptotes | /calculus/continuity-one-sided-limits | Continuity and One-Sided Limits, Step by Step \| NETZ | Check whether a function is continuous, find left and right limits and locate vertical and horizontal asymptotes, step by step. | Continuity, One-Sided Limits and Asymptotes | What are the 3 conditions for continuity? · How do you find one-sided limits? · How do you find vertical asymptotes? · Can a function have a limit but not be continuous? |

#### 6B — Differentiation

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6B-1 | derivative from first principles | first principle of differentiation; definition of derivative | /calculus/first-principles-derivative | Derivative from First Principles, Step by Step \| NETZ | Find derivatives from first principles (the limit definition) with every algebra step shown. Class 11 and A-level examples. | Derivative from First Principles | What is the first principle of derivative? · How do you differentiate x² from first principles? · Why use h → 0? · Is first principles in Class 11? |
| 6B-2 ⭐P17 | derivative calculator with steps | derivative calculator; chain rule; product rule; quotient rule; differentiation calculator | /calculus/derivative-calculator | Derivative Calculator with Steps – Free, Every Rule \| NETZ | Free derivative calculator that shows every step: power, product, quotient and chain rules named at each line. No paywall on steps. | Derivative Calculator with Steps | What is the chain rule? · When do I use the product vs quotient rule? · How do I differentiate e^(x²)? · Can it do higher derivatives? |
| 6B-3 ⭐P18 | implicit differentiation | implicit differentiation examples; calculator; how to do implicit differentiation | /calculus/implicit-differentiation | Implicit Differentiation: Examples and Calculator \| NETZ | Find dy/dx implicitly, step by step. Worked examples like x² + y² = 25, plus second derivatives and a free solver that shows each line. | Implicit Differentiation, Step by Step | How do you do implicit differentiation? · Why multiply by dy/dx? · How do you find d²y/dx² implicitly? · When is implicit differentiation needed? |
| 6B-4 ⭐P18 | logarithmic differentiation | logarithmic differentiation class 12; x^x derivative; questions | /calculus/logarithmic-differentiation | Logarithmic Differentiation: Class 12 Steps \| NETZ | Differentiate x^x, (sin x)^x and long products with logarithmic differentiation. Class 12 and JEE examples, solved step by step. | Logarithmic Differentiation | When should I use logarithmic differentiation? · How do you differentiate x^x? · Why take log on both sides? · Is it in Class 12 NCERT? |
| 6B-5 | parametric differentiation | parametric differentiation class 12; second derivative parametric | /calculus/parametric-differentiation | Parametric Differentiation: dy/dx and d²y/dx² \| NETZ | Find dy/dx and d²y/dx² for parametric equations, step by step. Class 12 examples with cycloids and circles. | Parametric Differentiation | What is the formula for parametric dy/dx? · How do you find the second derivative? · What is a parametric equation? · Is it in Class 12? |
| 6B-6 | leibniz theorem for nth derivative | nth derivative formula; nth derivative of tan⁻¹x; log(1+x); e^ax sin bx | /calculus/nth-derivative-leibniz-theorem | nth Derivative and Leibniz Theorem, Solved \| NETZ | nth derivative formulas (eᵃˣ, sin, log(1+x), tan⁻¹x) and Leibniz's theorem for products, solved step by step for engineering maths. | nth Derivative and Leibniz Theorem | What is Leibniz theorem for nth derivative? · What is the nth derivative of log(1+x)? · nth derivative of tan⁻¹x? · How is Leibniz theorem like the binomial theorem? |

#### 6C — Applications of derivatives

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6C-1 | equation of tangent line | tangent and normal; tangent line calculator; normal line equation | /calculus/tangent-and-normal | Tangent and Normal Line Equations, Step by Step \| NETZ | Find the equation of the tangent and normal to a curve at a point, step by step. Class 12, JEE and AP Calculus examples. | Tangent and Normal to a Curve | How do you find the equation of a tangent line? · What is the slope of the normal? · How do you find where the tangent is horizontal? · Tangent to a parametric curve? |
| 6C-2 | increasing and decreasing functions | critical points calculator; intervals of increase | /calculus/increasing-decreasing-critical-points | Increasing, Decreasing and Critical Points \| NETZ | Find critical points and the intervals where a function increases or decreases, with a sign chart built step by step. | Increasing and Decreasing Functions | What is a critical point? · How do you find intervals of increase? · What does f′(x) > 0 mean? · Is a critical point always a max or min? |
| 6C-3 ⭐P22 | maxima and minima | maxima and minima class 12; second derivative test; local maxima and minima | /calculus/maxima-minima | Maxima and Minima: 1st and 2nd Derivative Tests \| NETZ | Find local and absolute maxima and minima using the first and second derivative tests. Class 12 and AP examples, solved step by step. | Maxima and Minima of a Function | What is the second derivative test? · Local vs absolute maximum? · What if f″(x) = 0? · How to find maxima on a closed interval? |
| 6C-4 | optimization calculus problems | optimization word problems; maximise area; minimise cost | /calculus/optimization-problems | Optimization Problems in Calculus, Solved \| NETZ | Solve calculus optimisation word problems (fences, boxes, cans, distance) step by step: set up, differentiate, check. | Optimization Problems, Step by Step | How do you set up an optimization problem? · Box with maximum volume? · How do you check it's a maximum? · Common optimization mistakes? |
| 6C-5 | related rates | related rates problems with solutions; ladder; cone | /calculus/related-rates | Related Rates: Ladder, Cone and Balloon Problems \| NETZ | Related rates problems solved step by step: sliding ladder, filling cone, expanding balloon. Learn the 5-step method. | Related Rates Problems | What are related rates? · How do you solve a ladder problem? · Water filling a cone? · Why differentiate with respect to t? |
| 6C-6 | mean value theorem | rolle's theorem; MVT examples; verify rolle's theorem | /calculus/rolles-mean-value-theorem | Rolle's Theorem and Mean Value Theorem, Verified \| NETZ | Verify Rolle's theorem and the mean value theorem and find c, step by step. Statements, conditions and Class 12 examples. | Rolle's Theorem and Mean Value Theorem | What does the mean value theorem say? · Rolle's vs mean value theorem? · How to find c? · When does Rolle's theorem fail? |
| 6C-7 | errors and approximations | linear approximation; differentials; approximate value | /calculus/errors-approximations | Errors and Approximations Using Differentials \| NETZ | Approximate √25.3 or (1.02)⁵ with differentials and find absolute, relative and percentage error, step by step. | Errors and Approximations | How do you approximate using differentials? · Absolute vs relative error? · What is percentage error? · Linear approximation formula? |
| 6C-8 | radius of curvature | radius of curvature formula; polar form; curve tracing | /calculus/curvature-curve-tracing | Radius of Curvature and Curve Tracing \| NETZ | Find the radius of curvature in Cartesian, parametric and polar form, and trace curves step by step for engineering maths. | Curvature, Polar Curves and Curve Tracing | What is the radius of curvature formula? · Radius of curvature in polar form? · What is curve tracing? · Curvature of a circle? |

#### 6D — Partial differentiation

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6D-1 ⭐P24 | partial derivative | partial derivative calculator; examples; total derivative | /calculus/partial-derivatives | Partial Derivatives: Calculator and Examples \| NETZ | Find first and second partial derivatives and total derivatives step by step. Engineering maths examples and a free solver. | Partial and Total Derivatives | How do you find a partial derivative? · What is ∂²f/∂x∂y? · Partial vs total derivative? · Are mixed partials equal? |
| 6D-2 ⭐P24 | euler's theorem on homogeneous function | euler's theorem questions; homogeneous function degree n | /calculus/euler-theorem-homogeneous-function | Euler's Theorem on Homogeneous Functions, Solved \| NETZ | Verify Euler's theorem x∂u/∂x + y∂u/∂y = nu step by step, including second-order and corollary forms, for engineering maths. | Euler's Theorem on Homogeneous Functions | What is a homogeneous function? · State Euler's theorem. · How to find the degree? · What is the second-order form? |
| 6D-3 ⭐P26 | jacobian | jacobian matrix; jacobian of polar coordinates; spherical; jacobian calculator | /calculus/jacobian | Jacobian Calculator: Matrix, Polar and Spherical \| NETZ | Compute the Jacobian determinant step by step. See why polar gives r and spherical gives r²sinθ, plus properties used in exams. | Jacobian, Step by Step | What is a Jacobian? · Why is the Jacobian of polar coordinates r? · What is JJ′ = 1? · Jacobian in spherical coordinates? |
| 6D-4 | taylor series in two variables | taylor expansion two variables formula; maclaurin two variables | /calculus/taylor-series-two-variables | Taylor Series in Two Variables, Step by Step \| NETZ | Expand f(x, y) as a Taylor or Maclaurin series up to second or third order, step by step, with engineering maths examples. | Taylor Series in Two Variables | What is the Taylor formula for two variables? · How many terms do I need? · Maclaurin vs Taylor in two variables? · Expand eˣ sin y? |
| 6D-5 ⭐P25 | maxima and minima of two variables | saddle point; rt − s² test; engineering mathematics | /calculus/maxima-minima-two-variables | Maxima and Minima of Two Variables (rt − s²) \| NETZ | Find maxima, minima and saddle points of f(x, y) with the rt − s² test, step by step. Engineering maths examples. | Maxima and Minima of Two Variables | What is the rt − s² test? · What is a saddle point? · How do I find stationary points? · What if rt − s² = 0? |
| 6D-6 ⭐P25 | lagrange multiplier | lagrange multiplier 3 variables; method example; calculator | /calculus/lagrange-multipliers | Lagrange Multipliers: 2 and 3 Variables, Solved \| NETZ | Solve constrained maxima and minima with Lagrange multipliers step by step, for 2 or 3 variables and one or two constraints. | Lagrange Multipliers, Step by Step | How does the Lagrange multiplier method work? · Lagrange multiplier with 3 variables? · What does λ mean? · Two constraints? |

#### 6E — Integration techniques

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6E-1 ⭐P19 | integral calculator with steps | integral calculator; integration calculator; integration formulas | /calculus/integral-calculator | Integral Calculator with Steps – Free, No Paywall \| NETZ | Free integral calculator that shows every step and names the method: substitution, by parts, partial fractions. Works on any device. | Integral Calculator with Steps | How do I integrate step by step? · What is the power rule for integrals? · Why add + C? · Which method should I use? |
| 6E-2 | u substitution | integration by substitution; u-sub examples; class 12 | /calculus/integration-by-substitution | Integration by Substitution (u-Sub), Step by Step \| NETZ | Learn u-substitution with worked examples: pick u, change dx, change limits. Class 12 and AP Calculus problems solved. | Integration by Substitution | How do you choose u? · Do I change the limits? · When does substitution fail? · u-sub vs by parts? |
| 6E-3 ⭐P19 | integration by parts | by parts formula in integration; ILATE; tabular; calculator with steps | /calculus/integration-by-parts | Integration by Parts: Formula, ILATE and Steps \| NETZ | Integration by parts formula ∫u dv = uv − ∫v du with the ILATE rule, tabular method and worked examples. Free step-by-step solver. | Integration by Parts | What is the by parts formula? · What is the ILATE rule? · What is tabular integration? · How to integrate eˣ sin x? |
| 6E-4 ⭐P19 | partial fractions | partial fraction calculator; decomposition; integration; class 12 | /calculus/partial-fractions | Partial Fractions Calculator and Integration \| NETZ | Decompose rational functions into partial fractions (linear, repeated, quadratic factors) and integrate them, step by step. | Partial Fractions, Step by Step | How do you do partial fractions? · Repeated linear factors? · Irreducible quadratics? · What if the degree on top is higher? |
| 6E-5 | trig substitution | trigonometric integrals; trig substitution formulas; sin^m cos^n | /calculus/trig-substitution | Trig Substitution and Trig Integrals, Solved \| NETZ | Trig substitution for √(a²−x²), √(a²+x²), √(x²−a²) and integrals of sinᵐx cosⁿx, all solved step by step. | Trigonometric Integrals and Trig Substitution | Which trig substitution should I use? · How to integrate sin³x? · How do I convert back to x? · Trig sub vs u-sub? |
| 6E-6 ⭐P20 | definite integral | definite integral calculator; properties; class 12 | /calculus/definite-integrals | Definite Integral Calculator and Properties \| NETZ | Evaluate definite integrals step by step and use the key properties (King's rule, even/odd, periodic) for Class 12 and JEE. | Definite Integrals and Their Properties | What is a definite integral? · What is the King property? · Even and odd function integrals? · Why no + C? |
| 6E-7 | improper integral | improper integral calculator; first kind; second kind; convergence | /calculus/improper-integrals | Improper Integrals: Convergence, Step by Step \| NETZ | Decide whether an improper integral converges or diverges and evaluate it step by step: infinite limits and discontinuities. | Improper Integrals | What is an improper integral? · First vs second kind? · How to test convergence? · Does ∫1/x from 1 to ∞ converge? |
| 6E-8 | differentiation under integral sign | leibniz integral rule; Feynman trick; solved problems | /calculus/differentiation-under-integral-sign | Differentiation Under the Integral Sign (Leibniz) \| NETZ | Apply Leibniz's rule (Feynman's trick) to evaluate hard integrals, step by step. Solved engineering maths problems. | Differentiation Under the Integral Sign | What is Leibniz's integral rule? · What is Feynman's trick? · When can I differentiate inside? · Variable limits? |
| 6E-9 | reduction formula | reduction formula for sin^n x; cos^n x; tan^n x; Wallis formula | /calculus/reduction-formulae | Reduction Formulae: sinⁿx, cosⁿx, tanⁿx, secⁿx \| NETZ | Reduction formulae for ∫sinⁿx, ∫cosⁿx, ∫tanⁿx and ∫secⁿx, with derivations, Wallis' formula and solved examples. | Reduction Formulae | What is the reduction formula for sinⁿx? · What is Wallis' formula? · How is a reduction formula derived? · For tanⁿx? |

#### 6F — Applications of integrals

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6F-1 ⭐P20 | area between curves | area under the curve; area between curves calculator; area bounded by two curves | /calculus/area-between-curves | Area Between Curves Calculator, Step by Step \| NETZ | Find the area under a curve or between two curves step by step: find intersections, set up the integral, evaluate. Graph included. | Area Under and Between Curves | How do you find the area between two curves? · With respect to y? · What if curves cross? · Why can area integrals be negative? |
| 6F-2 | volume of revolution | disk method; washer method; shell method; about y axis | /calculus/volume-of-revolution | Volume of Revolution: Disk, Washer, Shell \| NETZ | Find volumes of revolution with the disk, washer and shell methods, about the x or y axis, step by step with sketches. | Volume of Revolution | Disk vs washer vs shell? · Rotating about the y-axis? · When is shell easier? · Volume formula about a line? |
| 6F-3 | arc length of a curve | arc length calculator; length of curve calculator; surface area of revolution | /calculus/arc-length-surface-area | Arc Length of a Curve and Surface Area \| NETZ | Find arc length for y = f(x), parametric and polar curves, and surface area of revolution, step by step. | Arc Length and Surface Area of Revolution | What is the arc length formula? · Parametric arc length? · Polar arc length? · Surface area of revolution formula? |
| 6F-4 | average value of a function | average value over an interval; MVT for integrals | /calculus/average-value-function | Average Value of a Function, Step by Step \| NETZ | Find the average value of a function over an interval and the point c from the mean value theorem for integrals, step by step. | Average Value of a Function | What is the average value formula? · What is the mean value theorem for integrals? · Average value vs average rate of change? · Can it be negative? |

#### 6G — Multiple integrals and special functions

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6G-1 ⭐P27 | double integral | double integral calculator; polar coordinates; iterated integral | /calculus/double-integrals | Double Integral Calculator: Cartesian and Polar \| NETZ | Evaluate double integrals step by step in Cartesian or polar coordinates, with the region sketched and limits explained. | Double Integrals, Step by Step | How do you evaluate a double integral? · When should I switch to polar? · Why dx dy = r dr dθ? · Iterated vs double integral? |
| 6G-2 ⭐P27 | change of order of integration | examples; solved problems; change the order of integration | /calculus/change-of-order-of-integration | Change of Order of Integration: Solved Examples \| NETZ | Change the order of integration step by step: sketch the region, find new limits, then evaluate. Solved engineering maths examples. | Change of Order of Integration | Why change the order of integration? · How do you find the new limits? · What if the region splits? · ∫∫e^(y²) example? |
| 6G-3 ⭐P27 | triple integral | triple integral calculator; spherical; cylindrical coordinates | /calculus/triple-integrals | Triple Integrals: Cartesian, Cylindrical, Spherical \| NETZ | Evaluate triple integrals step by step in Cartesian, cylindrical and spherical coordinates, with volume examples. | Triple Integrals | How do you set up a triple integral? · Spherical Jacobian? · Cylindrical vs spherical? · Volume of a sphere by triple integral? |
| 6G-4 | change of variables in double integrals | jacobian examples; transformation | /calculus/change-of-variables | Change of Variables in Multiple Integrals \| NETZ | Transform double and triple integrals with u-v substitutions and the Jacobian, step by step, with engineering maths examples. | Change of Variables (Jacobian Method) | Why multiply by the Jacobian? · How do I choose u and v? · How do the region limits change? · Polar as change of variables? |
| 6G-5 | area by double integration | volume by triple integral; area using double integral | /calculus/area-volume-multiple-integrals | Area and Volume Using Multiple Integrals \| NETZ | Find areas with double integrals and volumes with triple integrals, step by step, with sketches for engineering maths. | Area and Volume by Multiple Integrals | How do you find area with a double integral? · Volume with a triple integral? · Area in polar form? · Volume under a surface? |
| 6G-6 | centre of mass using double integral | moment of inertia of lamina; centroid | /calculus/centre-of-mass-moment-of-inertia | Centre of Mass and Moment of Inertia by Integration \| NETZ | Find the centre of mass, centroid and moment of inertia of a lamina or solid using double and triple integrals, step by step. | Centre of Mass and Moment of Inertia | Centre of mass formula with integrals? · Centroid vs centre of mass? · Moment of inertia of a lamina? · Variable density? |
| 6G-7 ⭐P28 | beta and gamma function | gamma function of 1/2; relation between beta and gamma; beta function formula | /calculus/beta-gamma-functions | Beta and Gamma Functions: Formulas and Solved \| NETZ | Beta and gamma function formulas, properties, Γ(1/2) = √π and the β–Γ relation, with integrals solved step by step. | Beta and Gamma Functions | What is the gamma function? · Why is Γ(1/2) = √π? · Relation between beta and gamma? · Beta function in terms of sin and cos? |

#### 6H — Sequences and series

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6H-1 | series convergence test | series convergence calculator; ratio test; comparison; alternating | /calculus/series-convergence-tests | Series Convergence Tests Calculator, Step by Step \| NETZ | Test a series for convergence step by step: nth term, comparison, ratio, root, integral and alternating tests, and when to use each. | Series Convergence Tests | Which convergence test should I use? · What is the ratio test? · Absolute vs conditional convergence? · What if the ratio test gives 1? |
| 6H-2 | radius of convergence | interval of convergence calculator; power series | /calculus/radius-interval-of-convergence | Radius and Interval of Convergence Calculator \| NETZ | Find the radius and interval of convergence of a power series step by step, including checking the endpoints. | Radius and Interval of Convergence | How do you find the radius of convergence? · Why check the endpoints? · Radius vs interval? · Radius of convergence of a Taylor series? |
| 6H-3 ⭐P23 | taylor series | maclaurin series; taylor series calculator; taylor polynomial; expansion formula | /calculus/taylor-maclaurin-series | Taylor and Maclaurin Series Calculator with Steps \| NETZ | Expand any function as a Taylor or Maclaurin series step by step. Includes sin x, eˣ, log(1+x) and tan x, plus the error term. | Taylor and Maclaurin Series | Taylor vs Maclaurin series? · Maclaurin series of sin x? · How many terms do I need? · What is the remainder term? |
| 6H-4 ⭐P29 | fourier series | half range fourier series; half range sine series; fourier coefficients formula; calculator | /calculus/fourier-series | Fourier Series Calculator: Full and Half Range \| NETZ | Find Fourier series coefficients a₀, aₙ, bₙ step by step, including half-range sine and cosine series. Engineering maths examples. | Fourier Series, Step by Step | How do you find Fourier coefficients? · What is a half-range series? · Even and odd function shortcuts? · Fourier series of a square wave? |
| 6H-5 | parseval's identity | complex fourier series; parseval's theorem for fourier series | /calculus/complex-fourier-parseval | Complex Fourier Series and Parseval's Identity \| NETZ | Write the complex form of a Fourier series and use Parseval's identity to sum series like Σ1/n², step by step. | Complex Fourier Series and Parseval's Identity | What is Parseval's identity? · How to get Σ1/n² = π²/6? · Complex coefficients cₙ? · Real vs complex form? |
| 6H-6 | harmonic analysis in fourier series | harmonic analysis from table; first harmonic | /calculus/harmonic-analysis | Harmonic Analysis: Fourier Series from a Table \| NETZ | Find the Fourier series of tabulated data with harmonic analysis: a₀, a₁, b₁ and amplitude of the first harmonic, step by step. | Harmonic Analysis (Fourier from Data) | What is harmonic analysis? · How to find the first harmonic? · Amplitude of the first harmonic? · How many data points do I need? |

#### 6I — Vector calculus

| ID | Primary | Secondary | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ questions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 6I-1 ⭐P30 | gradient divergence curl | directional derivative; del operator; curl of a vector field | /calculus/gradient-divergence-curl | Gradient, Divergence and Curl Calculator \| NETZ | Compute grad, div and curl and directional derivatives step by step, with formulas and the physical meaning of each. | Gradient, Divergence, Curl and Directional Derivative | What is the difference between grad, div and curl? · How do you find a directional derivative? · Max directional derivative? · Is curl a vector? |
| 6I-2 | solenoidal and irrotational vector | scalar potential; conservative field | /calculus/solenoidal-irrotational-fields | Solenoidal and Irrotational Fields, Scalar Potential \| NETZ | Check whether a vector field is solenoidal (div = 0) or irrotational (curl = 0) and find its scalar potential, step by step. | Solenoidal and Irrotational Vector Fields | What is a solenoidal vector? · What is an irrotational field? · How to find the scalar potential? · Can a field be both? |
| 6I-3 | line integral of vector field | work done line integral; path independence | /calculus/line-integrals | Line Integrals and Work Done, Step by Step \| NETZ | Evaluate line integrals of scalar and vector fields along curves, and find work done by a force, step by step. | Line Integrals and Work Done | How do you evaluate a line integral? · Work done by a force? · When is a line integral path-independent? · Closed curve integral? |
| 6I-4 | surface integral | surface integral of a vector field; flux; volume integral | /calculus/surface-volume-integrals | Surface and Volume Integrals (Flux), Step by Step \| NETZ | Evaluate surface integrals (flux) and volume integrals of vector fields step by step, with projection onto coordinate planes. | Surface and Volume Integrals | What is a surface integral? · How to find flux? · How do I project onto the xy-plane? · Surface vs volume integral? |
| 6I-5 ⭐P30 | verify green's theorem | stokes theorem; gauss divergence theorem; verify stokes theorem; divergence theorem | /calculus/green-stokes-gauss-theorems | Verify Green's, Stokes' and Gauss Theorems \| NETZ | Verify Green's, Stokes' and Gauss divergence theorems step by step: both sides computed and compared. Engineering maths examples. | Green's, Stokes' and Gauss Divergence Theorems | What does Green's theorem say? · Stokes vs divergence theorem? · How do you verify Stokes' theorem? · When to use the divergence theorem? |

### Gaps
- Title and meta character counts are approximate, from manual counting; run a length check before publishing. Titles with "∣ NETZ" may exceed 60 with the brand suffix. If so, drop the suffix (Google adds the site name anyway).
- The NETZ URL prefix (`/calculus/…`) is assumed. Match the app's actual route scheme.
- For India-only items (6B-4, 6B-5, 6B-6, 6D-2, 6D-5, 6E-9, 6G-2, 6H-6, 6I-5), consider adding "Class 12" or "Engineering Maths" to the title in place of "Step by Step". The autocomplete evidence supports this; it is not volume-verified.
