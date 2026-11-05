/**
 * Canada sales tax by province and territory, for /canada-sales-tax-calculator. Same rule shape as in.js.
 *   'gst'   5% federal GST only
 *   'hst'   one harmonized tax (federal 5% + provincial part)
 *   'pst'   5% GST plus a separate provincial tax (PST, RST or QST), each on the price before tax
 * Source: Canada Revenue Agency "GST/HST rates" page and provincial sites: status 'secondary' until the owner
 * checks them (NETZ_OWNER_TODO.md, section K).
 */

export const CA_RULES = [
  {
    id: 'ca.salestax.provinces',
    validFrom: '2025-04-01',
    validTo: null,
    label: 'Rates from 1 Apr 2025 (Nova Scotia HST 14%)',
    source: {
      title: 'Canada Revenue Agency, "GST/HST rates"; provincial finance ministries',
      url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate/calculator.html',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: {
      gst: 5,
      provinces: [
        { code: 'AB', name: 'Alberta', kind: 'gst' },
        { code: 'BC', name: 'British Columbia', kind: 'pst', pst: 7, pstName: 'PST' },
        { code: 'MB', name: 'Manitoba', kind: 'pst', pst: 7, pstName: 'RST' },
        { code: 'NB', name: 'New Brunswick', kind: 'hst', hst: 15 },
        { code: 'NL', name: 'Newfoundland and Labrador', kind: 'hst', hst: 15 },
        { code: 'NT', name: 'Northwest Territories', kind: 'gst' },
        { code: 'NS', name: 'Nova Scotia', kind: 'hst', hst: 14, note: 'cut from 15% on 1 Apr 2025' },
        { code: 'NU', name: 'Nunavut', kind: 'gst' },
        { code: 'ON', name: 'Ontario', kind: 'hst', hst: 13 },
        { code: 'PE', name: 'Prince Edward Island', kind: 'hst', hst: 15 },
        { code: 'QC', name: 'Quebec', kind: 'pst', pst: 9.975, pstName: 'QST' },
        { code: 'SK', name: 'Saskatchewan', kind: 'pst', pst: 6, pstName: 'PST' },
        { code: 'YT', name: 'Yukon', kind: 'gst' },
      ],
      defaultProvince: 'ON',
    },
  },
  {
    id: 'ca.salestax.provinces',
    validFrom: '2016-07-01',
    validTo: '2025-04-01',
    label: 'Before 1 Apr 2025 (Nova Scotia HST 15%)',
    source: {
      title: 'Canada Revenue Agency, "GST/HST rates" (historical)',
      url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate/calculator.html',
      verifiedOn: '2026-11-04',
      status: 'secondary',
    },
    data: {
      gst: 5,
      provinces: [
        { code: 'AB', name: 'Alberta', kind: 'gst' },
        { code: 'BC', name: 'British Columbia', kind: 'pst', pst: 7, pstName: 'PST' },
        { code: 'MB', name: 'Manitoba', kind: 'pst', pst: 7, pstName: 'RST', note: '8% before 1 Jul 2019' },
        { code: 'NB', name: 'New Brunswick', kind: 'hst', hst: 15 },
        { code: 'NL', name: 'Newfoundland and Labrador', kind: 'hst', hst: 15 },
        { code: 'NT', name: 'Northwest Territories', kind: 'gst' },
        { code: 'NS', name: 'Nova Scotia', kind: 'hst', hst: 15 },
        { code: 'NU', name: 'Nunavut', kind: 'gst' },
        { code: 'ON', name: 'Ontario', kind: 'hst', hst: 13 },
        { code: 'PE', name: 'Prince Edward Island', kind: 'hst', hst: 15 },
        { code: 'QC', name: 'Quebec', kind: 'pst', pst: 9.975, pstName: 'QST' },
        { code: 'SK', name: 'Saskatchewan', kind: 'pst', pst: 6, pstName: 'PST' },
        { code: 'YT', name: 'Yukon', kind: 'gst' },
      ],
      defaultProvince: 'ON',
    },
  },
];
