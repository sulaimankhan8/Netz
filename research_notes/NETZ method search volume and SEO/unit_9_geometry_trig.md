# Unit 9: Geometry and trigonometry (9A–9M): search volume and SEO specs

Research date: 2026-11-03. Scope: every item in Unit 9 of `NETZ_METHODS_CATALOG.md` (9A–9M) plus ⭐ rows P47–P53. All are planned (none built yet).

**Data sources used and what each one means**
- **seodata.dev (US)**: monthly average US searches from the Google Ads API, per its keyword pages. Each page shows its own "updated" date (May–Oct 2026). The "competition" figure on those pages is *paid-ads* competition, not SEO difficulty. Pages: `https://www.seodata.dev/keyword/<slug>`.
- **Wikipedia pageviews (global English proxy)**: en.wikipedia, all-access, user agents, sum of Nov 2025–Oct 2026 (12 months), from `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/<Article>/monthly/2025110100/2026103100`. This shows interest in the concept worldwide. It is **not** search volume.
- **Google autocomplete**: `suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in|us&q=…`, fetched 2026-11-03. India (`gl=in`) for 50 seeds, US (`gl=us`) for 10 seeds.
- **Not obtained**: India and global keyword volumes. The seodata.dev API (`api.seodata.dev/v1/keyword?...&country=in`) hit its anonymous 20-a-day limit on 2026-11-03. More lookups need an email sign-up, which I did not do. Ahrefs' free generator page returned no data without JavaScript. Semrush public pages show only site-level traffic. No live Google SERP or "People also ask" data could be collected, because the web search tool is not Google.

---

## Q1. Monthly search volume per item (US, India, global)

### Takeaway
On US Google, the **formula** queries for each shape are bigger than any **calculator** query: "area of a circle" 165K, "distance formula" 165K, "slope formula" 90.5K, "midpoint formula" 90.5K. The "X calculator" terms sit at 10K–60K: triangle calculator 60.5K, volume calculator 40.5K, slope calculator 40.5K, pythagorean theorem calculator 40.5K, area calculator 27.1K. The unit circle is by far the biggest single term at **823K US/mo**. I could not get India or global keyword volumes; the global column uses Wikipedia pageviews as a stand-in.

### Cited findings: US volumes (seodata.dev, Google Ads API, US monthly average)

| Item | Keyword | US /mo | seodata page updated | Notable variants (US /mo, same source) |
| :--- | :--- | ---: | :--- | :--- |
| 9A circle | area of circle | 74,000 | 2026-06-07 | area of a circle **165,000**; circle area formula / formula for area of a circle 49,500 — [seodata](https://www.seodata.dev/keyword/area-of-circle) |
| 9A circle | circumference of circle | 18,100 | 2026-06-13 | circumference of a circle 165,000; circumference 90,500; circumference formula 60,500 — [seodata](https://www.seodata.dev/keyword/circumference-of-circle) |
| 9A triangle | area of a triangle | 74,000 | 2026-06-07 | area of triangle 60,500; area of a triangle formula 49,500 — [seodata](https://www.seodata.dev/keyword/area-of-a-triangle) |
| 9A trapezium | area of trapezoid | 27,100 | 2026-05-16 | area of a trapezoid 60,500; area of trapezoid formula 40,500; how to find area of a trapezoid 27,100 — [seodata](https://www.seodata.dev/keyword/area-of-trapezoid) |
| 9A parallelogram | area of parallelogram | 18,100 | 2026-05-16 | the area of a parallelogram 49,500; how to find the area of a parallelogram 14,800; area formula parallelogram 12,100 — [seodata](https://www.seodata.dev/keyword/area-of-parallelogram) |
| 9A sector | area of sector | 14,800 | 2026-06-07 | area of a sector of a circle 14,800; area of sector formula 14,800 — [seodata](https://www.seodata.dev/keyword/area-of-sector) |
| 9A arc | arc length | 12,100 | 2026-05-25 | arc length formula **49,500**; how to find arc length 9,900 — [seodata](https://www.seodata.dev/keyword/arc-length) |
| 9A hub | area calculator | 27,100 | 2026-06-08 | calculate area 2,400; area map calculator 2,400; square area calculator 1,300 — [seodata](https://www.seodata.dev/keyword/area-calculator) |
| 9B sphere | volume of sphere | 49,500 | API cache 2026-09-30 | volume of a sphere **74,000**; volume of sphere formula 40,500 (from the `api.seodata.dev` cached reply) |
| 9B pyramid | volume of pyramid | 9,900 | 2026-10-04 | volume of a pyramid 18,100; pyramid volume formula 14,800 — [seodata](https://www.seodata.dev/keyword/volume-of-pyramid) |
| 9B hub | volume calculator | 40,500 | 2026-07-13 | calculate volume 40,500; volume calculator gallons 4,400; cubic volume calculator 3,600; volume of water calculator 2,900 — [seodata](https://www.seodata.dev/keyword/volume-calculator) |
| 9B hub | surface area calculator | 9,900 | 2026-08-08 | calculating surface area 12,100; surface area calculator prism 1,300; cube surface area calculator 880 — [seodata](https://www.seodata.dev/keyword/surface-area-calculator) |
| 9C | pythagorean theorem calculator | 40,500 | 2026-08-08 | pythagorean calculator 40,500; pythagorean theorem solver 1,900; pythagoras calculator 590 — [seodata](https://www.seodata.dev/keyword/pythagorean-theorem-calculator) |
| 9C | special right triangles | 27,100 | 2026-09-25 | special triangles 8,100; special right triangles formula/rules 2,900 — [seodata](https://www.seodata.dev/keyword/special-right-triangles) |
| 9D | triangle calculator | 60,500 | 2026-08-08 | triangle solver 60,500; right triangle calculator **40,500**; triangle angle calculator 9,900 — [seodata](https://www.seodata.dev/keyword/triangle-calculator) |
| 9D | law of sines | 60,500 | 2026-05-26 | sine law 60,500; law of sines formula 5,400 — [seodata](https://www.seodata.dev/keyword/law-of-sines) |
| 9E | unit circle | **823,000** | 2026-07-19 | unit circle chart 27,100; trigonometric unit circle 8,100; unit circle quadrants 2,900; unit circle sin 1,900 — [seodata](https://www.seodata.dev/keyword/unit-circle) |
| 9G | inverse trig functions | 22,200 | 2026-05-20 | inverse trigonometric functions 22,200; inverse trig 18,100; inverse trig identities 2,400 — [seodata](https://www.seodata.dev/keyword/inverse-trig-functions) |
| 9H | slope formula | 90,500 | 2026-09-29 | calculating slope 40,500; slope equation 14,800; slope of a line 9,900 — [seodata](https://www.seodata.dev/keyword/slope-formula) |
| 9H | slope calculator | 40,500 | 2026-08-08 | calculator for slope 49,500; slope calculator graph 2,400; find slope calculator 1,900 — [seodata](https://www.seodata.dev/keyword/slope-calculator) |
| 9H | distance formula | 165,000 | 2026-06-21 | distance between two points formula 6,600; distance formula geometry 4,400 — [seodata](https://www.seodata.dev/keyword/distance-formula) |
| 9H | distance formula calculator | 9,900 | 2026-06-21 | distance between 2 points calculator 8,100; distance between two points calculator 4,400 — [seodata](https://www.seodata.dev/keyword/distance-formula-calculator) |
| 9H | midpoint formula | 90,500 | 2026-05-21 | midpoint 12,100; what is a midpoint formula 3,600 — [seodata](https://www.seodata.dev/keyword/midpoint-formula) |
| 9H | midpoint calculator | 9,900 | 2026-05-24 | midpoint formula calculator 1,600; find the midpoint calculator 590 — [seodata](https://www.seodata.dev/keyword/midpoint-calculator) |
| 9I | equation of a circle | 40,500 | 2026-05-26 | equation of circle 40,500; formula of a circle 27,100; circle equation 18,100 — [seodata](https://www.seodata.dev/keyword/equation-of-a-circle) |
| 9J | conic sections | 8,100 | 2026-10-03 | conic section 8,100; conic 6,600; equation of conic section 1,900 — [seodata](https://www.seodata.dev/keyword/conic-sections) |
| 9J | ellipse calculator | 1,300 | 2026-10-30 | ellipse solver 1,300; ellipse equation calculator 390; standard form of an ellipse calculator 90 — [seodata](https://www.seodata.dev/keyword/ellipse-calculator) |
| 9M | angle of elevation | 12,100 | 2026-06-21 | angle of depression 12,100; angle of depression and elevation 5,400 — [seodata](https://www.seodata.dev/keyword/angle-of-elevation) |

US terms with **no data**: seodata.dev showed "No search data" (not yet cached, which does not mean zero) or the site rate-limited me: volume of cylinder, volume of cone, volume of frustum, volume of hemisphere, surface area of cylinder/cone/sphere, area of rhombus, area of ellipse, heron's formula, perimeter, pythagorean theorem, right triangle calculator (but it appears as a 40,500 variant above), law of cosines, sohcahtoa, radians to degrees, trig identities, trigonometric identities, unit circle chart (but it appears as a 27,100 variant above), parabola calculator, polar coordinates, polar to rectangular, trig calculator.

### Cited findings: global English interest proxy (Wikipedia pageviews, en, user, Nov 2025–Oct 2026 total)

| Article | 12-month views | Avg/mo | Maps to |
| :--- | ---: | ---: | :--- |
| List of trigonometric identities | 565,544 | ~47.1K | 9F |
| Pythagorean theorem | 545,557 | ~45.5K | 9C |
| Ellipse | 251,635 | ~21.0K | 9J / 9A ellipse |
| Inverse trigonometric functions | 194,528 | ~16.2K | 9G |
| Parabola | 186,025 | ~15.5K | 9J |
| Sphere | 177,782 | ~14.8K | 9B |
| Trapezoid | 162,735 | ~13.6K | 9A |
| Slope | 149,936 | ~12.5K | 9H |
| Law of cosines | 148,898 | ~12.4K | 9D |
| Radian | 147,051 | ~12.3K | 9E |
| Polar coordinate system | 145,244 | ~12.1K | 9L |
| Unit circle | 134,645 | ~11.2K | 9E |
| Conic section | 129,318 | ~10.8K | 9J |
| Hyperbola | 126,620 | ~10.6K | 9J |
| Heron's formula | 120,727 | ~10.1K | 9A / 9D |
| Volume | 110,129 | ~9.2K | 9B |
| Law of sines | 94,175 | ~7.8K | 9D |
| Cone | 86,442 | ~7.2K | 9B |
| Area | 72,866 | ~6.1K | 9A |
| Frustum | 59,807 | ~5.0K | 9B |
| Special right triangle | 29,378 | ~2.4K | 9C |
| Surface area | 27,259 | ~2.3K | 9B |
| Circular sector | 24,359 | ~2.0K | 9A |
| Direction cosine | 20,799 | ~1.7K | 9K |
| Solution of triangles | 16,514 | ~1.4K | 9D |

Source: [Wikimedia Pageviews REST API](https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Unit_circle/monthly/2025110100/2026103100), with the article name changed for each row. Fetched 2026-11-03.

### Inferences
- **The unit circle (823K US) is NETZ's largest geometry/trig opportunity.** Its Wikipedia views are modest (~11K/mo), so most searchers want a chart or tool, not an article. A visual, interactive, printable page fits that.
- Trig identities have the most Wikipedia views of any Unit 9 topic (565K/yr). The US keyword volume is unknown, but the "sheet / cheat sheet / table / pdf" autocomplete shows reference-page intent. **Estimate (not measured):** probably tens of thousands US/mo, given that its Wikipedia views exceed those of the Pythagorean theorem article, whose calculator alone is 40.5K US.
- Google Ads groups close variants, so "area of circle" 74K and "area of a circle" 165K are probably overlapping buckets, not additive. Treat the larger number as the topic ceiling.
- **India (not measured, inferred from autocomplete):** Indian suggestions are full of "ka formula", "kya hota hai", "in hindi", "class 9/10/11/12", "NCERT", "ICSE", "ML Aggarwal". India demand runs through **formula + class + NCERT**, not "calculator". NCERT-only topics (section formula, heights and distances, direction cosines, inverse trig class 12, conic sections class 11) have small US numbers but strong Indian autocomplete.

### Gaps
- India and global keyword volumes for every term (seodata.dev API rate limit; it needs an email sign-up, which I did not do). The owner could register at seodata.dev (free, 500 lookups/mo) or use Google Keyword Planner with location = India.
- US volumes for cylinder, cone, frustum, hemisphere, surface-area-per-shape, rhombus, ellipse area, Heron's formula, Pythagorean theorem, law of cosines, SOHCAHTOA, radians to degrees, trig identities, polar coordinates.

---

## Q2. Difficulty, top 3 results, Google calculator box and AI Overview

### Takeaway
I could not measure SEO difficulty or see live Google SERPs. What I could find: Google has a **built-in geometry "Solve for" calculator** for formula queries such as "area of a circle", and the non-Google search tool puts Omni, gigacalculator, inchcalculator and calculatorsoup on top for calculator queries. Treat every shape-formula keyword as high difficulty with a zero-click risk.

### Cited findings
- Google Help: "You can find geometry formulas and answers to complex geometry problems using Google Search", with an "Enter value" box and a "Solve for" dropdown. Example query: "Area of a circle." — [Google Search Help](https://support.google.com/websearch/answer/3284611?hl=en) (no date shown; ©2026).
- Search Engine Land reported Google's calculator solving geometry queries such as [area of a circle] (an older article; the current list of shapes is unknown) — [Search Engine Land](https://searchengineland.com/google-can-now-solve-geometry-math-questions-187118) (the page returned 403 on fetch; I saw only the search snippet).
- Top results for "volume of cone calculator" (non-Google engine, US, 2026-11-03): helpingwithmath.com, gigacalculator.com, inchcalculator.com, then omnicalculator.com/math/cone-volume and onlinemschool — [helpingwithmath](https://helpingwithmath.com/math-calculators/cone-volume-calculator/), [gigacalculator](https://www.gigacalculator.com/calculators/volume-of-cone-calculator.php), [inchcalculator](https://www.inchcalculator.com/cone-volume-calculator), [Omni](https://www.omnicalculator.com/math/cone-volume). Several results were spam pages on hijacked subdomains (e.g. desafio.sebraemg.com.br).
- Top results for "triangle calculator law of sines cosines" (same engine): Pearson channels calculator, calculate.co.nz, then Omni and calculatorsoup — [Pearson](https://www.pearson.com/channels/ko-kr/calculators/law-of-cosines-calculator), [calculate.co.nz](https://www.calculate.co.nz/law-of-sines-cosines-calculator.php), [calculatorsoup](https://www.calculatorsoup.com/calculators/geometry-plane/triangle-law-of-cosines.php), [Omni](https://omnicalculator.com/math/law-of-sines). num8ers.com's law-of-sines tool handles the ambiguous SSA case — [num8ers](https://num8ers.com/tools/law-of-sines-calculator/).
- "unit circle chart" on the same engine returned almost only spam printable-chart pages on hijacked domains. That says little about Google's own ranking — [example](https://server2.radiookapi.net/wiki/chart/unit-circle-chart.html).
- Semrush: calculator.net gets about 56.1M visits/mo (Sep 2025), about 46% of them from Google organic; its closest competitors are calculatorsoup, omnicalculator and gigacalculator — [Semrush calculator.net](https://cw.semrush.com/website/calculator.net/overview), [Semrush competitors](https://www.semrush.com/website/calculator.net/competitors/).
- US Google autocomplete itself offers "pythagorean theorem calculator **google**" and "right triangle calculator **google**". Users expect Google's own tool (autocomplete, 2026-11-03).

### Inferences
- **Difficulty (estimate, not measured):** "area of a circle", "distance formula", "slope formula", "pythagorean theorem calculator" and "triangle calculator" = **very high** (domain-authority sites plus Google's own widget). NCERT-style terms (section formula class 10, heights and distances class 10, direction cosines, shortest distance between two lines) = **medium**: they are dominated by BYJU'S/Cuemath/Vedantu/Toppr-type sites, which a new domain still finds hard. Long-tail step terms ("triangle calculator with steps", "ellipse calculator with steps", "parabola calculator with steps") = **lower**, and they fit NETZ's differentiator.
- **AI Overview:** I could not observe it. Pure "what is the formula for…" queries are the classic AI Overview / featured-snippet type, so expect zero-click there. NETZ's edge is the **worked steps + diagram** that a snippet can't show.

### Gaps
- Real Google top 3, SERP features and AI Overview presence per keyword (no Google SERP access). Check them manually in an incognito window from India and the US, or with Search Console after launch.
- Ahrefs/Semrush keyword difficulty scores (paywalled or needing JavaScript).

---

## Q3. "People also ask" and autocomplete

### Takeaway
I could not collect "People also ask" data. Autocomplete (India + US, 2026-11-03) shows three intents: **formula** ("… formula", "ka formula"), **school level** ("class 9/10/11/12", "NCERT", "ICSE") and **variants of the input** ("with diameter", "with slant height", "with 3 sides", "feet and inches", "rise over run"). The FAQs below are built from these suggestions.

### Cited findings: Google autocomplete (`suggestqueries.google.com`, client=firefox, 2026-11-03)

| Seed | Region | Suggestions (abridged) |
| :--- | :---: | :--- |
| area of circle | IN | formula, ka formula, with diameter, calculator, and circumference, kya hota hai, in hindi |
| area of circle | US | formula, with diameter, calculator, equation, with circumference, given diameter |
| area of triangle | IN | formula, in coordinate geometry, with 3 sides formula, in determinant form, when coordinates are given |
| area of trapezium | IN | formula, formula class 9/8/10, ka formula, formula without height |
| area of rhombus | IN | formula, with diagonals, when side and diagonal is given, class 9 |
| area of parallelogram | IN | formula, in vector, in terms of diagonal, using diagonals |
| area of sector | IN | of a circle, formula, in radians, formula class 10, when arc length is given |
| arc length | IN | formula, of a circle, calculator, formula radians, formula class 10, of a sector |
| area of ellipse | IN | formula, using integration, derivation, using double integration, calculator |
| heron's formula | IN | class 9, question, calculator, for area of triangle, examples with solutions |
| perimeter of | IN | rectangle, triangle, square, circle, semicircle, rhombus, equilateral triangle, sector |
| area calculator | IN | for land, feet and inches, map, in square feet, for 4 different sides, google maps |
| volume of cylinder | IN | formula, and cone, ka formula, calculator, in litres, with diameter, m3, and hemisphere |
| volume of cone | IN | formula, and cylinder, ka formula, and hemisphere, with slant height, class 10, derivation, frustum |
| volume of cone | US | formula, equation, and cylinder, calculator, with top cut off, with slant height, derivation |
| volume of sphere | IN | formula, ka formula, and hemisphere, calculator, in terms of diameter, derivation |
| volume of frustum | IN | of cone, of cone formula, of pyramid, calculator, derivation, of square pyramid |
| volume of hemisphere | IN | formula, and cylinder, and cone, formula class 10, hollow, calculator, bowl |
| volume of pyramid | IN | formula, with square base, with triangular base, with rectangular base, and prism |
| surface area of cylinder | IN | formula, calculator, and cone, without top and bottom, in diameter |
| surface area of cone | IN | formula, and cylinder, and hemisphere, derivation, without base, class 10 |
| volume calculator | IN | in litres, cylinder, tank, in feet, in m3, cuboid |
| pythagoras theorem | IN | formula, in hindi, questions, hypotenuse formula, class 10, proof |
| pythagorean theorem | US | calculator, pronunciation, worksheet, examples, proof, formula, calculator angle |
| pythagorean theorem calculator | IN | angle, find c, find b, feet and inches, google, find a |
| right triangle calculator | IN | with angles, inches, area, feet and inches, sides, google, trig, with hypotenuse |
| triangle calculator | IN | area, right angle, 3 sides, angle, app, in feet, area with 3 sides |
| triangle calculator | US | right angle, angle, area, height, 3 sides, inches, feet and inches, isosceles |
| triangle solver | IN | app, calculator, right angle, online |
| law of sines | IN | formula, and cosines, class 11, class 11 physics, vectors, proof, derivation |
| law of cosines | US | formula, calculator, and sines, proof, vectors, formula for angle, examples |
| sine rule | IN | of triangle, and cosine rule, formula, and circumradius, in hindi, proof, area of triangle, 2R |
| sohcahtoa | IN | meaning, pronunciation, worksheet pdf, trigonometry, formula, calculator, table |
| unit circle | IN | trigonometry, meaning, diagram, chart, pdf, radians, values, tan, formula |
| unit circle | US | chart, radians, tan, with tangent, quiz, game, practice, with sin cos tan |
| radians to degrees | IN | (calculator answer "= 57.2957795 degrees"), formula, calculator, minutes seconds, in excel |
| trig identities | IN | class 10/11/12, sheet, formulas, cheat sheet, worksheet pdf, table, pythagorean |
| trig identities | US | sheet, cheat sheet, derivatives, integrals, for calc 2, pdf, quizlet |
| inverse trig | IN | formula, class 12, functions, ncert solutions, table, differentiation formula |
| inverse trigonometric functions | IN | class 12, formulas, graph, differentiation, derivatives, domain and range |
| slope calculator | IN | for ramp, online, in ratio, for roof, formula, rise over run |
| slope calculator | US | rise over run, percentage, construction, with two points, feet, golf, roof, ramp |
| distance formula | IN | in coordinate geometry, physics, class 10, class 9, speed time |
| distance formula | US | geometry, physics, between two points, calculator, 3d, worksheet |
| midpoint formula | IN | class 9, of coordinate geometry, class 10, and distance formula, and section formula |
| section formula | IN | class 10, in coordinate geometry, class 9, for external division, ml aggarwal, in vectors |
| equation of a circle | IN | formula, general form, standard form, passing through origin, in 3d, polar form |
| conic sections | IN | class 11, formulas, in hindi, pdf, ncert solutions, all formulas, notes, weightage in nda |
| parabola calculator | IN | graph, from points, with vertex and point, online, **with steps**, desmos |
| ellipse calculator | IN | circumference, graph, area, **with steps**, equation, perimeter |
| hyperbola calculator | IN | graph, equation, foci, asymptote, eccentricity, vertices |
| direction cosines | IN | of a vector, formula, and direction ratios, of a line, formula class 12 |
| shortest distance between two lines | IN | in 3d, formula, cartesian form, vector form, class 12, skew |
| polar to cartesian | IN | conversion, coordinates, form, complex numbers, formula, equation, calculator, 3d |
| polar to rectangular | US | coordinates, calculator, formula, equation, form, complex numbers, converter |
| polar coordinates | IN | formula, system, in 3d, to cartesian, meaning, grapher, graph |
| heights and distances | IN | class 10, class 10 icse, in trigonometry, worksheet with answers, cbse, ml aggarwal |
| angle of elevation | IN | and depression, in hindi, in projectile motion, of sun, formula, class 10 |

### Inferences
- **Indian searches often mean physics, not maths**: "law of sines class 11 physics", "law of cosines vectors", "distance formula speed time". Distance and slope pages should open with a "coordinate geometry" qualifier so they don't fight the physics intent.
- Combination queries ("volume of cone and hemisphere", "cylinder and cone") come from NCERT class 10 "combination of solids" problems. That points to a **combined-solids** feature or FAQ.
- "with steps" appears for parabola and ellipse calculators: the long-tail where NETZ can win.

### Gaps
- "People also ask" questions (no Google SERP access). The FAQs below are drawn from autocomplete instead and are marked as such.

---

## Q4. One page per shape or one hub?

### Takeaway
**Use both: a page per shape, plus two hubs (2D and 3D) that link to them.** The per-shape formula keywords add up to far more than the hub keywords: area of a circle 165K + area of a triangle 74K + trapezoid 60.5K + parallelogram 49.5K + sector 14.8K + arc length formula 49.5K, against "area calculator" 27.1K. The same holds for 3D: volume of a sphere 74K alone, against "volume calculator" 40.5K. The leaders follow the same pattern (Omni's URLs are `/math/cone-volume` and so on).

### Cited findings
- Hub terms (US): area calculator 27,100; volume calculator 40,500; surface area calculator 9,900 — [seodata area](https://www.seodata.dev/keyword/area-calculator), [seodata volume](https://www.seodata.dev/keyword/volume-calculator), [seodata surface area](https://www.seodata.dev/keyword/surface-area-calculator).
- Per-shape terms (US): see the Q1 table. Each of circle, triangle, trapezoid, parallelogram and sphere alone is at or above the area-calculator hub.
- Omni uses one URL per shape, e.g. `/math/cone-volume` — [Omni](https://www.omnicalculator.com/math/cone-volume).
- The hub terms carry non-maths intent: "area calculator for land / google maps / from image" (IN), "volume calculator gallons / tank / water" (US), "slope calculator roof / ramp / golf" (US). These are hard for a maths site to satisfy (autocomplete; seodata related keywords).

### Inferences (recommendation)
- **Per-shape pages, each covering one shape's area + perimeter (2D) or volume + surface area (3D).** Each page targets "area of X" or "volume of X" first, with "formula" and "calculator" as secondaries, because formula intent is 2–5× calculator intent. Reason: Google ranks one URL per intent, and "volume of cone" ≠ "volume of sphere".
- **Two hubs**: `/area-perimeter-calculator` and `/volume-surface-area-calculator`. They target the hub keywords and act as internal-link indexes (shape picker cards linking to each page).
- **Split one shape into two pages only when the variant is itself a big keyword**: circumference (165K "circumference of a circle") gets its own page, separate from area of a circle. Arc length (49.5K "arc length formula") gets its own page, separate from sector area. Heron's formula gets its own page (Wikipedia 121K/yr; India "class 9"). Frustum gets its own page (NCERT class 10; "volume of frustum of cone" IN). Hemisphere: a section on the sphere page plus its own slug only if Search Console later shows demand (estimate).
- **Low-demand shapes stay as sections of the hub** (estimate: no data): regular polygon, prism.
- One step engine can render all the pages; the risk is "near-copy template text" (catalog item 9). Give each page a unique worked example, a unique diagram and a unique FAQ.
- The `MathSolver` JSON-LD and a diagram are the main ways to beat Google's own widget.

### Gaps
- Real Google SERP check that Google's widget appears for each shape (not observed).

---

## Q5. SEO spec per item

### Takeaway
Ready-to-use specs below. Primary keywords follow the larger US formula/variant volume, adjusted for India (trapezium, NCERT class names). Titles and metas were drafted to the ≤60 / ≤155 character limits. FAQs come from autocomplete (Q3), not PAA.

Format: Title ≤60 chars, meta ≤155 chars. "— NETZ" is used only where the title has room.

### 9A — 2D shapes (one page per shape + hub)

| Item | Primary kw (US vol) | Secondary kws | Slug | Title | Meta description | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9A hub | area calculator (27.1K) | perimeter calculator, area and perimeter, area of shapes | `/area-perimeter-calculator` | Area and Perimeter Calculator with Steps — NETZ | Find the area and perimeter of any 2D shape: circle, triangle, trapezium, rhombus and more. Pick a shape, enter sides, see every step. | Area and Perimeter Calculator | What is the difference between area and perimeter? · How do I find the area of an irregular shape? · Which units is area measured in? · How do I convert cm² to m²? |
| Circle area | area of a circle (165K) | area of circle formula (49.5K), area of circle with diameter, area of circle calculator, πr² | `/area-of-circle` | Area of a Circle Calculator: Formula πr² with Steps | Find the area of a circle from radius, diameter or circumference. Uses A = πr² and shows each step with a labelled diagram. | Area of a Circle Calculator | What is the formula for area of a circle? · How do I find area with the diameter? · How do I find area from circumference? · Why is area πr²? |
| Circumference | circumference of a circle (165K) | circumference formula (60.5K), perimeter of circle, circumference calculator | `/circumference-of-circle` | Circumference of a Circle Calculator (2πr) with Steps | Find the circumference (perimeter) of a circle from radius, diameter or area using C = 2πr = πd, with each step shown. | Circumference of a Circle Calculator | What is the formula for circumference? · Is circumference the same as perimeter? · How do I find radius from circumference? · What is the perimeter of a semicircle? |
| Triangle area | area of a triangle (74K) | area of triangle formula (49.5K), area of triangle with 3 sides, ½ × base × height, area from coordinates | `/area-of-triangle` | Area of a Triangle Calculator: ½bh, Heron, ½ab sin C | Find a triangle's area from base and height, three sides (Heron), two sides and an angle, or coordinates. Every step shown. | Area of a Triangle Calculator | What is the formula for area of a triangle? · How do I find area with 3 sides? · How do I find area from coordinates? · What is the area of an equilateral triangle? |
| Heron's formula | heron's formula (no US data; Wiki 121K/yr) | heron's formula class 9, heron's formula calculator, area of triangle with 3 sides | `/herons-formula` | Heron's Formula Calculator with Steps (Class 9) | Find a triangle's area from its three sides with Heron's formula. Get s = (a+b+c)/2 and √[s(s−a)(s−b)(s−c)] worked out step by step. | Heron's Formula Calculator | What is Heron's formula? · What is s in Heron's formula? · When do we use Heron's formula? · Can Heron's formula be used for a right triangle? |
| Square / rectangle | perimeter of rectangle (no data) | area of rectangle, area of square, perimeter of square, diagonal of rectangle | `/area-of-rectangle-square` | Area and Perimeter of Rectangle and Square Calculator | Find the area, perimeter and diagonal of a rectangle or square from its sides, with each step shown. Also finds a side from the area. | Rectangle and Square Area Calculator | What is the formula for perimeter of a rectangle? · How do I find a side from area? · How do I find the diagonal of a rectangle? · Is a square a rectangle? |
| Trapezium | area of a trapezoid (60.5K US); trapezium (IN) | area of trapezium formula, trapezoid area formula (40.5K), perimeter of trapezium | `/area-of-trapezium` | Area of Trapezium (Trapezoid) Calculator with Steps | Find the area of a trapezium (trapezoid) with A = ½(a+b)h. Also finds the height or a missing side, with every step shown. | Area of a Trapezium Calculator | What is the formula for area of a trapezium? · How do I find the area without the height? · Trapezium vs trapezoid: what is the difference? · How do I find the height of a trapezium? |
| Parallelogram | the area of a parallelogram (49.5K) | area of parallelogram formula, using diagonals, in vector form | `/area-of-parallelogram` | Area of a Parallelogram Calculator: Formula and Steps | Find a parallelogram's area from base and height, two sides and an angle, or diagonals. Every step shown with a diagram. | Area of a Parallelogram Calculator | What is the formula for area of a parallelogram? · How do I find area using diagonals? · How do I find area with vectors? · Is the area of a parallelogram base × side? |
| Rhombus | area of rhombus (no US data) | area of rhombus with diagonals, perimeter of rhombus, area of rhombus when side is given | `/area-of-rhombus` | Area of a Rhombus Calculator: Diagonals or Side | Find a rhombus's area from its diagonals (½d₁d₂), side and height, or side and angle, plus its perimeter. Each step shown. | Area of a Rhombus Calculator | What is the formula for area of a rhombus? · How do I find area when the side and one diagonal are given? · How do I find the perimeter of a rhombus? · Is a rhombus a parallelogram? |
| Sector | area of a sector (14.8K) | area of sector formula, in radians, sector perimeter | `/area-of-sector` | Area of a Sector Calculator: Degrees or Radians | Find a sector's area with (θ/360)πr² or ½r²θ, plus its arc length and perimeter. Degrees or radians, every step shown. | Area of a Sector Calculator | What is the formula for area of a sector? · How do I find area in radians? · How do I find area when the arc length is given? · What is the perimeter of a sector? |
| Arc length | arc length formula (49.5K) | arc length (12.1K), length of arc, arc length calculator, arc length in radians | `/arc-length` | Arc Length Calculator: Formula s = rθ with Steps | Find the arc length of a circle from radius and angle in degrees or radians: s = rθ or (θ/360)·2πr, with each step shown. | Arc Length Calculator | What is the formula for arc length? · How do I find arc length in degrees? · How do I find the angle from arc length? · What is the difference between arc length and chord length? |
| Regular polygon | (no data; estimate low) | area of hexagon, area of pentagon, interior angle of polygon | section in hub, `/area-perimeter-calculator#regular-polygon` | — (hub section) | — | Regular Polygon Area | How do I find the area of a regular hexagon? · What is the apothem? · Sum of interior angles of a polygon? |
| Ellipse area | area of ellipse (no US data; Wiki "Ellipse" 252K/yr) | area of ellipse formula, perimeter of ellipse, ellipse circumference | `/area-of-ellipse` | Area and Perimeter of an Ellipse Calculator (πab) | Find the area of an ellipse with A = πab and its perimeter with Ramanujan's approximation, from the semi-axes. Each step shown. | Area of an Ellipse Calculator | What is the formula for area of an ellipse? · Is there an exact formula for an ellipse's perimeter? · How is the area derived by integration? · What are the semi-major and semi-minor axes? |

### 9B — 3D shapes (one page per shape: volume + surface area + hub)

| Item | Primary kw (US vol) | Secondary kws | Slug | Title | Meta description | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9B hub | volume calculator (40.5K) | surface area calculator (9.9K), calculate volume (40.5K), volume and surface area | `/volume-surface-area-calculator` | Volume and Surface Area Calculator with Steps — NETZ | Find the volume, curved and total surface area of a cube, cuboid, cylinder, cone, sphere, frustum and more. Every step shown. | Volume and Surface Area Calculator | How do I convert cm³ to litres? · What is the difference between CSA, LSA and TSA? · How do I find the volume of combined solids? · Which units is volume measured in? |
| Cube / cuboid | (no data) | volume of cuboid, surface area of cube (880 for "cube surface area calculator"), diagonal of cube | `/volume-of-cube-cuboid` | Volume and Surface Area of Cube and Cuboid Calculator | Find the volume, total and lateral surface area and diagonal of a cube or cuboid from its edges, with every step shown. | Cube and Cuboid Calculator | What is the formula for volume of a cuboid? · What is the TSA of a cube? · What is the lateral surface area of a cuboid? · How do I find the diagonal of a cuboid? |
| Cylinder | volume of cylinder (no data; likely large, estimate) | volume of cylinder formula, in litres, with diameter, surface area of cylinder, CSA of cylinder | `/volume-of-cylinder` | Volume of a Cylinder Calculator: πr²h, CSA and TSA | Find the volume of a cylinder (πr²h), its curved surface area (2πrh) and total surface area, in cm³ or litres. Each step shown. | Volume of a Cylinder Calculator | What is the formula for volume of a cylinder? · How do I find the volume with the diameter? · How do I convert the volume to litres? · What is the surface area without top and bottom? · What is the volume of a hollow cylinder? |
| Cone | volume of cone (no data; Wiki Cone 86K/yr) | volume of cone formula, with slant height, surface area of cone, slant height l = √(r²+h²) | `/volume-of-cone` | Volume of a Cone Calculator: ⅓πr²h with Steps | Find the volume of a cone (⅓πr²h), its slant height, curved surface area (πrl) and total surface area, with every step shown. | Volume of a Cone Calculator | What is the formula for volume of a cone? · How do I find the volume with slant height? · Why is a cone ⅓ of a cylinder? · What is the curved surface area of a cone? |
| Frustum | volume of frustum of cone (no data) | frustum of cone formula, frustum calculator, frustum of pyramid, class 10 | `/volume-of-frustum` | Frustum of a Cone Calculator: Volume and Surface Area | Find the volume ⅓πh(R²+Rr+r²), slant height, CSA and TSA of a frustum (cone with its top cut off). Every step shown. | Frustum of a Cone Calculator | What is the formula for volume of a frustum? · How do I find the slant height of a frustum? · What is the CSA of a frustum? · How do I find the volume of a frustum of a pyramid? |
| Sphere (+ hemisphere) | volume of a sphere (74K) | volume of sphere formula (40.5K), surface area of sphere, volume of hemisphere, sphere calculator | `/volume-of-sphere` | Volume of a Sphere Calculator: 4/3πr³ and Hemisphere | Find the volume (4/3πr³) and surface area (4πr²) of a sphere or hemisphere from the radius or diameter, with each step shown. | Volume of a Sphere Calculator | What is the formula for volume of a sphere? · How do I find the volume from the diameter? · What is the volume of a hemisphere? · What is the TSA of a hemisphere? · How do I find the radius from volume? |
| Pyramid | volume of a pyramid (18.1K) | pyramid volume formula (14.8K), square base, triangular base, surface area of pyramid | `/volume-of-pyramid` | Volume of a Pyramid Calculator: ⅓ × Base × Height | Find the volume and surface area of a square, rectangular or triangular pyramid from base and height, with every step shown. | Volume of a Pyramid Calculator | What is the formula for volume of a pyramid? · Volume of a square pyramid? · Volume of a triangular pyramid? · How do I find slant height of a pyramid? |
| Prism | (no data; estimate low) | volume of prism, triangular prism, surface area calculator prism (1.3K) | hub section, `/volume-surface-area-calculator#prism` | — | — | Volume of a Prism | What is the formula for volume of a prism? · Volume of a triangular prism? · Surface area of a prism? |

### 9C–9E — Right triangles, any triangle, unit circle

| Item | Primary kw (US vol) | Secondary kws | Slug | Title | Meta description | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9C Pythagoras (P49) | pythagorean theorem calculator (40.5K) | pythagoras theorem, pythagoras theorem formula, hypotenuse calculator, find c/a/b | `/pythagoras-theorem` | Pythagorean Theorem Calculator: Find a, b or c | Find the hypotenuse or a missing side of a right triangle with a² + b² = c². Every step shown, with a diagram and a check. | Pythagorean Theorem Calculator | What is the Pythagoras theorem formula? · How do I find the hypotenuse? · How do I find a missing leg? · How do I check if a triangle is right-angled? · What are Pythagorean triples? |
| 9C right triangle / SOHCAHTOA | right triangle calculator (40.5K) | sohcahtoa, right triangle calculator with angles, trig ratios, sin cos tan | `/right-triangle-calculator` | Right Triangle Calculator with Steps (SOH-CAH-TOA) | Solve any right triangle from two values: sides, angles, area and height with SOH-CAH-TOA and Pythagoras. Every step shown. | Right Triangle Calculator | What does SOH-CAH-TOA mean? · How do I find an angle in a right triangle? · How do I find a side with one angle? · Which trig ratio should I use? |
| 9C special triangles | special right triangles (27.1K) | 30-60-90 triangle, 45-45-90 triangle, special triangles rules | `/special-right-triangles` | Special Right Triangles: 30-60-90 and 45-45-90 | Solve 30-60-90 and 45-45-90 triangles from one side using the 1 : √3 : 2 and 1 : 1 : √2 ratios, with steps and diagrams. | Special Right Triangles Calculator | What are the rules for a 30-60-90 triangle? · What are the side ratios of a 45-45-90 triangle? · How do I find the hypotenuse of a 45-45-90 triangle? · Why are they called special? |
| 9D triangle solver (P48) | triangle calculator (60.5K) | triangle solver (60.5K), sine rule, cosine rule, SSS SAS ASA AAS SSA, triangle angle calculator (9.9K) | `/triangle-calculator` | Triangle Calculator: Solve Any Triangle with Steps | Solve any triangle from 3 values (SSS, SAS, ASA, AAS, SSA) using the sine and cosine rules. Shows the ambiguous case, area and each step. | Triangle Calculator (Triangle Solver) | Which rule do I use, sine or cosine? · What is the ambiguous case (SSA)? · How do I find all angles from 3 sides? · How do I find the area with 2 sides and an angle? |
| 9D sine rule | law of sines (60.5K) | sine rule, sine law, law of sines formula (5.4K), sine rule 2R | `/sine-rule` | Law of Sines (Sine Rule) Calculator with Steps | Use a/sin A = b/sin B = c/sin C = 2R to find missing sides and angles, including the ambiguous SSA case, with every step shown. | Law of Sines (Sine Rule) Calculator | What is the sine rule formula? · When do I use the law of sines? · What is the ambiguous case? · What is 2R in the sine rule? |
| 9D cosine rule | law of cosines (no US data; Wiki 149K/yr) | cosine rule, law of cosines formula for angle, law of cosines calculator | `/cosine-rule` | Law of Cosines (Cosine Rule) Calculator with Steps | Find a missing side (SAS) or an angle (SSS) with c² = a² + b² − 2ab cos C. Every step shown, with a labelled triangle. | Law of Cosines (Cosine Rule) Calculator | What is the cosine rule formula? · How do I find an angle with the cosine rule? · When do I use cosine vs sine rule? · How does it relate to Pythagoras? |
| 9E unit circle (P47) | unit circle (823K) | unit circle chart (27.1K), unit circle radians, unit circle tan, unit circle values, trigonometric unit circle (8.1K) | `/unit-circle` | Unit Circle Chart: Sin, Cos, Tan in Degrees and Radians | Interactive unit circle: pick any angle to see sin, cos and tan in degrees and radians, with exact values, quadrant signs and a printable chart. | Unit Circle: Interactive Chart | How do I remember the unit circle? · What are the coordinates on the unit circle? · How do I find tan on the unit circle? · Which functions are positive in each quadrant (ASTC)? · Why is the radius 1? |
| 9E radians ↔ degrees | radians to degrees (no data; Wiki Radian 147K/yr) | degrees to radians, radian formula, radians to degrees calculator | `/radians-to-degrees` | Radians to Degrees Converter (and Degrees to Radians) | Convert radians to degrees (×180/π) and degrees to radians (×π/180), with exact π answers and every step shown. | Radians to Degrees Converter | How do I convert radians to degrees? · What is 1 radian in degrees? · How do I convert degrees to radians in terms of π? · Why use radians? |
| 9E trig values / graphs | trig values (no data) | sin cos tan table, trig table, trig graphs | `/trig-values-table` (or a section of `/unit-circle`) | Trigonometry Table: Sin, Cos, Tan Values 0°–360° | Exact sin, cos, tan, cosec, sec and cot values for 0°, 30°, 45°, 60°, 90° and beyond, with graphs and how to derive them. | Trigonometric Ratios Table | What is the value of sin 30°? · How do I remember the trig table? · What are the graphs of sin, cos and tan? |

### 9F–9G — Identities, equations, inverse trig

| Item | Primary kw (vol) | Secondary kws | Slug | Title | Meta description | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9F identities | trig identities (no US data; Wiki 566K/yr, the top Unit 9 article) | trigonometric identities class 10/11, trig identities sheet, cheat sheet, compound angle formulas | `/trig-identities` | Trig Identities: Formula Sheet and Step-by-Step Prover | All trig identities in one sheet (Pythagorean, compound, double and half angle), plus a tool that proves an identity step by step. | Trigonometric Identities | What are the 3 Pythagorean identities? · What is the sin(A+B) formula? · How do I prove a trig identity? · What are the double angle formulas? · Class 10 vs class 11 identities? |
| 9F equations | trigonometric equations general solution (no data; NCERT 11) | general solution of trig equations, solve sin x = k | `/trig-equations` | Trigonometric Equations Solver: General Solution | Solve trig equations like sin x = ½ or 2cos²x − 1 = 0 and get the principal and general solutions (nπ ± α) with every step. | Trigonometric Equation Solver | What is the general solution of sin x = sin α? · Principal vs general solution? · How do I solve tan x = k? |
| 9G inverse trig | inverse trigonometric functions (22.2K US) | inverse trig (18.1K), inverse trig identities (2.4K), principal value, class 12 formulas | `/inverse-trigonometric-functions` | Inverse Trig Functions: Principal Values and Formulas | Find principal values of sin⁻¹, cos⁻¹ and tan⁻¹, with the domain and range table, class 12 identities and step-by-step solutions. | Inverse Trigonometric Functions | What is the principal value of sin⁻¹x? · What are the domain and range of inverse trig functions? · What is tan⁻¹x + tan⁻¹y? · Is sin⁻¹x the same as 1/sin x? |

### 9H–9M — Coordinate, circles, conics, 3D, polar, heights

| Item | Primary kw (US vol) | Secondary kws | Slug | Title | Meta description | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 9H slope (P52) | slope formula (90.5K) | slope calculator (40.5K), slope of a line, gradient of a line, rise over run, with two points | `/slope-calculator` | Slope Calculator: Slope Formula from Two Points | Find the slope (gradient) of a line from two points with m = (y₂−y₁)/(x₂−x₁), plus the line's equation and angle, with steps. | Slope Calculator (Slope of a Line) | What is the slope formula? · How do I find slope from two points? · What does a negative slope mean? · How do I convert slope to an angle? |
| 9H distance | distance formula (165K) | distance between two points (6.6K formula), distance formula calculator (9.9K), 3D distance | `/distance-formula` | Distance Formula Calculator: Between Two Points | Find the distance between two points in 2D or 3D with d = √[(x₂−x₁)² + (y₂−y₁)²], every step shown on a graph. | Distance Formula Calculator | What is the distance formula? · How is it related to Pythagoras? · Distance between two points in 3D? · Distance from a point to a line? |
| 9H midpoint + section | midpoint formula (90.5K) | midpoint calculator (9.9K), section formula (IN class 10), internal/external division | `/midpoint-section-formula` | Midpoint and Section Formula Calculator with Steps | Find the midpoint of two points, or the point dividing a line in ratio m:n internally or externally (section formula), with steps. | Midpoint and Section Formula Calculator | What is the midpoint formula? · What is the section formula? · How do I find the ratio a point divides a line in? · External division formula? |
| 9H line equations | equation of a line (no data) | slope-intercept form, point-slope form, two-point form, angle between lines, perpendicular distance | `/equation-of-line` | Equation of a Line Calculator: All Forms with Steps | Find a line's equation in slope-intercept, point-slope, two-point and intercept form, plus the angle between lines and point-to-line distance. | Equation of a Line Calculator | How do I find the equation of a line from two points? · What is point-slope form? · How do I find the angle between two lines? · Distance of a point from a line? |
| 9H triangle area from coordinates | area of triangle when coordinates are given (IN autocomplete) | area of triangle in coordinate geometry, determinant form | section of `/area-of-triangle` + link from `/equation-of-line` | — | — | — | How do I find the area of a triangle from coordinates? · Determinant form? · How do I check if 3 points are collinear? |
| 9I circles | equation of a circle (40.5K) | equation of circle, circle equation (18.1K), general form, centre and radius, tangent to circle | `/equation-of-circle` | Equation of a Circle Calculator: Centre, Radius, 3 Points | Find a circle's equation from its centre and radius or three points, convert general ↔ standard form, and get tangent and chord steps. | Equation of a Circle Calculator | What is the standard form of a circle's equation? · How do I find the centre and radius from the general form? · Circle through 3 points? · Equation of a tangent to a circle? |
| 9J conics hub (P53) | conic sections (8.1K) | conic sections class 11, formulas, eccentricity, focus directrix | `/conic-sections` | Conic Sections Calculator: Parabola, Ellipse, Hyperbola | Find the focus, directrix, eccentricity, vertices and latus rectum of any parabola, ellipse or hyperbola, with a graph and every step. | Conic Sections Calculator | What are conic sections? · What is eccentricity? · How do I identify a conic from its equation? · What is the latus rectum? |
| 9J parabola | parabola calculator (no data; Wiki 186K/yr) | parabola calculator with steps (IN), focus and directrix of parabola, vertex | `/parabola-calculator` | Parabola Calculator: Focus, Directrix, Vertex, Steps | Enter y² = 4ax or any parabola to get the vertex, focus, directrix, axis and latus rectum, with a graph and every step. | Parabola Calculator | How do I find the focus of a parabola? · What is the directrix? · What is the latus rectum of y² = 4ax? · Vertex form of a parabola? |
| 9J ellipse | ellipse calculator (1.3K) | ellipse calculator with steps, foci of ellipse, eccentricity of ellipse | `/ellipse-calculator` | Ellipse Calculator: Foci, Vertices, Eccentricity, Graph | Enter an ellipse equation to get the centre, foci, vertices, eccentricity, latus rectum, area and graph, with each step shown. | Ellipse Calculator | How do I find the foci of an ellipse? · What is the eccentricity of an ellipse? · What is the latus rectum of an ellipse? · Ellipse vs circle? |
| 9J hyperbola | hyperbola calculator (no data; Wiki 127K/yr) | hyperbola foci calculator, asymptote, eccentricity, vertices | `/hyperbola-calculator` | Hyperbola Calculator: Foci, Asymptotes, Graph, Steps | Enter a hyperbola equation to get the centre, vertices, foci, asymptotes, eccentricity and latus rectum, with a graph and every step. | Hyperbola Calculator | How do I find the asymptotes of a hyperbola? · What is the eccentricity of a hyperbola? · How do I find the foci? · What is a rectangular hyperbola? |
| 9K 3D geometry | direction cosines (no data; Wiki 21K/yr) | shortest distance between two lines (IN), equation of plane, angle between line and plane, distance point plane | `/3d-geometry-calculator` | 3D Geometry Calculator: Lines, Planes, Shortest Distance | Find direction cosines, line and plane equations, angles, the shortest distance between skew lines and point–plane distance, with steps (Class 12). | 3D Geometry Calculator | What are direction cosines and direction ratios? · Shortest distance between two lines formula? · Distance of a point from a plane? · Angle between a line and a plane? |
| 9L polar | polar to cartesian (no data; Wiki 145K/yr) | polar to rectangular (US), cartesian to polar, polar coordinates calculator, rotation of axes | `/polar-to-cartesian` | Polar to Cartesian Converter (and Back) with Steps | Convert polar (r, θ) to Cartesian (x, y) and back with x = r cos θ, y = r sin θ, r = √(x²+y²). Each step and a graph shown. | Polar ↔ Cartesian Converter | How do I convert polar to Cartesian? · How do I convert Cartesian to polar? · How do I get θ in the right quadrant? · How do I convert a polar equation? |
| 9M heights and distances | angle of elevation (12.1K) | angle of depression (12.1K), heights and distances class 10, trigonometry word problems | `/heights-and-distances` | Heights and Distances: Angle of Elevation Calculator | Solve angle of elevation and depression problems (class 10): draw the triangle, pick tan, sin or cos, and see every step. | Heights and Distances Calculator | What is the angle of elevation? · Angle of elevation vs depression? · How do I find the height of a tower? · Which trig ratio do heights and distances use? |

### Inferences
- **Ship first (biggest US numbers, plus strong India signals):** `/unit-circle`, `/area-of-circle`, `/distance-formula`, `/slope-calculator`, `/midpoint-section-formula`, `/area-of-triangle`, `/volume-of-sphere`, `/triangle-calculator`, `/sine-rule`, `/pythagoras-theorem`, `/area-of-trapezium`, `/equation-of-circle`. This matches catalog Batch 1 (9A–9E, 9H). 9I (circles, 40.5K US) is in Batch 2 but has more demand than several Batch 1 items.
- The catalog's "Area 27K" and "Volume 40.5K" figures understate the opportunity. Per-shape terms add up to several hundred thousand US/mo. The catalog's 823K (unit circle), 60.5K (triangle), 40.5K (Pythagoras calculator, slope calculator) all match seodata.dev. "Distance 33.1K" in the catalog matches seodata's "distance calculator" 33,100, but "distance formula" is 165K, so the page should target "distance formula".
- On the unit circle page, lead with the **chart** (an image with alt text plus a printable PDF), because "chart / diagram / pdf / quiz / game" dominate autocomplete.

### Gaps
- Title and meta lengths were machine-checked (all titles ≤60, all metas ≤155 characters, 2026-11-03). Google cuts titles by pixel width, so check how they display on a phone.
- No "People also ask" data; the FAQs come from autocomplete.
- India volumes would show whether India-first slugs (trapezium vs trapezoid, "class 10" in titles) are worth it. Running Keyword Planner with India selected would settle this.
