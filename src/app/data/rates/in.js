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
];
