/**
 * UK income tax and employee National Insurance, for /uk-income-tax-calculator. Same rule shape as in.js.
 * Tax years run 6 April to 5 April; validFrom/validTo use those dates.
 * Bands are on income above the personal allowance for England, Wales and Northern Ireland: [from, to (null = no top), rate %]
 * measured from £0 of TAXABLE income (after the allowance). Scotland has its own bands for non-savings income.
 * Status 'secondary' until the owner checks them on GOV.UK (NETZ_OWNER_TODO.md, section K).
 */

export const UK_RULES = [
  {
    id: 'uk.incometax',
    validFrom: '2026-04-06',
    validTo: '2027-04-06',
    label: 'Tax year 2026/27',
    source: {
      title: 'GOV.UK "Income Tax rates and Personal Allowances"; Scottish Government "Scottish income tax 2026 to 2027"',
      url: 'https://www.gov.uk/income-tax-rates',
      verifiedOn: '2026-11-08',
      status: 'unverified',
    },
    data: {
      personalAllowance: 12570, taperFrom: 100000,
      // rUK: basic 20% to £37,700 taxable (£50,270 gross), higher 40% to £125,140 gross, additional 45%
      bands: { ruk: [[0, 37700, 20], [37700, 125140, 40], [125140, null, 45]] },
      // Scotland, as gross-income thresholds (converted on the page): starter, basic, intermediate, higher, advanced, top
      scotlandGross: [[12570, 16537, 19], [16537, 29526, 20], [29526, 43662, 21], [43662, 75000, 42], [75000, 125140, 45], [125140, null, 48]],
      ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 8, upperRate: 2 },
    },
  },
  {
    id: 'uk.incometax',
    validFrom: '2025-04-06',
    validTo: '2026-04-06',
    label: 'Tax year 2025/26',
    source: {
      title: 'GOV.UK "Income Tax rates and Personal Allowances"; Scottish Government "Scottish income tax 2025 to 2026"',
      url: 'https://www.gov.uk/income-tax-rates',
      verifiedOn: '2026-11-08',
      status: 'secondary',
    },
    data: {
      personalAllowance: 12570, taperFrom: 100000,
      bands: { ruk: [[0, 37700, 20], [37700, 125140, 40], [125140, null, 45]] },
      scotlandGross: [[12570, 15397, 19], [15397, 27491, 20], [27491, 43662, 21], [43662, 75000, 42], [75000, 125140, 45], [125140, null, 48]],
      ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 8, upperRate: 2 },
    },
  },
];
