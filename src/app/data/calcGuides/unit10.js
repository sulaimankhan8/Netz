// Guide mode words for the Unit 10 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const MONEY = 'An amount of money, digits only: `500000` (no commas or ₹ sign).';
const RATE = 'The yearly interest rate in percent: `7.5` for 7.5%.';

const GUIDES = {
  percentage: {
    howTo: [
      "Choose what you want to work out: x% of y, percentage change, profit and loss, discounts, margin …",
      "Fill the boxes that appear. Type plain numbers, no % sign.",
      "Press {button} for the answer and the formula used.",
    ],
    help: {
      x: "The percentage, e.g. `15` for 15%.",
      y: "The amount you take the percentage of.",
      a: "The part.",
      b: "The whole.",
      from: "The old value (before the change).",
      to: "The new value (after the change).",
      cp: "Cost price: what you paid.",
      sp: "Selling price: what you sold it for.",
      mp: "Marked (list) price, before any discount.",
      discounts: "One or more discounts in percent, separated by commas: `20, 10`.",
      cost: "The cost of the item.",
      price: "The price it is sold at.",
    },
  },
  'compound-interest': {
    howTo: [
      "Choose **simple** or **compound** interest.",
      "Type the amount you start with (principal), the yearly rate and the time.",
      "For compound interest, choose how often interest is added (yearly, half-yearly, monthly …). Press {button}.",
    ],
    help: {
      kind: "Simple: interest only on the starting amount. Compound: interest also earns interest.",
      principal: MONEY,
      rate: RATE,
      time: "How long the money is invested or borrowed.",
      timeUnit: "Whether the time is in years, months or days.",
      frequency: "How often interest is added to the balance.",
    },
  },
  emi: {
    howTo: [
      "Type the loan amount, the yearly interest rate and how long the loan runs.",
      "Leave the interest method on **reducing balance** (how banks charge home and car loans) unless told otherwise.",
      "Optionally add a one-time extra payment to see how much interest it saves. Press {button}.",
    ],
    help: {
      principal: MONEY,
      rate: RATE,
      tenure: "How long you take to repay.",
      tenureUnit: "Years or months.",
      method: "Reducing balance: interest only on what you still owe (usual). Flat: interest on the full loan every month.",
      prepayAmount: "Optional: an extra lump sum you pay once.",
      prepayMonth: "Optional: after which monthly payment you pay it.",
    },
  },
  fd: {
    howTo: ["Type the deposit amount and the bank's yearly rate.", "Type how long: years, months and days.", "Choose how often interest is compounded (banks in India usually say quarterly). Press {button}."],
    help: {
      payout: "Cumulative: interest stays in the deposit. Payout: interest is paid to you regularly.",
      principal: MONEY, rate: RATE, frequency: "How often interest is added: quarterly for most Indian banks.",
      years: "Whole years.", months: "Extra months.", days: "Extra days.",
    },
  },
  rd: {
    howTo: ["Type the amount you deposit every month and the yearly rate.", "Type how long (years and months).", "Press {button} for the maturity value and the interest earned."],
    help: { instalment: 'The monthly deposit, digits only.', rate: RATE, years: 'Whole years.', months: 'Extra months.' },
  },
  sip: {
    howTo: ["Type how much you invest every month and the return you expect each year.", "Type how many years. Optionally a yearly step-up (raise the SIP by a % every year).", "Press {button} for the final value and how much of it is gain."],
    help: {
      monthly: 'The monthly SIP amount, digits only.',
      rate: 'The expected yearly return in percent, e.g. `12`. It is an estimate; markets vary.',
      years: 'How many years you keep investing.',
      stepUp: 'Optional: raise the monthly amount by this % each year. `0` keeps it flat.',
    },
  },
  lumpsum: {
    howTo: ["Type the amount you invest once and the yearly return you expect.", "Type the number of years. Optionally the inflation rate to see the value in today's money.", "Press {button}."],
    help: { amount: MONEY, rate: 'The expected yearly return in percent.', years: 'How many years the money stays invested.', inflation: "Optional: yearly inflation, e.g. `6`, to show the value in today's money." },
  },
  ppf: {
    howTo: ["Choose when you deposit each year (early in April earns more).", "Type the yearly deposit (₹500 to ₹1,50,000) and the current rate.", "Type the years (15, or extended in blocks of 5). Press {button}."],
    help: {
      timing: 'Depositing before the 5th of April earns interest for the whole year.',
      deposit: 'How much you put in each year.', rate: 'The PPF rate set by the government, in percent.', years: '15 years, or 20, 25 … after extensions.',
    },
  },
  cagr: {
    howTo: ["Type the starting value and the final value.", "Type how many years passed between them.", "Press {button} for the steady yearly growth rate."],
    help: { start: 'The value at the beginning.', end: 'The value at the end.', years: 'Years between the two values (decimals allowed).', inflation: 'Optional: yearly inflation, to get the real growth rate.' },
  },
  depreciation: {
    howTo: ["Choose the method: straight line (same amount every year) or written-down value (same percentage every year).", "Type the cost, the scrap value at the end and the useful life.", "Press {button} for the year-by-year table."],
    help: {
      method: 'Straight line: equal amounts. WDV: a fixed % of the remaining value.',
      cost: 'What the asset cost.', salvage: 'What it will be worth at the end (scrap value).',
      life: 'How many years it will be used.', rate: 'WDV rate in percent. Leave empty and NETZ finds the exact rate.',
    },
  },
  'npv-irr': {
    howTo: ["Type the cash flows year by year, starting with year 0. Money paid out is negative: `-10000, 3000, 4200, 6800`.", "Type the discount rate.", "Press {button} for the NPV, the IRR and the payback period."],
    help: { flows: 'One number per year, separated by commas. The first is usually the investment, as a negative number.', rate: 'The required return in percent, e.g. `10`.' },
  },
  tvm: {
    howTo: ["Choose what to find: future value, present value, payment, years, or a bond price.", "Fill the boxes that appear.", "Press {button}."],
    help: {
      mode: 'Which amount you want.', pmt: 'The regular payment each period.', fv: 'The amount you want to reach.',
      face: "The bond's face value.", coupon: 'Yearly coupon rate in percent.', rate: 'Interest rate or yield in percent.',
      n: 'Number of years.', growth: 'Optional: how fast the payment grows each year.', freq: 'How many payments a year.',
      due: 'Payments at the end of each period (ordinary) or the start (annuity due).',
    },
  },
  'bill-discounting': {
    howTo: ["Choose how the time is given: days left, or the dates.", "Type the bill's face value and the bank's rate.", "Type the days left (or the dates). Press {button} for the discount and what the holder receives."],
    help: {
      mode: 'Days still to run, or the date drawn and the date discounted.', face: "The bill's face value.", rate: "The bank's discount rate, % a year.",
      days: 'How many days are left until the bill is due.', drawn: 'The date the bill was drawn.', months: "The bill's term in months.",
      discounted: 'The date it was taken to the bank.', grace: 'Indian bills add 3 days of grace.',
    },
  },
};

export default GUIDES;
