// Worked examples, symbol keys and common mistakes for the Unit 5 pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are the page engine's own working for the same input.
const DATA = {
  "anova": {
    "example": {
      "question": "Three groups of 5 scores: A = 8, 10, 7, 14, 11; B = 7, 5, 10, 9, 9; C = 12, 9, 13, 12, 14. At the 5% level, do the group means differ? (One-way ANOVA.)",
      "steps": [
        {
          "title": "Grand total and correction factor",
          "math": [
            "CF = \\frac{G^2}{N}",
            "G = 150, \\quad N = 15, \\quad CF = \\frac{150^2}{15} = 1500"
          ]
        },
        {
          "title": "Total sum of squares",
          "math": [
            "SST = \\sum x^2 - CF",
            "SST = 1600 - 1500 = 100"
          ]
        },
        {
          "title": "Between-treatment sum of squares",
          "math": [
            "SSTr = \\sum \\frac{T_i^2}{n_i} - CF",
            "T_i = 50, 40, 60",
            "SSTr = \\frac{50^2}{5} + \\frac{40^2}{5} + \\frac{60^2}{5} - 1500 = 40"
          ]
        },
        {
          "title": "Error (within) sum of squares",
          "math": [
            "SSE = SST - SSTr",
            "SSE = 100 - 40 = 60"
          ]
        },
        {
          "title": "F ratio and decision",
          "math": [
            "F = \\frac{MSTr}{MSE}",
            "F = \\frac{20}{5} = 4",
            "F_{0.05}(2, 12) = 3.885, \\quad p = 0.0467",
            "F > F_{0.05}: \\text{ reject } H_0 \\text{ (the treatment means differ)}"
          ]
        }
      ],
      "answer": "$$F = 4 > F_{0.05}(2, 12) = 3.885 \\ \\Rightarrow \\ \\text{the group means differ}$$"
    },
    "symbols": [
      {
        "s": "G,\\ N",
        "t": "The grand total of all scores and how many there are.",
        "e": "G = 150,\\ N = 15"
      },
      {
        "s": "CF = \\frac{G^2}{N}",
        "t": "The correction factor, subtracted from every sum of squares.",
        "e": "1500"
      },
      {
        "s": "SST",
        "t": "Total sum of squares: how much all scores vary.",
        "e": "100"
      },
      {
        "s": "SSTr",
        "t": "Between-groups sum of squares: how much the group totals differ.",
        "e": "40"
      },
      {
        "s": "SSE",
        "t": "Within-groups (error) sum of squares: SST − SSTr.",
        "e": "60"
      },
      {
        "s": "F = \\frac{MSTr}{MSE}",
        "t": "Each sum of squares divided by its degrees of freedom (k − 1 and N − k), then the ratio.",
        "e": "\\dfrac{40/2}{60/12} = 4"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the correction factor.",
        "f": "Every sum of squares subtracts $CF = G^2/N$."
      },
      {
        "m": "Wrong degrees of freedom.",
        "f": "Between groups: $k - 1$ (here 2). Within groups: $N - k$ (here 12)."
      },
      {
        "m": "Comparing sums of squares instead of mean squares.",
        "f": "Divide each by its degrees of freedom first: $F = MSTr / MSE$."
      },
      {
        "m": "Reading the F table the wrong way round.",
        "f": "Use $F(\\text{between df}, \\text{within df}) = F(2, 12)$."
      },
      {
        "m": "Concluding which group is different.",
        "f": "ANOVA only says the means are not all equal; a further test is needed to say which differ."
      }
    ]
  },
  "bayes-theorem": {
    "example": {
      "question": "Machines M1, M2, M3 make 25%, 35% and 40% of the bolts; 5%, 4% and 2% of their bolts are defective. A bolt is found defective (event A): what is the chance it came from each machine?",
      "steps": [
        {
          "title": "Multiply each prior by its likelihood",
          "math": [
            "P(\\text{M1})\\,P(A \\mid \\text{M1}) = \\frac{1}{4} \\times \\frac{1}{20} = \\frac{1}{80}",
            "P(\\text{M2})\\,P(A \\mid \\text{M2}) = \\frac{7}{20} \\times \\frac{1}{25} = \\frac{7}{500}",
            "P(\\text{M3})\\,P(A \\mid \\text{M3}) = \\frac{2}{5} \\times \\frac{1}{50} = \\frac{1}{125}"
          ]
        },
        {
          "title": "Total probability of A",
          "math": [
            "P(A) = \\sum P(E_i)\\,P(A \\mid E_i)",
            "P(A) = \\frac{1}{80} + \\frac{7}{500} + \\frac{1}{125} = \\frac{69}{2000} \\approx 0.0345"
          ]
        },
        {
          "title": "Bayes' theorem for each event",
          "math": [
            "P(E_i \\mid A) = \\frac{P(E_i)\\,P(A \\mid E_i)}{P(A)}",
            "P(\\text{M1} \\mid A) = \\frac{\\frac{1}{80}}{\\frac{69}{2000}} = \\frac{25}{69} \\approx 0.362319",
            "P(\\text{M2} \\mid A) = \\frac{\\frac{7}{500}}{\\frac{69}{2000}} = \\frac{28}{69} \\approx 0.405797",
            "P(\\text{M3} \\mid A) = \\frac{\\frac{1}{125}}{\\frac{69}{2000}} = \\frac{16}{69} \\approx 0.231884"
          ]
        }
      ],
      "answer": "$$P(M1 \\mid A) = \\tfrac{25}{69}, \\quad P(M2 \\mid A) = \\tfrac{28}{69}, \\quad P(M3 \\mid A) = \\tfrac{16}{69}$$"
    },
    "symbols": [
      {
        "s": "P(E_i)",
        "t": "The prior: the chance of each cause before we know the result.",
        "e": "P(M1) = 0.25"
      },
      {
        "s": "P(A \\mid E_i)",
        "t": "The likelihood: the chance of the result if that cause is true.",
        "e": "P(A \\mid M1) = 0.05"
      },
      {
        "s": "P(A)",
        "t": "The total chance of the result: the sum of prior × likelihood over all causes.",
        "e": "0.0345"
      },
      {
        "s": "P(E_i \\mid A)",
        "t": "The posterior: the updated chance of each cause given the result.",
        "e": "P(M1 \\mid A) = \\dfrac{25}{69}"
      }
    ],
    "mistakes": [
      {
        "m": "Confusing $P(A \\mid M1)$ with $P(M1 \\mid A)$.",
        "f": "The question gives defect rates for each machine; Bayes turns them round into machine chances for a defect."
      },
      {
        "m": "Forgetting the denominator.",
        "f": "Divide each product by the total $P(A) = \\sum P(E_i)P(A \\mid E_i)$."
      },
      {
        "m": "Priors that do not add up to 1.",
        "f": "Check: 0.25 + 0.35 + 0.40 = 1."
      },
      {
        "m": "Posteriors that do not add up to 1.",
        "f": "They always do: $\\frac{25}{69} + \\frac{28}{69} + \\frac{16}{69} = 1$. Use it as a check."
      }
    ]
  },
  "binomial-distribution": {
    "example": {
      "question": "A fair coin is tossed 10 times. Find the probability of exactly 5 heads, and the mean and variance of the number of heads.",
      "steps": [
        {
          "title": "Identify n, p and q",
          "math": [
            "P(X = k) = \\binom{n}{k} p^k q^{n-k}",
            "n = 10, \\quad p = \\frac{1}{2}, \\quad q = 1 - p = \\frac{1}{2}"
          ]
        },
        {
          "title": "Add the probabilities",
          "math": [
            "P(X = 5) = \\binom{10}{5}\\left(\\frac{1}{2}\\right)^{5}\\left(\\frac{1}{2}\\right)^{5}",
            "= \\frac{63}{256} \\approx 0.246094"
          ]
        },
        {
          "title": "Mean and variance",
          "math": [
            "\\mu = np, \\ \\sigma^2 = npq",
            "\\mu = 10 \\times \\frac{1}{2} = 5, \\quad \\sigma^2 = 2.5, \\quad \\sigma = 1.58114"
          ]
        }
      ],
      "answer": "$$P(X = 5) = \\tfrac{63}{256} \\approx 0.2461, \\quad \\mu = 5, \\quad \\sigma^2 = 2.5$$"
    },
    "symbols": [
      {
        "s": "n",
        "t": "The number of independent trials.",
        "e": "n = 10"
      },
      {
        "s": "p,\\ q",
        "t": "The chance of success in one trial, and of failure q = 1 − p.",
        "e": "p = q = \\tfrac12"
      },
      {
        "s": "\\binom{n}{k}",
        "t": "The number of ways to place k successes among n trials.",
        "e": "\\binom{10}{5} = 252"
      },
      {
        "s": "P(X = k)",
        "t": "The chance of exactly k successes.",
        "e": "\\dfrac{63}{256}"
      },
      {
        "s": "\\mu = np,\\ \\sigma^2 = npq",
        "t": "Mean and variance of a binomial distribution.",
        "e": "5,\\ 2.5"
      }
    ],
    "mistakes": [
      {
        "m": "Leaving out the $\\binom{n}{k}$ factor.",
        "f": "$p^k q^{n-k}$ is the chance of one particular order; multiply by the number of orders."
      },
      {
        "m": "Using it when trials are not independent.",
        "f": "Binomial needs a fixed n, independent trials and the same p every time."
      },
      {
        "m": "\"At least\" questions summed term by term.",
        "f": "Use the complement: $P(X \\ge 1) = 1 - P(X = 0)$."
      },
      {
        "m": "Variance $np$ instead of $npq$.",
        "f": "Variance is $npq$; the standard deviation is $\\sqrt{npq}$."
      }
    ]
  },
  "confidence-interval": {
    "example": {
      "question": "A sample of n = 25 has mean 50; the population standard deviation is 10. Find the 95% confidence interval for the population mean.",
      "steps": [
        {
          "title": "Standard error",
          "math": [
            "SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{10}{\\sqrt{25}} = 2"
          ]
        },
        {
          "title": "Critical value",
          "math": [
            "z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2)",
            "95\\% \\Rightarrow \\alpha = 0.05, \\quad z = 1.96"
          ]
        },
        {
          "title": "The interval",
          "math": [
            "\\text{estimate} \\pm (\\text{critical value})(SE)",
            "50 \\pm 1.96 \\times 2 = 50 \\pm 3.9199",
            "(46.0801, \\ 53.9199)"
          ]
        }
      ],
      "answer": "$$(46.0801, \\ 53.9199)$$"
    },
    "symbols": [
      {
        "s": "\\bar x",
        "t": "The sample mean: the centre of the interval.",
        "e": "50"
      },
      {
        "s": "\\sigma,\\ n",
        "t": "The population standard deviation and the sample size.",
        "e": "10,\\ 25"
      },
      {
        "s": "SE = \\frac{\\sigma}{\\sqrt n}",
        "t": "The standard error: how much sample means vary.",
        "e": "\\dfrac{10}{5} = 2"
      },
      {
        "s": "z_{\\alpha/2}",
        "t": "The critical value for the confidence level (1.96 for 95%, 2.576 for 99%).",
        "e": "1.96"
      },
      {
        "s": "\\bar x \\pm z\\,SE",
        "t": "The interval: estimate plus and minus the margin of error.",
        "e": "50 \\pm 3.92"
      }
    ],
    "mistakes": [
      {
        "m": "Dividing by n instead of $\\sqrt n$.",
        "f": "$SE = \\sigma / \\sqrt n$: here $10/5 = 2$."
      },
      {
        "m": "Using z when σ is unknown and n is small.",
        "f": "Then use the sample s and the t table with n − 1 degrees of freedom."
      },
      {
        "m": "Wrong critical value.",
        "f": "95% two-sided uses 1.96 (not 1.645, which is one-sided)."
      },
      {
        "m": "Saying \"95% chance the mean is in this interval\".",
        "f": "It means 95% of intervals made this way contain the true mean."
      }
    ]
  },
  "control-charts": {
    "example": {
      "question": "Five subgroups of 5 measurements each (10 12 11 13 12; 11 13 12 12 14; 12 11 13 12 13; 13 14 12 11 12; 12 12 13 14 11). Draw up the x̄ and R charts and say whether the process is in control.",
      "steps": [
        {
          "title": "Subgroup means and ranges",
          "math": [
            "\\bar{x}_i = 11.6, 12.4, 12.2, 12.4, 12.4",
            "R_i = 3, 3, 2, 3, 3",
            "\\bar{\\bar{x}} = 12.2, \\quad \\bar{R} = 2.8"
          ]
        },
        {
          "title": "x̄ chart",
          "math": [
            "\\bar{\\bar{x}} \\pm A_2\\bar{R}, \\ A_2 = 0.577 \\ (n = 5)",
            "\\text{CL} = 12.2, \\ \\text{UCL} = 13.816, \\ \\text{LCL} = 10.584",
            "\\text{all means within the limits}"
          ]
        },
        {
          "title": "R chart",
          "math": [
            "D_3\\bar{R} \\le R \\le D_4\\bar{R}, \\ D_3 = 0, \\ D_4 = 2.114",
            "\\text{CL} = 2.8, \\ \\text{UCL} = 5.9192, \\ \\text{LCL} = 0",
            "\\text{all ranges within the limits}"
          ]
        }
      ],
      "answer": "$$\\bar x \\text{ chart: } 10.584 \\text{ to } 13.816, \\quad R \\text{ chart: } 0 \\text{ to } 5.919 \\ \\Rightarrow \\ \\text{in control}$$"
    },
    "symbols": [
      {
        "s": "\\bar x_i,\\ R_i",
        "t": "The mean and the range (largest − smallest) of each subgroup.",
        "e": "\\bar x_1 = 11.6,\\ R_1 = 3"
      },
      {
        "s": "\\bar{\\bar x},\\ \\bar R",
        "t": "The mean of the subgroup means and the mean range: the centre lines.",
        "e": "12.2,\\ 2.8"
      },
      {
        "s": "A_2,\\ D_3,\\ D_4",
        "t": "Table constants that depend on the subgroup size n.",
        "e": "n = 5: \\ 0.577,\\ 0,\\ 2.114"
      },
      {
        "s": "UCL,\\ LCL",
        "t": "Upper and lower control limits. Points outside them signal a problem.",
        "e": "13.816,\\ 10.584"
      }
    ],
    "mistakes": [
      {
        "m": "Using the wrong constants.",
        "f": "A₂, D₃, D₄ depend on the subgroup size; for n = 5 they are 0.577, 0, 2.114."
      },
      {
        "m": "Using the standard deviation for the R chart.",
        "f": "The R chart uses ranges: largest minus smallest in each subgroup."
      },
      {
        "m": "A negative lower limit.",
        "f": "If $D_3\\bar R$ would be negative, take LCL = 0 (ranges cannot be negative)."
      },
      {
        "m": "Only checking the x̄ chart.",
        "f": "A process is in control only if both the x̄ and the R charts are."
      }
    ]
  },
  "correlation-coefficient": {
    "example": {
      "question": "Heights of fathers x = 65, 66, 67, 67, 68, 69, 70, 72 and sons y = 67, 68, 65, 68, 72, 72, 69, 71. Find Karl Pearson's correlation coefficient.",
      "steps": [
        {
          "title": "Means",
          "math": [
            "\\bar x = \\frac{544}{8} = 68, \\quad \\bar y = \\frac{552}{8} = 69"
          ]
        },
        {
          "title": "Totals from the deviation table",
          "math": [
            "\\sum (x - \\bar x)^2 = 36, \\ \\sum (y - \\bar y)^2 = 44, \\ \\sum (x - \\bar x)(y - \\bar y) = 24"
          ]
        },
        {
          "title": "Karl Pearson's coefficient",
          "math": [
            "r = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sqrt{\\sum (x - \\bar x)^2 \\sum (y - \\bar y)^2}}",
            "r = \\frac{24}{\\sqrt{36 \\times 44}} = 0.603",
            "\\text{moderate positive correlation}"
          ]
        }
      ],
      "answer": "$$r = 0.603 \\ (\\text{moderate positive})$$"
    },
    "symbols": [
      {
        "s": "\\bar x,\\ \\bar y",
        "t": "The two means.",
        "e": "68,\\ 69"
      },
      {
        "s": "x - \\bar x,\\ y - \\bar y",
        "t": "The deviations from the means, worked out for every pair.",
        "e": "65 - 68 = -3"
      },
      {
        "s": "\\sum (x - \\bar x)(y - \\bar y)",
        "t": "The sum of the products of deviations: positive when x and y rise together.",
        "e": "24"
      },
      {
        "s": "r",
        "t": "The correlation coefficient, always between −1 and 1.",
        "e": "0.603"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the square root in the denominator.",
        "f": "$r = \\dfrac{\\sum xy}{\\sqrt{\\sum x^2 \\sum y^2}}$ (in deviations)."
      },
      {
        "m": "A value of r outside [−1, 1].",
        "f": "That always means an arithmetic slip; recheck the sums."
      },
      {
        "m": "Reading correlation as cause.",
        "f": "r measures how closely the points follow a straight line, not why."
      },
      {
        "m": "Mixing deviations and raw values.",
        "f": "Use either all deviations or the raw-sum formula, not a mixture."
      }
    ]
  },
  "curve-fitting": {
    "example": {
      "question": "Fit a curve of the form y = abˣ to x = 1, 2, 3, 4, 5 and y = 6, 12, 24, 48, 96 by least squares.",
      "steps": [
        {
          "title": "Take logs to get a straight line",
          "math": [
            "y = ab^{x} \\ \\Rightarrow \\ \\log y = \\log a + x\\log b",
            "Y = A + Bx, \\quad A = \\log a, \\ B = \\log b"
          ]
        },
        {
          "title": "Normal equations for the line",
          "math": [
            "\\sum Y = nA + B\\sum x, \\quad \\sum xY = A\\sum x + B\\sum x^2",
            "6.9011 = 5A + 15B",
            "23.7135 = 15A + 55B",
            "A = 0.4771, \\quad B = 0.301"
          ]
        },
        {
          "title": "Back to the curve",
          "math": [
            "a = 10^{A} = 3, \\quad b = 10^{B} = 2",
            "y = 3(2)^{x}"
          ]
        }
      ],
      "answer": "$$y = 3(2)^{x}$$"
    },
    "symbols": [
      {
        "s": "y = ab^x",
        "t": "The curve to fit: y multiplies by b for every step of 1 in x.",
        "e": "y = 3(2)^x"
      },
      {
        "s": "Y = \\log y",
        "t": "Taking logs turns the curve into a straight line Y = A + Bx.",
        "e": "\\log 6 = 0.7782"
      },
      {
        "s": "A = \\log a,\\ B = \\log b",
        "t": "The line's intercept and slope, found from the normal equations.",
        "e": "A = 0.4771"
      },
      {
        "s": "\\text{normal equations}",
        "t": "$\\sum Y = nA + B\\sum x$ and $\\sum xY = A\\sum x + B\\sum x^2$.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Fitting a straight line to y itself.",
        "f": "Take logs first: $\\log y = \\log a + x\\log b$ is the straight line."
      },
      {
        "m": "Forgetting to undo the logs.",
        "f": "$a = 10^A$, $b = 10^B$ (or $e^A$ if natural logs were used)."
      },
      {
        "m": "Mixing log bases.",
        "f": "Use the same base for taking logs and for undoing them."
      },
      {
        "m": "Using log x instead of x.",
        "f": "For $y = ab^x$ only y is logged; for $y = ax^b$ both are."
      }
    ]
  },
  "descriptive-statistics": {
    "example": {
      "question": "For the data 2, 4, 4, 4, 5, 5, 7, 9 find the mean, median, mode, variance, standard deviation, skewness and kurtosis.",
      "steps": [
        {
          "title": "Mean",
          "math": [
            "\\bar x = \\frac{\\sum x}{n}",
            "\\bar x = \\frac{40}{8} = 5"
          ]
        },
        {
          "title": "Median",
          "math": [
            "\\text{the } \\left(\\frac{N + 1}{2}\\right)^{\\text{th}} \\text{ value in order}",
            "\\frac{8 + 1}{2} = 4.5^{\\text{th}} \\text{ value} = 4.5"
          ]
        },
        {
          "title": "Mode",
          "math": [
            "\\text{Most frequent: } 4 \\ (3 \\text{ times})"
          ]
        },
        {
          "title": "Variance and standard deviation",
          "math": [
            "\\sigma^2 = \\frac{\\sum f(x - \\bar x)^2}{N}, \\quad s^2 = \\frac{\\sum f(x - \\bar x)^2}{N - 1}",
            "\\sigma^2 = \\frac{32}{8} = 4, \\quad \\sigma = 2",
            "\\text{Sample: } s^2 = \\frac{32}{7} = 4.57143, \\quad s = 2.13809"
          ]
        },
        {
          "title": "Skewness and kurtosis",
          "math": [
            "S_k = \\frac{3(\\bar x - \\text{median})}{\\sigma}, \\ \\beta_1 = \\frac{\\mu_3^2}{\\mu_2^3}, \\ \\beta_2 = \\frac{\\mu_4}{\\mu_2^2}",
            "S_k = \\frac{3(5 - 4.5)}{2} = 0.75",
            "\\mu_2 = 4, \\ \\mu_3 = 5.25, \\ \\mu_4 = 44.5",
            "\\beta_1 = 0.4307, \\ \\gamma_1 = 0.6563, \\quad \\beta_2 = 2.7813, \\ \\gamma_2 = \\beta_2 - 3 = -0.2188",
            "\\text{Positively skewed (long right tail)}; \\ \\text{platykurtic (flat)}"
          ]
        }
      ],
      "answer": "$$\\bar x = 5, \\ \\text{median} = 4.5, \\ \\text{mode} = 4, \\ \\sigma = 2$$"
    },
    "symbols": [
      {
        "s": "\\bar x",
        "t": "The mean: the sum divided by the count.",
        "e": "\\dfrac{40}{8} = 5"
      },
      {
        "s": "\\text{median}",
        "t": "The middle value once the data are in order (the average of the two middle ones for an even count).",
        "e": "4.5"
      },
      {
        "s": "\\sigma^2,\\ s^2",
        "t": "Variance: divide by N for the population, by N − 1 for a sample.",
        "e": "4,\\ 4.571"
      },
      {
        "s": "\\mu_2,\\ \\mu_3,\\ \\mu_4",
        "t": "Central moments: averages of the 2nd, 3rd, 4th powers of the deviations.",
        "e": "4,\\ 5.25,\\ 44.5"
      },
      {
        "s": "\\beta_1,\\ \\beta_2",
        "t": "Skewness and kurtosis measures. β₂ = 3 for a normal curve.",
        "e": "0.431,\\ 2.781"
      }
    ],
    "mistakes": [
      {
        "m": "Finding the median without sorting.",
        "f": "Put the data in order first."
      },
      {
        "m": "Mixing N and N − 1.",
        "f": "N for the whole population (σ²), N − 1 for a sample (s²); say which you use."
      },
      {
        "m": "Forgetting to square the deviations.",
        "f": "Variance averages $(x - \\bar x)^2$, not $(x - \\bar x)$ (which always sums to 0)."
      },
      {
        "m": "Reading the sign of skewness wrongly.",
        "f": "Mean > median: positively skewed (long right tail)."
      }
    ]
  },
  "exponential-distribution": {
    "example": {
      "question": "The time between calls follows an exponential distribution with rate λ = 0.5 per minute. Find P(X ≤ 2), the mean and the variance.",
      "steps": [
        {
          "title": "The distribution",
          "math": [
            "f(x) = \\lambda e^{-\\lambda x}, \\ x \\ge 0",
            "\\lambda = \\frac{1}{2}, \\quad \\text{mean} = \\frac{1}{\\lambda} = 2, \\quad \\text{variance} = \\frac{1}{\\lambda^2} = 4"
          ]
        },
        {
          "title": "The probability",
          "math": [
            "P(X \\le x) = 1 - e^{-\\lambda x}",
            "P(X \\le 2) = 1 - e^{-\\frac{1}{2}(2)} = 0.632121"
          ]
        }
      ],
      "answer": "$$P(X \\le 2) = 0.6321, \\quad \\text{mean} = 2, \\quad \\text{variance} = 4$$"
    },
    "symbols": [
      {
        "s": "\\lambda",
        "t": "The rate: average number of events per unit time.",
        "e": "0.5"
      },
      {
        "s": "f(x) = \\lambda e^{-\\lambda x}",
        "t": "The density for waiting times x ≥ 0.",
        "e": ""
      },
      {
        "s": "P(X \\le x) = 1 - e^{-\\lambda x}",
        "t": "The chance of waiting at most x.",
        "e": "1 - e^{-1} = 0.632"
      },
      {
        "s": "\\frac{1}{\\lambda},\\ \\frac{1}{\\lambda^2}",
        "t": "Mean and variance.",
        "e": "2,\\ 4"
      }
    ],
    "mistakes": [
      {
        "m": "Using the mean as the rate.",
        "f": "If the mean is 2 minutes, $\\lambda = 1/2$, not 2."
      },
      {
        "m": "Forgetting the \"1 −\".",
        "f": "$P(X \\le x) = 1 - e^{-\\lambda x}$; $P(X > x) = e^{-\\lambda x}$."
      },
      {
        "m": "Adding waiting time from the start.",
        "f": "The memoryless property: $P(X > s + t \\mid X > s) = P(X > t)$."
      },
      {
        "m": "Variance 1/λ.",
        "f": "Variance is $1/\\lambda^2$; the standard deviation equals the mean."
      }
    ]
  },
  "gamma-distribution": {
    "example": {
      "question": "X follows a gamma distribution with shape α = 2 and scale θ = 3. Find P(X ≤ 5), the mean and the variance.",
      "steps": [
        {
          "title": "The distribution",
          "math": [
            "f(x) = \\frac{x^{\\alpha-1}e^{-x/\\theta}}{\\Gamma(\\alpha)\\theta^{\\alpha}}",
            "\\alpha = 2, \\ \\theta = 3, \\quad \\text{mean} = \\alpha\\theta = 6, \\quad \\text{variance} = \\alpha\\theta^2 = 18"
          ]
        },
        {
          "title": "The probability (incomplete gamma function)",
          "math": [
            "P(X \\le x) = P\\left(\\alpha, \\frac{x}{\\theta}\\right)",
            "P(X \\le 5) = P\\left(2, \\tfrac{5}{3}\\right) = 0.496332"
          ]
        },
        {
          "title": "Check with the Erlang formula (whole α)",
          "math": [
            "P(X > x) = e^{-x/\\theta}\\sum_{j=0}^{\\alpha-1}\\frac{(x/\\theta)^j}{j!}",
            "P(X > 5) = 0.503668"
          ]
        }
      ],
      "answer": "$$P(X \\le 5) = 0.4963, \\quad \\text{mean} = 6, \\quad \\text{variance} = 18$$"
    },
    "symbols": [
      {
        "s": "\\alpha",
        "t": "The shape: for whole α it is the waiting time for α events.",
        "e": "2"
      },
      {
        "s": "\\theta",
        "t": "The scale (mean time per event).",
        "e": "3"
      },
      {
        "s": "\\alpha\\theta,\\ \\alpha\\theta^2",
        "t": "Mean and variance.",
        "e": "6,\\ 18"
      },
      {
        "s": "P(\\alpha, x/\\theta)",
        "t": "The regularised incomplete gamma function: the cumulative probability.",
        "e": "P(2, \\tfrac53)"
      }
    ],
    "mistakes": [
      {
        "m": "Mixing the rate and scale forms.",
        "f": "With rate β = 1/θ the mean is α/β; check which form the question uses."
      },
      {
        "m": "Forgetting Γ(α).",
        "f": "The density has $\\Gamma(\\alpha)\\theta^\\alpha$ in the denominator; $\\Gamma(2) = 1$."
      },
      {
        "m": "Not using the Erlang sum for whole α.",
        "f": "For whole α: $P(X > x) = e^{-x/\\theta}\\sum_{j<\\alpha} \\frac{(x/\\theta)^j}{j!}$: easy by hand."
      },
      {
        "m": "Variance αθ.",
        "f": "Variance is $\\alpha\\theta^2$."
      }
    ]
  },
  "geometric-distribution": {
    "example": {
      "question": "Each attempt succeeds with probability 0.2, independently. Find the probability that the first success is on the 3rd attempt, and the mean and variance.",
      "steps": [
        {
          "title": "The distribution",
          "math": [
            "P(X = k) = q^{k-1}p, \\ q = 1 - p",
            "p = \\frac{1}{5}, \\ q = \\frac{4}{5}, \\quad \\text{mean} = \\frac{1}{p} = 5, \\quad \\text{variance} = \\frac{q}{p^2} = 20"
          ]
        },
        {
          "title": "The probability",
          "math": [
            "P(X = 3) = (\\frac{4}{5})^{2}(\\frac{1}{5}) = 0.128"
          ]
        }
      ],
      "answer": "$$P(X = 3) = 0.128, \\quad \\text{mean} = 5, \\quad \\text{variance} = 20$$"
    },
    "symbols": [
      {
        "s": "p,\\ q",
        "t": "The chance of success on each attempt, and q = 1 − p.",
        "e": "0.2,\\ 0.8"
      },
      {
        "s": "P(X = k) = q^{k-1}p",
        "t": "k − 1 failures, then a success.",
        "e": "0.8^2(0.2)"
      },
      {
        "s": "\\frac{1}{p},\\ \\frac{q}{p^2}",
        "t": "Mean and variance of the number of attempts.",
        "e": "5,\\ 20"
      }
    ],
    "mistakes": [
      {
        "m": "Using $q^k p$.",
        "f": "The first success on attempt k needs only k − 1 failures: $q^{k-1}p$."
      },
      {
        "m": "Mixing the two forms.",
        "f": "Some books count failures before the first success ($q^k p$, mean $q/p$). Check which X means."
      },
      {
        "m": "\"At most k\" summed term by term.",
        "f": "$P(X \\le k) = 1 - q^k$."
      },
      {
        "m": "Variance 1/p².",
        "f": "Variance is $q/p^2$."
      }
    ]
  },
  "joint-distribution": {
    "example": {
      "question": "X takes 0, 1, 2 and Y takes 0, 1 with joint probabilities (rows X = 0, 1, 2): 1/8, 1/8; 1/4, 1/4; 1/8, 1/8. Find the marginals, E[X], E[Y], the covariance and the correlation. Are X and Y independent?",
      "steps": [
        {
          "title": "Marginal distributions",
          "math": [
            "P(X = x) = \\sum_y P(x, y)",
            "P(X): \\frac{1}{4}, \\frac{1}{2}, \\frac{1}{4}, \\qquad P(Y): \\frac{1}{2}, \\frac{1}{2}"
          ]
        },
        {
          "title": "Expectations",
          "math": [
            "E[X] = 1, \\quad E[Y] = \\frac{1}{2}, \\quad E[XY] = \\sum xy\\,P(x, y) = \\frac{1}{2}"
          ]
        },
        {
          "title": "Variances",
          "math": [
            "V(X) = E[X^2] - E[X]^2",
            "V(X) = \\frac{3}{2} - (1)^2 = \\frac{1}{2}, \\quad V(Y) = \\frac{1}{2} - (\\frac{1}{2})^2 = \\frac{1}{4}"
          ]
        },
        {
          "title": "Covariance and correlation",
          "math": [
            "\\text{Cov} = E[XY] - E[X]E[Y], \\ \\rho = \\frac{\\text{Cov}}{\\sigma_X\\sigma_Y}",
            "\\text{Cov}(X, Y) = \\frac{1}{2} - (1)(\\frac{1}{2}) = 0",
            "\\rho = \\frac{0}{\\sqrt{\\frac{1}{2}\\cdot\\frac{1}{4}}} = 0"
          ]
        },
        {
          "title": "Independent",
          "math": [
            "P(x, y) = P(x)P(y) \\text{ for every cell}"
          ]
        }
      ],
      "answer": "$$\\text{Cov}(X, Y) = 0, \\ \\rho = 0, \\ X \\text{ and } Y \\text{ independent}$$"
    },
    "symbols": [
      {
        "s": "P(x, y)",
        "t": "The joint probability: the chance that X = x and Y = y together.",
        "e": "P(1, 0) = \\tfrac14"
      },
      {
        "s": "P(X = x)",
        "t": "A marginal: add the joint probabilities along a row (or column).",
        "e": "P(X = 1) = \\tfrac12"
      },
      {
        "s": "E[XY]",
        "t": "The sum of xy times the joint probability over every cell.",
        "e": "\\tfrac12"
      },
      {
        "s": "\\text{Cov}(X, Y)",
        "t": "E[XY] − E[X]E[Y]: 0 when X and Y move independently.",
        "e": "0"
      },
      {
        "s": "\\rho",
        "t": "The correlation: covariance divided by both standard deviations.",
        "e": "0"
      }
    ],
    "mistakes": [
      {
        "m": "Adding the wrong way for a marginal.",
        "f": "P(X = x) adds across the row of x; P(Y = y) adds down the column of y."
      },
      {
        "m": "E[XY] = E[X]E[Y] assumed.",
        "f": "That is only true when the covariance is 0; work E[XY] out from the table."
      },
      {
        "m": "Concluding independence from Cov = 0.",
        "f": "Check every cell: $P(x, y) = P(x)P(y)$. Zero covariance alone is not enough."
      },
      {
        "m": "A table that does not add to 1.",
        "f": "All joint probabilities must sum to 1; check first."
      }
    ]
  },
  "markov-chain": {
    "example": {
      "question": "A two-state chain has transition matrix P = [[0.7, 0.3], [0.4, 0.6]] and starts in state 1. Find the distribution after 3 steps and the steady state.",
      "steps": [
        {
          "title": "3-step transition matrix",
          "math": [
            "P^{(n)} = P^n",
            "P = \\begin{bmatrix} \\frac{7}{10} & \\frac{3}{10} \\\\ \\frac{2}{5} & \\frac{3}{5} \\end{bmatrix}",
            "P^{3} = \\begin{bmatrix} \\frac{583}{1000} & \\frac{417}{1000} \\\\ \\frac{139}{250} & \\frac{111}{250} \\end{bmatrix}"
          ]
        },
        {
          "title": "After 3 steps",
          "math": [
            "\\pi^{(n)} = \\pi^{(0)}P^n",
            "\\pi^{(3)} = (\\frac{583}{1000},\\ \\frac{417}{1000})"
          ]
        },
        {
          "title": "Steady state",
          "math": [
            "\\pi P = \\pi, \\quad \\sum \\pi_i = 1",
            "\\pi = (\\frac{4}{7},\\ \\frac{3}{7})"
          ]
        }
      ],
      "answer": "$$\\pi = (\\frac{4}{7},\\ \\frac{3}{7})$$"
    },
    "symbols": [
      {
        "s": "P",
        "t": "The transition matrix: row i gives the chances of moving from state i to each state. Rows add to 1.",
        "e": "[0.7,\\ 0.3]"
      },
      {
        "s": "\\pi^{(0)}",
        "t": "The starting distribution.",
        "e": "(1,\\ 0)"
      },
      {
        "s": "\\pi^{(n)} = \\pi^{(0)}P^n",
        "t": "The distribution after n steps.",
        "e": "(0.583,\\ 0.417)"
      },
      {
        "s": "\\pi P = \\pi",
        "t": "The steady state: a distribution that does not change from step to step.",
        "e": "(\\tfrac47,\\ \\tfrac37)"
      }
    ],
    "mistakes": [
      {
        "m": "Multiplying in the wrong order.",
        "f": "Row vector on the left: $\\pi P$, not $P\\pi$."
      },
      {
        "m": "Rows that do not add to 1.",
        "f": "Each row of P is a probability distribution; check it."
      },
      {
        "m": "Forgetting $\\sum \\pi_i = 1$ for the steady state.",
        "f": "$\\pi P = \\pi$ alone has many solutions; the sum condition fixes one."
      },
      {
        "m": "Computing $P^3$ entry by entry wrongly.",
        "f": "Square first ($P^2 = PP$), then $P^3 = P^2P$, one row × column at a time."
      }
    ]
  },
  "moment-generating-function": {
    "example": {
      "question": "X is binomial with n = 10 and p = 0.3. Use its moment generating function to find the mean and variance.",
      "steps": [
        {
          "title": "Binomial: the MGF",
          "math": [
            "M(t) = E\\left[e^{tX}\\right]",
            "M(t) = {\\left(\\frac{3 {e}^{t}}{10}+\\frac{7}{10}\\right)}^{10}"
          ]
        },
        {
          "title": "First moment (mean)",
          "math": [
            "\\mu = M'(0)",
            "M'(t) = 3 {e}^{t}\\, \\left({\\left(\\frac{3 {e}^{t}}{10}+\\frac{7}{10}\\right)}^{9}\\right)",
            "M'(0) = 3"
          ]
        },
        {
          "title": "Second moment",
          "math": [
            "E[X^2] = M''(0)",
            "M''(0) = \\frac{111}{10}"
          ]
        },
        {
          "title": "Variance",
          "math": [
            "\\sigma^2 = M''(0) - M'(0)^2",
            "\\sigma^2 = \\frac{111}{10} - (3)^2 = \\frac{21}{10}"
          ]
        }
      ],
      "answer": "$$\\mu = 3, \\quad \\sigma^2 = 2.1$$"
    },
    "symbols": [
      {
        "s": "M(t) = E[e^{tX}]",
        "t": "The moment generating function.",
        "e": "(0.3e^t + 0.7)^{10}"
      },
      {
        "s": "M'(0)",
        "t": "The first derivative at t = 0: the mean.",
        "e": "3"
      },
      {
        "s": "M''(0)",
        "t": "The second derivative at t = 0: E[X²].",
        "e": "11.1"
      },
      {
        "s": "\\sigma^2 = M''(0) - M'(0)^2",
        "t": "The variance from the first two moments.",
        "e": "11.1 - 9 = 2.1"
      }
    ],
    "mistakes": [
      {
        "m": "Taking $M''(0)$ as the variance.",
        "f": "It is $E[X^2]$; subtract the squared mean."
      },
      {
        "m": "Differentiating with respect to X.",
        "f": "Differentiate with respect to t, then put t = 0."
      },
      {
        "m": "Forgetting the chain rule.",
        "f": "$\\frac{d}{dt}(0.3e^t + 0.7)^{10} = 10(0.3e^t + 0.7)^9 \\cdot 0.3e^t$."
      },
      {
        "m": "Checking against the formula.",
        "f": "For the binomial, mean np = 3 and variance npq = 2.1: a quick check."
      }
    ]
  },
  "non-parametric-tests": {
    "example": {
      "question": "Ten values 12, 15, 9, 18, 20, 11, 14, 16, 13, 17. Use the sign test at the 5% level to test whether the median is 12.",
      "steps": [
        {
          "title": "Signs",
          "math": [
            "x_i - 12: \\ 7 \\text{ plus}, \\ 2 \\text{ minus}, \\ 1 \\text{ tie(s) dropped}",
            "n = 9, \\quad S = \\min(7, 2) = 2"
          ]
        },
        {
          "title": "Binomial p-value",
          "math": [
            "P = 2\\,P(X \\le S), \\ X \\sim B(n, \\tfrac12)",
            "P = 2\\sum_{i=0}^{2} \\binom{9}{i}\\left(\\tfrac12\\right)^{9} = 0.1797"
          ]
        },
        {
          "title": "Decision",
          "math": [
            "P = 0.1797 \\ge \\alpha = 0.05 \\Rightarrow \\text{do not reject } H_0"
          ]
        }
      ],
      "answer": "$$P = 0.1797 \\ge \\alpha = 0.05 \\Rightarrow \\text{do not reject } H_0$$"
    },
    "symbols": [
      {
        "s": "m_0",
        "t": "The median under the null hypothesis.",
        "e": "12"
      },
      {
        "s": "+,\\ -",
        "t": "Each value above m₀ is a plus, below is a minus; values equal to m₀ are dropped.",
        "e": "7 \\text{ plus},\\ 2 \\text{ minus}"
      },
      {
        "s": "S",
        "t": "The test statistic: the smaller count of signs.",
        "e": "S = 2"
      },
      {
        "s": "P = 2P(X \\le S)",
        "t": "Two-sided p-value from the binomial B(n, ½).",
        "e": "0.1797"
      }
    ],
    "mistakes": [
      {
        "m": "Keeping the ties.",
        "f": "Values equal to m₀ give no sign: drop them and reduce n."
      },
      {
        "m": "Forgetting to double for a two-sided test.",
        "f": "$P = 2P(X \\le S)$ when the alternative is \"≠\"."
      },
      {
        "m": "Using a normal approximation for small n.",
        "f": "For n below about 25 use the exact binomial."
      },
      {
        "m": "Saying \"accept H₀\".",
        "f": "Say \"do not reject H₀\": the data do not give enough evidence against it."
      }
    ]
  },
  "normal-distribution": {
    "example": {
      "question": "Z is standard normal. Find P(Z < 1.96).",
      "steps": [
        {
          "title": "Standardise",
          "math": [
            "z = \\frac{x - \\mu}{\\sigma}",
            "z = \\frac{1.96 - 0}{1} = 1.9600"
          ]
        },
        {
          "title": "Area to the left",
          "math": [
            "\\text{Table: area from } 0 \\text{ to } 1.9600 = 0.4750",
            "P(Z < 1.9600) = 0.5 + 0.4750 = 0.9750"
          ]
        }
      ],
      "answer": "$$P(Z < 1.9600) = 0.5 + 0.4750 = 0.9750$$"
    },
    "symbols": [
      {
        "s": "\\mu,\\ \\sigma",
        "t": "The mean and standard deviation of X.",
        "e": "0,\\ 1"
      },
      {
        "s": "z = \\frac{x - \\mu}{\\sigma}",
        "t": "Standardising: how many standard deviations x is from the mean.",
        "e": "1.96"
      },
      {
        "s": "\\Phi(z)",
        "t": "The area to the left of z under the standard normal curve.",
        "e": "0.975"
      },
      {
        "s": "\\text{table area}",
        "t": "Most tables give the area from 0 to z; add 0.5 for the left half.",
        "e": "0.4750 + 0.5"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to standardise.",
        "f": "Tables are for Z; convert x first with $z = (x - \\mu)/\\sigma$."
      },
      {
        "m": "Adding 0.5 when the table already gives the full area.",
        "f": "Check whether your table gives 0 to z or −∞ to z."
      },
      {
        "m": "Wrong side for negative z.",
        "f": "Use symmetry: $P(Z < -a) = 1 - P(Z < a)$."
      },
      {
        "m": "Using the variance instead of σ.",
        "f": "Divide by σ, the standard deviation."
      }
    ]
  },
  "poisson-distribution": {
    "example": {
      "question": "Calls arrive at an average of 2 per minute (Poisson). Find the probability of exactly 3 calls in a minute.",
      "steps": [
        {
          "title": "The Poisson formula",
          "math": [
            "P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}",
            "\\lambda = 2, \\quad e^{-2} = 0.135335"
          ]
        },
        {
          "title": "Add the probabilities",
          "math": [
            "P(X = 3) = \\frac{e^{-2}\\,2^{3}}{3!}",
            "= 0.180447"
          ]
        },
        {
          "title": "Mean and variance",
          "math": [
            "\\mu = \\sigma^2 = \\lambda",
            "\\mu = \\sigma^2 = 2, \\quad \\sigma = 1.41421"
          ]
        }
      ],
      "answer": "$$P(X = 3) = 0.1804$$"
    },
    "symbols": [
      {
        "s": "\\lambda",
        "t": "The average number of events in the interval.",
        "e": "2"
      },
      {
        "s": "P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}",
        "t": "The chance of exactly k events.",
        "e": "\\dfrac{e^{-2}2^3}{6}"
      },
      {
        "s": "\\mu = \\sigma^2 = \\lambda",
        "t": "Mean and variance are both λ.",
        "e": "2"
      }
    ],
    "mistakes": [
      {
        "m": "Using the wrong λ for the interval.",
        "f": "Scale λ to the interval asked: 2 per minute is 10 per 5 minutes."
      },
      {
        "m": "Forgetting $e^{-\\lambda}$.",
        "f": "It is in every term: $e^{-2} = 0.135335$."
      },
      {
        "m": "Forgetting k!.",
        "f": "Divide by $k!$ (3! = 6)."
      },
      {
        "m": "\"At least one\" summed term by term.",
        "f": "$P(X \\ge 1) = 1 - e^{-\\lambda}$."
      }
    ]
  },
  "random-variables": {
    "example": {
      "question": "X takes 0, 1, 2, 3 with probabilities 1/8, 3/8, 3/8, 1/8. Find E(X), Var(X) and the standard deviation.",
      "steps": [
        {
          "title": "Check it is a probability distribution",
          "math": [
            "\\sum p_i = 1, \\ p_i \\ge 0",
            "\\sum p_i = \\frac{1}{8} + \\frac{3}{8} + \\frac{3}{8} + \\frac{1}{8} = 1 \\ \\checkmark"
          ]
        },
        {
          "title": "Mean (expected value)",
          "math": [
            "E(X) = \\sum x_i p_i",
            "E(X) = (0)\\left(\\frac{1}{8}\\right) + (1)\\left(\\frac{3}{8}\\right) + (2)\\left(\\frac{3}{8}\\right) + (3)\\left(\\frac{1}{8}\\right) = \\frac{3}{2}"
          ]
        },
        {
          "title": "E(X²)",
          "math": [
            "E(X^2) = \\sum x_i^2 p_i",
            "E(X^2) = (0)\\left(\\frac{1}{8}\\right) + (1)\\left(\\frac{3}{8}\\right) + (4)\\left(\\frac{3}{8}\\right) + (9)\\left(\\frac{1}{8}\\right) = 3"
          ]
        },
        {
          "title": "Variance and standard deviation",
          "math": [
            "\\text{Var}(X) = E(X^2) - [E(X)]^2",
            "\\text{Var}(X) = 3 - \\left(\\frac{3}{2}\\right)^2 = \\frac{3}{4}",
            "\\sigma = \\sqrt{\\frac{3}{4}} = 0.866025"
          ]
        }
      ],
      "answer": "$$E(X) = 1.5, \\quad \\text{Var}(X) = 0.75, \\quad \\sigma = 0.866$$"
    },
    "symbols": [
      {
        "s": "p_i",
        "t": "The probability of each value; they must be ≥ 0 and add to 1.",
        "e": "\\tfrac18,\\ \\tfrac38,\\ \\tfrac38,\\ \\tfrac18"
      },
      {
        "s": "E(X) = \\sum x_i p_i",
        "t": "The mean (expected value).",
        "e": "\\tfrac32"
      },
      {
        "s": "E(X^2) = \\sum x_i^2 p_i",
        "t": "The mean of the squares.",
        "e": "3"
      },
      {
        "s": "\\text{Var}(X) = E(X^2) - [E(X)]^2",
        "t": "The variance.",
        "e": "\\tfrac34"
      }
    ],
    "mistakes": [
      {
        "m": "Using $[E(X)]^2$ for $E(X^2)$.",
        "f": "Square each x first, then weight: $E(X^2) = \\sum x_i^2 p_i$."
      },
      {
        "m": "Probabilities that do not add to 1.",
        "f": "Check first; otherwise it is not a probability distribution."
      },
      {
        "m": "Forgetting the square root.",
        "f": "The standard deviation is $\\sqrt{\\text{Var}(X)}$."
      },
      {
        "m": "Dividing by n.",
        "f": "The probabilities already weight each value; do not divide again."
      }
    ]
  },
  "regression-lines": {
    "example": {
      "question": "Heights x = 150, 152, 155, 157, 160, 163 cm and weights y = 52, 55, 56, 59, 61, 64 kg. Find both regression lines and estimate y when x = 158.",
      "steps": [
        {
          "title": "Means",
          "math": [
            "\\bar x = \\frac{937}{6} = 156.167, \\quad \\bar y = \\frac{347}{6} = 57.8333"
          ]
        },
        {
          "title": "Regression coefficients",
          "math": [
            "b_{yx} = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (x - \\bar x)^2}, \\ b_{xy} = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (y - \\bar y)^2}",
            "b_{yx} = \\frac{105.167}{118.833} = 0.885, \\quad b_{xy} = \\frac{105.167}{94.8333} = 1.109"
          ]
        },
        {
          "title": "Line of regression of y on x",
          "math": [
            "y - \\bar y = b_{yx}(x - \\bar x)",
            "y - 57.8333 = 0.885(x - 156.167)",
            "y = 0.885x - 80.3731"
          ]
        },
        {
          "title": "Line of regression of x on y",
          "math": [
            "x - \\bar x = b_{xy}(y - \\bar y)",
            "x - 156.167 = 1.109(y - 57.8333)",
            "x = 1.109y + 92.0316"
          ]
        },
        {
          "title": "Correlation coefficient from the two slopes",
          "math": [
            "r = \\pm\\sqrt{b_{yx} \\cdot b_{xy}}",
            "r = \\sqrt{0.885 \\times 1.109} = 0.9907 \\quad (\\text{strong positive correlation})"
          ]
        },
        {
          "title": "Estimate y when x = 158 (use y on x)",
          "math": [
            "y = 0.885(158) - 80.3731 = 59.4558"
          ]
        }
      ],
      "answer": "$$y = 0.885(158) - 80.3731 = 59.4558$$"
    },
    "symbols": [
      {
        "s": "\\bar x,\\ \\bar y",
        "t": "The two means: both regression lines pass through (x̄, ȳ).",
        "e": "156.167,\\ 57.833"
      },
      {
        "s": "b_{yx}",
        "t": "The regression coefficient of y on x: the slope used to predict y from x.",
        "e": "0.885"
      },
      {
        "s": "b_{xy}",
        "t": "The regression coefficient of x on y: used to predict x from y.",
        "e": "1.109"
      },
      {
        "s": "r = \\pm\\sqrt{b_{yx}b_{xy}}",
        "t": "The correlation, with the sign of the coefficients.",
        "e": "0.9907"
      }
    ],
    "mistakes": [
      {
        "m": "Using the x-on-y line to predict y.",
        "f": "Predict y from x with the y-on-x line, and x from y with the x-on-y line."
      },
      {
        "m": "Dividing by the wrong sum of squares.",
        "f": "$b_{yx}$ divides by $\\sum(x - \\bar x)^2$; $b_{xy}$ by $\\sum(y - \\bar y)^2$."
      },
      {
        "m": "Coefficients with different signs.",
        "f": "They always share the sign of r; a mismatch means a slip."
      },
      {
        "m": "Predicting far outside the data.",
        "f": "Regression is reliable only within the range of the data."
      }
    ]
  },
  "uniform-distribution": {
    "example": {
      "question": "X is uniform on [0, 10]. Find P(3 < X < 7), the mean and the variance.",
      "steps": [
        {
          "title": "The distribution",
          "math": [
            "f(x) = \\frac{1}{b - a}, \\ a \\le x \\le b",
            "f(x) = \\frac{1}{10 - 0} = \\frac{1}{10}",
            "\\text{mean} = \\frac{a + b}{2} = 5, \\quad \\text{variance} = \\frac{(b - a)^2}{12} = \\frac{25}{3}"
          ]
        },
        {
          "title": "The probability",
          "math": [
            "P(c < X < d) = \\frac{d - c}{b - a}",
            "P(3 < X < 7) = \\frac{7 - 3}{10} = \\frac{2}{5}"
          ]
        }
      ],
      "answer": "$$P(3 < X < 7) = 0.4, \\quad \\text{mean} = 5, \\quad \\text{variance} = \\tfrac{25}{3}$$"
    },
    "symbols": [
      {
        "s": "a,\\ b",
        "t": "The ends of the interval; every value between is equally likely.",
        "e": "0,\\ 10"
      },
      {
        "s": "f(x) = \\frac{1}{b - a}",
        "t": "The constant density.",
        "e": "\\tfrac{1}{10}"
      },
      {
        "s": "P(c < X < d) = \\frac{d - c}{b - a}",
        "t": "Probability is length over total length.",
        "e": "\\tfrac{4}{10}"
      },
      {
        "s": "\\frac{a + b}{2},\\ \\frac{(b - a)^2}{12}",
        "t": "Mean and variance.",
        "e": "5,\\ \\tfrac{25}{3}"
      }
    ],
    "mistakes": [
      {
        "m": "Using a width outside [a, b].",
        "f": "Clip c and d to the interval first."
      },
      {
        "m": "Variance $(b - a)^2$.",
        "f": "Divide by 12: $(b - a)^2 / 12$."
      },
      {
        "m": "Treating P(X = c) as non-zero.",
        "f": "For a continuous variable any single value has probability 0, so < and ≤ give the same answer."
      },
      {
        "m": "Density greater than 1 looks wrong.",
        "f": "A density can exceed 1 if b − a < 1; only the area must be 1."
      }
    ]
  }
};

export default DATA;
