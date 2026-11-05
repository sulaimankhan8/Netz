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
];
