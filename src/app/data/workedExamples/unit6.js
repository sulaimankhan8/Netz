// Worked examples, symbol keys and common mistakes for the (UNIT-6) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "arc-length-calculator": {
    "example": {
      "question": "Find the length of the curve $y = x^{3/2}$ from $x = 0$ to $x = 4$.",
      "steps": [
        {
          "title": "Set up",
          "math": [
            "L = \\int_a^b \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2}\\,dx",
            "y = {x}^{\\frac{3}{2}}, \\qquad \\frac{dy}{dx} = \\frac{3 {x}^{\\frac{1}{2}}}{2}",
            "1 + \\left(\\frac{dy}{dx}\\right)^2 = \\frac{9}{4}\\, x+1",
            "\\text{integrand: } \\sqrt{\\frac{9}{4}\\, x+1}"
          ]
        },
        {
          "title": "Integrate",
          "math": [
            "\\int_{0}^{4} \\sqrt{\\frac{9}{4}\\, x+1}\\,dx = \\Big[\\,\\frac{8 \\left({\\left(\\frac{9}{4}\\, x+1\\right)}^{\\frac{3}{2}}\\right)}{27}\\,\\Big]_{x = 0}^{4}",
            "= \\frac{8 \\left({\\left(9+1\\right)}^{\\frac{3}{2}}\\right)}{27} - \\left(\\frac{8 \\left({\\left(0+1\\right)}^{\\frac{3}{2}}\\right)}{27}\\right)",
            "= \\frac{80\\sqrt{10} - 8}{27} \\approx 9.0734153"
          ]
        },
        {
          "title": "Standard integral: sqrt (linear inside)",
          "math": [
            "\\int \\sqrt{x}\\,dx = \\frac{2}{3}x^{3/2}",
            "\\int \\sqrt{\\frac{9}{4}\\, x+1}\\,dx = \\frac{\\frac{2}{3}\\, \\left({\\left(\\frac{9}{4}\\, x+1\\right)}^{\\frac{3}{2}}\\right)}{\\frac{9}{4}}"
          ]
        }
      ],
      "answer": "$$L = \\tfrac{8}{27}\\left(10\\sqrt{10} - 1\\right) \\approx 9.0734$$"
    },
    "symbols": [
      {
        "s": "\\frac{dy}{dx}",
        "t": "The slope of the curve.",
        "e": "\\tfrac32 x^{1/2}"
      },
      {
        "s": "\\sqrt{1 + (y')^2}\\,dx",
        "t": "The length of a tiny piece of the curve (Pythagoras on dx and dy).",
        "e": "\\sqrt{1 + \\tfrac94 x}"
      },
      {
        "s": "L = \\int_a^b \\sqrt{1 + (y')^2}\\,dx",
        "t": "Add all the tiny pieces from a to b.",
        "e": "9.0734"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to square the derivative.",
        "f": "Inside the root it is $1 + (dy/dx)^2$: here $1 + \\tfrac94 x$."
      },
      {
        "m": "Integrating $1 + y'$ without the root.",
        "f": "The integrand is the square root of $1 + (y')^2$."
      },
      {
        "m": "Forgetting the chain-rule factor.",
        "f": "$\\int \\sqrt{1 + \\tfrac94 x}\\,dx$ needs division by $\\tfrac94$."
      },
      {
        "m": "Using the parametric formula wrongly.",
        "f": "For $x(t), y(t)$ use $\\int \\sqrt{\\dot x^2 + \\dot y^2}\\,dt$."
      }
    ]
  },
  "area-under-curve-calculator": {
    "example": {
      "question": "Find the total area between $y = \\sin x$ and the x-axis from $0$ to $2\\pi$.",
      "steps": [
        {
          "title": "Find where the curve crosses the x-axis",
          "math": [
            "f(x) = 0 \\text{ at } x = \\pi",
            "\\text{Integrate each piece separately: a piece below counts negative.}"
          ]
        },
        {
          "title": "Antiderivative of f",
          "math": [
            "\\int \\left(\\sin\\left(x\\right)\\right) dx = -\\cos\\left(x\\right)"
          ]
        },
        {
          "title": "Integrate each piece",
          "math": [
            "\\int_{0}^{\\pi} \\left(f\\right) dx = 2",
            "\\int_{\\pi}^{2 \\pi} \\left(f\\right) dx = -2"
          ]
        },
        {
          "title": "Add the sizes",
          "math": [
            "\\text{Area} = \\left|2\\right| + \\left|-2\\right| = 2 + 2 = 4"
          ]
        }
      ],
      "answer": "$$\\text{Area} = 2 + 2 = 4$$"
    },
    "symbols": [
      {
        "s": "\\int_a^b f(x)\\,dx",
        "t": "The signed area: parts below the axis count as negative.",
        "e": "\\int_0^{2\\pi}\\sin x\\,dx = 0"
      },
      {
        "s": "\\text{crossings}",
        "t": "Where the curve meets the axis; split the integral there.",
        "e": "x = \\pi"
      },
      {
        "s": "|\\cdot|",
        "t": "Take the size of each piece and add, to get the total area.",
        "e": "|2| + |-2|"
      }
    ],
    "mistakes": [
      {
        "m": "Integrating straight across a crossing.",
        "f": "Positive and negative parts cancel ($\\int_0^{2\\pi}\\sin x = 0$). Split at the crossings."
      },
      {
        "m": "Forgetting the absolute value.",
        "f": "Area is always positive: add the sizes of the pieces."
      },
      {
        "m": "Missing a crossing.",
        "f": "Solve $f(x) = 0$ in the interval first."
      },
      {
        "m": "Between two curves: wrong order.",
        "f": "Use (upper − lower), or take the absolute value of each piece."
      }
    ]
  },
  "asymptotes-calculator": {
    "example": {
      "question": "Find the asymptotes of $f(x) = \\dfrac{x^2 + 1}{x - 1}$.",
      "steps": [
        {
          "title": "Vertical asymptotes",
          "math": [
            "f(x) \\to \\pm\\infty \\text{ as } x \\to a",
            "x = 1: \\ \\lim_{x\\to 1^-} f = -\\infty, \\ \\lim_{x\\to 1^+} f = \\infty"
          ]
        },
        {
          "title": "Horizontal and oblique asymptotes",
          "math": [
            "y = \\lim_{x\\to\\pm\\infty} f, \\ \\text{or } y = mx + c",
            "m = \\lim_{x\\to +\\infty} \\frac{f(x)}{x} = 1, \\quad c = \\lim_{x\\to +\\infty} (f(x) - 1x) = 1 \\Rightarrow y = x + 1 \\ (\\text{oblique, as } x \\to +\\infty)",
            "m = \\lim_{x\\to -\\infty} \\frac{f(x)}{x} = 1, \\quad c = \\lim_{x\\to -\\infty} (f(x) - 1x) = 1 \\Rightarrow y = x + 1 \\ (\\text{oblique, as } x \\to -\\infty)"
          ]
        }
      ],
      "answer": "$$x = 1 \\ (\\text{vertical}), \\qquad y = x + 1 \\ (\\text{oblique})$$"
    },
    "symbols": [
      {
        "s": "x = a",
        "t": "A vertical asymptote: f blows up as x → a (the denominator is 0 there and the top is not).",
        "e": "x = 1"
      },
      {
        "s": "y = mx + c",
        "t": "An oblique (slant) asymptote, the line f approaches as x → ±∞.",
        "e": "y = x + 1"
      },
      {
        "s": "m = \\lim \\frac{f(x)}{x}",
        "t": "The slope of the oblique asymptote.",
        "e": "1"
      },
      {
        "s": "c = \\lim (f(x) - mx)",
        "t": "Its intercept.",
        "e": "1"
      }
    ],
    "mistakes": [
      {
        "m": "Taking every zero of the denominator as an asymptote.",
        "f": "If the top is 0 there too, it may be a hole; check the limit."
      },
      {
        "m": "Looking for a horizontal asymptote only.",
        "f": "When the top’s degree is one more than the bottom’s, the asymptote is oblique."
      },
      {
        "m": "Forgetting x → −∞.",
        "f": "Check both directions; they can differ."
      },
      {
        "m": "Dividing wrongly.",
        "f": "Long division gives the line directly: $\\frac{x^2 + 1}{x - 1} = x + 1 + \\frac{2}{x - 1}$."
      }
    ]
  },
  "beta-gamma-function": {
    "example": {
      "question": "Evaluate $\\Gamma\\left(\\tfrac72\\right)$.",
      "steps": [
        {
          "title": "Use Γ(n + 1) = n Γ(n) down to Γ(1) = 1 or Γ(1/2) = √π",
          "math": [
            "\\Gamma(n+1) = n\\,\\Gamma(n)",
            "\\Gamma\\left(\\frac{7}{2}\\right) = \\frac{5}{2} \\cdot \\frac{3}{2} \\cdot \\frac{1}{2} \\cdot \\Gamma\\left(\\tfrac{1}{2}\\right) = \\frac{5}{2} \\cdot \\frac{3}{2} \\cdot \\frac{1}{2} \\cdot \\sqrt{\\pi} = \\frac{15\\sqrt{\\pi}}{8}"
          ]
        }
      ],
      "answer": "$$\\Gamma\\left(\\tfrac72\\right) = \\tfrac{15}{8}\\sqrt{\\pi} \\approx 3.3234$$"
    },
    "symbols": [
      {
        "s": "\\Gamma(n) = \\int_0^\\infty x^{n-1}e^{-x}dx",
        "t": "The gamma function, which extends factorials: Γ(n) = (n − 1)! for whole n.",
        "e": "\\Gamma(4) = 6"
      },
      {
        "s": "\\Gamma(n + 1) = n\\Gamma(n)",
        "t": "The recurrence used to step down.",
        "e": "\\Gamma(\\tfrac72) = \\tfrac52\\Gamma(\\tfrac52)"
      },
      {
        "s": "\\Gamma(\\tfrac12) = \\sqrt\\pi",
        "t": "The value every half-integer reduces to.",
        "e": "1.7725"
      },
      {
        "s": "B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m + n)}",
        "t": "The beta function in terms of gamma.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using $\\Gamma(n) = n!$.",
        "f": "$\\Gamma(n) = (n - 1)!$: one less."
      },
      {
        "m": "Stopping at $\\Gamma(\\tfrac32)$.",
        "f": "Step down to $\\Gamma(\\tfrac12) = \\sqrt\\pi$."
      },
      {
        "m": "Wrong factors when stepping down.",
        "f": "Each step multiplies by (the argument − 1): $\\tfrac52, \\tfrac32, \\tfrac12$."
      },
      {
        "m": "Mixing the beta arguments.",
        "f": "$B(m, n)$ uses $\\Gamma(m)\\Gamma(n)$ on top and $\\Gamma(m + n)$ below."
      }
    ]
  },
  "centre-of-mass": {
    "example": {
      "question": "Find the centre of mass and moments of inertia of a uniform semicircular lamina of radius 2 (flat side on the x-axis).",
      "steps": [
        {
          "title": "The lamina",
          "math": [
            "R: x^2 + y^2 \\le 4, \\ y \\ge 0 \\ (dA = \\rho\\,d\\rho\\,d\\theta)",
            "\\rho = 1"
          ]
        },
        {
          "title": "Mass",
          "math": [
            "M = \\iint \\rho\\,dA",
            "\\int_{0}^{\\pi} (\\ldots)\\,d\\theta = \\frac{\\pi^2}{2}",
            "\\text{product} = 2\\pi",
            "= 2\\pi"
          ]
        },
        {
          "title": "Moment about the y-axis",
          "math": [
            "\\iint x\\rho\\,dA",
            "\\int_{0}^{\\pi} (\\ldots)\\,d\\theta = 0",
            "\\text{product} = 0",
            "= 0"
          ]
        },
        {
          "title": "Moment about the x-axis",
          "math": [
            "\\iint y\\rho\\,dA",
            "\\int_{0}^{\\pi} (\\ldots)\\,d\\theta = \\frac{\\pi^2}{2}",
            "\\text{product} = \\frac{16}{3}",
            "= \\frac{16}{3}"
          ]
        },
        {
          "title": "Moment of inertia about the x-axis",
          "math": [
            "I_x = \\iint y^2\\rho\\,dA",
            "\\int_{0}^{\\pi} (\\ldots)\\,d\\theta \\approx 6.0880682",
            "\\text{product} = 2\\pi",
            "= 2\\pi"
          ]
        },
        {
          "title": "Moment of inertia about the y-axis",
          "math": [
            "I_y = \\iint x^2\\rho\\,dA",
            "\\int_{0}^{\\pi} (\\ldots)\\,d\\theta = \\frac{\\pi}{2}",
            "\\text{product} = 2\\pi",
            "= 2\\pi"
          ]
        },
        {
          "title": "Centre of mass",
          "math": [
            "\\bar{x} = \\frac{1}{M}\\iint x\\rho\\,dA, \\quad \\bar{y} = \\frac{1}{M}\\iint y\\rho\\,dA",
            "\\bar{x} = 0, \\quad \\bar{y} = \\frac{8}{3\\pi}"
          ]
        },
        {
          "title": "Polar moment",
          "math": [
            "I_O = I_x + I_y",
            "I_O = 4\\pi"
          ]
        }
      ],
      "answer": "$$(\\bar x, \\bar y) = \\left(0, \\tfrac{8}{3\\pi}\\right) \\approx (0, 0.849)$$"
    },
    "symbols": [
      {
        "s": "M = \\iint \\rho\\,dA",
        "t": "The mass: density over the area.",
        "e": "2\\pi"
      },
      {
        "s": "M_y = \\iint x\\rho\\,dA",
        "t": "The moment about the y-axis; gives x̄ = M_y / M.",
        "e": "0"
      },
      {
        "s": "M_x = \\iint y\\rho\\,dA",
        "t": "The moment about the x-axis; gives ȳ = M_x / M.",
        "e": "\\tfrac{16}{3}"
      },
      {
        "s": "I_x,\\ I_y",
        "t": "Moments of inertia: ∬ y²ρ dA and ∬ x²ρ dA.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Swapping the moments.",
        "f": "$\\bar x$ uses $M_y = \\iint x\\,dA$; $\\bar y$ uses $M_x = \\iint y\\,dA$."
      },
      {
        "m": "Forgetting to divide by the mass.",
        "f": "The centre is moment ÷ mass."
      },
      {
        "m": "Ignoring symmetry.",
        "f": "A shape symmetric about the y-axis has $\\bar x = 0$ at once."
      },
      {
        "m": "Polar coordinates without the extra r.",
        "f": "$dA = r\\,dr\\,d\\theta$."
      }
    ]
  },
  "change-of-order-of-integration": {
    "example": {
      "question": "Evaluate $\\int_0^1\\!\\int_x^1 e^{y^2}\\,dy\\,dx$ by changing the order of integration.",
      "steps": [
        {
          "title": "Read the region from the limits",
          "math": [
            "0 \\le x \\le 1, \\qquad  x \\le y \\le 1"
          ]
        },
        {
          "title": "Range of y over the region",
          "math": [
            "y \\text{ runs from } 0 \\text{ (lowest point) to } 1 \\text{ (highest point)}"
          ]
        },
        {
          "title": "A horizontal strip at height y",
          "math": [
            "\\text{right end on } y =  x \\;\\Rightarrow\\; x =  y",
            "0 \\le x \\le  y, \\qquad 0 \\le y \\le 1"
          ]
        },
        {
          "title": "The integral with the order changed",
          "math": [
            "\\int_{0}^{1} \\int_{ x}^{1} {e}^{{y}^{2}}\\,dy\\,dx = \\int_{0}^{1} \\int_{0}^{ y} {e}^{{y}^{2}}\\,dx\\,dy"
          ]
        },
        {
          "title": "inner integral (with respect to x)",
          "math": [
            "\\int_{0}^{ y} {e}^{{y}^{2}}\\,dx = \\Big[\\,{e}^{{y}^{2}}\\, x\\,\\Big]_{x = 0}^{ y}",
            "= {e}^{{y}^{2}}\\, y - 0",
            "= {e}^{{y}^{2}}\\, y"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dx = kx",
            "\\int {e}^{{y}^{2}}\\,dx = {e}^{{y}^{2}}\\, x"
          ]
        },
        {
          "title": "outer integral (with respect to y)",
          "math": [
            "\\int_{0}^{1} {e}^{{y}^{2}}\\, y\\,dy = \\Big[\\,\\frac{{e}^{{y}^{2}}}{2}\\,\\Big]_{y = 0}^{1}",
            "= \\frac{{e}^{{1}^{2}}}{2} - \\left(\\frac{{e}^{{0}^{2}}}{2}\\right)",
            "= \\frac{e}{2} - \\frac{1}{2}"
          ]
        },
        {
          "title": "Substitution u = y^2",
          "math": [
            "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du",
            "u = {y}^{2}, \\quad du = 2 y\\,dy",
            "\\int {e}^{{y}^{2}}\\, y\\,dy = \\int \\frac{{e}^{u}}{2}\\,du",
            "\\int {e}^{{y}^{2}}\\, y\\,dy = \\frac{1}{2}\\, {e}^{{y}^{2}}"
          ]
        },
        {
          "title": "Take the constant outside",
          "math": [
            "\\int k\\,f\\,dx = k\\int f\\,dx",
            "\\int \\frac{{e}^{u}}{2}\\,du = \\frac{1}{2}\\, {e}^{u}"
          ]
        },
        {
          "title": "Exponential rule",
          "math": [
            "\\int e^{x}\\,dx = e^{x}",
            "\\int {e}^{u}\\,du = {e}^{u}"
          ]
        }
      ],
      "answer": "$$\\int_0^1\\!\\int_0^y e^{y^2}\\,dx\\,dy = \\tfrac{e - 1}{2} \\approx 0.8591$$"
    },
    "symbols": [
      {
        "s": "R",
        "t": "The region described by the limits; sketch it before changing the order.",
        "e": "x \\le y \\le 1,\\ 0 \\le x \\le 1"
      },
      {
        "s": "dy\\,dx \\to dx\\,dy",
        "t": "Integrate in the other direction: horizontal strips instead of vertical.",
        "e": ""
      },
      {
        "s": "\\text{new limits}",
        "t": "Read from the sketch: x from the left edge to the right edge of each strip, then y over its range.",
        "e": "0 \\le x \\le y,\\ 0 \\le y \\le 1"
      }
    ],
    "mistakes": [
      {
        "m": "Just swapping the limits.",
        "f": "Sketch the region and read new limits; they usually change."
      },
      {
        "m": "Leaving a variable in the outer limits.",
        "f": "The outer limits must be numbers."
      },
      {
        "m": "Not seeing why to change.",
        "f": "$e^{y^2}$ has no elementary antiderivative in y; after the change, an extra y appears and $u = y^2$ works."
      },
      {
        "m": "Losing part of the region.",
        "f": "If the boundary changes formula, split into several pieces."
      }
    ]
  },
  "continuity-calculator": {
    "example": {
      "question": "Is $f(x) = x^2$ for $x < 1$, $2x - 1$ for $x \\ge 1$ continuous at $x = 1$?",
      "steps": [
        {
          "title": "Left-hand limit",
          "math": [
            "\\lim_{x \\to 1^-} {x}^{2} = 1"
          ]
        },
        {
          "title": "Right-hand limit",
          "math": [
            "\\lim_{x \\to 1^+} 2 x-1 = 1"
          ]
        },
        {
          "title": "Value at the point",
          "math": [
            "f(1) = 1"
          ]
        },
        {
          "title": "Conclusion",
          "math": [
            "\\text{LHL} = \\text{RHL} = f(a) \\Rightarrow \\text{continuous at } x = 1"
          ]
        }
      ],
      "answer": "$$\\text{LHL} = \\text{RHL} = f(1) = 1 \\Rightarrow \\text{continuous at } x = 1$$"
    },
    "symbols": [
      {
        "s": "\\text{LHL} = \\lim_{x \\to a^-} f(x)",
        "t": "The left-hand limit, using the formula for x < a.",
        "e": "1^2 = 1"
      },
      {
        "s": "\\text{RHL} = \\lim_{x \\to a^+} f(x)",
        "t": "The right-hand limit, using the formula for x > a.",
        "e": "2(1) - 1 = 1"
      },
      {
        "s": "f(a)",
        "t": "The value at the point itself.",
        "e": "f(1) = 1"
      }
    ],
    "mistakes": [
      {
        "m": "Checking only one side.",
        "f": "Both one-sided limits and the value must agree."
      },
      {
        "m": "Using the wrong piece for a side.",
        "f": "Left limit: the piece for x < a. Right limit: the piece for x > a."
      },
      {
        "m": "Forgetting f(a).",
        "f": "Equal limits are not enough if f(a) is different or undefined."
      },
      {
        "m": "Confusing continuous with differentiable.",
        "f": "A corner (|x| at 0) is continuous but not differentiable."
      }
    ]
  },
  "convergence-tests": {
    "example": {
      "question": "Does the series $\\sum_{n=1}^{\\infty} \\dfrac{n}{2^n}$ converge?",
      "steps": [
        {
          "title": "nth-term test: inconclusive",
          "math": [
            "\\lim a_n = 0: \\text{ this test can only show divergence}"
          ]
        },
        {
          "title": "Ratio test (d'Alembert): converges",
          "math": [
            "\\left|\\frac{a_{n+1}}{a_n}\\right| = \\left|\\frac{\\frac{n+1}{2}}{n}\\right| \\to 0.5 < 1"
          ]
        }
      ],
      "answer": "$$\\lim \\left|\\tfrac{a_{n+1}}{a_n}\\right| = \\tfrac12 < 1 \\Rightarrow \\text{converges}$$"
    },
    "symbols": [
      {
        "s": "a_n",
        "t": "The n-th term of the series.",
        "e": "\\tfrac{n}{2^n}"
      },
      {
        "s": "\\lim a_n",
        "t": "nth-term test: if it is not 0 the series diverges; if it is 0, no decision.",
        "e": "0"
      },
      {
        "s": "\\lim \\left|\\frac{a_{n+1}}{a_n}\\right|",
        "t": "Ratio test: < 1 converges, > 1 diverges, = 1 no decision.",
        "e": "\\tfrac12"
      },
      {
        "s": "\\lim |a_n|^{1/n}",
        "t": "Root test: same rule as the ratio test.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Concluding convergence from $a_n \\to 0$.",
        "f": "$\\sum 1/n$ has $a_n \\to 0$ but diverges. The nth-term test can only show divergence."
      },
      {
        "m": "Using the ratio test when the limit is 1.",
        "f": "Limit 1 decides nothing; try comparison or the integral test."
      },
      {
        "m": "Forgetting absolute values for alternating series.",
        "f": "Use the alternating-series test, and check absolute convergence separately."
      },
      {
        "m": "Algebra slips in $a_{n+1}/a_n$.",
        "f": "Write $a_{n+1}$ by replacing every n with n + 1 before dividing."
      }
    ]
  },
  "curvature-calculator": {
    "example": {
      "question": "Find the radius and centre of curvature of $y = x^2$ at $x = 1$.",
      "steps": [
        {
          "title": "Derivatives",
          "math": [
            "\\rho = \\frac{(1 + y'^2)^{3/2}}{|y''|}",
            "y = {x}^{2}",
            "y' = 2 x, \\quad y'' = 2",
            "\\text{at } x = 1: \\ y = 1, \\ y' = 2, \\ y'' = 2"
          ]
        },
        {
          "title": "Radius of curvature",
          "math": [
            "\\rho = \\frac{5\\sqrt{5}}{2}",
            "\\kappa = \\frac{1}{\\rho} = \\frac{2\\sqrt{5}}{25} \\approx 0.178885"
          ]
        },
        {
          "title": "Centre of curvature",
          "math": [
            "(-4,\\ \\frac{7}{2})"
          ]
        }
      ],
      "answer": "$$\\rho = \\tfrac{5\\sqrt5}{2} \\approx 5.590, \\qquad \\text{centre } \\left(-4, \\tfrac72\\right)$$"
    },
    "symbols": [
      {
        "s": "y_1,\\ y_2",
        "t": "The first and second derivatives at the point.",
        "e": "y_1 = 2,\\ y_2 = 2"
      },
      {
        "s": "\\rho = \\frac{(1 + y_1^2)^{3/2}}{|y_2|}",
        "t": "The radius of curvature: the radius of the circle that best fits the curve there.",
        "e": "\\tfrac{5^{3/2}}{2}"
      },
      {
        "s": "\\kappa = \\frac{1}{\\rho}",
        "t": "The curvature: how sharply the curve bends.",
        "e": ""
      },
      {
        "s": "(\\bar x, \\bar y)",
        "t": "The centre of curvature: on the concave side, ρ away along the normal.",
        "e": "(-4, \\tfrac72)"
      }
    ],
    "mistakes": [
      {
        "m": "Wrong power in the numerator.",
        "f": "It is $(1 + y_1^2)^{3/2}$, not squared or square-rooted."
      },
      {
        "m": "Using the second derivative as the curvature.",
        "f": "Curvature also depends on the slope through $1 + y_1^2$."
      },
      {
        "m": "Putting the centre on the wrong side.",
        "f": "It lies on the concave side (above for $y_2 > 0$)."
      },
      {
        "m": "Parametric curves with the Cartesian formula.",
        "f": "Use $\\rho = \\frac{(\\dot x^2 + \\dot y^2)^{3/2}}{|\\dot x\\ddot y - \\dot y\\ddot x|}$."
      }
    ]
  },
  "derivative-calculator": {
    "example": {
      "question": "Differentiate $f(x) = x^2 \\sin 3x$.",
      "steps": [
        {
          "title": "Product rule",
          "math": [
            "(uv)' = u'v + uv'",
            "\\frac{d}{dx}\\left[{x}^{2}\\, \\sin\\left(3 x\\right)\\right] = 2 x\\, \\sin\\left(3 x\\right)+3 {x}^{2}\\, \\cos\\left(3 x\\right)"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "(x^n)' = n\\,x^{n-1}",
            "\\frac{d}{dx}\\left[{x}^{2}\\right] = 2 x"
          ]
        },
        {
          "title": "Derivative of sin with the chain rule",
          "math": [
            "\\frac{d}{dx}\\sin u = \\cos u \\cdot u'",
            "\\frac{d}{dx}\\left[\\sin\\left(3 x\\right)\\right] = 3 \\cos\\left(3 x\\right)"
          ]
        },
        {
          "title": "Constant multiple rule",
          "math": [
            "(c\\,u)' = c\\,u'",
            "\\frac{d}{dx}\\left[3 x\\right] = 3"
          ]
        },
        {
          "title": "Simplify",
          "math": [
            "\\frac{d}{dx}\\left[{x}^{2}\\, \\sin\\left(3 x\\right)\\right] = 2 x\\, \\sin\\left(3 x\\right)+3 {x}^{2}\\, \\cos\\left(3 x\\right)"
          ]
        }
      ],
      "answer": "$$f'(x) = 2x\\sin 3x + 3x^2\\cos 3x$$"
    },
    "symbols": [
      {
        "s": "(uv)' = u'v + uv'",
        "t": "The product rule, for two factors multiplied together.",
        "e": "u = x^2,\\ v = \\sin 3x"
      },
      {
        "s": "\\frac{d}{dx}\\sin u = \\cos u \\cdot u'",
        "t": "The chain rule: differentiate the outside, times the derivative of the inside.",
        "e": "3\\cos 3x"
      },
      {
        "s": "(x^n)' = nx^{n-1}",
        "t": "The power rule.",
        "e": "2x"
      }
    ],
    "mistakes": [
      {
        "m": "Multiplying the derivatives.",
        "f": "$(uv)' \\ne u'v'$; use $u'v + uv'$."
      },
      {
        "m": "Forgetting the chain-rule factor.",
        "f": "$\\frac{d}{dx}\\sin 3x = 3\\cos 3x$, not $\\cos 3x$."
      },
      {
        "m": "Sign of the derivative of cos.",
        "f": "$\\frac{d}{dx}\\cos x = -\\sin x$."
      },
      {
        "m": "Not simplifying.",
        "f": "Collect like terms and common factors at the end."
      }
    ]
  },
  "divergence-theorem": {
    "example": {
      "question": "Verify the divergence theorem for $\\mathbf F = (4xz, -y^2, yz)$ over the unit cube $0 \\le x, y, z \\le 1$.",
      "steps": [
        {
          "title": "The theorem",
          "math": [
            "\\oint\\!\\!\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV",
            "\\mathbf{F} = \\left(4 x\\, z,\\ -{y}^{2},\\  y\\, z\\right)",
            "V: 0 le x le 1,  0 le y le 1,  0 le z le 1"
          ]
        },
        {
          "title": "Volume integral of div F",
          "math": [
            "\\nabla\\cdot\\mathbf{F} = 4 z- y",
            "\\int_{0}^{1} \\left(4 z- y\\right)\\,dz = \\Big[\\,4 \\frac{{z}^{2}}{2}- y\\, z\\,\\Big]_{z = 0}^{1}",
            "= 4 \\left(\\frac{{1}^{2}}{2}\\right)- y - 0",
            "= 2-y",
            "\\int_{0}^{1} \\left(2-y\\right)\\,dy = \\Big[\\,-\\frac{{y}^{2}}{2}+2 y\\,\\Big]_{y = 0}^{1}",
            "= -\\frac{{1}^{2}}{2}+2 - 0",
            "= \\frac{3}{2}",
            "\\int_{0}^{1} 1.5\\,dx = \\Big[\\,1.5 x\\,\\Big]_{x = 0}^{1}",
            "= 1.5 - 0",
            "= \\frac{3}{2}",
            "\\iiint_V = \\frac{3}{2}"
          ]
        },
        {
          "title": "Flux through each face",
          "math": [
            "\\text{x = 1}: \\ \\mathbf{N} = \\left(1,\\ 0,\\ 0\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = 2",
            "\\text{x = 0}: \\ \\mathbf{N} = \\left(-1,\\ 0,\\ 0\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = 0",
            "\\text{y = 1}: \\ \\mathbf{N} = \\left(0,\\ 1,\\ 0\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = -1",
            "\\text{y = 0}: \\ \\mathbf{N} = \\left(0,\\ -1,\\ 0\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = 0",
            "\\text{z = 1}: \\ \\mathbf{N} = \\left(0,\\ 0,\\ 1\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = \\frac{1}{2}",
            "\\text{z = 0}: \\ \\mathbf{N} = \\left(0,\\ 0,\\ -1\\right), \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = 0",
            "\\text{total} = 2 + 0 - 1 + 0 + \\frac{1}{2} + 0 = \\frac{3}{2}"
          ]
        },
        {
          "title": "Compare",
          "math": [
            "\\frac{3}{2} = \\frac{3}{2}"
          ]
        }
      ],
      "answer": "$$\\iiint \\nabla\\cdot\\mathbf F\\,dV = \\oiint \\mathbf F\\cdot d\\mathbf S = \\tfrac32$$"
    },
    "symbols": [
      {
        "s": "\\nabla\\cdot\\mathbf F",
        "t": "The divergence: $P_x + Q_y + R_z$.",
        "e": "4z - 2y + y"
      },
      {
        "s": "\\iiint_V",
        "t": "The integral over the solid.",
        "e": ""
      },
      {
        "s": "\\oiint_S \\mathbf F\\cdot d\\mathbf S",
        "t": "The outward flux through the closed surface (all faces).",
        "e": "\\tfrac32"
      },
      {
        "s": "\\mathbf n",
        "t": "The outward unit normal on each face.",
        "e": "(0, 0, 1) \\text{ on top}"
      }
    ],
    "mistakes": [
      {
        "m": "Inward normals.",
        "f": "Every face uses the outward normal (e.g. $-\\mathbf k$ on the bottom)."
      },
      {
        "m": "Missing a face.",
        "f": "A cube has six faces; list them."
      },
      {
        "m": "Differentiating each component in the wrong variable.",
        "f": "$\\nabla\\cdot\\mathbf F = \\partial P/\\partial x + \\partial Q/\\partial y + \\partial R/\\partial z$."
      },
      {
        "m": "Applying it to an open surface.",
        "f": "The surface must be closed; otherwise use Stokes or compute the flux directly."
      }
    ]
  },
  "double-integral-calculator": {
    "example": {
      "question": "Evaluate $\\int_0^1\\!\\int_0^x (x^2 + y^2)\\,dy\\,dx$.",
      "steps": [
        {
          "title": "Inner integral: with respect to y (x held constant)",
          "math": [
            "\\int_{0}^{ x} \\left({x}^{2}+{y}^{2}\\right)\\,dy = \\Big[\\,{x}^{2}\\, y+\\frac{{y}^{3}}{3}\\,\\Big]_{y = 0}^{ x}",
            "= {x}^{2}\\, x+\\frac{{x}^{3}}{3} - 0",
            "= \\frac{4}{3}\\, {x}^{3}"
          ]
        },
        {
          "title": "Integrate term by term",
          "math": [
            "\\int (u \\pm v)\\,dx = \\int u\\,dx \\pm \\int v\\,dx",
            "\\int {x}^{2}+{y}^{2}\\,dy = {x}^{2}\\, y+\\frac{1}{3}\\, {y}^{3}"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dy = ky",
            "\\int {x}^{2}\\,dy = {x}^{2}\\, y"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)",
            "\\int {y}^{2}\\,dy = \\frac{1}{3}\\, {y}^{3}"
          ]
        },
        {
          "title": "Outer integral: with respect to x",
          "math": [
            "\\int_{0}^{1} \\frac{4}{3}\\, {x}^{3}\\,dx = \\Big[\\,\\frac{{x}^{4}}{3}\\,\\Big]_{x = 0}^{1}",
            "= \\frac{{1}^{4}}{3} - 0",
            "= \\frac{1}{3}"
          ]
        },
        {
          "title": "Take the constant outside",
          "math": [
            "\\int k\\,f\\,dx = k\\int f\\,dx",
            "\\int \\frac{4}{3}\\, {x}^{3}\\,dx = \\frac{1}{3}\\, {x}^{4}"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)",
            "\\int {x}^{3}\\,dx = \\frac{1}{4}\\, {x}^{4}"
          ]
        }
      ],
      "answer": "$$\\int_0^1\\!\\int_0^x (x^2 + y^2)\\,dy\\,dx = \\tfrac13$$"
    },
    "symbols": [
      {
        "s": "\\text{inner integral}",
        "t": "Integrate with respect to y first, treating x as a constant.",
        "e": "x^2 y + \\tfrac{y^3}{3}"
      },
      {
        "s": "\\text{limits } 0 \\to x",
        "t": "The inner limits may depend on the outer variable.",
        "e": ""
      },
      {
        "s": "\\text{outer integral}",
        "t": "Then integrate the result with respect to x between numbers.",
        "e": "\\int_0^1 \\tfrac43 x^3\\,dx"
      }
    ],
    "mistakes": [
      {
        "m": "Integrating in the wrong order.",
        "f": "$dy\\,dx$: the inner integral is in y."
      },
      {
        "m": "Treating x as a variable in the inner integral.",
        "f": "x is a constant there: $\\int x^2\\,dy = x^2y$."
      },
      {
        "m": "Putting in the inner limits wrongly.",
        "f": "Substitute y = x and y = 0 into the y-antiderivative."
      },
      {
        "m": "Variable limits on the outside.",
        "f": "The outer limits must be numbers."
      }
    ]
  },
  "errors-and-approximations": {
    "example": {
      "question": "Use differentials to approximate $\\sqrt{25.3}$.",
      "steps": [
        {
          "title": "Differentiate",
          "math": [
            "f(x) = \\sqrt{x}, \\qquad f'(x) = \\frac{1}{2 \\sqrt{x}}"
          ]
        },
        {
          "title": "At x = 25",
          "math": [
            "f(25) = 5, \\qquad f'(25) = \\frac{1}{10}"
          ]
        },
        {
          "title": "Linear approximation",
          "math": [
            "f(x + \\Delta x) \\approx f(x) + f'(x)\\,\\Delta x",
            "f(25.3) \\approx 5 + \\left(\\frac{1}{10}\\right)(0.3) = 5.03"
          ]
        }
      ],
      "answer": "$$\\sqrt{25.3} \\approx 5 + \\tfrac{1}{10}(0.3) = 5.03$$"
    },
    "symbols": [
      {
        "s": "x_0",
        "t": "A nearby point where f is easy.",
        "e": "25"
      },
      {
        "s": "\\Delta x",
        "t": "The small change from x₀.",
        "e": "0.3"
      },
      {
        "s": "f(x_0 + \\Delta x) \\approx f(x_0) + f'(x_0)\\Delta x",
        "t": "The linear (tangent-line) approximation.",
        "e": "5 + 0.1(0.3)"
      },
      {
        "s": "\\frac{\\Delta y}{y}",
        "t": "The relative error; × 100 for the percentage error.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Choosing x₀ far from x.",
        "f": "Pick the nearest easy value (25 for 25.3)."
      },
      {
        "m": "Using Δx in degrees.",
        "f": "For trig functions Δx must be in radians."
      },
      {
        "m": "Forgetting f(x₀).",
        "f": "The approximation is f(x₀) plus the change, not the change alone."
      },
      {
        "m": "Confusing absolute and relative error.",
        "f": "Absolute: Δy. Relative: Δy / y. Percentage: × 100."
      }
    ]
  },
  "euler-theorem-homogeneous": {
    "example": {
      "question": "Verify Euler's theorem for $u = x^3 + y^3 + 3x^2y$.",
      "steps": [
        {
          "title": "Check that u is homogeneous",
          "math": [
            "u(tx, ty) = t^{n} u(x, y)",
            "u(tx, ty) = {\\left(t\\, x\\right)}^{3}+{\\left(t\\, y\\right)}^{3}+3 {\\left(t\\, x\\right)}^{2}\\, t\\, y = t^{3}\\, u(x, y)",
            "\\text{So u is homogeneous of degree } n = 3."
          ]
        },
        {
          "title": "First partial derivatives",
          "math": [
            "u_{x} = 3 {x}^{2}+6 x\\, y",
            "u_{y} = 3 {y}^{2}+3 {x}^{2}"
          ]
        },
        {
          "title": "Euler's theorem (first order)",
          "math": [
            "x\\,u_{x} + y\\,u_{y} = n\\,u",
            "x\\,u_{x} + y\\,u_{y} =  x\\, \\left(3 {x}^{2}+6 x\\, y\\right)+ y\\, \\left(3 {y}^{2}+3 {x}^{2}\\right)",
            "= 3\\,u = 3\\,\\left({x}^{3}+{y}^{3}+3 {x}^{2}\\, y\\right)"
          ]
        },
        {
          "title": "Second partial derivatives",
          "math": [
            "u_{xx} = 6 x+6 y, \\quad u_{xy} = 6 x, \\quad u_{yy} = 6 y"
          ]
        },
        {
          "title": "Euler's theorem (second order)",
          "math": [
            "x^2 u_{xx} + 2xy\\,u_{xy} + y^2 u_{yy} = n(n-1)\\,u",
            "x^2 u_{xx} + 2xy\\,u_{xy} + y^2 u_{yy} = 3(3 - 1)\\,u = 6\\,u"
          ]
        }
      ],
      "answer": "$$x\\,u_x + y\\,u_y = 3u, \\qquad x^2u_{xx} + 2xy\\,u_{xy} + y^2u_{yy} = 6u$$"
    },
    "symbols": [
      {
        "s": "n",
        "t": "The degree of homogeneity: u(tx, ty) = tⁿu(x, y).",
        "e": "n = 3"
      },
      {
        "s": "u_x,\\ u_y",
        "t": "The first partial derivatives.",
        "e": "u_x = 3x^2 + 6xy"
      },
      {
        "s": "x u_x + y u_y = nu",
        "t": "Euler’s theorem (first order).",
        "e": "3u"
      },
      {
        "s": "x^2u_{xx} + 2xy\\,u_{xy} + y^2u_{yy} = n(n-1)u",
        "t": "The second-order form.",
        "e": "6u"
      }
    ],
    "mistakes": [
      {
        "m": "Using it on a function that is not homogeneous.",
        "f": "Check: every term must have the same total degree."
      },
      {
        "m": "Wrong degree.",
        "f": "Count the total power in each term: $3x^2y$ has degree 3."
      },
      {
        "m": "Forgetting the factor 2 on $xy\\,u_{xy}$.",
        "f": "The second-order form has $2xy\\,u_{xy}$."
      },
      {
        "m": "Using $n^2$ instead of $n(n - 1)$.",
        "f": "Second order gives $n(n-1)u$."
      }
    ]
  },
  "first-principles-derivative": {
    "example": {
      "question": "Find the derivative of $f(x) = x^2$ from first principles.",
      "steps": [
        {
          "title": "Write down f(x + h)",
          "math": [
            "f(x + h) = {\\left(x+h\\right)}^{2}",
            "= x^{2} + 2xh + h^{2}"
          ]
        },
        {
          "title": "Subtract f(x): its terms cancel",
          "math": [
            "f(x + h) - f(x) = 2xh + h^{2}"
          ]
        },
        {
          "title": "Divide by h",
          "math": [
            "\\frac{f(x + h) - f(x)}{h} = 2x + h"
          ]
        },
        {
          "title": "Let h → 0: every term with h vanishes",
          "math": [
            "f'(x) = \\lim_{h \\to 0} \\left(2x + h\\right) = 2 x"
          ]
        }
      ],
      "answer": "$$f'(x) = \\lim_{h \\to 0}(2x + h) = 2x$$"
    },
    "symbols": [
      {
        "s": "h",
        "t": "A small step in x that we let shrink to 0.",
        "e": ""
      },
      {
        "s": "f(x + h) - f(x)",
        "t": "The change in f over the step.",
        "e": "2xh + h^2"
      },
      {
        "s": "f'(x) = \\lim_{h\\to0}\\frac{f(x+h) - f(x)}{h}",
        "t": "The definition of the derivative: the limit of the slope.",
        "e": "2x"
      }
    ],
    "mistakes": [
      {
        "m": "Putting h = 0 too early.",
        "f": "Simplify and cancel h first; otherwise you get 0/0."
      },
      {
        "m": "Expanding f(x + h) wrongly.",
        "f": "$(x + h)^2 = x^2 + 2xh + h^2$, not $x^2 + h^2$."
      },
      {
        "m": "Forgetting to subtract f(x).",
        "f": "The f(x) terms must cancel before dividing."
      },
      {
        "m": "Using the rules instead.",
        "f": "A first-principles question wants the limit worked out, not the power rule."
      }
    ]
  },
  "fourier-series-calculator": {
    "example": {
      "question": "Find the Fourier series of $f(x) = x$ on $(-\\pi, \\pi)$.",
      "steps": [
        {
          "title": "a₀",
          "math": [
            "a_0 = 0.31831\\int f(x)\\,dx",
            "\\int_{-3.14159265359}^{3.14159265359}  x\\,dx = \\Big[\\,\\frac{{x}^{2}}{2}\\,\\Big]_{x = -3.14159265359}^{3.14159265359}",
            "= \\frac{{3.14159265359}^{2}}{2} - \\left(\\frac{{-3.14159265359}^{2}}{2}\\right)",
            "= 0",
            "a_0 = 0.31831 \\times (\\ldots) = 0"
          ]
        },
        {
          "title": "aₙ",
          "math": [
            "a_n = 0.31831\\int f(x)\\cos nx\\,dx",
            "\\int_{-3.14159265359}^{3.14159265359}  x\\, \\cos\\left(n\\, x\\right)\\,dx = \\Big[\\, x\\, \\frac{\\sin\\left(n\\, x\\right)}{n}-\\frac{-\\frac{\\cos\\left(n\\, x\\right)}{n}}{n}\\,\\Big]_{x = -3.14159265359}^{3.14159265359}",
            "= 3.14159265359 \\frac{\\sin\\left(3.14159265359 n\\right)}{n}-\\frac{-\\frac{\\cos\\left(3.14159265359 n\\right)}{n}}{n} - \\left(-3.14159265359 \\frac{\\sin\\left(-\\left(3.14159265359 n\\right)\\right)}{n}-\\frac{-\\frac{\\cos\\left(-3.14159265359 n\\right)}{n}}{n}\\right)",
            "= 3.14159265359 \\frac{\\sin\\left(3.14159265359 n\\right)}{n}-\\frac{-\\frac{\\cos\\left(3.14159265359 n\\right)}{n}}{n}-\\left(-3.14159265359 \\frac{\\sin\\left(-3.14159265359 n\\right)}{n}-\\frac{-\\frac{\\cos\\left(-3.14159265359 n\\right)}{n}}{n}\\right)",
            "\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:",
            "a_n = 0"
          ]
        },
        {
          "title": "Integration by parts (tabular method)",
          "math": [
            "\\int u\\,dv = uv - \\int v\\,du",
            "\\text{ILATE: } u =  x \\ (\\text{Algebraic}), \\quad dv = \\cos\\left(n\\, x\\right)\\,dx \\ (\\text{Trig})",
            "\\begin{array}{c|c|c|l} \\text{sign} & \\text{differentiate } u & \\text{integrate } dv & \\text{product (along the diagonal)} \\\\ \\hline + &  x & \\frac{\\sin\\left(n\\, x\\right)}{n} & +\\, x\\, \\frac{\\sin\\left(n\\, x\\right)}{n} \\\\ - & 1 & \\frac{-\\frac{\\cos\\left(n\\, x\\right)}{n}}{n} & -\\,\\frac{-\\frac{\\cos\\left(n\\, x\\right)}{n}}{n} \\\\  & 0 & & \\text{(stop: the derivative is 0)} \\end{array}",
            "\\text{Add the products with their signs: } + \\ ( x) (\\frac{\\sin\\left(n\\, x\\right)}{n}) \\; - \\ (1) (\\frac{-\\frac{\\cos\\left(n\\, x\\right)}{n}}{n})",
            "\\int  x\\, \\cos\\left(n\\, x\\right)\\,dx =  x\\, \\frac{\\sin\\left(n\\, x\\right)}{n}-\\frac{-\\frac{\\cos\\left(n\\, x\\right)}{n}}{n}"
          ]
        },
        {
          "title": "bₙ",
          "math": [
            "b_n = 0.31831\\int f(x)\\sin nx\\,dx",
            "\\int_{-3.14159265359}^{3.14159265359}  x\\, \\sin\\left(n\\, x\\right)\\,dx = \\Big[\\,-x\\, \\frac{\\cos\\left(n\\, x\\right)}{n}+\\frac{\\frac{\\sin\\left(n\\, x\\right)}{n}}{n}\\,\\Big]_{x = -3.14159265359}^{3.14159265359}",
            "= -3.14159265359 \\frac{\\cos\\left(3.14159265359 n\\right)}{n}+\\frac{\\frac{\\sin\\left(3.14159265359 n\\right)}{n}}{n} - \\left(-\\left(-3.14159265359 \\frac{\\cos\\left(-\\left(3.14159265359 n\\right)\\right)}{n}\\right)+\\frac{\\frac{\\sin\\left(-3.14159265359 n\\right)}{n}}{n}\\right)",
            "= -3.14159265359 \\frac{\\cos\\left(3.14159265359 n\\right)}{n}+\\frac{\\frac{\\sin\\left(3.14159265359 n\\right)}{n}}{n}-\\left(-\\left(-3.14159265359 \\frac{\\cos\\left(-3.14159265359 n\\right)}{n}\\right)+\\frac{\\frac{\\sin\\left(-3.14159265359 n\\right)}{n}}{n}\\right)",
            "\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:",
            "b_n = \\frac{2(-1)^{n+1}}{n}"
          ]
        },
        {
          "title": "Integration by parts (tabular method)",
          "math": [
            "\\int u\\,dv = uv - \\int v\\,du",
            "\\text{ILATE: } u =  x \\ (\\text{Algebraic}), \\quad dv = \\sin\\left(n\\, x\\right)\\,dx \\ (\\text{Trig})",
            "\\begin{array}{c|c|c|l} \\text{sign} & \\text{differentiate } u & \\text{integrate } dv & \\text{product (along the diagonal)} \\\\ \\hline + &  x & -\\frac{\\cos\\left(n\\, x\\right)}{n} & +\\,-\\left(x\\, \\frac{\\cos\\left(n\\, x\\right)}{n}\\right) \\\\ - & 1 & -\\frac{\\frac{\\sin\\left(n\\, x\\right)}{n}}{n} & -\\,-\\frac{\\frac{\\sin\\left(n\\, x\\right)}{n}}{n} \\\\  & 0 & & \\text{(stop: the derivative is 0)} \\end{array}",
            "\\text{Add the products with their signs: } + \\ ( x) (-\\frac{\\cos\\left(n\\, x\\right)}{n}) \\; - \\ (1) (-\\frac{\\frac{\\sin\\left(n\\, x\\right)}{n}}{n})",
            "\\int  x\\, \\sin\\left(n\\, x\\right)\\,dx = -\\left(x\\, \\frac{\\cos\\left(n\\, x\\right)}{n}\\right)+\\frac{\\frac{\\sin\\left(n\\, x\\right)}{n}}{n}"
          ]
        }
      ],
      "answer": "$$x = 2\\left(\\sin x - \\tfrac12\\sin 2x + \\tfrac13\\sin 3x - \\cdots\\right) = \\sum_{n=1}^\\infty \\tfrac{2(-1)^{n+1}}{n}\\sin nx$$"
    },
    "symbols": [
      {
        "s": "a_0 = \\frac1\\pi\\int_{-\\pi}^{\\pi} f\\,dx",
        "t": "Twice the average value of f.",
        "e": "0"
      },
      {
        "s": "a_n = \\frac1\\pi\\int f\\cos nx\\,dx",
        "t": "The cosine coefficients.",
        "e": "0"
      },
      {
        "s": "b_n = \\frac1\\pi\\int f\\sin nx\\,dx",
        "t": "The sine coefficients.",
        "e": "\\tfrac{2(-1)^{n+1}}{n}"
      },
      {
        "s": "\\cos n\\pi = (-1)^n",
        "t": "Used to simplify the coefficients.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting $\\tfrac{a_0}{2}$.",
        "f": "The constant term is $a_0/2$, not $a_0$."
      },
      {
        "m": "Not using odd/even symmetry.",
        "f": "$x$ is odd, so every $a_n = 0$: only sines remain."
      },
      {
        "m": "Sign slips in integration by parts.",
        "f": "Use the tabular method and check the signs alternate."
      },
      {
        "m": "Leaving $\\cos n\\pi$ unsimplified.",
        "f": "$\\cos n\\pi = (-1)^n$, $\\sin n\\pi = 0$."
      }
    ]
  },
  "grad-div-curl": {
    "example": {
      "question": "For $\\phi = x^2y + yz^3$, find $\\nabla\\phi$ at $(1, -1, 1)$ and the directional derivative in the direction of $(2, 1, -2)$.",
      "steps": [
        {
          "title": "Partial derivatives",
          "math": [
            "\\nabla\\phi = \\phi_x\\mathbf{i} + \\phi_y\\mathbf{j} + \\phi_z\\mathbf{k}",
            "\\phi_x = 2 x\\, y",
            "\\phi_y = {x}^{2}+{z}^{3}",
            "\\phi_z = 3 y\\, {z}^{2}"
          ]
        },
        {
          "title": "At (1, -1, 1)",
          "math": [
            "\\nabla\\phi = \\left(-2,\\ 2,\\ -3\\right), \\qquad |\\nabla\\phi| = 4.12311 \\ (\\text{the greatest rate of change})",
            "\\text{unit normal } \\hat{n} = \\frac{\\nabla\\phi}{|\\nabla\\phi|} = \\left(-0.485071,\\ 0.485071,\\ -0.727607\\right)"
          ]
        },
        {
          "title": "Directional derivative",
          "math": [
            "D_{\\hat a}\\phi = \\nabla\\phi\\cdot\\hat{a}, \\ \\hat a = \\frac{\\vec a}{|\\vec a|}",
            "\\hat{a} = \\frac{\\left(2,\\ 1,\\ -2\\right)}{3}, \\qquad \\nabla\\phi\\cdot\\hat{a} = \\frac{(-2)(2) + (2)(1) + (-3)(-2)}{3} = \\frac{4}{3}"
          ]
        }
      ],
      "answer": "$$\\nabla\\phi = (-2, 2, -3), \\qquad D_{\\hat a}\\phi = \\tfrac43$$"
    },
    "symbols": [
      {
        "s": "\\nabla\\phi",
        "t": "The gradient: $(\\phi_x, \\phi_y, \\phi_z)$. It points the way φ increases fastest.",
        "e": "(2xy,\\ x^2 + z^3,\\ 3yz^2)"
      },
      {
        "s": "\\hat a",
        "t": "The unit vector in the chosen direction: the vector divided by its length.",
        "e": "\\tfrac13(2, 1, -2)"
      },
      {
        "s": "\\nabla\\phi\\cdot\\hat a",
        "t": "The directional derivative: the rate of change of φ in that direction.",
        "e": "\\tfrac43"
      },
      {
        "s": "\\nabla\\cdot\\mathbf F,\\ \\nabla\\times\\mathbf F",
        "t": "Divergence (a number) and curl (a vector) of a vector field.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Not making the direction a unit vector.",
        "f": "Divide by its length: $|(2, 1, -2)| = 3$."
      },
      {
        "m": "Putting in the point before differentiating.",
        "f": "Differentiate first, then substitute."
      },
      {
        "m": "Treating the other variables as variables.",
        "f": "For $\\partial/\\partial x$, y and z are constants."
      },
      {
        "m": "Curl sign slips.",
        "f": "Use the determinant with $\\mathbf i, \\mathbf j, \\mathbf k$ in the top row; the j term has a minus."
      }
    ]
  },
  "greens-theorem": {
    "example": {
      "question": "Verify Green's theorem for $\\oint (3x^2 - 8y^2)\\,dx + (4y - 6xy)\\,dy$ round the region between $y = x^2$ and $y = \\sqrt x$.",
      "steps": [
        {
          "title": "The theorem",
          "math": [
            "\\oint_C (M\\,dx + N\\,dy) = \\iint_R \\left(\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}\\right)dA",
            "M = 3 {x}^{2}-8 {y}^{2}, \\quad N = 4 y-6 x\\, y",
            "R: {x}^{2} \\le y \\le \\sqrt{x}, \\ 0 \\le x \\le 1"
          ]
        },
        {
          "title": "Line integral round C (anticlockwise)",
          "math": [
            "\\text{piece }y = {x}^{2}, \\ x: 0 \\to 1: \\ r(t) = \\left(t,\\ {t}^{2},\\ 0\\right), \\ r'(t) = \\left(1,\\ 2 t,\\ 0\\right)",
            "F \\cdot r' = -20 {t}^{4}+8 {t}^{3}+3 {t}^{2}",
            "\\int =  -1",
            "\\text{piece }y = \\sqrt{x}, \\ x: 1 \\to 0: \\ r(t) = \\left(t,\\ \\sqrt{t},\\ 0\\right), \\ r'(t) = \\left(1,\\ \\frac{\\frac{1}{2}}{\\sqrt{t}},\\ 0\\right)",
            "F \\cdot r' = 3 {t}^{2}-3 t+2-8 {\\sqrt{t}}^{2}",
            "\\int =  \\frac{5}{2}",
            "\\oint_C = \\frac{3}{2}"
          ]
        },
        {
          "title": "Double integral over R",
          "math": [
            "\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}",
            "\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y} = 10 y",
            "\\int_{{x}^{2}}^{\\sqrt{x}} 10 y\\,dy = \\Big[\\,10 \\frac{{y}^{2}}{2}\\,\\Big]_{y = {x}^{2}}^{\\sqrt{x}}",
            "= 10 \\frac{{\\sqrt{x}}^{2}}{2} - \\left(10 \\frac{{\\left({x}^{2}\\right)}^{2}}{2}\\right)",
            "= -5 {x}^{4}+5 x",
            "\\int_{0}^{1} \\left(-5 {x}^{4}+5 x\\right)\\,dx = \\Big[\\,-{x}^{5}+5 \\frac{{x}^{2}}{2}\\,\\Big]_{x = 0}^{1}",
            "= -{1}^{5}+5 \\left(\\frac{{1}^{2}}{2}\\right) - 0",
            "= \\frac{3}{2}",
            "\\iint_R = \\frac{3}{2}"
          ]
        },
        {
          "title": "Compare",
          "math": [
            "\\frac{3}{2} = \\frac{3}{2}"
          ]
        }
      ],
      "answer": "$$\\oint_C = \\iint_R \\left(\\tfrac{\\partial N}{\\partial x} - \\tfrac{\\partial M}{\\partial y}\\right)dA = \\tfrac32$$"
    },
    "symbols": [
      {
        "s": "M,\\ N",
        "t": "The coefficients of dx and dy in the line integral.",
        "e": "M = 3x^2 - 8y^2"
      },
      {
        "s": "\\oint_C",
        "t": "The line integral round the boundary, anticlockwise.",
        "e": ""
      },
      {
        "s": "\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}",
        "t": "What is integrated over the region.",
        "e": "-6y + 16y = 10y"
      },
      {
        "s": "R",
        "t": "The region inside C.",
        "e": "x^2 \\le y \\le \\sqrt x"
      }
    ],
    "mistakes": [
      {
        "m": "Going round clockwise.",
        "f": "Green’s theorem uses the anticlockwise direction (region on the left)."
      },
      {
        "m": "Reversing $N_x - M_y$.",
        "f": "It is $\\partial N/\\partial x - \\partial M/\\partial y$."
      },
      {
        "m": "Missing a part of the boundary.",
        "f": "The boundary here has two pieces: along $y = x^2$ and back along $y = \\sqrt x$."
      },
      {
        "m": "Wrong limits for the region.",
        "f": "Sketch it: for each x, y goes from the lower curve to the upper one."
      }
    ]
  },
  "harmonic-analysis": {
    "example": {
      "question": "Six equally spaced values over one period are $y = 1.98, 1.30, 1.05, 1.30, -0.88, -0.25$. Find the Fourier series up to the second harmonic.",
      "steps": [
        {
          "title": "The formulas",
          "math": [
            "a_k = \\frac{2}{N}\\sum y\\cos k\\theta, \\ b_k = \\frac{2}{N}\\sum y\\sin k\\theta",
            "N = 6, \\quad \\theta = 0^\\circ, 60^\\circ, \\ldots"
          ]
        },
        {
          "title": "Coefficients",
          "math": [
            "a_0 = \\frac{2}{6}(4.5) = 1.5",
            "a_{1} = 0.3733, \\quad b_{1} = 1.0046",
            "a_{2} = 0.89, \\quad b_{2} = -0.1097"
          ]
        },
        {
          "title": "The series",
          "math": [
            "y \\approx 0.75 + 0.3733\\cos \\theta + 1.0046\\sin \\theta + 0.89\\cos 2\\theta - 0.1097\\sin 2\\theta"
          ]
        }
      ],
      "answer": "$$y \\approx 0.75 + 0.3733\\cos\\theta + 1.0046\\sin\\theta + 0.89\\cos 2\\theta - 0.1097\\sin 2\\theta$$"
    },
    "symbols": [
      {
        "s": "N",
        "t": "The number of equally spaced readings in one period.",
        "e": "6"
      },
      {
        "s": "a_0 = \\frac2N\\sum y",
        "t": "Twice the mean of the readings.",
        "e": "1.5"
      },
      {
        "s": "a_k = \\frac2N\\sum y\\cos k\\theta",
        "t": "The cosine coefficient of harmonic k.",
        "e": "a_1 = 0.3733"
      },
      {
        "s": "b_k = \\frac2N\\sum y\\sin k\\theta",
        "t": "The sine coefficient of harmonic k.",
        "e": "b_1 = 1.0046"
      }
    ],
    "mistakes": [
      {
        "m": "Using the integral formulas.",
        "f": "With table data, replace integrals by sums: $\\frac2N\\sum$."
      },
      {
        "m": "Including the repeated end value.",
        "f": "One period of N readings: do not count θ = 0 and θ = 2π both."
      },
      {
        "m": "Forgetting $a_0/2$.",
        "f": "The constant term is $a_0/2$ (here 0.75)."
      },
      {
        "m": "Wrong angles.",
        "f": "The readings are at $\\theta = 0, 60°, 120°, \\dots$ for N = 6."
      }
    ]
  },
  "implicit-differentiation": {
    "example": {
      "question": "Find $\\dfrac{dy}{dx}$ for $x^3 + y^3 = 6xy$ at the point $(3, 3)$.",
      "steps": [
        {
          "title": "Differentiate every term with respect to x (y is a function of x)",
          "math": [
            "\\frac{d}{dx}\\left[y^n\\right] = n y^{n-1} \\frac{dy}{dx}",
            "\\frac{d}{dx}\\left[{x}^{3}\\right] = 3 {x}^{2}",
            "\\frac{d}{dx}\\left[{y}^{3}\\right] = 3 {y}^{2}\\,\\frac{dy}{dx}",
            "\\frac{d}{dx}\\left[6 x\\, y\\right] = 6 y + 6 x\\,\\frac{dy}{dx}"
          ]
        },
        {
          "title": "Write the differentiated equation",
          "math": [
            "3 {x}^{2} + 3 {y}^{2}\\,\\frac{dy}{dx} = 6 y + 6 x\\,\\frac{dy}{dx}"
          ]
        },
        {
          "title": "Collect the dy/dx terms on the left",
          "math": [
            "\\left(3 {y}^{2}-6 x\\right)\\,\\frac{dy}{dx} = 6 y-3 {x}^{2}"
          ]
        },
        {
          "title": "Divide to get dy/dx",
          "math": [
            "\\frac{dy}{dx} = -\\frac{F_x}{F_y}",
            "\\frac{dy}{dx} = \\frac{6 y-3 {x}^{2}}{3 {y}^{2}-6 x}"
          ]
        },
        {
          "title": "Put in the point (3, 3)",
          "math": [
            "\\frac{dy}{dx}\\Big|_{(3,\\,3)} = -1"
          ]
        }
      ],
      "answer": "$$\\frac{dy}{dx} = \\frac{2y - x^2}{y^2 - 2x}, \\qquad \\frac{dy}{dx}\\Big|_{(3,3)} = -1$$"
    },
    "symbols": [
      {
        "s": "y'",
        "t": "The derivative dy/dx we want.",
        "e": ""
      },
      {
        "s": "\\frac{d}{dx}(y^3) = 3y^2y'",
        "t": "Differentiate y terms with the chain rule (y depends on x).",
        "e": ""
      },
      {
        "s": "\\frac{d}{dx}(xy) = y + xy'",
        "t": "Products of x and y need the product rule.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the $y'$ factor.",
        "f": "Every y term gets a factor $y'$: $\\frac{d}{dx}y^3 = 3y^2y'$."
      },
      {
        "m": "Missing the product rule on $6xy$.",
        "f": "$\\frac{d}{dx}(6xy) = 6y + 6xy'$."
      },
      {
        "m": "Not collecting the $y'$ terms.",
        "f": "Move all $y'$ terms to one side, factor, divide."
      },
      {
        "m": "Putting in the point too early.",
        "f": "Finish the general $y'$ first, then substitute."
      }
    ]
  },
  "improper-integrals": {
    "example": {
      "question": "Evaluate $\\displaystyle\\int_1^\\infty \\frac{dx}{x^2}$.",
      "steps": [
        {
          "title": "Antiderivative",
          "math": [
            "\\int \\frac{1}{{x}^{2}}\\,dx = -\\frac{1}{x}"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)",
            "\\int \\frac{1}{{x}^{2}}\\,dx = -\\frac{1}{x}"
          ]
        },
        {
          "title": "From 1 to ∞",
          "math": [
            "\\int_{1}^{\\infty} \\frac{1}{{x}^{2}}\\,dx = \\lim_{x \\to \\infty} F(x) - F(1) = 0 - \\left(-1\\right) = 1"
          ]
        }
      ],
      "answer": "$$\\int_1^\\infty \\frac{dx}{x^2} = \\lim_{b\\to\\infty}\\left(1 - \\tfrac1b\\right) = 1 \\ (\\text{converges})$$"
    },
    "symbols": [
      {
        "s": "\\int_a^\\infty",
        "t": "An improper integral: the range does not end. It means the limit as the upper end goes to ∞.",
        "e": ""
      },
      {
        "s": "\\lim_{b\\to\\infty} F(b)",
        "t": "Work out the antiderivative at b, then let b grow.",
        "e": "-\\tfrac1b \\to 0"
      },
      {
        "s": "\\text{converges / diverges}",
        "t": "If the limit is a finite number the integral converges; otherwise it diverges.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Putting ∞ straight in.",
        "f": "Write it as a limit: $\\lim_{b\\to\\infty}\\int_1^b$."
      },
      {
        "m": "Missing an infinite point inside the range.",
        "f": "If f blows up inside [a, b] (e.g. 1/x at 0), split there and take limits."
      },
      {
        "m": "Assuming convergence from f → 0.",
        "f": "$\\int_1^\\infty \\frac{dx}{x}$ diverges even though 1/x → 0."
      },
      {
        "m": "Sign slips with −1/x.",
        "f": "$[-\\tfrac1x]_1^b = -\\tfrac1b + 1$."
      }
    ]
  },
  "increasing-decreasing-calculator": {
    "example": {
      "question": "Where is $f(x) = x^4 - 2x^2$ increasing and where is it decreasing?",
      "steps": [
        {
          "title": "Differentiate",
          "math": [
            "f'(x) = 4 {x}^{3}-4 x"
          ]
        },
        {
          "title": "Find the critical points",
          "math": [
            "f'(x) = 0 \\text{ or undefined}",
            "f'(x) = 0 \\text{ at } x = -1, \\ 0, \\ 1"
          ]
        },
        {
          "title": "Test the sign of f′ in each interval",
          "math": [
            "x = -2: \\ f'(-2) < 0 \\ \\Rightarrow \\ \\text{decreasing}",
            "x = -\\frac{1}{2}: \\ f'(-\\frac{1}{2}) > 0 \\ \\Rightarrow \\ \\text{increasing}",
            "x = \\frac{1}{2}: \\ f'(\\frac{1}{2}) < 0 \\ \\Rightarrow \\ \\text{decreasing}",
            "x = 2: \\ f'(2) > 0 \\ \\Rightarrow \\ \\text{increasing}"
          ]
        },
        {
          "title": "Conclusion",
          "math": [
            "\\text{Increasing on } \\left(-1,\\ 0\\right) \\cup \\left(1,\\ \\infty\\right)",
            "\\text{Decreasing on } \\left(-\\infty,\\ -1\\right) \\cup \\left(0,\\ 1\\right)"
          ]
        }
      ],
      "answer": "$$\\text{increasing on } (-1, 0) \\cup (1, \\infty), \\quad \\text{decreasing on } (-\\infty, -1) \\cup (0, 1)$$"
    },
    "symbols": [
      {
        "s": "f'(x)",
        "t": "The derivative: positive where f rises, negative where it falls.",
        "e": "4x^3 - 4x"
      },
      {
        "s": "f'(x) = 0",
        "t": "The critical points split the line into intervals.",
        "e": "x = -1, 0, 1"
      },
      {
        "s": "\\text{sign test}",
        "t": "Pick a number in each interval and check the sign of f′ there.",
        "e": "f'(2) = 24 > 0"
      }
    ],
    "mistakes": [
      {
        "m": "Testing the sign at a critical point.",
        "f": "Test inside each interval, not at the endpoints where f′ = 0."
      },
      {
        "m": "Missing a critical point.",
        "f": "Factor fully: $4x(x - 1)(x + 1)$ gives three."
      },
      {
        "m": "Forgetting points where f′ does not exist.",
        "f": "Those also split the intervals."
      },
      {
        "m": "Using closed brackets.",
        "f": "State the intervals as open intervals between critical points."
      }
    ]
  },
  "integral-calculator": {
    "example": {
      "question": "Find $\\displaystyle\\int x\\cos(x^2)\\,dx$.",
      "steps": [
        {
          "title": "Substitution u = x^2",
          "text": "The integrand contains a function and (a multiple of) its derivative. Calling that function u turns the integral into a simpler one in u; at the end, u is replaced by what it stands for.",
          "math": [
            "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du",
            "u = {x}^{2}, \\quad du = 2 x\\,dx",
            "\\int  x\\, \\cos\\left({x}^{2}\\right)\\,dx = \\int \\frac{\\cos\\left(u\\right)}{2}\\,du",
            "\\int  x\\, \\cos\\left({x}^{2}\\right)\\,dx = \\frac{1}{2}\\, \\sin\\left({x}^{2}\\right)"
          ]
        },
        {
          "title": "Take the constant outside",
          "text": "A number multiplying the function can be moved outside the integral sign; we integrate what is left and multiply back at the end.",
          "math": [
            "\\int k\\,f\\,dx = k\\int f\\,dx",
            "\\int \\frac{\\cos\\left(u\\right)}{2}\\,du = \\frac{1}{2}\\, \\sin\\left(u\\right)"
          ]
        },
        {
          "title": "Standard integral: cos",
          "text": "This matches a formula from the standard integrals table (shown on the right); we copy the answer, putting our numbers in place of a.",
          "math": [
            "\\int \\cos x\\,dx = \\sin x",
            "\\int \\cos\\left(u\\right)\\,du = \\sin\\left(u\\right)"
          ]
        },
        {
          "title": "Check by differentiating",
          "text": "Integration undoes differentiation, so differentiating the answer must give back the function we started with. It does, so the answer is right.",
          "math": [
            "\\frac{d}{dx}F(x) = f(x)",
            "\\frac{d}{dx}\\left[\\frac{\\sin\\left({x}^{2}\\right)}{2}\\right] =  x\\, \\cos\\left({x}^{2}\\right) \\;\\checkmark"
          ]
        }
      ],
      "answer": "$$\\int x\\cos(x^2)\\,dx = \\tfrac12\\sin(x^2) + C$$"
    },
    "symbols": [
      {
        "s": "u = x^2",
        "t": "The substitution: the inside of cos, whose derivative (2x) appears in front.",
        "e": "du = 2x\\,dx"
      },
      {
        "s": "\\int \\cos u\\,du = \\sin u",
        "t": "The standard integral after substituting.",
        "e": ""
      },
      {
        "s": "C",
        "t": "The constant of integration (indefinite integrals only).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to change dx.",
        "f": "$du = 2x\\,dx$, so $x\\,dx = \\tfrac12 du$."
      },
      {
        "m": "Leaving u in the answer.",
        "f": "Substitute back: $u = x^2$."
      },
      {
        "m": "Forgetting + C.",
        "f": "Every indefinite integral has a constant."
      },
      {
        "m": "Not checking.",
        "f": "Differentiate the answer: $\\frac{d}{dx}\\tfrac12\\sin x^2 = x\\cos x^2$ ✓."
      }
    ]
  },
  "jacobian-calculator": {
    "example": {
      "question": "Find the Jacobian $\\dfrac{\\partial(x, y)}{\\partial(r, \\theta)}$ for $x = r\\cos\\theta$, $y = r\\sin\\theta$.",
      "steps": [
        {
          "title": "Partial derivatives",
          "math": [
            "\\frac{\\partial x}{\\partial r} = \\cos\\left(\\theta\\right), \\quad \\frac{\\partial x}{\\partial \\theta} = -r\\, \\sin\\left(\\theta\\right)",
            "\\frac{\\partial y}{\\partial r} = \\sin\\left(\\theta\\right), \\quad \\frac{\\partial y}{\\partial \\theta} =  r\\, \\cos\\left(\\theta\\right)"
          ]
        },
        {
          "title": "The Jacobian matrix",
          "math": [
            "J = \\frac{\\partial(x, y)}{\\partial(r, \\theta)}",
            "J = \\begin{vmatrix} \\cos\\left(\\theta\\right) & -r\\, \\sin\\left(\\theta\\right) \\\\ \\sin\\left(\\theta\\right) &  r\\, \\cos\\left(\\theta\\right) \\end{vmatrix}"
          ]
        },
        {
          "title": "Expand the determinant",
          "math": [
            "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc",
            "J = \\left(\\cos\\left(\\theta\\right)\\right)\\left( r\\, \\cos\\left(\\theta\\right)\\right) - \\left(-r\\, \\sin\\left(\\theta\\right)\\right)\\left(\\sin\\left(\\theta\\right)\\right)",
            "=  r\\, \\cos\\left(\\theta\\right)\\, \\cos\\left(\\theta\\right)--\\left(r\\, \\sin\\left(\\theta\\right)\\, \\sin\\left(\\theta\\right)\\right)",
            "=  r"
          ]
        }
      ],
      "answer": "$$J = \\begin{vmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{vmatrix} = r$$"
    },
    "symbols": [
      {
        "s": "\\frac{\\partial(x, y)}{\\partial(r, \\theta)}",
        "t": "The Jacobian: the determinant of all first partial derivatives.",
        "e": "r"
      },
      {
        "s": "x_r,\\ x_\\theta,\\ y_r,\\ y_\\theta",
        "t": "The partial derivatives that fill the matrix (one row per function).",
        "e": "x_\\theta = -r\\sin\\theta"
      },
      {
        "s": "|J|",
        "t": "The area scale factor when changing variables: dx dy = |J| dr dθ.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Rows and columns mixed up.",
        "f": "Row 1: derivatives of x; row 2: of y. (The determinant is the same either way, but keep it tidy.)"
      },
      {
        "m": "Forgetting |J| in a change of variables.",
        "f": "$dx\\,dy = r\\,dr\\,d\\theta$ in polar coordinates."
      },
      {
        "m": "Sign slips in the determinant.",
        "f": "$\\cos\\theta \\cdot r\\cos\\theta - (-r\\sin\\theta)\\sin\\theta = r$."
      },
      {
        "m": "Using $\\partial(r,\\theta)/\\partial(x, y)$ instead.",
        "f": "That is the reciprocal, 1/r."
      }
    ]
  },
  "lagrange-multipliers": {
    "example": {
      "question": "Find the largest and smallest values of $f = x + y$ on the circle $x^2 + y^2 = 1$.",
      "steps": [
        {
          "title": "Write the constraint as φ = 0",
          "math": [
            "\\varphi = {x}^{2}+{y}^{2}-1 = 0"
          ]
        },
        {
          "title": "Gradients",
          "math": [
            "\\nabla f = \\lambda \\nabla \\varphi",
            "\\nabla f = (1, 1), \\qquad \\nabla \\varphi = (2 x, 2 y)"
          ]
        },
        {
          "title": "The Lagrange equations",
          "math": [
            "\\begin{aligned} 1 &= \\lambda \\left(2 x\\right) \\\\ 1 &= \\lambda \\left(2 y\\right) \\\\ {x}^{2}+{y}^{2}-1 &= 0 \\end{aligned}"
          ]
        },
        {
          "title": "Solve them together",
          "math": [
            "(x, y) = (-\\frac{\\sqrt{2}}{2}, -\\frac{\\sqrt{2}}{2}), \\ \\lambda = -\\frac{\\sqrt{2}}{2} \\Rightarrow f = -\\sqrt{2}",
            "(x, y) = (\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2}), \\ \\lambda = \\frac{\\sqrt{2}}{2} \\Rightarrow f = \\sqrt{2}"
          ]
        }
      ],
      "answer": "$$\\max f = \\sqrt2 \\text{ at } \\left(\\tfrac{\\sqrt2}{2}, \\tfrac{\\sqrt2}{2}\\right), \\qquad \\min f = -\\sqrt2 \\text{ at } \\left(-\\tfrac{\\sqrt2}{2}, -\\tfrac{\\sqrt2}{2}\\right)$$"
    },
    "symbols": [
      {
        "s": "f",
        "t": "The function to make largest or smallest.",
        "e": "x + y"
      },
      {
        "s": "\\phi = 0",
        "t": "The constraint, written as something equal to 0.",
        "e": "x^2 + y^2 - 1"
      },
      {
        "s": "\\lambda",
        "t": "The Lagrange multiplier: an extra unknown.",
        "e": "\\tfrac{\\sqrt2}{2}"
      },
      {
        "s": "\\nabla f = \\lambda\\nabla\\phi",
        "t": "At the best points the two gradients are parallel.",
        "e": "(1, 1) = \\lambda(2x, 2y)"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the constraint equation.",
        "f": "Solve $\\nabla f = \\lambda\\nabla\\phi$ together with $\\phi = 0$."
      },
      {
        "m": "Dividing by something that can be 0.",
        "f": "Check those cases separately."
      },
      {
        "m": "Not comparing all candidates.",
        "f": "Put every solution into f to find which is max and which is min."
      },
      {
        "m": "Writing the constraint as $g = c$ in the gradient.",
        "f": "Use $\\phi = g - c$; the constant does not change the gradient, but keep it consistent."
      }
    ]
  },
  "leibniz-integral-rule": {
    "example": {
      "question": "Evaluate $F(a) = \\displaystyle\\int_0^1 \\frac{x^a - 1}{\\ln x}\\,dx$ by differentiating under the integral sign.",
      "steps": [
        {
          "title": "Differentiate with respect to a",
          "math": [
            "F'(a) = \\int \\frac{\\partial f}{\\partial a}\\,dx",
            "F(a) = \\int_{0}^{1} \\frac{{x}^{a}-1}{\\ln\\left(x\\right)}\\,dx",
            "\\frac{\\partial f}{\\partial a} = {x}^{a}"
          ]
        },
        {
          "title": "F'(a)",
          "math": [
            "\\int {x}^{a}\\,dx = \\frac{{x}^{a+1}}{a+1}",
            "F'(a) = \\frac{1}{a+1}"
          ]
        },
        {
          "title": "Integrate back",
          "math": [
            "F(a) = \\int F'(a)\\,da + C",
            "F(a) = \\ln\\left(\\left| a+1\\right|\\right) + C",
            "F(0) = 0 \\Rightarrow C = 0",
            "F(a) = \\ln\\left(\\left| a+1\\right|\\right)"
          ]
        }
      ],
      "answer": "$$F(a) = \\ln(a + 1)$$"
    },
    "symbols": [
      {
        "s": "F(a)",
        "t": "An integral that depends on a parameter a.",
        "e": ""
      },
      {
        "s": "F'(a) = \\int \\frac{\\partial f}{\\partial a}\\,dx",
        "t": "Leibniz’s rule: differentiate inside the integral (fixed limits).",
        "e": "\\int_0^1 x^a\\,dx = \\tfrac{1}{a+1}"
      },
      {
        "s": "F(0)",
        "t": "A known value used to find the constant after integrating back.",
        "e": "F(0) = 0"
      }
    ],
    "mistakes": [
      {
        "m": "Differentiating with respect to x.",
        "f": "Differentiate the integrand with respect to the parameter a."
      },
      {
        "m": "Forgetting the constant.",
        "f": "After integrating $F'(a)$, fix the constant with a value such as F(0) = 0."
      },
      {
        "m": "Variable limits ignored.",
        "f": "If the limits depend on a, add the boundary terms $f(b)b'(a) - f(a)a'(a)$."
      },
      {
        "m": "$\\frac{\\partial}{\\partial a}x^a = ax^{a-1}$.",
        "f": "It is $x^a\\ln x$: a is the exponent."
      }
    ]
  },
  "limit-calculator": {
    "example": {
      "question": "Find $\\displaystyle\\lim_{x\\to2}\\frac{x^2 - 5x + 6}{x^2 - 4}$.",
      "steps": [
        {
          "title": "Substitute: 0/0",
          "math": [
            "\\text{Top} \\to 0, \\quad \\text{bottom} \\to 0: \\ \\frac{0}{0} \\text{ is indeterminate, so simplify first.}"
          ]
        },
        {
          "title": "Factor and cancel x - 2",
          "math": [
            "\\frac{x^{2} - 5x + 6}{x^{2} - 4} = \\frac{(x - 2)\\left(x - 3\\right)}{(x - 2)\\left(x + 2\\right)} = \\frac{x - 3}{x + 2}"
          ]
        },
        {
          "title": "Substitute again",
          "math": [
            "\\lim_{x \\to 2} \\frac{x - 3}{x + 2} = \\frac{-1}{4} = -\\frac{1}{4}"
          ]
        }
      ],
      "answer": "$$\\lim_{x\\to2}\\frac{x - 3}{x + 2} = -\\tfrac14$$"
    },
    "symbols": [
      {
        "s": "\\tfrac00",
        "t": "An indeterminate form: substituting gives no answer; simplify first.",
        "e": ""
      },
      {
        "s": "\\text{factor and cancel}",
        "t": "Both top and bottom have the factor (x − 2); cancel it.",
        "e": "\\frac{(x-2)(x-3)}{(x-2)(x+2)}"
      },
      {
        "s": "\\text{L'Hôpital}",
        "t": "For 0/0 or ∞/∞: differentiate top and bottom separately.",
        "e": "\\frac{2x - 5}{2x} \\to -\\tfrac14"
      }
    ],
    "mistakes": [
      {
        "m": "Writing 0/0 = 0 or 1.",
        "f": "0/0 is undecided; simplify or use L’Hôpital."
      },
      {
        "m": "L’Hôpital with the quotient rule.",
        "f": "Differentiate the top and the bottom separately, not as a quotient."
      },
      {
        "m": "Using L’Hôpital when it is not 0/0 or ∞/∞.",
        "f": "Substitute first; only use it for those forms."
      },
      {
        "m": "Factoring errors.",
        "f": "$x^2 - 5x + 6 = (x - 2)(x - 3)$; check by expanding."
      }
    ]
  },
  "line-integral": {
    "example": {
      "question": "Find the work done by $\\mathbf F = (3x^2 + 6y)\\mathbf i - 14yz\\,\\mathbf j + 20xz^2\\,\\mathbf k$ along $x = t$, $y = t^2$, $z = t^3$ from $t = 0$ to $t = 1$.",
      "steps": [
        {
          "title": "The field and the path",
          "math": [
            "W = \\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int (P\\,x' + Q\\,y' + R\\,z')\\,dt",
            "\\mathbf{F} = \\left(3 {x}^{2}+6 y,\\ -14 y\\, z,\\ 20 x\\, {z}^{2}\\right)"
          ]
        },
        {
          "title": "Along the curve",
          "math": [
            "\\text{}t: 0 \\to 1: \\ r(t) = \\left(t,\\ {t}^{2},\\ {t}^{3}\\right), \\ r'(t) = \\left(1,\\ 2 t,\\ 3 {t}^{2}\\right)",
            "F \\cdot r' = 60 {t}^{9}-28 {t}^{6}+9 {t}^{2}",
            "\\int =  5"
          ]
        }
      ],
      "answer": "$$W = \\int_C \\mathbf F\\cdot d\\mathbf r = 5$$"
    },
    "symbols": [
      {
        "s": "\\mathbf r(t)",
        "t": "The path, written in terms of a parameter t.",
        "e": "(t, t^2, t^3)"
      },
      {
        "s": "d\\mathbf r = \\mathbf r'(t)\\,dt",
        "t": "A small step along the path.",
        "e": "(1, 2t, 3t^2)\\,dt"
      },
      {
        "s": "\\mathbf F\\cdot d\\mathbf r",
        "t": "The work done on that small step.",
        "e": ""
      },
      {
        "s": "\\int_C",
        "t": "Add along the whole path: an ordinary integral in t.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Not substituting the path into F.",
        "f": "Replace x, y, z by their expressions in t before integrating."
      },
      {
        "m": "Forgetting $d\\mathbf r$.",
        "f": "Multiply by $\\mathbf r'(t)$ (dot product), then integrate in t."
      },
      {
        "m": "Wrong t limits.",
        "f": "Use the t values at the start and end of the path."
      },
      {
        "m": "Assuming the answer is path-independent.",
        "f": "Only for conservative fields (curl F = 0)."
      }
    ]
  },
  "logarithmic-differentiation": {
    "example": {
      "question": "Differentiate $y = x^x$.",
      "steps": [
        {
          "title": "Take ln of both sides",
          "math": [
            "y = {x}^{x}",
            "\\ln y = \\ln\\left({x}^{x}\\right)"
          ]
        },
        {
          "title": "Expand with the log laws",
          "math": [
            "\\ln(ab) = \\ln a + \\ln b, \\ \\ln\\frac{a}{b} = \\ln a - \\ln b, \\ \\ln a^{k} = k\\ln a",
            "\\ln y = x\\, \\ln\\left(x\\right)"
          ]
        },
        {
          "title": "Differentiate both sides with respect to x",
          "math": [
            "\\frac{d}{dx}\\ln y = \\frac{1}{y}\\frac{dy}{dx}",
            "\\frac{1}{y}\\frac{dy}{dx} = \\ln\\left(x\\right)+1"
          ]
        },
        {
          "title": "Multiply both sides by y",
          "math": [
            "\\frac{dy}{dx} = y\\left[\\ln\\left(x\\right)+1\\right] = {x}^{x}\\left[\\ln\\left(x\\right)+1\\right]"
          ]
        }
      ],
      "answer": "$$\\frac{dy}{dx} = x^x(\\ln x + 1)$$"
    },
    "symbols": [
      {
        "s": "\\ln y",
        "t": "Take logs to bring the power down.",
        "e": "\\ln y = x\\ln x"
      },
      {
        "s": "\\frac{1}{y}\\frac{dy}{dx}",
        "t": "The derivative of ln y (chain rule).",
        "e": ""
      },
      {
        "s": "\\frac{dy}{dx} = y \\cdot (\\dots)",
        "t": "Multiply back by y at the end.",
        "e": "x^x(\\ln x + 1)"
      }
    ],
    "mistakes": [
      {
        "m": "Using the power rule on $x^x$.",
        "f": "$x \\cdot x^{x-1}$ is wrong: the power is not constant."
      },
      {
        "m": "Using $a^x\\ln a$.",
        "f": "That needs a constant base; here both base and power vary."
      },
      {
        "m": "Forgetting to multiply by y.",
        "f": "$\\frac{dy}{dx} = y \\times$ (derivative of ln y)."
      },
      {
        "m": "Log-law slips.",
        "f": "$\\ln(x^x) = x\\ln x$, $\\ln(ab) = \\ln a + \\ln b$."
      }
    ]
  },
  "maxima-minima-calculator": {
    "example": {
      "question": "Find the local and absolute extrema of $f(x) = x^3 - 3x$ on $[-2, 3]$.",
      "steps": [
        {
          "title": "Differentiate",
          "math": [
            "f'(x) = 3 {x}^{2}-3"
          ]
        },
        {
          "title": "Find the critical points",
          "math": [
            "f'(x) = 0 \\text{ or undefined}",
            "f'(x) = 0 \\text{ at } x = -1, \\ 1"
          ]
        },
        {
          "title": "Second derivative",
          "math": [
            "f''(x) = 6 x"
          ]
        },
        {
          "title": "Test each critical point",
          "math": [
            "f''(c) < 0 \\Rightarrow \\max, \\ f''(c) > 0 \\Rightarrow \\min",
            "x = -1: \\ f''(-1) = -6 < 0 \\ \\Rightarrow \\ \\text{local maximum}, \\ f(-1) = 2",
            "x = 1: \\ f''(1) = 6 > 0 \\ \\Rightarrow \\ \\text{local minimum}, \\ f(1) = -2"
          ]
        },
        {
          "title": "Absolute maximum and minimum on the closed interval",
          "math": [
            "\\text{compare } f \\text{ at the ends and the critical points}",
            "f(-2) = -2, \\quad f(-1) = 2, \\quad f(1) = -2, \\quad f(3) = 18",
            "\\text{Absolute max } = 18 \\text{ at } x = 3; \\quad \\text{absolute min } = -2 \\text{ at } x = -2, 1"
          ]
        }
      ],
      "answer": "$$\\text{local max } 2 \\text{ at } x = -1, \\ \\text{local min } -2 \\text{ at } x = 1; \\ \\text{absolute max } 18 \\text{ at } x = 3$$"
    },
    "symbols": [
      {
        "s": "f'(x) = 0",
        "t": "Critical points: where the tangent is flat.",
        "e": "x = \\pm1"
      },
      {
        "s": "f''(x)",
        "t": "Second-derivative test: < 0 maximum, > 0 minimum.",
        "e": "f''(1) = 6 > 0"
      },
      {
        "s": "\\text{endpoints}",
        "t": "On a closed interval also check f at the two ends.",
        "e": "f(3) = 18"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the endpoints.",
        "f": "On [a, b] the absolute max/min can be at an end."
      },
      {
        "m": "Calling every critical point an extremum.",
        "f": "Check the sign of f″ (or of f′ either side)."
      },
      {
        "m": "Giving x instead of f(x).",
        "f": "The maximum value is f(x); say where it occurs too."
      },
      {
        "m": "f″ = 0 taken as no extremum.",
        "f": "Then the test is undecided; use the first-derivative test."
      }
    ]
  },
  "maxima-minima-two-variables": {
    "example": {
      "question": "Find and classify the stationary points of $f(x, y) = x^3 + y^3 - 3xy$.",
      "steps": [
        {
          "title": "First partial derivatives",
          "math": [
            "f_x = 3 {x}^{2}-3 y, \\qquad f_y = 3 {y}^{2}-3 x"
          ]
        },
        {
          "title": "Critical points: solve both equations together",
          "math": [
            "f_x = 0, \\ f_y = 0",
            "3 {x}^{2}-3 y = 0, \\qquad 3 {y}^{2}-3 x = 0",
            "\\Rightarrow (x, y) = (0, 0), \\ (1, 1)"
          ]
        },
        {
          "title": "Second partial derivatives",
          "math": [
            "r = f_{xx}, \\ s = f_{xy}, \\ t = f_{yy}",
            "r = 6 x, \\quad s = -3, \\quad t = 6 y"
          ]
        },
        {
          "title": "At (0, 0): saddle point",
          "math": [
            "rt - s^2",
            "r = 0, \\ s = -3, \\ t = 0 \\Rightarrow rt - s^2 = -9",
            "rt - s^2 < 0 \\Rightarrow \\text{saddle point}"
          ]
        },
        {
          "title": "At (1, 1): minimum",
          "math": [
            "rt - s^2",
            "r = 6, \\ s = -3, \\ t = 6 \\Rightarrow rt - s^2 = 27",
            "rt - s^2 > 0,\\ r > 0 \\Rightarrow \\text{minimum}, \\ f = -1"
          ]
        }
      ],
      "answer": "$$(0, 0): \\text{saddle}; \\qquad (1, 1): \\text{minimum}, \\ f = -1$$"
    },
    "symbols": [
      {
        "s": "f_x = 0,\\ f_y = 0",
        "t": "Stationary points: both first partials are 0.",
        "e": "3x^2 - 3y = 0"
      },
      {
        "s": "r,\\ s,\\ t",
        "t": "The second partials $f_{xx}, f_{xy}, f_{yy}$ at the point.",
        "e": "r = 6x"
      },
      {
        "s": "rt - s^2",
        "t": "> 0 with r > 0: minimum; > 0 with r < 0: maximum; < 0: saddle.",
        "e": "36 - 9 = 27"
      }
    ],
    "mistakes": [
      {
        "m": "Solving only one equation.",
        "f": "Solve $f_x = 0$ and $f_y = 0$ together."
      },
      {
        "m": "Missing a solution.",
        "f": "$y = x^2$ and $x = y^2$ give $x^4 = x$: x = 0 and x = 1."
      },
      {
        "m": "Using r alone.",
        "f": "First check $rt - s^2$; only then the sign of r."
      },
      {
        "m": "$rt - s^2 = 0$ taken as a saddle.",
        "f": "Then the test is undecided."
      }
    ]
  },
  "mean-value-theorem": {
    "example": {
      "question": "Verify Rolle's theorem for $f(x) = x^2 - 4x + 3$ on $[1, 3]$.",
      "steps": [
        {
          "title": "Check the conditions",
          "math": [
            "f \\text{ is continuous on } [1, 3]",
            "f'(x) = 2 x-4 \\text{ is finite on } (1, 3)"
          ]
        },
        {
          "title": "f(a) = f(b)",
          "math": [
            "f(1) = f(3) = 0"
          ]
        },
        {
          "title": "Solve f′(c) = 0",
          "math": [
            "2 x-4 = 0 \\Rightarrow c = 2"
          ]
        }
      ],
      "answer": "$$f(1) = f(3) = 0, \\quad f'(c) = 2c - 4 = 0 \\Rightarrow c = 2 \\in (1, 3)$$"
    },
    "symbols": [
      {
        "s": "[a, b]",
        "t": "f must be continuous on the closed interval and differentiable inside it.",
        "e": "[1, 3]"
      },
      {
        "s": "f(a) = f(b)",
        "t": "Rolle’s extra condition.",
        "e": "0 = 0"
      },
      {
        "s": "f'(c) = 0",
        "t": "Rolle: a flat tangent somewhere inside.",
        "e": "c = 2"
      },
      {
        "s": "f'(c) = \\frac{f(b) - f(a)}{b - a}",
        "t": "Lagrange’s mean value theorem (the general form).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Skipping the conditions.",
        "f": "State continuity, differentiability and (for Rolle) f(a) = f(b)."
      },
      {
        "m": "A c outside (a, b).",
        "f": "c must lie strictly between a and b."
      },
      {
        "m": "Using Rolle when f(a) ≠ f(b).",
        "f": "Then use the mean value theorem instead."
      },
      {
        "m": "Functions with a corner.",
        "f": "|x| on [−1, 1] is not differentiable at 0, so Rolle does not apply."
      }
    ]
  },
  "nth-derivative-leibniz": {
    "example": {
      "question": "Find the n-th derivative of $y = e^{2x}\\sin 3x$.",
      "steps": [
        {
          "title": "Standard result",
          "math": [
            "y = e^{ax}\\sin(bx + c) \\Rightarrow y_n = r^n e^{ax}\\sin(bx + c + n\\phi), \\ r = \\sqrt{a^2 + b^2}, \\ \\phi = \\tan^{-1}\\frac{b}{a}",
            "y_n = (\\sqrt{13})^{n}e^{2x}\\sin\\left(3x + n\\tan^{-1}\\frac{3}{2}\\right)"
          ]
        },
        {
          "title": "Check",
          "math": [
            "\\text{The formula agrees with differentiating directly for } n = 1, 2, 3, 4."
          ]
        }
      ],
      "answer": "$$y_n = 13^{n/2}\\,e^{2x}\\sin\\left(3x + n\\tan^{-1}\\tfrac32\\right)$$"
    },
    "symbols": [
      {
        "s": "y_n",
        "t": "The n-th derivative.",
        "e": ""
      },
      {
        "s": "e^{ax}\\sin(bx + c)",
        "t": "The standard form this result applies to.",
        "e": "a = 2,\\ b = 3"
      },
      {
        "s": "(a^2 + b^2)^{n/2}",
        "t": "The size factor gained per derivative.",
        "e": "13^{n/2}"
      },
      {
        "s": "\\tan^{-1}\\tfrac{b}{a}",
        "t": "The phase shift added per derivative.",
        "e": "\\tan^{-1}\\tfrac32"
      }
    ],
    "mistakes": [
      {
        "m": "Using $\\tan^{-1}(a/b)$.",
        "f": "The angle is $\\tan^{-1}(b/a)$."
      },
      {
        "m": "Forgetting the power n/2.",
        "f": "The factor is $(a^2 + b^2)^{n/2}$, not $(a^2 + b^2)^n$."
      },
      {
        "m": "Leibniz’s theorem without binomial coefficients.",
        "f": "$(uv)_n = \\sum \\binom{n}{k}u_{n-k}v_k$."
      },
      {
        "m": "Not checking n = 1.",
        "f": "Put n = 1 and compare with the ordinary derivative."
      }
    ]
  },
  "optimization-problems": {
    "example": {
      "question": "Equal squares are cut from the corners of a 12 × 12 sheet and the sides folded up to make an open box. Find the largest volume.",
      "steps": [
        {
          "title": "Set up the function",
          "math": [
            "\\text{Cut squares of side } x \\text{ from the corners: } V = x(12 - 2x)^2, \\ 0 < x < 6"
          ]
        },
        {
          "title": "Differentiate",
          "math": [
            "f'(x) = 12 {x}^{2}-96 x+144, \\qquad f''(x) = 24 x-96"
          ]
        },
        {
          "title": "Critical points",
          "math": [
            "f'(x) = 0 \\Rightarrow x = 2"
          ]
        },
        {
          "title": "At x = 2",
          "math": [
            "f''(2) = -48 < 0 \\Rightarrow \\text{maximum}, \\quad f = 128"
          ]
        },
        {
          "title": "Answer",
          "math": [
            "\\max\\ \\text{(the volume)} = 128 \\text{ at } x = 2"
          ]
        }
      ],
      "answer": "$$V_{\\max} = 128 \\text{ at } x = 2$$"
    },
    "symbols": [
      {
        "s": "x",
        "t": "The side of the squares cut out (the variable we choose).",
        "e": "0 < x < 6"
      },
      {
        "s": "V(x)",
        "t": "The quantity to maximise, written in one variable.",
        "e": "x(12 - 2x)^2"
      },
      {
        "s": "V'(x) = 0",
        "t": "The critical points.",
        "e": "x = 2"
      },
      {
        "s": "V''(x) < 0",
        "t": "Confirms a maximum.",
        "e": "V''(2) = -48"
      }
    ],
    "mistakes": [
      {
        "m": "Two variables left in the formula.",
        "f": "Use the given condition to write everything in one variable."
      },
      {
        "m": "Ignoring the allowed range.",
        "f": "Here 0 < x < 6; x = 6 would make a flat box."
      },
      {
        "m": "Not confirming max or min.",
        "f": "Use the second derivative or check the ends."
      },
      {
        "m": "Answering x when asked for V.",
        "f": "Give the volume (128) and where it occurs (x = 2)."
      }
    ]
  },
  "parametric-differentiation": {
    "example": {
      "question": "For $x = \\cos t$, $y = \\sin t$, find $\\dfrac{dy}{dx}$ and the tangent at $t = \\pi/4$.",
      "steps": [
        {
          "title": "Differentiate x with respect to t",
          "math": [
            "x = \\cos\\left(t\\right)",
            "\\frac{dx}{dt} = -\\sin\\left(t\\right)"
          ]
        },
        {
          "title": "Differentiate y with respect to t",
          "math": [
            "y = \\sin\\left(t\\right)",
            "\\frac{dy}{dt} = \\cos\\left(t\\right)"
          ]
        },
        {
          "title": "Divide",
          "math": [
            "\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}",
            "\\frac{dy}{dx} = \\frac{\\cos\\left(t\\right)}{-\\sin\\left(t\\right)} = -\\frac{\\cos\\left(t\\right)}{\\sin\\left(t\\right)}"
          ]
        },
        {
          "title": "At the given point",
          "math": [
            "t = 0.78539816: \\quad x = 0.70710678, \\ y = 0.70710678",
            "\\frac{dy}{dx} = -1",
            "\\text{Tangent: } y = -x + 1.4142136"
          ]
        }
      ],
      "answer": "$$\\frac{dy}{dx} = -\\cot t = -1 \\text{ at } t = \\tfrac\\pi4; \\quad \\text{tangent } y = -x + \\sqrt2$$"
    },
    "symbols": [
      {
        "s": "\\frac{dx}{dt},\\ \\frac{dy}{dt}",
        "t": "Differentiate x and y with respect to the parameter.",
        "e": "-\\sin t,\\ \\cos t"
      },
      {
        "s": "\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}",
        "t": "The slope of the curve.",
        "e": "-\\cot t"
      },
      {
        "s": "\\frac{d^2y}{dx^2} = \\frac{d}{dt}\\left(\\frac{dy}{dx}\\right) \\big/ \\frac{dx}{dt}",
        "t": "The second derivative.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Dividing the wrong way.",
        "f": "$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$: y on top."
      },
      {
        "m": "Second derivative as $\\frac{d^2y/dt^2}{d^2x/dt^2}$.",
        "f": "Differentiate dy/dx with respect to t, then divide by dx/dt."
      },
      {
        "m": "Point not converted to x, y.",
        "f": "At t = π/4: $(x, y) = (\\tfrac{\\sqrt2}{2}, \\tfrac{\\sqrt2}{2})$."
      },
      {
        "m": "Degrees for t.",
        "f": "t is in radians."
      }
    ]
  },
  "partial-derivative-calculator": {
    "example": {
      "question": "Find $\\dfrac{\\partial f}{\\partial x}$ for $f = x^2y^3 + \\sin(xy)$.",
      "steps": [
        {
          "title": "Differentiate with respect to x (y is held constant)",
          "math": [
            "\\frac{\\partial f}{\\partial x}",
            "f_{x} = \\frac{\\partial}{\\partial x}\\left({x}^{2}\\, {y}^{3}+\\sin\\left(x\\, y\\right)\\right) = 2 x\\, {y}^{3}+ y\\, \\cos\\left(x\\, y\\right)"
          ]
        },
        {
          "title": "Sum rule",
          "math": [
            "(u + v)' = u' + v'",
            "\\frac{\\partial}{\\partial x}\\left[{x}^{2}\\, {y}^{3}+\\sin\\left(x\\, y\\right)\\right] = 2 x\\, {y}^{3}+ y\\, \\cos\\left(x\\, y\\right)"
          ]
        },
        {
          "title": "Constant multiple rule",
          "math": [
            "(c\\,u)' = c\\,u'",
            "\\frac{\\partial}{\\partial x}\\left[{x}^{2}\\, {y}^{3}\\right] = 2 x\\, {y}^{3}"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "(x^n)' = n\\,x^{n-1}",
            "\\frac{\\partial}{\\partial x}\\left[{x}^{2}\\right] = 2 x"
          ]
        },
        {
          "title": "Derivative of sin with the chain rule",
          "math": [
            "\\frac{d}{dx}\\sin u = \\cos u \\cdot u'",
            "\\frac{\\partial}{\\partial x}\\left[\\sin\\left(x\\, y\\right)\\right] =  y\\, \\cos\\left(x\\, y\\right)"
          ]
        },
        {
          "title": "Constant multiple rule",
          "math": [
            "(c\\,u)' = c\\,u'",
            "\\frac{\\partial}{\\partial x}\\left[ x\\, y\\right] =  y"
          ]
        }
      ],
      "answer": "$$\\frac{\\partial f}{\\partial x} = 2xy^3 + y\\cos(xy)$$"
    },
    "symbols": [
      {
        "s": "\\frac{\\partial f}{\\partial x}",
        "t": "Differentiate with respect to x, holding y fixed.",
        "e": ""
      },
      {
        "s": "\\frac{\\partial}{\\partial x}(x^2y^3) = 2xy^3",
        "t": "y³ is a constant factor.",
        "e": ""
      },
      {
        "s": "\\frac{\\partial}{\\partial x}\\sin(xy) = y\\cos(xy)",
        "t": "Chain rule: the inside xy has x-derivative y.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Differentiating y too.",
        "f": "For ∂/∂x, y is a constant."
      },
      {
        "m": "Forgetting the chain-rule factor.",
        "f": "$\\frac{\\partial}{\\partial x}\\sin(xy) = y\\cos(xy)$."
      },
      {
        "m": "Mixed partials in the wrong order.",
        "f": "$f_{xy}$: x first, then y (usually equal anyway)."
      },
      {
        "m": "Treating a constant factor as a variable.",
        "f": "$y^3$ multiplies $x^2$ and stays as it is."
      }
    ]
  },
  "power-series-radius-of-convergence": {
    "example": {
      "question": "Find the radius and interval of convergence of $\\sum_{n=1}^\\infty \\dfrac{x^n}{n}$.",
      "steps": [
        {
          "title": "Ratio test",
          "math": [
            "\\lim \\left|\\frac{u_{n+1}}{u_n}\\right| < 1",
            "\\left|\\frac{c_{n+1}}{c_n}\\right|\\,|x|^{1} \\to \\frac{|x|^{1}}{\\rho}, \\qquad \\rho = \\lim \\left|\\frac{c_n}{c_{n+1}}\\right| = \\lim\\left|\\frac{n+1}{n}\\right| = 1",
            "\\text{Converges when } |x| < 1 \\Rightarrow R = 1"
          ]
        },
        {
          "title": "End point x = -1: converges conditionally",
          "math": [
            "\\sum \\frac{{\\left(-1\\right)}^{n}}{n} \\quad (\\text{alternating series test})",
            "|a_n| \\text{ decreases and } a_n \\to 0"
          ]
        },
        {
          "title": "End point x = 1: diverges",
          "math": [
            "\\sum \\frac{{1}^{n+1}}{n} \\quad (\\text{p-series})",
            "a_n = \\frac{c}{n^{p}} \\text{ with } p = 1 \\le 1"
          ]
        }
      ],
      "answer": "$$R = 1, \\qquad \\text{interval } [-1, 1)$$"
    },
    "symbols": [
      {
        "s": "c_n",
        "t": "The coefficient of xⁿ.",
        "e": "\\tfrac1n"
      },
      {
        "s": "R = \\lim\\left|\\frac{c_n}{c_{n+1}}\\right|",
        "t": "The radius: the series converges for |x| < R.",
        "e": "1"
      },
      {
        "s": "\\text{end points}",
        "t": "At x = ±R the ratio test decides nothing; test each end separately.",
        "e": "x = -1 \\text{ converges}"
      }
    ],
    "mistakes": [
      {
        "m": "Skipping the end points.",
        "f": "Test x = −R and x = R separately (here −1 converges, 1 diverges)."
      },
      {
        "m": "Inverting the ratio.",
        "f": "$R = \\lim |c_n / c_{n+1}|$; the ratio test gives $|x| \\lim |c_{n+1}/c_n| < 1$."
      },
      {
        "m": "Centre not at 0.",
        "f": "For $(x - a)^n$ the interval is $(a - R, a + R)$."
      },
      {
        "m": "Using $x^{2n}$ like $x^n$.",
        "f": "Powers of $x^2$ give $|x|^2 < R$, so the radius is $\\sqrt R$."
      }
    ]
  },
  "reduction-formula": {
    "example": {
      "question": "Use the reduction formula to find $\\displaystyle\\int \\sin^4 x\\,dx$.",
      "steps": [
        {
          "title": "Reduction formula",
          "math": [
            "I_n = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n - 1}{n}I_{n-2}",
            "I_n = \\int \\sin^{n}x\\,dx"
          ]
        },
        {
          "title": "Apply it down to the base",
          "math": [
            "I_{4} = \\frac{-{\\sin\\left(x\\right)}^{3}\\, \\cos\\left(x\\right)}{4} + \\frac{3}{4}I_{2}",
            "I_{2} = -\\frac{\\sin\\left(x\\right)\\, \\cos\\left(x\\right)}{2} + \\frac{1}{2}I_{0}",
            "I_{0} =  x, \\quad I_{1} = -\\cos\\left(x\\right)"
          ]
        },
        {
          "title": "Put it together",
          "math": [
            "\\int \\sin^{4}x\\,dx = \\frac{3}{8}\\, x-\\left(\\frac{3}{8}\\, \\sin\\left(x\\right)\\right)\\, \\cos\\left(x\\right)-\\left(\\frac{1}{4}\\, {\\sin\\left(x\\right)}^{3}\\right)\\, \\cos\\left(x\\right) + C"
          ]
        }
      ],
      "answer": "$$\\int\\sin^4 x\\,dx = \\tfrac38 x - \\tfrac38\\sin x\\cos x - \\tfrac14\\sin^3 x\\cos x + C$$"
    },
    "symbols": [
      {
        "s": "I_n = \\int\\sin^n x\\,dx",
        "t": "The integral for power n.",
        "e": ""
      },
      {
        "s": "I_n = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}I_{n-2}",
        "t": "The reduction formula: steps the power down by 2.",
        "e": "I_4 \\to I_2 \\to I_0"
      },
      {
        "s": "I_0 = x,\\ I_1 = -\\cos x",
        "t": "The bases where the stepping stops.",
        "e": ""
      },
      {
        "s": "\\text{Wallis}",
        "t": "For limits 0 to π/2 the boundary terms vanish, leaving a product of fractions.",
        "e": "\\tfrac34\\cdot\\tfrac12\\cdot\\tfrac\\pi2"
      }
    ],
    "mistakes": [
      {
        "m": "Stepping down by 1.",
        "f": "The formula goes from n to n − 2."
      },
      {
        "m": "Dropping the boundary term.",
        "f": "Each step has $-\\frac{\\sin^{n-1}x\\cos x}{n}$ (it vanishes only for 0 to π/2)."
      },
      {
        "m": "Wrong base case.",
        "f": "Even n ends at $I_0 = x$; odd n at $I_1 = -\\cos x$."
      },
      {
        "m": "Forgetting + C.",
        "f": "An indefinite integral needs a constant."
      }
    ]
  },
  "related-rates": {
    "example": {
      "question": "A 10 m ladder leans against a wall. Its foot slides away at 2 m/s. How fast is the top sliding down when the foot is 6 m from the wall?",
      "steps": [
        {
          "title": "The relation",
          "math": [
            "x^2 + y^2 = 100 \\ (\\text{Pythagoras})"
          ]
        },
        {
          "title": "Differentiate with respect to t",
          "math": [
            "2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0 \\Rightarrow \\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt}"
          ]
        },
        {
          "title": "Put in the values",
          "math": [
            "x = 6, \\ y = \\sqrt{100 - 36} = 8, \\ \\frac{dx}{dt} = 2"
          ]
        },
        {
          "title": "Answer",
          "math": [
            "\\frac{dy}{dt} = -\\frac{6}{8}(2) = -\\frac{3}{2} \\text{ m/s}"
          ]
        }
      ],
      "answer": "$$\\frac{dy}{dt} = -\\tfrac32 \\text{ m/s (the top moves down at 1.5 m/s)}$$"
    },
    "symbols": [
      {
        "s": "x,\\ y",
        "t": "The distances that change with time: foot from the wall, top above the ground.",
        "e": "x = 6,\\ y = 8"
      },
      {
        "s": "x^2 + y^2 = 100",
        "t": "The relation that holds at every moment.",
        "e": ""
      },
      {
        "s": "\\frac{dx}{dt},\\ \\frac{dy}{dt}",
        "t": "The rates: differentiate the relation with respect to time t.",
        "e": "\\frac{dx}{dt} = 2"
      }
    ],
    "mistakes": [
      {
        "m": "Putting the numbers in before differentiating.",
        "f": "Differentiate the general relation first, then substitute."
      },
      {
        "m": "Forgetting the chain rule in t.",
        "f": "$\\frac{d}{dt}(x^2) = 2x\\frac{dx}{dt}$."
      },
      {
        "m": "Sign of the answer.",
        "f": "A negative rate means decreasing: the top moves down."
      },
      {
        "m": "Missing the other length.",
        "f": "Find y from the relation: $y = \\sqrt{100 - 36} = 8$."
      }
    ]
  },
  "stokes-theorem": {
    "example": {
      "question": "Verify Stokes' theorem for $\\mathbf F = (x^2 + y^2)\\mathbf i - 2xy\\,\\mathbf j$ over the rectangle $0 \\le x \\le 2$, $0 \\le y \\le 3$ in the plane z = 0.",
      "steps": [
        {
          "title": "The theorem",
          "math": [
            "\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F})\\cdot\\mathbf{n}\\,dS",
            "\\mathbf{F} = \\left({x}^{2}+{y}^{2},\\ -2 x\\, y,\\ 0\\right)",
            "S: z = 0, \\ 0 \\le x \\le 2, \\ 0 \\le y \\le 3"
          ]
        },
        {
          "title": "Round the edge C",
          "math": [
            "\\text{piece }(0, 0, 0) \\to (2, 0, 0): \\ r(t) = \\left(2 t,\\ 0,\\ 0\\right), \\ r'(t) = \\left(2,\\ 0,\\ 0\\right)",
            "F \\cdot r' = 8 {t}^{2}",
            "\\int =  \\frac{8}{3}",
            "\\text{piece }(2, 0, 0) \\to (2, 3, 0): \\ r(t) = \\left(2,\\ 3 t,\\ 0\\right), \\ r'(t) = \\left(0,\\ 3,\\ 0\\right)",
            "F \\cdot r' = -36 t",
            "\\int =  -18",
            "\\text{piece }(2, 3, 0) \\to (0, 3, 0): \\ r(t) = \\left(2+-\\left(2 t\\right),\\ 3,\\ 0\\right), \\ r'(t) = \\left(-2,\\ 0,\\ 0\\right)",
            "F \\cdot r' = -8 {t}^{2}+16 t-26",
            "\\int =  -\\frac{62}{3}",
            "\\text{piece }(0, 3, 0) \\to (0, 0, 0): \\ r(t) = \\left(0,\\ 3+-\\left(3 t\\right),\\ 0\\right), \\ r'(t) = \\left(0,\\ -3,\\ 0\\right)",
            "F \\cdot r' = 0",
            "\\int =  0",
            "\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = -36"
          ]
        },
        {
          "title": "Flux of curl F through S",
          "math": [
            "\\nabla \\times \\mathbf{F}",
            "\\nabla \\times \\mathbf{F} = \\left(0,\\ 0,\\ -4 y\\right)",
            "\\mathbf{N} = \\left(0,\\ 0,\\ 1\\right)",
            "(\\nabla \\times \\mathbf{F})\\cdot\\mathbf{N} = -4 y",
            "\\text{the integrand splits into one-letter factors: } \\left(0.6366197723675394 y\\right)\\cdot\\left(-2 \\pi\\right)",
            "\\int_{0}^{3} (\\ldots)\\,dy \\approx 2.864789",
            "\\int_{0}^{2} (\\ldots)\\,dx = -4\\pi",
            "\\text{product} = -36",
            "\\iint_S = -36"
          ]
        },
        {
          "title": "Compare",
          "math": [
            "-36 = -36"
          ]
        }
      ],
      "answer": "$$\\oint_C \\mathbf F\\cdot d\\mathbf r = \\iint_S (\\nabla\\times\\mathbf F)\\cdot d\\mathbf S = -36$$"
    },
    "symbols": [
      {
        "s": "\\nabla\\times\\mathbf F",
        "t": "The curl of F.",
        "e": "(0, 0, -4y)"
      },
      {
        "s": "\\iint_S (\\nabla\\times\\mathbf F)\\cdot\\mathbf n\\,dS",
        "t": "The flux of the curl through the surface.",
        "e": "-36"
      },
      {
        "s": "\\oint_C",
        "t": "The work round the edge of the surface, in the direction set by the normal (right-hand rule).",
        "e": "-36"
      }
    ],
    "mistakes": [
      {
        "m": "Going round the edge the wrong way.",
        "f": "Use the right-hand rule with the chosen normal (anticlockwise seen from above for $+\\mathbf k$)."
      },
      {
        "m": "Curl sign slips.",
        "f": "Expand the determinant carefully; the j component has a minus sign."
      },
      {
        "m": "Missing an edge.",
        "f": "A rectangle has four edges; do each one."
      },
      {
        "m": "Using a closed surface.",
        "f": "Stokes needs a surface with an edge; for closed surfaces use the divergence theorem."
      }
    ]
  },
  "surface-integral": {
    "example": {
      "question": "Find the outward flux of $\\mathbf F = x\\mathbf i + y\\mathbf j + z\\mathbf k$ through the sphere of radius 2.",
      "steps": [
        {
          "title": "The surface",
          "math": [
            "\\mathbf{r}(u, v), \\quad \\mathbf{N} = \\mathbf{r}_u \\times \\mathbf{r}_v",
            "x^2 + y^2 + z^2 = 4",
            "\\mathbf{r} = \\left(2 \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right),\\ 2 \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right),\\ 2 \\cos\\left(\\phi\\right)\\right)",
            "\\mathbf{N} = \\left(-\\left(-4 \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right)\\right),\\ 4 \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right),\\ 4 \\cos\\left(\\theta\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right)--\\left(4 \\sin\\left(\\theta\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right)\\right)\\right) \\ (\\text{outward})"
          ]
        },
        {
          "title": "Flux",
          "math": [
            "\\iint \\mathbf{F}\\cdot\\mathbf{N}\\,du\\,dv",
            "\\mathbf{F}\\cdot\\mathbf{N} = 8 \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right)+8 \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right)+2 \\cos\\left(\\phi\\right)\\, \\left(4 \\cos\\left(\\theta\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\theta\\right)--\\left(4 \\sin\\left(\\theta\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\theta\\right)\\right)\\right)",
            "\\text{the integrand splits into one-letter factors: } \\left(\\sin\\left(\\phi\\right)\\, \\cos\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\frac{\\pi}{2}\\right)+\\sin\\left(\\phi\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)+\\cos\\left(\\phi\\right)\\, \\left(\\cos\\left(\\frac{\\pi}{2}\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\cos\\left(\\frac{\\pi}{2}\\right)+\\sin\\left(\\frac{\\pi}{2}\\right)\\, \\cos\\left(\\phi\\right)\\, \\sin\\left(\\phi\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\right)\\right)\\cdot\\left(8 \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\cos\\left(\\theta\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\cos\\left(\\theta\\right)+8 \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\theta\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\theta\\right)+2 \\cos\\left(\\frac{\\pi}{2}\\right)\\, \\left(4 \\cos\\left(\\theta\\right)\\, \\cos\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\cos\\left(\\theta\\right)--\\left(4 \\sin\\left(\\theta\\right)\\, \\cos\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\frac{\\pi}{2}\\right)\\, \\sin\\left(\\theta\\right)\\right)\\right)\\right)",
            "\\int_{0}^{\\pi} (\\ldots)\\,dphi = 2",
            "\\int_{0}^{2\\pi} (\\ldots)\\,d\\theta = 16\\pi",
            "\\text{product} = 32\\pi"
          ]
        }
      ],
      "answer": "$$\\oiint_S \\mathbf F\\cdot d\\mathbf S = 32\\pi$$"
    },
    "symbols": [
      {
        "s": "\\mathbf n",
        "t": "The outward unit normal; on a sphere it is $\\mathbf r / a$.",
        "e": ""
      },
      {
        "s": "\\mathbf F\\cdot\\mathbf n",
        "t": "The part of F crossing the surface.",
        "e": "a = 2"
      },
      {
        "s": "dS",
        "t": "A small piece of surface area.",
        "e": ""
      },
      {
        "s": "\\iint \\mathbf F\\cdot\\mathbf n\\,dS",
        "t": "The flux: add F·n over the whole surface.",
        "e": "2 \\times 16\\pi"
      }
    ],
    "mistakes": [
      {
        "m": "Not using a unit normal.",
        "f": "Divide the normal vector by its length."
      },
      {
        "m": "Inward normal.",
        "f": "For outward flux the normal points away from the inside."
      },
      {
        "m": "Forgetting the area factor.",
        "f": "In a parametrisation, $dS = |\\mathbf r_u \\times \\mathbf r_v|\\,du\\,dv$."
      },
      {
        "m": "Missing the easy route.",
        "f": "Here F·n = a on the whole sphere, so flux = a × area = 2 × 16π."
      }
    ]
  },
  "tangent-normal-calculator": {
    "example": {
      "question": "Find the tangent and normal to $y = x^3 - 3x + 2$ at $x = 2$.",
      "steps": [
        {
          "title": "Find the point on the curve",
          "math": [
            "x = 2: \\quad y = f(2) = 4",
            "\\text{Point } P\\left(2,\\ 4\\right)"
          ]
        },
        {
          "title": "Differentiate",
          "math": [
            "f'(x) = 3 {x}^{2}-3"
          ]
        },
        {
          "title": "Slope of the tangent",
          "math": [
            "m = f'(a)",
            "m = f'(2) = 9"
          ]
        },
        {
          "title": "Equation of the tangent",
          "math": [
            "y - y_1 = m(x - x_1)",
            "y - 4 = 9\\left(x - 2\\right)",
            "y = 9x - 14"
          ]
        },
        {
          "title": "Equation of the normal",
          "math": [
            "\\text{slope} = -\\frac{1}{m}",
            "\\text{slope} = -\\frac{1}{9} = -\\frac{1}{9}",
            "y - 4 = -\\frac{1}{9}\\left(x - 2\\right)",
            "y = -\\frac{1}{9}x + \\frac{38}{9}"
          ]
        }
      ],
      "answer": "$$\\text{tangent } y = 9x - 14, \\qquad \\text{normal } y = -\\tfrac19 x + \\tfrac{38}{9}$$"
    },
    "symbols": [
      {
        "s": "(x_0, y_0)",
        "t": "The point on the curve.",
        "e": "(2, 4)"
      },
      {
        "s": "m = f'(x_0)",
        "t": "The slope of the tangent.",
        "e": "9"
      },
      {
        "s": "-\\frac1m",
        "t": "The slope of the normal (perpendicular).",
        "e": "-\\tfrac19"
      },
      {
        "s": "y - y_0 = m(x - x_0)",
        "t": "The point-slope form of a line.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to find y₀.",
        "f": "Put x₀ into the curve: $f(2) = 8 - 6 + 2 = 4$."
      },
      {
        "m": "Normal slope as −m.",
        "f": "It is $-1/m$."
      },
      {
        "m": "Using f(x₀) as the slope.",
        "f": "The slope is f′(x₀)."
      },
      {
        "m": "A horizontal tangent.",
        "f": "If m = 0 the normal is vertical: $x = x_0$."
      }
    ]
  },
  "taylor-series-calculator": {
    "example": {
      "question": "Find the Maclaurin polynomial of order 7 for $\\sin x$.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "f(x) \\approx \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x - a)^k",
            "a = 0, \\quad n = 7"
          ]
        },
        {
          "title": "Differentiate 7 times and put in x = a",
          "math": [
            "f(x) = \\sin\\left(x\\right) \\quad \\Rightarrow \\quad f(0) = 0",
            "f'(x) = \\cos\\left(x\\right) \\quad \\Rightarrow \\quad f'(0) = 1",
            "f''(x) = -\\sin\\left(x\\right) \\quad \\Rightarrow \\quad f''(0) = 0",
            "f'''(x) = -\\cos\\left(x\\right) \\quad \\Rightarrow \\quad f'''(0) = -1",
            "f^{(4)}(x) = \\sin\\left(x\\right) \\quad \\Rightarrow \\quad f^{(4)}(0) = 0",
            "f^{(5)}(x) = \\cos\\left(x\\right) \\quad \\Rightarrow \\quad f^{(5)}(0) = 1",
            "f^{(6)}(x) = -\\sin\\left(x\\right) \\quad \\Rightarrow \\quad f^{(6)}(0) = 0",
            "f^{(7)}(x) = -\\cos\\left(x\\right) \\quad \\Rightarrow \\quad f^{(7)}(0) = -1"
          ]
        },
        {
          "title": "Divide by k! to get each coefficient",
          "math": [
            "\\frac{f(0)}{0!} = 0",
            "\\frac{f'(0)}{1!} = 1",
            "\\frac{f''(0)}{2!} = 0",
            "\\frac{f'''(0)}{3!} = \\frac{-1}{6} = -\\frac{1}{6}",
            "\\frac{f^{(4)}(0)}{4!} = 0",
            "\\frac{f^{(5)}(0)}{5!} = \\frac{1}{120} = \\frac{1}{120}",
            "\\frac{f^{(6)}(0)}{6!} = 0",
            "\\frac{f^{(7)}(0)}{7!} = \\frac{-1}{5040} = -\\frac{1}{5040}"
          ]
        },
        {
          "title": "Maclaurin polynomial of order 7",
          "math": [
            "f(x) \\approx x - \\frac{1}{6}x^{3} + \\frac{1}{120}x^{5} - \\frac{1}{5040}x^{7}"
          ]
        }
      ],
      "answer": "$$\\sin x \\approx x - \\tfrac{x^3}{6} + \\tfrac{x^5}{120} - \\tfrac{x^7}{5040}$$"
    },
    "symbols": [
      {
        "s": "a",
        "t": "The centre of the expansion (Maclaurin: a = 0).",
        "e": "0"
      },
      {
        "s": "f^{(k)}(a)",
        "t": "The k-th derivative at the centre.",
        "e": "0, 1, 0, -1, \\dots"
      },
      {
        "s": "\\frac{f^{(k)}(a)}{k!}(x - a)^k",
        "t": "The k-th term.",
        "e": "-\\tfrac{x^3}{6}"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the factorials.",
        "f": "Divide the k-th derivative by $k!$."
      },
      {
        "m": "Using powers of x for a ≠ 0.",
        "f": "Around a use $(x - a)^k$."
      },
      {
        "m": "Dropping the zero terms’ pattern.",
        "f": "For sin x the even derivatives at 0 are 0, so only odd powers appear."
      },
      {
        "m": "Sign pattern.",
        "f": "The derivatives of sin cycle sin, cos, −sin, −cos."
      }
    ]
  },
  "taylor-series-two-variables": {
    "example": {
      "question": "Expand $f(x, y) = e^x\\sin y$ about $(0, 0)$ up to third-degree terms.",
      "steps": [
        {
          "title": "The formula",
          "math": [
            "h = x - a, \\ k = y - b",
            "f(a + h, b + k) = f + \\left(h f_x + k f_y\\right) + \\frac{1}{2!}\\left(h^2 f_{xx} + 2hk\\,f_{xy} + k^2 f_{yy}\\right) + \\cdots"
          ]
        },
        {
          "title": "Derivatives at (0, 0)",
          "math": [
            "f = {e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{x} = {e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{y} = {e}^{x}\\, \\cos\\left(y\\right) \\;\\Rightarrow\\; 1",
            "f_{xx} = {e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{xy} = {e}^{x}\\, \\cos\\left(y\\right) \\;\\Rightarrow\\; 1",
            "f_{yy} = -{e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{xxx} = {e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{xxy} = {e}^{x}\\, \\cos\\left(y\\right) \\;\\Rightarrow\\; 1",
            "f_{xyy} = -{e}^{x}\\, \\sin\\left(y\\right) \\;\\Rightarrow\\; 0",
            "f_{yyy} = -{e}^{x}\\, \\cos\\left(y\\right) \\;\\Rightarrow\\; -1"
          ]
        },
        {
          "title": "Put them in, up to degree 3",
          "math": [
            "f(x, y) \\approx y + x y + \\frac{1}{2}\\,x^{2} y - \\frac{1}{6}\\,y^{3}"
          ]
        }
      ],
      "answer": "$$e^x\\sin y \\approx y + xy + \\tfrac12 x^2y - \\tfrac16 y^3$$"
    },
    "symbols": [
      {
        "s": "(a, b)",
        "t": "The point we expand about.",
        "e": "(0, 0)"
      },
      {
        "s": "h = x - a,\\ k = y - b",
        "t": "The small steps from that point.",
        "e": ""
      },
      {
        "s": "\\frac{1}{n!}(hf_x + kf_y)^n",
        "t": "The degree-n terms, expanded like a binomial with partial derivatives.",
        "e": ""
      },
      {
        "s": "f_{xy}",
        "t": "Mixed partial derivatives appear with binomial coefficients.",
        "e": "f_{xy}(0,0) = 1"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the mixed terms.",
        "f": "Degree 2 includes $2hk f_{xy}$; degree 3 includes $3h^2k f_{xxy}$ and $3hk^2 f_{xyy}$."
      },
      {
        "m": "Missing the factorials.",
        "f": "Degree-n terms are divided by $n!$."
      },
      {
        "m": "Evaluating derivatives at (x, y).",
        "f": "Put in the centre point (a, b)."
      },
      {
        "m": "Too few terms.",
        "f": "Count the total degree of each term, not the power of x alone."
      }
    ]
  },
  "trigonometric-integrals": {
    "example": {
      "question": "Find $\\displaystyle\\int \\sin^3 x\\,dx$.",
      "steps": [
        {
          "title": "Odd power: substitute t = cos x",
          "text": "With an odd power, save one sin (or cos) for the derivative and write the rest in terms of the other function; then substitute t for it.",
          "math": [
            "\\sin^2 x = 1 - \\cos^2 x",
            "t = \\cos  x, \\quad dt = -\\,\\sin  x\\,dx, \\quad \\sin^2  x = 1 - t^2",
            "\\int {\\sin\\left(x\\right)}^{3}\\,dx = -\\int (1 - t^2)\\,dt = -\\left(t-\\frac{1}{3}\\, {t}^{3}\\right)",
            "\\text{Put back } t = \\cos  x",
            "\\int {\\sin\\left(x\\right)}^{3}\\,dx = -\\cos\\left(x\\right)+\\frac{1}{3}\\, {\\cos\\left(x\\right)}^{3}"
          ]
        },
        {
          "title": "Check by differentiating",
          "text": "Integration undoes differentiation, so differentiating the answer must give back the function we started with. It does, so the answer is right.",
          "math": [
            "\\frac{d}{dx}F(x) = f(x)",
            "\\frac{d}{dx}\\left[\\frac{{\\cos\\left(x\\right)}^{3}}{3}-\\cos\\left(x\\right)\\right] = {\\sin\\left(x\\right)}^{3} \\;\\checkmark"
          ]
        }
      ],
      "answer": "$$\\int \\sin^3 x\\,dx = \\tfrac{\\cos^3 x}{3} - \\cos x + C$$"
    },
    "symbols": [
      {
        "s": "\\sin^3 x = \\sin x(1 - \\cos^2 x)",
        "t": "Odd power: keep one sin, turn the rest into cos.",
        "e": ""
      },
      {
        "s": "t = \\cos x",
        "t": "Then substitute: dt = −sin x dx.",
        "e": ""
      },
      {
        "s": "\\cos^2 x = \\tfrac12(1 + \\cos 2x)",
        "t": "For even powers use the double-angle formulas.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the minus in $dt = -\\sin x\\,dx$.",
        "f": "The sign carries through to the answer."
      },
      {
        "m": "Using double-angle formulas for odd powers.",
        "f": "Odd powers: save one factor and substitute; even powers: double angle."
      },
      {
        "m": "Leaving t in the answer.",
        "f": "Put $t = \\cos x$ back."
      },
      {
        "m": "Not checking.",
        "f": "Differentiate: $\\frac{d}{dx}(\\tfrac{\\cos^3x}{3} - \\cos x) = \\sin^3 x$ ✓."
      }
    ]
  },
  "triple-integral-calculator": {
    "example": {
      "question": "Evaluate $\\displaystyle\\int_0^1\\!\\int_0^1\\!\\int_0^1 (x + y + z)\\,dz\\,dy\\,dx$.",
      "steps": [
        {
          "title": "Innermost: with respect to z (y, x held constant)",
          "math": [
            "\\int_{0}^{1} \\left( x+ y+ z\\right)\\,dz = \\Big[\\, x\\, z+ y\\, z+\\frac{{z}^{2}}{2}\\,\\Big]_{z = 0}^{1}",
            "=  x+ y+\\frac{{1}^{2}}{2} - 0",
            "=  x+ y+\\frac{1}{2}"
          ]
        },
        {
          "title": "Integrate term by term",
          "math": [
            "\\int (u \\pm v)\\,dx = \\int u\\,dx \\pm \\int v\\,dx",
            "\\int  x+ y+ z\\,dz =  x\\, z+ y\\, z+\\frac{{z}^{2}}{2}"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dz = kz",
            "\\int  x\\,dz =  x\\, z"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dz = kz",
            "\\int  y\\,dz =  y\\, z"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}",
            "\\int  z\\,dz = \\frac{{z}^{2}}{2}"
          ]
        },
        {
          "title": "Middle: with respect to y (x held constant)",
          "math": [
            "\\int_{0}^{1} \\left( x+ y+\\frac{1}{2}\\right)\\,dy = \\Big[\\, x\\, y+\\frac{{y}^{2}}{2}+\\frac{y}{2}\\,\\Big]_{y = 0}^{1}",
            "=  x+\\frac{{1}^{2}}{2}+\\frac{1}{2} - 0",
            "=  x+1"
          ]
        },
        {
          "title": "Integrate term by term",
          "math": [
            "\\int (u \\pm v)\\,dx = \\int u\\,dx \\pm \\int v\\,dx",
            "\\int  x+ y+\\frac{1}{2}\\,dy =  x\\, y+\\frac{{y}^{2}}{2}+\\frac{1}{2}\\, y"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dy = ky",
            "\\int  x\\,dy =  x\\, y"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}",
            "\\int  y\\,dy = \\frac{{y}^{2}}{2}"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dy = ky",
            "\\int \\frac{1}{2}\\,dy = \\frac{1}{2}\\, y"
          ]
        },
        {
          "title": "Outermost: with respect to x",
          "math": [
            "\\int_{0}^{1} \\left( x+1\\right)\\,dx = \\Big[\\,\\frac{1}{2}\\, {x}^{2}+ x\\,\\Big]_{x = 0}^{1}",
            "= \\frac{1}{2}\\, \\left({1}^{2}\\right)+1 - 0",
            "= \\frac{3}{2}"
          ]
        },
        {
          "title": "Integrate term by term",
          "math": [
            "\\int (u \\pm v)\\,dx = \\int u\\,dx \\pm \\int v\\,dx",
            "\\int  x+1\\,dx = \\frac{{x}^{2}}{2}+ x"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}",
            "\\int  x\\,dx = \\frac{{x}^{2}}{2}"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dx = kx",
            "\\int 1\\,dx =  x"
          ]
        }
      ],
      "answer": "$$\\iiint (x + y + z)\\,dV = \\tfrac32$$"
    },
    "symbols": [
      {
        "s": "dz\\,dy\\,dx",
        "t": "The order: z first (innermost), then y, then x.",
        "e": ""
      },
      {
        "s": "\\text{innermost}",
        "t": "Integrate in z with x, y held constant.",
        "e": "xz + yz + \\tfrac{z^2}{2}"
      },
      {
        "s": "\\text{limits}",
        "t": "Inner limits may depend on outer variables; the outermost must be numbers.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Wrong order.",
        "f": "Follow the order of the differentials from the inside out."
      },
      {
        "m": "Treating constants as variables.",
        "f": "In the z integral, x and y are constants: $\\int x\\,dz = xz$."
      },
      {
        "m": "Forgetting to substitute the limits at each stage.",
        "f": "Each inner integral becomes a function of the remaining variables."
      },
      {
        "m": "Missing symmetry.",
        "f": "By symmetry each of x, y, z contributes ½ here: total 3/2."
      }
    ]
  },
  "volume-of-revolution": {
    "example": {
      "question": "Find the volume when $y = \\sqrt x$, $0 \\le x \\le 4$, is rotated about the x-axis.",
      "steps": [
        {
          "title": "Washer (disc) method",
          "math": [
            "V = \\pi\\int_a^b R^2\\,dx",
            "R = \\sqrt{x}"
          ]
        },
        {
          "title": "Integrate",
          "math": [
            "\\int_{0}^{4} \\pi\\, {\\sqrt{x}}^{2}\\,dx = \\Big[\\,\\frac{\\pi\\, {\\sqrt{x}}^{4}}{2}\\,\\Big]_{x = 0}^{4}",
            "= \\frac{\\pi\\, {\\sqrt{4}}^{4}}{2} - 0",
            "= 8\\pi"
          ]
        },
        {
          "title": "Take the constant outside",
          "math": [
            "\\int k\\,f\\,dx = k\\int f\\,dx",
            "\\int \\pi\\, {\\sqrt{x}}^{2}\\,dx = \\left(\\frac{1}{2}\\, \\pi\\right)\\, {\\sqrt{x}}^{4}"
          ]
        },
        {
          "title": "Substitution u = sqrt(x)",
          "math": [
            "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du",
            "u = \\sqrt{x}, \\quad du = \\frac{\\frac{1}{2}}{\\sqrt{x}}\\,dx",
            "\\int {\\sqrt{x}}^{2}\\,dx = \\int 2 {u}^{3}\\,du",
            "\\int {\\sqrt{x}}^{2}\\,dx = \\frac{1}{2}\\, {\\sqrt{x}}^{4}"
          ]
        },
        {
          "title": "Take the constant outside",
          "math": [
            "\\int k\\,f\\,dx = k\\int f\\,dx",
            "\\int 2 {u}^{3}\\,du = \\frac{1}{2}\\, {u}^{4}"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)",
            "\\int {u}^{3}\\,du = \\frac{1}{4}\\, {u}^{4}"
          ]
        }
      ],
      "answer": "$$V = \\pi\\int_0^4 x\\,dx = 8\\pi$$"
    },
    "symbols": [
      {
        "s": "V = \\pi\\int_a^b y^2\\,dx",
        "t": "Disc method: each slice is a disc of radius y.",
        "e": "\\pi\\int_0^4 x\\,dx"
      },
      {
        "s": "\\pi\\int (y_1^2 - y_2^2)\\,dx",
        "t": "Washer method: between two curves.",
        "e": ""
      },
      {
        "s": "2\\pi\\int x\\,y\\,dx",
        "t": "Shell method, for rotation about the y-axis.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to square y.",
        "f": "The disc area is $\\pi y^2$: here $\\pi x$."
      },
      {
        "m": "Forgetting π.",
        "f": "Every disc has area $\\pi r^2$."
      },
      {
        "m": "Washers as $\\pi(y_1 - y_2)^2$.",
        "f": "It is $\\pi(y_1^2 - y_2^2)$."
      },
      {
        "m": "Wrong axis.",
        "f": "About the y-axis, write x in terms of y (discs) or use shells."
      }
    ]
  }
};

export default DATA;
