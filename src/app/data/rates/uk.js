/**
 * UK income tax and employee National Insurance, for /uk-income-tax-calculator. Same rule shape as in.js.
 * Tax years run 6 April to 5 April; validFrom/validTo use those dates.
 * Bands are on income above the personal allowance for England, Wales and Northern Ireland: [from, to (null = no top), rate %]
 * measured from £0 of TAXABLE income (after the allowance). Scotland has its own bands for non-savings income.
 * 2026/27 income tax and NI were checked on GOV.UK on 2026-11-21 (status 'official'); 2025/26 is from earlier research.
 */

export const UK_RULES = [
  {
    id: 'uk.incometax',
    validFrom: '2026-04-06',
    validTo: '2027-04-06',
    label: 'Tax year 2026/27',
    // Read 2026-11-21: allowance, taper and bands on gov.uk/income-tax-rates; NI 8%/2% and thresholds on
    // gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027; Scottish bands on gov.uk/scottish-rate-income-tax/how-it-works
    source: {
      title: 'GOV.UK "Income Tax rates and Personal Allowances", "Rates and thresholds for employers 2026 to 2027" and "Scottish Income Tax"',
      url: 'https://www.gov.uk/income-tax-rates',
      verifiedOn: '2026-11-21',
      status: 'official',
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
  {
    // Corporation tax (corporate tax page; checks logged in docs/launch/NETZ_OWNER_TODO.md section K)
    id: 'uk.corporation',
    validFrom: '2023-04-01',
    validTo: null,
    label: 'Corporation tax from 1 April 2023',
    // Read 2026-11-21 on GOV.UK: 19% to £50,000, 25% above £250,000, marginal relief between from 1 April 2023, limits
    // divided by associated companies + 1. The 3/200 fraction is not stated on those two pages, so 'secondary'.
    source: { title: 'GOV.UK: "Corporation Tax rates and allowances" and "Marginal Relief for Corporation Tax"', url: 'https://www.gov.uk/corporation-tax-rates', verifiedOn: '2026-11-21', status: 'secondary' },
    // limits are for a 12-month period with no associated companies (divided by 1 + associates)
    data: { smallRate: 19, mainRate: 25, lower: 50000, upper: 250000, fraction: [3, 200] },
  },
];
