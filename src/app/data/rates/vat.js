/**
 * VAT / GST / consumption tax: standard (and main reduced) rates by country, for /vat-calculator.
 * Same rule shape as in.js. Research: research_notes/NETZ topics and new units/interest_and_taxes.md (section 4.K),
 * where most rates are marked secondary or unverified. The owner checks every rate against the official list
 * (EU: taxation-customs.ec.europa.eu "VAT rates") before the page goes live (NETZ_OWNER_TODO.md, section K).
 */

const EU_SOURCE = {
  title: 'European Commission, "VAT rates" list (via tax aggregators)',
  url: 'https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en',
  verifiedOn: '2026-11-03',
  status: 'secondary',
};

// [code, name, standard rate, ISO currency, extra note]
const EU = [
  ['AT', 'Austria', 20], ['BE', 'Belgium', 21], ['BG', 'Bulgaria', 20], ['HR', 'Croatia', 25], ['CY', 'Cyprus', 19],
  ['CZ', 'Czechia', 21], ['DK', 'Denmark', 25], ['EE', 'Estonia', 24, 'from 1 Jul 2025'], ['FI', 'Finland', 25.5, 'from 1 Sep 2024'],
  ['FR', 'France', 20], ['DE', 'Germany', 19], ['GR', 'Greece', 24], ['HU', 'Hungary', 27, 'the highest in the EU'],
  ['IE', 'Ireland', 23], ['IT', 'Italy', 22], ['LV', 'Latvia', 21], ['LT', 'Lithuania', 21],
  ['LU', 'Luxembourg', 17, 'the lowest in the EU'], ['MT', 'Malta', 18], ['NL', 'Netherlands', 21], ['PL', 'Poland', 23],
  ['PT', 'Portugal', 23], ['RO', 'Romania', 21, 'from 1 Aug 2025; sources disagree'], ['SK', 'Slovakia', 23, 'from 1 Jan 2025'],
  ['SI', 'Slovenia', 22], ['ES', 'Spain', 21], ['SE', 'Sweden', 25],
];
// Non-euro EU currencies
const EU_CURRENCY = { BG: 'BGN', CZ: 'CZK', DK: 'DKK', HU: 'HUF', PL: 'PLN', RO: 'RON', SE: 'SEK' };
// Rates the research could not confirm even from secondary sources
const EU_UNVERIFIED = new Set(['RO', 'SK']);

const unverified = (title, url) => ({ title, url, verifiedOn: '2026-11-03', status: 'unverified' });

export const VAT_COUNTRIES = [
  {
    code: 'GB', name: 'United Kingdom', taxName: 'VAT', currency: 'GBP', group: 'Europe (outside the EU)',
    rules: [{ id: 'vat.GB', validFrom: '2011-01-04', validTo: null, label: 'UK VAT', source: unverified('GOV.UK, "VAT rates"', 'https://www.gov.uk/guidance/rates-of-vat-on-different-goods-and-services'), data: { standard: 20, reduced: [{ rate: 5, label: 'Reduced rate (e.g. home energy)' }, { rate: 0, label: 'Zero rate (e.g. most food, children\'s clothes)' }] } }],
  },
  ...EU.map(([code, name, rate, note]) => ({
    code, name, taxName: 'VAT', currency: EU_CURRENCY[code] || 'EUR', group: 'European Union', note: note || null,
    rules: [{ id: `vat.${code}`, validFrom: null, validTo: null, label: `${name} standard VAT`, source: EU_UNVERIFIED.has(code) ? { ...EU_SOURCE, status: 'unverified' } : EU_SOURCE, data: { standard: rate, reduced: [] } }],
  })),
  {
    code: 'AE', name: 'United Arab Emirates', taxName: 'VAT', currency: 'AED', group: 'Middle East',
    rules: [{ id: 'vat.AE', validFrom: '2018-01-01', validTo: null, label: 'UAE VAT', source: unverified('UAE Federal Tax Authority', 'https://tax.gov.ae/'), data: { standard: 5, reduced: [{ rate: 0, label: 'Zero rate (e.g. exports)' }] } }],
  },
  {
    code: 'SA', name: 'Saudi Arabia', taxName: 'VAT', currency: 'SAR', group: 'Middle East',
    rules: [{ id: 'vat.SA', validFrom: '2020-07-01', validTo: null, label: 'Saudi VAT', source: unverified('ZATCA', 'https://zatca.gov.sa/'), data: { standard: 15, reduced: [] } }],
  },
  {
    code: 'AU', name: 'Australia', taxName: 'GST', currency: 'AUD', group: 'Asia–Pacific',
    rules: [{ id: 'vat.AU', validFrom: '2000-07-01', validTo: null, label: 'Australian GST', source: unverified('Australian Taxation Office', 'https://www.ato.gov.au/'), data: { standard: 10, reduced: [{ rate: 0, label: 'GST-free (e.g. basic food)' }] } }],
  },
  {
    code: 'NZ', name: 'New Zealand', taxName: 'GST', currency: 'NZD', group: 'Asia–Pacific',
    rules: [{ id: 'vat.NZ', validFrom: '2010-10-01', validTo: null, label: 'New Zealand GST', source: unverified('Inland Revenue (IRD)', 'https://www.ird.govt.nz/'), data: { standard: 15, reduced: [] } }],
  },
  {
    code: 'SG', name: 'Singapore', taxName: 'GST', currency: 'SGD', group: 'Asia–Pacific',
    rules: [{ id: 'vat.SG', validFrom: '2024-01-01', validTo: null, label: 'Singapore GST', source: unverified('IRAS', 'https://www.iras.gov.sg/'), data: { standard: 9, reduced: [] } }],
  },
  {
    code: 'JP', name: 'Japan', taxName: 'Consumption tax', currency: 'JPY', group: 'Asia–Pacific',
    rules: [{ id: 'vat.JP', validFrom: '2019-10-01', validTo: null, label: 'Japan consumption tax', source: unverified('National Tax Agency', 'https://www.nta.go.jp/'), data: { standard: 10, reduced: [{ rate: 8, label: 'Reduced rate (food and drink, newspapers)' }] } }],
  },
];
