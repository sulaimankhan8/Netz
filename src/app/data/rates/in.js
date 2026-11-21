/**
 * India tax rates (docs/methods/NETZ_METHODS_CATALOG.md section 0.2). Pages hold formulas only; every rate lives here.
 * Each rule: id, validFrom (inclusive), validTo (exclusive, null = still in force), label, source, data.
 * source.status: 'official' (checked on the government site), 'secondary' (tax portals and news), 'unverified'.
 * Research: docs/research_notes/NETZ topics and new units/interest_and_taxes.md. The owner checks these before the
 * pages go live (docs/launch/NETZ_OWNER_TODO.md, section K).
 */

export const IN_RULES = [
  {
    id: 'in.gst.slabs',
    validFrom: '2025-09-22',
    validTo: null,
    label: 'GST 2.0 (from 22 Sep 2025)',
    source: {
      title: 'Notification 9/2025-Central Tax (Rate), 17 Sep 2025; GST Council FAQ',
      url: 'https://cbic-gst.gov.in/',
      verifiedOn: '2026-11-03',
      status: 'secondary',
    },
    data: {
      slabs: [
        { rate: 0, label: 'Nil / exempt', example: 'fresh food, milk, education' },
        { rate: 0.25, label: 'Rough diamonds', example: 'rough precious stones' },
        { rate: 3, label: 'Gold, silver, jewellery', example: 'gold coins, jewellery' },
        { rate: 5, label: 'Merit rate', example: 'everyday goods and essentials' },
        { rate: 12, label: 'Special (a few items kept at 12%)', example: 'e.g. certain bricks' },
        { rate: 18, label: 'Standard rate', example: 'most goods and services' },
        { rate: 40, label: 'Luxury and sin goods', example: 'e.g. large cars, aerated drinks' },
      ],
      defaultRate: 18,
    },
  },
  {
    id: 'in.gst.slabs',
    validFrom: '2017-07-01',
    validTo: '2025-09-22',
    label: 'GST before 22 Sep 2025',
    source: {
      title: 'CGST rate notifications 2017–2025 (replaced by Notification 9/2025-CT(R))',
      url: 'https://cbic-gst.gov.in/',
      verifiedOn: '2026-11-03',
      status: 'secondary',
    },
    data: {
      slabs: [
        { rate: 0, label: 'Nil / exempt' },
        { rate: 0.25, label: 'Rough diamonds' },
        { rate: 3, label: 'Gold, silver, jewellery' },
        { rate: 5, label: 'Low rate' },
        { rate: 12, label: 'Standard rate 1' },
        { rate: 18, label: 'Standard rate 2' },
        { rate: 28, label: 'Highest rate' },
      ],
      defaultRate: 18,
    },
  },

  // PPF interest rate: set by the Finance Ministry every quarter (small savings schemes). 7.1% since 1 Apr 2020.
  {
    id: 'in.ppf.rate',
    validFrom: '2020-04-01',
    validTo: null,
    label: 'PPF 7.1% a year',
    source: {
      title: 'Ministry of Finance, small savings scheme rates (each quarter); National Savings Institute',
      url: 'https://www.nsiindia.gov.in/',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: { rate: 7.1, minDeposit: 500, maxDeposit: 150000, lockInYears: 15, extensionYears: 5 },
  },

  // Income tax for individuals (resident). Slabs: [from, to (null = no top), rate %]. Amounts in rupees.
  // new: the default regime (section 115BAC, carried into the Income-tax Act 2025). old: the regime with deductions.
  {
    id: 'in.incometax',
    validFrom: '2026-04-01',
    validTo: null,
    label: 'Tax year 2026-27 (Income-tax Act 2025)',
    source: {
      title: 'Income-tax Act 2025 and Finance Act 2026; incometax.gov.in tax calculator',
      url: 'https://www.incometax.gov.in/',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: {
      new: {
        slabs: [[0, 400000, 0], [400000, 800000, 5], [800000, 1200000, 10], [1200000, 1600000, 15], [1600000, 2000000, 20], [2000000, 2400000, 25], [2400000, null, 30]],
        standardDeduction: 75000,
        rebate: { limit: 1200000, max: 60000, marginalRelief: true },
        surchargeCap: 25,
      },
      old: {
        slabs: {
          below60: [[0, 250000, 0], [250000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          senior: [[0, 300000, 0], [300000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          superSenior: [[0, 500000, 0], [500000, 1000000, 20], [1000000, null, 30]],
        },
        standardDeduction: 50000,
        rebate: { limit: 500000, max: 12500, marginalRelief: false },
        caps: { sec80C: 150000, homeLoanInterest: 200000, nps80CCD1B: 50000 },
      },
      surcharge: [[5000000, 10], [10000000, 15], [20000000, 25], [50000000, 37]],
      cess: 4,
    },
  },
  {
    id: 'in.incometax',
    validFrom: '2025-04-01',
    validTo: '2026-04-01',
    label: 'FY 2025-26 (AY 2026-27)',
    // Read 2026-11-21 on incometax.gov.in (AY 2026-27 help pages): both regimes' slabs, 87A rebates, surcharge, 4% cess.
    // The standard deductions were not on those pages, so 'secondary'.
    source: {
      title: 'Finance Act 2025 (Union Budget 1 Feb 2025); incometax.gov.in help pages for AY 2026-27',
      url: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
      verifiedOn: '2026-11-21',
      status: 'secondary',
    },
    data: {
      new: {
        slabs: [[0, 400000, 0], [400000, 800000, 5], [800000, 1200000, 10], [1200000, 1600000, 15], [1600000, 2000000, 20], [2000000, 2400000, 25], [2400000, null, 30]],
        standardDeduction: 75000,
        rebate: { limit: 1200000, max: 60000, marginalRelief: true },
        surchargeCap: 25,
      },
      old: {
        slabs: {
          below60: [[0, 250000, 0], [250000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          senior: [[0, 300000, 0], [300000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          superSenior: [[0, 500000, 0], [500000, 1000000, 20], [1000000, null, 30]],
        },
        standardDeduction: 50000,
        rebate: { limit: 500000, max: 12500, marginalRelief: false },
        caps: { sec80C: 150000, homeLoanInterest: 200000, nps80CCD1B: 50000 },
      },
      surcharge: [[5000000, 10], [10000000, 15], [20000000, 25], [50000000, 37]],
      cess: 4,
    },
  },
  {
    id: 'in.incometax',
    validFrom: '2024-04-01',
    validTo: '2025-04-01',
    label: 'FY 2024-25 (AY 2025-26)',
    source: {
      title: 'Finance (No. 2) Act 2024 (Union Budget 23 Jul 2024); incometax.gov.in',
      url: 'https://www.incometax.gov.in/',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: {
      new: {
        slabs: [[0, 300000, 0], [300000, 700000, 5], [700000, 1000000, 10], [1000000, 1200000, 15], [1200000, 1500000, 20], [1500000, null, 30]],
        standardDeduction: 75000,
        rebate: { limit: 700000, max: 25000, marginalRelief: true },
        surchargeCap: 25,
      },
      old: {
        slabs: {
          below60: [[0, 250000, 0], [250000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          senior: [[0, 300000, 0], [300000, 500000, 5], [500000, 1000000, 20], [1000000, null, 30]],
          superSenior: [[0, 500000, 0], [500000, 1000000, 20], [1000000, null, 30]],
        },
        standardDeduction: 50000,
        rebate: { limit: 500000, max: 12500, marginalRelief: false },
        caps: { sec80C: 150000, homeLoanInterest: 200000, nps80CCD1B: 50000 },
      },
      surcharge: [[5000000, 10], [10000000, 15], [20000000, 25], [50000000, 37]],
      cess: 4,
    },
  },

  // Capital gains for resident individuals. Holding months: an asset held MORE than this is long-term.
  // rates in %; 'slab' = taxed at the person's income-tax slab rate. exemption: yearly LTCG exemption (equity only).
  {
    id: 'in.capitalgains',
    validFrom: '2024-07-23',
    validTo: null,
    label: 'Capital gains from 23 Jul 2024 (Budget 2024, carried into the Income-tax Act 2025)',
    source: {
      title: 'Finance (No. 2) Act 2024, sections 111A, 112, 112A; Income Tax Department tax-rate pages',
      url: 'https://incometaxindia.gov.in/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      assets: [
        { key: 'equity', label: 'Listed shares / equity mutual funds (STT paid)', longAfter: 12, stcg: 20, ltcg: 12.5, exemption: 125000, indexation: false },
        { key: 'property', label: 'Land or building', longAfter: 24, stcg: 'slab', ltcg: 12.5, indexation: 'option', indexationRate: 20, indexationBefore: '2024-07-23' },
        { key: 'gold', label: 'Gold, jewellery, unlisted shares and other assets', longAfter: 24, stcg: 'slab', ltcg: 12.5, indexation: false },
        { key: 'bonds', label: 'Listed bonds and debentures', longAfter: 12, stcg: 'slab', ltcg: 12.5, indexation: false },
        { key: 'debtmf', label: 'Debt mutual funds bought on or after 1 Apr 2023', longAfter: null, stcg: 'slab', ltcg: 'slab', indexation: false },
      ],
      cess: 4,
      surchargeCapOnEquity: 15,
    },
  },
  {
    id: 'in.capitalgains',
    validFrom: '2018-04-01',
    validTo: '2024-07-23',
    label: 'Capital gains before 23 Jul 2024',
    source: {
      title: 'Income-tax Act 1961, sections 111A, 112, 112A (before the Finance (No. 2) Act 2024)',
      url: 'https://incometaxindia.gov.in/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      assets: [
        { key: 'equity', label: 'Listed shares / equity mutual funds (STT paid)', longAfter: 12, stcg: 15, ltcg: 10, exemption: 100000, indexation: false },
        { key: 'property', label: 'Land or building', longAfter: 24, stcg: 'slab', ltcg: 20, indexation: true },
        { key: 'gold', label: 'Gold, jewellery, unlisted shares and other assets', longAfter: 36, stcg: 'slab', ltcg: 20, indexation: true },
        { key: 'bonds', label: 'Listed bonds and debentures', longAfter: 12, stcg: 'slab', ltcg: 10, indexation: false },
        { key: 'debtmf', label: 'Debt mutual funds bought on or after 1 Apr 2023', longAfter: null, stcg: 'slab', ltcg: 'slab', indexation: false },
      ],
      cess: 4,
      surchargeCapOnEquity: 15,
    },
  },
  // Cost Inflation Index (base year 2001-02 = 100), notified by CBDT each year. Key: the financial year's first calendar year.
  {
    id: 'in.cii',
    validFrom: '2001-04-01',
    validTo: null,
    label: 'Cost Inflation Index 2001-02 to 2025-26',
    source: {
      title: 'CBDT Cost Inflation Index notifications (latest: 2025-26 = 376)',
      url: 'https://incometaxindia.gov.in/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      index: { 2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117, 2006: 122, 2007: 129, 2008: 137, 2009: 148, 2010: 167, 2011: 184, 2012: 200, 2013: 220, 2014: 240, 2015: 254, 2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301, 2021: 317, 2022: 331, 2023: 348, 2024: 363, 2025: 376 },
    },
  },
  // HRA exemption: the least of actual HRA, rent − 10% of salary, and 50% (metro) or 40% of salary. Old regime only.
  {
    id: 'in.hra',
    validFrom: '2001-04-01',
    validTo: null,
    label: 'HRA exemption, section 10(13A) and Rule 2A',
    source: {
      title: 'Income-tax Act section 10(13A), Income-tax Rules rule 2A',
      url: 'https://incometaxindia.gov.in/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: { metroPct: 50, otherPct: 40, rentLessPct: 10, metros: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'], oldRegimeOnly: true },
  },
  // TDS: common sections as presets (the page always lets people type their own rate). threshold: per payment or per year as noted.
  {
    id: 'in.tds.sections',
    validFrom: '2025-04-01',
    validTo: null,
    label: 'Common TDS rates and limits from 1 Apr 2025 (Budget 2025)',
    source: {
      title: 'Finance Act 2025 TDS changes; Income Tax Department TDS rate chart',
      url: 'https://incometaxindia.gov.in/',
      verifiedOn: '2026-11-08',
      status: 'unverified',
    },
    data: {
      sections: [
        { key: '194J-prof', label: '194J professional fees', rate: 10, threshold: 50000, per: 'year' },
        { key: '194J-tech', label: '194J technical services / royalty (some)', rate: 2, threshold: 50000, per: 'year' },
        { key: '194C-ind', label: '194C contractor (individual / HUF)', rate: 1, threshold: 30000, per: 'payment' },
        { key: '194C-oth', label: '194C contractor (others)', rate: 2, threshold: 30000, per: 'payment' },
        { key: '194I-land', label: '194I rent of land / building', rate: 10, threshold: 50000, per: 'month' },
        { key: '194I-plant', label: '194I rent of plant / machinery', rate: 2, threshold: 50000, per: 'month' },
        { key: '194H', label: '194H commission or brokerage', rate: 2, threshold: 20000, per: 'year' },
        { key: '194A-bank', label: '194A bank interest (not senior)', rate: 10, threshold: 50000, per: 'year' },
        { key: '194A-senior', label: '194A bank interest (senior citizen)', rate: 10, threshold: 100000, per: 'year' },
      ],
      noPanRate: 20,
    },
  },
  {
    // Domestic company income tax (corporate tax page, hidden until checked: docs/launch/NETZ_OWNER_TODO.md section K)
    id: 'in.corporate',
    validFrom: '2019-04-01',
    validTo: null,
    label: 'Domestic companies (Taxation Laws (Amendment) Act 2019 regimes)',
    // Read 2026-11-21 on incometax.gov.in (domestic company, AY 2026-27): 115BAA 22%, 115BAB 15% on business income
    // (22% on other income), normal 30% / 25% (turnover ≤ ₹400 crore in 2020-21), surcharge 7% / 12% / 10%, MAT 15%, cess 4%
    source: { title: 'incometax.gov.in: "Domestic company" tax rates for AY 2026-27', url: 'https://www.incometax.gov.in/iec/foportal/help/company/return-applicable', verifiedOn: '2026-11-21', status: 'official' },
    data: {
      regimes: {
        // rate %, surcharge % (flat for the concessional regimes), MAT applies?
        '115BAA': { label: 'Section 115BAA (no exemptions)', rate: 22, surcharge: [[0, 10]], mat: false },
        '115BAB': { label: 'Section 115BAB (new manufacturing companies; 15% is on the manufacturing business income, other income pays 22%)', rate: 15, surcharge: [[0, 10]], mat: false },
        normal: { label: 'Normal provisions', rate: 30, smallRate: 25, smallTurnover: 4000000000, surcharge: [[10000000, 7], [100000000, 12]], mat: true },
      },
      cess: 4,
      matRate: 15,
    },
  },
];
