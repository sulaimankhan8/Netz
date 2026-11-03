# NETZ methods catalog — Units 10 (Interest and finance) and 11 (Taxes): search volume and SEO spec

Research date: 2026-11-03. Method list from `NETZ_METHODS_CATALOG.md` (Unit 10 sub-parts 10A–10H, Unit 11 sub-parts 11A–11I, and ⭐ rows P54–P61). All are planned (none built).

**How volumes were gathered (read this first)**
- **Volumes:** the seodata.dev REST API (`api.seodata.dev/v1/keyword?q=…&country=…`), queried on 2026-11-03. Each answer gives the date seodata cached the number, which ranged from 2026-05-15 to 2026-10-19. These are Google Ads-style monthly averages, rounded to Google's buckets (e.g. 2,400 / 9,900 / 40,500 / 201,000 / 301,000). The anonymous limit ran out after about 30 lookups, so some keywords have no measured number. Those are marked **"not measured"** or **"estimate"**.
- **Close variants are pooled.** Google Ads groups word-order variants, so "calculator emi" and "emi calculator" get the same number. Treat the head number as the whole cluster, not one exact phrase. One inconsistency: "emi calculator" (IN) returned 3,350,000 as the main result and 2,740,000 inside another keyword's "similar" list.
- **Autocomplete:** `suggestqueries.google.com/complete/search?client=firefox&hl=en&gl={in,us,gb}`, fetched 2026-11-03. The `gl` parameter only partly regionalises results.
- **SERP top results:** the only search tool available was US-only web search, not a live google.co.in results page. So "top results" below means the sites that appeared for the query, plus the dominant players named in the brief. They are **not** verified Google India positions. AI Overview and Google calculator-box presence could not be checked (see Gaps).

---

## 1. Monthly search volume for the main keyword and variants

### Takeaway
Indian personal-finance calculators have very large head volumes: SIP about 4.1M, EMI about 3.35M, percentage 550K, FD 450K, compound interest 368K, PPF and income tax 301K each, GST 246K (seodata.dev, IN). The "formula / how to calculate" variants that suit a learning site are much smaller but still real. Examples: compound interest formula 246K IN and 74K US, simple interest formula 90.5K IN, EMI formula 6.6K IN, how to calculate EMI 5.4K IN, how to calculate GST 6.6K IN, HRA calculation 90.5K IN. Appraisal tools are small: NPV 9.9K US / 1.9K IN, IRR 12.1K US / 9.9K IN, depreciation 6.6K US / 3.6K IN. Bill discounting is tiny (about 200–320 per month IN).

### Cited Findings

**Unit 10 — Interest and finance** (all figures from [seodata.dev API](https://www.seodata.dev), queried 2026-11-03; cache date in brackets)

| Calculator (catalog) | Keyword | Region | Volume / mo | Notable variants (same source and region) |
| :--- | :--- | :---: | ---: | :--- |
| 10A Percentage (P54) | percentage calculator | IN | 550,000 (2026-09-15) | percentage formula calculator 12,100; percentage calculator online 9,900 |
| 10A Percentage | percentage calculator | US | 673,000 | percentages calculator 74,000; percentage of a number calculator 27,100 |
| 10A Profit/loss, discount | profit and loss formula; discount calculator | IN | **not measured** (rate limit) | autocomplete IN leads with "profit and loss formula", "…questions", "…formula in hindi" |
| 10B Simple interest (P55) | simple interest formula | IN | 90,500 | formula of interest 12,100; simple interest 22,200 |
| 10B Simple interest | simple interest calculator | IN | 49,500 | monthly simple interest calculator 880; simple interest formula calculator 720 |
| 10B Compound interest (P55) | compound interest calculator | IN | 368,000 (2026-08-24) | compound interest calculator daily 49,500; compounding calculator 60,500 |
| 10B Compound interest | compound interest formula | IN | 246,000 | ci formula 27,100; formula for compound interest 9,900; how to calculate compound interest 5,400; compound interest formula with example 4,400 |
| 10B Compound interest | compound interest calculator | US | 673,000 (2026-06-08) | compounding interest calculator 40,500 |
| 10B Compound interest | compound interest formula | US | 74,000 | compounded monthly formula 3,600; compounded annually formula 2,900 |
| 10B Rule of 72, effective rate | rule of 72 | US | **not measured** | — |
| 10C EMI (P56) | emi calculator | IN | 3,350,000 (2026-05-27) | loan calculator 368,000; personal loan emi calculator 301,000; emi 90,500; emi calculator in months 22,200 |
| 10C EMI | emi formula | IN | 6,600 | how to calculate emi 5,400; emi calculation formula 3,600; reducing interest calculator 4,400 |
| 10D SIP (P57) | sip calculator | IN | 4,090,000 (2026-08-18) | sip plan calculator 2,240,000; sip return calculator 135,000; sip mutual fund calculator 90,500 |
| 10D SIP | sip formula | IN | 880 | — |
| 10D Lump sum | lumpsum calculator | IN | 201,000 | sip/lumpsum calculator 49,500; lumpsum sip calculator 33,100 |
| 10D Step-up SIP | step up sip calculator | IN | **not measured** | autocomplete IN: "sip calculator step up" is the #3 suggestion |
| 10D FD (P57) | fd calculator | IN | 450,000 (2026-08-24) | fixed deposit calculator 450,000 (pooled); fd interest calculator 60,500; fd return calculator 27,100 |
| 10D RD | rd calculator | IN | 201,000 (2026-09-05) | recurring deposit interest calculator 12,100; rd interest calculator 9,900; rd calculation formula 2,400; rd calculator formula 1,900 |
| 10D PPF | ppf calculator | IN | 301,000 (2026-08-26) | ppf sbi calculator 33,100; ppf calculator post office 18,100; ppf monthly calculator 5,400 |
| 10E Annuity / PV / FV | annuity calculator; present value calculator | US | **not measured** | US autocomplete is dominated by retirement and lottery intent (bankrate, fidelity, schwab, powerball) |
| 10F CAGR | cagr calculator | IN | 90,500 (2026-09-05) | compound annual growth rate calculator 110,000; cagr formula calculator 1,000 |
| 10F CAGR | cagr calculator | US | 27,100 | compound annual growth calculator 33,100 |
| 10F NPV | npv calculator | US | 9,900 (2026-06-21) | net present value calculator 4,400 |
| 10F NPV | npv calculator | IN | 1,900 | npv formula calculator 320 |
| 10F IRR | irr calculator | US | 12,100 (2026-10-19) | irr formula calculator 140 |
| 10F IRR | irr calculator | IN | 9,900 | calculate irr 1,000; irr calculator india 590 |
| 10G Depreciation | depreciation calculator | US | 6,600 (2026-06-16) | depreciation rate calculator 110 |
| 10G Depreciation | depreciation calculator | IN | 3,600 | depreciation calculator india 480; depreciation formula calculator 320 |
| 10H Bill discounting | banker's discount | IN | 210 | bankers discount formula 260; banker's discount is given by the formula 320; bankers discount and true discount 170 |

**Unit 11 — Taxes** (same source and date)

| Calculator (catalog) | Keyword | Region | Volume / mo | Notable variants |
| :--- | :--- | :---: | ---: | :--- |
| 11A India GST (P58) | gst calculator | IN | 246,000 (2026-05-27) | gst calculator online 14,800; gst calculator india 9,900; reverse gst calculator 6,600; how to calculate gst 6,600; gst calculator formula 5,400 |
| 11A (other GST countries) | gst calculator | NZ | 33,100 | gst calculator nz 27,100 |
| 11A / 11D | gst calculator | AU, CA | **not measured** | autocomplete GB/US lists "gst calculator australia", "…canada", "…nz", "moneysmart.gov.au" |
| 11B VAT (P59) | vat calculator | GB | 201,000 (2026-07-25) | vat calculator uk 27,100; online vat calculator 8,100 |
| 11B VAT | vat calculator | AE | 12,100 | vat calculator uae 1,900; uae vat calculator 720 |
| 11B VAT | vat calculator | ZA | **not measured** | autocomplete GB lists "vat calculator south africa", "…philippines", "…kenya", "…ireland" |
| 11C US sales tax (P61) | sales tax calculator | US | 135,000 (2026-07-17) | sales taxes calculator 5,400; online sales tax calculator 2,900 |
| 11D Canada HST | hst calculator | CA | 14,800 (2026-10-15) | ontario hst calculator 5,400; reverse hst calculator 5,400; gst/hst calculator 2,900 |
| 11E India income tax (P60) | income tax calculator | IN | 301,000 (2026-05-27) | income tax calculator ay 2025-26 550,000; new tax regime calculator 60,500; income tax calculator new regime 27,100; income tax calculator old vs new 18,100; new vs old regime calculator 140 |
| 11F HRA | hra calculator | IN | 40,500 (2026-08-26) | hra calculation 90,500; hra exemption calculator 9,900; hra calculation formula 3,600; how to calculate hra 2,400 |
| 11F Capital gains, TDS | capital gains tax calculator; tds calculator | IN | **not measured** | autocomplete IN: "tds calculator on salary", "…192b", "…for fy 2026-27" |
| 11G US federal | federal tax calculator | US | 33,100 (2026-05-15) | tax calculator 201,000; income tax calculator 135,000 |
| 11H UK income tax | tax calculator | GB | 301,000 (2026-09-19) | tax income calculator 110,000; tax uk calculator 74,000; salary tax calculator 18,100; paye tax calculator 3,600 |
| 11I Corporate tax | corporate tax rate (US); corporate tax calculator (GB) | — | **not measured** | autocomplete is informational: "corporate tax rate in india", "corporate tax uae", "corporate tax rate 2026" |

**Second batch (filled after the seodata limit reset; same source, queried 2026-11-03).** These numbers replace the "not measured" cells above.

| Calculator | Keyword | Region | Volume / mo | Notable variants |
| :--- | :--- | :---: | ---: | :--- |
| 10A Profit/loss | profit and loss formula | IN | 49,500 | formula of profit and loss 49,500 (pooled) |
| 10A Discount | discount calculator | IN | 33,100 | calculate discount 33,100 (pooled) |
| 10B Simple interest | simple interest calculator | US | 40,500 | simple interest rate calculator 1,000 |
| 10B Rule of 72 | rule of 72 | US | 40,500 | what is the rule of 72 4,400 |
| 10C EMI | emi calculator | US | 12,100 | (Indian diaspora / Nepal intent per autocomplete) |
| 10D Step-up SIP | step up sip calculator | IN | 201,000 | sip calculator with step up 27,100 |
| 10E Annuity | annuity calculator | US | 60,500 (competition 0.57: high advertiser interest) | annuity calculator payout 14,800; annuity payment calculator 14,800 |
| 10E Present value | present value calculator | US | 14,800 | pv value calculator 22,200; calculate present value 18,100 |
| 10F CAGR | cagr formula | IN | 18,100 | compound annual growth rate formula 40,500; cagr meaning 27,100; cagr 40,500 |
| 10F NPV | npv formula | IN | 9,900 | npv 8,100; net present value definition 8,100 (**the formula query is 5× the IN calculator query, 1,900**) |
| 10F IRR | irr formula | IN | 14,800 | irr 33,100; internal rate of return formula 14,800 (**above "irr calculator" IN, 9,900**) |
| 10G Depreciation | depreciation formula | IN | 8,100 | how depreciation is calculated 2,400 (**above "depreciation calculator" IN, 3,600**) |
| 10H True discount | true discount | IN | 260 | true discount formula 390; "indiabix profit and loss" 1,600 (aptitude-exam intent) |
| 11A GST India | how to calculate gst from total amount | IN | 390 | — |
| 11A-2 GST Australia | gst calculator | AU | 110,000 | ex gst calculator 720 |
| 11D Canada GST | gst calculator | CA | 14,800 | calculate gst 14,800 (pooled) |
| 11B VAT South Africa | vat calculator | ZA | 22,200 | remove vat 2,400; remove vat calculator 1,000 |
| 11F Capital gains India | capital gains tax calculator | IN | 3,600 | capital gains calculator 6,600; capital gain calculator for property 3,600 |
| 11F TDS | tds calculator | IN | 9,900 | tds calculator on salary 9,900 (pooled) |
| 11F Capital gains US | capital gains tax calculator | US | 27,100 | capital gains calculator 9,900 |
| 11G US take-home | paycheck calculator | US | 550,000 | payroll calculator (pooled) |
| 11H UK take-home | take home pay calculator | GB | 368,000 | salaries calculator 450,000 |
| 11I Corporate tax | corporate tax rate | US | 9,900 | us corporate tax rate 5,400; corporation tax rate federal 4,400 |

- Competition scores (seodata's Google Ads advertiser-competition index, 0–1) are near zero for most of these. Examples: GST IN 0.01, PPF 0.01, income tax IN 0.02. This measures **advertiser** competition, not organic difficulty — [seodata.dev](https://www.seodata.dev).
- CPCs are low in India and high in the West. Examples: EMI IN $0.02, GST IN $0.23, VAT GB $8.03, US sales tax $7.18, HST CA $5.51, NPV US $4.36 — [seodata.dev](https://www.seodata.dev). This matters for AdSense revenue per visit.

### Inferences
- The "formula" cluster is where NETZ's step-by-step angle matches intent. Compound interest formula (246K IN) and simple interest formula (90.5K IN) are as big as many calculator heads, and they are school-maths queries (CBSE 8–12), not bank queries.
- "income tax calculator ay 2025-26" is at 550K, above the generic head. That suggests the tax-year phrase is the real head term, so the income tax page must name the year in its title and update it every year.
- "hra calculation" (90.5K) is bigger than "hra calculator" (40.5K), which signals how-to intent.
- In India, the **formula query beats the calculator query** for the appraisal tools: IRR formula 14.8K vs IRR calculator 9.9K; NPV formula 9.9K vs 1.9K; depreciation formula 8.1K vs 3.6K. These are the best-fitting NETZ targets in Unit 10 (finance-course students). Pages should be titled "formula + calculator with steps".
- Take-home pay is the real head for US and UK income tax (paycheck calculator 550K US; take home pay calculator 368K GB). These are payroll tools held by SmartAsset/ADP-type sites and GOV.UK-adjacent sites, so they are low win chance and high YMYL.
- Australia GST (110K AU) is larger than the measured UAE/ZA VAT pages and justifies /gst-calculator-australia early in the country rollout.
- Ad value per visit is about 100–400× higher on UK, US and Canada tax pages than on Indian ones. This supports building separate country pages even though India is the first market.

### Gaps
- The earlier gaps were filled in the second batch. Still not measured: "sip formula derivation", "emi formula class 12", the Hindi variants ("compound interest ka formula"), percentage increase (US), UK corporation tax, and the Saudi and Ireland VAT pages.
- No independent second source (Ahrefs or Semrush) was checked for any of these numbers, so treat every figure as a single-source estimate.
- seodata cache dates span May–October 2026. The FY-based tax queries change with the tax season (they peak around July in India), so a single monthly average hides that seasonality.

---

## 2. Difficulty, top results, SERP features and YMYL / E-E-A-T

### Takeaway
Every head calculator keyword in India is held by banks, brokers and fintechs with huge domain authority (Groww, ClearTax, Bajaj Finserv, Tata Capital, Angel One, BankBazaar and others). A new domain cannot win "emi calculator", "sip calculator" or "gst calculator" in the near term. The winnable ground is the formula and worked-example variants, small academic topics (banker's discount, NPV/IRR "with steps", depreciation SLM/WDV), and long-tail "with steps" pages. Google says finance pages get "even more weight" for strong E-E-A-T, so every tax and finance page needs visible sources, a "rates as of" date and authorship.

### Cited Findings
- **Who ranks for "gst calculator india"** (US web search, 2026-11-03): busy.in, kanakkupillai.com, pinelabs.com, stablemoney.in, Bajaj Finserv, TaxAdda, Lendingkart, TaxBuddy, plus many small new calculator sites (calcguru.in, sum.money, yourincomecalculator.com) — [search results incl. busy.in](https://busy.in/gst-calculator), [calculator.taxadda.com](https://calculator.taxadda.com/gst-calculator), [bajajfinserv.in](https://www.bajajfinserv.in/kannada/gst-calculator). Several snippets still list the old 5/12/18/28% slabs, e.g. this [search summary of busy.in and others](https://busy.in/gst-calculator). The catalog records GST 2.0 (5/18/40% from 22 Sep 2025), so many competitors are out of date.
- **Who ranks for "income tax calculator new regime FY 2026-27"**: cleartax.in, bankbazaar.com, tax2win.in, upstox.com, businesstoday.in, coinswitch.co, taxbuddy, plus small sites (stockcalc.in, calcguru.in) — [cleartax.in](https://cleartax.in/paytax/TaxCalculator/0), [bankbazaar.com](https://bankbazaar.com/tax/income-tax-calculator.html), [tax2win.in](https://tax2win.in/tax-tools/income-tax-calculator). The same search found **conflicting slab figures across competitor pages**: one calcguru page shows different 10%/15% brackets — [calcguru.in](https://calcguru.in/?p=180).
- **Who ranks for "vat calculator uk"**: accounting and SaaS firms (Clear Books, Accotax, Simply Business, Sage, GoForma, Taxfly, Contractor Calculator) — [clearbooks.co.uk](https://www.clearbooks.co.uk/vat-calculator/), [accotax.co.uk](https://accotax.co.uk/vat-calculator/), [simplybusiness.co.uk](https://www.simplybusiness.co.uk/knowledge/articles/how-much-is-vat-online-vat-calculator).
- **Who ranks for "EMI formula with example"**: SoFi, Tata Capital, Angel One, Razorpay, Kotak Neo, Tax2Win, Exceldemy — [angelone.in](https://www.angelone.in/knowledge-center/loans/how-to-calculate-emi), [razorpay.com](https://razorpay.com/learn/what-is-emi/), [kotakneo.com](https://www.kotakneo.com/stockshaala/financial-calculations-and-excel/emi-equated-monthly-installment-calculation-for-loans-and-mortgages/). Even the "how to" angle is owned by lenders' blogs, but those pages are articles, not interactive step tables.
- **Branded modifiers in autocomplete** show the incumbents directly: "sip calculator groww / sbi / hdfc / angel one", "fd calculator sbi / hdfc / post office", "gst calculator taxadda / paisabazaar / groww", "hra calculator cleartax / icici", "cagr calculator cleartax / finology" — [Google autocomplete](https://suggestqueries.google.com/complete/search?client=firefox&q=sip+calculator), 2026-11-03.
- **Google on YMYL:** Google's systems "give even more weight to content that aligns with strong E-E-A-T" for topics that affect health, finances or safety. It says "trust is most important", asks "Do pages carry a byline, where one might be expected?", and says "We strongly encourage adding accurate authorship information." It also warns against made-up authors and AI headshots, and asks sites to explain "How" content was made (including automation) and "Why" — [Google Search Central: Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Google also says E-E-A-T "itself isn't a specific ranking factor" (same page).
- Secondary commentary says the Quality Rater Guidelines' current edition is dated 11 September 2025 and now defines YMYL by potential harm rather than fixed categories — [Search Engine Land](https://searchengineland.com/google-search-quality-rater-guidelines-changes-july-2022-386815), [ppc.land](https://ppc.land/ymyl/) (secondary; not checked against the PDF).
- Competitors already use trust signals: e.g. patronaccounting's GST calculator shows "Last Updated: March 2026" — [patronaccounting.com](https://www.patronaccounting.com/tools/gst-calculator). UK calculators carry disclaimers that "official VAT returns must always be prepared using proper accounting records and HMRC-approved systems" — [search summary of UK VAT tools](https://www.taxfly.co.uk/vat-calculator).

**Winnability judgment per calculator** (inference, not measured difficulty)

| Calculator | Head keyword winnable for a new site? | Learning-site angle to target instead |
| :--- | :--- | :--- |
| Percentage, profit/loss, discount | Head no (calculator.net, Omni, Google's own calculator); formula and question pages partly | "profit and loss formula", "successive discount formula", "markup vs margin" with worked steps |
| Simple interest | Medium — head IN 49.5K at 0 competition | "simple interest formula" (90.5K IN), "SI = PRT/100 with example" |
| Compound interest | Head no; formula medium | "compound interest formula" (246K IN), "compounded quarterly / half-yearly formula", "CI and SI difference" |
| EMI | No (banks) | "emi formula", "how to calculate emi" (5.4K), "emi formula class 12 applied maths" (in autocomplete), "flat vs reducing rate" |
| SIP / lump sum / step-up | No (Groww, ET Money, AMCs) | "sip formula" (880), "sip formula derivation", "step-up sip formula" — small |
| FD / RD / PPF | No (banks, post office) | "rd calculation formula" (2.4K), "fd maturity formula quarterly compounding"; avoid bank-specific variants |
| Annuity, PV/FV, sinking fund | US head no (Bankrate, Fidelity, Schwab); academic yes | "present value of annuity formula", "annuity due vs ordinary" — textbook intent |
| NPV / IRR | Head hard (calculator.net, Omni); the "with steps" angle is plausible | "IRR by Newton-Raphson / interpolation, step by step", "how to calculate irr manually" (in autocomplete) |
| CAGR | Head no (ClearTax, Groww) | "cagr formula" with worked example |
| Depreciation | Head medium-low volume; India "as per companies act" intent is accounting | "WDV vs SLM with steps", "sum of years digits" |
| Bill discounting | **Yes** — tiny volume, academic only | "banker's discount formula", "true discount and banker's gain" |
| GST India | No (ClearTax, Groww, Bajaj, TaxAdda) | "how to calculate gst from total amount" (autocomplete #2), "reverse gst formula", "gst inclusive formula" |
| VAT by country | UK no; small countries possibly | separate pages per country; UAE head is only 12.1K |
| US sales tax | No (Avalara, calculator.net, Omni) | "reverse sales tax formula", "how to calculate sales tax" |
| Canada HST | Medium-low (14.8K CA) | "reverse hst calculator" (5.4K), per-province |
| India income tax | No (ClearTax, the income-tax portal, banks) | "how to calculate income tax step by step", "marginal relief calculation example" |
| HRA, capital gains, TDS | No for the head; "hra calculation" is a how-to | "hra exemption formula with example" |
| US federal, UK income tax | No (SmartAsset, IRS; GOV.UK, the Salary Calculator) | "how tax brackets work example" — explanatory |
| Corporate tax | Mostly informational ("rate") | a simple rate-comparison explainer only |

### Inferences
- NETZ's distinct advantage is the **exam-style step table**: a month-by-month EMI split, an IRR iteration table, a WDV schedule. Incumbent bank pages show only a result and a pie chart. Lean on "with steps", "formula", "example" and "class 12 / CBSE" in titles.
- **Stale rates at competitors are an opening:** old GST slabs, conflicting income tax brackets. A visible "Rates as of 2026-11-03, source: CBIC / incometax.gov.in" is both an E-E-A-T signal and a reason to choose NETZ.
- **E-E-A-T checklist for every Unit 10/11 page:** a named author and a named reviewer (ideally a CA or a finance teacher) with a short bio page; "Rates as of {date}" with links to the official source (CBIC, incometax.gov.in, HMRC/GOV.UK, IRS, CRA, EU Commission VAT list); a "Not tax or financial advice" note; a methodology / "how this is calculated" section; a changelog for rate updates; and an About page explaining who builds NETZ (Google's "Who, How, Why").
- The pure tax-filing calculators (income tax, US federal, UK take-home pay, TDS, capital gains) carry the highest YMYL risk and the lowest win chance. They belong in a later batch (the catalog already puts them in batch 2–3).

### Gaps
- No live Google India, US or UK results page was captured, so the exact top 3 positions, the presence of an AI Overview, and whether Google shows its own calculator widget (it is known to for some loan and mortgage queries) are **unverified**. Check manually in an incognito window for each head term, or use a SERP API.
- No organic keyword-difficulty score (Ahrefs KD or Semrush KD%) was obtained. The free tools were not reached within the call budget.
- The Quality Rater Guidelines PDF itself was not read; the claims about it come from secondary sources.

---

## 3. "People also ask" questions and autocomplete

### Takeaway
Autocomplete shows four intent types: **bank or brand** (sbi, hdfc, groww), **tax year** (fy 2026-27, ay 2026-27), **country** (uk, uae, nz, australia, canada, ontario), and **formula / how-to / Hindi / Excel**. The last type is NETZ's lane. "People also ask" boxes could not be captured.

### Cited Findings
All from [Google autocomplete, client=firefox](https://suggestqueries.google.com/complete/search?client=firefox&q=emi+formula), fetched 2026-11-03 (gl=in unless noted):
- **EMI:** emi calculator in months; …home loan; …personal loan; …car loan; emi formula in excel; **emi formula class 12**; **emi formula class 12 applied maths**; emi formula derivation (gl=us/gb); how to calculate emi in excel / for home loan / interest.
- **SIP:** sip calculator step up; …with inflation; …lumpsum; sip formula in excel; sip formula with example; **sip formula 15x15x15 explained**; sip formula derivation; sip formula in hindi.
- **FD / RD / PPF:** fd calculator monthly interest; …monthly payout; …post office; rd calculator post office 2026; rd calculator in months; ppf calculator monthly; …post office monthly.
- **Compound / simple interest:** compound interest ka formula; compound interest formula in hindi; compound interest and simple interest formula; how to calculate compound interest with example / on fd / in excel; simple interest questions; simple interest emi calculator; (US) compound interest calculator investor.gov; compound interest calculator monthly.
- **Percentage / profit-loss:** percentage calculator of marks; percentage calculator from cgpa; percentage calculator kaise nikale; profit and loss formula; profit and loss questions in hindi; profit and loss all formula.
- **CAGR / NPV / IRR:** cagr calculator sip; cagr calculator excel; npv calculator formula / example; irr calculator for insurance; **how to calculate irr manually**; how to calculate irr with example; how to calculate irr on ba ii plus (US).
- **Depreciation:** depreciation calculator as per companies act 2013; …as per income tax act; (US) …macrs; …for rental property.
- **Annuity:** annuity calculator nps; …lic; …sbi life; (US) …lottery; …powerball.
- **Banker's discount:** banker's discount formula; banker's discount and true discount; banker's discount is given by the formula mcq; banker's discount problems.
- **GST:** gst calculator formula; gst calculator cgst sgst; **how to calculate gst from total amount**; how to calculate gst percentage; how to calculate gst on mrp; how to calculate gst on gold jewellery; (gl=us/gb) gst calculator australia / canada / nz / alberta / ontario / nsw.
- **VAT:** vat calculator uk / uae / dubai / ksa / ireland / south africa / philippines / kenya / france / italy / spain / germany; vat calculator remove vat; vat calculator 2026.
- **Sales tax / HST:** sales tax calculator by zip code / by state / reverse / for car / texas / california / missouri; hst calculator ontario / nova scotia / new brunswick / pei / reverse; ("hst calculator quilt" is an unrelated quilting term).
- **Income tax:** income tax calculator fy 2025-26 / ay 2026-27 / fy 2026-27 / new regime / old vs new; (gl=us) …2026 / by state / federal and state; uk tax calculator 2026 / monthly / take home pay / 25/26 / 26/27; federal tax calculator 2026 married jointly / paycheck.
- **HRA / TDS / capital gains:** hra calculator for govt employees / for bangalore / formula; tds calculator on salary 192b / on fd / for fy 2026-27; ("tds calculator water / coffee" in the US means total dissolved solids, a different meaning); capital gains tax calculator on sale of property in india / indexation.
- **Corporate tax:** corporate tax rate in india ay 2026-27; corporate tax kya hota hai; corporate tax uae / dubai.

### Inferences
- **Hindi-language queries** (ka formula, kaise nikale, in hindi) recur across interest, percentage and profit/loss. A Hindi version (`/hi/...`) of the school-maths pages is a real long-tail opportunity.
- **"class 12 applied maths"** appears for EMI. CBSE Class 12 Applied Mathematics covers EMI, annuities, sinking funds and depreciation, which matches Units 10C/10E/10G (curriculum link inferred, not verified here).
- **Disambiguation is needed:** "tds" (water), "hst" (quilt), "emi" (physics, electromagnetic induction), "gst" (India vs AU/NZ/CA). Titles must say "India" or the country explicitly.
- Suggested FAQ topics (from autocomplete, since "People also ask" was not captured): "How do you calculate GST from the total amount?", "What is the formula for EMI?", "How is IRR calculated manually?", "What is the difference between banker's discount and true discount?", "How to calculate compound interest quarterly?".

### Gaps
- "People also ask" boxes were not captured; they need a live results page or a SERP API. The FAQ lists below draw on autocomplete instead.

---

## 4. SEO spec per calculator (ready to use)

### Takeaway
One page per calculator. Separate country pages where the rate, wording and audience differ (VAT, GST, sales tax, income tax). Each page has a "with steps / formula" title, a "Rates as of" line on tax pages, and FAQs drawn from the autocomplete above. Character counts were checked by hand; titles ≤60, descriptions ≤155.

### Cited Findings
- The catalog requires each ⭐ page to have its own title with "calculator with steps", a meta description of about 150 characters, a clear URL, answer-first content, an FAQ and JSON-LD — `NETZ_METHODS_CATALOG.md` ⭐ section items 1–9 (project file).
- The keyword choices below rest on the volumes in section 1 ([seodata.dev](https://www.seodata.dev)) and the autocomplete in section 3 ([Google autocomplete](https://suggestqueries.google.com/complete/search?client=firefox&q=gst+calculator)).

**Unit 10 SEO specs**

| Calc | Primary kw | Secondary kws | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 10A % | percentage calculator | percentage formula, percent change, percentage of marks, percentage increase | /percentage-calculator | Percentage Calculator with Steps: %, Change, Off \| NETZ | Find X% of Y, percent change or % off with every step shown. Includes the percentage formula and marks-to-percentage examples. | Percentage Calculator with Steps | What is the percentage formula? · How do I calculate percentage of marks? · How do I find percent increase? · How do I calculate a discount %? |
| 10A P&L | profit and loss formula | profit percentage, loss percentage, discount, successive discount, markup vs margin | /profit-and-loss-calculator | Profit and Loss Calculator with Formula & Steps \| NETZ | Work out profit %, loss %, discount and successive discounts step by step, with every profit and loss formula and a solved example. | Profit and Loss Calculator (with Formulas) | What is the profit percentage formula? · How do successive discounts work? · Markup vs margin: what is the difference? · Is profit % on cost price or selling price? |
| 10B SI | simple interest formula | simple interest calculator, SI = PRT/100, rate of interest formula | /simple-interest-calculator | Simple Interest Calculator: SI = PRT/100 with Steps \| NETZ | Calculate simple interest, amount, rate or time with SI = P×R×T/100. Every step shown, plus a year-by-year table and worked examples. | Simple Interest Calculator and Formula | What is the simple interest formula? · How do I find the rate or time? · Simple vs compound interest? · How do I calculate monthly simple interest? |
| 10B CI | compound interest formula | compound interest calculator, compounded quarterly, half-yearly, continuous, effective rate, rule of 72 | /compound-interest-calculator | Compound Interest Calculator with Formula & Steps \| NETZ | Calculate compound interest yearly, half-yearly, quarterly, monthly or continuously. See A = P(1 + r/n)^nt and a year-by-year table. | Compound Interest Calculator with Steps | What is the compound interest formula? · How do I calculate interest compounded quarterly? · What is the difference between CI and SI? · What is the rule of 72? · Effective vs nominal rate? |
| 10C EMI | emi formula | emi calculator, how to calculate emi, amortisation schedule, flat vs reducing rate, prepayment | /emi-calculator | EMI Calculator with Formula & Amortisation Steps \| NETZ | Calculate EMI with P×r×(1+r)^n/((1+r)^n−1). See every month's interest and principal in a full schedule, and the effect of prepayment. | EMI Calculator with Formula and Schedule | What is the EMI formula? · How is EMI calculated step by step? · Flat vs reducing interest rate? · How does prepayment change EMI or tenure? · How do I calculate EMI in Excel? |
| 10D SIP | sip calculator with formula | sip formula, step-up sip, lumpsum calculator, sip formula derivation | /sip-calculator | SIP Calculator with Formula & Year-by-Year Steps \| NETZ | See how a SIP grows with the FV formula, step by step. Includes step-up SIP and lump sum, plus a year-by-year table. Not investment advice. | SIP Calculator with Formula and Steps | What is the SIP formula? · How does a step-up SIP work? · SIP vs lump sum: how do the formulas differ? · What does 15×15×15 mean? |
| 10D FD | fd maturity formula | fd calculator, fixed deposit calculator, quarterly compounding, monthly payout | /fd-calculator | FD Calculator: Maturity Formula with Steps \| NETZ | Find FD maturity value with quarterly compounding, step by step. Enter any bank's rate; see the formula and a yearly interest table. | FD Calculator (Fixed Deposit) with Steps | How is FD maturity calculated? · Why do banks compound FDs quarterly? · How is monthly-payout interest worked out? · Is FD interest taxable (TDS)? |
| 10D RD | rd calculation formula | rd calculator, recurring deposit calculator, post office rd | /rd-calculator | RD Calculator with Formula & Steps \| NETZ | Calculate recurring deposit maturity with quarterly compounding. Each instalment's interest shown step by step. Enter any bank's rate. | RD Calculator (Recurring Deposit) with Steps | What is the RD maturity formula? · How is RD interest compounded? · How is post office RD calculated? |
| 10D PPF | ppf calculator | public provident fund calculator, ppf calculation, ppf interest rate | /ppf-calculator | PPF Calculator with Year-by-Year Table \| NETZ | Project your PPF balance year by year at the current notified rate (rates as of date shown). See how each year's interest is calculated. | PPF Calculator with Yearly Steps | How is PPF interest calculated? · What is the current PPF rate? · What is the PPF lock-in and maximum deposit? |
| 10E Annuity | present value of annuity formula | annuity calculator, future value of annuity, annuity due, perpetuity, sinking fund, bond price | /annuity-calculator | Annuity Calculator: PV & FV with Steps \| NETZ | Find the present or future value of an ordinary annuity or annuity due, perpetuity or sinking fund. Every formula step and a cash-flow table. | Annuity Calculator (PV and FV) with Steps | What is the present value of annuity formula? · Annuity due vs ordinary annuity? · How do I calculate a sinking fund? · How is a bond priced? |
| 10F NPV | npv calculator | net present value formula, how to calculate npv, discount rate | /npv-calculator | NPV Calculator with Formula & Cash-Flow Table \| NETZ | Calculate net present value step by step: discount each cash flow, add them up, and read the decision. Formula, table and worked example. | NPV Calculator with Steps | What is the NPV formula? · What does a negative NPV mean? · How do I choose a discount rate? · NPV vs IRR? |
| 10F IRR | irr formula (14.8K IN) | irr calculator, how to calculate irr manually, internal rate of return, irr by interpolation | /irr-calculator | IRR Calculator with Steps (Newton-Raphson) \| NETZ | Find IRR with every iteration shown, by interpolation or Newton-Raphson on NPV. See why IRR has no closed formula and how it converges. | IRR Calculator with Iteration Steps | How do I calculate IRR manually? · Is there a formula for IRR? · Why can a project have two IRRs? · IRR vs NPV: which is better? |
| 10F CAGR | cagr formula | cagr calculator, compound annual growth rate, real return, payback period | /cagr-calculator | CAGR Calculator with Formula & Steps \| NETZ | Calculate CAGR = (End/Start)^(1/n) − 1 step by step, plus inflation-adjusted real return and payback period, with worked examples. | CAGR Calculator with Formula | What is the CAGR formula? · CAGR vs absolute return? · How do I adjust for inflation (real return)? · What is the payback period? |
| 10G Depreciation | depreciation calculator | straight line method, written down value method, sum of years digits, declining balance | /depreciation-calculator | Depreciation Calculator: SLM & WDV with Steps \| NETZ | Build a year-by-year depreciation schedule by straight-line, WDV / declining balance or sum-of-years' digits, with every formula step. | Depreciation Calculator (SLM, WDV, SYD) | What is the straight-line depreciation formula? · How is WDV depreciation calculated? · SLM vs WDV: which is used in India? · What is sum of years' digits? |
| 10H Bill discounting | banker's discount formula | true discount, banker's gain, bill of exchange, present worth | /bankers-discount-calculator | Banker's Discount & True Discount Calculator \| NETZ | Calculate true discount, banker's discount and banker's gain on a bill, step by step, with each formula and a solved exam question. | Banker's Discount and True Discount Calculator | What is the banker's discount formula? · What is the difference between true discount and banker's discount? · What is banker's gain? · How is the present worth of a bill found? |

**Unit 11 SEO specs** (every page: "Rates as of {date}", a source link, a "Not tax advice" note, and author/reviewer)

| Calc | Primary kw | Secondary kws | Slug | Title (≤60) | Meta description (≤155) | H1 | FAQ (3–5) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 11A GST India | how to calculate gst | gst calculator, reverse gst, gst inclusive/exclusive, cgst sgst igst | /gst-calculator-india | GST Calculator India: Add/Remove GST with Steps \| NETZ | Add or remove GST at 5%, 18% or 40% and see the CGST/SGST or IGST split, step by step. GST 2.0 rates as of the date shown; CBIC source. | GST Calculator (India) with Steps | How do I calculate GST from the total amount? · What is the GST inclusive formula? · CGST + SGST vs IGST: when does each apply? · What are the current GST slabs? |
| 11B VAT UK | vat calculator uk | add vat, remove vat, reverse vat, 20% vat | /vat-calculator-uk | VAT Calculator UK: Add or Remove 20% VAT \| NETZ | Add or remove UK VAT at 20%, 5% or 0% and see the net, VAT and gross amounts, with the formula for each step. Rates checked on GOV.UK. | UK VAT Calculator | How do I remove VAT from a price? · Why isn't removing 20% the same as dividing by 1.2? · What items have 5% VAT? |
| 11B VAT (hub) | vat calculator | vat by country, vat rates, reverse vat calculator | /vat-calculator | VAT Calculator by Country: Add or Remove VAT \| NETZ | Add or remove VAT for the UK, EU countries, UAE, Saudi Arabia, South Africa and more, with each country's rate dated and sourced. | VAT Calculator for Any Country | How do I calculate VAT? · How do I remove VAT from a gross price? · What are the VAT rates in the EU? |
| 11B VAT UAE (and others: /vat-calculator-saudi-arabia, /vat-calculator-south-africa, /vat-calculator-ireland) | vat calculator uae | uae vat 5%, vat calculator dubai | /vat-calculator-uae | VAT Calculator UAE: Add or Remove 5% VAT \| NETZ | Add or remove 5% UAE VAT step by step and see the net, VAT and total. Rate as of the date shown, with the official source linked. | UAE VAT Calculator (5%) | How do I calculate 5% VAT in the UAE? · How do I remove VAT from a total? · Which items are zero-rated? |
| 11A-2 GST AU/NZ | gst calculator nz / australia | add gst, remove gst, 15% gst, 10% gst | /gst-calculator-nz, /gst-calculator-australia | GST Calculator NZ: Add or Remove 15% GST \| NETZ | Add or remove New Zealand 15% GST and see each step: GST-exclusive, GST amount and total. Rate dated and sourced from IRD. | NZ GST Calculator (15%) | How do I work out GST from a GST-inclusive price? · Why multiply by 3/23? · What is GST-exclusive? |
| 11C US sales tax | sales tax calculator | reverse sales tax, sales tax by state, how to calculate sales tax | /sales-tax-calculator | Sales Tax Calculator by State with Steps \| NETZ | Add state and local sales tax to a price, or work backwards from a total, with every step shown. State rates as of the date given. | Sales Tax Calculator (US) | How do I calculate sales tax? · How do I reverse-calculate sales tax from a total? · Why do local rates differ within a state? |
| 11D Canada | hst calculator | gst hst calculator, reverse hst, ontario hst, pst | /hst-calculator-canada | HST Calculator Canada: GST/HST by Province \| NETZ | Add or remove GST, HST or PST for any Canadian province step by step, including reverse HST. Rates as of the date shown, from CRA. | Canada GST/HST Calculator | What is the HST rate in Ontario? · How do I calculate reverse HST? · GST vs HST vs PST: what is the difference? |
| 11E India income tax | income tax calculator fy 2026-27 | new vs old regime, new tax regime calculator, tax slab, rebate 87A, marginal relief | /income-tax-calculator-india | Income Tax Calculator FY 2026-27: New vs Old \| NETZ | Compare new and old regime tax for FY 2026-27 slab by slab: standard deduction, rebate, marginal relief, surcharge and 4% cess. Not tax advice. | Income Tax Calculator India (FY 2026-27) | How is income tax calculated step by step? · Which is better, the new or old regime? · How does marginal relief work above ₹12 lakh? · What are the new regime slabs? |
| 11F HRA | hra calculation | hra exemption calculator, hra formula, hra calculation formula | /hra-exemption-calculator | HRA Exemption Calculator with Formula & Steps \| NETZ | Find your HRA exemption as the least of three amounts, each shown step by step (metro and non-metro). Old regime only; not tax advice. | HRA Exemption Calculator | How is HRA exemption calculated? · What are the three HRA limits? · Is HRA exempt under the new regime? · Which cities count as metro? |
| 11F Capital gains | capital gains tax calculator india | stcg, ltcg, ltcg 12.5%, ₹1.25 lakh exemption | /capital-gains-tax-calculator-india | Capital Gains Tax Calculator India (STCG/LTCG) \| NETZ | Work out short- and long-term capital gains tax on shares or property, step by step, with holding-period rules and rates as of the date shown. | Capital Gains Tax Calculator (India) | How is LTCG on shares taxed? · What is the ₹1.25 lakh exemption? · STCG vs LTCG holding periods? |
| 11F TDS | tds calculator | tds on salary, tds on fd, tds calculation | /tds-calculator | TDS Calculator with Steps (Salary, FD, Rent) \| NETZ | Estimate TDS at the rate you enter and see each step of the deduction. Thresholds as of the date shown; not tax advice. | TDS Calculator | How is TDS on salary calculated? · When is TDS deducted on FD interest? · How do I claim a TDS refund? |
| 11G US federal | federal income tax calculator 2026 | tax brackets, standard deduction, take-home pay, married filing jointly | /federal-income-tax-calculator | Federal Income Tax Calculator 2026 with Brackets \| NETZ | See how US federal income tax is worked out bracket by bracket for 2026, after the standard deduction. IRS figures dated; not tax advice. | US Federal Income Tax Calculator (2026) | How do tax brackets work? · What is the 2026 standard deduction? · Marginal vs effective tax rate? |
| 11H UK income tax | uk tax calculator | take home pay, national insurance, paye, salary after tax | /uk-income-tax-calculator | UK Income Tax Calculator 2026/27 with NI Steps \| NETZ | Work out UK income tax and National Insurance for 2026/27 band by band, and your take-home pay. Bands checked on GOV.UK; not tax advice. | UK Income Tax and NI Calculator (2026/27) | How is UK income tax calculated? · What is the personal allowance? · How is National Insurance worked out? |
| 11I Corporate tax | corporate tax rate | corporate tax india, uk corporation tax, us corporate tax | /corporate-tax-calculator | Corporate Tax Calculator: India, UK, US Rates \| NETZ | Compare headline corporate tax for India, the UK and the US and apply it to a profit figure step by step. Rates dated and sourced. | Corporate Tax Calculator (India, UK, US) | What is the corporate tax rate in India? · What is UK corporation tax? · What is the US federal corporate rate? |

### Inferences
- **Country pages needed:** VAT (a hub plus /vat-calculator-uk, -uae, -saudi-arabia, -south-africa, -ireland; EU countries can share the hub at first), GST (/gst-calculator-india vs -nz / -australia, plus Canada on the HST page), and sales tax (US only). Income tax needs fully separate pages (India / US / UK) because both the maths and the audience differ. Each is backed by the country suffixes in autocomplete and the separate volumes measured (VAT GB 201K vs UAE 12.1K; GST IN 246K vs NZ 33.1K).
- The slab and rate figures in these titles and metas (5/18/40% GST, 20% UK VAT, 5% UAE, 15% NZ, FY 2026-27) come from the catalog's rates file (`NETZ_METHODS_CATALOG.md` §11). They must be checked on the official sites before shipping, as the catalog itself warns.
- Put the formula in the title or H1 for school topics (SI = PRT/100, EMI formula). Put the tax year in the title for tax topics, and plan a yearly title refresh (FY 2027-28, 2027/28).
- JSON-LD: `MathSolver` + `LearningResource` fits the formula and school pages (10A–10H). For tax pages, `WebApplication`/`SoftwareApplication` with `dateModified` may fit better. This is an inference; check Google's current structured-data documentation.

### Gaps
- Title and description lengths were counted by hand, not by script; re-check them in the build.
- No check was made of whether these slugs clash with existing NETZ routes.
- "People also ask" questions were not captured, so the FAQs above draw on autocomplete instead. Replace them with real PAA questions once a live results page is checked.
