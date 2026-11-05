/**
 * India tax rates (NETZ_METHODS_CATALOG.md section 0.2). Pages hold formulas only; every rate lives here.
 * Each rule: id, validFrom (inclusive), validTo (exclusive, null = still in force), label, source, data.
 * source.status: 'official' (checked on the government site), 'secondary' (tax portals and news), 'unverified'.
 * Research: research_notes/NETZ topics and new units/interest_and_taxes.md. The owner checks these before the
 * pages go live (NETZ_OWNER_TODO.md, section K).
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
    source: {
      title: 'Finance Act 2025 (Union Budget 1 Feb 2025); incometax.gov.in',
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
];
