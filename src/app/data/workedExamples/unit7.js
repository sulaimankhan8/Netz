// Worked examples, symbol keys and common mistakes for the (UNIT-7) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "arithmetic-geometric-progression": {
    "example": {
      "question": "An arithmetic progression has first term 5 and common difference 4. Find the 20th term and the sum of the first 20 terms.",
      "steps": [
        {
          "title": "The 20th term",
          "math": [
            "a_n = a + (n - 1)d = 5 + (20 - 1)(4) = 81"
          ]
        },
        {
          "title": "The sum of the first 20 terms",
          "math": [
            "S_n = \\frac{n}{2}\\left[2a + (n - 1)d\\right] = \\frac{20}{2}\\left[2(5) + (19)(4)\\right] = 860"
          ]
        },
        {
          "title": "Check with the other sum formula",
          "math": [
            "\\text{Check: } S_n = \\frac{n}{2}(a + a_n) = \\frac{20}{2}(5 + 81) = 860"
          ]
        }
      ],
      "answer": "$$a_{20} = 81, \\qquad S_{20} = 860$$"
    },
    "symbols": [
      {
        "s": "a",
        "t": "The first term.",
        "e": "5"
      },
      {
        "s": "d",
        "t": "The common difference: each term minus the one before (AP).",
        "e": "4"
      },
      {
        "s": "r",
        "t": "The common ratio: each term divided by the one before (GP).",
        "e": ""
      },
      {
        "s": "a_n = a + (n-1)d",
        "t": "The n-th term of an AP.",
        "e": "5 + 19(4) = 81"
      },
      {
        "s": "S_n = \\frac n2[2a + (n-1)d]",
        "t": "The sum of the first n terms of an AP.",
        "e": "860"
      },
      {
        "s": "S_n = \\frac{a(r^n - 1)}{r - 1}",
        "t": "The sum of a GP (r ≠ 1).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using n instead of n − 1.",
        "f": "The n-th term has n − 1 steps after the first: $a + (n-1)d$."
      },
      {
        "m": "Mixing AP and GP formulas.",
        "f": "Check: constant difference → AP; constant ratio → GP."
      },
      {
        "m": "GP sum with r = 1.",
        "f": "Then every term is a, so $S_n = na$."
      },
      {
        "m": "Infinite GP with |r| ≥ 1.",
        "f": "The sum to infinity $\\frac{a}{1 - r}$ exists only for |r| < 1."
      }
    ]
  },
  "binomial-theorem-calculator": {
    "example": {
      "question": "Expand $(2x - 3)^5$.",
      "steps": [
        {
          "title": "The general term",
          "math": [
            "(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r",
            "a = 2x, \\ b = -3, \\ n = 5",
            "T_{r+1} = \\binom{5}{r} \\left(2x\\right)^{5 - r} \\left(-3\\right)^{r}"
          ]
        },
        {
          "title": "Coefficients nCr for n = 5 (row 5 of Pascal's triangle)",
          "math": [
            "1, \\ 5, \\ 10, \\ 10, \\ 5, \\ 1"
          ]
        },
        {
          "title": "Each term",
          "math": [
            "T_{1} = \\binom{5}{0} \\left(2x\\right)^{5} \\left(-3\\right)^{0} = 1 \\cdot 32x^{5} \\cdot 1 = 32x^{5}",
            "T_{2} = \\binom{5}{1} \\left(2x\\right)^{4} \\left(-3\\right)^{1} = 5 \\cdot 16x^{4} \\cdot -3 = -240x^{4}",
            "T_{3} = \\binom{5}{2} \\left(2x\\right)^{3} \\left(-3\\right)^{2} = 10 \\cdot 8x^{3} \\cdot 9 = 720x^{3}",
            "T_{4} = \\binom{5}{3} \\left(2x\\right)^{2} \\left(-3\\right)^{3} = 10 \\cdot 4x^{2} \\cdot -27 = -1080x^{2}",
            "T_{5} = \\binom{5}{4} \\left(2x\\right)^{1} \\left(-3\\right)^{4} = 5 \\cdot 2x \\cdot 81 = 810x",
            "T_{6} = \\binom{5}{5} \\left(2x\\right)^{0} \\left(-3\\right)^{5} = 1 \\cdot 1 \\cdot -243 = -243"
          ]
        },
        {
          "title": "Add them up",
          "math": [
            "\\left(2x - 3\\right)^{5} = 32x^{5} - 240x^{4} + 720x^{3} - 1080x^{2} + 810x - 243"
          ]
        }
      ],
      "answer": "$$(2x - 3)^5 = 32x^5 - 240x^4 + 720x^3 - 1080x^2 + 810x - 243$$"
    },
    "symbols": [
      {
        "s": "T_{r+1} = \\binom nr a^{n-r}b^r",
        "t": "The general term (the (r + 1)-th term).",
        "e": ""
      },
      {
        "s": "\\binom nr",
        "t": "The binomial coefficient: row n of Pascal’s triangle.",
        "e": "1, 5, 10, 10, 5, 1"
      },
      {
        "s": "a,\\ b",
        "t": "The two parts of the bracket, with their signs.",
        "e": "2x,\\ -3"
      }
    ],
    "mistakes": [
      {
        "m": "Dropping the sign of b.",
        "f": "Use b = −3: the signs then alternate."
      },
      {
        "m": "Not raising the coefficient.",
        "f": "$(2x)^4 = 16x^4$, not $2x^4$."
      },
      {
        "m": "Off-by-one in the general term.",
        "f": "$T_{r+1}$ uses $\\binom nr$; the 4th term is r = 3."
      },
      {
        "m": "Wrong Pascal row.",
        "f": "For n = 5 use 1, 5, 10, 10, 5, 1 (six terms)."
      }
    ]
  },
  "complex-number-calculator": {
    "example": {
      "question": "Find $\\dfrac{3 + 4i}{1 - 2i}$ in the form $a + bi$.",
      "steps": [
        {
          "title": "Multiply top and bottom by the conjugate of the bottom",
          "math": [
            "\\overline{c + di} = c - di",
            "\\frac{3 + 4i}{1 - 2i} \\cdot \\frac{1 + 2i}{1 + 2i}"
          ]
        },
        {
          "title": "The bottom becomes a real number",
          "math": [
            "(c + di)(c - di) = c^2 + d^2",
            "\\left(1 - 2i\\right)\\left(1 + 2i\\right) = 1^2 + (-2)^2 = 5"
          ]
        },
        {
          "title": "Multiply out the top",
          "math": [
            "\\left(3 + 4i\\right)\\left(1 + 2i\\right) = -5 + 10i"
          ]
        },
        {
          "title": "Divide each part",
          "math": [
            "\\frac{-5 + 10i}{5} = -1 + 2i"
          ]
        }
      ],
      "answer": "$$\\frac{3 + 4i}{1 - 2i} = -1 + 2i$$"
    },
    "symbols": [
      {
        "s": "i^2 = -1",
        "t": "The rule that makes complex arithmetic work.",
        "e": ""
      },
      {
        "s": "\\bar z",
        "t": "The conjugate: change the sign of the imaginary part.",
        "e": "\\overline{1 - 2i} = 1 + 2i"
      },
      {
        "s": "z\\bar z = |z|^2",
        "t": "A number times its conjugate is real.",
        "e": "(1 - 2i)(1 + 2i) = 5"
      },
      {
        "s": "r,\\ \\theta",
        "t": "Modulus and argument in polar form: z = r(cos θ + i sin θ).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Dividing the parts separately.",
        "f": "Multiply top and bottom by the conjugate of the bottom."
      },
      {
        "m": "Forgetting $i^2 = -1$.",
        "f": "In $(3 + 4i)(1 + 2i)$ the $8i^2$ becomes −8."
      },
      {
        "m": "Wrong conjugate.",
        "f": "Only the sign of the imaginary part changes."
      },
      {
        "m": "Argument in the wrong quadrant.",
        "f": "Use the signs of a and b, not just $\\tan^{-1}(b/a)$."
      }
    ]
  },
  "domain-and-range-calculator": {
    "example": {
      "question": "Find the domain of $f(x) = \\dfrac{\\sqrt{x - 2}}{x - 5}$.",
      "steps": [
        {
          "title": "Conditions",
          "math": [
            "x-5 \\ne 0",
            "x-2 \\ge 0"
          ]
        },
        {
          "title": "Domain",
          "math": [
            "D_f = \\left[2,\\ 5\\right) \\cup \\left(5,\\ \\infty\\right)"
          ]
        },
        {
          "title": "Range",
          "math": [
            "\\text{No turning points inside the domain.}",
            "\\text{Values at the ends of each interval (limits where an end is open or infinite).}",
            "R_f = \\mathbb{R}"
          ]
        }
      ],
      "answer": "$$D_f = [2, 5) \\cup (5, \\infty)$$"
    },
    "symbols": [
      {
        "s": "D_f",
        "t": "The domain: every x for which f(x) can be worked out.",
        "e": ""
      },
      {
        "s": "R_f",
        "t": "The range: every value f(x) can take.",
        "e": ""
      },
      {
        "s": "\\sqrt{\\cdot} \\ge 0",
        "t": "The inside of a square root cannot be negative.",
        "e": "x - 2 \\ge 0"
      },
      {
        "s": "\\text{denominator} \\ne 0",
        "t": "A fraction cannot have 0 at the bottom.",
        "e": "x \\ne 5"
      }
    ],
    "mistakes": [
      {
        "m": "Using > instead of ≥ for square roots.",
        "f": "$\\sqrt 0 = 0$ is fine: x = 2 is allowed."
      },
      {
        "m": "Forgetting a condition.",
        "f": "List every condition (roots, denominators, logs) and combine them."
      },
      {
        "m": "Brackets on interval ends.",
        "f": "Square bracket: included; round bracket: excluded (always round at ∞)."
      },
      {
        "m": "Logs of non-positive numbers.",
        "f": "$\\ln u$ needs u > 0 (strictly)."
      }
    ]
  },
  "factoring-calculator": {
    "example": {
      "question": "Factorise $6x^2 + x - 2$.",
      "steps": [
        {
          "title": "Split the middle term (ac method)",
          "math": [
            "m \\times n = ac, \\ m + n = b",
            "a \\cdot c = 6 \\times -2 = -12: \\ \\text{two numbers that multiply to } -12 \\text{ and add to } 1 \\text{ are } -3 \\text{ and } 4",
            "6x^{2} + x - 2 = 6x^{2} - 3x + 4x - 2",
            "= 3x\\left(2x - 1\\right) + 2\\left(2x - 1\\right)",
            "= \\left(2x - 1\\right)\\left(3x + 2\\right)"
          ]
        },
        {
          "title": "Answer",
          "math": [
            "6x^{2} + x - 2 = \\left(2x - 1\\right)\\left(3x + 2\\right)"
          ]
        }
      ],
      "answer": "$$6x^2 + x - 2 = (2x - 1)(3x + 2)$$"
    },
    "symbols": [
      {
        "s": "ac",
        "t": "The product of the first and last coefficients.",
        "e": "6 \\times (-2) = -12"
      },
      {
        "s": "m,\\ n",
        "t": "Two numbers that multiply to ac and add to b.",
        "e": "-3,\\ 4"
      },
      {
        "s": "\\text{grouping}",
        "t": "Split the middle term with m and n, then take common factors from each pair.",
        "e": "3x(2x - 1) + 2(2x - 1)"
      }
    ],
    "mistakes": [
      {
        "m": "Looking for numbers that multiply to c.",
        "f": "When a ≠ 1, they multiply to ac."
      },
      {
        "m": "Sign errors.",
        "f": "ac negative: the two numbers have opposite signs."
      },
      {
        "m": "Not taking out a common factor first.",
        "f": "$3x^3 - 12x = 3x(x^2 - 4) = 3x(x - 2)(x + 2)$."
      },
      {
        "m": "Not checking.",
        "f": "Expand the answer: it must give the original."
      }
    ]
  },
  "inequality-solver": {
    "example": {
      "question": "Solve $x^2 - 5x + 6 \\le 0$.",
      "steps": [
        {
          "title": "Move everything to one side and factor",
          "math": [
            "{x}^{2}-5 x+6 \\le 0",
            "x^{2} - 5x + 6 \\le 0",
            "\\left(x - 2\\right)\\left(x - 3\\right) \\le 0"
          ]
        },
        {
          "title": "Critical points",
          "math": [
            "\\text{Top} = 0: \\ x = 2, \\ 3"
          ]
        },
        {
          "title": "Sign chart: test one value in each interval",
          "math": [
            "x = 1: \\ h > 0 \\ \\times",
            "x = \\frac{5}{2}: \\ h < 0 \\ \\checkmark",
            "x = 4: \\ h > 0 \\ \\times"
          ]
        },
        {
          "title": "Answer",
          "math": [
            "x \\in \\left[2,\\ 3\\right]"
          ]
        }
      ],
      "answer": "$$x \\in [2, 3]$$"
    },
    "symbols": [
      {
        "s": "\\text{critical points}",
        "t": "Where the expression is 0 (or undefined): they split the number line.",
        "e": "x = 2,\\ 3"
      },
      {
        "s": "\\text{sign chart}",
        "t": "Test one value in each interval to see where the expression is ≤ 0.",
        "e": ""
      },
      {
        "s": "[\\ ],\\ (\\ )",
        "t": "Square brackets include an end (≤, ≥); round brackets exclude it (<, >).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Treating it like an equation.",
        "f": "Find the critical points, then test the intervals between them."
      },
      {
        "m": "Multiplying by a negative without flipping.",
        "f": "Multiplying or dividing by a negative reverses the sign."
      },
      {
        "m": "Multiplying by an unknown denominator.",
        "f": "Its sign is unknown: move everything to one side and use a sign chart."
      },
      {
        "m": "Wrong brackets.",
        "f": "≤ includes the zeros (square brackets); points where a denominator is 0 are always excluded."
      }
    ]
  },
  "linear-equation-solver": {
    "example": {
      "question": "Solve $4(2x - 1) = 3(x + 2)$.",
      "steps": [
        {
          "title": "Expand the brackets and collect like terms",
          "math": [
            "8x - 4 = 3x + 6"
          ]
        },
        {
          "title": "Move the x-terms to the left and the numbers to the right",
          "math": [
            "\\text{change the sign when a term crosses the } =",
            "8x - 3x = 6 + 4",
            "5x = 10"
          ]
        },
        {
          "title": "Divide both sides by 5",
          "math": [
            "x = \\frac{10}{5} = 2"
          ]
        },
        {
          "title": "Check: put it back into the original equation",
          "math": [
            "\\text{Left} = 12, \\quad \\text{Right} = 12 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$x = 2$$"
    },
    "symbols": [
      {
        "s": "\\text{expand}",
        "t": "Multiply out the brackets first.",
        "e": "8x - 4 = 3x + 6"
      },
      {
        "s": "\\text{collect}",
        "t": "x-terms on one side, numbers on the other (change sign when crossing =).",
        "e": "5x = 10"
      },
      {
        "s": "\\text{check}",
        "t": "Put the answer back into the original equation.",
        "e": "12 = 12"
      }
    ],
    "mistakes": [
      {
        "m": "Multiplying only the first term in a bracket.",
        "f": "$4(2x - 1) = 8x - 4$."
      },
      {
        "m": "Not changing sign when moving a term.",
        "f": "−4 on the left becomes +4 on the right."
      },
      {
        "m": "Dividing only one side.",
        "f": "Whatever you do to one side, do to the whole other side."
      },
      {
        "m": "Skipping the check.",
        "f": "Substitute back: it catches most slips."
      }
    ]
  },
  "logarithm-calculator": {
    "example": {
      "question": "Evaluate $\\log_9 3$.",
      "steps": [
        {
          "title": "Write 3 as a power of 9",
          "math": [
            "\\log_b x = k \\iff b^k = x",
            "9^{\\frac{1}{2}} = 3",
            "\\log_{9} 3 = \\frac{1}{2}"
          ]
        },
        {
          "title": "Check",
          "math": [
            "9^{\\frac{1}{2}} = 3 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\log_9 3 = \\tfrac12$$"
    },
    "symbols": [
      {
        "s": "\\log_b x = k \\iff b^k = x",
        "t": "A log is the power you raise the base to.",
        "e": "9^{1/2} = 3"
      },
      {
        "s": "b",
        "t": "The base (positive, not 1).",
        "e": "9"
      },
      {
        "s": "\\log_b x = \\frac{\\ln x}{\\ln b}",
        "t": "The change-of-base formula, for calculators.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "$\\log(a + b) = \\log a + \\log b$.",
        "f": "The law is $\\log(ab) = \\log a + \\log b$."
      },
      {
        "m": "Logs of negative numbers or 0.",
        "f": "They are undefined (for real numbers)."
      },
      {
        "m": "Mixing up base and argument.",
        "f": "$\\log_9 3 = \\tfrac12$ but $\\log_3 9 = 2$."
      },
      {
        "m": "Moving a power wrongly.",
        "f": "$\\log x^n = n\\log x$, but $(\\log x)^n$ is different."
      }
    ]
  },
  "permutations-and-combinations": {
    "example": {
      "question": "In how many ways can a committee of 3 be chosen from 10 people?",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "{}^{10}C_{3} = \\frac{n!}{r!\\,(n - r)!} = \\frac{10!}{3!\\;7!}"
          ]
        },
        {
          "title": "Cancel and work it out",
          "math": [
            "= \\frac{10 \\times 9 \\times 8}{3 \\times 2 \\times 1} = 120"
          ]
        }
      ],
      "answer": "$${}^{10}C_3 = 120 \\quad (\\text{and } {}^{10}P_3 = 720 \\text{ if order mattered})$$"
    },
    "symbols": [
      {
        "s": "n!",
        "t": "n factorial: n × (n − 1) × … × 1.",
        "e": "5! = 120"
      },
      {
        "s": "{}^nP_r = \\frac{n!}{(n-r)!}",
        "t": "Permutations: arrangements where order matters.",
        "e": "720"
      },
      {
        "s": "{}^nC_r = \\frac{n!}{r!(n-r)!}",
        "t": "Combinations: selections where order does not matter.",
        "e": "120"
      }
    ],
    "mistakes": [
      {
        "m": "Using P when order does not matter.",
        "f": "A committee has no order: use C."
      },
      {
        "m": "Computing huge factorials.",
        "f": "Cancel first: $\\frac{10!}{3!\\,7!} = \\frac{10 \\times 9 \\times 8}{3 \\times 2 \\times 1}$."
      },
      {
        "m": "Repeated letters.",
        "f": "Divide by the factorial of each repeat: MISSISSIPPI gives $\\frac{11!}{4!\\,4!\\,2!}$."
      },
      {
        "m": "Circular arrangements.",
        "f": "n people round a table: (n − 1)!."
      }
    ]
  },
  "quadratic-equation": {
    "example": {
      "question": "Solve $2x^2 - 7x + 3 = 0$ and describe its graph.",
      "steps": [
        {
          "title": "The discriminant",
          "math": [
            "D = b^2 - 4ac = (-7)^2 - 4(2)(3) = 49 - 24 = 25"
          ]
        },
        {
          "title": "The roots (quadratic formula)",
          "math": [
            "x = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{7 \\pm \\sqrt{25}}{4}",
            "x = \\frac{7 + 5}{4} = 3 \\quad \\text{or} \\quad x = \\frac{7 - 5}{4} = \\frac{1}{2}"
          ]
        },
        {
          "title": "The vertex and the axis",
          "math": [
            "\\text{Vertex: } h = -\\frac{b}{2a} = \\frac{7}{4}, \\quad k = c - \\frac{b^2}{4a} = -\\frac{25}{8}",
            "\\text{Axis } x = \\frac{7}{4}, \\text{ opens upwards (minimum)}"
          ]
        },
        {
          "title": "Completing the square",
          "math": [
            "2x^2 - 7x + 3 = 0 \\;\\Rightarrow\\; 2\\left(x - \\frac{7}{4}\\right)^2 - \\frac{25}{8} = 0"
          ]
        }
      ],
      "answer": "$$x = 3 \\ \\text{or} \\ x = \\tfrac12; \\quad \\text{vertex } \\left(\\tfrac74, -\\tfrac{25}{8}\\right)$$"
    },
    "symbols": [
      {
        "s": "a,\\ b,\\ c",
        "t": "The coefficients of ax² + bx + c = 0.",
        "e": "2,\\ -7,\\ 3"
      },
      {
        "s": "D = b^2 - 4ac",
        "t": "The discriminant: > 0 two real roots, = 0 one repeated, < 0 none (complex).",
        "e": "25"
      },
      {
        "s": "x = \\frac{-b \\pm \\sqrt D}{2a}",
        "t": "The quadratic formula.",
        "e": "\\tfrac{7 \\pm 5}{4}"
      },
      {
        "s": "-\\frac{b}{2a}",
        "t": "The x of the vertex (the axis of symmetry).",
        "e": "\\tfrac74"
      }
    ],
    "mistakes": [
      {
        "m": "Sign of −b.",
        "f": "With b = −7, $-b = 7$."
      },
      {
        "m": "Dividing only the root by 2a.",
        "f": "The whole of $-b \\pm \\sqrt D$ is over 2a."
      },
      {
        "m": "$-7^2$ instead of $(-7)^2$.",
        "f": "Square the whole of b: $(-7)^2 = 49$."
      },
      {
        "m": "Not rearranging to = 0 first.",
        "f": "Move every term to one side before reading a, b, c."
      }
    ]
  },
  "rational-expressions-calculator": {
    "example": {
      "question": "Simplify $\\dfrac{x^2 - 5x + 6}{x^2 - 9}$.",
      "steps": [
        {
          "title": "Restrictions: a denominator cannot be 0",
          "math": [
            "x \\neq -3, \\ 3"
          ]
        },
        {
          "title": "Factor the top and the bottom",
          "math": [
            "\\frac{x^{2} - 5x + 6}{x^{2} - 9} = \\frac{\\left(x - 2\\right)\\left(x - 3\\right)}{\\left(x - 3\\right)\\left(x + 3\\right)}"
          ]
        },
        {
          "title": "Cancel the common factors",
          "math": [
            "\\text{Cancel } \\left(x - 3\\right)",
            "= \\frac{x - 2}{x + 3}"
          ]
        },
        {
          "title": "Answer",
          "math": [
            "\\frac{x - 2}{x + 3}, \\quad x \\neq -3, \\ 3"
          ]
        }
      ],
      "answer": "$$\\frac{x - 2}{x + 3}, \\quad x \\ne \\pm 3$$"
    },
    "symbols": [
      {
        "s": "\\text{restrictions}",
        "t": "Values that make any original denominator 0; they stay excluded.",
        "e": "x \\ne \\pm3"
      },
      {
        "s": "\\text{factor}",
        "t": "Factor top and bottom fully before cancelling.",
        "e": "(x - 2)(x - 3)"
      },
      {
        "s": "\\text{cancel}",
        "t": "Cancel only common factors (whole brackets), never single terms.",
        "e": "(x - 3)"
      }
    ],
    "mistakes": [
      {
        "m": "Cancelling terms instead of factors.",
        "f": "$\\frac{x + 2}{x}$ does not simplify to 2; only whole factors cancel."
      },
      {
        "m": "Losing restrictions.",
        "f": "x = 3 is still excluded after cancelling (x − 3)."
      },
      {
        "m": "Adding fractions without a common denominator.",
        "f": "Use the lowest common denominator."
      },
      {
        "m": "Factoring slips.",
        "f": "$x^2 - 9 = (x - 3)(x + 3)$ (difference of squares)."
      }
    ]
  },
  "set-operations": {
    "example": {
      "question": "With $U = \\{1, \\dots, 10\\}$, $A = \\{2, 4, 6, 8, 10\\}$ and $B = \\{1, 2, 3, 4, 5\\}$, find $A \\cup B$, $A \\cap B$, $A - B$, $A'$, and check De Morgan's laws.",
      "steps": [
        {
          "title": "Operations",
          "math": [
            "A \\cup B = \\{1, 2, 3, 4, 5, 6, 8, 10\\}",
            "A \\cap B = \\{2, 4\\}",
            "A - B = \\{6, 8, 10\\}",
            "B - A = \\{1, 3, 5\\}",
            "A \\triangle B = \\{1, 3, 5, 6, 8, 10\\}",
            "A' = \\{1, 3, 5, 7, 9\\}",
            "B' = \\{6, 7, 8, 9, 10\\}"
          ]
        },
        {
          "title": "Counting",
          "math": [
            "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
            "8 = 5 + 5 - 2 \\ \\checkmark"
          ]
        },
        {
          "title": "De Morgan's laws",
          "math": [
            "(A \\cup B)' = \\{7, 9\\} = A' \\cap B'",
            "(A \\cap B)' = \\{1, 3, 5, 6, 7, 8, 9, 10\\} = A' \\cup B'"
          ]
        },
        {
          "title": "Power set",
          "math": [
            "n(P(A)) = 2^{5} = 32"
          ]
        }
      ],
      "answer": "$$A \\cup B = \\{1, 2, 3, 4, 5, 6, 8, 10\\}, \\ A \\cap B = \\{2, 4\\}, \\ (A \\cup B)' = A' \\cap B' = \\{7, 9\\}$$"
    },
    "symbols": [
      {
        "s": "A \\cup B",
        "t": "Union: in A or B (or both).",
        "e": ""
      },
      {
        "s": "A \\cap B",
        "t": "Intersection: in both A and B.",
        "e": "\\{2, 4\\}"
      },
      {
        "s": "A - B",
        "t": "Difference: in A but not in B.",
        "e": "\\{6, 8, 10\\}"
      },
      {
        "s": "A'",
        "t": "Complement: in U but not in A.",
        "e": "\\{1, 3, 5, 7, 9\\}"
      },
      {
        "s": "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
        "t": "Counting: the overlap would otherwise be counted twice.",
        "e": "8 = 5 + 5 - 2"
      }
    ],
    "mistakes": [
      {
        "m": "Listing repeated elements.",
        "f": "Each element appears once in a set."
      },
      {
        "m": "Complement without U.",
        "f": "The complement is taken within the universal set."
      },
      {
        "m": "Adding n(A) + n(B) for the union.",
        "f": "Subtract the overlap n(A ∩ B)."
      },
      {
        "m": "Mixing up − and △.",
        "f": "A − B is one-sided; A △ B is in exactly one of them."
      }
    ]
  },
  "system-of-equations": {
    "example": {
      "question": "Solve $2x + 3y = 13$, $x - y = -1$ by Cramer's rule.",
      "steps": [
        {
          "title": "The main determinant D",
          "math": [
            "D = \\left|\\begin{array}{cc} 2 & 3 \\\\ 1 & -1 \\end{array}\\right| = -5"
          ]
        },
        {
          "title": "D_x and x",
          "math": [
            "D_x = \\left|\\begin{array}{cc} 13 & 3 \\\\ -1 & -1 \\end{array}\\right| = -10, \\quad x = \\frac{D_x}{D} = \\frac{-10}{-5} = 2"
          ]
        },
        {
          "title": "D_y and y",
          "math": [
            "D_y = \\left|\\begin{array}{cc} 2 & 13 \\\\ 1 & -1 \\end{array}\\right| = -15, \\quad y = \\frac{D_y}{D} = \\frac{-15}{-5} = 3"
          ]
        }
      ],
      "answer": "$$x = 2, \\quad y = 3$$"
    },
    "symbols": [
      {
        "s": "D",
        "t": "The determinant of the coefficients. D ≠ 0 means exactly one solution.",
        "e": "-5"
      },
      {
        "s": "D_x,\\ D_y",
        "t": "D with the x (or y) column replaced by the right-hand sides.",
        "e": "D_x = -10"
      },
      {
        "s": "x = \\frac{D_x}{D}",
        "t": "Cramer’s rule.",
        "e": "\\tfrac{-10}{-5} = 2"
      }
    ],
    "mistakes": [
      {
        "m": "Replacing the wrong column.",
        "f": "For $D_x$ replace the x column (the first) by the constants."
      },
      {
        "m": "Determinant sign slips.",
        "f": "2 × 2: $ad - bc$; $2(-1) - 3(1) = -5$."
      },
      {
        "m": "Using Cramer when D = 0.",
        "f": "Then there is no unique solution; check for none or infinitely many."
      },
      {
        "m": "Not checking.",
        "f": "Put x and y into both equations."
      }
    ]
  }
};

export default DATA;
