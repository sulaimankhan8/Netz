// Worked examples, symbol keys and common mistakes for the (UNIT-10) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "bill-discounting": {
    "example": {
      "question": "A bill for ₹7,300 is discounted at 10% a year, 73 days before it is due. Find the banker’s discount (BD), the true discount (TD) and the banker’s gain (BG).",
      "steps": [
        {
          "title": "Time in years",
          "math": [
            "t = \\frac{\\text{days}}{365} = \\frac{73}{365} = \\frac15 = 0.2"
          ]
        },
        {
          "title": "Banker's discount: simple interest on the face value",
          "math": [
            "BD = F \\cdot r \\cdot t",
            "BD = 7300 \\times 0.10 \\times 0.2 = 146"
          ]
        },
        {
          "title": "True discount: interest on the present worth",
          "math": [
            "TD = \\frac{F \\cdot r \\cdot t}{1 + r t}",
            "TD = \\frac{146}{1 + 0.10 \\times 0.2} = \\frac{146}{1.02} = 143.14"
          ]
        },
        {
          "title": "Banker's gain, and a check",
          "math": [
            "BG = BD - TD = 146 - 143.14 = 2.86",
            "\\text{Check: } BG = TD \\cdot r t = 143.14 \\times 0.02 = 2.86 \\ \\checkmark",
            "\\text{The bank pays } F - BD = 7300 - 146 = 7154"
          ]
        }
      ],
      "answer": "$$BD = \\text{₹}146,\\quad TD = \\text{₹}143.14,\\quad BG = \\text{₹}2.86$$"
    },
    "symbols": [
      {
        "s": "F",
        "t": "The face value of the bill: the amount due on the due date.",
        "e": "7300"
      },
      {
        "s": "r",
        "t": "The yearly discount rate as a decimal.",
        "e": "0.10"
      },
      {
        "s": "t",
        "t": "The time left until the due date, in years.",
        "e": "\\tfrac{73}{365}"
      },
      {
        "s": "BD",
        "t": "Banker’s discount: simple interest on F.",
        "e": "146"
      },
      {
        "s": "TD",
        "t": "True discount: interest on the present worth.",
        "e": "143.14"
      },
      {
        "s": "BG = BD - TD",
        "t": "Banker’s gain: the extra the bank earns.",
        "e": "2.86"
      }
    ],
    "mistakes": [
      {
        "m": "Using 360 days.",
        "f": "Indian exams use 365 days a year unless the question says otherwise."
      },
      {
        "m": "Counting the days of grace wrongly.",
        "f": "Add the 3 days of grace to the term before finding the due date, when the question asks for it."
      },
      {
        "m": "Thinking TD > BD.",
        "f": "BD is always the larger: it is interest on F, TD is on the smaller present worth."
      },
      {
        "m": "Leaving the rate as 10.",
        "f": "Use r = 0.10 (or divide by 100)."
      }
    ]
  },
  "cagr-calculator": {
    "example": {
      "question": "An investment of ₹1,00,000 grew to ₹2,50,000 in 6 years. Find the CAGR.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "\\text{CAGR} = \\left(\\frac{\\text{end}}{\\text{start}}\\right)^{1/n} - 1"
          ]
        },
        {
          "title": "The growth ratio",
          "math": [
            "\\frac{2{,}50{,}000}{1{,}00{,}000} = 2.5"
          ]
        },
        {
          "title": "Take the 6th root",
          "text": "With a calculator, use logs: $2.5^{1/6} = e^{\\ln 2.5 / 6}$.",
          "math": [
            "\\ln 2.5 = 0.916291, \\quad \\frac{0.916291}{6} = 0.152715",
            "2.5^{1/6} = e^{0.152715} = 1.164993"
          ]
        },
        {
          "title": "Subtract 1",
          "math": [
            "\\text{CAGR} = 1.164993 - 1 = 0.164993 = 16.50\\%",
            "\\text{Check: } 1{,}00{,}000 \\times 1.164993^6 = 2{,}50{,}000 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\text{CAGR} \\approx 16.50\\% \\text{ a year}$$"
    },
    "symbols": [
      {
        "s": "\\text{start},\\ \\text{end}",
        "t": "The value at the beginning and at the end.",
        "e": "1{,}00{,}000,\\ 2{,}50{,}000"
      },
      {
        "s": "n",
        "t": "The number of years.",
        "e": "6"
      },
      {
        "s": "\\text{CAGR}",
        "t": "The steady yearly rate that gives the same growth.",
        "e": "16.50\\%"
      },
      {
        "s": "\\text{absolute return}",
        "t": "Total growth, not per year: (end − start)/start.",
        "e": "150\\%"
      }
    ],
    "mistakes": [
      {
        "m": "Dividing the total return by the years.",
        "f": "150% / 6 = 25% is wrong: growth compounds, so take the n-th root."
      },
      {
        "m": "Forgetting to subtract 1.",
        "f": "$2.5^{1/6} = 1.165$ is the growth factor; the rate is 0.165 = 16.5%."
      },
      {
        "m": "Wrong n.",
        "f": "n is the number of years between the two values, not the number of values."
      },
      {
        "m": "Treating CAGR as the actual yearly return.",
        "f": "It is a smoothed average; real years can be much higher or lower."
      }
    ]
  },
  "compound-interest": {
    "example": null,
    "symbols": [
      {
        "s": "P",
        "t": "The principal: the amount at the start.",
        "e": "8000"
      },
      {
        "s": "R",
        "t": "The yearly rate in per cent.",
        "e": "10"
      },
      {
        "s": "k",
        "t": "Compounding periods per year (2 for half-yearly).",
        "e": "2"
      },
      {
        "s": "n = kT",
        "t": "The total number of periods.",
        "e": "3"
      },
      {
        "s": "A = P\\left(1 + \\frac{R}{100k}\\right)^{n}",
        "t": "The amount after n periods.",
        "e": "9261"
      },
      {
        "s": "CI = A - P",
        "t": "The compound interest.",
        "e": "1261"
      }
    ],
    "mistakes": [
      {
        "m": "Not splitting the rate.",
        "f": "Half-yearly: use R/2 per period and 2T periods."
      },
      {
        "m": "Giving A as the interest.",
        "f": "CI = A − P; A includes the principal."
      },
      {
        "m": "Using the simple-interest formula.",
        "f": "SI = PRT/100 does not earn interest on interest."
      },
      {
        "m": "Rounding too early.",
        "f": "Keep $(1.05)^3 = 1.157625$ in full until the last step."
      }
    ]
  },
  "depreciation-calculator": {
    "example": {
      "question": "A machine costs ₹1,00,000 and has a scrap value of ₹10,000 after 5 years. Find the yearly straight-line depreciation and the book value each year.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "D = \\frac{C - S}{n}"
          ]
        },
        {
          "title": "Put the numbers in",
          "math": [
            "D = \\frac{1{,}00{,}000 - 10{,}000}{5} = \\frac{90{,}000}{5} = 18{,}000 \\text{ a year}",
            "\\text{Rate} = \\frac{18{,}000}{1{,}00{,}000} \\times 100 = 18\\% \\text{ of cost}"
          ]
        },
        {
          "title": "Book value at the end of each year",
          "text": "Subtract ₹18,000 each year from the value at the start of the year.",
          "table": {
            "columns": [
              "Year",
              "Opening value",
              "Depreciation",
              "Closing value"
            ],
            "rows": [
              [
                "1",
                "1,00,000",
                "18,000",
                "82,000"
              ],
              [
                "2",
                "82,000",
                "18,000",
                "64,000"
              ],
              [
                "3",
                "64,000",
                "18,000",
                "46,000"
              ],
              [
                "4",
                "46,000",
                "18,000",
                "28,000"
              ],
              [
                "5",
                "28,000",
                "18,000",
                "10,000"
              ]
            ]
          }
        },
        {
          "title": "Check",
          "math": [
            "\\text{Book value after 5 years} = 10{,}000 = S \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$D = \\text{₹}18{,}000 \\text{ a year; book value after 5 years} = \\text{₹}10{,}000$$"
    },
    "symbols": [
      {
        "s": "C",
        "t": "The cost of the asset.",
        "e": "1{,}00{,}000"
      },
      {
        "s": "S",
        "t": "The scrap (salvage) value at the end of its life.",
        "e": "10{,}000"
      },
      {
        "s": "n",
        "t": "The useful life in years.",
        "e": "5"
      },
      {
        "s": "D = \\frac{C - S}{n}",
        "t": "Straight-line depreciation: the same amount each year.",
        "e": "18{,}000"
      },
      {
        "s": "V_n = C(1 - r)^n",
        "t": "Written-down value method: the same percentage each year.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the scrap value.",
        "f": "Depreciate C − S, not C."
      },
      {
        "m": "Mixing the two methods.",
        "f": "Straight line: same amount each year; written-down value: same rate on the falling balance."
      },
      {
        "m": "Applying WDV to the cost each year.",
        "f": "Under WDV the rate is applied to the opening value of that year."
      },
      {
        "m": "Book value below scrap.",
        "f": "Stop at the scrap value: an asset is not depreciated below it."
      }
    ]
  },
  "emi-calculator": {
    "example": null,
    "symbols": [
      {
        "s": "P",
        "t": "The loan amount (principal).",
        "e": "5{,}00{,}000"
      },
      {
        "s": "i = \\frac{R}{12 \\times 100}",
        "t": "The monthly interest rate.",
        "e": "0.0075"
      },
      {
        "s": "N",
        "t": "The number of monthly instalments.",
        "e": "60"
      },
      {
        "s": "EMI = \\frac{P\\,i\\,(1+i)^N}{(1+i)^N - 1}",
        "t": "The equal monthly instalment.",
        "e": "10{,}379.18"
      },
      {
        "s": "\\text{interest part}",
        "t": "Each month: the balance still owed × i.",
        "e": "3750"
      }
    ],
    "mistakes": [
      {
        "m": "Using the yearly rate as i.",
        "f": "Divide by 12 and by 100: 9% a year is 0.0075 a month."
      },
      {
        "m": "Using years for N.",
        "f": "N counts months: 5 years = 60."
      },
      {
        "m": "Thinking interest is the same each month.",
        "f": "It falls as the balance falls; the principal part grows."
      },
      {
        "m": "Comparing flat and reducing rates directly.",
        "f": "A flat rate charges interest on the full loan all along, so it costs more than the same reducing rate."
      }
    ]
  },
  "fd-calculator": {
    "example": {
      "question": "₹1,00,000 is deposited for 5 years at 7% a year, compounded quarterly. Find the maturity amount.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "A = P\\left(1 + \\frac{R}{100k}\\right)^{kT}"
          ]
        },
        {
          "title": "Rate per quarter and number of quarters",
          "math": [
            "i = \\frac{7}{100 \\times 4} = 0.0175, \\qquad kT = 4 \\times 5 = 20"
          ]
        },
        {
          "title": "Grow the deposit",
          "math": [
            "(1.0175)^{20} = 1.414778",
            "A = 1{,}00{,}000 \\times 1.414778 = 1{,}41{,}477.82"
          ]
        },
        {
          "title": "Interest, and the simple-interest comparison",
          "math": [
            "\\text{Interest} = 1{,}41{,}477.82 - 1{,}00{,}000 = 41{,}477.82",
            "SI = \\frac{1{,}00{,}000 \\times 7 \\times 5}{100} = 35{,}000",
            "\\text{Effective yearly rate} = (1.0175)^4 - 1 = 7.19\\%"
          ]
        }
      ],
      "answer": "$$A \\approx \\text{₹}1{,}41{,}478 \\ (\\text{interest } \\text{₹}41{,}477.82)$$"
    },
    "symbols": [
      {
        "s": "P",
        "t": "The deposit.",
        "e": "1{,}00{,}000"
      },
      {
        "s": "R",
        "t": "The yearly rate in per cent.",
        "e": "7"
      },
      {
        "s": "k",
        "t": "Compounding periods a year (4 = quarterly).",
        "e": "4"
      },
      {
        "s": "T",
        "t": "The time in years.",
        "e": "5"
      },
      {
        "s": "A",
        "t": "The maturity amount.",
        "e": "1{,}41{,}477.82"
      }
    ],
    "mistakes": [
      {
        "m": "Using the yearly rate each quarter.",
        "f": "Quarterly: 7/4 = 1.75% per quarter."
      },
      {
        "m": "Using T as the power.",
        "f": "The power is kT = 20 quarters, not 5."
      },
      {
        "m": "Quoting the interest as the maturity.",
        "f": "Maturity A includes the deposit; interest = A − P."
      },
      {
        "m": "Ignoring tax.",
        "f": "FD interest is taxable; the calculator shows the pre-tax amount."
      }
    ]
  },
  "lumpsum-calculator": {
    "example": {
      "question": "₹1,00,000 is invested for 10 years at an expected 12% a year. Find its value, and its worth in today’s money if inflation is 6% a year.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "F = P(1 + r)^n"
          ]
        },
        {
          "title": "Grow the investment",
          "math": [
            "(1.12)^{10} = 3.105848",
            "F = 1{,}00{,}000 \\times 3.105848 = 3{,}10{,}584.82"
          ]
        },
        {
          "title": "Bring it back to today's money",
          "math": [
            "F_{\\text{real}} = \\frac{F}{(1 + \\text{inflation})^n}",
            "(1.06)^{10} = 1.790848",
            "F_{\\text{real}} = \\frac{3{,}10{,}584.82}{1.790848} = 1{,}73{,}428.94"
          ]
        },
        {
          "title": "The real yearly return",
          "math": [
            "\\frac{1.12}{1.06} - 1 = 0.0566 = 5.66\\%"
          ]
        }
      ],
      "answer": "$$F \\approx \\text{₹}3{,}10{,}585 \\ (\\text{₹}1{,}73{,}429 \\text{ in today's money})$$"
    },
    "symbols": [
      {
        "s": "P",
        "t": "The amount invested once, at the start.",
        "e": "1{,}00{,}000"
      },
      {
        "s": "r",
        "t": "The expected yearly return as a decimal.",
        "e": "0.12"
      },
      {
        "s": "n",
        "t": "The number of years.",
        "e": "10"
      },
      {
        "s": "F",
        "t": "The future value.",
        "e": "3{,}10{,}584.82"
      },
      {
        "s": "\\text{real return}",
        "t": "Return after inflation: $\\frac{1+r}{1+\\text{inflation}} - 1$.",
        "e": "5.66\\%"
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting inflation from the return.",
        "f": "12% − 6% = 6% is close but not exact; use 1.12/1.06 − 1 = 5.66%."
      },
      {
        "m": "Using simple growth.",
        "f": "Returns compound: $(1.12)^{10}$, not $1 + 10 \\times 0.12$."
      },
      {
        "m": "Treating the expected return as certain.",
        "f": "Market returns vary; the answer is an estimate."
      },
      {
        "m": "Using a monthly formula.",
        "f": "A one-time investment with a yearly rate uses yearly compounding."
      }
    ]
  },
  "npv-irr-calculator": {
    "example": {
      "question": "A project costs ₹10,000 today and returns ₹3,000, ₹4,200 and ₹6,800 at the ends of years 1, 2 and 3. Find the NPV at 10% and the IRR.",
      "steps": [
        {
          "title": "The NPV formula",
          "math": [
            "NPV = \\sum_{t=0}^{n} \\frac{C_t}{(1 + r)^t}"
          ]
        },
        {
          "title": "Discount each cash flow at 10%",
          "table": {
            "columns": [
              "Year t",
              "$C_t$",
              "$(1.1)^t$",
              "$C_t/(1.1)^t$"
            ],
            "rows": [
              [
                "0",
                "−10,000",
                "1",
                "−10,000.00"
              ],
              [
                "1",
                "3,000",
                "1.1",
                "2,727.27"
              ],
              [
                "2",
                "4,200",
                "1.21",
                "3,471.07"
              ],
              [
                "3",
                "6,800",
                "1.331",
                "5,108.94"
              ]
            ]
          }
        },
        {
          "title": "Add them",
          "math": [
            "NPV = -10{,}000 + 2{,}727.27 + 3{,}471.07 + 5{,}108.94 = 1{,}307.29",
            "NPV > 0: \\text{ the project earns more than } 10\\%"
          ]
        },
        {
          "title": "IRR: the rate where NPV = 0 (Newton–Raphson)",
          "text": "Start at $r_0 = 0.10$ and use $r_{k+1} = r_k - \\frac{NPV(r_k)}{NPV'(r_k)}$.",
          "table": {
            "columns": [
              "k",
              "$r_k$",
              "$NPV(r_k)$",
              "$NPV'(r_k)$"
            ],
            "rows": [
              [
                "0",
                "0.100000",
                "1,307.29",
                "−22,723.86"
              ],
              [
                "1",
                "0.157529",
                "110.78",
                "−19,018.31"
              ],
              [
                "2",
                "0.163354",
                "0.96",
                "−18,689.13"
              ],
              [
                "3",
                "0.163406",
                "0.0001",
                "−18,686.25"
              ]
            ]
          }
        }
      ],
      "answer": "$$NPV(10\\%) = \\text{₹}1{,}307.29, \\qquad IRR \\approx 16.34\\%$$"
    },
    "symbols": [
      {
        "s": "C_t",
        "t": "The cash flow at the end of year t (negative = money out).",
        "e": "-10{,}000,\\ 3000,\\ \\dots"
      },
      {
        "s": "r",
        "t": "The discount rate (cost of capital).",
        "e": "0.10"
      },
      {
        "s": "NPV",
        "t": "Net present value: all flows in today’s money, added.",
        "e": "1307.29"
      },
      {
        "s": "IRR",
        "t": "Internal rate of return: the r that makes NPV = 0.",
        "e": "16.34\\%"
      }
    ],
    "mistakes": [
      {
        "m": "Discounting the year-0 flow.",
        "f": "The cost today is already in today’s money: divide by $(1+r)^0 = 1$."
      },
      {
        "m": "Dropping the minus on the cost.",
        "f": "Money paid out is negative."
      },
      {
        "m": "Solving IRR with a formula.",
        "f": "There is no closed form for 3+ years: iterate (Newton–Raphson or trial and error)."
      },
      {
        "m": "Reading NPV < 0 as a loss of that size.",
        "f": "It means the project earns less than r, not that you lose that amount in cash."
      }
    ]
  },
  "percentage-calculator": {
    "example": null,
    "symbols": [
      {
        "s": "CP",
        "t": "Cost price: what the seller paid.",
        "e": "800"
      },
      {
        "s": "MP",
        "t": "Marked price: the label price before discount.",
        "e": "1000"
      },
      {
        "s": "SP",
        "t": "Selling price: what the buyer pays.",
        "e": "900"
      },
      {
        "s": "\\text{Profit\\%} = \\frac{SP - CP}{CP} \\times 100",
        "t": "Profit as a percentage of cost.",
        "e": "12.5\\%"
      },
      {
        "s": "\\text{Discount\\%} = \\frac{MP - SP}{MP} \\times 100",
        "t": "Discount as a percentage of the marked price.",
        "e": "10\\%"
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting percentages with different bases.",
        "f": "25% up then 10% off is not 15%: multiply $1.25 \\times 0.9 = 1.125$."
      },
      {
        "m": "Profit on SP.",
        "f": "Profit % is on the cost price unless stated otherwise."
      },
      {
        "m": "Discount on CP.",
        "f": "Discounts are on the marked price."
      },
      {
        "m": "Reversing a percentage change.",
        "f": "A 20% rise is undone by a 16.67% fall, not 20%."
      }
    ]
  },
  "ppf-calculator": {
    "example": {
      "question": "₹1,50,000 is deposited in a PPF at the start of every year for 15 years, at 7.1% a year. Find the maturity amount.",
      "steps": [
        {
          "title": "The formula (deposit at the start of each year)",
          "math": [
            "F = D \\times \\frac{(1 + r)^n - 1}{r} \\times (1 + r)"
          ]
        },
        {
          "title": "Put the numbers in",
          "math": [
            "D = 1{,}50{,}000, \\quad r = 0.071, \\quad n = 15",
            "(1.071)^{15} = 2.797964"
          ]
        },
        {
          "title": "Work it out",
          "math": [
            "\\frac{2.797964 - 1}{0.071} = \\frac{1.797964}{0.071} = 25.3234",
            "F = 1{,}50{,}000 \\times 25.3234 \\times 1.071 = 40{,}68{,}209"
          ]
        },
        {
          "title": "Deposits and interest",
          "math": [
            "\\text{Deposited} = 15 \\times 1{,}50{,}000 = 22{,}50{,}000",
            "\\text{Interest} = 40{,}68{,}209 - 22{,}50{,}000 = 18{,}18{,}209 \\ (\\text{tax-free})"
          ]
        }
      ],
      "answer": "$$F \\approx \\text{₹}40{,}68{,}209$$"
    },
    "symbols": [
      {
        "s": "D",
        "t": "The yearly deposit.",
        "e": "1{,}50{,}000"
      },
      {
        "s": "r",
        "t": "The yearly interest rate as a decimal.",
        "e": "0.071"
      },
      {
        "s": "n",
        "t": "The number of years.",
        "e": "15"
      },
      {
        "s": "\\times(1 + r)",
        "t": "The extra year of growth because each deposit is made at the start of the year.",
        "e": ""
      },
      {
        "s": "F",
        "t": "The maturity amount.",
        "e": "40{,}68{,}209"
      }
    ],
    "mistakes": [
      {
        "m": "Leaving out the (1 + r) factor.",
        "f": "Deposits at the start of the year earn one more year of interest."
      },
      {
        "m": "Assuming the rate is fixed.",
        "f": "The PPF rate is reset each quarter by the government; the answer assumes it stays at 7.1%."
      },
      {
        "m": "Depositing after the 5th of the month.",
        "f": "Interest for a month is on the lowest balance from the 5th to month-end."
      },
      {
        "m": "Going over the limit.",
        "f": "The yearly deposit is capped at ₹1,50,000."
      }
    ]
  },
  "rd-calculator": {
    "example": {
      "question": "₹1,000 is paid into a recurring deposit every month for 1 year at 7% a year, compounded quarterly. Find the maturity amount.",
      "steps": [
        {
          "title": "The formula (quarterly compounding)",
          "math": [
            "M = R \\times \\frac{(1 + i)^n - 1}{1 - (1 + i)^{-1/3}}"
          ]
        },
        {
          "title": "Rate per quarter and number of quarters",
          "math": [
            "i = \\frac{7}{400} = 0.0175, \\qquad n = \\frac{12 \\text{ months}}{3} = 4 \\text{ quarters}"
          ]
        },
        {
          "title": "The two powers",
          "math": [
            "(1.0175)^4 = 1.071859",
            "(1.0175)^{-1/3} = 0.994234 \\ \\Rightarrow\\ 1 - 0.994234 = 0.005766"
          ]
        },
        {
          "title": "Maturity and interest",
          "math": [
            "M = 1000 \\times \\frac{1.071859 - 1}{0.005766} = 1000 \\times 12.4621 = 12{,}462.13",
            "\\text{Paid in} = 12 \\times 1000 = 12{,}000, \\quad \\text{interest} = 462.13"
          ]
        }
      ],
      "answer": "$$M = \\text{₹}12{,}462.13$$"
    },
    "symbols": [
      {
        "s": "R",
        "t": "The monthly instalment.",
        "e": "1000"
      },
      {
        "s": "i",
        "t": "The rate per quarter as a decimal.",
        "e": "0.0175"
      },
      {
        "s": "n",
        "t": "The number of quarters.",
        "e": "4"
      },
      {
        "s": "(1+i)^{-1/3}",
        "t": "One month as a third of a quarter.",
        "e": "0.994234"
      },
      {
        "s": "M",
        "t": "The maturity amount.",
        "e": "12{,}462.13"
      }
    ],
    "mistakes": [
      {
        "m": "Treating it as a lump sum.",
        "f": "Each instalment earns interest only from the month it is paid."
      },
      {
        "m": "Using months for n.",
        "f": "With quarterly compounding n counts quarters: 12 months = 4."
      },
      {
        "m": "Using the yearly rate for i.",
        "f": "i = 7/400 per quarter."
      },
      {
        "m": "Expecting a big interest.",
        "f": "On average the money is in for only half the term, so the interest is small."
      }
    ]
  },
  "sip-calculator": {
    "example": {
      "question": "₹10,000 is invested every month for 10 years at an expected 12% a year. Find the expected value.",
      "steps": [
        {
          "title": "The formula (payment at the start of each month)",
          "math": [
            "F = P \\times \\frac{(1 + i)^n - 1}{i} \\times (1 + i)"
          ]
        },
        {
          "title": "Monthly rate and number of months",
          "math": [
            "i = \\frac{12}{12 \\times 100} = 0.01, \\qquad n = 10 \\times 12 = 120"
          ]
        },
        {
          "title": "Work it out",
          "math": [
            "(1.01)^{120} = 3.300387",
            "\\frac{3.300387 - 1}{0.01} = 230.0387",
            "F = 10{,}000 \\times 230.0387 \\times 1.01 = 23{,}23{,}391"
          ]
        },
        {
          "title": "Invested and gains",
          "math": [
            "\\text{Invested} = 120 \\times 10{,}000 = 12{,}00{,}000",
            "\\text{Gains} = 23{,}23{,}391 - 12{,}00{,}000 = 11{,}23{,}391"
          ]
        }
      ],
      "answer": "$$F \\approx \\text{₹}23{,}23{,}391 \\ (\\text{about } \\text{₹}23.23 \\text{ lakh})$$"
    },
    "symbols": [
      {
        "s": "P",
        "t": "The monthly investment.",
        "e": "10{,}000"
      },
      {
        "s": "i",
        "t": "The monthly rate: yearly % / 12 / 100.",
        "e": "0.01"
      },
      {
        "s": "n",
        "t": "The number of monthly payments.",
        "e": "120"
      },
      {
        "s": "\\times(1 + i)",
        "t": "Each payment is at the start of the month, so it earns one more month.",
        "e": ""
      },
      {
        "s": "F",
        "t": "The expected value at the end.",
        "e": "23{,}23{,}391"
      }
    ],
    "mistakes": [
      {
        "m": "Using the yearly rate for i.",
        "f": "12% a year is 1% a month."
      },
      {
        "m": "Using years for n.",
        "f": "n counts months: 10 years = 120."
      },
      {
        "m": "Multiplying total invested by $(1 + r)^{10}$.",
        "f": "Later payments are invested for less time; use the SIP formula."
      },
      {
        "m": "Treating the result as guaranteed.",
        "f": "Market returns vary; 12% is only an assumption."
      }
    ]
  },
  "time-value-of-money": {
    "example": {
      "question": "Find the present value of ₹10,000 received at the end of each year for 5 years, at 8% a year.",
      "steps": [
        {
          "title": "The formula (ordinary annuity)",
          "math": [
            "PV = PMT \\times \\frac{1 - (1 + r)^{-n}}{r}"
          ]
        },
        {
          "title": "Put the numbers in",
          "math": [
            "PMT = 10{,}000, \\quad r = 0.08, \\quad n = 5",
            "(1.08)^{-5} = \\frac{1}{1.469328} = 0.680583"
          ]
        },
        {
          "title": "The annuity factor",
          "math": [
            "\\frac{1 - 0.680583}{0.08} = \\frac{0.319417}{0.08} = 3.99271"
          ]
        },
        {
          "title": "The present value",
          "math": [
            "PV = 10{,}000 \\times 3.99271 = 39{,}927.10",
            "\\text{Less than } 5 \\times 10{,}000 = 50{,}000: \\text{ later money is worth less today}"
          ]
        }
      ],
      "answer": "$$PV \\approx \\text{₹}39{,}927.10$$"
    },
    "symbols": [
      {
        "s": "PMT",
        "t": "The equal payment each period.",
        "e": "10{,}000"
      },
      {
        "s": "r",
        "t": "The rate per period as a decimal.",
        "e": "0.08"
      },
      {
        "s": "n",
        "t": "The number of payments.",
        "e": "5"
      },
      {
        "s": "PV",
        "t": "Present value: what the payments are worth today.",
        "e": "39{,}927.10"
      },
      {
        "s": "FV = PV(1 + r)^n",
        "t": "Future value of a single sum.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using the FV formula for PV.",
        "f": "Present value discounts: divide by $(1 + r)^t$, do not multiply."
      },
      {
        "m": "Annuity due vs ordinary.",
        "f": "Payments at the start of each period: multiply the PV by (1 + r)."
      },
      {
        "m": "Rate and period mismatch.",
        "f": "Monthly payments need a monthly rate and n in months."
      },
      {
        "m": "Forgetting the minus in the power.",
        "f": "The PV factor uses $(1 + r)^{-n}$."
      }
    ]
  }
};

export default DATA;
