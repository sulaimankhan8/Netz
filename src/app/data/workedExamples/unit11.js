// Worked examples, symbol keys and common mistakes for the (UNIT-11) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "canada-sales-tax-calculator": {
    "example": {
      "question": "A purchase of 100 dollars is made in Quebec. Find the GST, the QST and the total, and compare it with Ontario.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "\\text{tax} = \\text{price} \\times \\frac{\\text{rate}}{100}, \\qquad \\text{total} = \\text{price} + \\text{each tax}"
          ]
        },
        {
          "title": "The rates for Quebec",
          "text": "Quebec charges the federal GST and its own QST, each on the price before tax.",
          "math": [
            "\\text{GST} = 5\\%, \\qquad \\text{QST} = 9.975\\%"
          ]
        },
        {
          "title": "Each part",
          "math": [
            "\\text{GST} = 100 \\times \\frac{5}{100} = 5.00",
            "\\text{QST} = 100 \\times \\frac{9.975}{100} = 9.975"
          ]
        },
        {
          "title": "Total, and Ontario for comparison",
          "math": [
            "\\text{Total} = 100 + 5.00 + 9.975 = 114.975 \\approx \\$114.98",
            "\\text{Ontario (13\\% HST)}: \\ 100 \\times 1.13 = \\$113.00"
          ]
        }
      ],
      "answer": "$$\\text{Quebec: GST } 5.00 + \\text{QST } 9.98, \\ \\text{total } 114.98 \\text{ dollars}$$"
    },
    "symbols": [
      {
        "s": "\\text{GST}",
        "t": "The federal Goods and Services Tax.",
        "e": "5\\%"
      },
      {
        "s": "\\text{HST}",
        "t": "Harmonized Sales Tax: GST and the provincial part charged as one (e.g. Ontario).",
        "e": "13\\%"
      },
      {
        "s": "\\text{PST},\\ \\text{QST}",
        "t": "A separate provincial tax (QST in Quebec).",
        "e": "9.975\\%"
      },
      {
        "s": "c",
        "t": "The combined rate.",
        "e": "14.975\\%"
      },
      {
        "s": "\\frac{\\text{total}}{1 + c}",
        "t": "The price before tax, when you know the total.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Charging QST on the price plus GST.",
        "f": "Since 2013 QST is on the price before GST."
      },
      {
        "m": "Adding GST on top of HST.",
        "f": "HST already includes the federal 5%."
      },
      {
        "m": "Removing tax by subtracting the rate.",
        "f": "Divide the total by 1 + c."
      },
      {
        "m": "Using the wrong province.",
        "f": "The rate is set by where the buyer receives the goods."
      }
    ]
  },
  "capital-gains-tax-india": {
    "example": {
      "question": "Listed shares bought for ₹5,00,000 in January 2024 are sold for ₹8,00,000 in August 2025. Find the capital gains tax.",
      "steps": [
        {
          "title": "Short-term or long-term?",
          "text": "Listed shares held for more than 12 months give a long-term gain. January 2024 to August 2025 is about 19 months, so the gain is **long-term** (section 112A)."
        },
        {
          "title": "The gain",
          "math": [
            "\\text{Gain} = \\text{sale price} - \\text{cost} = 8{,}00{,}000 - 5{,}00{,}000 = 3{,}00{,}000"
          ]
        },
        {
          "title": "Take off the yearly exemption",
          "math": [
            "\\text{Taxable gain} = 3{,}00{,}000 - 1{,}25{,}000 = 1{,}75{,}000"
          ]
        },
        {
          "title": "Tax at 12.5%, then 4% cess",
          "math": [
            "1{,}75{,}000 \\times \\frac{12.5}{100} = 21{,}875",
            "\\text{Cess} = 21{,}875 \\times 4\\% = 875, \\qquad \\text{Total} = 21{,}875 + 875 = 22{,}750"
          ]
        }
      ],
      "answer": "$$\\text{LTCG tax} = \\text{₹}22{,}750$$"
    },
    "symbols": [
      {
        "s": "\\text{STCG}",
        "t": "Short-term capital gain: held 12 months or less (listed shares).",
        "e": ""
      },
      {
        "s": "\\text{LTCG}",
        "t": "Long-term capital gain: held more than 12 months.",
        "e": "3{,}00{,}000"
      },
      {
        "s": "1{,}25{,}000",
        "t": "The yearly LTCG exemption on listed shares and equity funds.",
        "e": ""
      },
      {
        "s": "12.5\\%",
        "t": "The LTCG rate on listed shares (from 23 July 2024).",
        "e": ""
      },
      {
        "s": "\\text{cess}",
        "t": "Health and Education Cess: 4% of the tax.",
        "e": "875"
      }
    ],
    "mistakes": [
      {
        "m": "Using the old 10% rate.",
        "f": "For sales from 23 July 2024 the 112A rate is 12.5%."
      },
      {
        "m": "Forgetting the exemption.",
        "f": "The first ₹1,25,000 of LTCG in the year is exempt."
      },
      {
        "m": "Using indexation on shares.",
        "f": "Listed shares get no indexation; it applied only to some assets bought before 23 July 2024."
      },
      {
        "m": "Missing the cess.",
        "f": "Add 4% of the tax (and any surcharge)."
      }
    ]
  },
  "corporate-tax-calculator": {
    "example": {
      "question": "A UK company has profits of £100,000 and no associated companies. Find its corporation tax.",
      "steps": [
        {
          "title": "Which band?",
          "text": "Profits between £50,000 and £250,000 pay the main rate less marginal relief."
        },
        {
          "title": "Main rate first",
          "math": [
            "25\\% \\times 100{,}000 = 25{,}000"
          ]
        },
        {
          "title": "Marginal relief",
          "math": [
            "\\text{MR} = \\frac{3}{200}(U - P) = \\frac{3}{200}(250{,}000 - 100{,}000) = \\frac{3 \\times 150{,}000}{200} = 2{,}250"
          ]
        },
        {
          "title": "Tax and effective rate",
          "math": [
            "\\text{Tax} = 25{,}000 - 2{,}250 = 22{,}750",
            "\\text{Effective rate} = \\frac{22{,}750}{100{,}000} = 22.75\\%"
          ]
        }
      ],
      "answer": "$$\\text{Corporation tax} = \\text{£}22{,}750 \\ (22.75\\%)$$"
    },
    "symbols": [
      {
        "s": "P",
        "t": "The taxable profits.",
        "e": "100{,}000"
      },
      {
        "s": "U",
        "t": "The upper limit for marginal relief.",
        "e": "250{,}000"
      },
      {
        "s": "\\frac{3}{200}",
        "t": "The marginal relief fraction.",
        "e": ""
      },
      {
        "s": "19\\%,\\ 25\\%",
        "t": "Small profits rate (up to £50,000) and main rate (above £250,000).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using one rate for all profits.",
        "f": "Between £50,000 and £250,000 apply 25% then subtract marginal relief."
      },
      {
        "m": "Ignoring associated companies.",
        "f": "The limits are divided by the number of associated companies plus one."
      },
      {
        "m": "Mixing countries.",
        "f": "India and the US use different rates; choose the right one in the calculator."
      },
      {
        "m": "Short accounting periods.",
        "f": "Limits are reduced in proportion for periods under 12 months."
      }
    ]
  },
  "gst-calculator": {
    "example": null,
    "symbols": [
      {
        "s": "\\text{GST}",
        "t": "Goods and Services Tax.",
        "e": "9{,}000"
      },
      {
        "s": "\\text{CGST} + \\text{SGST}",
        "t": "Central and state halves, for a sale within one state.",
        "e": "4{,}500 + 4{,}500"
      },
      {
        "s": "\\text{IGST}",
        "t": "Integrated GST, for a sale between states (all of it).",
        "e": ""
      },
      {
        "s": "\\frac{\\text{total} \\times 100}{100 + r}",
        "t": "Price before GST from the total.",
        "e": "50{,}000"
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting 18% from the total.",
        "f": "Divide by 1.18: 18% was worked out on the lower price."
      },
      {
        "m": "CGST + SGST on an interstate sale.",
        "f": "Between states charge IGST instead."
      },
      {
        "m": "Old slab rates.",
        "f": "Rates changed on 22 September 2025; check the date of the sale."
      },
      {
        "m": "Splitting the rate unevenly.",
        "f": "CGST and SGST are equal halves."
      }
    ]
  },
  "hra-exemption-calculator": {
    "example": {
      "question": "Basic salary ₹50,000 a month, HRA ₹20,000 a month, rent ₹18,000 a month, in Mumbai (a metro). Find the exempt HRA for the year under the old regime.",
      "steps": [
        {
          "title": "The rule (section 10(13A))",
          "math": [
            "\\text{Exempt} = \\min\\big(\\text{HRA},\\ \\text{rent} - 10\\%\\text{ of salary},\\ 50\\% \\text{ (metro) or } 40\\% \\text{ of salary}\\big)"
          ]
        },
        {
          "title": "Yearly figures",
          "math": [
            "\\text{Salary} = 50{,}000 \\times 12 = 6{,}00{,}000",
            "\\text{HRA} = 20{,}000 \\times 12 = 2{,}40{,}000, \\qquad \\text{Rent} = 18{,}000 \\times 12 = 2{,}16{,}000"
          ]
        },
        {
          "title": "The three amounts",
          "math": [
            "(a)\\ \\text{HRA received} = 2{,}40{,}000",
            "(b)\\ 2{,}16{,}000 - 10\\% \\times 6{,}00{,}000 = 2{,}16{,}000 - 60{,}000 = 1{,}56{,}000",
            "(c)\\ 50\\% \\times 6{,}00{,}000 = 3{,}00{,}000"
          ]
        },
        {
          "title": "The least is exempt",
          "math": [
            "\\text{Exempt} = 1{,}56{,}000, \\qquad \\text{Taxable HRA} = 2{,}40{,}000 - 1{,}56{,}000 = 84{,}000"
          ]
        }
      ],
      "answer": "$$\\text{Exempt HRA} = \\text{₹}1{,}56{,}000, \\quad \\text{taxable} = \\text{₹}84{,}000$$"
    },
    "symbols": [
      {
        "s": "\\text{salary}",
        "t": "Basic pay plus DA (if it counts for retirement), for this rule.",
        "e": "6{,}00{,}000"
      },
      {
        "s": "\\text{HRA}",
        "t": "House rent allowance received.",
        "e": "2{,}40{,}000"
      },
      {
        "s": "50\\%,\\ 40\\%",
        "t": "Metro cities (Delhi, Mumbai, Kolkata, Chennai) and other cities.",
        "e": ""
      },
      {
        "s": "\\min(\\dots)",
        "t": "The exemption is the least of the three.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Claiming it under the new regime.",
        "f": "HRA exemption is only in the old regime."
      },
      {
        "m": "Using gross salary.",
        "f": "Use basic (plus qualifying DA), not gross pay."
      },
      {
        "m": "Picking the largest amount.",
        "f": "The exemption is the smallest of the three."
      },
      {
        "m": "Wrong city percentage.",
        "f": "50% only for the four metros; 40% elsewhere."
      }
    ]
  },
  "income-tax-calculator": {
    "example": {
      "question": "A salaried person earns ₹13,00,000 a year. Find the tax under the new regime for tax year 2026-27.",
      "steps": [
        {
          "title": "Taxable income",
          "math": [
            "13{,}00{,}000 - 75{,}000 \\ (\\text{standard deduction}) = 12{,}25{,}000"
          ]
        },
        {
          "title": "Tax slab by slab",
          "table": {
            "columns": [
              "Slab",
              "Amount in slab",
              "Rate",
              "Tax"
            ],
            "rows": [
              [
                "0 – 4 lakh",
                "4,00,000",
                "0%",
                "0"
              ],
              [
                "4 – 8 lakh",
                "4,00,000",
                "5%",
                "20,000"
              ],
              [
                "8 – 12 lakh",
                "4,00,000",
                "10%",
                "40,000"
              ],
              [
                "12 – 16 lakh",
                "25,000",
                "15%",
                "3,750"
              ],
              [
                "**Total**",
                "12,25,000",
                "",
                "**63,750**"
              ]
            ]
          }
        },
        {
          "title": "Rebate 87A and marginal relief",
          "text": "Income up to ₹12 lakh pays no tax. Just above it, the tax cannot be more than the income above ₹12 lakh.",
          "math": [
            "\\text{Tax} = \\min(63{,}750,\\ 12{,}25{,}000 - 12{,}00{,}000) = 25{,}000"
          ]
        },
        {
          "title": "Add 4% cess",
          "math": [
            "25{,}000 \\times 1.04 = 26{,}000"
          ]
        }
      ],
      "answer": "$$\\text{Tax (new regime)} = \\text{₹}26{,}000$$"
    },
    "symbols": [
      {
        "s": "75{,}000",
        "t": "Standard deduction for salaried people (new regime).",
        "e": ""
      },
      {
        "s": "\\text{slab}",
        "t": "A band of income taxed at one rate.",
        "e": ""
      },
      {
        "s": "87A",
        "t": "Rebate: no tax up to ₹12 lakh taxable income (new regime).",
        "e": ""
      },
      {
        "s": "\\text{marginal relief}",
        "t": "Tax just above the limit cannot exceed the income above it.",
        "e": "25{,}000"
      },
      {
        "s": "\\text{cess}",
        "t": "4% Health and Education Cess on the tax.",
        "e": "1{,}000"
      }
    ],
    "mistakes": [
      {
        "m": "Taxing all income at the top rate.",
        "f": "Each slab is taxed at its own rate only."
      },
      {
        "m": "Forgetting marginal relief.",
        "f": "Just above ₹12 lakh, the tax is capped at the excess."
      },
      {
        "m": "Old-regime deductions in the new regime.",
        "f": "80C, HRA and most deductions are not allowed in the new regime."
      },
      {
        "m": "Missing the cess.",
        "f": "Add 4% at the end."
      }
    ]
  },
  "sales-tax-calculator": {
    "example": {
      "question": "An item costing 100 dollars is bought in a California city with a 1% local rate. Find the sales tax and the total.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "c = \\text{state rate} + \\text{local rate}, \\qquad \\text{tax} = \\text{price} \\times c"
          ]
        },
        {
          "title": "Combined rate",
          "math": [
            "c = 7.25\\% + 1\\% = 8.25\\%"
          ]
        },
        {
          "title": "Tax and total",
          "math": [
            "\\text{Tax} = 100 \\times \\frac{8.25}{100} = 8.25",
            "\\text{Total} = 100 + 8.25 = \\$108.25"
          ]
        },
        {
          "title": "The two shares, and removing tax",
          "math": [
            "\\text{State } 100 \\times 7.25\\% = 7.25, \\qquad \\text{local } 100 \\times 1\\% = 1.00",
            "\\text{From a total: } \\frac{108.25}{1.0825} = 100"
          ]
        }
      ],
      "answer": "$$\\text{Tax} = 8.25, \\quad \\text{total} = 108.25 \\text{ dollars}$$"
    },
    "symbols": [
      {
        "s": "\\text{state rate}",
        "t": "The statewide base rate.",
        "e": "7.25\\%"
      },
      {
        "s": "\\text{local rate}",
        "t": "County and city add-ons.",
        "e": "1\\%"
      },
      {
        "s": "c",
        "t": "The combined rate the shop charges.",
        "e": "8.25\\%"
      },
      {
        "s": "\\frac{\\text{total}}{1 + c}",
        "t": "The price before tax.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using only the state rate.",
        "f": "Most places add local rates; use the combined rate."
      },
      {
        "m": "Subtracting the rate from a total.",
        "f": "Divide by 1 + c."
      },
      {
        "m": "Assuming every item is taxed.",
        "f": "Many states exempt groceries or medicine."
      },
      {
        "m": "Using a VAT idea.",
        "f": "US sales tax is added at the till, not shown in the price."
      }
    ]
  },
  "tds-calculator": {
    "example": {
      "question": "A professional is paid ₹1,00,000 in fees under section 194J (10%). Find the TDS and the amount received.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "\\text{TDS} = \\text{payment} \\times \\text{rate}"
          ]
        },
        {
          "title": "TDS",
          "math": [
            "1{,}00{,}000 \\times \\frac{10}{100} = 10{,}000"
          ]
        },
        {
          "title": "Amount received",
          "math": [
            "1{,}00{,}000 - 10{,}000 = 90{,}000"
          ]
        },
        {
          "title": "What happens to it",
          "text": "The ₹10,000 is paid to the government in the receiver’s name, shows in their Form 26AS, and counts towards their tax for the year."
        }
      ],
      "answer": "$$\\text{TDS} = \\text{₹}10{,}000, \\quad \\text{received} = \\text{₹}90{,}000$$"
    },
    "symbols": [
      {
        "s": "\\text{TDS}",
        "t": "Tax deducted at source by the payer.",
        "e": "10{,}000"
      },
      {
        "s": "194J",
        "t": "The section for professional and technical fees.",
        "e": "10\\%"
      },
      {
        "s": "\\text{threshold}",
        "t": "Below the yearly limit for a section, no TDS is due.",
        "e": ""
      },
      {
        "s": "\\text{PAN}",
        "t": "Without a valid PAN, TDS is usually 20%.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Treating TDS as an extra tax.",
        "f": "It is advance tax; it is set off against the final tax."
      },
      {
        "m": "Wrong section.",
        "f": "Rent, salary, contract and fees each have their own section and rate."
      },
      {
        "m": "Ignoring the threshold.",
        "f": "Check the yearly limit before deducting."
      },
      {
        "m": "Deducting GST too.",
        "f": "TDS is usually on the amount before GST, when GST is shown separately."
      }
    ]
  },
  "uk-income-tax-calculator": {
    "example": {
      "question": "A £45,000 salary with 5% pension paid by salary sacrifice. Find the yearly take-home pay (England, 2026/27).",
      "steps": [
        {
          "title": "Pension first (salary sacrifice)",
          "math": [
            "5\\% \\times 45{,}000 = 2{,}250, \\qquad \\text{pay} = 45{,}000 - 2{,}250 = 42{,}750"
          ]
        },
        {
          "title": "Income tax",
          "text": "The first £12,570 is the personal allowance; the next part up to £50,270 is taxed at 20%.",
          "math": [
            "\\text{Taxable} = 42{,}750 - 12{,}570 = 30{,}180",
            "\\text{Tax} = 30{,}180 \\times 20\\% = 6{,}036"
          ]
        },
        {
          "title": "National Insurance",
          "math": [
            "\\text{NI} = (42{,}750 - 12{,}570) \\times 8\\% = 30{,}180 \\times 0.08 = 2{,}414.40"
          ]
        },
        {
          "title": "Take-home",
          "math": [
            "45{,}000 - 2{,}250 - 6{,}036 - 2{,}414.40 = 34{,}299.60",
            "\\text{a month: } 34{,}299.60 / 12 = 2{,}858.30"
          ]
        }
      ],
      "answer": "$$\\text{Take-home} = \\text{£}34{,}299.60 \\text{ a year}$$"
    },
    "symbols": [
      {
        "s": "12{,}570",
        "t": "The personal allowance: tax-free pay.",
        "e": ""
      },
      {
        "s": "20\\%,\\ 40\\%,\\ 45\\%",
        "t": "Basic, higher and additional rates (England, Wales, NI).",
        "e": ""
      },
      {
        "s": "\\text{NI}",
        "t": "Class 1 employee National Insurance: 8% up to £50,270, then 2%.",
        "e": "2{,}414.40"
      },
      {
        "s": "\\text{salary sacrifice}",
        "t": "Pension taken before tax and NI.",
        "e": "2{,}250"
      }
    ],
    "mistakes": [
      {
        "m": "Taxing the whole salary at 20%.",
        "f": "Take off the personal allowance first."
      },
      {
        "m": "Using Scottish bands for England.",
        "f": "Scotland has its own six bands."
      },
      {
        "m": "NI on the pension.",
        "f": "With salary sacrifice, NI is on the reduced pay."
      },
      {
        "m": "Missing the allowance taper.",
        "f": "Above £100,000 the allowance falls by £1 for every £2."
      }
    ]
  },
  "us-income-tax-calculator": {
    "example": {
      "question": "Wages 85,000 dollars (single filer, 2026), 5,000 dollars into a 401(k), and a 5% state tax. Find the yearly take-home pay.",
      "steps": [
        {
          "title": "Taxable income",
          "math": [
            "85{,}000 - 5{,}000 \\ (\\text{401(k)}) - 16{,}100 \\ (\\text{standard deduction}) = 63{,}900"
          ]
        },
        {
          "title": "Federal tax, bracket by bracket",
          "table": {
            "columns": [
              "Bracket",
              "Amount",
              "Rate",
              "Tax"
            ],
            "rows": [
              [
                "0 – 12,400",
                "12,400",
                "10%",
                "1,240"
              ],
              [
                "12,400 – 50,400",
                "38,000",
                "12%",
                "4,560"
              ],
              [
                "50,400 – 63,900",
                "13,500",
                "22%",
                "2,970"
              ],
              [
                "**Total**",
                "63,900",
                "",
                "**8,770**"
              ]
            ]
          }
        },
        {
          "title": "FICA (on wages, before the 401(k))",
          "math": [
            "\\text{Social Security} = 85{,}000 \\times 6.2\\% = 5{,}270",
            "\\text{Medicare} = 85{,}000 \\times 1.45\\% = 1{,}232.50"
          ]
        },
        {
          "title": "State tax and take-home",
          "math": [
            "\\text{State} = 5\\% \\times (85{,}000 - 5{,}000) = 4{,}000",
            "85{,}000 - 5{,}000 - 8{,}770 - 6{,}502.50 - 4{,}000 = \\$60{,}727.50"
          ]
        }
      ],
      "answer": "$$\\text{Take-home} = 60{,}727.50 \\text{ dollars a year}$$"
    },
    "symbols": [
      {
        "s": "\\text{standard deduction}",
        "t": "Taken off income before the brackets (single, 2026).",
        "e": "16{,}100"
      },
      {
        "s": "\\text{bracket}",
        "t": "A band taxed at one rate.",
        "e": ""
      },
      {
        "s": "\\text{FICA}",
        "t": "Social Security 6.2% (up to the wage base) + Medicare 1.45%.",
        "e": "6{,}502.50"
      },
      {
        "s": "\\text{401(k)}",
        "t": "Pre-tax retirement saving: lowers income tax, not FICA.",
        "e": "5{,}000"
      }
    ],
    "mistakes": [
      {
        "m": "Applying the top rate to everything.",
        "f": "Each bracket is taxed at its own rate only."
      },
      {
        "m": "Taking the 401(k) off FICA wages.",
        "f": "FICA is on wages before the 401(k)."
      },
      {
        "m": "Forgetting the standard deduction.",
        "f": "Take it off before using the brackets."
      },
      {
        "m": "Using last year’s brackets.",
        "f": "The limits change every year with inflation."
      }
    ]
  },
  "vat-calculator": {
    "example": null,
    "symbols": [
      {
        "s": "\\text{net}",
        "t": "The price before VAT.",
        "e": "200"
      },
      {
        "s": "\\text{gross}",
        "t": "The price including VAT.",
        "e": "240"
      },
      {
        "s": "r",
        "t": "The VAT rate.",
        "e": "20\\%"
      },
      {
        "s": "\\text{net} = \\frac{\\text{gross}}{1 + r}",
        "t": "Removing VAT.",
        "e": "\\tfrac{240}{1.2}"
      },
      {
        "s": "\\text{VAT} = \\text{gross} - \\text{net}",
        "t": "The VAT itself.",
        "e": "40"
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting 20% of the gross price.",
        "f": "Divide by 1.2; 20% of £240 is too much."
      },
      {
        "m": "Using the standard rate for everything.",
        "f": "Many goods have reduced or zero rates."
      },
      {
        "m": "Wrong country.",
        "f": "Each country sets its own rate; pick it in the calculator."
      },
      {
        "m": "Rounding each line differently.",
        "f": "Round once, at the end, to the nearest penny or cent."
      }
    ]
  }
};

export default DATA;
