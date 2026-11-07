/**
 * US state sales tax: the statewide base rate for each state and DC, for /sales-tax-calculator.
 * Local (county and city) rates are added on top; the page has a box for them. Same rule shape as in.js.
 * Rates are state base rates as published by each state's revenue department, collected from tax aggregators
 * (Tax Foundation, Avalara, Sales Tax Institute): status 'secondary' until the owner checks them
 * (NETZ_OWNER_TODO.md, section K).
 */

export const US_RULES = [
  {
    id: 'us.salestax.states',
    validFrom: '2025-01-01',
    validTo: null,
    label: 'State sales tax rates 2025–26',
    source: {
      title: 'State revenue departments, via the Tax Foundation "State and Local Sales Tax Rates" report',
      url: 'https://taxfoundation.org/data/all/state/sales-tax-rates/',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: {
      // [code, name, state rate %, note]
      states: [
        ['AL', 'Alabama', 4], ['AK', 'Alaska', 0, 'no state sales tax, but many towns charge one'], ['AZ', 'Arizona', 5.6],
        ['AR', 'Arkansas', 6.5], ['CA', 'California', 7.25, 'includes the 1.25% statewide local part'], ['CO', 'Colorado', 2.9],
        ['CT', 'Connecticut', 6.35], ['DE', 'Delaware', 0, 'no sales tax'], ['DC', 'District of Columbia', 6],
        ['FL', 'Florida', 6], ['GA', 'Georgia', 4], ['HI', 'Hawaii', 4, 'a general excise tax on the seller, often passed on (4.712% shown on receipts)'],
        ['ID', 'Idaho', 6], ['IL', 'Illinois', 6.25], ['IN', 'Indiana', 7], ['IA', 'Iowa', 6], ['KS', 'Kansas', 6.5],
        ['KY', 'Kentucky', 6], ['LA', 'Louisiana', 5, 'raised from 4.45% on 1 Jan 2025'], ['ME', 'Maine', 5.5], ['MD', 'Maryland', 6],
        ['MA', 'Massachusetts', 6.25], ['MI', 'Michigan', 6], ['MN', 'Minnesota', 6.875], ['MS', 'Mississippi', 7],
        ['MO', 'Missouri', 4.225], ['MT', 'Montana', 0, 'no sales tax (resort towns may charge one)'], ['NE', 'Nebraska', 5.5],
        ['NV', 'Nevada', 6.85], ['NH', 'New Hampshire', 0, 'no general sales tax'], ['NJ', 'New Jersey', 6.625],
        ['NM', 'New Mexico', 4.875, 'a gross receipts tax'], ['NY', 'New York', 4], ['NC', 'North Carolina', 4.75],
        ['ND', 'North Dakota', 5], ['OH', 'Ohio', 5.75], ['OK', 'Oklahoma', 4.5], ['OR', 'Oregon', 0, 'no sales tax'],
        ['PA', 'Pennsylvania', 6], ['RI', 'Rhode Island', 7], ['SC', 'South Carolina', 6], ['SD', 'South Dakota', 4.2],
        ['TN', 'Tennessee', 7], ['TX', 'Texas', 6.25], ['UT', 'Utah', 6.1, 'includes the 1.25% statewide local part'],
        ['VT', 'Vermont', 6], ['VA', 'Virginia', 5.3, 'includes the 1% statewide local part'], ['WA', 'Washington', 6.5],
        ['WV', 'West Virginia', 6], ['WI', 'Wisconsin', 5], ['WY', 'Wyoming', 4],
      ].map(([code, name, rate, note]) => ({ code, name, rate, note: note || null })),
      defaultState: 'CA',
    },
  },

  // Federal income tax. Brackets: [from, to (null = no top), rate %] on taxable income (after the standard deduction).
  // validFrom/validTo are tax years (1 Jan to 1 Jan). FICA: Social Security up to the wage base, Medicare on all wages
  // plus the additional 0.9% above the threshold.
  {
    id: 'us.incometax',
    validFrom: '2026-01-01',
    validTo: '2027-01-01',
    label: 'Tax year 2026',
    source: {
      title: 'IRS Revenue Procedure 2025-32 (2026 inflation adjustments); SSA 2026 wage base',
      url: 'https://www.irs.gov/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      standardDeduction: { single: 16100, mfj: 32200, hoh: 24150 },
      brackets: {
        single: [[0, 12400, 10], [12400, 50400, 12], [50400, 105700, 22], [105700, 201775, 24], [201775, 256225, 32], [256225, 640600, 35], [640600, null, 37]],
        mfj: [[0, 24800, 10], [24800, 100800, 12], [100800, 211400, 22], [211400, 403550, 24], [403550, 512450, 32], [512450, 768700, 35], [768700, null, 37]],
        hoh: [[0, 17700, 10], [17700, 67450, 12], [67450, 105700, 22], [105700, 201750, 24], [201750, 256200, 32], [256200, 640600, 35], [640600, null, 37]],
      },
      fica: { ssRate: 6.2, ssWageBase: 184500, medicareRate: 1.45, addlMedicareRate: 0.9, addlMedicareThreshold: { single: 200000, mfj: 250000, hoh: 200000 } },
    },
  },
  {
    id: 'us.incometax',
    validFrom: '2025-01-01',
    validTo: '2026-01-01',
    label: 'Tax year 2025',
    source: {
      title: 'IRS Revenue Procedure 2024-40 and the 2025 standard deduction raised by Public Law 119-21; SSA 2025 wage base',
      url: 'https://www.irs.gov/',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      standardDeduction: { single: 15750, mfj: 31500, hoh: 23625 },
      brackets: {
        single: [[0, 11925, 10], [11925, 48475, 12], [48475, 103350, 22], [103350, 197300, 24], [197300, 250525, 32], [250525, 626350, 35], [626350, null, 37]],
        mfj: [[0, 23850, 10], [23850, 96950, 12], [96950, 206700, 22], [206700, 394600, 24], [394600, 501050, 32], [501050, 751600, 35], [751600, null, 37]],
        hoh: [[0, 17000, 10], [17000, 64850, 12], [64850, 103350, 22], [103350, 197300, 24], [197300, 250500, 32], [250500, 626350, 35], [626350, null, 37]],
      },
      fica: { ssRate: 6.2, ssWageBase: 176100, medicareRate: 1.45, addlMedicareRate: 0.9, addlMedicareThreshold: { single: 200000, mfj: 250000, hoh: 200000 } },
    },
  },
];
