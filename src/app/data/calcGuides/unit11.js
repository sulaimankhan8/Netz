// Guide mode words for the Unit 11 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  gst: {
    howTo: [
      "Choose what you have: a price **before GST** (to add it) or a price **including GST** (to take it out).",
      "Type the amount and choose the GST rate.",
      "Choose where it is sold: within one state (CGST + SGST) or between states (IGST). Press {button}.",
    ],
    help: {
      mode: 'Add GST to a price, or remove GST from a price that already includes it.',
      amount: 'The price, digits only.',
      rate: 'The GST slab for the item.',
      custom: 'Your own rate in percent, if it is not in the list.',
      supply: 'Same state: split into CGST and SGST. Another state: IGST.',
    },
  },
  vat: {
    howTo: ["Choose the country (its VAT rates appear).", "Choose whether your price is before or including VAT, and type it.", "Pick the rate and press {button}."],
    help: { amount: 'The price, digits only.', mode: 'Add VAT, or remove VAT from a price that includes it.', rate: 'The VAT rate that applies.', custom: 'Your own rate in percent.' },
  },
  'sales-tax': {
    howTo: ["Choose whether your price is before tax (to add it) or includes tax (to take it out).", "Type the price and choose the state. Add the local (county + city) rate if your city charges one.", "Press {button}."],
    help: {
      mode: 'Add tax to a price, or take it out of a price that already includes it.', amount: 'The price, digits only.',
      state: 'The US state where it is sold.', stateRate: "The state's rate in percent; filled in when you pick a state.", local: 'County and city rates added together, in percent. Leave 0 if none.',
    },
  },
  'canada-sales-tax': {
    howTo: ["Choose whether your price is before tax or includes tax.", "Type the price and choose the province: GST, HST or GST + PST apply differently.", "Press {button}."],
    help: { mode: 'Add tax to a price, or take it out of a price that includes it.', amount: 'The price, digits only.', province: 'Where the sale happens.', period: 'Which year’s rates to use.' },
  },
  'income-tax': {
    howTo: ["Choose the tax year and your age group.", "Type your yearly income and deductions (deductions count only in the old regime).", "Press {button}. NETZ compares the new and old regimes, slab by slab."],
    help: {
      period: 'The financial year whose slabs to use.', age: 'Seniors (60+) and super seniors (80+) get higher basic limits in the old regime.',
      salaried: 'Salary and pension get the standard deduction.', salary: 'Yearly salary or pension, ₹.', other: 'Interest, rent and other income, ₹ a year.',
      sec80C: 'PF, PPF, ELSS, life insurance … up to ₹1,50,000. Old regime only.', sec80D: 'Health insurance premiums. Old regime only.',
      homeLoan: 'Interest on a home loan for a house you live in, up to ₹2,00,000. Old regime only.', nps: 'Extra NPS contribution, up to ₹50,000. Old regime only.',
      others: 'HRA exemption and any other deductions, ₹. Old regime only.',
    },
  },
  'capital-gains-india': {
    howTo: ["Choose the kind of asset and type the buy and sell dates (they decide short or long term).", "Type the purchase cost, sale price and any transfer expenses.", "Press {button}."],
    help: {
      asset: 'Shares, mutual funds, property, gold … each has its own rules.', buyDate: 'When you bought it.', sellDate: 'When you sold it.',
      buy: 'What you paid, ₹.', sell: 'What you sold it for, ₹.', expenses: 'Optional: brokerage, stamp duty and similar costs.',
      slab: 'Your income tax slab rate, for gains taxed at slab.', exemptionUsed: 'How much of the yearly LTCG exemption you have already used.',
    },
  },
  'hra-exemption': {
    howTo: ["Choose whether the amounts are monthly or yearly, and whether you live in a metro city.", "Type your basic salary, DA, the HRA you receive and the rent you pay.", "Press {button}. The exemption is the smallest of the three limits."],
    help: {
      period: 'Monthly or yearly amounts.', metro: 'Delhi, Mumbai, Kolkata and Chennai count as metro (50%); others 40%.',
      basic: 'Basic salary.', da: 'Dearness allowance, if it counts for retirement benefits.', hra: 'HRA your employer pays you.', rent: 'Rent you actually pay.',
    },
  },
  tds: {
    howTo: ["Choose the TDS section (or type your own rate).", "Type the payment amount and the total paid this year (for the threshold).", "Say whether the receiver has a PAN, then press {button}."],
    help: {
      section: 'The section that covers the payment (rent, fees, interest …).', amount: 'This payment, ₹.',
      rate: "Leave empty to use the section's rate.", yearTotal: 'Total paid to this person this year, to check the limit.', pan: 'Without a PAN, TDS is usually 20%.',
    },
  },
  'uk-income-tax': {
    howTo: ["Choose where you live (Scotland has its own bands) and the tax year.", "Type your yearly salary and any pension salary sacrifice.", "Press {button} for income tax, National Insurance and take-home pay."],
    help: { region: 'Scotland or the rest of the UK.', year: 'The tax year (6 April to 5 April).', salary: 'Gross salary, £ a year.', pension: 'Percent of salary paid into a pension by salary sacrifice.' },
  },
  'us-income-tax': {
    howTo: ["Choose your filing status and the tax year.", "Type your wages and pre-tax contributions (401(k), HSA …).", "Optionally itemised deductions and a state rate. Press {button}."],
    help: {
      status: 'Single, married filing jointly, head of household …', year: 'The tax year.', wages: 'Gross wages, $ a year.',
      pretax: 'Money taken out before tax.', itemized: 'Leave empty to use the standard deduction.', state: 'Optional: a flat state tax rate.',
    },
  },
  'corporate-tax-calculator': {
    howTo: ["Choose the country and type the taxable profit.", "Fill the extra boxes for that country (regime, turnover …).", "Press {button}."],
    help: {
      country: 'India, UK or US.', income: 'Taxable profit for the year.', regime: 'The tax regime the company has chosen.',
      turnover: 'Yearly turnover (it decides the lower rate in India).', bookProfit: 'Optional: book profit, for MAT.',
      associates: 'Number of associated companies (UK limits are shared).', stateRate: 'Optional: a state corporate tax rate.',
    },
  },
};

export default GUIDES;
