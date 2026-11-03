# NETZ new unit: Interest, finance and taxes

Research date: 2026-11-03. Not tax advice. Every rate below needs a "rates as of" label in the app.
Status markers: **[V]** = seen on an official site or confirmed by several consistent sources in this session; **[S]** = secondary sources only (tax portals, news); **[U]** = from memory or conflicting sources — check the official source before shipping.

---

## 1. Proposed unit outline (sub-part → calculators)

| # | Sub-part | Calculator pages | Priority |
|---|---|---|---|
| A | Percentages and trade | Percentage / % change; Profit & loss; Discount (single + successive); Markup vs margin | High (Class 7–8, every syllabus) |
| B | Simple and compound interest | Simple interest; Compound interest (any compounding); Continuous compounding; Effective vs nominal rate; Rule of 72 / 69 / 70 | High |
| C | Loans | EMI (reducing balance) + amortisation schedule; Flat vs reducing rate comparison; Prepayment effect | Very high (largest search demand) |
| D | Savings products (India) | FD maturity; RD maturity; PPF maturity; SIP future value; Lump-sum return; Step-up SIP | High |
| E | Time value of money | Annuity FV / PV (ordinary + due); Perpetuity; Sinking fund; Bond valuation | Medium (CBSE 12 Applied, CA Foundation) |
| F | Investment appraisal | CAGR; Inflation-adjusted (real) return; NPV; IRR; Payback (simple + discounted) | Medium |
| G | Depreciation | Straight-line; Written-down value / declining balance; Sum-of-years' digits | Medium (CBSE 12 Applied, B.Com, CA) |
| H | Discounting bills | True discount; Banker's discount; Banker's gain | Low–medium (B.Com, CA, Indian competitive exams) |
| I | India GST | GST add/remove (inclusive ↔ exclusive); CGST/SGST/IGST split; Input tax credit / net payable; Reverse charge example | Very high |
| J | India income tax | New vs old regime comparison (FY 2026-27); Rebate + marginal relief; Surcharge + cess; HRA exemption; Capital gains (STCG/LTCG); TDS basics | Very high (seasonal Feb–Jul) |
| K | VAT / sales tax worldwide | VAT add/remove (country picker); US sales tax (state + local); Canada GST/HST/PST; GST AU/SG/NZ; Japan consumption tax | High (global audience) |
| L | Income tax worldwide | US federal 2026 brackets; UK income tax + NI 2026-27 | Medium |
| M | Corporate tax basics | Flat-rate corporate tax with surcharge/cess (India), UK marginal relief, US 21% | Low |

Build order: C, I, B, J, K, D, A, then E–H, L, M.

---

## 2. Interest and finance formulas

Notation: P = principal, r = annual rate (decimal), n = compounding periods per year, t = years, i = rate per period, N = number of periods.

### A. Percentages and trade
- % change = (new − old) / old × 100
- Profit = SP − CP; Profit % = Profit / CP × 100; Loss % = Loss / CP × 100
- Discount = MP − SP; Discount % = Discount / MP × 100
- Successive discounts d1, d2: net = 1 − (1−d1)(1−d2)
- Markup % = (SP − CP)/CP × 100; Margin % = (SP − CP)/SP × 100. Conversions: margin = markup/(1+markup); markup = margin/(1−margin)
- Inputs: CP, SP, MP, discount rates.

### B. Simple and compound interest
- Simple interest: SI = P·r·t; A = P(1 + r·t)
- Compound: A = P(1 + r/n)^(n·t); CI = A − P
- Continuous: A = P·e^(r·t)
- Effective annual rate: EAR = (1 + r/n)^n − 1; continuous EAR = e^r − 1
- Nominal from effective: r = n[(1+EAR)^(1/n) − 1]
- Rule of 72: years to double ≈ 72 / (rate in %). Exact: t = ln 2 / ln(1+r). Show 69.3 rule for continuous, 70 for low rates.
- Steps to show: convert rate to per-period, count periods, power, subtract.

### C. Loans
- EMI (reducing balance): EMI = P·i·(1+i)^N / ((1+i)^N − 1), with i = annual rate / 12, N = months.
- Amortisation row k: interest_k = balance_{k−1}·i; principal_k = EMI − interest_k; balance_k = balance_{k−1} − principal_k. Last row: adjust for rounding.
- Flat rate: total interest = P·r·t; EMI = (P + P·r·t)/N.
- Flat → approximate reducing equivalent: r_eff ≈ 2·N·r_flat/(N+1) (approximation; exact by solving the EMI equation for i, i.e. IRR of the cash flows).
- Inputs: loan amount, annual rate, tenure (months/years), optional prepayment.
- Note for India: RBI's floating-rate EMI reset rules (Aug 2023 circular) let borrowers choose tenure vs EMI change — show both modes. **[U]**

### D. India savings products
- **FD** (banks usually compound quarterly): A = P(1 + r/4)^(4t). For tenure in days under 6 months many banks pay simple interest — offer a "simple / quarterly / monthly payout" choice.
- **RD** (monthly deposit R, quarterly compounding, Indian bank convention): M = Σ_{k=1}^{N} R(1 + r/4)^(4·k/12) where k counts months remaining. Common closed form used by banks: M = R[(1+i)^n − 1] / (1 − (1+i)^(−1/3)), i = r/4, n = number of quarters. Show the sum form step by step (clearer for learners). Post Office RD uses a 5-year, quarterly-compounded scheme rate.
- **PPF**: yearly deposit D (₹500 min, ₹1,50,000 max per FY), interest compounded yearly, 15-year lock-in. If deposited before the 5th of each month/1st April: FV = D·[(1+r)^15 − 1]/r·(1+r) (annuity due). Current rate **7.1% p.a. for Oct–Dec 2026** — unchanged for ~10 quarters **[S]** (Ministry of Finance (DEA) quarterly notification; reported by Free Press Journal / Outlook Money). Other: NSC 7.7%, KVP 7.5%, SSY 8.2%, SCSS 8.2% **[S]**. Rates reset every quarter → must be data-driven.
- **SIP** (monthly SIP S, expected annual return r, i = r/12, N months, paid at start of month): FV = S·[(1+i)^N − 1]/i·(1+i). Note: some calculators use i = (1+r)^(1/12) − 1 instead; state which one.
- **Step-up SIP**: sum year by year, increase S by g% each year.
- **Lump sum**: FV = P(1+r)^t.

### E. Time value of money
- Ordinary annuity FV = A[(1+i)^N − 1]/i; PV = A[1 − (1+i)^(−N)]/i
- Annuity due: multiply by (1+i)
- Perpetuity PV = A/i; growing perpetuity PV = A/(i − g)
- Sinking fund (payment to reach target S): A = S·i / [(1+i)^N − 1]
- Bond price = C·[1 − (1+y)^(−N)]/y + F(1+y)^(−N)

### F. Investment appraisal
- CAGR = (End/Start)^(1/t) − 1
- Real return (Fisher): (1+nominal)/(1+inflation) − 1 (approximation nominal − inflation)
- NPV = Σ_{t=0}^{T} CF_t/(1+k)^t
- IRR: rate where NPV = 0; solve by Newton–Raphson / bisection — show iterations as steps (good learning content). XIRR for dated cash flows (mutual fund statements).
- Payback: years until cumulative CF ≥ 0 (interpolate in the last year). Discounted payback uses discounted CFs.

### G. Depreciation
- Straight-line: D = (Cost − Salvage)/Life
- WDV / declining balance: Book value_t = Cost(1 − d)^t; rate to reach salvage: d = 1 − (Salvage/Cost)^(1/Life). Indian Income-tax uses block-of-assets WDV rates; Companies Act 2013 Schedule II uses useful lives.
- Double-declining: d = 2/Life
- Sum-of-years' digits: SYD = L(L+1)/2; D_t = (Cost − Salvage)·(L − t + 1)/SYD

### H. Discounting bills (Indian commerce syllabi)
- True discount (TD) on amount A due in t years at r: PW = A/(1 + r·t); TD = A − PW = A·r·t/(1 + r·t)
- Banker's discount: BD = A·r·t (SI on face value)
- Banker's gain: BG = BD − TD = TD·r·t = TD²/PW
- Bills of exchange: legal due date = nominal due date + 3 days of grace (Negotiable Instruments Act s.22). **[U]** check whether syllabi still teach grace days.

---

## 3. India taxes (as of 2026-11-03)

### I. GST ("GST 2.0", effective 22 Sept 2025)
- Approved at the 56th GST Council meeting (3 Sept 2025); notified via **Notification 9/2025-Central Tax (Rate), 17 Sept 2025**, effective **22 Sept 2025**, with parallel IGST/UTGST notifications; services in 15/2025-CT(R). **[S]** (taxguru, cleartax, EY alert, GST Council FAQ PDF gstcouncil.gov.in/sites/default/files/2025-09/faq.pdf)
- Main slabs: **5% (merit), 18% (standard), 40% (demerit/luxury: e.g. pan masala, tobacco, aerated/sugary drinks, large cars, etc.)**. Old 12% and 28% slabs largely removed. **[S]**
- Still-existing special rates: 0% (exempt/nil), 0.25% (rough diamonds), 3% (gold/silver/jewellery), plus some items left at 12% (e.g. certain bricks, Notification 14/2025-CT(R)). **[S]**
- Tobacco/pan masala moved later than 22 Sept 2025 (tied to the end of compensation cess). **[U]** exact date.
- Teach as: slab picker with 0, 0.25, 3, 5, 12 (legacy/special), 18, 40 — plus a "custom %" box. Don't hard-code HSN lookups (too risky).
- Formulas:
  - Exclusive → GST = Price × r/100; Total = Price × (1 + r/100)
  - Inclusive → Base = Total × 100/(100 + r); GST = Total × r/(100 + r)
  - Intra-state: CGST = SGST (or UTGST) = GST/2. Inter-state / import: IGST = full GST.
  - Input tax credit: net payable = output GST − eligible ITC. ITC set-off order (IGST credit first against IGST, then CGST/SGST; CGST credit not usable against SGST and vice-versa) — Sec 49/49A CGST Act. **[U]** for step-by-step order.
  - Reverse charge (RCM): recipient pays the tax instead of the supplier (e.g. GTA, legal services, specified imports); recipient can claim ITC if eligible. Teach as a "who pays" toggle.
- Official sources: cbic-gst.gov.in (rate notifications), gstcouncil.gov.in.

### J. Income tax — Income-tax Act, 2025
- The **Income-tax Act, 2025** (Act 30 of 2025, assent 21 Aug 2025) replaced the 1961 Act from **1 Apr 2026**. "Previous year / assessment year" replaced by a single **"tax year"**; first tax year 2026-27. Sections reduced (≈819 → 536). **[S]** (Deccan Herald, ICAI NIRC PDF, Outlook Money)
- Budget 2026 (1 Feb 2026): **no change to slabs or rebate** for 2026-27. **[S]**
- Section numbers changed (e.g. rebate reportedly s.156, default new regime s.202 — **[U]**). In the app say "rebate (formerly 87A)".

**New regime (default) — tax year 2026-27** **[S]**

| Income (₹) | Rate |
|---|---|
| 0 – 4,00,000 | Nil |
| 4,00,001 – 8,00,000 | 5% |
| 8,00,001 – 12,00,000 | 10% |
| 12,00,001 – 16,00,000 | 15% |
| 16,00,001 – 20,00,000 | 20% |
| 20,00,001 – 24,00,000 | 25% |
| above 24,00,000 | 30% |

- Standard deduction (salaried/pensioners): **₹75,000** new regime; ₹50,000 old regime. **[S]**
- Rebate: up to **₹60,000** if total income ≤ ₹12,00,000 → salaried income up to ₹12.75 lakh effectively tax-free. Marginal relief just above ₹12 lakh: tax payable = min(computed tax, income − 12,00,000). Rebate not available against special-rate income such as STCG on equity (s.111A-type) / LTCG — **[U]** check wording under the 2025 Act.
- Old regime slabs (under 60): 0–2.5L nil; 2.5–5L 5%; 5–10L 20%; >10L 30%. Senior (60–79) nil up to 3L; super-senior (80+) nil up to 5L. Old-regime rebate ₹12,500 if income ≤ ₹5L. **[U]** (unchanged for years; from memory)
- Surcharge on tax (individuals): 10% if income > ₹50L; 15% > ₹1Cr; 25% > ₹2Cr; 37% > ₹5Cr (old regime only — new regime capped at 25%). Surcharge on STCG/LTCG on equity and dividends capped at 15%. Marginal relief on surcharge: extra tax + surcharge cannot exceed income above the threshold. **[U]**
- **Health & Education Cess: 4%** of (tax + surcharge). **[S]**
- Steps for calculator: gross income → minus standard deduction (and old-regime deductions 80C ₹1.5L, 80D, HRA, etc.) → slab tax → rebate/marginal relief → surcharge + its marginal relief → cess → total; then compare regimes.

**Capital gains (from 23 July 2024; unchanged in Budget 2026)** **[S]**
- Listed equity / equity MF: STCG (≤12 months) **20%**; LTCG (>12 months) **12.5%** on gains above **₹1,25,000** per year, no indexation.
- Other assets: LTCG 12.5% without indexation (land/building bought before 23 Jul 2024: individuals may choose 20% with indexation — **[U]**). Holding period 24 months for most other assets; debt MFs bought after 1 Apr 2023 taxed at slab rate.
- Budget 2026: **buyback proceeds now taxed as capital gains** (not dividend) from 2026-27; STT on futures raised to 0.05%, options premium to 0.15%. **[S]** (Outlook Money, Angel One)

**HRA exemption** (old regime only): exempt = min of (a) HRA received, (b) rent paid − 10% of salary (basic + DA), (c) 50% of salary in metro / 40% elsewhere. Metros traditionally Delhi, Mumbai, Kolkata, Chennai; reports that the 2026 Income-tax Rules add Bengaluru, Hyderabad, Pune, Ahmedabad — **[U]**.

**TDS basics** (teach as "rate × amount above threshold"): salary — at average slab rate; FD interest 10% above ₹50,000 (senior ₹1,00,000) per bank per year; rent 2% above ₹50,000/month (individuals, ex-194-IB); professional fees 10%; 20% if no PAN. Thresholds raised in Budget 2025 — **[U]** all TDS numbers; renumbered under the 2025 Act. Recommend: one generic "TDS = rate × (amount − threshold)" calculator with a small editable table, not a full TDS engine.

**Professional tax**: state levy, capped at ₹2,500 per year by Article 276 of the Constitution **[V]** (constitutional cap, long-standing); slabs differ by state (e.g. Maharashtra ₹200/month, ₹300 in Feb) **[U]**.

**Stamp duty**: state subject; typical property rates 5–7% plus 1% registration; women buyers get concessions in some states (e.g. Delhi 4% vs 6%) **[U]**. Recommend: generic "rate % × max(agreement value, circle rate)" page with a state picker only once data is verified.

**Corporate tax (India)** **[U]**: s.115BAA-type regime 22% + 10% surcharge + 4% cess = 25.168%; otherwise 25% (turnover ≤ ₹400 Cr) or 30%, plus surcharge 7%/12% and cess.

---

## 4. Other countries

### K. VAT / GST / sales tax
VAT maths: add → total = net × (1 + r); remove → net = gross / (1 + r), VAT = gross × r/(1 + r). Note the "remove 20% VAT" trap: you divide by 1.2, you don't subtract 20%. (Great teaching moment.)

| Country | Standard rate | Notes | Status |
|---|---|---|---|
| UK | 20% | reduced 5%, zero 0%; registration threshold £90,000 | [U] (stable since 2011) |
| UAE | 5% | since 2018 | [U] |
| Saudi Arabia | 15% | since July 2020 | [U] |
| Australia (GST) | 10% | since 2000 | [U] |
| New Zealand (GST) | 15% | | [U] |
| Singapore (GST) | 9% | since 1 Jan 2024 | [U] |
| Japan (consumption tax) | 10% | 8% reduced (food, newspapers) | [U] |
| Canada | GST 5% federal | HST: ON 13%; NB, NL, PEI 15%; **NS 14% from 1 Apr 2025** [V CRA]; QC GST 5% + QST 9.975%; BC 5% + PST 7%; SK 5% + PST 6%; MB 5% + RST 7% [U]; AB, YT, NT, NU 5% only | [S] |
| USA | no federal sales tax | state rates 0% (AK, DE, MT, NH, OR) to 7.25% (CA); combined state+local averages ~7.5% nationally; local add-ons vary by ZIP — Tax Foundation publishes a yearly table | [U] |

EU standard VAT rates 2026 (source: aggregators citing the EC "VAT rates" list / TEDB — check against taxation-customs.ec.europa.eu before shipping) **[S]**:
Austria 20, Belgium 21, Bulgaria 20, Croatia 25, Cyprus 19, Czechia 21, Denmark 25, Estonia 24 (from Jul 2025), Finland 25.5 (from Sep 2024), France 20, Germany 19, Greece 24, Hungary 27 (highest), Ireland 23, Italy 22, Latvia 21, Lithuania 21, Luxembourg 17 (lowest), Malta 18, Netherlands 21, Poland 23, Portugal 23, Romania 21 (from Aug 2025; one aggregator still says 19/24 — conflicting), Slovakia 23 (from Jan 2025, [U]), Slovenia 22, Spain 21, Sweden 25. EU minimum standard rate 15%.

US sales tax calculator design: inputs = price, state rate, county/city rate(s); tax = price × (state + local). Don't ship a ZIP database at first — let the learner type local rates, preload state base rates only.

### L. Income tax worldwide

**US federal 2026** (IRS IR-2025-103, 9 Oct 2025, Rev. Proc. 2025-32; includes OBBBA changes) — rates 10/12/22/24/32/35/37% kept permanent by the One Big Beautiful Bill Act. Standard deduction: **$16,100 single / $32,200 MFJ / $24,150 HoH** **[V]** (irs.gov). Thresholds (taxable income, single): 10% ≤ $12,400; 12% ≤ $50,400; 22% ≤ $105,700; 24% ≤ $201,775; 32% ≤ $256,225; 35% ≤ $640,600; 37% above **[U]** except top threshold [S]. MFJ: 24,800 / 100,800 / 211,400 / 403,550 / 512,450 / 768,700 **[U]** except top [S]. Extra $6,000 senior deduction 2025–2028 (income-limited). Child Tax Credit $2,200. FICA: Social Security 6.2% to wage base (2026 base ≈ $184,500 [U]), Medicare 1.45% (+0.9% above $200k).

**UK 2026-27** (6 Apr 2026 – 5 Apr 2027; England, Wales, NI) **[S]**, GOV.UK pages "Rates and thresholds for employers 2026 to 2027" and "Income Tax rates and allowances":
- Personal allowance £12,570 (frozen to 2027-28, later extended — check); basic 20% £12,571–£50,270; higher 40% £50,271–£125,140; additional 45% above £125,140. Allowance tapers £1 per £2 over £100,000 (effective 60% band).
- Scotland: starter 19%, basic 20%, intermediate 21%, higher 42%, advanced 45%, top 48% (band edges differ) **[S]**.
- Employee Class 1 NI: 8% between £12,570 and £50,270, 2% above. Employer NI 15% above £5,000 secondary threshold **[S]** (not seen on GOV.UK in this session).
- Dividends: allowance £500; 10.75% basic / 35.75% higher (rise from Apr 2026) / 39.35% additional **[S]**.

### M. Corporate tax basics
UK 25% main rate (profits > £250k), 19% small profits (≤ £50k), marginal relief between; US federal 21% flat; India see above. **[U]**

---

## 5. Syllabus fit
| Syllabus | Topics that map here |
|---|---|
| CBSE/NCERT Class 7–8 (Ganita Prakash / "Comparing Quantities") | percentages, profit & loss, discount, sales tax/GST, SI, CI (yearly/half-yearly), growth & depreciation via CI formula **[U]** new-book chapter names |
| ICSE Class 10 Commercial Maths | GST (CGST/SGST/IGST, ITC — full chapter), Banking (RD maturity), Shares & dividends **[U]** |
| CBSE Class 11–12 Applied Mathematics (code 241) | Class 11: SI/CI, effective rate, annuities?; Class 12 Unit "Financial Mathematics": perpetuity, sinking fund, bond valuation, **EMI (flat and reducing)**, rate of return, nominal vs effective, **CAGR**, **linear depreciation** **[U]** confirm against current CBSE curriculum PDF |
| B.Com Business Mathematics (Indian universities, e.g. DU, Mumbai) | ratio/percentages, SI/CI, annuities, sinking fund, **true & banker's discount**, bills of exchange, depreciation |
| CA Foundation Paper 3 (Quantitative Aptitude) – "Mathematics of Finance" | SI, CI, effective rate, annuity (PV/FV), sinking fund, perpetuity, NPV, CAGR, leasing, depreciation, real vs nominal **[U]** ICAI 2024 scheme |
| US high-school personal finance (now required in ~half of US states, e.g. via NGPF curriculum) | budgeting, simple/compound interest, credit cards & APR vs APY, loans/amortisation, taxes (W-4, brackets, FICA), sales tax, investing, retirement accounts **[U]** state count |
| UK GCSE Maths | percentages, compound interest, depreciation, VAT, reverse percentages **[U]** |

---

## 6. Demand signals (rough — treat as directional only)
- "emi calculator" India: Semrush page for emicalculator.net shows ~32.7M monthly searches (undated; looks inflated, may include broad variants) **[U]**. Banks, ClearTax, Groww, and emicalculator.net all rank — very competitive but huge.
- cleartax.in: ~10M monthly organic visits (Ahrefs, June 2025), 94% from India; "tax calculator" ~141K/month **[S]**.
- Seasonality to expect (Google Trends, not pulled this session): income tax calculator spikes Feb (Budget) and Jun–Jul (ITR filing); GST calculator steady with a spike Sept 2025 (GST 2.0); EMI steady all year; "VAT calculator" steady in UK/EU/Gulf; "sales tax calculator" US steady with a small Nov–Dec rise. **[U]** — run Google Trends (India + Worldwide, past 5 years) before deciding.
- Not found: public Semrush/Similarweb numbers for "gst calculator", "compound interest calculator", "vat calculator", "sales tax calculator". Owner action: check in Semrush/Ahrefs free tier or Google Keyword Planner.
- Judgment: EMI, GST and income-tax pages carry the search demand; compound interest, SIP and CAGR carry the student + investor demand; true/banker's discount and SYD are syllabus-only (low search, but no competition and good for completeness).

---

## 7. Risk: rates change — data-file design

How calculator sites handle it: most hard-code rates and edit them after each Budget (ClearTax, Groww show "Updated for FY 2026-27" badges); good sites keep the previous year selectable ("FY 2025-26 / FY 2026-27" tabs) because people file last year's return. Errors right after a Budget are common.

Recommendation — one versioned rules file per jurisdiction (e.g. `src/data/tax-rules/in.json`, `uk.json`, `us.json`, `vat.json`, `india-small-savings.json`):

```json
{
  "schemaVersion": 1,
  "jurisdiction": "IN",
  "rules": [
    {
      "id": "in.income_tax.new_regime",
      "validFrom": "2026-04-01",
      "validTo": null,
      "label": "Tax year 2026-27 (Income-tax Act, 2025)",
      "source": { "title": "Finance Act 2026 / incometax.gov.in", "url": "https://www.incometax.gov.in/", "verifiedOn": "2026-11-03", "status": "secondary" },
      "data": {
        "slabs": [[0, 400000, 0], [400000, 800000, 0.05], [800000, 1200000, 0.10], [1200000, 1600000, 0.15], [1600000, 2000000, 0.20], [2000000, 2400000, 0.25], [2400000, null, 0.30]],
        "standardDeduction": 75000,
        "rebate": { "incomeLimit": 1200000, "max": 60000, "marginalRelief": true },
        "surcharge": [[5000000, 0.10], [10000000, 0.15], [20000000, 0.25]],
        "cess": 0.04
      }
    }
  ]
}
```

Rules:
1. Calculators never contain numbers — only formulas; they call `getRule(id, date)` which picks the entry whose `validFrom ≤ date < validTo`.
2. The page shows a badge: "Rates as of <validFrom> · source · checked <verifiedOn>", plus a year picker (current + previous year).
3. `status` field: `official` / `secondary` / `unverified`; show a small warning for anything not `official`.
4. Golden tests per rule (e.g. ₹12,75,000 salary → ₹0 tax new regime; ₹13,00,000 → marginal relief case) so a data edit that breaks maths fails CI.
5. Review calendar (owner to-do): India Budget (1 Feb) + Finance Act (Mar); GST Council meetings (ad hoc); small savings rates (end of every quarter: Mar/Jun/Sep/Dec); RBI repo (for example EMI defaults only); IRS inflation release (Oct); UK Budget (Nov) and new tax year (6 Apr); EU VAT changes (check EC list each Jan/Jul).
6. Every page keeps a custom-rate box so the maths works even if the data is stale, and a "Not tax advice" line.

---

## 8. Sources used (this session)
- GST 2.0: taxguru.in (gst-mega-reforms-india-rates-slabs-key-2025), cleartax.in/s/56th-gst-council-meet-news, EY alert Sept 2025 (ey.com PDF), gstcouncil.gov.in/sites/default/files/2025-09/faq.pdf, taxheal.com
- Income tax 2026-27: storyboard18.com (Budget 2026 no change), tatacapital.com personal-income-tax-slabs, indianpaycalculator.in/income-tax-slabs, deccanherald.com (Act notified, effective 1 Apr 2026), nirc.icai.org PDF on Income Tax Act 2025, cleartax.in/s/income-tax-changes-from-april-2026
- Capital gains / Budget 2026: outlookmoney.com (buyback taxed as capital gains, STT raised), bajajfinserv.in/what-is-ltcg-tax-rate, angelone.in
- Small savings: freepressjournal.in (Oct–Dec unchanged, PPF 7.1%, NSC 7.7%), outlookmoney.com, businesstoday.in
- US: irs.gov/node/151941 (IR-2025-103), nerdwallet.com/article/taxes/tax-changes-2026, fool.com
- UK: gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027, gov.uk income tax rates current and past, gofile.co.uk, cintra.co.uk, ii.co.uk
- EU VAT: stripe.com/resources/more/eu-vat-rates, eurofiscalis.com, taxfoundation.org (official: EC taxation-customs "VAT rates" / TEDB — not fetched)
- Canada: canada.ca CRA GST/HST calculator page (NS 14%), taxtips.ca sales-tax-rates-2026
- Demand: semrush.com website overview emicalculator.net, ahrefs.com/websites/cleartax.in
