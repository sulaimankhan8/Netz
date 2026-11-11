# NETZ Competitor Landscape (as of 2026-11-03)

Scope: step-by-step solvers, niche numerical-methods calculators, graphing/visual tools, handwriting math and notes apps, Indian edtech, gamified-learning references, and gaps NETZ could fill.
Method note: about 17 searches and fetches. Many pricing numbers come from third-party aggregators (subger, myengineeringbuddy, aisotools), and these often disagree. They are marked as such. Indian rupee prices were rarely published, and every missing one is listed as a gap.

## 1. Step-by-step math solvers (Symbolab, Mathway, Photomath, Microsoft Math Solver, Wolfram|Alpha, Gauthmath, Chegg, Brainly, Socratic, Doubtnut, Filo)

### Takeaway
Mainstream solvers target school algebra and calculus homework, and the sector is shrinking or merging. Microsoft Math Solver was retired in July 2025. Socratic has had no updates since 2020, and Photomath is being folded into Google Lens. Chegg lost about 31% of its subscribers in a year to free generative AI. Doubtnut was bought by Allen. Wolfram|Alpha is the only big solver with real numerical-methods coverage, at about ₹5,800/yr for students on the Indian App Store. None was shown to produce exam-style full iteration tables.

### Cited Findings
**Microsoft Math Solver**
- The standalone Microsoft Math (Solver) was retired on 7 July 2025 — [Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Math_Solver); same date on [AlternativeTo](https://alternativeto.net/software/microsoft-math/about)
- Math Solver had already been removed from the Edge browser (policy deprecated; a forum post gave the date as 30 Sep 2023 and pointed users to mathsolver.microsoft.com) — [Microsoft Tech Community](https://techcommunity.microsoft.com/t5/discussions/math-solver-is-amazing/m-p/3933991)
- Non-English reports say the features moved into OneNote's Math Assistant. I could not confirm this from an English Microsoft source — [ithome](https://www.ithome.com/0/860/969.htm)

**Photomath and Socratic (Google)**
- Google closed its acquisition of Photomath after regulatory review. Coverage says Photomath features will be folded into Lens and Search — [9to5Google, Feb 2024](https://9to5google.com/2024/02/29/photomath-google-app/)
- Socratic has had no updates since 2020, which suggests Google shifted to Photomath. Its technology powered the Lens Homework filter — [9to5Google](https://9to5google.com/2024/02/29/photomath-google-app/)
- Third-party price for Photomath Plus is about $9.99/mo or $59.99–69.99/yr; the sources conflict — [Subger](https://subger.com/vi/service/photomath-plus). Google's help page describes the plan but gives no amounts — [Google Support](https://support.google.com/photomath/answer/14330572?hl=bg)

**Symbolab**
- Pro costs $6.99/mo, $24.90 for 6 months or $29.99/yr. The free tier now has daily limits (third-party blog, updated July 2026) — [myengineeringbuddy](https://www.myengineeringbuddy.com/blog/symbolab-math-solver-reviews-alternatives-pricing/)
- A different listing gives $9.99/mo, so the prices are inconsistent — [toolfox](https://toolfox.ru/services/s/symbolab)

**Wolfram|Alpha**
- Wolfram|Alpha has dedicated numerical-approximation calculators covering Runge–Kutta, bisection, Newton's method, secant and integration methods — [Wolfram|Alpha calculators](https://es6.wolframalpha.com/calculators/mathematics-calculus-numerical-approximation-methods)
- Pro for Students on the App Store: $9.99/mo or $59.99/yr; Indian App Store student yearly plan ₹5,800 — [App Store IN](https://apps.apple.com/in/app/id548861535); [WebSearch summary of App Store snapshot, Mar 2026]
- Web student price about $5/mo vs $7.25 regular (third-party); 30% student discounts through UNiDAYS and Student Beans — [Subger](https://subger.com/en/service/wolfram-alpha-pro); [Wolfram promotions](https://www.wolfram.com/promotions-discounts-offers)

**Chegg**
- Q1 2025: subscribers fell 31% to 3.2M and revenue fell 30% to $121M. Chegg cut 22% of staff (about 248 people) in May 2025 and is closing its US and Canada offices — [Maginative](https://www.maginative.com/article/chegg-slashes-22-of-workforce-amid-ai-disruption-in-edtech/)
- Chegg's FY2025 10-K blames generative AI adoption for its losses and expects new-subscriber declines to accelerate — [SEC 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1364954/000136495426000021/chgg-20251231.htm)
- More cuts were reported in October 2025 ("nearly half" of staff, per the headline), which I could not verify — [Tech.co](https://tech.co/news/chegg-fires-half-workforce-new-realities-ai)

**Brainly and Doubtnut (India)**
- Brainly laid off almost all of its roughly 30-person India team in Nov 2022 and made Brainly.in free — [Business Today](https://www.businesstoday.in/technology/story/ed-tech-company-brainly-fires-almost-full-india-team-working-from-bengaluru-nearly-30-of-them-352056-2022-11-07)
- Doubtnut was acquired by Allen Career Institute in Dec 2023 after cutting 30–40% of its workforce — [CB Insights](https://www.cbinsights.com/company/doubtnut); [Finshots](https://finshots.in/archive/what-killed-doubtnut/)

### Inferences
- Generic solvers are being commoditised by free LLMs and Google Lens. Competing head-on on "snap and solve" is a losing position. NETZ's niche (university numerical methods, iteration tables, code and LaTeX export) sits where general solvers are weak.
- Wolfram|Alpha is the strongest substitute for numerical methods, but at about ₹5,800/yr it is far above what Indian students typically pay.
- Free LLM chatbots (ChatGPT, Gemini) are probably the biggest de facto substitute: students paste a question and get iterations back. They do this without guaranteed arithmetic accuracy or a consistent table format. This is inference; I found no source measuring student use for numerical methods specifically.

### Gaps
- I found no rupee prices for Symbolab, Mathway, Photomath, Gauthmath or Filo. Gauthmath (ByteDance) and Filo returned nothing relevant.
- Whether Symbolab or Mathway produce full Newton-Raphson or bisection iteration tables was not confirmed; the search returned no Symbolab pages.
- Whether mathsolver.microsoft.com still works after July 2025 is unconfirmed.
- Socratic's current app-store status is unconfirmed: still listed, or removed?

## 2. Niche numerical-methods calculators (atozmath, planetcalc, mathportal, emathhelp, keisan, USF Holistic Numerical Methods, GeeksforGeeks/Programiz)

### Takeaway
AtoZmath (an Indian-made site) is NETZ's closest functional competitor. It covers nearly every university numerical-methods topic: about 11 root-finding methods, 20+ interpolation variants, integration rules up to Weddle's, and Euler/RK/Milne for ODEs. It is free and ad-funded, with a dated UI. Its owner even advertises the site and its code for sale.

### Cited Findings
- AtoZmath's numerical-methods menu covers:
  - root finding: Bisection, False Position, Fixed Point, Newton-Raphson, Secant, Muller, Halley, Steffensen, Ridder, Birge-Vieta, Bairstow, multivariate N-R
  - interpolation: Newton forward/backward/divided difference, Lagrange, Gauss, Stirling, Bessel, Everett, Hermite, cubic spline
  - differentiation: 2–5 point formulas and Richardson extrapolation
  - integration: trapezoidal, Simpson 1/3 and 3/8, Boole, Weddle
  - ODEs: Euler, RK2/3/4, Taylor, Adams-Bashforth, Milne
  - — [atozmath menu](https://atozmath.com/Menu/ConmMenu.aspx)
- AtoZmath earns money from ads (its cookie notice mentions "relevant advertising"), shows no premium tier, and has a "Support us" link plus a link offering to sell the website with its complete code — [atozmath menu](https://atozmath.com/Menu/ConmMenu.aspx)
- planetcalc hosts tagged root-finding calculators (e.g. bisection and Newton) — [planetcalc](https://embed.planetcalc.com/search/?tag=2880)
- dCode has a Newton-Raphson tool — [dcode.fr](https://www.dcode.fr/newton-raphson-method)
- Vedantu publishes explanatory bisection-method pages, i.e. Indian edtech competing for SEO on method-name queries — [Vedantu](https://seo-fe.vedantu.com/maths/bisection-method)

### Inferences
- The "sell website with complete code" link suggests AtoZmath may be a one-person project with an uncertain future. That opens room for a modern, mobile-first, maintained replacement, but it also means a buyer (e.g. an edtech company) could revive it.
- Students already search by method name ("Newton Raphson calculator"), so SEO method pages are the main acquisition channel. NETZ's 34 method pages map directly onto that intent.

### Gaps
- No traffic estimates (Similarweb/Semrush) were retrieved for atozmath, planetcalc, mathportal, emathhelp, keisan, USF Holistic Numerical Methods, GeeksforGeeks or Programiz. I ran out of research budget.
- Whether AtoZmath's output uses an exam-style table layout was not confirmed from the menu page.

## 3. Graphing and visual tools (Desmos, GeoGebra, VisuAlgo, Algorithm Visualizer)

### Takeaway
GeoGebra and Desmos are free, huge and the default for graphing. Neither is built for step-by-step numerical-methods tables. Their user counts are loosely defined.

### Cited Findings
- GeoGebra claims "over 100 million" users, but this is a cumulative or unique-visitor style figure. An older handout separated 100M+ unique visitors from 10M+ monthly active users — [eLearningInside](https://news.elearninginside.com/despite-clearing-100-million-users-geogebra-remains-true-to-its-founders-vision/); [EdTech Hub](https://docs.edtechhub.org/lib/ZBF3WBEE)
- Semrush has a desmos.com competitor page (Dec 2025), but the snippets showed no visit numbers — [Semrush](https://www.semrush.com/website/desmos.com/competitors/)

### Inferences
- NETZ should treat graphing as a feature to embed (plotting f(x) beside the iterations) rather than a battleground.

### Gaps
- No current Desmos user count. VisuAlgo and Algorithm Visualizer were not researched (budget), so they need a follow-up.

## 4. Handwriting math and notes (GoodNotes, Notability, OneNote, Samsung Notes, Apple Math Notes, MyScript/Nebo, Mathpix)

### Takeaway
Handwritten math is now built into platforms: Apple Math Notes on iPadOS 18 solves expressions when you write "=". OneNote reportedly absorbed Microsoft Math. MyScript (Nebo was renamed MyScript Notes in Sep 2025) solves simple calculations and exports LaTeX. All of them stop at arithmetic or algebra. None runs a numerical method or produces an iteration table from handwriting, and Apple's version is iPad and iPhone only.

### Cited Findings
- Apple Math Notes (iPadOS 18) solves handwritten expressions once "=" is written. It supports variables and graphs, works like a scientific calculator, and saves results in Notes — [Macworld](https://www.macworld.com/article/2362395/ipados-18-calculator-math-notes-apple-pencil-handwriting-equations.html); [AppleInsider](https://appleinsider.com/articles/24/07/17/apple-executives-talk-about-the-origins-of-math-notes-in-ipados-18)
- One report says it does not solve equations for unknowns (e.g. x²−4=0); this conflicts with other coverage — [AppleMagazine](https://applemagazine.com/ios-18-math-notes-apple-notes/)
- Nebo was renamed MyScript Notes in Sep 2025. It is free with in-app purchases (US: $14.99, $9.99 and $7.99 tiers), handles multi-line math and matrices, solves simple calculations and copies math as LaTeX — [App Store](https://apps.apple.com/us/app/myscript-nebo-note-taking-for-apple-pencil/id1119601770); [MyScript help](https://help.myscript.com/notes/versions/android/)
- Mathpix Snip Pro costs $4.99/mo (1,000 PDF pages and 5,000 images); yearly billing gives two months free; the free tier is about 10 snips (conflicting reports) — [Mathpix pricing](https://mathpix.com/pricing/snip); [aisotools](https://aisotools.com/blog/mathpix-review-2026)

### Inferences
- NETZ's playground (works on any device, finger or pen, browser-based, numerical-method solving from handwriting) does not overlap with Apple Math Notes, which needs Apple hardware. Most Indian students use Android phones, so a web or Android experience is a real differentiator. This is inference; I didn't source Indian device share.
- Mathpix is the reference for handwriting-to-LaTeX. NETZ's LaTeX export overlaps with it, at a lower price point.

### Gaps
- GoodNotes, Notability and Samsung Notes math features and INR pricing were not researched. OneNote Math Assistant's current status was not confirmed from Microsoft.

## 5. Indian edtech (Unacademy, PhysicsWallah/GATE Wallah, Testbook, Made Easy, Gate Smashers)

### Takeaway
Indian GATE platforms sell video batches and test series in the ₹700–₹32,000 range, typically around ₹10–13k a batch. No evidence was found that they offer interactive numerical-methods calculators. They are content and coaching competitors, and possible partners or acquirers, not tool competitors.

### Cited Findings
- PW GATE Wallah: CS & IT batches at ₹9,999–₹12,999 (regular ₹25,999). GATE Test Series 2026 at ₹699 (from ₹1,000). NIRMAAN batch ₹29,000–₹32,000. Prices are per batch, with frequent festival offers — [PW GATE offers](https://www.pw.live/gate/exams/pw-gate-ese-offer); [PW Oct 2026 batch](https://www.pw.live/gate/exams/pw-gate-wallah-october-2026-batch-launch)
- Unacademy GATE Plus subscription advertised at ₹9,999 — [Unacademy GATE offer](https://unacademy.com/content/gate-offer/)

### Inferences
- The price anchor for Indian engineering students is about ₹700 for a test series and about ₹10k a year for full coaching. A NETZ premium tier at roughly ₹49–149/month sits comfortably below that, but it competes with "free + ads" AtoZmath and free LLMs.

### Gaps
- Testbook, Made Easy and Gate Smashers (YouTube-led, free) were not researched. I found no evidence that any of them has interactive calculators; this absence is unverified.

## 6. Gamified learning references (Duolingo, Brilliant, LeetCode)

### Takeaway
Duolingo shows that streaks and gamification scale: 50.5M daily active users, 135M monthly active users and 11.5M paid subscribers in Q3 2025. Brilliant shows that interactive STEM learning can charge premium prices in the US ($30/mo, $240/yr), but no India price was found.

### Cited Findings
- Duolingo Q3 2025: 50.5M daily active users (+36% YoY), 135.3M monthly active users (+20%), 11.5M paid subscribers — [Duolingo press release](https://duolingo.gcs-web.com/news-releases/news-release-details/duolingo-surpasses-50-million-daily-active-users-grows-dau-36); [SEC 8-K](https://www.sec.gov/Archives/edgar/data/1562088/000162828025049514/q3fy25duolingo9-30x25press.htm)
- Brilliant Premium (US web): $30/month or $240/year; regional prices differ — [Brilliant help](https://brilliant.org/help/pricing-and-plans/how-much-does-brilliant-premium-cost/)

### Inferences
- NETZ's tasks, streaks, medals and gems copy a proven retention pattern. Its differentiator is applying it to exam-semester numerical methods, where usage spikes before exams. Streaks may need "exam season" framing.

### Gaps
- No India pricing or users for Brilliant. LeetCode streak and pricing data were not researched.

## 7. Gaps in the market and where NETZ could differentiate

### Takeaway
No product found combines (a) university numerical methods, (b) iteration tables in Indian exam format, (c) handwriting input on Android or web, (d) code and LaTeX export, and (e) rupee freemium pricing. The closest competitors are AtoZmath (coverage, but dated and possibly for sale) and Wolfram|Alpha (power, but expensive and not exam-formatted).

### Cited Findings
- AtoZmath covers the syllabus breadth, but it is ad-only and its owner offers to sell the site — [atozmath](https://atozmath.com/Menu/ConmMenu.aspx)
- Wolfram|Alpha has the numerical-method calculators but costs ₹5,800/yr for students in India — [Wolfram calculators](https://es6.wolframalpha.com/calculators/mathematics-calculus-numerical-approximation-methods); [App Store IN](https://apps.apple.com/in/app/id548861535)
- Handwriting solvers (Apple Math Notes, MyScript) stop at calculator or simple-algebra level — [Macworld](https://www.macworld.com/article/2362395/ipados-18-calculator-math-notes-apple-pencil-handwriting-equations.html); [App Store MyScript](https://apps.apple.com/us/app/myscript-nebo-note-taking-for-apple-pencil/id1119601770)
- Incumbent solvers are retreating: Microsoft Math retired, Chegg shrinking, Socratic stalled — [Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Math_Solver); [Maginative](https://www.maginative.com/article/chegg-slashes-22-of-workforce-amid-ai-disruption-in-edtech/)

### Inferences
- Differentiators to lean into:
  1. Iteration tables formatted like Indian university (AKTU, VTU, Mumbai Univ and similar) answer scripts, which students can copy into exams.
  2. Handwriting input for numerical methods on cheap Android phones.
  3. Code export (C, Python, MATLAB) for lab practicals.
  4. LaTeX export for assignments.
  5. Rupee pricing far below Wolfram.
  6. Offline or PWA support for poor connectivity. Offline support is a hypothesis; no source confirmed it as a gap.
- Main threats:
  1. Free LLMs giving tables on demand.
  2. AtoZmath being bought and modernised.
  3. Google folding Photomath step-by-step into Lens.
  4. Policy risk if Google AI Overviews absorb "Newton Raphson calculator" search traffic. Chegg's lawsuit against Google shows how much this hurt content sites.

### Gaps
- Not verified: no Reddit or Quora student reviews were gathered. I found no source directly confirming that "nobody gives Indian exam-format iteration tables"; this is inferred from feature lists.
